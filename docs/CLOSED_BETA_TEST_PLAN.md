# 🧪 KẾ HOẠCH KIỂM THỬ CLOSED BETA (CLOSED BETA TEST PLAN)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Ma Trận Kịch Bản Kiểm Thử Beta (Beta Test Cases Matrix)

| Test ID | Phân Hệ | Thao Tác Thực Tế Của Người Dùng | Tiêu Chí Đạt (Pass Criteria) |
|:---|:---|:---|:---|
| **BETA-AUTH-001** | `AUTH` | Trưởng tộc nhận link mời $\rightarrow$ Đăng ký & Đăng nhập | Tạo tài khoản thành công, tự động gắn quyền OWNER |
| **BETA-FAM-001** | `TENANT` | Khởi tạo hồ sơ Từ đường & Địa chỉ nhà thờ họ | Lưu trữ đầy đủ địa chỉ, giới thiệu và hình ảnh gia huy |
| **BETA-GEN-001** | `GENEALOGY` | Nạp file phả hệ qua Data Import Wizard 4 bước | Validate lỗi $\rightarrow$ Preview $\rightarrow$ Nạp thành công vào CSDL |
| **BETA-GEN-002** | `GENEALOGY` | Tương tác Cây Phả Hệ trên iPad / Tablet / Mobile | Zoom, Pan, Lọc thế hệ mượt mà, không tràn khung hình |
| **BETA-LUNAR-001** | `LUNAR` | Thiết lập ngày giỗ rơi vào tháng nhuận hoặc ngày 30 | Tự động chuyển đổi chính xác ngày Dương lịch năm nay |
| **BETA-EVT-001** | `EVENTS` | Tạo sự kiện Giỗ Tổ họ và họp họ đầu xuân | Thông báo tự động hiển thị trên Dashboard con cháu |
| **BETA-FIN-001** | `FINANCE` | Thủ quỹ tạo đợt thu quỹ thường niên 2026 | Tự động phân bổ danh sách nộp cho các thành viên |
| **BETA-FIN-002** | `FINANCE` | Ghi nhận thu tiền quỹ qua VietQR hoặc Tiền mặt | Tự động tạo bút toán `POSTED`, cộng số dư quỹ nguyên tử |
| **BETA-FIN-003** | `FINANCE` | Ban Kiểm Soát duyệt phiếu chi mua sắm đồ lễ | Trừ tiền quỹ nguyên tử sau khi bấm "Duyệt chi" |
| **BETA-NOTIF-001**| `NOTIF` | Nhận thông báo nhắc ngày giỗ trước 7 ngày | Email và thông báo In-app được gửi đúng người nhận |
| **BETA-BILL-001** | `BILLING` | Xem hạn mức sử dụng (Members Quota / Storage) | Thanh đo hiển thị chính xác số thành viên thực tế |
| **BETA-PAY-001** | `PAYMENT` | Quét mã VietQR Sandbox để gia hạn gói cước | Webhook ngân hàng xác nhận $\rightarrow$ Thuê bao kích hoạt |
