# SỔ TAY PHỤC HỒI THẢM HỌA (DISASTER RECOVERY RUNBOOK)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

---

## 🛠️ 1. Quy Trình Diễn Tập Phục Hồi (Restore Drill Protocol)

```
[1. Phát hiện sự cố / Yêu cầu Restore]
       ↓
[2. Tạm dừng kết nối ghi dữ liệu (Read-Only Safety Lock)]
       ↓
[3. Trích xuất bản sao lưu Snapshot gần nhất / PITR]
       ↓
[4. Khôi phục CSDL sang cụm Database Standby]
       ↓
[5. Chạy Kiểm Tra Checksum Toàn Vẹn Dữ Liệu (Data Integrity Checksum)]
       ├── Kiểm tra số lượng thành viên (Member count)
       ├── Kiểm tra quan hệ phả hệ (Relationship count)
       ├── Kiểm tra số dư quỹ & giao dịch posted (Ledger balance)
       └── Kiểm tra trạng thái gói cước (Subscriptions)
       ↓
[6. Kích hoạt chuyển hướng Domain / Traffic sang cụm mới]
       ↓
[7. Mở khóa toàn quyền và gửi Báo cáo Postmortem]
```
