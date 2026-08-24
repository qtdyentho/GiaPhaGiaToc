============================================================
PROJECT: GIA PHẢ GIA TỘC — HERITAGE LEDGER
TASK: BILLING PRODUCTION MODEL + ADMIN MANUAL PAYMENT CONFIRMATION
+ PRESERVE TEST DATA + FIX INITIAL ROUTING
============================================================

ROLE
------------------------------------------------------------
Bạn là Senior Full-Stack Engineer + SaaS Architect + Supabase
Database Engineer + Security Engineer.

Hãy tiếp tục trực tiếp trên codebase hiện tại.

ĐÂY LÀ MỘT CHANGE QUAN TRỌNG VỀ KIẾN TRÚC BILLING.

Không được tự ý viết lại hệ thống từ đầu.
Không được phá vỡ các tính năng Phase 1 → Phase 5 đang hoạt động.

Ưu tiên:

DATA INTEGRITY > SECURITY > BACKWARD COMPATIBILITY
> TESTABILITY > UX > FEATURE VELOCITY

============================================================
1. BỐI CẢNH HIỆN TẠI
============================================================

Hệ thống hiện đã hoàn thành:

PHASE 1:
- Genealogy
- Multi-tenant
- RLS
- Member management
- Genealogy tree

PHASE 2:
- Financial Core
- Multiple Funds
- Immutable Ledger
- Contributions
- Honor Roll
- VietQR

PHASE 3:
- Lunar Calendar
- Memorial
- Events
- Reminder

PHASE 4:
- Subscription
- Trial
- Usage / Quota
- Billing
- Invoice
- Payment
- Subscription Gate

PHASE 5:
- Production hardening
- Health check
- Structured logging
- Audit
- Backup / restore
- Closed Beta
- Support Center

HIỆN TẠI CẦN ĐIỀU CHỈNH BILLING PRODUCTION.

============================================================
2. QUYẾT ĐỊNH KIẾN TRÚC BILLING MỚI
============================================================

KHÔNG KẾT NỐI API NGÂN HÀNG.

KHÔNG SỬ DỤNG:
- Bank webhook
- Auto bank verification
- HMAC webhook từ ngân hàng
- Auto payment activation từ ngân hàng

KHÔNG được giả lập rằng hệ thống đang kết nối ngân hàng thật.

Thay vào đó sử dụng:

CUSTOMER
    ↓
Chọn gói
    ↓
Tạo Invoice
    ↓
Hiển thị thông tin chuyển khoản / VietQR
    ↓
Khách hàng tự chuyển khoản
    ↓
Khách hàng bấm "Tôi đã chuyển khoản"
    ↓
Invoice = WAITING_CONFIRMATION
    ↓
ADMIN WEBSITE
    ↓
Nhận danh sách yêu cầu thanh toán
    ↓
Admin kiểm tra sao kê ngân hàng thực tế bên ngoài hệ thống
    ↓
Admin xác nhận thủ công
    ↓
Atomic Database Transaction
    ↓
Payment = SUCCESS
Invoice = PAID
Subscription = ACTIVE
    ↓
Cấp quyền tài khoản

============================================================
3. NGUYÊN TẮC BẤT BIẾN
============================================================

TUYỆT ĐỐI KHÔNG:

1. Xóa dữ liệu test hiện tại.
2. Reset database.
3. Xóa Family Alpha.
4. Xóa Family Beta.
5. Xóa Family Gamma.
6. Xóa test members.
7. Xóa test funds.
8. Xóa test subscriptions.
9. Xóa test invoices.
10. Xóa test genealogy.
11. Thay đổi RLS đang bảo vệ multi-tenant nếu không cần thiết.
12. Đưa dữ liệu test sang production.
13. Tự động xác nhận thanh toán.
14. Cho user tự nâng quyền subscription.
15. Cho client gọi trực tiếp RPC xác nhận thanh toán.
16. Cho frontend gửi trạng thái PAID / SUCCESS / ACTIVE tùy ý.

Dữ liệu test hiện tại PHẢI ĐƯỢC GIỮ NGUYÊN.

Mục tiêu là:

"CODE CHANGE WITHOUT TEST DATA DESTRUCTION"

============================================================
4. SỬA LỖI INITIAL ROUTING
============================================================

HIỆN TRẠNG:

Khi mở website hiện tại, hệ thống đi thẳng vào:

Trang quản trị dòng họ
+
dữ liệu test

Điều này không phù hợp với cấu trúc SaaS.

Cần xây dựng routing đúng.

============================================================
5. ROUTING KIẾN TRÚC MỚI
============================================================

PUBLIC:

/
    Landing Page

/pricing
    Bảng giá

/login
    Đăng nhập

/register
    Đăng ký dòng họ

/invite/:code
    Đăng ký bằng mã mời

/help
    Hướng dẫn

============================================================

AUTHENTICATED FAMILY USER:

/app
    Dashboard dòng họ

/app/genealogy
    Cây gia phả

/app/members
    Thành viên

/app/calendar
    Lịch

/app/memorials
    Ngày giỗ

/app/events
    Sự kiện

/app/funds
    Sổ quỹ

/app/contributions
    Đóng góp

/app/honor-roll
    Bảng vàng công đức

/app/billing
    Tổng quan thuê bao

/app/billing/usage
    Hạn mức

/app/billing/invoices
    Hóa đơn

/app/support
    Hỗ trợ

============================================================

ADMIN WEBSITE:

/admin
    Admin Dashboard

/admin/families
    Quản lý gia tộc

/admin/subscriptions
    Quản lý thuê bao

/admin/invoices
    Quản lý hóa đơn

/admin/payments
    Xác nhận thanh toán

/admin/users
    Quản lý tài khoản

/admin/support
    Ticket hỗ trợ

/admin/audit
    Audit Log

/admin/system
    System Health

============================================================
6. KHÔNG ĐƯỢC AUTO REDIRECT VÀO TEST FAMILY
============================================================

Nếu user chưa đăng nhập:

/
hoặc
/login

Nếu user đăng nhập hợp lệ:

- Family User → /app
- Super Admin → /admin

Không được mặc định:

/app/family/ALPHA
hoặc
dashboard của Alpha.

Không được hard-code:

family_id = ALPHA

Không được hard-code:

user = truongtoc.alpha@...

Không được tự động login test account.

============================================================
7. TEST MODE — GIỮ DỮ LIỆU NHƯNG KHÔNG AUTO-OPEN
============================================================

Dữ liệu test Alpha/Beta/Gamma vẫn phải tồn tại.

Tạo cơ chế:

DEMO / TEST MODE

NHƯNG:

TEST MODE KHÔNG ĐƯỢC AUTO-ACTIVATE.

Có thể hỗ trợ:

/dev/test-login

hoặc

một khu vực Developer/Test riêng.

Chỉ bật trong môi trường:

development

hoặc

staging

Không cho phép test shortcut tồn tại trong production.

Ví dụ:

VITE_ENABLE_TEST_MODE=false

production:
    false

development:
    true

============================================================
8. BILLING FLOW MỚI
============================================================

CUSTOMER FLOW

STEP 1

User vào:

/pricing

Chọn:

- Gói
- Chu kỳ tháng/năm

STEP 2

Hệ thống tạo:

Invoice

Ví dụ:

GP-INV-20260824-000001

Invoice:

PENDING_PAYMENT

STEP 3

Hiển thị:

----------------------------------
THÔNG TIN THANH TOÁN
----------------------------------

Số tiền:
990.000 VNĐ

Ngân hàng:
[CONFIGURED BANK]

Số tài khoản:
[CONFIGURED ACCOUNT]

Chủ tài khoản:
[CONFIGURED ACCOUNT NAME]

Nội dung:
GP-INV-20260824-000001

[ QR VIETQR ]

----------------------------------

STEP 4

User bấm:

"TÔI ĐÃ CHUYỂN KHOẢN"

KHÔNG được chuyển:

PAID

KHÔNG được chuyển:

ACTIVE

Chỉ chuyển:

WAITING_CONFIRMATION

============================================================
9. PAYMENT STATE MACHINE
============================================================

Thiết kế state rõ ràng:

Invoice:

DRAFT
↓
PENDING_PAYMENT
↓
WAITING_CONFIRMATION
↓
PAID

Hoặc:

WAITING_CONFIRMATION
↓
REJECTED

Payment:

PENDING
↓
SUBMITTED
↓
SUCCESS

Hoặc:

SUBMITTED
↓
REJECTED

Subscription:

TRIALING
ACTIVE
PAST_DUE
READ_ONLY
CANCELLED

CHỈ ADMIN mới có quyền:

WAITING_CONFIRMATION
→ SUCCESS

SUCCESS
→ PAID

PAID
→ ACTIVE

============================================================
10. ADMIN PAYMENT CONFIRMATION
============================================================

Tạo:

/admin/payments

Dashboard:

------------------------------------------
YÊU CẦU XÁC NHẬN THANH TOÁN
------------------------------------------

Invoice
Family
Plan
Amount
Created At
Submitted At
Status
Action

Ví dụ:

GP-INV-001
Gia tộc Nguyễn
Gói Gia Tộc
990.000
24/08/2026
24/08/2026
WAITING_CONFIRMATION

[ XEM ]
[ XÁC NHẬN ]
[ TỪ CHỐI ]

============================================================
11. ADMIN PAYMENT DETAIL
============================================================

Khi Admin mở payment:

Hiển thị:

- Invoice ID
- Family
- Account
- Plan
- Amount
- Created date
- Submitted date
- Payment status
- Previous subscription
- Current subscription
- Expiry date

Admin có thể nhập:

- Transaction reference
- Bank transaction date
- Amount actually received
- Note
- Audit reason

Ví dụ:

Transaction reference:
FT260824123456

Received:
990000

Audit reason:
"Đã kiểm tra sao kê ngân hàng ngày 24/08/2026"

============================================================
12. ADMIN CONFIRMATION SECURITY
============================================================

TUYỆT ĐỐI không cho:

Family Admin
Member
Guest
Normal User

gọi API:

confirmPayment()

Chỉ:

SUPER_ADMIN

hoặc:

BILLING_ADMIN

được phép.

Kiểm tra quyền ở:

Frontend
+
API
+
Database/RLS

Không chỉ dựa vào frontend.

============================================================
13. ATOMIC CONFIRMATION RPC
============================================================

Tạo hoặc cập nhật RPC:

admin_confirm_payment()

Input:

invoice_id
transaction_reference
received_amount
bank_transaction_date
audit_reason

RPC phải thực hiện atomic:

BEGIN

1. Lock invoice

2. Kiểm tra invoice status

3. Kiểm tra amount

4. Kiểm tra invoice chưa PAID

5. Tạo payment SUCCESS

6. Update invoice PAID

7. Activate subscription

8. Update period

9. Write audit log

10. Commit

Nếu bất kỳ bước nào lỗi:

ROLLBACK TOÀN BỘ

============================================================
14. IDEMPOTENCY
============================================================

Admin không được xác nhận cùng một invoice hai lần.

Nếu:

invoice.status = PAID

thì:

REJECT

hoặc:

ALREADY_PROCESSED

Không tạo payment thứ hai.

Không cộng thêm thời hạn lần hai.

Không kích hoạt subscription lần hai.

============================================================
15. THANH TOÁN THIẾU
============================================================

Ví dụ:

Invoice:

990.000

Admin nhập:

500.000

Hệ thống:

KHÔNG ACTIVE

Payment:

PARTIAL

Invoice:

WAITING_CONFIRMATION

Hiển thị:

"Thanh toán chưa đủ"

Admin có thể:

- chờ thanh toán bổ sung
- từ chối
- ghi chú

============================================================
16. THANH TOÁN THỪA
============================================================

Nếu:

Invoice = 990.000

Received = 1.000.000

Không tự động Active một cách mù quáng.

Hiển thị:

OVERPAYMENT

Yêu cầu Admin xử lý.

Không tự động cộng 10.000 vào subscription.

============================================================
17. TỪ CHỐI THANH TOÁN
============================================================

Tạo:

admin_reject_payment()

Bắt buộc:

reject_reason

Ví dụ:

"Không tìm thấy giao dịch trong sao kê"

Status:

Payment = REJECTED

Invoice = REJECTED

Subscription không thay đổi.

Audit Log:

actor
action
invoice
reason
timestamp

============================================================
18. PAYMENT AUDIT LOG
============================================================

Mọi hành động:

- Submit payment
- Confirm payment
- Reject payment
- Manual adjustment
- Refund

đều phải ghi:

actor_id
actor_role
family_id
invoice_id
payment_id
action
old_status
new_status
amount
reason
timestamp
request_id
IP nếu phù hợp

Không được xóa Audit Log.

============================================================
19. XÓA WEBHOOK BANK
============================================================

KHÔNG xóa dữ liệu lịch sử nếu đang được test.

Nhưng:

Không sử dụng webhook bank trong production flow.

Nếu code hiện tại có:

BankWebhookService
webhook endpoint
HMAC verification

thì:

- Giữ lại nếu cần cho automated test
- Đánh dấu deprecated
- Không được gọi trong production billing flow
- Không được tạo illusion rằng hệ thống đang kết nối ngân hàng

Tạo feature flag:

BANK_WEBHOOK_ENABLED=false

Production:

false

Test:

có thể true nếu cần automated simulation.

============================================================
20. ADMIN CONFIGURATION
============================================================

Tạo trang:

/admin/billing/config

Cho phép Super Admin cấu hình:

Bank Name
Bank Code
Account Number
Account Name
QR template
Support phone
Support email
Default invoice validity

Không hard-code trong component.

Secrets không được đưa ra client.

============================================================
21. SUBSCRIPTION ACTIVATION
============================================================

Khi Admin xác nhận thanh toán:

Nếu subscription hiện tại:

TRIALING

thì chuyển:

ACTIVE

Nếu đang:

ACTIVE

thì gia hạn từ:

current_period_end

Không được reset period một cách sai.

Ví dụ:

Current expiry:
30/09/2026

Renew 12 months:

New expiry:
30/09/2027

Không phải:

24/08/2027

============================================================
22. READ_ONLY
============================================================

Khi hết hạn:

Subscription:

READ_ONLY

Dữ liệu:

KHÔNG XÓA

KHÔNG ARCHIVE phá dữ liệu

KHÔNG reset genealogy

KHÔNG reset financial ledger

User vẫn được:

Xem gia phả
Xem lịch
Xem ngày giỗ
Xem sổ quỹ
Xuất dữ liệu nếu policy cho phép

Nhưng không được:

thêm member
sửa dữ liệu
tạo giao dịch
tạo event mới

Có CTA:

"Gia hạn dịch vụ"

============================================================
23. ADMIN DASHBOARD
============================================================

Dashboard cần có:

--------------------------------------------
BILLING OPERATIONS
--------------------------------------------

Pending Confirmation
Partial Payments
Rejected Payments
Paid Today
Revenue Today
Revenue This Month
Active Subscriptions
Trialing
Expiring Soon
Read Only Families

--------------------------------------------

KPI:

MRR
ARR
ARPU
Conversion
Churn

Các số liệu phải lấy từ DB thực.

Không fake data.

============================================================
24. TEST DATA — CRITICAL
============================================================

GIỮ NGUYÊN:

Family Alpha
Family Beta
Family Gamma

Không chạy:

TRUNCATE
DELETE FROM families
DELETE FROM members
DELETE FROM subscriptions

Không reset Supabase database.

Nếu cần migration:

CHỈ:

CREATE
ALTER ADD COLUMN
CREATE INDEX
CREATE FUNCTION
CREATE POLICY

và migration phải backward-compatible.

============================================================
25. TEST SCENARIOS
============================================================

Tạo:

tests/billing_manual_confirmation.test.ts

Ít nhất:

BILL-MANUAL-001
User tạo invoice

BILL-MANUAL-002
User submit "Tôi đã chuyển khoản"

Expected:

WAITING_CONFIRMATION

BILL-MANUAL-003
User không thể set PAID

Expected:

DENIED

BILL-MANUAL-004
Normal Family Admin không thể confirm

Expected:

DENIED

BILL-MANUAL-005
Super Admin confirm đúng tiền

Expected:

SUCCESS

Invoice:
PAID

Subscription:
ACTIVE

BILL-MANUAL-006
Confirm lần 2

Expected:

ALREADY_PROCESSED

BILL-MANUAL-007
Thanh toán thiếu

Expected:

PARTIAL

No activation.

BILL-MANUAL-008
Thanh toán thừa

Expected:

OVERPAYMENT

BILL-MANUAL-009
Admin reject

Expected:

REJECTED

BILL-MANUAL-010
Atomic failure

Expected:

ROLLBACK

BILL-MANUAL-011
Subscription renewal

Expected:
extend from current_period_end

BILL-MANUAL-012
Expired subscription

Expected:
READ_ONLY

BILL-MANUAL-013
Read-only data remains intact

BILL-MANUAL-014
Cross-tenant invoice access

Expected:
0 rows

BILL-MANUAL-015
Unauthorized RPC

Expected:
DENIED

============================================================
26. INITIAL ROUTING TESTS
============================================================

ROUTE-001

Anonymous user:

/

Expected:
Landing Page

ROUTE-002

Anonymous user:

/app

Expected:
redirect /login

ROUTE-003

Family user:

/admin

Expected:
403 / unauthorized

ROUTE-004

Super Admin:

/admin

Expected:
Admin Dashboard

ROUTE-005

Family user:

/app

Expected:
Family Dashboard

ROUTE-006

No test account auto-login.

============================================================
27. TEST MODE
============================================================

Tạo:

Test Login Panel

CHỈ development/staging.

Ví dụ:

Alpha Test
Beta Test
Gamma Test

Khi click:

"Login as Alpha"

thì mới login Alpha.

Không tự động.

Production:

Panel này phải biến mất hoàn toàn.

============================================================
28. SECURITY REQUIREMENTS
============================================================

Scan toàn bộ code:

Tìm:

hard-coded password
service_role key
secret
JWT
bank credentials
API keys
test credentials

Không được xuất hiện trong:

src/
frontend bundle
public/

Supabase service role:

CHỈ server-side.

Không expose:

SUPABASE_SERVICE_ROLE_KEY

VITE_* không được chứa secret.

============================================================
29. DOCUMENTATION
============================================================

Tạo/cập nhật:

docs/MANUAL_PAYMENT_OPERATIONS.md

Nội dung:

1. Customer payment flow
2. Invoice lifecycle
3. Admin confirmation
4. Partial payment
5. Overpayment
6. Reject payment
7. Refund
8. Audit
9. Subscription activation
10. READ_ONLY
11. Troubleshooting

Tạo:

docs/ROUTING_ARCHITECTURE.md

Tạo:

docs/TEST_DATA_POLICY.md

Tài liệu này phải nói rõ:

"Test data must never be automatically deleted during development."

============================================================
30. DATABASE MIGRATION
============================================================

Tạo migration mới:

supabase/migrations/YYYYMMDD_manual_payment_confirmation.sql

Không sửa phá migration cũ.

Migration phải có:

- payment status cần thiết
- invoice status cần thiết
- confirmation fields
- admin audit
- RPC
- RLS
- indexes

Tất cả phải backward compatible.

============================================================
31. UI/UX
============================================================

Customer UI phải cực kỳ rõ:

"Thanh toán của bạn chưa được hệ thống xác nhận tự động."

"Vui lòng chuyển khoản đúng số tiền và nội dung."

"Sau khi chuyển khoản, bấm Tôi đã chuyển khoản."

"Yêu cầu sẽ được bộ phận quản trị kiểm tra và xác nhận."

Không dùng wording:

"Ngân hàng đã xác nhận"

khi chưa có Admin xác nhận.

============================================================
32. PAYMENT STATUS BADGES
============================================================

PENDING_PAYMENT:
🟡 Chờ thanh toán

WAITING_CONFIRMATION:
🟠 Chờ Admin xác nhận

PAID:
🟢 Đã thanh toán

PARTIAL:
🟠 Thanh toán chưa đủ

OVERPAYMENT:
🟣 Thanh toán thừa

REJECTED:
🔴 Từ chối

============================================================
33. ADMIN CONFIRMATION UX
============================================================

Nút:

[XÁC NHẬN ĐÃ NHẬN TIỀN]

phải mở confirmation dialog:

------------------------------------
XÁC NHẬN THANH TOÁN
------------------------------------

Invoice:
GP-INV-...

Số tiền hóa đơn:
990.000

Số tiền thực nhận:
990.000

Mã giao dịch:
FT...

Ngày giao dịch:
24/08/2026

Lý do xác nhận:
[.........................]

[ HỦY ]

[ XÁC NHẬN THANH TOÁN ]

Phải có warning:

"Thao tác này sẽ kích hoạt/gia hạn thuê bao."

============================================================
34. KHÔNG TỰ ĐỘNG XÁC NHẬN
============================================================

ĐÂY LÀ REQUIREMENT QUAN TRỌNG NHẤT.

Không được có:

setTimeout(() => PAID)

Không được có:

autoActivateSubscription()

sau khi user click:

"Tôi đã chuyển khoản"

Không được tin:

client_payment_status

Client chỉ có quyền:

SUBMIT PAYMENT CLAIM

Admin mới có quyền:

CONFIRM PAYMENT

============================================================
35. VERIFICATION
============================================================

Sau khi hoàn thành:

npm test

npm run build

npm run typecheck

npm run lint

Nếu có security scanner:

npm run security

Tất cả phải PASS.

Đặc biệt kiểm tra:

- RLS
- IDOR
- unauthorized RPC
- privilege escalation
- test data integrity
- routing
- client secret leakage

============================================================
36. DATA INTEGRITY CHECK
============================================================

TRƯỚC KHI MIGRATION:

ghi snapshot/hash thống kê:

families
members
relationships
funds
transactions
subscriptions
invoices
payments
memorials
events

SAU KHI MIGRATION:

đối chiếu.

Expected:

Không mất dữ liệu.

Không giảm số lượng bản ghi.

============================================================
37. GIT SAFETY
============================================================

Không commit:

.env
.env.local
secrets
service-role keys
bank credentials

Sau khi hoàn thành:

git status
git diff
git log -1

Tạo commit:

"fix: manual admin payment confirmation and safe SaaS routing"

Push main chỉ sau khi:

build PASS
tests PASS
migration PASS
security PASS

============================================================
38. FINAL ACCEPTANCE GATE
============================================================

Chỉ được báo:

IMPLEMENTATION COMPLETE

nếu tất cả:

[ ] Test data preserved
[ ] No auto-login
[ ] Correct public routing
[ ] Correct family routing
[ ] Correct admin routing
[ ] Manual payment confirmation
[ ] No bank webhook dependency
[ ] Client cannot confirm payment
[ ] Admin confirmation secured
[ ] Atomic confirmation
[ ] Idempotency
[ ] Partial payment handled
[ ] Overpayment handled
[ ] Reject handled
[ ] READ_ONLY preserved
[ ] RLS PASS
[ ] Audit PASS
[ ] Build PASS
[ ] Typecheck PASS
[ ] Lint PASS
[ ] Tests PASS
[ ] Security scan PASS

============================================================
39. FINAL REPORT
============================================================

Sau khi hoàn thành, xuất:

============================================================
MANUAL BILLING + ROUTING IMPLEMENTATION REPORT
============================================================

STATUS:
PASS / FAIL

BUILD:
...

TESTS:
... / ...

ROUTING:
PASS / FAIL

MANUAL PAYMENT:
PASS / FAIL

ADMIN CONFIRMATION:
PASS / FAIL

ATOMIC RPC:
PASS / FAIL

IDEMPOTENCY:
PASS / FAIL

RLS:
PASS / FAIL

AUDIT:
PASS / FAIL

TEST DATA PRESERVED:
YES / NO

BANK WEBHOOK DEPENDENCY:
DISABLED

AUTO PAYMENT ACTIVATION:
DISABLED

SECURITY:
PASS / FAIL

GIT COMMIT:
...

DEPLOYMENT:
...

============================================================

IMPORTANT:

Không được chỉ mô phỏng kết quả.

Phải thực sự kiểm tra codebase, migration, test và build.

Nếu phát hiện vấn đề kiến trúc hoặc migration có nguy cơ làm mất dữ liệu:

DỪNG THAY ĐỔI DATABASE

Báo cáo vấn đề trước.

Không tự ý phá dữ liệu để làm test PASS.
============================================================