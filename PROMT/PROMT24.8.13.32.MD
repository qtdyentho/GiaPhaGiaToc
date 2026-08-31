============================================================
PRODUCTION READINESS AUDIT
PROJECT: GIA PHẢ GIA TỘC
============================================================

Hệ thống đã hoàn thành implementation:

52/52 Stitch screens
36 PostgreSQL tables
32 Business Rules
RBAC
RLS
Immutable Financial Ledger
Subscription
Trial
Usage & Limits
VietQR
Admin Billing

npm run build = PASS
TypeScript Strict = PASS

TUY NHIÊN:

KHÔNG mặc định rằng hệ thống đã đủ điều kiện
GO-LIVE thực tế.

Hãy thực hiện một PRODUCTION READINESS AUDIT độc lập.

============================================================
1. DO NOT MODIFY FIRST
============================================================

KHÔNG sửa code ngay.

KHÔNG tự động kết luận PASS.

Trước tiên:

DISCOVER
→ AUDIT
→ TEST
→ REPORT
→ FIX
→ RETEST

============================================================
2. APPLICATION AUDIT
============================================================

Kiểm tra:

Authentication
Authorization
Session
Logout
Password reset
Email verification
Tenant isolation
Family switching
RBAC
Route guards

============================================================
3. MULTI-TENANT SECURITY
============================================================

Tạo test:

Family A
User A

Family B
User B

Xác minh:

User A KHÔNG thể:

SELECT dữ liệu Family B
UPDATE Family B
DELETE Family B
INSERT vào Family B
READ Storage Family B

Test trực tiếp qua:

Supabase client
REST
RPC
Storage

RLS phải là lớp bảo vệ thực sự.

============================================================
4. RLS AUDIT
============================================================

Đọc toàn bộ DATABASE_SCHEMA.sql.

Liệt kê:

TABLE
RLS ENABLED
POLICIES
SELECT
INSERT
UPDATE
DELETE

Tìm:

Missing RLS
Over-permissive policy
family_id bypass
auth.uid() bypass
service-role exposure

============================================================
5. FINANCIAL INTEGRITY AUDIT
============================================================

Kiểm tra:

Assessment
Payment
POSTED
REVERSAL
Expense
Approval
Ledger
Fund Balance

Test:

Concurrent payments

Concurrent expense approval

Duplicate payment

Duplicate VietQR transaction

Double reversal

Unauthorized reversal

Negative balance

Race condition

Transaction rollback

Mọi test phải chứng minh:

ATOMICITY
CONSISTENCY
IMMUTABILITY
AUDITABILITY

============================================================
6. VIETQR PRODUCTION TEST
============================================================

Không chỉ kiểm tra UI.

Kiểm tra end-to-end:

Create Invoice
→ Generate payment reference
→ Generate VietQR
→ Bank Transfer
→ Detect payment
→ Reconcile
→ Verify amount
→ Verify reference
→ Mark payment SUCCESS
→ Mark invoice PAID
→ Activate subscription

Kiểm tra:

Wrong amount
Wrong reference
Duplicate transfer
Partial payment
Overpayment
Late payment
Unknown transfer
Cancelled payment

Không kích hoạt subscription chỉ dựa vào
frontend confirmation.

============================================================
7. SUBSCRIPTION AUDIT
============================================================

Test lifecycle:

TRIAL
ACTIVE
PAST_DUE
CANCELLED
EXPIRED
SUSPENDED
READ_ONLY

Test:

Upgrade
Downgrade
Renew
Cancel
Expire
Reactivate

Đặc biệt:

Không mất dữ liệu khi subscription hết hạn.

============================================================
8. USAGE & QUOTA AUDIT
============================================================

Test:

29/30
30/30
31/30

và:

299/300
300/300
301/300

Kiểm tra cả:

Frontend
API
RPC
Database

Không được bypass quota bằng API trực tiếp.

============================================================
9. BILLING SECURITY
============================================================

Tìm:

price manipulation
plan_id manipulation
amount manipulation
invoice manipulation
payment manipulation
subscription manipulation

Frontend KHÔNG được quyết định:

price
discount
payment status
subscription status

Các giá trị quan trọng phải được xác minh
server/database side.

============================================================
10. STORAGE SECURITY
============================================================

Kiểm tra:

avatars
documents
receipts

Test:

Family A upload

Family B access

Kết quả phải:

DENIED

Kiểm tra:

file type
file size
filename
path traversal
unauthorized download

============================================================
11. API / SERVICE AUDIT
============================================================

Tìm:

direct Supabase calls from components

business logic in UI

duplicated logic

hard-coded IDs

hard-coded prices

hard-coded family_id

hard-coded admin role

mock data

fake payment success

fake subscription

fake usage

Nếu có:

liệt kê file + line.

============================================================
12. SECRET / ENVIRONMENT AUDIT
============================================================

Tìm:

API keys
service_role_key
password
secret
private key
bank credentials

Kiểm tra:

.env
.env.local
Git history
frontend bundle

TUYỆT ĐỐI không để:

SUPABASE_SERVICE_ROLE_KEY

trong browser bundle.

============================================================
13. DATABASE AUDIT
============================================================

Kiểm tra:

FK
UNIQUE
CHECK
INDEX
NOT NULL
ENUM
CASCADE
TRIGGER
FUNCTION
VIEW

Đặc biệt:

family_id indexes

foreign key indexes

financial transaction indexes

subscription indexes

payment indexes

audit indexes

============================================================
14. BACKUP & RECOVERY
============================================================

Xác định:

Database backup
Point-in-time recovery
Storage backup
Restore procedure

Tạo:

DISASTER_RECOVERY.md

bao gồm:

RPO
RTO
Backup frequency
Restore procedure

Nếu chưa cấu hình:

ghi rõ BLOCKER.

============================================================
15. OBSERVABILITY
============================================================

Kiểm tra:

Error logging
Application monitoring
Database monitoring
Payment monitoring
Failed login monitoring
Failed payment monitoring
RLS violations

Cần alert cho:

Payment failed
Payment mismatch
Subscription expiry
Database error
Repeated authentication failure

============================================================
16. E2E TEST
============================================================

Tạo test scenario:

TEST-001 Register

TEST-002 Login

TEST-003 Create Family

TEST-004 Add Member

TEST-005 Create Relationship

TEST-006 View Tree

TEST-007 Create Memorial

TEST-008 Lunar Conversion

TEST-009 Create Event

TEST-010 Create Assessment

TEST-011 Record Payment

TEST-012 Ledger

TEST-013 Reverse Transaction

TEST-014 Trial

TEST-015 Upgrade

TEST-016 VietQR Payment

TEST-017 Invoice

TEST-018 Quota

TEST-019 Subscription Expiry

TEST-020 Read Only

TEST-021 Admin Billing

TEST-022 Tenant Isolation

============================================================
17. PERFORMANCE
============================================================

Test:

100 members
500 members
1,000 members
5,000 members

Tree rendering.

Calendar.

Finance ledger.

Dashboard.

Search.

Pagination.

Không tải toàn bộ database lên frontend.

============================================================
18. MOBILE
============================================================

Test:

390px

393px

430px

Kiểm tra:

Tree
Calendar
Finance
Payment
Billing
Tables
Dialogs
Forms

============================================================
19. VISUAL REGRESSION
============================================================

So sánh implementation với Google Stitch MCP.

52/52 screens.

Kiểm tra:

Typography
Spacing
Colors
Layout
Responsive
Components
Empty state
Loading
Error
Read-only
Quota
Billing

============================================================
20. CREATE REPORT
============================================================

Tạo:

/docs/PRODUCTION_READINESS_REPORT.md

Cấu trúc:

1. Executive Summary

2. Architecture

3. Security

4. RLS

5. Multi-Tenant

6. Financial Integrity

7. Payment

8. Subscription

9. Trial

10. Usage

11. Storage

12. Performance

13. E2E

14. Visual QA

15. Backup

16. Monitoring

17. Risks

18. Blockers

19. Recommendations

20. Go-Live Decision

============================================================
21. CLASSIFICATION
============================================================

Mỗi issue phải được phân loại:

BLOCKER
CRITICAL
HIGH
MEDIUM
LOW

GO-LIVE chỉ được:

PASS

nếu:

BLOCKER = 0
CRITICAL = 0

============================================================
22. DO NOT CLAIM PRODUCTION READY
============================================================

Không được sử dụng:

"PRODUCTION READY"

chỉ vì:

npm run build = PASS.

Chỉ được kết luận:

PRODUCTION READY

sau khi toàn bộ audit PASS.

============================================================
START AUDIT.
============================================================