# BÁO CÁO RÀ SOÁT NGÔN NGỮ & BẢNG ÁNH XẠ CHUYỂN ĐỔI UX WRITING
# PHASE 6.X-CONTENT: HERITAGE LEDGER — GLOBAL UX WRITING & HUMAN LANGUAGE RECONCILIATION

---

## 📊 1. TỔNG HỢP KẾT QUẢ RÀ SOÁT (EXECUTIVE SUMMARY)

- **Tổng số mục nội dung rà soát**: 168 mục text/label/message/badge trên 59 màn hình & component.
- **Số thuật ngữ kỹ thuật / developer-oriented phát hiện**: 42 mục (ví dụ: `Financial Core v2.0`, `BR-REV-001`, `BR-REMINDER-001`, `POSTED`, `REVERSED`, `READ_ONLY`, `Immutable Ledger`, `Idempotency`).
- **Số từ ngữ tiếng Anh / SaaS Jargon không cần thiết**: 28 mục (ví dụ: `Interactive`, `Tenant`, `SaaS`, `Live Beta`, `Audit Trail`, `Dev Panel`).
- **Số câu văn máy móc / thiếu tự nhiên**: 24 mục.
- **Số menu điều hướng cần chuẩn hóa thuần Việt**: 12 mục.
- **Số thông báo lỗi / trạng thái cần viết lại tự nhiên**: 36 mục.

---

## 📑 2. BẢNG CHI TIẾT ÁNH XẠ CHUYỂN ĐỔI NGÔN NGỮ (CONTENT RECONCILIATION MATRIX)

### A. MENU & ĐIỀU HƯỚNG (NAVIGATION & SIDEBAR)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `AppSidebar.tsx:35` | `Bảng Điều Khiển` | `Tổng Quan` | Ngắn gọn, thân thiện, chuẩn hóa theo quy tắc chung. |
| `AppSidebar.tsx:41` | `badge: 'Interactive'` | *(Xóa badge tiếng Anh)* | Không dùng tiếng Anh trang trí thừa thãi. |
| `AppSidebar.tsx:48` | `Lịch Gia Tộc (Âm/Dương)` | `Lịch Gia Tộc` | Tự nhiên, ngắn gọn, ngầm hiểu có cả âm và dương lịch. |
| `AppSidebar.tsx:58` | `Sổ Quỹ Bất Biến` | `Sổ Quỹ Gia Tộc` | Tránh dùng từ kỹ thuật "bất biến" (immutable) gây khó hiểu cho người cao tuổi. |
| `AppSidebar.tsx:68` | `DỊCH VỤ & THUÊ BAO` | `GÓI DỊCH VỤ` | Bỏ từ "thuê bao" (SaaS/Telco jargon). |
| `AppSidebar.tsx:78` | `Duyệt Thanh Toán (Admin)` | `Duyệt Thanh Toán` | Bỏ chữ "(Admin)" thừa thãi trong menu quản trị. |
| `AppSidebar.tsx:79` | `Trung Tâm Chỉ Huy Beta` | `Kiểm Soát Vận Hành` | Bỏ từ "Chỉ huy Beta" mang tính máy móc/AI. |

---

### B. TIÊU ĐỀ TRANG & MÔ TẢ (PAGE TITLES & SUBTITLES)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `FinanceDashboardPage.tsx:88` | `Financial Core v2.0` | `Sổ Quỹ Minh Bạch` | Bỏ thuật ngữ kỹ thuật developer "Financial Core v2.0". |
| `FinanceDashboardPage.tsx:89` | `Bất biến 100%` | `Ghi Sổ Chuẩn Mực` | Diễn đạt tự nhiên theo nghiệp vụ kế toán dòng họ. |
| `FinanceDashboardPage.tsx:91` | `Kế toán kép bất biến, minh bạch tuyệt đối 100% dòng tiền` | `Ghi chép thu chi minh bạch, lưu truyền lịch sử quỹ dòng họ qua các thế hệ` | Giọng văn trang trọng, truyền thống, ấm áp. |
| `FundLedgerPage.tsx:101` | `badge: 'Immutable Ledger'` | `badge: 'Lưu Trữ Vĩnh Viễn'` | Bỏ từ tiếng Anh "Immutable Ledger". |
| `FundLedgerPage.tsx:105` | `Mọi bút toán POSTED không xóa vật lý, chỉ cho phép đảo ngược đối ứng (BR-REV-001)` | `Mọi khoản thu chi đã ghi sổ đều được lưu giữ vĩnh viễn, trường hợp sai sót sẽ thực hiện bút toán hoàn trả đối ứng` | Loại bỏ mã code kỹ thuật `BR-REV-001` và từ `POSTED`. |
| `ExpensesPage.tsx:84` | `badge: 'BR-EXP-001'` | `badge: 'Duyệt Chi 2 Cấp'` | Loại bỏ mã rule backend `BR-EXP-001`. |
| `IncomeAssessmentsPage.tsx:100` | `badge: 'BR-FUND-001'` | `badge: 'Bổ Phần Định Kỳ'` | Loại bỏ mã rule backend `BR-FUND-001`. |
| `ReminderSettingsPage.tsx:61` | `badge: 'BR-REMINDER-001'` | `badge: 'Nhắc Lịch Tự Động'` | Loại bỏ mã rule backend `BR-REMINDER-001`. |
| `EventDetailPage.tsx:124` | `Đối soát trực tiếp từ Sổ Cái Bất Biến (Phase 2 Financial Core)` | `Trích xuất tự động từ sổ quỹ dòng họ` | Bỏ `Phase 2 Financial Core`. |
| `LandingPage.tsx:18` | `Heritage Ledger SaaS` | `Nền Tảng Gia Phả & Quản Trị Gia Tộc` | Bỏ từ `SaaS`. |

---

### C. BẢNG VÀNG CÔNG ĐỨC & VINH DANH (HONOR ROLL & CONTRIBUTIONS)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `HonorRollPage.tsx:103` | `Heritage Ledger • Niên Hiệu 2026` | `Sổ Vàng Tri Ân • Niên Hiệu Bính Ngọ 2026` | Đậm đà bản sắc văn hóa truyền thống Việt Nam. |
| `HonorRollPage.tsx:107` | `🏆 BẢNG VÀNG CÔNG ĐỨC & TÀI TRỢ DÒNG HỌ` | `🏆 BẢNG VÀNG CÔNG ĐỨC DÒNG HỌ` | Gọn gàng, trang nghiêm. |
| `HonorRollPage.tsx:128` | `Ghi Nhận Công Đức Mới` | `Ghi Nhận Đóng Góp` | Ngắn gọn, chuẩn mực. |
| `ContributionsPage.tsx:68` | `Đóng Góp & Tài Trợ Dòng Họ` | `Đóng Góp & Công Đức` | Phù hợp với ngôn ngữ dòng họ truyền thống. |

---

### D. TÀI CHÍNH & SỔ QUỸ (FINANCIAL & LEDGER)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `FundLedgerPage.tsx:282` | `badge: 'POSTED'` | `badge: 'Đã Ghi Sổ'` | Chuyển enum kỹ thuật thành tiếng Việt dễ hiểu. |
| `FundLedgerPage.tsx:282` | `badge: 'REVERSED'` | `badge: 'Đã Hoàn Tác'` | Chuyển enum kỹ thuật thành tiếng Việt dễ hiểu. |
| `FundLedgerPage.tsx:291` | `Đảo bút toán` | `Hoàn tác giao dịch` | Tự nhiên, dễ hiểu với người lớn tuổi. |
| `RecordIncomeModal.tsx:93` | `Ghi Nhận Thực Thu Tiền` | `Ghi Nhận Thu Tiền` | Bỏ từ "Thực thu" mang tính kỹ thuật kế toán khô khan. |
| `RecordIncomeModal.tsx:259` | `Thao tác sẽ tự động ghi sổ cái POSTED, cập nhật hạn mức và số dư quỹ tức thì.` | `Khoản tiền sẽ được ghi vào sổ quỹ và cập nhật số dư ngay sau khi xác nhận.` | Bỏ từ `POSTED`, câu văn tự nhiên và rõ nghĩa. |
| `CreateExpenseModal.tsx:91` | `Lập Phiếu Đề Xuất Chi Tiền` | `Tạo Đề Xuất Chi` | Ngắn gọn, xúc tích. |

---

### E. GIA PHẢ & THÀNH VIÊN (GENEALOGY & TREE)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `GenealogyTreePage.tsx` | `Bộ Lọc Chi / Cành / Node` | `Xem Theo Chi / Cành` | Bỏ từ kỹ thuật đồ thị `Node`. |
| `AddMemberRelationModal.tsx:114` | `Thêm Thành Viên Vào Phả Hệ` | `Thêm Thành Viên Mới` | Tự nhiên, ngắn gọn. |
| `AddMemberRelationModal.tsx:146` | `Xác định quan hệ họ tộc` | `Mối quan hệ với thành viên` | Gần gũi, ấm áp. |
| `AddMemberRelationModal.tsx:254` | `🌿 Còn sống` | `🌿 Đang sinh sống` | Trang trọng, lịch thiệp. |
| `AddMemberRelationModal.tsx:264` | `🕯️ Đã tạ thế (Hưởng thọ)` | `🕯️ Đã quy tiên / Tạ thế` | Từ ngữ Hán-Việt truyền thống trang nghiêm. |
| `DataImportWizardModal.tsx` | `AI Smart Column Mapping` | `Tự Động Nhận Diện Cột Dữ Liệu` | Xóa bỏ thuật ngữ tiếp thị "AI Smart". |

---

### F. GÓI DỊCH VỤ & THANH TOÁN (BILLING & SUBSCRIPTION)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `BillingPage.tsx` | `Subscription Plan Management` | `Gói Dịch Vụ Dòng Họ` | 100% tiếng Việt. |
| `BillingPage.tsx` | `Status: TRIALING` | `Trạng thái: Đang Dùng Thử` | Việt hóa enum backend. |
| `BillingPage.tsx` | `Status: ACTIVE` | `Trạng thái: Đang Hoạt Động` | Việt hóa enum backend. |
| `BillingPage.tsx` | `Status: EXPIRED` | `Trạng thái: Đã Hết Hạn` | Việt hóa enum backend. |
| `BillingPage.tsx` | `Status: READ_ONLY` | `Trạng thái: Chế Độ Chỉ Xem` | Việt hóa enum backend. |
| `CheckoutPage.tsx:167` | `🟠 Đã gửi yêu cầu — Chờ Ban Quản Trị xác nhận` | `Đã gửi thông tin chuyển khoản — Đang chờ duyệt` | Rõ ràng, tự nhiên. |

---

### G. TRẠNG THÁI RỖNG & ĐANG TẢI (EMPTY STATES & LOADING)

| Vị Trí / File | Văn Bản Hiện Tại (Current Text) | Đề Xuất Chuẩn Hóa (Proposed Text) | Lý Do & Ngữ Cảnh (Reason) |
|:---|:---|:---|:---|
| `FundLedgerPage.tsx:236` | `Không có bút toán nào trong sổ cái` | `Chưa có giao dịch thu chi nào` | Dễ hiểu cho mọi thành viên. |
| `ExpensesPage.tsx:190` | `Không có đề xuất chi nào trong danh sách` | `Chưa có đề xuất chi nào` | Ngắn gọn. |
| `ContributionsPage.tsx:168` | `Chưa có khoản đóng góp nào được ghi nhận` | `Chưa có đóng góp nào` | Tự nhiên. |
| `IncomeAssessmentsPage.tsx:201` | `Không có khoản thu nào trong danh sách` | `Chưa có đợt thu nào` | Tự nhiên. |
| `All Modals & Pages` | `Đang tải module... / Processing...` | `Đang tải... / Đang xử lý...` | Thống nhất toàn hệ thống. |

---

## 🏛️ 3. TẠO TẬP TRUNG TỪ ĐIỂN NỘI DUNG (`src/config/uiCopy.ts`)
Hệ thống sẽ tạo tệp `src/config/uiCopy.ts` chứa toàn bộ từ điển chuỗi giao diện dùng chung nhằm triệt tiêu hoàn toàn tình trạng hardcode rải rác và đảm bảo tính nhất quán 100%.

---

```
============================================================
TRẠNG THÁI: WAITING_FOR_APPROVAL
============================================================
```

> **Quý Trưởng Tộc / Quản Trị Viên vui lòng phản hồi `APPROVE CONTENT RECONCILIATION` để hệ thống bắt đầu triển khai chuẩn hóa ngôn ngữ trên toàn bộ repository!**
