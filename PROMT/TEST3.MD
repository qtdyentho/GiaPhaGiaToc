============================================================
CLOSED BETA READINESS & LAUNCH PACKAGE
PROJECT: GIA PHẢ GIA TỘC
============================================================

INTERNAL ALPHA ĐÃ PASS:

16/16 tests
0 FAILED
0 BLOCKER
0 CRITICAL

npm run build: PASS
npm test: PASS

CHUYỂN SANG:

TIER 2 — CLOSED BETA
5–10 GIA TỘC THỰC TẾ
TRIAL 30 NGÀY

============================================================
TASK
============================================================

Không thay đổi kiến trúc lõi nếu không phát hiện blocker.

Hãy xây dựng bộ tài liệu và công cụ cần thiết để vận hành
Closed Beta thực tế.

Tạo:

/docs/CLOSED_BETA_PLAN.md
/docs/CLOSED_BETA_TEST_PLAN.md
/docs/BETA_ONBOARDING_GUIDE.md
/docs/BETA_SUPPORT_RUNBOOK.md
/docs/BETA_FEEDBACK_FORM.md
/docs/BETA_METRICS.md
/docs/BETA_EXIT_CRITERIA.md
/docs/BETA_INCIDENT_RESPONSE.md
/docs/BETA_DATA_MIGRATION.md
/docs/BETA_RELEASE_CHECKLIST.md

============================================================
1. CLOSED_BETA_PLAN.md
============================================================

Mục tiêu:

- 5–10 gia tộc thật
- Trial 30 ngày
- Không thu phí bắt buộc trong Beta
- Dữ liệu thật nhưng có kiểm soát
- Theo dõi hành vi sử dụng
- Thu thập feedback

Định nghĩa:

Beta Start
Day 0

Day 7
Day 14
Day 21
Day 30

============================================================
2. BETA ONBOARDING
============================================================

Thiết kế quy trình:

Admin tạo invitation
→ Trưởng tộc đăng ký
→ Tạo gia tộc
→ Nhập thành viên
→ Dựng cây
→ Nhập ngày giỗ
→ Tạo sự kiện
→ Khởi tạo quỹ
→ Thiết lập khoản thu
→ Gán mức thu thành viên
→ Thử ghi nhận thu/chi
→ Kiểm tra báo cáo

Tạo checklist cho từng gia tộc.

============================================================
3. DATA IMPORT
============================================================

Hỗ trợ:

CSV
Excel
Manual Entry

Các dữ liệu:

Members
Generations
Branches
Relationships
Memorial dates
Events
Financial opening balances

Không cho phép import trực tiếp vào POSTED ledger.

Import phải:

VALIDATE
→ PREVIEW
→ CONFIRM
→ COMMIT

Nếu lỗi:

ROLLBACK.

============================================================
4. BETA TEST PLAN
============================================================

Mỗi gia tộc phải kiểm tra:

AUTH
TENANT
GENEALOGY
MEMBERS
LUNAR CALENDAR
MEMORIAL
EVENTS
FINANCE
LEDGER
RBAC
NOTIFICATION
TRIAL
QUOTA
READ_ONLY
PAYMENT SANDBOX

Tạo test ID riêng:

BETA-AUTH-xxx
BETA-GEN-xxx
BETA-LUNAR-xxx
BETA-FIN-xxx
BETA-BILL-xxx

============================================================
5. REAL USER FEEDBACK
============================================================

Tạo hệ thống feedback:

Bug
Feature Request
UX Problem
Data Problem
Calendar Problem
Finance Problem
Performance
Mobile
Other

Mỗi feedback:

ID
Family
User
Module
Severity
Description
Screenshot
Status
Assigned To
Resolution

============================================================
6. BETA METRICS
============================================================

Theo dõi:

Families onboarded
Active families
Daily active users
Weekly active users
Members/family
Genealogy completion
Memorial completion
Events created
Financial transactions
Revenue simulation
Trial activation
Trial engagement
Retention
Errors
Support tickets

Không chỉ đo số lượng đăng ký.

Đặc biệt đo:

Time to First Value

Time:

Register
→ Create Family
→ Add first member
→ Create first relationship
→ View genealogy tree.

============================================================
7. TECHNICAL MONITORING
============================================================

Theo dõi:

API errors
Database errors
RLS violations
RPC failures
Webhook failures
Slow queries
Storage errors
Frontend exceptions

Thiết lập cảnh báo:

ERROR
WARNING
CRITICAL

============================================================
8. SUPPORT RUNBOOK
============================================================

Tạo quy trình xử lý:

Không đăng nhập được
Không thấy thành viên
Không thấy gia phả
Sai ngày âm
Sai ngày giỗ
Không ghi nhận được thu
Không duyệt được chi
Không thấy số dư
Thanh toán chưa kích hoạt
Thanh toán trùng
Thanh toán thiếu
Gia tộc hết hạn

Mỗi sự cố:

Detection
Diagnosis
Resolution
Verification
Postmortem

============================================================
9. INCIDENT RESPONSE
============================================================

Severity:

P0 — Data loss / Security breach
P1 — Core system unavailable
P2 — Major function broken
P3 — Minor bug

P0/P1:

STOP DEPLOYMENT
→ ISOLATE
→ PRESERVE EVIDENCE
→ FIX
→ VERIFY
→ COMMUNICATE

============================================================
10. BETA EXIT CRITERIA
============================================================

Chỉ chuyển Commercial khi:

Security incidents:
0 P0
0 P1

Data loss:
0

Cross-tenant leak:
0

Financial integrity incident:
0

Payment activation error:
0

Critical lunar-calendar error:
0

Critical billing error:
0

Build:
PASS

E2E:
PASS

User acceptance:
>= 80%

Trial engagement:
>= 60%

Không tự đặt số liệu giả.

Nếu metric chưa có dữ liệu:

STATUS = NOT ENOUGH DATA

============================================================
11. RELEASE CHECKLIST
============================================================

Production environment:

Database
RLS
Storage
Auth
Domain
HTTPS
Email
Backup
Monitoring
Logging
Payment gateway
Webhook
DNS

Security:

No secrets in frontend
No service_role in client
No hardcoded credentials
No test accounts
No alpha seed

============================================================
12. IMPORTANT
============================================================

Không đưa:

seed_alpha.sql
test accounts
fake payment
sandbox credentials

vào Production.

Tạo cơ chế:

ENVIRONMENT = alpha | beta | production

và kiểm tra environment trước:

seed
payment
webhook
migration
admin operations.

============================================================
FINAL OUTPUT
============================================================

Tạo:

/docs/CLOSED_BETA_READINESS_REPORT.md

Bao gồm:

ALPHA STATUS
BETA READINESS
OPEN RISKS
MISSING ITEMS
SECURITY
DATA
PAYMENT
BILLING
OPERATIONS
MONITORING
SUPPORT

Final:

READY FOR CLOSED BETA
hoặc
NOT READY FOR CLOSED BETA

Không được tự tuyên bố READY nếu còn
BLOCKER/CRITICAL.
============================================================
START.
============================================================