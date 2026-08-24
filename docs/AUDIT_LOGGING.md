# NHẬT KÝ KIỂM TOÁN HỆ THỐNG (SYSTEM AUDIT LOGGING)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🛡️ 1. Quy Định Kiểm Toán Mọi Thao Tác Nhạy Cảm

Mọi hành động can thiệp của Quản trị viên cấp cao (Super Admin) và Quản trị viên Gia tộc:
- **Bắt buộc có trường Lý do kiểm toán (`audit_reason`)** tối thiểu 5 ký tự.
- Ghi nhận đầy đủ: `WHO` (Người thực hiện), `WHAT` (Hành động), `WHEN` (Thời gian UTC), `RESULT` (Kết quả), `REASON` (Lý do nghiệp vụ), `REQUEST_ID` (Mã truy vết).

---

## 📋 2. Các Hành Động Bắt Buộc Ghi Nhật Ký

1. **`ADMIN_BILLING_OVERRIDE`**: Gia hạn dùng thử, kích hoạt gói cước thủ công.
2. **`DATA_IMPORT_COMMITTED` / `DATA_IMPORT_ROLLEDBACK`**: Nhập dữ liệu phả hệ hàng loạt hoặc hủy bỏ phiên nhập lỗi.
3. **`LEDGER_REVERSED`**: Đảo bút toán tài chính sai sót.
4. **`SUBSCRIPTION_STATUS_CHANGED`**: Tạm đình chỉ hoặc kích hoạt lại gói cước.
5. **`BACKUP_RESTORE_REQUESTED`**: Kích hoạt quy trình khôi phục dữ liệu từ bản sao lưu.
