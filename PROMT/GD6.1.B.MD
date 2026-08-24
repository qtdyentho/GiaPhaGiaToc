============================================================
APPROVE CHECKPOINT 1
PROCEED TO PHASE B
GOOGLE STITCH UI RECONCILIATION
============================================================

Phase A đã hoàn tất.

Cho phép tiếp tục PHASE B.

Tuy nhiên, trước khi bắt đầu đối chiếu Stitch, PHẢI thực hiện
một bước RECOUNT / RECONCILIATION để xác minh chính xác
số lượng UI.

============================================================
1. VERIFY UI COUNT — BẮT BUỘC
============================================================

Phase A báo cáo:

44 existing UI
36 A
5 B
6 C
0 D/E

Tổng classification hiện tại = 47.

Trong khi mục tiêu ban đầu nói:

44 existing screens/modals
+
6 missing Stitch screens
=
50 UI targets.

Vì vậy KHÔNG được mặc định rằng 47 là đúng.

Hãy kiểm tra lại repository và xác định:

A. Tổng số ROUTE/PAGE thực tế
B. Tổng số MODAL/DIALOG thực tế
C. Tổng số DRAWER/PANEL quan trọng
D. Tổng số UI được Google Stitch thiết kế
E. Tổng số UI hiện có trong code
F. Tổng số UI cần reconciliation

Phân biệt rõ:

PAGE
MODAL
DIALOG
DRAWER
WIDGET
SHARED COMPONENT

Không được đếm shared component như một screen độc lập.

Không được đếm một UI hai lần chỉ vì có nhiều route.

============================================================
2. GOOGLE STITCH MCP CONNECTIVITY
============================================================

Kết nối Google Stitch MCP.

Project:

14208187564231711793

Design System:

Heritage Ledger

Kiểm tra:

[ ] MCP available
[ ] Project accessible
[ ] Design system accessible
[ ] Existing Stitch screens readable
[ ] Screen metadata readable
[ ] Design artifacts readable

Nếu MCP không hoạt động:

DỪNG.

Không tự tạo thiết kế thay thế.

Báo:

[STITCH MCP BLOCKED]

============================================================
3. STITCH SCREEN INVENTORY
============================================================

Đọc toàn bộ các screen hiện có trên Google Stitch.

Tạo bảng:

| ID | Stitch Screen | Type | Route | Related React UI |
|----|---------------|------|-------|------------------|

Phân loại:

MATCH
PARTIAL
MISSING CODE
MISSING STITCH
DUPLICATE
UNKNOWN

Không được tự đoán mapping nếu chưa chắc chắn.

Nếu mapping không chắc chắn:

UNKNOWN

và ghi lý do.

============================================================
4. CODE → STITCH MAPPING
============================================================

Đối chiếu từng UI hiện tại với Stitch.

Mỗi UI phải có:

CODE UI
↓
STITCH SCREEN
↓
MATCH STATUS
↓
RECOMMENDED ACTION

Ví dụ:

GenealogyTreePage
→ Genealogy Dashboard
→ MATCH
→ KEEP

BillingOverviewPage
→ Billing Overview
→ PARTIAL
→ RECONCILE

DataImportWizardModal
→ NO STITCH SCREEN
→ MISSING STITCH
→ DESIGN FIRST

============================================================
5. VISUAL AUDIT
============================================================

Đối với từng màn hình có Stitch:

Đối chiếu:

1. Overall layout
2. Header
3. Navigation
4. Sidebar
5. Content width
6. Grid
7. Card
8. Table
9. Typography
10. Font weight
11. Font size
12. Color
13. Background
14. Border
15. Radius
16. Shadow
17. Button
18. Icon
19. Form
20. Modal
21. Alert
22. Badge
23. Empty state
24. Loading state
25. Error state
26. Responsive layout

============================================================
6. DESIGN TOKEN AUDIT
============================================================

Xác định Design Tokens thực tế của Stitch:

Background
Surface
Primary
Secondary
Text
Muted
Border
Success
Warning
Error

Typography:

Heading
Title
Body
Caption
Label

Spacing:

4
8
12
16
24
32
48
...

Border radius.

Shadow.

Button hierarchy.

Sau đó so sánh với code hiện tại.

KHÔNG tự tạo token mới nếu Heritage Ledger
đã có token tương ứng.

============================================================
7. RESPONSIVE AUDIT
============================================================

Đối với các Stitch screens:

Kiểm tra thiết kế ở:

Desktop
1440px
1280px

Tablet
1024px
768px

Mobile
430px
390px

Ghi nhận:

PASS
PARTIAL
FAIL
NOT_DEFINED

Nếu Stitch không có mobile design:

KHÔNG tự thiết kế ngay.

Đánh dấu:

STITCH_RESPONSIVE_GAP

============================================================
8. BUSINESS LOGIC SAFETY
============================================================

Trong Phase B:

CHỈ READ.

KHÔNG sửa code.

KHÔNG sửa UI.

KHÔNG sửa database.

KHÔNG sửa services.

KHÔNG sửa tests.

Phase B là READ-ONLY AUDIT.

============================================================
9. XỬ LÝ 6 MÀN HÌNH CHƯA CÓ STITCH
============================================================

Xác nhận lại 6 màn hình:

1. DataImportWizardModal
2. BulkAssessmentModal
3. ExpenseApprovalModal
4. ReversalModal
5. ExportTreeModal
6. InviteRegisterPage

Kiểm tra từng màn hình:

Business Logic:
PASS/FAIL

Component:
PASS/FAIL

Service:
PASS/FAIL

Type:
PASS/FAIL

Route:
PASS/FAIL

Stitch:
FOUND / MISSING

Nếu MISSING:

KHÔNG code.

Chuyển sang Phase C/D.

============================================================
10. CLASSIFICATION SAU PHASE B
============================================================

Tạo classification mới:

A:
Stitch + Code + Visual Match

B:
Stitch + Code + Visual Mismatch

C:
Code Exists + Stitch Missing

D:
Stitch Exists + Code Missing

E:
Duplicate / Ambiguous

F:
Business Logic Conflict

============================================================
11. OUTPUT DOCUMENT
============================================================

Cập nhật:

docs/UI_RECONCILIATION_REPORT.md

Thêm section:

PHASE B — GOOGLE STITCH RECONCILIATION

Bao gồm:

1. Verified UI Count
2. Stitch Screen Count
3. Code Screen Count
4. Exact Mapping
5. Match
6. Partial
7. Missing Stitch
8. Missing Code
9. Duplicate
10. Responsive gaps
11. Design token gaps
12. Business Logic conflicts

============================================================
12. QUAN TRỌNG — KHÔNG SỬA CODE
============================================================

Phase B tuyệt đối READ-ONLY.

KHÔNG:

- sửa JSX
- sửa TSX
- sửa CSS
- sửa Tailwind
- sửa component
- sửa route
- sửa service
- sửa database
- sửa test

Chỉ tạo/cập nhật:

docs/UI_RECONCILIATION_REPORT.md

và các file audit nếu cần.

============================================================
13. CHECKPOINT 2 OUTPUT
============================================================

Khi hoàn tất, trả về chính xác:

============================================================
PHASE B — STITCH RECONCILIATION
============================================================

Repository UI Count:
XX

Pages:
XX

Modals:
XX

Drawers:
XX

Stitch Screens:
XX

Exact Code ↔ Stitch Matches:
XX

Partial Matches:
XX

Missing Stitch:
XX

Missing Code:
XX

Duplicate/Ambiguous:
XX

Business Logic Conflicts:
XX

Responsive Gaps:
XX

Design Token Gaps:
XX

Database Changes:
0

Business Logic Changes:
0

Code Mutations:
0

============================================================

PHASE B STATUS:
PASS / BLOCKED

NEXT:

Nếu PASS:

→ PHASE C — DETAILED SPECIFICATION
→ PHASE D — STITCH-FIRST DESIGN

Nếu BLOCKED:

→ STOP
→ HUMAN REVIEW REQUIRED

============================================================