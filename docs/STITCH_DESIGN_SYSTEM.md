# TÀI LIỆU HỆ THỐNG THIẾT KẾ GOOGLE STITCH: HERITAGE LEDGER
# DỰ ÁN: GIA PHẢ GIA TỘC SaaS

---

## 🏛️ 1. TRIẾT LÝ THIẾT KẾ (MODERN ANCESTRY)

Design System **Heritage Ledger** dung hòa giữa sự tôn nghiêm, trang trọng của văn hóa cội nguồn Việt Nam với sự tinh gọn, hiệu quả của một hệ thống SaaS tài chính - phả hệ chuẩn mực:
- **Tôn ti trật tự & Huyết thống**: Dữ liệu có cấu trúc thế hệ rõ ràng, node liên kết liền mạch.
- **Trang nhã & Tinh tế**: Nền giấy dó ấm áp (`#F7F8F5`), viền phân cách mỏng (`1px #E5E7EB`), bóng mờ nhẹ (`2% black ambient`).
- **Rõ ràng & Dễ đọc**: Phông chữ `Be Vietnam Pro` hiển thị dấu tiếng Việt sắc nét trên mọi kích thước màn hình.

---

## 🎨 2. HỆ THỐNG MÀU SẮC (COLOR TOKENS)

| Token Name | Hex Code | Tên Tiếng Việt | Mục Đích Sử Dụng |
|:---|:---|:---|:---|
| `--heritage-green` | `#166534` | Xanh Đại Thụ (Primary) | Nút bấm chính, node phả hệ sống, thẻ nổi bật, active navigation |
| `--heritage-green-light` | `#1E7B41` | Xanh Lá Nhạt | Hover states, focus rings, badges thành công |
| `--heritage-green-dark` | `#114B27` | Xanh Rừng Già | Active press, header nền đậm |
| `--heritage-navy` | `#1E3A5F` | Xanh Học Thuật (Secondary) | Sidebar, tiêu đề cấp cao, badge thế hệ |
| `--heritage-gold` | `#C49A3A` | Vàng Hoàng Kim (Accent) | Trưởng tộc, thủy tổ, vinh danh kim cương, sự kiện trọng đại |
| `--heritage-bg` | `#F7F8F5` | Giấy Dó Truyền Thống | Nền toàn bộ ứng dụng (Archival Papyrus) |
| `--heritage-surface` | `#FFFFFF` | Nền Thẻ Surface | Nền thẻ Card, Table, Modal, Drawer |
| `--heritage-border` | `#E2E8F0` / `#E5E7EB` | Viền Mỏng | Đường phân cách 1px, viền thẻ |
| `--heritage-muted` | `#64748B` | Xám Trầm Muted | Phụ đề, ngày tháng năm sinh mất, trạng thái đã mất |
| `--heritage-danger` | `#DC2626` | Đỏ Cảnh Báo | Nợ quá hạn, từ chối giao dịch, xóa dữ liệu |
| `--heritage-success` | `#16A34A` | Xanh Thành Công | Đã thanh toán, đã duyệt chi, hoàn thành |
| `--heritage-warning` | `#D97706` | Cam Cảnh Báo | Chờ xác nhận, gần chạm ngưỡng quota |

---

## 🔤 3. HỆ THỐNG TYPOGRAPHY (BE VIETNAM PRO)

| Cấp Bậc | Kích Thước | Weight | Line Height | Ứng Dụng |
|:---|:---|:---|:---|:---|
| **Display** | `48px` | `700 (Bold)` | `1.2` | Hero Landing Page, Tiêu đề lớn |
| **Heading 1 (H1)** | `32px` (`26px` mobile) | `700 (Bold)` | `1.3` | Tiêu đề Trang chính |
| **Heading 2 (H2)** | `24px` | `600 (SemiBold)` | `1.4` | Tiêu đề Phân đoạn, Card Title |
| **Heading 3 (H3)** | `20px` | `600 (SemiBold)` | `1.4` | Modal Title, Widget Title |
| **Body Large** | `18px` | `400 (Regular)` | `1.6` | Đoạn văn mở đầu, tiểu sử |
| **Body Medium** | `16px` | `400 (Regular)` | `1.6` | Nội dung chính, form input |
| **Body Small / Label** | `14px` | `500 (Medium)` | `1.5` | Nhãn trường, Table Header, Badge |
| **Caption** | `12px` | `400 (Regular)` | `1.4` | Timestamp, số CCCD, ghi chú chân trang |

---

## 📐 4. THANG KHOẢNG CÁCH (8px GRID SPACING)

- `xs`: `4px` (0.25rem)
- `sm`: `8px` (0.5rem)
- `md`: `16px` (1rem)
- `lg`: `24px` (1.5rem)
- `xl`: `32px` (2rem)
- `2xl`: `40px` (2.5rem)
- `3xl`: `64px` (4rem)
- `Sidebar Width`: `280px` cố định
- `Max Container Width`: `1440px`

---

## 🧱 5. QUY CHUẨN COMPONENT CHÍNH

1. **Button**:
   - `Primary`: Nền `#166534` chữ trắng, bo góc `8px`, hover sáng nhẹ `#1E7B41`.
   - `Secondary`: Nền trắng viền `1px #E2E8F0` chữ `#1E293B`, hover viền `#166534`.
   - `Gold Action`: Nền `#C49A3A` chữ trắng hoặc viền vàng hoàng kim.
2. **Card**:
   - Nền trắng `#FFFFFF`, viền `1px #E5E7EB`, bo góc `12px` (0.75rem), bóng mờ `shadow-sm`.
3. **Badge**:
   - Sống: Nền xanh nhạt `#DCFCE7` chữ `#166534`.
   - Đã mất: Nền xám `#F1F5F9` chữ `#475569`.
   - Hoàng kim / Thủy tổ: Nền vàng `#FEF3C7` chữ `#92400E`.
4. **Genealogy Tree Node**:
   - Avatar tròn `48px`, tên in đậm `15px`, niên đại `1920 - 1998` xám muted, đường nối xanh lá `#166534` `1.5px`.
