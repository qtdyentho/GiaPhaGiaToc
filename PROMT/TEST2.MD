============================================================
INTERNAL ALPHA — FULL TEST EXECUTION
PROJECT: GIA PHẢ GIA TỘC
============================================================

Bộ dữ liệu Alpha đã được tạo:

/supabase/seed_alpha.sql
/docs/ALPHA_TEST_DATA.md

Environment:

INTERNAL ALPHA

KHÔNG sử dụng production database.
KHÔNG sử dụng dữ liệu người dùng thật.

============================================================
OBJECTIVE
============================================================

Thực sự EXECUTE toàn bộ Internal Alpha Test.

Không chỉ đọc test plan.

Không chỉ chạy npm test.

Phải kiểm tra:

UI
→ React
→ Service
→ Supabase
→ PostgreSQL
→ RLS
→ Business Rules
→ Database Functions
→ Notifications
→ Billing

theo luồng End-to-End.

============================================================
PHASE A — ENVIRONMENT
============================================================

1. Kiểm tra environment hiện tại.

2. Xác nhận Supabase project là:

INTERNAL ALPHA

3. Xác nhận KHÔNG phải production.

4. Kiểm tra migration/schema.

5. Kiểm tra seed_alpha.sql.

6. Kiểm tra test accounts.

7. Kiểm tra Storage buckets.

Nếu phát hiện production environment:

STOP TEST.

============================================================
PHASE B — AUTHENTICATION
============================================================

Test:

TEST-AUTH-001
Register

TEST-AUTH-002
Login

TEST-AUTH-003
Logout

TEST-AUTH-004
Session persistence

TEST-AUTH-005
Invalid password

TEST-AUTH-006
Unauthorized route

TEST-AUTH-007
Password reset nếu đã triển khai.

Expected:

Unauthorized user
→ DENIED.

============================================================
PHASE C — MULTI-TENANT
============================================================

Accounts:

Alpha:
truongtoc.alpha@giapha.vn

Beta:
truongtoc.beta@giapha.vn

Gamma:
truongtoc.gamma@giapha.vn

Test:

Alpha → Alpha data
Beta → Beta data
Gamma → Gamma data

Sau đó thử:

Alpha → Beta
Alpha → Gamma
Beta → Alpha
Beta → Gamma
Gamma → Alpha
Gamma → Beta

Test:

SELECT
INSERT
UPDATE
DELETE
RPC
Storage

Expected:

Cross-family access = DENIED.

Đặc biệt không được chỉ kiểm tra UI.

Phải test trực tiếp qua API/database layer.

============================================================
PHASE D — GENEALOGY
============================================================

Family Alpha:

86 members.

Test:

Add member
Edit member
View profile
Create relationship
View tree
Zoom
Pan
Search
Filter generation
Filter branch

Family Beta:

300 members.

Family Gamma:

500 members.

Test performance.

Record:

First Render
Tree Render
Search
Filter
Interaction

============================================================
PHASE E — LUNAR CALENDAR
============================================================

Kiểm tra toàn bộ:

Ngày âm
Ngày dương
Can Chi
Tháng nhuận
Ngày 30 Tết
Ngày giỗ
Recurring memorial

Test:

20 memorial records.

Kiểm tra:

30 days
15 days
7 days
3 days
1 day reminders.

Timezone:

Asia/Ho_Chi_Minh

============================================================
PHASE F — EVENTS
============================================================

Test:

Create event
Edit event
Cancel event
View event
Reminder
Budget

Events:

Giỗ Tổ
Họp họ
Khánh thành
Tu sửa từ đường

============================================================
PHASE G — FINANCE
============================================================

Test:

Create income category
Create expense category
Create assessment
Bulk assessment
Record payment
POST transaction
View ledger
Create expense
Approve expense
Reject expense
Reverse transaction

Kiểm tra:

Assessment ≠ Payment

Payment POSTED mới thay đổi fund balance.

============================================================
PHASE H — IMMUTABLE LEDGER
============================================================

Test:

Attempt DELETE POSTED transaction.

Expected:

DENIED.

Attempt UPDATE POSTED transaction.

Expected:

DENIED.

Reverse:

POSTED
→ REVERSAL

Required:

reason
user
timestamp
original_transaction_id

Kiểm tra balance sau reversal.

============================================================
PHASE I — RBAC
============================================================

Test toàn bộ roles đã định nghĩa.

Mỗi role:

Read
Create
Update
Delete
Approve
Reverse
Manage Billing
Manage Family
View Audit

Expected:

Unauthorized actions = DENIED.

============================================================
PHASE J — TRIAL
============================================================

Test:

TRIAL ACTIVE
TRIAL EXPIRING
TRIAL EXPIRED
CONVERTED

Kiểm tra:

Trial → Paid subscription.

============================================================
PHASE K — QUOTA
============================================================

Family Beta:

300/300

Test:

Add member #301.

Expected:

DENIED.

Không chỉ frontend.

Backend/database phải DENIED.

Family Alpha:

86/300

Test:

Add member.

Expected:

SUCCESS.

============================================================
PHASE L — READ ONLY
============================================================

Family Gamma:

500 members.

Subscription:

EXPIRED

Mode:

READ_ONLY

Test:

View genealogy
View member
View calendar
View memorial
View finance

Expected:

READ allowed.

Test:

Add member
Edit genealogy
Create event
Record income
Create expense
Upload document

Expected:

WRITE denied.

============================================================
PHASE M — PAYMENT
============================================================

Test payment lifecycle:

PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED

Test:

Correct amount
Wrong amount
Partial amount
Overpayment
Wrong reference
Duplicate transaction

Expected:

No false subscription activation.

============================================================
PHASE N — WEBHOOK
============================================================

Simulate bank webhook.

TEST-WEBHOOK-001

Valid signature.

Expected:

SUCCESS.

TEST-WEBHOOK-002

Invalid signature.

Expected:

REJECT.

TEST-WEBHOOK-003

Duplicate webhook.

Expected:

Idempotent.

TEST-WEBHOOK-004

Wrong invoice reference.

Expected:

REJECT / UNMATCHED.

TEST-WEBHOOK-005

Wrong amount.

Expected:

No automatic activation.

============================================================
PHASE O — ATOMIC PAYMENT
============================================================

Verify:

Payment SUCCESS
Invoice PAID
Subscription ACTIVE

must occur atomically.

Simulate database failure between steps.

Expected:

ROLLBACK.

Không được xảy ra:

Payment SUCCESS
Invoice PENDING
Subscription ACTIVE

============================================================
PHASE P — BILLING
============================================================

Test:

Pricing
Checkout
Invoice
Payment
Subscription
Upgrade
Renew
Cancel
Expire
Read Only

Verify pricing cannot be manipulated from frontend.

Test:

plan_id manipulation
amount manipulation
discount manipulation
subscription_id manipulation

Expected:

SERVER SIDE VALIDATION.

============================================================
PHASE Q — STORAGE
============================================================

Test:

Family Alpha upload.

Family Beta access Alpha file.

Expected:

DENIED.

Test:

Invalid file
Oversized file
Unauthorized download

Expected:

DENIED.

============================================================
PHASE R — NOTIFICATION
============================================================

Test:

Memorial reminder
Event reminder
Payment reminder
Trial expiry
Subscription expiry
Quota warning

Verify:

notification created
correct family
correct recipient
correct timestamp

============================================================
PHASE S — MOBILE
============================================================

Test viewport:

390px
393px
430px

Screens:

Dashboard
Genealogy
Members
Calendar
Finance
Billing
Checkout

Check:

Overflow
Table
Modal
Form
Tree
Buttons
Navigation

============================================================
PHASE T — VISUAL QA
============================================================

So sánh implementation với Google Stitch.

52 screens.

Check:

Typography
Spacing
Color
Layout
Components
Responsive
Empty
Loading
Error
Read Only
Quota
Billing

============================================================
PHASE U — PERFORMANCE
============================================================

Test:

86
300
500

members.

Measure:

Initial load
Tree rendering
Search
Calendar
Finance ledger
Dashboard

Không tải toàn bộ database nếu không cần thiết.

============================================================
PHASE V — SECURITY
============================================================

Search source code for:

service_role
API keys
secrets
password
hard-coded family_id
hard-coded prices
mock payment
fake subscription
fake webhook

Check frontend bundle.

============================================================
PHASE W — REGRESSION
============================================================

Run:

npm test
npm run build

Nếu có:

npm run lint

Nếu có:

E2E / Playwright.

============================================================
TEST RESULT
============================================================

Tạo:

/docs/ALPHA_TEST_EXECUTION_REPORT.md

Format:

TEST ID
DESCRIPTION
EXPECTED
ACTUAL
RESULT
EVIDENCE
SEVERITY

Result:

PASS
FAIL
BLOCKED
NOT_TESTED

============================================================
BUG CLASSIFICATION
============================================================

BLOCKER
CRITICAL
HIGH
MEDIUM
LOW

============================================================
ALPHA EXIT DECISION
============================================================

Không được tự tuyên bố PASS.

ALPHA PASS chỉ khi:

BLOCKER = 0
CRITICAL = 0

và tất cả các test quan trọng:

AUTH
RLS
TENANT
FINANCE
LEDGER
PAYMENT
WEBHOOK
SUBSCRIPTION
QUOTA
READ_ONLY

đều PASS.

Nếu FAIL:

Không chuyển Closed Beta.

Tạo:

/docs/ALPHA_REMEDIATION_PLAN.md

============================================================
FINAL REPORT
============================================================

Báo cáo:

TOTAL TESTS
PASSED
FAILED
BLOCKED
NOT TESTED

BLOCKER
CRITICAL
HIGH
MEDIUM
LOW

SECURITY
FINANCE
PAYMENT
BILLING
GENEALOGY
LUNAR
PERFORMANCE
MOBILE
VISUAL

FINAL:

ALPHA PASS
hoặc
ALPHA FAIL

============================================================
START EXECUTION NOW.
============================================================