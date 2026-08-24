# 🛡️ CHIẾN LƯỢC SAO LƯU & KHÔI PHỤC THẢM HỌA (DISASTER RECOVERY PLAN)
## DỰ ÁN: GIA PHẢ GIA TỘC (ENTERPRISE EDITION)

---

## 1. Mục Tiêu Khôi Phục (Recovery Objectives)

| Tham Số | Chỉ Số Mục Tiêu | Diễn Giải |
|:---|:---|:---|
| **RPO (Recovery Point Objective)** | **≤ 1 Giờ** (Mất dữ liệu tối đa) | Dữ liệu gia phả & tài chính không được mất quá 1 giờ ghi nhận. |
| **RTO (Recovery Time Objective)** | **≤ 2 Giờ** (Thời gian gián đoạn tối đa) | Hệ thống phải khôi phục hoạt động hoàn toàn trong vòng 2 giờ kể từ khi sự cố xảy ra. |
| **Data Retention** | **7 Năm** | Lưu trữ lịch sử kế toán kép (Sổ quỹ) & Nhật ký kiểm toán (Audit Logs) bất biến. |

---

## 2. Chiến Lược Sao Lưu (Backup Architecture)

### 2.1. CSDL PostgreSQL (Supabase Enterprise Managed)
- **Continuous WAL Archiving (Write-Ahead Logging)**: Ghi log giao dịch liên tục cho tính năng **Point-In-Time Recovery (PITR)** xuống đến từng giây trong 7 ngày gần nhất.
- **Daily Physical Snapshot**: Tự động chụp snapshot toàn bộ cụm CSDL vào 02:00 sáng hàng ngày (GMT+7) và lưu trữ đa vùng (Multi-Region S3/GCS Cold Storage).
- **Logical Dump (`pg_dump`)**: Xuất schema và dữ liệu dạng nén `.sql.gz` mã hóa AES-256 hàng tuần.

### 2.2. Object Storage (Hình ảnh, Tài liệu, Hóa đơn)
- **Bucket Versioning**: Kích hoạt Object Versioning trên các bucket `avatars`, `documents`, `receipts`.
- **Cross-Region Replication**: Tự động đồng bộ sang bucket thứ cấp (Secondary Storage Bucket).

---

## 3. Quy Trình Khôi Phục Dữ Liệu (Restore Procedure)

### Kịch Bản 1: Khôi phục tức thời theo thời gian (PITR Restore)
Áp dụng khi xảy ra lỗi thao tác hàng loạt hoặc rủi ro logic:
```bash
# 1. Truy cập Supabase Dashboard -> Database -> Backups -> Point in Time
# 2. Chọn mốc thời gian chính xác trước khi sự cố xảy ra (e.g. 2026-08-24 10:15:00 UTC+7)
# 3. Kích hoạt 'Restore to New Instance' hoặc khôi phục ghi đè.
```

### Kịch Bản 2: Khôi phục từ bản sao lưu Logical Dump (`pg_dump`)
```bash
# Khôi phục schema và dữ liệu từ file dump đã được kiểm toán
psql -h db.supabase.co -U postgres -d postgres -f /backups/giapha_snapshot_20260824.sql
```

### Kịch Bản 3: Đảo ngược bút toán tài chính (Ledger Reversal)
Tuyệt đối không can thiệp xóa dữ liệu thủ công trong CSDL. Khi có sai lệch thu chi, sử dụng hàm RPC bảo mật:
```sql
SELECT reverse_financial_transaction(
    'family-uuid-here',
    'transaction-uuid-here',
    'Lý do đảo ngược bút toán...',
    'admin-user-uuid'
);
```

---

## 4. Báo Cáo Tuân Thủ & Trạng Thái Sẵn Sàng (Readiness Status)

- **Database Backup Engine**: ✅ Hỗ trợ PITR & Daily Automated Snapshots.
- **Storage Protection**: ✅ Bucket Versioning & RLS Policies.
- **Audit Trails**: ✅ Bảng `audit_logs` & `billing_audit_logs` ghi nhận 100% thay đổi.
