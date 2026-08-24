# 🚨 QUY TRÌNH PHẢN ỨNG SỰ CỐ KHẨN CẤP (BETA INCIDENT RESPONSE PLAN)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Phân Cấp Mức Độ Nghiêm Trọng Của Sự Cố (Incident Severity Matrix)

| Cấp Độ | Định Nghĩa Sự Cố | Thời Gian Phản Hồi (SLA) | Hành Động Bắt Buộc |
|:---:|:---|:---:|:---|
| **P0** | **Mất mát dữ liệu / Rò rỉ an ninh chéo Tenant** | **$\le 15$ Phút** | Dừng triển khai ngay lập tức $\rightarrow$ Kích hoạt bảo vệ sao lưu PITR $\rightarrow$ Cô lập phiên $\rightarrow$ Khắc phục khẩn cấp. |
| **P1** | **Toàn bộ hệ thống hoặc CSDL không truy cập được** | **$\le 30$ Phút** | Chuyển đổi sang máy chủ dự phòng (Failover) $\rightarrow$ Khôi phục kết nối Supabase. |
| **P2** | **Chức năng chính bị lỗi (Không import được, sai lịch âm)**| **$\le 2$ Giờ** | Đội kỹ thuật sửa lỗi và phát hành bản vá (Hotfix) trong ngày. |
| **P3** | **Lỗi hiển thị nhỏ / Lệch giao diện CSS trên thiết bị lạ** | **$\le 24$ Giờ** | Ghi nhận vào backlog và cải thiện trong bản cập nhật tuần. |

---

## 2. Quy Trình 6 Bước Xử Lý Sự Cố Khẩn Cấp (P0 / P1)
`1. PHÁT HIỆN & CẢNH BÁO` $\rightarrow$ `2. CÔ LẬP NGUỒN GÂY LỖI` $\rightarrow$ `3. BẢO TỒN DỮ LIỆU & BẰNG CHỨNG` $\rightarrow$ `4. TRIỂN KHAI BẢN VÁ` $\rightarrow$ `5. KIỂM THỬ XÁC MINH` $\rightarrow$ `6. THÔNG BÁO & BÁO CÁO POSTMORTEM`
