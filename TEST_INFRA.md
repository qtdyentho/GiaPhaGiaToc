# KIẾN TRÚC VÀ PHƯƠNG PHÁP LUẬN KIỂM THỬ HỆ THỐNG GIA PHẢ GIA TỘC
# TEST INFRASTRUCTURE & METHODOLOGY SPECIFICATION (TIERS 1 - 4)

**Dự án:** Gia Phả Gia Tộc (Heritage Ledger SaaS)  
**Phiên bản:** 1.0.0 Production  
**Tác giả:** E2E Testing Track Orchestrator / Test Writer  
**Mục tiêu:** Định nghĩa toàn diện hạ tầng kiểm thử hộp mờ (Opaque-Box E2E Testing), phân tầng kiểm thử 4 cấp độ (Tiers 1-4), cơ chế cách ly dữ liệu, chiến lược Dual-Mode Backend, và tiêu chuẩn nghiệm thu chất lượng cho hệ thống Gia Phả Gia Tộc.

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC HẠ TẦNG KIỂM THỬ (EXECUTIVE OVERVIEW)

Hạ tầng kiểm thử của **Gia Phả Gia Tộc** được thiết kế nhằm đảm bảo tính toàn vẹn dữ liệu, độ chính xác thuật toán phả hệ Việt Nam, và khả năng vận hành ổn định trong môi trường Production.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          E2E TEST RUNNER PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Runtime: Node.js Native Test Runner (`node:test` + `node:assert/strict`)   │
│  Loader: TSX (TypeScript Execute) ES Modules Loader                         │
│  Execution Mode: Deterministic, Zero-Flake, High-Throughput In-Memory & Live│
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  TIER 1: FEATURE │          │  TIER 2: BOUNDARY│          │  TIER 3: CROSS-  │
│  COVERAGE        │          │  & CORNER CASES  │          │  FEATURE E2E     │
│  (Happy Paths)   │          │  (Edge Hardening)│          │  (User Journeys) │
└──────────────────┘          └──────────────────┘          └──────────────────┘
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │  TIER 4: REAL-WORLD LARGE    │
                        │  MULTI-GENERATION WORKLOADS  │
                        │  (5+ Gens, Multi-Wife Branch)│
                        └──────────────────────────────┘
```

---

## 🎯 2. NGUYÊN TẮC CỐT LÕI & CAM KẾT TOÀN VẸN (INTEGRITY MANDATE)

1. **Opaque-Box Testing (Kiểm Thử Hộp Mờ)**:
   - Các ca kiểm thử chỉ tương tác với hệ thống thông qua các Public API Services và Contracts (`DataImportService`, `GenealogyService`, `KinshipService`, `EventService`, `MemorialService`, `LunarCalendarService`, `BillingService`).
   - Không can thiệp vào các biến private bên trong; mọi xác minh phải dựa trên đầu ra thực tế (Output assertions), trạng thái CSDL và đồ thị quan hệ.

2. **Zero-Cheat Policy (Tuyệt Đối Không Giả Lập Sai Lệch)**:
   - Không hardcode kết quả kiểm thử hoặc chuỗi mong muốn trong mã nguồn.
   - Mọi thuật toán (suy luận thế hệ BFS, chuẩn hóa ngày tháng, tính toán danh xưng họ tộc, dựng cây phả hệ, chuyển đổi lịch âm dương) phải thực thi logic thực tế trên tập dữ liệu kiểm thử.

3. **Deterministic & Isolated Execution (Thực Thi Xác Định & Cách Ly)**:
   - Mỗi bộ test case chạy trên một định danh dòng họ (`familyId` / UUID) riêng biệt để chống nhiễm chéo dữ liệu giữa các luồng kiểm thử độc lập.
   - Cơ chế dọn dẹp (Teardown / Cleanup) hoặc khôi phục trạng thái nguyên vẹn sau mỗi lần kiểm thử.

---

## 📊 3. PHÂN TẦNG KIỂM THỬ 4 CẤP ĐỘ (TIERS 1 - 4 ARCHITECTURE)

### 🟢 Tier 1: Bao Phủ Chức Năng Tiêu Chuẩn (Core Feature Coverage)
Kiểm thử các luồng chuẩn (Happy Path) của toàn bộ các phân hệ cốt lõi:
- **T1.1: Excel Data Ingestion (Chuẩn 12 Cột)**:
  - Tự động nhận diện (Auto-mapping) 12 cột chuẩn tiếng Việt có dấu và không dấu (`Họ và tên`, `Giới tính`, `Thế hệ/Đời`, `Chi phái`, `Tên cha`, `Vợ/Chồng`, `Trạng thái`, `Năm sinh`, `Ngày mất Âm`, `Tháng mất Âm`, `Năm mất Âm`, `Nơi an táng`).
  - Phân tích linh hoạt định dạng thế hệ La Mã (I, II, III, IV, V, X), từ khóa ("Thủy tổ", "Cụ tổ", "Đời 3", "F2", "Gen 4").
  - Thuật toán BFS suy luận thế hệ tự động từ liên kết cha $\rightarrow$ con và vợ $\leftrightarrow$ chồng.
- **T1.2: Chuẩn Hóa Ngày Tháng (Date Normalization for PostgreSQL)**:
  - Chuyển đổi mọi biến thể ngày tháng (DD/MM/YYYY, YYYY, chữ tiếng Việt) sang định dạng chuẩn PostgreSQL `DATE` (`YYYY-MM-DD`).
- **T1.3: Quản Trị Thành Viên & Quan Hệ (Member & Relationship CRUD)**:
  - Thêm, sửa, đọc, lưu trữ/xóa thành viên.
  - Tự động đồng bộ các trường trực hệ (`father_id`, `mother_id`, `spouse_id`) trên bảng `members`.
  - Thiết lập liên kết quan hệ đối xứng (`PARENT`, `CHILD`, `SPOUSE`) với ngữ nghĩa chuẩn xác.
- **T1.4: Động Cơ Tính Danh Xưng Họ Tộc (Vietnamese Kinship Reasoning)**:
  - Tính toán danh xưng xưng hô 2 chiều (A gọi B và B gọi A) dựa trên khoảng cách thế hệ $\Delta G$, tổ tiên chung gần nhất (LCA), giới tính, và tôn ti thứ bậc giữa các chi phái (Con Bác vs Con Chú).
- **T1.5: Dựng Đồ Thị Cây Gia Phả (Genealogy Tree Hierarchy)**:
  - Xây dựng cây phân cấp từ Thủy tổ đến con cháu, gom cụm phối ngẫu ngang hàng, sắp xếp thứ tự sinh tử.
- **T1.6: Sự Kiện & Lễ Giỗ Dòng Họ (Events & Memorial Engine)**:
  - Tự động đồng bộ ngày giỗ cho thành viên đã mất, chuyển đổi Âm $\leftrightarrow$ Dương, phát hiện tháng thiếu 29 ngày và kích hoạt lịch cúng giỗ chuẩn xác.

---

### 🟡 Tier 2: Xử Lý Biên & Trường Hợp Đặc Biệt (Boundary & Corner Cases)
Kiểm thử độ bền vững của hệ thống khi gặp dữ liệu dị thường hoặc điều kiện biên khắc nghiệt:
- **T2.1: Bảng Tính Rỗng & Thiếu Dữ Liệu (Empty Sheets & Missing Optional Fields)**:
  - Xử lý file Excel không có dòng dữ liệu nào hoặc chỉ có hàng tiêu đề.
  - Xử lý thành viên thiếu thông tin ngày sinh, ngày mất, tên cha mẹ, chi phái mà không gây crash hoặc lỗi null pointer.
- **T2.2: Tiêu Đề Dị Thường & Hàng Banner Trang Trí (Malformed & Offset Headers)**:
  - Nhận diện đúng cấu trúc cột khi file có 2-3 dòng tiêu đề banner trang trí phía trên hàng header chính thức.
- **T2.3: Niên Đại Tiền Nhân Lịch Sử Cổ Đại (< 1000 AD)**:
  - Chấp nhận các năm sinh từ thế kỷ X trở về trước (thời Đinh, Tiền Lê, Ngô Quyền, Hai Bà Trưng: ví dụ năm 544, 938, 968 SCN) mà không bị chặn bởi bộ lọc validation.
- **T2.4: Phòng Chống Vòng Lặp Phả Hệ (Anti-Cycle & Circular Prevention)**:
  - Phát hiện và chặn đứng lỗi tự chọn chính mình làm cha mẹ (`self-parenting`).
  - Phát hiện chu trình khép kín đa thế hệ (A là cha B, B là cha C, C là cha A).
- **T2.5: Năm Nhuận Âm Lịch & Ngày 30 Tháng Chạp Thiếu (Lunar Leap & Short Months)**:
  - Xử lý năm có tháng nhuận âm lịch (ví dụ: Nhuận tháng 6 Âm lịch năm 2025).
  - Tự động chuyển ngày giỗ mùng 30 sang ngày 29 khi tháng Âm lịch của năm chỉ có 29 ngày.
- **T2.6: Dòng Họ Đơn Nhất & Nút Mồ Côi (Single-Member & Orphan Subtrees)**:
  - Dựng cây ổn định khi gia tộc chỉ có 1 thành viên duy nhất.
  - Hiển thị thành viên mồ côi (không rõ cha mẹ) ở vị trí phù hợp mà không làm đứt gãy cấu trúc cây.

---

### 🟠 Tier 3: Tích Hợp Đa Phân Hệ Phức Hợp (Cross-Feature Integration Workflows)
Kiểm thử chuỗi hành trình người dùng xuyên suốt qua nhiều dịch vụ:
- **T3.1: Nhập Excel $\rightarrow$ Sửa Hồ Sơ $\rightarrow$ Xóa Nút $\rightarrow$ Dựng Lại Cây**:
  - Nạp đợt dữ liệu 12 cột từ Excel.
  - Cập nhật thông tin chi phái và ngày sinh của thành viên thế hệ 3.
  - Thực hiện xóa an toàn một nút nhánh con.
  - Kiểm tra đồ thị cây cập nhật ngay lập tức với 0 lỗi đứt gãy liên kết.
- **T3.2: Nhập Gia Phả $\rightarrow$ Tính Danh Xưng $\rightarrow$ Sinh Lễ Giỗ Tự Động $\rightarrow$ Thông Báo**:
  - Nạp dữ liệu gia phả có đủ ngày mất âm lịch của tiền nhân các đời.
  - Hệ thống tự động trích xuất danh bạ ngày giỗ (`memorial_dates`).
  - Động cơ nhắc giỗ (`ReminderService`) sinh các mốc thông báo 30-15-7-3-1 ngày.
  - Tra cứu danh xưng giữa người sống đời thứ 4 và cụ tổ đã khuất cho kết quả chính xác tuyệt đối.
- **T3.3: Nạp Batch $\rightarrow$ Kiểm Thử Toàn Vẹn $\rightarrow$ Hoàn Tác Nguyên Tử (Rollback Undo)**:
  - Nạp một batch 15 thành viên vào CSDL.
  - Kích hoạt cơ chế Hoàn tác (`rollbackImportBatch`).
  - Xác nhận toàn bộ 15 thành viên, các mối quan hệ liên đới và ngày giỗ được dọn sạch hoàn toàn, đưa CSDL về trạng thái ban đầu.

---

### 🔴 Tier 4: Tải Lớn Đa Thế Hệ Trong Thực Tế (Real-World Large Multi-Generation Workloads)
Kiểm thử hiệu năng, tính đúng đắn và độ chịu tải của phả hệ gia tộc thực tế:
- **T4.1: Gia Tộc 5+ Thế Hệ Quy Mô Lớn (5+ Generations Deep Lineage)**:
  - Khởi tạo đại tộc gồm 5 thế hệ nối tiếp nhau từ Cụ Thủy Tổ (Đời 1) $\rightarrow$ Đời 2 $\rightarrow$ Đời 3 $\rightarrow$ Đời 4 $\rightarrow$ Đời 5 với hơn 20-30 thành viên.
  - Kiểm tra tính liên tục của mạch phụ hệ (Direct Patrilineal Ancestry Chain).
- **T4.2: Chế Độ Đa Thê & Phối Ngẫu Xếp Hàng Ngang (Multi-Wife Polygamy Hierarchy)**:
  - Cụ tổ có nhiều đời vợ: Bà Cả (Chính Thất), Bà Hai (Kế Thất), Bà Ba (Trắc Thất).
  - Xác minh cây gia phả xếp các người vợ ngang hàng chuẩn mực với đúng danh xưng và màu sắc huy hiệu.
  - Con cái sinh ra từ từng bà mẹ được liên kết chính xác với đúng người mẹ và người cha chung.
- **T4.3: Phân Chi Đa Nhánh & Tôn Ti Thứ Bậc (Multi-Branch Cousin Reasoning)**:
  - Gia tộc chia thành Chi Trưởng, Chi Hai, Chi Ba.
  - Xác minh nguyên tắc tộc ước: Con của Chi Trưởng dù nhỏ tuổi hơn vẫn là "Anh họ" (vế trên) so với con của Chi Thứ (vế dưới / Con Chú).
- **T4.4: Tính Bất Biến & Không Thoái Hóa Của Cây (Tree Anti-Degradation)**:
  - Đảm bảo cây phả hệ lớn không bị tràn bộ nhớ, không sinh vòng lặp đệ quy vô tận, và giữ nguyên tính cân đối hình học khi render.

---

## 🛠️ 5. CHIẾN LƯỢC MÔI TRƯỜNG DUAL-MODE (BACKEND STRATEGY)

Hệ thống kiểm thử hỗ trợ cơ chế vận hành Dual-Mode mượt mà:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         DUAL-MODE DATA LAYER                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    [ Kiểm Tra Kết Nối ] ─── Có Supabase Cloud Credentials? ───┐          │
│                                                               │          │
│                      YES                                     NO          │
│                       │                                       │          │
│                       ▼                                       ▼          │
│        ┌────────────────────────────┐          ┌───────────────────────┐ │
│        │  LIVE SUPABASE PG15 MODE   │          │ IN-MEMORY MOCK STORE  │ │
│        │  • RLS Isolation Test      │          │ • 100% In-Memory State│ │
│        │  • Real Atomic Commit      │          │ • Zero External Dep   │ │
│        │  • Real DB Constraints     │          │ • Ultra-Fast Execution│ │
│        └────────────────────────────┘          └───────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 6. DANH MỤC LỆNH KIỂM THỬ (TEST EXECUTION COMMANDS)

### 1. Chạy toàn bộ Test Suite của dự án (100% Suites):
```powershell
npm test
```

### 2. Chạy riêng Suite E2E Phả Hệ Toàn Diện (Tiers 1 - 4):
```powershell
npx tsx tests/e2e_genealogy_full.test.ts
```

### 3. Chạy kiểm thử theo từng phân hệ chuyên biệt:
```powershell
# Kiểm thử Import Excel 12 Cột
npx tsx tests/data_import_12_columns.test.ts

# Kiểm thử Động Cơ Danh Xưng Họ Tộc
npx tsx tests/kinship_engine.test.ts

# Kiểm thử Lịch Âm & Lễ Giỗ Thiên Văn
npx tsx tests/lunar_golden_dataset.test.ts
```

---

## 📋 7. TIÊU CHÍ NGHIỆM THU CHẤT LƯỢNG (QUALITY ACCEPTANCE CRITERIA)

| Tiêu Chí | Ngưỡng Yêu Cầu (Threshold) | Trạng Thái Đạt Được |
|:---|:---:|:---:|
| **Tỷ Lệ Pass Toàn Bộ Test Suite** | 100% (Zero Failures) | ✅ PASS |
| **Bao Phủ 4 Tầng Kiểm Thử (Tiers 1-4)** | Đầy đủ 4 Tiers | ✅ PASS |
| **Tính Đúng Đắn Thuật Toán Lịch Âm** | Khớp 100% Lịch Hồ Ngọc Đức | ✅ PASS |
| **Tính Chuẩn Xác Danh Xưng Họ Tộc** | Khớp 100% Tộc Ước Việt Nam | ✅ PASS |
| **Chống Vòng Lặp Phả Hệ & Đứt Nhánh** | 0 Hiện tượng Loop/Crash | ✅ PASS |
| **Thời Gian Thực Thi Suite E2E** | $< 5000\text{ms}$ | ✅ PASS |

---

*Tài liệu này là tiêu chuẩn kỹ thuật kiểm thử chính thức của dự án GiaPhaGiaToc.*
