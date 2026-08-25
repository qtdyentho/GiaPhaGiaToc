-- ============================================================================
-- MIGRATION: DIRECT EXPENSE EXECUTION, OPEN LEDGER TRANSPARENCY & SCHEMA FIXES
-- Date: 2026-08-25
-- Description:
--   1. Thêm cột expense_id vào financial_transactions (Fix #1 từ Audit Report).
--   2. Sửa founder_member_id nullable trong families (Fix #2 Circular Dependency).
--   3. Tạo Stored Procedure fn_record_direct_expense: Thủ quỹ/Kế toán chi tiền & trừ quỹ trực tiếp.
--   4. Mở RLS Policy: Mọi thành viên trong họ đều có quyền SELECT xem toàn bộ Thu - Chi.
--   5. Đồng bộ enum và quyền ghi cho OWNER, ADMIN, TREASURER.
-- ============================================================================

-- 1. Thêm cột expense_id vào financial_transactions nếu chưa có
ALTER TABLE financial_transactions 
  ADD COLUMN IF NOT EXISTS expense_id UUID REFERENCES expense_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_expense_id 
  ON financial_transactions(expense_id);

-- 2. Sửa founder_member_id nullable trong bảng families để tránh circular deadlock
ALTER TABLE families 
  ALTER COLUMN founder_member_id DROP NOT NULL;

-- 3. Tạo/Cập nhật Stored Procedure: Ghi nhận chi tiêu và xuất quỹ trực tiếp
CREATE OR REPLACE FUNCTION fn_record_direct_expense(
    p_family_id UUID,
    p_fund_id UUID,
    p_category_id UUID,
    p_title TEXT,
    p_amount NUMERIC,
    p_recipient_name TEXT,
    p_expense_date DATE,
    p_payment_method payment_method,
    p_description TEXT,
    p_receipt_url TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_fund RECORD;
    v_expense_id UUID;
    v_tx_id UUID;
    v_tx_code TEXT;
BEGIN
    -- Kiểm tra số dư quỹ với Row Locking
    SELECT * INTO v_fund 
    FROM funds 
    WHERE id = p_fund_id AND family_id = p_family_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy quỹ hợp lệ trong gia tộc.';
    END IF;

    IF v_fund.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Quỹ hiện đang bị đóng băng hoặc không hoạt động.';
    END IF;

    IF v_fund.current_balance < p_amount THEN
        RAISE EXCEPTION 'Số dư quỹ không đủ để xuất chi (Hiện có: %, Cần chi: %).', v_fund.current_balance, p_amount;
    END IF;

    -- 1. Tạo bản ghi chi phí (Trạng thái APPROVED / POSTED ngay)
    INSERT INTO expense_records (
        family_id,
        fund_id,
        category_id,
        title,
        amount,
        recipient_name,
        expense_date,
        payment_method,
        description,
        receipt_url,
        status,
        created_by,
        approved_by,
        approved_at
    ) VALUES (
        p_family_id,
        p_fund_id,
        p_category_id,
        p_title,
        p_amount,
        p_recipient_name,
        p_expense_date,
        p_payment_method,
        p_description,
        p_receipt_url,
        'APPROVED',
        p_user_id,
        p_user_id,
        NOW()
    ) RETURNING id INTO v_expense_id;

    -- 2. Trừ số dư quỹ
    UPDATE funds 
    SET current_balance = current_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_fund_id;

    -- 3. Sinh mã giao dịch và ghi nhận vào sổ cái bất biến (POSTED)
    v_tx_code := 'TX-EXP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO financial_transactions (
        family_id,
        fund_id,
        expense_id,
        transaction_code,
        transaction_type,
        amount,
        payment_method,
        transaction_date,
        description,
        receipt_url,
        status,
        created_by
    ) VALUES (
        p_family_id,
        p_fund_id,
        v_expense_id,
        v_tx_code,
        'EXPENSE',
        p_amount,
        p_payment_method,
        p_expense_date,
        COALESCE(p_description, p_title),
        p_receipt_url,
        'POSTED',
        p_user_id
    ) RETURNING id INTO v_tx_id;

    -- 4. Trả về kết quả JSON
    RETURN jsonb_build_object(
        'success', true,
        'expense_id', v_expense_id,
        'transaction_id', v_tx_id,
        'transaction_code', v_tx_code,
        'remaining_balance', v_fund.current_balance - p_amount
    );
END;
$$;

-- 4. RLS Policy Mở Rộng: Toàn thể thành viên gia tộc có quyền SELECT xem toàn bộ Thu - Chi minh bạch
-- Bảng funds
DROP POLICY IF EXISTS "Active members can view family funds" ON funds;
CREATE POLICY "Active members can view family funds" ON funds
  FOR SELECT TO authenticated USING (
    family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- Bảng financial_transactions
DROP POLICY IF EXISTS "Active members can view family financial transactions" ON financial_transactions;
CREATE POLICY "Active members can view family financial transactions" ON financial_transactions
  FOR SELECT TO authenticated USING (
    family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- Bảng expense_records
DROP POLICY IF EXISTS "Active members can view family expense records" ON expense_records;
CREATE POLICY "Active members can view family expense records" ON expense_records
  FOR SELECT TO authenticated USING (
    family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- Bảng contributions
DROP POLICY IF EXISTS "Active members can view family contributions" ON contributions;
CREATE POLICY "Active members can view family contributions" ON contributions
  FOR SELECT TO authenticated USING (
    family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- Bảng income_assessments
DROP POLICY IF EXISTS "Active members can view family assessments" ON income_assessments;
CREATE POLICY "Active members can view family assessments" ON income_assessments
  FOR SELECT TO authenticated USING (
    family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- 5. Quyền ghi (INSERT/UPDATE) tài chính: Trưởng họ, Quản trị viên và Thủ quỹ/Kế toán
DROP POLICY IF EXISTS "Finance managers can insert expense records" ON expense_records;
CREATE POLICY "Finance managers can insert expense records" ON expense_records
  FOR INSERT TO authenticated WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_memberships 
      WHERE user_id = auth.uid() AND status = 'ACTIVE' 
      AND role IN ('OWNER', 'ADMIN', 'TREASURER')
    )
  );

DROP POLICY IF EXISTS "Finance managers can insert transactions" ON financial_transactions;
CREATE POLICY "Finance managers can insert transactions" ON financial_transactions
  FOR INSERT TO authenticated WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_memberships 
      WHERE user_id = auth.uid() AND status = 'ACTIVE' 
      AND role IN ('OWNER', 'ADMIN', 'TREASURER')
    )
  );
