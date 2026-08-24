============================================================
PHASE 6.X — EXECUTE NOW
STITCH DESIGN COMPLETION & UI RECONCILIATION
HERITAGE LEDGER — GIA PHẢ GIA TỘC
============================================================

STATUS:
APPROVED — EXECUTE

ARCHITECTURE:
CBI-MCP PHASE 7.1 — PLAN-FIRST

DESIGN SOURCE OF TRUTH:
GOOGLE STITCH MCP

DESIGN SYSTEM:
HERITAGE LEDGER

STITCH PROJECT:
14208187564231711793

============================================================
I. MỤC TIÊU
============================================================

Triển khai thực tế Phase 6.X nhằm:

1. Rà soát TOÀN BỘ UI hiện có trong repository.
2. Đối chiếu từng màn hình/component/modal với Google Stitch.
3. Giữ nguyên những màn hình đã đúng thiết kế.
4. Sửa những màn hình có sai lệch so với Stitch.
5. Những màn hình chưa có thiết kế Stitch:
   → PHẢI thiết kế trên Google Stitch trước
   → SAU ĐÓ mới implement React.
6. Bảo toàn tuyệt đối Business Logic và dữ liệu hiện tại.
7. Hoàn tất visual reconciliation toàn hệ thống.

ĐÂY KHÔNG PHẢI LÀ PHASE VIẾT LẠI ỨNG DỤNG.

ĐÂY LÀ PHASE:
AUDIT → STITCH → RECONCILE → IMPLEMENT → VERIFY

============================================================
II. NGUYÊN TẮC BẤT BIẾN
============================================================

TUYỆT ĐỐI KHÔNG:

- reset database
- seed lại database
- truncate tables
- delete dữ liệu test
- tạo tenant test mới thay thế tenant cũ
- thay đổi Supabase schema
- thay đổi migrations hiện tại
- thay đổi RLS
- thay đổi authentication architecture
- thay đổi Business Rules
- thay đổi Financial Ledger
- thay đổi Subscription/Billing Engine
- thay đổi API contracts
- thay đổi service contracts
- sửa test chỉ để làm test PASS

PHẢI GIỮ NGUYÊN:

Family Alpha
Family Beta
Family Gamma

và toàn bộ dữ liệu test hiện tại.

DATABASE = READ/WRITE BÌNH THƯỜNG CHỈ THÔNG QUA LOGIC HIỆN CÓ.

============================================================
III. PHẠM VI ĐƯỢC PHÉP THAY ĐỔI
============================================================

Được phép thay đổi:

src/pages/
src/components/
src/layouts/
src/styles/
src/assets/ui/
UI hooks nếu chỉ phục vụ presentation
docs/

Có thể tạo:

src/components/... mới
src/pages/... mới

NẾU thực sự cần.

Không được tự ý sửa:

supabase/migrations/
RLS policies
financial services
subscription services
authentication services
database contracts
core business services

Nếu phát hiện cần thay đổi một trong các thành phần trên:

DỪNG.

Ghi:

docs/UI_BLOCKERS.md

và đánh dấu:

REQUIRES HUMAN APPROVAL

============================================================
IV. PHASE A — FULL UI INVENTORY
============================================================

BẮT ĐẦU NGAY.

Không code UI mới ở bước này.

Quét toàn bộ repository.

Phân tích:

- routes
- pages
- components
- modals
- drawers
- dialogs
- forms
- tables
- dashboards
- navigation
- responsive layouts

Tạo inventory.

Mỗi UI phải có:

ID
Tên màn hình
Route
React component
Module
Business purpose
Current implementation
Stitch status
Visual status
Responsive status
Risk
Action

Phân loại:

A = Đã có Stitch + UI đúng

B = Đã có Stitch + UI sai

C = Chưa có Stitch + đã có code

D = Có Stitch nhưng chưa có code

E = Thiếu hoàn toàn

Tạo:

docs/UI_RECONCILIATION_REPORT.md

============================================================
V. PHASE B — GOOGLE STITCH AUDIT
============================================================

Kết nối Google Stitch MCP.

Project:

14208187564231711793

Design System:

Heritage Ledger

Đối với từng màn hình có Stitch:

Đọc thiết kế hiện tại.

Đối chiếu với code:

1. Page structure
2. Layout
3. Header
4. Navigation
5. Sidebar
6. Cards
7. Tables
8. Forms
9. Buttons
10. Icons
11. Typography
12. Color tokens
13. Border
14. Radius
15. Shadow
16. Spacing
17. Modal
18. Drawer
19. Empty state
20. Loading state
21. Error state
22. Responsive behavior
23. Mobile layout

KHÔNG được đánh giá bằng cảm tính.

Mỗi màn hình phải có:

STITCH MATCH:
PASS / PARTIAL / FAIL

============================================================
VI. PHASE C — 6 MÀN HÌNH CHƯA CÓ STITCH
============================================================

Bắt buộc xử lý 6 màn hình:

1. DataImportWizardModal
2. BulkAssessmentModal
3. ExpenseApprovalModal
4. ReversalModal
5. ExportTreeModal
6. InviteRegisterPage

ĐÂY LÀ STITCH-FIRST.

KHÔNG implement trước.

--------------------------------------------
1. DataImportWizardModal
--------------------------------------------

Thiết kế Wizard 5 bước:

STEP 1:
Upload Excel / CSV / GEDCOM

STEP 2:
Auto Mapping

STEP 3:
Validation

STEP 4:
Visual Preview

STEP 5:
Commit + Undo

Phải thể hiện rõ:

VALID
WARNING
BLOCKING ERROR

Commit:

DISABLED nếu còn Blocking Error.

--------------------------------------------
2. BulkAssessmentModal
--------------------------------------------

Thiết kế:

- Chọn quỹ
- Chọn phạm vi
- Toàn gia tộc
- Chi phái
- Thế hệ
- Hộ gia đình
- Định mức
- Preview
- Tổng số người
- Tổng số tiền dự kiến
- Phát hành đợt thu

Hiển thị rõ:

ASSESSMENT ≠ PAYMENT

Không được khiến người dùng hiểu rằng lập đợt thu đã làm tăng số dư quỹ.

--------------------------------------------
3. ExpenseApprovalModal
--------------------------------------------

Thiết kế:

- Khoản chi
- Quỹ
- Người đề xuất
- Số tiền
- Số dư hiện tại
- Số dư sau chi
- Chứng từ
- Audit reason
- Approval history
- Multi-signature nếu logic hiện tại hỗ trợ

CTA:

Duyệt Chi Quỹ
Từ Chối

--------------------------------------------
4. ReversalModal
--------------------------------------------

Phải có cảnh báo nổi bật:

"GIAO DỊCH POSTED KHÔNG ĐƯỢC XÓA."

Hiển thị:

Giao dịch gốc
↓
Bút toán đảo
↓
Số dư trước
↓
Số dư sau

Bắt buộc:

audit_reason

CTA:

Xác nhận đảo bút toán

--------------------------------------------
5. ExportTreeModal
--------------------------------------------

Thiết kế lựa chọn:

- PDF A0
- PDF A1
- A3
- A4
- Sách gia phả
- Excel nhân khẩu
- JSON Backup

Cho phép:

- chọn phạm vi đời
- chọn chi phái
- thông tin mộ phần
- thông tin ngày giỗ
- ảnh đại diện nếu logic hiện tại hỗ trợ

--------------------------------------------
6. InviteRegisterPage
--------------------------------------------

Route:

/register/invite?token=...

Thiết kế:

Token validation
↓
Thông tin nhân khẩu được mời
↓
Xác nhận danh tính
↓
Tạo mật khẩu
↓
Kích hoạt tài khoản

Phải có:

Loading
Invalid Token
Expired Token
Already Used
Success
Error

============================================================
VII. PHASE D — STITCH-FIRST IMPLEMENTATION
============================================================

Với từng màn hình trong 6 màn hình:

BƯỚC 1
Tạo design specification.

BƯỚC 2
Gửi specification vào Google Stitch MCP.

BƯỚC 3
Tạo Stitch screen.

BƯỚC 4
Đọc lại Stitch artifact.

BƯỚC 5
Xác nhận:

- Layout
- hierarchy
- components
- states
- responsive

BƯỚC 6
Mapping Stitch → React.

BƯỚC 7
Implement.

KHÔNG ĐƯỢC BỎ QUA BƯỚC 3.

============================================================
VIII. PHASE E — RECONCILE CÁC MÀN HÌNH ĐÃ CODE
============================================================

Không chỉ xử lý 6 màn hình mới.

Đối với TOÀN BỘ màn hình đã tồn tại:

Nếu:

Stitch = Code

→ KEEP.

Nếu:

Stitch ≠ Code

→ RECONCILE.

Nếu sai nhỏ:

→ sửa UI.

Nếu sai layout:

→ sửa structure.

Nếu thiếu component:

→ bổ sung.

Nếu Stitch không phản ánh Business Logic hiện tại:

→ KHÔNG sửa Business Logic.

→ Ghi UI_BLOCKERS.md.

============================================================
IX. HERITAGE LEDGER DESIGN SYSTEM
============================================================

Mọi UI mới hoặc UI được chỉnh sửa phải thống nhất:

- Typography
- Color tokens
- Spacing scale
- Border radius
- Shadows
- Button hierarchy
- Form controls
- Table styles
- Modal styles
- Cards
- Status badges
- Alert styles
- Empty states
- Loading states
- Error states

Không tạo Design System thứ hai.

Không hard-code style tùy tiện nếu token tương ứng đã tồn tại.

============================================================
X. RESPONSIVE
============================================================

Kiểm tra tối thiểu:

Desktop:
1440px
1280px

Tablet:
1024px
768px

Mobile:
430px
390px

Đặc biệt kiểm tra:

- Genealogy Tree
- Financial tables
- Calendar
- Modals
- Import Wizard
- Expense Approval
- Export
- Invite Registration

Không cho phép:

horizontal overflow
text clipping
button clipping
modal vượt viewport
table phá layout

============================================================
XI. VISUAL RECONCILIATION
============================================================

Sau implement:

Mở từng màn hình.

So sánh:

STITCH
VS
ACTUAL APPLICATION

Phân loại:

P0:
Không sử dụng được

P1:
Sai layout / hierarchy

P2:
Sai visual

P3:
Cosmetic

Sửa:

P0 → P1 → P2

P3 có thể ghi backlog.

Tạo:

docs/UI_VISUAL_RECONCILIATION_REPORT.md

============================================================
XII. AUTOMATED REGRESSION
============================================================

Chạy:

npm test

Sau đó:

npm run build

Nếu project có:

npm run typecheck
npm run lint

thì chạy đầy đủ.

Mục tiêu:

172/172 PASS
0 TypeScript error
0 Build error
0 Lint blocker

KHÔNG sửa test để đạt PASS.

============================================================
XIII. REAL TEST DATA
============================================================

Bắt buộc test trực tiếp:

Family Alpha
Family Beta
Family Gamma

Không reset dữ liệu.

Kiểm tra:

LOGIN
↓
DASHBOARD
↓
GENEALOGY
↓
MEMORIAL
↓
CALENDAR
↓
EVENT
↓
FUND
↓
LEDGER
↓
CONTRIBUTION
↓
HONOR ROLL
↓
BILLING
↓
SUPPORT

và 6 UI mới:

IMPORT
ASSESSMENT
EXPENSE APPROVAL
REVERSAL
EXPORT
INVITE

============================================================
XIV. CONSOLE / RUNTIME QUALITY
============================================================

Không được có:

Unhandled Promise Rejection
React error
React warning nghiêm trọng
Failed network request ngoài dự kiến
Missing key
Hydration error
Broken route
Broken modal
Broken responsive layout

============================================================
XV. DOCUMENTATION
============================================================

Tạo/cập nhật:

docs/UI_RECONCILIATION_REPORT.md

docs/STITCH_DESIGN_SPEC.md

docs/STITCH_IMPLEMENTATION_MAP.md

docs/UI_VISUAL_RECONCILIATION_REPORT.md

docs/UI_BLOCKERS.md

docs/PHASE_6_UI_COMPLETION_REPORT.md

============================================================
XVI. FINAL QUALITY GATE
============================================================

Chỉ được đánh dấu:

PHASE 6.X = COMPLETE

khi:

[ ] Full UI Inventory PASS
[ ] Stitch Audit PASS
[ ] 6 missing screens designed on Stitch
[ ] 6 screens implemented
[ ] Existing screens reconciled
[ ] Design System unified
[ ] Responsive PASS
[ ] Visual Reconciliation PASS
[ ] Automated Tests PASS
[ ] Build PASS
[ ] Typecheck PASS
[ ] Lint PASS
[ ] No RLS regression
[ ] No Business Logic regression
[ ] No database modification
[ ] No data loss
[ ] Alpha data intact
[ ] Beta data intact
[ ] Gamma data intact
[ ] Documentation complete

============================================================
XVII. GIT SAFETY
============================================================

Trước khi mutation:

Kiểm tra:

git status
git branch
git log -5

Tạo checkpoint commit trước Phase 6.X.

Sau mỗi milestone lớn:

COMMIT.

Không force push.

Không rewrite history.

============================================================
XVIII. QUY TẮC DỪNG KHẨN CẤP
============================================================

DỪNG NGAY nếu phát hiện:

1. Cần sửa database.
2. Cần sửa RLS.
3. Cần sửa Business Logic.
4. Cần sửa Financial Ledger.
5. Cần sửa Subscription.
6. Cần thay đổi Authentication.
7. Có nguy cơ mất dữ liệu.
8. Stitch MCP không hoạt động.
9. Stitch artifact mâu thuẫn nghiệp vụ.
10. Regression test fail nghiêm trọng.

Báo:

============================================================
[BLOCKED — HUMAN DECISION REQUIRED]
============================================================

Không tự ý vượt qua blocker.

============================================================
XIX. BẮT ĐẦU THỰC THI
============================================================

KHÔNG bắt đầu bằng việc sửa UI.

BẮT ĐẦU BẰNG:

1. git status
2. git branch
3. git log -5
4. Repository inventory
5. UI inventory
6. Stitch MCP connectivity check
7. Stitch project verification

Sau đó thực hiện:

PHASE A → PHASE B → PHASE C → PHASE D → PHASE E
→ PHASE F → PHASE G → PHASE H → PHASE I → PHASE J

KHÔNG ĐƯỢC NHẢY PHASE.

============================================================
FIRST DELIVERABLE
============================================================

Sau bước đầu tiên, KHÔNG cần báo cáo dài.

Hãy trả về:

PHASE 6.X INITIAL AUDIT

Repository:
PASS/FAIL

Git Safety:
PASS/FAIL

Stitch MCP:
PASS/FAIL

Stitch Project:
PASS/FAIL

UI Screens Found:
<number>

Stitch Screens Found:
<number>

Missing Stitch Screens:
<number>

Screens Requiring Reconciliation:
<number>

Business Logic Conflicts:
<number>

Database Changes:
0

RLS Changes:
0

Data Reset:
0

Next:
PHASE A COMPLETE → PHASE B
============================================================