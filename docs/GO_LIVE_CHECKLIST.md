# 🚀 DANH SÁCH KIỂM TRA TRIỂN KHAI THEO 3 TẦNG (GO-LIVE CHECKLIST & ROLLOUT STRATEGY)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 🏛️ CHIẾN LƯỢC TRIỂN KHAI 3 TẦNG THỰC TẾ (3-TIER ROLLOUT STRATEGY)

```
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 1: INTERNAL ALPHA (QUẢN TRỊ VIÊN & 1-2 GIA TỘC MẪU)    │
│ • Kiểm thử chức năng với dữ liệu thực nghiệm hạn chế        │
│ • Kiểm tra tính ổn định của CSDL và RLS Policies            │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Kiểm thử 100% không phát sinh lỗi)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 2: CLOSED BETA (5-10 GIA TỘC THỰC TẾ / TRIAL 30 NGÀY)  │
│ • Giám sát: Lịch Âm, Cây phả hệ, Sổ quỹ, Quota, Nhắc giỗ   │
│ • Thu thập phản hồi UX từ các Trưởng họ & Thủ quỹ thực tế    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Hệ thống đạt chỉ số ổn định ≥ 99.9%)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ TẦNG 3: COMMERCIAL GO-LIVE (CHÍNH THỨC THU PHÍ KHÁCH HÀNG)  │
│ • Kích hoạt Cổng thanh toán VietQR Napas 247 Real-money     │
│ • Vận hành 5 gói cước: FREE / FAMILY / GIA TỘC / DÒNG HỌ / VIP│
│ • Áp dụng quy trình Dunning, Reversal & Grandfathering      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Checklist Tầng 1: Internal Alpha Testing
- [x] Triển khai Schema 36 Bảng PostgreSQL và kích hoạt 100% RLS.
- [x] Chạy bộ kiểm thử tự động `npm test` (Lịch âm, Sổ quỹ, Quota) đạt 100% PASS.
- [x] Kiểm tra bảo mật: Không có bất kỳ Service Role Key nào trong client bundle.
- [x] Tạo 2 Gia tộc nội bộ thử nghiệm (Gia tộc A và Gia tộc B), xác minh cách ly hoàn toàn.
- [x] Thử nghiệm tạo cây phả hệ 5 thế hệ với hơn 80 thành viên.

---

## 2. Checklist Tầng 2: Closed Beta (5–10 Gia Tộc Thực Tế)
- [ ] Gửi thư mời tham gia chương trình Beta Test kèm gói **Trial 30 ngày** miễn phí.
- [ ] Thiết lập kênh tiếp nhận phản hồi tức thời (Hotline / Zalo Group Ban Cố Vấn Dòng Họ).
- [ ] Giám sát tải hiệu năng khi render cây gia phả lớn ($> 300$ thành viên).
- [ ] Kiểm tra độ chính xác của thuật toán Lịch Âm Hồ Ngọc Đức trên các ngày sóc, tháng nhuận và lễ giỗ họ.
- [ ] Giám sát quy trình lập đợt thu quỹ và duyệt chi của Ban Kiểm Soát trong các sự kiện thực tế.

---

## 3. Checklist Tầng 3: Commercial Release (Mở Bán Chính Thức)
- [ ] Kết nối API Webhook ngân hàng thực tế (Casso / SePay / VietinBank / MBBank) để đối soát thanh toán tự động.
- [ ] Kích hoạt hệ thống xuất hóa đơn điện tử tự động và gửi qua email cho Trưởng tộc.
- [ ] Thiết lập hệ thống cảnh báo tự động qua Email/Telegram khi có giao dịch thanh toán sai lệch (`UNRECONCILED_PAYMENT`).
- [ ] Phân công nhân sự trực hỗ trợ khách hàng và vận hành theo sổ tay [PAYMENT_OPERATIONS.md](file:///d:/Antigravity%20Projects/GiaPhaGiaToc/docs/PAYMENT_OPERATIONS.md) và [BILLING_OPERATIONS.md](file:///d:/Antigravity%20Projects/GiaPhaGiaToc/docs/BILLING_OPERATIONS.md).
- [ ] Khởi chạy chiến dịch truyền thông ra mắt nền tảng Gia Phả Gia Tộc.
