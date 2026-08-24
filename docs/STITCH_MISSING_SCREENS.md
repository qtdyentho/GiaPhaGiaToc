# DANH SÁCH MÀN HÌNH CHƯA CÓ TRÊN GOOGLE STITCH (STITCH MISSING INVENTORY)
# DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)

---

## 🔍 1. TỔNG QUAN

Các màn hình dưới đây đã có nghiệp vụ hoàn chỉnh (Business Logic & Backend Services), nhưng trong danh mục Stitch 47 screens trước đây là các Modals tương tác chuyên sâu. Theo quy trình **STITCH-FIRST**, các màn hình này cần được mô tả thiết kế chi tiết để chuẩn hóa hoặc tạo variants trên Google Stitch.

---

## 📋 2. CHI TIẾT 6 MODALS / MÀN HÌNH CHUYÊN BIỆT CẦN BỔ SUNG STITCH

### 1. `DataImportWizardModal` (Import Dữ Liệu Gia Phả 5 Bước)
- **Mục đích**: Hỗ trợ Trưởng tộc upload file Excel / GEDCOM để import hàng trăm nhân khẩu cùng lúc.
- **5 Bước Wizard**: `Upload File` $\rightarrow$ `Ánh Xạ Cột (Auto-mapping)` $\rightarrow$ `Kiểm Tra Lỗi (Validation)` $\rightarrow$ `Xem Trước Cây (Preview)` $\rightarrow$ `Xác Nhận (Commit)`.
- **UI Element**: Progress bar 5 bước, bảng preview dữ liệu lỗi bôi đỏ, nút hoàn tác batch import (`Undo Import Batch`).

### 2. `BulkAssessmentModal` (Lập Đợt Bổ Bổ Đinh Điền Hàng Loạt)
- **Mục đích**: Tính toán số tiền mỗi hộ gia đình / đinh nam phải đóng góp vào quỹ giỗ họ hàng năm.
- **UI Element**: Chọn quỹ đích, nhập mức thu cố định hoặc theo đầu người, bộ lọc theo Chi phái/Thế hệ, bảng tính tổng thu dự kiến và nút phát hành phiếu thu hàng loạt.

### 3. `ExpenseApprovalModal` (Hội Đồng Gia Tộc Phê Duyệt Chi Quỹ)
- **Mục đích**: Quy trình đa chữ ký (Trưởng tộc, Thủ quỹ, Ban kiểm soát) duyệt khoản chi lớn (> 5.000.000đ).
- **UI Element**: Thông tin khoản chi, đính kèm hóa đơn chứng từ, số dư quỹ khả dụng sau chi, ô nhập lý do phê duyệt / từ chối, nút `Duyệt Chi Quỹ` (Green) và `Từ Chối` (Red).

### 4. `ReversalModal` (Bút Toán Hoàn Trả Đối Xứng Sổ Quỹ Kép)
- **Mục đích**: Triệt tiêu sai sót mà không xóa bút toán cũ (bảo toàn tính bất biến Immutable Ledger).
- **UI Element**: Cảnh báo nghiệp vụ di sản (Không xóa dữ liệu), ô nhập lý do hoàn trả bắt buộc (`audit_reason`), hiển thị số dư quỹ trước và sau hoàn trả, nút `Xác Nhận Bút Toán Hoàn Trả`.

### 5. `ExportTreeModal` (Xuất Gia Phả PDF Khổ Lớn / Sách Gia Phả)
- **Mục đích**: Kết xuất cây gia phả ra file PDF vector A0/A1 hoặc định dạng Word in sách truyền thống.
- **UI Element**: Chọn định dạng (PDF Khổ Lớn, Cuốn Sách Gia Phả, Danh Sách Nhân Khẩu Excel), chọn số đời cần xuất (Tất cả / 5 đời gần nhất), nút `Tải Xuống Bản In`.

### 6. `InviteRegisterPage` (Đăng Ký Nhân Khẩu Qua Liên Kết Gia Tộc)
- **Mục đích**: Con cháu trong họ nhận link mời (`/register/invite?token=...`) để tự kích hoạt tài khoản thành viên.
- **UI Element**: Hiển thị tên dòng họ và chi phái được mời, thông tin nhân khẩu được gán sẵn, form đặt mật khẩu bảo mật, nút `Kích Hoạt Tài Khoản Thành Viên`.
