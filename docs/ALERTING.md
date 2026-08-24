# HỆ THỐNG CẢNH BÁO & NGƯỠNG AN TOÀN (ALERTING POLICIES)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🚨 1. Bảng Phân Cấp Mức Độ Cảnh Báo (Alert Severity Levels)

| Mức Độ | Ngưỡng Kích Hoạt | Kênh Thông Báo | Thời Gian Phản Hồi | Hành Động Yêu Cầu |
|:---|:---|:---:|:---:|:---|
| **P0 (Critical)** | • Database mất kết nối > 1 phút<br>• Rò rỉ dữ liệu chéo gia tộc (Cross-tenant leak)<br>• Sao lưu tự động thất bại | PagerDuty / SMS / Telegram khẩn | **< 15 phút** | Cách ly dịch vụ, kích hoạt quy trình Phục hồi thảm họa (Disaster Recovery). |
| **P1 (High)** | • Tỷ lệ lỗi Webhook Ngân hàng > 5% trong 15 phút<br>• Phát hiện dấu hiệu giả mạo chữ ký HMAC hàng loạt | Slack / Email Kỹ thuật | **< 30 phút** | Kiểm tra đường truyền đối soát ngân hàng, rà soát nhật ký giao dịch. |
| **P2 (Medium)** | • Tỷ lệ lỗi Import dữ liệu > 10%<br>• Hạn mức tài nguyên gia tộc chạm 100% | Dashboard Admin | **< 2 giờ** | Hỗ trợ gia tộc tối ưu file phả hệ hoặc nâng cấp gói cước. |
| **P3 (Low)** | • Cảnh báo hiệu năng tra cứu cây phả hệ lớn > 1.5s | Weekly Digest | **Trong tuần** | Đánh giá và tối ưu chỉ mục (Database Index). |
