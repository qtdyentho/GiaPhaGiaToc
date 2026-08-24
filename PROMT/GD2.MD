============================================================
GIA PHẢ GIA TỘC — GIAI ĐOẠN 2
FINANCIAL CORE + VIETQR + BẢNG VÀNG CÔNG ĐỨC
============================================================

MỤC TIÊU

Tiếp tục phát triển trực tiếp trên codebase hiện tại.

KHÔNG xây dựng lại dự án.
KHÔNG phá vỡ các module đã hoàn thành.
KHÔNG thay đổi các Business Rules hiện hữu nếu chưa có đánh giá tác động.

Các module hiện tại phải tiếp tục hoạt động bình thường:

AUTH
TENANT
FAMILY
MEMBERS
GENEALOGY
CALENDAR
MEMORIALS
EVENTS
RBAC
AUDIT
SUBSCRIPTION
BILLING

Mục tiêu Giai đoạn 2:

1. Xây dựng Financial Core hoàn chỉnh.
2. Quản lý nhiều quỹ của từng gia tộc.
3. Quản lý danh mục thu/chi.
4. Thiết lập các khoản thu theo thành viên.
5. Thu tiền và đối soát.
6. Quản lý chi phí và quy trình duyệt chi.
7. Xây dựng Sổ quỹ bất biến.
8. Hỗ trợ đóng góp/tài trợ/công đức.
9. Xây dựng Bảng Vàng Công Đức.
10. Tích hợp VietQR theo kiến trúc server-side verification.
11. Đảm bảo mọi giao dịch tài chính có Audit Trail.
12. Không cho phép Client tự ý xác nhận thanh toán.
13. Không cho phép DELETE giao dịch tài chính POSTED.
14. Không làm suy yếu RLS Multi-Tenant.

============================================================
PHẦN 1 — KHẢO SÁT CODEBASE TRƯỚC KHI CODE
============================================================

Trước khi sửa code:

1. Đọc:

MASTER_SPEC.md
MASTER_PROMPT.md
IMPLEMENTATION_PLAN.md
DATABASE_SCHEMA.sql
BUSINESS_RULES.md
SCREEN_MAP.md
DESIGN_IMPLEMENTATION_MAP.md
DESIGN_GAPS.md

Đọc toàn bộ:

/docs/
/src/
/supabase/
/tests/

Đặc biệt kiểm tra:

- financial_transactions
- funds
- income_categories
- expense_categories
- income_assessments
- expense_records
- contributions
- sponsorships
- invoices
- payments
- subscriptions
- audit_logs

Không tạo bảng trùng nếu bảng đã tồn tại.

Nếu schema hiện tại chưa đáp ứng nghiệp vụ thì:
1. lập migration
2. ghi rõ lý do
3. không sửa trực tiếp schema production.

============================================================
PHẦN 2 — FINANCIAL CORE
============================================================

Xây dựng kiến trúc:

UI
 ↓
Service Layer
 ↓
Supabase RPC
 ↓
PostgreSQL Transaction
 ↓
Ledger
 ↓
Audit Log

Tuyệt đối không:

Client
 ↓
INSERT financial_transactions

Mọi nghiệp vụ tài chính quan trọng phải đi qua RPC được bảo vệ.

------------------------------------------------------------
2.1 QUẢN LÝ QUỸ
------------------------------------------------------------

Mỗi gia tộc có thể có nhiều quỹ.

Ví dụ:

- Quỹ gia tộc
- Quỹ khuyến học
- Quỹ từ thiện
- Quỹ xây dựng từ đường
- Quỹ sự kiện

Thông tin:

fund_id
family_id
name
description
opening_balance
current_balance
status
created_at
updated_at

Không cho phép một user truy cập quỹ của family khác.

------------------------------------------------------------
2.2 DANH MỤC THU
------------------------------------------------------------

Cho phép Admin tạo:

- Thu quỹ thường niên
- Đóng góp xây dựng
- Công đức
- Tài trợ
- Thu sự kiện
- Thu khác

Có:

name
code
description
default_amount
active

------------------------------------------------------------
2.3 DANH MỤC CHI
------------------------------------------------------------

Ví dụ:

- Giỗ tổ
- Tu sửa từ đường
- Điện nước
- Hương hoa
- Hiếu hỷ
- Sự kiện
- Khuyến học
- Từ thiện
- Chi khác

Có:

name
code
description
active

============================================================
PHẦN 3 — ASSESSMENT / THU PHÍ THÀNH VIÊN
============================================================

Tách tuyệt đối:

ASSESSMENT ≠ PAYMENT

Ví dụ:

Năm 2026
Thu quỹ gia tộc:
500.000đ/người

Hệ thống tạo:

Member A → 500.000
Member B → 500.000
Member C → 500.000

Nhưng:

ASSESSMENT
KHÔNG làm tăng số dư quỹ.

Chỉ khi thực tế thu tiền:

PAYMENT → POSTED

mới ghi vào Ledger.

------------------------------------------------------------
3.1 BULK ASSESSMENT
------------------------------------------------------------

Cho phép:

Chọn tất cả thành viên
Chọn Chi
Chọn Đời
Chọn Nhánh
Chọn nhóm

Sau đó:

Gán mức thu nhanh.

Ví dụ:

Đời 1 → 2.000.000
Đời 2 → 1.000.000
Đời 3 → 500.000
Đời 4 → 300.000

Cho phép override từng thành viên.

Phải có Preview trước Commit.

============================================================
PHẦN 4 — THU TIỀN
============================================================

Giao diện:

/app/finance/income

Cho phép:

- Tìm thành viên
- Chọn khoản phải thu
- Nhập số tiền
- Chọn quỹ
- Chọn phương thức thanh toán
- Nhập ghi chú
- Upload chứng từ

Payment methods:

CASH
BANK_TRANSFER
VIETQR
OTHER

Sau khi xác nhận:

record_income_payment()

RPC phải thực hiện atomic:

BEGIN

validate family_id
validate assessment
validate amount
create financial_transaction
create payment
update assessment
update fund balance
create audit log

COMMIT

Nếu bất kỳ bước nào lỗi:

ROLLBACK toàn bộ.

============================================================
PHẦN 5 — CHI TIỀN
============================================================

Giao diện:

/app/finance/expenses

Quy trình:

DRAFT
 ↓
SUBMITTED
 ↓
PENDING_APPROVAL
 ↓
APPROVED
 ↓
PAID
 ↓
POSTED

Người lập phiếu không được tự duyệt nếu role không cho phép.

Kiểm tra:

- Quỹ có đủ tiền?
- Danh mục chi hợp lệ?
- Số tiền?
- Người nhận?
- Nội dung?
- Chứng từ?

Nếu không đủ tiền:

REJECT

Không cho phép âm quỹ nếu Business Rules không cho phép.

============================================================
PHẦN 6 — IMMUTABLE LEDGER
============================================================

Đây là thành phần QUAN TRỌNG NHẤT.

Giao dịch:

POSTED

không được:

DELETE
UPDATE amount
UPDATE fund
UPDATE transaction_date

Nếu sai:

REVERSAL

Ví dụ:

Giao dịch:
+5.000.000

Sai.

Tạo:

REVERSAL
-5.000.000

kèm:

reversal_of_transaction_id
reason
created_by
created_at

Audit đầy đủ.

============================================================
PHẦN 7 — SỔ QUỸ
============================================================

Route:

/app/finance/ledger

Hiển thị:

Ngày
Mã giao dịch
Nội dung
Thu
Chi
Số dư
Người thực hiện
Trạng thái

Có filter:

- Khoảng thời gian
- Quỹ
- Danh mục
- Thành viên
- Phương thức
- Trạng thái

Có:

Export Excel
Export CSV
Print A4

Số dư phải được tính từ Ledger.

Không tin số dư do Client truyền lên.

============================================================
PHẦN 8 — ĐÓNG GÓP / TÀI TRỢ / CÔNG ĐỨC
============================================================

Xây dựng module:

/app/finance/contributions

Phân biệt:

CONTRIBUTION
SPONSORSHIP
MERIT_DONATION

Cho phép:

- Thành viên
- Người ngoài gia tộc
- Doanh nghiệp
- Nhà tài trợ ẩn danh

Thông tin:

Tên
Đơn vị
Số tiền
Mục đích
Sự kiện
Quỹ nhận
Ngày đóng góp
Phương thức
Ghi chú

Không được tự động đưa vào Ledger nếu chưa xác thực thanh toán.

============================================================
PHẦN 9 — BẢNG VÀNG CÔNG ĐỨC
============================================================

Route:

/app/finance/honor-roll

Thiết kế trang trang trọng theo Heritage Ledger.

Hiển thị:

🏆 BẢNG VÀNG CÔNG ĐỨC

STT
Người/Đơn vị
Nội dung công đức
Số tiền
Năm
Mục đích

Cho phép:

- Hiển thị tên
- Ẩn danh
- Hiển thị doanh nghiệp
- Lọc theo năm
- Lọc theo sự kiện
- Lọc theo mục đích

Có mức vinh danh:

Đồng
Bạc
Vàng
Kim cương

Nhưng KHÔNG được dùng mức vinh danh để thay đổi giá trị giao dịch tài chính.

============================================================
PHẦN 10 — VIETQR
============================================================

Route:

/app/billing/checkout
/app/finance/qr

VietQR chỉ là phương tiện tạo yêu cầu thanh toán.

KHÔNG coi:

"Người dùng đã chuyển khoản"

là thanh toán thành công.

Flow:

CREATE PAYMENT INTENT
        ↓
GENERATE VIETQR
        ↓
CUSTOMER TRANSFER
        ↓
BANK
        ↓
PAYMENT PROVIDER
        ↓
WEBHOOK
        ↓
VERIFY SIGNATURE
        ↓
VERIFY AMOUNT
        ↓
VERIFY REFERENCE
        ↓
IDEMPOTENCY CHECK
        ↓
ATOMIC RPC
        ↓
PAYMENT SUCCESS
        ↓
LEDGER POSTED

Không có webhook hợp lệ:

KHÔNG kích hoạt payment.

============================================================
PHẦN 11 — IDEMPOTENCY
============================================================

Mỗi webhook phải có:

provider_transaction_id
invoice_id
reference_code
amount
signature
received_at

Unique constraint:

provider_transaction_id

Webhook gửi lại:

ALREADY_PROCESSED

Không cộng tiền lần 2.

============================================================
PHẦN 12 — FINANCIAL AUDIT
============================================================

Mọi thao tác:

CREATE
APPROVE
REJECT
POST
REVERSE
REFUND

phải tạo Audit Log.

Lưu:

actor_id
family_id
action
entity_type
entity_id
before_data
after_data
ip
user_agent
created_at

Audit Log không cho user thông thường sửa/xóa.

============================================================
PHẦN 13 — DASHBOARD
============================================================

Finance Dashboard:

/app/finance

Hiển thị:

Tổng số dư
Tổng thu tháng
Tổng chi tháng
Thu chưa hoàn thành
Chi chờ duyệt
Đóng góp
Tài trợ
Công đức

Biểu đồ:

Thu/Chi theo tháng
Số dư theo quỹ
Cơ cấu khoản thu
Cơ cấu khoản chi

============================================================
PHẦN 14 — BÁO CÁO
============================================================

Tạo:

FinancialReportService

Báo cáo:

1. Báo cáo thu
2. Báo cáo chi
3. Sổ quỹ
4. Báo cáo tồn quỹ
5. Báo cáo đóng góp
6. Báo cáo công đức
7. Báo cáo theo sự kiện
8. Báo cáo theo thành viên
9. Báo cáo theo năm

Export:

PDF
Excel
CSV

============================================================
PHẦN 15 — RLS
============================================================

Mọi bảng tài chính phải có:

family_id

RLS:

user
 ↓
family_memberships
 ↓
family_id
 ↓
financial data

Test:

Alpha → Beta

MUST RETURN:

0 ROWS

Không chấp nhận chỉ kiểm tra ở frontend.

============================================================
PHẦN 16 — RBAC
============================================================

Kiểm tra các role hiện tại.

Tối thiểu:

OWNER
TRUONG_HO
QUAN_TRI_VIEN
THU_QUY
KIEM_SOAT
THANH_VIEN
VIEWER

Ví dụ:

THU_QUY:

CREATE PAYMENT
POST INCOME
VIEW LEDGER

Không:

APPROVE OWN EXPENSE

KIEM_SOAT:

APPROVE EXPENSE

OWNER:

FULL CONTROL

============================================================
PHẦN 17 — TESTING
============================================================

Bổ sung test:

FIN-001
Create Fund

FIN-002
Create Income Category

FIN-003
Bulk Assessment

FIN-004
Record Payment

FIN-005
Atomic Payment

FIN-006
Insufficient Fund

FIN-007
Expense Approval

FIN-008
Self Approval Denied

FIN-009
Posted Ledger Immutable

FIN-010
Reversal

FIN-011
Contribution

FIN-012
Sponsorship

FIN-013
Honor Roll

FIN-014
VietQR Intent

FIN-015
Invalid Webhook

FIN-016
Wrong Amount

FIN-017
Duplicate Webhook

FIN-018
Atomic Activation

FIN-019
RLS Cross Tenant

FIN-020
Audit Trail

============================================================
PHẦN 18 — DOCUMENTATION
============================================================

Tạo/cập nhật:

docs/FINANCIAL_CORE.md
docs/FINANCE_OPERATIONS.md
docs/VIETQR_PAYMENT_FLOW.md
docs/HONOR_ROLL.md
docs/FINANCIAL_SECURITY.md
docs/FINANCE_TEST_REPORT.md

Cập nhật:

MASTER_SPEC.md
BUSINESS_RULES.md
DATABASE_SCHEMA.sql
IMPLEMENTATION_PLAN.md
SCREEN_MAP.md

============================================================
PHẦN 19 — UI
============================================================

Giữ nguyên:

Heritage Ledger

Primary:
#166534

Navy:
#1E3A5F

Gold:
#C49A3A

Background:
#F7F8F5

Font:

Be Vietnam Pro

Thiết kế phải phù hợp cả:

Desktop
Tablet
Mobile

Ưu tiên:

Người lớn tuổi
Chữ dễ đọc
Nút thao tác lớn
Không dùng thuật ngữ kế toán phức tạp nếu không cần thiết.

============================================================
PHẦN 20 — KHÔNG ĐƯỢC PHÁ VỠ HỆ THỐNG
============================================================

Trước khi hoàn thành:

npm run build

npm test

Kiểm tra:

- Existing 16 tests
- Finance tests
- RLS tests
- Billing tests
- Lunar tests
- Genealogy tests

Không được làm giảm coverage.

Không được làm hỏng:

GenealogyCanvas
AddMemberRelationModal
ExportTreeModal
DataImportWizard
Calendar
Billing
Subscription
RBAC
Audit

============================================================
PHẦN 21 — DEFINITION OF DONE
============================================================

Giai đoạn 2 chỉ được đánh dấu COMPLETE khi:

[ ] Finance Dashboard
[ ] Multi-Fund
[ ] Income Categories
[ ] Expense Categories
[ ] Bulk Assessment
[ ] Payment
[ ] Expense Approval
[ ] Immutable Ledger
[ ] Reversal
[ ] Contribution
[ ] Sponsorship
[ ] Honor Roll
[ ] VietQR Payment Intent
[ ] Webhook Verification
[ ] Idempotency
[ ] Atomic RPC
[ ] Financial Audit
[ ] Reports
[ ] Excel Export
[ ] CSV Export
[ ] PDF/Print
[ ] RLS
[ ] RBAC
[ ] Mobile
[ ] Automated Tests
[ ] Documentation

============================================================
PHẦN 22 — QUY TRÌNH THỰC HIỆN
============================================================

KHÔNG code tất cả cùng lúc.

Thực hiện tuần tự:

PHASE 2.1
Database + RPC

PHASE 2.2
Fund + Categories

PHASE 2.3
Assessment

PHASE 2.4
Income Payment

PHASE 2.5
Expense + Approval

PHASE 2.6
Immutable Ledger + Reversal

PHASE 2.7
Contribution + Sponsorship

PHASE 2.8
Honor Roll

PHASE 2.9
VietQR

PHASE 2.10
Webhook + Atomic Payment

PHASE 2.11
Reports

PHASE 2.12
Mobile + Responsive

PHASE 2.13
Security + RLS

PHASE 2.14
E2E Testing

PHASE 2.15
Production Validation

Sau mỗi phase:

npm run build
npm test

Nếu FAIL:

DỪNG.

Phân tích nguyên nhân.

Sửa.

Chạy lại regression.

Không chuyển phase tiếp theo khi phase hiện tại chưa PASS.

============================================================
FINAL REQUIREMENT
============================================================

Khi hoàn thành, tạo:

docs/PHASE_2_COMPLETION_REPORT.md

Báo cáo phải có:

- Files changed
- Database migrations
- RPC functions
- New routes
- New components
- Business Rules added
- Tests added
- Test results
- Security verification
- RLS verification
- VietQR verification
- Ledger integrity verification
- Build result
- Production readiness

Cuối cùng trả về:

============================================================
PHASE 2 IMPLEMENTATION REPORT
============================================================

Status:
PASS / PARTIAL / BLOCKED

Build:
PASS / FAIL

Tests:
X / Y

RLS:
PASS / FAIL

Ledger:
PASS / FAIL

VietQR:
PASS / FAIL

Atomic Payment:
PASS / FAIL

Audit:
PASS / FAIL

Production Ready:
YES / NO

Known Issues:
...

Next Recommended Phase:
...
============================================================