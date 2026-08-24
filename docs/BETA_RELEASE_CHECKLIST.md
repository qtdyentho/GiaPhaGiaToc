# 📋 DANH SÁCH KIỂM TRA PHÁT HÀNH CLOSED BETA (BETA RELEASE CHECKLIST)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Kiểm Soát Biến Môi Trường (Environment Gating)

Hệ thống bắt buộc phân định 3 môi trường độc lập:
- `ENVIRONMENT = 'alpha'` (Dữ liệu thử nghiệm `seed_alpha.sql`)
- `ENVIRONMENT = 'beta'` (Dữ liệu thật của 5–10 gia tộc thử nghiệm kèm Trial 30 ngày)
- `ENVIRONMENT = 'production'` (Môi trường thương mại chính thức)

---

## 2. Bảng Kiểm Tra Sẵn Sàng Phát Hành Closed Beta (Release Checklist)

| Hạng Mục | Nội Dung Kiểm Tra | Trạng Thái |
|:---|:---|:---:|
| **Database & RLS** | Đã triển khai 36 Bảng PostgreSQL và kích hoạt 100% RLS | ✅ READY |
| **Data Import Wizard** | Hoàn tất trợ lý nạp dữ liệu 4 bước (Validate $\rightarrow$ Preview $\rightarrow$ Confirm $\rightarrow$ Commit) | ✅ READY |
| **Secrets & Keys** | 0 Service Role Keys trong client bundle; .env cấu hình chuẩn | ✅ READY |
| **Lunar Engine** | Thuật toán Hồ Ngọc Đức (UTC+7) chuẩn xác Can Chi và ngày giỗ nhuận | ✅ READY |
| **Immutable Ledger** | Bút toán `POSTED` bất biến, cơ chế Reversal đối ứng hoàn hảo | ✅ READY |
| **Bank Webhook** | Xác thực chữ ký HMAC SHA-256, Idempotency và Atomic RPC | ✅ READY |
| **Responsive UX** | Tương thích mượt mà từ Mobile 390px đến Desktop 4K | ✅ READY |
| **Build & Testing** | `npm run build` PASS (0 Errors) & `npm test` PASS (16/16 Test cases) | ✅ READY |
