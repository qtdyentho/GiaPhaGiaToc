# 🛠️ SỔ TAY XỬ LÝ SỰ CỐ DÀNH CHO ĐỘI HỖ TRỢ (BETA SUPPORT RUNBOOK)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Quy Trình Chẩn Đoán 5 Bước Chuẩn (Standard Support Flow)
`Detection (Phát hiện)` $\rightarrow$ `Diagnosis (Chẩn đoán)` $\rightarrow$ `Resolution (Xử lý)` $\rightarrow$ `Verification (Xác minh)` $\rightarrow$ `Postmortem (Đúc kết)`

---

## 2. Bảng Hướng Dẫn Xử Lý Các Vấn Đề Thực Tế Thường Gặp

| Vấn Đề Gặp Phải | Nguyên Nhân Tiềm Ẩn | Hướng Xử Lý Cụ Thể (Actionable Fix) |
|:---|:---|:---|
| **1. Không đăng nhập được** | Quên mật khẩu hoặc nhập sai định dạng email | Hướng dẫn Trưởng họ sử dụng tính năng Đặt lại mật khẩu hoặc kiểm tra danh sách `profiles` trong database. |
| **2. Cây phả hệ bị đứt gãy quan hệ** | Khi import file Excel bị sai tên cụ Thủy Tổ hoặc lệch thế hệ | Mở **Data Import Wizard** $\rightarrow$ Dùng tính năng Preview để chỉ ra dòng bị sai $\rightarrow$ Chỉnh sửa tên cha/mẹ khớp chính xác. |
| **3. Ngày giỗ hiển thị lệch Dương lịch** | Nhầm lẫn giữa năm nhuận âm lịch và năm thường | Giải thích cơ chế chuyển đổi thiên văn Hồ Ngọc Đức (UTC+7) tự động căn chỉnh theo tháng nhuận thực tế. |
| **4. Ghi nhầm số tiền thu quỹ** | Thủ quỹ nhập nhầm từ 500k thành 5 triệu | **Tuyệt đối không xóa giao dịch**. Sử dụng tính năng **Đảo ngược bút toán (Reversal)** để hoàn trả số dư nguyên tử và ghi lại phiếu thu mới. |
| **5. Ban Kiểm Soát không thấy nút Duyệt chi** | Người dùng đang đăng nhập bằng tài khoản vai trò MEMBER | Vào trang Phân quyền (`/app/settings/permissions`) $\rightarrow$ Nâng quyền người dùng lên `APPROVER` (Ban Kiểm Soát). |
| **6. Đã chuyển khoản nhưng gói chưa kích hoạt** | Chuyển khoản sai cú pháp nội dung `GP INV...` | Vào Quản trị Doanh thu $\rightarrow$ Tab "Chờ khớp (Unreconciled)" $\rightarrow$ Khớp thủ công với mã hóa đơn của gia tộc. |
| **7. Hết hạn dùng thử Trial 30 ngày** | Gia tộc hết thời gian Beta | Kích hoạt gia hạn thêm 14 ngày dùng thử trong Admin Portal hoặc hỗ trợ chuyển sang gói Trải nghiệm (Free). |
