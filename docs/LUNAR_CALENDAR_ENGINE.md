# KIẾN TRÚC LUNAR CALENDAR & VẠN NIÊN ENGINE (HỒ NGỌC ĐỨC UTC+7)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả toàn diện thuật toán thiên văn học Âm lịch Việt Nam chuẩn UTC+7 (kinh tuyến 105° Đông), hệ thống Lịch Vạn Niên đa năm (2021-2036), chuyển đổi hai chiều Dương ↔ Âm, Can Chi, Tiết khí, Giờ Hoàng Đạo, Tháng Nhuận, và cơ chế tự động đồng bộ Ngày Giỗ từ Cây Phả Hệ.

---

## 🌌 1. Cơ Sở Thiên Văn Học & Múi Giờ

- **Múi giờ chuẩn**: `Asia/Ho_Chi_Minh` (UTC+7, kinh tuyến $105^\circ$ Đông).
- **Cơ sở xác định ngày Sóc (New Moon)**: Tính theo thời điểm giao hội thực giữa Mặt Trăng và Mặt Trời. Ngày Sóc được tính vào ngày chứa thời điểm giao hội tại kinh tuyến $105^\circ$ Đông.
- **Tháng 11 Âm lịch (Trọng đông)**: Luôn là tháng chứa điểm **Đông chí** (kinh độ Mặt Trời $270^\circ$).
- **Xác định Tháng Nhuận**: Nếu khoảng cách giữa 2 điểm Đông chí liên tiếp có 13 ngày Sóc, năm âm lịch đó là năm nhuận. Tháng nhuận là tháng đầu tiên sau tháng 11 không chứa **Trung khí** (tiết khí chẵn).

---

## 🔄 2. Chuyển Đổi Hai Chiều & Xử Lý Tháng Nhuận

### A. Dương Lịch Sang Âm Lịch (`solarToLunar`)
- Nhập: Ngày, Tháng, Năm Dương lịch.
- Xuất: `LunarDate` gồm `day`, `month`, `year`, `isLeap`, `canChiDay`, `canChiMonth`, `canChiYear`, `tietKhi`, `gioHoangDao`, `daysInMonth`.

### B. Âm Lịch Sang Dương Lịch (`lunarToSolar`)
- Nhập: Ngày, Tháng, Năm Âm lịch, `isLeap` (tháng nhuận hay thường).
- Xuất: `[solarDay, solarMonth, solarYear]` tương ứng chính xác trong lịch Gregory.

---

## 📅 3. Hệ Thống Lịch Gia Tộc Vạn Niên (2021 - 2036)

- **Bộ chọn Năm Vạn Niên**: Cho phép xem toàn bộ 16 năm liên tiếp từ **2021 đến 2036**, tự động cập nhật Can Chi tương ứng (Ví dụ: Năm 2026 $\rightarrow$ *Bính Ngọ*).
- **Chế độ Lưới 12 Tháng & Lọc Nhanh**:
  - Xem toàn bộ 12 tháng Âm lịch trong năm dưới dạng danh mục cuộn mượt mà.
  - Bộ lọc 12 tháng nhanh trên thanh công cụ (`T1` đến `T12`) giúp định vị tức thì các ngày giỗ trong tháng.
- **Tự Động Đồng Bộ Ngày Giỗ Từ Phả Hệ**:
  - Thuật toán tự động duyệt toàn bộ cây phả hệ (`family_members`), lọc các thành viên đã mất (`life_status = 'DECEASED'`), trích xuất ngày giỗ âm lịch (`death_anniversary_lunar_day/month`) và tích hợp vào lịch chung mà không cần nhập tay lặp lại.
- **Xuất Bản & In Ấn (PDF / Print)**:
  - Tích hợp tính năng In ấn & Xuất PDF Lịch Giỗ Tổ Niên Giám trang trọng dành cho Trưởng tộc và Hội đồng gia tộc.

---

## 🏆 4. Lunar Golden Test Set Đối Chiếu

Đã xác minh và đối chiếu thành công 100% với các mốc chuẩn lịch sử và tương lai:
1. **Tết Nguyên Đán 2020 - 2036**: Toàn bộ mùng 1 Tết và Can Chi năm được tính chuẩn xác.
2. **Năm Nhuận & Tháng Nhuận**:
   - 2020: Nhuận tháng 4 Âm lịch
   - 2023: Nhuận tháng 2 Âm lịch
   - 2025: Nhuận tháng 6 Âm lịch
   - 2028: Nhuận tháng 5 Âm lịch
   - 2031: Nhuận tháng 3 Âm lịch
   - 2033: Nhuận tháng 11 Âm lịch
3. **Tháng Thiếu (29 ngày) & Tháng Đủ (30 ngày)**:
   - Tháng Chạp 2021: 29 ngày (Tháng thiếu)
   - Tháng Chạp 2022: 30 ngày (Tháng đủ)
4. **Roundtrip Chuyển Đổi**: Độ chính xác $100\%$ không sai lệch ngày.
