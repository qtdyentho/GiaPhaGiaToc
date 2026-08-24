# KIẾN TRÚC ĐIỀU HƯỚNG & PHÂN TẦNG ĐƯỜNG DẪN SAAS (ROUTING ARCHITECTURE)
# GIA PHẢ GIA TỘC SaaS

---

## 🏛️ 1. PHÂN TẦNG 3 VÙNG ĐIỀU HƯỚNG

Hệ thống phân chia rõ ràng 3 không gian điều hướng độc lập, đảm bảo bảo mật và trải nghiệm người dùng:

```
                      INTERNET / USER
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    [Public Area]                  [Developer Test]
    /                               /dev/test-login (Dev only)
    /pricing
    /help
    /login
    /register
    /invite/:code
            │ (Authenticate)
            ▼
    [Authenticated User]
            │
    ┌───────┴───────────────────────┐
    ▼                               ▼
[Family App]                [Admin Center]
/app                        /admin
/app/genealogy              /admin/payments
/app/members                /admin/billing/config
/app/calendar               /admin/beta
/app/memorials              /admin/integrity
/app/funds                  /admin/reconciliation
/app/billing                /admin/subscriptions
```

---

## 🛡️ 2. QUY TẮC BẢO VỆ ĐƯỜNG DẪN

1. **Khách vãng lai (Anonymous / Unauthenticated)**:
   - Truy cập `/` $\rightarrow$ Hiển thị Landing Page giới thiệu sản phẩm.
   - Truy cập `/app` hoặc `/app/*` $\rightarrow$ Chuyển hướng sang `/login`.
   - Truy cập `/admin` hoặc `/admin/*` $\rightarrow$ Chuyển hướng sang `/login` hoặc trả về 403.

2. **Thành viên dòng họ (Family User)**:
   - Truy cập `/app` $\rightarrow$ Mở Bảng điều khiển của dòng họ mình thuộc về.
   - Tuyệt đối không hardcode mở dòng họ Alpha hay tự động đăng nhập tài khoản test trong môi trường production.
   - Truy cập `/admin` $\rightarrow$ Bị chặn quyền truy cập (Forbidden 403).

3. **Ban Quản Trị (Super Admin / Billing Admin)**:
   - Truy cập `/admin` $\rightarrow$ Mở Trung tâm Quản trị và Duyệt thanh toán.

4. **Bảng Đăng Nhập Dev (Dev Test Login Panel)**:
   - Đường dẫn `/dev/test-login` chỉ được cung cấp khi `import.meta.env.DEV` hoặc `VITE_ENABLE_TEST_MODE = true`.
   - Bị loại bỏ hoàn toàn trong bản build Production thực tế.
