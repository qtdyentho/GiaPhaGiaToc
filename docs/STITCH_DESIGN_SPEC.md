# ĐẶC TẢ THIẾT KẾ GIAO DIỆN CHUẨN STITCH (STITCH DESIGN SPECIFICATION)
# PHASE E — DESIGN SYSTEM & SUBSYSTEM SPECIFICATIONS
# DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)

---

## 🏛️ 1. QUY CHUẨN THIẾT KẾ 6 MÀN HÌNH CHUYÊN SÂU (MISSING SCREENS DESIGN SPEC)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        6 MÀN HÌNH CHUYÊN SÂU CHUẨN HERITAGE LEDGER                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. DataImportWizardModal : Wizard 5 bước với stepper tiến trình, bảng mapping, preview │
│ 2. BulkAssessmentModal    : Bổ đinh hàng loạt, lọc chi phái, tính tổng, cảnh báo quỹ   │
│ 3. ExpenseApprovalModal  : Đa chữ ký Hội đồng gia tộc, đính kèm chứng từ, số dư sau chi│
│ 4. ReversalModal         : Bút toán hoàn trả đối xứng, bắt buộc audit_reason           │
│ 5. ExportTreeModal       : Xuất PDF vector A0-A4, Sách gia phả, Danh sách nhân khẩu    │
│ 6. InviteRegisterPage    : Kích hoạt tài khoản thành viên từ link mời có token an toàn  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. CHI TIẾT ĐẶC TẢ TỪNG MÀN HÌNH & KHUNG BỐ CỤC

### 1. `DataImportWizardModal` (Nhập Dữ Liệu Gia Phả 5 Bước)
- **Design Tokens**: Modal `max-w-4xl`, nền trắng `#FFFFFF`, bo góc `16px`, backdrop `bg-slate-900/60 backdrop-blur-sm`.
- **5 Bước Stepper**:
  - `Step 1 (Upload)`: Drag & Drop Zone, chấp nhận `.xlsx`, `.csv`, `.ged`, file size max 25MB.
  - `Step 2 (Mapping)`: Bảng ánh xạ 2 cột (Cột trong file $\longleftrightarrow$ Trường CSDL: Họ tên, Giới tính, Ngày sinh, Đời, Cha, Mẹ, Vợ/Chồng).
  - `Step 3 (Validation)`: Thống kê tổng hàng (Total: 86, Hợp lệ: 84, Cảnh báo: 2, Lỗi chặn: 0). Bảng danh sách lỗi có tag đỏ.
  - `Step 4 (Preview Tree)`: Render cây gia phả thu nhỏ trực quan.
  - `Step 5 (Commit & Undo)`: Tóm tắt số nhân khẩu tạo mới, nút `Xác Nhận Nhập Dữ Liệu` (Green), ghi chú hoàn tác `Undo Batch`.
- **Ràng buộc an toàn**: Nút `Xác nhận` bị Disable nếu còn lỗi chặn (Blocking errors).

### 2. `BulkAssessmentModal` (Lập Đợt Bổ Bổ Định Mức Đinh Điền)
- **Design Tokens**: Modal `max-w-3xl`, thẻ di sản viền vàng.
- **Thành phần**:
  - Chọn Quỹ đích (Quỹ Giỗ Tổ / Quỹ Khuyến Học / Quỹ Hương Hỏa).
  - Phạm vi áp dụng: `Toàn gia tộc`, `Chi phái cụ thể`, `Theo thế hệ` hoặc `Chỉ đinh nam trưởng thành`.
  - Định mức đóng góp: Nhập số tiền cố định (vd: `200.000 ₫/người`) hoặc linh hoạt.
  - Bảng xem trước danh sách: Tên thành viên, Chi phái, Số tiền bổ bổ, ô điều chỉnh riêng lẻ.
  - Tóm tắt tổng thu: Tổng số đinh: `86 người`, Tổng dự thu: `17.200.000 ₫`.
  - Cảnh báo quy tắc: **`ASSESSMENT ≠ PAYMENT`** (Chỉ tạo nghĩa vụ thu, không tự động tăng số dư quỹ tiền mặt).

### 3. `ExpenseApprovalModal` (Hội Đồng Gia Tộc Duyệt Khoản Chi)
- **Design Tokens**: Modal `max-w-2xl`, thẻ cảnh báo số dư.
- **Thành phần**:
  - Tên khoản chi & mục đích (vd: `Tu bổ lăng mộ Tổ đầu xuân`).
  - Số tiền đề xuất: `15.000.000 ₫`.
  - Quỹ chi: `Quỹ Hương Hỏa Gia Tộc`.
  - Số dư quỹ hiện tại: `45.250.000 ₫` $\rightarrow$ Số dư sau khi chi: `30.250.000 ₫` (Hiển thị an toàn màu xanh lá).
  - Khung xem chứng từ / Hóa đơn đính kèm.
  - Khung Đa Chữ Ký (Multi-sign): Chữ ký 1 (Trưởng tộc: Đã duyệt), Chữ ký 2 (Thủ quỹ: Đang chờ).
  - Ô nhập lý do phê duyệt / từ chối (`audit_reason`).
  - Nút hành động: `Phê Duyệt Khoản Chi` (Xanh đại thụ `#166534`) và `Từ Chối` (Đỏ `#DC2626`).

### 4. `ReversalModal` (Bút Toán Hoàn Trả Đối Xứng Sổ Quỹ Kép)
- **Design Tokens**: Modal `max-w-xl`, biểu tượng khiên bảo mật màu hổ phách.
- **Thành phần**:
  - Hộp cảnh báo nguyên tắc di sản: *"Hệ thống không xóa giao dịch cũ mà tạo bút toán đối ứng ngược chiều để triệt tiêu sai sót."*
  - Thông tin giao dịch gốc: Mã GD `TX-2026-0042`, Số tiền `5.000.000 ₫`, Ngày ghi `15/01/2026`.
  - Sơ đồ biến động: `Số dư cũ: 45.250.000 ₫` $\rightarrow$ `Hoàn trả: -5.000.000 ₫` $\rightarrow$ `Số dư mới: 40.250.000 ₫`.
  - Bắt buộc nhập lý do hoàn trả: `Lý do kiểm toán (audit_reason)` (Tối thiểu 10 ký tự).
  - Nút bấm: `Xác Nhận Bút Toán Hoàn Trả` (Hổ phách `#D97706`).

### 5. `ExportTreeModal` (Xuất Bản Gia Phả Đa Định Dạng)
- **Design Tokens**: Modal `max-w-2xl`, thẻ lựa chọn định dạng dạng Grid 2x2.
- **Thành phần**:
  - 4 Lựa chọn xuất bản:
    1. `Phả Đồ Khổ Lớn (Vector PDF A0, A1, A3, A4)`: Đồ họa vector sắc nét không vỡ hạt.
    2. `Cuốn Sách Gia Phả (PDF / Word)`: Trình bày dạng văn bản gia huấn, tiểu sử, ngày giỗ, mộ chí.
    3. `Danh Sách Nhân Khẩu (Excel / CSV)`: Dữ liệu bảng phục vụ đối soát việc họ.
    4. `Sao Lưu Dữ Liệu (JSON Backup)`: Bản sao lưu toàn diện.
  - Tùy chọn nâng cao: Số đời cần xuất (Tất cả / 5 đời gần nhất), đính kèm ngày giỗ, đính kèm thông tin mộ phần.
  - Nút bấm: `Tải Xuống Bản In`.

### 6. `InviteRegisterPage` (Đăng Ký Thành Viên Qua Link Mời Gia Tộc)
- **Design Tokens**: Trang toàn màn hình nền giấy dó `#F7F8F5`, Card trung tâm `max-w-md` bóng mờ di sản.
- **Thành phần**:
  - Logo Gia Phả Gia Tộc & Huy hiệu dòng họ (vd: `Họ Nguyễn - Chi 2`).
  - Hộp thông tin xác thực: Hiển thị tên thành viên đã được định danh trên cây (vd: `Nguyễn Văn Phúc - Thế hệ 5`).
  - Form thiết lập mật khẩu: Mật khẩu mới, Xác nhận mật khẩu.
  - Nút bấm: `Kích Hoạt Tài Khoản Thành Viên`.
  - Trạng thái kiểm soát: Link hợp lệ, Link hết hạn, Link đã sử dụng, Token không hợp lệ.
