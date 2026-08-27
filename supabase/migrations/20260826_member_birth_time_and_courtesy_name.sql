-- ============================================================================
-- MIGRATION: 20260826_member_birth_time_and_courtesy_name.sql
-- PURPOSE: Bổ sung các trường dữ liệu ngọc phả cổ truyền cho thành viên:
--          1. birth_time: Giờ sinh (VD: 08:30 hoặc Giờ Tý, Giờ Thìn, Canh Giờ)
--          2. courtesy_name: Tên Húy / Tên Hiệu / Tự Hiệu / Thụy Hiệu
--          3. death_time: Giờ mất / Giờ quy tiên (phục vụ tuần nhang & cúng lễ)
--          4. religious_name: Pháp danh / Tên thánh
-- ============================================================================

-- 1. BỔ SUNG CỘT VÀO BẢNG MEMBERS (ZERO DATA LOSS)
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS birth_time VARCHAR(50),
  ADD COLUMN IF NOT EXISTS courtesy_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS death_time VARCHAR(50),
  ADD COLUMN IF NOT EXISTS religious_name VARCHAR(150);

-- 2. THÊM COMMENT MÔ TẢ NGHIỆP VỤ CHO DATABASE SCHEMA
COMMENT ON COLUMN members.birth_time IS 'Giờ sinh của thành viên (VD: 08:30 hoặc Giờ Thìn 07h-09h)';
COMMENT ON COLUMN members.courtesy_name IS 'Tên Húy, Tên Hiệu, Tự Hiệu, Thụy Hiệu của bậc tiền nhân';
COMMENT ON COLUMN members.death_time IS 'Giờ mất / Giờ quy tiên của tiền nhân';
COMMENT ON COLUMN members.religious_name IS 'Pháp danh quy y hoặc Tên thánh';
