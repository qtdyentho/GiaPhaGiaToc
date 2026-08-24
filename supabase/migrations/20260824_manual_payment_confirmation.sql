-- ==============================================================================
-- MIGRATION: 20260824_manual_payment_confirmation.sql
-- DESCRIPTION: Add manual payment confirmation fields, payment claim statuses,
--              reconciliation audit logs, and atomic admin RPC functions.
-- SAFETY: 100% Additive (Zero data loss, no drop/truncate of existing test data)
-- ==============================================================================

-- 1. Extend invoice_status enum (if using native postgres enum or check constraint)
-- For existing text/check constraint systems, ensure WAITING_CONFIRMATION & REJECTED are accepted
ALTER TABLE invoices 
  DROP CONSTRAINT IF EXISTS invoices_status_check;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_status_check 
  CHECK (status IN ('DRAFT', 'OPEN', 'PENDING_PAYMENT', 'WAITING_CONFIRMATION', 'PAID', 'VOID', 'UNCOLLECTIBLE', 'REJECTED'));

-- 2. Extend payment_status enum
ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('PENDING', 'SUBMITTED', 'SUCCESS', 'FAILED', 'PARTIAL', 'OVERPAYMENT', 'REFUNDED', 'REJECTED'));

-- 3. Add customer payment claim fields to invoices & payments
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS customer_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_bank_reference TEXT,
  ADD COLUMN IF NOT EXISTS customer_note TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
  ADD COLUMN IF NOT EXISTS received_amount BIGINT,
  ADD COLUMN IF NOT EXISTS bank_transaction_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS audit_reason TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id);

-- 4. Create admin_billing_configs table for configurable bank transfer info
CREATE TABLE IF NOT EXISTS admin_billing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL DEFAULT 'Ngân hàng TMCP Quân đội (MBBank)',
  bank_code TEXT NOT NULL DEFAULT 'MB',
  account_number TEXT NOT NULL DEFAULT '088899998888',
  account_name TEXT NOT NULL DEFAULT 'QUAN TRI VIEN GIA PHA GIA TOC',
  qr_template TEXT NOT NULL DEFAULT 'compact2',
  support_phone TEXT NOT NULL DEFAULT '1900 6868',
  support_email TEXT NOT NULL DEFAULT 'support@giaphagiatoc.vn',
  default_invoice_validity_days INT NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_billing_configs
ALTER TABLE admin_billing_configs ENABLE ROW LEVEL SECURITY;

-- Public can read active billing config (for transfer instructions)
DROP POLICY IF EXISTS "Public can view active billing config" ON admin_billing_configs;
CREATE POLICY "Public can view active billing config"
  ON admin_billing_configs FOR SELECT
  USING (is_active = true);

-- Super admin only can modify billing config
DROP POLICY IF EXISTS "Super admin can update billing config" ON admin_billing_configs;
CREATE POLICY "Super admin can update billing config"
  ON admin_billing_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN user_roles ur ON ur.user_id = fm.user_id
      WHERE fm.user_id = auth.uid() AND ur.role = 'SUPER_ADMIN'
    )
  );

-- 5. ATOMIC RPC FUNCTION: admin_confirm_payment
CREATE OR REPLACE FUNCTION admin_confirm_payment(
  p_invoice_id UUID,
  p_transaction_reference TEXT,
  p_received_amount BIGINT,
  p_bank_transaction_date TIMESTAMPTZ,
  p_audit_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice RECORD;
  v_subscription RECORD;
  v_plan RECORD;
  v_admin_id UUID;
  v_is_super_admin BOOLEAN;
  v_payment_id UUID;
  v_new_period_start TIMESTAMPTZ;
  v_new_period_end TIMESTAMPTZ;
  v_days_to_add INT := 365; -- Default 1 year
BEGIN
  -- 1. Check admin caller authorization
  v_admin_id := auth.uid();
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = v_admin_id AND role IN ('SUPER_ADMIN', 'BILLING_ADMIN')
  ) INTO v_is_super_admin;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Bảo mật: Chỉ Super Admin hoặc Billing Admin mới có quyền xác nhận thanh toán thủ công';
  END IF;

  IF p_audit_reason IS NULL OR TRIM(p_audit_reason) = '' THEN
    RAISE EXCEPTION 'Kiểm toán: Lý do xác nhận thanh toán (audit_reason) là bắt buộc';
  END IF;

  -- 2. Lock invoice for update (prevent race conditions & double confirmation)
  SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hóa đơn không tồn tại: %', p_invoice_id;
  END IF;

  -- 3. Idempotency Check
  IF v_invoice.status = 'PAID' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_PROCESSED',
      'message', 'Hóa đơn này đã được xác nhận thanh toán trước đó'
    );
  END IF;

  -- 4. Check Received Amount
  IF p_received_amount < v_invoice.total THEN
    -- Record partial payment without activating subscription
    INSERT INTO payments (
      family_id, subscription_id, invoice_id, payment_code, amount, currency,
      payment_method, provider, status, transaction_reference, received_amount,
      bank_transaction_date, audit_reason, confirmed_by, created_at, updated_at
    ) VALUES (
      v_invoice.family_id, v_invoice.subscription_id, v_invoice.id,
      'PAY-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
      p_received_amount, v_invoice.currency, 'MANUAL_BANK_TRANSFER', 'MANUAL_ADMIN',
      'PARTIAL', p_transaction_reference, p_received_amount,
      p_bank_transaction_date, p_audit_reason, v_admin_id, now(), now()
    ) RETURNING id INTO v_payment_id;

    RETURN jsonb_build_object(
      'success', false,
      'code', 'PARTIAL_PAYMENT',
      'message', 'Số tiền thực nhận chưa đủ so với hóa đơn. Đã ghi nhận thanh toán một phần.',
      'payment_id', v_payment_id
    );
  END IF;

  -- 5. Fetch subscription and plan
  SELECT * INTO v_subscription FROM subscriptions WHERE id = v_invoice.subscription_id FOR UPDATE;
  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_subscription.plan_id;

  -- Calculate period
  v_new_period_start := now();
  IF v_subscription.status = 'ACTIVE' AND v_subscription.current_period_end > now() THEN
    -- Symmetrical extension from current period end
    v_new_period_start := v_subscription.current_period_start;
    v_new_period_end := v_subscription.current_period_end + (v_days_to_add || ' days')::INTERVAL;
  ELSE
    v_new_period_end := now() + (v_days_to_add || ' days')::INTERVAL;
  END IF;

  -- 6. Insert SUCCESS Payment
  INSERT INTO payments (
    family_id, subscription_id, invoice_id, payment_code, amount, currency,
    payment_method, provider, status, transaction_reference, received_amount,
    bank_transaction_date, audit_reason, confirmed_by, created_at, updated_at
  ) VALUES (
    v_invoice.family_id, v_invoice.subscription_id, v_invoice.id,
    'PAY-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
    v_invoice.total, v_invoice.currency, 'MANUAL_BANK_TRANSFER', 'MANUAL_ADMIN',
    'SUCCESS', p_transaction_reference, p_received_amount,
    p_bank_transaction_date, p_audit_reason, v_admin_id, now(), now()
  ) RETURNING id INTO v_payment_id;

  -- 7. Update Invoice to PAID
  UPDATE invoices
  SET status = 'PAID',
      confirmed_by = v_admin_id,
      confirmed_at = now(),
      updated_at = now()
  WHERE id = v_invoice.id;

  -- 8. Activate / Renew Subscription
  UPDATE subscriptions
  SET status = 'ACTIVE',
      current_period_start = v_new_period_start,
      current_period_end = v_new_period_end,
      cancel_at_period_end = false,
      canceled_at = NULL,
      updated_at = now()
  WHERE id = v_subscription.id;

  -- 9. Insert Audit Log
  INSERT INTO audit_logs (
    family_id, actor_id, actor_name, action, entity_type, entity_id,
    old_data, new_data, description, created_at
  ) VALUES (
    v_invoice.family_id, v_admin_id, 'Admin User', 'ADMIN_CONFIRM_PAYMENT',
    'INVOICE', v_invoice.id::TEXT,
    jsonb_build_object('status', v_invoice.status),
    jsonb_build_object('status', 'PAID', 'payment_id', v_payment_id, 'received_amount', p_received_amount),
    'Admin xác nhận thủ công thanh toán hóa đơn ' || v_invoice.invoice_number || '. Lý do: ' || p_audit_reason,
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'code', 'CONFIRM_SUCCESS',
    'invoice_id', v_invoice.id,
    'payment_id', v_payment_id,
    'subscription_id', v_subscription.id,
    'current_period_end', v_new_period_end
  );
END;
$$;
