# KIẾN TRÚC MEMORIAL ENGINE (NGÀY GIỖ TỔ TIÊN VẠN NIÊN)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả toàn diện phân hệ quản lý ngày giỗ tổ tiên, xử lý tháng nhuận và ngày 30 âm lịch vào năm thiếu.

---

## 🏛️ 1. Nguyên Tắc Cốt Lõi (Memorial Invariants)

1. **`BR-MEMORIAL-001` (Chu Kỳ Âm Lịch Thường Niên)**:
   - Mọi ngày giỗ được lưu theo ngày Âm lịch (`lunar_day`, `lunar_month`).
   - Tự động quy đổi ra ngày Dương lịch tương ứng cho năm hiện tại và các năm tiếp theo.
2. **`BR-MEMORIAL-003` (Xử Lý Ngày Giỗ Trong Tháng Nhuận)**:
   - Nếu `is_leap_month = true`:
     - Vào các năm có tháng đó nhuận: Cúng vào đúng tháng nhuận.
     - Vào các năm không có tháng đó nhuận: Cúng vào tháng chính theo tập quán gia tộc.
   - Giao diện luôn hiển thị huy hiệu `"Tháng Nhuận"` rõ ràng.
3. **`BR-MEMORIAL-004` (Xử Lý Ngày Giỗ 30 Âm Vào Tháng Thiếu 29 Ngày)**:
   - Nếu ngày giỗ là ngày 30 Âm lịch (đặc biệt 30 tháng Chạp - Tất niên), nhưng tháng âm năm đó chỉ có 29 ngày:
     - Hệ thống phát hiện và hiển thị cảnh báo thông minh: `⚠️ Năm nay tháng không có ngày 30. Lễ cúng sẽ được tiến hành vào ngày 29.`
     - Tự động tính toán ngày Dương lịch tương ứng theo ngày 29.
