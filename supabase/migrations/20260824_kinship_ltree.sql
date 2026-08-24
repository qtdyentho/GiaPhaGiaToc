-- ============================================================================
-- MIGRATION: 20260824_kinship_ltree.sql
-- PURPOSE: PostgreSQL LTree Tree Optimization, Auto Branch Path Trigger &
--          Vietnamese Kinship Reasoning Algorithm (Danh Xưng Gia Tộc)
-- ============================================================================

-- 1. Enable PostgreSQL LTree Extension for ultra-fast hierarchy & branch queries
CREATE EXTENSION IF NOT EXISTS ltree;

-- 2. Enhance members table with tree traversal columns
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS father_id UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mother_id UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS spouse_id UUID REFERENCES members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS birth_order INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS generation_index INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS branch_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS branch_path ltree;

-- 3. Optimized GIST and B-Tree indexes for lightning-fast subtree querying
CREATE INDEX IF NOT EXISTS idx_members_branch_path_gist ON members USING GIST (branch_path);
CREATE INDEX IF NOT EXISTS idx_members_branch_path_btree ON members USING BTREE (branch_path);
CREATE INDEX IF NOT EXISTS idx_members_father_id ON members (father_id);
CREATE INDEX IF NOT EXISTS idx_members_family_gen ON members (family_id, generation_index);

-- 4. Trigger Function: Automatically compute branch_path and generation_index
CREATE OR REPLACE FUNCTION fn_auto_compute_member_branch_path()
RETURNS TRIGGER AS $$
DECLARE
  v_father_path ltree;
  v_father_gen INT;
  v_node_label TEXT;
BEGIN
  -- Build clean node identifier (e.g. c1, c2, c3 for birth order)
  v_node_label := 'c' || COALESCE(NEW.birth_order, 1)::TEXT;

  -- If member has a father, inherit father's branch_path and increment generation
  IF NEW.father_id IS NOT NULL THEN
    SELECT branch_path, generation_index
    INTO v_father_path, v_father_gen
    FROM members
    WHERE id = NEW.father_id;

    IF v_father_path IS NOT NULL THEN
      NEW.branch_path := v_father_path || v_node_label::ltree;
      NEW.generation_index := COALESCE(v_father_gen, 1) + 1;
    ELSE
      -- Fallback if father has no branch_path yet
      NEW.branch_path := ('root.' || v_node_label)::ltree;
      NEW.generation_index := COALESCE(v_father_gen, 1) + 1;
    END IF;
  ELSE
    -- Root ancestor (Thủy Tổ / Đời 1)
    IF NEW.branch_path IS NULL THEN
      NEW.branch_path := ('root.' || v_node_label)::ltree;
      NEW.generation_index := 1;
    END IF;
  END IF;

  -- Format human-readable branch_code (e.g., T1.N1.C1)
  NEW.branch_code := REPLACE(NEW.branch_path::TEXT, '.', '-');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_compute_member_branch_path ON members;
CREATE TRIGGER trg_auto_compute_member_branch_path
BEFORE INSERT OR UPDATE OF father_id, birth_order ON members
FOR EACH ROW
EXECUTE FUNCTION fn_auto_compute_member_branch_path();

-- 5. RPC Function: Calculate Vietnamese Kinship Reasoning between two members
CREATE OR REPLACE FUNCTION calculate_kinship(
  p_member_a_id UUID,
  p_member_b_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_member_a RECORD;
  v_member_b RECORD;
  v_delta_g INT;
  v_term_a_calls_b TEXT;
  v_term_b_calls_a TEXT;
  v_relationship_category TEXT;
  v_seniority TEXT := 'EQUAL';
  v_explanation TEXT;
  v_lca_name TEXT := 'Tổ Tiên Chung';
  v_lca_path ltree;
  v_a_subpath TEXT;
  v_b_subpath TEXT;
  v_a_order INT := 1;
  v_b_order INT := 1;
BEGIN
  -- Step 1: Fetch Member A & Member B
  SELECT id, full_name, gender, birth_order, generation_index, branch_path, father_id, spouse_id
  INTO v_member_a
  FROM members WHERE id = p_member_a_id;

  SELECT id, full_name, gender, birth_order, generation_index, branch_path, father_id, spouse_id
  INTO v_member_b
  FROM members WHERE id = p_member_b_id;

  IF v_member_a.id IS NULL OR v_member_b.id IS NULL THEN
    RETURN jsonb_build_object('error', 'Không tìm thấy thông tin thành viên');
  END IF;

  -- Self check
  IF v_member_a.id = v_member_b.id THEN
    RETURN jsonb_build_object(
      'term_a_calls_b', 'Bản thân',
      'term_b_calls_a', 'Bản thân',
      'generation_distance', 0,
      'relationship_category', 'SELF',
      'seniority', 'EQUAL',
      'explanation', 'Đây là cùng một người trong gia phả.'
    );
  END IF;

  -- Spouse check
  IF v_member_a.spouse_id = v_member_b.id OR v_member_b.spouse_id = v_member_a.id THEN
    IF v_member_b.gender = 'FEMALE' THEN
      v_term_a_calls_b := 'Vợ (Bà xã / Hiền thê)';
      v_term_b_calls_a := 'Chồng (Ông xã / Phu quân)';
    ELSE
      v_term_a_calls_b := 'Chồng (Ông xã / Phu quân)';
      v_term_b_calls_a := 'Vợ (Bà xã / Hiền thê)';
    END IF;
    RETURN jsonb_build_object(
      'term_a_calls_b', v_term_a_calls_b,
      'term_b_calls_a', v_term_b_calls_a,
      'generation_distance', 0,
      'relationship_category', 'SPOUSE',
      'seniority', 'EQUAL',
      'explanation', 'Mối quan hệ Vợ Chồng trong gia đình.'
    );
  END IF;

  -- Direct Parent / Child check
  IF v_member_a.father_id = v_member_b.id THEN
    v_term_a_calls_b := 'Bố (Cha / Thân phụ)';
    v_term_b_calls_a := CASE WHEN v_member_a.gender = 'FEMALE' THEN 'Con gái' ELSE 'Con trai' END;
    RETURN jsonb_build_object(
      'term_a_calls_b', v_term_a_calls_b,
      'term_b_calls_a', v_term_b_calls_a,
      'generation_distance', 1,
      'relationship_category', 'PARENT_CHILD',
      'seniority', 'B_IS_SENIOR',
      'explanation', 'B là Bố đẻ của A.'
    );
  END IF;

  IF v_member_b.father_id = v_member_a.id THEN
    v_term_a_calls_b := CASE WHEN v_member_b.gender = 'FEMALE' THEN 'Con gái' ELSE 'Con trai' END;
    v_term_b_calls_a := 'Bố (Cha / Thân phụ)';
    RETURN jsonb_build_object(
      'term_a_calls_b', v_term_a_calls_b,
      'term_b_calls_a', v_term_b_calls_a,
      'generation_distance', -1,
      'relationship_category', 'PARENT_CHILD',
      'seniority', 'A_IS_SENIOR',
      'explanation', 'A là Bố đẻ của B.'
    );
  END IF;

  -- Compute Generation Distance: ΔG = G(A) - G(B)
  v_delta_g := COALESCE(v_member_a.generation_index, 1) - COALESCE(v_member_b.generation_index, 1);

  -- Lowest Common Ancestor (LCA) using ltree lca function if paths exist
  IF v_member_a.branch_path IS NOT NULL AND v_member_b.branch_path IS NOT NULL THEN
    v_lca_path := lca(v_member_a.branch_path, v_member_b.branch_path);
    IF v_lca_path IS NOT NULL THEN
      SELECT full_name INTO v_lca_name FROM members WHERE branch_path = v_lca_path LIMIT 1;
      IF v_lca_name IS NULL THEN
        v_lca_name := 'Tiền nhân chung chi tộc';
      END IF;
    END IF;
  END IF;

  -- CASE 1: Đồng Thế Hệ (ΔG = 0) -> Anh / Chị / Em họ
  IF v_delta_g = 0 THEN
    v_relationship_category := 'SAME_GENERATION';
    
    -- Same Father -> Anh Chị Em ruột
    IF v_member_a.father_id IS NOT NULL AND v_member_a.father_id = v_member_b.father_id THEN
      IF v_member_a.birth_order > v_member_b.birth_order THEN
        v_seniority := 'B_IS_SENIOR';
        v_term_a_calls_b := CASE WHEN v_member_b.gender = 'FEMALE' THEN 'Chị ruột' ELSE 'Anh ruột' END;
        v_term_b_calls_a := 'Em ruột';
        v_explanation := 'B sinh trước A trong cùng một nhà, A gọi B là Anh/Chị ruột.';
      ELSE
        v_seniority := 'A_IS_SENIOR';
        v_term_a_calls_b := 'Em ruột';
        v_term_b_calls_a := CASE WHEN v_member_a.gender = 'FEMALE' THEN 'Chị ruột' ELSE 'Anh ruột' END;
        v_explanation := 'A sinh trước B trong cùng một nhà, A gọi B là Em ruột.';
      END IF;
    ELSE
      -- Anh em họ: So sánh thứ tự cành xuất phát từ Tổ Tiên Chung
      IF COALESCE(v_member_a.birth_order, 1) > COALESCE(v_member_b.birth_order, 1) THEN
        v_seniority := 'B_IS_SENIOR';
        v_term_a_calls_b := CASE WHEN v_member_b.gender = 'FEMALE' THEN 'Chị họ (Vế trên)' ELSE 'Anh họ (Vế trên)' END;
        v_term_b_calls_a := 'Em họ (Vế dưới)';
        v_explanation := 'Nhánh của B thuộc cành trên (con bác/chi trưởng), nên theo tục lệ dòng họ A gọi B là Anh/Chị và xưng Em.';
      ELSE
        v_seniority := 'A_IS_SENIOR';
        v_term_a_calls_b := 'Em họ (Vế dưới)';
        v_term_b_calls_a := CASE WHEN v_member_a.gender = 'FEMALE' THEN 'Chị họ (Vế trên)' ELSE 'Anh họ (Vế trên)' END;
        v_explanation := 'Nhánh của A thuộc cành trên (con bác/chi trưởng), nên theo tục lệ dòng họ A gọi B là Em.';
      END IF;
    END IF;

  -- CASE 2: Lệch 1 Thế Hệ (ΔG = 1 hoặc -1) -> Bác, Chú, Cô, Cậu, Dì, Cháu
  ELSIF v_delta_g = 1 THEN
    -- A ở đời dưới B: B là vai Bác/Chú/Cô của A
    v_relationship_category := 'UNCLE_AUNT';
    v_seniority := 'B_IS_SENIOR';

    IF v_member_b.gender = 'FEMALE' THEN
      v_term_a_calls_b := 'Cô (hoặc Dì họ)';
    ELSE
      -- Nếu B thuộc nhánh trên hoặc lớn hơn bố A -> Bác, ngược lại -> Chú
      IF v_member_b.birth_order = 1 OR v_member_b.birth_order < COALESCE(v_member_a.birth_order, 2) THEN
        v_term_a_calls_b := 'Bác họ';
      ELSE
        v_term_a_calls_b := 'Chú họ';
      END IF;
    END IF;
    v_term_b_calls_a := 'Cháu';
    v_explanation := 'B ở đời trên của A, A gọi B là ' || v_term_a_calls_b || ' và xưng Cháu.';

  ELSIF v_delta_g = -1 THEN
    -- A ở đời trên B: A là vai Bác/Chú/Cô của B
    v_relationship_category := 'NEPHEW_NIECE';
    v_seniority := 'A_IS_SENIOR';

    IF v_member_a.gender = 'FEMALE' THEN
      v_term_b_calls_a := 'Cô (hoặc Dì họ)';
    ELSE
      IF v_member_a.birth_order = 1 OR v_member_a.birth_order < COALESCE(v_member_b.birth_order, 2) THEN
        v_term_b_calls_a := 'Bác họ';
      ELSE
        v_term_b_calls_a := 'Chú họ';
      END IF;
    END IF;
    v_term_a_calls_b := 'Cháu';
    v_explanation := 'A ở đời trên của B, A gọi B là Cháu và B gọi A là ' || v_term_b_calls_a || '.';

  -- CASE 3: Lệch 2 Thế Hệ (ΔG = 2 hoặc -2) -> Ông/Bà - Cháu
  ELSIF v_delta_g = 2 THEN
    v_relationship_category := 'GRANDPARENT_GRANDCHILD';
    v_seniority := 'B_IS_SENIOR';
    IF v_member_b.gender = 'FEMALE' THEN
      v_term_a_calls_b := 'Bà (Bà nội / Bà cô dòng tộc)';
    ELSE
      v_term_a_calls_b := CASE WHEN v_member_b.birth_order = 1 THEN 'Ông trưởng (Ông nội tộc)' ELSE 'Ông chú (Ông nội tộc)' END;
    END IF;
    v_term_b_calls_a := 'Cháu nội tộc';
    v_explanation := 'B cách A 2 đời (thế hệ Ông/Bà), A gọi B là ' || v_term_a_calls_b || ' và xưng Cháu.';

  ELSIF v_delta_g = -2 THEN
    v_relationship_category := 'GRANDPARENT_GRANDCHILD';
    v_seniority := 'A_IS_SENIOR';
    IF v_member_a.gender = 'FEMALE' THEN
      v_term_b_calls_a := 'Bà (Bà nội / Bà cô dòng tộc)';
    ELSE
      v_term_b_calls_a := CASE WHEN v_member_a.birth_order = 1 THEN 'Ông trưởng (Ông nội tộc)' ELSE 'Ông chú (Ông nội tộc)' END;
    END IF;
    v_term_a_calls_b := 'Cháu nội tộc';
    v_explanation := 'A cách B 2 đời (thế hệ Ông/Bà), A gọi B là Cháu nội tộc.';

  -- CASE 4: Lệch 3 Thế Hệ (ΔG = 3 hoặc -3) -> Cụ/Cố - Chắt
  ELSIF v_delta_g = 3 THEN
    v_relationship_category := 'GREAT_GRANDPARENT';
    v_seniority := 'B_IS_SENIOR';
    v_term_a_calls_b := 'Cụ (hoặc Cố)';
    v_term_b_calls_a := 'Chắt';
    v_explanation := 'B cách A 3 đời (thế hệ Cụ/Cố), A gọi B là Cụ và xưng Chắt.';

  ELSIF v_delta_g = -3 THEN
    v_relationship_category := 'GREAT_GRANDPARENT';
    v_seniority := 'A_IS_SENIOR';
    v_term_a_calls_b := 'Chắt';
    v_term_b_calls_a := 'Cụ (hoặc Cố)';
    v_explanation := 'A cách B 3 đời (thế hệ Cụ/Cố), A gọi B là Chắt.';

  -- CASE 5: Lệch 4 Thế Hệ trở lên (ΔG >= 4 hoặc <= -4) -> Kỵ / Tiên Tổ - Chút / Chít
  ELSIF v_delta_g >= 4 THEN
    v_relationship_category := 'ANCESTOR';
    v_seniority := 'B_IS_SENIOR';
    v_term_a_calls_b := CASE WHEN v_delta_g = 4 THEN 'Cụ Kỵ' ELSE 'Tiên tổ tiền nhân' END;
    v_term_b_calls_a := 'Chút / Chít đời sau';
    v_explanation := 'B cách A ' || v_delta_g || ' đời, là bậc Tiên tổ tiền nhân của dòng họ.';

  ELSE
    v_relationship_category := 'ANCESTOR';
    v_seniority := 'A_IS_SENIOR';
    v_term_a_calls_b := 'Chút / Chít đời sau';
    v_term_b_calls_a := CASE WHEN ABS(v_delta_g) = 4 THEN 'Cụ Kỵ' ELSE 'Tiên tổ tiền nhân' END;
    v_explanation := 'A cách B ' || ABS(v_delta_g) || ' đời, là bậc Tiên tổ tiền nhân của dòng họ.';
  END IF;

  RETURN jsonb_build_object(
    'term_a_calls_b', v_term_a_calls_b,
    'term_b_calls_a', v_term_b_calls_a,
    'generation_distance', v_delta_g,
    'relationship_category', v_relationship_category,
    'seniority', v_seniority,
    'lca_name', v_lca_name,
    'explanation', v_explanation
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
