============================================================
PROJECT: GIA PHẢ GIA TỘC
============================================================

XÂY DỰNG WEBAPP QUẢN LÝ GIA PHẢ, LỊCH GIA TỘC
VÀ QUỸ TÀI CHÍNH GIA TỘC

Tên sản phẩm:

"GIA PHẢ GIA TỘC"

Slogan:

"Lưu giữ cội nguồn – Kết nối các thế hệ"

============================================================
0. VAI TRÒ CỦA AI CODING AGENT
============================================================

Bạn là:

- Senior Full-stack Engineer
- Senior Software Architect
- Database Architect
- UI/UX Engineer
- Security Engineer
- QA Engineer

Nhiệm vụ:

XÂY DỰNG TOÀN BỘ WEBAPP PRODUCTION-READY.

Không chỉ tạo prototype.

Không tạo mockup giả.

Không dùng dữ liệu hard-code thay cho database.

Không bỏ qua authentication.

Không bỏ qua authorization.

Không bỏ qua validation.

Không bỏ qua audit log.

Không bỏ qua error handling.

Không bỏ qua responsive.

Không bỏ qua empty/loading/error states.

Mọi module phải hoạt động thực tế.

============================================================
1. MỤC TIÊU SẢN PHẨM
============================================================

Webapp cho phép mỗi người dùng:

1. Đăng ký tài khoản
2. Đăng nhập
3. Tạo gia tộc
4. Tham gia gia tộc bằng lời mời
5. Quản lý cây gia phả
6. Quản lý thành viên
7. Quản lý đời
8. Quản lý chi
9. Quản lý nhánh
10. Quản lý người đã mất
11. Quản lý ngày giỗ
12. Quản lý lịch gia tộc
13. Quản lý sự kiện
14. Quản lý quỹ gia tộc
15. Tạo các khoản thu
16. Phân bổ mức thu cho thành viên
17. Theo dõi ai đã đóng/chưa đóng
18. Quản lý khoản chi
19. Quản lý đóng góp
20. Quản lý tài trợ
21. Quản lý ngân sách sự kiện
22. Quản lý sổ quỹ
23. Báo cáo tài chính
24. Truy vết toàn bộ giao dịch
25. Quản lý người dùng
26. Phân quyền
27. Audit log
28. Thông báo
29. Nhắc ngày giỗ
30. Nhắc sự kiện

============================================================
2. KIẾN TRÚC TỔNG THỂ
============================================================

Frontend:

React
TypeScript
Vite

UI:

Tailwind CSS
shadcn/ui
Lucide Icons

State:

TanStack Query
Zustand nếu cần

Routing:

React Router

Backend:

Supabase

Bao gồm:

Supabase Auth
PostgreSQL
Row Level Security
Storage
Realtime nếu cần
Edge Functions nếu cần

Database:

PostgreSQL

Deployment:

Frontend có thể deploy Vercel/Netlify.

Backend:

Supabase.

============================================================
3. NGUYÊN TẮC KIẾN TRÚC
============================================================

Thiết kế theo:

Feature-based architecture.

Không gom toàn bộ code vào một file.

Không tạo component khổng lồ.

Không duplicate business logic.

Tách:

UI
Hooks
Services
Repositories
Types
Validation
Business Rules

Mọi business rule quan trọng phải nằm ở backend/database
hoặc service layer phù hợp.

Không tin dữ liệu từ frontend.

============================================================
4. CẤU TRÚC PROJECT
============================================================

Tạo:

src/

├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── forms/
│   ├── tables/
│   ├── calendar/
│   └── charts/
│
├── features/
│   ├── auth/
│   ├── families/
│   ├── genealogy/
│   ├── members/
│   ├── generations/
│   ├── branches/
│   ├── events/
│   ├── lunar-calendar/
│   ├── memorials/
│   ├── finance/
│   ├── contributions/
│   ├── sponsorships/
│   ├── funds/
│   ├── reports/
│   ├── notifications/
│   ├── users/
│   ├── permissions/
│   └── audit/
│
├── hooks/
├── lib/
├── services/
├── repositories/
├── schemas/
├── types/
├── utils/
├── constants/
└── config/

supabase/

├── migrations/
├── functions/
└── seed/

============================================================
5. AUTHENTICATION
============================================================

Sử dụng Supabase Auth.

Cho phép:

Đăng ký bằng email/password.

Đăng nhập.

Đăng xuất.

Quên mật khẩu.

Reset password.

Xác thực email.

Session persistence.

Protected routes.

Nếu chưa đăng nhập:

redirect /login.

============================================================
6. USER PROFILE
============================================================

Mỗi user:

id
email
full_name
phone
avatar
created_at
updated_at

User có thể tham gia nhiều gia tộc.

Do đó KHÔNG gắn user trực tiếp với một family duy nhất.

Tạo bảng:

family_memberships

============================================================
7. GIA TỘC
============================================================

Bảng:

families

Fields:

id
name
surname
description
origin
ancestral_home
ancestral_hall
logo_url
cover_url
founder_member_id
founded_date
created_by
created_at
updated_at

Mỗi gia tộc là một tenant độc lập.

Dữ liệu gia tộc A không được truy cập gia tộc B.

============================================================
8. MEMBERSHIP
============================================================

family_memberships

Fields:

id
family_id
user_id
role
status
joined_at

Roles:

OWNER

ADMIN

GENEALOGY_ADMIN

TREASURER

APPROVER

EVENT_MANAGER

MEMBER

VIEWER

============================================================
9. PHÂN QUYỀN
============================================================

OWNER:

Toàn quyền.

ADMIN:

Quản lý hệ thống gia tộc.

GENEALOGY_ADMIN:

Quản lý gia phả.

TREASURER:

Quản lý tài chính.

APPROVER:

Duyệt giao dịch.

EVENT_MANAGER:

Quản lý sự kiện.

MEMBER:

Xem dữ liệu được phép.

VIEWER:

Chỉ xem.

Phải sử dụng:

RBAC

và

Supabase Row Level Security.

============================================================
10. GIA PHẢ
============================================================

Hệ thống phải hỗ trợ:

Đời

Chi

Nhánh

Cha

Mẹ

Vợ/chồng

Con

Anh/chị/em

Quan hệ gia đình.

Không lưu cây gia phả chỉ dưới dạng JSON.

Phải có dữ liệu quan hệ rõ ràng.

============================================================
11. MEMBERS
============================================================

Bảng:

members

Fields:

id
family_id
full_name
gender
date_of_birth
place_of_birth
occupation
phone
email
avatar_url
generation_id
branch_id
status
is_deceased
date_of_death_solar
date_of_death_lunar_day
date_of_death_lunar_month
date_of_death_lunar_year
date_of_death_is_leap_month
biography
notes
created_at
updated_at

============================================================
12. GENERATIONS
============================================================

generations:

id
family_id
generation_number
name
description

Ví dụ:

Đời 1
Đời 2
Đời 3
...

============================================================
13. BRANCHES
============================================================

branches:

id
family_id
name
code
parent_branch_id
description

Hỗ trợ cây:

Chi trưởng

Chi 2

Chi 3

...

Nhánh con.

============================================================
14. RELATIONSHIPS
============================================================

member_relationships:

id
family_id
member_id
related_member_id
relationship_type

Types:

PARENT

CHILD

SPOUSE

SIBLING

ADOPTIVE_PARENT

ADOPTED_CHILD

OTHER

============================================================
15. CÂY GIA PHẢ
============================================================

Frontend phải hiển thị interactive tree.

Hỗ trợ:

Zoom

Pan

Center

Collapse

Expand

Search

Focus member

Filter generation

Filter branch

Click node.

Node hiển thị:

Avatar

Tên

Đời

Chi

Trạng thái sống/mất.

============================================================
16. HỒ SƠ THÀNH VIÊN
============================================================

Profile page có tabs:

Thông tin

Gia phả

Gia đình

Ngày giỗ

Sự kiện

Tài chính

Lịch sử.

============================================================
17. NGƯỜI ĐÃ MẤT
============================================================

Khi:

is_deceased = true

bắt buộc có:

date_of_death.

Có thể nhập:

Ngày mất Dương lịch

hoặc

Ngày mất Âm lịch.

Nếu nhập âm lịch:

phải lưu riêng:

lunar_day
lunar_month
lunar_year
is_leap_month.

============================================================
18. LỊCH ÂM VIỆT NAM
============================================================

ĐÂY LÀ MODULE ĐẶC BIỆT QUAN TRỌNG.

Không tự viết thuật toán chuyển đổi lịch âm nếu không cần thiết.

Sử dụng một thư viện/engine lịch âm Việt Nam đã được kiểm chứng.

Engine phải hỗ trợ:

Gregorian calendar

Vietnamese lunar calendar

UTC+7

Can Chi

Leap month

Solar → Lunar

Lunar → Solar

============================================================
19. QUY TẮC NGÀY GIỖ
============================================================

Ngày giỗ được lưu theo:

ÂM LỊCH.

Ví dụ:

12/05 ÂL.

Không cố định ngày dương.

Mỗi năm phải tính:

12/05 ÂL của năm đó
→ ngày Dương tương ứng.

Ví dụ:

2027 → ngày A

2028 → ngày B

2029 → ngày C

============================================================
20. MEMORIAL EVENTS
============================================================

Tạo bảng:

memorial_dates

Fields:

id
family_id
member_id
lunar_day
lunar_month
lunar_year
is_leap_month
recurrence
notes
created_at
updated_at

recurrence:

YEARLY_LUNAR

YEARLY_SOLAR

NONE

============================================================
21. THÁNG NHUẬN
============================================================

Bắt buộc hỗ trợ:

is_leap_month.

Ví dụ:

23 tháng 4 nhuận.

Không được coi là:

23 tháng 4 thường.

============================================================
22. SỰ KIỆN
============================================================

events:

id
family_id
title
event_type
scope
member_id
branch_id
generation_id
lunar_day
lunar_month
lunar_year
is_leap_month
solar_date
start_time
end_time
location
description
recurrence
reminder_config
status
created_by
created_at
updated_at

============================================================
23. EVENT TYPES
============================================================

CLAN_ANCESTRAL_DAY

MEMORIAL

BRANCH_MEMORIAL

FAMILY_MEETING

ANCESTRAL_HALL_OPENING

ANCESTRAL_HALL_RENOVATION

CLAN_ANNIVERSARY

BIRTHDAY

LONGEVITY

WEDDING

FUNERAL

OTHER

============================================================
24. EVENT SCOPE
============================================================

FAMILY

BRANCH

SUB_BRANCH

HOUSEHOLD

INDIVIDUAL

============================================================
25. LỊCH GIA TỘC
============================================================

Calendar page:

Month

List

Year

Mặc định hiển thị:

Âm lịch.

Mỗi ngày hiển thị:

Ngày dương

Ngày âm

Can Chi

Events.

============================================================
26. DASHBOARD CALENDAR
============================================================

Dashboard phải có:

"HÔM NAY"

Ngày dương.

Ngày âm.

Can Chi.

Events hôm nay.

Events 7 ngày tới.

Ngày giỗ sắp tới.

============================================================
27. REMINDER
============================================================

Cho phép:

30 ngày

15 ngày

7 ngày

3 ngày

1 ngày

trước sự kiện.

Notification channels:

IN_APP

EMAIL

PUSH

ZALO nếu có integration.

============================================================
28. QUỸ GIA TỘC
============================================================

Mỗi gia tộc có thể có:

Một hoặc nhiều fund.

Bảng:

funds

Fields:

id
family_id
name
description
opening_balance
current_balance
status
created_at
updated_at

Ví dụ:

Quỹ gia tộc

Quỹ xây nhà thờ

Quỹ khuyến học

Quỹ giỗ tổ

============================================================
29. DANH MỤC THU
============================================================

income_categories:

id
family_id
name
code
description
is_active

Ví dụ:

Đóng góp thường niên

Quỹ giỗ tổ

Ủng hộ xây nhà thờ

Tài trợ

Thu khác.

============================================================
30. DANH MỤC CHI
============================================================

expense_categories:

id
family_id
name
code
description
is_active

Ví dụ:

Ăn uống

Khánh tiết

Âm thanh

Trang trí

Xây dựng

Tu sửa

Đi lại

Quà tặng

Chi khác.

============================================================
31. KHOẢN THU / CAM KẾT THU
============================================================

Đây là phần cực kỳ quan trọng.

Phân biệt:

AMOUNT_DUE

AMOUNT_PAID

AMOUNT_REMAINING

Không coi "phải thu" là tiền đã vào quỹ.

Bảng:

income_assessments

Fields:

id
family_id
fund_id
event_id
category_id
member_id
amount_due
amount_paid
amount_remaining
status
due_date
created_at
updated_at

Status:

PENDING

PARTIAL

PAID

WAIVED

CANCELLED

============================================================
32. TẠO KHOẢN THU
============================================================

Ví dụ:

QUỸ GIỖ TỔ 2027

Mức mặc định:

500.000đ.

Chọn:

Toàn bộ thành viên

Hoặc:

Chi

Nhánh

Đời.

Hệ thống tự tạo assessment cho từng người.

============================================================
33. GÁN MỨC THU NHANH
============================================================

UI:

Danh sách thành viên.

Checkbox.

Amount input.

Actions:

Gán tất cả.

Gán theo chi.

Gán theo nhánh.

Gán theo đời.

Ví dụ:

Chi trưởng:
1.000.000đ

Chi thứ:
500.000đ.

============================================================
34. GHI NHẬN THU TIỀN
============================================================

Khi thành viên thực sự đóng:

Tạo transaction.

Bảng:

financial_transactions

Fields:

id
family_id
fund_id
transaction_code
transaction_type
category_id
event_id
member_id
amount
payment_method
transaction_date
description
receipt_url
status
created_by
approved_by
created_at
updated_at

transaction_type:

INCOME

EXPENSE

TRANSFER

ADJUSTMENT

============================================================
35. KHOẢN CHI
============================================================

expense_records:

id
family_id
fund_id
category_id
event_id
amount
recipient
expense_date
payment_method
description
receipt_url
status
created_by
approved_by
created_at
updated_at

Status:

DRAFT

PENDING_APPROVAL

APPROVED

REJECTED

CANCELLED

============================================================
36. QUY TRÌNH CHI
============================================================

Tạo phiếu:

DRAFT

↓

SUBMIT

↓

PENDING_APPROVAL

↓

APPROVED

↓

POSTED

Chỉ giao dịch POSTED mới ảnh hưởng số dư quỹ.

============================================================
37. ĐÓNG GÓP
============================================================

contributions:

id
family_id
member_id
fund_id
event_id
amount
purpose
payment_method
transaction_id
created_at

Có thể là:

Đóng góp tự nguyện.

============================================================
38. TÀI TRỢ
============================================================

sponsorships:

id
family_id
sponsor_name
member_id nullable
amount
purpose
event_id
fund_id
sponsor_type
notes
created_at

Sponsor type:

MEMBER

RELATIVE

BUSINESS

ORGANIZATION

OTHER

============================================================
39. SỔ QUỸ
============================================================

Không tính số dư ở frontend một cách tùy tiện.

Sổ quỹ phải dựa trên transaction đã POSTED.

Ledger:

opening balance

+ income

- expense

= closing balance.

Mỗi transaction có running balance hoặc được tính từ ledger.

============================================================
40. TÍNH TOÀN VẸN TÀI CHÍNH
============================================================

Không cho phép:

xóa giao dịch đã POSTED.

Nếu sai:

CREATE REVERSAL

hoặc

ADJUSTMENT

kèm lý do.

Mọi thay đổi phải audit.

============================================================
41. AUDIT LOG
============================================================

audit_logs:

id
family_id
user_id
action
entity_type
entity_id
old_data
new_data
ip_address nếu có
created_at

Audit:

CREATE

UPDATE

DELETE_ATTEMPT

APPROVE

REJECT

POST

REVERSE

LOGIN

LOGOUT

============================================================
42. BÁO CÁO
============================================================

Dashboard tài chính:

Tổng quỹ

Tổng thu

Tổng chi

Phải thu

Đã thu

Còn phải thu.

Reports:

Theo thời gian.

Theo danh mục.

Theo sự kiện.

Theo chi.

Theo thành viên.

Theo quỹ.

============================================================
43. BÁO CÁO SỰ KIỆN
============================================================

Ví dụ:

GIỖ TỔ 2027

Ngân sách:

30.000.000

Tổng thu:

35.000.000

Tổng chi:

29.800.000

Chênh lệch:

5.200.000

Danh sách chi tiết.

============================================================
44. THÔNG BÁO
============================================================

notifications:

id
user_id
family_id
type
title
message
reference_type
reference_id
is_read
created_at

============================================================
45. DASHBOARD
============================================================

Dashboard gồm:

Gia tộc.

Thành viên.

Số đời.

Số chi.

Quỹ.

Sự kiện.

Ngày giỗ.

Việc cần xử lý.

Recent transactions.

============================================================
46. SEARCH
============================================================

Global search:

Thành viên

Chi

Nhánh

Sự kiện

Ngày giỗ

Giao dịch

Khoản thu

Khoản chi.

============================================================
47. IMPORT / EXPORT
============================================================

Cho phép:

Import thành viên CSV/Excel.

Export thành viên.

Export giao dịch.

Export báo cáo.

Export danh sách ngày giỗ.

Không cho phép import làm phá vỡ quan hệ dữ liệu.

Có preview trước khi import.

============================================================
48. VALIDATION
============================================================

Dùng Zod.

Validate:

Email.

Phone.

Ngày.

Số tiền.

Quan hệ gia phả.

Ngày âm.

Tháng nhuận.

Không cho amount <= 0.

Không cho expense vượt quá số dư khả dụng
trừ khi có cấu hình cho phép.

============================================================
49. SECURITY
============================================================

Bắt buộc:

Supabase RLS.

Mỗi query phải giới hạn family_id.

Không expose service role key frontend.

Không lưu mật khẩu riêng.

Không tin role từ frontend.

Authorization phải được kiểm tra server-side/database.

Storage policies.

File upload validation.

Rate limiting nếu cần.

============================================================
50. MULTI-TENANT
============================================================

Đây là ứng dụng multi-family.

Một user:

có thể thuộc nhiều family.

Ví dụ:

User A

→ Gia tộc Nguyễn

→ Gia tộc Trần.

UI phải có Family Switcher.

Mọi dữ liệu phải thuộc:

family_id.

============================================================
51. STORAGE
============================================================

Supabase Storage buckets:

avatars

family-media

documents

receipts

event-media

Mỗi bucket có policy phù hợp.

============================================================
52. RESPONSIVE
============================================================

Desktop.

Tablet.

Mobile.

Mobile bottom navigation:

Trang chủ

Gia phả

Lịch

Tài chính

Thêm.

FAB:

+

============================================================
53. UI DESIGN
============================================================

Phong cách:

Modern Vietnamese Heritage.

Màu:

Forest Green

Deep Navy

Gold

White

Background sáng.

Card bo góc vừa phải.

Shadow nhẹ.

Không quá nhiều gradient.

Font dễ đọc.

Hỗ trợ người lớn tuổi.

Button đủ lớn.

============================================================
54. ACCESSIBILITY
============================================================

WCAG-friendly.

Keyboard navigation.

Focus state.

Contrast.

ARIA labels.

Không dùng màu là tín hiệu duy nhất.

============================================================
55. ERROR HANDLING
============================================================

Mỗi API:

success

loading

error

empty.

Không hiển thị raw error.

Hiển thị tiếng Việt.

============================================================
56. EMPTY STATES
============================================================

Nếu chưa có:

Gia phả

Thành viên

Sự kiện

Ngày giỗ

Khoản thu

Khoản chi

Giao dịch

Tài trợ

phải có Empty State.

============================================================
57. CONFIRMATION
============================================================

Các thao tác nguy hiểm:

Xóa thành viên.

Hủy sự kiện.

Hủy khoản thu.

Hủy khoản chi.

Phải confirmation.

Giao dịch tài chính không được delete vật lý.

============================================================
58. SEED DATA
============================================================

Tạo seed development:

1 gia tộc.

6 đời.

7 chi.

50+ thành viên.

Một số người đã mất.

Ngày giỗ.

10 sự kiện.

Quỹ:

100.000.000đ.

Khoản thu.

Khoản chi.

Đóng góp.

Tài trợ.

Audit log.

============================================================
59. DEMO FAMILY
============================================================

Tạo:

"GIA TỘC NGUYỄN"

Thủy tổ:

Nguyễn Văn Thủy Tổ.

Các đời:

Đời 1
Đời 2
Đời 3
Đời 4
Đời 5
Đời 6.

Có:

Chi trưởng.

Chi 2.

Chi 3.

Chi 4.

Chi 5.

Chi 6.

Chi 7.

============================================================
60. DATABASE MIGRATION
============================================================

Tạo migration SQL hoàn chỉnh.

Có:

Tables

Indexes

Foreign keys

Unique constraints

Check constraints

Enums

Triggers nếu cần.

RLS policies.

Functions.

Views nếu cần.

============================================================
61. INDEXING
============================================================

Index:

family_id

member_id

event_id

fund_id

transaction_date

created_at

lunar_month

lunar_day

branch_id

generation_id.

============================================================
62. BUSINESS RULES
============================================================

RULE 01:

Không có family_id → không có dữ liệu nghiệp vụ.

RULE 02:

User chỉ được truy cập family mà user là member.

RULE 03:

Chỉ OWNER/ADMIN có thể quản lý membership.

RULE 04:

Chỉ GENEALOGY_ADMIN/ADMIN/OWNER
được sửa cây gia phả.

RULE 05:

Chỉ TREASURER/ADMIN/OWNER
được tạo giao dịch tài chính.

RULE 06:

Chi phải được APPROVE trước POST.

RULE 07:

Giao dịch POSTED không được delete.

RULE 08:

Ngày giỗ lặp theo Âm lịch.

RULE 09:

Tháng nhuận phải được lưu riêng.

RULE 10:

Phải thu không làm tăng số dư quỹ.

RULE 11:

Chỉ khoản thu thực tế đã ghi nhận mới làm tăng quỹ.

RULE 12:

Chỉ khoản chi POSTED mới làm giảm quỹ.

============================================================
63. TRANSACTION CONSISTENCY
============================================================

Khi ghi nhận khoản thu:

1. Validate assessment.

2. Validate amount.

3. Create transaction.

4. Update amount_paid.

5. Calculate amount_remaining.

6. Update status.

7. Update ledger.

8. Create audit log.

Các bước phải atomic.

Nếu lỗi:

ROLLBACK.

============================================================
64. FINANCIAL LEDGER
============================================================

Không dùng:

current_balance = current_balance + amount

một cách tùy tiện ở frontend.

Ledger phải có source transaction.

Có thể sử dụng database function/trigger
để đảm bảo consistency.

============================================================
65. LUNAR CALENDAR SERVICE
============================================================

Tạo abstraction:

LunarCalendarService

Methods:

solarToLunar()

lunarToSolar()

getLunarYear()

getCanChi()

isLeapMonth()

getLunarMonthDays()

getAnnualMemorialDate()

Không để business logic ngày âm rải rác trong UI.

============================================================
66. EVENT RECURRENCE
============================================================

Recurring events phải hỗ trợ:

YEARLY_LUNAR

YEARLY_SOLAR

NONE.

Ngày giỗ:

YEARLY_LUNAR.

============================================================
67. NOTIFICATION ENGINE
============================================================

Tạo service:

NotificationService.

Có job xử lý:

Upcoming event.

Upcoming memorial.

Outstanding contribution.

Pending approval.

============================================================
68. PERFORMANCE
============================================================

Không fetch toàn bộ gia phả nếu không cần.

Pagination.

Lazy loading.

Virtualization nếu cần.

React Query caching.

Debounced search.

Tree data tối ưu.

============================================================
69. TESTING
============================================================

Phải viết:

Unit tests.

Integration tests.

Critical business logic tests.

E2E tests.

Đặc biệt test:

Lịch âm.

Ngày giỗ.

Tháng nhuận.

Phân quyền.

Multi-family isolation.

Financial transactions.

Ledger.

Audit.

============================================================
70. TEST CASE LỊCH ÂM
============================================================

Phải có test:

Solar → Lunar.

Lunar → Solar.

Normal month.

Leap month.

Year transition.

Timezone UTC+7.

Recurring memorial.

============================================================
71. TEST CASE TÀI CHÍNH
============================================================

Case:

Quỹ đầu kỳ:

100.000.000

Thu:

10.000.000

Chi:

5.000.000

Expected:

105.000.000.

Nếu transaction bị rollback:

Balance không thay đổi.

Nếu transaction POSTED:

Ledger thay đổi.

Nếu reversal:

Có transaction đảo ngược.

============================================================
72. LOGGING
============================================================

Development:

structured logging.

Production:

không log sensitive data.

Không log:

password

tokens

service role key.

============================================================
73. ENVIRONMENT
============================================================

Tạo:

.env.example

VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=

Không commit:

.env

secrets.

============================================================
74. DOCUMENTATION
============================================================

Tạo:

README.md

ARCHITECTURE.md

DATABASE.md

SECURITY.md

DEPLOYMENT.md

BUSINESS_RULES.md

TESTING.md

============================================================
75. DEVELOPMENT PHASES
============================================================

Không code tất cả trong một lần mà không kiểm tra.

Thực hiện theo phases.

PHASE 1:

Project setup.

Auth.

Supabase.

Database foundation.

PHASE 2:

Family.

Membership.

RBAC.

PHASE 3:

Members.

Generation.

Branch.

Relationship.

Genealogy tree.

PHASE 4:

Lunar calendar.

Memorial.

Events.

Reminder.

PHASE 5:

Funds.

Categories.

Income.

Expense.

Contribution.

Sponsorship.

Ledger.

PHASE 6:

Reports.

Notifications.

Audit.

PHASE 7:

Import/export.

Settings.

Performance.

PHASE 8:

Testing.

Security audit.

UX refinement.

Deployment.

============================================================
76. DEFINITION OF DONE
============================================================

Không được coi project hoàn thành chỉ vì:

npm run build

thành công.

Definition of Done:

[ ] Authentication hoạt động.

[ ] User có thể tạo family.

[ ] User có thể mời member.

[ ] RLS hoạt động.

[ ] Gia phả hoạt động.

[ ] Member CRUD hoạt động.

[ ] Generation hoạt động.

[ ] Branch hoạt động.

[ ] Relationship hoạt động.

[ ] Tree hoạt động.

[ ] Lunar calendar hoạt động.

[ ] Ngày giỗ hoạt động.

[ ] Recurring memorial hoạt động.

[ ] Leap month hoạt động.

[ ] Event hoạt động.

[ ] Reminder hoạt động.

[ ] Fund hoạt động.

[ ] Income assessment hoạt động.

[ ] Bulk assignment hoạt động.

[ ] Payment recording hoạt động.

[ ] Expense approval hoạt động.

[ ] Contribution hoạt động.

[ ] Sponsorship hoạt động.

[ ] Ledger hoạt động.

[ ] Financial reports hoạt động.

[ ] Audit log hoạt động.

[ ] RBAC hoạt động.

[ ] Multi-family isolation hoạt động.

[ ] Responsive hoạt động.

[ ] Error handling hoàn chỉnh.

[ ] Empty states hoàn chỉnh.

[ ] Loading states hoàn chỉnh.

[ ] Unit tests.

[ ] Integration tests.

[ ] E2E critical flows.

[ ] README.

[ ] Deployment documentation.

============================================================
77. QUY TẮC LÀM VIỆC CỦA AI CODING AGENT
============================================================

TRƯỚC KHI CODE:

1. Phân tích repository hiện tại.

2. Nếu đã có code:
   Không rewrite toàn bộ một cách tùy tiện.

3. Xác định:
   - Existing architecture
   - Existing database
   - Existing routes
   - Existing components
   - Existing dependencies.

4. Lập implementation plan.

5. Kiểm tra dependencies.

6. Kiểm tra security.

SAU ĐÓ:

Implement từng phase.

Sau mỗi phase:

- npm run lint
- npm run typecheck
- npm run test
- npm run build

Nếu lỗi:

Tự sửa.

Không bỏ qua lỗi.

============================================================
78. KHÔNG ĐƯỢC LÀM
============================================================

KHÔNG:

- Hard-code dữ liệu nghiệp vụ.
- Fake API.
- Mock financial balance trong production.
- Bỏ RLS.
- Bỏ authentication.
- Bỏ authorization.
- Dùng localStorage làm database chính.
- Lưu ngày âm dưới dạng text duy nhất.
- Cố định ngày dương cho ngày giỗ.
- Cho frontend tự quyết định quyền.
- Cho xóa transaction đã posted.
- Dùng service role key ở frontend.
- Tạo một file code hàng nghìn dòng.
- Dùng any tràn lan.
- Tắt TypeScript strict.
- Bỏ test business logic.

============================================================
79. UX TIẾNG VIỆT
============================================================

Toàn bộ giao diện bằng tiếng Việt.

Không dùng:

Delete

Cancel

Submit

Save

Approve

mà phải hiển thị:

Xóa

Hủy

Gửi duyệt

Lưu

Duyệt.

Các lỗi cũng bằng tiếng Việt.

============================================================
80. DASHBOARD CUỐI CÙNG
============================================================

Dashboard phải thể hiện rõ:

--------------------------------------------

🌳 GIA PHẢ

6 đời

7 chi

128 thành viên

[ Xem cây gia phả ]

--------------------------------------------

📅 LỊCH GIA TỘC

Hôm nay:

23/08/2026

01/07 Bính Ngọ

Sắp tới:

Giỗ cụ Nguyễn Văn A

12/05 ÂL

18/06/2027

[ Xem lịch ]

--------------------------------------------

💰 QUỸ GIA TỘC

Số dư:

86.500.000đ

Thu tháng này:

12.000.000đ

Chi tháng này:

4.500.000đ

Còn phải thu:

8.500.000đ

[ Xem sổ quỹ ]

--------------------------------------------

VIỆC CẦN XỬ LÝ

12 thành viên chưa đóng quỹ.

3 khoản chi chờ duyệt.

2 sự kiện sắp diễn ra.

--------------------------------------------

============================================================
81. FINAL PRODUCT VISION
============================================================

Sản phẩm cuối cùng phải có cảm giác:

"Đây là ngôi nhà số của gia tộc."

Một thành viên lớn tuổi có thể dễ dàng:

Xem cây gia phả.

Xem ngày giỗ.

Xem lịch gia tộc.

Xem quỹ.

Xem các khoản đóng góp.

Một người quản trị có thể:

Quản lý gia phả.

Quản lý thành viên.

Tạo sự kiện.

Tạo khoản thu.

Gán mức thu hàng loạt.

Theo dõi đóng góp.

Quản lý khoản chi.

Duyệt chi.

Theo dõi sổ quỹ.

Xuất báo cáo.

Truy vết toàn bộ lịch sử.

============================================================
82. BẮT ĐẦU IMPLEMENTATION
============================================================

Bây giờ hãy:

STEP 1:
Phân tích repository hiện tại.

STEP 2:
Tạo Architecture Plan.

STEP 3:
Tạo Database Schema.

STEP 4:
Tạo Supabase migrations.

STEP 5:
Tạo RLS.

STEP 6:
Tạo Authentication.

STEP 7:
Tạo UI Shell.

STEP 8:
Implement từng module theo Phase.

STEP 9:
Viết tests.

STEP 10:
Chạy lint/typecheck/test/build.

STEP 11:
Sửa toàn bộ lỗi.

STEP 12:
Kiểm tra Security.

STEP 13:
Kiểm tra UX.

STEP 14:
Hoàn thiện README.

KHÔNG DỪNG LẠI Ở UI MOCKUP.

PHẢI TẠO ỨNG DỤNG CÓ THỂ CHẠY THỰC TẾ.
============================================================
MODULE 16 — SUBSCRIPTION & BILLING
============================================================

MỤC TIÊU:

Xây dựng hệ thống quản lý gói dịch vụ và thuê bao cho Webapp
"GIA PHẢ GIA TỘC".

Hệ thống phải cho phép:

- Người dùng đăng ký tài khoản.
- Tạo gia tộc.
- Được dùng thử.
- Chọn gói dịch vụ.
- Nâng cấp gói.
- Hạ cấp gói.
- Gia hạn.
- Hủy gói.
- Theo dõi trạng thái thuê bao.
- Theo dõi lịch sử thanh toán.
- Theo dõi hóa đơn.
- Theo dõi hạn sử dụng.
- Kiểm soát tính năng theo gói.
- Khóa/mở tính năng theo subscription.
- Quản trị viên quản lý toàn bộ subscription.

============================================================
16.1. NGUYÊN TẮC QUAN TRỌNG
============================================================

SUBSCRIPTION THUỘC VỀ FAMILY.

KHÔNG thuộc trực tiếp về USER.

Ví dụ:

User A
  ├── Gia tộc Nguyễn
  │      └── Subscription Premium
  │
  └── Gia tộc Trần
         └── Subscription Free

Một user có thể tham gia nhiều gia tộc.

Mỗi gia tộc có subscription riêng.

============================================================
16.2. SUBSCRIPTION LIFECYCLE
============================================================

Các trạng thái:

TRIALING
ACTIVE
PAST_DUE
CANCELLED
EXPIRED
SUSPENDED
READ_ONLY

Luồng thông thường:

TRIALING
   ↓
ACTIVE
   ↓
ACTIVE
   ↓
CANCELLED
   ↓
EXPIRED

Nếu thanh toán thất bại:

ACTIVE
   ↓
PAST_DUE
   ↓
ACTIVE

hoặc:

PAST_DUE
   ↓
SUSPENDED
   ↓
EXPIRED

============================================================
16.3. SUBSCRIPTION DATA
============================================================

Subscription phải lưu:

id
family_id
plan_id
status
trial_start_at
trial_end_at
current_period_start
current_period_end
cancel_at_period_end
cancelled_at
expired_at
auto_renew
payment_provider
external_subscription_id
created_at
updated_at

============================================================
16.4. ACTIVE SUBSCRIPTION
============================================================

Tại một thời điểm:

Mỗi family chỉ có tối đa một subscription ACTIVE/TRIALING.

Không tạo nhiều subscription active đồng thời.

============================================================
16.5. PLAN
============================================================

Subscription phải tham chiếu:

plan_id.

Không hard-code:

49.000đ

99.000đ

199.000đ

trong frontend.

Giá phải được lưu trong database.

============================================================
16.6. FAMILY BILLING OWNER
============================================================

Mỗi family có:

billing_owner_user_id.

Thông thường:

OWNER của family.

Billing Owner có quyền:

- xem gói
- nâng cấp
- thanh toán
- xem hóa đơn
- hủy subscription

============================================================
16.7. BILLING PAGE
============================================================

Route:

/app/billing

Hiển thị:

Gói hiện tại

Trạng thái

Ngày bắt đầu

Ngày hết hạn

Ngày gia hạn

Số thành viên sử dụng

Dung lượng sử dụng

Tính năng đang sử dụng

Lịch sử thanh toán

Hóa đơn

Nút:

[ Nâng cấp ]

[ Đổi gói ]

[ Quản lý thanh toán ]

[ Hủy gói ]

============================================================
16.8. UPGRADE
============================================================

Khi nâng cấp:

Hiển thị:

Gói hiện tại

Gói mới

Giá

Phần chênh lệch

Ngày hiệu lực.

Không tự ý tính tiền ở frontend.

Server/Billing Service phải quyết định:

proration

hoặc

effective_next_cycle.

============================================================
16.9. DOWNGRADE
============================================================

Hạ cấp không nhất thiết có hiệu lực ngay.

Mặc định:

downgrade_at_period_end = true.

Ví dụ:

Premium
→ Family

Người dùng vẫn được dùng Premium
đến hết kỳ hiện tại.

Sau đó chuyển Family.

============================================================
16.10. CANCEL
============================================================

Cho phép:

Cancel immediately

hoặc

Cancel at period end.

Mặc định:

Cancel at period end.

Dữ liệu không bị xóa.

============================================================
16.11. READ-ONLY MODE
============================================================

Khi subscription hết hạn:

Family chuyển:

READ_ONLY.

Cho phép:

Xem gia phả.

Xem thành viên.

Xem lịch.

Xem ngày giỗ.

Xem lịch sử tài chính.

Xem báo cáo cơ bản.

Không cho phép các thao tác yêu cầu subscription:

Tạo mới thành viên.

Tạo sự kiện.

Tạo khoản thu.

Ghi nhận giao dịch.

Tạo khoản chi.

Upload tài liệu vượt quota.

Các thao tác bị khóa phải hiển thị lý do.

============================================================
16.12. DATA RETENTION
============================================================

TUYỆT ĐỐI KHÔNG xóa dữ liệu family
chỉ vì subscription hết hạn.

Không xóa:

Gia phả

Thành viên

Quan hệ

Ngày giỗ

Sự kiện

Tài chính

Giao dịch

Audit log

Ảnh

Tài liệu.

============================================================


============================================================
MODULE 17 — PLAN MANAGEMENT
============================================================

MỤC TIÊU:

Quản lý toàn bộ các gói dịch vụ mà không cần sửa code.

============================================================
17.1. PLAN STRUCTURE
============================================================

Mỗi plan:

id
code
name
description
short_description
price_monthly
price_yearly
currency
billing_interval
trial_days
is_public
is_active
sort_order
created_at
updated_at

============================================================
17.2. PLAN EXAMPLE
============================================================

FREE

price:
0

trial:
0

FAMILY

49.000đ/tháng

GIA_TOC

99.000đ/tháng

DONG_HO

199.000đ/tháng

PREMIUM

499.000đ/tháng

Đây chỉ là dữ liệu cấu hình.

KHÔNG hard-code trong application.

============================================================
17.3. PLAN FEATURES
============================================================

Tạo:

plan_features

Fields:

id
plan_id
feature_code
feature_name
feature_type
limit_value
is_enabled

Feature types:

BOOLEAN

INTEGER

STORAGE

ENUM

Ví dụ:

MAX_MEMBERS
MAX_STORAGE
MAX_EVENTS
MAX_FAMILY_ADMINS
MAX_BRANCHES
MAX_EXPORTS_PER_MONTH

============================================================
17.4. FEATURE ENTITLEMENTS
============================================================

Ví dụ:

FREE:

MAX_MEMBERS = 30

MAX_STORAGE = 500MB

MAX_BRANCHES = 3

MAX_EVENTS = 10

FINANCE = BASIC

REPORTS = BASIC

FAMILY:

MAX_MEMBERS = 100

MAX_STORAGE = 2GB

MAX_BRANCHES = 10

MAX_EVENTS = UNLIMITED

FINANCE = FULL

REPORTS = STANDARD

GIA_TOC:

MAX_MEMBERS = 300

MAX_STORAGE = 5GB

MAX_BRANCHES = 30

MAX_EVENTS = UNLIMITED

FINANCE = FULL

REPORTS = ADVANCED

PREMIUM:

MAX_MEMBERS = UNLIMITED

MAX_STORAGE = 20GB

MAX_BRANCHES = UNLIMITED

MAX_EVENTS = UNLIMITED

FINANCE = FULL

REPORTS = ADVANCED

API = ENABLED

============================================================
17.5. PLAN VERSIONING
============================================================

Không thay đổi giá của plan cũ một cách phá vỡ
subscription hiện tại.

Khi thay đổi lớn:

Tạo plan version mới.

Ví dụ:

GIA_TOC_V1

GIA_TOC_V2

Subscription hiện tại giữ nguyên version.

============================================================
17.6. PLAN COMPARISON
============================================================

UI phải có:

/pricing

Hiển thị:

Tên gói

Giá tháng

Giá năm

Số thành viên

Dung lượng

Số nhánh

Tài chính

Lịch

Báo cáo

Hỗ trợ

CTA:

[Dùng thử]

[Nâng cấp]

[Đang sử dụng]

============================================================
17.7. ANNUAL BILLING
============================================================

Hỗ trợ:

MONTHLY

YEARLY.

Gói năm có thể có:

annual_discount_percent.

Không hard-code mức giảm.

============================================================
17.8. ADMIN PLAN MANAGEMENT
============================================================

Admin có thể:

Tạo plan.

Sửa plan.

Ngừng bán plan.

Thay đổi feature.

Thay đổi giới hạn.

Thiết lập trial.

Không được xóa plan
đang được subscription sử dụng.

============================================================


============================================================
MODULE 18 — PAYMENT
============================================================

MỤC TIÊU:

Xây dựng lớp thanh toán độc lập với payment provider.

============================================================
18.1. PAYMENT ABSTRACTION
============================================================

Tạo:

PaymentService

Không để UI gọi trực tiếp:

VNPay

MoMo

Stripe

VietQR

hay provider khác.

Kiến trúc:

Frontend
 ↓
Billing Service
 ↓
PaymentService
 ↓
Payment Provider

============================================================
18.2. PAYMENT PROVIDERS
============================================================

Thiết kế abstraction hỗ trợ:

MANUAL_BANK_TRANSFER

VIETQR

VNPAY

MOMO

STRIPE nếu cần mở rộng quốc tế.

Provider nào chưa triển khai:

phải có interface.

Không tạo fake payment.

============================================================
18.3. PAYMENT
============================================================

Bảng:

payments

Fields:

id
family_id
subscription_id
invoice_id
amount
currency
payment_method
provider
provider_transaction_id
status
paid_at
failure_reason
metadata
created_at
updated_at

Status:

PENDING

PROCESSING

SUCCEEDED

FAILED

CANCELLED

REFUNDED

============================================================
18.4. INVOICE
============================================================

Bảng:

invoices

Fields:

id
family_id
subscription_id
invoice_number
subtotal
discount
tax
total
currency
status
issued_at
due_at
paid_at
pdf_url
created_at
updated_at

Invoice status:

DRAFT

OPEN

PAID

VOID

UNCOLLECTIBLE

REFUNDED

============================================================
18.5. PAYMENT FLOW
============================================================

Ví dụ:

User chọn:

Gói GIA TỘC
99.000đ/tháng

↓

Create Invoice

↓

Create Payment

↓

Payment Provider

↓

User thanh toán

↓

Provider callback/webhook

↓

Verify webhook

↓

Payment = SUCCEEDED

↓

Invoice = PAID

↓

Subscription = ACTIVE

============================================================
18.6. WEBHOOK
============================================================

Webhook là nguồn xác nhận thanh toán.

KHÔNG dựa vào frontend redirect.

Webhook phải:

Verify signature.

Validate provider.

Check transaction.

Check idempotency.

Update payment.

Update invoice.

Update subscription.

Create audit log.

============================================================
18.7. IDEMPOTENCY
============================================================

Một payment event có thể được provider gửi nhiều lần.

Không được tạo:

2 payment

2 invoice

2 subscription period

cho cùng một event.

Tạo:

idempotency_key.

============================================================
18.8. REFUND
============================================================

Hỗ trợ:

FULL_REFUND

PARTIAL_REFUND.

Refund phải tạo audit.

Không xóa payment.

============================================================
18.9. MANUAL BANK TRANSFER
============================================================

Giai đoạn MVP cho phép:

Chuyển khoản ngân hàng.

Hiển thị:

QR

Số tài khoản

Ngân hàng

Tên tài khoản

Số tiền

Nội dung chuyển khoản.

Ví dụ:

GP-GIATOC-ABC123

User upload:

payment proof.

Trạng thái:

PENDING_REVIEW.

Admin xác nhận:

APPROVED.

Sau đó:

Payment = SUCCEEDED.

============================================================
18.10. PAYMENT SECURITY
============================================================

Không lưu:

thông tin thẻ

CVV

password payment.

Không expose secret key.

Provider secret chỉ nằm server-side.

============================================================


============================================================
MODULE 19 — TRIAL MANAGEMENT
============================================================

MỤC TIÊU:

Cho phép gia tộc trải nghiệm đầy đủ sản phẩm trước khi trả phí.

============================================================
19.1. DEFAULT TRIAL
============================================================

Khi tạo family:

Tạo subscription:

TRIALING.

trial_days:

lấy từ plan/configuration.

Ví dụ:

30 ngày.

============================================================
19.2. TRIAL START
============================================================

trial_start_at:

thời điểm tạo subscription.

trial_end_at:

trial_start_at + trial_days.

Timezone:

UTC storage.

Display:

Asia/Ho_Chi_Minh.

============================================================
19.3. TRIAL COUNTDOWN
============================================================

UI hiển thị:

Còn 29 ngày.

Còn 7 ngày.

Còn 3 ngày.

Còn 1 ngày.

Đã hết hạn.

============================================================
19.4. TRIAL REMINDER
============================================================

Tạo notification:

7 ngày trước.

3 ngày trước.

1 ngày trước.

Ngày hết hạn.

Có thể gửi:

IN_APP

EMAIL

PUSH nếu có.

============================================================
19.5. TRIAL CONVERSION
============================================================

Nếu user mua gói:

TRIALING
→
ACTIVE.

Không tạo family mới.

Không tạo dữ liệu mới.

Giữ nguyên:

family_id.

============================================================
19.6. TRIAL EXPIRATION
============================================================

Khi:

now >= trial_end_at

và chưa thanh toán:

TRIALING
→
EXPIRED.

Family:

READ_ONLY.

============================================================
19.7. TRIAL EXTENSION
============================================================

Admin có thể gia hạn trial.

Ví dụ:

+7 ngày.

+14 ngày.

Phải ghi:

reason.

admin_user_id.

old_end_date.

new_end_date.

audit log.

============================================================
19.8. TRIAL ABUSE PREVENTION
============================================================

Không cho cùng một family:

tạo trial liên tục.

Khi family đã từng trial:

trial_used = true.

Nếu user xóa family:

không được dùng việc xóa để reset trial.

Có thể áp dụng:

trial eligibility policy.

============================================================
19.9. TRIAL DATA RETENTION
============================================================

Hết trial:

KHÔNG xóa dữ liệu.

Chuyển:

READ_ONLY.

============================================================


============================================================
MODULE 20 — USAGE & LIMITS
============================================================

MỤC TIÊU:

Theo dõi mức sử dụng và áp dụng giới hạn theo plan.

============================================================
20.1. USAGE METRICS
============================================================

Theo dõi:

members

branches

events

storage

family_admins

exports

documents

photos

notifications.

============================================================
20.2. USAGE TABLE
============================================================

usage_metrics:

id
family_id
metric_code
period_start
period_end
usage_value
updated_at

============================================================
20.3. QUOTA
============================================================

Mỗi plan có quota.

Ví dụ:

MAX_MEMBERS = 100.

Nếu:

usage = 99

Cho phép thêm 1.

Nếu:

usage = 100

Không cho thêm.

UI phải hiển thị:

100 / 100 thành viên.

============================================================
20.4. SOFT LIMIT
============================================================

Một số giới hạn:

80%:

warning.

90%:

strong warning.

100%:

block.

============================================================
20.5. USAGE WARNING
============================================================

Ví dụ:

"Gia tộc đã sử dụng 82% giới hạn thành viên."

CTA:

[Nâng cấp gói]

============================================================
20.6. HARD LIMIT
============================================================

Nếu vượt quota:

Backend từ chối.

Không chỉ khóa UI.

Ví dụ:

MAX_MEMBERS = 100.

Frontend:

Disable button.

Backend:

Reject request.

============================================================
20.7. UNLIMITED
============================================================

Không dùng:

999999999.

Sử dụng:

NULL

hoặc:

UNLIMITED.

Phải thống nhất cách biểu diễn.

============================================================
20.8. STORAGE QUOTA
============================================================

Storage phải tính:

photos

documents

avatars

event media

receipts.

Không chỉ dựa vào UI.

============================================================
20.9. MONTHLY USAGE
============================================================

Một số feature có giới hạn theo tháng:

MAX_EXPORTS_PER_MONTH

MAX_NOTIFICATIONS_PER_MONTH

MAX_REPORTS_PER_MONTH.

Usage phải reset theo billing period.

============================================================
20.10. USAGE DASHBOARD
============================================================

Billing page:

Thành viên:

128 / 300

Dung lượng:

1.2GB / 5GB

Sự kiện:

Không giới hạn

Xuất báo cáo:

8 / 20 tháng này.

============================================================
20.11. USAGE SERVICE
============================================================

Tạo:

UsageService

Methods:

getUsage()

getLimit()

canUseFeature()

checkQuota()

incrementUsage()

decrementUsage()

getUsagePercentage()

============================================================
20.12. FEATURE GATE
============================================================

Tạo:

FeatureGate

Ví dụ:

<FeatureGate feature="advanced_reports">

Nếu không được phép:

Hiển thị:

"Tính năng này dành cho gói Gia tộc trở lên."

[ Nâng cấp ]

============================================================
20.13. SERVER-SIDE ENFORCEMENT
============================================================

FeatureGate frontend chỉ phục vụ UX.

Không phải security boundary.

Mọi quota phải được enforce:

Database

Server

Edge Function

hoặc Service layer.

============================================================


============================================================
MODULE 21 — ADMIN BILLING
============================================================

MỤC TIÊU:

Xây dựng khu vực quản trị để chủ hệ thống quản lý:

User

Family

Plan

Subscription

Payment

Invoice

Trial

Usage

Revenue

Refund

Support.

============================================================
21.1. ADMIN ROUTES
============================================================

/admin/billing

/admin/billing/dashboard

/admin/billing/plans

/admin/billing/subscriptions

/admin/billing/payments

/admin/billing/invoices

/admin/billing/trials

/admin/billing/usage

/admin/billing/refunds

/admin/billing/audit

============================================================
21.2. BILLING DASHBOARD
============================================================

Hiển thị:

Total Families

Active Subscriptions

Trial Families

Expired

Past Due

MRR

ARR

Revenue

Refunds

Conversion Rate

Churn Rate.

============================================================
21.3. SUBSCRIPTION LIST
============================================================

Columns:

Family

Plan

Status

Trial End

Period End

Amount

Auto Renew

Created At

Actions.

Filter:

Plan

Status

Date.

Search:

Family name

Email

Subscription ID.

============================================================
21.4. PAYMENT MANAGEMENT
============================================================

Admin xem:

Payment ID

Family

Invoice

Amount

Provider

Status

Created At

Paid At.

Có thể:

Xem chi tiết.

Xem metadata.

Xem webhook event.

Xem audit.

============================================================
21.5. MANUAL PAYMENT APPROVAL
============================================================

Đối với chuyển khoản:

PENDING_REVIEW.

Admin:

Xem proof.

Kiểm tra số tiền.

Kiểm tra nội dung.

Approve.

Reject.

Nếu reject:

bắt buộc lý do.

============================================================
21.6. INVOICE MANAGEMENT
============================================================

Admin:

Xem invoice.

Tải PDF.

Gửi invoice.

Void invoice.

Refund nếu được phép.

Không được sửa invoice PAID
một cách tùy tiện.

============================================================
21.7. TRIAL MANAGEMENT
============================================================

Admin có thể:

Xem trial.

Gia hạn trial.

Hủy trial.

Chuyển trial sang plan.

Ghi lý do.

Mọi thay đổi phải audit.

============================================================
21.8. SUBSCRIPTION MANAGEMENT
============================================================

Admin có thể:

Activate.

Suspend.

Cancel.

Resume.

Extend.

Change plan.

Manual override.

NHƯNG:

Mọi manual override phải:

require reason.

create audit log.

record admin user.

============================================================
21.9. REVENUE DASHBOARD
============================================================

Biểu đồ:

Doanh thu theo tháng.

Doanh thu theo plan.

Doanh thu theo payment provider.

New subscriptions.

Renewals.

Cancellations.

Churn.

Trial conversion.

============================================================
21.10. MRR
============================================================

MRR:

Monthly Recurring Revenue.

Không tính:

one-time payment

refund

failed payment.

Phải định nghĩa rõ trong reporting.

============================================================
21.11. ARR
============================================================

ARR:

Annual Recurring Revenue.

ARR = MRR × 12

hoặc tính từ annual subscriptions theo business rule.

============================================================
21.12. TRIAL CONVERSION
============================================================

Conversion Rate:

Trial đã chuyển paid
/
Trial đã kết thúc.

Không tính trial còn đang active.

============================================================
21.13. CHURN
============================================================

Churn phải có định nghĩa rõ.

Ví dụ:

Subscription cancelled/expired
trong kỳ
/
Active subscriptions đầu kỳ.

Không tính:

temporary suspension

payment retry.

============================================================
21.14. BILLING AUDIT
============================================================

Admin Billing phải có audit:

Plan changed

Price changed

Trial extended

Subscription activated

Subscription suspended

Payment approved

Payment rejected

Refund issued

Manual adjustment.

============================================================
21.15. ADMIN BILLING SECURITY
============================================================

Chỉ:

SUPER_ADMIN

BILLING_ADMIN

mới được truy cập.

OWNER của family:

KHÔNG được truy cập Admin Billing.

Treasurer của family:

KHÔNG được truy cập Admin Billing.

============================================================
21.16. BILLING DATA EXPORT
============================================================

Admin có thể export:

Subscriptions.

Payments.

Invoices.

Revenue.

Trial.

Usage.

CSV/Excel.

============================================================


============================================================
MODULE 22 — SUBSCRIPTION DATABASE OBJECTS
============================================================

Bổ sung database:

plans

plan_features

plan_versions

subscriptions

subscription_events

payments

payment_methods

invoices

invoice_items

refunds

usage_metrics

feature_entitlements

billing_webhook_events

trial_extensions

billing_audit_logs

============================================================
============================================================
MODULE 23 — SUBSCRIPTION BUSINESS RULES
============================================================

BR-SUB-001

Subscription thuộc FAMILY, không thuộc USER.

------------------------------------------------------------

BR-SUB-002

Một family chỉ có tối đa một subscription
ở trạng thái TRIALING hoặc ACTIVE tại một thời điểm.

------------------------------------------------------------

BR-SUB-003

Hết trial mà không thanh toán:

TRIALING
→ EXPIRED.

------------------------------------------------------------

BR-SUB-004

Subscription EXPIRED không được xóa dữ liệu family.

------------------------------------------------------------

BR-SUB-005

Family EXPIRED chuyển READ_ONLY.

------------------------------------------------------------

BR-SUB-006

Chỉ Billing Owner hoặc quyền phù hợp mới được thay đổi subscription.

------------------------------------------------------------

BR-SUB-007

Upgrade có thể có hiệu lực ngay hoặc theo billing policy.

Phải cấu hình rõ.

------------------------------------------------------------

BR-SUB-008

Downgrade mặc định có hiệu lực cuối billing period.

------------------------------------------------------------

BR-SUB-009

Payment thành công phải được xác nhận bởi server/webhook.

Không tin frontend.

------------------------------------------------------------

BR-SUB-010

Một webhook có thể được gửi nhiều lần.

Phải xử lý idempotency.

------------------------------------------------------------

BR-SUB-011

Payment đã SUCCEEDED không được tạo lại
bởi cùng provider event.

------------------------------------------------------------

BR-SUB-012

Invoice PAID không được sửa trực tiếp.

Nếu điều chỉnh:

tạo credit/refund/adjustment.

------------------------------------------------------------

BR-SUB-013

Transaction thanh toán không được xóa vật lý.

------------------------------------------------------------

BR-SUB-014

Manual subscription override bắt buộc có:

admin_user_id

reason

timestamp

audit log.

------------------------------------------------------------

BR-PLAN-001

Không hard-code giá plan trong frontend.

------------------------------------------------------------

BR-PLAN-002

Không xóa plan đang được subscription tham chiếu.

------------------------------------------------------------

BR-PLAN-003

Thay đổi giá không được làm thay đổi
subscription lịch sử ngoài ý muốn.

------------------------------------------------------------

BR-PLAN-004

Plan có version.

------------------------------------------------------------

BR-TRIAL-001

Mỗi family chỉ được hưởng trial theo trial policy.

------------------------------------------------------------

BR-TRIAL-002

Xóa và tạo lại family không được tự động
reset trial.

------------------------------------------------------------

BR-TRIAL-003

Trial extension phải được audit.

------------------------------------------------------------

BR-USAGE-001

Quota phải được enforce ở backend.

------------------------------------------------------------

BR-USAGE-002

Frontend FeatureGate không phải security boundary.

------------------------------------------------------------

BR-USAGE-003

Khi quota đạt 100%:

backend phải từ chối thao tác tạo mới
nếu feature không cho phép overage.

------------------------------------------------------------

BR-USAGE-004

UNLIMITED không biểu diễn bằng số giả.

------------------------------------------------------------

BR-PAY-001

Không lưu card number/CVV.

------------------------------------------------------------

BR-PAY-002

Payment provider secret chỉ được sử dụng server-side.

------------------------------------------------------------

BR-PAY-003

Webhook phải xác thực chữ ký.

------------------------------------------------------------

BR-PAY-004

Refund không xóa payment gốc.

------------------------------------------------------------

BR-ADMIN-BILL-001

Chỉ SUPER_ADMIN/BILLING_ADMIN
được quản trị billing toàn hệ thống.

------------------------------------------------------------

BR-ADMIN-BILL-002

Mọi thao tác manual billing
phải có audit.

============================================================
============================================================
MODULE 24 — SAAS MONETIZATION DEFINITION OF DONE
============================================================

[ ] User có thể tạo family.

[ ] Family tự động nhận trial.

[ ] Trial countdown hoạt động.

[ ] Trial reminder hoạt động.

[ ] Trial expiration hoạt động.

[ ] Family chuyển READ_ONLY khi hết hạn.

[ ] Không mất dữ liệu khi hết hạn.

[ ] User xem được pricing.

[ ] User xem được plan hiện tại.

[ ] User nâng cấp được plan.

[ ] User hạ cấp được plan.

[ ] User hủy subscription.

[ ] Subscription lifecycle hoạt động.

[ ] Monthly billing hoạt động.

[ ] Yearly billing hoạt động.

[ ] Invoice hoạt động.

[ ] Payment hoạt động.

[ ] Webhook hoạt động.

[ ] Webhook idempotency hoạt động.

[ ] Manual bank transfer hoạt động.

[ ] Admin duyệt chuyển khoản.

[ ] Refund hoạt động.

[ ] Usage tracking hoạt động.

[ ] Quota enforcement hoạt động.

[ ] Feature gating hoạt động.

[ ] Admin Billing Dashboard hoạt động.

[ ] MRR hoạt động.

[ ] ARR hoạt động.

[ ] Trial conversion hoạt động.

[ ] Churn calculation hoạt động.

[ ] Billing audit hoạt động.

[ ] RLS hoạt động.

[ ] Billing security audit PASS.

[ ] Không có payment secret ở frontend.

[ ] Không lưu card/CVV.

[ ] Không hard-code pricing.

[ ] Không xóa dữ liệu khi subscription expired.

============================================================