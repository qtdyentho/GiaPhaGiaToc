# TỔNG QUAN GIẢI PHÁP, KIẾN TRÚC & TÍNH NĂNG DỰ ÁN (PROJECT SOLUTIONS & IMPROVEMENTS)
## Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ — GiaPhaGiaToc Enterprise SaaS

> **Trí Nhớ Dự Án & Phiên Làm Việc (Agent Memory)**  
> *Tài liệu này tổng hợp toàn bộ giải pháp kiến trúc, danh mục 12+ phân hệ tính năng nghiệp vụ, công nghệ lõi và lịch sử các cải tiến đột phá của nền tảng.*

---

## 🏛️ 1. Kiến Trúc Tổng Thể & Ngăn Xếp Công Nghệ (Tech Stack)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (React 18 + Vite 5 SPA)                         │
│  • Tailwind CSS + Lucide Icons + Dark/Light Theme System                              │
│  • Canvas WebP Image Compressor (Client-side 90% size reduction)                       │
│  • Printable Plaque Generator (Canvas High-Res 1200x1600px PNG)                        │
│  • Interactive Genealogy Visualizer (Multi-tier Parent-Child Node Tree)                │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ HTTPS / WebSockets
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                    MIDDLEWARE & SECURITY / BUSINESS ENGINE LAYER                       │
│  • Multi-Tier ShortLink Engine (/c/:slug -> pass_token -> PIN Gate)                    │
│  • Salted SHA-256 Clan PIN Hash & 15-Minute Brute-Force Lockout Guard                  │
│  • Lunar-Solar Celestial Astronomical Algorithm (Can Chi, Nạp Âm, Bát Tự)              │
│  • Immutable Double-Entry Fund Ledger (Strict Zero-Delete Reversal Protocol)          │
│  • 5-Step Excel/CSV Data Import Wizard (Auto-Mapping & Undo Batch Rollback)            │
│  • Idempotent Manual & Automated Billing Confirmation Engine                          │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Postgres Connection Pooling / RLS
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│                     DATABASE BACKEND (Supabase PostgreSQL 15)                          │
│  • 31 Chuẩn Hóa Bảng CSDL (Zero Circular Reference, Strict Foreign Keys)              │
│  • Row-Level Security (RLS) Cách Ly Đa Gia Tộc 100% (Multi-Tenancy Zero-Leak)          │
│  • Atomic Stored Procedures & Transaction Rollbacks                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 2. Danh Mục 12 Phân Hệ Tính Năng Cốt Lõi (Core Modules)

### 1. Cổng Thông Tin Cội Nguồn & Di Sản Gia Tộc (Clan Heritage & Introduction)
- Giới thiệu cội nguồn, khởi tổ, bề dày lịch sử, quê hương gốc tích và phương châm sống tổ tiên.
- Quản lý bộ sưu tập hình ảnh Từ đường, Nhà thờ tổ, Lăng mộ đá với 6 bộ mẫu cổ truyền Việt Nam chuẩn mực.
- Trình xem ảnh phóng to toàn màn hình (Lightbox Viewer) với cơ chế tải lười (Lazy loading).
- Quản lý danh sách Ban Trị Sự / Hội Đồng Tộc Biểu thời gian thực.

### 2. Lưu Ký & Ký Sự Dòng Họ (Clan Chronicles & Reflections)
- Cho phép con cháu ghi chép bài viết về lịch sử dòng họ, ký sự ngày giỗ tổ, hồi ức tiên nhân, gương hiếu học.
- Phân loại danh mục bài viết trực quan với huy hiệu số lượng bài viết thời gian thực.
- Hỗ trợ thả tim tri ân, gửi bình luận tâm tình của con cháu nội ngoại và tải ảnh đại diện bài viết với bộ nén WebP tự động.

### 3. Cây Phả Hệ Trực Quan Đa Thế Hệ (Genealogy Interactive Tree)
- Biểu diễn mối quan hệ trực hệ nhiều thế hệ (Thủy tổ, Tiên tổ, Phụ mẫu, Huynh đệ, Tử tôn).
- Phân biệt trực quan Nam / Nữ, Đinh / Ngoại, Người còn sống / Đã khuất.
- Tra cứu nhanh quan hệ xưng hô họ hàng chuẩn theo phong tục Việt Nam (Kinship Calculator).
- Tìm kiếm thành viên tức thì theo họ tên, thế hệ, chi phái.

### 4. Thuật Toán Lịch Âm & Sổ Lễ Giỗ Tiên Tổ (Lunar Calendar & Memorials)
- Tự động chuyển đổi lịch Âm - Dương theo thuật toán thiên văn học chính xác cho mọi năm.
- Tự động tính toán ngày giỗ Dương lịch hàng năm, bao gồm hỗ trợ chính xác cho tháng nhuận và ngày 30 tháng Chạp.
- Hiển thị widget đếm ngược ngày giỗ gần nhất trên Dashboard.
- Xem văn khấn cổ truyền chuẩn nghi lễ dâng hương tiên tổ.

### 5. Bát Tự & Phong Thủy Cổ Truyền (Feng Shui & Four Pillars Engine)
- Tự động tính toán Can Chi (Năm, Tháng, Ngày, Giờ).
- Tra cứu Nạp Âm 60 Hoa Giáp (Hải Trung Kim, Lư Trung Hỏa, Đại Lâm Mộc...).
- Tính Cung Mệnh Bát Trạch (Đông Tứ Mệnh / Tây Tứ Mệnh) cho Nam và Nữ.

### 6. Sổ Quỹ Gia Tộc Bất Biến & Minh Bạch Thu Chi (Immutable Fund Ledger)
- Quản lý đa quỹ: Quỹ Khuyến Học, Quỹ Xây Dựng Từ Đường, Quỹ Khánh Tiết & Hiếu Hỉ.
- Nguyên tắc Bất biến (Immutable Ledger): Tuyệt đối KHÔNG sửa/xóa bút toán cũ; mọi điều chỉnh tài chính đều ghi bút toán hoàn trả (`REVERSAL`) đối ứng.
- Lọc giao dịch đa chiều theo năm, loại thu/chi và xuất báo cáo sao kê CSV phục vụ đại hội họ.

### 7. Vận Động Đóng Góp & Bảng Vàng Công Đức (Honor Roll & Contributions)
- Ghi nhận đóng góp của các nhà hảo tâm, con cháu nội ngoại trong và ngoài nước.
- Bảng vàng vinh danh công đức xếp hạng theo niên hiệu và số tiền đóng góp.
- Tự động tạo mã QR VietQR chuyển khoản ngân hàng gắn liền với tên người đóng góp và quỹ mục tiêu.

### 8. Lập Đợt Bổ Bổ Bổ Quỹ Gia Tộc (Income Assessment & Quota Allocator)
- Khởi tạo đợt thu quỹ định kỳ (theo năm hoặc sự kiện).
- Tự động phân bổ mức đóng góp theo định suất thành viên (theo chi phái, thế hệ hoặc toàn tộc).
- Theo dõi tiến độ hoàn thành nghĩa vụ đóng góp của từng thành viên.

### 9. Quản Lý Sự Kiện & Ngân Sách Lễ Hội (Events & Budget Manager)
- Lập kế hoạch sự kiện: Lễ Giỗ Tổ, Lễ Khánh Thành Từ Đường, Ngày Hội Khuyến Học, Họp Mặt Đầu Xuân.
- Dự toán ngân sách thu chi chi tiết và đối soát thực tế.

### 10. Mã QR Từ Đường & Rút Gọn Link An Toàn (Clan QR Pass & ShortLink Engine)
- Tự động tạo đường dẫn rút gọn nhận diện thương hiệu dòng họ (Ví dụ: `/c/trinh-luu-gia-toc`).
- Cho phép Trưởng tộc tùy chỉnh tên link theo ý muốn.
- Kết xuất bản in mã QR đóng khung gỗ Từ đường chất lượng cao (1200 x 1600 px PNG) với 3 chủ đề phong thủy: *Hoàng Kim Cổ Kính*, *Sơn Mài Đỏ Son*, *Ngọc Bích Trầm Mặc*.
- Cơ chế bảo vệ mã PIN Salted SHA-256 chống dò quét brute-force (khóa 15 phút sau 5 lần sai).

### 11. Trình Thuật Sĩ Nhập Dữ Liệu Gia Phả 5 Bước (Data Import Wizard)
- Nhập tệp Excel / CSV với cơ chế tự động nhận diện tiêu đề cột tiếng Việt (Auto-Mapping).
- Tự động kiểm tra tính hợp lệ và nối quan hệ cha-con, vợ-chồng.
- Hỗ trợ tính năng Hoàn tác đợt nạp (Undo Import Batch / Rollback) bảo toàn dữ liệu gốc.

### 12. Quản Trị Nền Tảng SaaS & Thanh Toán Gói Dịch Vụ (SaaS Platform & Billing)
- Phân quyền ma trận chặt chẽ: Super Admin (Quản trị nền tảng), Family Owner (Trưởng tộc), Family Admin (Ban quản trị), Member (Con cháu).
- Quản lý gói cước dịch vụ (Bản Miễn Phí, Bản Tiêu Chuẩn, Bản Gia Tộc Đại Bản).
- Quy trình duyệt chuyển khoản ngân hàng thủ công với cơ chế chống kích hoạt trùng lặp (Idempotency).

---

## 🚀 3. Lịch Sử Các Cải Tiến Đột Phá Đã Đạt Được

1. **Phiên 1 — Thiết Lập Kiến Trúc & CSDL Supabase 31 Bảng**: Chuẩn hóa toàn bộ schema CSDL, cách ly đa gia tộc bằng Supabase Row-Level Security (RLS).
2. **Phiên 2 — Công Cụ Phong Thủy & Lịch Âm Học**: Tích hợp thuật toán Can Chi, Bát Tự, Nạp Âm 60 Hoa Giáp và chuyển đổi âm dương chính xác.
3. **Phiên 3 — Mã QR Bản In Khung Gỗ & Cơ Chế PIN Gate**: Thiết kế công cụ kết xuất canvas PNG chất lượng cao và bảo mật mã PIN dòng họ chống tấn công brute-force.
4. **Phiên 4 — Tối Ưu Bút Toán Sổ Quỹ Kép Bất Biến**: Triển khai cơ chế Reversal Transaction và xuất báo cáo sao kê CSV.
5. **Phiên 5 — Giới Thiệu Cội Nguồn & Lưu Ký Gia Tộc**: Ra mắt chuyên trang Giới thiệu dòng họ, Lưu ký & Ký sự, kèm hệ thống nén ảnh WebP tự động và Lazy Loading.
6. **Phiên 6 — Khắc Phục Lỗi Rút Gọn Link & Modal Z-Index**: Tự động sinh link rút gọn theo tên dòng họ thực tế (`/c/:slug`), sửa xung đột z-index của modal, và cập nhật 100% bộ ảnh mẫu Từ đường cổ truyền Việt Nam.
7. **Phiên 7 — Thanh Lọc Mock Data 100%**: Loại bỏ toàn bộ mock fallback trong code, bảo đảm 100% CSDL thực tế Supabase vận hành độc lập, không rò rỉ dữ liệu giữa các dòng họ.
8. **Phiên 8 — Hoàn Thiện Nhập Gia Phả Excel 12 Cột Tiêu Chuẩn & Kéo Thả Tệp**: Tích hợp thư viện `xlsx` (SheetJS) phân tích trực tiếp tại Client, hỗ trợ kéo thả tệp, nút xuất file mẫu Excel 12 cột chuẩn hóa, tự động nhận diện tiêu đề tiếng Việt (Auto-mapping) và nạp nguyên tử vào CSDL Supabase (tạo thế hệ, chi phái, thành viên, quan hệ cha-con/vợ-chồng và lịch giỗ tổ).
