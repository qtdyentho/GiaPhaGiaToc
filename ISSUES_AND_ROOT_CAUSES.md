# BẢNG THỐNG KÊ TOÀN BỘ LỖI & NGUYÊN NHÂN GỐC RỄ (ISSUES & ROOT CAUSES LOG)
## Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ — GiaPhaGiaToc Enterprise SaaS

> **Trí Nhớ Dự Án & Phiên Làm Việc (Agent Memory)**  
> *Tài liệu này ghi nhận và cập nhật tự động toàn bộ các sự cố kỹ thuật, nguyên nhân gốc rễ, giải pháp triệt để và quy tắc phòng ngừa hồi quy trong suốt vòng đời phát triển.*

---

## 📑 Danh Mục Toàn Bộ Các Sự Cố Đã Gặp & Khắc Phục

| Mã Lỗi | Hạng Mục | Mô Tả Hiện Tượng | Mức Độ | Trạng Thái |
|:---|:---|:---|:---:|:---:|
| **ERR-001** | Multi-Tenancy Data Leak | Dữ liệu mẫu dòng họ cũ ("Đại Tộc Nguyễn Văn") hiển thị trên dòng họ mới lập | **CRITICAL** | ✅ Đã khắc phục triệt để |
| **ERR-002** | ShortLink Slug Generation | Rút gọn link `/c/:slug` bị gán cứng `dai-toc-nguyen-van` cho mọi dòng họ | **HIGH** | ✅ Đã khắc phục triệt để |
| **ERR-003** | Modal UI Z-Index Conflict | Modal in Mã QR Từ Đường bị thanh Sidebar bên trái đè lên hoặc che khuất | **MEDIUM** | ✅ Đã khắc phục triệt để |
| **ERR-004** | Cultural Asset Authenticity | Mẫu ảnh Từ đường gợi ý ngẫu nhiên chứa ảnh không phù hợp văn hóa Việt | **MEDIUM** | ✅ Đã khắc phục triệt để |
| **ERR-005** | Image Storage & Performance | Tải ảnh dung lượng lớn làm chậm hiển thị và tốn bộ nhớ lưu trữ CSDL | **HIGH** | ✅ Đã khắc phục triệt để |
| **ERR-006** | UI Navigation Ergonomics | Menu danh mục Lưu Ký & Ký Sự Gia Tộc bị cuộn ngang gây bất tiện trên PC/Mobile | **LOW** | ✅ Đã khắc phục triệt để |
| **ERR-007** | Theme Consistency | Thiếu lớp hỗ trợ Dark Mode ở một số Modal và trang Sổ Quỹ / Thành Viên | **LOW** | ✅ Đã khắc phục triệt để |
| **ERR-008** | Multi-Tenant IDOR Security | Người dùng có thể đổi `family_id` trong request để xem dòng họ khác | **CRITICAL** | ✅ Đã khắc phục triệt để |
| **ERR-009** | PIN Security & Brute-Force | Nguy cơ tấn công dò quét mã PIN mở khóa Gia Phả qua Mã QR Từ Đường | **CRITICAL** | ✅ Đã khắc phục triệt để |
| **ERR-010** | Manual Payment Idempotency | Rủi ro kích hoạt trùng lặp gói cước khi Super Admin bấm duyệt chuyển khoản 2 lần | **HIGH** | ✅ Đã khắc phục triệt để |
| **ERR-011** | Data Import Schema Constraints | Lỗi không lưu được thành viên vào CSDL Supabase do lệch tên cột schema và enum quan hệ | **HIGH** | ✅ Đã khắc phục triệt để |
| **ERR-012** | Subscription & Settings Isolation | Gói dịch vụ và Cài đặt hiển thị dữ liệu Mock ảo và không lưu cập nhật về CSDL Supabase | **HIGH** | ✅ Đã khắc phục triệt để |
| **ERR-013** | Direct Supabase Excel Persistence | Thông báo nạp vào bộ nhớ do không phân giải UUID `familyId` dẫn đến bỏ qua nạp CSDL Supabase | **HIGH** | ✅ Đã khắc phục triệt để |

---

## 🔍 Phân Tích Chi Tiết Từng Lỗi, Nguyên Nhân & Giải Pháp

### 1. ERR-001: Dữ Liệu Dòng Họ Khác Bị Rò Rỉ Sang Dòng Họ Mới (Multi-Tenancy Isolation)
- **Hiện tượng**: Khi tạo tài khoản mới hoặc tạo dòng họ mới trên Supabase, Dashboard và các trang vẫn hiển thị 86 thành viên, 24 bút toán, hoặc tên dòng họ "Đại Tộc Nguyễn Văn".
- **Nguyên nhân gốc rễ (Root Cause)**:
  1. Trong `AuthContext.tsx`, hàm `signIn` có fallback `setActiveFamily(firstFam || mockFamily)`. Khi tài khoản mới chưa có dòng họ liên kết, biến `firstFam` là `null` dẫn đến hệ thống tự động gán `mockFamily` làm dòng họ hiện tại.
  2. Trong `FundService.ts`, hàm `createBulkAssessment` khởi tạo `let allMembers = [...mockMembers]` trước khi lọc.
  3. Trong `DashboardPage.tsx`, các thẻ KPI có điều kiện `(currentFamily.id === mockFamily.id ? 86 : 1)` gây hiển thị số liệu ảo.
- **Giải pháp xử lý triệt để**:
  - Gỡ bỏ toàn bộ fallback về `mockFamily` trong `AuthContext.tsx`. Nếu tài khoản chưa có dòng họ, đặt `activeFamily = null` để hệ thống điều hướng sạch về trang tạo/gia nhập dòng họ.
  - Khởi tạo `allMembers: Member[] = []` trong `FundService.ts`.
  - Loại bỏ toàn bộ `import { mockFamily }` và các điều kiện gán cứng số liệu trong `DashboardPage.tsx`, `MembersListPage.tsx`, `FamilySettingsPage.tsx`, `MemberProfilePage.tsx`.
- **Biện pháp phòng ngừa (Regression Guard)**: Bộ test `TENANT-001` đến `TENANT-006` và `tests/multi_tenant_isolation.test.ts` chạy tự động với UUID v4 ngẫu nhiên trước mỗi bản build.

---

### 2. ERR-002: Rút Gọn Link Không Hoạt Động & Gán Cứng Tên Dòng Họ
- **Hiện tượng**: Tính năng rút gọn link chia sẻ Zalo / Mã QR hiển thị `/c/dai-toc-nguyen-van` cho mọi gia tộc (kể cả Trịnh Lưu Gia Tộc).
- **Nguyên nhân gốc rễ**:
  1. Trong `ShortLinkService.ts` hàm `getShortLinkByFamily`, khi một dòng họ chưa có bản ghi trong bảng `clan_short_links`, mã nguồn gọi `slugifyVietnamese(mockFamily.name)`.
  2. Hàm `PrintableClanQRCodeModal.tsx` lấy `shortCode || 'dai-toc-nguyen-van'`.
- **Giải pháp xử lý triệt để**:
  - Viết lại `ShortLinkService.ts`: Mọi hàm tự động nhận `familyName` và sinh slug chuẩn 100% tiếng Việt không dấu (Ví dụ: *"Trịnh Lưu Gia Tộc"* -> `/c/trinh-luu-gia-toc`).
  - Tự động ghi nhận và lưu slug vào bảng `clan_short_links` trên Supabase ngay khi mở modal.
  - Bổ sung tính năng inline editor *"✏️ Đổi tên link"* ngay trên Modal cho phép Trưởng tộc tùy chỉnh và lưu slug tức thì.
- **Biện pháp phòng ngừa**: Bộ test `SHORT-001` đến `SHORT-009` trong `tests/clan_short_link.test.ts`.

---

### 3. ERR-003: Xung Đột Z-Index Khiến Modal Bị Sidebar Đè Lên
- **Hiện tượng**: Modal in mã QR Từ Đường và một số modal lớn bị thanh điều hướng bên trái (Sidebar) đè lên hoặc che khuất nội dung bên trái.
- **Nguyên nhân gốc rễ**: `AppSidebar` có thuộc tính `z-50`, trong khi Modal `PrintableClanQRCodeModal` cũng chỉ đặt `z-50` trong cùng một stacking context.
- **Giải pháp xử lý triệt để**: Nâng cấp `z-index` của các Modal lên **`z-[100]`** kèm lớp phủ `fixed inset-0 bg-slate-950/80 backdrop-blur-sm`, đảm bảo modal luôn nằm trên cùng của màn hình.

---

### 4. ERR-004: Mẫu Ảnh Từ Đường Gợi Ý Sai Lệch Văn Hóa Việt
- **Hiện tượng**: Bộ sưu tập ảnh mẫu Từ đường gợi ý chứa ảnh không đúng (hình máy chơi game PlayStation, vũ công ba-lê, chó đeo áo len...).
- **Nguyên nhân gốc rễ**: Trước đây sử dụng ID ảnh ngẫu nhiên từ Unsplash quốc tế.
- **Giải pháp xử lý triệt để**:
  - Tải về và tích hợp trực tiếp 4 ảnh bản sắc cổ truyền Việt Nam vào thư mục tĩnh nội bộ `public/images/presets/`: Nhà gỗ 3 gian sân gạch đỏ hoa cúc vạn thọ, Gian thờ sơn son thiếp vàng hoành phi câu đối "Phụng Tiên Tư", Khuôn viên hồ bán nguyệt cây đa bến nước, Khu lăng mộ đá mỹ nghệ uy nghiêm.
  - Bổ sung 2 đường dẫn tư liệu kiến trúc nhà gỗ cổ 3 gian 2 chái (`villagold.vn`) và ngói mũi hài.
  - Cập nhật `ANCESTRAL_HALL_PRESETS` trong `src/lib/imageCompressor.ts` và `ClanChronicleService.ts`.

---

### 5. ERR-005: Dung Lượng Ảnh Tải Lên Quá Lớn Gây Chậm Hiển Thị
- **Hiện tượng**: Ảnh chụp từ điện thoại (5MB - 15MB) tải lên trực tiếp làm chậm tốc độ load trang và tốn dung lượng lưu trữ CSDL.
- **Giải pháp xử lý triệt để**:
  - Xây dựng thư viện nén ảnh Client-side HTML5 Canvas WebP (`src/lib/imageCompressor.ts`).
  - Tự động nén ảnh xuống dưới 300KB (giảm 70-90% dung lượng) trước khi đẩy lên Supabase hoặc lưu trữ.
  - Áp dụng các thuộc tính `loading="lazy"` và `decoding="async"` trên toàn bộ thẻ ảnh.

---

### 6. ERR-006: Menu Danh Mục Lưu Ký & Ký Sự Bị Tràn & Phải Cuộn Ngang
- **Hiện tượng**: Trên trang Lưu Ký Gia Tộc (`ClanChroniclesPage.tsx`), danh sách các thẻ danh mục bị bọc trong khung `overflow-x-auto`, người dùng phải cuộn ngang chuột để tìm danh mục.
- **Giải pháp xử lý triệt để**:
  - Gỡ bỏ `overflow-x-auto`, chuyển sang bố cục mở `flex-wrap gap-2`.
  - Tích hợp huy hiệu đếm số lượng bài viết thời gian thực bên cạnh tên danh mục (ví dụ: `📜 Tất cả (3)`, `🏮 Ký Sự Giỗ Tổ (1)`).

---

### 7. ERR-007: Thiếu Dark Mode Tại Một Số Màn Hình
- **Hiện tượng**: Khi chuyển sang chế độ Tối (Dark Mode), một số bảng biểu, thẻ thống kê và Modal vẫn giữ màu nền trắng sáng gây chói mắt.
- **Giải pháp xử lý triệt để**: Rà soát và bổ sung đồng bộ các lớp `dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-white`, `dark:text-slate-300`, `dark:divide-slate-800` trên toàn bộ các trang và Modal.

---

### 8. ERR-008: Lỗ Hổng Bảo Mật Chuyển Đổi Dòng Họ (IDOR Guard)
- **Hiện tượng**: Người dùng có thể can thiệp tham số `family_id` trong localStorage / sessionStorage để truy cập trái phép dòng họ khác.
- **Giải pháp xử lý triệt để**:
  - Thắt chặt hàm `switchFamily(targetFamilyId)` trong `AuthContext.tsx`: Bắt buộc kiểm tra `memberships.some(m => m.family_id === targetFamilyId)` trước khi cho phép chuyển đổi.
  - Thiết lập chính sách Supabase Row-Level Security (RLS) cách ly đa người dùng (Multi-tenant) tầng cơ sở dữ liệu.

---

### 9. ERR-009: Nguy Cơ Tấn Công Dò Quét Mã PIN Mở Khóa Gia Phả
- **Hiện tượng**: Khi con cháu quét mã QR Từ Đường, nếu không có cơ chế giới hạn số lần nhập sai, kẻ gian có thể dùng bot dò mã PIN 4-6 số.
- **Giải pháp xử lý triệt để**:
  - Mã hóa PIN bằng thuật toán Salted SHA-256 một chiều không thể dịch ngược.
  - Cài đặt cơ chế bảo vệ Brute-Force trong `ClanPassService.ts`: Tự động khóa truy cập 15 phút (`locked_until`) nếu nhập sai liên tiếp 5 lần.

---

### 10. ERR-010: Rủi Ro Kích Hoạt Trùng Lặp Gói Cước Khi Duyệt Thủ Công
- **Hiện tượng**: Super Admin bấm xác nhận thanh toán nhiều lần trên cùng một hóa đơn có thể gây nhân bản giao dịch và sai lệch hạn dùng thuê bao.
- **Giải pháp xử lý triệt để**: Triển khai cơ chế Idempotency Guard trong `AdminBillingService.ts`: Kiểm tra trạng thái hóa đơn trước khi cập nhật. Nếu hóa đơn đã ở trạng thái `PAID`, từ chối xử lý và báo lỗi an toàn `ALREADY_PROCESSED`.

---

### 11. ERR-011: Lỗi Không Lưu Được Dữ Liệu Excel Vào Supabase Do Sai Cấu Trúc Schema & Enum
- **Hiện tượng**: Sau khi tải file Excel và bấm "Xác nhận nạp", dữ liệu không lưu được vào CSDL và không hiển thị trên Cây Gia Phả.
- **Nguyên nhân gốc rễ (Root Cause)**:
  1. Trong `commitImport`, thao tác tạo `branches` thiếu cột `code` bắt buộc (NOT NULL), gây lỗi database constraint.
  2. Thao tác chèn `members` truyền các trường `first_name`, `last_name` không có trong bảng `members` của Supabase (bảng chỉ có `full_name`).
  3. Thao tác chèn `member_relationships` truyền `relationship_type = 'FATHER'`, nhưng enum PostgreSQL chỉ chấp nhận `'PARENT'`, `'CHILD'`, `'SPOUSE'`.
  4. Thao tác chèn `memorial_dates` truyền `title`, `is_lunar` không tồn tại trong bảng `memorial_dates`.
  5. Cột "Thế Hệ (Đời)" trong một số file Excel của người dùng để trống hoặc viết chữ ("Thủy tổ", "Đời II"), dẫn đến `generationNumber = 0`.
- **Giải pháp xử lý triệt để**:
  - Cập nhật chuẩn hóa 100% payload chèn CSDL khớp chính xác với `DATABASE_SCHEMA.sql`.
  - Tích hợp **Thuật toán tự động nhận diện & suy luận thế hệ (Topological BFS Generation Inference)**: Tự động chuyển đổi số La Mã, từ khóa tiếng Việt ("Thủy tổ", "Đời thứ 2"), và tự động lan truyền thế hệ từ Cha sang Con (`gen(child) = gen(parent) + 1`) và giữa Vợ - Chồng (`gen(spouse) = gen(partner)`).
  - Cập nhật `GenealogyCanvas.tsx` để hỗ trợ hiển thị đệ quy đa chiều cho cả quan hệ `PARENT` và `CHILD`.
- **Biện pháp phòng ngừa**: Bộ test `data_import_12_columns.test.ts` (6/6 PASS).

---

### 12. ERR-012: Gói Dịch Vụ & Cài Đặt Hiển Thị Số Liệu Ảo Và Không Lưu Cập Nhật Lên Supabase
- **Hiện tượng**:
  1. Trang `BillingOverviewPage.tsx` hiển thị cố định "86/300 thành viên, 1.24 GB lưu trữ, 3 chi phái, hóa đơn cũ" của dòng họ mẫu dù đang đăng nhập dòng họ khác.
  2. Trang `FamilySettingsPage.tsx` khi người dùng thay đổi tên dòng họ, địa chỉ từ đường, mô tả hoặc ảnh từ đường, hệ thống chỉ cập nhật biến cục bộ mà không lưu vào bảng `families` trên Supabase (khi refresh trang bị mất).
- **Nguyên nhân gốc rễ**:
  1. `BillingOverviewPage.tsx` import tĩnh `mockActiveSubscription, mockPlans, mockInvoices, mockUsageCounters` và render số liệu cứng.
  2. `SubscriptionService.getSubscription` và `InvoiceService.getInvoices` khi không tìm thấy bản ghi cho `familyId` mới đã fallback về `mockActiveSubscription` và `mockInvoices`.
  3. `AuthContext.updateFamily` chỉ cập nhật mảng React state `families` mà không thực hiện gọi `supabase.from('families').update(...)`.
- **Giải pháp xử lý triệt để**:
  - Viết lại `BillingOverviewPage.tsx`: Tính toán số lượng thành viên thực tế (`members.length`), chi phái thực tế (`branches.length`), và hóa đơn thực tế của dòng họ đang chọn (`activeFamily.id`).
  - Viết lại `SubscriptionService.getSubscription` và `InvoiceService.getInvoices`: Khởi tạo đối tượng Trialing/Free độc lập cho dòng họ mới với giá trị 0đ, trả về `[]` hóa đơn nếu chưa phát sinh giao dịch.
  - Cập nhật `AuthContext.updateFamily`: Thực hiện cập nhật trực tiếp vào bảng `families` trên Supabase với các trường `name`, `description`, `ancestral_hall`, `cover_url`, `updated_at`.
- **Biện pháp phòng ngừa**: Đã kiểm thử qua `npm test` (16 test suites PASS) và `npm run build` PASS 100%.

---

### 13. Lỗi Nạp Gia Phả Excel: Thông Báo "Nạp Vào Bộ Nhớ" & Bỏ Qua CSDL Supabase (Mã lỗi: `ERR-013`)
- **Hiện tượng**: Khi người dùng tải file Excel 153 thành viên lên và bấm xác nhận nạp, hệ thống hiển thị thông báo *"Đã nạp thành công đợt IMPORT-... gồm 153 thành viên vào bộ nhớ"* thay vì lưu trực tiếp vào CSDL Supabase của dòng họ.
- **Nguyên nhân gốc rễ**:
  1. Trong `DataImportService.commitImport`, điều kiện kiểm tra `isSupabaseConfigured() && isUUID(familyId)` bị `false` khi `familyId` mang định dạng chuỗi cục bộ (VD: `fam-...`), khiến tiến trình bỏ qua nhánh gọi Supabase và nhảy vào fallback bộ nhớ.
  2. `AuthContext.createFamily` trước đây sinh mã `fam-${Date.now()}` thay vì lưu trực tiếp bản ghi vào bảng `families` của Supabase để lấy UUID thực thể.
  3. `GenealogyService.getFamilyTree` cũng kiểm tra `isUUID(familyId)` khắt khe dẫn đến không tải cây phả từ Supabase khi `familyId` chưa chuẩn UUID v4.
- **Giải pháp xử lý triệt để**:
  - Viết lại `DataImportService.commitImport`: Tự động phân giải và đối soát `targetFamilyUUID` từ bảng `families` trên Supabase. Đảm bảo toàn bộ 153 thành viên, thế hệ (`generations`), chi phái (`branches`), quan hệ cha con - vợ chồng (`member_relationships`) và ngày giỗ (`memorial_dates`) được nạp nguyên tử 100% vào CSDL Supabase của dòng họ.
  - Cập nhật `AuthContext.createFamily`: Tự động insert dòng họ mới trực tiếp vào bảng `families`, `family_memberships` và 3 quỹ mặc định trên Supabase.
  - Cập nhật `GenealogyService.getFamilyTree`: Tự động phân giải UUID dòng họ từ Supabase để luôn hiển thị chính xác cây gia phả và danh sách thành viên thực tế.
  - Đổi thông điệp kết quả: Hiển thị minh bạch *"Đã nạp thành công X thành viên, liên kết Y quan hệ và Z ngày giỗ trực tiếp vào CSDL Supabase của dòng họ"*.
- **Biện pháp phòng ngừa**: Đã bổ sung cơ chế UUID Smart Matching và xác minh qua toàn bộ 16 Test Suites (`npm test`) và `npm run build` PASS 100%.

---

## 🛡️ Quy Trình Phòng Ngừa Lỗi Hồi Quy (Zero Regression Policy)

Mọi thay đổi mã nguồn trong các phiên làm việc tiếp theo bắt buộc phải:
1. Chạy toàn bộ **16 Test Suites (`npm test`)** xác nhận 100% PASS.
2. Kiểm tra biên dịch **`npm run build`** xác nhận 0 lỗi TypeScript.
3. Cập nhật các trường hợp lỗi mới vào tệp này sau mỗi phiên làm việc.
