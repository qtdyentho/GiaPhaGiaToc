============================================================
PHASE 6.X — STITCH DESIGN COMPLETION & UI RECONCILIATION
============================================================

MỤC TIÊU

Dự án Gia Phả Gia Tộc — Heritage Ledger đã có rất nhiều màn hình,
component, business logic, service, database và nghiệp vụ đã được
code hoàn chỉnh.

KHÔNG được hiểu nhiệm vụ này là "xây lại giao diện từ đầu".

Mục tiêu là:

1. RÀ SOÁT toàn bộ UI hiện tại.
2. ĐỐI CHIẾU với hệ thống thiết kế Google Stitch đã có.
3. Xác định chính xác màn hình nào:
   - Đã có thiết kế Stitch + đã có code.
   - Đã có code nhưng chưa có thiết kế Stitch.
   - Có thiết kế Stitch nhưng code hiện tại lệch thiết kế.
   - Chưa có cả thiết kế và code.
4. Với các màn hình chưa có thiết kế Stitch:
   → PHẢI thiết kế trên Google Stitch trước.
5. Sau khi có thiết kế Stitch:
   → lấy thiết kế Stitch làm UI SOURCE OF TRUTH.
6. Chỉ sau đó mới điều chỉnh code.
7. TUYỆT ĐỐI KHÔNG phá Business Logic, API, Database, RLS,
   Services, Type Contracts hoặc các test đã PASS.

============================================================
NGUYÊN TẮC BẤT BIẾN
============================================================

DATA / BUSINESS LOGIC > UI

UI DESIGN SOURCE OF TRUTH = GOOGLE STITCH

Không được tự ý:

- thay đổi database schema
- thay đổi RLS
- thay đổi business rules
- thay đổi service contracts
- thay đổi API contracts
- thay đổi financial ledger logic
- thay đổi subscription logic
- thay đổi authentication/authorization
- thay đổi lunar calculation engine
- xóa dữ liệu test
- thay đổi dữ liệu test hiện tại
- thay đổi route nếu không cần thiết
- viết lại module nghiệp vụ chỉ vì UI cần thay đổi

Nếu cần thay đổi logic để hỗ trợ UI:
→ DỪNG
→ báo cáo trước
→ không tự ý implementation.

============================================================
PHASE A — FULL UI INVENTORY
============================================================

Đầu tiên KHÔNG chỉnh sửa code.

Hãy quét toàn bộ repository:

src/pages/
src/components/
src/layouts/
src/features/
src/services/
src/routes/
src/lib/

Đồng thời đọc:

- implementation_plan.md
- các tài liệu Phase 1 → Phase 5
- các tài liệu UI/UX hiện có
- các design reference hiện tại
- các route
- các component
- các modal
- các dashboard
- các form
- các empty state
- loading state
- error state
- mobile/responsive state

Tạo:

docs/UI_RECONCILIATION_REPORT.md

Báo cáo phải lập danh sách TOÀN BỘ màn hình/component giao diện.

Phân loại:

A. STITCH_DESIGN_EXISTS + CODE_EXISTS
B. STITCH_DESIGN_EXISTS + CODE_DIFFERENT
C. CODE_EXISTS + STITCH_DESIGN_MISSING
D. STITCH_DESIGN_MISSING + CODE_MISSING
E. DEPRECATED / UNUSED
F. DUPLICATED UI

Không được bỏ sót modal, drawer, wizard hoặc màn hình phụ.

============================================================
PHASE B — KIỂM TRA GOOGLE STITCH
============================================================

Sử dụng Google Stitch MCP hiện có trong workspace.

KHÔNG tự giả định thiết kế.

Đối với từng màn hình:

- tìm thiết kế Stitch tương ứng
- xác định screen ID / design ID nếu có
- ghi nhận:
  - layout
  - typography
  - spacing
  - colors
  - buttons
  - cards
  - tables
  - forms
  - navigation
  - responsive behavior
  - modal structure
  - empty/loading/error states

Tạo bảng:

SCREEN
CODE FILE
ROUTE
STITCH DESIGN
MATCH %
ACTION

============================================================
PHASE C — 6 MÀN HÌNH CHƯA CÓ STITCH DESIGN
============================================================

Đặc biệt xử lý 6 màn hình sau:

1. DataImportWizardModal

2. BulkAssessmentModal

3. ExpenseApprovalModal

4. ReversalModal

5. ExportTreeModal

6. InviteRegisterPage

Đây là các màn hình đã có Business Logic / Backend / Type Contract.

KHÔNG code lại nghiệp vụ.

============================================================
PHASE D — THIẾT KẾ TRÊN GOOGLE STITCH TRƯỚC
============================================================

Với từng màn hình trong 6 màn hình trên:

BƯỚC 1:
Đọc code hiện tại để hiểu đầy đủ nghiệp vụ.

BƯỚC 2:
Đọc design system hiện tại của Google Stitch.

BƯỚC 3:
Tạo thiết kế màn hình trên Google Stitch.

BƯỚC 4:
Thiết kế phải sử dụng cùng:

- màu sắc
- typography
- spacing
- border radius
- icon style
- navigation
- card style
- table style
- button hierarchy
- form style

với hệ thống Heritage Ledger hiện tại.

KHÔNG thiết kế một UI độc lập.

============================================================
YÊU CẦU THIẾT KẾ TỪNG MÀN HÌNH
============================================================

1. DataImportWizardModal

Thiết kế wizard 5 bước:

STEP 1
Upload Excel / CSV / GEDCOM

STEP 2
Auto Mapping

STEP 3
Validation

STEP 4
Preview Genealogy Tree

STEP 5
Commit / Undo

Phải có:

- progress indicator
- file information
- mapping table
- validation summary
- error/warning/success states
- preview tree
- commit confirmation
- rollback/undo indication

Không được cho phép Commit khi còn blocking error.

------------------------------------------------------------

2. BulkAssessmentModal

Thiết kế:

- chọn quỹ
- chọn danh mục thu
- phạm vi:
  + toàn gia tộc
  + chi phái
  + thế hệ
  + hộ gia đình
- mức thu
- preview danh sách người phải đóng
- tổng số người
- tổng số tiền dự kiến
- điều chỉnh từng thành viên
- xác nhận phát hành

Phải thể hiện rõ:

ASSESSMENT ≠ PAYMENT

Không được làm người dùng hiểu rằng lập đợt thu đã làm tăng số dư quỹ.

------------------------------------------------------------

3. ExpenseApprovalModal

Thiết kế workflow:

Đề nghị chi
→ Kiểm tra số dư
→ Chứng từ
→ Người duyệt 1
→ Người duyệt 2
→ Phê duyệt
→ Ghi nhận giao dịch

Phải thể hiện:

- số tiền
- nội dung
- danh mục
- quỹ
- số dư khả dụng
- người đề nghị
- chứng từ
- lịch sử phê duyệt
- audit trail
- trạng thái

Đặc biệt khoản chi > 5.000.000đ phải thể hiện rõ cơ chế
đa chữ ký nếu Business Logic hiện tại yêu cầu.

------------------------------------------------------------

4. ReversalModal

Thiết kế trang trọng, cảnh báo rõ:

"Không xóa giao dịch POSTED."

Cho phép:

- xem giao dịch gốc
- số tiền
- ngày giao dịch
- người tạo
- lý do đảo bút toán
- audit_reason
- xác nhận đảo bút toán

Hiển thị:

GIAO DỊCH GỐC
        ↓
BÚT TOÁN ĐẢO
        ↓
SỐ DƯ SAU ĐẢO

Không tạo UI khiến người dùng hiểu rằng giao dịch cũ bị xóa.

------------------------------------------------------------

5. ExportTreeModal

Thiết kế:

EXPORT GIA PHẢ

Các lựa chọn:

A. Phả đồ
- A4
- A3
- A1
- A0

B. Sách Gia Phả

C. Danh sách nhân khẩu

D. Excel / CSV

E. JSON Backup

Có preview trước khi export.

Phải có:

- lựa chọn phạm vi
- toàn tộc / chi / thế hệ
- orientation
- paper size
- include deceased
- include memorial date
- include biography
- include burial information

------------------------------------------------------------

6. InviteRegisterPage

Thiết kế flow:

INVITE LINK
↓
Xác thực Token
↓
Xem thông tin nhân khẩu được mời
↓
Tạo tài khoản
↓
Xác nhận thông tin
↓
Hoàn tất

Phải có các trạng thái:

- valid invitation
- expired invitation
- already used
- invalid token
- registration success
- registration error

Không expose thông tin nhạy cảm trước khi token được xác thực.

============================================================
PHASE E — SAU KHI STITCH THIẾT KẾ XONG
============================================================

KHÔNG được ngay lập tức code.

Trước tiên tạo:

docs/STITCH_DESIGN_SPEC.md

Bao gồm:

SCREEN
STITCH_ID
ROUTE
COMPONENT
DESIGN_STATUS
DESIGN_VERSION
IMPLEMENTATION_STATUS

và mapping:

STITCH COMPONENT
        ↓
REACT COMPONENT
        ↓
EXISTING BUSINESS LOGIC

============================================================
PHASE F — IMPLEMENT UI
============================================================

Chỉ sau khi thiết kế Stitch hoàn tất mới bắt đầu code.

Nguyên tắc:

PRESERVE LOGIC
PRESERVE DATA
PRESERVE API
PRESERVE SERVICES
PRESERVE TYPES
PRESERVE TESTS

Chỉ thay đổi:

- JSX structure
- CSS/Tailwind
- component composition
- spacing
- typography
- visual hierarchy
- responsive behavior
- loading state
- error state
- empty state
- accessibility

Nếu component cũ chứa cả UI + Business Logic:

→ tách UI khỏi logic nếu cần
→ giữ nguyên logic.

============================================================
PHASE G — VISUAL RECONCILIATION
============================================================

Sau khi implementation:

1. Render màn hình thực tế.
2. So sánh với Google Stitch.
3. Kiểm tra:

- layout
- spacing
- typography
- colors
- buttons
- cards
- tables
- modal
- navigation
- responsive
- empty state
- loading state
- error state

Mục tiêu:

STITCH DESIGN
      ≈
IMPLEMENTED UI

Không được tự đánh giá "gần giống".

Phải tạo:

docs/UI_VISUAL_RECONCILIATION_REPORT.md

============================================================
PHASE H — REGRESSION TEST
============================================================

Sau khi chỉnh UI:

npm test
npm run build
npm run typecheck
npm run lint

Đặc biệt phải đảm bảo:

Phase 1 tests: PASS
Phase 2 tests: PASS
Phase 3 tests: PASS
Phase 4 tests: PASS
Phase 5 tests: PASS

Không được giảm test coverage.

============================================================
PHASE I — TEST DỮ LIỆU HIỆN TẠI
============================================================

CỰC KỲ QUAN TRỌNG:

Dữ liệu test hiện tại PHẢI ĐƯỢC GIỮ NGUYÊN.

KHÔNG:

- reset database
- truncate tables
- delete test families
- thay đổi test accounts
- thay đổi test financial data
- thay đổi test genealogy
- seed lại database nếu không cần thiết

Tôi muốn tiếp tục đăng nhập vào hệ thống hiện tại
và tự kiểm thử trực tiếp bằng dữ liệu test đang có.

Nếu migration cần thiết:

→ migration phải backward-compatible
→ không phá dữ liệu hiện tại.

============================================================
PHASE J — KẾT QUẢ CUỐI CÙNG
============================================================

Sau khi hoàn thành phải tạo:

1. docs/UI_RECONCILIATION_REPORT.md
2. docs/STITCH_DESIGN_SPEC.md
3. docs/STITCH_IMPLEMENTATION_MAP.md
4. docs/UI_VISUAL_RECONCILIATION_REPORT.md
5. docs/PHASE_6_UI_COMPLETION_REPORT.md

Báo cáo cuối phải có:

TOTAL SCREENS:
STITCH DESIGNS FOUND:
STITCH DESIGNS CREATED:
UI SCREENS UPDATED:
SCREENS UNCHANGED:
SCREENS REQUIRING REVIEW:

BUILD:
TYPECHECK:
LINT:
TESTS:

DATABASE CHANGED:
RLS CHANGED:
BUSINESS LOGIC CHANGED:

TEST DATA PRESERVED:
YES / NO

============================================================
QUALITY GATE
============================================================

Không được tuyên bố hoàn thành nếu:

[ ] Có màn hình chưa được rà soát
[ ] Có màn hình thiếu Stitch nhưng chưa thiết kế
[ ] Code UI không đối chiếu với Stitch
[ ] Business Logic bị thay đổi ngoài phạm vi
[ ] Database bị thay đổi ngoài phạm vi
[ ] RLS bị thay đổi
[ ] Test dữ liệu hiện tại bị mất
[ ] Regression test fail
[ ] Build fail

FINAL ACCEPTANCE:

Google Stitch = UI Source of Truth
Existing Business Logic = Preserved
Existing Test Data = Preserved
Database Integrity = Preserved
RLS = Preserved
Regression Tests = PASS

============================================================

QUAN TRỌNG NHẤT

ĐỪNG CODE TRƯỚC KHI THIẾT KẾ.

Quy trình bắt buộc:

AUDIT
 ↓
STITCH INVENTORY
 ↓
FIND MISSING DESIGNS
 ↓
DESIGN ON GOOGLE STITCH
 ↓
REVIEW DESIGN
 ↓
IMPLEMENT UI
 ↓
VISUAL RECONCILIATION
 ↓
REGRESSION TEST
 ↓
FINAL REPORT

Nếu Google Stitch MCP không thể tạo/đẩy thiết kế cho một màn hình,
KHÔNG tự ý thay thế bằng thiết kế riêng.

Hãy báo:

STITCH BLOCKED:
<screen>

REASON:
<reason>

và chờ quyết định.

BẮT ĐẦU TỪ PHASE A — FULL UI INVENTORY.
CHƯA ĐƯỢC SỬA CODE Ở BƯỚC ĐẦU TIÊN.
============================================================