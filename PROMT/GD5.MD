# ============================================================
# PROJECT: GIA PHẢ GIA TỘC — HERITAGE LEDGER
# PHASE 5: PRODUCTION OPERATIONS, OBSERVABILITY
#          & CLOSED BETA LAUNCH
# ============================================================

Bạn là Principal Software Architect + SRE + Security Engineer
+ QA Lead + Product Operations Lead.

Nhiệm vụ của bạn là tiếp tục phát triển trực tiếp trên CODEBASE
hiện tại của dự án "Gia Phả Gia Tộc — Heritage Ledger".

KHÔNG được xây dựng lại dự án từ đầu.

KHÔNG được phá vỡ các tính năng đã hoàn thành ở Phase 1 → Phase 4.

Mục tiêu của Phase 5:

    DEVELOPMENT
          ↓
    PRODUCTION HARDENING
          ↓
    OBSERVABILITY
          ↓
    INCIDENT RESPONSE
          ↓
    BACKUP / RECOVERY
          ↓
    SECURITY VERIFICATION
          ↓
    CLOSED BETA
          ↓
    5–10 GIA TỘC THẬT

Phase 5 KHÔNG phải là phase bổ sung nhiều feature nghiệp vụ mới.

Phase 5 là phase biến hệ thống thành một sản phẩm SaaS
CÓ THỂ VẬN HÀNH THỰC TẾ.
1. BỐI CẢNH HỆ THỐNG HIỆN TẠI
PHASE 1
Genealogy
├── Members
├── Relationships
├── Genealogy Tree
├── Import Wizard
├── Multi-tenant RLS
└── Export / Backup

PHASE 2
Financial Core
├── Funds
├── Income
├── Expense
├── Approval
├── Immutable Ledger
├── Reversal
├── Contribution
├── Honor Roll
└── VietQR

PHASE 3
Calendar
├── Vietnamese Lunar Calendar
├── Solar ↔ Lunar
├── Can Chi
├── Solar Terms
├── Memorials
├── Events
├── Reminder
└── Financial Event Integration

PHASE 4
Commercial SaaS
├── Trial
├── Subscription
├── Plans
├── Usage
├── Quota
├── Invoice
├── Payment
├── VietQR
├── Webhook
├── Renewal
├── Read Only Grace
└── Admin Billing

PHASE 5
Production Operations
├── Observability
├── Audit
├── Monitoring
├── Alerting
├── Backup
├── Disaster Recovery
├── Security
├── Incident Response
├── Release Management
├── Support Operations
└── Closed Beta
2. NGUYÊN TẮC BẮT BUỘC
RULE-001
Không phá vỡ database schema hiện tại.

RULE-002
Không phá vỡ RLS.

RULE-003
Không bypass RPC bảo mật hiện tại.

RULE-004
Không cho Client tự xác nhận Payment.

RULE-005
Không cho Client thay đổi Subscription.

RULE-006
Không sửa trực tiếp POSTED financial ledger.

RULE-007
Không hard-delete dữ liệu nghiệp vụ quan trọng.

RULE-008
Không đưa secret vào frontend.

RULE-009
Không dùng dữ liệu Closed Beta vào Production trước khi
có approval.

RULE-010
Không deploy thẳng Production từ local.

RULE-011
Mọi migration phải backward compatible nếu có thể.

RULE-012
Mọi thay đổi schema phải có migration riêng.

RULE-013
Mọi thay đổi quan trọng phải có test.

RULE-014
Mọi incident phải có audit trail.

RULE-015
Mọi thao tác Super Admin nhạy cảm phải có Audit Reason.

RULE-016
Không được coi "npm test PASS" là bằng chứng duy nhất
cho Production Readiness.

RULE-017
Không tuyên bố Production Ready nếu chưa kiểm chứng
runtime thực tế.

RULE-018
Không sử dụng dữ liệu gia tộc thật để debug tùy tiện.

RULE-019
Dữ liệu gia phả phải được coi là dữ liệu lâu dài,
khó khôi phục và có giá trị văn hóa cao.

RULE-020
Ưu tiên Data Integrity > Feature Velocity.
3. BƯỚC 0 — CODEBASE DISCOVERY

Trước khi sửa bất kỳ file nào:

1. Scan toàn bộ repository.

2. Đọc:
   - package.json
   - vite.config.*
   - tsconfig.*
   - src/
   - supabase/
   - tests/
   - docs/

3. Đọc toàn bộ tài liệu Phase 1 → Phase 4.

4. Kiểm tra Git status.

5. Kiểm tra branch hiện tại.

6. Kiểm tra commit hiện tại.

7. Kiểm tra migration history.

8. Kiểm tra Supabase configuration.

9. Kiểm tra Vercel configuration.

10. Kiểm tra environment variables.

11. Kiểm tra toàn bộ API/RPC liên quan:
    - auth
    - RLS
    - payment
    - webhook
    - subscription
    - ledger
    - import
    - memorial
    - event

12. Tạo:
    docs/PHASE_5_ARCHITECTURE_AUDIT.md

Không được tự giả định kiến trúc.

Nếu phát hiện implementation khác với documentation:

CODE = SOURCE OF TRUTH

và phải ghi discrepancy vào:

docs/PHASE_5_ARCHITECTURE_AUDIT.md
4. PHASE 5 MODULE MAP

Triển khai Phase 5 thành 10 module:

P5-01 Production Environment
P5-02 Observability
P5-03 Audit & Security Monitoring
P5-04 Health Monitoring
P5-05 Backup & Disaster Recovery
P5-06 Incident Response
P5-07 Release & Deployment Control
P5-08 Closed Beta Operations
P5-09 Support & Feedback
P5-10 Production Readiness Gate
5. P5-01 — PRODUCTION ENVIRONMENT HARDENING

Kiểm tra và chuẩn hóa 3 môi trường:

LOCAL
   ↓
STAGING / BETA
   ↓
PRODUCTION

Tuyệt đối không dùng chung:

DATABASE
SUPABASE PROJECT
SERVICE ROLE KEY
WEBHOOK SECRET
AUTH SECRET
STORAGE
PAYMENT CONFIG
Kiểm tra Environment Variables

Tạo:

docs/ENVIRONMENT_MATRIX.md

Phân loại:

PUBLIC
SERVER ONLY
SECRET
SENSITIVE CONFIG

Không được expose:

SUPABASE_SERVICE_ROLE_KEY
PAYMENT_WEBHOOK_SECRET
HMAC_SECRET
ADMIN_SECRET
DATABASE_PASSWORD
PRIVATE_API_KEY

Frontend chỉ được sử dụng public-safe variables.

6. P5-02 — OBSERVABILITY

Xây dựng hệ thống observability tối thiểu gồm:

LOGGING
METRICS
ERROR TRACKING
AUDIT EVENTS
HEALTH CHECK
PERFORMANCE
6.1 Structured Logging

Tất cả server-side event quan trọng phải có:

{
  "timestamp": "...",
  "level": "INFO",
  "service": "...",
  "event": "...",
  "request_id": "...",
  "user_id": "...",
  "family_id": "...",
  "action": "...",
  "result": "...",
  "duration_ms": 0
}

Không log:

password
access_token
refresh_token
service_role_key
HMAC secret
full payment credentials
sensitive personal information
7. REQUEST ID / CORRELATION ID

Mỗi request quan trọng phải có:

request_id

Payment flow phải truy được:

Checkout
 ↓
Invoice
 ↓
Payment
 ↓
Webhook
 ↓
RPC
 ↓
Subscription

bằng một correlation chain.

Ví dụ:

REQ-20260824-8F92
8. P5-03 — SECURITY & AUDIT MONITORING

Xây dựng Security Event Log.

Các event bắt buộc:

AUTH_LOGIN_SUCCESS
AUTH_LOGIN_FAILED
AUTH_LOGOUT
AUTH_PASSWORD_CHANGED

RLS_DENIED
QUOTA_DENIED

PAYMENT_CREATED
PAYMENT_WAITING_BANK
PAYMENT_WEBHOOK_RECEIVED
PAYMENT_WEBHOOK_REJECTED
PAYMENT_SUCCESS
PAYMENT_PARTIAL
PAYMENT_REFUND
PAYMENT_DUPLICATE

SUBSCRIPTION_CREATED
SUBSCRIPTION_UPGRADED
SUBSCRIPTION_DOWNGRADED
SUBSCRIPTION_EXPIRED
SUBSCRIPTION_RENEWED

ADMIN_ACTION
ADMIN_BILLING_OVERRIDE

DATA_IMPORT_STARTED
DATA_IMPORT_FAILED
DATA_IMPORT_COMMITTED

LEDGER_POSTED
LEDGER_REVERSED

EXPORT_REQUESTED
BACKUP_CREATED
RESTORE_REQUESTED

SECURITY_ALERT
9. P5-04 — SYSTEM HEALTH

Tạo:

/api/health

hoặc cơ chế tương đương phù hợp với architecture hiện tại.

Health check phải kiểm tra:

Application
Database
Authentication
Storage
Critical RPC
Payment configuration
Webhook configuration

Phân loại:

HEALTHY
DEGRADED
UNHEALTHY

Không expose secret hoặc database internals.

10. READINESS VS LIVENESS

Bắt buộc phân biệt:

LIVENESS
→ Application process còn hoạt động.

READINESS
→ Application có thể phục vụ nghiệp vụ.

Ví dụ:

Database DOWN
→ Liveness = OK
→ Readiness = FAIL
11. P5-05 — BACKUP & DISASTER RECOVERY

Đây là module CRITICAL.

Mục tiêu:

RPO <= 1 hour
RTO <= 2 hours

Phải thiết kế:

Continuous / PITR
+
Periodic Backup
+
Off-site Backup
+
Restore Verification

Không chỉ tạo backup.

Bắt buộc phải:

RESTORE TEST
12. BACKUP SCOPE

Phải bảo vệ:

members
relationships
families
memorials
events
funds
financial_transactions
contributions
expenses
subscriptions
invoices
payments
audit_logs
documents
storage metadata
13. BACKUP POLICY

Tạo:

docs/BACKUP_POLICY.md
docs/DISASTER_RECOVERY_RUNBOOK.md
docs/RESTORE_TEST_REPORT.md

Phải xác định:

Backup frequency
Retention
Encryption
Storage location
Access control
Restore procedure
Restore verification
Owner
Escalation
14. RESTORE DRILL

Thực hiện test:

CREATE BACKUP
↓
SIMULATE FAILURE
↓
RESTORE
↓
VERIFY DATABASE
↓
VERIFY RLS
↓
VERIFY LEDGER
↓
VERIFY SUBSCRIPTIONS
↓
VERIFY MEMORIALS
↓
VERIFY RELATIONSHIPS

Không được chỉ kiểm tra:

database connects

Mà phải kiểm tra integrity.

15. DATA INTEGRITY CHECKSUM

Đối với dữ liệu quan trọng:

Family
Members
Relationships
Financial Ledger
Subscriptions
Payments

tạo snapshot verification.

Ví dụ:

member_count
relationship_count
ledger_balance
posted_transactions
subscription_count
payment_count

Trước và sau restore phải khớp.

16. P5-06 — INCIDENT RESPONSE

Tạo:

docs/INCIDENT_RESPONSE.md
docs/INCIDENT_SEVERITY_MATRIX.md
docs/INCIDENT_LOG.md

Phân loại:

P0 — Critical
P1 — High
P2 — Medium
P3 — Low
P0

Ví dụ:

Cross-tenant data leak
Payment double charge
Mass data corruption
Database loss
Authentication bypass

Response:

Immediate

Phải có:

Detect
Contain
Investigate
Recover
Verify
Communicate
Postmortem
17. PAYMENT INCIDENT PLAYBOOK

Đặc biệt xây dựng runbook cho:

Webhook mất
Webhook duplicate
Webhook giả mạo
Payment partial
Payment duplicate
Payment success nhưng subscription chưa active
Subscription active nhưng payment chưa recorded
Refund
Wrong invoice
Wrong transfer memo

Không được sửa trực tiếp database.

Luôn đi qua:

Verified RPC
+
Audit
+
Idempotency
18. P5-07 — RELEASE MANAGEMENT

Chuẩn hóa:

feature branch
↓
PR
↓
CI
↓
tests
↓
build
↓
staging
↓
smoke test
↓
approval
↓
production

Không deploy trực tiếp:

local → production
19. RELEASE CHECKLIST

Tạo:

docs/PRODUCTION_RELEASE_CHECKLIST.md

Checklist:

[ ] Git clean
[ ] Tests pass
[ ] Build pass
[ ] Typecheck pass
[ ] Lint pass
[ ] Migration reviewed
[ ] RLS reviewed
[ ] Secrets reviewed
[ ] Payment tested
[ ] Webhook tested
[ ] Backup verified
[ ] Rollback plan ready
[ ] Staging smoke test pass
[ ] Production approval
20. ROLLBACK STRATEGY

Mọi production release phải có:

Release ID
Migration ID
Commit SHA
Deployment timestamp
Rollback plan

Không rollback database mù quáng.

Đặc biệt:

Financial Ledger
Payment
Subscription

phải có migration strategy an toàn.

21. P5-08 — CLOSED BETA OPERATIONS

Mục tiêu:

5–10 GIA TỘC THẬT
30 NGÀY

Không mở public registration ngay.

Tạo:

docs/CLOSED_BETA_OPERATIONS.md
docs/BETA_ONBOARDING_RUNBOOK.md
docs/BETA_SUPPORT_RUNBOOK.md
docs/BETA_EXIT_REPORT.md
22. BETA ONBOARDING

Quy trình:

INVITE
 ↓
CREATE FAMILY
 ↓
CREATE ADMIN
 ↓
IMPORT DATA
 ↓
VALIDATE
 ↓
PREVIEW
 ↓
CONFIRM
 ↓
ATOMIC COMMIT
 ↓
VERIFY TREE
 ↓
VERIFY MEMORIAL
 ↓
VERIFY FUND
 ↓
TRAIN USER

Mục tiêu:

Time-to-First-Value <= 15 phút
23. DATA IMPORT BETA

Không cho nhân viên kỹ thuật nhập trực tiếp DB.

Mọi gia tộc phải dùng:

Data Import Wizard

Quy trình:

UPLOAD
 ↓
VALIDATE
 ↓
PREVIEW
 ↓
USER CONFIRM
 ↓
ATOMIC COMMIT

Nếu lỗi:

ROLLBACK 100%
24. BETA USER ROLES

Chuẩn hóa:

SUPER_ADMIN
FAMILY_ADMIN
FAMILY_EDITOR
FAMILY_VIEWER
TREASURER

Kiểm tra least privilege.

Không cho:

FAMILY_ADMIN

thực hiện các thao tác của:

SUPER_ADMIN
25. P5-09 — SUPPORT CENTER

Tạo hệ thống ghi nhận:

Feedback
Bug
Feature Request
Question
Incident
Payment Issue
Data Issue

Mỗi ticket:

ticket_id
family_id
user_id
category
severity
description
status
created_at
assigned_to
resolution
resolved_at

Status:

OPEN
TRIAGED
IN_PROGRESS
WAITING_USER
RESOLVED
CLOSED
26. BETA FEEDBACK SCORE

Thu thập:

NPS
CSAT
Ease of Use
Data Import Difficulty
Genealogy Usability
Financial Usability
Calendar Usability
Trust
Willingness to Pay

Không chỉ hỏi:

"Bạn có thích không?"

Mà phải đo:

Can user complete task?
How long?
Where did they get stuck?
Would they pay?
27. PRODUCT METRICS

Dashboard Beta cần có:

Families onboarded
Active families
Users active
DAU
WAU
MAU

Time-to-First-Value

Members imported
Import success rate
Import failure rate

Memorials created
Events created

Funds created
Transactions recorded

Payments
Payment success rate
Webhook failure rate

Subscription conversion
Trial → Paid
Churn
28. CORE BUSINESS METRICS

Theo dõi:

Trial Conversion Rate
Paid Conversion Rate
Activation Rate
Retention
Churn
ARPU
MRR

Không được chỉ hiển thị số liệu.

Phải có:

Trend
Period
Comparison
Alert
29. ALERTING

Thiết kế cảnh báo:

P0/P1 Security Event
Database unavailable
Webhook failure spike
Payment mismatch
RLS anomaly
Backup failure
Restore failure
High error rate
Quota anomaly
Import failure spike

Ví dụ:

Webhook failure > 5% trong 15 phút
→ ALERT

Database unavailable > 1 phút
→ CRITICAL

Backup failed
→ CRITICAL

Cross-tenant access attempt
→ SECURITY ALERT
30. P5 SECURITY TESTING

Thực hiện:

Authentication test
Authorization test
RLS test
IDOR test
Tenant isolation test
Quota bypass test
Payment bypass test
Webhook forgery test
Replay attack test
Rate limit test
Secret leakage scan
Dependency audit

Đặc biệt:

Family A
    ↓
try accessing
    ↓
Family B

Expected:

DENIED
31. PAYMENT SECURITY TEST

Bắt buộc test:

Wrong signature
Missing signature
Expired timestamp
Replay webhook
Duplicate webhook
Wrong invoice
Wrong family
Wrong amount
Partial payment
Overpayment
Refund

Không được kích hoạt Subscription trong các trường hợp sai.

32. RATE LIMITING

Xác định các endpoint nhạy cảm:

LOGIN
PASSWORD RESET
IMPORT
EXPORT
PAYMENT
WEBHOOK
ADMIN

Áp dụng rate limit phù hợp.

Đặc biệt:

Webhook
Login
Password reset
33. P5 PERFORMANCE TEST

Kiểm thử:

100 members
300 members
500 members
1,000 members

Đặc biệt Genealogy Tree.

Theo dõi:

First Load
Tree Render
Search
Filtering
Import
Export
Calendar
Dashboard

Không cần tối ưu cực đoan nếu chưa có bottleneck thực tế.

34. LARGE FAMILY TEST

Tạo dataset:

1,000 members
2,000 relationships
100 memorials
50 events
20 funds
5,000 ledger transactions

Test:

Tree
Search
Import
Export
Calendar
Ledger
Dashboard
35. DATA CONSISTENCY TEST

Sau mỗi thao tác quan trọng:

Create Member
Delete/Archive Member
Relationship
Import
Expense
Reversal
Payment
Subscription
Renewal
Refund

kiểm tra:

Database state
Ledger state
Audit state
UI state

phải đồng nhất.

36. NO SILENT FAILURE

Không được có:

try {
 ...
} catch {
 // ignore
}

đối với nghiệp vụ quan trọng.

Mọi lỗi phải:

logged
typed
handled
visible
recoverable
37. UX ERROR HANDLING

Người dùng phải nhận được thông báo dễ hiểu.

Không hiển thị:

PostgrestError 23505

Thay bằng:

Không thể thêm thành viên.

Nguyên nhân:
Gia tộc đã đạt giới hạn 300 thành viên.

Vui lòng nâng cấp gói dịch vụ để tiếp tục.
38. AUDIT TRAIL

Các thao tác quan trọng phải lưu:

WHO
WHAT
WHEN
WHERE
RESULT
REASON
REQUEST_ID

Ví dụ:

WHO:
admin@example.com

ACTION:
SUBSCRIPTION_OVERRIDE

REASON:
Khách hàng được gia hạn thủ công theo chính sách Beta.

REQUEST_ID:
REQ-...

TIMESTAMP:
...
39. SUPER ADMIN SECURITY

Super Admin phải có:

strong authentication
least privilege
audit logging
session timeout
sensitive action confirmation

Các thao tác:

change subscription
refund
override quota
restore data
delete/disable account

phải yêu cầu xác nhận.

40. PRODUCTION DATABASE GUARD

Tạo cơ chế cảnh báo nếu:

environment = production

nhưng đang chạy:

seed_alpha.sql
test fixtures
mock payment
fake webhook

→ BLOCK.

41. TEST DATA GUARD

Tuyệt đối không cho:

alpha@test
beta@test
gamma@test

hoặc test fixtures xuất hiện trong Production.

Tạo test:

PROD-DATA-001

Expected:

PASS
42. FEATURE FLAGS

Nếu cần rollout dần:

FEATURE_GENEALOGY
FEATURE_FINANCIAL
FEATURE_MEMORIAL
FEATURE_PAYMENT
FEATURE_BILLING
FEATURE_BETA

Feature flag phải:

server-controlled
audited
safe default

Không dùng frontend-only flag cho security.

43. CLOSED BETA SAFETY SWITCH

Phải có:

BETA_MODE = true

Khi bật:

Public signup = disabled
Invite required = true

Không được dùng frontend để enforce security.

Backend/database phải enforce.

44. DOCUMENTATION

Tạo tối thiểu:

docs/PHASE_5_ARCHITECTURE.md

docs/OBSERVABILITY.md

docs/MONITORING.md

docs/ALERTING.md

docs/AUDIT_LOGGING.md

docs/BACKUP_POLICY.md

docs/DISASTER_RECOVERY_RUNBOOK.md

docs/RESTORE_TEST_REPORT.md

docs/INCIDENT_RESPONSE.md

docs/INCIDENT_SEVERITY_MATRIX.md

docs/PRODUCTION_RELEASE_CHECKLIST.md

docs/CLOSED_BETA_OPERATIONS.md

docs/BETA_ONBOARDING_RUNBOOK.md

docs/BETA_SUPPORT_RUNBOOK.md

docs/BETA_METRICS.md

docs/BETA_EXIT_CRITERIA.md

docs/PHASE_5_COMPLETION_REPORT.md
45. TEST MATRIX

Tạo:

tests/phase5/

Bao gồm:

production_config.test.ts

security.test.ts

rls.test.ts

tenant_isolation.test.ts

payment_security.test.ts

webhook_replay.test.ts

backup_integrity.test.ts

restore_integrity.test.ts

audit.test.ts

quota.test.ts

subscription.test.ts

data_import.test.ts

error_handling.test.ts

performance.test.ts
46. MINIMUM ACCEPTANCE TESTS

Phải có tối thiểu:

P5-SEC-001
Cross tenant access → DENIED

P5-SEC-002
IDOR → DENIED

P5-SEC-003
Secret leakage → NONE

P5-PAY-001
Client payment bypass → BLOCKED

P5-PAY-002
Invalid webhook → 401

P5-PAY-003
Replay webhook → IDEMPOTENT

P5-PAY-004
Wrong amount → NOT ACTIVATED

P5-DATA-001
Import invalid → ROLLBACK

P5-DATA-002
Import valid → ATOMIC COMMIT

P5-DATA-003
Production test data → BLOCKED

P5-DR-001
Backup → PASS

P5-DR-002
Restore → PASS

P5-DR-003
Ledger integrity → PASS

P5-AUDIT-001
Admin override → AUDITED

P5-OPS-001
Health endpoint → PASS

P5-OPS-002
Critical error → LOGGED

P5-BETA-001
Invite-only registration → PASS

P5-BETA-002
Trial creation → PASS

P5-BETA-003
Expired trial → READ_ONLY

P5-BETA-004
Upgrade → ACTIVE

P5-BETA-005
Feedback → STORED
47. CLOSED BETA EXIT CRITERIA

Không được tuyên bố Beta thành công chỉ vì:

npm test = PASS

Phải đạt đồng thời:

1. 5–10 gia tộc thật onboarded.

2. 0 P0 incident.

3. 0 P1 unresolved incident.

4. 0 cross-tenant leak.

5. 0 financial integrity issue.

6. 0 duplicate payment.

7. 100% critical data import atomic.

8. Backup verified.

9. Restore drill PASS.

10. RPO <= 1h.

11. RTO <= 2h.

12. Time-to-First-Value <= 15 phút mục tiêu.

13. ≥80% user satisfaction.

14. ≥60% willingness to pay.

15. Có ít nhất 1 gia tộc hoàn thành toàn bộ workflow:
    Genealogy → Memorial → Fund → Payment.

16. Có ít nhất 1 giao dịch thanh toán thực tế được
    xác nhận qua Webhook production.

17. Không có secret leakage.

18. Production monitoring hoạt động.

19. Incident response đã được diễn tập.

20. Có rollback procedure.
48. HUMAN-IN-THE-LOOP — CBI PHASE 7.1

Không được tự động thực hiện các hành động nguy hiểm.

Các hành động cần approval:

PRODUCTION MIGRATION
PRODUCTION DATABASE RESTORE
PAYMENT PROVIDER CHANGE
WEBHOOK SECRET CHANGE
RLS POLICY CHANGE
SUPER ADMIN PERMISSION CHANGE
PRODUCTION DATA EXPORT
PRODUCTION DATA DELETE
SUBSCRIPTION MANUAL OVERRIDE
REFUND

Workflow:

DISCOVER
 ↓
ANALYZE
 ↓
PLAN
 ↓
REQUEST APPROVAL
 ↓
EXECUTE
 ↓
VERIFY
 ↓
REPORT
49. PHASE 5 EXECUTION ORDER

Không triển khai ngẫu nhiên.

Thứ tự bắt buộc:

STEP 1
Architecture Audit

↓

STEP 2
Environment Hardening

↓

STEP 3
Observability

↓

STEP 4
Audit & Security Monitoring

↓

STEP 5
Health Checks

↓

STEP 6
Backup

↓

STEP 7
Restore Drill

↓

STEP 8
Incident Response

↓

STEP 9
Release Pipeline

↓

STEP 10
Security Testing

↓

STEP 11
Performance Testing

↓

STEP 12
Closed Beta Operations

↓

STEP 13
5–10 Family Onboarding

↓

STEP 14
Real Payment Verification

↓

STEP 15
30-Day Monitoring

↓

STEP 16
Beta Exit Evaluation
50. KHÔNG ĐƯỢC LÀM
❌ Không redesign toàn bộ UI.

❌ Không thay framework.

❌ Không đổi Supabase nếu không có lý do kỹ thuật nghiêm trọng.

❌ Không thay payment architecture đang hoạt động.

❌ Không bỏ RLS để "dễ phát triển".

❌ Không bypass RPC.

❌ Không seed test data vào production.

❌ Không hard delete financial ledger.

❌ Không tự động refund.

❌ Không tự động restore production.

❌ Không commit secrets.

❌ Không coi build PASS là Production Ready.

❌ Không tạo mock để giả lập thành công thay cho
production verification.

❌ Không tuyên bố đã test production nếu chỉ test local.
51. DEFINITION OF DONE

Phase 5 chỉ được đánh dấu:

PHASE 5 = COMPLETE

khi có đầy đủ:

✓ Production environment separated

✓ Secrets secured

✓ Observability active

✓ Structured logs active

✓ Request correlation active

✓ Health checks active

✓ Audit logging active

✓ Security monitoring active

✓ Backup verified

✓ Restore verified

✓ Disaster Recovery documented

✓ Incident Response documented

✓ Release pipeline controlled

✓ Rollback documented

✓ Security tests passed

✓ Performance tests passed

✓ Beta onboarding workflow passed

✓ 5–10 real families onboarded

✓ Real payment verified

✓ Payment reconciliation verified

✓ Support workflow active

✓ Metrics dashboard active

✓ Beta exit criteria measurable

✓ No P0/P1 blocker

✓ Production smoke test passed
52. FINAL REPORT

Sau khi hoàn thành, tạo:

docs/PHASE_5_COMPLETION_REPORT.md

Báo cáo phải có:

1. Executive Summary

2. Architecture Changes

3. Production Environment

4. Security

5. Observability

6. Backup

7. Disaster Recovery

8. Incident Response

9. Payment Operations

10. Release Management

11. Closed Beta

12. Metrics

13. Test Results

14. Known Issues

15. Risk Register

16. Beta Results

17. Production Readiness Decision

18. Recommended Phase 6
53. FINAL OUTPUT FORMAT

Khi hoàn thành Phase 5, KHÔNG trả lời chung chung.

Phải xuất báo cáo theo format:

============================================================
PHASE 5 IMPLEMENTATION REPORT
============================================================

STATUS:
PASS / PARTIAL / BLOCKED

PRODUCTION READINESS:
YES / NO

SECURITY:
PASS

RLS:
PASS

OBSERVABILITY:
PASS

AUDIT:
PASS

BACKUP:
PASS

RESTORE:
PASS

DISASTER RECOVERY:
PASS

PAYMENT:
PASS

WEBHOOK:
PASS

RELEASE PIPELINE:
PASS

CLOSED BETA:
PASS

REAL FAMILIES:
X / 10

REAL PAYMENTS:
X

P0:
0

P1:
0

P2:
X

P3:
X

TESTS:
X / X PASSED

BUILD:
PASS

TYPECHECK:
PASS

LINT:
PASS

SECURITY SCAN:
PASS

BACKUP DRILL:
PASS

RESTORE DRILL:
PASS

RPO:
X minutes

RTO:
X minutes

TTFV:
X minutes

USER SATISFACTION:
X%

WILLINGNESS TO PAY:
X%

------------------------------------------------------------

FINAL DECISION:

READY FOR CLOSED BETA
OR
READY FOR COMMERCIAL PRODUCTION
OR
BLOCKED

------------------------------------------------------------

GIT COMMIT:
<sha>

DEPLOYMENT:
<environment>

NEXT PHASE:
<recommendation>
============================================================
54. QUY TẮC QUAN TRỌNG NHẤT
ĐỪNG CHỈ XÂY CODE.

HÃY XÂY HỆ THỐNG CÓ THỂ VẬN HÀNH.

ĐỪNG CHỈ TEST HAPPY PATH.

HÃY TEST FAILURE.

ĐỪNG CHỈ KIỂM TRA DATABASE CÒN HOẠT ĐỘNG.

HÃY CHỨNG MINH CÓ THỂ RESTORE.

ĐỪNG CHỈ KIỂM TRA PAYMENT SUCCESS.

HÃY KIỂM TRA PAYMENT FAILURE,
DUPLICATE, REPLAY, PARTIAL, REFUND.

ĐỪNG CHỈ KIỂM TRA RLS BẰNG UNIT TEST.

HÃY KIỂM TRA CROSS-TENANT TRONG DATABASE THỰC.

ĐỪNG CHỈ KIỂM TRA 100 TEST CASE.

HÃY KIỂM TRA 5–10 GIA TỘC THẬT.

MỤC TIÊU CUỐI CÙNG:

"HERITAGE LEDGER CÓ THỂ ĐƯỢC GIAO CHO
GIA ĐÌNH THẬT, DỮ LIỆU THẬT, TIỀN THẬT,
VÀ VẬN HÀNH LIÊN TỤC MÀ KHÔNG CẦN
ĐỘI NGŨ KỸ THUẬT CAN THIỆP HÀNG NGÀY."
Tôi đặc biệt khuyến nghị không cho AI Coding Agent triển khai Phase 5 một lần duy nhất

Với trạng thái hiện tại của dự án, Phase 5 nên được chia thành 5 Sprint có checkpoint, vì đây là giai đoạn chuyển từ development sang production operations:

Sprint	Nội dung	Gate
5.1	Production Hardening + Secrets + Health Check	Security Gate
5.2	Observability + Audit + Monitoring + Alerting	Observability Gate
5.3	Backup + Restore + DR + Incident Response	Recovery Gate
5.4	Release Pipeline + Security/Performance + Beta Ops	Release Gate
5.5	5–10 gia tộc thật + tiền thật + 30 ngày	Beta Exit Gate
    "type": "workflow",
    "steps": [
        {
            "name": "Production Hardening",
            "description": "Tách production hoàn toàn, cấu hình SSL, RLS production, secrets, .env production"
        },
        {
            "name": "Observability Setup",
            "description": "Structured logging, request correlation, health check, monitoring, alerting"
        },
        {
            "name": "Backup & Restore Testing",
            "description": "Backup hoàn chỉnh, restore thử, DR plan, RPO/RTO"
        },
        {
            "name": "Security Testing",
            "description": "Pen test, audit scan, RLS cross-tenant, secret leakage"
        },
        {
            "name": "Release Pipeline",
            "description": "Build, test, staging, canary, production pipeline"
        },
        {
            "name": "Performance Testing",
            "description": "Load test, stress test, cache hit rate, TTFV"
        },
        {
            "name": "Closed Beta Onboarding",
            "description": "5–10 gia tộc, onboarding flow, import test, edit test"
        },
        {
            "name": "Payment Integration Testing",
            "description": "Stripe sandbox, webhook, payment, refund, duplicate, retry"
        },
        {
            "name": "30-Day Monitoring",
            "description": "Theo dõi P0, P1, P2, P3, user feedback, metric"
        },
        {
            "name": "Beta Exit Review",
            "description": "Xem xét exit criteria, quyết định commercial launch"
        }
    ],
    "gates": [
        "security_gate",
        "observability_gate",
        "recovery_gate",
        "release_gate",
        "beta_exit_gate"
    ],
    "success_criteria": [
        "100% security tests passed",
        "0 P0/P1 incidents",
        "Backup/Restore verified",
        "RLS production verified",
        "5–10 real families onboarded",
        "Real payment verified",
        "30-day stability",
        "Beta metrics measured",
        "DR plan documented",
        "Release pipeline functional"
    ],
    "output_file": "docs/PHASE_5_EXECUTION_PLAN.md"
}