# ĐỒNG BỘ KIẾN TRÚC GIAO DIỆN KHUNG (APP SHELL RECONCILIATION)
# HERITAGE LEDGER — 3-WORKSPACE APP SHELL DESIGN

---

## 🏛️ 1. THIẾT KẾ SIDEBAR THEO WORKSPACE (ROLE-BASED SIDEBARS)

### A. Sidebar Dành Cho Quản Trị Viên Dòng Họ (Family Admin / Owner):
- **Header**: Tên Dòng họ hiện tại + Huy hiệu `Quản Trị Dòng Họ`.
- **Nhóm 1: TỔNG QUAN**:
  - `Tổng Quan` (`/app/dashboard`)
- **Nhóm 2: PHẢ HỆ & THÀNH VIÊN**:
  - `Cây Gia Phả` (`/app/genealogy`)
  - `Thành Viên Dòng Họ` (`/app/members`)
- **Nhóm 3: LỊCH & TƯỞNG NIỆM**:
  - `Lịch Gia Tộc` (`/app/calendar`)
  - `Ngày Giỗ Tổ Tiên` (`/app/memorials`)
  - `Sự Kiện & Đại Lễ` (`/app/events`)
  - `Cấu Hình Nhắc Lễ` (`/app/reminders`)
- **Nhóm 4: TÀI CHÍNH & SỔ QUỸ**:
  - `Tổng Quan Tài Chính` (`/app/finance`)
  - `Sổ Quỹ Gia Tộc` (`/app/finance/ledger`)
  - `Khoản Thu Định Mức` (`/app/finance/income`)
  - `Khoản Chi & Duyệt Chi` (`/app/finance/expenses`)
  - `Đóng Góp & Công Đức` (`/app/finance/contributions`)
  - `Bảng Vàng Công Đức` (`/app/finance/honor-roll`)
- **Nhóm 5: GÓI DỊCH VỤ & CÀI ĐẶT**:
  - `Gói Dịch Vụ Gia Tộc` (`/app/billing`)
  - `Hạn Mức Sử Dụng` (`/app/billing/usage`)
  - `Lịch Sử Hóa Đơn` (`/app/billing/invoices`)
  - `Cài Đặt Dòng Họ` (`/app/family/settings`)
  - `Hỗ Trợ & Hướng Dẫn` (`/app/support`)

---

### B. Sidebar Dành Cho Thành Viên Phổ Thông (Family Member):
- **Header**: Tên Dòng họ hiện tại + Huy hiệu `Thành Viên`.
- **Nhóm 1: TRANG CHỦ**:
  - `Trang Chủ Dòng Họ` (`/app/dashboard`)
- **Nhóm 2: GIA ĐÌNH & PHẢ HỆ**:
  - `Cây Gia Phả` (`/app/genealogy` - Read-only view)
  - `Danh Sách Bà Con` (`/app/members`)
- **Nhóm 3: LỊCH TỘC & GIỖ TẾ**:
  - `Lịch Gia Tộc` (`/app/calendar`)
  - `Ngày Giỗ Thân Nhân` (`/app/memorials`)
  - `Sự Kiện & Đại Lễ` (`/app/events`)
- **Nhóm 4: CÔNG ĐỨC & TRI ÂN**:
  - `Đóng Góp Công Đức` (`/app/finance/contributions`)
  - `Bảng Vàng Công Đức` (`/app/finance/honor-roll`)
- **Nhóm 5: CÁ NHÂN**:
  - `Hồ Sơ Của Tôi` (`/app/members/me`)
  - `Hỗ Trợ & Hướng Dẫn` (`/app/support`)

---

### C. Sidebar Dành Cho Quản Trị Nền Tảng (Super Admin):
- **Header**: `Heritage Ledger SaaS` + Huy hiệu `Quản Trị Nền Tảng`.
- **Nhóm 1: TỔNG QUAN NỀN TẢNG**:
  - `Bảng Chỉ Huy Vận Hành` (`/admin/beta`)
  - `Báo Cáo Doanh Thu` (`/admin/revenue`)
- **Nhóm 2: THANH TOÁN & GÓI CƯỚC**:
  - `Duyệt Chuyển Khoản Ngân Hàng` (`/admin/payments`)
  - `Cấu Hình Tài Khoản Nhận` (`/admin/billing/config`)
  - `Quản Trị Gói Dịch Vụ` (`/admin/plans`)
  - `Danh Sách Thuê Bao` (`/admin/subscriptions`)
- **Nhóm 3: AN TOÀN & GIÁM SÁT DỮ LIỆU**:
  - `Giám Sát Toàn Vẹn Đa Gia Tộc` (`/admin/integrity`)
  - `Đối Soát Dòng Tiền 3 Bên` (`/admin/reconciliation`)
  - `Bằng Chứng Triển Khai` (`/admin/beta/evidence`)

---

## 👤 2. THIẾT KẾ HEADER & FAMILY SWITCHER

Trong `AppHeader.tsx`:
1. **Bên Trái**:
   - Nếu User có $> 1$ Dòng họ: Hiển thị Dropdown **Family Switcher** cho phép chuyển đổi tức thì giữa các gia tộc trực thuộc.
   - Nếu User chỉ có $1$ Dòng họ: Hiển thị Huy hiệu kèm Tên dòng họ trang trọng.
   - Widget Ngày Âm Lịch chuẩn thiên văn.
2. **Bên Phải**:
   - Thanh tìm kiếm nhanh.
   - Chuông thông báo sự kiện / ngày giỗ.
   - Khối tài khoản người dùng:
     - Avatar thật
     - Tên đầy đủ
     - Nhãn vai trò rõ ràng: *"Quản trị viên dòng họ"* hoặc *"Thành viên"* hoặc *"Quản trị nền tảng"*.
