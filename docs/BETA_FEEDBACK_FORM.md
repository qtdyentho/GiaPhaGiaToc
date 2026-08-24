# 📝 BIỂU MẪU THU THẬP Ý KIẾN ĐÓNG GÓP CLOSED BETA (BETA FEEDBACK FORM)
## DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 1. Cấu Trúc Bản Ghi Phản Hồi (Feedback Record Schema)

Mỗi phản hồi từ các Gia tộc Closed Beta được phân loại và lưu trữ theo mẫu chuẩn:

```json
{
  "feedback_id": "FB-202608-001",
  "family_name": "Đại Tộc Nguyễn Văn (Hà Nội)",
  "reporter_name": "Nguyễn Văn Hoàng (Trưởng Họ)",
  "reporter_email": "truongtoc.alpha@giapha.vn",
  "module": "GENEALOGY | LUNAR_CALENDAR | FINANCE | BILLING | MOBILE_UX | OTHER",
  "feedback_type": "BUG | FEATURE_REQUEST | UX_IMPROVEMENT | DATA_ISSUE",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "title": "Mong muốn phóng to chữ trên cây gia phả khi xem trên máy tính bảng",
  "description": "Các cụ cao niên trong dòng họ khi họp họ xem trên iPad cảm thấy cỡ chữ họ tên hơi nhỏ khi thu nhỏ toàn cảnh.",
  "status": "OPEN | IN_PROGRESS | RESOLVED | REJECTED",
  "assigned_to": "Frontend Team",
  "resolution_notes": "Đã bổ sung nút Zoom-Font và chế độ Chữ To (Large Text Mode) cho người cao tuổi."
}
```

---

## 2. Các Kênh Tiếp Nhận Phản Hồi Trực Tiếp
- **Nút Góp Ý Trong Ứng Dụng**: Tích hợp trên thanh AppHeader (`/app/dashboard`).
- **Kênh Hotline Trực Tiếp**: Hỗ trợ Trưởng tộc qua Zalo / Điện thoại 24/7.
- **Biểu Mẫu Khảo Sát Tuần 3**: Đánh giá chỉ số hài lòng CSAT và đo lường mức độ sẵn sàng chi trả (Willingness to Pay).
