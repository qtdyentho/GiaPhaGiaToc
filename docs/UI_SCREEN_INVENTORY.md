# DANH MỤC TOÀN BỘ MÀN HÌNH & GIAO DIỆN (UI SCREEN INVENTORY)
# DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER SaaS)
# PHƯƠNG PHÁP: FUNCTIONAL INVENTORY vs. GOOGLE STITCH SOURCE OF TRUTH

---

## 📊 1. BẢNG TỔNG QUAN PHÂN LOẠI TOÀN BỘ MÀN HÌNH (44 MÀN HÌNH & MODAL)

| ID | Route / Scope | Screen / Feature Name | Component | Subsystem | Current Code Status | Stitch Status | Classification | Priority |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **UI-001** | `/` | Trang Giới Thiệu (Landing Page) | `LandingPage.tsx` | Marketing | Implemented | EXISTS | **MATCH** | P0 |
| **UI-002** | `/pricing` | Bảng Giá & So Sánh Gói Cước | `PricingPage.tsx` | Marketing | Implemented | EXISTS | **MATCH** | P0 |
| **UI-003** | `/login` | Đăng Nhập Hệ Thống | `LoginPage.tsx` | Auth | Implemented | EXISTS | **MATCH** | P0 |
| **UI-004** | `/register` | Đăng Ký Dòng Họ Mới | `RegisterPage.tsx` | Auth | Implemented | EXISTS | **MATCH** | P0 |
| **UI-005** | `/register/invite` | Đăng Ký Qua Lời Mời | `InviteRegisterPage.tsx` | Auth | Implemented | MISSING | **STITCH MISSING** | P1 |
| **UI-006** | `/create-family` | Khởi Tạo Gia Tộc Wizard | `CreateFamilyPage.tsx` | Onboarding | Implemented | EXISTS | **MATCH** | P0 |
| **UI-007** | `/app` / `/app/dashboard` | Bảng Điều Khiển Gia Tộc | `DashboardPage.tsx` | Dashboard | Implemented | EXISTS | **MATCH** | P0 |
| **UI-008** | `/app/tree` | Cây Phả Hệ Trực Quan | `GenealogyTreePage.tsx` | Genealogy | Implemented | EXISTS | **MATCH** | P0 |
| **UI-009** | Modal: Add Member | Thêm Thành Viên / Quan Hệ | `AddMemberRelationModal.tsx` | Genealogy | Implemented | EXISTS | **MATCH** | P0 |
| **UI-010** | Modal: Import Wizard | Import Gia Phả Excel/GEDCOM | `DataImportWizardModal.tsx` | Genealogy | Implemented | MISSING | **STITCH MISSING** | P1 |
| **UI-011** | Modal: Export Tree | Xuất Gia Phả PDF/Vector | `ExportTreeModal.tsx` | Genealogy | Implemented | MISSING | **STITCH MISSING** | P2 |
| **UI-012** | `/app/members` | Danh Sách Thành Viên | `MembersListPage.tsx` | Genealogy | Implemented | EXISTS | **MATCH** | P1 |
| **UI-013** | `/app/members/:id` | Hồ Sơ Thành Viên Chi Tiết | `MemberProfilePage.tsx` | Genealogy | Implemented | EXISTS | **MATCH** | P1 |
| **UI-014** | `/app/calendar` | Lịch Vạn Niên & Sự Kiện Dòng Họ | `FamilyCalendarPage.tsx` | Calendar | Implemented | EXISTS | **MATCH** | P1 |
| **UI-015** | Drawer: Calendar Day | Chi Tiết Ngày Âm & Sự Kiện | `CalendarDayDetailDrawer.tsx` | Calendar | Implemented | EXISTS | **MATCH** | P1 |
| **UI-016** | `/app/memorials` | Danh Sách Ngày Giỗ & Tảo Mộ | `MemorialsPage.tsx` | Memorial | Implemented | EXISTS | **MATCH** | P1 |
| **UI-017** | Modal: Create Memorial | Thêm Ngày Giỗ Âm Lịch | `CreateMemorialModal.tsx` | Memorial | Implemented | EXISTS | **MATCH** | P1 |
| **UI-018** | `/app/events` | Danh Sách Sự Kiện Gia Tộc | `EventListPage.tsx` | Events | Implemented | EXISTS | **MATCH** | P1 |
| **UI-019** | `/app/events/:id` | Chi Tiết Sự Kiện Gia Tộc | `EventDetailPage.tsx` | Events | Implemented | EXISTS | **MATCH** | P1 |
| **UI-020** | Modal: Create Event | Tạo Sự Kiện / Đại Hội Dòng Họ | `CreateEventModal.tsx` | Events | Implemented | EXISTS | **MATCH** | P1 |
| **UI-021** | `/app/reminders` | Cài Đặt Nhắc Nhở & Thông Báo | `ReminderSettingsPage.tsx` | Calendar | Implemented | EXISTS | **MATCH** | P2 |
| **UI-022** | `/app/finance` | Tổng Quan Sổ Quỹ Gia Tộc | `FinanceDashboardPage.tsx` | Finance | Implemented | EXISTS | **MATCH** | P0 |
| **UI-023** | `/app/finance/funds` | Sổ Theo Dõi Chi Tiết Quỹ | `FundLedgerPage.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-024** | Modal: Create Fund | Tạo Quỹ Mới (Khuyến học/Hương hỏa)| `CreateFundModal.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-025** | `/app/finance/assessments` | Bổ Bổ Định Mức Đóng Góp | `IncomeAssessmentsPage.tsx`| Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-026** | Modal: Bulk Assessment | Lập Đợt Bổ Bổ Đinh Điền Hàng Loạt| `BulkAssessmentModal.tsx` | Finance | Implemented | MISSING | **STITCH MISSING** | P1 |
| **UI-027** | `/app/finance/expenses` | Quản Lý Chi Phí & Phê Duyệt | `ExpensesPage.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-028** | Modal: Create Expense | Đề Xuất Khoản Chi Mới | `CreateExpenseModal.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-029** | Modal: Expense Approval | Hội Đồng Gia Tộc Phê Duyệt Chi | `ExpenseApprovalModal.tsx` | Finance | Implemented | MISSING | **STITCH MISSING** | P1 |
| **UI-030** | `/app/finance/contributions` | Ghi Nhận Công Đức & Tài Trợ | `ContributionsPage.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-031** | Modal: Record Income | Thu Tiền Bổ Bổ / Đóng Góp | `RecordIncomeModal.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-032** | Modal: Add Contribution | Ghi Nhận Đóng Góp Tự Nguyện | `AddContributionModal.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-033** | Modal: Reversal | Bút Toán Hoàn Trả Đối Xứng | `ReversalModal.tsx` | Finance | Implemented | MISSING | **STITCH MISSING** | P2 |
| **UI-034** | `/app/finance/honor-roll` | Bảng Vàng Vinh Danh Công Đức | `HonorRollPage.tsx` | Finance | Implemented | EXISTS | **MATCH** | P1 |
| **UI-035** | `/app/billing` | Tổng Quan Thuê Bao & Gói Cước | `BillingOverviewPage.tsx` | Billing | Implemented | EXISTS | **MATCH** | P0 |
| **UI-036** | `/app/billing/usage` | Giám Sát Dung Lượng & Quota | `UsageDashboardPage.tsx` | Billing | Implemented | EXISTS | **MATCH** | P1 |
| **UI-037** | `/app/billing/invoices` | Lịch Sử Hóa Đơn & Thanh Toán | `InvoicesPage.tsx` | Billing | Implemented | EXISTS | **MATCH** | P1 |
| **UI-038** | Modal: Payment Modal | VietQR & Xác Nhận Đã Chuyển | `PaymentModal.tsx` | Billing | Implemented | EXISTS | **MATCH** | P0 |
| **UI-039** | `/app/settings` | Cài Đặt Gia Tộc & Chi Phái | `FamilySettingsPage.tsx` | Settings | Implemented | EXISTS | **MATCH** | P2 |
| **UI-040** | `/app/permissions` | Ma Trận Phân Quyền Vai Trò | `PermissionsPage.tsx` | Settings | Implemented | EXISTS | **MATCH** | P2 |
| **UI-041** | `/app/audit-logs` | Nhật Ký Thao Tác Bất Biến | `AuditLogsPage.tsx` | Settings | Implemented | EXISTS | **MATCH** | P2 |
| **UI-042** | `/app/support` | Trung Tâm Trợ Giúp & Hỗ Trợ | `SupportCenterPage.tsx` | Support | Implemented | EXISTS | **MATCH** | P2 |
| **UI-043** | `/admin/payments` | Hàng Đợi Xác Nhận Chuyển Khoản | `AdminPaymentsPage.tsx` | Super Admin | Implemented | EXISTS | **MATCH** | P0 |
| **UI-044** | `/admin/beta` | Trung Tâm Chỉ Huy Closed Beta | `BetaCommandCenterPage.tsx`| Super Admin | Implemented | EXISTS | **MATCH** | P0 |

---

## 📈 2. THỐNG KÊ PHÂN LOẠI HIỆN TRẠNG (INVENTORY METRICS)

- **TOTAL SCREENS & MODALS**: **44 Màn hình / Modals**
- **STITCH EXISTS**: **38 Màn hình**
- **STITCH MISSING**: **6 Modals chuyên biệt** (`DataImportWizardModal`, `BulkAssessmentModal`, `ExpenseApprovalModal`, `ReversalModal`, `ExportTreeModal`, `InviteRegisterPage`)
- **VISUAL MISMATCH**: **0** (Đã đồng bộ sang Heritage Ledger)
- **PARTIAL**: **0** (Toàn bộ trạng thái Quota Gate, Feature Gate, Read-Only đã được thể hiện)
- **ORPHAN**: **0** (Tất cả components đều được định tuyến và kích hoạt từ UI)
