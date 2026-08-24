# KIẾN TRÚC USAGE & QUOTA ENFORCEMENT ENGINE
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

Tài liệu này đặc tả quy chế đo lường tài nguyên và cơ chế bảo vệ trần hạn mức (Quota Ceiling).

---

## 📊 1. Bảng Đo Lường 7 Chỉ Số Hạn Mức

| Mã Tính Năng | Tên Tính Năng | Gói Gia Đình | Gói Gia Tộc | Gói Đại Tộc |
|:---|:---|:---:|:---:|:---:|
| `MAX_MEMBERS` | Thành viên tối đa | 100 người | 300 người | 1.000 người |
| `MAX_BRANCHES` | Số chi / nhánh dòng họ | 3 chi | 10 chi | 30 chi |
| `MAX_EVENTS` | Sự kiện họ tộc / năm | 10 sự kiện | 50 sự kiện | Không giới hạn |
| `MAX_STORAGE` | Dung lượng lưu trữ | 1.0 GB | 5.0 GB | 20.0 GB |
| `MAX_EXPORTS` | Xuất cây gia phả PDF | 5 lượt/tháng | 20 lượt/tháng | Không giới hạn |
| `MAX_REPORTS` | Báo cáo tài chính chuyên sâu | 5 bản/tháng | 30 bản/tháng | Không giới hạn |
| `MAX_ADMINS` | Quản trị viên dòng họ | 2 người | 5 người | 15 người |

---

## 🚦 2. 4 Cấp Độ Cảnh Báo Tài Nguyên (Usage Levels)

1. **`NORMAL` (<80%)**: Trạng thái bình thường, thanh tiến trình màu xanh thương hiệu.
2. **`WARNING` (80% - 89%)**: Cảnh báo tài nguyên sắp đầy, hiển thị nhắc nhở nhẹ.
3. **`NEAR_LIMIT` (90% - 99%)**: Cận kề trần hạn mức, hiển thị nút nâng cấp gói.
4. **`LIMIT_REACHED` (100%)**: Chặn các thao tác thêm mới dữ liệu vượt hạn mức, hiển thị modal thông báo QuotaGate.
