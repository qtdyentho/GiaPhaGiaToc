# KẾ HOẠCH TRIỂN KHAI THEO TỪNG GIAI ĐOẠN (UI REDESIGN & RECONCILIATION PLAN)
# DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)

---

## 🗺️ 1. PHÂN KỲ TRIỂN KHAI 5 GIAI ĐOẠN CHI TIẾT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LỘ TRÌNH TRIỂN KHAI 5 GIAI ĐOẠN                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 1: AUDIT & INVENTORY (Hoàn tất)                                   │
│ • Quét 100% routes, pages, modals, components.                             │
│ • Xuất bản UI_SCREEN_INVENTORY.md và STITCH_SCREEN_MAPPING.md.              │
│                                                                             │
│ GIAI ĐOẠN 2: DESIGN SYSTEM & CORE LAYOUT ALIGNMENT                          │
│ • Cố định Sidebar 280px, Navigation nhóm, Mobile Drawer.                    │
│ • Sử dụng bộ UI components dùng chung src/components/ui/.                   │
│                                                                             │
│ GIAI ĐOẠN 3: SUBSYSTEM UI RECONCILIATION                                    │
│ • Đồng bộ Phân hệ Phả hệ (Tree, Members, Profile).                          │
│ • Đồng bộ Phân hệ Lịch âm & Ngày giỗ (Calendar, Memorials, Events).         │
│ • Đồng bộ Phân hệ Tài chính & Sổ quỹ (Ledger, Assessments, Expenses).      │
│ • Đồng bộ Phân hệ Billing (VietQR, Manual Confirmation, Usage).             │
│ • Đồng bộ Phân hệ Super Admin & Closed Beta Monitoring.                     │
│                                                                             │
│ GIAI ĐOẠN 4: RESPONSIVE & VISUAL QA                                         │
│ • Kiểm thử hiển thị trên 3 kích thước: Desktop, Tablet, Mobile.             │
│ • Xác nhận 10 tiêu chí thị giác không có lỗi vỡ khung.                      │
│                                                                             │
│ GIAI ĐOẠN 5: AUTOMATED REGRESSION & PRODUCTION DELIVERY                     │
│ • Chạy 8/8 test suites (172/172 tests PASS 100%).                           │
│ • Biên dịch tsc && vite build thành công 0 lỗi.                             │
│ • Commit và push lên GitHub origin/main.                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 2. NGUYÊN TẮC BẢO TOÀN DỮ LIỆU & NGHIỆP VỤ
1. **Zero Database Changes**: Không can thiệp cấu trúc bảng hoặc RLS đã hoạt động ổn định.
2. **Zero Test Data Loss**: Dữ liệu Family Alpha (86 TV), Beta (300 TV), Gamma (500 TV) được bảo vệ 100%.
3. **Billing Production Invariant**: Duy trì mô hình VietQR $\rightarrow$ Chờ Admin đối soát sao kê $\rightarrow$ Duyệt thủ công.
