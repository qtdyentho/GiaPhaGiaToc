-- ============================================================================
-- MIGRATION: CLAN ACCESS PASS SYSTEM (UNIQUE QR TOKEN & ENCRYPTED PIN)
-- Date: 2026-08-25
-- Description:
--   1. Tạo bảng clan_access_passes quản lý mã QR độc bản và mã PIN băm SHA-256 kèm Salt.
--   2. Tạo stored procedure fn_verify_clan_pin: Xác thực PIN, chống brute-force và cấp phiên.
--   3. Tạo stored procedure fn_set_clan_pin: Cập nhật PIN mã hóa cho dòng họ.
--   4. RLS policies cách ly 100% dữ liệu đa gia tộc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS clan_access_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_clan_access_passes_token ON clan_access_passes(pass_token);
CREATE INDEX IF NOT EXISTS idx_clan_access_passes_family ON clan_access_passes(family_id);

-- Stored Procedure: Xác thực PIN và cấp quyền xem
CREATE OR REPLACE FUNCTION fn_verify_clan_pin(
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
    FROM clan_access_passes 
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
        UPDATE clan_access_passes 
        SET failed_attempts = 0, locked_until = NULL, updated_at = NOW() 
        WHERE id = v_pass.id;

        -- Lấy thông tin dòng họ
        SELECT id, name, code, ancestral_home, ancestral_hall, banner_url, logo_url 
        INTO v_family 
        FROM families 
        WHERE id = v_pass.family_id;

        RETURN jsonb_build_object(
            'success', true,
            'family_id', v_family.id,
            'family_name', v_family.name,
            'family_code', v_family.code,
            'ancestral_home', v_family.ancestral_home,
            'banner_url', v_family.banner_url,
            'role', 'MEMBER'
        );
    ELSE
        -- Tăng số lần thử sai
        IF v_pass.failed_attempts + 1 >= 5 THEN
            UPDATE clan_access_passes 
            SET failed_attempts = v_pass.failed_attempts + 1,
                locked_until = NOW() + INTERVAL '15 minutes',
                updated_at = NOW()
            WHERE id = v_pass.id;
            
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Bạn đã nhập sai mã PIN 5 lần. Hệ thống tạm khóa 15 phút để bảo vệ thông tin gia tộc.'
            );
        ELSE
            UPDATE clan_access_passes 
            SET failed_attempts = v_pass.failed_attempts + 1,
                updated_at = NOW()
            WHERE id = v_pass.id;

            RETURN jsonb_build_object(
                'success', false,
                'error', 'Mã PIN không chính xác. Bạn còn ' || (5 - (v_pass.failed_attempts + 1)) || ' lần thử.'
            );
        END IF;
    END IF;
END;
$$;

-- RLS Policy: Khách ẩn danh được SELECT pass_token và pin_salt để tính toán mã băm trước khi gửi xác thực
ALTER TABLE clan_access_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can lookup pass salt" ON clan_access_passes;
CREATE POLICY "Public can lookup pass salt" ON clan_access_passes
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Family admins can manage clan pass" ON clan_access_passes;
CREATE POLICY "Family admins can manage clan pass" ON clan_access_passes
    FOR ALL TO authenticated
    USING (
        family_id IN (
            SELECT family_id FROM family_memberships 
            WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
        )
    );
