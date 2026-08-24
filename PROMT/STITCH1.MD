============================================================
BỔ SUNG BẮT BUỘC — QUY TRÌNH STITCH-FIRST CHO TOÀN BỘ UI
============================================================

XÁC NHẬN LẠI YÊU CẦU:

Tôi không yêu cầu bạn chỉ kiểm tra xem UI hiện tại có giống
Google Stitch hay không.

Tôi yêu cầu bạn RÀ SOÁT 100% TOÀN BỘ GIAO DIỆN của ứng dụng
và xây dựng lại theo quy trình:

CURRENT UI
    ↓
AUDIT
    ↓
CHECK GOOGLE STITCH
    ↓
┌───────────────────────────────────────────────┐
│                                               │
│  ĐÃ CÓ THIẾT KẾ TRÊN STITCH?                  │
│                                               │
│      YES                         NO           │
│       ↓                           ↓           │
│  So sánh UI hiện tại       THIẾT KẾ MỚI       │
│  với Stitch                TRÊN STITCH         │
│       ↓                           ↓           │
│  Xác định sai khác          REVIEW DESIGN      │
│       ↓                           ↓           │
│  Dùng Stitch làm chuẩn      STITCH APPROVED    │
│       ↓                           ↓           │
└───────┴───────────────────────────┘
                    ↓
          STITCH = SOURCE OF TRUTH
                    ↓
             IMPLEMENT UI
                    ↓
          VISUAL QA / COMPARISON
                    ↓
             FUNCTIONAL TEST
============================================================


ĐẶC BIỆT:

Nếu một màn hình hiện tại CHƯA CÓ trên Google Stitch:

KHÔNG được tự ý viết code giao diện.

KHÔNG được tự suy diễn thiết kế.

KHÔNG được lấy một màn hình khác làm mẫu rồi tự biến đổi.

PHẢI:

1. Xác định yêu cầu nghiệp vụ của màn hình.
2. Kiểm tra Design System hiện tại trên Stitch.
3. Tạo thiết kế màn hình đó trên Google Stitch.
4. Bảo đảm thiết kế phù hợp với toàn bộ hệ thống.
5. Lưu thiết kế vào Google Stitch.
6. Sau đó mới triển khai React UI dựa trên thiết kế đó.

============================================================
TRƯỜNG HỢP ĐÃ CÓ STITCH DESIGN
============================================================

Nếu màn hình đã có thiết kế trên Google Stitch:

KHÔNG được thiết kế lại tùy ý trong code.

Phải:

STITCH DESIGN
    ↓
READ DESIGN
    ↓
MAP COMPONENTS
    ↓
IMPLEMENT
    ↓
COMPARE
    ↓
FIX

Google Stitch được ưu tiên tuyệt đối nếu có xung đột giữa:

Current UI
vs
Stitch Design

Kết quả phải là:

STITCH DESIGN
    =
IMPLEMENTED UI


============================================================
TRƯỜNG HỢP STITCH DESIGN CŨ KHÔNG CÒN PHÙ HỢP
============================================================

Nếu thiết kế hiện tại trên Stitch không còn phù hợp với nghiệp vụ
hoặc không đồng nhất với Design System mới:

KHÔNG được bỏ qua Stitch.

Phải:

OLD STITCH
    ↓
AUDIT
    ↓
REDESIGN ON STITCH
    ↓
NEW APPROVED STITCH DESIGN
    ↓
IMPLEMENT

============================================================
PHẢI RÀ SOÁT 100% SCREEN
============================================================

Không chỉ rà soát các màn hình chính.

Hãy quét toàn bộ:

- Routes
- Pages
- Modals
- Drawers
- Dialogs
- Forms
- Tables
- Dashboards
- Settings
- Empty states
- Loading states
- Error states
- Subscription states
- Read-only states
- Admin screens
- Mobile layouts

Bao gồm cả các màn hình ít được sử dụng.

============================================================
TẠO SCREEN INVENTORY
============================================================

Trước khi code, tạo bảng:

| ID | Route | Screen | Current UI | Stitch Exists |
|----|-------|--------|------------|---------------|
| UI-001 | / | Landing | YES | YES/NO |
| UI-002 | /login | Login | YES | YES/NO |
| ... | ... | ... | ... | ... |

Sau đó phân loại:

A = Stitch đã có + UI đúng
B = Stitch đã có + UI sai
C = Stitch chưa có
D = UI có nhưng Stitch chưa có
E = Route có nhưng UI chưa hoàn thiện
F = Component/UI state còn thiếu

============================================================
THỨ TỰ THỰC HIỆN BẮT BUỘC
============================================================

KHÔNG:

Audit → Code toàn bộ → đưa lên Stitch sau.

MÀ:

Audit
  ↓
Stitch Design Inventory
  ↓
Thiết kế bổ sung các màn hình thiếu trên Stitch
  ↓
Hoàn thiện Stitch Design System
  ↓
Xác nhận toàn bộ Screen Map
  ↓
Implement React
  ↓
Visual QA
  ↓
Regression Test

============================================================
QUY TẮC "STITCH-FIRST"
============================================================

Từ thời điểm này:

MỌI UI MỚI phải đi qua Google Stitch trước.

MỌI UI CŨ cần redesign phải được cập nhật trên Google Stitch trước.

MỌI component mới quan trọng phải được phản ánh trong Design System
hoặc thiết kế Stitch trước khi implement.

Không được tiếp tục phát triển UI theo kiểu:

"Code trước → thiết kế sau".

Phải chuyển hoàn toàn sang:

"Design trước → Code sau".

============================================================
DỮ LIỆU TEST
============================================================

Trong toàn bộ quá trình redesign:

GIỮ NGUYÊN:

Family Alpha
Family Beta
Family Gamma

và toàn bộ dữ liệu test hiện tại.

KHÔNG:

DROP
TRUNCATE
DELETE
RESET
RE-SEED

database.

Redesign UI phải sử dụng chính dữ liệu test hiện tại để kiểm tra
visual và functional behavior.

============================================================
KẾT QUẢ BẮT BUỘC TRƯỚC KHI BẮT ĐẦU IMPLEMENT
============================================================

Không được bắt đầu redesign code ngay.

Trước tiên phải báo cáo:

1. Tổng số routes.
2. Tổng số screens.
3. Tổng số modals/drawers/dialogs.
4. Bao nhiêu màn hình đã có Stitch.
5. Bao nhiêu màn hình chưa có Stitch.
6. Bao nhiêu màn hình cần redesign.
7. Bao nhiêu màn hình có thể giữ nguyên.
8. Danh sách màn hình cần tạo mới trên Stitch.
9. Danh sách màn hình cần cập nhật trên Stitch.
10. Design System hiện tại.
11. Các điểm không nhất quán của UI hiện tại.

Sau đó:

THỰC HIỆN THIẾT KẾ / CẬP NHẬT TRÊN GOOGLE STITCH.

CHỈ SAU KHI HOÀN THÀNH STITCH SCREEN INVENTORY
MỚI ĐƯỢC CHUYỂN SANG IMPLEMENTATION.

============================================================
FINAL RULE
============================================================

GOOGLE STITCH
     ↓
DESIGN
     ↓
APPROVED DESIGN
     ↓
REACT IMPLEMENTATION
     ↓
VISUAL QA
     ↓
PRODUCTION UI

KHÔNG ĐƯỢC ĐẢO NGƯỢC QUY TRÌNH NÀY.

BẮT ĐẦU BẰNG AUDIT TOÀN BỘ ỨNG DỤNG.
KHÔNG SỬA CODE Ở BƯỚC ĐẦU TIÊN.
============================================================