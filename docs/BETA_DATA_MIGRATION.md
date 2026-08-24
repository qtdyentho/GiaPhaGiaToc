# 🔄 QUY TRÌNH NÂNG CẤP & CHUYỂN ĐỔI CSDL AN TOÀN (BETA DATA MIGRATION GUIDE)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Nguyên Tắc Di Chuyển CSDL Không Gián Đoạn (Zero-Downtime Migration)
- **Zero Data Loss**: Tuyệt đối không thực hiện các thao tác `DROP COLUMN` hoặc `DROP TABLE` khi chưa có bản sao lưu trước đó.
- **Smart Column Remapping**: Khi bổ sung trường mới, luôn thiết lập giá trị mặc định (`DEFAULT`) an toàn và cho phép `NULL` tạm thời để không ảnh hưởng dữ liệu cũ của các gia tộc đang dùng.
- **Transaction Wrap**: Mọi file migration phải nằm trọn vẹn trong một khối `BEGIN ... COMMIT;` để tự động Rollback nếu xảy ra bất kỳ lỗi cú pháp nào.

---

## 2. Quy Trình Chuyển Đổi Dữ Liệu Từ Beta Sang Commercial
1. Dữ liệu phả hệ thật của 5–10 gia tộc Beta được **giữ nguyên 100%** khi chuyển sang môi trường thương mại.
2. Tự động chuyển đổi trạng thái thuê bao từ `TRIALING (30 Ngày)` sang gói trả phí `ACTIVE` sau khi Trưởng họ hoàn tất quét mã VietQR gia hạn.
