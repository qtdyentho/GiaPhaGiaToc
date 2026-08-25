-- ==============================================================================
-- MIGRATION: 20260825_clan_short_links.sql
-- HỆ THỐNG MÃ LINK RÚT GỌN DUY NHẤT & TỐI ƯU HÓA MÃ QR GIA TỘC (UNIQUE CLAN SHORT LINKS)
-- ==============================================================================

-- 1. BẢNG QUẢN LÝ LINK RÚT GỌN GIA TỘC
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

-- Case-insensitive unique index on short_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_clan_short_links_lower_code 
ON public.clan_short_links (LOWER(short_code));

CREATE INDEX IF NOT EXISTS idx_clan_short_links_family_id 
ON public.clan_short_links (family_id);

CREATE INDEX IF NOT EXISTS idx_clan_short_links_pass_token 
ON public.clan_short_links (pass_token);

-- 2. KÍCH HOẠT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clan_short_links ENABLE ROW LEVEL SECURITY;

-- Policy 1: Công khai quyền đọc mã rút gọn để chuyển hướng (Public resolver)
CREATE POLICY clan_short_links_public_read ON public.clan_short_links
    FOR SELECT
    USING (true);

-- Policy 2: Chỉ Trưởng tộc / Quản trị viên dòng họ mới được tạo và cập nhật link rút gọn
CREATE POLICY clan_short_links_tenant_write ON public.clan_short_links
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.family_memberships
            WHERE family_memberships.family_id = clan_short_links.family_id
              AND family_memberships.user_id = auth.uid()
              AND family_memberships.role IN ('OWNER', 'ADMIN')
              AND family_memberships.status = 'ACTIVE'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_memberships
            WHERE family_memberships.family_id = clan_short_links.family_id
              AND family_memberships.user_id = auth.uid()
              AND family_memberships.role IN ('OWNER', 'ADMIN')
              AND family_memberships.status = 'ACTIVE'
        )
    );

-- 3. HÀM ATOMIC RESOLVE SHORT CODE (Tra cứu và tự động đếm lượt quét QR)
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
    -- Tìm bản ghi short link (không phân biệt chữ hoa/thường)
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

    -- Lấy thông tin pass token tương ứng
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

    -- Kiểm tra khóa do nhập sai nhiều lần
    IF v_pass.locked_until IS NOT NULL AND v_pass.locked_until > now() THEN
        v_is_locked := true;
    END IF;

    -- Lấy thông tin dòng họ
    SELECT name, code, ancestral_hall_address, banner_url INTO v_fam
    FROM public.families
    WHERE id = v_link.family_id;

    -- Tăng số lần truy cập atomic
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
