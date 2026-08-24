# DESIGN SYSTEM: HERITAGE LEDGER
# Bản Quy Chuẩn Thiết Kế Hệ Thống Gia Phả Gia Tộc SaaS

---

## 🌿 1. Triết Lý Thiết Kế (Design Philosophy)

**Heritage Ledger (Sổ Phả Di Sản)** kết hợp sự tôn nghiêm, truyền thống của văn hóa dòng tộc Việt Nam với sự tinh giản, hiện đại của một nền tảng SaaS quản trị hiệu năng cao.

- **Light-First & Eye-Care**: Nền giấy dó cổ truyền (`#F7F8F5`) giúp các trưởng lão và thành viên dòng họ đọc gia phả lâu không mỏi mắt.
- **Card-Based Hierarchy**: Mọi khối thông tin (cây phả hệ, ngày giỗ, sổ quỹ, gói cước) đều nằm trên thẻ trắng (`#FFFFFF`) bo góc `16px` (`rounded-2xl`) với bóng mờ êm dịu (`shadow-card`).
- **Typography Chuẩn**: Duy nhất font **`Be Vietnam Pro`**, tối ưu hiển thị 100% dấu thanh tiếng Việt.

---

## 🎨 2. Bảng Màu Thương Hiệu (Brand Palette)

| Mã Màu | Tên Token | Ý Nghĩa / Mục Đích Sử Dụng |
|:---|:---|:---|
| `#166534` | **Primary Green** | Đại thụ dòng họ, sự sống trường tồn, nút chính (Primary Button), active tab. |
| `#1E3A5F` | **Secondary Navy** | Học vấn, uy nghiêm, thanh điều hướng sidebar, nhãn thế hệ. |
| `#C49A3A` | **Accent Gold** | Công đức, bảng vàng, huy hiệu vinh danh, viền di sản. |
| `#F7F8F5` | **Background Papyrus** | Giấy dó lưu trữ, nền ứng dụng chính. |
| `#FFFFFF` | **Surface Card** | Mặt thẻ, mặt bảng dữ liệu, nền modal. |
| `#E2E8F0` | **Border Subtle** | Viền ngăn cách giữa các dòng và cột. |

---

## 🔘 3. Hệ Thống Nút Bấm & Thao Tác (Button System)

1. **Primary Button**: Nền `#166534`, chữ trắng, bo góc `rounded-xl`, chiều cao 40px, hover `#14532D`.
2. **Secondary Button**: Nền trắng, viền `#CBD5E1`, chữ `#334155`, hover `bg-slate-50`.
3. **Filter Pills**: Nút bo tròn `rounded-full` (Active: `#2E1E6B` hoặc `#166534` chữ trắng; Inactive: Nền trắng viền xám).
4. **Destructive Button**: Nền đỏ `#DC2626` hoặc viền đỏ chữ đỏ.
