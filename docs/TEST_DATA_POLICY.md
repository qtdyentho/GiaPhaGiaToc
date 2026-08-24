# CHÍNH SÁCH BẢO TOÀN DỮ LIỆU THỬ NGHIỆM (TEST DATA POLICY)
# GIA PHẢ GIA TỘC SaaS

---

## 🔒 1. NGUYÊN TẮC BẤT DI BẤT DỊCH (IMMUTABLE DATA POLICY)

> **"Test data must never be automatically deleted or truncated during development."**
> *(Dữ liệu thử nghiệm tuyệt đối không bao giờ được xóa tự động trong quá trình phát triển).*

Trong toàn bộ quá trình nâng cấp, refactor, thay đổi kiến trúc hoặc viết migration:

1. **Bảo tồn toàn vẹn các dòng họ thử nghiệm**:
   - Family Alpha (`fam-0000-0001` — Đại Tộc Nguyễn Văn)
   - Family Beta (`fam-0000-0002` — Họ Trần Tộc Nam Định)
   - Family Gamma (`fam-0000-0003` — Lê Tộc Đại Tôn - READ_ONLY)
2. **Cấm tuyệt đối các thao tác phá hủy dữ liệu**:
   - `TRUNCATE TABLE ...`
   - `DROP TABLE ...` (trừ bảng tạm)
   - `DELETE FROM families ...`
   - `DELETE FROM members ...`
   - `DELETE FROM subscriptions ...`
3. **Quy chuẩn Database Migration**:
   - Mọi migration phải mang tính chất thuần bổ sung (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `CREATE TABLE IF NOT EXISTS`).
   - Phải tương thích ngược 100% với dữ liệu và mã nguồn hiện hữu.
