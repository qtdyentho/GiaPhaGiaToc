import { describe, it } from 'node:test';
import assert from 'node:assert';
import { KinshipService } from '../src/services/genealogy/KinshipService';
import { getLineageHierarchyInfo, filterLineageTree } from '../src/utils/lineageHierarchy';
import { Member, Generation, Branch, MemberRelationship } from '../src/types/database';

describe('CHALLENGER 2: ADVERSARIAL STRESS TEST SUITE - TREE LAYOUT, KINSHIP & VIEWPORT', () => {

  // =========================================================================
  // SECTION 1: KINSHIP REASONING ENGINE ADVERSARIAL STRESS TESTS
  // =========================================================================
  describe('1. KinshipService Adversarial & Edge Case Tests', () => {
    
    // Dataset 1: Deep Matrilineal Lineage (6 Generations)
    const matriarchClan = [
      {
        id: 'mat-001',
        family_id: 'clan-001',
        full_name: 'Bà Thủy Tổ Nguyễn Thị Mẫu',
        gender: 'FEMALE',
        generation_index: 1,
        birth_order: 1,
        life_status: 'DECEASED',
      },
      {
        id: 'mat-002',
        family_id: 'clan-001',
        full_name: 'Nguyễn Thị Hương (Đời 2)',
        gender: 'FEMALE',
        mother_id: 'mat-001',
        generation_index: 2,
        birth_order: 1,
        life_status: 'DECEASED',
      },
      {
        id: 'mat-003',
        family_id: 'clan-001',
        full_name: 'Nguyễn Thị Lan (Đời 3)',
        gender: 'FEMALE',
        mother_id: 'mat-002',
        generation_index: 3,
        birth_order: 1,
        life_status: 'DECEASED',
      },
      {
        id: 'mat-004',
        family_id: 'clan-001',
        full_name: 'Nguyễn Thị Mai (Đời 4)',
        gender: 'FEMALE',
        mother_id: 'mat-003',
        generation_index: 4,
        birth_order: 1,
        life_status: 'ALIVE',
      },
      {
        id: 'mat-005',
        family_id: 'clan-001',
        full_name: 'Nguyễn Thị Cúc (Đời 5)',
        gender: 'FEMALE',
        mother_id: 'mat-004',
        generation_index: 5,
        birth_order: 1,
        life_status: 'ALIVE',
      },
      {
        id: 'mat-006',
        family_id: 'clan-001',
        full_name: 'Nguyễn Văn Trúc (Đời 6)',
        gender: 'MALE',
        mother_id: 'mat-005',
        generation_index: 6,
        birth_order: 1,
        life_status: 'ALIVE',
      },
    ] as unknown as Member[];

    it('[KIN-ADV-001] Matrilineal 5-generation distance (Đời 6 gọi Đời 1 Thủy Tổ Mẫu Hệ)', () => {
      const truc = matriarchClan.find((m) => m.id === 'mat-006')!;
      const mau = matriarchClan.find((m) => m.id === 'mat-001')!;

      const res = KinshipService.evaluateKinshipLocal(truc, mau, matriarchClan);
      assert.strictEqual(res.generation_distance, 5, 'Generation distance must be 5');
      assert.strictEqual(res.seniority, 'B_IS_SENIOR');
      assert.ok(res.term_a_calls_b.includes('Bậc Tiên Tổ Tiền Nhân') || res.term_a_calls_b.includes('Tiên Tổ'), 'Term A calls B should be ancestor');
      assert.ok(res.term_b_calls_a.includes('Chút / Chít') || res.term_b_calls_a.includes('hậu duệ'), 'Term B calls A should be descendant');
      assert.strictEqual(res.lca_name, mau.full_name, 'LCA must correctly resolve to the matriarch');
    });

    it('[KIN-ADV-002] Matrilineal Maternal Aunt (Dì / Cô họ) check across mother lines', () => {
      // Add sister to mat-004 (Mai): Nguyễn Thị Đào
      const dao = {
        id: 'mat-004-b',
        family_id: 'clan-001',
        full_name: 'Nguyễn Thị Đào (Dì ruột/họ)',
        gender: 'FEMALE',
        mother_id: 'mat-003',
        generation_index: 4,
        birth_order: 2,
        life_status: 'ALIVE',
      } as unknown as Member;
      const extendedClan = [...matriarchClan, dao];
      const cuc = extendedClan.find((m) => m.id === 'mat-005')!; // Con của Mai (Đời 5)

      const cucCallsDao = KinshipService.evaluateKinshipLocal(cuc, dao, extendedClan);
      assert.strictEqual(cucCallsDao.generation_distance, 1);
      assert.ok(cucCallsDao.term_a_calls_b.includes('Cô họ') || cucCallsDao.term_a_calls_b.includes('Dì'));
      assert.strictEqual(cucCallsDao.term_b_calls_a, 'Cháu');
      assert.strictEqual(cucCallsDao.lca_name, 'Nguyễn Thị Lan (Đời 3)');
    });

    // Dataset 2: Blended Family (Polygyny with 3 Wives & Half-Siblings)
    const blendedClan = [
      {
        id: 'poly-father',
        family_id: 'clan-002',
        full_name: 'Cụ Ông Trần Văn Trọng',
        gender: 'MALE',
        generation_index: 2,
        birth_order: 1,
        life_status: 'DECEASED',
      },
      {
        id: 'poly-wife-1',
        family_id: 'clan-002',
        full_name: 'Bà Cả Lê Thị Nhất (Chính Thất)',
        gender: 'FEMALE',
        spouse_id: 'poly-father',
        spouse_rank: 'CHINH_THAT',
        marriage_order: 1,
        generation_index: 2,
        life_status: 'DECEASED',
      },
      {
        id: 'poly-wife-2',
        family_id: 'clan-002',
        full_name: 'Bà Hai Phạm Thị Nhị (Kế Thất)',
        gender: 'FEMALE',
        spouse_id: 'poly-father',
        spouse_rank: 'KE_THAT',
        marriage_order: 2,
        generation_index: 2,
        life_status: 'DECEASED',
      },
      {
        id: 'poly-wife-3',
        family_id: 'clan-002',
        full_name: 'Bà Ba Hoàng Thị Tam (Trắc Thất)',
        gender: 'FEMALE',
        spouse_id: 'poly-father',
        spouse_rank: 'THAC_THAT',
        marriage_order: 3,
        generation_index: 2,
        life_status: 'ALIVE',
      },
      {
        id: 'poly-child-w1',
        family_id: 'clan-002',
        full_name: 'Trần Văn Cả (Con Bà Cả)',
        gender: 'MALE',
        father_id: 'poly-father',
        mother_id: 'poly-wife-1',
        generation_index: 3,
        birth_order: 1,
        life_status: 'ALIVE',
      },
      {
        id: 'poly-child-w2',
        family_id: 'clan-002',
        full_name: 'Trần Văn Hai (Con Bà Hai)',
        gender: 'MALE',
        father_id: 'poly-father',
        mother_id: 'poly-wife-2',
        generation_index: 3,
        birth_order: 2,
        life_status: 'ALIVE',
      },
      {
        id: 'poly-child-w3',
        family_id: 'clan-002',
        full_name: 'Trần Thị Ba (Con Bà Ba)',
        gender: 'FEMALE',
        father_id: 'poly-father',
        mother_id: 'poly-wife-3',
        generation_index: 3,
        birth_order: 3,
        life_status: 'ALIVE',
      },
    ] as unknown as Member[];

    it('[KIN-ADV-003] Half-siblings sharing same father correctly identify Brother/Sister relationship', () => {
      const child1 = blendedClan.find((m) => m.id === 'poly-child-w1')!;
      const child2 = blendedClan.find((m) => m.id === 'poly-child-w2')!;
      const child3 = blendedClan.find((m) => m.id === 'poly-child-w3')!;

      // Con Bà Cả (birth_order 1) vs Con Bà Hai (birth_order 2)
      const res1to2 = KinshipService.evaluateKinshipLocal(child1, child2, blendedClan);
      assert.strictEqual(res1to2.generation_distance, 0);
      assert.strictEqual(res1to2.term_a_calls_b, 'Em ruột');
      assert.strictEqual(res1to2.term_b_calls_a, 'Anh ruột');
      assert.strictEqual(res1to2.seniority, 'A_IS_SENIOR');

      // Con Bà Ba (Female, birth_order 3) calls Con Bà Cả (Male, birth_order 1)
      const res3to1 = KinshipService.evaluateKinshipLocal(child3, child1, blendedClan);
      assert.strictEqual(res3to1.term_a_calls_b, 'Anh ruột');
      assert.strictEqual(res3to1.term_b_calls_a, 'Em ruột');
      assert.strictEqual(res3to1.seniority, 'B_IS_SENIOR');
    });

    it('[KIN-ADV-004] Step-parent vs Step-child: Mother_id vs Father_id direct resolution', () => {
      const child2 = blendedClan.find((m) => m.id === 'poly-child-w2')!; // Mother is Phạm Thị Nhị
      const mother2 = blendedClan.find((m) => m.id === 'poly-wife-2')!;

      const res = KinshipService.evaluateKinshipLocal(child2, mother2, blendedClan);
      assert.strictEqual(res.generation_distance, 1);
      assert.strictEqual(res.term_a_calls_b, 'Mẹ (Thân mẫu)');
      assert.strictEqual(res.term_b_calls_a, 'Con trai');
    });

    // Dataset 3: Branch Seniority Inversion (Bé bằng củ khoai cứ vai mà gọi)
    // Chi Trưởng (Con Cả) vs Chi Thứ (Con Út)
    const cousinClan = [
      {
        id: 'root-to',
        family_id: 'clan-003',
        full_name: 'Cụ Thủy Tổ Vũ Tộc',
        gender: 'MALE',
        generation_index: 1,
        birth_order: 1,
        life_status: 'DECEASED',
      },
      // Đời 2: Bác Trưởng (birth_order 1) vs Chú Út (birth_order 4)
      {
        id: 'd2-bac-truong',
        family_id: 'clan-003',
        full_name: 'Vũ Văn Trưởng (Chi Trưởng)',
        gender: 'MALE',
        father_id: 'root-to',
        generation_index: 2,
        birth_order: 1,
        life_status: 'DECEASED',
      },
      {
        id: 'd2-chu-ut',
        family_id: 'clan-003',
        full_name: 'Vũ Văn Út (Chi Thứ)',
        gender: 'MALE',
        father_id: 'root-to',
        generation_index: 2,
        birth_order: 4,
        life_status: 'DECEASED',
      },
      // Đời 3: Con của Bác Trưởng (birth_order 1) vs Con của Chú Út (birth_order 1)
      {
        id: 'd3-con-bac',
        family_id: 'clan-003',
        full_name: 'Vũ Văn An (Con Bác Trưởng)',
        gender: 'MALE',
        father_id: 'd2-bac-truong',
        generation_index: 3,
        birth_order: 1,
        life_status: 'ALIVE',
      },
      {
        id: 'd3-con-chu',
        family_id: 'clan-003',
        full_name: 'Vũ Văn Bình (Con Chú Út - Lớn Tuổi Hơn)',
        gender: 'MALE',
        father_id: 'd2-chu-ut',
        generation_index: 3,
        birth_order: 1,
        life_status: 'ALIVE',
      },
    ] as unknown as Member[];

    it('[KIN-ADV-005] Cousin seniority invariant: Con Bác is senior to Con Chú regardless of personal age', () => {
      const conBac = cousinClan.find((m) => m.id === 'd3-con-bac')!;
      const conChu = cousinClan.find((m) => m.id === 'd3-con-chu')!;

      const anCallsBinh = KinshipService.evaluateKinshipLocal(conBac, conChu, cousinClan);
      assert.strictEqual(anCallsBinh.seniority, 'A_IS_SENIOR');
      assert.ok(anCallsBinh.term_a_calls_b.includes('Em họ (Vế dưới / Con Chú)'));
      assert.ok(anCallsBinh.term_b_calls_a.includes('Anh họ (Vế trên / Con Bác)'));

      const binhCallsAn = KinshipService.evaluateKinshipLocal(conChu, conBac, cousinClan);
      assert.strictEqual(binhCallsAn.seniority, 'B_IS_SENIOR');
      assert.ok(binhCallsAn.term_a_calls_b.includes('Anh họ (Vế trên / Con Bác)'));
      assert.ok(binhCallsAn.term_b_calls_a.includes('Em họ (Vế dưới / Con Chú)'));
    });

    it('[KIN-ADV-006] Cyclic ancestry graph protection: Engine terminates without infinite loop', () => {
      const cyclicClan = [
        {
          id: 'cyc-1',
          family_id: 'clan-cyc',
          full_name: 'Người A',
          gender: 'MALE',
          father_id: 'cyc-2', // A points to B as father
          generation_index: 2,
        },
        {
          id: 'cyc-2',
          family_id: 'clan-cyc',
          full_name: 'Người B',
          gender: 'MALE',
          father_id: 'cyc-1', // B points to A as father (Cycle!)
          generation_index: 2,
        },
      ] as unknown as Member[];

      const res = KinshipService.evaluateKinshipLocal(cyclicClan[0], cyclicClan[1], cyclicClan);
      assert.ok(res !== null, 'Should return a result without throwing infinite loop');
    });
  });

  // =========================================================================
  // SECTION 2: LINEAGE HIERARCHY & CÀNH TRACING ADVERSARIAL TESTS
  // =========================================================================
  describe('2. lineageHierarchy.ts Gen 3 Cành Tracing & Multi-Branch Spouse Retention', () => {

    const generations = [
      { id: 'gen-1', family_id: 'c1', generation_number: 1, name: 'Đời 1' },
      { id: 'gen-2', family_id: 'c1', generation_number: 2, name: 'Đời 2' },
      { id: 'gen-3', family_id: 'c1', generation_number: 3, name: 'Đời 3' },
      { id: 'gen-4', family_id: 'c1', generation_number: 4, name: 'Đời 4' },
      { id: 'gen-5', family_id: 'c1', generation_number: 5, name: 'Đời 5' },
    ] as unknown as Generation[];

    const branches = [
      { id: 'br-1', family_id: 'c1', name: 'Chi Trưởng', branch_code: 'c1' },
      { id: 'br-2', family_id: 'c1', name: 'Chi Hai', branch_code: 'c2' },
    ] as unknown as Branch[];

    const deepMembers = [
      // Đời 1
      {
        id: 'd1-root',
        family_id: 'c1',
        full_name: 'Cụ Thủy Tổ Khởi Nghiệp',
        gender: 'MALE',
        generation_id: 'gen-1',
        generation_index: 1,
        birth_order: 1,
      },
      // Đời 2: Chi Trưởng & Chi Hai
      {
        id: 'd2-chi1',
        family_id: 'c1',
        full_name: 'Cụ Chi Trưởng Đời 2',
        gender: 'MALE',
        father_id: 'd1-root',
        branch_id: 'br-1',
        generation_id: 'gen-2',
        generation_index: 2,
        birth_order: 1,
      },
      {
        id: 'd2-chi2',
        family_id: 'c1',
        full_name: 'Cụ Chi Hai Đời 2',
        gender: 'MALE',
        father_id: 'd1-root',
        branch_id: 'br-2',
        generation_id: 'gen-2',
        generation_index: 2,
        birth_order: 2,
      },
      // Đời 3: Cành 1 & Cành 2 của Chi Trưởng
      {
        id: 'd3-canh1',
        family_id: 'c1',
        full_name: 'Ông Cành 1 Đời 3 (Con Cả Chi 1)',
        gender: 'MALE',
        father_id: 'd2-chi1',
        branch_id: 'br-1',
        generation_id: 'gen-3',
        generation_index: 3,
        birth_order: 1,
      },
      {
        id: 'd3-canh2',
        family_id: 'c1',
        full_name: 'Ông Cành 2 Đời 3 (Con Thứ Chi 1)',
        gender: 'MALE',
        father_id: 'd2-chi1',
        branch_id: 'br-1',
        generation_id: 'gen-3',
        generation_index: 3,
        birth_order: 2,
      },
      // Đời 4: Nhánh 1 (con của Cành 2)
      {
        id: 'd4-nhanh1-c2',
        family_id: 'c1',
        full_name: 'Bác Nhánh 1 Đời 4 (Con Cành 2)',
        gender: 'MALE',
        father_id: 'd3-canh2',
        branch_id: 'br-1',
        generation_id: 'gen-4',
        generation_index: 4,
        birth_order: 1,
      },
      // Đời 5: Hậu duệ của Nhánh 1 (Cành 2)
      {
        id: 'd5-child',
        family_id: 'c1',
        full_name: 'Cháu Đời 5 (Hậu Duệ Cành 2)',
        gender: 'MALE',
        father_id: 'd4-nhanh1-c2',
        branch_id: 'br-1',
        generation_id: 'gen-5',
        generation_index: 5,
        birth_order: 1,
      },
      // Phối ngẫu của Cháu Đời 5 (In-law spouse)
      {
        id: 'd5-spouse',
        family_id: 'c1',
        full_name: 'Vợ Cháu Đời 5 (Dâu Dòng Họ)',
        gender: 'FEMALE',
        spouse_id: 'd5-child',
        generation_id: 'gen-5',
        generation_index: 5,
        birth_order: 1,
      },
    ] as unknown as Member[];

    it('[LINEAGE-001] Hierarchy info for Gen 1, Gen 2, Gen 3 correctly assigns levelType', () => {
      const infoD1 = getLineageHierarchyInfo(deepMembers[0], generations, branches, deepMembers);
      assert.strictEqual(infoD1.levelType, 'THUY_TO');
      assert.strictEqual(infoD1.levelName, 'Thủy Tổ');

      const infoD2 = getLineageHierarchyInfo(deepMembers[1], generations, branches, deepMembers);
      assert.strictEqual(infoD2.levelType, 'CHI');
      assert.strictEqual(infoD2.levelName, 'Chi');

      const infoD3 = getLineageHierarchyInfo(deepMembers[3], generations, branches, deepMembers);
      assert.strictEqual(infoD3.levelType, 'CANH');
      assert.strictEqual(infoD3.levelName, 'Cành');
      assert.strictEqual(infoD3.canhName, 'Cành 1');
    });

    it('[LINEAGE-002] Gen 5 descendant accurately traces Gen 3 ancestor Cành 2 through lineage chain', () => {
      const d5 = deepMembers.find((m) => m.id === 'd5-child')!;
      const infoD5 = getLineageHierarchyInfo(d5, generations, branches, deepMembers);

      assert.strictEqual(infoD5.levelType, 'NHANH');
      assert.strictEqual(infoD5.generationNumber, 5);
      assert.strictEqual(infoD5.canhName, 'Cành 2', 'Must trace ancestor back to Cành 2 (birth_order 2 of Gen 3)');
      assert.strictEqual(infoD5.nhanhName, 'Nhánh 1', 'Must trace ancestor back to Nhánh 1 (birth_order 1 of Gen 4)');
      assert.ok(infoD5.fullHierarchyPath.includes('Cành 2 ➔ Nhánh 1 (Đời 5)'));
    });

    it('[LINEAGE-003] In-law spouse correctly inherits lineage level and branch from partner', () => {
      const spouse = deepMembers.find((m) => m.id === 'd5-spouse')!;
      const infoSpouse = getLineageHierarchyInfo(spouse, generations, branches, deepMembers);

      assert.strictEqual(infoSpouse.levelType, 'NHANH');
      assert.strictEqual(infoSpouse.generationNumber, 5);
      assert.strictEqual(infoSpouse.canhName, 'Cành 2');
    });

    it('[LINEAGE-004] filterLineageTree preserves spouses when filtering by CHI, CANH, or NHANH', () => {
      // Filter by Cành 2
      const filtered = filterLineageTree(deepMembers, generations, branches, {
        mode: 'CANH',
        selectedChiId: 'br-1',
        selectedCanh: 'Cành 2',
      });

      const ids = new Set(filtered.map((m) => m.id));

      // Must contain Chi Trưởng (Đời 2)
      assert.ok(ids.has('d2-chi1'), 'Should contain Chi 1 header');
      // Must contain Cành 2 (Đời 3)
      assert.ok(ids.has('d3-canh2'), 'Should contain Cành 2');
      // Must NOT contain Cành 1 (Đời 3)
      assert.ok(!ids.has('d3-canh1'), 'Should NOT contain Cành 1');
      // Must contain Gen 4 & Gen 5 descendants
      assert.ok(ids.has('d4-nhanh1-c2'), 'Should contain Gen 4 descendant');
      assert.ok(ids.has('d5-child'), 'Should contain Gen 5 child');
      // CRITICAL: Must preserve spouse 'd5-spouse'
      assert.ok(ids.has('d5-spouse'), 'CRITICAL: Must retain in-law spouse in filtered tree');
    });
  });

  // =========================================================================
  // SECTION 3: MULTI-ROOT FOREST, MATRIARCH FOUNDERS & VIEWPORT MATH TESTS
  // =========================================================================
  describe('3. Multi-Root Forest & Matriarch Founder Layout Rules', () => {

    it('[TREE-001] Multiple independent root founders produce multi-root forest without orphan dropping', () => {
      const forestMembers = [
        {
          id: 'root-alpha',
          family_id: 'c1',
          full_name: 'Cụ Tổ Nhánh Đông',
          gender: 'MALE',
          generation_index: 1,
          birth_order: 1,
        },
        {
          id: 'root-beta',
          family_id: 'c1',
          full_name: 'Cụ Tổ Nhánh Tây',
          gender: 'MALE',
          generation_index: 1,
          birth_order: 2,
        },
        {
          id: 'child-alpha',
          family_id: 'c1',
          full_name: 'Con Cụ Đông',
          gender: 'MALE',
          father_id: 'root-alpha',
          generation_index: 2,
        },
        {
          id: 'child-beta',
          family_id: 'c1',
          full_name: 'Con Cụ Tây',
          gender: 'MALE',
          father_id: 'root-beta',
          generation_index: 2,
        },
      ] as unknown as Member[];

      // Simulate treeRoots calculation logic from GenealogyCanvas.tsx
      const parentToChildrenMap = new Map<string, Set<string>>();
      const childHasParentSet = new Set<string>();

      forestMembers.forEach((m) => {
        if (m.father_id) {
          if (!parentToChildrenMap.has(m.father_id)) parentToChildrenMap.set(m.father_id, new Set());
          parentToChildrenMap.get(m.father_id)!.add(m.id);
          childHasParentSet.add(m.id);
        }
      });

      const roots = forestMembers.filter((m) => !childHasParentSet.has(m.id));
      assert.strictEqual(roots.length, 2, 'Must recognize exactly 2 roots in the forest graph');
      assert.ok(roots.some((r) => r.id === 'root-alpha'));
      assert.ok(roots.some((r) => r.id === 'root-beta'));
    });

    it('[TREE-002] Matriarch founder with male spouse retains Matriarch as root when is_direct_lineage is set', () => {
      const matriarchFounder = {
        id: 'mat-founder',
        family_id: 'c1',
        full_name: 'Nữ Thủy Tổ Trịnh Thị Tiên',
        gender: 'FEMALE',
        is_direct_lineage: true,
        generation_index: 1,
        birth_order: 1,
      } as unknown as Member;
      const maleSpouse = {
        id: 'male-consort',
        family_id: 'c1',
        full_name: 'Phu Quân Hoàng Văn Phò (Chính Phu)',
        gender: 'MALE',
        is_direct_lineage: false,
        spouse_id: 'mat-founder',
        generation_index: 1,
      } as unknown as Member;
      const clan = [matriarchFounder, maleSpouse];

      const spouseIds = new Set<string>();
      clan.forEach((m) => {
        if (m.spouse_id) {
          const s = clan.find((sp) => sp.id === m.spouse_id);
          if (s) {
            if (m.is_direct_lineage === true && s.is_direct_lineage === false) {
              spouseIds.add(s.id);
            } else if (m.is_direct_lineage === false && s.is_direct_lineage === true) {
              spouseIds.add(m.id);
            }
          }
        }
      });

      const roots = clan.filter((m) => !spouseIds.has(m.id));
      assert.strictEqual(roots.length, 1);
      assert.strictEqual(roots[0].id, 'mat-founder', 'Matriarch must be designated as primary root');
      assert.ok(spouseIds.has('male-consort'), 'Male consort must be captured as spouse');
    });

    it('[TREE-003] Focal-point zoom transformation math invariance check', () => {
      // Zoom math validation:
      // When zooming from zoom1 to zoom2 around focal point (focalX, focalY):
      // scaleFactor = newZoom / oldZoom
      // newPanX = focalX - (focalX - oldPanX) * scaleFactor
      const oldZoom = 1.0;
      const newZoom = 1.5;
      const oldPan = { x: 100, y: 100 };
      const focal = { x: 400, y: 300 };

      const scaleFactor = newZoom / oldZoom;
      const newPanX = Math.round(focal.x - (focal.x - oldPan.x) * scaleFactor);
      const newPanY = Math.round(focal.y - (focal.y - oldPan.y) * scaleFactor);

      // Verify that the world content coordinate under the mouse does NOT move:
      const worldXBefore = (focal.x - oldPan.x) / oldZoom;
      const worldXAfter = (focal.x - newPanX) / newZoom;

      assert.ok(
        Math.abs(worldXBefore - worldXAfter) < 0.01,
        `World coordinate under focal point must remain invariant: before=${worldXBefore}, after=${worldXAfter}`
      );
    });

    it('[TREE-004] Auto-Pan to member centering math invariance check', () => {
      const container = { width: 1200, height: 800 };
      const targetZoom = 1.0;
      const nodeContent = { x: 1500, y: 1000, width: 240, height: 120 };

      const centerNodeX = nodeContent.x + nodeContent.width / 2; // 1620
      const centerNodeY = nodeContent.y + nodeContent.height / 2; // 1060

      const newPanX = Math.round(container.width / 2 - centerNodeX * targetZoom); // 600 - 1620 = -1020
      const newPanY = Math.round(container.height / 2 - centerNodeY * targetZoom); // 400 - 1060 = -660

      // Screen coordinate of node center after applying new pan & zoom:
      const screenNodeCenterX = centerNodeX * targetZoom + newPanX;
      const screenNodeCenterY = centerNodeY * targetZoom + newPanY;

      assert.strictEqual(screenNodeCenterX, container.width / 2, 'Node center X must match container center');
      assert.strictEqual(screenNodeCenterY, container.height / 2, 'Node center Y must match container center');
    });
  });
});
