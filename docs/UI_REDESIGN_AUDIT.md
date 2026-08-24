# BÁO CÁO AUDIT TOÀN DIỆN GIAO DIỆN HIỆN TẠI & GOOGLE STITCH DESIGN
# DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)

---

## 🏛️ 1. THÔNG SỐ KHẢO SÁT HỆ THỐNG

- **Google Stitch Project ID**: `projects/14208187564231711793`
- **Google Stitch Project Title**: `"Gia Phả Gia Tộc UX"`
- **Active Design System**: `"Heritage Ledger"` (`assets/2a6115e96ee54015ba157e1036c12772`)
- **Tổng số Routes trong React App**: **37 Routes** (Bao gồm Public, Authenticated App, Super Admin, Onboarding, Dev).
- **Tổng số Màn hình đã thiết kế trên Stitch**: **47 Screens** (Bao gồm cả Desktop 1280/2560px và Mobile 390/780px).
- **Trạng thái Dữ liệu Test**: Giữ nguyên 100% dữ liệu của Family Alpha, Beta, Gamma và các bản ghi kiểm thử.

---

## 📊 2. THỐNG KÊ PHÂN LOẠI MÀN HÌNH (SCREEN INVENTORY SUMMARY)

1. **Tổng số Routes**: 37
2. **Tổng số Screens trên Stitch**: 47
3. **Số màn hình đã có Stitch và khớp thiết kế (Loại A)**: **32 Màn hình**
4. **Số màn hình đã có Stitch cần đồng bộ Design Tokens (Loại B)**: **3 Màn hình**
5. **Số màn hình phụ trợ kế thừa trực tiếp từ AppLayout (Loại C)**: **2 Màn hình**
6. **Số màn hình cần tạo mới trên Stitch**: **0** (Dự án Stitch đã bao phủ đầy đủ 100% các luồng nghiệp vụ).
7. **Số màn hình cần redesign code Frontend**: **37 Routes** (Đồng bộ toàn bộ giao diện theo chuẩn Design System Heritage Ledger của Stitch).

---

## 🔍 3. CÁC ĐIỂM KHÔNG NHẤT QUÁN CẦN KHẮC PHỤC TRÊN GIAO DIỆN HIỆN TẠI

1. **Bảng màu & Theme**:
   - Hiện tại một số trang sử dụng màu xanh ngọc/xanh lá chuẩn Bootstrap hoặc Tailwind mặc định (`emerald-600`, `indigo-600`), chưa đồng nhất với **Primary Green (`#166534`)**, **Secondary Navy (`#1E3A5F`)**, **Accent Gold (`#C49A3A`)** và **Nền giấy dó (`#F7F8F5`)** từ Stitch.
2. **Khung giao diện (Layout & Sidebar)**:
   - Sidebar hiện tại cần chuẩn hóa chiều rộng cố định **280px**, phong cách trang nhã, màu Navy đậm hoặc bề mặt sáng với viền `1px (#E5E7EB)` nhẹ nhàng.
3. **Cây phả hệ (Genealogy Tree)**:
   - Cần chuẩn hóa các node thành dạng thẻ nhỏ gọn, avatar tròn, tên in đậm, ngày tháng năm sinh/mất màu xám muted, đường nối thế hệ và phụ huynh là đường mảnh xanh lá `Primary Green (#166534)` thể hiện mạch nguồn gia tộc.
4. **Typography & Spacing**:
   - Thống nhất phông chữ **Be Vietnam Pro** cho toàn bộ tiêu đề và nội dung.
   - Thang khoảng cách đồng bộ chuẩn 8px grid (`4px`, `8px`, `16px`, `24px`, `32px`, `40px`, `64px`).
5. **Bảng dữ liệu & Thẻ (Cards & Data Tables)**:
   - Thẻ sử dụng nền trắng `#FFFFFF` với viền `1px #E5E7EB` và hiệu ứng đổ bóng mờ `2%` (ambient shadow).
   - Badge trạng thái phân định rõ ràng: Sống (Xanh lá `#166534`), Đã mất (Xám trang nghiêm), Trưởng tộc/Vinh danh (Vàng hoàng kim `#C49A3A`).
6. **Quy trình Thanh toán & Admin Duyệt Tiền**:
   - Giữ nguyên mô hình nghiệp vụ đã kiểm chứng ở GD5.1: Khách hàng quét mã VietQR và gửi xác nhận $\rightarrow$ Admin đối soát sao kê ngoài hệ thống và duyệt thủ công kèm lý do kiểm toán.
