============================================================
PHASE 4 — COMMERCIAL SaaS
SUBSCRIPTION + TRIAL + USAGE + QUOTA + BILLING + VIETQR
============================================================

PROJECT:
GIA PHẢ GIA TỘC — Heritage Ledger

CURRENT STATUS:

PHASE 1 — GENEALOGY CORE
PASS

PHASE 2 — FINANCIAL CORE + VIETQR + LEDGER
PASS

PHASE 3 — LUNAR CALENDAR + MEMORIAL + EVENTS
PASS

CURRENT TEST STATUS:
83/83 PASS

BUILD:
PASS

RLS:
PASS

MULTI-TENANT:
PASS

NEXT:
PHASE 4 — COMMERCIAL SaaS

============================================================
0. IMPORTANT PRE-CHECK
============================================================

Trước khi bắt đầu:

1. Đọc:

MASTER_SPEC.md
MASTER_PROMPT.md
IMPLEMENTATION_PLAN.md
DATABASE_SCHEMA.sql
BUSINESS_RULES.md

design/SCREEN_MAP.md
design/DESIGN_IMPLEMENTATION_MAP.md

docs/PHASE_1*
docs/PHASE_2*
docs/PHASE_3*
docs/FINANCIAL_CORE.md
docs/VIETQR_PAYMENT_FLOW.md
docs/LUNAR_CALENDAR_ENGINE.md

2. Kiểm tra toàn bộ schema hiện tại.

3. Kiểm tra subscription/billing implementation hiện có.

4. Kiểm tra các bảng:

plans
plan_features
subscriptions
invoices
payments
usage_metrics
refunds nếu có
subscription_events nếu có

5. Không tạo bảng trùng.

6. Không phá vỡ Phase 1–3.

============================================================
0.1 TEST INVENTORY SANITY CHECK
============================================================

Phase 3 report ghi:

83/83 tests PASS

nhưng phân bổ:

16 Alpha
20 Finance
26 Lunar
21 Phase 3

Tổng = 83.

Trong khi mô tả Phase 3 ghi:

21/20 tests.

Hãy xác định:

- 20 là planned tests?
- 21 là executed tests?
- Test thứ 21 là gì?
- Có được ghi nhận trong TEST PLAN không?

Cập nhật:

docs/TEST_INVENTORY.md

Không bỏ qua vấn đề này.

============================================================
1. MỤC TIÊU PHASE 4
============================================================

Xây dựng hoàn chỉnh hệ thống:

SUBSCRIPTION
TRIAL
PLANS
PLAN FEATURES
USAGE
QUOTA
CHECKOUT
PAYMENT
INVOICE
RENEWAL
UPGRADE
DOWNGRADE
CANCEL
REFUND
READ-ONLY
ADMIN BILLING
REVENUE ANALYTICS
COMMERCIAL OPERATIONS

Mục tiêu cuối cùng:

User
→ Register
→ Create Family
→ Trial
→ Use
→ Choose Plan
→ Checkout
→ VietQR Payment
→ Bank Webhook
→ Verify
→ Atomic Activation
→ Subscription ACTIVE
→ Renewal
→ Upgrade/Downgrade
→ Expiry
→ READ_ONLY
→ Reactivate

============================================================
2. PHÂN BIỆT PLAN VS SUBSCRIPTION
============================================================

PLAN:

Là sản phẩm thương mại.

SUBSCRIPTION:

Là quan hệ thuê bao của một FAMILY
đối với một PLAN.

Không gắn subscription trực tiếp với user.

Ví dụ:

User A
├── Family Nguyễn
│    └── Subscription GIA_TOC
│
└── Family Trần
     └── Subscription FREE

============================================================
3. PLAN MANAGEMENT
============================================================

Tạo:

/pricing

và Admin:

/admin/plans

Các plan:

FREE
FAMILY
GIA_TOC
DONG_HO
PREMIUM

Không hard-code giá trong frontend.

Dữ liệu:

plan_id
code
name
description
monthly_price
yearly_price
currency
trial_days
is_public
is_active
sort_order

============================================================
4. PLAN FEATURES
============================================================

Tạo feature entitlement.

Ví dụ:

MAX_MEMBERS
MAX_BRANCHES
MAX_EVENTS
MAX_STORAGE
MAX_ADMINS
MAX_EXPORTS_PER_MONTH
MAX_REPORTS_PER_MONTH

Feature:

GENEALOGY
CALENDAR
MEMORIAL
EVENT
FINANCE
REPORT
EXPORT
AUDIT
ADVANCED_BILLING

Phải hỗ trợ:

BOOLEAN
INTEGER
STORAGE
UNLIMITED

Không dùng:

999999999

để giả lập unlimited.

============================================================
5. PLAN VERSIONING
============================================================

Không được sửa giá cũ một cách phá vỡ lịch sử.

Nếu thay đổi giá/features quan trọng:

PLAN VERSION mới.

Subscription cũ giữ version cũ
nếu grandfathering được áp dụng.

Ví dụ:

GIA_TOC_V1
GIA_TOC_V2

============================================================
6. TRIAL
============================================================

Mặc định:

30 ngày.

Khi tạo family:

subscription = TRIALING

Lưu:

trial_start_at
trial_end_at
plan_id

Không reset trial bằng việc:

xóa family
tạo family mới

nếu Business Rules cấm.

============================================================
7. TRIAL LIFECYCLE
============================================================

TRIALING
↓
ACTIVE

hoặc:

TRIALING
↓
EXPIRED
↓
READ_ONLY

Reminder:

30
15
7
3
1

ngày trước khi hết hạn.

============================================================
8. SUBSCRIPTION LIFECYCLE
============================================================

Hỗ trợ:

TRIALING
ACTIVE
PAST_DUE
CANCELLED
EXPIRED
SUSPENDED
READ_ONLY

Các thao tác:

Create
Activate
Renew
Upgrade
Downgrade
Cancel
Resume
Expire
Suspend

Mọi thay đổi:

Audit Log.

============================================================
9. BILLING DASHBOARD — USER
============================================================

Route:

/app/billing

Hiển thị:

Gói hiện tại
Trạng thái
Ngày bắt đầu
Ngày gia hạn
Ngày hết hạn
Chu kỳ
Số tiền
Thanh toán gần nhất

Usage:

86/300 thành viên
1.2GB/5GB

CTA:

[Nâng cấp]

[Đổi gói]

[Quản lý thanh toán]

============================================================
10. PRICING
============================================================

Route:

/pricing

Hiển thị:

Gói
Giá tháng
Giá năm
Tiết kiệm
Số thành viên
Storage
Calendar
Finance
Reports
Support

Toggle:

THÁNG
NĂM

Không expose internal cost data.

============================================================
11. CHECKOUT
============================================================

Route:

/app/billing/checkout

Flow:

Select Plan
↓
Review
↓
Payment

Không tin:

price
discount
tax
plan limits

từ Client.

Server phải tính lại.

============================================================
12. PAYMENT INTENT
============================================================

Tạo:

payment_intent

Thông tin:

id
family_id
subscription_id
invoice_id
amount
currency
reference_code
status
expires_at

Reference code:

GP-INV-xxxxxxxx

Không cho client tự chọn:

amount
invoice
subscription activation.

============================================================
13. VIETQR
============================================================

Flow:

Create Payment Intent
↓
Generate VietQR
↓
User transfers
↓
Bank
↓
Provider
↓
Webhook
↓
Signature Verification
↓
Invoice Verification
↓
Amount Verification
↓
Idempotency
↓
Atomic RPC
↓
Payment SUCCESS
↓
Invoice PAID
↓
Subscription ACTIVE

============================================================
14. CLIENT BYPASS
============================================================

Button:

"Tôi đã thanh toán"

KHÔNG được:

activate subscription.

Chỉ chuyển UI:

WAITING_BANK

hoặc:

PAYMENT_PENDING

============================================================
15. WEBHOOK SECURITY
============================================================

Webhook phải:

1. Verify signature.
2. Validate provider.
3. Validate event.
4. Validate invoice/reference.
5. Validate amount.
6. Validate family/subscription.
7. Check idempotency.
8. Execute atomic RPC.

Invalid signature:

HTTP 401

Invalid amount:

REJECT

Unknown invoice:

UNMATCHED

Duplicate:

ALREADY_PROCESSED

============================================================
16. ATOMIC ACTIVATION
============================================================

Một transaction database:

BEGIN

payment = SUCCESS

invoice = PAID

subscription = ACTIVE

subscription period = updated

audit = created

COMMIT

Nếu lỗi:

ROLLBACK tất cả.

Không chấp nhận:

Payment SUCCESS
Invoice PENDING
Subscription ACTIVE

============================================================
17. PARTIAL PAYMENT
============================================================

Ví dụ:

Invoice:

990.000

Received:

500.000

Status:

PARTIAL

Không activate subscription.

Cho phép ghi nhận:

remaining_amount

Không mất payment history.

============================================================
18. OVERPAYMENT
============================================================

Ví dụ:

Invoice:

990.000

Received:

1.000.000

Không tự ý cộng 10.000 vào subscription.

Đưa vào:

OVERPAYMENT_REVIEW

Cho admin xử lý.

============================================================
19. DUPLICATE PAYMENT
============================================================

Unique:

provider_transaction_id

Webhook duplicate:

ALREADY_PROCESSED

Không được:

double credit

double activation

double extend period.

============================================================
20. INVOICE
============================================================

Tạo:

/app/billing/invoices

Invoice:

invoice_number
family
subscription
plan
period
items
subtotal
discount
tax
total
status
issued_at
due_at
paid_at

Status:

DRAFT
OPEN
PAID
VOID
REFUNDED
PARTIAL

Invoice finalized:

KHÔNG UPDATE tùy tiện.

============================================================
21. UPGRADE
============================================================

Ví dụ:

FAMILY
→
GIA_TOC

Phải xác định:

effective_immediately
hoặc
next_period

Không tự ý tính proration.

Nếu chưa triển khai proration:

sử dụng next_period.

============================================================
22. DOWNGRADE
============================================================

Mặc định:

effective_at_period_end = true

Ví dụ:

GIA_TOC
→
FAMILY

giữ GIA_TOC đến cuối kỳ.

============================================================
23. CANCEL
============================================================

Cho phép:

Cancel now
Cancel at period end

Mặc định:

Cancel at period end.

Không xóa dữ liệu.

============================================================
24. RENEWAL
============================================================

Khi đến billing period end:

Auto renew nếu:

auto_renew = true

Nếu payment thất bại:

PAST_DUE

Chạy dunning:

7
3
1

ngày.

Nếu không thanh toán:

SUSPENDED / EXPIRED

theo Business Rules.

============================================================
25. READ-ONLY
============================================================

Khi hết subscription:

READ_ONLY.

Được:

Xem gia phả
Xem thành viên
Xem lịch
Xem ngày giỗ
Xem sự kiện lịch sử
Xem tài chính

Không được:

Tạo thành viên
Chỉnh sửa gia phả
Tạo sự kiện
Tạo assessment
Ghi payment
Tạo expense
Upload mới

Dữ liệu không bao giờ tự động xóa.

============================================================
26. USAGE SERVICE
============================================================

Tạo:

UsageService

Functions:

getUsage()
getLimit()
canUseFeature()
checkQuota()
getUsagePercentage()

Theo dõi:

members
branches
events
storage
documents
exports
reports

============================================================
27. QUOTA ENFORCEMENT
============================================================

Ví dụ:

MAX_MEMBERS = 300

299 → allowed
300 → current limit
301 → DENIED

Phải enforce:

UI
Service
RPC/DB

Frontend FeatureGate không phải Security Boundary.

============================================================
28. USAGE DASHBOARD
============================================================

Route:

/app/billing/usage

Cards:

Thành viên
Chi/Nhánh
Sự kiện
Storage
Exports
Reports

Mức:

NORMAL
WARNING
NEAR_LIMIT
LIMIT_REACHED

80%:
WARNING

90%:
NEAR_LIMIT

100%:
BLOCK

============================================================
29. FEATURE GATE
============================================================

Tạo:

SubscriptionGate
FeatureGate
QuotaGate

Nếu feature không có:

LOCKED

Thông báo:

"Tính năng này có trong gói GIA_TOC trở lên."

CTA:

[Xem gói]

============================================================
30. REFUND
============================================================

Hỗ trợ:

FULL
PARTIAL

Không delete payment.

Refund phải:

reference_payment_id
amount
reason
created_by
created_at
status

============================================================
31. ADMIN BILLING
============================================================

Routes:

/admin/billing
/admin/plans
/admin/subscriptions
/admin/payments
/admin/invoices
/admin/trials
/admin/usage
/admin/refunds
/admin/billing-audit

Roles:

SUPER_ADMIN
BILLING_ADMIN
SUPPORT_ADMIN
FINANCE_ADMIN
VIEWER

============================================================
32. ADMIN BILLING DASHBOARD
============================================================

Hiển thị:

MRR
ARR
Active subscriptions
Trials
Past due
Expired
Trial conversion
Churn
ARPU

Revenue charts:

Monthly
By Plan
By Family
By Payment Provider

============================================================
33. SUBSCRIPTION MANAGEMENT
============================================================

Admin có thể:

View
Search
Filter
Suspend
Resume
Cancel
Extend
Change plan
Manual activate nếu authorized

Manual override:

BẮT BUỘC reason.

Audit:

admin
timestamp
before
after
reason

============================================================
34. MANUAL PAYMENT REVIEW
============================================================

Nếu có payment:

PENDING_REVIEW

Admin:

View proof
Check reference
Check amount
Approve
Reject

Reject:

Bắt buộc lý do.

============================================================
35. USAGE & CUSTOMER HEALTH
============================================================

Admin xem:

Family
Plan
Usage
Last Active
Last Payment
Trial remaining
Feature usage

Mục đích:

phát hiện:

inactive family
quota pressure
payment failure
churn risk

============================================================
36. COMMERCIAL ANALYTICS
============================================================

Tạo:

Revenue
MRR
ARR
ARPU
Trial Conversion
Retention
Churn

Không tính payment FAILED vào Revenue.

Refund phải được trừ đúng.

============================================================
37. DATA RETENTION
============================================================

Không xóa:

Family
Genealogy
Memorial
Events
Financial records
Invoices
Payments
Subscriptions
Audit logs

Subscription hết hạn:

READ_ONLY.

============================================================
38. RLS
============================================================

Kiểm tra:

plans

public read nếu cần

subscriptions:

family isolation

invoices:

family isolation

payments:

family isolation

usage:

family isolation

Admin billing:

SUPER_ADMIN/BILLING_ADMIN.

Không để OWNER family xem:

admin global revenue
other families
other subscriptions.

============================================================
39. SECURITY
============================================================

Không hard-code:

price

plan limits

payment status

subscription status

invoice total

Frontend không được tự:

upgrade
activate
renew

Server-side must verify.

Không expose:

service role key

provider secrets

webhook secrets.

============================================================
40. TEST PLAN
============================================================

Subscription:

SUB-001
Create trial

SUB-002
Trial expiry

SUB-003
Trial conversion

SUB-004
Upgrade

SUB-005
Downgrade

SUB-006
Cancel

SUB-007
Resume

SUB-008
Read-only

Quota:

QUOTA-001
299/300

QUOTA-002
300/300

QUOTA-003
301 denied

Payment:

PAY-001
Valid payment

PAY-002
Invalid signature

PAY-003
Wrong amount

PAY-004
Partial

PAY-005
Overpayment

PAY-006
Duplicate webhook

PAY-007
Invalid invoice

PAY-008
Refund

Atomic:

ATOMIC-001
Payment + Invoice + Subscription

ATOMIC-002
Rollback

RLS:

RLS-BILL-001
Cross-family subscription

RLS-BILL-002
Cross-family invoice

RLS-BILL-003
Cross-family payment

Admin:

ADMIN-BILL-001
Role access

ADMIN-BILL-002
Manual override audit

============================================================
41. UI IMPLEMENTATION
============================================================

Giữ nguyên:

Heritage Ledger

Be Vietnam Pro

#166534
#1E3A5F
#C49A3A
#F7F8F5

Các màn hình:

Pricing
Billing Dashboard
Checkout
Payment
Invoice
Usage
Trial
Admin Billing

phải bám Stitch 100%.

Không redesign.

============================================================
42. TESTING REGRESSION
============================================================

Sau Phase 4:

npm run build
npm test

Tất cả test:

Phase 1
Phase 2
Phase 3

PHẢI PASS.

Expected:

ALL PASS

Không chấp nhận regression.

============================================================
43. PRODUCTION PAYMENT TEST
============================================================

Không dùng tiền thật trong automated test.

Tạo:

PAYMENT_SANDBOX

và:

PAYMENT_PRODUCTION

Production chỉ enable khi:

webhook verification PASS
signature PASS
idempotency PASS
atomic RPC PASS
reconciliation PASS

============================================================
44. COMMERCIAL OPERATIONS
============================================================

Tạo:

docs/COMMERCIAL_BILLING.md
docs/SUBSCRIPTION_ENGINE.md
docs/TRIAL_ENGINE.md
docs/USAGE_QUOTA.md
docs/PAYMENT_PRODUCTION.md
docs/ADMIN_BILLING.md
docs/PHASE_4_COMPLETION_REPORT.md

============================================================
45. OBSERVABILITY
============================================================

Theo dõi:

failed payment
failed webhook
subscription expiry
quota exceeded
RPC error
duplicate webhook
refund
billing mismatch

Không log sensitive payment data.

============================================================
46. DEFINITION OF DONE
============================================================

[ ] Pricing
[ ] Plans
[ ] Plan Features
[ ] Subscription
[ ] Trial
[ ] Checkout
[ ] Payment Intent
[ ] VietQR
[ ] Webhook
[ ] Signature verification
[ ] Idempotency
[ ] Atomic Activation
[ ] Partial payment
[ ] Overpayment
[ ] Duplicate payment
[ ] Invoice
[ ] Upgrade
[ ] Downgrade
[ ] Cancel
[ ] Renew
[ ] Read-only
[ ] Usage
[ ] Quota
[ ] Feature Gate
[ ] Refund
[ ] Admin Billing
[ ] Revenue Analytics
[ ] RLS
[ ] RBAC
[ ] Audit
[ ] Mobile
[ ] Tests
[ ] Documentation

============================================================
47. IMPLEMENTATION ORDER
============================================================

PHASE 4.1
Subscription Schema Audit

PHASE 4.2
Plans + Features

PHASE 4.3
Trial Engine

PHASE 4.4
Subscription Lifecycle

PHASE 4.5
Usage + Quota

PHASE 4.6
Pricing + Billing UI

PHASE 4.7
Invoice

PHASE 4.8
Payment Intent

PHASE 4.9
VietQR

PHASE 4.10
Webhook Verification

PHASE 4.11
Atomic Activation

PHASE 4.12
Renewal

PHASE 4.13
Upgrade / Downgrade

PHASE 4.14
Refund

PHASE 4.15
Admin Billing

PHASE 4.16
Revenue Analytics

PHASE 4.17
Security + RLS

PHASE 4.18
E2E

PHASE 4.19
Production Validation

============================================================
48. FINAL REPORT
============================================================

Tạo:

docs/PHASE_4_COMPLETION_REPORT.md

Bao gồm:

Implementation
Database
RLS
Payment
Webhook
Atomicity
Subscription
Trial
Quota
Admin
Tests
Security
Build
Deployment

Cuối báo cáo:

PHASE 4 STATUS:
PASS / PARTIAL / FAIL

COMMERCIAL READY:
YES / NO

KNOWN RISKS:
...

NEXT PHASE:
...

============================================================
START PHASE 4.
============================================================  