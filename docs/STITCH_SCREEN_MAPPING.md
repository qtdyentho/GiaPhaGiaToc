# BẢNG MA TRẬN ÁNH XẠ GIAO DIỆN VỚI GOOGLE STITCH (STITCH SCREEN MAPPING)
# DỰ ÁN: GIA PHẢ GIA TỘC SaaS

---

## 🗺️ BẢNG CHI TIẾT ÁNH XẠ 37 ROUTES $\longleftrightarrow$ 47 STITCH SCREENS

| Mã UI | Đường Dẫn (Route) | Tên Phân Hệ & Màn Hình | Tên Màn Hình trên Google Stitch | Stitch Screen ID | Device Type | Component Tương Ứng |
|:---:|:---|:---|:---|:---|:---:|:---|
| **UI-001** | `/` | Public: Trang chủ Giới thiệu (Landing Page) | `Trang chủ - Gia Phả Gia Tộc` | `0c16d5813dc54a48be443cb90ae49a72` | Desktop | `src/pages/LandingPage.tsx` |
| **UI-002** | `/login` | Public: Đăng nhập | `Đăng nhập - Gia Phả Gia Tộc` | `63f455ee8ea04a5a810efcaad93332bf` | Desktop | `src/pages/LoginPage.tsx` |
| **UI-003** | `/register` | Public: Đăng ký | `Đăng ký - Gia Phả Gia Tộc` | `5709828ee7fc4484b94a0e9430b1ad9a` | Desktop | `src/pages/RegisterPage.tsx` |
| **UI-004** | `/pricing` | Public: Bảng giá & So sánh gói cước | `Bảng giá dịch vụ` & `So sánh gói dịch vụ` | `bc5450f15b5c44bb8d09ed9b658f059b`, `85c4027724f24e39` | Desktop | `src/pages/PricingPage.tsx` |
| **UI-005** | `/help` | Public: Hướng dẫn sử dụng & Trợ giúp | `Trung tâm trợ giúp` | `Help Center Instance` | Desktop | `src/pages/HelpPage.tsx` |
| **UI-006** | `/invite/:code` | Public: Đăng ký thành viên theo lời mời | `Đăng ký theo lời mời` | `Invite Screen Instance` | Desktop | `src/pages/InviteRegisterPage.tsx` |
| **UI-007** | `/onboarding/create-family` | Onboarding: Khởi tạo Dòng họ mới | `Khởi tạo Gia Tộc - Gia Phả Gia Tộc` | `a79fc58e210d4aabbc48e03ed5d0db70` | Desktop | `src/pages/CreateFamilyPage.tsx` |
| **UI-008** | `/app/dashboard` | Family: Bảng điều khiển Dòng họ | `Tổng quan - Gia Phả Gia Tộc` | `21496bb996f14762a4a76df18b480b0f`, `290e18c359e240f2` | Desktop / Mobile | `src/pages/DashboardPage.tsx` |
| **UI-009** | `/app/genealogy` | Family: Cây Phả Hệ Trực Quan | `Cây Gia Phả - Gia Phả Gia Tộc` | `344c28f1680c422f8b0fb5fddf081639`, `bd27532968754b9d` | Desktop / Mobile | `src/pages/GenealogyTreePage.tsx` |
| **UI-010** | `/app/members` | Family: Danh sách thành viên dòng họ | `Thành viên Gia Tộc - Gia Phả Gia Tộc` | `a67a022106ea4af6b017d4ef6ba36d3d` | Desktop | `src/pages/MembersListPage.tsx` |
| **UI-011** | `/app/members/:id` | Family: Hồ sơ chi tiết thành viên | `Hồ sơ thành viên - Gia Phả Gia Tộc` | `10a2232ec1fe4a56b5e2694aaa2ba85e` | Desktop | `src/pages/MemberProfilePage.tsx` |
| **UI-012** | `/app/calendar` | Calendar: Lịch Gia Tộc Âm/Dương | `Lịch gia tộc - Gia Phả Gia Tộc` | `3a44fddfe3e24f33a78a516e42fc5a2f` | Desktop | `src/pages/FamilyCalendarPage.tsx` |
| **UI-013** | `/app/memorials` | Calendar: Ngày giỗ Gia Tộc | `Ngày giỗ Gia Tộc - Gia Phả Gia Tộc` | `647032625c2247e7ad39a33bbe78891b` | Desktop | `src/pages/MemorialsPage.tsx` |
| **UI-014** | `/app/events` | Calendar: Sự kiện sắp tới | `Sự kiện sắp tới - Gia Phả Gia Tộc` | `d31cad5295e64f9e85161da0738359b3` | Desktop | `src/pages/EventListPage.tsx` |
| **UI-015** | `/app/events/:id` | Calendar: Chi tiết sự kiện & Ngân sách | `Chi tiết sự kiện` & `Ngân sách Sự kiện` | `2f223ed3830b408ba160157e23356d06`, `54704b35821f4428` | Desktop | `src/pages/EventDetailPage.tsx` |
| **UI-016** | `/app/reminders` | Calendar: Cấu hình Nhắc lịch tự động | `Cấu hình Nhắc lịch tự động` | `d65cf7b2201148f1aa5e65a00dfe21ad`, `ad9a11e9e0ec44d8` | Desktop | `src/pages/ReminderSettingsPage.tsx` |
| **UI-017** | `/app/finance` | Finance: Tổng quan Tài chính Dòng họ | `Tổng quan Tài chính` & `Báo cáo Tài chính` | `d9aeec8d69a248b5baf66a3d27f59c5e`, `4658744fc0d642c6`, `a9686f726d9a4012`, `3851b557e7514c87` | Desktop / Mobile | `src/pages/FinanceDashboardPage.tsx` |
| **UI-018** | `/app/finance/ledger` | Finance: Sổ quỹ & Chi tiết Giao dịch | `Sổ quỹ Gia tộc` & `Chi tiết Giao dịch` | `bac56058cb1247169b390a0ab7610a61`, `1672822128c14cb8` | Desktop | `src/pages/FundLedgerPage.tsx` |
| **UI-019** | `/app/finance/income` | Finance: Danh sách Khoản thu & Bổ phần | `Danh sách Khoản thu` & `Ghi nhận khoản thu` | `d6fa36d502f8457abc63c69fcedbd56b`, `76b6941e01d34595` | Desktop | `src/pages/IncomeAssessmentsPage.tsx` |
| **UI-020** | `/app/finance/expenses` | Finance: Quản lý Khoản chi & Duyệt chi | `Quản lý Khoản chi - Gia Phả Gia Tộc` | `49d272c897404d3c80a26cb4a1d9e862` | Desktop | `src/pages/ExpensesPage.tsx` |
| **UI-021** | `/app/finance/contributions` | Finance: Quản lý Đóng góp & Công đức | `Quản lý đóng góp` | `a83c3ead81544915a598f362913b9e8e`, `0e740111e1aa4018` | Desktop / Mobile | `src/pages/ContributionsPage.tsx` |
| **UI-022** | `/app/finance/honor-roll` | Finance: Đóng góp & Vinh danh Bảng vàng | `Đóng góp & Tài trợ - Gia Phả Gia Tộc` | `adc85b6197c340e2a956c5abd2b89b36` | Desktop | `src/pages/HonorRollPage.tsx` |
| **UI-023** | `/app/billing` | Billing: Tổng quan Gói dịch vụ | `Tổng quan Gói dịch vụ - Gia Phả Gia Tộc` | `44ff55aee7a5424b8cce14a87165605e` | Desktop | `src/pages/BillingOverviewPage.tsx` |
| **UI-024** | `/app/billing/usage` | Billing: Sử dụng & Giới hạn Quota | `Sử dụng & Giới hạn` & `Thông báo vượt giới hạn` | `6f68600f7dfa4ce6a9f6da03ff37dd63`, `4af75d9fca244cbdb2e3c40a086b488a` | Desktop | `src/pages/UsageDashboardPage.tsx` |
| **UI-025** | `/app/billing/invoices` | Billing: Danh sách Hóa đơn & Chi tiết | `Danh sách Hóa đơn` & `Chi tiết Hóa đơn` | `81f48e9ee70c4774bd0602ec13a9f35b`, `4d75c338ee7b400abf77721ae0008db1` | Desktop | `src/pages/InvoicesPage.tsx` |
| **UI-026** | `/app/billing/checkout` | Billing: Thanh toán Chuyển khoản VietQR | `Thanh toán - Gia Phả Gia Tộc` | `0c16d5813dc54a48be443cb90ae49a72` | Desktop | `src/pages/CheckoutPage.tsx` |
| **UI-027** | `/app/family/settings` | Settings: Cài đặt Dòng họ | `Cài đặt Gia tộc - Gia Phả Gia Tộc` | `41abb01ad25149e1a464b3b4f3943aeb` | Desktop | `src/pages/FamilySettingsPage.tsx` |
| **UI-028** | `/app/settings/permissions` | Settings: Phân quyền Ban Quản Trị | `Phân quyền - Gia Phả Gia Tộc` | `6d2e94836efa4f1785392ae6c6de55de` | Desktop | `src/pages/PermissionsPage.tsx` |
| **UI-029** | `/app/notifications` | Settings: Trung tâm Thông báo | `Trung tâm thông báo - Gia Phả Gia Tộc` | `b134c428572545eaa34101321c3b8ec1` | Desktop | `src/pages/NotificationsPage.tsx` |
| **UI-030** | `/app/audit` | Settings: Nhật ký Hệ thống Dòng họ | `Nhật ký hệ thống - Gia Phả Gia Tộc` | `229dea47d6b44e2093ce503055ce8f66` | Desktop | `src/pages/AuditLogsPage.tsx` |
| **UI-031** | `/admin/beta` | Admin: Trung tâm Chỉ huy Closed Beta | `Admin: Closed Beta Command Center` | `Beta Command Instance` | Desktop | `src/pages/admin/BetaCommandCenterPage.tsx` |
| **UI-032** | `/admin/payments` | Admin: Hàng đợi Duyệt Thanh toán Thủ công | `Admin: Quản lý Đăng ký` | `3b981e4a61a8427cb3b13b9c676fd2f9` | Desktop | `src/pages/admin/AdminPaymentsPage.tsx` |
| **UI-033** | `/admin/billing/config` | Admin: Cấu hình Tài khoản Thụ hưởng | `Admin: Cấu hình Thanh toán & Ngân hàng` | `Admin Config Instance` | Desktop | `src/pages/admin/AdminBillingConfigPage.tsx` |
| **UI-034** | `/admin/integrity` | Admin: Giám sát Toàn vẹn Dữ liệu | `Admin: Giám sát Toàn vẹn Dữ liệu` | `Integrity Watchdog Instance` | Desktop | `src/pages/admin/IntegrityWatchdogPage.tsx` |
| **UI-035** | `/admin/reconciliation` | Admin: Nhật ký Đối soát Tài chính 3 Chiều | `Admin: Nhật ký đối soát` | `c0964505c2fa4d7e930cd1b11968d424` | Desktop | `src/pages/admin/FinancialReconciliationPage.tsx` |
| **UI-036** | `/admin/revenue` | Admin: Tổng quan Doanh thu & Giao dịch | `Admin: Tổng quan Doanh thu` & `Admin: Quản lý Giao dịch` | `a5464d4e7cf94f9b8bc5a408198d28b6`, `cd9b4df4a68e4963` | Desktop | `src/pages/AdminRevenuePage.tsx` |
| **UI-037** | `/admin/plans` | Admin: Quản lý Gói dùng thử & Gói cước | `Admin: Quản lý Gói dùng thử` | `8ccc9a47371e44ecac72fb34fc3b4d5a` | Desktop | `src/pages/AdminPlansPage.tsx` |
