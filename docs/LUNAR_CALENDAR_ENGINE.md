# KIẾN TRÚC LUNAR CALENDAR ENGINE (HỒ NGỌC ĐỨC UTC+7)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả toàn diện thuật toán thiên văn học Âm lịch Việt Nam chuẩn UTC+7 (kinh tuyến 105° Đông), chuyển đổi hai chiều Dương ↔ Âm, Can Chi, 24 Tiết khí, Giờ Hoàng Đạo, Tháng Nhuận và Tháng Thiếu/Đủ (29/30).

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

## 🏆 3. Lunar Golden Test Set Đối Chiếu

Đã xác minh và đối chiếu thành công 100% với các mốc chuẩn lịch sử và tương lai:
1. **Tết Nguyên Đán 2020 - 2033**: Toàn bộ mùng 1 Tết và Can Chi năm được tính chuẩn xác.
2. **Năm Nhuận & Tháng Nhuận**:
   - 2020: Nhuận tháng 4 Âm lịch
   - 2023: Nhuận tháng 2 Âm lịch
   - 2025: Nhuận tháng 6 Âm lịch
   - 2028: Nhuận tháng 5 Âm lịch
   - 2031: Nhuận tháng 3 Âm lịch
3. **Tháng Thiếu (29 ngày) & Tháng Đủ (30 ngày)**:
   - Tháng Chạp 2021: 29 ngày (Tháng thiếu)
   - Tháng Chạp 2022: 30 ngày (Tháng đủ)
4. **Roundtrip 1.096 Ngày Liên Tiếp (2024 - 2026)**: Chuyển đổi Solar $\rightarrow$ Lunar $\rightarrow$ Solar đạt độ chính xác $100\%$.
