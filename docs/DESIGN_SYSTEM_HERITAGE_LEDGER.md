# DESIGN SYSTEM: HERITAGE LEDGER
# Bản Quy Chuẩn Thiết Kế & Hệ Thống Typography Chuẩn Hóa

---

## 🌿 1. Triết Lý Thiết Kế (Design Philosophy)

**Heritage Ledger (Sổ Phả Di Sản)** kết hợp sự tôn nghiêm, truyền thống của văn hóa dòng tộc Việt Nam với sự tinh giản, hiện đại của một nền tảng SaaS quản trị hiệu năng cao.

- **Light-First & Eye-Care**: Nền giấy dó cổ truyền (`#F7F8F5`) giúp các trưởng lão và thành viên dòng họ đọc gia phả lâu không mỏi mắt.
- **Card-Based Hierarchy**: Mọi khối thông tin (cây phả hệ, ngày giỗ, sổ quỹ, gói cước) đều nằm trên thẻ trắng (`#FFFFFF`) bo góc `16px` (`rounded-2xl`) với bóng mờ êm dịu (`shadow-card`).

---

## 🔤 2. Hệ Thống Typography Chuẩn Hóa (Typography Standard — Mandatory)

Toàn bộ hệ thống áp dụng nghiêm ngặt quy tắc **2 Fonts Duy Nhất**:

| Token CSS | Tên Font | Vai Trò & Phạm Vi Áp Dụng |
|:---|:---|:---|
| **`--font-ui`** | **`Be Vietnam Pro`** | **Font mặc định cho TOÀN BỘ application UI**, bảng biểu, biểu mẫu nhập liệu, nhãn số liệu, nút bấm, thanh điều hướng và thông báo. |
| **`--font-heritage`** | **`Noto Serif`** | **Font Di Sản Trang Trọng**, CHỈ áp dụng cho các tiêu đề đại tự mang tính Lễ Nghi / Gia Phả / Giỗ Tổ / Bảng Vàng Công Đức / Khắc Ghi Tấm Lòng. |

### ⛔ Quy Tắc Cấm:
- TUYỆT ĐỐI KHÔNG sử dụng: Arial, Inter, Roboto, Open Sans, Poppins, Montserrat, system-ui, hoặc font serif mặc định của trình duyệt.
- TUYỆT ĐỐI KHÔNG import font riêng trong từng file component.
- Font được khai báo Global tại `index.html`, `src/index.css` và `tailwind.config.js`.

---

## 🎨 3. Bảng Màu Thương Hiệu (Brand Palette)

| Mã Màu | Tên Token | Ý Nghĩa / Mục Đích Sử Dụng |
|:---|:---|:---|
| `#166534` | **Primary Green** | Đại thụ dòng họ, sự sống trường tồn, nút chính (Primary Button), active tab. |
| `#1E3A5F` | **Secondary Navy** | Học vấn, uy nghiêm, thanh điều hướng sidebar, nhãn thế hệ. |
| `#C49A3A` | **Accent Gold** | Công đức, bảng vàng, huy hiệu vinh danh, viền di sản. |
| `#F7F8F5` | **Background Papyrus** | Giấy dó lưu trữ, nền ứng dụng chính. |
| `#FFFFFF` | **Surface Card** | Mặt thẻ, mặt bảng dữ liệu, nền modal. |
| `#E2E8F0` | **Border Subtle** | Viền ngăn cách giữa các dòng và cột. |

---

## 🔘 4. Hệ Thống Nút Bấm & Thao Tác (Button System)

1. **Primary Button**: Nền `#166534`, chữ trắng, bo góc `rounded-xl`, chiều cao 40px, hover `#14532D`.
2. **Secondary Button**: Nền trắng, viền `#CBD5E1`, chữ `#334155`, hover `bg-slate-50`.
3. **Filter Pills**: Nút bo tròn `rounded-full` (Active: `#2E1E6B` hoặc `#166534` chữ trắng; Inactive: Nền trắng viền xám).
4. **Destructive Button**: Nền đỏ `#DC2626` hoặc viền đỏ chữ đỏ.
