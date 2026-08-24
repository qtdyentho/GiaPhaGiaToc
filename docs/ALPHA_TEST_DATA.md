# 🧪 TÀI LIỆU HƯỚNG DẪN BỘ DỮ LIỆU THỬ NGHIỆM (ALPHA TEST DATASET)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Mục Đích & Phạm Vi (Purpose & Scope)
Bộ dữ liệu `seed_alpha.sql` được thiết kế riêng cho môi trường **Tầng 1 — Internal Alpha Testing**.
- **Tuyệt đối không chứa thông tin khách hàng thật**.
- Bao phủ toàn bộ các trường hợp biên (Edge Cases): Cây gia phả lớn (500 thành viên), Chạm trần Quota (300/300 TV), Tháng nhuận âm lịch, Ngày giỗ 30 Tết Âm, Kế toán kép đảo ngược bút toán, và Cách ly đa gia tộc (Multi-tenant RLS).

---

## 2. Danh Sách 3 Gia Tộc & Tài Khoản Thử Nghiệm

| Tên Gia Tộc | Mã Gia Tộc | Quy Mô | Gói Cước & Trạng Thái | Tài Khoản Trưởng Họ (Owner) |
|:---|:---|:---:|:---|:---|
| **Đại Tộc Nguyễn Văn (Family Alpha)** | `ALPHA-NGUYEN` | **86 TV** (5 thế hệ, 3 chi) | Gói `GIA_TOC` (**ACTIVE** — Còn 214 suất) | `truongtoc.alpha@giapha.vn` |
| **Gia Tộc Trần Bá (Family Beta)** | `BETA-TRAN` | **300 TV** (5 thế hệ, 3 chi) | Gói `GIA_TOC` (**QUOTA FULL** — 300/300 TV) | `truongtoc.beta@giapha.vn` |
| **Dòng Họ Lê Quang (Family Gamma)** | `GAMMA-LE` | **500 TV** (5 thế hệ, 3 chi) | Gói `DONG_HO` (**READ_ONLY GRACE** — Hết hạn) | `truongtoc.gamma@giapha.vn` |

---

## 3. Các Trường Hợp Kiểm Thử Đặc Thù (Special Test Cases)

### 3.1. Kiểm thử Thuật toán Lịch Âm & Ngày Giỗ
1. **Ngày Giỗ Tháng Nhuận (Leap Month)**: Giỗ Ông Nguyễn Văn Trọng (Ngày 15 Tháng 6 Nhuận Âm Lịch).
2. **Ngày Giỗ Cuối Năm (30 Tháng Chạp)**: Giỗ tất niên Tiền Hiền Cụ Trọng.
3. **Nhiều ngày giỗ trong cùng 1 tháng**: Kiểm tra bộ lọc hiển thị lịch và phân bổ danh sách cúng giỗ.

### 3.2. Kiểm thử Tài Chính & Kế Toán Kép Bất Biến
1. **Bút toán Thu Quỹ (`POSTED`)**: Mã `THU-20260815-1001` (+500.000 ₫) $\rightarrow$ Tăng số dư Quỹ Hoạt Động.
2. **Bút toán Đảo ngược (`REVERSAL`)**: Mã `REV-THU-20260815-1001` (-500.000 ₫) $\rightarrow$ Triệt tiêu bút toán nhầm lẫn, bảo toàn 100% lịch sử kiểm toán.
3. **Quy trình Duyệt Chi**: Phiếu chi `EXPENSE` chỉ trừ quỹ khi có chữ ký điện tử của Ban Kiểm Soát.

### 3.3. Kiểm thử RLS & Cô Lập Dữ Liệu (Multi-Tenant Isolation)
- Khi đăng nhập bằng `truongtoc.alpha@giapha.vn`:
  - Thực hiện lệnh: `SELECT * FROM members WHERE family_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';`
  - **Kết quả mong đợi**: `0 rows returned` (Bị RLS chặn hoàn toàn).

---

## 4. Hướng Dẫn Nạp Dữ Liệu Vào Supabase Local / Staging

Chạy lệnh nạp seed qua Supabase CLI hoặc PostgreSQL Client:
```bash
# Nạp schema gốc
psql -h localhost -U postgres -d postgres -f ./DATABASE_SCHEMA.sql

# Nạp bộ dữ liệu thử nghiệm Alpha
psql -h localhost -U postgres -d postgres -f ./supabase/seed_alpha.sql
```
