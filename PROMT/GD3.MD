============================================================
MASTER IMPLEMENTATION PROMPT
PHASE 3 — FAMILY CALENDAR & MEMORIAL ENGINE
GIA PHẢ GIA TỘC
============================================================

PROJECT:
Gia Phả Gia Tộc — Heritage Ledger

CURRENT STATUS:
Phase 1 — Genealogy Core: COMPLETED
Phase 2 — Financial Core + VietQR + Ledger: COMPLETED
Phase 3 — Family Calendar & Memorial Engine: START NOW

IMPORTANT:
Không được phá vỡ hoặc refactor tùy tiện các module Phase 1 và Phase 2
đang hoạt động ổn định.

Mọi thay đổi phải:
- backward compatible
- giữ nguyên RLS
- giữ nguyên RBAC
- giữ nguyên immutable financial ledger
- giữ nguyên Audit Trail
- không làm thay đổi dữ liệu tài chính hiện hữu
- không phá vỡ 36 bảng CSDL hiện tại
- không phá vỡ các test hiện có

============================================================
1. MỤC TIÊU PHASE 3
============================================================

Xây dựng hệ thống:

"LỊCH VẠN NIÊN ÂM — DƯƠNG SONG HÀNH
+ NGÀY GIỖ TỔ TIÊN
+ NGÀY GIỖ THÀNH VIÊN
+ SỰ KIỆN GIA TỘC
+ NHẮC LỊCH THÔNG MINH"

Đây phải là một Calendar Engine thực sự,
không phải chỉ là một giao diện lịch.

Hệ thống phải hỗ trợ đồng thời:

1. Dương lịch Việt Nam
2. Âm lịch Việt Nam
3. Can Chi
4. Tiết khí
5. Ngày âm lịch
6. Tháng nhuận
7. Ngày giỗ âm lịch
8. Ngày giỗ dương lịch
9. Sự kiện gia tộc
10. Sự kiện theo Chi/Nhánh
11. Sự kiện cá nhân
12. Nhắc lịch
13. Dashboard sự kiện sắp tới
14. Tự động tính ngày dương tương ứng với ngày giỗ âm
15. Xử lý chính xác trường hợp tháng nhuận
16. Xử lý các trường hợp đặc biệt cuối tháng âm lịch

TIMEZONE:
Asia/Ho_Chi_Minh
UTC+7

============================================================
2. NGUYÊN TẮC LỊCH ÂM
============================================================

ĐÂY LÀ MODULE CRITICAL.

Không được tự viết thuật toán âm lịch đơn giản nếu
không đảm bảo độ chính xác.

Calendar Engine phải sử dụng một nguồn thuật toán
Âm lịch Việt Nam có khả năng xử lý:

- múi giờ UTC+7
- tháng nhuận
- năm nhuận
- ngày 29/30 âm
- chuyển đổi âm → dương
- chuyển đổi dương → âm
- Can Chi ngày
- Can Chi tháng
- Can Chi năm
- tiết khí

Không được sử dụng lịch Trung Quốc nếu gây sai lệch
đối với lịch Việt Nam.

Phải có test đối chiếu với các mốc lịch Việt Nam
đã được xác nhận.

============================================================
3. DATA MODEL
============================================================

Rà soát schema hiện tại.

Nếu các bảng:

memorial_dates
events
event_reminders

đã tồn tại thì mở rộng backward-compatible.

Không tạo bảng trùng chức năng.

Đề xuất cấu trúc:

MEMORIAL_DATES

id
family_id
member_id
memorial_type
lunar_day
lunar_month
lunar_year
is_leap_month
solar_date_reference
is_recurring
title
description
location
priority
status
created_by
created_at
updated_at

MEMORIAL_TYPE:

ANCESTOR
MEMBER
FAMILY_FOUNDER
FAMILY_PATRIARCH
OTHER

EVENTS

id
family_id
title
event_type
description
start_date
end_date
all_day
location
branch_id
generation_id
member_id
fund_id
budget_amount
status
visibility
created_by
created_at
updated_at

EVENT_TYPE:

ANCESTRAL_MEMORIAL
FAMILY_DAY
FAMILY_MEETING
ANCESTRAL_HOUSE
RENOVATION
INAUGURATION
WORSHIP
EDUCATION
WEDDING
FUNERAL
COMMUNITY
OTHER

EVENT_RECURRENCES

id
event_id
recurrence_type
lunar_day
lunar_month
is_leap_month
solar_day
solar_month
interval
end_date
occurrence_rule

EVENT_REMINDERS

id
family_id
event_id
memorial_id
reminder_days
channel
enabled
last_sent_at
created_at

============================================================
4. CALENDAR ENGINE
============================================================

Tạo service:

src/services/calendar/

CalendarService.ts
LunarCalendarService.ts
MemorialService.ts
EventService.ts
ReminderService.ts
CanChiService.ts

Không đặt logic chuyển đổi lịch trực tiếp trong React Page.

Frontend chỉ gọi Service Layer.

============================================================
5. CALENDAR DASHBOARD
============================================================

Route:

/app/calendar

Thiết kế theo Heritage Ledger.

Header:

LỊCH GIA TỘC

Hiển thị:

- Thứ
- ngày dương
- ngày âm
- Can Chi
- tiết khí

Ví dụ:

THỨ HAI
24/08/2026

11 tháng 7 năm Bính Ngọ

Can Chi:
Ngày ...
Tháng ...
Năm ...

------------------------------------------------------------

Các chế độ:

[Tháng]
[Tuần]
[Ngày]
[Danh sách]

Bộ lọc:

Tất cả
Giỗ
Sự kiện gia tộc
Chi họ
Thành viên
Từ đường
Họp họ

============================================================
6. WIDGET "SỰ KIỆN SẮP TỚI"
============================================================

Dashboard phải có bảng nhanh:

SỰ KIỆN GIA TỘC SẮP TỚI

Ví dụ:

🕯️ Giỗ Cụ Nguyễn Văn A
25/08/2026
7 tháng 7 Âm lịch
Còn 1 ngày

🏛️ Ngày giỗ Tổ
05/09/2026
23 tháng 7 Âm lịch
Còn 12 ngày

🌿 Họp họ
20/09/2026
Còn 27 ngày

Hiển thị tối đa 5–10 sự kiện.

Có nút:

[Xem tất cả]

============================================================
7. NGÀY GIỖ THÀNH VIÊN
============================================================

Trong MemberProfilePage:

Thêm khu vực:

NGÀY GIỖ

Ngày mất:
12/08/2019 Dương lịch

Ngày giỗ:
15 tháng 7 Âm lịch

☑ Lặp lại hàng năm

Tháng nhuận:
Không

Ngày dương năm nay:
27/08/2026

Cho phép:

[Sửa ngày giỗ]

[Thêm ngày giỗ]

============================================================
8. XỬ LÝ THÁNG NHUẬN
============================================================

Đây là phần CRITICAL.

Ví dụ:

Ngày giỗ:

15 tháng 4 Âm lịch

is_leap_month = false

Hệ thống phải hiểu:

15/4 thường

khác với:

15/4 nhuận

Nếu:

is_leap_month = true

thì chỉ xuất hiện vào năm có tháng 4 nhuận.

Không được tự động chuyển thành tháng 4 thường.

UI phải hiển thị:

15 tháng 4 Âm lịch
(Tháng nhuận)

============================================================
9. GIỖ 30 ÂM LỊCH
============================================================

Phải xử lý:

29
30

Âm lịch.

Nếu một ngày giỗ được lưu:

30 tháng 12 Âm lịch

và năm hiện tại không có ngày 30:

Phải có Business Rule xác định
cách hiển thị.

Không được âm thầm chuyển sang ngày khác.

UI:

⚠️ Ngày giỗ đặc biệt

30 tháng Chạp

Ngày tương ứng năm nay:
Không tồn tại ngày 30 tháng Chạp.

[Thiết lập ngày thay thế]

============================================================
10. GIỖ TỔ GIA TỘC
============================================================

Cho phép tạo:

GIỖ TỔ

Thông tin:

Tên:
Ngày giỗ:
Âm/Dương:
Tháng nhuận:
Địa điểm:
Người phụ trách:
Quỹ sử dụng:
Dự toán:
Ghi chú:

Có thể liên kết:

event → fund

để phục vụ Phase 2.

Ví dụ:

GIỖ TỔ NĂM 2026

Dự toán:
25.000.000 VNĐ

Quỹ:
Quỹ Gia Tộc

============================================================
11. SỰ KIỆN GIA TỘC
============================================================

Cho phép tạo:

- Giỗ Tổ
- Họp họ
- Khánh thành từ đường
- Tu sửa từ đường
- Hội họ
- Khuyến học
- Mừng thọ
- Tảo mộ
- Cúng lễ
- Sự kiện cộng đồng

Form:

Tên sự kiện
Loại sự kiện
Ngày
Âm/Dương
Địa điểm
Chi họ
Người phụ trách
Ngân sách
Quỹ sử dụng
Mô tả

============================================================
12. LIÊN KẾT EVENT ↔ FINANCE
============================================================

Nếu Event có:

budget_amount

và:

fund_id

thì hiển thị:

NGÂN SÁCH SỰ KIỆN

Dự toán:
25.000.000

Đã chi:
17.500.000

Còn lại:
7.500.000

Có nút:

[Xem các khoản chi]

Không được tạo giao dịch tài chính giả.

Chỉ đọc dữ liệu từ Financial Ledger.

============================================================
13. REMINDER ENGINE
============================================================

Mặc định:

30 ngày
15 ngày
7 ngày
3 ngày
1 ngày

Cho phép tùy chỉnh.

Ví dụ:

Giỗ Cụ A
15 tháng 7 Âm lịch

Nhắc:

30 ngày trước
15 ngày trước
7 ngày trước
3 ngày trước
1 ngày trước

Không tạo duplicate notification.

Phải có idempotency.

============================================================
14. NOTIFICATION CENTER
============================================================

Tích hợp:

/app/notifications

Các loại:

MEMORIAL_REMINDER
EVENT_REMINDER
FAMILY_ANNOUNCEMENT
FINANCE_EVENT
SYSTEM

Mỗi notification:

id
family_id
recipient
type
title
content
reference_type
reference_id
read_at
created_at

============================================================
15. PHÂN QUYỀN
============================================================

Chỉ các role phù hợp mới được:

CREATE EVENT
EDIT EVENT
DELETE EVENT
CREATE MEMORIAL
EDIT MEMORIAL
MANAGE REMINDER

Member thông thường:

READ

Không được sửa lịch gia tộc nếu không có quyền.

Mọi thay đổi quan trọng:

→ Audit Log

============================================================
16. UI SCREENS
============================================================

Phải hoàn thiện:

1. FamilyCalendarPage
2. MemorialsPage
3. EventListPage
4. EventDetailPage
5. CreateEventModal
6. CreateMemorialModal
7. EditMemorialModal
8. ReminderSettingsPage
9. CalendarDayDetailDrawer
10. LunarDatePicker
11. MemorialQuickView
12. UpcomingEventsWidget

Không tạo UI sơ sài.

Phải sử dụng Design System:

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

============================================================
17. MOBILE
============================================================

Calendar phải responsive.

Mobile:

Top:

24/08/2026
11/7 Âm lịch

Can Chi

Sau đó:

[Giỗ sắp tới]

[Hôm nay]

[Lịch tháng]

[Danh sách]

Các sự kiện hiển thị dạng Card.

Không ép bảng Desktop vào Mobile.

============================================================
18. BUSINESS RULES
============================================================

Bổ sung Business Rules:

BR-LUNAR-001
Mọi tính toán lịch sử dụng timezone Asia/Ho_Chi_Minh.

BR-LUNAR-002
Âm lịch Việt Nam phải xử lý tháng nhuận.

BR-LUNAR-003
Ngày âm và ngày dương phải được lưu/hiển thị nhất quán.

BR-MEMORIAL-001
Ngày giỗ có thể là âm lịch hoặc dương lịch.

BR-MEMORIAL-002
Ngày giỗ âm lịch được phép lặp hàng năm.

BR-MEMORIAL-003
Ngày giỗ tháng nhuận phải phân biệt
is_leap_month.

BR-MEMORIAL-004
Ngày 30 âm lịch phải xử lý trường hợp năm
không tồn tại ngày 30.

BR-EVENT-001
Event thuộc duy nhất một family.

BR-EVENT-002
Event có thể liên kết branch/member/fund.

BR-EVENT-003
Không được tạo giao dịch tài chính trực tiếp
từ Calendar UI.

BR-REMINDER-001
Không gửi duplicate notification.

BR-REMINDER-002
Notification phải truy xuất được event/memorial gốc.

============================================================
19. DATABASE
============================================================

Cập nhật:

DATABASE_SCHEMA.sql

Không phá vỡ migration hiện tại.

Tạo migration riêng:

supabase/migrations/
YYYYMMDD_phase3_calendar.sql

Migration phải:

- idempotent
- có index
- có FK
- có RLS
- có constraint
- có audit trigger nếu cần

============================================================
20. TESTING
============================================================

Bắt buộc bổ sung test.

LUNAR:

LUNAR-001
Dương → Âm

LUNAR-002
Âm → Dương

LUNAR-003
Tháng nhuận

LUNAR-004
29/30 âm

LUNAR-005
Can Chi

MEMORIAL:

MEM-001
Giỗ hàng năm

MEM-002
Giỗ tháng nhuận

MEM-003
Giỗ 30 âm

EVENT:

EVENT-001
Create

EVENT-002
Update

EVENT-003
Permission

EVENT-004
Event ↔ Fund

REMINDER:

REM-001
30 ngày

REM-002
15 ngày

REM-003
7 ngày

REM-004
3 ngày

REM-005
1 ngày

REM-006
Idempotency

SECURITY:

RLS-CAL-001
Alpha không đọc Calendar Beta.

RLS-CAL-002
Alpha không đọc Memorial Beta.

RLS-CAL-003
Alpha không đọc Event Beta.

============================================================
21. PERFORMANCE
============================================================

Calendar phải hoạt động tốt với:

500 thành viên
1.000 memorials
1.000 events

Không tải toàn bộ dữ liệu khi mở Calendar.

Sử dụng:

pagination
date range query
TanStack Query
indexes

============================================================
22. DOCUMENTATION
============================================================

Tạo:

docs/PHASE_3_CALENDAR.md

docs/LUNAR_CALENDAR_ENGINE.md

docs/MEMORIAL_ENGINE.md

docs/EVENT_ENGINE.md

docs/PHASE_3_COMPLETION_REPORT.md

Cập nhật:

MASTER_SPEC.md
BUSINESS_RULES.md
DATABASE_SCHEMA.sql
IMPLEMENTATION_PLAN.md
SCREEN_MAP.md

============================================================
23. ACCEPTANCE CRITERIA
============================================================

Phase 3 chỉ được coi là COMPLETE khi:

[ ] Calendar Desktop hoàn chỉnh
[ ] Calendar Mobile hoàn chỉnh
[ ] Âm lịch chính xác
[ ] Dương lịch chính xác
[ ] Can Chi
[ ] Tháng nhuận
[ ] Ngày 29/30 âm
[ ] Giỗ lặp hàng năm
[ ] Giỗ Tổ
[ ] Sự kiện gia tộc
[ ] Reminder Engine
[ ] Notification
[ ] RBAC
[ ] RLS
[ ] Audit
[ ] Event ↔ Finance
[ ] Performance test
[ ] Security test
[ ] Regression test

============================================================
24. REGRESSION GATE
============================================================

Sau Phase 3:

npm run build

npm test

Tất cả test Phase 1 + Phase 2
PHẢI tiếp tục PASS.

Expected:

0 TypeScript errors
0 build errors
0 regression failures
0 RLS violations
0 financial ledger violations

============================================================
25. FINAL REPORT
============================================================

Sau khi hoàn thành, tạo:

docs/PHASE_3_COMPLETION_REPORT.md

Báo cáo:

- Files changed
- Files created
- Database migration
- Business Rules
- Screens
- Tests
- Lunar test results
- RLS results
- Performance results
- Build result
- Regression result
- Git commit hash

Cuối báo cáo phải có:

PHASE 3 STATUS:

PASS / FAIL

Nếu PASS:

NEXT PHASE:
PHASE 4 — SUBSCRIPTION, TRIAL, USAGE,
BILLING & COMMERCIALIZATION

============================================================
END OF PHASE 3 MASTER PROMPT
============================================================