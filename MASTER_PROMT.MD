============================================================
TASK: GENERATE PROJECT SPECIFICATION DOCUMENTS
============================================================

DỰ ÁN:
GIA PHẢ GIA TỘC

MỤC TIÊU:
Trước khi bắt đầu viết code ứng dụng, hãy chuyển toàn bộ yêu cầu
trong MASTER_SPEC thành 3 tài liệu kỹ thuật hoàn chỉnh:

1. IMPLEMENTATION_PLAN.md
2. DATABASE_SCHEMA.sql
3. BUSINESS_RULES.md

ĐÂY LÀ GIAI ĐOẠN PHÂN TÍCH VÀ THIẾT KẾ.

KHÔNG bắt đầu implement UI/frontend/backend ở bước này.

KHÔNG tạo mockup.

KHÔNG tạo dữ liệu giả để thay thế schema.

KHÔNG bỏ qua các phần chưa rõ.

Nếu phát hiện điểm mâu thuẫn hoặc thiếu thông tin, hãy ghi rõ trong
IMPLEMENTATION_PLAN.md tại mục "OPEN QUESTIONS / ASSUMPTIONS".

============================================================
I. NGUYÊN TẮC
============================================================

MASTER_SPEC là tài liệu yêu cầu cấp cao.

Ba tài liệu mới phải:

- Nhất quán với nhau.
- Có thể dùng trực tiếp để bắt đầu development.
- Không có thiết kế mâu thuẫn.
- Có đầy đủ multi-tenant architecture.
- Có đầy đủ RBAC.
- Có Supabase RLS.
- Có financial integrity.
- Có audit trail.
- Có lịch âm Việt Nam.
- Có recurring memorial.
- Có tháng nhuận.
- Có event management.
- Có genealogy relationship.

Nếu phải lựa chọn giữa:

"làm nhanh"

và

"thiết kế đúng để có thể mở rộng",

hãy ưu tiên thiết kế đúng.

============================================================
II. FILE 1 — IMPLEMENTATION_PLAN.md
============================================================

Tạo file:

IMPLEMENTATION_PLAN.md

Nội dung phải gồm:

------------------------------------------------------------
1. PROJECT OVERVIEW
------------------------------------------------------------

Mục tiêu sản phẩm.

Đối tượng sử dụng.

Các module chính.

Kiến trúc tổng thể.

------------------------------------------------------------
2. TECHNOLOGY STACK
------------------------------------------------------------

Frontend:

React
TypeScript
Vite
Tailwind
shadcn/ui

Backend:

Supabase

Database:

PostgreSQL

Auth:

Supabase Auth

State:

TanStack Query
Zustand nếu cần

Validation:

Zod

Testing:

Vitest
Playwright

------------------------------------------------------------
3. SYSTEM ARCHITECTURE
------------------------------------------------------------

Vẽ architecture bằng Mermaid.

Ví dụ:

Browser
 ↓
React Application
 ↓
Services
 ↓
Supabase
 ├── Auth
 ├── PostgreSQL
 ├── Storage
 └── Edge Functions

Phải mô tả:

Frontend

Service layer

Database

Authentication

Authorization

Storage

Notification

Lunar Calendar Service

Audit Service

------------------------------------------------------------
4. FEATURE MODULES
------------------------------------------------------------

Liệt kê toàn bộ:

AUTH

FAMILY

MEMBERS

GENEALOGY

GENERATION

BRANCH

RELATIONSHIP

MEMORIAL

LUNAR CALENDAR

EVENT

FUND

INCOME

EXPENSE

CONTRIBUTION

SPONSORSHIP

LEDGER

REPORT

NOTIFICATION

AUDIT

RBAC

SETTINGS

IMPORT/EXPORT

------------------------------------------------------------
5. MODULE DEPENDENCY
------------------------------------------------------------

Tạo sơ đồ:

AUTH
 ↓
FAMILY
 ↓
MEMBERS
 ↓
GENEALOGY
 ↓
EVENT
 ↓
FINANCE
 ↓
REPORT

Phải xác định module nào phụ thuộc module nào.

------------------------------------------------------------
6. IMPLEMENTATION PHASES
------------------------------------------------------------

Chi tiết:

PHASE 0
Project discovery

PHASE 1
Infrastructure

PHASE 2
Authentication

PHASE 3
Family + Membership + RBAC

PHASE 4
Genealogy

PHASE 5
Lunar Calendar

PHASE 6
Events + Memorial

PHASE 7
Finance

PHASE 8
Ledger + Reports

PHASE 9
Notifications

PHASE 10
Audit + Security

PHASE 11
Import/Export

PHASE 12
Testing

PHASE 13
Performance

PHASE 14
Deployment

Mỗi phase phải có:

Goal

Tasks

Dependencies

Files/modules affected

Database changes

API/service changes

Tests

Definition of Done

------------------------------------------------------------
7. ROUTING PLAN
------------------------------------------------------------

Liệt kê toàn bộ routes.

Ví dụ:

/login
/register

/app
/app/dashboard

/app/family
/app/family/settings

/app/genealogy
/app/members
/app/members/:id

/app/calendar
/app/events
/app/events/:id
/app/memorials

/app/finance
/app/finance/funds
/app/finance/income
/app/finance/expenses
/app/finance/contributions
/app/finance/sponsorships
/app/finance/ledger
/app/finance/reports

/app/settings
/app/users
/app/audit

------------------------------------------------------------
8. COMPONENT ARCHITECTURE
------------------------------------------------------------

Xác định:

Layout

Sidebar

Header

FamilySwitcher

Calendar

GenealogyTree

MemberTable

MemberProfile

EventCard

FinanceDashboard

TransactionTable

LedgerTable

PermissionMatrix

AuditLogTable

Modal

Drawer

Form

DataTable

------------------------------------------------------------
9. SERVICE ARCHITECTURE
------------------------------------------------------------

Tạo danh sách service:

AuthService

FamilyService

MemberService

GenealogyService

LunarCalendarService

MemorialService

EventService

FundService

IncomeService

ExpenseService

ContributionService

SponsorshipService

LedgerService

ReportService

NotificationService

AuditService

------------------------------------------------------------
10. DATA FLOW
------------------------------------------------------------

Mô tả data flow của:

Tạo thành viên.

Tạo quan hệ cha/con.

Tạo ngày giỗ.

Tạo sự kiện.

Tạo khoản phải thu.

Ghi nhận tiền thu.

Tạo khoản chi.

Duyệt khoản chi.

Post transaction.

Reversal transaction.

Xuất báo cáo.

------------------------------------------------------------
11. SECURITY ARCHITECTURE
------------------------------------------------------------

Mô tả:

Authentication

Authorization

RBAC

RLS

Tenant isolation

Storage policies

Input validation

File validation

Audit

Secret management.

------------------------------------------------------------
12. FINANCIAL ARCHITECTURE
------------------------------------------------------------

Phải giải thích rõ:

Assessment

Payment

Transaction

Ledger

Fund

Balance

Reversal

Adjustment

Phân biệt:

AMOUNT_DUE

AMOUNT_PAID

AMOUNT_REMAINING

Không được trộn lẫn.

------------------------------------------------------------
13. LUNAR CALENDAR ARCHITECTURE
------------------------------------------------------------

Mô tả:

Solar date

Lunar date

Leap month

Can Chi

Timezone Asia/Ho_Chi_Minh

Recurring lunar events.

Phải xác định:

LunarCalendarService

interface.

------------------------------------------------------------
14. TEST STRATEGY
------------------------------------------------------------

Unit tests.

Integration tests.

RLS tests.

Financial tests.

Lunar calendar tests.

E2E tests.

Security tests.

------------------------------------------------------------
15. DEPLOYMENT
------------------------------------------------------------

Development.

Staging.

Production.

Environment variables.

Supabase migration.

CI/CD.

Backup.

Rollback.

------------------------------------------------------------
16. OPEN QUESTIONS / ASSUMPTIONS
------------------------------------------------------------

Nếu có bất kỳ điểm nào chưa xác định:

ghi ra đây.

KHÔNG tự ý quyết định âm thầm.

============================================================
III. FILE 2 — DATABASE_SCHEMA.sql
============================================================

Tạo file:

DATABASE_SCHEMA.sql

Đây phải là migration/schema hoàn chỉnh cho PostgreSQL/Supabase.

Không chỉ liệt kê bảng.

Phải tạo SQL có thể chạy được.

------------------------------------------------------------
1. EXTENSIONS
------------------------------------------------------------

Xác định extensions cần thiết.

------------------------------------------------------------
2. ENUMS
------------------------------------------------------------

Tạo enums cho:

membership_role

membership_status

gender

member_status

relationship_type

event_type

event_scope

event_recurrence

fund_status

transaction_type

transaction_status

income_status

expense_status

payment_method

sponsorship_type

audit_action

notification_type

------------------------------------------------------------
3. TABLES
------------------------------------------------------------

Tạo đầy đủ:

profiles

families

family_memberships

generations

branches

members

member_relationships

memorial_dates

events

event_reminders

funds

income_categories

expense_categories

income_assessments

financial_transactions

expense_records

contributions

sponsorships

ledger_entries nếu cần

notifications

audit_logs

invitation_tokens nếu cần

attachments nếu cần

------------------------------------------------------------
4. PRIMARY KEYS
------------------------------------------------------------

Ưu tiên UUID.

Tất cả bảng nghiệp vụ phải có:

id uuid

created_at

updated_at

------------------------------------------------------------
5. FOREIGN KEYS
------------------------------------------------------------

Phải khai báo rõ:

family_id

member_id

event_id

fund_id

category_id

transaction_id

user_id

v.v.

Xác định rõ:

ON DELETE CASCADE

ON DELETE RESTRICT

ON DELETE SET NULL

Không dùng cascade tùy tiện với dữ liệu tài chính.

------------------------------------------------------------
6. CONSTRAINTS
------------------------------------------------------------

Ví dụ:

amount > 0

lunar_day hợp lệ

lunar_month hợp lệ

generation_number > 0

Không cho member liên kết với chính nó.

Không cho duplicate relationship.

Không cho duplicate membership.

------------------------------------------------------------
7. INDEXES
------------------------------------------------------------

Tạo index cho:

family_id

user_id

member_id

generation_id

branch_id

event_id

fund_id

transaction_date

created_at

lunar_day

lunar_month

status.

------------------------------------------------------------
8. UNIQUE CONSTRAINTS
------------------------------------------------------------

Xác định các trường hợp unique.

Ví dụ:

family_memberships:

UNIQUE(family_id, user_id)

income_categories:

UNIQUE(family_id, code)

expense_categories:

UNIQUE(family_id, code)

v.v.

------------------------------------------------------------
9. TRIGGERS
------------------------------------------------------------

Nếu cần:

updated_at trigger.

Audit trigger.

Financial consistency trigger.

Không dùng trigger quá phức tạp nếu business logic có thể nằm
ở database function rõ ràng hơn.

------------------------------------------------------------
10. DATABASE FUNCTIONS
------------------------------------------------------------

Thiết kế function cho các nghiệp vụ quan trọng:

record_income()

record_expense()

approve_expense()

post_transaction()

reverse_transaction()

calculate_fund_balance()

assign_income_assessment()

Các function phải đảm bảo atomicity.

------------------------------------------------------------
11. FINANCIAL LEDGER
------------------------------------------------------------

Thiết kế ledger sao cho:

Opening Balance
+
Posted Income
-
Posted Expense
+
Adjustments
-
Reversals
=
Closing Balance

Không phụ thuộc vào frontend.

------------------------------------------------------------
12. RLS
------------------------------------------------------------

Đây là phần BẮT BUỘC.

Tạo RLS cho toàn bộ bảng chứa dữ liệu gia tộc.

Nguyên tắc:

User chỉ được truy cập dữ liệu của family
mà user có membership hợp lệ.

Ví dụ:

auth.uid()
→ family_memberships
→ family_id
→ resource.family_id

Không cho user A đọc family B.

------------------------------------------------------------
13. ROLE POLICIES
------------------------------------------------------------

OWNER:

full access.

ADMIN:

quản lý family.

GENEALOGY_ADMIN:

genealogy.

TREASURER:

finance.

APPROVER:

approval.

EVENT_MANAGER:

events.

MEMBER:

limited read/write.

VIEWER:

read only.

------------------------------------------------------------
14. STORAGE POLICIES
------------------------------------------------------------

Nếu sử dụng Storage:

avatars

family-media

documents

receipts

event-media.

Phải có policy tương ứng.

------------------------------------------------------------
15. VIEWS
------------------------------------------------------------

Nếu cần tạo:

family_dashboard

upcoming_memorials

upcoming_events

fund_balances

outstanding_income

financial_summary.

Không tạo view nếu không thực sự cần.

------------------------------------------------------------
16. SEED DATA
------------------------------------------------------------

Cuối file hoặc file riêng:

seed.sql

Tạo:

1 family

6 generations

7 branches

50+ members

relationships

memorials

events

funds

income assessments

transactions

expenses

contributions

sponsorships.

Seed phải phục vụ development/testing.

============================================================
IV. FILE 3 — BUSINESS_RULES.md
============================================================

Tạo file:

BUSINESS_RULES.md

Đây là tài liệu QUAN TRỌNG NHẤT.

Không viết chung chung.

Mỗi rule phải có:

RULE ID

NAME

DESCRIPTION

CONDITION

ACTION

EXCEPTION

EXAMPLE

============================================================
1. TENANT RULES
============================================================

BR-FAM-001

User chỉ được truy cập family mà user là member.

BR-FAM-002

Một user có thể thuộc nhiều family.

BR-FAM-003

Dữ liệu family A không được truy cập từ family B.

------------------------------------------------------------
2. MEMBERSHIP RULES
------------------------------------------------------------

BR-MEM-001

Mỗi user chỉ có một membership trong một family.

BR-MEM-002

OWNER không thể bị hạ quyền nếu không có OWNER khác
hoặc quy trình chuyển ownership.

BR-MEM-003

Chỉ OWNER/ADMIN có thể quản lý membership.

------------------------------------------------------------
3. GENEALOGY RULES
------------------------------------------------------------

BR-GEN-001

Member phải thuộc một family.

BR-GEN-002

Generation phải thuộc family.

BR-GEN-003

Branch phải thuộc family.

BR-GEN-004

Không cho tạo quan hệ member với chính mình.

BR-GEN-005

Không cho tạo vòng lặp cha-con.

BR-GEN-006

Relationship phải cùng family.

------------------------------------------------------------
4. DEATH / MEMORIAL RULES
------------------------------------------------------------

BR-MEMORIAL-001

Người đã mất phải có date_of_death.

BR-MEMORIAL-002

Ngày giỗ có thể lưu theo âm lịch.

BR-MEMORIAL-003

Ngày giỗ hàng năm phải recurrence theo lunar date.

BR-MEMORIAL-004

Ngày âm phải hỗ trợ leap month.

BR-MEMORIAL-005

Không cố định ngày dương cho ngày giỗ âm lịch.

------------------------------------------------------------
5. LUNAR CALENDAR RULES
------------------------------------------------------------

BR-LUNAR-001

Timezone mặc định Asia/Ho_Chi_Minh.

BR-LUNAR-002

Lunar date và solar date phải được xác định rõ.

BR-LUNAR-003

Leap month phải có cờ riêng.

BR-LUNAR-004

Không được coi tháng nhuận và tháng thường là cùng một ngày.

BR-LUNAR-005

Chuyển đổi âm/dương phải thông qua LunarCalendarService.

------------------------------------------------------------
6. EVENT RULES
------------------------------------------------------------

BR-EVT-001

Event phải thuộc family.

BR-EVT-002

Event có thể thuộc:

family

branch

sub-branch

individual.

BR-EVT-003

Memorial event phải liên kết member nếu là ngày giỗ cá nhân.

BR-EVT-004

Event recurring lunar phải lưu lunar definition.

------------------------------------------------------------
7. FUND RULES
------------------------------------------------------------

BR-FUND-001

Fund thuộc family.

BR-FUND-002

Một family có thể có nhiều fund.

BR-FUND-003

Transaction phải xác định fund nếu nghiệp vụ yêu cầu.

------------------------------------------------------------
8. INCOME ASSESSMENT RULES
------------------------------------------------------------

BR-INCOME-001

Income assessment là nghĩa vụ phải thu.

BR-INCOME-002

Assessment không làm tăng fund balance.

BR-INCOME-003

amount_paid <= amount_due
trừ trường hợp overpayment được cấu hình.

BR-INCOME-004

amount_remaining =
amount_due - amount_paid.

BR-INCOME-005

Nếu amount_paid = 0:

PENDING.

Nếu:

0 < amount_paid < amount_due:

PARTIAL.

Nếu:

amount_paid = amount_due:

PAID.

------------------------------------------------------------
9. BULK ASSESSMENT
------------------------------------------------------------

BR-INCOME-010

Có thể tạo assessment hàng loạt.

Ví dụ:

86 thành viên
×
500.000đ.

Hệ thống tạo 86 assessment độc lập.

Nếu một thành viên đã có assessment:

không tạo duplicate.

------------------------------------------------------------
10. PAYMENT RULES
------------------------------------------------------------

BR-PAY-001

Chỉ khoản tiền thực tế được ghi nhận mới tạo transaction INCOME.

BR-PAY-002

Payment phải liên kết assessment nếu là khoản thu định mức.

BR-PAY-003

Payment phải có:

amount

date

method

creator.

BR-PAY-004

Transaction đã POSTED không được xóa vật lý.

------------------------------------------------------------
11. EXPENSE RULES
------------------------------------------------------------

BR-EXP-001

Expense phải có amount > 0.

BR-EXP-002

Expense phải có category.

BR-EXP-003

Expense phải có người tạo.

BR-EXP-004

Expense cần APPROVAL nếu policy yêu cầu.

BR-EXP-005

Chỉ expense POSTED mới làm giảm fund.

------------------------------------------------------------
12. APPROVAL RULES
------------------------------------------------------------

BR-APP-001

Người tạo expense không được tự duyệt nếu policy cấm.

BR-APP-002

Expense:

DRAFT
→
PENDING_APPROVAL
→
APPROVED
→
POSTED.

BR-APP-003

REJECTED không được post.

------------------------------------------------------------
13. LEDGER RULES
------------------------------------------------------------

BR-LEDGER-001

Ledger chỉ phản ánh transaction hợp lệ.

BR-LEDGER-002

INCOME làm tăng balance.

BR-LEDGER-003

EXPENSE làm giảm balance.

BR-LEDGER-004

Assessment không làm thay đổi balance.

BR-LEDGER-005

Transaction rollback phải rollback ledger.

------------------------------------------------------------
14. REVERSAL RULES
------------------------------------------------------------

BR-REV-001

Không xóa transaction đã POSTED.

BR-REV-002

Nếu giao dịch sai:

tạo reversal.

BR-REV-003

Reversal phải tham chiếu transaction gốc.

BR-REV-004

Phải ghi lý do reversal.

BR-REV-005

Reversal tạo audit log.

------------------------------------------------------------
15. CONTRIBUTION RULES
------------------------------------------------------------

Đóng góp tự nguyện khác với assessment.

Không bắt buộc phải có amount_due.

Khi nhận tiền:

tạo transaction.

------------------------------------------------------------
16. SPONSORSHIP RULES
------------------------------------------------------------

Tài trợ có thể:

từ thành viên

người thân

doanh nghiệp

tổ chức.

Phải ghi:

sponsor

amount

purpose

event/fund nếu có.

------------------------------------------------------------
17. AUDIT RULES
------------------------------------------------------------

Mọi thay đổi quan trọng phải audit:

Member

Event

Fund

Assessment

Transaction

Expense

Permission

Membership.

Không cho user thông thường xóa audit log.

------------------------------------------------------------
18. NOTIFICATION RULES
------------------------------------------------------------

Notification được tạo khi:

Sắp có ngày giỗ.

Sắp có sự kiện.

Khoản thu đến hạn.

Có khoản chi chờ duyệt.

Có giao dịch mới.

------------------------------------------------------------
19. REPORTING RULES
------------------------------------------------------------

Báo cáo tài chính phải dựa trên:

Posted transactions.

Không dựa trên:

income assessment.

------------------------------------------------------------
20. IMPORT RULES
------------------------------------------------------------

Import phải:

Validate.

Preview.

Detect duplicate.

Report errors.

Không commit một phần dữ liệu nếu import transaction
không thành công toàn bộ batch,
trừ khi có cơ chế partial import rõ ràng.

============================================================
V. CROSS-DOCUMENT CONSISTENCY
============================================================

Sau khi tạo 3 file:

Kiểm tra chéo:

IMPLEMENTATION_PLAN.md
↕
DATABASE_SCHEMA.sql
↕
BUSINESS_RULES.md

Tìm:

- Bảng được nhắc nhưng chưa tạo.
- Field được sử dụng nhưng không tồn tại.
- Enum không đồng nhất.
- Role không đồng nhất.
- Route không có module.
- Business rule không có database enforcement.
- RLS thiếu bảng.
- Service không có database support.

Tạo cuối IMPLEMENTATION_PLAN.md:

"CONSISTENCY CHECK"

với bảng:

| Item | Status | Notes |

============================================================
VI. DATABASE DESIGN REQUIREMENT
============================================================

Đặc biệt kiểm tra các quan hệ:

family
→ membership
→ member

family
→ generation
→ member

family
→ branch
→ member

member
→ relationship
→ member

member
→ memorial

event
→ member

event
→ fund

fund
→ transaction

member
→ income assessment

income assessment
→ payment transaction

expense
→ transaction

transaction
→ ledger

transaction
→ audit.

============================================================
VII. OUTPUT REQUIREMENT
============================================================

Sau khi hoàn thành:

Tạo đúng 3 file:

IMPLEMENTATION_PLAN.md

DATABASE_SCHEMA.sql

BUSINESS_RULES.md

Không tạo code ứng dụng ở bước này.

Sau đó hiển thị:

1. Danh sách file đã tạo.

2. Tóm tắt kiến trúc.

3. Số lượng bảng.

4. Số lượng RLS policies.

5. Số lượng business rules.

6. Các vấn đề còn mở.

7. Các quyết định kiến trúc quan trọng.

============================================================
VIII. QUALITY GATE
============================================================

Không được báo "completed" nếu:

- DATABASE_SCHEMA.sql không chạy được về mặt cú pháp.
- Có foreign key sai.
- Có bảng thiếu family_id mà cần tenant isolation.
- Có financial table thiếu audit strategy.
- Có RLS thiếu.
- Có role không đồng nhất.
- Có business rule không được phản ánh trong schema/service plan.
- Lunar calendar chưa xử lý leap month.
- Memorial chưa xử lý recurring lunar.
- Assessment và payment bị trộn lẫn.
- Posted transaction có thể bị delete.

============================================================
IX. SAU KHI HOÀN THÀNH
============================================================

KHÔNG TỰ ĐỘNG CHUYỂN SANG IMPLEMENTATION.

Dừng lại.

Chờ người dùng review:

IMPLEMENTATION_PLAN.md

DATABASE_SCHEMA.sql

BUSINESS_RULES.md

Chỉ khi người dùng xác nhận:

"APPROVED — START IMPLEMENTATION"

mới bắt đầu viết code.