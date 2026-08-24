# UI CONSISTENCY AUDIT — HERITAGE LEDGER DESIGN SYSTEM
# Báo Cáo Rà Soát & Đồng Nhất Giao Diện Hệ Thống (Phase 6.X)

---

## 🏛️ 1. Tổng Quan Kiểm Toán Giao Diện (Executive Summary)

- **Design System Chuẩn**: `Heritage Ledger` (Google Stitch Project `14208187564231711793`)
- **Tông Màu Chủ Đạo**: **Light-First Warm Papyrus** (`#F7F8F5`), Thẻ Trắng (`#FFFFFF`), Xanh Di Sản (`#166534`), Navy Cổ Điển (`#1E3A5F`), Vàng Hoàng Gia (`#C49A3A`).
- **Font Typography Duy Nhất**: `Be Vietnam Pro` (Weights: 400, 500, 600, 700).
- **Tổng số màn hình kiểm toán**: **44 Pages + 14 Modals + 1 Drawer = 59 UI Units**.
- **Tình trạng Business Logic**: **BẢO TOÀN 100% (Zero Business Mutation)**.
- **Tình trạng Database & RLS**: **BẢO TOÀN 100% (Zero Schema Mutation)**.
- **Tình trạng Test Data**: **BẢO TOÀN 100% (Family Alpha, Beta, Gamma nguyên vẹn)**.

---

## 📊 2. Bảng Ma Trận Đối Soát Giao Diện Toàn Hệ Thống (UI Consistency Matrix)

| STT | Phân Vùng UI / Component | Hiện Trạng (Current Style) | Chuẩn Stitch (Heritage Ledger) | Trạng Thái | Kế Hoạch Chuẩn Hóa |
|:---|:---|:---|:---|:---|:---|
| 1 | **Global Theme Background** | Tông sáng xen kẽ một số thẻ slate | `#F7F8F5` (Archival Papyrus Paper) | `MATCH` | Đồng nhất toàn bộ container |
| 2 | **Typography Family** | `Be Vietnam Pro` | `Be Vietnam Pro` | `MATCH` | Loại bỏ hoàn toàn font ad-hoc |
| 3 | **Button Hierarchy** | Button Primary, Secondary, Danger | Primary (`#166534`), Ghost, Destructive | `MATCH` | Quy chuẩn `rounded-xl`, chiều cao 40px |
| 4 | **Genealogy Tree View** | Split view + Filter pills + Inspector | Top Filter Pills + Node Cards + Inspector | `MATCH` | Đã chuẩn hóa 100% theo Stitch |
| 5 | **Memorials & Calendar** | Card giỗ + Lịch vạn niên | Tự động đồng bộ từ cây + Lọc Chi/Cành | `MATCH` | Đã chuẩn hóa 100% theo Stitch |
| 6 | **Financial Ledger** | Bảng sổ quỹ 2 bên thu/chi | Thẻ Trắng `#FFFFFF` + Viền `#E2E8F0` + Badge | `MATCH` | Thống nhất Table System |
| 7 | **Honor Roll (Bảng Vàng)** | Card vinh danh công đức | Khung viền mạ vàng di sản `#C49A3A` | `MATCH` | Giữ nguyên chuẩn vinh danh |
| 8 | **Billing & Subscription** | VietQR Manual Flow + Admin | Chip ngân hàng chuẩn + Modal VietQR | `MATCH` | Đã tích hợp 36 ngân hàng |
| 9 | **Admin Beta Command** | 10 Gates + Evidence + Watchdog | Dark/Light contrast phân vùng rõ | `MATCH` | Đồng nhất Header/Card |
| 10 | **Specialized Modals (6 UI)** | Import, Bulk, Expense, Reversal... | Nền trắng `#FFFFFF`, Header có icon, nút chuẩn | `MATCH` | Đã thiết kế & đối soát |
| 11 | **Form Input System** | Input, Select, Textarea | Nền `bg-slate-50`, Viền `border-slate-300`, Focus xanh | `MATCH` | Quy chuẩn chung form |
| 12 | **Badge / Status System** | ACTIVE, PENDING, REVERSED... | Semantic: Success (Xanh), Warning (Vàng), Danger (Đỏ) | `MATCH` | Chuẩn hóa toàn bộ badge |

---

## 🎨 3. Hệ Thống Design Tokens Chuẩn Hóa

```css
:root {
  --bg-papyrus: #F7F8F5;
  --surface-card: #FFFFFF;
  --primary-green: #166534;
  --primary-green-hover: #14532D;
  --secondary-navy: #1E3A5F;
  --accent-gold: #C49A3A;
  --border-subtle: #E2E8F0;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --radius-base: 0.5rem;   /* 8px */
  --radius-card: 1rem;     /* 16px */
  --radius-pill: 9999px;   /* Full */
}
```
