# RÀ SOÁT CẤU TRÚC CƠ SỞ DỮ LIỆU — GIA PHẢ GIA TỘC
**Database Schema Audit Report** | Ngày: 2026-08-25 | Phiên bản Schema: v1.0-RELEASE

---

## 1. TỔNG QUAN KIẾN TRÚC

Dự án **GiaPhaGiaToc** sử dụng **Supabase PostgreSQL** với **35+ bảng**, triển khai kiến trúc **Multi-Tenant SaaS** cho quản lý gia phả, tài chính gia tộc và thanh toán thuê bao.

| Phân hệ | Số bảng | Trạng thái |
|---------|---------|------------|
| Core Tenant & Auth | 4 | ✅ Ổn định |
| Genealogy | 7 | ⚠️ Cần tối ưu |
| Memorial & Calendar | 4 | ✅ Ổn định |
| Financial | 8 | 🔴 Có lỗi nghiêm trọng |
| Subscription & Billing | 15 | ⚠️ Cần đồng bộ |
| Notification & Audit | 3 | ⚠️ Thiếu policy |

---

## 2. PHÂN TÍCH TÍNH HỢP LÝ

### 2.1 Điểm mạnh thiết kế

#### a) Immutable Financial Ledger Pattern
- Bảng `financial_transactions` tuân thủ nguyên tắc **bất biến**: không cho phép `DELETE` vật lý, chỉ cho phép `REVERSAL` qua `reference_transaction_id`.
- Các stored function `record_income_payment()`, `approve_expense_record()`, `reverse_financial_transaction()` sử dụng **atomic transactions** với `FOR UPDATE` row locking, đảm bảo tính toàn vẹn ACID.

#### b) Multi-Tenancy với RLS
- Áp dụng **Row Level Security** trên toàn bộ 35 bảng, cách ly dữ liệu gia tộc qua `family_id`.
- Chính sách tenant isolation thống nhất: `family_id IN (SELECT family_id FROM family_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE')`.

#### c) Vietnamese Lunar Calendar Engine
- Lưu trữ ngày giỗ theo **Âm lịch** (`lunar_day`, `lunar_month`, `is_leap_month`) với CHECK constraints đúng phạm vi (1-30, 1-12).
- Hàm `calculate_kinship()` sử dụng **LTree LCA** để tính danh xưng gia tộc hiệu quả.

#### d) Subscription & Billing đa tầng
- Thiết kế `plans` → `plan_versions` → `plan_features` linh hoạt, hỗ trợ **phiên bản giá lịch sử** và **hạn mức tính năng động**.
- Webhook idempotency qua `payment_code` UNIQUE + `ON CONFLICT DO UPDATE`.

### 2.2 Đánh giá mức độ phản ánh nghiệp vụ

| Nghiệp vụ | Bảng sử dụng | Đánh giá |
|-----------|--------------|----------|
| Quản lý thành viên & RBAC | `profiles`, `families`, `family_memberships` | ✅ Đầy đủ 8 vai trò |
| Cây gia phả đa thê | `members`, `family_unions`, `member_relationships` | ✅ Hỗ trợ con riêng, con nuôi |
| Ngày giỗ & sự kiện | `memorial_dates`, `events`, `event_reminders` | ✅ Âm/Dương lịch, nhắc nhở |
| Quỹ tài chính bất biến | `funds`, `financial_transactions`, `expense_records` | ⚠️ Có lỗi schema |
| Nghĩa vụ thu & đóng góp | `income_assessments`, `contributions`, `sponsorships` | ✅ Đầy đủ |
| Thuê bao & hóa đơn | `subscriptions`, `invoices`, `payments`, `refunds` | ⚠️ Enum chưa đồng bộ |

---

## 3. PHÁT HIỆN THIẾU SÓT & LỖI TIỀM ẨN

### 3.1 🔴 CRITICAL — Lỗi schema khiến stored function bị FAIL

#### #1: Thiếu cột `expense_id` trong `financial_transactions`
- **Vị trí**: `DATABASE_SCHEMA.sql` dòng 456-478
- **Mô tả**: Hàm `approve_expense_record()` (dòng 991) insert vào cột `expense_id`, nhưng bảng `financial_transactions` **không có cột này**.
- **Hậu quả**: Khi duyệt phiếu chi, hệ thống báo lỗi `column "expense_id" does not exist`, toàn bộ quy trình chi bị gián đoạn.
- **Fix đề xuất**: Thêm cột `expense_id UUID REFERENCES expense_records(id) ON DELETE SET NULL` vào `financial_transactions`.

#### #2: Circular Reference `families.founder_member_id`
- **Vị trí**: `DATABASE_SCHEMA.sql` dòng 244
- **Mô tả**: `families.founder_member_id` → `members(id)` → `family_id` → `families(id)`.
- **Hậu quả**: Không thể tạo gia tộc mới (cần member trước) và không thể tạo member (cần family trước). Đây là **deadlock khởi tạo**.
- **Fix đề xuất**: 
  - Làm nullable: `founder_member_id UUID NULL`
  - Hoặc tách thành bảng riêng `family_founders`
  - Hoặc dùng deferred constraint trong transaction khởi tạo

### 3.2 🟠 HIGH — Lỗ hổng bảo mật RLS

#### #3: Thiếu INSERT/UPDATE/DELETE policies cho nhiều bảng
- **Bảng ảnh hưởng**: `invitation_tokens`, `contributions`, `sponsorships`, `subscription_events`, `usage_events`, `usage_counters`, `trial_periods`
- **Vấn đề**: Chỉ có policy SELECT tenant isolation, không có policy INSERT/UPDATE/DELETE.
- **Hậu quả**: 
  - `contributions`/`sponsorships`: Không ai có thể đóng góp/tài trợ (bị chặn INSERT).
  - `invitation_tokens`: Bất kỳ authenticated user nào cũng có thể tạo invitation token bừa bãi.
  - `usage_events`: Dữ liệu sử dụng bị lộ hoặc không thể ghi nhận.
- **Fix đề xuất**: Thêm policies phân quyền theo RBAC:
  ```sql
  CREATE POLICY contributions_insert_member ON contributions 
    FOR INSERT TO authenticated WITH CHECK (
      family_id IN (SELECT family_id FROM family_memberships 
                    WHERE user_id = auth.uid() AND status = 'ACTIVE' 
                    AND role IN ('OWNER', 'ADMIN', 'TREASURER', 'MEMBER'))
    );
  ```

#### #4: RLS policy tham chiếu bảng không tồn tại
- **Vị trí**: `20260824_phase4_commercial_saas.sql` dòng 215, 221
- **Mô tả**: Policy tham chiếu `public.family_members` nhưng bảng đúng tên là `family_memberships`.
- **Hậu quả**: Policy lỗi, tất cả operations trên `usage_counters`, `usage_events`, `trial_periods` bị chặn hoặc trống.
- **Fix đề xuất**: Sửa thành `family_memberships`.

### 3.3 🟡 MEDIUM — Bất đồng bộ Enum & TypeScript

#### #5: Enum mismatch giữa Schema và TypeScript

| Enum | Schema (DB) | TypeScript | Gây ra |
|------|-------------|------------|--------|
| `sponsor_type` | 5 values | 6 values (`ANONYMOUS` thiếu) | SponsorType.ANONYMOUS bị reject |
| `invoice_status` | 6 values | 9 values | `PENDING_PAYMENT`, `WAITING_CONFIRMATION`, `REJECTED` không tồn tại DB |
| `payment_status` | 5 values | 9 values | `SUBMITTED`, `PARTIAL`, `OVERPAYMENT`, `REJECTED` không tồn tại DB |
| `refund_status` | 4 values | 4 values | ✅ Match |
| `relationship_type` | Chưa define enum | Có `RelationshipType` | Member relationships insert fail |

- **Fix đề xuất**: 
  - Đồng bộ schema enum với TypeScript, hoặc
  - Chuyển sang dùng **CHECK constraint** trong DB để linh hoạt hơn.

### 3.4 🟡 MEDIUM — Thiếu indexes truy vấn phổ biến

| Bảng | Query pattern thiếu index | Impact |
|------|---------------------------|--------|
| `members` | `(family_id, status)` | Lọc thành viên còn sống/đã mất chạy full scan |
| `member_relationships` | `(related_member_id)` | Tra ngược quan hệ (tìm ai là cha của X) chậm |
| `financial_transactions` | `(transaction_date)` | Báo cáo thu/chi theo khoảng thời gian chậm |
| `invoices` | `(status, due_at)` | Quét hóa đơn quá hạn chậm |
| `family_unions` | `(family_id)` | Tra cứu hôn phối theo gia tộc chậm |

### 3.5 🟢 LOW — Thiếu constraints & data integrity

#### #6: Thiếu CHECK constraints
- `funds.current_balance` không có `CHECK (current_balance >= 0)` → có thể âm quỹ.
- `subscriptions.current_period_end` không có `CHECK > current_period_start` → có thể tạo kỳ thuê bao âm.
- `plan_versions.effective_to` không có `CHECK > effective_from` → version lỗi thời gian.

#### #7: Redundant data `members.is_deceased` vs `status`
- Cả hai cột đều biểu thị tình trạng sống/chết.
- Có thể dẫn đến **inconsistent state**: `is_deceased = TRUE` nhưng `status = 'ALIVE'`.
- **Fix đề xuất**: Loại bỏ `is_deceased`, dùng duy nhất `status`.

#### #8: Missing soft-delete pattern
- Các bảng quan trọng (`members`, `events`, `contributions`, `sponsorships`) cho phép `DELETE CASCADE`.
- Nguy cơ: Xóa nhầm thành viên → mất toàn bộ cây phả hệ liên quan.
- **Fix đề xuất**: Thêm `deleted_at TIMESTAMPTZ` + `is_archived BOOLEAN DEFAULT FALSE`, thay `ON DELETE CASCADE` bằng `ON DELETE RESTRICT`.

---

## 4. ĐỀ XUẤT CẢI TIẾN

### 4.1 Fix Critical Issues (Ưu tiên thực hiện ngay)

#### Fix #1: Thêm cột `expense_id` vào `financial_transactions`
```sql
ALTER TABLE financial_transactions 
  ADD COLUMN IF NOT EXISTS expense_id UUID REFERENCES expense_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_expense ON financial_transactions(expense_id);
```

#### Fix #2: Giải quyết circular reference `founder_member_id`
```sql
-- Option A: Làm nullable + populate sau
ALTER TABLE families 
  ALTER COLUMN founder_member_id DROP NOT NULL;

-- Hoặc Option B: Dùng deferred constraint
ALTER TABLE families 
  DROP CONSTRAINT IF EXISTS families_founder_member_id_fkey;

ALTER TABLE families 
  ADD CONSTRAINT families_founder_member_id_fkey 
  FOREIGN KEY (founder_member_id) REFERENCES members(id) 
  DEFERRABLE INITIALLY DEFERRED;
```

#### Fix #3: Đồng bộ RLS policies cho `contributions`, `sponsorships`, `invitation_tokens`
```sql
-- Contributions: Member có thể đóng góp
CREATE POLICY contributions_insert_member ON contributions 
  FOR INSERT TO authenticated WITH CHECK (
    family_id IN (SELECT family_id FROM family_memberships 
                  WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- Sponsorships: Member có thể tài trợ
CREATE POLICY sponsorships_insert_member ON sponsorships 
  FOR INSERT TO authenticated WITH CHECK (
    family_id IN (SELECT family_id FROM family_memberships 
                  WHERE user_id = auth.uid() AND status = 'ACTIVE')
  );

-- Invitation tokens: Chỉ OWNER/ADMIN được tạo
CREATE POLICY invitation_tokens_insert_admin ON invitation_tokens 
  FOR INSERT TO authenticated WITH CHECK (
    family_id IN (SELECT family_id FROM family_memberships 
                  WHERE user_id = auth.uid() AND status = 'ACTIVE' 
                  AND role IN ('OWNER', 'ADMIN'))
  );
```

#### Fix #4: Sửa RLS policy tham chiếu sai bảng
```sql
-- Trong 20260824_phase4_commercial_saas.sql
DROP POLICY IF EXISTS "Family isolation for usage counters" ON usage_counters;
CREATE POLICY "Family isolation for usage counters" ON usage_counters
  FOR ALL USING (family_id IN (
    SELECT family_id FROM family_memberships 
    WHERE user_id = auth.uid() AND status = 'ACTIVE'
  ));
-- Tương tự cho usage_events, trial_periods
```

### 4.2 Tối ưu Performance (High Impact)

#### Index đề xuất bổ sung
```sql
-- Composite index cho filter alive/deceased
CREATE INDEX idx_members_family_status ON members(family_id, status);

-- Reverse relationship lookup
CREATE INDEX idx_member_relationships_related ON member_relationships(related_member_id);

-- Date range reporting
CREATE INDEX idx_transactions_date ON financial_transactions(family_id, transaction_date DESC);

-- Overdue invoice detection
CREATE INDEX idx_invoices_status_due ON invoices(status, due_at) WHERE status IN ('OPEN', 'PENDING_PAYMENT');

-- Family-specific union queries
CREATE INDEX idx_family_unions_family ON family_unions(family_id);
```

#### Partitioning `financial_transactions` (khi > 1M rows)
```sql
-- Partition by family_id hash hoặc transaction_date (monthly)
-- Giảm query latency cho báo cáo tài chính
```

#### Materialized View cho Honor Roll
```sql
CREATE MATERIALIZED VIEW mv_honor_roll AS
SELECT 
  m.family_id,
  m.id AS member_id,
  m.full_name,
  COALESCE(SUM(c.amount), 0) + COALESCE(SUM(s.amount), 0) AS total_contribution,
  COUNT(c.id) + COUNT(s.id) AS contribution_count
FROM members m
LEFT JOIN contributions c ON c.member_id = m.id
LEFT JOIN sponsorships s ON s.member_id = m.id
GROUP BY m.family_id, m.id, m.full_name;

CREATE INDEX mv_honor_roll_family ON mv_honor_roll(family_id, total_contribution DESC);
-- Refresh định kỳ: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_honor_roll;
```

### 4.3 Cải thiện Data Integrity

#### Soft-delete pattern cho `members`
```sql
ALTER TABLE members 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Thay ON DELETE CASCADE bằng RESTRICT
ALTER TABLE member_relationships 
  DROP CONSTRAINT IF EXISTS member_relationships_member_id_fkey,
  ADD CONSTRAINT member_relationships_member_id_fkey 
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT;

-- Trigger tự động archive
CREATE OR REPLACE FUNCTION fn_archive_member()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at := NOW();
  NEW.is_archived := TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger chống delete `POSTED` transactions
```sql
CREATE OR REPLACE FUNCTION fn_prevent_delete_posted_tx()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'POSTED' THEN
    RAISE EXCEPTION 'KHÔNG ĐƯỢC XÓA giao dịch đã ghi sổ (POSTED). Hãy dùng REVERSAL.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_delete_posted_tx
  BEFORE DELETE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_delete_posted_tx();
```

#### Validation trigger cho `members.is_deceased` consistency
```sql
CREATE OR REPLACE FUNCTION fn_validate_deceased_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deceased = TRUE AND NEW.status != 'DECEASED' THEN
    RAISE EXCEPTION 'Khi is_deceased = TRUE, status phải là DECEASED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_deceased_status
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION fn_validate_deceased_status();
```

### 4.4 Đồng bộ Enum & Constraints

#### Đồng bộ enums
```sql
-- sponsorships: Thêm ANONYMOUS
ALTER TYPE sponsor_type ADD VALUE IF NOT EXISTS 'ANONYMOUS';

-- invoices: Mở rộng status (đã có WAITING_CONFIRMATION qua migration)
-- Cần đảm bảo enum hoặc CHECK constraint khớp TypeScript

-- payments: Mở rộng status
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'PARTIAL';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'OVERPAYMENT';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REJECTED';
```

#### Thêm CHECK constraints
```sql
ALTER TABLE funds ADD CONSTRAINT funds_balance_nonnegative CHECK (current_balance >= 0);
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_period_valid CHECK (current_period_end > current_period_start);
ALTER TABLE plan_versions ADD CONSTRAINT plan_versions_effective_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE family_memberships ADD CONSTRAINT family_memberships_active_owner CHECK (role != 'OWNER' OR status = 'ACTIVE');
```

---

## 5. ĐỀ XUẤT BỔ SUNG BẢNG/TRƯỜNG

### 5.1 Bảng mới cần thiết

#### #1: `family_media_assets` — Quản lý tài sản đa phương tiện
```sql
CREATE TABLE IF NOT EXISTS family_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  caption TEXT,
  taken_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_media_family_type ON family_media_assets(family_id, asset_type);
CREATE INDEX idx_media_member ON family_media_assets(member_id);
```

**Lý do**: Hiện tại không có bảng quản lý ảnh/video gia đình, cần lưu metadata để tính dung lượng `MAX_STORAGE_MB`.

#### #2: `document_templates` — Mẫu giấy tờ gia tộc
```sql
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('CERTIFICATE', 'INVITATION', 'CONTRACT', 'MEMORIAL_CARD')),
  name TEXT NOT NULL,
  content_json JSONB NOT NULL,  -- Template structure for mail merge
  variables JSONB,              -- Available merge fields
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Lý do**: Hỗ trợ in giấy chứng nhận, giấy mời, thiệp giỗ theo mẫu chuẩn.

#### #3: `audit_log_archive` — Lưu trữ nhật ký kiểm toán cũ
```sql
CREATE TABLE IF NOT EXISTS audit_log_archive (
  LIKE audit_logs INCLUDING ALL,
  archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger tự động archive sau 90 ngày
CREATE OR REPLACE FUNCTION fn_archive_old_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log_archive SELECT *, NOW() FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Lý do**: Giảm kích thước bảng `audit_logs` chính, tăng hiệu suất truy vấn real-time.

### 5.2 Trường mới bổ sung vào bảng hiện có

#### `members`
```sql
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS cccd TEXT CHECK (length(cccd) = 12),
  ADD COLUMN IF NOT EXISTS tax_code TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS created_source TEXT DEFAULT 'MANUAL'; -- MANUAL, IMPORT, INVITATION
```

#### `families`
```sql
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS tax_code TEXT,
  ADD COLUMN IF NOT EXISTS representative_name TEXT,
  ADD COLUMN IF NOT EXISTS representative_phone TEXT,
  ADD COLUMN IF NOT EXISTS legal_address TEXT;
```

#### `financial_transactions`
```sql
ALTER TABLE financial_transactions
  ADD COLUMN IF NOT EXISTS reference_document TEXT,  -- Số chứng từ gốc
  ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
```

#### `subscriptions`
```sql
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS renewal_reminder_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;
```

---

## 6. KẾ HOẠCH TRIỂN KHAI (ROADMAP)

### Phase 1: Critical Fixes (1-2 ngày)
1. ✅ Thêm cột `expense_id` vào `financial_transactions`
2. ✅ Giải quyết circular reference `founder_member_id`
3. ✅ Sửa RLS policies sai tham chiếu bảng
4. ✅ Thêm INSERT policies cho `contributions`, `sponsorships`, `invitation_tokens`
5. ✅ Đồng bộ enum `sponsor_type` thêm `ANONYMOUS`

### Phase 2: Data Integrity (2-3 ngày)
1. ✅ Thêm CHECK constraints cho `funds`, `subscriptions`, `plan_versions`
2. ✅ Thêm soft-delete cho `members`, `events`
3. ✅ Thêm trigger chống delete `POSTED` transactions
4. ✅ Loại bỏ `is_deceased` redundant, chuẩn hóa dùng `status`

### Phase 3: Performance (3-5 ngày)
1. ✅ Bổ sung composite indexes
2. ✅ Tạo `mv_honor_roll` materialized view
3. ✅ Đánh chỉ mục GIST/BTREE cho LTree queries
4. ✅ Partitioning `financial_transactions` nếu > 500K rows

### Phase 4: Security Hardening (2-3 ngày)
1. ✅ Column-level encryption cho PII (phone, email, CCCD)
2. ✅ Rate limiting cho invitation token generation
3. ✅ IP-based restrictions cho admin operations
4. ✅ Audit log auto-archive mechanism

### Phase 5: Extensions (5-7 ngày)
1. ✅ Triển khai `family_media_assets` + storage quota tracking
2. ✅ Triển khai `document_templates` + mail merge engine
3. ✅ Bổ sung trường CCCD, mã số thuế, địa chỉ
4. ✅ Tích hợp webhook HMAC cho kích hoạt thuê bao

---

## 7. TÓM TẮT MỨC ĐỘ RỦI RO

| Mức độ | Số vấn đề | Hành động khuyến nghị |
|--------|-----------|----------------------|
| 🔴 Critical | 4 | **Dừng deploy**, fix ngay trước khi release |
| 🟠 High | 3 | Fix trong sprint hiện tại |
| 🟡 Medium | 6 | Lên kế hoạch cải tiến trong 2-4 tuần |
| 🟢 Low | 4 | Theo dõi, fix khi có thời gian |

---

## 8. KHUYẾN NGHỊ TỔNG THỂ

1. **Tuân thủ nghiêm ngặt Business Rules**: Mọi thay đổi schema phải đảm bảo `BR-LEDGER-001` (immutable ledger) và `BR-FUND-001` (fund independence) không bị vi phạm.
2. **Test-First cho Database Changes**: Mỗi migration phải có script rollback và kiểm thử trên staging trước khi apply production.
3. **Zero-Data-Loss Migration**: Tất cả thay đổi đều phải additive (`ADD COLUMN`, `ADD INDEX`), không drop/truncate dữ liệu cũ.
4. **Monitoring**: Thêm `pg_stat_statements` để theo dõi slow queries, đặc biệt các báo cáo tài chính.
5. **Backup Strategy**: PITR (Point-in-Time Recovery) 7 ngày cho database chứa dữ liệu gia phả là tài sản thiêng liêng.

---

*Báo cáo được tạo bởi Kilo Database Audit Engine*  
*Dựa trên phân tích: DATABASE_SCHEMA.sql (1283 lines), 5 migration files, TypeScript types, BUSINESS_RULES.md*
