-- ============================================================
-- SEED 2 GIA TỘC ĐỘC LẬP & GÁN 2 USER RIÊNG BIỆT (MULTI-TENANT SEED)
-- Sử dụng 100% gen_random_uuid() chuẩn UUID v4 ngẫu nhiên
-- ============================================================

DO $$
DECLARE
  -- User IDs (UUID v4 ngẫu nhiên lấy từ auth.users hoặc sinh mới)
  v_user_alpha UUID;
  v_user_beta  UUID;

  -- Gia tộc A (Họ Nguyễn) - Hoàn toàn ngẫu nhiên
  v_family_a UUID := gen_random_uuid();
  v_gen_a1   UUID := gen_random_uuid();
  v_gen_a2   UUID := gen_random_uuid();
  v_branch_a UUID := gen_random_uuid();
  v_m_a1     UUID := gen_random_uuid();
  v_m_a2     UUID := gen_random_uuid();
  v_fund_a   UUID := gen_random_uuid();

  -- Gia tộc B (Họ Trần) - Hoàn toàn ngẫu nhiên
  v_family_b UUID := gen_random_uuid();
  v_gen_b1   UUID := gen_random_uuid();
  v_gen_b2   UUID := gen_random_uuid();
  v_branch_b UUID := gen_random_uuid();
  v_m_b1     UUID := gen_random_uuid();
  v_m_b2     UUID := gen_random_uuid();
  v_fund_b   UUID := gen_random_uuid();

BEGIN
  -- Lấy ID của 2 User Auth có sẵn (nếu chưa có thì sinh ngẫu nhiên)
  SELECT id INTO v_user_alpha FROM auth.users WHERE email = 'truongtoc.alpha@giapha.vn' LIMIT 1;
  IF v_user_alpha IS NULL THEN
    v_user_alpha := gen_random_uuid();
  END IF;

  SELECT id INTO v_user_beta FROM auth.users WHERE email = 'truongtoc.beta@giapha.vn' LIMIT 1;
  IF v_user_beta IS NULL THEN
    v_user_beta := gen_random_uuid();
  END IF;

  -- -------------------------------------------------------------
  -- 1. TẠO GIA TỘC A: HỌ NGUYỄN (User Alpha quản lý)
  -- -------------------------------------------------------------
  INSERT INTO families (id, name, surname, description, origin, ancestral_home)
  VALUES (
    v_family_a,
    'Họ Nguyễn — Yên Mô',
    'Nguyễn',
    'Dòng họ Nguyễn Phúc tại Yên Mô, Ninh Bình',
    'Yên Mô, Ninh Bình',
    'Từ đường Họ Nguyễn, Yên Mô'
  );

  INSERT INTO family_memberships (id, family_id, user_id, role, status)
  VALUES (gen_random_uuid(), v_family_a, v_user_alpha, 'OWNER', 'ACTIVE');

  INSERT INTO generations (id, family_id, name, generation_number, description) VALUES
    (v_gen_a1, v_family_a, 'Đời 1 (Nguyễn Tộc)', 1, 'Thủy tổ họ Nguyễn'),
    (v_gen_a2, v_family_a, 'Đời 2 (Nguyễn Tộc)', 2, 'Thế hệ thứ hai');

  INSERT INTO branches (id, family_id, name, code, description) VALUES
    (v_branch_a, v_family_a, 'Chi Trưởng Họ Nguyễn', 'CHI_A_TRUONG', 'Chi trưởng Nguyễn');

  INSERT INTO members (id, family_id, branch_id, generation_id, full_name, gender, status, is_deceased, biography) VALUES
    (v_m_a1, v_family_a, v_branch_a, v_gen_a1, 'Nguyễn Phúc Thủy Tổ', 'MALE', 'DECEASED', true, 'Cụ Khởi Tổ họ Nguyễn tại Yên Mô'),
    (v_m_a2, v_family_a, v_branch_a, v_gen_a2, 'Nguyễn Phúc An', 'MALE', 'ALIVE', false, 'Trưởng tộc đời thứ 2 họ Nguyễn');

  INSERT INTO memorial_dates (id, family_id, member_id, lunar_day, lunar_month, is_leap_month, recurrence, notes) VALUES
    (gen_random_uuid(), v_family_a, v_m_a1, 15, 8, false, 'YEARLY_LUNAR', 'Giỗ Cụ Thủy Tổ Họ Nguyễn (15/8 Âm lịch)');

  INSERT INTO funds (id, family_id, name, description, opening_balance, current_balance, status) VALUES
    (v_fund_a, v_family_a, 'Quỹ Khuyến Học Họ Nguyễn', 'Quỹ nội bộ của Họ Nguyễn', 50000000, 50000000, 'ACTIVE');

  INSERT INTO financial_transactions (id, family_id, fund_id, transaction_code, transaction_type, amount, description, payment_method, transaction_date, status) VALUES
    (gen_random_uuid(), v_family_a, v_fund_a, 'TXN-NGUYEN-001', 'INCOME', 5000000, 'Đóng góp Quỹ Họ Nguyễn - Nguyễn Phúc An', 'BANK_TRANSFER', '2026-08-01', 'POSTED');

  -- -------------------------------------------------------------
  -- 2. TẠO GIA TỘC B: HỌ TRẦN (User Beta quản lý)
  -- -------------------------------------------------------------
  INSERT INTO families (id, name, surname, description, origin, ancestral_home)
  VALUES (
    v_family_b,
    'Họ Trần — Gia Viễn',
    'Trần',
    'Dòng họ Trần Văn tại Gia Viễn, Ninh Bình',
    'Gia Viễn, Ninh Bình',
    'Từ đường Họ Trần, Gia Viễn'
  );

  INSERT INTO family_memberships (id, family_id, user_id, role, status)
  VALUES (gen_random_uuid(), v_family_b, v_user_beta, 'OWNER', 'ACTIVE');

  INSERT INTO generations (id, family_id, name, generation_number, description) VALUES
    (v_gen_b1, v_family_b, 'Đời 1 (Trần Tộc)', 1, 'Thủy tổ họ Trần'),
    (v_gen_b2, v_family_b, 'Đời 2 (Trần Tộc)', 2, 'Thế hệ thứ hai');

  INSERT INTO branches (id, family_id, name, code, description) VALUES
    (v_branch_b, v_family_b, 'Chi Trưởng Họ Trần', 'CHI_B_TRUONG', 'Chi trưởng Trần');

  INSERT INTO members (id, family_id, branch_id, generation_id, full_name, gender, status, is_deceased, biography) VALUES
    (v_m_b1, v_family_b, v_branch_b, v_gen_b1, 'Trần Văn Khởi Tổ', 'MALE', 'DECEASED', true, 'Cụ Khởi Tổ họ Trần tại Gia Viễn'),
    (v_m_b2, v_family_b, v_branch_b, v_gen_b2, 'Trần Văn Bảo', 'MALE', 'ALIVE', false, 'Trưởng tộc đời thứ 2 họ Trần');

  INSERT INTO memorial_dates (id, family_id, member_id, lunar_day, lunar_month, is_leap_month, recurrence, notes) VALUES
    (gen_random_uuid(), v_family_b, v_m_b1, 10, 10, false, 'YEARLY_LUNAR', 'Giỗ Cụ Khởi Tổ Họ Trần (10/10 Âm lịch)');

  INSERT INTO funds (id, family_id, name, description, opening_balance, current_balance, status) VALUES
    (v_fund_b, v_family_b, 'Quỹ Xây Dựng Họ Trần', 'Quỹ nội bộ của Họ Trần', 80000000, 80000000, 'ACTIVE');

  INSERT INTO financial_transactions (id, family_id, fund_id, transaction_code, transaction_type, amount, description, payment_method, transaction_date, status) VALUES
    (gen_random_uuid(), v_family_b, v_fund_b, 'TXN-TRAN-001', 'INCOME', 10000000, 'Công đức xây dựng Họ Trần - Trần Văn Bảo', 'BANK_TRANSFER', '2026-08-15', 'POSTED');

  RAISE NOTICE '✅ Multi-Tenant Seed hoàn tất!';
  RAISE NOTICE '   Family A (Nguyễn): %', v_family_a;
  RAISE NOTICE '   Family B (Trần):   %', v_family_b;

END $$;
