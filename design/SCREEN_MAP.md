# BẢN ĐỒ MÀN HÌNH GOOGLE STITCH → HỆ THỐNG GIA PHẢ GIA TỘC
# Project: Gia Phả Gia Tộc UX (Stitch Resource ID: `projects/14208187564231711793`)
# Trạng thái: CẬP NHẬT ĐỒNG BỘ TOÀN DIỆN CUỐI CÙNG (52 SCREENS)

Tài liệu này phản ánh **100% thực tế** từ Google Stitch MCP đã được đồng bộ tuyệt đối với các tài liệu đặc tả:
- `MASTER_SPEC.md`
- `MASTER_PROMPT.md`
- `IMPLEMENTATION_PLAN.md`
- `DATABASE_SCHEMA.sql`
- `BUSINESS_RULES.md`

---

## 📊 1. THỐNG KÊ TỔNG QUAN

- **Tên Stitch Project**: `Gia Phả Gia Tộc UX`
- **Resource Identifier**: `projects/14208187564231711793`
- **Tổng số màn hình trong Stitch**: **52 screens**
  * **Core Family Screens**: 28 screens
  * **Billing & Pricing Screens**: 13 screens
  * **Admin Billing Screens**: 8 screens
  * **Mobile Dedicated Screens**: 6 screens
- **Hệ thống Design Theme**:
  * **Phong cách**: Modern Vietnamese Heritage (*Heritage Ledger*)
  * **Phông chữ chuẩn**: `Be Vietnam Pro` (100% hỗ trợ tiếng Việt có dấu)
  * **Bảng màu nhận diện**: 
    - Primary Green (`#166534`): Tượng trưng cho sự sống và cội nguồn cây gia phả
    - Secondary Navy (`#1E3A5F`): Sự trang trọng, lưu trữ tư liệu gia tộc
    - Accent Gold (`#C49A3A`): Vinh danh, mốc sự kiện quan trọng, thủy tổ
    - Background Tint (`#F7F8F5`): Tông giấy cổ truyền êm dịu cho mắt người lớn tuổi

---

## 🗺️ 2. BẢNG DANH MỤC 52 MÀN HÌNH THIẾT KẾ STITCH

### I. AUTHENTICATION & ONBOARDING (3 Screens)
1. **Đăng nhập** (`63f455ee8ea04a5a810efcaad93332bf` - Desktop) $\rightarrow$ `/login`
2. **Đăng ký** (`5709828ee7fc4484b94a0e9430b1ad9a` - Desktop) $\rightarrow$ `/register`
3. **Khởi tạo Gia Tộc** (`a79fc58e210d4aabbc48e03ed5d0db70` - Desktop) $\rightarrow$ `/onboarding/create-family`

### II. DASHBOARD & TỔNG QUAN (2 Screens)
4. **Tổng quan (Desktop)** (`21496bb996f14762a4a76df18b480b0f` - Desktop) $\rightarrow$ `/app/dashboard`
5. **Tổng quan (Mobile)** (`290e18c359e240f29b4fb78a180c8839` - Mobile) $\rightarrow$ `/app/dashboard` (Mobile)

### III. GIA PHẢ & THÀNH VIÊN (4 Screens)
6. **Cây Gia Phả (Desktop)** (`344c28f1680c422f8b0fb5fddf081639` - Desktop) $\rightarrow$ `/app/genealogy`
7. **Cây Gia Phả (Mobile)** (`bd27532968754b9d81fda3894e18a0a3` - Mobile) $\rightarrow$ `/app/genealogy` (Mobile)
8. **Thành viên Gia Tộc** (`a67a022106ea4af6b017d4ef6ba36d3d` - Desktop) $\rightarrow$ `/app/members`
9. **Hồ sơ thành viên** (`10a2232ec1fe4a56b5e2694aaa2ba85e` - Desktop) $\rightarrow$ `/app/members/:id`

### IV. LỊCH GIA TỘC, NGÀY GIỖ & SỰ KIỆN (5 Screens)
10. **Lịch gia tộc** (`3a44fddfe3e24f33a78a516e42fc5a2f` - Desktop) $\rightarrow$ `/app/calendar`
11. **Ngày giỗ Gia Tộc** (`647032625c2247e7ad39a33bbe78891b` - Desktop) $\rightarrow$ `/app/memorials`
12. **Sự kiện sắp tới** (`d31cad5295e64f9e85161da0738359b3` - Desktop) $\rightarrow$ `/app/events`
13. **Chi tiết sự kiện** (`2f223ed3830b408ba160157e23356d06` - Desktop) $\rightarrow$ `/app/events/:id`
14. **Cấu hình Nhắc lịch tự động** (`d65cf7b2201148f1aa5e65a00dfe21ad` - Desktop) $\rightarrow$ `/app/settings/reminders`

### V. TÀI CHÍNH, SỔ QUỸ, KHOẢN THU & KHOẢN CHI (14 Screens)
15. **Tổng quan Tài chính (Desktop)** (`d9aeec8d69a248b5baf66a3d27f59c5e` - Desktop) $\rightarrow$ `/app/finance`
16. **Tài chính (Mobile)** (`a9686f726d9a4012a3ea57fa7fce9634` - Mobile) $\rightarrow$ `/app/finance` (Mobile)
17. **Sổ quỹ Gia tộc** (`bac56058cb1247169b390a0ab7610a61` - Desktop) $\rightarrow$ `/app/finance/ledger`
18. **Danh sách Khoản thu** (`d6fa36d502f8457abc63c69fcedbd56b` - Desktop) $\rightarrow$ `/app/finance/income`
19. **Ghi nhận khoản thu** (`76b6941e01d34595a2984750e84f49a2` - Desktop) $\rightarrow$ `/app/finance/income/record`
20. **Quản lý Khoản chi** (`49d272c897404d3c80a26cb4a1d9e862` - Desktop) $\rightarrow$ `/app/finance/expenses`
21. **Quản lý đóng góp (Desktop)** (`a83c3ead81544915a598f362913b9e8e` - Desktop) $\rightarrow$ `/app/finance/contributions`
22. **Quản lý đóng góp (Mobile)** (`0e740111e1aa401897406e9cc1cba3b8` - Mobile) $\rightarrow$ `/app/finance/contributions` (Mobile)
23. **Đóng góp & Tài trợ** (`adc85b6197c340e2a956c5abd2b89b36` - Desktop) $\rightarrow$ `/app/finance/sponsorships`
24. **Chi tiết Giao dịch** (`1672822128c14cb88ebb24e2e6737499` - Desktop) $\rightarrow$ `/app/finance/transactions/:id`
25. **Ngân sách Sự kiện** (`54704b35821f44288a226239dfe8f74a` - Desktop) $\rightarrow$ `/app/events/:id/budget`
26. **Báo cáo Tài chính (Desktop)** (`4658744fc0d642c69b62e9c702541b87` - Desktop) $\rightarrow$ `/app/finance/reports`
27. **Báo cáo Tài chính chi tiết** (`451e79a325b743079db7f188ea63c314` - Desktop) $\rightarrow$ `/app/finance/reports/detailed`
28. **Báo cáo Tài chính (Mobile)** (`3851b557e7514c87bc2cf78ed7da0054` - Mobile) $\rightarrow$ `/app/finance/reports` (Mobile)

### VI. GÓI DỊCH VỤ, THUÊ BAO, THANH TOÁN & FEATURE GATING (13 Screens)
29. **Bảng giá dịch vụ (Pricing)** (`bc5450f15b5c44bb8d09ed9b658f059b` - Desktop) $\rightarrow$ `/pricing`
30. **So sánh gói dịch vụ (Comparison)** (`85c4027724f24e39aaaa3edb88d1cd17` - Desktop) $\rightarrow$ `/pricing/compare`
31. **Tổng quan Gói dịch vụ (Overview)** (`44ff55aee7a5424b8cce14a87165605e` - Desktop) $\rightarrow$ `/app/billing`
32. **Sử dụng & Giới hạn (Usage)** (`6f68600f7dfa4ce6a9f6da03ff37dd63` - Desktop) $\rightarrow$ `/app/billing/usage`
33. **Thanh toán VietQR (Checkout)** (`0c16d5813dc54a48be443cb90ae49a72` - Desktop) $\rightarrow$ `/app/billing/checkout`
34. **Thanh toán thành công (Success)** (`3fa0d9c01df840d99224892dd3747f52` - Desktop) $\rightarrow$ `/app/billing/success`
35. **Thanh toán thất bại (Failed)** (`afbca5a8abb74518a2be62e5c468a5eb` - Desktop) $\rightarrow$ `/app/billing/failed`
36. **Đang kiểm tra thanh toán (Pending)** (`c4923829ce5b49be84ac3436415e4f78` - Desktop) $\rightarrow$ `/app/billing/pending`
37. **Danh sách Hóa đơn (Invoices)** (`81f48e9ee70c4774bd0602ec13a9f35b` - Desktop) $\rightarrow$ `/app/billing/invoices`
38. **Chi tiết Hóa đơn (A4 PDF)** (`4d75c338ee7b400abf77721ae0008db1` - Desktop) $\rightarrow$ `/app/billing/invoices/:id`
39. **Dùng thử sắp hết hạn (Trial Expiring)** (`e017a12a6f4047da94bf5613a7da3006` - Desktop) $\rightarrow$ Banner cảnh báo
40. **Dùng thử hết hạn (Trial Expired)** (`f25cd9c726854d26973eabbd5bb89b03` - Desktop) $\rightarrow$ Chế độ `READ_ONLY`
41. **Thông báo vượt giới hạn (Quota Warning)** (`4af75d9fca244cbdb2e3c40a086b488a` - Desktop) $\rightarrow$ Modal cảnh báo 85%
42. **Thông báo giới hạn thành viên (Quota Exceeded)** (`773c0cfcfc7141c7a67f088d224fe608` - Desktop) $\rightarrow$ Modal chặn 30/30

### VII. ADMIN QUẢN TRỊ DOANH THU & HỆ THỐNG (7 Screens)
43. **Admin: Tổng quan Doanh thu** (`a5464d4e7cf94f9b8bc5a408198d28b6` - Desktop) $\rightarrow$ `/admin/revenue`
44. **Admin: Quản lý Gói cước** (`da4c4f58410d40caba0e511b3df3f61f` - Desktop) $\rightarrow$ `/admin/plans`
45. **Admin: Quản lý Đăng ký** (`3b981e4a61a8427cb3b13b9c676fd2f9` - Desktop) $\rightarrow$ `/admin/subscriptions`
46. **Admin: Quản lý Giao dịch** (`cd9b4df4a68e496392368a3b8c112380` - Desktop) $\rightarrow$ `/admin/transactions`
47. **Admin: Quản lý Gói dùng thử** (`8ccc9a47371e44ecac72fb34fc3b4d5a` - Desktop) $\rightarrow$ `/admin/trials`
48. **Admin: Quản lý Hoàn tiền** (`763955656be041c584e4d06883b0cadd` - Desktop) $\rightarrow$ `/admin/refunds`
49. **Admin: Nhật ký đối soát** (`c0964505c2fa4d7e930cd1b11968d424` - Desktop) $\rightarrow$ `/admin/reconciliation`

### VIII. THÔNG BÁO, PHÂN QUYỀN & AUDIT LOGS (4 Screens)
50. **Trung tâm thông báo** (`b134c428572545eaa34101321c3b8ec1` - Desktop) $\rightarrow$ `/app/notifications`
51. **Cấu hình Thông báo** (`ad9a11e9e0ec44d8a72db7d8870b2eec` - Desktop) $\rightarrow$ `/app/settings/notifications`
52. **Phân quyền** (`6d2e94836efa4f1785392ae6c6de55de` - Desktop) $\rightarrow$ `/app/settings/permissions`
53. **Cài đặt Gia tộc** (`41abb01ad25149e1a464b3b4f3943aeb` - Desktop) $\rightarrow$ `/app/family/settings`
54. **Nhật ký hệ thống** (`229dea47d6b44e2093ce503055ce8f66` - Desktop) $\rightarrow$ `/app/audit`
