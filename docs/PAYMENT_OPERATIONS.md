# 💳 SỔ TAY VẬN HÀNH THANH TOÁN & ĐỐI SOÁT NGÂN HÀNG (PAYMENT OPERATIONS MANUAL)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Kiến Trúc Luồng Thu Tiền Thật (Real-Money Flow)

Hệ thống tuân thủ nghiêm ngặt nguyên tắc **Zero-Trust Client Confirmation** (Không bao giờ tin tưởng xác nhận đơn phương từ phía Frontend):

```
┌───────────────┐
│   CUSTOMER    │
└───────┬───────┘
        │
   Quét VietQR & Chuyển khoản Napas 247
        │
        ▼
┌───────────────┐
│     BANK      │ (Vietcombank, MBBank, Techcombank, BIDV, Agribank...)
└───────┬───────┘
        │
   Transaction Notification (Real-time Webhook / API)
        │
        ▼
┌─────────────────────────────────┐
│ Payment Gateway / Bank Provider │ (Casso / SePay / Open Banking API)
└───────────────┬─────────────────┘
        │
   Verify HMAC Signature & Payload
        │
        ▼
┌─────────────────────────────────┐
│  Backend Bank Reconcile Engine  │ (Database Security Definer RPC)
└───────────────┬─────────────────┘
        │
   Atomic Database Transaction (Bảo toàn 100% Atomicity)
        │
 ┌──────┴─────────────────────────┐
 ▼                                ▼
[PAYMENT RECORD]           [INVOICE STATUS]         [SUBSCRIPTION]
status = 'SUCCESS'         status = 'PAID'          status = 'ACTIVE'
```

---

## 2. Quy Chuẩn Nội Dung Chuyển Khoản (Payment Reference Standard)

- **Cấu trúc mã**: `GP [MÃ_HÓA_ĐƠN]` (Ví dụ: `GP INV202608241024`)
- **Định dạng VietQR**: Chuẩn Napas 247 dynamic payload chứa sẵn số tài khoản, số tiền và nội dung chuyển khoản tự động.

---

## 3. Quy Trình Xử Lý Các Tình Huống Sai Lệch Thực Tế (Exception Handling)

### Tình huống 1: Khách hàng chuyển khoản đúng tiền nhưng SAI hoặc THIẾU nội dung
- **Triệu chứng**: Tiền đã vào tài khoản ngân hàng của hệ thống nhưng webhook không khớp được mã hóa đơn `invoices.invoice_number`.
- **Hành vi hệ thống**: Ghi nhận giao dịch vào bảng `payments` với `status = 'UNRECONCILED'` và tạo cảnh báo Admin.
- **Quy trình xử lý của Vận Hành (Ops Team)**:
  1. Vào trang Quản trị Doanh thu $\rightarrow$ Tab "Giao dịch chờ khớp (Unreconciled)".
  2. Tra cứu số tiền, thời gian và tên người gửi trên sao kê ngân hàng.
  3. Bấm "Khớp thủ công với Hóa đơn" $\rightarrow$ Chọn hóa đơn tương ứng của Gia tộc.
  4. Hệ thống tự động kích hoạt gói và gửi thông báo xác nhận cho Trưởng họ.

### Tình huống 2: Khách hàng chuyển THIẾU TIỀN (Partial Payment)
- **Ví dụ**: Hóa đơn 990.000 ₫ nhưng chỉ chuyển 500.000 ₫.
- **Xử lý**: 
  - Đánh dấu `invoices.status = 'PARTIAL'`.
  - Không kích hoạt gói; gửi thông báo yêu cầu chuyển tiếp số tiền còn thiếu kèm mã hóa đơn cũ.
  - Khi nhận đủ phần tiền còn lại, hệ thống tự động gộp 2 giao dịch và chuyển trạng thái sang `PAID` $\rightarrow$ Kích hoạt gói.

### Tình huống 3: Khách hàng chuyển THỪA TIỀN (Overpayment)
- **Ví dụ**: Hóa đơn 490.000 ₫ nhưng chuyển 500.000 ₫.
- **Xử lý**: 
  - Kích hoạt gói bình thường (`status = 'ACTIVE'`).
  - Ghi nhận khoản dư 10.000 ₫ vào số dư tín dụng gia tộc (`credit_balance`) để tự động khấu trừ vào hóa đơn kỳ tiếp theo hoặc hoàn tiền nếu khách yêu cầu.

### Tình huống 4: Khách hàng chuyển khoản TRÙNG LẶP (Duplicate Transfer)
- **Ví dụ**: Bấm chuyển khoản 2 lần liên tiếp cho cùng 1 hóa đơn.
- **Xử lý**:
  - Giao dịch 1: Kích hoạt hóa đơn thành công.
  - Giao dịch 2: Webhook nhận thấy hóa đơn đã `PAID` $\rightarrow$ Tự động gán trạng thái `DUPLICATE_PAYMENT` và gửi cảnh báo hoàn tiền cho kế toán.

---

## 4. Quy Trình Hoàn Tiền (Refund Operations)

1. Khách hàng yêu cầu hoàn tiền hợp lệ theo chính sách (e.g. Trong vòng 7 ngày đầu).
2. Kế toán duyệt lệnh hoàn tiền trong Admin Portal.
3. Tạo bản ghi trong bảng `refunds` (`status = 'COMPLETED'`).
4. Chuyển trạng thái thuê bao về `READ_ONLY` hoặc `CANCELLED` mà **không xóa dữ liệu gia phả của khách hàng**.

---

## 5. Đối Soát Ngân Hàng Hằng Ngày (Daily Bank Reconciliation)

Vào lúc **23:30 hàng ngày**, hệ thống tự động chạy cronjob đối soát:
- Tổng tiền trên sao kê ngân hàng (Bank Statement Total).
- Tổng tiền các giao dịch `payments.status = 'SUCCESS'`.
- Nếu có chênh lệch $\ne 0$, tự động phát thông báo khẩn cấp (Emergency Alert) tới Ban Quản Trị.
