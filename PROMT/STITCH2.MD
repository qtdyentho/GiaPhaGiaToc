============================================================
TASK: FULL UI/UX REDESIGN — GOOGLE STITCH AS SOURCE OF TRUTH
============================================================

DỰ ÁN:
Gia Phả Gia Tộc — Heritage Ledger

MỤC TIÊU:
Thiết kế lại TOÀN BỘ giao diện hiện tại của hệ thống theo đúng
thiết kế UI/UX được xây dựng và phê duyệt trên Google Stitch.

QUYẾT ĐỊNH QUAN TRỌNG:

Google Stitch sẽ là:
    SINGLE SOURCE OF TRUTH
    cho toàn bộ UI/UX của ứng dụng.

Không được tiếp tục tự suy diễn giao diện từ code hiện tại.

Không được chỉ "chỉnh CSS".

Không được chỉ sửa một vài màn hình.

Phải thực hiện một cuộc REDESIGN TOÀN DIỆN toàn bộ Frontend.

============================================================
I. NGUYÊN TẮC BẤT BIẾN
============================================================

1. KHÔNG phá vỡ Backend hiện tại.

2. KHÔNG thay đổi Database Schema nếu không thực sự bắt buộc.

3. KHÔNG thay đổi:
   - Supabase schema
   - RLS
   - Authentication
   - Multi-tenant isolation
   - Financial Ledger
   - Subscription logic
   - Quota logic
   - Lunar Calendar Engine
   - Memorial Engine
   - Event Engine
   - Payment/Invoice logic
   - Audit Trail
   - Import/Export logic

4. KHÔNG xóa dữ liệu test hiện tại.

5. KHÔNG reset database.

6. KHÔNG seed lại database nếu không được yêu cầu.

7. Các dữ liệu test hiện tại phải tiếp tục được sử dụng để kiểm tra
   giao diện mới.

8. Không thay đổi logic nghiệp vụ chỉ vì thay đổi UI.

9. Không tạo mock data mới để che giấu lỗi giao diện.

10. Không thay đổi URL/route hiện tại nếu không có lý do bắt buộc.

============================================================
II. VẤN ĐỀ HIỆN TẠI CẦN KHẮC PHỤC
============================================================

Hiện tại Frontend đã được triển khai nhưng:

- Một số màn hình không giống thiết kế Google Stitch.
- Layout chưa thống nhất.
- Spacing không đồng nhất.
- Typography không đồng nhất.
- Component design không đồng nhất.
- Navigation chưa đúng thiết kế.
- Dashboard chưa đúng hierarchy.
- Một số modal/form/table/card chưa đúng thiết kế.
- Mobile/responsive chưa đồng nhất.
- Một số màn hình được AI tự suy diễn thay vì triển khai từ Stitch.

Do đó:

KHÔNG tiếp tục vá giao diện hiện tại từng phần.

Phải thực hiện:

AUDIT CURRENT UI
        ↓
AUDIT GOOGLE STITCH
        ↓
CREATE DESIGN SYSTEM
        ↓
REDESIGN ALL SCREENS
        ↓
IMPLEMENT
        ↓
VISUAL QA
        ↓
FUNCTIONAL QA
        ↓
FINAL ACCEPTANCE

============================================================
III. BƯỚC 1 — KIỂM TRA GOOGLE STITCH MCP
============================================================

TRƯỚC KHI SỬA CODE:

1. Kiểm tra Google Stitch MCP đã kết nối.

2. Kiểm tra các project/design hiện có trên Google Stitch.

3. Liệt kê toàn bộ:
   - Project
   - Screen
   - Design
   - Component
   - Layout
   - Navigation
   - Design tokens nếu có

4. Nếu Stitch đã có thiết kế:

   → lấy toàn bộ thiết kế hiện tại.

5. Nếu Stitch chưa có đầy đủ thiết kế:

   → KHÔNG tự ý hoàn thiện bằng cách đoán.

   → Phải tạo/đẩy thiết kế còn thiếu lên Google Stitch
     dựa trên kiến trúc nghiệp vụ hiện tại.

6. Google Stitch phải trở thành Design Source of Truth.

============================================================
IV. BƯỚC 2 — AUDIT TOÀN BỘ FRONTEND HIỆN TẠI
============================================================

Quét toàn bộ:

src/
components/
pages/
layouts/
routes/
services/
hooks/
styles/
assets/

Lập bảng:

| Screen | Current UI | Stitch UI | Difference | Action |
|-------|------------|-----------|------------|--------|

Phân loại:

A. ĐÚNG
B. GẦN ĐÚNG
C. KHÁC THIẾT KẾ
D. CHƯA CÓ TRÊN STITCH
E. CẦN THIẾT KẾ LẠI

Không sửa code ngay.

Hoàn thành audit trước.

============================================================
V. BƯỚC 3 — XÂY DỰNG DESIGN SYSTEM
============================================================

Trước khi redesign từng màn hình, xác định Design System
theo Google Stitch.

Bao gồm:

1. Color System

- Primary
- Secondary
- Background
- Surface
- Card
- Border
- Text Primary
- Text Secondary
- Muted
- Success
- Warning
- Error
- Info

2. Typography

- Font family
- Heading 1
- Heading 2
- Heading 3
- Body
- Caption
- Label
- Button
- Table

3. Spacing

Chuẩn hóa toàn bộ:

4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48...

4. Border Radius

5. Shadow

6. Iconography

7. Button system

8. Input system

9. Select

10. Checkbox

11. Radio

12. Tabs

13. Badge

14. Alert

15. Toast

16. Modal

17. Drawer

18. Table

19. Card

20. Empty State

21. Loading State

22. Error State

23. Skeleton

24. Pagination

25. Breadcrumb

Tất cả phải bám Google Stitch.

============================================================
VI. BƯỚC 4 — THIẾT KẾ LẠI TOÀN BỘ HỆ THỐNG
============================================================

Không giới hạn redesign ở Dashboard.

Phải rà soát toàn bộ các nhóm màn hình.

------------------------------------------------------------
A. AUTHENTICATION
------------------------------------------------------------

- Login
- Register
- Invite
- Trial
- Forgot Password
- Reset Password
- Read-only / Expired Subscription

------------------------------------------------------------
B. FAMILY / GENEALOGY
------------------------------------------------------------

- Family Dashboard
- Members List
- Member Detail
- Add Member
- Edit Member
- Relationship
- Genealogy Tree
- Generation View
- Branch View
- Import Wizard
- Export
- Burial / Biography information

------------------------------------------------------------
C. CALENDAR / MEMORIAL
------------------------------------------------------------

- Family Calendar
- Lunar/Solar Calendar
- Memorial List
- Memorial Detail
- Add Memorial
- Edit Memorial
- Event List
- Event Detail
- Create Event
- Reminder Settings

------------------------------------------------------------
D. FINANCIAL
------------------------------------------------------------

- Financial Dashboard
- Fund List
- Fund Detail
- Income
- Expense
- Expense Approval
- Assessment
- Contributions
- Honor Roll
- Fund Ledger
- Reversal
- Financial Reports

------------------------------------------------------------
E. BILLING
------------------------------------------------------------

ĐẶC BIỆT:

Không xây dựng UI "Bank API connected payment".

Mô hình thực tế:

FAMILY USER
    ↓
Chọn gói
    ↓
Tạo yêu cầu thanh toán
    ↓
Hiển thị thông tin chuyển khoản / VietQR
    ↓
User chuyển khoản ngoài hệ thống
    ↓
Trạng thái:
WAITING_CONFIRMATION
    ↓
SUPER ADMIN
nhận thông báo
    ↓
Kiểm tra giao dịch thực tế
    ↓
ADMIN XÁC NHẬN
    ↓
SUBSCRIPTION ACTIVE
    ↓
Ghi Audit Log

Không được tự động xác nhận thanh toán
chỉ dựa vào hành động của user.

------------------------------------------------------------
F. SUPER ADMIN
------------------------------------------------------------

- Admin Dashboard
- Family Management
- Subscription Management
- Payment Confirmation Queue
- Payment Detail
- Manual Payment Confirmation
- Invoice
- Revenue
- Audit Log
- User Management
- Support Tickets
- Beta Management
- System Health
- Security Events

------------------------------------------------------------
G. SUPPORT
------------------------------------------------------------

- Support Center
- Ticket List
- Ticket Detail
- Create Ticket
- Feedback
- NPS
- CSAT

============================================================
VII. BƯỚC 5 — GOOGLE STITCH WORKFLOW
============================================================

ĐÂY LÀ YÊU CẦU BẮT BUỘC.

Mỗi nhóm giao diện phải thực hiện theo quy trình:

CURRENT SCREEN
      ↓
ANALYZE
      ↓
DESIGN / REDESIGN IN GOOGLE STITCH
      ↓
REVIEW STITCH DESIGN
      ↓
APPROVED DESIGN
      ↓
IMPLEMENT IN CODE
      ↓
COMPARE CODE vs STITCH
      ↓
FIX DIFFERENCES

KHÔNG:

Code trước → Stitch sau.

MÀ PHẢI:

Stitch trước → Code sau.

============================================================
VIII. NẾU STITCH ĐÃ CÓ THIẾT KẾ CŨ
============================================================

Không mặc định rằng thiết kế cũ là đúng.

Hãy:

1. Đọc thiết kế hiện tại.
2. So sánh với yêu cầu nghiệp vụ.
3. Xác định các điểm thiếu.
4. Redesign trong Stitch.
5. Cập nhật Stitch.
6. Sau khi thiết kế được hoàn thiện:
   mới triển khai vào code.

============================================================
IX. COMPONENT ARCHITECTURE
============================================================

Không tạo component UI riêng lẻ trùng lặp.

Tạo:

src/components/ui/

và các component dùng chung:

AppShell
Sidebar
Topbar
PageHeader
Breadcrumb
Card
StatCard
DataTable
EmptyState
LoadingState
ErrorState
Modal
Drawer
ConfirmDialog
FormField
CurrencyInput
DateInput
LunarDatePicker
StatusBadge
QuotaBadge
SubscriptionBadge
AuditTimeline
...

Các component này phải phản ánh đúng Google Stitch Design System.

============================================================
X. LAYOUT ARCHITECTURE
============================================================

Chuẩn hóa:

PublicLayout
AuthLayout
FamilyLayout
AdminLayout

FamilyLayout phải thống nhất:

Sidebar
Header
Breadcrumb
Page container
Content spacing

AdminLayout phải có hierarchy khác Family Admin,
nhưng vẫn sử dụng cùng Design System.

============================================================
XI. RESPONSIVE
============================================================

Thiết kế phải hoạt động tốt:

Desktop
Tablet
Mobile

Không chỉ thu nhỏ Desktop.

Đối với Mobile:

- Sidebar → Drawer
- Table → Card/List khi cần
- Modal → Full-screen sheet
- Tree → Mobile optimized
- Financial ledger → horizontal scroll hoặc card
- QR → dễ quét trên điện thoại
- Buttons → touch-friendly

============================================================
XII. DỮ LIỆU TEST HIỆN TẠI
============================================================

CỰC KỲ QUAN TRỌNG:

GIỮ NGUYÊN DATA TEST.

Không:

DROP DATABASE
TRUNCATE TABLE
DELETE TEST FAMILY
RESET SUPABASE
RE-SEED

Không thay đổi:

Family Alpha
Family Beta
Family Gamma

Các dữ liệu này phải tiếp tục dùng để:

- kiểm tra Tree
- kiểm tra Calendar
- kiểm tra Memorial
- kiểm tra Financial
- kiểm tra Subscription
- kiểm tra Quota
- kiểm tra Read-only
- kiểm tra Admin

Nếu cần dữ liệu UI mới:

→ sử dụng dữ liệu test hiện có.

============================================================
XIII. ROUTING / LANDING PAGE
============================================================

Kiểm tra vấn đề hiện tại:

Khi mở ứng dụng, hệ thống đang đi thẳng vào
trang quản trị gia tộc bằng dữ liệu test.

KHÔNG được xóa dữ liệu test.

Nhưng cần tách:

PUBLIC LANDING
       ↓
LOGIN / REGISTER
       ↓
AUTHENTICATED USER
       ↓
FAMILY DASHBOARD

Dữ liệu test chỉ được dùng khi:

- đăng nhập tài khoản test
hoặc
- bật rõ ràng DEV/TEST MODE.

Không để Production tự động vào Family Admin test.

Tuy nhiên:

KHÔNG xóa hoặc thay đổi các tài khoản test hiện tại.

============================================================
XIV. BILLING UI — QUY TẮC THỰC TẾ
============================================================

Đây là yêu cầu nghiệp vụ bắt buộc.

Hệ thống KHÔNG giả lập kết nối ngân hàng.

Không tạo:

Bank API auto-confirm
Fake webhook
Fake successful payment
Automatic activation based on client button

Quy trình:

USER

Chọn gói
→ Tạo Invoice
→ VietQR / thông tin chuyển khoản
→ Chuyển khoản ngoài hệ thống
→ bấm "Tôi đã chuyển khoản"

Trạng thái:

WAITING_CONFIRMATION

ADMIN

Admin Dashboard
→ Payment Confirmation Queue
→ xem:
   Family
   Invoice
   Amount
   Transfer Reference
   Created At
   User Note
→ kiểm tra giao dịch thực tế ngoài ngân hàng
→ Confirm Payment

Sau khi Admin Confirm:

Payment = SUCCESS
Invoice = PAID
Subscription = ACTIVE

Tất cả trong transaction/RPC.

Admin bắt buộc:

- nhập Audit Reason
- xác nhận số tiền
- xác nhận mã giao dịch
- timestamp
- admin identity

============================================================
XV. VISUAL QA
============================================================

Sau khi implement:

Không chỉ chạy npm test.

Phải kiểm tra:

1. Layout
2. Typography
3. Color
4. Spacing
5. Component
6. Responsive
7. Empty State
8. Loading
9. Error
10. Modal
11. Drawer
12. Table
13. Navigation

So sánh:

STITCH
vs
IMPLEMENTED UI

Mọi sai khác đáng kể phải được sửa.

============================================================
XVI. REGRESSION TEST
============================================================

Sau redesign phải đảm bảo:

npm run build
npm test

và toàn bộ test hiện tại vẫn PASS.

Không được giảm số lượng test.

Không được sửa test chỉ để làm test PASS.

Không được bỏ qua test thất bại.

============================================================
XVII. ACCEPTANCE CRITERIA
============================================================

Chỉ được coi là hoàn thành khi:

[ ] Google Stitch là Source of Truth

[ ] Toàn bộ màn hình đã được audit

[ ] Toàn bộ màn hình quan trọng đã được redesign

[ ] Design System thống nhất

[ ] Desktop đúng Stitch

[ ] Tablet đúng Stitch

[ ] Mobile đúng Stitch

[ ] Navigation đúng Stitch

[ ] Components đúng Stitch

[ ] Typography đúng Stitch

[ ] Spacing đúng Stitch

[ ] Colors đúng Stitch

[ ] Billing UI đúng mô hình
    MANUAL ADMIN CONFIRMATION

[ ] Không có Bank API giả

[ ] Không có Client Payment Bypass

[ ] Không xóa dữ liệu test

[ ] Alpha/Beta test data vẫn hoạt động

[ ] Multi-tenant RLS không thay đổi

[ ] Financial Ledger không thay đổi

[ ] Subscription logic không bị phá vỡ

[ ] Calendar/Memorial logic không bị phá vỡ

[ ] npm run build PASS

[ ] npm test PASS

[ ] Không có console error

[ ] Không có broken route

[ ] Không có broken component

============================================================
XVIII. CẤM "LÀM NHANH"
============================================================

Không được nói:

"UI hiện tại đã khá giống nên giữ nguyên."

Không được:

- tự suy diễn design
- tự chọn màu khác Stitch
- tự thay layout
- tự thay navigation
- tự thay typography
- tự tạo component không theo Design System
- bỏ qua màn hình ít sử dụng

Nếu chưa có thiết kế Stitch:

→ thiết kế trên Stitch trước.

Nếu thiết kế Stitch chưa đủ:

→ hoàn thiện Stitch trước.

============================================================
XIX. OUTPUT BẮT BUỘC
============================================================

Sau khi hoàn thành tạo:

docs/UI_REDESIGN_AUDIT.md

docs/STITCH_DESIGN_SYSTEM.md

docs/STITCH_SCREEN_MAPPING.md

docs/UI_IMPLEMENTATION_GUIDE.md

docs/UI_VISUAL_QA_REPORT.md

docs/UI_REDESIGN_COMPLETION_REPORT.md

Trong đó phải ghi rõ:

1. Tổng số màn hình
2. Màn hình đã redesign
3. Màn hình giữ nguyên
4. Màn hình đã thay đổi
5. Component mới
6. Component tái sử dụng
7. Stitch Design tương ứng
8. Route tương ứng
9. Kết quả Visual QA
10. Kết quả Functional QA
11. Build
12. Test
13. Các vấn đề còn tồn tại

============================================================
XX. QUY TRÌNH THỰC HIỆN
============================================================

KHÔNG thực hiện tất cả trong một bước mù quáng.

Thực hiện theo:

PHASE A
Audit Stitch + Current UI

        ↓

PHASE B
Design System

        ↓

PHASE C
Redesign Core Layout

        ↓

PHASE D
Redesign Family / Genealogy

        ↓

PHASE E
Redesign Calendar / Memorial

        ↓

PHASE F
Redesign Financial

        ↓

PHASE G
Redesign Billing

        ↓

PHASE H
Redesign Super Admin

        ↓

PHASE I
Responsive

        ↓

PHASE J
Visual QA

        ↓

PHASE K
Regression Test

        ↓

FINAL ACCEPTANCE

============================================================
XXI. QUY TẮC BÁO CÁO TIẾN ĐỘ
============================================================

Sau mỗi Phase:

- báo cáo những gì đã kiểm tra
- những gì đã thay đổi
- những gì chưa thay đổi
- Stitch screen đã sử dụng
- file code đã thay đổi
- screenshot/visual comparison nếu MCP hỗ trợ
- test result

KHÔNG chuyển sang Phase tiếp theo nếu Phase hiện tại
chưa đạt yêu cầu.

============================================================
FINAL COMMAND
============================================================

BẮT ĐẦU NGAY.

Bước đầu tiên KHÔNG phải sửa code.

Hãy:

1. Kiểm tra Google Stitch MCP.
2. Đọc toàn bộ thiết kế hiện có.
3. Audit toàn bộ Frontend hiện tại.
4. Lập bảng CURRENT UI vs STITCH.
5. Xác định toàn bộ màn hình cần redesign.
6. Đề xuất Design System thống nhất.
7. Tạo/điều chỉnh thiết kế trên Google Stitch trước.
8. Chỉ sau khi Stitch design đã sẵn sàng mới bắt đầu
   triển khai lại Frontend.

KHÔNG XÓA DATA TEST.

KHÔNG RESET DATABASE.

KHÔNG THAY ĐỔI BUSINESS LOGIC.

KHÔNG TỰ SUY DIỄN UI NGOÀI GOOGLE STITCH.

GOOGLE STITCH → DESIGN SOURCE OF TRUTH
CODE → IMPLEMENTATION OF STITCH

Bắt đầu với PHASE A — AUDIT.
============================================================