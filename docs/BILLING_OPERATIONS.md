# 📑 SỔ TAY VẬN HÀNH THUÊ BAO & BIỂU PHÍ (BILLING OPERATIONS MANUAL)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Vòng Đời Thuê Bao Gia Tộc (Subscription State Machine)

```
[FREE PLAN] ──(Tạo dòng họ mới)──► [TRIAL 14 NGÀY]
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ (Hết hạn Trial)                      │ (Nâng cấp & Trả tiền)
                        ▼                                     ▼
                [READ_ONLY GRACE]                       [ACTIVE PAID]
                        │                                     │
                        │ (Sau 30 ngày)                       ├─► [UPGRADE] (Nâng gói)
                        ▼                                     ├─► [RENEWAL] (Gia hạn năm)
                   [EXPIRED]                                  ▼
             (Dữ liệu bảo toàn 100%)                    [PAST_DUE] (Quá hạn 7 ngày)
                                                              │
                                                              ▼
                                                        [READ_ONLY GRACE]
```

---

## 2. Quản Trị Phiên Bản Giá (Plan Versioning Governance)

- **Nguyên tắc cốt lõi (Grandfathering Rule)**:
  - Khi tăng giá dịch vụ (ví dụ gói Gia Tộc từ 990.000 ₫/năm lên 1.200.000 ₫/năm), hệ thống tạo một bản ghi mới trong bảng `plan_versions` (`version_number = 2`).
  - Các gia tộc đang sử dụng gói phiên bản 1 sẽ được **giữ nguyên mức giá cũ** cho các lần gia hạn tiếp theo cho đến khi chủ động chuyển gói.
  - Khách hàng mới đăng ký sau ngày có hiệu lực (`effective_from`) sẽ áp dụng biểu phí của phiên bản mới nhất (`is_current = true`).

---

## 3. Quy Trình Nhắc Hạn Thanh Toán (Dunning & Renewal Campaign)

Hệ thống tự động kích hoạt thông báo đa kênh trước khi hợp đồng hết hạn:
- **Mốc 30 ngày trước khi hết hạn**: Gửi email thông báo tổng kết 1 năm hoạt động dòng họ và mời gia hạn.
- **Mốc 15 ngày trước khi hết hạn**: Tạo dự thảo hóa đơn gia hạn (`invoices.status = 'DRAFT'`) và hiển thị huy hiệu nhắc nhở nhẹ trên App Header.
- **Mốc 7 ngày trước khi hết hạn**: Gửi mã VietQR gia hạn kèm chiết khấu 10% nếu gia hạn sớm.
- **Mốc 3 ngày & 1 ngày trước khi hết hạn**: Cảnh báo sắp chuyển sang chế độ **Chỉ Đọc (Read-Only)** nếu không thanh toán.

---

## 4. Chính Sách Bảo Toàn Dữ Liệu Khi Quá Hạn (Zero Data Loss Invariant)

- Khi thuê bao chuyển sang trạng thái `READ_ONLY` hoặc `EXPIRED`:
  1. ✅ **Tuyệt đối không xóa bất kỳ thành viên, quan hệ cây phả hệ, hình ảnh hay sổ quỹ nào của gia tộc**.
  2. ✅ Các thành viên và con cháu vẫn có thể đăng nhập, xem cây gia phả, tra cứu ngày giỗ và sổ quỹ.
  3. 🔒 Tạm khóa tính năng: Thêm thành viên mới, chỉnh sửa thông tin cây phả hệ, tải lên tài liệu mới và duyệt chi quỹ mới.
  4. 🔓 Mở lại toàn bộ tính năng ngay khi hoàn tất thanh toán gia hạn.
