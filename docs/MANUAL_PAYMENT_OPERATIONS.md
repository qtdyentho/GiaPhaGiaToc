# QUY TRÌNH VẬN HÀNH XÁC NHẬN THANH TOÁN THỦ CÔNG (MANUAL PAYMENT OPERATIONS)
# GIA PHẢ GIA TỘC SaaS

---

## 🏛️ 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **KHÔNG KẾT NỐI API NGÂN HÀNG TRỰC TIẾP**:
   - Hệ thống không phụ thuộc vào Webhook hay API từ phía ngân hàng trong môi trường Production (`BANK_WEBHOOK_ENABLED = false`).
   - Mọi thao tác kích hoạt gói cước đều dựa trên xác nhận thực tế từ Ban Quản Trị sau khi đối soát sao kê ngoài hệ thống.

2. **BẢO VỆ PHÂN QUYỀN TUYỆT ĐỐI (AUTHORIZATION GUARD)**:
   - Khách hàng/Client **TUYỆT ĐỐI KHÔNG CÓ QUYỀN** tự gửi trạng thái `PAID`, `SUCCESS` hay `ACTIVE`.
   - Client chỉ được phép nộp yêu cầu chuyển tiền (`SUBMIT CLAIM`) chuyển hóa đơn sang `WAITING_CONFIRMATION`.
   - Chỉ người dùng có vai trò `SUPER_ADMIN` hoặc `BILLING_ADMIN` mới có thể gọi hàm `admin_confirm_payment` kèm lý do kiểm toán bắt buộc (`audit_reason`).

---

## 🔄 2. VÒNG ĐỜI HÓA ĐƠN & GIAO DỊCH (INVOICE & PAYMENT LIFECYCLE)

```
[Khách hàng chọn gói]
         ↓
  Invoice: PENDING_PAYMENT
         ↓
[Khách hàng chuyển khoản theo VietQR & bấm "Tôi đã chuyển khoản"]
         ↓
  Invoice: WAITING_CONFIRMATION (Payment: SUBMITTED)
         ↓
[Admin kiểm tra sao kê ngân hàng thực tế]
         ↓
   ┌────────────────────────┬─────────────────────────┬────────────────────────┐
   │ ĐỦ TIỀN                │ THIẾU TIỀN              │ TỪ CHỐI (KHÔNG CÓ TIỀN) │
   ↓                        ↓                         ↓                        ↓
[XÁC NHẬN]               [GHI NHẬN THIẾU]          [TỪ CHỐI YÊU CẦU]        [THỪA TIỀN]
   ↓                        ↓                         ↓                        ↓
Payment: SUCCESS         Payment: PARTIAL          Payment: REJECTED        Payment: OVERPAYMENT
Invoice: PAID            Invoice: WAITING_CONFIRM  Invoice: REJECTED        Invoice: PAID
Sub: ACTIVE              Sub: KHÔNG ĐỔI            Sub: KHÔNG ĐỔI           Sub: ACTIVE + Ghi chú
```

---

## ⚙️ 3. CÁC TRƯỜNG HỢP NGHIỆP VỤ ĐẶC THÙ

### A. Gia Hạn Thuê Bao Đang Hoạt Động (Active Subscription Renewal)
- Khi Admin xác nhận thanh toán cho thuê bao đang ở trạng thái `ACTIVE` (chưa hết hạn):
  - Thời hạn mới sẽ được **cộng dồn từ `current_period_end` hiện tại** thêm 365 ngày (hoặc số ngày tương ứng).
  - Tuyệt đối **KHÔNG reset** ngày hết hạn tính từ ngày hôm nay làm thiệt thòi ngày sử dụng của khách hàng.

### B. Thanh Toán Thiếu (Underpayment)
- Nếu hóa đơn là `990.000đ` nhưng sao kê chỉ nhận được `500.000đ`:
  - Admin nhập số tiền thực nhận `500.000đ`.
  - Hệ thống ghi nhận Payment là `PARTIAL`, Invoice giữ nguyên `WAITING_CONFIRMATION`.
  - Thuê bao **KHÔNG ĐƯỢC KÍCH HOẠT**.

### C. Chống Trùng Lặp Giao Dịch (Idempotency Guard)
- Nếu một hóa đơn đã ở trạng thái `PAID`, thao tác xác nhận lần 2 sẽ bị từ chối với mã lỗi `ALREADY_PROCESSED`.
- Không sinh thêm bản ghi Payment thứ hai và không cộng dồn thời hạn trùng lặp.

### D. Chế Độ Bảo Toàn Chỉ Đọc (READ_ONLY Grace Period)
- Khi thuê bao hết hạn mà chưa thanh toán:
  - Hệ thống chuyển tài khoản sang chế độ `READ_ONLY`.
  - Dữ liệu gia phả, cây huyết thống, ngày giỗ âm lịch và sổ quỹ được **bảo toàn 100% (Zero Data Loss)**.
  - Khách hàng vẫn có thể tra cứu và xem dữ liệu bình thường, chỉ bị khóa các quyền thêm/sửa/xóa cho đến khi gia hạn.
