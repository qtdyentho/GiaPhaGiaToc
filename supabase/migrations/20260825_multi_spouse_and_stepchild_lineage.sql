-- ============================================================================
-- MIGRATION: 20260825_multi_spouse_and_stepchild_lineage.sql
-- PURPOSE: Hỗ Trợ Toàn Diện:
--          1. Chế độ Đa Thê Cổ Truyền (Bà Cả / Chính Thất, Bà Hai / Kế Thất, Bà Ba / Trắc Thất)
--          2. Nghiệp Vụ Con Riêng Của Vợ (Maternal Stepchild), Con Riêng Của Chồng, Con Nuôi
--          3. Bảng Cặp Hạt Nhân Hôn Phối (family_unions) & Trigger LTree Phân Nhánh Tự Động
-- ============================================================================

-- 1. TẠO CÁC ENUMS MỚI CHO THỨ BẬC HÔN PHỐI & LOẠI HUYẾT THỐNG CON CÁI
DO $$ BEGIN
    CREATE TYPE spouse_rank_type AS ENUM (
        'CHINH_THAT',   -- Bà Cả / Nguyên Phối (Vợ chính thức đầu tiên)
        'KE_THAT',      -- Bà Hai / Kế Thất (Vợ lấy sau khi bà cả mất hoặc tái hôn)
        'THAC_THAT',    -- Bà Ba, Bà Tư / Thứ Thiếp (Vợ thứ)
        'KHONG_RO'      -- Chưa rõ thứ tự trong tư liệu cổ
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE child_lineage_type AS ENUM (
        'BIOLOGICAL',           -- Con ruột (Cùng huyết thống cha và mẹ trong hôn phối)
        'MATERNAL_STEPCHILD',   -- Con riêng của người vợ (sinh trước khi lấy chồng vào họ)
        'PATERNAL_STEPCHILD',   -- Con riêng của người chồng (với người ngoài gia tộc)
        'ADOPTED'               -- Con nuôi được gia tộc làm lễ nhập tịch
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TẠO BẢNG HẠT NHÂN HÔN PHỐI (FAMILY_UNIONS)
CREATE TABLE IF NOT EXISTS family_unions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    
    husband_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    wife_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- Thứ tự hôn phối & Danh hiệu
    marriage_order INT NOT NULL DEFAULT 1,
    spouse_rank spouse_rank_type NOT NULL DEFAULT 'CHINH_THAT',
    custom_rank_title VARCHAR(150),       -- VD: 'Cụ Bà Cả (Chính Thất Đệ Nhất)'
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_family_union_couple UNIQUE (husband_id, wife_id)
);

CREATE INDEX IF NOT EXISTS idx_family_unions_family ON family_unions(family_id);
CREATE INDEX IF NOT EXISTS idx_family_unions_husband ON family_unions(husband_id);
CREATE INDEX IF NOT EXISTS idx_family_unions_wife ON family_unions(wife_id);

-- 3. NÂNG CẤP BẢNG MEMBERS ĐỂ QUẢN LÝ CON RIÊNG & ĐA HÔN PHỐI
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS child_lineage_type child_lineage_type NOT NULL DEFAULT 'BIOLOGICAL',
  ADD COLUMN IF NOT EXISTS union_id UUID REFERENCES family_unions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_stepchild BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS biological_mother_id UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS biological_father_id UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS spouse_rank spouse_rank_type DEFAULT 'CHINH_THAT',
  ADD COLUMN IF NOT EXISTS marriage_order INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_members_union_id ON members(union_id);
CREATE INDEX IF NOT EXISTS idx_members_lineage_type ON members(child_lineage_type);
CREATE INDEX IF NOT EXISTS idx_members_bio_mother ON members(biological_mother_id);

-- 4. NÂNG CẤP BẢNG MEMBER_RELATIONSHIPS
ALTER TABLE member_relationships
  ADD COLUMN IF NOT EXISTS union_id UUID REFERENCES family_unions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS child_lineage_type child_lineage_type DEFAULT 'BIOLOGICAL',
  ADD COLUMN IF NOT EXISTS maternal_birth_order INT DEFAULT 1;

-- 5. TRIGGER FUNCTION NÂNG CẤP: TỰ ĐỘNG TÍNH TOÁN ĐƯỜNG DẪN CÂY CHO CON RUỘT VÀ CON RIÊNG
CREATE OR REPLACE FUNCTION fn_auto_compute_member_branch_path()
RETURNS TRIGGER AS $$
DECLARE
  v_father_path ltree;
  v_father_gen INT;
  v_mother_path ltree;
  v_mother_gen INT;
  v_node_label TEXT;
BEGIN
  -- 1. Nếu là Con Riêng Của Vợ (MATERNAL_STEPCHILD): Kế thừa theo nhánh của Người Mẹ
  IF NEW.child_lineage_type = 'MATERNAL_STEPCHILD' THEN
    NEW.is_stepchild := TRUE;
    v_node_label := 'step_m' || COALESCE(NEW.birth_order, 1)::TEXT;
    
    IF NEW.mother_id IS NOT NULL OR NEW.biological_mother_id IS NOT NULL THEN
      SELECT branch_path, generation_index
      INTO v_mother_path, v_mother_gen
      FROM members
      WHERE id = COALESCE(NEW.mother_id, NEW.biological_mother_id);

      IF v_mother_path IS NOT NULL THEN
        NEW.branch_path := v_mother_path || v_node_label::ltree;
        NEW.generation_index := COALESCE(v_mother_gen, 1) + 1;
      ELSE
        NEW.branch_path := ('root.' || v_node_label)::ltree;
        NEW.generation_index := COALESCE(v_mother_gen, 1) + 1;
      END IF;
    ELSE
      NEW.branch_path := ('root.' || v_node_label)::ltree;
    END IF;

  -- 2. Nếu là Con Nuôi (ADOPTED): Đánh dấu mã nuôi
  ELSIF NEW.child_lineage_type = 'ADOPTED' THEN
    v_node_label := 'adp' || COALESCE(NEW.birth_order, 1)::TEXT;
    IF NEW.father_id IS NOT NULL THEN
      SELECT branch_path, generation_index INTO v_father_path, v_father_gen FROM members WHERE id = NEW.father_id;
      NEW.branch_path := COALESCE(v_father_path, 'root'::ltree) || v_node_label::ltree;
      NEW.generation_index := COALESCE(v_father_gen, 1) + 1;
    END IF;

  -- 3. Con Ruột Trực Hệ (BIOLOGICAL / PATERNAL)
  ELSE
    v_node_label := 'c' || COALESCE(NEW.birth_order, 1)::TEXT;
    IF NEW.father_id IS NOT NULL THEN
      SELECT branch_path, generation_index INTO v_father_path, v_father_gen FROM members WHERE id = NEW.father_id;
      IF v_father_path IS NOT NULL THEN
        NEW.branch_path := v_father_path || v_node_label::ltree;
        NEW.generation_index := COALESCE(v_father_gen, 1) + 1;
      ELSE
        NEW.branch_path := ('root.' || v_node_label)::ltree;
        NEW.generation_index := COALESCE(v_father_gen, 1) + 1;
      END IF;
    ELSE
      -- Thủy Tổ (Đời 1)
      IF NEW.branch_path IS NULL THEN
        NEW.branch_path := ('root.' || v_node_label)::ltree;
        NEW.generation_index := 1;
      END IF;
    END IF;
  END IF;

  -- Đồng bộ branch_code
  NEW.branch_code := REPLACE(NEW.branch_path::TEXT, '.', '-');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach Trigger
DROP TRIGGER IF EXISTS trg_auto_compute_member_branch_path ON members;
CREATE TRIGGER trg_auto_compute_member_branch_path
BEFORE INSERT OR UPDATE OF father_id, mother_id, child_lineage_type, birth_order ON members
FOR EACH ROW
EXECUTE FUNCTION fn_auto_compute_member_branch_path();

-- 6. RPC: TẠO HÔN PHỐI & RÀNG BUỘC THỨ BẬC
CREATE OR REPLACE FUNCTION rpc_create_family_union(
    p_family_id UUID,
    p_husband_id UUID,
    p_wife_id UUID,
    p_spouse_rank spouse_rank_type DEFAULT 'CHINH_THAT',
    p_marriage_order INT DEFAULT 1,
    p_custom_rank_title VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_union_id UUID;
BEGIN
    INSERT INTO family_unions (
        family_id, husband_id, wife_id, spouse_rank, marriage_order, custom_rank_title
    ) VALUES (
        p_family_id, p_husband_id, p_wife_id, p_spouse_rank, p_marriage_order, p_custom_rank_title
    )
    ON CONFLICT (husband_id, wife_id) DO UPDATE
    SET spouse_rank = EXCLUDED.spouse_rank,
        marriage_order = EXCLUDED.marriage_order,
        custom_rank_title = EXCLUDED.custom_rank_title,
        updated_at = NOW()
    RETURNING id INTO v_union_id;

    -- Cập nhật thứ bậc vào bảng members cho người vợ
    UPDATE members
    SET spouse_rank = p_spouse_rank,
        marriage_order = p_marriage_order
    WHERE id = p_wife_id;

    RETURN v_union_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
