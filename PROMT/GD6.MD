============================================================
HERITAGE LEDGER — PHASE 6
CLOSED BETA VALIDATION & PRODUCT OPERATIONS
============================================================

PROJECT:
Gia Phả Gia Tộc — Heritage Ledger

CURRENT STATUS:
Phase 1 → Phase 5 COMPLETED

CURRENT BASELINE:
- Genealogy Core: PASS
- Financial Core: PASS
- Lunar / Memorial / Event Engine: PASS
- Subscription / Billing / VietQR: PASS
- Production Hardening: PASS
- RLS Multi-tenancy: PASS
- Backup / Restore: PASS
- Observability: PASS
- Automated Tests: 123/123 PASS
- Build: PASS
- Typecheck: PASS
- Lint: PASS
- Closed Beta Mode: READY

IMPORTANT:
PHASE 6 IS NOT A FEATURE-EXPANSION PHASE.

PHASE 6 IS:
CLOSED BETA VALIDATION + REAL USER OPERATIONS +
DATA INTEGRITY MONITORING + COMMERCIAL VALIDATION.

OBJECTIVE:

Chứng minh bằng dữ liệu thực tế rằng:

1. 5–10 gia tộc thật có thể onboarding thành công.
2. Dữ liệu gia phả có thể nhập an toàn.
3. Người dùng thực sự đạt First Value <= 15 phút.
4. Gia tộc thực sự sử dụng các module cốt lõi.
5. Không xảy ra cross-tenant data leak.
6. Không xảy ra mất hoặc sai lệch dữ liệu.
7. Sổ quỹ và thanh toán luôn cân bằng.
8. Hệ thống hoạt động ổn định trong 30 ngày.
9. Người dùng thực sự muốn tiếp tục sử dụng.
10. Có đủ bằng chứng để quyết định COMMERCIAL GO / NO-GO.

============================================================
I. ABSOLUTE ENGINEERING PRINCIPLES
============================================================

1. DATA INTEGRITY > FEATURE VELOCITY

2. KHÔNG phá vỡ:
   - Database schema hiện tại
   - RLS policies
   - Financial ledger invariants
   - Subscription state machine
   - Payment state machine
   - Lunar calculation engine
   - Audit trail
   - Multi-tenant isolation

3. KHÔNG hard-delete:
   - financial transactions
   - payments
   - invoices
   - audit logs
   - genealogy relationships nếu đã được sử dụng trong lịch sử

4. KHÔNG cho Client tự quyết định:
   - Payment SUCCESS
   - Invoice PAID
   - Subscription ACTIVE
   - Fund balance
   - Audit status
   - Quota status
   - Tenant ownership

5. Mọi logic bảo mật quan trọng phải thực thi tại:
   DATABASE / SERVER / RPC LAYER.

6. Client chỉ là presentation layer.

7. Không sử dụng mock data để tuyên bố:
   - Real users
   - Real payment
   - Real onboarding
   - Real CSAT
   - Real conversion
   - Real retention

8. Nếu một metric chưa có dữ liệu thực:
   hiển thị:
   NOT ENOUGH DATA

   KHÔNG được tự động điền số giả.

9. Không được coi:
   UNIT TEST PASS
   =
   REAL WORLD VALIDATION.

10. Phase 6 phải tạo Evidence Trail cho mọi kết luận quan trọng.

============================================================
II. PLAN-FIRST REQUIREMENT
============================================================

TRƯỚC KHI CODE:

1. Đọc toàn bộ:
   /docs/
   implementation_plan.md
   Phase 1–5 completion reports
   database migrations
   existing tests
   RLS policies
   payment architecture
   billing architecture
   audit architecture

2. Phân tích codebase hiện tại.

3. Tạo:

   docs/PHASE_6_IMPLEMENTATION_PLAN.md

4. Không tự ý thay đổi schema hoặc architecture nếu chưa có lý do.

5. Nếu phát hiện conflict với Phase 1–5:
   STOP và ghi vào:

   docs/PHASE_6_CONFLICT_REPORT.md

6. Phải chia implementation thành các Sprint.

7. Mỗi Sprint phải có:
   - Objective
   - Files affected
   - Database impact
   - Security impact
   - Test plan
   - Rollback plan
   - Acceptance criteria
   - Evidence requirements

8. Chỉ sau khi plan hợp lệ mới bắt đầu implementation.

============================================================
III. PHASE 6 SPRINT STRUCTURE
============================================================

SPRINT 6.1
BETA COMMAND CENTER

SPRINT 6.2
FAMILY HEALTH + ACTIVATION FUNNEL

SPRINT 6.3
DATA INTEGRITY WATCHDOG

SPRINT 6.4
FINANCIAL RECONCILIATION WATCHDOG

SPRINT 6.5
REAL BETA EVIDENCE + SUPPORT OPERATIONS

SPRINT 6.6
30-DAY RETENTION + COMMERCIAL VALIDATION

SPRINT 6.7
BETA EXIT AUDIT + GO / NO-GO

============================================================
SPRINT 6.1
BETA COMMAND CENTER
============================================================

CREATE:

/admin/beta

AND:

src/pages/admin/BetaCommandCenterPage.tsx

src/services/BetaAnalyticsService.ts

src/services/BetaHealthService.ts

src/components/beta/

Dashboard phải hiển thị:

-----------------------------------------
BETA OVERVIEW
-----------------------------------------

Total Families
Active Families
Trial Families
Read-only Families
Invited Families
Onboarding Completed
Onboarding Failed

-----------------------------------------
ACTIVATION
-----------------------------------------

Registration
Family Created
Members Imported
First Relationship
First Memorial
First Fund
First Transaction
First QR
First Invitation

-----------------------------------------
ENGAGEMENT
-----------------------------------------

DAU
WAU
MAU
D1 Retention
D7 Retention
D14 Retention
D30 Retention

-----------------------------------------
OPERATIONS
-----------------------------------------

P0
P1
P2
P3

Open Tickets
Unresolved Tickets
Average Resolution Time

-----------------------------------------
FINANCIAL
-----------------------------------------

Invoices
Payments
Payment Success Rate
Webhook Failure Rate
Partial Payments
Refunds

-----------------------------------------
COMMERCIAL
-----------------------------------------

Trial Families
Paid Families
Conversion Rate
Renewal Intent
Churn
MRR
ARR
ARPU

-----------------------------------------

QUAN TRỌNG:

Nếu dữ liệu chưa đủ:

NOT ENOUGH DATA

Không được hiển thị số liệu giả.

============================================================
SPRINT 6.2
FAMILY HEALTH SCORE
============================================================

CREATE:

src/services/FamilyHealthService.ts

Mỗi family có:

Family Health Score: 0–100

Formula:

Data Completeness       25%
Feature Adoption        20%
Weekly Activity         20%
Financial Usage         15%
Calendar Usage          10%
Support Health          10%

-----------------------------------------

DATA COMPLETENESS

Kiểm tra:

- members
- relationships
- generations
- branches
- memorials
- events
- funds

-----------------------------------------

FEATURE ADOPTION

Kiểm tra:

- genealogy
- calendar
- memorial
- event
- fund
- contribution
- VietQR
- invitations

-----------------------------------------

WEEKLY ACTIVITY

Đo:

- active users
- sessions
- meaningful actions

Không tính page refresh đơn thuần.

-----------------------------------------

HEALTH LEVEL

>= 80:
HEALTHY

60–79:
AT_RISK

< 60:
CRITICAL

Dashboard:

Family Health Table

Columns:

Family
Members
Health Score
Level
Last Active
Features Used
Open Tickets
Subscription
Risk Flags

============================================================
SPRINT 6.3
DATA INTEGRITY WATCHDOG
============================================================

ĐÂY LÀ MODULE QUAN TRỌNG NHẤT PHASE 6.

CREATE:

src/services/DataIntegrityWatchdog.ts

src/services/GenealogyIntegrityService.ts

src/services/SubscriptionIntegrityService.ts

src/services/PaymentIntegrityService.ts

src/services/LedgerIntegrityService.ts

CREATE:

/admin/integrity

-----------------------------------------
GENEALOGY CHECKS
-----------------------------------------

Detect:

1. Orphan member
2. Invalid parent-child relationship
3. Cyclic relationship
4. Invalid generation ordering
5. Duplicate relationship
6. Invalid spouse relationship
7. Missing tenant_id
8. Cross-tenant relationship
9. Missing member reference
10. Broken genealogy tree

-----------------------------------------
MEMORIAL CHECKS
-----------------------------------------

Detect:

- invalid lunar date
- invalid leap-month flag
- impossible lunar date
- missing member
- duplicate memorial
- broken memorial reference

-----------------------------------------
EVENT CHECKS
-----------------------------------------

Detect:

- event without family
- event without valid creator
- invalid budget
- expense not linked correctly
- event expense mismatch

-----------------------------------------
FINANCIAL CHECKS
-----------------------------------------

Invariant:

Opening Balance
+
Income
-
Expense
+
Reversal
=
Closing Balance

Detect:

- negative balance
- orphan transaction
- duplicate transaction
- missing audit
- invalid reversal
- ledger imbalance
- transaction status mismatch

-----------------------------------------
PAYMENT CHECKS
-----------------------------------------

Payment
↔ Invoice
↔ Subscription
↔ Bank reference

Detect:

- payment without invoice
- invoice without payment
- SUCCESS payment but invoice unpaid
- PAID invoice but subscription inactive
- duplicate bank reference
- webhook replay
- amount mismatch
- currency mismatch

-----------------------------------------
SUBSCRIPTION CHECKS
-----------------------------------------

Detect:

- ACTIVE without payment
- expired subscription marked ACTIVE
- invalid plan
- invalid period
- duplicate active subscription
- inconsistent quota

-----------------------------------------

INTEGRITY SCORE

100 = HEALTHY

99–95 = WARNING

94–80 = DEGRADED

<80 = CRITICAL

Nếu Critical:

Tạo Security / Data Integrity Alert.

KHÔNG tự sửa dữ liệu.

Chỉ:

DETECT
→ REPORT
→ ALERT
→ HUMAN REVIEW

Không tạo auto-healing cho financial data.

============================================================
SPRINT 6.4
FINANCIAL RECONCILIATION WATCHDOG
============================================================

CREATE:

src/services/FinancialReconciliationService.ts

CREATE:

/admin/reconciliation

Daily reconciliation:

-----------------------------------------

FUND BALANCE

SUM(INCOME)
-
SUM(EXPENSE)
+
SUM(REVERSAL)

must equal:

fund.current_balance

-----------------------------------------

PAYMENT RECONCILIATION

Bank Amount
=
Payment Amount
=
Invoice Amount

-----------------------------------------

SUBSCRIPTION RECONCILIATION

Payment SUCCESS
→ Invoice PAID
→ Subscription ACTIVE

-----------------------------------------

DAILY REPORT

Date
Fund
Opening Balance
Income
Expense
Reversal
Expected Balance
Actual Balance
Difference
Status

-----------------------------------------

STATUS:

MATCHED
WARNING
MISMATCH
CRITICAL

Nếu mismatch:

KHÔNG tự điều chỉnh số dư.

Tạo:

RECONCILIATION_INCIDENT

và yêu cầu Admin xử lý.

============================================================
SPRINT 6.5
REAL BETA EVIDENCE
============================================================

CREATE:

src/services/BetaEvidenceService.ts

CREATE:

/admin/beta/evidence

Mỗi family có:

BETA-FAM-XXXX

Evidence record:

-----------------------------------------

ONBOARDING

Registration timestamp
Invite code
Admin user
Family creation
Import started
Import completed
Import result

-----------------------------------------

DATA

Member count
Relationship count
Memorial count
Fund count

-----------------------------------------

ACTIVATION

First Value timestamp
TTFV

-----------------------------------------

USAGE

D1
D7
D14
D30

-----------------------------------------

FINANCIAL

First fund
First income
First expense
First QR
First real payment

-----------------------------------------

SUPPORT

Ticket count
P0
P1
P2
P3
Resolution time

-----------------------------------------

FEEDBACK

CSAT
NPS
Free text feedback

-----------------------------------------

COMMERCIAL

Trial end
Upgrade
Payment
Renewal intent

-----------------------------------------

EVIDENCE TYPES

SCREENSHOT
LOG
DATABASE_RECORD
PAYMENT_REFERENCE
USER_FEEDBACK
ADMIN_VERIFICATION

Không được ghi:

"REAL PAYMENT VERIFIED"

nếu không có payment reference/log thực tế.

============================================================
SPRINT 6.6
30-DAY RETENTION & COMMERCIAL VALIDATION
============================================================

CREATE:

src/services/RetentionAnalyticsService.ts

Track:

D1
D3
D7
D14
D21
D30

Track meaningful activities:

- view genealogy
- add member
- edit relationship
- view memorial
- create event
- create fund
- record income
- record expense
- contribution
- QR payment
- invitation

Không tính:

- login đơn thuần
- refresh
- idle session

-----------------------------------------

COMMERCIAL METRICS

Trial → Paid

Paid → Renewal

Churn

MRR

ARR

ARPU

Revenue per Family

-----------------------------------------

WILLINGNESS TO PAY

Không dùng mock survey.

Chỉ ghi:

RESPONDED
NOT_RESPONDED

và:

YES
NO
UNDECIDED

============================================================
SPRINT 6.7
BETA EXIT AUDIT
============================================================

CREATE:

docs/PHASE_6_BETA_EXIT_REPORT.md

AND:

/admin/beta/exit-audit

Mandatory gates:

-----------------------------------------

GATE 1
REAL FAMILIES

>= 5

-----------------------------------------

GATE 2
DATA IMPORT

>= 95% success

-----------------------------------------

GATE 3
TTFV

<= 15 minutes

-----------------------------------------

GATE 4
DATA INTEGRITY

0 data loss

0 cross-tenant leak

0 ledger mismatch

-----------------------------------------

GATE 5
SECURITY

0 P0
0 P1

-----------------------------------------

GATE 6
RELIABILITY

No unresolved critical incident.

-----------------------------------------

GATE 7
USER SATISFACTION

CSAT >= 80%

-----------------------------------------

GATE 8
RETENTION

D30 >= 60%

-----------------------------------------

GATE 9
COMMERCIAL

Willingness to Pay >= 60%

Paid conversion target >= 40%

-----------------------------------------

GATE 10
PAYMENT

No unresolved payment reconciliation mismatch.

============================================================
IV. ADMIN ACTIONS
============================================================

Super Admin can:

- view family
- view health
- view integrity
- view reconciliation
- view incidents
- view evidence
- export reports

Sensitive actions MUST require:

1. Authentication
2. Authorization
3. Audit reason
4. Confirmation
5. Audit log

Never allow:

- direct ledger editing
- direct balance editing
- direct payment success
- direct invoice paid
- direct subscription activation
- deleting audit evidence

============================================================
V. SECURITY REQUIREMENTS
============================================================

Test:

1. Cross-tenant access
2. IDOR
3. Admin endpoint authorization
4. Evidence endpoint authorization
5. Reconciliation endpoint authorization
6. Export authorization
7. Sensitive data exposure
8. Client bundle secret leakage
9. API abuse
10. Rate limiting

Every Admin API must verify:

authenticated user
+
authorized role
+
tenant scope where applicable.

============================================================
VI. DATABASE REQUIREMENTS
============================================================

Before migration:

READ CURRENT SCHEMA.

DO NOT DUPLICATE EXISTING TABLES.

Prefer existing tables.

Only create new tables when necessary.

Potential tables:

beta_families
beta_events
beta_metrics
beta_health_snapshots
beta_evidence
integrity_checks
integrity_incidents
reconciliation_runs
reconciliation_items
beta_feedback
beta_tickets

Every table must have:

id
created_at
updated_at

Tenant-related records must contain:

family_id

where applicable.

Apply RLS.

Test:

Alpha cannot read Beta.

Beta cannot read Gamma.

Normal user cannot read Admin records.

============================================================
VII. OBSERVABILITY
============================================================

Every Beta operation must have:

request_id

Example:

REQ-20260824-0001

Log:

timestamp
request_id
user_id
family_id
action
module
status
duration_ms
error_code

Sensitive values:

REDACTED

Never log:

password
JWT
service_role key
HMAC secret
bank credentials
full payment secret
private personal data unnecessarily

============================================================
VIII. TEST SUITE
============================================================

Create:

tests/phase6/

Files:

phase6_beta_command_center.test.ts
phase6_family_health.test.ts
phase6_activation_funnel.test.ts
phase6_integrity_watchdog.test.ts
phase6_financial_reconciliation.test.ts
phase6_beta_evidence.test.ts
phase6_retention.test.ts
phase6_commercial_validation.test.ts
phase6_admin_security.test.ts
phase6_exit_gate.test.ts

Minimum test scenarios:

P6-SEC-001
Cross-tenant Beta dashboard access denied

P6-SEC-002
Normal user cannot access Admin Beta dashboard

P6-SEC-003
Evidence endpoint authorization

P6-SEC-004
Reconciliation endpoint authorization

P6-DATA-001
Orphan member detection

P6-DATA-002
Cyclic relationship detection

P6-DATA-003
Generation inconsistency detection

P6-DATA-004
Cross-tenant relationship detection

P6-DATA-005
Ledger imbalance detection

P6-DATA-006
Payment/invoice mismatch detection

P6-DATA-007
Subscription/payment mismatch detection

P6-FIN-001
Fund balance reconciliation

P6-FIN-002
Reversal reconciliation

P6-FIN-003
Duplicate payment detection

P6-FIN-004
Webhook/payment consistency

P6-BETA-001
Family health calculation

P6-BETA-002
Activation funnel calculation

P6-BETA-003
TTFV calculation

P6-BETA-004
D7 retention

P6-BETA-005
D30 retention

P6-BETA-006
NOT ENOUGH DATA handling

P6-EVIDENCE-001
Evidence creation

P6-EVIDENCE-002
Evidence immutability

P6-EVIDENCE-003
Fake real-payment claim blocked

P6-ADMIN-001
Admin audit reason required

P6-ADMIN-002
Unauthorized admin action blocked

P6-EXIT-001
Beta Exit Gate calculation

P6-EXIT-002
GO decision only when all mandatory gates pass

P6-EXIT-003
NO-GO decision when mandatory gate fails

IMPORTANT:

Do NOT fake test data to make the Exit Gate pass.

Fixture data may be used for technical tests,
but must be explicitly marked:

TEST_FIXTURE

and can NEVER be counted as:

REAL_BETA_FAMILY
REAL_PAYMENT
REAL_FEEDBACK
REAL_RETENTION

============================================================
IX. BETA MODE SAFETY
============================================================

Production Beta mode:

BETA_MODE=true

Registration:

INVITE_ONLY=true

Only valid invite codes can create Beta families.

Admin can revoke invite.

Invite must be:

- unique
- single-use where configured
- expiration-aware
- auditable

No public mass registration during Closed Beta.

============================================================
X. REPORTING
============================================================

Generate:

docs/PHASE_6_IMPLEMENTATION_PLAN.md
docs/PHASE_6_OPERATIONS.md
docs/BETA_COMMAND_CENTER.md
docs/FAMILY_HEALTH_MODEL.md
docs/DATA_INTEGRITY_WATCHDOG.md
docs/FINANCIAL_RECONCILIATION.md
docs/BETA_EVIDENCE_PROTOCOL.md
docs/BETA_METRICS.md
docs/BETA_EXIT_CRITERIA.md
docs/PHASE_6_BETA_EXIT_REPORT.md

============================================================
XI. RELEASE GATES
============================================================

SPRINT 6.1 GATE

Beta Command Center functional
Admin authorization PASS
RLS PASS

↓

SPRINT 6.2 GATE

Family Health Score PASS
Activation Funnel PASS
No fake metrics

↓

SPRINT 6.3 GATE

Integrity Watchdog PASS
0 false-negative critical integrity cases

↓

SPRINT 6.4 GATE

Financial reconciliation PASS
Ledger invariant preserved

↓

SPRINT 6.5 GATE

Evidence system PASS
Real-user evidence separated from fixtures

↓

SPRINT 6.6 GATE

Retention and commercial analytics PASS

↓

SPRINT 6.7 FINAL GATE

Beta Exit Audit PASS

============================================================
XII. FINAL ACCEPTANCE CRITERIA
============================================================

PHASE 6 MAY ONLY BE DECLARED PASS IF:

1. Build PASS
2. Typecheck PASS
3. Lint PASS
4. Existing 123 tests remain PASS
5. New Phase 6 tests PASS
6. RLS PASS
7. No cross-tenant leak
8. No secret leakage
9. Financial reconciliation PASS
10. Data integrity checks PASS
11. Evidence trail implemented
12. Beta dashboard functional
13. Family Health functional
14. Activation Funnel functional
15. Retention analytics functional
16. Commercial metrics functional
17. Admin audit functional
18. Beta invite-only functional
19. Backup remains functional
20. Rollback plan verified

CRITICAL:

Existing Phase 1–5 behavior must not regress.

If any regression occurs:

STOP RELEASE.

Do not deploy production.

============================================================
XIII. FINAL VERIFICATION COMMAND
============================================================

Run:

npm run build
npm test
npm run typecheck
npm run lint

Then run all Phase 6 tests.

Generate:

docs/PHASE_6_FINAL_VERIFICATION_REPORT.md

Report:

Build:
PASS/FAIL

Typecheck:
PASS/FAIL

Lint:
PASS/FAIL

Existing Tests:
XXX/123

Phase 6 Tests:
XXX/XXX

RLS:
PASS/FAIL

Security:
PASS/FAIL

Integrity:
PASS/FAIL

Reconciliation:
PASS/FAIL

Observability:
PASS/FAIL

Beta Operations:
PASS/FAIL

Evidence:
PASS/FAIL

Exit Gate:
PASS/FAIL

============================================================
XIV. GIT / DEPLOYMENT
============================================================

DO NOT commit before verification.

After all gates PASS:

1. git status
2. review changed files
3. review migrations
4. review secrets
5. run tests
6. commit

Commit message:

feat(phase6): closed beta validation and product operations

Push to:

main

Then verify:

GitHub
↓
Vercel
↓
Supabase
↓
Production Health
↓
Smoke Test

============================================================
XV. FINAL REPORT FORMAT
============================================================

Create:

docs/PHASE_6_COMPLETION_REPORT.md

Format:

============================================================
HERITAGE LEDGER — PHASE 6 COMPLETION REPORT
============================================================

STATUS:

PASS / CONDITIONAL PASS / FAIL

BETA FAMILIES:

REAL: X
TEST FIXTURES: X

TTFV:

X minutes

D7 RETENTION:

X%

D30 RETENTION:

X%

CSAT:

X%

NPS:

X

WILLINGNESS TO PAY:

X%

PAID CONVERSION:

X%

DATA INTEGRITY:

PASS / FAIL

FINANCIAL RECONCILIATION:

PASS / FAIL

PAYMENT:

PASS / FAIL

RLS:

PASS / FAIL

SECURITY:

PASS / FAIL

P0:

X

P1:

X

P2:

X

P3:

X

BUILD:

PASS / FAIL

TYPECHECK:

PASS / FAIL

LINT:

PASS / FAIL

TESTS:

X / X

REGRESSION:

PASS / FAIL

============================================================

BETA EXIT DECISION:

GO
NO-GO
CONDITIONAL GO

============================================================

EVIDENCE:

List all evidence IDs.

============================================================

IMPORTANT:

Không được ghi "GO" chỉ vì automated tests PASS.

GO chỉ khi các tiêu chí Real Beta Exit đã có evidence thực tế.

============================================================
XVI. EXECUTION RULE
============================================================

BẮT ĐẦU NGAY.

Nhưng KHÔNG code ngay.

BƯỚC 1:
Inspect toàn bộ repository.

BƯỚC 2:
Đọc Phase 1–5 documentation.

BƯỚC 3:
Đọc database schema + RLS + migrations.

BƯỚC 4:
Đọc test suite hiện tại.

BƯỚC 5:
Tạo:

docs/PHASE_6_IMPLEMENTATION_PLAN.md

BƯỚC 6:
Xuất:

- Architecture impact
- Database impact
- Security impact
- Files to create
- Files to modify
- Migration requirements
- Test matrix
- Rollback plan
- Quality Gates

BƯỚC 7:
Chỉ triển khai Sprint 6.1 sau khi Plan đã hoàn chỉnh.

BƯỚC 8:
Sau mỗi Sprint:

IMPLEMENT
→ TEST
→ VERIFY
→ DOCUMENT
→ QUALITY GATE

Không được bỏ qua Gate.

============================================================
FINAL PRINCIPLE
============================================================

HERITAGE LEDGER IS NOT JUST A SOFTWARE PRODUCT.

It stores:

FAMILY HISTORY
ANCESTRY
MEMORIAL DATES
FAMILY MONEY
DONATIONS
FINANCIAL HISTORY

Therefore:

DATA INTEGRITY
>
SECURITY
>
AUDITABILITY
>
RELIABILITY
>
USER EXPERIENCE
>
FEATURE VELOCITY

Never sacrifice the first four for the last one.

============================================================
START PHASE 6
============================================================