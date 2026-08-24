============================================================
TASK: SYNC GOOGLE STITCH DESIGN → PROJECT SCREEN MAP
============================================================

PROJECT:
GIA PHẢ GIA TỘC

IMPORTANT:
Google Stitch MCP đã được kết nối trong workspace này.

Hãy sử dụng Google Stitch MCP để trực tiếp đọc và phân tích
toàn bộ thiết kế hiện có của project Gia Phả Gia Tộc.

KHÔNG yêu cầu tôi export screenshot thủ công.

KHÔNG tự giả định tên màn hình nếu có thể lấy thông tin trực tiếp
từ Stitch MCP.

============================================================
1. DISCOVER STITCH PROJECT
============================================================

Sử dụng Stitch MCP để:

1. Liệt kê các project/design hiện có.
2. Xác định project tương ứng với:
   "GIA PHẢ GIA TỘC"
3. Đọc toàn bộ screens/pages trong project.
4. Đọc các design components nếu MCP cung cấp.
5. Đọc layout, navigation và screen relationships nếu có.
6. Lấy thông tin về:
   - Screen name
   - Screen ID
   - Screen description
   - Layout
   - Components
   - Navigation
   - Responsive design
   - Typography
   - Colors
   - Spacing
   - UI patterns
   - Assets
7. Nếu Stitch cung cấp source/code/design metadata,
   hãy đọc và sử dụng chúng.

Không được bỏ qua các screen chỉ vì chúng chưa có route
trong code hiện tại.

============================================================
2. READ PROJECT SPECIFICATION
============================================================

Sau khi đọc Stitch MCP, hãy đọc:

/MASTER_SPEC.md
/IMPLEMENTATION_PLAN.md
/DATABASE_SCHEMA.sql
/BUSINESS_RULES.md

Nếu các file chưa tồn tại:

KHÔNG tự tạo nội dung giả.

Hãy báo rõ file nào chưa tồn tại.

============================================================
3. CROSS-REFERENCE
============================================================

Tạo mapping:

STITCH SCREEN
        ↓
MASTER_SPEC MODULE
        ↓
BUSINESS FUNCTION
        ↓
DATABASE TABLE
        ↓
REACT ROUTE
        ↓
REACT PAGE
        ↓
COMPONENTS
        ↓
ROLE / PERMISSION
        ↓
SUBSCRIPTION / FEATURE LIMIT

Ví dụ:

Stitch:
Family Dashboard

↓
MASTER_SPEC:
MODULE FAMILY DASHBOARD

↓
Route:
/app/dashboard

↓
React:
DashboardPage.tsx

↓
Components:
FamilySummary
QuickStats
UpcomingEvents
UpcomingMemorials
FinanceSummary

============================================================
4. CREATE SCREEN_MAP.md
============================================================

Tạo hoặc cập nhật:

/design/SCREEN_MAP.md

SCREEN_MAP.md phải phản ánh
THỰC TẾ của Google Stitch MCP,
không được chỉ sử dụng danh sách màn hình mẫu trước đó.

Mỗi screen phải có:

- Screen ID
- Stitch name
- Screen purpose
- Module
- Route
- React page
- Main components
- Data sources
- Database tables
- Required permissions
- Subscription requirement
- Responsive behavior
- UI states
- Stitch reference
- Implementation status

============================================================
5. SCREEN CLASSIFICATION
============================================================

Phân loại screen thành:

PUBLIC
AUTHENTICATION
ONBOARDING
FAMILY
GENEALOGY
CALENDAR
EVENTS
FINANCE
BILLING
NOTIFICATIONS
SETTINGS
AUDIT
ADMIN
ADMIN BILLING

============================================================
6. IDENTIFY MISSING SCREENS
============================================================

So sánh:

STITCH
vs
MASTER_SPEC

Xác định:

A. Có trong Stitch nhưng chưa có trong MASTER_SPEC

B. Có trong MASTER_SPEC nhưng chưa có trong Stitch

C. Có trong cả hai

D. Có trong code nhưng không có trong Stitch

Tạo bảng:

| Screen | Stitch | MASTER_SPEC | Code | Status |
|--------|--------|-------------|------|--------|

Status:

MATCHED
STITCH_ONLY
SPEC_ONLY
CODE_ONLY
CONFLICT

============================================================
7. IDENTIFY DESIGN GAPS
============================================================

Kiểm tra xem Stitch có thiếu:

- Loading state
- Empty state
- Error state
- Permission denied
- Subscription expired
- Quota exceeded
- Mobile layout
- Confirmation dialog
- Delete confirmation
- Form validation
- Payment success
- Payment failed
- Payment pending

Không tự ý bổ sung thiết kế vào Stitch.

Chỉ ghi nhận GAP.

============================================================
8. GENEALOGY REQUIREMENTS
============================================================

Đặc biệt kiểm tra các screen:

Family Tree
Member List
Member Detail
Generation
Branch
Relationship

Đảm bảo mapping được:

- Thế hệ
- Chi
- Nhánh
- Cha mẹ
- Vợ/chồng
- Con
- Anh chị em
- Người đã mất
- Ngày giỗ

============================================================
9. CALENDAR REQUIREMENTS
============================================================

Đặc biệt kiểm tra:

Calendar
Memorial
Event
Event Detail

Phải hỗ trợ concept:

Dương lịch
Âm lịch
Can Chi
Ngày giỗ âm lịch
Sự kiện gia tộc
Giỗ họ
Khánh thành
Họp họ
Sự kiện chi
Sự kiện nhánh

Kiểm tra xem Stitch đã thể hiện các thông tin này
trên UI hay chưa.

Nếu thiếu:

ghi vào DESIGN GAP.

KHÔNG tự ý thay đổi Stitch.

============================================================
10. FINANCE REQUIREMENTS
============================================================

Kiểm tra toàn bộ Finance UI:

Finance Dashboard
Funds
Income Categories
Expense Categories
Income Assessments
Contributions
Sponsorships
Expenses
Transactions
Ledger
Reports

Đặc biệt kiểm tra nghiệp vụ:

1. Khởi tạo khoản thu.

2. Chọn nhanh nhiều thành viên.

3. Gán mức thu cho thành viên.

4. Theo dõi:

   Phải thu
   Đã thu
   Còn phải thu

5. Đóng góp tự nguyện.

6. Tài trợ.

7. Khoản chi.

8. Danh mục thu.

9. Danh mục chi.

10. Theo dõi quỹ.

11. Ledger.

12. Audit trail.

13. Reversal / adjustment.

Nếu Stitch chưa có UI cho nghiệp vụ nào:

ghi DESIGN GAP.

============================================================
11. BILLING REQUIREMENTS
============================================================

Kiểm tra:

Pricing
Subscription
Trial
Payment
Invoices
Usage

và Admin Billing:

Plans
Subscriptions
Payments
Invoices
Trials
Usage
Refunds
Billing Audit

Kiểm tra các trạng thái:

TRIAL
ACTIVE
PAST_DUE
CANCELLED
EXPIRED
SUSPENDED

Payment:

PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED

============================================================
12. CREATE DESIGN IMPLEMENTATION MAP
============================================================

Tạo:

/design/DESIGN_IMPLEMENTATION_MAP.md

Cấu trúc:

Stitch Screen
→ Design Components
→ React Components
→ Page
→ Route
→ Service
→ Database
→ Business Rule

Ví dụ:

Calendar

→ CalendarToolbar
→ LunarDateToggle
→ CalendarGrid
→ EventCard

→ CalendarPage.tsx

→ /app/calendar

→ calendarService

→ family_events
→ memorials

→ BUSINESS_RULES.md

============================================================
13. DO NOT CODE YET
============================================================

Ở bước này:

KHÔNG triển khai React.

KHÔNG sửa database.

KHÔNG sửa business logic.

KHÔNG thay đổi Stitch.

Chỉ:

1. Read Stitch
2. Analyze
3. Map
4. Detect gaps
5. Create documentation

============================================================
14. OUTPUT
============================================================

Sau khi hoàn thành, phải tạo/cập nhật:

/design/SCREEN_MAP.md

/design/DESIGN_IMPLEMENTATION_MAP.md

Nếu cần:

/design/DESIGN_GAPS.md

============================================================
15. FINAL REPORT
============================================================

Cuối cùng báo cáo:

STITCH PROJECT:
...

TOTAL SCREENS:
...

MATCHED:
...

STITCH ONLY:
...

SPEC ONLY:
...

CODE ONLY:
...

CONFLICT:
...

DESIGN GAPS:
...

READY FOR IMPLEMENTATION:
YES / NO

Nếu READY = NO:

liệt kê chính xác các vấn đề cần giải quyết trước khi coding.

============================================================
END TASK
============================================================