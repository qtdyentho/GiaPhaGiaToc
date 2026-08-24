# BÁO CÁO KIỂM TOÁN KIẾN TRÚC ĐỊNH DANH & KHÔNG GIAN LÀM VIỆC
# IDENTITY, WORKSPACE & RBAC ARCHITECTURE AUDIT (PHASE 6.3)

---

## 🔍 1. HIỆN TRẠNG KIẾN TRÚC HIỆN TẠI (CURRENT STATE ANALYSIS)

### A. Luồng Xác Thực (Authentication Flow)
- **Tình trạng**: `AuthService.ts` đang trả về `mockProfile` tĩnh với ID `usr-0000-0001` (Nguyễn Văn Hoàng, Trưởng Tộc).
- **Vấn đề phát hiện**: Chưa có `AuthContext` hoặc `WorkspaceContext` toàn cục để lưu giữ trạng thái session người dùng thực tế, chưa tách biệt phiên làm việc giữa các vai trò khác nhau.

### B. Vai Trò Người Dùng (Current Roles)
- **Database Schema**:
  - `MembershipRole`: `OWNER`, `ADMIN`, `GENEALOGY_ADMIN`, `TREASURER`, `APPROVER`, `EVENT_MANAGER`, `MEMBER`, `VIEWER`.
  - `PlatformRole`: `SUPER_ADMIN` (quản trị nền tảng SaaS).
- **Vấn đề phát hiện**: Giao diện đang dùng chung một thanh điều hướng (Sidebar) duy nhất chứa cả mục người dùng, quản trị dòng họ và quản trị SaaS Super Admin.

### C. Cơ Chế Xác Định Dòng Họ Hiện Hành (Family Context Resolution)
- **Tình trạng**: `AppHeader.tsx` và nhiều trang đang import trực tiếp `mockFamily` (`fam-0000-0001` - Đại Tộc Nguyễn Văn) hoặc hard-code `familyId`.
- **Vấn đề phát hiện**: Chưa có `ActiveFamilyContext` để hỗ trợ chuyển đổi giữa nhiều dòng họ (Multi-family Switcher) và tự động cô lập dữ liệu theo `activeFamilyId`.

### D. Điều Hướng & Bảo Vệ Tuyến Đường (Route Guards & App Entry)
- **Tình trạng**: Tuyến đường `/app/*` và `/admin/*` chưa có các Route Guard bắt buộc (`ProtectedRoute`, `RoleGuard`, `FamilyMembershipGuard`, `PlatformAdminGuard`).
- **Vấn đề phát hiện**: Khi người dùng truy cập trực tiếp URL sâu như `/app/finance/ledger`, hệ thống render thẳng trang quản trị thay vì kiểm tra quyền hạn và dòng họ tương ứng.

---

## 🏛️ 2. MÔ HÌNH KHÔNG GIAN LÀM VIỆC ĐỀ XUẤT (3-TIER WORKSPACE ARCHITECTURE)

```
                              HERITAGE LEDGER
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
          1. USER SPACE       2. FAMILY SPACE     3. PLATFORM SPACE
                 │                   │                   │
         [Thành Viên Họ]      [Hội Đồng Gia Tộc]      [Super Admin]
                 │                   │                   │
         • Hồ sơ cá nhân      • Cây gia phả       • Quản trị nền tảng
         • Xem cây gia phả    • Quản lý phả hệ    • Quản trị dòng họ
         • Lịch & ngày giỗ    • Quản lý thu chi   • Duyệt thanh toán
         • Thông báo          • Sổ quỹ gia tộc    • Giám sát hệ thống
         • Đóng góp công đức  • Cài đặt phân quyền• Báo cáo doanh thu
```

---

## 🚦 3. LUỒNG ĐĂNG NHẬP & PHÂN GIẢI ĐIỂM ĐẾN (RESOLVE WORKSPACE FLOW)

```
[ĐĂNG NHẬP THÀNH CÔNG]
          │
          ▼
[TẢI HỒ SƠ NGƯỜI DÙNG (PROFILE)]
          │
          ▼
[XÁC ĐỊNH PLATFORM ROLE] ──(Là SUPER_ADMIN?)──► [CHUYỂN HƯỚNG /admin]
          │ (Không)
          ▼
[TẢI DANH SÁCH FAMILY MEMBERSHIPS]
          │
          ├── (Chưa thuộc dòng họ nào?) ──► [CHUYỂN HƯỚNG /onboarding/create-family]
          │
          └── (Có membership hợp lệ)
                   │
                   ▼
          [XÁC ĐỊNH ACTIVE FAMILY & MEMBERSHIP ROLE]
                   │
                   ├── (Role = OWNER / ADMIN / TREASURER / MANAGER) ──► [FAMILY SPACE: /app/dashboard]
                   │
                   └── (Role = MEMBER / VIEWER) ──► [USER SPACE: /app/dashboard (Chế độ xem Thành viên)]
```

---

## 📋 4. DANH SÁCH FILE THAY ĐỔI & BẢO TOÀN (FILE MUTATION SCOPE)

### A. File Tạo Mới & Tái Cấu Trúc (Will Create / Modify):
1. `src/contexts/AuthContext.tsx` — Quản lý trạng thái phiên, Profile, Memberships, Switch Family.
2. `src/components/auth/ProtectedRoute.tsx` — Route Guard chặn người dùng chưa đăng nhập.
3. `src/components/auth/RoleGuard.tsx` — Role Guard phân quyền theo vai trò (Family Admin vs Member vs Super Admin).
4. `src/components/layout/AppSidebar.tsx` — Phân chia 3 menu riêng biệt theo Workspace (`SUPER_ADMIN`, `FAMILY_ADMIN`, `FAMILY_MEMBER`).
5. `src/components/layout/AppHeader.tsx` — Bổ sung Family Switcher, hiển thị đúng Avatar, Tên, Dòng họ và Vai trò.
6. `src/App.tsx` — Cấu hình lại toàn bộ hệ thống Routing có Guard bảo vệ.

### B. File BẮT BUỘC BẢO TOÀN 100% (MUST NOT CHANGE):
- `DATABASE_SCHEMA.sql` / Supabase Schema & RLS Policies.
- `src/services/FundService.ts` / `src/services/billing/*` / `src/services/calendar/*`.
- 100% Bộ dữ liệu mẫu Family Alpha, Beta, Gamma (`src/services/mockData.ts`).
- Toàn bộ 8 test suites hiện có (172 / 172 tests).
