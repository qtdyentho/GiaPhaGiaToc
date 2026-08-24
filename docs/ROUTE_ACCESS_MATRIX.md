# MA TRẬN ĐIỀU HƯỚNG & BẢO VỆ TUYẾN ĐƯỜNG (ROUTE ACCESS MATRIX)
# HERITAGE LEDGER — WORKSPACE ROUTING ARCHITECTURE

---

## 🛣️ 1. PHÂN LOẠI TUYẾN ĐƯỜNG (ROUTE CATEGORIES)

### A. Tuyến Đường Công Cộng (Public Routes)
- `/` — Trang giới thiệu nền tảng (Landing Page).
- `/pricing` — Bảng giá gói dịch vụ.
- `/help` — Trung tâm trợ giúp.
- `/login` — Đăng nhập tài khoản.
- `/register` — Đăng ký tài khoản mới.
- `/invite/:code` — Tiếp nhận lời mời gia nhập dòng họ.

### B. Tuyến Đường Khởi Tạo / Chờ Gia Nhập (Onboarding Routes)
- `/onboarding/create-family` — Dành cho tài khoản mới chưa thuộc dòng họ nào tạo lập gia tộc mới.

### C. Tuyến Đường Không Gian Dòng Họ (Family Space Routes — `/app/*`)
- `/app/dashboard` — Tổng quan dòng họ (Hiển thị phù hợp theo Role).
- `/app/genealogy` — Cây gia phả (Family Admin có nút thêm/sửa, Member xem trực quan).
- `/app/members` — Danh sách thành viên dòng họ.
- `/app/members/:id` — Hồ sơ chi tiết thành viên.
- `/app/calendar` — Lịch gia tộc (Âm / Dương).
- `/app/memorials` — Ngày giỗ tổ tiên & thân nhân.
- `/app/events` — Sự kiện & Đại lễ dòng họ.
- `/app/events/:id` — Chi tiết sự kiện & quyết toán.
- `/app/finance` — **[Yêu cầu Role: OWNER, ADMIN, TREASURER]** Trung tâm tài chính dòng họ.
- `/app/finance/ledger` — **[Yêu cầu Role: OWNER, ADMIN, TREASURER]** Sổ quỹ gia tộc & Hoàn tác giao dịch.
- `/app/finance/income` — **[Yêu cầu Role: OWNER, ADMIN, TREASURER]** Khoản thu định mức.
- `/app/finance/expenses` — **[Yêu cầu Role: OWNER, ADMIN, TREASURER, APPROVER]** Khoản chi & Duyệt chi.
- `/app/finance/contributions` — Đóng góp & Công đức (Mọi thành viên đều có thể xem và đóng góp).
- `/app/finance/honor-roll` — Bảng vàng công đức (Công khai cho toàn bộ thành viên).
- `/app/billing/*` — **[Yêu cầu Role: OWNER, ADMIN]** Quản lý gói dịch vụ dòng họ.
- `/app/family/settings` — **[Yêu cầu Role: OWNER, ADMIN]** Cài đặt dòng họ & Phân quyền.

### D. Tuyến Đường Quản Trị Nền Tảng (Platform Space Routes — `/admin/*`)
- **Yêu cầu bắt buộc**: `PlatformRole === 'SUPER_ADMIN'`.
- `/admin/beta` — Trung tâm kiểm soát vận hành.
- `/admin/payments` — Duyệt xác nhận chuyển khoản ngân hàng.
- `/admin/billing/config` — Cấu hình tài khoản nhận tiền.
- `/admin/revenue` — Báo cáo tài chính doanh thu nền tảng.
- `/admin/integrity` — Giám sát tính toàn vẹn dữ liệu đa gia tộc.
- `/admin/reconciliation` — Đối soát 3 bên dòng tiền.

---

## 🚫 2. CƠ CHẾ XỬ LÝ TRUY CẬP TRÁI PHÉP (UNAUTHORIZED BEHAVIOR)

1. **Chưa đăng nhập truy cập `/app/*` hoặc `/admin/*`**:
   $\rightarrow$ Tự động chuyển hướng về `/login?redirect=...`.
2. **Thành viên phổ thông (`MEMBER`) truy cập `/app/finance/ledger` hoặc `/app/finance/expenses`**:
   $\rightarrow$ Chuyển hướng về `/app/dashboard` kèm thông báo *"Bạn không có quyền truy cập trang quản trị tài chính dòng họ"*.
3. **Người dùng thông thường truy cập `/admin/*`**:
   $\rightarrow$ Hiển thị màn hình 403 Forbidden / Access Denied.
