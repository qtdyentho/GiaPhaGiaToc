# 🧪 KẾ HOẠCH KIỂM THỬ TOÀN DIỆN E2E (E2E TEST PLAN & SCENARIOS)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Ma Trận 22 Kịch Bản Kiểm Thử Toàn Trình (22 E2E Scenarios)

| Mã Test | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Điều Kiện Đạt (Pass Criteria) |
|:---|:---|:---|:---|
| **TEST-001** | **User Registration** | Đăng ký tài khoản người dùng mới | Tạo bản ghi trong `profiles`, mật khẩu băm bcrypt |
| **TEST-002** | **User Login** | Đăng nhập tài khoản & nhận JWT token | Trả về JWT hợp lệ, điều hướng tới `/app/dashboard` |
| **TEST-003** | **Create Family Onboarding** | Khởi tạo gia tộc mới & gán vai trò OWNER | Tạo bản ghi `families`, `family_memberships` (role: OWNER), kích hoạt 14 ngày Trial |
| **TEST-004** | **Add Member** | Thêm thành viên vào danh bạ dòng họ | Tạo bản ghi `members`, cập nhật `usage_counters.current_value` |
| **TEST-005** | **Create Relationship** | Thiết lập quan hệ cha-con, vợ-chồng | Tạo bản ghi `member_relationships` đúng trực hệ |
| **TEST-006** | **Genealogy Tree Render** | Dựng cây gia phả D3/SVG đa thế hệ | Hiển thị đầy đủ các nút thế hệ, hỗ trợ Zoom/Pan và lọc chi phái |
| **TEST-007** | **Create Memorial Date** | Thiết lập ngày giỗ tiền nhân theo âm lịch | Tạo bản ghi `memorial_dates` kèm ngày/tháng âm lịch |
| **TEST-008** | **Lunar Calculation Engine** | Chuyển đổi Dương $\leftrightarrow$ Âm lịch Hồ Ngọc Đức | Khớp 100% tiết khí, tháng nhuận và Can Chi năm |
| **TEST-009** | **Create Clan Event** | Tạo sự kiện Giỗ tổ họ hoặc Họp họ | Tạo bản ghi `events` kèm dự toán ngân sách họ tộc |
| **TEST-010** | **Create Income Assessment** | Lập đợt thu quỹ định mức cho các thành viên | Tạo các bản ghi `income_assessments` (`status = PENDING`) |
| **TEST-011** | **Record Payment** | Ghi nhận thực thu tiền quỹ vào tài khoản | Tạo `financial_transactions` (`POSTED`), cập nhật `funds.current_balance` nguyên tử |
| **TEST-012** | **Ledger Invariance** | Sổ quỹ kế toán kép bất biến | Không có quyền DELETE/UPDATE bản ghi `POSTED` |
| **TEST-013** | **Reverse Transaction** | Đảo ngược bút toán thu/chi sai sót | Tạo bản ghi `REVERSAL` đối ứng, hoàn trả số dư quỹ nguyên tử |
| **TEST-014** | **Trial Activation** | Kích hoạt thời gian dùng thử 14 ngày | Tạo bản ghi `trial_periods`, trạng thái thuê bao `TRIALING` |
| **TEST-015** | **Plan Upgrade** | Nâng cấp từ gói Family lên Gia Tộc | Tạo hóa đơn chênh lệch, cập nhật `subscriptions.plan_id` |
| **TEST-016** | **VietQR Dynamic Payment** | Tạo mã QR động Napas 247 và đối soát Webhook | Khớp đúng số tiền và mã hóa đơn, kích hoạt gói tự động |
| **TEST-017** | **Invoice Generation** | Xuất hóa đơn thu phí điện tử chuẩn A4 | Tạo `invoices` & `invoice_items` kèm thuế/chiết khấu |
| **TEST-018** | **Quota Limit Enforcement** | Kiểm tra chặn thêm thành viên khi chạm trần | Chặn thêm thành viên thứ 31 trên gói Free (30/30) |
| **TEST-019** | **Subscription Expiry** | Xử lý khi gói dịch vụ hết hạn hợp đồng | Chuyển trạng thái `PAST_DUE` $\rightarrow$ `READ_ONLY` |
| **TEST-020** | **Read-Only Preservation** | Bảo toàn dữ liệu 100% khi hết hạn | Dữ liệu gia phả nguyên vẹn, chỉ khóa tính năng sửa/thêm |
| **TEST-021** | **Admin Revenue Metrics** | Báo cáo quản trị MRR, ARR, Churn rate | Tính toán chính xác doanh thu định kỳ từ các hóa đơn PAID |
| **TEST-022** | **Multi-Tenant Security** | Cách ly dữ liệu giữa Gia tộc A và Gia tộc B | Gia tộc A hoàn toàn không đọc/sửa được dữ liệu Gia tộc B qua RLS |

---

## 2. Kết Quả Thực Thi Bộ Test Script (`npm test`)

- **Thuật toán Âm - Dương Lịch**: `PASS` (3/3 test cases)
- **Tính Bất Biến Sổ Quỹ & Đảo Bút Toán**: `PASS` (3/3 test cases)
- **Kiểm Soát Hạn Mức Quota & Read-Only**: `PASS` (3/3 test cases)
