import { Member, KinshipResult } from '../../types/database';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export class KinshipService {
  /**
   * Tra cứu danh xưng giữa 2 thành viên trong gia tộc
   * Ưu tiên gọi RPC calculate_kinship trên Supabase (nếu online), fallback sang Client Kinship Engine
   */
  static async calculateKinship(
    memberAId: string,
    memberBId: string,
    allMembers: Member[]
  ): Promise<KinshipResult> {
    // 1. Cố gắng gọi Supabase RPC nếu đã cấu hình
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('calculate_kinship', {
          p_member_a_id: memberAId,
          p_member_b_id: memberBId,
        });
        if (!error && data && !data.error) {
          return data as KinshipResult;
        }
      } catch (err) {
        console.warn('Supabase RPC calculate_kinship fallback to local engine:', err);
      }
    }

    // 2. Client-side Kinship Reasoning Engine (100% Thuần Việt & Chuẩn Tộc Ước)
    const memberA = allMembers.find((m) => m.id === memberAId);
    const memberB = allMembers.find((m) => m.id === memberBId);

    if (!memberA || !memberB) {
      return {
        term_a_calls_b: 'Không xác định',
        term_b_calls_a: 'Không xác định',
        generation_distance: 0,
        relationship_category: 'UNKNOWN',
        seniority: 'EQUAL',
        lca_name: 'Không tìm thấy',
        explanation: 'Không tìm thấy thông tin của một trong hai thành viên trong gia phả.',
      };
    }

    return this.evaluateKinshipLocal(memberA, memberB, allMembers);
  }

  /**
   * Core Kinship Engine logic cục bộ
   */
  static evaluateKinshipLocal(
    a: Member,
    b: Member,
    allMembers: Member[]
  ): KinshipResult {
    // 1. Cùng là một người
    if (a.id === b.id) {
      return {
        term_a_calls_b: 'Bản thân',
        term_b_calls_a: 'Bản thân',
        generation_distance: 0,
        relationship_category: 'SELF',
        seniority: 'EQUAL',
        lca_name: a.full_name,
        explanation: 'Đây là cùng một người trong gia phả dòng họ.',
        greeting_guide: 'Xưng Tôi / Mình khi giới thiệu.',
      };
    }

    // 2. Quan hệ Vợ - Chồng
    if (a.spouse_id === b.id || b.spouse_id === a.id) {
      const isBFemale = b.gender === 'FEMALE';
      return {
        term_a_calls_b: isBFemale ? 'Vợ (Bà xã / Hiền thê)' : 'Chồng (Ông xã / Phu quân)',
        term_b_calls_a: isBFemale ? 'Chồng (Ông xã / Phu quân)' : 'Vợ (Bà xã / Hiền thê)',
        generation_distance: 0,
        relationship_category: 'SPOUSE',
        seniority: 'EQUAL',
        lca_name: 'Gia đình hạt nhân',
        explanation: 'Mối quan hệ Vợ - Chồng gắn kết lương duyên gia đình.',
        greeting_guide: 'Trong gia đình gọi Mình / Em / Anh; trong tế lễ gọi Nhà tôi / Phu quân / Hiền thê.',
      };
    }

    // 3. Quan hệ Bố - Con trực hệ
    if (a.father_id === b.id || a.mother_id === b.id) {
      const bIsFather = b.gender === 'MALE';
      return {
        term_a_calls_b: bIsFather ? 'Bố (Cha / Thân phụ)' : 'Mẹ (Thân mẫu)',
        term_b_calls_a: a.gender === 'FEMALE' ? 'Con gái' : 'Con trai',
        generation_distance: 1,
        relationship_category: 'PARENT_CHILD',
        seniority: 'B_IS_SENIOR',
        lca_name: b.full_name,
        explanation: `${b.full_name} là đấng sinh thành trực tiếp của ${a.full_name}.`,
        greeting_guide: `A xưng Con và gọi B là ${bIsFather ? 'Bố / Cha' : 'Mẹ'}. B gọi A là Con.`,
      };
    }

    if (b.father_id === a.id || b.mother_id === a.id) {
      const aIsFather = a.gender === 'MALE';
      return {
        term_a_calls_b: b.gender === 'FEMALE' ? 'Con gái' : 'Con trai',
        term_b_calls_a: aIsFather ? 'Bố (Cha / Thân phụ)' : 'Mẹ (Thân mẫu)',
        generation_distance: -1,
        relationship_category: 'PARENT_CHILD',
        seniority: 'A_IS_SENIOR',
        lca_name: a.full_name,
        explanation: `${a.full_name} là đấng sinh thành trực tiếp của ${b.full_name}.`,
        greeting_guide: `A gọi B là Con. B xưng Con và gọi A là ${aIsFather ? 'Bố / Cha' : 'Mẹ'}.`,
      };
    }

    // 4. Tính toán cây tổ tiên và Tổ Tiên Chung Gần Nhất (LCA)
    const ancestryA = this.getAncestors(a, allMembers);
    const ancestryB = this.getAncestors(b, allMembers);

    let lca: Member | null = null;
    if (ancestryA.some((anc) => anc.id === b.id)) {
      lca = b;
    } else if (ancestryB.some((anc) => anc.id === a.id)) {
      lca = a;
    } else {
      for (const ancA of ancestryA) {
        if (ancestryB.some((ancB) => ancB.id === ancA.id)) {
          lca = ancA;
          break;
        }
      }
    }

    const genA = a.generation_index || this.inferGeneration(a, allMembers);
    const genB = b.generation_index || this.inferGeneration(b, allMembers);
    const deltaG = genA - genB;

    const lcaName = lca ? lca.full_name : 'Tổ tiên chung dòng họ';

    // 5. Xác định tính chất Vế Trên / Vế Dưới (Seniority)
    const seniority = this.determineSeniority(a, b, lca, allMembers);

    // 6. Phân nhánh theo Khoảng cách thế hệ ΔG
    return this.formatKinshipTerms(a, b, deltaG, seniority, lcaName, allMembers);
  }

  /**
   * Lấy danh sách tổ tiên ngược lên từ con -> cha mẹ -> ông bà -> cụ -> thủy tổ (hỗ trợ cả nội tộc và ngoại tộc/mẫu hệ)
   */
  private static getAncestors(member: Member, allMembers: Member[]): Member[] {
    const list: Member[] = [];
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));
    const visited = new Set<string>([member.id]);
    const queue: Member[] = [];

    const parentIds = [member.father_id, member.mother_id].filter(Boolean) as string[];
    for (const pId of parentIds) {
      const p = memberMap.get(pId);
      if (p && !visited.has(p.id)) {
        visited.add(p.id);
        queue.push(p);
      }
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      list.push(curr);
      const nextParentIds = [curr.father_id, curr.mother_id].filter(Boolean) as string[];
      for (const pId of nextParentIds) {
        const p = memberMap.get(pId);
        if (p && !visited.has(p.id)) {
          visited.add(p.id);
          queue.push(p);
        }
      }
    }
    return list;
  }

  /**
   * Suy luận đời thứ mấy nếu chưa có generation_index
   */
  private static inferGeneration(member: Member, allMembers: Member[]): number {
    if (member.generation_index) return member.generation_index;
    let gen = 1;
    let curr: Member | undefined = member;
    const visited = new Set<string>();
    while (curr && (curr.father_id || curr.mother_id) && !visited.has(curr.id)) {
      visited.add(curr.id);
      gen++;
      const nextId: string | undefined = curr.father_id || curr.mother_id;
      curr = allMembers.find((m) => m.id === nextId);
    }
    return gen;
  }

  /**
   * Xác định vế trên / vế dưới dựa vào nhánh rẽ từ Tổ Tiên Chung
   */
  private static determineSeniority(
    a: Member,
    b: Member,
    lca: Member | null,
    allMembers: Member[]
  ): 'A_IS_SENIOR' | 'B_IS_SENIOR' | 'EQUAL' {
    if (!lca) {
      // So sánh thứ bậc con trong nhà nếu cùng đời
      const orderA = a.birth_order || 1;
      const orderB = b.birth_order || 1;
      if (orderA < orderB) return 'A_IS_SENIOR';
      if (orderA > orderB) return 'B_IS_SENIOR';
      return 'EQUAL';
    }

    // Tìm con của LCA là tổ tiên của A và B
    const pathA = this.getPathFromLCA(a, lca, allMembers);
    const pathB = this.getPathFromLCA(b, lca, allMembers);

    if (pathA.length > 0 && pathB.length > 0) {
      const topA = pathA[0];
      const topB = pathB[0];
      if (topA.id !== topB.id) {
        const orderA = topA.birth_order || 1;
        const orderB = topB.birth_order || 1;
        if (orderA < orderB) return 'A_IS_SENIOR';
        if (orderA > orderB) return 'B_IS_SENIOR';
      }
    }

    const orderA = a.birth_order || 1;
    const orderB = b.birth_order || 1;
    if (orderA < orderB) return 'A_IS_SENIOR';
    if (orderA > orderB) return 'B_IS_SENIOR';
    return 'EQUAL';
  }

  private static getPathFromLCA(
    member: Member,
    lca: Member,
    allMembers: Member[]
  ): Member[] {
    if (member.id === lca.id) return [];
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));
    const queue: { current: Member; path: Member[] }[] = [{ current: member, path: [member] }];
    const visited = new Set<string>([member.id]);

    while (queue.length > 0) {
      const { current, path } = queue.shift()!;
      const parentIds = [current.father_id, current.mother_id].filter(Boolean) as string[];
      for (const pId of parentIds) {
        if (pId === lca.id) {
          // Path from LCA down to member (excluding LCA itself)
          return [...path].reverse();
        }
        if (!visited.has(pId)) {
          visited.add(pId);
          const p = memberMap.get(pId);
          if (p) {
            queue.push({ current: p, path: [...path, p] });
          }
        }
      }
    }
    return [];
  }

  /**
   * Tính toán danh xưng cụ thể theo chuẩn văn hóa Việt Nam
   */
  private static formatKinshipTerms(
    a: Member,
    b: Member,
    deltaG: number,
    seniority: 'A_IS_SENIOR' | 'B_IS_SENIOR' | 'EQUAL',
    lcaName: string,
    allMembers: Member[]
  ): KinshipResult {
    // -------------------------------------------------------------
    // CASE 1: Đồng Thế Hệ (ΔG = 0) -> Anh / Chị / Em họ
    // -------------------------------------------------------------
    if (deltaG === 0) {
      const isSameFather = a.father_id && a.father_id === b.father_id;
      const bIsSenior = seniority === 'B_IS_SENIOR';
      const bIsFemale = b.gender === 'FEMALE';
      const aIsFemale = a.gender === 'FEMALE';

      let termAcallsB = '';
      let termBcallsA = '';
      let explanation = '';

      if (isSameFather) {
        if (bIsSenior) {
          termAcallsB = bIsFemale ? 'Chị ruột' : 'Anh ruột';
          termBcallsA = 'Em ruột';
          explanation = `B là con thứ ${b.birth_order || 1}, A là con thứ ${a.birth_order || 2} trong cùng một nhà.`;
        } else {
          termAcallsB = 'Em ruột';
          termBcallsA = aIsFemale ? 'Chị ruột' : 'Anh ruột';
          explanation = `A là con thứ ${a.birth_order || 1}, B là con thứ ${b.birth_order || 2} trong cùng một nhà.`;
        }
      } else {
        if (bIsSenior) {
          termAcallsB = bIsFemale ? 'Chị họ (Vế trên / Con Bác)' : 'Anh họ (Vế trên / Con Bác)';
          termBcallsA = 'Em họ (Vế dưới / Con Chú)';
          explanation = `Theo gia phong dòng tộc: Cành nhánh của B thuộc vế anh (con Bác / chi trưởng), nên dù A nhiều tuổi hơn thì theo thứ bậc gia tộc A vẫn gọi B là Anh/Chị và xưng Em.`;
        } else {
          termAcallsB = 'Em họ (Vế dưới / Con Chú)';
          termBcallsA = aIsFemale ? 'Chị họ (Vế trên / Con Bác)' : 'Anh họ (Vế trên / Con Bác)';
          explanation = `Cành nhánh của A thuộc vế anh (con Bác / chi trưởng), nên A ở vế trên, B gọi A là Anh/Chị và xưng Em.`;
        }
      }

      return {
        term_a_calls_b: termAcallsB,
        term_b_calls_a: termBcallsA,
        generation_distance: 0,
        relationship_category: 'SAME_GENERATION',
        seniority,
        lca_name: lcaName,
        explanation,
        greeting_guide: `Khi gặp mặt: A chào "${termAcallsB}", B đáp lại chào "${termBcallsA}".`,
      };
    }

    // -------------------------------------------------------------
    // CASE 2: Lệch 1 Thế Hệ (ΔG = 1 hoặc -1) -> Bác, Chú, Cô, Cậu, Dì, Cháu
    // -------------------------------------------------------------
    if (deltaG === 1) {
      // A ở đời dưới B: B là bậc Bác / Chú / Cô của A
      const bIsFemale = b.gender === 'FEMALE';
      let roleB = '';

      if (bIsFemale) {
        roleB = 'Cô họ (hoặc Dì)';
      } else {
        // Nếu B là con trưởng hoặc nhánh trưởng -> Bác họ, ngược lại -> Chú họ
        roleB = seniority === 'B_IS_SENIOR' || b.birth_order === 1 ? 'Bác họ' : 'Chú họ';
      }

      return {
        term_a_calls_b: roleB,
        term_b_calls_a: 'Cháu',
        generation_distance: 1,
        relationship_category: 'UNCLE_AUNT',
        seniority: 'B_IS_SENIOR',
        lca_name: lcaName,
        explanation: `B thuộc thế hệ trước A (ngang hàng với Bố/Mẹ của A). Vì vậy A gọi B là ${roleB} và xưng Cháu.`,
        greeting_guide: `A kính cẩn chào: "Cháu chào ${roleB} ạ!". B đáp: "Chào cháu!".`,
      };
    }

    if (deltaG === -1) {
      // A ở đời trên B: A là bậc Bác / Chú / Cô của B
      const aIsFemale = a.gender === 'FEMALE';
      let roleA = '';

      if (aIsFemale) {
        roleA = 'Cô họ (hoặc Dì)';
      } else {
        roleA = seniority === 'A_IS_SENIOR' || a.birth_order === 1 ? 'Bác họ' : 'Chú họ';
      }

      return {
        term_a_calls_b: 'Cháu',
        term_b_calls_a: roleA,
        generation_distance: -1,
        relationship_category: 'NEPHEW_NIECE',
        seniority: 'A_IS_SENIOR',
        lca_name: lcaName,
        explanation: `A thuộc thế hệ trước B (ngang hàng với Bố/Mẹ của B). Vì vậy A gọi B là Cháu và B gọi A là ${roleA}.`,
        greeting_guide: `B kính cẩn chào: "Cháu chào ${roleA} ạ!". A đáp: "Chào cháu!".`,
      };
    }

    // -------------------------------------------------------------
    // CASE 3: Lệch 2 Thế Hệ (ΔG = 2 hoặc -2) -> Ông / Bà - Cháu nội tộc
    // -------------------------------------------------------------
    if (deltaG === 2) {
      const bIsFemale = b.gender === 'FEMALE';
      const roleB = bIsFemale
        ? 'Bà (Bà cô / Bà nội tộc)'
        : b.birth_order === 1
        ? 'Ông trưởng (Ông nội tộc)'
        : 'Ông chú (Ông nội tộc)';

      return {
        term_a_calls_b: roleB,
        term_b_calls_a: 'Cháu nội tộc',
        generation_distance: 2,
        relationship_category: 'GRANDPARENT_GRANDCHILD',
        seniority: 'B_IS_SENIOR',
        lca_name: lcaName,
        explanation: `B cách A 2 thế hệ (ngang hàng với Ông/Bà của A). A xưng Cháu và tôn xưng B là ${roleB}.`,
        greeting_guide: `A khoanh tay kính chào: "Cháu kính chào ${roleB} ạ!".`,
      };
    }

    if (deltaG === -2) {
      const aIsFemale = a.gender === 'FEMALE';
      const roleA = aIsFemale
        ? 'Bà (Bà cô / Bà nội tộc)'
        : a.birth_order === 1
        ? 'Ông trưởng (Ông nội tộc)'
        : 'Ông chú (Ông nội tộc)';

      return {
        term_a_calls_b: 'Cháu nội tộc',
        term_b_calls_a: roleA,
        generation_distance: -2,
        relationship_category: 'GRANDPARENT_GRANDCHILD',
        seniority: 'A_IS_SENIOR',
        lca_name: lcaName,
        explanation: `A cách B 2 thế hệ (ngang hàng với Ông/Bà của B). B xưng Cháu và tôn xưng A là ${roleA}.`,
        greeting_guide: `B khoanh tay kính chào: "Cháu kính chào ${roleA} ạ!".`,
      };
    }

    // -------------------------------------------------------------
    // CASE 4: Lệch 3 Thế Hệ (ΔG = 3 hoặc -3) -> Cụ / Cố - Chắt
    // -------------------------------------------------------------
    if (deltaG === 3) {
      return {
        term_a_calls_b: 'Cụ (hoặc Cố nội tộc)',
        term_b_calls_a: 'Chắt',
        generation_distance: 3,
        relationship_category: 'GREAT_GRANDPARENT',
        seniority: 'B_IS_SENIOR',
        lca_name: lcaName,
        explanation: `B cách A 3 thế hệ (bậc Cụ/Cố trong dòng họ). A gọi B là Cụ và xưng Chắt.`,
        greeting_guide: `A kính cẩn thưa: "Chắt kính chào Cụ ạ!".`,
      };
    }

    if (deltaG === -3) {
      return {
        term_a_calls_b: 'Chắt',
        term_b_calls_a: 'Cụ (hoặc Cố nội tộc)',
        generation_distance: -3,
        relationship_category: 'GREAT_GRANDPARENT',
        seniority: 'A_IS_SENIOR',
        lca_name: lcaName,
        explanation: `A cách B 3 thế hệ (bậc Cụ/Cố trong dòng họ). B gọi A là Cụ và xưng Chắt.`,
        greeting_guide: `B kính cẩn thưa: "Chắt kính chào Cụ ạ!".`,
      };
    }

    // -------------------------------------------------------------
    // CASE 5: Lệch 4 Thế Hệ trở lên (ΔG >= 4 hoặc <= -4) -> Kỵ / Tiên Tổ
    // -------------------------------------------------------------
    if (deltaG >= 4) {
      const termB = deltaG === 4 ? 'Cụ Kỵ' : 'Bậc Tiên Tổ Tiền Nhân';
      return {
        term_a_calls_b: termB,
        term_b_calls_a: 'Chút / Chít hậu duệ',
        generation_distance: deltaG,
        relationship_category: 'ANCESTOR',
        seniority: 'B_IS_SENIOR',
        lca_name: lcaName,
        explanation: `B cách A ${deltaG} thế hệ, là bậc Tiên tổ tiền nhân khởi dựng cơ nghiệp dòng họ.`,
        greeting_guide: `Con cháu đời sau kính cẩn dâng hương tưởng niệm: "Hậu duệ đời thứ ${a.generation_index || 5} kính lạy ${termB}!".`,
      };
    }

    const termA = Math.abs(deltaG) === 4 ? 'Cụ Kỵ' : 'Bậc Tiên Tổ Tiền Nhân';
    return {
      term_a_calls_b: 'Chút / Chít hậu duệ',
      term_b_calls_a: termA,
      generation_distance: deltaG,
      relationship_category: 'ANCESTOR',
      seniority: 'A_IS_SENIOR',
      lca_name: lcaName,
      explanation: `A cách B ${Math.abs(deltaG)} thế hệ, là bậc Tiên tổ tiền nhân khởi dựng cơ nghiệp dòng họ.`,
      greeting_guide: `Con cháu đời sau kính cẩn dâng hương tưởng niệm.`,
    };
  }
}
