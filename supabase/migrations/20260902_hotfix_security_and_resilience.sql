-- ============================================================================
-- MIGRATION HOTFIX: VA LO HONG BAO MAT CLAN PASS & RO RI PIN HASH
-- Du an: GiaPhaGiaToc
-- Ngay: 2026-09-02
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. HUY BO POLICY PUBLIC SELECT LAM LO PIN_HASH VA PIN_SALT
DROP POLICY IF EXISTS clan_access_passes_read ON public.clan_access_passes;
DROP POLICY IF EXISTS "Public can lookup pass salt" ON public.clan_access_passes;
DROP POLICY IF EXISTS clan_access_passes_tenant_write ON public.clan_access_passes;
DROP POLICY IF EXISTS clan_access_passes_tenant_select ON public.clan_access_passes;

-- 2. CHINH SACH RLS MOI: CHI OWNER VA ADMIN DONG HO MOI XEM/SUA CLAN PASS TOKEN
CREATE POLICY "Admins can manage clan passes" ON public.clan_access_passes
  FOR ALL TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM public.family_memberships 
      WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
    )
    OR public.is_superadmin()
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.family_memberships 
      WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
    )
    OR public.is_superadmin()
  );

-- 3. HAM RPC CONG KHAI THONG TIN DONG HO KHI QUET QR (KHONG TRA VE PIN_HASH / PIN_SALT)
CREATE OR REPLACE FUNCTION public.fn_get_public_pass_info(p_pass_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_pass RECORD;
    v_family RECORD;
BEGIN
    SELECT * INTO v_pass 
    FROM public.clan_access_passes 
    WHERE pass_token = p_pass_token AND is_active = TRUE;

    IF NOT FOUND THEN
        SELECT cap.* INTO v_pass
        FROM public.clan_short_links csl
        JOIN public.clan_access_passes cap ON cap.family_id = csl.family_id
        WHERE csl.short_code = LOWER(p_pass_token) AND cap.is_active = TRUE
        LIMIT 1;
    END IF;

    IF v_pass.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ma QR khong hop le hoac da bi thu hoi.');
    END IF;

    SELECT * INTO v_family FROM public.families WHERE id = v_pass.family_id;

    -- Tuyet doi KHONG tra ve pin_hash hoac pin_salt
    RETURN jsonb_build_object(
        'success', true,
        'pass_token', v_pass.pass_token,
        'family_id', v_pass.family_id,
        'family_name', COALESCE(v_family.name, 'Gia Toc'),
        'family_code', v_family.code,
        'banner_url', v_family.banner_url,
        'is_locked', (v_pass.locked_until IS NOT NULL AND v_pass.locked_until > NOW())
    );
END;
$$;

-- 4. HAM RPC XAC THUC PIN GIA TOC (HO TRO BAM NOI BO POSTGRESQL & BAO VE BRUTE-FORCE)
CREATE OR REPLACE FUNCTION public.fn_verify_clan_pin(
    p_pass_token TEXT,
    p_input_pin_hash TEXT DEFAULT NULL,
    p_raw_pin TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_pass RECORD;
    v_family RECORD;
    v_computed_hash TEXT;
    v_matched BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_pass 
    FROM public.clan_access_passes 
    WHERE pass_token = p_pass_token AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ma QR khong hop le hoac da bi thu hoi.');
    END IF;

    -- Kiem tra khoa do nhap sai nhieu lan
    IF v_pass.locked_until IS NOT NULL AND v_pass.locked_until > NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Ma PIN da bi khoa tam thoi do nhap sai qua 5 lan. Vui long thu lai sau 15 phut.'
        );
    END IF;

    -- So khop bang ma bam gui len (Backward compatibility)
    IF p_input_pin_hash IS NOT NULL AND v_pass.pin_hash = p_input_pin_hash THEN
        v_matched := TRUE;
    END IF;

    -- Hoac tu bam SHA-256 tu raw PIN an toan phia Server
    IF NOT v_matched AND p_raw_pin IS NOT NULL THEN
        v_computed_hash := encode(digest(p_raw_pin || ':' || v_pass.pin_salt || ':' || v_pass.family_id::text, 'sha256'), 'hex');
        IF v_pass.pin_hash = v_computed_hash THEN
            v_matched := TRUE;
        END IF;
    END IF;

    IF v_matched THEN
        UPDATE public.clan_access_passes 
        SET failed_attempts = 0, locked_until = NULL, updated_at = NOW() 
        WHERE id = v_pass.id;

        SELECT * INTO v_family FROM public.families WHERE id = v_pass.family_id;

        RETURN jsonb_build_object(
            'success', true,
            'family_id', v_family.id,
            'family_name', COALESCE(v_family.name, 'Gia Toc'),
            'family_code', v_family.code,
            'banner_url', v_family.banner_url,
            'role', 'MEMBER'
        );
    ELSE
        UPDATE public.clan_access_passes 
        SET failed_attempts = failed_attempts + 1,
            locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE NULL END,
            updated_at = NOW() 
        WHERE id = v_pass.id;

        RETURN jsonb_build_object(
            'success', false,
            'error', CASE WHEN v_pass.failed_attempts + 1 >= 5 
                     THEN 'Nhap sai ma PIN 5 lan. Tam khoa 15 phut de bao ve dong ho.' 
                     ELSE 'Ma PIN khong chinh xac. Con ' || (5 - (v_pass.failed_attempts + 1)) || ' lan thu.' END
        );
    END IF;
END;
$$;

-- 5. RPC HOAN TRA BUT TOAN QUY DONG HO AN TOAN (ATOMIC REVERSAL)
CREATE OR REPLACE FUNCTION public.reverse_financial_transaction(
    p_family_id UUID,
    p_transaction_id UUID,
    p_reason TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_orig RECORD;
    v_fund RECORD;
    v_rev_id UUID := gen_random_uuid();
    v_new_balance NUMERIC;
BEGIN
    -- 1. Kiem tra giao dich goc
    SELECT * INTO v_orig
    FROM public.financial_transactions
    WHERE id = p_transaction_id AND family_id = p_family_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Giao dich khong ton tai trong dong ho.';
    END IF;

    IF v_orig.status <> 'POSTED' THEN
        RAISE EXCEPTION 'Chi co the dao nguoc giao dich co trang thai DA GHI SO (POSTED).';
    END IF;

    -- 2. Danh dau giao dich goc la REVERSED
    UPDATE public.financial_transactions
    SET status = 'REVERSED', updated_at = NOW()
    WHERE id = v_orig.id;

    -- 3. Cap nhat so du Quy voi khoa dong bo tranh xung dot (Locking)
    SELECT * INTO v_fund
    FROM public.funds
    WHERE id = v_orig.fund_id AND family_id = p_family_id
    FOR UPDATE;

    IF v_fund.id IS NOT NULL THEN
        IF v_orig.transaction_type = 'INCOME' THEN
            v_new_balance := v_fund.current_balance - v_orig.amount;
        ELSIF v_orig.transaction_type = 'EXPENSE' THEN
            v_new_balance := v_fund.current_balance + v_orig.amount;
        ELSE
            v_new_balance := v_fund.current_balance;
        END IF;

        UPDATE public.funds
        SET current_balance = v_new_balance, updated_at = NOW()
        WHERE id = v_fund.id;
    END IF;

    -- 4. Tao but toan doi ung REVERSAL
    INSERT INTO public.financial_transactions (
        id,
        family_id,
        fund_id,
        transaction_code,
        transaction_type,
        amount,
        payment_method,
        transaction_date,
        description,
        status,
        reference_transaction_id,
        created_at,
        updated_at
    ) VALUES (
        v_rev_id,
        p_family_id,
        v_orig.fund_id,
        'REV-' || v_orig.transaction_code,
        'REVERSAL',
        v_orig.amount,
        v_orig.payment_method,
        CURRENT_DATE,
        'Dao nguoc giao dich ' || v_orig.transaction_code || ': ' || COALESCE(p_reason, 'Loi sai lech so lieu'),
        'POSTED',
        v_orig.id,
        NOW(),
        NOW()
    );

    RETURN v_rev_id;
END;
$$;

-- 6. TRIGGER BAO VE SO CAI BAT BIEN (RULE 4 IMMUTABLE LEDGER)
CREATE OR REPLACE FUNCTION public.fn_prevent_ledger_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'POSTED' THEN
            RAISE EXCEPTION 'NGHIEM CAM XOA BUT TOAN DA GHI SO (POSTED). Bat buoc phai thuc hien dao nguoc (REVERSAL) theo quy dinh ke toan dong ho.';
        END IF;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'POSTED' THEN
            -- Chi cho phep cap nhat status sang REVERSED
            IF NEW.status = 'REVERSED' AND NEW.amount = OLD.amount AND NEW.fund_id = OLD.fund_id AND NEW.transaction_type = OLD.transaction_type THEN
                RETURN NEW;
            ELSE
                RAISE EXCEPTION 'BUT TOAN DA GHI SO LA BAT BIEN (IMMUTABLE). Khong duoc phep sua doi so tien, quy hoac loai giao dich.';
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_immutable_ledger ON public.financial_transactions;
CREATE TRIGGER trg_protect_immutable_ledger
BEFORE UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_ledger_tampering();

-- 7. RPC THU QUY TRUC TIEP & NGHIA VU THU DINH MUC AN TOAN (SAFE DIRECT & ASSESSMENT INCOME)
CREATE OR REPLACE FUNCTION public.record_income_payment(
    p_family_id UUID,
    p_fund_id UUID,
    p_assessment_id UUID,
    p_amount NUMERIC,
    p_payment_method payment_method,
    p_transaction_date DATE,
    p_description TEXT,
    p_receipt_url TEXT,
    p_user_id UUID,
    p_member_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_assessment RECORD;
    v_tx_id UUID;
    v_tx_code TEXT;
    v_new_paid NUMERIC;
    v_new_status assessment_status;
    v_cat_id UUID := p_category_id;
    v_event_id UUID := NULL;
    v_mem_id UUID := p_member_id;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'So tien thanh toan phai lon hon 0.';
    END IF;

    -- 1. Neu co gan voi nghia vu thu dinh muc (Assessment)
    IF p_assessment_id IS NOT NULL THEN
        SELECT * INTO v_assessment FROM public.income_assessments 
        WHERE id = p_assessment_id AND family_id = p_family_id FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Khoan thu dinh muc khong ton tai hoac khong thuoc gia toc nay.';
        END IF;

        v_new_paid := v_assessment.amount_paid + p_amount;
        IF v_new_paid >= v_assessment.amount_due THEN
            v_new_status := 'PAID';
        ELSE
            v_new_status := 'PARTIAL';
        END IF;

        v_cat_id := COALESCE(v_cat_id, v_assessment.category_id);
        v_event_id := v_assessment.event_id;
        v_mem_id := COALESCE(v_mem_id, v_assessment.member_id);

        UPDATE public.income_assessments 
        SET amount_paid = v_new_paid,
            status = v_new_status,
            updated_at = NOW()
        WHERE id = p_assessment_id;
    END IF;

    -- 2. Sinh ma giao dich duy nhat
    v_tx_code := 'THU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::TEXT, 4, '0');

    -- 3. Tao ban ghi giao dich tai chinh POSTED
    INSERT INTO public.financial_transactions (
        family_id, fund_id, transaction_code, transaction_type, category_id,
        event_id, member_id, assessment_id, amount, payment_method,
        transaction_date, description, receipt_url, status, created_by
    ) VALUES (
        p_family_id, p_fund_id, v_tx_code, 'INCOME', v_cat_id,
        v_event_id, v_mem_id, p_assessment_id, p_amount, p_payment_method,
        p_transaction_date, p_description, p_receipt_url, 'POSTED', p_user_id
    ) RETURNING id INTO v_tx_id;

    -- 4. Cap nhat so du quy nguyen tu
    UPDATE public.funds 
    SET current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_fund_id;

    -- 5. Ghi nhat ky kiem toan
    INSERT INTO public.audit_logs (
        family_id, user_id, action, entity_type, entity_id, new_data
    ) VALUES (
        p_family_id, p_user_id, 'POST', 'financial_transactions', v_tx_id,
        jsonb_build_object('amount', p_amount, 'assessment_id', p_assessment_id, 'code', v_tx_code)
    );

    RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
