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
