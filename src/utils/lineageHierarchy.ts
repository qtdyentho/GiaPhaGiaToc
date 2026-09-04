import { Member, Generation, Branch } from '../types/database';

export type LineageLevelType = 'THUY_TO' | 'CHI' | 'CANH' | 'NHANH';

export interface LineageHierarchyInfo {
  levelType: LineageLevelType;
  levelName: string;
  generationNumber: number;
  chiName: string;
  canhName?: string;
  nhanhName?: string;
  badgeLabel: string;
  badgeColor: string;
  fullHierarchyPath: string;
}

/**
 * Thuật toán phân định cấp bậc dòng họ theo chuẩn phả hệ truyền thống Việt Nam:
 * - Đời 1: Thủy Tổ (Gốc rễ khai sáng)
 * - Đời 2: Chi (Các con trai của Thủy Tổ: Chi Trưởng, Chi Hai, Chi Ba...)
 * - Đời 3: Cành / Phái (Các con trai của người đứng đầu Chi: Cành 1, Cành 2...)
 * - Đời 4, 5+: Nhánh (Phân nhánh nhỏ hơn từ Cành: Nhánh 1, Nhánh 2...)
 */
export function getLineageHierarchyInfo(
  member: Member,
  generations: Generation[],
  branches: Branch[],
  allMembers?: Member[]
): LineageHierarchyInfo {
  let effectiveMember = member;
  if (!member.father_id && !member.mother_id && member.spouse_id && allMembers) {
    const spouse = allMembers.find((m) => m.id === member.spouse_id);
    if (spouse && (spouse.father_id || spouse.mother_id || spouse.generation_id)) {
      effectiveMember = spouse;
    }
  }

  const gen = generations.find((g) => g.id === effectiveMember.generation_id);
  const genNum = gen ? gen.generation_number : effectiveMember.generation_index || 1;
  const branch = branches.find((b) => b.id === effectiveMember.branch_id);
  const chiName = branch ? branch.name : (effectiveMember.branch_code?.includes('c2') ? 'Chi Hai' : 'Chi Trưởng');

  const birthOrder = effectiveMember.birth_order || 1;

  // ĐỜI 1: THỦY TỔ (GỐC RỄ)
  if (genNum === 1) {
    return {
      levelType: 'THUY_TO',
      levelName: 'Thủy Tổ',
      generationNumber: 1,
      chiName: 'Gốc Thủy Tổ',
      badgeLabel: '👑 Gốc Thủy Tổ',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700',
      fullHierarchyPath: 'Khởi Tổ Khai Canh Lập Ấp',
    };
  }

  // ĐỜI 2: CHI (PHÂN CHI ĐỘC LẬP TỪ THỦY TỔ)
  if (genNum === 2) {
    const isTruong = effectiveMember.birth_order === 1 || effectiveMember.branch_id?.includes('1') || chiName.includes('Trưởng');
    return {
      levelType: 'CHI',
      levelName: 'Chi',
      generationNumber: 2,
      chiName,
      badgeLabel: isTruong ? '🌱 Chi Trưởng (Chi Cả)' : `🌱 ${chiName}`,
      badgeColor: isTruong
        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
        : 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
      fullHierarchyPath: `${chiName} • Đời 2`,
    };
  }

  // ĐỜI 3: CÀNH / PHÁI (PHÂN TỪ CHI)
  if (genNum === 3) {
    const canhName = `Cành ${birthOrder}`;
    return {
      levelType: 'CANH',
      levelName: 'Cành',
      generationNumber: 3,
      chiName,
      canhName,
      badgeLabel: `🌿 ${chiName} • ${canhName}`,
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700',
      fullHierarchyPath: `${chiName} ➔ ${canhName} (Đời 3)`,
    };
  }

  // ĐỜI 4, 5+: NHÁNH (PHÂN TỪ CÀNH)
  // Truy vết ngược lên Đời 3 để xác định chính xác Cành thủy tổ
  let gen3Ancestor: Member | undefined;
  let gen4Ancestor: Member | undefined;

  if (allMembers && allMembers.length > 0) {
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));
    const genMap = new Map(generations.map((g) => [g.id, g.generation_number]));
    const getGenNum = (m: Member) => genMap.get(m.generation_id || '') || m.generation_index || 1;

    let curr: Member | undefined = effectiveMember;
    const visited = new Set<string>();

    while (curr && (curr.father_id || curr.mother_id) && !visited.has(curr.id)) {
      visited.add(curr.id);
      const parentId = curr.father_id || curr.mother_id;
      const parent = memberMap.get(parentId!);
      if (!parent) break;
      const pGen = getGenNum(parent);
      if (pGen === 4) {
        gen4Ancestor = parent;
      }
      if (pGen === 3) {
        gen3Ancestor = parent;
        break;
      }
      curr = parent;
    }
  }

  const canhIndex = gen3Ancestor
    ? (gen3Ancestor.birth_order || 1)
    : Math.max(1, Math.min(3, Math.ceil(birthOrder / 2)));
  const canhName = `Cành ${canhIndex}`;

  let nhanhName = `Nhánh ${birthOrder}`;
  if (genNum >= 5 && gen4Ancestor) {
    nhanhName = `Nhánh ${gen4Ancestor.birth_order || 1}`;
  }

  return {
    levelType: 'NHANH',
    levelName: 'Nhánh',
    generationNumber: genNum,
    chiName,
    canhName,
    nhanhName,
    badgeLabel: `🍃 ${chiName} • ${nhanhName}`,
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-900',
    fullHierarchyPath: `${chiName} ➔ ${canhName} ➔ ${nhanhName} (Đời ${genNum})`,
  };
}

/**
 * Lọc thành viên theo cấu trúc Phân Cấp Dòng Họ (Thủy Tổ, Chi, Cành, Nhánh)
 * Quy tắc cốt lõi:
 * 1. Khi chọn TOÀN DÒNG HỌ: Hiển thị toàn bộ từ Thủy Tổ (Đời 1) trở xuống, các Chi/Cành/Nhánh ngang hàng nhau.
 * 2. Khi chọn CHI (Đời 2): Hiển thị Cụ Thủy Tổ Đời 1 (bố mẹ đẻ ra Chi) + toàn bộ con cháu hậu duệ thuộc Chi đó.
 * 3. Khi chọn CÀNH (Đời 3): Hiển thị Vị Đứng Đầu Chi Đời 2 (Thủy Tổ của Cành) + Cành đó (Đời 3) + toàn bộ con cháu (Đời 4, 5+). Ẩn Đời 1 và các Cành khác.
 * 4. Khi chọn NHÁNH (Đời 4+): Hiển thị Vị Đứng Đầu Cành Đời 3 (Thủy Tổ của Nhánh) + Nhánh đó (Đời 4) + toàn bộ con cháu (Đời 5+). Ẩn Đời 1, Đời 2 và các Nhánh khác.
 * 5. BẢO TOÀN HÔN PHỐI (Preserve Spouses): Các phối ngẫu (Vợ/Chồng) của thành viên hợp lệ luôn được giữ lại cùng phả đồ.
 */
export type LineageGenderFilter = 'ALL' | 'MALE_AND_DINH' | 'DIRECT_LINEAGE_ONLY';

/**
 * Lọc thành viên theo cấu trúc Phân Cấp Dòng Họ (Thủy Tổ, Chi, Cành, Nhánh),
 * kèm theo bộ lọc giới tính / hương hỏa (Nam & Đinh, Huyết thống) và giới hạn số đời (Depth Limiter).
 */
export function filterLineageTree(
  members: Member[],
  generations: Generation[],
  branches: Branch[],
  filter: {
    mode: 'ALL' | 'CHI' | 'CANH' | 'NHANH';
    selectedChiId?: string;
    selectedCanh?: string;
    selectedNhanh?: string;
    genderFilter?: LineageGenderFilter;
    maxGenerationLimit?: number; // Ví dụ: 3, 5, 7 hoặc undefined (tất cả)
  }
): Member[] {
  const genMap = new Map(generations.map((g) => [g.id, g.generation_number]));
  const getGenNum = (m: Member) => genMap.get(m.generation_id || '') || m.generation_index || 1;

  // Bước 1: Thu thập tất cả thành viên thỏa mãn bộ lọc phân cấp (Chi/Cành/Nhánh)
  const isHierarchyFiltered =
    filter.mode !== 'ALL' &&
    Boolean(filter.selectedChiId || filter.selectedCanh || filter.selectedNhanh);

  const matchedDirectIds = new Set<string>();

  members.forEach((m) => {
    if (!isHierarchyFiltered) {
      matchedDirectIds.add(m.id);
      return;
    }

    const info = getLineageHierarchyInfo(m, generations, branches, members);

    // 1. Lọc theo CHI (Đời 2 trở đi):
    if (filter.mode === 'CHI') {
      if (info.generationNumber === 1) {
        matchedDirectIds.add(m.id);
        return;
      }
      if (filter.selectedChiId) {
        if (m.branch_id === filter.selectedChiId) {
          matchedDirectIds.add(m.id);
        }
      } else {
        matchedDirectIds.add(m.id);
      }
    } else if (filter.mode === 'CANH') {
      // 2. Lọc theo CÀNH (Đời 3 trở đi):
      const matchChi = !filter.selectedChiId || m.branch_id === filter.selectedChiId;
      if (!matchChi) return;

      if (info.generationNumber === 2) {
        matchedDirectIds.add(m.id);
        return;
      }

      if (info.generationNumber >= 3) {
        if (!filter.selectedCanh || info.canhName === filter.selectedCanh) {
          matchedDirectIds.add(m.id);
        }
      }
    } else if (filter.mode === 'NHANH') {
      // 3. Lọc theo NHÁNH (Đời 4 trở đi):
      const matchChi = !filter.selectedChiId || m.branch_id === filter.selectedChiId;
      if (!matchChi) return;

      if (info.generationNumber === 3) {
        if (!filter.selectedCanh || info.canhName === filter.selectedCanh) {
          matchedDirectIds.add(m.id);
        }
        return;
      }

      if (info.generationNumber >= 4) {
        const matchCanh = !filter.selectedCanh || info.canhName === filter.selectedCanh;
        const matchNhanh = !filter.selectedNhanh || info.nhanhName === filter.selectedNhanh;
        if (matchCanh && matchNhanh) {
          matchedDirectIds.add(m.id);
        }
      }
    }
  });

  // Bước 2: Bảo toàn hôn phối (vợ/chồng của các thành viên trực hệ đã chọn) nếu không lọc Huyết Thống
  const finalIds = new Set<string>(matchedDirectIds);
  if (filter.genderFilter !== 'DIRECT_LINEAGE_ONLY') {
    members.forEach((m) => {
      if (m.spouse_id && matchedDirectIds.has(m.spouse_id)) {
        finalIds.add(m.id);
      }
      if (!finalIds.has(m.id)) {
        const isSpouseOfMatched = members.some(
          (matched) => matchedDirectIds.has(matched.id) && matched.spouse_id === m.id
        );
        if (isSpouseOfMatched) {
          finalIds.add(m.id);
        }
      }
    });
  }

  // Bước 3: Áp dụng Bộ Lọc Giới Tính / Hương Hỏa & Giới Hạn Cấp Đời
  return members.filter((m) => {
    if (!finalIds.has(m.id)) return false;

    // Giới hạn cấp thế hệ (Depth Limiter)
    if (filter.maxGenerationLimit && filter.maxGenerationLimit > 0) {
      const genNum = getGenNum(m);
      if (genNum > filter.maxGenerationLimit) return false;
    }

    // Bộ lọc Nam & Đinh (MALE_AND_DINH)
    if (filter.genderFilter === 'MALE_AND_DINH') {
      // Nam trực hệ luôn hiển thị
      if (m.gender === 'MALE') return true;
      // Nữ đóng vai trò Nữ Đinh / Trưởng chi / Đinh (hoặc có ghi chú Đinh trong tiểu sử)
      const isNuDinh =
        (m as any).is_dinh === true ||
        (m as any).is_nu_dinh === true ||
        (m.bio && /(nữ đinh|hương hỏa|trưởng chi|thờ tự)/i.test(m.bio));
      if (isNuDinh) return true;

      // Phối ngẫu là nữ của nam trực hệ: Vẫn giữ để thể hiện vợ chồng
      if (m.gender === 'FEMALE') {
        const hasMaleSpouse = members.some(
          (other) => other.gender === 'MALE' && (other.spouse_id === m.id || m.spouse_id === other.id)
        );
        if (hasMaleSpouse) return true;
      }
      return false;
    }

    // Bộ lọc Chỉ Huyết Thống (DIRECT_LINEAGE_ONLY): Loại bỏ dâu rể
    if (filter.genderFilter === 'DIRECT_LINEAGE_ONLY') {
      if (m.is_direct_lineage === false) return false;
      // Nếu không có trường is_direct_lineage, kiểm tra cha mẹ ruột hoặc là gốc Thủy Tổ
      const hasParent = Boolean(m.father_id || m.mother_id);
      const isRootGen = getGenNum(m) === 1;
      if (!hasParent && !isRootGen && m.spouse_id) {
        // Nếu không có cha mẹ, không phải đời 1 mà có spouse_id thì thường là dâu/rể
        return false;
      }
      return true;
    }

    return true;
  });
}
