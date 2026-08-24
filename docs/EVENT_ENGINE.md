# KIẾN TRÚC EVENT & REMINDER ENGINE
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả quy trình quản lý sự kiện họ tộc, tích hợp dự toán ngân sách từ Sổ Cái Bất Biến và hệ thống nhắc lịch tự động.

---

## 🏛️ 1. Liên Kết Hữu Cơ Event $\leftrightarrow$ Finance (`BR-EVENT-004`)

- Sự kiện có thể thiết lập mức dự toán (`estimated_budget`) và chọn quỹ chi trả (`fund_id`).
- Hệ thống tự động truy vấn từ **Sổ Cái Bất Biến (`financial_transactions`)** các bút toán `EXPENSE` trạng thái `POSTED` có `event_id` trùng khớp.
- Giao diện tự động tính toán:
  $$\text{Số dư còn lại} = \text{Dự toán} - \sum \text{Khoản chi thực tế đã duyệt qua quỹ}$$
- **Tuyệt đối không tạo giao dịch tài chính giả từ Calendar UI.** Mọi khoản chi phải qua quy trình đề xuất & duyệt chi hợp lệ của Financial Core (Phase 2).

---

## ⏰ 2. Bộ Máy Nhắc Lịch Thông Minh (`BR-REMINDER-001`)

- **Các mốc nhắc nhở mặc định**: 30 ngày, 15 ngày, 7 ngày, 3 ngày, 1 ngày trước sự kiện/lễ giỗ.
- **Idempotency Guard**: Khóa chống trùng lặp dựa trên `family_id + target_id + days_before + year`.
- Tự động sinh thông báo in-app và gửi tin nhắn nhắc nhở cho thành viên ban khánh tiết và gia tộc.
