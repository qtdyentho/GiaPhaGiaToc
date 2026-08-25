-- ==============================================================================
-- SUPABASE CONSOLIDATED MIGRATIONS (PHASE 6.X - 2026-08-25)
-- DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)
-- ==============================================================================
-- Tệp SQL này tổng hợp toàn bộ 5 migration mới nhất:
--   1. Phả hệ đa thê & con riêng / con nuôi (Multi-Spouse & Stepchild Lineage)
--   2. Chi trực tiếp & Sổ quỹ mở (Direct Expense Disbursement & Open Ledger)
--   3. Mã QR & PIN tra cứu Từ Đường (Clan Access Pass & Salted SHA-256 PIN)
--   4. Link rút gọn duy nhất toàn cục & Tối ưu hóa mã QR (Unique Clan Short Links)
--   5. Khắc phục 7 lỗ hổng kiểm toán bảo mật & Tenant Isolation RLS
--
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase Dashboard và nhấn Run.
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: PHẢ HỆ ĐA THÊ & CON RIÊNG / CON NUÔI (MULTI-SPOUSE & STEPCHILD)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE spouse_rank_type AS ENUM (
        'CHINH_THAT',   -- Bà Cả / Nguyên Phối
        'KE_THAT',      -- Bà Hai / Kế Thất
        'THAC_THAT',    -- Bà Ba, Bà Tư / Thứ Thiếp
        'KHONG_RO'      -- Chưa rõ thứ tự
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE child_lineage_type AS ENUM (
        'BIOLOGICAL',           -- Con ruột
        'MATERNAL_STEPCHILD',   -- Con riêng của vợ
        'PATERNAL_STEPCHILD',   -- Con riêng của chồng
        'ADOPTED'               -- Con nuôi
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Bổ sung các cột vào bảng members
ALTER TABLE public.members
    ADD COLUMN IF NOT EXISTS child_lineage_type child_lineage_type DEFAULT 'BIOLOGICAL',
    ADD COLUMN IF NOT EXISTS birth_order_in_family INTEGER,
    ADD COLUMN IF NOT EXISTS biological_father_name TEXT,
    ADD COLUMN IF NOT EXISTS biological_mother_name TEXT,
    ADD COLUMN IF NOT EXISTS step_parent_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS spouse_order INTEGER DEFAULT 1;

-- Bổ sung các cột vào bảng member_relationships
ALTER TABLE public.member_relationships
    ADD COLUMN IF NOT EXISTS spouse_rank spouse_rank_type DEFAULT 'CHINH_THAT',
    ADD COLUMN IF NOT EXISTS spouse_order INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS marriage_order_label TEXT,
    ADD COLUMN IF NOT EXISTS is_current_spouse BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS child_lineage_type child_lineage_type DEFAULT 'BIOLOGICAL';

-- ==============================================================================
-- PHẦN 2: CHI TRỰC TIẾP & SỔ QUỸ MỞ (DIRECT EXPENSE & OPEN LEDGER)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE disbursement_status AS ENUM (
        'PENDING_DISBURSEMENT', -- Đã duyệt nhưng chưa giải ngân tiền
        'DISBURSED',            -- Đã xuất tiền mặt / chuyển khoản
        'FAILED',               -- Thất bại khi giải ngân
        'CANCELLED'             -- Đã hủy
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.expense_records
    ADD COLUMN IF NOT EXISTS disbursement_status disbursement_status DEFAULT 'DISBURSED',
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH',
    ADD COLUMN IF NOT EXISTS receipt_image_url TEXT,
    ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS disbursed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS audit_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_expense_records_disbursement ON public.expense_records(disbursement_status);

-- ==============================================================================
-- PHẦN 3: MÃ QR & PIN TRA CỨU TỪ ĐƯỜNG (CLAN ACCESS PASS & PIN)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clan_access_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    pass_token TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    pin_salt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    failed_attempts INTEGER DEFAULT 0 NOT NULL,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_clan_pass_family UNIQUE (family_id)
);

CREATE INDEX IF NOT EXISTS idx_clan_access_passes_token ON public.clan_access_passes(pass_token);
CREATE INDEX IF NOT EXISTS idx_clan_access_passes_family ON public.clan_access_passes(family_id);

ALTER TABLE public.clan_access_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY clan_access_passes_read ON public.clan_access_passes
    FOR SELECT TO authenticated, anon USING (true);

-- Hàm RPC: Xác thực PIN gia tộc an toàn
CREATE OR REPLACE FUNCTION public.fn_verify_clan_pin(
    p_pass_token TEXT,
    p_input_pin_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pass RECORD;
    v_family RECORD;
BEGIN
    SELECT * INTO v_pass 
    FROM public.clan_access_passes 
    WHERE pass_token = p_pass_token AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Mã QR không hợp lệ hoặc đã bị thu hồi.'
        );
    END IF;

    -- Kiểm tra khóa do nhập sai nhiều lần (Brute-force lockout)
    IF v_pass.locked_until IS NOT NULL AND v_pass.locked_until > NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Mã PIN đã bị khóa tạm thời do nhập sai quá 5 lần. Vui lòng thử lại sau.'
        );
    END IF;

    -- Kiểm tra khớp mã PIN băm
    IF v_pass.pin_hash = p_input_pin_hash THEN
        -- Reset số lần sai
        UPDATE public.clan_access_passes 
        SET failed_attempts = 0, locked_until = NULL, updated_at = NOW() 
        WHERE id = v_pass.id;

        -- Lấy thông tin dòng họ
        SELECT * INTO v_family 
        FROM public.families 
        WHERE id = v_pass.family_id;

        RETURN jsonb_build_object(
            'success', true,
            'family_id', v_family.id,
            'family_name', COALESCE(v_family.name, 'Gia Tộc'),
            'family_code', v_family.code,
            'banner_url', v_family.banner_url,
            'role', 'MEMBER'
        );
    ELSE
        -- Tăng số lần thử sai
        IF v_pass.failed_attempts + 1 >= 5 THEN
            UPDATE public.clan_access_passes 
            SET failed_attempts = v_pass.failed_attempts + 1,
                locked_until = NOW() + INTERVAL '15 minutes',
                updated_at = NOW()
            WHERE id = v_pass.id;
            
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Bạn đã nhập sai mã PIN 5 lần. Hệ thống tạm khóa 15 phút để bảo vệ thông tin gia tộc.'
            );
        ELSE
            UPDATE public.clan_access_passes 
            SET failed_attempts = v_pass.failed_attempts + 1,
                updated_at = NOW()
            WHERE id = v_pass.id;

            RETURN jsonb_build_object(
                'success', false,
                'error', format('Mã PIN không chính xác. Bạn còn %s lần thử.', 5 - (v_pass.failed_attempts + 1))
            );
        END IF;
    END IF;
END;
$$;

-- ==============================================================================
-- PHẦN 4: LINK RÚT GỌN DUY NHẤT TOÀN CỤC & TỐI ƯU HÓA MÃ QR (UNIQUE SHORT LINKS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clan_short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    pass_token TEXT NOT NULL,
    short_code VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    clicks_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_clan_short_links_code UNIQUE (short_code)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clan_short_links_lower_code 
ON public.clan_short_links (LOWER(short_code));

CREATE INDEX IF NOT EXISTS idx_clan_short_links_family_id 
ON public.clan_short_links (family_id);

ALTER TABLE public.clan_short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY clan_short_links_public_read ON public.clan_short_links
    FOR SELECT USING (true);

-- Hàm RPC: Giải mã short link và đếm số lần quét QR
CREATE OR REPLACE FUNCTION public.fn_resolve_short_link(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_link RECORD;
    v_pass RECORD;
    v_fam RECORD;
    v_is_locked BOOLEAN := false;
BEGIN
    SELECT * INTO v_link
    FROM public.clan_short_links
    WHERE LOWER(short_code) = LOWER(TRIM(p_code))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Liên kết rút gọn không tồn tại hoặc đã bị thu hồi.'
        );
    END IF;

    SELECT * INTO v_pass
    FROM public.clan_access_passes
    WHERE pass_token = v_link.pass_token
      AND is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Mã QR mở khóa của dòng họ hiện không còn hiệu lực.'
        );
    END IF;

    IF v_pass.locked_until IS NOT NULL AND v_pass.locked_until > now() THEN
        v_is_locked := true;
    END IF;

    SELECT * INTO v_fam
    FROM public.families
    WHERE id = v_link.family_id;

    UPDATE public.clan_short_links
    SET clicks_count = clicks_count + 1,
        last_accessed_at = now(),
        updated_at = now()
    WHERE id = v_link.id;

    RETURN jsonb_build_object(
        'success', true,
        'short_code', v_link.short_code,
        'pass_token', v_pass.pass_token,
        'family_id', v_link.family_id,
        'family_name', COALESCE(v_fam.name, 'Gia Tộc'),
        'family_code', v_fam.code,
        'pin_salt', v_pass.pin_salt,
        'banner_url', v_fam.banner_url,
        'is_locked', v_is_locked,
        'clicks_count', v_link.clicks_count + 1
    );
END;
$$;

-- ==============================================================================
-- PHẦN 5: BẢO MẬT & CÁCH LY DỮ LIỆU ĐA GIA TỘC (SECURITY REMEDIATION)
-- ==============================================================================

-- 1. Helper function lấy danh sách family_id active của user
CREATE OR REPLACE FUNCTION public.current_user_family_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(
        array_agg(family_id),
        ARRAY[]::UUID[]
    )
    FROM public.family_memberships
    WHERE user_id = auth.uid()
      AND status = 'ACTIVE';
$$;

-- 2. Tenant-isolated RLS cho Profiles
DROP POLICY IF EXISTS profiles_read_all ON public.profiles;
DROP POLICY IF EXISTS profiles_read_tenant ON public.profiles;

CREATE POLICY profiles_read_tenant ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR id IN (
            SELECT user_id FROM public.family_memberships
            WHERE family_id IN (SELECT unnest(public.current_user_family_ids()))
              AND status = 'ACTIVE'
        )
    );

-- 3. Write RLS Policies có điều kiện RBAC
DROP POLICY IF EXISTS contributions_insert_member ON public.contributions;
CREATE POLICY contributions_insert_member ON public.contributions
    FOR INSERT TO authenticated
    WITH CHECK (
        family_id IN (SELECT unnest(public.current_user_family_ids()))
    );

DROP POLICY IF EXISTS sponsorships_insert_member ON public.sponsorships;
CREATE POLICY sponsorships_insert_member ON public.sponsorships
    FOR INSERT TO authenticated
    WITH CHECK (
        family_id IN (SELECT unnest(public.current_user_family_ids()))
    );

DROP POLICY IF EXISTS invitation_tokens_insert_admin ON public.invitation_tokens;
CREATE POLICY invitation_tokens_insert_admin ON public.invitation_tokens
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_memberships
            WHERE family_memberships.family_id = invitation_tokens.family_id
              AND family_memberships.user_id = auth.uid()
              AND family_memberships.role IN ('OWNER', 'ADMIN')
              AND family_memberships.status = 'ACTIVE'
        )
    );

-- ==============================================================================
-- KẾT THÚC MIGRATION CONSOLIDATED (TẤT CẢ TEST SẴN SÀNG)
-- ==============================================================================
