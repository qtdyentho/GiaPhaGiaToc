# QUY TẮC NGHIỆP VỤ HỆ THỐNG: GIA PHẢ GIA TỘC
# Comprehensive Business Rules & Domain Logic Specification
# Project: Gia Phả Gia Tộc | Version: 1.0.0-RELEASE

Tài liệu này định nghĩa toàn bộ quy tắc nghiệp vụ bất biến cho nền tảng **Gia Phả Gia Tộc**. Mọi thành phần Frontend, Backend Service và Database Stored Functions bắt buộc phải tuân thủ nghiêm ngặt các quy tắc này.

---

## 🏛️ 1. TENANT RULES (QUY TẮC ĐA GIA TỘC)

### `BR-FAM-001`: Cách Ly Dữ Liệu Đa Gia Tộc (Tenant Data Isolation)
- **Mô tả**: Dữ liệu của Gia tộc A tuyệt đối không thể được đọc, chỉnh sửa hoặc truy xuất từ người dùng chỉ thuộc Gia tộc B.
- **Điều kiện**: Mọi câu lệnh truy vấn dữ liệu nghiệp vụ (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- **Hành động**: Tự động áp dụng ràng buộc `family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')` qua Supabase RLS.
- **Ngoại lệ**: SuperAdmin hệ thống có quyền hỗ trợ kỹ thuật tổng quan.
- **Ví dụ**: User A là thành viên Gia tộc "Nguyễn Văn Thủy Tổ" không thể xem Sổ quỹ của Gia tộc "Trần Đăng Dòng Họ".

### `BR-FAM-002`: Hỗ Trợ Đa Gia Tộc Cho Một Tài Khoản (Multi-Family Membership)
- **Mô tả**: Một tài khoản người dùng có thể tham gia nhiều gia tộc khác nhau với các vai trò độc lập.
- **Điều kiện**: Khi người dùng nhận lời mời hoặc khởi tạo gia tộc mới.
- **Hành động**: Tạo một bản ghi mới trong `family_memberships`. Giao diện có `FamilySwitcher` để chuyển đổi ngữ cảnh làm việc.
- **Ngoại lệ**: Không.
- **Ví dụ**: Ông Nguyễn Văn A là `OWNER` của Gia tộc Họ Nguyễn, đồng thời là `VIEWER` của Gia tộc Họ Ngoại (Họ Lê).

### `BR-FAM-003`: Chuyển Giao Quyền Chủ Sở Hữu (Ownership Transfer)
- **Mô tả**: Mỗi gia tộc tại một thời điểm bắt buộc phải có ít nhất một `OWNER`. Không thể hạ quyền hoặc xóa `OWNER` duy nhất nếu chưa chuyển giao quyền sở hữu cho thành viên khác.
- **Điều kiện**: Khi thực hiện hạ quyền hoặc rời gia tộc của `OWNER`.
- **Hành động**: Hệ thống yêu cầu chỉ định `OWNER` kế nhiệm trước khi xác nhận.
- **Ngoại lệ**: Không có.

---

## 👥 2. MEMBERSHIP & RBAC RULES (QUY TẮC PHÂN QUYỀN)

### `BR-MEM-001`: Tính Duy Nhất Của Membership Trong Gia Tộc
- **Mô tả**: Mỗi user chỉ có tối đa một bản ghi thành viên có hiệu lực trong một gia tộc.
- **Điều kiện**: Khi thêm mới thành viên hoặc kích hoạt lời mời.
- **Hành động**: Ràng buộc duy nhất `UNIQUE(family_id, user_id)` được kích hoạt.
- **Ngoại lệ**: Không.

### `BR-MEM-002`: Phân Định Quyền Hạn Theo Ma Trận RBAC (8 Vai Trò)
- **Mô tả**: Quyền thao tác các chức năng được phân định theo 8 vai trò chuẩn:
  * `OWNER`: Toàn quyền quản trị, xóa gia tộc, quản lý gói cước, chỉ định Admin.
  * `ADMIN`: Quản trị nhân sự, phê duyệt thành viên, cấu hình cài đặt gia tộc.
  * `GENEALOGY_ADMIN`: Quản trị cây gia phả, thế hệ (đời), chi phái, hồ sơ thành viên.
  * `TREASURER`: Lập đợt thu quỹ, gán mức thu, ghi nhận thu tiền, lập phiếu chi.
  * `APPROVER`: Phê duyệt hoặc từ chối các phiếu chi do Thủ quỹ lập.
  * `EVENT_MANAGER`: Tạo và quản lý lịch giỗ, sự kiện họ tộc, danh sách tham gia.
  * `MEMBER`: Xem cây gia phả, lịch giỗ, nộp quỹ trực tuyến, tra cứu lịch sử đóng góp.
  * `VIEWER`: Chỉ xem thông tin công khai được cấp phép.
- **Điều kiện**: Khi người dùng gửi request thao tác dữ liệu.
- **Hành động**: Kiểm tra hàm `get_user_family_role(p_family_id)` trước khi thực thi.

---

## 🌳 3. GENEALOGY RULES (QUY TẮC CÂY GIA PHẢ & THẾ HỆ)

### `BR-GEN-001`: Ràng Buộc Thuộc Tính Gia Tộc Cho Nhân Khẩu
- **Mô tả**: Mọi thành viên (`members`), thế hệ (`generations`), chi phái (`branches`) và quan hệ (`member_relationships`) bắt buộc phải gắn với một `family_id` cụ thể.
- **Điều kiện**: Thao tác tạo mới bản ghi gia phả.
- **Hành động**: Kiểm tra `family_id` hợp lệ và gán vào bản ghi.

### `BR-GEN-002`: Chống Quan Hệ Với Chính Mình (No Self-Relationship)
- **Mô tả**: Một thành viên không thể tạo mối quan hệ gia phả với chính bản thân mình.
- **Điều kiện**: Thao tác thêm quan hệ trong `member_relationships`.
- **Hành động**: Ràng buộc `CHECK (member_id != related_member_id)` chặn thao tác và trả về lỗi.

### `BR-GEN-003`: Chống Vòng Lặp Phả Hệ (Anti-Cycle Detection)
- **Mô tả**: Không cho phép tạo quan hệ dẫn đến vòng lặp thế hệ (Ví dụ: A là cha của B, B là cha của C, C không thể là cha của A).
- **Điều kiện**: Khi thêm quan hệ `PARENT` hoặc `CHILD`.
- **Hành động**: Service `GenealogyService.validateNoCycle()` duyệt đồ thị quan hệ để xác nhận không tồn tại chu trình trước khi ghi vào CSDL.

### `BR-GEN-004`: Đồng Bộ Quan Hệ Hai Chiều Hợp Lý
- **Mô tả**: Khi thiết lập A là `PARENT` của B $\rightarrow$ Hệ thống tự động hiểu B là `CHILD` của A. Khi thiết lập A là `SPOUSE` của B $\rightarrow$ B là `SPOUSE` của A.
- **Điều kiện**: Tạo hoặc cập nhật quan hệ gia phả.
- **Hành động**: Tự động liên kết hiển thị trên Cây phả hệ và Tab Gia đình trong Hồ sơ cá nhân.

---

## 🕯️ 4. DEATH & MEMORIAL RULES (QUY TẮC NGƯỜI ĐÃ MẤT & NGÀY GIỖ)

### `BR-MEMORIAL-001`: Bắt Buộc Thông Tin Ngày Mất Khi Chuyển Trạng Thái Đã Mất
- **Mô tả**: Khi đặt `is_deceased = true` (hoặc `status = 'DECEASED'`), thành viên bắt buộc phải có ít nhất một trong hai thông tin: Ngày mất Dương lịch (`date_of_death_solar`) HOẶC Ngày mất Âm lịch (`lunar_day`, `lunar_month`).
- **Điều kiện**: Cập nhật hồ sơ thành viên.
- **Hành động**: Validate form bắt buộc nhập thông tin ngày mất và nơi an táng.

### `BR-MEMORIAL-002`: Lưu Trữ Ngày Giỗ Theo Chu Kỳ Âm Lịch
- **Mô tả**: Ngày giỗ cổ truyền của người Việt Nam được tính và lặp lại hàng năm theo **ÂM LỊCH** (`lunar_day`, `lunar_month`, `is_leap_month`).
- **Điều kiện**: Bản ghi trong bảng `memorial_dates`.
- **Hành động**: Lưu trữ riêng `lunar_day` (1-30), `lunar_month` (1-12), `is_leap_month` (boolean). Tuyệt đối không cố định một ngày Dương lịch cho ngày giỗ hàng năm.

### `BR-MEMORIAL-003`: Tự Động Tính Ngày Giỗ Dương Lịch Hàng Năm
- **Mô tả**: Vào mỗi năm dương lịch cụ thể (VD: 2026, 2027, 2028), hệ thống phải tự động chuyển đổi ngày giỗ Âm lịch sang ngày Dương lịch tương ứng của năm đó để hiển thị trên Lịch và bắn thông báo nhắc nhở.
- **Điều kiện**: Truy vấn Lịch gia tộc hoặc Dashboard.
- **Hành động**: Gọi `LunarCalendarService.calculateNextSolarDate(lunar_day, lunar_month, year, is_leap_month)`.

---

## 🌙 5. LUNAR CALENDAR RULES (QUY TẮC LỊCH ÂM VIỆT NAM)

### `BR-LUNAR-001`: Chuẩn Múi Giờ Quốc Gia UTC+7
- **Mô tả**: Toàn bộ thuật toán thiên văn tính toán ngày sóc, tiết khí và chuyển đổi âm dương áp dụng theo múi giờ chuẩn Việt Nam `Asia/Ho_Chi_Minh` (UTC+7).
- **Điều kiện**: Mọi phép tính lịch âm.
- **Hành động**: Cố định tham số múi giờ là 7.

### `BR-LUNAR-002`: Xử Lý Tháng Nhuận (Leap Month Isolation)
- **Mô tả**: Tháng nhuận trong năm âm lịch phải có cờ `is_leap_month = true`. Ngày 15 tháng 4 nhuận KHÔNG ĐƯỢC coi là ngày 15 tháng 4 thường.
- **Điều kiện**: Khi lưu trữ và tính toán ngày giỗ, sự kiện âm lịch.
- **Hành động**: Lưu trữ và so khớp kèm điều kiện `is_leap_month`.

---

## 📅 6. EVENT RULES (QUY TẮC SỰ KIỆN GIA TỘC)

### `BR-EVT-001`: Phân Cấp Phạm Vi Sự Kiện (Event Scope)
- **Mô tả**: Sự kiện họ tộc có thể áp dụng cho:
  * `FAMILY`: Toàn họ tộc.
  * `BRANCH`: Thuộc một Chi/Phái cụ thể.
  * `SUB_BRANCH`: Thuộc một Phân chi/Nhánh.
  * `INDIVIDUAL`: Sự kiện cá nhân (Mừng thọ cụ, Đám cưới con cháu).
- **Điều kiện**: Tạo mới sự kiện.
- **Hành động**: Gán đúng `scope`, `branch_id`, `member_id` để hiển thị trên lịch của các thành viên liên quan.

---

## 💰 7. FUND & FINANCIAL INTEGRITY RULES (QUY TẮC TÀI CHÍNH & SỔ QUỸ)

### `BR-FUND-001`: Độc Lập Tài Khoản Quỹ (Fund Independence)
- **Mô tả**: Mỗi gia tộc có thể mở nhiều quỹ chuyên biệt (Quỹ họ, Quỹ xây từ đường, Quỹ khuyến học). Số dư mỗi quỹ được quản lý độc lập.
- **Điều kiện**: Tạo giao dịch thu/chi.
- **Hành động**: Bắt buộc chỉ định `fund_id`.

### `BR-INCOME-001`: Phân Biệt Tuyệt Đối Giữa Phải Thu (Assessment) & Thực Thu (Payment)
- **Mô tả**:
  * `amount_due` (Nghĩa vụ phải thu): Thể hiện định mức thành viên cần đóng. **Assessment KHÔNG làm tăng số dư quỹ**.
  * `amount_paid` (Thực thu): Tiền mặt hoặc chuyển khoản đã ghi nhận thực tế. **Chỉ thực thu mới tạo giao dịch `INCOME` và làm tăng số dư quỹ**.
- **Điều kiện**: Mọi thao tác tài chính.
- **Hành động**: 
  * Tạo assessment $\rightarrow$ Ghi vào `income_assessments`, `status = 'PENDING'`, số dư quỹ giữ nguyên.
  * Thu tiền $\rightarrow$ Tạo `financial_transactions` (`status = 'POSTED'`), cập nhật `income_assessments.amount_paid`, tăng số dư quỹ `funds.current_balance`.

### `BR-INCOME-005`: Trạng Thái Nghĩa Vụ Thu
- **Mô tả**: Trạng thái của `income_assessments` được xác định như sau:
  * `PENDING`: Khi `amount_paid = 0`.
  * `PARTIAL`: Khi `0 < amount_paid < amount_due`.
  * `PAID`: Khi `amount_paid >= amount_due`.
  * `WAIVED`: Miễn đóng (Người cao tuổi, hoàn cảnh khó khăn).
- **Điều kiện**: Sau mỗi lần ghi nhận thanh toán.
- **Hành động**: Stored Function `record_income_payment` tự động cập nhật trạng thái tương ứng.

### `BR-INCOME-010`: Gán Mức Thu Hàng Loạt (Bulk Assessment)
- **Mô tả**: Hệ thống cho phép chọn 86+ thành viên theo Đời/Chi và tạo đợt thu đồng loạt (Ví dụ: 86 thành viên $\times$ 500.000đ).
- **Điều kiện**: Khi phát động chiến dịch thu quỹ giỗ tổ, xây nhà thờ.
- **Hành động**: Tạo 86 bản ghi độc lập trong `income_assessments`. Nếu thành viên đã có nghĩa vụ trong đợt thu này thì bỏ qua (chống trùng lặp).

### `BR-EXP-001`: Quy Trình Phê Duyệt Khoản Chi 4 Bước
- **Mô tả**: Khoản chi phải tuân theo quy trình kiểm soát chặt chẽ:
  `DRAFT` (Thủ quỹ tạo) $\rightarrow$ `PENDING_APPROVAL` (Gửi duyệt) $\rightarrow$ `APPROVED` (Trưởng ban/Kiểm soát duyệt) $\rightarrow$ `POSTED` (Xuất quỹ).
- **Điều kiện**: Mọi khoản chi từ quỹ gia tộc.
- **Hành động**: Chỉ khi ở trạng thái `POSTED` mới tạo `financial_transactions` loại `EXPENSE` và giảm `funds.current_balance`.
- **Ngoại lệ**: Nếu chính sách gia tộc cấu hình chi dưới 500.000đ tự động duyệt thì bỏ qua bước `PENDING_APPROVAL`.

### `BR-APP-001`: Chống Tự Duyệt Chi (Separation of Duties)
- **Mô tả**: Người tạo phiếu chi (`expense_records.created_by`) không được phép tự duyệt phiếu chi của chính mình nếu vai trò không phải là `OWNER`.
- **Điều kiện**: Thao tác duyệt chi.
- **Hành động**: Chặn thao tác duyệt nếu `created_by = auth.uid()` và trả về thông báo vi phạm quy chế tài chính.

### `BR-LEDGER-001`: Tính Bất Biến Của Sổ Quỹ (Immutable Financial Ledger)
- **Mô tả**: Tuyệt đối **KHÔNG ĐƯỢC PHÉP XÓA VẬT LÝ (`DELETE`)** bất kỳ giao dịch tài chính nào đã ở trạng thái `POSTED`.
- **Điều kiện**: Yêu cầu hủy giao dịch đã ghi sổ.
- **Hành động**: Chặn lệnh `DELETE`. Bắt buộc thực hiện **Bút Toán Đảo Ngược (`REVERSAL`)** qua hàm `reverse_financial_transaction(tx_id, reason)`.

### `BR-REV-001`: Quy Tắc Đảo Ngược Bút Toán (Reversal Rules)
- **Mô tả**: Khi thực hiện Reversal:
  1. Đánh dấu giao dịch gốc là `REVERSED`.
  2. Tạo một giao dịch mới với `transaction_type = 'REVERSAL'`, số tiền đối ứng và tham chiếu `reference_transaction_id`.
  3. Hoàn trả số dư quỹ ban đầu.
  4. Bắt buộc nhập lý do hủy và tự động ghi `audit_logs`.
- **Điều kiện**: Khi phát hiện sai sót số tiền hoặc nhầm đối tượng.
- **Hành động**: Thực thi nguyên tử trong một database transaction.

---

## 🎁 8. CONTRIBUTIONS & SPONSORSHIPS RULES (QUY TẮC CÔNG ĐỨC & TÀI TRỢ)

### `BR-CONTRIB-001`: Đóng Góp Tự Nguyện
- **Mô tả**: Con cháu có thể đóng góp tự nguyện số tiền tùy tâm (không bắt buộc có định mức `amount_due`).
- **Điều kiện**: Tiếp nhận tiền đóng góp.
- **Hành động**: Tạo bản ghi trong `contributions` và tự động sinh giao dịch `INCOME` vào quỹ chỉ định.

### `BR-SPONSOR-001`: Bảng Vàng Tài Trợ & Công Đức Lớn
- **Mô tả**: Các khoản tài trợ lớn từ doanh nghiệp con em gia tộc, cá nhân hảo tâm được ghi danh trên Bảng Vàng vinh danh và liên kết vào quỹ/sự kiện cụ thể.
- **Điều kiện**: Thêm mới tài trợ trong `sponsorships`.
- **Hành động**: Lưu thông tin nhà tài trợ (`MEMBER`, `BUSINESS`, `ORGANIZATION`), số tiền, mục đích và in giấy ghi nhận công đức.

---

## 💳 9. SUBSCRIPTION & BILLING RULES (QUY TẮC GÓI DỊCH VỤ)

### `BR-BILL-001`: Thuê Bao Thuộc Về Gia Tộc (Family-Level Subscription)
- **Mô tả**: Gói cước dịch vụ thuộc về thực thể `family`, KHÔNG thuộc về tài khoản `user`.
- **Điều kiện**: Mọi kiểm tra quyền và hạn mức tính năng.
- **Hành động**: Truy vấn gói cước qua `subscriptions` của `family_id`.

### `BR-BILL-002`: Chế Độ Chỉ Đọc Khi Hết Hạn Gói Cước (Read-Only Grace Mode)
- **Mô tả**: Khi gói cước gia tộc hết hạn (và hết thời gian ân hạn 7 ngày), hệ thống chuyển sang trạng thái `READ_ONLY`.
  * **Được phép**: Xem cây gia phả, xem ngày giỗ, tra cứu lịch, xem sổ quỹ và xuất báo cáo lịch sử.
  * **Bị khóa**: Thêm mới thành viên, tạo sự kiện mới, tạo đợt thu mới, chi quỹ, upload ảnh vượt dung lượng.
  * **BẢO TỒN DỮ LIỆU**: **TUYỆT ĐỐI KHÔNG XÓA DỮ LIỆU** của gia tộc khi hết hạn gói cước.
- **Điều kiện**: `subscriptions.status IN ('EXPIRED', 'SUSPENDED', 'READ_ONLY')`.
- **Hành động**: Hiển thị Banner cảnh báo và chặn các mutation API không thuộc gói Free.

---

## 🛡️ 10. AUDIT TRAIL RULES (QUY TẮC KIỂM TOÁN HỆ THỐNG)

### `BR-AUDIT-001`: Bắt Buộc Ghi Nhật Ký Các Thao Tác Trọng Yếu
- **Mô tả**: Mọi hành động thêm/sửa/xóa thành viên, duyệt chi, đảo ngược giao dịch, thay đổi vai trò RBAC, cài đặt gia tộc đều bắt buộc phải ghi lại trong `audit_logs` gồm: `user_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data`, `created_at`.
- **Điều kiện**: Thực thi thao tác CUD hoặc duyệt/đảo ngược.
- **Hành động**: Tự động chèn bản ghi vào `audit_logs`. Người dùng thông thường không có quyền xóa audit log.

---

## 🔔 11. NOTIFICATION RULES (QUY TẮC THÔNG BÁO & NHẮC LỊCH)

### `BR-NOTIF-001`: Lịch Trình Nhắc Giỗ & Sự Kiện Tự Động
- **Mô tả**: Hệ thống tự động gửi thông báo nhắc ngày giỗ và sự kiện gia tộc theo cấu hình:
  * Trước 30 ngày (Chuẩn bị kế hoạch & kinh phí).
  * Trước 15 ngày & 7 ngày (Nhắc nhở con cháu sắp xếp thời gian).
  * Trước 3 ngày & 1 ngày (Thông báo giờ làm lễ, địa điểm từ đường).
- **Điều kiện**: Cron Job / Edge Function quét hàng ngày lúc 06:00 AM UTC+7.
- **Hành động**: Tạo bản ghi trong `notifications` và gửi Email/Push Notification cho các thành viên kích hoạt nhận tin.

---

## 📊 12. REPORTING RULES (QUY TẮC BÁO CÁO TÀI CHÍNH)

### `BR-REPORT-001`: Cơ Sở Lập Báo Cáo Tài Chính
- **Mô tả**: Toàn bộ báo cáo tài chính (Thu, Chi, Tồn quỹ) **BẮT BUỘC PHẢI DỰA TRÊN CÁC GIAO DỊCH ĐÃ `POSTED`** trong `financial_transactions`. Tuyệt đối không tính tiền từ các khoản thu chưa nộp (`PENDING` assessments).
- **Điều kiện**: Mọi màn hình báo cáo tài chính và biểu đồ.
- **Hành động**: Áp dụng công thức: `Closing Balance = Opening Balance + SUM(Posted Income) - SUM(Posted Expense) + SUM(Adjustments)`.
