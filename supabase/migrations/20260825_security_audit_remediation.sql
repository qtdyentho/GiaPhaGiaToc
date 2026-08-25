-- ============================================================================
-- MIGRATION: SECURITY AUDIT REMEDIATION (RLS POLICIES, MULTI-TENANT ISOLATION, RPC)
-- Date: 2026-08-25
-- Description:
--   1. Tạo hàm current_user_family_ids() dùng chung cho các RLS policies.
--   2. Sửa RLS bảng profiles từ profiles_read_all thành profiles_read_tenant (chống rò rỉ PII).
--   3. Sửa typo bảng public.family_members -> family_memberships trong policies.
--   4. Bổ sung Write Policies cho contributions, sponsorships, invitation_tokens.
-- ============================================================================

-- 1. Hàm helper lấy danh sách family_id mà user hiện tại có quyền truy cập
CREATE OR REPLACE FUNCTION current_user_family_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(ARRAY_AGG(family_id), '{}'::UUID[]) 
  FROM family_memberships 
  WHERE user_id = auth.uid() AND status = 'ACTIVE';
$$;

-- 2. Khắc phục RLS Bảng PROFILES (SEC-002: Chống Mass PII Exposure)
DROP POLICY IF EXISTS profiles_read_all ON profiles;
DROP POLICY IF EXISTS profiles_read_tenant ON profiles;

CREATE POLICY profiles_read_tenant ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR id IN (
      SELECT user_id FROM family_memberships 
      WHERE family_id IN (
        SELECT unnest(current_user_family_ids())
      ) AND status = 'ACTIVE'
    )
  );

-- 3. Khắc phục Typo bảng trong SaaS Policies (SEC-005)
DROP POLICY IF EXISTS "Family isolation for usage counters" ON usage_counters;
CREATE POLICY "Family isolation for usage counters" ON usage_counters
  FOR ALL TO authenticated
  USING (
    family_id IN (
      SELECT unnest(current_user_family_ids())
    )
  );

DROP POLICY IF EXISTS "Family isolation for usage events" ON usage_events;
CREATE POLICY "Family isolation for usage events" ON usage_events
  FOR ALL TO authenticated
  USING (
    family_id IN (
      SELECT unnest(current_user_family_ids())
    )
  );

DROP POLICY IF EXISTS "Family isolation for trial periods" ON trial_periods;
CREATE POLICY "Family isolation for trial periods" ON trial_periods
  FOR ALL TO authenticated
  USING (
    family_id IN (
      SELECT unnest(current_user_family_ids())
    )
  );

-- 4. Bổ sung Write RLS Policies (SEC-006)
-- Contributions: Thành viên gia tộc được tạo bản ghi đóng góp
DROP POLICY IF EXISTS contributions_insert_member ON contributions;
CREATE POLICY contributions_insert_member ON contributions 
  FOR INSERT TO authenticated 
  WITH CHECK (
    family_id IN (
      SELECT unnest(current_user_family_ids())
    )
  );

-- Sponsorships: Thành viên gia tộc được tạo bản ghi tài trợ
DROP POLICY IF EXISTS sponsorships_insert_member ON sponsorships;
CREATE POLICY sponsorships_insert_member ON sponsorships 
  FOR INSERT TO authenticated 
  WITH CHECK (
    family_id IN (
      SELECT unnest(current_user_family_ids())
    )
  );

-- Invitation Tokens: Chỉ OWNER hoặc ADMIN mới được tạo mã mời
DROP POLICY IF EXISTS invitation_tokens_insert_admin ON invitation_tokens;
CREATE POLICY invitation_tokens_insert_admin ON invitation_tokens 
  FOR INSERT TO authenticated 
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_memberships 
      WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS invitation_tokens_update_admin ON invitation_tokens;
CREATE POLICY invitation_tokens_update_admin ON invitation_tokens 
  FOR UPDATE TO authenticated 
  USING (
    family_id IN (
      SELECT family_id FROM family_memberships 
      WHERE user_id = auth.uid() AND status = 'ACTIVE' AND role IN ('OWNER', 'ADMIN')
    )
  );
