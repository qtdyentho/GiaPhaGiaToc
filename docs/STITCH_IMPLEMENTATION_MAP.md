# BẢN ĐỒ ÁNH XẠ TRIỂN KHAI GIAO DIỆN (STITCH IMPLEMENTATION MAP)
# PHASE E — COMPONENT & SERVICE CONTRACT MAPPING
# DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)

---

## 🏛️ 1. NGUYÊN TẮC ÁNH XẠ KIẾN TRÚC (ZERO SERVICE REWRITE)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   LUỒNG TÍCH HỢP TỪ STITCH SANG REACT COMPONENTS                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STITCH DESIGN COMPONENT                                                                │
│        ↓                                                                               │
│ REACT UI COMPONENT (src/components/ui/ & src/components/)                              │
│        ↓                                                                               │
│ EXISTING FRONTEND HOOKS & REACT-QUERY                                                  │
│        ↓                                                                               │
│ EXISTING BUSINESS SERVICES (GenealogyService, FundService, BillingService, etc.)       │
│        ↓                                                                               │
│ SUPABASE POSTGRESQL & ATOMIC RPC (Zero database / schema changes)                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. BẢNG MA TRẬN ÁNH XẠ THÀNH PHẦN (COMPONENT INTEGRATION MATRIX)

| STT | Stitch Design Name | React Component Path | Existing Backend Service | State & Type Contracts | Safe UI Modifications |
|:---:|:---|:---|:---|:---|:---|
| 1 | **Data Import Wizard** | `src/components/genealogy/DataImportWizardModal.tsx` | `GenealogyService.importDataBatch` | `ImportStep`, `ParsedMember`, `ValidationResult` | Cập nhật Stepper 5 bước, bảng preview lỗi |
| 2 | **Bulk Assessment Modal** | `src/components/finance/BulkAssessmentModal.tsx` | `FundService.createBulkAssessment` | `Fund`, `IncomeAssessment`, `BulkAssessmentParams`| Cập nhật bộ lọc chi phái, tính tổng dự thu |
| 3 | **Expense Approval Modal** | `src/components/finance/ExpenseApprovalModal.tsx` | `FundService.approveExpense` | `ExpenseRecord`, `ApprovalLog`, `ExpenseStatus` | Thêm khung đa chữ ký, số dư quỹ sau chi |
| 4 | **Reversal Modal** | `src/components/finance/ReversalModal.tsx` | `FundService.reversalTransaction` | `FinancialTransaction`, `ReversalParams` | Thêm sơ đồ đảo bút toán và audit reason |
| 5 | **Export Tree Modal** | `src/components/genealogy/ExportTreeModal.tsx` | `GenealogyService.exportTreeData` | `ExportFormat`, `ExportOptions` | Thêm thẻ lựa chọn 4 định dạng dạng grid |
| 6 | **Invite Register Page** | `src/pages/InviteRegisterPage.tsx` | `AuthService.registerWithInvite` | `InviteToken`, `RegisterCredentials` | Thêm card định danh thành viên và badge họ tộc|
| 7 | **Genealogy Tree View** | `src/pages/GenealogyTreePage.tsx` | `GenealogyService.getFamilyTree` | `FamilyMember`, `Relationship` | Nền giấy dó sáng, node avatar tròn xanh lá |
| 8 | **Finance Dashboard** | `src/pages/FinanceDashboardPage.tsx` | `FundService.getSummary` | `FundSummary`, `Fund`, `Transaction` | StatCards 4 chỉ số, bảng quỹ di sản |
| 9 | **Billing Overview** | `src/pages/BillingOverviewPage.tsx` | `BillingService.getCurrentSubscription`| `Subscription`, `Invoice`, `Plan` | Card gói cước di sản, VietQR modal |
| 10 | **Admin Payments Queue** | `src/pages/admin/AdminPaymentsPage.tsx` | `AdminBillingService.adminConfirmPayment`| `Invoice`, `PaymentAuditParams` | Modal xác nhận sao kê ngân hàng thủ công |

---

## 🔒 3. CAM KẾT BẢO TOÀN KIẾN TRÚC & DỮ LIỆU
- **100% Type Safety**: Mọi trường dữ liệu tuân thủ `src/types/database.ts`.
- **100% Test Continuity**: Đảm bảo 8/8 test suites tiếp tục PASS 100%.
- **Zero Mock Overwrite**: Giữ nguyên dữ liệu Family Alpha, Beta, Gamma.
