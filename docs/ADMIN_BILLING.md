# TRUNG TÂM QUẢN TRỊ DOANH THU & THUÊ BAO SAAS (ADMIN BILLING)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả các chức năng quản trị doanh thu, chỉ số SaaS và ghi vết kiểm toán can thiệp thủ công của Super Admin.

---

## 📈 1. Bộ Chỉ Số Tài Chính SaaS (SaaS Metrics)

- **MRR (Monthly Recurring Revenue)**: Doanh thu định kỳ hàng tháng từ tất cả các gói thuê bao.
- **ARR (Annual Recurring Revenue)**: $\text{ARR} = \text{MRR} \times 12$.
- **ARPU (Average Revenue Per User/Family)**: Doanh thu trung bình trên mỗi gia tộc đăng ký.
- **Churn Rate**: Tỷ lệ hủy gói hoặc chuyển sang không gia hạn.
- **Trial Conversion Rate**: Tỷ lệ chuyển đổi từ dùng thử 30 ngày sang gói trả phí chính thức.

---

## 🛡️ 2. Quy Định Can Thiệp Thủ Công (Manual Override & Audit Logging)

Mọi thao tác của Super Admin/Billing Admin can thiệp vào thuê bao (Gia hạn dùng thử, Kích hoạt thủ công, Tạm đình chỉ):
- **Bắt buộc nhập lý do kiểm toán (Audit Reason)** tối thiểu 5 ký tự.
- Hệ thống tự động ghi nhận: `Admin ID`, `Action`, `Subscription ID`, `Before State`, `After State`, `Reason`, `Timestamp`.
