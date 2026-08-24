============================================================
HERITAGE LEDGER — IDENTITY & WORKSPACE RECONCILIATION
============================================================

MỤC TIÊU:
Khắc phục triệt để tình trạng hiện tại của Webapp Gia Phả Gia Tộc
(Heritage Ledger) đang trộn lẫn:

1. Tài khoản người dùng/thành viên dòng họ
2. Trang quản trị của một Dòng họ
3. Trang quản trị nền tảng SaaS (Super Admin)

Đặc biệt phải kiểm tra toàn bộ route /app/* và màn hình hiện tại:

https://gia-pha-gia-toc.vercel.app/app/finance/ledger

KHÔNG được chỉ sửa riêng giao diện Ledger.

Phải rà soát toàn bộ kiến trúc Identity → Authentication → Authorization
→ Workspace → Routing → App Shell → Navigation → Data Scope.

============================================================
I. NGUYÊN TẮC BẤT BIẾN
============================================================

1. KHÔNG XÓA dữ liệu test hiện tại.

2. KHÔNG reset database.

3. KHÔNG seed lại dữ liệu.

4. KHÔNG thay đổi Family Alpha / Beta / Gamma hiện có.

5. KHÔNG thay đổi Business Logic của:
   - Genealogy
   - Financial Core
   - Ledger
   - Memorial
   - Calendar
   - Events
   - Subscription
   - Billing
   - VietQR manual confirmation
   - Audit
   - RLS

6. KHÔNG phá vỡ các test hiện tại.

7. KHÔNG thay đổi schema nếu không thực sự bắt buộc.

8. Ưu tiên tái sử dụng các role, permission, tenant_id,
   family_id, subscription_id và service hiện có.

9. Đây là một UI / Identity / Routing Reconciliation task.

10. Data Integrity > Feature Velocity.

============================================================
II. MÔ HÌNH KHÔNG GIAN SỬ DỤNG CHÍNH THỨC
============================================================

Thiết kế lại hệ thống theo mô hình:

                    HERITAGE LEDGER
                           │
             ┌─────────────┼─────────────┐
             │             │             │
        USER SPACE     FAMILY SPACE   PLATFORM SPACE
             │             │             │
       Thành viên      Quản trị họ    Super Admin
             │             │             │
       Hồ sơ cá nhân   Gia phả        SaaS
       Lời mời         Thành viên     Billing
       Thông báo       Tài chính      Subscriptions
       Sự kiện         Giỗ            Families
                       Quỹ             System
                       Phân quyền     Audit
============================================================

Không được để người dùng thông thường nhìn thấy navigation
hoặc dashboard dành cho Family Admin.

Không được để Family Admin nhìn thấy chức năng Super Admin.

Không được dùng route /app/* như một không gian chung không có
phân biệt workspace.

============================================================
III. PHÂN LOẠI ROLE
============================================================

Trước tiên hãy quét toàn bộ source code để xác định role hiện có.

KHÔNG tự ý tạo role mới nếu hệ thống đã có role tương đương.

Chuẩn hóa logic thành 3 tầng:

A. PLATFORM ROLE

SUPER_ADMIN

Quyền:
- Quản lý toàn bộ nền tảng
- Quản lý các dòng họ
- Quản lý subscription
- Billing
- Manual payment confirmation
- Platform audit
- System monitoring

Route đề xuất:

/admin/*
/admin/families
/admin/subscriptions
/admin/payments
/admin/audit
/admin/system

B. FAMILY ROLE

FAMILY_OWNER
FAMILY_ADMIN
FAMILY_MANAGER
FAMILY_MEMBER

Quyền thuộc tenant/family.

Family Owner/Admin có thể:
- Quản lý gia phả
- Quản lý thành viên
- Quản lý chi phái
- Quản lý ngày giỗ
- Quản lý sự kiện
- Quản lý quỹ
- Quản lý đóng góp
- Quản lý bảng vàng
- Quản lý phân quyền trong dòng họ

Route:

/app/*
hoặc tốt hơn:

/app/family/*
  
NHƯNG trước khi thay đổi route,
phải kiểm tra toàn bộ route hiện tại và tránh breaking existing links.

C. END USER / FAMILY MEMBER

FAMILY_MEMBER

Chỉ được truy cập:
- Hồ sơ của mình
- Thông tin dòng họ được phép xem
- Gia phả READ
- Lịch
- Ngày giỗ
- Sự kiện
- Thông báo
- Đóng góp nếu được phép
- Các chức năng cá nhân

KHÔNG được truy cập:
- Family settings
- User management
- Financial administration
- Ledger administration
- Expense approval
- Reversal
- Bulk assessment
- Audit administration

============================================================
IV. VẤN ĐỀ QUAN TRỌNG NHẤT: APP ENTRY
============================================================

Hiện tại khi truy cập:

/app/finance/ledger

hệ thống đang có xu hướng đưa thẳng người dùng vào
trang quản trị dòng họ / dữ liệu test.

PHẢI SỬA.

Sau khi login:

KHÔNG redirect mặc định tới:

/app/finance/ledger

và KHÔNG redirect mặc định tới một màn hình quản trị.

Thay vào đó:

Auth → Resolve Identity → Resolve Membership → Resolve Workspace
→ Resolve Landing Page.

Pseudo flow:

LOGIN
  ↓
AUTHENTICATED?
  ↓
LOAD PROFILE
  ↓
LOAD FAMILY MEMBERSHIP
  ↓
RESOLVE ROLE
  ↓
RESOLVE ACTIVE FAMILY
  ↓
RESOLVE SUBSCRIPTION
  ↓
SELECT LANDING PAGE

Ví dụ:

SUPER_ADMIN
→ /admin

FAMILY_OWNER
→ /app/dashboard

FAMILY_ADMIN
→ /app/dashboard

FAMILY_MANAGER
→ /app/dashboard

FAMILY_MEMBER
→ /app/home

User chưa thuộc dòng họ
→ /onboarding

User có invitation pending
→ /register/invite

============================================================
V. ACTIVE FAMILY / TENANT CONTEXT
============================================================

Phải có một nguồn dữ liệu duy nhất xác định:

activeFamilyId

và:

activeMembership

Không được để mỗi page tự suy luận family_id.

Không được dùng:

const familyId = TEST_FAMILY_ID

Không được hard-code:

Family Alpha

Không được hard-code:

Family Beta

Không được hard-code:

Family Gamma

Không được tự động chọn Family Alpha chỉ vì dữ liệu test tồn tại.

============================================================
VI. TEST DATA PHẢI ĐƯỢC GIỮ NGUYÊN
============================================================

Đây là yêu cầu đặc biệt quan trọng.

Family Alpha / Beta / Gamma hiện tại phải tiếp tục tồn tại
và có thể dùng để test.

NHƯNG:

TEST DATA ≠ DEFAULT USER DESTINATION.

Tức là:

Có dữ liệu Family Alpha
không có nghĩa user mới được tự động đăng nhập vào Alpha.

Có dữ liệu Ledger
không có nghĩa user mới được tự động mở Ledger.

Có tài khoản test
không có nghĩa tài khoản đó được cấp Family Admin.

Hãy kiểm tra toàn bộ:

- seed
- fixtures
- mock users
- demo mode
- development mode
- fallback family
- default family
- test account
- localStorage
- sessionStorage
- URL query
- hard-coded UUID
- environment variables

và loại bỏ mọi logic tự động đưa người dùng vào dữ liệu test.

TUYỆT ĐỐI KHÔNG XÓA DỮ LIỆU TEST.

============================================================
VII. APP SHELL
============================================================

Thiết kế lại AppShell theo workspace.

Không sử dụng một Sidebar duy nhất cho mọi role.

Tạo navigation theo role:

------------------------------------------------------------
FAMILY ADMIN NAVIGATION
------------------------------------------------------------

TỔNG QUAN
- Dashboard

GIA PHẢ
- Cây gia phả
- Thành viên
- Chi phái
- Import dữ liệu
- Xuất gia phả

LỊCH & GIA ĐÌNH
- Lịch vạn niên
- Ngày giỗ
- Sự kiện
- Nhắc lịch

TÀI CHÍNH
- Tổng quan quỹ
- Sổ quỹ
- Khoản thu
- Định mức thu
- Khoản chi
- Duyệt chi
- Đóng góp
- Bảng vàng công đức

QUẢN TRỊ
- Thành viên & phân quyền
- Cài đặt dòng họ

------------------------------------------------------------
FAMILY MEMBER NAVIGATION
------------------------------------------------------------

TRANG CHỦ
- Tổng quan

GIA ĐÌNH
- Gia phả
- Hồ sơ của tôi

LỊCH
- Lịch
- Ngày giỗ
- Sự kiện

THÔNG BÁO

TÀI KHOẢN
- Hồ sơ
- Cài đặt

Không hiển thị:
- Duyệt chi
- Ledger administration
- Bulk assessment
- Reversal
- Family settings
- User management

nếu role không được phép.

------------------------------------------------------------
SUPER ADMIN NAVIGATION
------------------------------------------------------------

TỔNG QUAN NỀN TẢNG
- Dashboard

DÒNG HỌ
- Danh sách dòng họ
- Chi tiết dòng họ
- Trạng thái hoạt động

THUÊ BAO
- Gói dịch vụ
- Subscription
- Usage

THANH TOÁN
- Chờ xác nhận
- Đã xác nhận
- Từ chối
- Hoàn tiền

VẬN HÀNH
- Health
- Audit
- Security
- Monitoring

HỆ THỐNG
- Configuration
- Feature flags

Không hiển thị dữ liệu quản trị nội bộ của từng dòng họ
nếu không cần thiết.

============================================================
VIII. ROUTE GUARD
============================================================

Tạo hoặc chuẩn hóa:

ProtectedRoute
RoleGuard
FamilyMembershipGuard
PermissionGuard
SubscriptionGuard
PlatformAdminGuard

Ví dụ:

/app/finance/ledger

phải kiểm tra:

authenticated
AND
activeFamilyId
AND
membership exists
AND
permission = finance.ledger.view

Nếu không:

403 hoặc redirect về dashboard.

KHÔNG được fallback về Family Alpha.

============================================================
IX. FINANCIAL ROUTES
============================================================

Đặc biệt rà soát toàn bộ:

/app/finance/*
    
Bao gồm:

/app/finance
/app/finance/ledger
/app/finance/income
/app/finance/assessment
/app/finance/expenses
/app/finance/contributions
/app/finance/honor-roll
...

Mỗi route phải có:

1. Authentication check
2. Family membership check
3. Role/permission check
4. Active family context
5. RLS protection

Ledger là dữ liệu quản trị.

Family Member mặc định KHÔNG được truy cập
nếu không có permission tương ứng.

============================================================
X. UI PHẢI PHÂN BIỆT "TÀI KHOẢN" VÀ "DÒNG HỌ"
============================================================

Trong Header phải thể hiện rõ:

[Avatar]
Tên người dùng

Vai trò:
Quản trị viên dòng họ

Dòng họ đang quản lý:
Nguyễn Văn — Chi họ...

Không được hiển thị kiểu:

"Admin"

mà không nói Admin của cái gì.

Nếu Family Member:

Vai trò:
Thành viên

Nếu Super Admin:

Vai trò:
Quản trị nền tảng

============================================================
XI. FAMILY SWITCHER
============================================================

Nếu một user thuộc nhiều dòng họ:

Header phải có:

Dòng họ đang sử dụng
[Gia tộc A ▼]

Click:

Gia tộc A
Gia tộc B
Gia tộc C

Khi switch:

- đổi activeFamilyId
- reload relevant data
- giữ role theo membership
- kiểm tra lại permission
- không để dữ liệu family cũ còn hiển thị.

Nếu user chỉ thuộc 1 dòng họ:

không cần hiển thị dropdown,
chỉ hiển thị tên dòng họ.

============================================================
XII. SUPER ADMIN KHÔNG ĐƯỢC NHẦM VỚI FAMILY ADMIN
============================================================

Đây là hai khái niệm hoàn toàn khác nhau.

SUPER_ADMIN:

"Quản trị nền tảng Heritage Ledger"

FAMILY_ADMIN:

"Quản trị Dòng họ"

Không dùng cùng một badge:

ADMIN

Thay vào đó:

Quản trị nền tảng

hoặc:

Quản trị dòng họ

============================================================
XIII. LOGIN / ONBOARDING
============================================================

Kiểm tra toàn bộ flow:

/login
/register
/register/invite
/onboarding
/app

Flow chuẩn:

Người dùng chưa đăng nhập
→ Login/Register

Đăng ký mới
→ Onboarding

Có invitation
→ InviteRegister

Đã đăng nhập nhưng chưa thuộc Family
→ Onboarding

Đã đăng nhập + Family Member
→ Member Home

Đã đăng nhập + Family Admin
→ Family Dashboard

Super Admin
→ Platform Admin

============================================================
XIV. KHÔNG ĐƯỢC DÙNG MOCK USER ĐỂ XÁC ĐỊNH ROLE
============================================================

Tìm và loại bỏ các pattern như:

isAdmin = true

role = "admin"

currentUser = mockUser

familyId = demoFamilyId

defaultFamilyId

TEST_USER

DEMO_USER

DEFAULT_ADMIN

nếu chúng đang được sử dụng trong production routing.

Mock/Test chỉ được phép tồn tại trong:

tests/
fixtures/
development-only utilities

và phải được bảo vệ rõ ràng.

============================================================
XV. UI LANGUAGE
============================================================

Đồng thời rà soát toàn bộ UI.

Không sử dụng các cụm từ kiểu:

AI Generated
AI Assistant
Generated automatically
AI suggested
Auto generated
Magic
Smart AI
Demo data
Sample data

trừ khi đó thực sự là tính năng người dùng nhìn thấy
và cần biết.

Ngôn ngữ phải giống một hệ thống quản lý gia tộc thực tế.

Ví dụ:

"AI Generated Tree"

→ "Cây gia phả"

"AI Generated Report"

→ "Báo cáo"

"Auto Generated"

→ "Tự động tạo"

nếu thực sự cần mô tả.

============================================================
XVI. VISUAL DESIGN
============================================================

Sau khi giải quyết Identity/Workspace/Routing:

Rà soát toàn bộ App UI theo Heritage Ledger Design System.

BẮT BUỘC:

- nền sáng thống nhất
- typography thống nhất
- spacing thống nhất
- button hierarchy thống nhất
- card radius thống nhất
- icon style thống nhất
- form style thống nhất
- table style thống nhất
- modal style thống nhất
- responsive thống nhất

Không được để:

một trang dark
một trang light

một trang font khác

một trang button khác

một modal có style khác AppShell.

Nếu có thiết kế Google Stitch tương ứng:

STITCH-FIRST.

Không tự ý thiết kế khác Stitch.

============================================================
XVII. STITCH RECONCILIATION
============================================================

Đối với mọi màn hình đã có thiết kế Google Stitch:

1. Đọc thiết kế Stitch.
2. Xác định layout.
3. Xác định typography.
4. Xác định component hierarchy.
5. Xác định spacing.
6. Xác định màu sắc.
7. Xác định responsive behavior.
8. Sau đó mới chỉnh React/Tailwind.

Nếu màn hình chưa có Stitch:

KHÔNG tự ý code UI trước.

Đưa thiết kế lên Google Stitch trước.

Sau khi có thiết kế:

Stitch → Design Spec → React Implementation.

============================================================
XVIII. KIỂM TRA TRƯỚC KHI MUTATE CODE
============================================================

Trước khi sửa code:

QUÉT:

src/
routes/
pages/
components/
services/
hooks/
contexts/
auth/
middleware/
supabase/
tests/

Tạo:

docs/IDENTITY_WORKSPACE_AUDIT.md

Bao gồm:

1. Current authentication flow
2. Current roles
3. Current permissions
4. Current routes
5. Current family resolution
6. Current default redirects
7. Hard-coded test data
8. Current AppShell
9. Current navigation
10. Current guards
11. Problems discovered
12. Proposed architecture
13. Files that will change
14. Files that MUST NOT change

============================================================
XIX. HUMAN APPROVAL GATE
============================================================

Đây là CONTROLLED MUTATION.

Không sửa code ngay.

Trước tiên:

1. Audit
2. Report
3. Proposed architecture
4. Route matrix
5. Permission matrix
6. File mutation list

Sau đó dừng.

Chờ:

APPROVE

mới được phép sửa code.

============================================================
XX. ACCEPTANCE CRITERIA
============================================================

Sau khi hoàn thành:

TEST 1

User chưa đăng nhập:

/app/finance/ledger

→ không được vào Ledger.

TEST 2

Family Member:

/app/finance/ledger

→ 403 / Access Denied hoặc redirect phù hợp.

TEST 3

Family Admin:

/app/finance/ledger

→ vào Ledger của ACTIVE FAMILY.

TEST 4

User thuộc Family Alpha:

→ chỉ thấy dữ liệu Alpha.

TEST 5

User thuộc Family Beta:

→ chỉ thấy dữ liệu Beta.

TEST 6

Switch Alpha → Beta:

→ không còn dữ liệu Alpha trên UI.

TEST 7

Super Admin:

→ vào /admin.

Không tự động vào /app/finance/ledger.

TEST 8

Đăng ký user mới:

→ không tự động được gán Family Alpha.

TEST 9

Test data:

Family Alpha / Beta / Gamma vẫn còn nguyên.

TEST 10

Existing tests:

100% PASS.

TEST 11

npm run build

→ PASS.

TEST 12

Không có:

console errors
TypeScript errors
RLS cross-tenant leak
hard-coded test family routing.

============================================================
XXI. QUAN TRỌNG: KHÔNG "CHỮA" BẰNG REDIRECT
============================================================

KHÔNG được giải quyết vấn đề bằng cách:

if user then redirect('/app/dashboard')

hoặc:

if no family then use Alpha

hoặc:

if no role then use admin

Đây là lỗi kiến trúc.

Phải giải quyết bằng:

IDENTITY
→ MEMBERSHIP
→ ACTIVE FAMILY
→ ROLE
→ PERMISSION
→ WORKSPACE
→ ROUTE

============================================================
XXII. FINAL DELIVERABLE
============================================================

Sau khi hoàn thành phải xuất:

docs/IDENTITY_WORKSPACE_AUDIT.md
docs/ROLE_PERMISSION_MATRIX.md
docs/ROUTE_ACCESS_MATRIX.md
docs/APP_SHELL_RECONCILIATION.md
docs/UI_LANGUAGE_RECONCILIATION.md

Và báo cáo:

============================================================
IDENTITY & WORKSPACE RECONCILIATION REPORT
============================================================

Authentication:
PASS / FAIL

Role Separation:
PASS / FAIL

Family Context:
PASS / FAIL

Route Guards:
PASS / FAIL

RLS:
PASS / FAIL

Test Data Preservation:
PASS / FAIL

Family Member Isolation:
PASS / FAIL

Family Admin Isolation:
PASS / FAIL

Super Admin Isolation:
PASS / FAIL

UI Consistency:
PASS / FAIL

Stitch Compliance:
PASS / FAIL

Build:
PASS / FAIL

Tests:
X / X PASS

============================================================

KẾT LUẬN:

Không được tuyên bố Production Ready chỉ vì build/test PASS.

Chỉ kết luận hoàn thành khi:

IDENTITY
+ WORKSPACE
+ ROUTING
+ RBAC
+ RLS
+ TEST DATA
+ UI
+ STITCH

đã được đối chiếu và xác nhận đồng nhất.
============================================================