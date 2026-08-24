# BỐI CẢNH HỆ THỐNG TOÀN DIỆN (SYSTEM CONTEXT & ARCHITECTURE MAP)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

> **Cập nhật:** 2026-08-24 | **Phiên bản:** v2.0 Enterprise SaaS | **Trạng thái:** 103/103 Test Suites PASS (100%)

---

## 🏛️ 1. Giới Thiệu & Tầm Nhìn Dự Án

**Gia Phả Gia Tộc (Heritage Ledger)** là nền tảng SaaS chuyên biệt dành cho các Dòng họ, Chi phái và Gia tộc Việt Nam, giải quyết triệt để bài toán:
1. **Số hóa & Lưu truyền Phả hệ**: Bảo tồn cội nguồn muôn đời, dựng cây phả hệ trực quan đa thế hệ.
2. **Chuẩn hóa Lịch Âm & Tế Lễ**: Độc quyền thuật toán thiên văn học Âm lịch Việt Nam chuẩn UTC+7, tự động quy đổi ngày giỗ, xử lý tháng nhuận và cảnh báo ngày 30 âm vào tháng thiếu.
3. **Minh bạch Tài chính Dòng Họ**: Sổ quỹ bất biến kế toán kép, quản lý thu định mức, duyệt chi đa cấp và vinh danh Bảng Vàng Công Đức.
4. **Vận hành Thương mại SaaS Tự Động**: Đăng ký, dùng thử 30 ngày, đo lường hạn mức tài nguyên (Quota), thanh toán VietQR NAPAS 247 và kích hoạt tức thời qua Webhook ngân hàng.

---

## 🔄 2. Mô Hình 4 Trụ Cột Nghiệp Vụ Cốt Lõi

Hệ thống được thiết kế khép kín theo luồng nghiệp vụ liên hoàn:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             VÒNG ĐỜI NGHIỆP VỤ HERITAGE LEDGER                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  🌳 1. GIA PHẢ CỐT LÕI (GENEALOGY CORE)                                                        │
│     • Quản trị Cây gia phả (D3/Canvas tương tác), 5 thế hệ, đa chi phái.                       │
│     • Quan hệ huyết thống, trực hệ, phu thê, thông gia.                                       │
│     • Dữ liệu thành viên chi tiết (tiểu sử, ngày sinh, ngày mất, phần mộ).                     │
│                                      │                                                         │
│                                      ▼                                                         │
│  📅 2. LỊCH GIA TỘC & NGÀY GIỖ (LUNAR CALENDAR & MEMORIALS)                                    │
│     • Lịch Âm-Dương song hành UTC+7 (Thuật toán thiên văn Hồ Ngọc Đức).                         │
│     • Tính Can Chi Ngày/Tháng/Năm, 24 Tiết Khí, 6 Khung Giờ Hoàng Đạo mỗi ngày.                │
│     • Tự động quy đổi ngày giỗ âm sang dương, xử lý giỗ tháng nhuận & ngày 30 âm thiếu.       │
│     • Bộ máy nhắc lễ thông minh 5 mốc (30 - 15 - 7 - 3 - 1 ngày trước lễ).                    │
│                                      │                                                         │
│                                      ▼                                                         │
│  💰 3. TÀI CHÍNH & SỔ QUỸ MINH BẠCH (FINANCIAL CORE & LEDGER)                                 │
│     • Sổ Cái Bất Biến (Immutable Ledger): Bút toán đã ghi không thể sửa/xóa.                   │
│     • Cơ chế Đảo bút toán đối xứng (Symmetrical Reversal) khi cần điều chỉnh.                  │
│     • Thu bổ quỹ định mức theo đinh / hộ gia đình.                                            │
│     • Quy trình đề xuất & duyệt chi ngân sách sự kiện (`BR-EVENT-004`).                        │
│     • Bảng Vàng Công Đức vinh danh 4 hạng (Đồng, Bạc, Vàng, Kim Cương).                        │
│                                      │                                                         │
│                                      ▼                                                         │
│  💳 4. THƯƠNG MẠI SAAS & QUẢN TRỊ THUÊ BAO (COMMERCIAL SAAS & VIETQR)                         │
│     • Gói dịch vụ đa dạng: Trải nghiệm (Free), Gia đình, Gia tộc, Dòng họ, Đại tộc.            │
│     • Dùng thử 30 ngày đầy đủ tính năng (`BR-TRIAL-001`).                                      │
│     • Giám sát trần hạn mức 7 tài nguyên (Thành viên, Chi phái, Dung lượng, Báo cáo...).       │
│     • Cổng thanh toán VietQR NAPAS 247 + Webhook ngân hàng ký HMAC-SHA256.                     │
│     • Kích hoạt nguyên tử (Atomic RPC): Payment SUCCESS + Invoice PAID + Subscription ACTIVE. │
│     • Chế độ Bảo Toàn Dữ Liệu Tuyệt Đối (`READ_ONLY` Grace Mode - Zero Data Loss).             │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 3. Ngăn Xếp Công Nghệ (Technology Stack)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LỚP ỨNG DỤNG (FRONTEND LAYER)                                                                  │
│ • Framework: React 18 (TypeScript 5, Strict Mode)                                              │
│ • Build Tool: Vite 5 (Fast HMR, 11s Production Bundle)                                         │
│ • Styling: Tailwind CSS (Hệ màu Heritage: #166534 Green, #1E3A5F Navy, #C49A3A Gold)          │
│ • Typography: Google Font 'Be Vietnam Pro' chuẩn hóa tiếng Việt                               │
│ • Component Library: Lucide React Icons, Canvas Confetti                                       │
│ • State & Data Fetching: TanStack React Query v5, React Router DOM v6                          │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LỚP MÁY CHỦ & DỊCH VỤ (MIDDLEWARE & SERVERLESS)                                                │
│ • Serverless Functions: Vercel Serverless Functions (`api/webhook.ts`)                         │
│ • Webhook Engine: Node.js Crypto (HMAC-SHA256 Verification)                                    │
│ • QR Engine: VietQR Integration Standard (NAPAS 247 Quick Response)                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LỚP DỮ LIỆU & BẢO MẬT (DATABASE & SECURITY LAYER)                                              │
│ • Cơ sở dữ liệu: Supabase PostgreSQL 15                                                        │
│ • Multi-Tenancy Isolation: Row Level Security (RLS) bắt buộc theo `family_id`                  │
│ • Concurrency & Atomicity: PostgreSQL Stored Procedures & Atomic RPC Functions                │
│ • Auth & Token: Supabase Auth (JWT payload verification, Role-based Access Control)           │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HỆ THỐNG TRÍ TUỆ MÃ NGUỒN (DEVELOPMENT & ARCHITECTURE GOVERNANCE)                              │
│ • CBI-MCP Phase 5 & Phase 7.1: Plan-First Mandatory Protocol                                   │
│ • Karpathy Behavioral Invariants: Think Before Coding, Simplicity, Surgical Changes, TDD       │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 4. Kiến Trúc Dữ Liệu & Bảng Chuẩn Hóa (Database Schema)

Cơ sở dữ liệu bao gồm **31 bảng chuẩn hóa** phân chia theo 4 khối chức năng:

```
                      [AUTH.USERS]
                           │
                           ▼
                      [PROFILES]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
        [FAMILIES] ◄──────────── [FAMILY_MEMBERSHIPS] (Roles & Permissions)
             │
 ┌───────────┼───────────────────────────┬───────────────────────────┐
 │           │                           │                           │
 ▼           ▼                           ▼                           ▼
[PHẢ HỆ]   [LỊCH & GIỖ]             [TÀI CHÍNH]                 [THƯƠNG MẠI SAAS]
 • generations • memorial_dates        • funds                     • plans
 • branches    • events                • financial_transactions    • plan_versions
 • members     • event_reminder_configs• income_categories         • plan_features
 • member_     • notifications         • income_assessments        • subscriptions
   relationships                       • expense_categories        • subscription_events
                                       • expense_records           • trial_periods
                                       • contributions             • usage_counters
                                       • sponsorships              • usage_events
                                       • audit_logs                • invoices
                                                                   • payments
                                                                   • refunds
```

---

## 🔒 5. Các Quy Tắc Nghiệp Vụ Bất Biến (System Invariants)

| Mã Quy Tắc | Tên Quy Tắc | Diễn Giải Chi Tiết |
|:---|:---|:---|
| **`BR-BILL-001`** | **Zero Data Loss Grace Mode** | Khi gói thuê bao hết hạn hoặc hủy, toàn bộ dữ liệu chuyển sang **`READ_ONLY`**. Tuyệt đối không xóa gia phả, ngày giỗ hay sổ quỹ. Khôi phục toàn quyền ghi khi gia hạn. |
| **`BR-PAY-001`** | **Zero Client Bypass** | Frontend bấm *"Tôi đã thanh toán"* chỉ chuyển trạng thái sang `WAITING_BANK`. Chỉ kích hoạt gói khi nhận Webhook ngân hàng có chữ ký HMAC hợp lệ. |
| **`BR-REV-001`** | **Immutable Ledger & Reversal** | Sổ quỹ không có lệnh `DELETE`. Mọi sai sót phải ghi bút toán hoàn trả `REVERSAL` đối xứng, bảo toàn tính kiểm toán tài chính. |
| **`BR-LUNAR-001`**| **Canonical UTC+7 Engine** | Thuật toán Hồ Ngọc Đức tính toán chính xác theo kinh tuyến $105^\circ$ Đông, bảo đảm tính đúng ngày Sóc, Đông Chí, Tháng Nhuận và Tháng 29/30 ngày. |
| **`BR-MEM-004`** | **Special 30th Day Fallback** | Ngày giỗ 30 âm vào năm thiếu (tháng chỉ có 29 ngày) tự động cảnh báo và tính toán ngày lễ cúng vào ngày 29. |
| **`BR-EVENT-004`**| **Event ↔ Finance Linkage** | Sự kiện tính toán ngân sách thực tế trực tiếp từ các bút toán `EXPENSE` trạng thái `POSTED` của Sổ Cái, không tạo giao dịch giả. |
| **`BR-QUOTA-001`**| **Quota Ceiling Enforcement** | Rào chắn `QuotaGate` chặn thao tác ghi vượt trần tài nguyên (ví dụ vượt quá 300 thành viên) và gợi ý nâng cấp gói. |

---

## 🏆 6. Trạng Thái Kiểm Thử Hiện Tại (103/103 Tests PASS)

Hệ thống đã đạt độ bao phủ kiểm thử tự động $100\%$ qua 5 bộ test suites:

```
========================================================================================
BẢNG TỔNG HỢP KIỂM THỬ HỆ THỐNG (AUTOMATED TEST INVENTORY)
========================================================================================
1. Phase 1 Alpha Full Execution Tests ........... 16 / 16 PASSED (Auth, RLS, Quota, Ledger)
2. Phase 2 Financial Core & VietQR Tests ........ 20 / 20 PASSED (FIN-001 - FIN-020)
3. Phase 3A Lunar Golden Dataset Tests .......... 26 / 26 PASSED (Tết 2020-2033, Leap Years)
4. Phase 3B Calendar & Memorial Engine Tests .... 21 / 21 PASSED (LUNAR-001 - RLS-CAL-003)
5. Phase 4 Commercial SaaS & Billing Tests ...... 20 / 20 PASSED (SUB-001 - ADMIN-BILL-001)
----------------------------------------------------------------------------------------
TỔNG CỘNG KIỂM THỬ:                              103 / 103 PASSED (100% SUCCESS)
KẾT QUẢ BIÊN DỊCH (npm run build):               PASS (0 Lỗi, 1724 modules transformed)
ĐỒ THỊ TRI THỨC CBI-MCP:                         113 Files, 1289 Symbols, 3428 Edges
TRIỂN KHAI VERCEL / GITHUB:                      Live trên main (`dadae35`)
========================================================================================
```

---

## 🚀 7. Lộ Trình Giai Đoạn Tiếp Theo (Roadmap Phase 5)

- **Phase 5.1**: Vận hành Hệ thống & Giám sát Tự động (Observability, Sentry, Telemetry & Audit Logs).
- **Phase 5.2**: Chương trình Thử nghiệm Kín (Closed Beta Launch cho 5-10 Dòng họ thực tế).
- **Phase 5.3**: Ứng dụng Di động PWA & Thông báo Đẩy (Mobile PWA & Push Notifications Zalo/SMS).
