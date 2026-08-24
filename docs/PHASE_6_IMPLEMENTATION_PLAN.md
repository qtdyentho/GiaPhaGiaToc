# KẾ HOẠCH TRIỂN KHAI TOÀN DIỆN GIAI ĐOẠN 6 (PHASE 6 IMPLEMENTATION PLAN)
# HERITAGE LEDGER — CLOSED BETA VALIDATION & PRODUCT OPERATIONS
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE — HERITAGE LEDGER)

> **Cập nhật:** 2026-08-24 | **Tiêu chuẩn:** CBI Phase 7.1 Plan-First Architecture | **Baseline:** 123/123 Tests PASS (100%)

---

## 🏛️ 1. Nguyên Tắc Kỹ Thuật Tối Thượng (Core Invariants)

$$\text{DATA INTEGRITY} > \text{SECURITY} > \text{AUDITABILITY} > \text{RELIABILITY} > \text{USER EXPERIENCE} > \text{FEATURE VELOCITY}$$

1. **Không phá vỡ thành quả Phase 1 → Phase 5**: Bảo toàn $100\%$ Cây phả hệ, Lịch âm UTC+7, Sổ Cái Bất Biến, Cổng thanh toán VietQR và Cơ chế Sao lưu PITR.
2. **Không số liệu giả (No Fake Metrics)**: Nếu metric chưa đủ dữ liệu thực tế từ các gia tộc thật $\rightarrow$ Hiển thị rõ ràng `NOT ENOUGH DATA`.
3. **Phân tách rạch ròi Test Fixtures và Real Evidence**: Mọi bằng chứng nghiệm thu Closed Beta (`Evidence Trail`) phải có mã tham chiếu giao dịch, bản ghi DB thực hoặc chữ ký kiểm toán.
4. **Data Integrity Watchdog**: Phát hiện, lập báo cáo, phát cảnh báo và yêu cầu con người rà soát (DETECT $\rightarrow$ REPORT $\rightarrow$ ALERT $\rightarrow$ HUMAN REVIEW). **Tuyệt đối không tự động sửa dữ liệu tài chính (No Auto-mutation of Ledger)**.

---

## 🗓️ 2. Cấu Trúc 7 Sprint Triển Khai

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 6.1: BETA COMMAND CENTER (/admin/beta)                                          │
│ • Tổng quan Closed Beta: Gia tộc kích hoạt, Phễu chuyển đổi, Chỉ số tương tác & Doanh thu.│
│ • Xử lý trạng thái `NOT ENOUGH DATA` minh bạch.                                         │
│ ──→ GATE 6.1: Admin Authorization & Multi-tenant RLS PASS                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6.2: FAMILY HEALTH SCORE & ACTIVATION FUNNEL                                    │
│ • Mô hình điểm sức khỏe gia tộc (0–100 điểm) theo trọng số chuẩn hóa:                 │
│   Data Completeness (25%) + Feature Adoption (20%) + Activity (20%) + Finance (15%)    │
│   + Calendar (10%) + Support Health (10%).                                             │
│ • Phân loại cấp độ: HEALTHY (>=80), AT_RISK (60-79), CRITICAL (<60).                   │
│ ──→ GATE 6.2: Family Health & Activation Calculation PASS                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6.3: DATA INTEGRITY WATCHDOG (/admin/integrity)                                 │
│ • Bộ lọc giám sát 10 lỗi phả hệ: Orphan member, Quan hệ vòng tròn, Sai thứ tự đời...   │
│ • Giám sát ngày giỗ âm lịch, sự kiện, sổ cái bất biến và gói cước.                     │
│ • Điểm toàn vẹn hệ thống (Integrity Score: 100 Healthy, 99-95 Warning, <80 Critical).  │
│ ──→ GATE 6.3: 0 False-negative Critical Integrity Cases                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6.4: FINANCIAL RECONCILIATION WATCHDOG (/admin/reconciliation)                 │
│ • Đối soát cân đối Sổ Cái: Opening + Income - Expense + Reversal = Closing Balance.     │
│ • Đối soát 3 bên: Bank Amount = Payment Amount = Invoice Amount.                      │
│ • Sinh báo cáo đối soát hàng ngày & tạo Reconciliation Incident khi có sai lệch.       │
│ ──→ GATE 6.4: Financial Reconciliation & Ledger Invariant PASS                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6.5: REAL BETA EVIDENCE & SUPPORT OPERATIONS (/admin/beta/evidence)             │
│ • Hồ sơ bằng chứng số hóa cho từng gia tộc (`BETA-FAM-XXXX`).                          │
│ • Phân loại bằng chứng: SCREENSHOT, LOG, DATABASE_RECORD, PAYMENT_REFERENCE, FEEDBACK. │
│ • Chặn tuyên bố thanh toán thật nếu không có mã giao dịch thực tế.                     │
│ ──→ GATE 6.5: Evidence Immutability & Fixture Isolation PASS                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6.6: 30-DAY RETENTION & COMMERCIAL VALIDATION                                   │
│ • Theo dõi giữ chân D1, D3, D7, D14, D21, D30 qua các hành vi có giá trị thực.         │
│ • Chỉ số thương mại: Tỷ lệ chuyển đổi Trial → Paid, Churn Rate, MRR, ARR, ARPU.       │
│ • Đo lường mức độ sẵn lòng chi trả (Willingness to Pay) qua khảo sát thực tế.          │
│ ──→ GATE 6.6: Retention & Commercial Metrics Calculation PASS                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 6.7: BETA EXIT AUDIT & COMMERCIAL GO / NO-GO DECISION (/admin/beta/exit-audit)  │
│ • Kiểm định 10 Cổng Chất Lượng Bắt Buộc (Mandatory Exit Gates):                         │
│   1. >= 5 Gia tộc thật onboarded      6. Không có sự cố P0/P1 chưa giải quyết          │
│   2. >= 95% Import dữ liệu thành công 7. CSAT >= 80% (Hài lòng người dùng)             │
│   3. TTFV <= 15 phút mục tiêu         8. D30 Retention >= 60%                          │
│   4. 0 Mất dữ liệu, 0 Lệch sổ cái     9. Willingness to Pay >= 60%                     │
│   5. 0 Rò rỉ dữ liệu chéo gia tộc     10. 100% Giao dịch thanh toán khớp lệnh          │
│ • Xuất quyết định: GO / NO-GO / CONDITIONAL GO.                                        │
│ ──→ GATE 6.7: Final Commercial Go-Live Gate PASS                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 3. Ma Trận Kiểm Thử Tự Động Phase 6 (25 Kịch Bản Mới)

Sẽ tạo file [`tests/phase6_closed_beta_operations.test.ts`](file:///d:/Antigravity%20Projects/GiaPhaGiaToc/tests/phase6_closed_beta_operations.test.ts):
- `P6-SEC-001`: Chặn truy cập trái phép Dashboard Beta chéo gia tộc.
- `P6-SEC-002`: Chặn User thường truy cập Admin Command Center.
- `P6-SEC-003` & `P6-SEC-004`: Kiểm soát phân quyền trên Endpoint Evidence và Reconciliation.
- `P6-DATA-001`: Phát hiện thành viên mồ côi (Orphan member).
- `P6-DATA-002`: Phát hiện quan hệ huyết thống vòng tròn (Cyclic relationship).
- `P6-DATA-003`: Phát hiện sai lệch thứ tự thế hệ (Generation inconsistency).
- `P6-DATA-004`: Phát hiện quan hệ huyết thống xuyên gia tộc (Cross-tenant relationship).
- `P6-DATA-005`: Phát hiện mất cân đối Sổ Cái (Ledger imbalance).
- `P6-DATA-006`: Phát hiện sai lệch Hóa đơn và Thanh toán.
- `P6-DATA-007`: Phát hiện sai lệch trạng thái Thuê bao và Thanh toán.
- `P6-FIN-001` - `P6-FIN-004`: Đối soát số dư quỹ, bút toán đảo, thanh toán trùng và khớp lệnh Webhook.
- `P6-BETA-001` - `P6-BETA-006`: Tính điểm sức khỏe Family Health, Phễu kích hoạt, TTFV, D7/D30 Retention và xử lý `NOT ENOUGH DATA`.
- `P6-EVIDENCE-001` - `P6-EVIDENCE-003`: Tạo bằng chứng, bảo vệ tính bất biến và chặn khai báo thanh toán thật giả mạo.
- `P6-ADMIN-001` - `P6-ADMIN-002`: Bắt buộc lý do kiểm toán khi Admin thao tác.
- `P6-EXIT-001` - `P6-EXIT-003`: Đánh giá 10 cổng Exit Gates, quyết định GO khi đủ bằng chứng và NO-GO khi vi phạm cổng bắt buộc.

**Tổng số bài kiểm thử sau Phase 6**: Nâng từ **123 lên 148/148 tests (100% PASS)**.
