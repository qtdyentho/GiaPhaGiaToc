# KIẾN TRÚC SUBSCRIPTION & LIFECYCLE ENGINE
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả quy trình quản lý trạng thái thuê bao gia tộc, nâng cấp/hạ cấp, gia hạn và hủy thuê bao.

---

## 🔄 1. Máy Trạng Thái Thuê Bao (Subscription State Machine)

```
[REGISTER / CREATE FAMILY]
       ↓
    TRIALING (30 ngày dùng thử đầy đủ tính năng)
       │
       ├── Webhook Thanh Toán Hợp Lệ ──→ ACTIVE (Kích hoạt 1 năm)
       │                                     │
       │                                     ├── Đến hạn gia hạn ──→ RENEWED / ACTIVE
       │                                     ├── Người dùng hủy ──→ CANCEL_AT_PERIOD_END
       │                                     └── Thanh toán lỗi ──→ PAST_DUE (Dunning 7-3-1)
       │                                                                  ↓
       └── Hết hạn không thanh toán ─────────────────────────────→ READ_ONLY (Grace Mode)
```

---

## ⚙️ 2. Các Quy Tắc Nâng Cấp & Hạ Cấp

1. **Nâng cấp gói (Upgrade)**:
   - Áp dụng ngay lập tức (`effective_immediately`).
   - Mở rộng hạn mức thành viên và dung lượng lưu trữ tức thời.
2. **Hạ cấp gói (Downgrade)**:
   - Áp dụng vào cuối chu kỳ thanh toán hiện tại (`effective_at_period_end = true`).
   - Người dùng được sử dụng đầy đủ quyền lợi của gói cao hơn cho đến hết hạn kỳ đã trả phí.
