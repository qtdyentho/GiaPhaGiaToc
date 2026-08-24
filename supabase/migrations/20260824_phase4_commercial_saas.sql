-- ============================================================
-- DATABASE MIGRATION: PHASE 4 COMMERCIAL SaaS & BILLING CORE
-- DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
-- ============================================================

-- 1. BẢNG PLAN FEATURES & TIERS (Entitlements)
CREATE TABLE IF NOT EXISTS public.plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
    plan_version_id UUID REFERENCES public.plan_versions(id) ON DELETE CASCADE,
    feature_code VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    feature_type VARCHAR(50) NOT NULL DEFAULT 'BOOLEAN', -- BOOLEAN, INTEGER, STORAGE, UNLIMITED
    limit_value NUMERIC(15, 2) DEFAULT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_plan_feature UNIQUE(plan_id, feature_code)
);

-- 2. BẢNG USAGE COUNTERS & EVENTS (Quota Tracking)
CREATE TABLE IF NOT EXISTS public.usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    feature_code VARCHAR(100) NOT NULL,
    current_usage NUMERIC(15, 2) NOT NULL DEFAULT 0,
    peak_usage NUMERIC(15, 2) NOT NULL DEFAULT 0,
    last_reset_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_family_feature_usage UNIQUE(family_id, feature_code)
);

CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    feature_code VARCHAR(100) NOT NULL,
    delta NUMERIC(15, 2) NOT NULL,
    current_total NUMERIC(15, 2) NOT NULL,
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BẢNG TRIAL PERIODS
CREATE TABLE IF NOT EXISTS public.trial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_extended BOOLEAN NOT NULL DEFAULT false,
    extended_days INT NOT NULL DEFAULT 0,
    extended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    extension_reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CONVERTED
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BẢNG REFUNDS (Hoàn tiền - bảo toàn lịch sử giao dịch)
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    refund_code VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- PENDING, COMPLETED, REJECTED
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ATOMIC RPC FUNCTION: KÍCH HOẠT THUÊ BAO QUA WEBHOOK NGÂN HÀNG (Zero Data Loss & Strict Concurrency)
CREATE OR REPLACE FUNCTION public.activate_subscription_via_webhook(
    p_family_id UUID,
    p_subscription_id UUID,
    p_invoice_id UUID,
    p_payment_code VARCHAR,
    p_amount NUMERIC,
    p_payment_method VARCHAR DEFAULT 'VIETQR',
    p_provider VARCHAR DEFAULT 'VIETQR'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_invoice RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_period_end TIMESTAMPTZ := timezone('utc'::text, now() + interval '1 year');
    v_existing_payment RECORD;
BEGIN
    -- 1. Idempotency Check
    SELECT id, status INTO v_existing_payment FROM public.payments WHERE payment_code = p_payment_code;
    IF FOUND AND v_existing_payment.status = 'SUCCESS' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Idempotent replay: Transaction already processed',
            'payment_id', v_existing_payment.id
        );
    END IF;

    -- 2. Validate Invoice
    SELECT id, family_id, subscription_id, total, status INTO v_invoice 
    FROM public.invoices 
    WHERE id = p_invoice_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;

    -- 3. Verify Amount
    IF p_amount < v_invoice.total THEN
        -- Ghi nhận Partial Payment
        INSERT INTO public.payments (
            family_id, subscription_id, invoice_id, payment_code, amount, currency,
            payment_method, provider, status, created_at
        ) VALUES (
            p_family_id, p_subscription_id, p_invoice_id, p_payment_code, p_amount, 'VND',
            p_payment_method, p_provider, 'PARTIAL', v_now
        );

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Underpayment: Payment amount less than invoice total',
            'received', p_amount,
            'expected', v_invoice.total
        );
    END IF;

    -- 4. Ghi nhận Payment SUCCESS
    INSERT INTO public.payments (
        family_id, subscription_id, invoice_id, payment_code, amount, currency,
        payment_method, provider, status, paid_at, created_at
    ) VALUES (
        p_family_id, p_subscription_id, p_invoice_id, p_payment_code, p_amount, 'VND',
        p_payment_method, p_provider, 'SUCCESS', v_now, v_now
    ) ON CONFLICT (payment_code) DO UPDATE SET
        status = 'SUCCESS',
        paid_at = v_now;

    -- 5. Cập nhật Invoice -> PAID
    UPDATE public.invoices 
    SET status = 'PAID', paid_at = v_now, updated_at = v_now 
    WHERE id = p_invoice_id;

    -- 6. Cập nhật Subscription -> ACTIVE
    UPDATE public.subscriptions 
    SET status = 'ACTIVE',
        current_period_start = v_now,
        current_period_end = v_period_end,
        updated_at = v_now
    WHERE id = p_subscription_id;

    -- 7. Ghi nhận Event
    INSERT INTO public.subscription_events (
        subscription_id, family_id, event_type, from_status, to_status, reason, created_at
    ) VALUES (
        p_subscription_id, p_family_id, 'RENEWED', 'TRIALING', 'ACTIVE', 'Bank Webhook Payment Verified', v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Subscription activated successfully',
        'subscription_id', p_subscription_id,
        'invoice_id', p_invoice_id,
        'status', 'ACTIVE'
    );
END;
$$;

-- 6. ATOMIC RPC FUNCTION: CHUYỂN SANG CHẾ ĐỘ READ_ONLY (BẢO TOÀN DỮ LIỆU TUYỆT ĐỐI)
CREATE OR REPLACE FUNCTION public.transition_to_readonly(
    p_family_id UUID,
    p_subscription_id UUID,
    p_reason TEXT DEFAULT 'Subscription Expired'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    UPDATE public.subscriptions
    SET status = 'READ_ONLY',
        expired_at = v_now,
        updated_at = v_now
    WHERE id = p_subscription_id;

    INSERT INTO public.subscription_events (
        subscription_id, family_id, event_type, from_status, to_status, reason, created_at
    ) VALUES (
        p_subscription_id, p_family_id, 'EXPIRED', 'ACTIVE', 'READ_ONLY', p_reason, v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'family_id', p_family_id,
        'status', 'READ_ONLY',
        'message', 'Preserved all family data in zero-data-loss read-only grace mode'
    );
END;
$$;

-- 7. RLS POLICIES FOR BILLING & COMMERCIAL SAAS
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Plan features: Public read
CREATE POLICY "Public read plan features" ON public.plan_features
    FOR SELECT USING (true);

-- Usage Counters: Family Isolation
CREATE POLICY "Family isolation for usage counters" ON public.usage_counters
    FOR ALL USING (family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    ));

-- Usage Events: Family Isolation
CREATE POLICY "Family isolation for usage events" ON public.usage_events
    FOR ALL USING (family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    ));

-- Trial Periods: Family Isolation
CREATE POLICY "Family isolation for trial periods" ON public.trial_periods
    FOR ALL USING (family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    ));

-- Refunds: Family Isolation
CREATE POLICY "Family isolation for refunds" ON public.refunds
    FOR SELECT USING (family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    ));
