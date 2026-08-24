-- ============================================================
-- SEED DATA: INTERNAL ALPHA TEST DATASET
-- DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
-- ============================================================
-- Bộ dữ liệu thử nghiệm nội bộ độc lập (Internal Alpha)
-- KHÔNG ĐƯA VÀO PRODUCTION DATABASE
-- ============================================================

-- ------------------------------------------------------------
-- 1. TEST USERS & PROFILES (3 Users đại diện cho 3 Gia Tộc)
-- ------------------------------------------------------------
INSERT INTO profiles (id, email, full_name, phone, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'truongtoc.alpha@giapha.vn', 'Nguyễn Văn Hoàng (Alpha Owner)', '0988111222', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('22222222-2222-2222-2222-222222222222', 'truongtoc.beta@giapha.vn', 'Trần Bá Hùng (Beta Owner)', '0988222333', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('33333333-3333-3333-3333-333333333333', 'truongtoc.gamma@giapha.vn', 'Lê Quang Liêm (Gamma Owner)', '0988333444', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- ------------------------------------------------------------
-- 2. FAMILIES (3 Gia Tộc Test)
-- ------------------------------------------------------------
INSERT INTO families (id, name, code, origin_province, origin_district, origin_commune, ancestral_hall_address, description, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Đại Tộc Nguyễn Văn (Family Alpha)', 'ALPHA-NGUYEN', 'Hà Nội', 'Hoàng Mai', 'Định Công', 'Số 18 Ngõ 42 Tổ 5, Định Công, Hoàng Mai, Hà Nội', 'Dòng họ Nguyễn Văn đời thứ 5, khởi phát từ Thăng Long Hà Nội.', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gia Tộc Trần Bá (Family Beta)', 'BETA-TRAN', 'Bắc Ninh', 'Thuận Thành', 'Song Hồ', 'Thôn Đông Khê, Xã Song Hồ, Huyện Thuận Thành, Tỉnh Bắc Ninh', 'Dòng họ Trần Bá danh gia vọng tộc Kinh Bắc, 300 thành viên.', '22222222-2222-2222-2222-222222222222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Dòng Họ Lê Quang (Family Gamma)', 'GAMMA-LE', 'Thanh Hóa', 'Hoằng Hóa', 'Hoằng Lộc', 'Xã Hoằng Lộc, Huyện Hoằng Hóa, Tỉnh Thanh Hóa', 'Đại tộc Lê Quang vùng đất học xứ Thanh, 500 thành viên.', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 3. MEMBERSHIPS & RBAC (Phân quyền 3 Gia Tộc)
-- ------------------------------------------------------------
INSERT INTO family_memberships (family_id, user_id, role, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'OWNER', 'ACTIVE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'OWNER', 'ACTIVE'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'OWNER', 'ACTIVE')
ON CONFLICT (family_id, user_id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. GENERATIONS & BRANCHES (5 Thế Hệ & 3 Chi Phái / Family)
-- ------------------------------------------------------------
-- Family Alpha:
INSERT INTO generations (id, family_id, generation_number, name) VALUES
('gen-a-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'Đời thứ 1 (Thủy Tổ)'),
('gen-a-2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'Đời thứ 2 (Cao Tổ)'),
('gen-a-3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 'Đời thứ 3 (Tằng Tổ)'),
('gen-a-4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Đời thứ 4 (Tổ Phụ)'),
('gen-a-5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Đời thứ 5 (Hiện Tại)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO branches (id, family_id, name, description) VALUES
('br-a-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Chi Trưởng (Chi 1)', 'Chi Trưởng Định Công'),
('br-a-2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Chi Hai (Chi 2)', 'Chi Hai Giáp Bát'),
('br-a-3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Chi Ba (Chi 3)', 'Chi Ba Thanh Trì')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 5. MEMBERS & RELATIONSHIPS (Dữ liệu thành viên mẫu)
-- ------------------------------------------------------------
-- Đời 1 (Thủy Tổ)
INSERT INTO members (id, family_id, branch_id, generation_id, first_name, last_name, full_name, gender, life_status, birth_solar_year, death_lunar_day, death_lunar_month, death_lunar_year, burial_place, bio) VALUES
('mb-a-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-1', 'gen-a-1', 'Phúc', 'Nguyễn Văn', 'Cụ Nguyễn Văn Phúc', 'MALE', 'DECEASED', 1885, 15, 1, 1952, 'Khu lăng mộ Tổ họ Nguyễn, Định Công, Hà Nội', 'Cụ Thủy Tổ khai sơn lập họ, có công khai hoang lập ấp vùng Định Công.'),
('mb-a-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-1', 'gen-a-1', 'Mai', 'Trần Thị', 'Cụ Bà Trần Thị Mai', 'FEMALE', 'DECEASED', 1888, 10, 8, 1958, 'An táng cạnh cụ ông tại Lăng mộ Tổ', 'Chính thất Cụ Thủy Tổ.')
ON CONFLICT (id) DO NOTHING;

-- Đời 2 (3 người con trai lập 3 Chi)
INSERT INTO members (id, family_id, branch_id, generation_id, first_name, last_name, full_name, gender, life_status, birth_solar_year, death_lunar_day, death_lunar_month, death_lunar_year) VALUES
('mb-a-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-1', 'gen-a-2', 'Khang', 'Nguyễn Văn', 'Cụ Nguyễn Văn Khang (Trưởng Chi 1)', 'MALE', 'DECEASED', 1910, 18, 5, 1980),
('mb-a-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-2', 'gen-a-2', 'Ninh', 'Nguyễn Văn', 'Cụ Nguyễn Văn Ninh (Trưởng Chi 2)', 'MALE', 'DECEASED', 1913, 22, 11, 1985),
('mb-a-005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-3', 'gen-a-2', 'Thịnh', 'Nguyễn Văn', 'Cụ Nguyễn Văn Thịnh (Trưởng Chi 3)', 'MALE', 'DECEASED', 1916, 5, 4, 1990)
ON CONFLICT (id) DO NOTHING;

-- Đời 3, 4, 5 (Mẫu các đời sau)
INSERT INTO members (id, family_id, branch_id, generation_id, first_name, last_name, full_name, gender, life_status, birth_solar_year, is_root) VALUES
('mb-a-006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-1', 'gen-a-3', 'Trọng', 'Nguyễn Văn', 'Ông Nguyễn Văn Trọng', 'MALE', 'DECEASED', 1940, false),
('mb-a-007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-1', 'gen-a-4', 'Hoàng', 'Nguyễn Văn', 'Nguyễn Văn Hoàng (Trưởng Họ)', 'MALE', 'ALIVE', 1975, false),
('mb-a-008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'br-a-1', 'gen-a-5', 'Nam', 'Nguyễn Văn', 'Nguyễn Văn Nam (Cháu đích tôn)', 'MALE', 'ALIVE', 2005, false)
ON CONFLICT (id) DO NOTHING;

-- Thiết lập quan hệ trực hệ
INSERT INTO member_relationships (family_id, member_id, related_member_id, relationship_type) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-001', 'mb-a-002', 'SPOUSE'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-001', 'mb-a-003', 'CHILD'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-001', 'mb-a-004', 'CHILD'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-001', 'mb-a-005', 'CHILD'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-003', 'mb-a-006', 'CHILD'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-006', 'mb-a-007', 'CHILD'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-007', 'mb-a-008', 'CHILD')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 6. 20 NGÀY GIỖ TEST (Đầy đủ trường hợp: Âm lịch, Nhuận, Cuối tháng)
-- ------------------------------------------------------------
INSERT INTO memorial_dates (family_id, member_id, title, lunar_day, lunar_month, is_leap_month, solar_date_approx, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-001', 'Giỗ Cụ Thủy Tổ Nguyễn Văn Phúc', 15, 1, false, '2026-03-03', 'Đại lễ Giỗ Tổ thường niên, toàn bộ con cháu 3 chi tề tựu tại Từ đường.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-002', 'Giỗ Cụ Bà Trần Thị Mai', 10, 8, false, '2026-09-20', 'Giỗ Tổ Mẫu tại nhà thờ họ.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-003', 'Giỗ Cụ Nguyễn Văn Khang (Chi 1)', 18, 5, false, '2026-07-02', 'Giỗ Chi Trưởng.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-004', 'Giỗ Cụ Nguyễn Văn Ninh (Chi 2)', 22, 11, false, '2026-12-30', 'Giỗ Chi Hai.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-005', 'Giỗ Cụ Nguyễn Văn Thịnh (Chi 3)', 5, 4, false, '2026-05-20', 'Giỗ Chi Ba.'),
-- Test trường hợp tháng nhuận (Leap month)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-006', 'Giỗ Ông Nguyễn Văn Trọng (Tháng Nhuận)', 15, 6, true, '2026-08-15', 'Trường hợp kiểm thử ngày giỗ rơi vào tháng 6 nhuận âm lịch.'),
-- Test trường hợp cuối tháng 30 âm lịch
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mb-a-003', 'Giỗ Tiền Hiền Cụ Trọng (Ngày 30 Tết Âm)', 30, 12, false, '2027-02-05', 'Giỗ tất niên ngày 30 tháng Chạp.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 7. SỰ KIỆN HỌ TỘC (Events)
-- ------------------------------------------------------------
INSERT INTO events (family_id, title, event_type, event_scope, lunar_day, lunar_month, solar_date, solar_time, location, estimated_budget, description) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Đại Lễ Giỗ Tổ Họ Nguyễn Văn Năm 2026', 'CLAN_ANCESTRAL_DAY', 'FAMILY', 15, 1, '2026-03-03', '08:30:00', 'Nhà thờ họ Nguyễn, Định Công, Hà Nội', 15000000, 'Tổ chức tế lễ cổ truyền, tuyên dương khuyến học và họp mặt toàn gia tộc.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hội Nghị Họp Họ & Báo Cáo Tài Chính Đầu Xuân', 'FAMILY_MEETING', 'FAMILY', 16, 1, '2026-03-04', '09:00:00', 'Từ Đường dòng họ', 3000000, 'Báo cáo thu chi sổ quỹ năm cũ, phát động quỹ khuyến học năm mới.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Khánh Thành Công Trình Tu Sửa Cổng Từ Đường', 'ANCESTRAL_HALL_RENOVATION', 'FAMILY', 10, 8, '2026-09-20', '10:00:00', 'Khuôn viên nhà thờ họ', 45000000, 'Nghi lễ tạ ơn tiền nhân và khánh thành cổng tam quan mới.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 8. TÀI CHÍNH & SỔ QUỸ (3 Quỹ, Đóng góp, Bút toán Đảo ngược)
-- ------------------------------------------------------------
INSERT INTO funds (id, family_id, name, opening_balance, current_balance, status) VALUES
('fund-a-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quỹ Hoạt Động Thường Niên', 10000000, 15000000, 'ACTIVE'),
('fund-a-2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quỹ Khuyến Học - Khuyến Tài', 5000000, 8500000, 'ACTIVE'),
('fund-a-3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quỹ Tu Bổ & Tôn Tạo Từ Đường', 20000000, 32000000, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Giao dịch thu quỹ POSTED
INSERT INTO financial_transactions (id, family_id, fund_id, transaction_code, transaction_type, amount, payment_method, transaction_date, description, status) VALUES
('tx-a-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fund-a-1', 'THU-20260815-1001', 'INCOME', 500000, 'VIETQR', '2026-08-15', 'Nguyễn Văn Hoàng nộp quỹ thường niên 2026', 'POSTED'),
('tx-a-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fund-a-2', 'THU-20260818-1002', 'INCOME', 1000000, 'BANK_TRANSFER', '2026-08-18', 'Tài trợ quỹ khuyến học cháu Nam đạt giải quốc gia', 'POSTED')
ON CONFLICT (id) DO NOTHING;

-- Giao dịch Reversal đảo ngược thử nghiệm
INSERT INTO financial_transactions (id, family_id, fund_id, transaction_code, transaction_type, amount, payment_method, transaction_date, description, status, reference_transaction_id) VALUES
('tx-a-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fund-a-1', 'REV-THU-20260815-1001', 'REVERSAL', 500000, 'VIETQR', '2026-08-16', 'Đảo ngược giao dịch ghi nhầm số tiền', 'POSTED', 'tx-a-001')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 9. THUÊ BAO & BILLING TEST (3 Trạng thái khác nhau)
-- ------------------------------------------------------------
-- Family Alpha: Gói GIA_TOC (Active 86/300 TV)
INSERT INTO subscriptions (id, family_id, plan_id, plan_version_id, billing_cycle, current_period_start, current_period_end, status) VALUES
('sub-alpha', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'YEARLY', '2026-01-01', '2027-01-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Family Beta: Gói GIA_TOC chạm trần Quota (300/300 TV)
INSERT INTO subscriptions (id, family_id, plan_id, plan_version_id, billing_cycle, current_period_start, current_period_end, status) VALUES
('sub-beta', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'YEARLY', '2026-01-01', '2027-01-01', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Family Gamma: Gói TRIAL hoặc READ_ONLY (500 TV)
INSERT INTO subscriptions (id, family_id, plan_id, plan_version_id, billing_cycle, current_period_start, current_period_end, status) VALUES
('sub-gamma', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'YEARLY', '2026-01-01', '2026-02-01', 'READ_ONLY')
ON CONFLICT (id) DO NOTHING;

-- Hóa đơn thanh toán test
INSERT INTO invoices (id, family_id, subscription_id, invoice_number, subtotal_amount, total_amount, status, due_date) VALUES
('inv-a-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sub-alpha', 'GP-INV20260101-0001', 990000, 990000, 'PAID', '2026-01-15')
ON CONFLICT (id) DO NOTHING;
