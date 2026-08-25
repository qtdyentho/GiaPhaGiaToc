# DESIGN SYSTEM: HERITAGE LEDGER
# Bản Quy Chuẩn Thiết Kế & Hệ Thống Design Tokens 4 Tầng

---

## 🌿 1. Triết Lý Thiết Kế (Design Philosophy)

**Heritage Ledger (Sổ Phả Di Sản)** kết hợp sự tôn nghiêm, truyền thống của văn hóa dòng tộc Việt Nam với sự tinh giản, hiện đại của một nền tảng SaaS quản trị hiệu năng cao.

- **Dual Theme Support (Light & Dark)**:
  - **Light Mode**: Nền giấy dó cổ truyền (`#F7F8F5`) giúp các bậc trưởng bối đọc gia phả lâu không mỏi mắt.
  - **Dark Mode**: Nền đêm sâu thẳm (`#0F172A` / `#1E293B`) với độ tương phản WCAG AA cao bảo vệ thị lực trong môi trường thiếu sáng.
- **Card-Based Hierarchy**: Mọi khối thông tin (cây phả hệ, ngày giỗ, sổ quỹ, gói cước) đều nằm trên thẻ (`bg-heritage-surface dark:bg-slate-900`) bo góc `16px` (`rounded-2xl`) với bóng mờ êm dịu (`shadow-card` / `shadow-heritage`).

---

## 🏛️ 2. Kiến Trúc Design Tokens 4 Tầng (4-Layer Token Pipeline)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       GIAPHAGIATOC THEMING PIPELINE                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [Layer 1: src/styles/tokens.json]                                        │
│  ├── Raw Palette: green-600 (#166534), navy-500 (#1E3A5F), gold (#C49A3A) │
│  └── Spacing & Radii: 4px, 8px, 12px, 16px, 24px...                       │
│                                                                           │
│  [Layer 2: src/styles/tokens.css]                                         │
│  ├── :root (Light Theme)               ──> --color-primary: 22 101 52     │
│  └── .dark, [data-theme="dark"] (Dark) ──> --color-primary: 34 197 94     │
│                                                                           │
│  [Layer 3: tailwind.config.js]                                            │
│  └── colors.heritage.green = 'rgb(var(--color-primary) / <alpha-value>)' │
│                                                                           │
│  [Layer 4: src/components/ui/ (Button, Card, Badge, StatCard)]            │
│  └── className="bg-heritage-green hover:bg-heritage-green/90 text-white"  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 💡 Ưu thế của Cú pháp RGB Channels:
Thay vì lưu mã hex cứng `#166534`, CSS Variables được lưu dưới dạng kênh màu số thực: `--color-primary: 22 101 52`. Nhờ đó, Tailwind CSS có thể sinh mã tự động với độ mờ linh hoạt:
- `bg-heritage-green/90`, `bg-heritage-green/20`, `border-heritage-gold/40`
- Tự động thay đổi màu chuẩn xác khi người dùng bật / tắt Dark Mode runtime mà **không cần tải lại trang hay rebuild bundle**.

---

## 🔤 3. Hệ Thống Typography Chuẩn Hóa (Typography Standard — Mandatory)

Toàn bộ hệ thống áp dụng nghiêm ngặt quy tắc **2 Fonts Duy Nhất**:

| Token CSS | Tên Font | Vai Trò & Phạm Vi Áp Dụng |
|:---|:---|:---|
| **`--font-ui`** | **`Be Vietnam Pro`** | **Font mặc định cho TOÀN BỘ application UI**, bảng biểu, biểu mẫu nhập liệu, nhãn số liệu, nút bấm, thanh điều hướng và thông báo. |
| **`--font-heritage`** | **`Lora`** | **Font Di Sản Cổ Điển & Thư Pháp Trang Trọng (100% Tiếng Việt)**, áp dụng cho các tiêu đề đại tự mang tính Lễ Nghi / Gia Phả / Giỗ Tổ / Bảng Vàng Công Đức / Khắc Ghi Tấm Lòng. |

### ⛔ Quy Tắc Cấm:
- TUYỆT ĐỐI KHÔNG sử dụng: Arial, Inter, Roboto, Open Sans, Poppins, Montserrat, system-ui, hoặc font serif mặc định của trình duyệt.
- TUYỆT ĐỐI KHÔNG import font riêng lẻ trong từng file component.
- Font được khai báo Global tại `index.html`, `src/styles/tokens.css` và `tailwind.config.js`.

---

## 🎨 4. Bảng Màu Ngữ Nghĩa (Semantic Tokens)

| Token Ngữ Nghĩa | Giá Trị Light Mode | Giá Trị Dark Mode | Mục Đích Sử Dụng |
|:---|:---|:---|:---|
| `heritage-green` | `rgb(22 101 52)` (`#166534`) | `rgb(34 197 94)` (`#22C55E`) | Đại thụ dòng họ, sự sống trường tồn, nút chính (Primary Button), active tab. |
| `heritage-navy` | `rgb(30 58 95)` (`#1E3A5F`) | `rgb(96 165 250)` (`#60A5FA`) | Học vấn, uy nghiêm, thanh điều hướng sidebar, nhãn thế hệ. |
| `heritage-gold` | `rgb(196 154 58)` (`#C49A3A`) | `rgb(251 191 36)` (`#FBBF24`) | Công đức, bảng vàng, huy hiệu vinh danh, viền di sản. |
| `heritage-bg` | `rgb(247 248 245)` (`#F7F8F5`) | `rgb(15 23 42)` (`#0F172A`) | Giấy dó lưu trữ (Light) hoặc Đêm sâu thẳm (Dark). |
| `heritage-surface` | `rgb(255 255 255)` (`#FFFFFF`) | `rgb(30 41 59)` (`#1E293B`) | Mặt thẻ, mặt bảng dữ liệu, nền modal. |
| `heritage-border` | `rgb(226 232 240)` (`#E2E8F0`) | `rgb(51 65 85)` (`#334155`) | Viền ngăn cách thẻ và các ô dữ liệu. |
| `heritage-text` | `rgb(30 41 59)` (`#1E293B`) | `rgb(248 250 252)` (`#F8FAFC`) | Văn bản chính, tiêu đề nội dung. |
| `heritage-muted` | `rgb(148 163 184)` (`#94A3B8`) | `rgb(148 163 184)` (`#94A3B8`) | Nhãn phụ, thời gian, trạng thái thứ cấp. |

---

## ♿ 5. Chuẩn Trợ Năng (Accessibility WCAG AA)

1. **Tỷ lệ Tương phản (Contrast Ratio)**: Mọi cặp màu văn bản và nền phải đạt tối thiểu **4.5:1** cho văn bản thường và **3:1** cho văn bản đậm/tiêu đề lớn.
2. **Skip-to-Content Anchor**: Thẻ ẩn `<a href="#main-content">` cho phép người dùng bàn phím chuyển nhanh tới `<main id="main-content">`.
3. **ARIA Semantic Attributes**: Mọi nút icon đơn lẻ (Mở rộng menu, Chuyển Dark/Light mode, Chuông thông báo) bắt buộc có `aria-label` và `aria-expanded`.
