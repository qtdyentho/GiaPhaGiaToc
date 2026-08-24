# HỆ THỐNG GIÁM SÁT TOÀN DIỆN (OBSERVABILITY ARCHITECTURE)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🔍 1. Chuẩn Hóa Structured Logging

Mọi sự kiện quan trọng phía máy chủ và luồng thanh toán phải được định dạng theo cấu trúc JSON chuẩn:

```json
{
  "timestamp": "2026-08-24T09:00:00.000Z",
  "level": "SECURITY",
  "service": "PaymentWebhook",
  "event": "PAYMENT_WEBHOOK_RECEIVED",
  "requestId": "REQ-20260824-8F92",
  "familyId": "fam-0000-0001",
  "action": "ACTIVATE_SUBSCRIPTION",
  "result": "SUCCESS",
  "durationMs": 42,
  "metadata": {
    "invoiceId": "inv-001",
    "amount": 990000
  }
}
```

---

## ⛓️ 2. Chuỗi Truy Vết Bất Biến (Request Correlation Chain)

Toàn bộ vòng đời một giao dịch từ khi tạo đơn đến khi kích hoạt gói cước được liên kết chặt chẽ qua `requestId`:

$$\text{Checkout} \longrightarrow \text{Invoice (GP-INV-...)} \longrightarrow \text{VietQR} \longrightarrow \text{Bank Webhook} \longrightarrow \text{Atomic RPC} \longrightarrow \text{Subscription ACTIVE}$$

---

## 🛡️ 3. Cơ Chế Khử Thông Tin Nhạy Cảm (Sensitive Data Redaction)

Bộ lọc `Logger.ts` tự động thay thế bằng `[REDACTED]` đối với:
- Mật khẩu, Refresh tokens, Service role keys.
- Khóa bí mật ký số HMAC Secret.
- Thông tin nhạy cảm của thành viên và số tài khoản cá nhân.
