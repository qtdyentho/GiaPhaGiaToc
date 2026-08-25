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
  const gen = generations.find((g) => g.id === member.generation_id);
  const genNum = gen ? gen.generation_number : member.generation_index || 1;
  const branch = branches.find((b) => b.id === member.branch_id);
  const chiName = branch ? branch.name : (member.branch_code?.includes('c2') ? 'Chi Hai' : 'Chi Trưởng');

  const birthOrder = member.birth_order || 1;

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
    const isTruong = member.birth_order === 1 || member.branch_id?.includes('1') || chiName.includes('Trưởng');
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
  const canhIndex = Math.max(1, Math.min(3, Math.ceil(birthOrder / 2)));
  const nhanhName = `Nhánh ${birthOrder}`;
  return {
    levelType: 'NHANH',
    levelName: 'Nhánh',
    generationNumber: genNum,
    chiName,
    canhName: `Cành ${canhIndex}`,
    nhanhName,
    badgeLabel: `🍃 ${chiName} • ${nhanhName}`,
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-900',
    fullHierarchyPath: `${chiName} ➔ Cành ${canhIndex} ➔ ${nhanhName} (Đời ${genNum})`,
  };
}

/**
 * Lọc thành viên theo cấu trúc Phân Cấp Dòng Họ (Thủy Tổ, Chi, Cành, Nhánh)
 * Luôn giữ lại Thủy Tổ (Đời 1) để làm gốc rễ hiển thị phả đồ liên tục.
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
  }
): Member[] {
  if (filter.mode === 'ALL' || (!filter.selectedChiId && !filter.selectedCanh && !filter.selectedNhanh)) {
    return members;
  }

  return members.filter((m) => {
    const info = getLineageHierarchyInfo(m, generations, branches, members);
    
    // Luôn giữ lại Thủy Tổ (Đời 1) làm cội nguồn
    if (info.generationNumber === 1) return true;

    // Lọc theo Chi
    if (filter.mode === 'CHI' && filter.selectedChiId) {
      return m.branch_id === filter.selectedChiId;
    }

    // Lọc theo Cành (Phái)
    if (filter.mode === 'CANH') {
      const matchChi = !filter.selectedChiId || m.branch_id === filter.selectedChiId;
      const matchCanh = !filter.selectedCanh || info.canhName === filter.selectedCanh || info.generationNumber === 2;
      return matchChi && matchCanh;
    }

    // Lọc theo Nhánh
    if (filter.mode === 'NHANH') {
      const matchChi = !filter.selectedChiId || m.branch_id === filter.selectedChiId;
      const matchNhanh = !filter.selectedNhanh || info.nhanhName === filter.selectedNhanh || info.generationNumber <= 3;
      return matchChi && matchNhanh;
    }

    return true;
  });
}
