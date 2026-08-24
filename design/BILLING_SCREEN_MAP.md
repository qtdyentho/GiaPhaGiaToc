# BILLING & SUBSCRIPTION SCREEN MAP (MODULES 16 — 21)
# Project: Gia Phả Gia Tộc UX (Stitch Resource ID: `projects/14208187564231711793`)
# Design System: Heritage Ledger (`Be Vietnam Pro` | `#166534` | `#1E3A5F` | `#C49A3A` | `#F7F8F5`)

---

## 🏛️ 1. TỔNG QUAN PHÂN HỆ BILLING & QUẢN TRỊ DOANH THU

Hệ thống quản lý thuê bao, gói cước và thanh toán của **Gia Phả Gia Tộc** được thiết kế nguyên tử, đa tầng, liên kết trực tiếp giữa người dùng gia tộc (User Billing) và Ban Quản trị Hệ thống (SuperAdmin Billing).

### Bảng Định Dạng Dữ Liệu Chuẩn Bắt Buộc:
- **Ngôn ngữ**: 100% Tiếng Việt có dấu, phông chữ **Be Vietnam Pro**.
- **Tiền tệ**: Việt Nam Đồng (VND), định dạng hiển thị: `500.000 ₫`, `99.000 ₫`, `990.000 ₫`.
- **Ngày tháng**: Định dạng Việt Nam `DD/MM/YYYY` (Ví dụ: `24/08/2026`).
- **Bảng màu nhận diện**:
  * Primary Green: `#166534` (Các hành động tích cực, Nâng cấp, Thanh toán thành công, Active).
  * Secondary Navy: `#1E3A5F` (Sidebar quản trị, bảng so sánh tính năng, nhãn thông số).
  * Accent Gold: `#C49A3A` (Cảnh báo dùng thử sắp hết hạn, giao dịch đang chờ, mốc quan trọng).
  * Background Warm Tint: `#F7F8F5` (Màu giấy gia phả truyền thống dịu mắt).

---

## 🗺️ 2. BẢN ĐỒ CHI TIẾT CÁC MÀN HÌNH BILLING & ADMIN (21 SCREENS)

### A. User Billing & Checkout (Màn hình Phía Người Dùng Gia Tộc)

#### 1. Bảng giá dịch vụ (Pricing Page)
- **Stitch ID**: `bc5450f15b5c44bb8d09ed9b658f059b`
- **Route**: `/pricing` | **Device**: Desktop (2560x2484)
- **Chức năng**: Hiển thị 5 gói cước (`FREE`, `FAMILY`, `GIATOC_99K`, `DONGHO_199K`, `PREMIUM`), toggle thanh toán Tháng/Năm giảm giá 20%, nút chọn gói chuyển sang Checkout.
- **CSDL Liên quan**: `plans`, `plan_features` | **Rule**: `BR-BILL-001`

#### 2. So sánh gói dịch vụ (Plan Comparison)
- **Stitch ID**: `85c4027724f24e39aaaa3edb88d1cd17`
- **Route**: `/pricing/compare` | **Device**: Desktop (2560x2048)
- **Chức năng**: Ma trận so sánh chi tiết tính năng theo từng cột gói cước, số lượng thành viên, dung lượng lưu trữ, số nhánh phả hệ, quyền xuất báo cáo và hỗ trợ ưu tiên.
- **CSDL Liên quan**: `plans`, `plan_features` | **Rule**: `BR-BILL-001`

#### 3. Tổng quan Gói dịch vụ (Subscription Overview)
- **Stitch ID**: `44ff55aee7a5424b8cce14a87165605e`
- **Route**: `/app/billing` | **Device**: Desktop (2560x2048)
- **Chức năng**: Quản lý gói cước hiện tại của gia tộc, ngày bắt đầu, ngày gia hạn, trạng thái (`ACTIVE`, `TRIALING`, `PAST_DUE`), thẻ phương thức thanh toán mặc định.
- **CSDL Liên quan**: `subscriptions`, `plans`, `families` | **Rule**: `BR-BILL-001`, `BR-BILL-002`

#### 4. Sử dụng & Giới hạn (Usage & Limits)
- **Stitch ID**: `6f68600f7dfa4ce6a9f6da03ff37dd63`
- **Route**: `/app/billing/usage` | **Device**: Desktop (2560x2048)
- **Chức năng**: Theo dõi tiến độ sử dụng tài nguyên gia tộc (Thành viên: 128/300, Dung lượng: 1.8GB/5GB, Số sự kiện trong năm: Không giới hạn).
- **CSDL Liên quan**: `subscriptions`, `plan_features`, `members` | **Rule**: `BR-BILL-002`

#### 5. Thanh toán VietQR (Checkout & Payment)
- **Stitch ID**: `0c16d5813dc54a48be443cb90ae49a72`
- **Route**: `/app/billing/checkout` | **Device**: Desktop (2560x2120)
- **Chức năng**: Tạo đơn hàng, hiển thị mã QR động NAPAS 247 kèm số tiền chính xác và cú pháp chuyển khoản định danh tự động.
- **CSDL Liên quan**: `payments`, `invoices`, `subscriptions` | **Rule**: `BR-BILL-001`

#### 6. Thanh toán thành công (Payment Success)
- **Stitch ID**: `3fa0d9c01df840d99224892dd3747f52`
- **Route**: `/app/billing/success` | **Device**: Desktop (2560x2048)
- **Chức năng**: Xác nhận thanh toán thành công, hiển thị mã đơn `INV-2026-0824`, gói Gia Tộc, hạn dùng mới `24/08/2027`, nút Tải hóa đơn PDF và nút Vào Bảng điều khiển.
- **CSDL Liên quan**: `payments`, `subscriptions` | **Rule**: `BR-BILL-001`

#### 7. Thanh toán thất bại (Payment Failed)
- **Stitch ID**: `afbca5a8abb74518a2be62e5c468a5eb`
- **Route**: `/app/billing/failed` | **Device**: Desktop (2560x2052)
- **Chức năng**: Thông báo giao dịch chưa hoàn tất do quá hạn hoặc sai cú pháp/số tiền, hiển thị mã lỗi `TX-FAILED-9812`, nút Thử lại (#166534) và Hỗ trợ.
- **CSDL Liên quan**: `payments`, `invoices` | **Rule**: `BR-BILL-001`

#### 8. Đang kiểm tra thanh toán (Payment Pending)
- **Stitch ID**: `c4923829ce5b49be84ac3436415e4f78`
- **Route**: `/app/billing/pending` | **Device**: Desktop (2560x2048)
- **Chức năng**: Trạng thái chờ đối soát ngân hàng tự động, vòng xoay loading màu vàng hổ phách, tự động làm mới mỗi 10 giây.
- **CSDL Liên quan**: `payments`, `invoices` | **Rule**: `BR-BILL-001`

#### 9. Danh sách Hóa đơn (Invoice List)
- **Stitch ID**: `81f48e9ee70c4774bd0602ec13a9f35b`
- **Route**: `/app/billing/invoices` | **Device**: Desktop (2560x2048)
- **Chức năng**: Bảng lịch sử các hóa đơn đã xuất, ngày tạo, kỳ thanh toán, số tiền và nút tải file PDF chứng từ.
- **CSDL Liên quan**: `invoices`, `subscriptions` | **Rule**: `BR-BILL-001`

#### 10. Chi tiết Hóa đơn (Invoice Detail)
- **Stitch ID**: `4d75c338ee7b400abf77721ae0008db1`
- **Route**: `/app/billing/invoices/:id` | **Device**: Desktop (2560x2782)
- **Chức năng**: Bản thể hiện Hóa đơn điện tử chuẩn A4, con dấu số, thông tin mã số thuế bên bán và bên mua, mã tra cứu.
- **CSDL Liên quan**: `invoices`, `payments` | **Rule**: `BR-BILL-001`

---

### B. Trial & Feature Gating (Dùng Thử & Hạn Mức Tính Năng)

#### 11. Dùng thử sắp hết hạn (Trial Expiring)
- **Stitch ID**: `e017a12a6f4047da94bf5613a7da3006`
- **Route**: Hiển thị trên `/app/dashboard` | **Device**: Desktop (2560x2048)
- **Chức năng**: Banner màu vàng hổ phách cảnh báo còn 3 ngày dùng thử, đếm ngược thời gian, nút Nâng cấp ngay để duy trì dịch vụ liên tục.
- **CSDL Liên quan**: `subscriptions` | **Rule**: `BR-BILL-001`

#### 12. Dùng thử hết hạn (Trial Expired - Read Only)
- **Stitch ID**: `f25cd9c726854d26973eabbd5bb89b03`
- **Route**: Chế độ toàn hệ thống | **Device**: Desktop (2564x2048)
- **Chức năng**: Chuyển giao diện sang chế độ Chỉ đọc (Read-Only), vô hiệu hóa các nút Thêm thành viên, Thu chi quỹ, bảo tồn 100% dữ liệu gốc an toàn.
- **CSDL Liên quan**: `subscriptions` | **Rule**: `BR-BILL-002`

#### 13. Thông báo vượt giới hạn (Quota Warning)
- **Stitch ID**: `4af75d9fca244cbdb2e3c40a086b488a`
- **Route**: Modal cảnh báo trên trang thành viên | **Device**: Desktop
- **Chức năng**: Cảnh báo khi dung lượng hoặc số thành viên đạt $\ge 85\%$ mức cho phép của gói cước.
- **CSDL Liên quan**: `subscriptions`, `plan_features` | **Rule**: `BR-BILL-002`

#### 14. Thông báo giới hạn thành viên (Quota Exceeded)
- **Stitch ID**: `773c0cfcfc7141c7a67f088d224fe608`
- **Route**: Modal chặn mutation | **Device**: Desktop (2560x2048)
- **Chức năng**: Chặn hành động thêm thành viên khi đã chạm trần (30/30 ở Gói Free), hiển thị khuyến nghị nâng cấp lên Gói Gia Tộc 99.000 ₫/tháng.
- **CSDL Liên quan**: `subscriptions`, `plan_features`, `members` | **Rule**: `BR-BILL-002`

---

### C. Admin Billing & System Management (Quản Trị Doanh Thu Hệ Thống)

#### 15. Admin: Tổng quan Doanh thu (Billing Dashboard)
- **Stitch ID**: `a5464d4e7cf94f9b8bc5a408198d28b6`
- **Route**: `/admin/revenue` | **Device**: Desktop (2560x2192)
- **Chức năng**: Chỉ số kinh doanh cốt lõi: MRR, ARR, Doanh thu thực nhận, Tỷ lệ gia hạn, Tỷ lệ rời bỏ (Churn Rate), biểu đồ xu hướng 12 tháng.
- **CSDL Liên quan**: `payments`, `invoices`, `subscriptions` | **Rule**: `BR-BILL-001`

#### 16. Admin: Quản lý Gói cước (Plan Management)
- **Stitch ID**: `da4c4f58410d40caba0e511b3df3f61f`
- **Route**: `/admin/plans` | **Device**: Desktop (2560x2048)
- **Chức năng**: Quản lý danh sách 5 gói dịch vụ, giá tiền, số lượng gia tộc đăng ký, Drawer tạo mới và cấu hình tính năng/hạn mức từng gói.
- **CSDL Liên quan**: `plans`, `plan_features` | **Rule**: `BR-BILL-001`

#### 17. Admin: Quản lý Đăng ký (Subscription Management)
- **Stitch ID**: `3b981e4a61a8427cb3b13b9c676fd2f9`
- **Route**: `/admin/subscriptions` | **Device**: Desktop (2560x2048)
- **Chức năng**: Quản trị toàn bộ hợp đồng thuê bao của các dòng họ, bộ lọc trạng thái (`ACTIVE`, `TRIALING`, `PAST_DUE`, `EXPIRED`), chức năng kích hoạt thủ công.
- **CSDL Liên quan**: `subscriptions`, `families`, `plans` | **Rule**: `BR-BILL-001`, `BR-BILL-002`

#### 18. Admin: Quản lý Giao dịch (Payment Management)
- **Stitch ID**: `cd9b4df4a68e496392368a3b8c112380`
- **Route**: `/admin/transactions` | **Device**: Desktop (2560x2048)
- **Chức năng**: Theo dõi luồng tiền vào qua Webhook VietQR, ngân hàng thụ hưởng, mã tham chiếu ngân hàng, khớp lệnh giao dịch tự động.
- **CSDL Liên quan**: `payments`, `invoices` | **Rule**: `BR-BILL-001`

#### 19. Admin: Quản lý Gói dùng thử (Trial Management)
- **Stitch ID**: `8ccc9a47371e44ecac72fb34fc3b4d5a`
- **Route**: `/admin/trials` | **Device**: Desktop
- **Chức năng**: Danh sách các gia tộc đang dùng thử, số ngày còn lại, nút gia hạn dùng thử (Extend Trial thêm 7/14 ngày).
- **CSDL Liên quan**: `subscriptions`, `families` | **Rule**: `BR-BILL-001`

#### 20. Admin: Quản lý Hoàn tiền (Refund Management)
- **Stitch ID**: `763955656be041c584e4d06883b0cadd`
- **Route**: `/admin/refunds` | **Device**: Desktop (2560x2048)
- **Chức năng**: Quản lý các yêu cầu hoàn tiền do chuyển nhầm/hủy gói, Modal xác nhận chuyển khoản ngân hàng hoàn tiền, cập nhật trạng thái `REFUNDED`.
- **CSDL Liên quan**: `payments`, `audit_logs` | **Rule**: `BR-AUDIT-001`

#### 21. Admin: Nhật ký đối soát (Billing & Reconciliation Audit)
- **Stitch ID**: `c0964505c2fa4d7e930cd1b11968d424`
- **Route**: `/admin/reconciliation` | **Device**: Desktop (2560x2048)
- **Chức năng**: Đối soát tự động giữa sao kê ngân hàng và hóa đơn phát sinh, phát hiện lệch tiền, xử lý giao dịch treo.
- **CSDL Liên quan**: `payments`, `audit_logs` | **Rule**: `BR-AUDIT-001`
