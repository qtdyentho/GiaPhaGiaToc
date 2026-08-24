# MA TRẬN VAI TRÒ & PHÂN QUYỀN TRUY CẬP (RBAC MATRIX)
# HERITAGE LEDGER — ROLE & PERMISSION RECONCILIATION

---

## 👥 1. CÁC VAI TRÒ HỆ THỐNG (SYSTEM ROLES)

| Vai Trò | Không Gian Làm Việc | Mô Tả & Nhiệm Vụ |
|:---|:---|:---|
| **SUPER_ADMIN** | PLATFORM SPACE (`/admin/*`) | Quản trị nền tảng SaaS, giám sát dòng họ, duyệt thanh toán, đối soát, kiểm tra sức khỏe hệ thống. |
| **OWNER / ADMIN** | FAMILY SPACE (`/app/*`) | Trưởng Tộc / Quản trị viên dòng họ: toàn quyền quản lý gia phả, thành viên, quỹ tài chính, cài đặt phân quyền. |
| **TREASURER** | FAMILY SPACE (`/app/*`) | Thủ quỹ / Kế toán dòng họ: ghi thu, đề xuất chi, lập đợt thu, quản lý sổ quỹ, bảng vàng công đức. |
| **GENEALOGY_ADMIN**| FAMILY SPACE (`/app/*`) | Ban phả hệ: thêm sửa thành viên, thiết lập quan hệ huyết thống, nhập xuất phả đồ. |
| **EVENT_MANAGER** | FAMILY SPACE (`/app/*`) | Ban tế lễ / sự kiện: quản lý ngày giỗ, đại lễ tộc, phân công chuẩn bị và nhắc nhở. |
| **MEMBER / VIEWER**| USER SPACE (`/app/*`) | Con cháu / Thành viên phổ thông: xem cây gia phả, tra cứu ngày giỗ, xem sự kiện, đóng góp công đức, hồ sơ cá nhân. |

---

## 🔐 2. BẢNG PHÂN QUYỀN CHI TIẾT THEO TÍNH NĂNG

| Tính Năng / Quyền Hạn | SUPER_ADMIN | OWNER / ADMIN | TREASURER | GENEALOGY_ADMIN | EVENT_MANAGER | MEMBER / VIEWER |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Quản trị nền tảng SaaS** (`/admin/*`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Duyệt hóa đơn / thanh toán SaaS** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Cài đặt dòng họ & Phân quyền** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Quản lý gói dịch vụ & Nâng cấp** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sổ quỹ & Bút toán hoàn tác** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Duyệt chi & Tạo đề xuất chi** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Lập đợt thu & Ghi nhận đóng góp** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Thêm / Sửa / Xóa thành viên gia phả**| ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Nhập dữ liệu gia phả từ tệp** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Tạo sự kiện & Đặt lịch nhắc giỗ** | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Xem Cây gia phả (Read-only)** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Xem Lịch giỗ & Sự kiện dòng họ** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Xem Bảng vàng công đức** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quản lý Hồ sơ cá nhân của mình** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
