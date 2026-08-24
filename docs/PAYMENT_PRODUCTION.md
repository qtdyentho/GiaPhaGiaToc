# QUY TRÌNH THANH TOÁN VIETQR & WEBHOOK PRODUCTION
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả quy trình tạo mã VietQR chuẩn Napas 247 và xử lý Webhook ngân hàng an toàn.

---

## 💳 1. Luồng Thanh Toán & Kích Hoạt Nguyên Tử (Atomic RPC)

```
[User chọn gói cước]
       ↓
[Server tính giá & Tạo Payment Intent + Mã tham chiếu GP-INV-xxxxxxxx]
       ↓
[Frontend hiển thị mã VietQR động NAPAS 247]
       ↓
[Khách hàng quét mã & Chuyển khoản từ App Ngân Hàng]
       ↓
[Ngân hàng phát sinh giao dịch] ──→ [Webhook gửi tới /api/webhook]
                                            │
                                            ├── 1. Xác thực chữ ký HMAC-SHA256
                                            ├── 2. Kiểm tra trùng lặp Idempotency
                                            ├── 3. Kiểm tra mã Hóa đơn & Số tiền
                                            └── 4. Kích hoạt Atomic RPC
                                                    ├── Payment = SUCCESS
                                                    ├── Invoice = PAID
                                                    └── Subscription = ACTIVE
```

---

## 🔒 2. Các Rào Chắn Bảo Mật (Security Invariants)

1. **Zero Client Bypass**:
   - Khi người dùng bấm nút *"Tôi đã chuyển khoản"*, giao diện chỉ chuyển sang trạng thái chờ `WAITING_BANK`.
   - Thuê bao chỉ được kích hoạt khi Webhook ngân hàng chính thức gửi tín hiệu hợp lệ.
2. **Khóa chống thiếu tiền (`PARTIAL`)**:
   - Nếu số tiền chuyển ít hơn giá trị hóa đơn, hệ thống ghi nhận thanh toán 1 phần và không kích hoạt gói.
3. **Idempotency Guard**:
   - Khóa duy nhất `provider_transaction_id` ngăn chặn việc nhận trùng webhook dẫn đến nhân đôi thời hạn sử dụng.
