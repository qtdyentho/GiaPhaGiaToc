-- ============================================================
-- SEED DEMO DATA — GiaPhaGiaToc SaaS Platform
-- Gia tộc: Họ Nguyễn — Yên Thọ, Yên Mô, Ninh Bình
-- Chạy bằng Supabase MCP execute_sql hoặc SQL Editor
-- ============================================================

DO $$
DECLARE
  v_family_id   UUID := gen_random_uuid();
  v_branch1_id  UUID := gen_random_uuid();
  v_branch2_id  UUID := gen_random_uuid();
  v_gen1_id     UUID := gen_random_uuid();
  v_gen2_id     UUID := gen_random_uuid();
  v_gen3_id     UUID := gen_random_uuid();
  -- Members
  v_m1  UUID := gen_random_uuid(); -- Tổ (Đời 1, đã mất)
  v_m2  UUID := gen_random_uuid(); -- Vợ Tổ (Đời 1, đã mất)
  v_m3  UUID := gen_random_uuid(); -- Con trưởng (Đời 2, đã mất)
  v_m4  UUID := gen_random_uuid(); -- Con thứ (Đời 2, còn sống)
  v_m5  UUID := gen_random_uuid(); -- Cháu 1 - chi trưởng (Đời 3)
  v_m6  UUID := gen_random_uuid(); -- Cháu 2 - chi trưởng (Đời 3)
  v_m7  UUID := gen_random_uuid(); -- Cháu 3 - chi trưởng (Đời 3)
  v_m8  UUID := gen_random_uuid(); -- Cháu 4 - chi thứ (Đời 3)
  v_m9  UUID := gen_random_uuid(); -- Cháu 5 - chi thứ (Đời 3)
  v_m10 UUID := gen_random_uuid(); -- Cháu 6 - chi thứ (Đời 3)
  -- Funds
  v_fund1_id UUID := gen_random_uuid();
  v_fund2_id UUID := gen_random_uuid();
  -- Events
  v_event1_id UUID := gen_random_uuid();
  v_event2_id UUID := gen_random_uuid();
BEGIN

-- ────────────────────────────────────────────────────────────
-- 1. FAMILY
-- ────────────────────────────────────────────────────────────
INSERT INTO families (id, name, description, founding_year, origin_village, clan_motto, status)
VALUES (
  v_family_id,
  'Họ Nguyễn — Yên Thọ',
  'Gia tộc họ Nguyễn tại xã Yên Thọ, huyện Yên Mô, tỉnh Ninh Bình. Dòng họ có truyền thống hiếu học và thờ phụng tổ tiên từ thế kỷ 18.',
  1780,
  'Xã Yên Thọ, Yên Mô, Ninh Bình',
  'Uống nước nhớ nguồn — Ăn quả nhớ kẻ trồng cây',
  'ACTIVE'
);

-- ────────────────────────────────────────────────────────────
-- 2. GENERATIONS (3 Đời)
-- ────────────────────────────────────────────────────────────
INSERT INTO generations (id, family_id, name, generation_number, description) VALUES
  (v_gen1_id, v_family_id, 'Đời Thứ Nhất (Thủy Tổ)', 1, 'Thế hệ khai sinh dòng họ tại Yên Thọ'),
  (v_gen2_id, v_family_id, 'Đời Thứ Hai', 2, 'Con cái của Thủy Tổ'),
  (v_gen3_id, v_family_id, 'Đời Thứ Ba', 3, 'Cháu nội của Thủy Tổ');

-- ────────────────────────────────────────────────────────────
-- 3. BRANCHES (2 Chi)
-- ────────────────────────────────────────────────────────────
INSERT INTO branches (id, family_id, name, code, description) VALUES
  (v_branch1_id, v_family_id, 'Chi Trưởng', 'CHI_TRUONG', 'Chi của con trai trưởng Nguyễn Văn Hiền'),
  (v_branch2_id, v_family_id, 'Chi Thứ',   'CHI_THU',   'Chi của con trai thứ Nguyễn Văn Minh');

-- ────────────────────────────────────────────────────────────
-- 4. MEMBERS (10 thành viên: 2 đời 1, 2 đời 2, 6 đời 3)
-- ────────────────────────────────────────────────────────────
INSERT INTO members (id, family_id, branch_id, generation_id, full_name, gender, status, is_deceased,
  date_of_death_lunar_day, date_of_death_lunar_month, date_of_death_lunar_year, burial_place, biography)
VALUES
  -- Đời 1 (Thủy Tổ — đã mất)
  (v_m1, v_family_id, v_branch1_id, v_gen1_id,
   'Nguyễn Văn Tổ', 'MALE', 'DECEASED', true,
   15, 7, 1850, 'Khu lăng mộ Tổ, Yên Thọ',
   'Người khai mở dòng họ Nguyễn tại Yên Thọ. Thụy hiệu: Phúc Nguyên Công.'),

  (v_m2, v_family_id, v_branch1_id, v_gen1_id,
   'Trần Thị Tổ Mẫu', 'FEMALE', 'DECEASED', true,
   20, 9, 1855, 'Khu lăng mộ Tổ, Yên Thọ',
   'Cụ Tổ Mẫu, người vợ của Nguyễn Văn Tổ. Thụy hiệu: Từ Huệ Phu Nhân.'),

  -- Đời 2 (Con của Tổ)
  (v_m3, v_family_id, v_branch1_id, v_gen2_id,
   'Nguyễn Văn Hiền', 'MALE', 'DECEASED', true,
   10, 3, 1910, 'Khu lăng mộ Chi Trưởng',
   'Con trưởng của Thủy Tổ. Người lập Chi Trưởng dòng họ.'),

  (v_m4, v_family_id, v_branch2_id, v_gen2_id,
   'Nguyễn Văn Minh', 'MALE', 'ALIVE', false,
   null, null, null, null,
   'Con thứ của Thủy Tổ. Người lập Chi Thứ. Hiện đang sinh sống tại Ninh Bình, năm nay 95 tuổi.'),

  -- Đời 3 — Chi Trưởng (con của Nguyễn Văn Hiền)
  (v_m5, v_family_id, v_branch1_id, v_gen3_id,
   'Nguyễn Văn Hoàng', 'MALE', 'ALIVE', false, null, null, null, null,
   'Trưởng họ hiện tại. Tiến sĩ Nông nghiệp. Sinh 1958.'),

  (v_m6, v_family_id, v_branch1_id, v_gen3_id,
   'Nguyễn Thị Lan', 'FEMALE', 'ALIVE', false, null, null, null, null,
   'Con gái Chi Trưởng. Giáo viên nghỉ hưu. Sinh 1962.'),

  (v_m7, v_family_id, v_branch1_id, v_gen3_id,
   'Nguyễn Văn Tuấn', 'MALE', 'ALIVE', false, null, null, null, null,
   'Con trai Chi Trưởng. Kỹ sư xây dựng. Sinh 1965.'),

  -- Đời 3 — Chi Thứ (con của Nguyễn Văn Minh)
  (v_m8, v_family_id, v_branch2_id, v_gen3_id,
   'Nguyễn Văn Đức', 'MALE', 'ALIVE', false, null, null, null, null,
   'Con trưởng Chi Thứ. Doanh nhân. Sinh 1960.'),

  (v_m9, v_family_id, v_branch2_id, v_gen3_id,
   'Nguyễn Thị Hoa', 'FEMALE', 'ALIVE', false, null, null, null, null,
   'Con gái Chi Thứ. Bác sĩ. Sinh 1963.'),

  (v_m10, v_family_id, v_branch2_id, v_gen3_id,
   'Nguyễn Văn Phúc', 'MALE', 'ALIVE', false, null, null, null, null,
   'Con trai Chi Thứ. Giảng viên đại học. Sinh 1968.');

-- ────────────────────────────────────────────────────────────
-- 5. MEMBER RELATIONSHIPS (quan hệ huyết thống)
-- ────────────────────────────────────────────────────────────
INSERT INTO member_relationships (family_id, member_id, related_member_id, relationship_type) VALUES
  -- Tổ → Con
  (v_family_id, v_m1, v_m3, 'CHILD'),
  (v_family_id, v_m1, v_m4, 'CHILD'),
  -- Tổ Mẫu → Con
  (v_family_id, v_m2, v_m3, 'CHILD'),
  (v_family_id, v_m2, v_m4, 'CHILD'),
  -- Vợ chồng Tổ
  (v_family_id, v_m1, v_m2, 'SPOUSE'),
  -- Đời 2 → Đời 3 (Chi Trưởng)
  (v_family_id, v_m3, v_m5, 'CHILD'),
  (v_family_id, v_m3, v_m6, 'CHILD'),
  (v_family_id, v_m3, v_m7, 'CHILD'),
  -- Đời 2 → Đời 3 (Chi Thứ)
  (v_family_id, v_m4, v_m8, 'CHILD'),
  (v_family_id, v_m4, v_m9, 'CHILD'),
  (v_family_id, v_m4, v_m10, 'CHILD');

-- ────────────────────────────────────────────────────────────
-- 6. MEMORIAL DATES (Ngày giỗ — tự động từ members DECEASED)
-- ────────────────────────────────────────────────────────────
INSERT INTO memorial_dates (family_id, member_id, title, lunar_day, lunar_month, is_leap_month, notes)
VALUES
  (v_family_id, v_m1, 'Lễ Giỗ Thủy Tổ Nguyễn Văn Tổ', 15, 7, false,
   'Giỗ Tổ chính hàng năm. Toàn dòng họ tụ họp tại Nhà Thờ Tổ.'),
  (v_family_id, v_m2, 'Lễ Giỗ Tổ Mẫu Trần Thị Tổ Mẫu', 20, 9, false,
   'Giỗ Tổ Mẫu. Chi Trưởng chủ lễ.'),
  (v_family_id, v_m3, 'Lễ Giỗ Cụ Nguyễn Văn Hiền (Chi Trưởng)', 10, 3, false,
   'Giỗ Cụ Hiền. Con cháu Chi Trưởng chủ tế.');

-- ────────────────────────────────────────────────────────────
-- 7. FUNDS (2 Quỹ gia tộc)
-- ────────────────────────────────────────────────────────────
INSERT INTO funds (id, family_id, name, description, opening_balance, current_balance, status)
VALUES
  (v_fund1_id, v_family_id, 'Quỹ Chung Dòng Họ',
   'Quỹ tổng hợp dùng cho lễ giỗ tổ, tu bổ từ đường và các hoạt động chung',
   50000000, 50000000, 'ACTIVE'),
  (v_fund2_id, v_family_id, 'Quỹ Khuyến Học',
   'Quỹ khen thưởng con cháu học giỏi, đỗ đại học và tốt nghiệp xuất sắc',
   20000000, 20000000, 'ACTIVE');

-- ────────────────────────────────────────────────────────────
-- 8. INCOME CATEGORIES
-- ────────────────────────────────────────────────────────────
INSERT INTO income_categories (family_id, name, code, is_active) VALUES
  (v_family_id, 'Đóng góp thường niên', 'THUONG_NIEN', true),
  (v_family_id, 'Quỹ khuyến học', 'KHUYEN_HOC', true),
  (v_family_id, 'Tài trợ xây dựng từ đường', 'TU_BO_TU_DUONG', true),
  (v_family_id, 'Công đức lễ giỗ tổ', 'GIO_TO', true);

-- ────────────────────────────────────────────────────────────
-- 9. EXPENSE CATEGORIES
-- ────────────────────────────────────────────────────────────
INSERT INTO expense_categories (family_id, name, code, is_active) VALUES
  (v_family_id, 'Lễ nghi & Giỗ tổ', 'LE_NGHI_GIO_TO', true),
  (v_family_id, 'Tu bổ & Xây dựng', 'TU_BO_XAY_DUNG', true),
  (v_family_id, 'Khen thưởng khuyến học', 'KHUYEN_HOC', true),
  (v_family_id, 'Hiếu hỷ & Thăm hỏi', 'HIEU_HY', true);

-- ────────────────────────────────────────────────────────────
-- 10. FINANCIAL TRANSACTIONS (5 giao dịch mẫu)
-- ────────────────────────────────────────────────────────────
INSERT INTO financial_transactions
  (family_id, fund_id, transaction_type, amount, description, payment_method, transaction_date, recorded_by_user_id, status)
VALUES
  -- Thu: Đóng góp thường niên 2026
  (v_family_id, v_fund1_id, 'INCOME', 2000000,
   'Đóng góp thường niên 2026 — Nguyễn Văn Hoàng (Chi Trưởng)',
   'BANK_TRANSFER', '2026-01-15', NULL, 'COMPLETED'),

  (v_family_id, v_fund1_id, 'INCOME', 2000000,
   'Đóng góp thường niên 2026 — Nguyễn Văn Đức (Chi Thứ)',
   'CASH', '2026-01-20', NULL, 'COMPLETED'),

  -- Thu: Quỹ khuyến học
  (v_family_id, v_fund2_id, 'INCOME', 5000000,
   'Tài trợ Quỹ Khuyến Học 2026 — Nguyễn Văn Tuấn',
   'VIETQR', '2026-02-10', NULL, 'COMPLETED'),

  -- Chi: Lễ giỗ Tổ 2026
  (v_family_id, v_fund1_id, 'EXPENSE', 8500000,
   'Chi phí tổ chức Lễ Giỗ Tổ Hàng Năm tháng 7 Âm (lễ vật, cỗ bàn, hương đèn)',
   'CASH', '2026-08-01', NULL, 'COMPLETED'),

  -- Chi: Khen thưởng khuyến học
  (v_family_id, v_fund2_id, 'EXPENSE', 3000000,
   'Khen thưởng 3 cháu đỗ đại học năm 2026 (mỗi cháu 1.000.000đ)',
   'CASH', '2026-08-15', NULL, 'COMPLETED');

-- ────────────────────────────────────────────────────────────
-- 11. EVENTS (2 sự kiện)
-- ────────────────────────────────────────────────────────────
INSERT INTO events (id, family_id, title, description, event_type, start_date, end_date,
  location, fund_id, total_budget, status)
VALUES
  (v_event1_id, v_family_id,
   'Lễ Giỗ Tổ Hàng Năm — Tháng 7 Âm Lịch',
   'Lễ Giỗ Thủy Tổ Nguyễn Văn Tổ. Toàn dòng họ tụ tập tại Nhà Thờ Tổ xã Yên Thọ. Chương trình: Dâng lễ 8h, cỗ đãi 11h, họp mặt 14h.',
   'GIO_TO', '2026-08-20', '2026-08-20',
   'Nhà Thờ Tổ Họ Nguyễn, Xã Yên Thọ, Yên Mô, Ninh Bình',
   v_fund1_id, 8500000, 'COMPLETED'),

  (v_event2_id, v_family_id,
   'Họp Mặt Cuối Năm & Trao Thưởng Khuyến Học 2026',
   'Họp mặt toàn dòng họ dịp Tất Niên. Trao thưởng khuyến học cho các cháu học giỏi. Ôn lại gia phả và bầu Ban Quản Trị nhiệm kỳ 2027.',
   'MEETING', '2026-01-15', '2026-01-15',
   'Nhà Văn Hóa Xã Yên Thọ',
   v_fund2_id, 3000000, 'UPCOMING');

-- ────────────────────────────────────────────────────────────
-- 12. CONTRIBUTIONS (Đóng góp nổi bật)
-- ────────────────────────────────────────────────────────────
INSERT INTO contributions (family_id, member_id, donor_name, fund_id, amount, purpose, payment_method)
VALUES
  (v_family_id, v_m5, 'Nguyễn Văn Hoàng (Trưởng Họ)', v_fund1_id, 10000000,
   'Đóng góp tu bổ cổng tam quan Nhà Thờ Tổ', 'BANK_TRANSFER'),
  (v_family_id, v_m7, 'Nguyễn Văn Tuấn', v_fund2_id, 5000000,
   'Tài trợ Quỹ Khuyến Học khen thưởng học sinh giỏi 2026', 'VIETQR'),
  (v_family_id, v_m8, 'Nguyễn Văn Đức (Doanh Nghiệp)', v_fund1_id, 20000000,
   'Tài trợ lát gạch sân Nhà Thờ Tổ', 'BANK_TRANSFER');

RAISE NOTICE '✅ Seed hoàn tất! Family ID: %', v_family_id;
RAISE NOTICE '   Chi Trưởng ID: % | Chi Thứ ID: %', v_branch1_id, v_branch2_id;
RAISE NOTICE '   Quỹ Chung ID: % | Quỹ Khuyến Học ID: %', v_fund1_id, v_fund2_id;

END $$;
