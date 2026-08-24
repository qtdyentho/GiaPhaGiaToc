# BẢNG TỔNG HỢP KIỂM THỬ HỆ THỐNG (TEST INVENTORY SANITY RECORD)
# DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)

---

## 📊 1. Phân Bổ Danh Mục Kiểm Thử (83/83 Tests Pass)

| Nhóm Kiểm Thử | File Test | Số Lượng Test | Chi Tiết Kịch Bản | Trạng Thái |
|:---|:---|:---:|:---|:---:|
| **Phase 1: Alpha Full Execution** | `tests/alpha_full_execution.test.ts` | **16** | Auth (2), RLS (3), Quota Guard (2), Read-Only (1), Webhook & Atomic RPC (5), Lunar (1), Immutable Ledger (2) | ✅ PASS |
| **Phase 2: Financial Core** | `tests/phase2_financial_core.test.ts` | **20** | `FIN-001`..`FIN-020` (Fund, Assessment, Expense, Reversal, Contribution, Diamond Tier, Webhook, Idempotency, RLS) | ✅ PASS |
| **Phase 3A: Lunar Golden Dataset** | `tests/lunar_golden_dataset.test.ts` | **26** | Tết 2020-2033 (11), Leap Years (5), Leap Convert (2), Month Lengths 29/30 (2), 30th Fallback (1), Can Chi (4), 1096-day Roundtrip (1) | ✅ PASS |
| **Phase 3B: Calendar & Memorial Engine** | `tests/phase3_calendar_engine.test.ts` | **21** | `LUNAR-001`..`005` (5), `MEM-001`..`003` (3), `EVENT-001`..`004` (4), `REM-001`..`006` (6), `RLS-CAL-001`..`003` (3) | ✅ PASS |
| **TỔNG CỘNG ĐÃ THỰC THI** | | **83** | **100% Khớp với Báo cáo Nghiệm thu** | ✅ **ALL PASS** |

> **Giải trình chênh lệch 20 planned vs 21 executed trong Phase 3**:
> Trong tài liệu quy hoạch ban đầu `PROMT/GD3.MD`, mục tiêu đặt ra là 20 kịch bản kiểm thử. Khi triển khai thực tế, bộ kiểm thử RLS Multi-Tenant Calendar đã được tách thành **3 test case độc lập** (`RLS-CAL-001` Calendar, `RLS-CAL-002` Memorials, `RLS-CAL-003` Events) thay vì gom chung, nâng tổng số test thực thi từ 20 lên 21 tests. Toàn bộ 21 tests đều được tự động hóa và chạy PASS trong `npm test`.

---

## 🎯 2. Kế Hoạch Bổ Sung Kiểm Thử Cho Phase 4 (Commercial SaaS)

Phase 4 sẽ bổ sung thêm file `tests/phase4_commercial_saas.test.ts` bao gồm **20 kịch bản chuyên sâu**:
1. `SUB-001`: Create 30-day Trial
2. `SUB-002`: Trial Expiry detection
3. `SUB-003`: Trial Conversion to Active
4. `SUB-004`: Upgrade Plan (GiaToc $\rightarrow$ DongHo)
5. `SUB-005`: Downgrade Plan (at period end)
6. `SUB-006`: Cancel Subscription (at period end)
7. `SUB-007`: Resume Subscription
8. `SUB-008`: Expired / Cancelled Subscription $\rightarrow$ `READ_ONLY` grace mode (Zero Data Loss)
9. `QUOTA-001`: 299/300 members (Allowed)
10. `QUOTA-002`: 300/300 members (Max reach)
11. `QUOTA-003`: 301/300 members (Blocked by QuotaGate)
12. `PAY-001`: Valid VietQR Payment Intent
13. `PAY-002`: Invalid HMAC Webhook signature rejected (401)
14. `PAY-003`: Wrong/Underpayment recorded as `PARTIAL` (No activation)
15. `PAY-004`: Overpayment flagged for Admin review
16. `PAY-005`: Duplicate Webhook Idempotency (No double extension)
17. `ATOMIC-001`: Atomic RPC (Payment `SUCCESS` + Invoice `PAID` + Subscription `ACTIVE`)
18. `REFUND-001`: Full / Partial refund recorded without deleting payment history
19. `RLS-BILL-001`: Multi-tenant RLS isolation for Subscriptions, Invoices & Payments
20. `ADMIN-BILL-001`: Super Admin / Billing Admin revenue dashboard & override audit logs
