# QUY TRÌNH ỨNG PHÓ SỰ CỐ & SỔ TAY THANH TOÁN (INCIDENT RESPONSE PLAYBOOK)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🚨 1. Sổ Tay Sự Cố Thanh Toán (Payment Incident Playbook)

| Kịch Bản Sự Cố | Nguyên Nhân Gốc | Quy Trình Xử Lý Chuẩn |
|:---|:---|:---|
| **Webhook mất kết nối** | Ngân hàng gặp sự cố mạng hoặc timeout | Super Admin dùng chức năng Đối soát định kỳ (`Reconciliation`), đối chiếu mã tham chiếu `GP-INV-xxxxxxxx` và kích hoạt qua Verified RPC kèm `audit_reason`. |
| **Webhook trùng lặp (Duplicate)** | Ngân hàng gửi lại do retry | Rào chắn `Idempotency Guard` tự động bỏ qua giao dịch đã ghi nhận, không nhân đôi thời hạn sử dụng. |
| **Chuyển thiếu tiền (`PARTIAL`)** | Khách hàng nhập sai số tiền | Hệ thống tự động ghi nhận thanh toán một phần `PARTIAL`, gửi thông báo nhắc chuyển bổ sung số tiền còn thiếu. |
| **Chữ ký HMAC không khớp** | Dấu hiệu tấn công giả mạo hoặc sai khóa secret | Từ chối ngay lập tức với mã `HTTP 401`, ghi nhận vào Security Event Log và cảnh báo P1. |
| **Khách hàng yêu cầu hoàn tiền** | Hủy gói cước trong vòng 7 ngày | Super Admin thực hiện qua `PaymentService.recordRefund` để ghi nhận bút toán hoàn tiền bảo toàn nguyên vẹn lịch sử giao dịch. |
