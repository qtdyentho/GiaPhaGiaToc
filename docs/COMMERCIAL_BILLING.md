# KIẾN TRÚC COMMERCIAL SaaS & BILLING CORE
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả toàn diện vòng đời thương mại hóa nền tảng **Gia Phả Gia Tộc — Heritage Ledger**.

---

## 🏛️ 1. Khép Kín 4 Trụ Cột Nghiệp Vụ

```
🌳 GIA PHẢ (Thành viên, Cây phả hệ, Trực hệ)
     │
📅 LỊCH / GIỖ (Lịch âm UTC+7, Can Chi, Tiết khí, Báo giỗ)
     │
💰 TÀI CHÍNH (Sổ quỹ kép bất biến, Định mức thu, Chi, Công đức)
     │
💳 SUBSCRIPTION (Gói cước gia tộc, Hạn mức, Dùng thử 30 ngày)
     │
🔄 RENEWAL / VIETQR (Thanh toán tự động qua Webhook Napas 247)
     │
📈 COMMERCIAL SAAS (MRR, ARR, Quản trị doanh thu & Churn Rate)
```

---

## 🛡️ 2. Nguyên Tắc An Toàn Dữ Liệu Tối Thượng (`BR-BILL-001`)

- **Bảo Toàn Dữ Liệu 100%**: Dữ liệu gia phả là tài sản thiêng liêng vĩnh cửu của mỗi dòng họ.
- Khi thuê bao hết hạn hoặc hủy gói:
  - Tài khoản chuyển sang trạng thái **`READ_ONLY`**.
  - Người dùng vẫn có toàn quyền tra cứu cây gia phả, xem tiểu sử tiền nhân, lịch âm, ngày giỗ, sự kiện và toàn bộ lịch sử thu chi tài chính.
  - Tuyệt đối không xóa bất kỳ bản ghi nào.
  - Khi gia hạn lại, toàn bộ quyền chỉnh sửa được khôi phục ngay lập tức.
