# KIẾN TRÚC ĐIỀU HƯỚNG & PHÂN TẦNG ĐƯỜNG DẪN SAAS (ROUTING ARCHITECTURE)
# GIA PHẢ GIA TỘC SaaS — Dynamic Code-Splitting Architecture

---

## 🏛️ 1. PHÂN TẦNG 3 KHÔNG GIAN ĐIỀU HƯỚNG

Hệ thống phân chia rõ ràng 3 không gian điều hướng độc lập với **41 Tuyến Đường (Routes)** được tải động theo yêu cầu (*Dynamic Code-Splitting via `React.lazy`*):

```
                      INTERNET / USER
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    [Public Space]                  [Developer Guarded]
    /                               /dev/test-login (Guard: redirect in Prod)
    /pricing
    /help
    /login
    /register
    /invite/:code
            │ (Authenticate via Supabase Auth)
            ▼
    [Authenticated Workspace]
            │
    ┌───────┴───────────────────────────────────────┐
    ▼                                               ▼
[Family App Space (/app/*)]             [Super Admin Center (/admin/*)]
/app/dashboard                          /admin/beta (Command Center)
/app/genealogy (Interactive Tree)       /admin/users (User Accounts)
/app/members & /app/members/:id         /admin/payments (Bank Approvals)
/app/kinship (Kinship Calculator)       /admin/billing/config (Bank Config)
/app/calendar (Lịch Vạn Niên 2021-2036) /admin/plans (Service Plans)
/app/memorials (Quản Lý Ngày Giỗ)       /admin/subscriptions (Active Subscriptions)
/app/events & /app/events/:id           /admin/revenue (Revenue Analytics)
/app/finance (Sổ Quỹ & Kế Toán)        /admin/integrity (Watchdog Monitor)
/app/finance/ledger                     /admin/reconciliation (3-Way Rec)
/app/finance/income                     /admin/beta/evidence (Audit Evidence)
/app/finance/expenses                   /admin/beta/exit-audit (Exit Checklist)
/app/finance/contributions
/app/finance/honor-roll (Bảng Vàng)
/app/billing & /app/billing/usage
/app/billing/invoices & checkout
/app/support & /app/notifications
/app/family/settings & /app/audit
/app/settings/permissions & reminders
```

---

## ⚡ 2. CƠ CHẾ ROUTE CODE-SPLITTING & HIỆU NĂNG

Toàn bộ 41 route pages được import theo cơ chế tải động:
```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
```
- **Suspense Fallback**: Sử dụng `<PageSkeleton />` với animation di sản đồng bộ bảng màu Heritage.
- **Kích thước Bundle Tải Đầu**: Giảm từ **`1,147.06 kB`** xuống chỉ còn **`108.44 kB`** (sau gzip chỉ còn **`30.64 kB`** — **giảm ~90.5%**).
- **Phân tách Vendor**: 4 Chunks vendor độc lập (`vendor-react`, `vendor-supabase`, `vendor-query`, `vendor-icons`).

---

## 🛡️ 3. MA TRẬN BẢO VỆ ĐƯỜNG DẪN (SECURITY GUARDS)

| Không Gian | Guard Component | Ràng Buộc Truy Cập |
|:---|:---|:---|
| **Public** | Không | Cho phép khách truy cập, SEO tags tối ưu |
| **Family App** | `<ProtectedRoute>` + `<RoleGuard>` | Bắt buộc đăng nhập; các trang tài chính `/app/finance/*` và cài đặt `/app/family/settings` yêu cầu quyền `OWNER`, `ADMIN`, hoặc `TREASURER` |
| **Super Admin** | `<ProtectedRoute>` + `<RoleGuard requireSuperAdmin={true}>` | Chỉ tài khoản có `platformRole = 'SUPER_ADMIN'` mới được phép truy cập |
| **Dev Mode** | `useEffect` Production Check | Tự động redirect về `/login` nếu phát hiện kết nối CSDL Supabase chính thức |
