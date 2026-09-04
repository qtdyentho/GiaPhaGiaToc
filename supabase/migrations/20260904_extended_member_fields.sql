-- ==============================================================================
-- MIGRATION: EXTENDED MEMBER PROFILE FIELDS
-- DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
-- NGÀY: 2026-09-04
-- ==============================================================================

-- 1. Bổ sung các cột thông tin mở rộng cho bảng members
ALTER TABLE members ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS current_residence TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS work_status TEXT DEFAULT 'WORKING';
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS social_links JSONB;

-- 2. Ghi chú mô tả ý nghĩa nghiệp vụ từng cột
COMMENT ON COLUMN members.hometown IS 'Quê quán, nguyên quán gốc tổ tiên';
COMMENT ON COLUMN members.current_residence IS 'Chỗ ở hiện tại / thường trú (trong nước hoặc hải ngoại)';
COMMENT ON COLUMN members.occupation IS 'Nghề nghiệp / Chức danh / Đơn vị công tác';
COMMENT ON COLUMN members.work_status IS 'Trạng thái công tác: WORKING (Đang làm việc), RETIRED (Đã nghỉ hưu), STUDENT (Học sinh/Sinh viên), OTHER (Khác)';
COMMENT ON COLUMN members.phone IS 'Số điện thoại di động liên hệ nội bộ dòng họ';
COMMENT ON COLUMN members.education_level IS 'Trình độ học vấn, học vị, học hàm';
COMMENT ON COLUMN members.social_links IS 'Liên kết mạng xã hội dạng JSONB: {"facebook": "...", "zalo": "...", "email": "..."}';
