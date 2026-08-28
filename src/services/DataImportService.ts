/**
 * ADVANCED DATA IMPORT & INTELLIGENT GENERATION AUTO-INFERENCE ENGINE
 * DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
 * 
 * Pipeline: UPLOAD/DRAG-DROP -> SMART AUTO-MAPPING -> GENERATION AUTO-INFERENCE (TOPOLOGICAL BFS) 
 *           -> VALIDATION -> PREVIEW -> ATOMIC SUPABASE COMMIT -> IMPORT REPORT & UNDO
 * Chuẩn CSDL: 12 Cột Dữ Liệu Gia Phả Tiêu Chuẩn Việt Nam
 */

import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockMembers, mockGenerations, mockBranches } from './mockData';
import { solarToLunar, lunarToSolar } from '../lib/lunar';

export interface RawImportMember {
  treeCode?: string;             // 1. Mã Cây / STT Phân Cấp (1, 1-V1, 1.1, D11.1...)
  parentCode?: string;           // 2. Mã Cha
  motherCode?: string;           // 3. Mã Mẹ
  spouseCode?: string;           // 4. Mã Vợ / Chồng
  relationType?: string;         // 5. Quan Hệ Phân Cấp (Con Đẻ, Vợ Cả, Vợ Hai, Chồng...)
  fullName: string;              // 6. Họ và Tên (Bắt buộc)
  courtesyName?: string;         // 7. Tên Tự / Hiệu / Pháp Danh
  gender: 'MALE' | 'FEMALE';     // 8. Giới Tính (Nam / Nữ) (Bắt buộc)
  generationNumber: number;      // 9. Thế Hệ (Đời 1, 2, 3...)
  branchName: string;            // 10. Chi Phái (Chi Trưởng, Chi Hai...)
  birthOrder?: string;           // 11. Thứ Tự Sinh (Trưởng Nam, Thứ Nam 2...)
  lifeStatus: 'ALIVE' | 'DECEASED'; // 12. Trạng Thái (Còn sống / Đã mất)
  birthYear?: number;            // 13. Năm Sinh
  birthSolarDate?: string;       // 14. Ngày Sinh Dương Lịch (dd/mm/yyyy)
  birthLunarDate?: string;       // 15. Ngày Sinh Âm Lịch (dd/mm/yyyy hoặc dd/mm)
  birthLunarDay?: number;        // 16. Ngày Sinh Âm (1-30)
  birthLunarMonth?: number;      // 17. Tháng Sinh Âm (1-12)
  birthLunarYear?: number;       // 18. Năm Sinh Âm
  birthTime?: string;            // 19. Giờ Sinh (Ví dụ: Giờ Thìn (07h-09h) hoặc 08:30)
  deathSolarDate?: string;       // 20. Ngày Mất Dương Lịch (dd/mm/yyyy)
  deathLunarFull?: string;       // 21. Ngày Mất Âm Lịch (dd/mm/yyyy - Ngày Giỗ)
  deathLunarDay?: number;        // 22. Ngày Mất Âm (1 - 30)
  deathLunarMonth?: number;      // 23. Tháng Mất Âm (1 - 12)
  deathLunarYear?: number;       // 24. Năm Mất
  deathTime?: string;            // 25. Giờ Mất (Ví dụ: Giờ Ngọ (11h-13h) hoặc 12:15)
  burialPlace?: string;          // 26. Nơi An Táng / Mộ Phần
  bio?: string;                  // 27. Tiểu Sử / Sự Nghiệp / Ghi Chú
  parentName?: string;           // Tên Cha (Hỗ trợ tương thích ngược)
  spouseName?: string;           // Tên Vợ / Chồng (Hỗ trợ tương thích ngược)
  isAutoInferredGen?: boolean;   // Đánh dấu thế hệ được hệ thống tự động suy luận
}

export interface ColumnMappingSuggestion {
  sourceHeader: string;
  targetField: string;
  confidence: number;
  label: string;
}

export interface ValidatedImportRow {
  rowNumber: number;
  data: RawImportMember;
  status: 'VALID' | 'WARNING' | 'ERROR';
  errors: string[];
  warnings: string[];
}

export interface ValidationSummary {
  batchId: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  canCommit: boolean;
  autoInferredCount: number;
  rows: ValidatedImportRow[];
}

export interface ParseResult {
  headers: string[];
  rawRows: any[];
  mappedMembers: RawImportMember[];
  mappings: ColumnMappingSuggestion[];
  autoInferredCount: number;
}

export const STANDARD_GENEALOGY_COLUMNS = [
  { field: 'fullName', label: 'Họ và Tên', required: true, example: 'Cụ Nguyễn Văn Phúc' },
  { field: 'gender', label: 'Giới Tính', required: true, example: 'Nam' },
  { field: 'generationNumber', label: 'Thế Hệ (Đời)', required: true, example: '1' },
  { field: 'branchName', label: 'Chi Phái', required: true, example: 'Chi Trưởng' },
  { field: 'parentName', label: 'Tên Cha', required: false, example: '' },
  { field: 'spouseName', label: 'Vợ / Chồng', required: false, example: 'Cụ Bà Trần Thị Mai' },
  { field: 'lifeStatus', label: 'Trạng Thái', required: false, example: 'Đã mất' },
  { field: 'birthYear', label: 'Năm Sinh', required: false, example: '1880' },
  { field: 'deathLunarDay', label: 'Ngày Mất Âm', required: false, example: '15' },
  { field: 'deathLunarMonth', label: 'Tháng Mất Âm', required: false, example: '1' },
  { field: 'deathLunarYear', label: 'Năm Mất', required: false, example: '1952' },
  { field: 'burialPlace', label: 'Nơi An Táng', required: false, example: 'Lăng Mộ Tổ' },
];

export const HIERARCHICAL_GENEALOGY_COLUMNS = [
  { field: 'treeCode', label: 'Mã Cây / STT Phân Cấp', required: false, example: '1.1.1' },
  { field: 'parentCode', label: 'Mã Cha', required: false, example: '1.1' },
  { field: 'motherCode', label: 'Mã Mẹ', required: false, example: '1.1-V1' },
  { field: 'spouseCode', label: 'Mã Vợ/Chồng', required: false, example: '1.1-V1' },
  { field: 'relationType', label: 'Quan Hệ Phân Cấp', required: false, example: 'Con Đẻ (Trưởng Nam)' },
  { field: 'fullName', label: 'Họ và Tên', required: true, example: 'Cụ Nguyễn Phúc Khang' },
  { field: 'courtesyName', label: 'Tên Tự / Hiệu / Bí Danh', required: false, example: 'Thuần Đức Tiên Sinh' },
  { field: 'gender', label: 'Giới Tính', required: true, example: 'Nam' },
  { field: 'generationNumber', label: 'Thế Hệ (Đời)', required: true, example: '2' },
  { field: 'branchName', label: 'Chi Phái', required: true, example: 'Chi Trưởng (Chi 1)' },
  { field: 'birthOrder', label: 'Thứ Tự Sinh', required: false, example: 'Trưởng Nam' },
  { field: 'lifeStatus', label: 'Trạng Thái', required: false, example: 'Đã mất' },
  { field: 'birthSolarDate', label: 'Ngày Sinh Dương Lịch', required: false, example: '21/10/1910' },
  { field: 'birthLunarDate', label: 'Ngày Sinh Âm Lịch', required: false, example: '18/09/1910' },
  { field: 'birthTime', label: 'Giờ Sinh (Can Chi / Giờ)', required: false, example: 'Giờ Thìn (07h-09h)' },
  { field: 'deathLunarFull', label: 'Ngày Mất Âm Lịch (Ngày Giỗ)', required: false, example: '18/05/1980' },
  { field: 'deathSolarDate', label: 'Ngày Mất Dương Lịch', required: false, example: '29/06/1980' },
  { field: 'deathTime', label: 'Giờ Mất (Can Chi / Giờ)', required: false, example: 'Giờ Ngọ (11h-13h)' },
  { field: 'burialPlace', label: 'Nơi An Táng', required: false, example: 'Khu Lăng Mộ Chi Trưởng' },
  { field: 'bio', label: 'Tiểu Sử / Sự Nghiệp', required: false, example: 'Gìn giữ từ đường hương hỏa.' },
];

function slugifyVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class DataImportService {
  /**
   * Bộ chuyển đổi văn bản sang số thế hệ (Roman numerals, text, ordinals)
   */
  public static parseGenerationText(val: any): number {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number' && !isNaN(val) && val > 0) return Math.floor(val);

    const str = String(val).trim().toLowerCase();

    // 1. Số La Mã thông dụng
    const romanMap: Record<string, number> = {
      'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5,
      'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10,
      'xi': 11, 'xii': 12, 'xiii': 13, 'xiv': 14, 'xv': 15,
      'xvi': 16, 'xvii': 17, 'xviii': 18, 'xix': 19, 'xx': 20
    };
    if (romanMap[str]) return romanMap[str];

    // 2. Từ khóa Việt Nam đặc biệt
    if (str.includes('thuy to') || str.includes('thủy tổ') || str.includes('khoi to') || str.includes('khởi tổ') || str.includes('cu to') || str.includes('cụ tổ')) {
      return 1;
    }
    if (str.includes('nhat') || str.includes('nhất') || str.includes('dau') || str.includes('đầu')) {
      return 1;
    }

    // 3. Regex trích xuất số nguyên (VD: "Đời 2", "Đời thứ 3", "Thế hệ 4", "F5", "Gen 2")
    const match = str.match(/(?:đời|thế hệ|the he|gen|f|bậc)?\s*(?:thứ)?\s*([0-9]{1,2})/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    const directNum = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return !isNaN(directNum) && directNum > 0 ? directNum : 0;
  }

  /**
   * Bộ phân tích ngày tháng linh hoạt và thông minh (Smart Flexible Date Parser)
   * Hỗ trợ mọi định dạng:
   * - DD/MM/YYYY, D/M/YYYY (21/10/1851, 25/8/1887)
   * - DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD, YYYY/MM/DD
   * - DD/MM, D/M (21/10, 25/8 - chỉ ngày và tháng giỗ)
   * - Chuỗi văn bản tiếng Việt: "Ngày 21 tháng 10 năm 1851", "21 thg 10 1851"
   * - Số năm đơn thuần: 1880
   * - Số ngày hoặc tháng đơn thuần: 15, 8
   * - Excel Serial Date Number (vd: 44195) hoặc JS Date object
   */
  public static parseFlexibleDate(val: any): {
    day?: number;
    month?: number;
    year?: number;
    formattedDate?: string;
    hasDate: boolean;
  } {
    if (val === undefined || val === null || val === '') {
      return { hasDate: false };
    }

    // 1. Nếu là JavaScript Date object
    if (val instanceof Date && !isNaN(val.getTime())) {
      const day = val.getDate();
      const month = val.getMonth() + 1;
      const year = val.getFullYear();
      return {
        day,
        month,
        year: year > 1000 ? year : undefined,
        formattedDate: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
        hasDate: true,
      };
    }

    // 2. Nếu là số Excel serial date (ví dụ từ 10000 đến 100000)
    if (typeof val === 'number') {
      if (val >= 1000 && val <= 2100) {
        // Năm đơn thuần (VD: 1851, 1920)
        return { year: Math.floor(val), hasDate: true };
      }
      if (val >= 1 && val <= 31) {
        // Ngày hoặc tháng đơn thuần
        return { day: Math.floor(val), hasDate: true };
      }
      if (val > 10000 && val < 100000) {
        // Excel date serial
        try {
          const date = new Date(Math.round((val - 25569) * 86400 * 1000));
          if (!isNaN(date.getTime())) {
            const day = date.getUTCDate();
            const month = date.getUTCMonth() + 1;
            const year = date.getUTCFullYear();
            return {
              day,
              month,
              year: year > 1000 ? year : undefined,
              formattedDate: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
              hasDate: true,
            };
          }
        } catch (e) {}
      }
    }

    const str = String(val).trim();
    if (!str) return { hasDate: false };

    // 3. Chuỗi dạng DD/MM/YYYY, D/M/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const dmyFullMatch = str.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/);
    if (dmyFullMatch) {
      const d = parseInt(dmyFullMatch[1], 10);
      const m = parseInt(dmyFullMatch[2], 10);
      const y = parseInt(dmyFullMatch[3], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1000 && y <= 2100) {
        return {
          day: d,
          month: m,
          year: y,
          formattedDate: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
          hasDate: true,
        };
      }
    }

    // 4. Chuỗi dạng YYYY-MM-DD, YYYY/MM/DD (ISO Format)
    const ymdFullMatch = str.match(/^(\d{4})[\/\-. ](\d{1,2})[\/\-. ](\d{1,2})$/);
    if (ymdFullMatch) {
      const y = parseInt(ymdFullMatch[1], 10);
      const m = parseInt(ymdFullMatch[2], 10);
      const d = parseInt(ymdFullMatch[3], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1000 && y <= 2100) {
        return {
          day: d,
          month: m,
          year: y,
          formattedDate: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
          hasDate: true,
        };
      }
    }

    // 5. Chuỗi dạng Ngày DD tháng MM năm YYYY (Văn bản tiếng Việt)
    const vnTextMatch = str.match(/(?:ngày\s*)?(\d{1,2})(?:[\s/tháng\.\-]+)(\d{1,2})(?:[\s/năm\.\-]+)(\d{4})/i);
    if (vnTextMatch) {
      const d = parseInt(vnTextMatch[1], 10);
      const m = parseInt(vnTextMatch[2], 10);
      const y = parseInt(vnTextMatch[3], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1000 && y <= 2100) {
        return {
          day: d,
          month: m,
          year: y,
          formattedDate: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
          hasDate: true,
        };
      }
    }

    // 6. Chuỗi dạng DD/MM hoặc D/M (chỉ có ngày và tháng giỗ)
    const dmShortMatch = str.match(/^(\d{1,2})[\/\-. ](\d{1,2})$/);
    if (dmShortMatch) {
      const d = parseInt(dmShortMatch[1], 10);
      const m = parseInt(dmShortMatch[2], 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
        return {
          day: d,
          month: m,
          formattedDate: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`,
          hasDate: true,
        };
      }
    }

    // 7. Số năm 4 chữ số đơn thuần trong chuỗi (VD: "1851", "Năm 1887")
    const yearOnlyMatch = str.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
    if (yearOnlyMatch) {
      const y = parseInt(yearOnlyMatch[1], 10);
      return {
        year: y,
        hasDate: true,
      };
    }

    // 8. Số ngày/tháng 1 hoặc 2 chữ số (VD: "15", "8", "28")
    const numOnly = parseInt(str.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numOnly) && numOnly > 0 && numOnly <= 31) {
      return {
        day: numOnly,
        hasDate: true,
      };
    }

    return { hasDate: false };
  }

  /**
   * Thuật toán tự động nhận diện & suy luận thế hệ + quan hệ phả hệ (Hỗ trợ Mã Cây Phân Cấp & BFS)
   */
  public static autoInferGenerationsAndBranches(rawMembers: RawImportMember[]): {
    members: RawImportMember[];
    autoInferredCount: number;
  } {
    const members = rawMembers.map((m) => ({ ...m }));
    let autoInferredCount = 0;

    // 1. Tạo Map tra cứu theo Mã Cây (TreeCode Map) và Tên chuẩn hóa (Name Map)
    const norm = (s?: string) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const memberByName = new Map<string, RawImportMember>();
    const memberByTreeCode = new Map<string, RawImportMember>();

    members.forEach((m) => {
      if (m.fullName) memberByName.set(norm(m.fullName), m);
      if (m.treeCode) memberByTreeCode.set(m.treeCode.trim().toUpperCase(), m);
    });

    // 2. Xử lý ưu tiên theo Mã Cây Phân Cấp (TreeCode)
    members.forEach((m) => {
      if (m.treeCode) {
        const code = m.treeCode.trim().toUpperCase();
        // A. Kiểm tra xem có phải là Hôn Phối (ví dụ: 1-V1, 1.1-V1, D11.1-V1, C1-D11-01-V1, 1-HP1, 1-C1)
        const spouseMatch = code.match(/^([A-Z0-9.]+)-(?:V|HP|C)([0-9]*)$/i);
        if (spouseMatch) {
          const rootCode = spouseMatch[1];
          const spouseIdx = spouseMatch[2] || '1';
          if (!m.spouseCode) m.spouseCode = rootCode;
          if (!m.relationType) m.relationType = spouseIdx === '1' ? 'Vợ Cả (Chính Thất)' : `Vợ Thứ ${spouseIdx} (Kế Thất)`;
          if (m.gender === 'MALE' && (code.includes('-V') || code.includes('-HP'))) {
            m.gender = 'FEMALE';
          }
          
          // Kiểm tra xem rootCode có chứa tiền tố đời dạng D11, Đ12, G13 không
          const genPrefixMatch = rootCode.match(/^(?:D|Đ|G|F|GEN)?([0-9]{1,2})(?:\.|$)/i);
          if (genPrefixMatch && (rootCode.startsWith('D') || rootCode.startsWith('Đ') || rootCode.startsWith('G') || rootCode.startsWith('F') || rootCode.startsWith('GEN'))) {
            const inferredGen = parseInt(genPrefixMatch[1], 10);
            if (!m.generationNumber || m.generationNumber === 0) {
              m.generationNumber = inferredGen;
              m.isAutoInferredGen = true;
              autoInferredCount++;
            }
          } else {
            // Thế hệ theo số dấu chấm của mã cây gốc
            const dotCount = (rootCode.match(/\./g) || []).length;
            const inferredGen = dotCount + 1;
            if (!m.generationNumber || m.generationNumber === 0) {
              m.generationNumber = inferredGen;
              m.isAutoInferredGen = true;
              autoInferredCount++;
            }
          }
        } else {
          // B. Mã con đẻ/huyết thống:
          // 1. Dạng tiền tố đời ngắn (VD: D11.1, D12.1, Đ12.2, F13.1)
          const genPrefixMatch = code.match(/^(?:D|Đ|G|F|GEN)([0-9]{1,2})(?:\.|$)/i);
          if (genPrefixMatch) {
            const inferredGen = parseInt(genPrefixMatch[1], 10);
            if (!m.generationNumber || m.generationNumber === 0) {
              m.generationNumber = inferredGen;
              m.isAutoInferredGen = true;
              autoInferredCount++;
            }
          } else if (code.includes('.')) {
            // 2. Dạng phân cấp dấu chấm truyền thống (VD: 1.1, 1.1.2)
            const dotCount = (code.match(/\./g) || []).length;
            const inferredGen = dotCount + 1;
            if (!m.generationNumber || m.generationNumber === 0) {
              m.generationNumber = inferredGen;
              m.isAutoInferredGen = true;
              autoInferredCount++;
            }
            // Tự động suy ra mã cha nếu chưa có
            if (!m.parentCode) {
              const lastDotIndex = code.lastIndexOf('.');
              const parentTreeCode = code.substring(0, lastDotIndex);
              m.parentCode = parentTreeCode;
            }
          }
        }
      }
    });

    // 3. Lan truyền từ Mã Cha (parentCode) và Mã Mẹ (motherCode)
    members.forEach((m) => {
      if (m.parentCode) {
        const parent = memberByTreeCode.get(m.parentCode.trim().toUpperCase());
        if (parent) {
          if (!m.parentName) m.parentName = parent.fullName;
          if (!m.branchName || m.branchName.trim() === '' || m.branchName === 'Chi Trưởng') {
            if (parent.branchName && parent.branchName !== 'Chi Trưởng') {
              m.branchName = parent.branchName;
            }
          }
        }
      }
      if (m.motherCode) {
        const mother = memberByTreeCode.get(m.motherCode.trim().toUpperCase());
        if (mother && !m.spouseName) {
          // Ghi nhận mẹ
        }
      }
      if (m.spouseCode) {
        const spouse = memberByTreeCode.get(m.spouseCode.trim().toUpperCase());
        if (spouse) {
          if (!m.spouseName) m.spouseName = spouse.fullName;
          if (!m.branchName && spouse.branchName) m.branchName = spouse.branchName;
        }
      }
    });

    // 4. Xác định các gốc (Root / Thủy Tổ) nếu không dùng treeCode
    members.forEach((m) => {
      const parent = m.parentName ? memberByName.get(norm(m.parentName)) : null;
      if (!m.parentName || !parent) {
        if (!m.generationNumber || m.generationNumber === 0) {
          m.generationNumber = 1;
          m.isAutoInferredGen = true;
          autoInferredCount++;
        }
        if (!m.branchName || m.branchName.trim() === '') {
          m.branchName = 'Chi Trưởng';
        }
      }
    });

    // 5. Lan truyền thế hệ đệ quy (BFS Queue) từ Cha sang Con & Vợ/Chồng theo tên
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 30) {
      changed = false;
      iterations++;

      for (const m of members) {
        // Lan truyền từ Cha -> Con
        if (m.parentName) {
          const parent = memberByName.get(norm(m.parentName));
          if (parent && parent.generationNumber > 0) {
            const expectedGen = parent.generationNumber + 1;
            if (!m.generationNumber || m.generationNumber === 0 || m.generationNumber !== expectedGen) {
              m.generationNumber = expectedGen;
              m.isAutoInferredGen = true;
              autoInferredCount++;
              changed = true;
            }
            if (!m.branchName || m.branchName.trim() === '' || m.branchName === 'Chi Trưởng') {
              if (parent.branchName && parent.branchName !== 'Chi Trưởng') {
                m.branchName = parent.branchName;
                changed = true;
              }
            }
          }
        }

        // Lan truyền giữa Vợ & Chồng (Cùng thế hệ)
        if (m.spouseName) {
          const spouse = memberByName.get(norm(m.spouseName));
          if (spouse) {
            if (m.generationNumber > 0 && (!spouse.generationNumber || spouse.generationNumber === 0)) {
              spouse.generationNumber = m.generationNumber;
              spouse.isAutoInferredGen = true;
              autoInferredCount++;
              changed = true;
            } else if (spouse.generationNumber > 0 && (!m.generationNumber || m.generationNumber === 0)) {
              m.generationNumber = spouse.generationNumber;
              m.isAutoInferredGen = true;
              autoInferredCount++;
              changed = true;
            }
            if (!spouse.branchName && m.branchName) {
              spouse.branchName = m.branchName;
              changed = true;
            }
          }
        }
      }
    }

    // 6. Quét dự phòng cuối cùng cho các thành viên chưa có đời
    members.forEach((m) => {
      if (!m.generationNumber || m.generationNumber < 1) {
        m.generationNumber = 1;
        m.isAutoInferredGen = true;
        autoInferredCount++;
      }
      if (!m.branchName || m.branchName.trim() === '') {
        m.branchName = 'Chi Trưởng';
      }
    });

    // 7. 🌟 Tự động quy đổi hai chiều Âm lịch <-> Dương lịch nếu người dùng chỉ nhập 1 trong 2 loại
    members.forEach((m) => {
      // a. Quy đổi Ngày Sinh: Dương -> Âm
      if (m.birthSolarDate && !m.birthLunarDate) {
        const parsed = DataImportService.parseFlexibleDate(m.birthSolarDate);
        if (parsed.hasDate && parsed.day && parsed.month && parsed.year) {
          try {
            const lunar = solarToLunar(parsed.day, parsed.month, parsed.year);
            if (lunar && lunar.day && lunar.month && lunar.year) {
              m.birthLunarDay = lunar.day;
              m.birthLunarMonth = lunar.month;
              m.birthLunarYear = lunar.year;
              m.birthLunarDate = `${String(lunar.day).padStart(2, '0')}/${String(lunar.month).padStart(2, '0')}/${lunar.year}`;
            }
          } catch (err) {
            // Safe fallback
          }
        }
      }
      // b. Quy đổi Ngày Sinh: Âm -> Dương
      else if (m.birthLunarDate && !m.birthSolarDate) {
        const parsed = DataImportService.parseFlexibleDate(m.birthLunarDate);
        if (parsed.hasDate && parsed.day && parsed.month && parsed.year) {
          try {
            const [sd, sm, sy] = lunarToSolar(parsed.day, parsed.month, parsed.year);
            if (sd && sm && sy && sy > 0) {
              m.birthSolarDate = `${String(sd).padStart(2, '0')}/${String(sm).padStart(2, '0')}/${sy}`;
              if (!m.birthYear) m.birthYear = sy;
            }
          } catch (err) {
            // Safe fallback
          }
        }
      }

      // c. Quy đổi Ngày Mất: Dương -> Âm (Ngày Giỗ)
      if (m.deathSolarDate && (!m.deathLunarFull || !m.deathLunarDay)) {
        const parsed = DataImportService.parseFlexibleDate(m.deathSolarDate);
        if (parsed.hasDate && parsed.day && parsed.month && parsed.year) {
          try {
            const lunar = solarToLunar(parsed.day, parsed.month, parsed.year);
            if (lunar && lunar.day && lunar.month && lunar.year) {
              m.deathLunarDay = lunar.day;
              m.deathLunarMonth = lunar.month;
              m.deathLunarYear = lunar.year;
              m.deathLunarFull = `${String(lunar.day).padStart(2, '0')}/${String(lunar.month).padStart(2, '0')}/${lunar.year}`;
              m.lifeStatus = 'DECEASED';
            }
          } catch (err) {
            // Safe fallback
          }
        }
      }
      // d. Quy đổi Ngày Mất: Âm (Ngày Giỗ) -> Dương
      else if (m.deathLunarDay && m.deathLunarMonth && m.deathLunarYear && !m.deathSolarDate) {
        try {
          const [sd, sm, sy] = lunarToSolar(m.deathLunarDay, m.deathLunarMonth, m.deathLunarYear);
          if (sd && sm && sy && sy > 0) {
            m.deathSolarDate = `${String(sd).padStart(2, '0')}/${String(sm).padStart(2, '0')}/${sy}`;
            m.lifeStatus = 'DECEASED';
          }
        } catch (err) {
          // Safe fallback
        }
      }
    });

    return { members, autoInferredCount };
  }

  /**
   * Tự động nhận diện cột (Auto-Mapping Hệ Thống Cột Phả Hệ Phân Cấp)
   */
  public static autoMapHeaders(headers: string[]): ColumnMappingSuggestion[] {
    const rules: Record<string, { field: string; label: string; keywords: string[] }> = {
      treeCode: {
        field: 'treeCode',
        label: 'Mã Cây / STT Phân Cấp',
        keywords: [
          'mã cây (tree node code)',
          'mã cây (tree code)',
          'mã cây',
          'tree node code',
          'tree node',
          'tree code',
          'tree_code',
          'mã số cây',
          'mã phân cấp',
          'stt phân cấp',
          'mã thành viên',
          'mã node',
          'node code',
          'code',
          'id phân cấp',
          'ma cay (tree node code)',
          'ma cay',
        ],
      },
      parentCode: {
        field: 'parentCode',
        label: 'Mã Cha',
        keywords: [
          'mã cha (father code)',
          'mã cha (parent code)',
          'mã cha',
          'father code',
          'father_code',
          'parent code',
          'parent_code',
          'mã người cha',
          'mã cha đẻ',
          'mã bố',
          'ma cha (father code)',
          'ma cha',
        ],
      },
      motherCode: {
        field: 'motherCode',
        label: 'Mã Mẹ',
        keywords: [
          'mã mẹ (mother code)',
          'mã mẹ',
          'mother code',
          'mother_code',
          'mã người mẹ',
          'mã mẹ đẻ',
          'ma me (mother code)',
          'ma me',
        ],
      },
      spouseCode: {
        field: 'spouseCode',
        label: 'Mã Phối Ngẫu / Vợ Chồng',
        keywords: [
          'mã phối ngẫu (spouse code)',
          'mã phối ngẫu',
          'mã vợ/chồng',
          'mã vợ chồng',
          'mã vợ',
          'mã chồng',
          'spouse code',
          'spouse_code',
          'ma phoi ngau (spouse code)',
          'ma phoi ngau',
          'ma vo/chong',
        ],
      },
      relationType: {
        field: 'relationType',
        label: 'Quan Hệ Phân Cấp',
        keywords: ['quan hệ', 'quan hệ phân cấp', 'vai vế', 'vai trò', 'hôn phối/con đẻ', 'relation type', 'relation_type', 'huyết thống', 'quan he'],
      },
      fullName: { 
        field: 'fullName', 
        label: 'Họ và Tên', 
        keywords: ['họ tên', 'họ và tên', 'họ và tên đầy đủ', 'tên', 'full_name', 'name', 'thành viên', 'danh tính', 'ho va ten'] 
      },
      courtesyName: {
        field: 'courtesyName',
        label: 'Tên Tự / Hiệu / Bí Danh',
        keywords: ['tên tự', 'tên hiệu', 'bí danh', 'pháp danh', 'tên tự / hiệu', 'tên chữ', 'courtesy_name', 'courtesy name', 'ten tu / hieu', 'ten tu', 'ten hieu'],
      },
      gender: { 
        field: 'gender', 
        label: 'Giới Tính', 
        keywords: ['giới tính', 'nam/nữ', 'nam nữ', 'gender', 'sex', 'phái', 'gioi tinh'] 
      },
      generationNumber: { 
        field: 'generationNumber', 
        label: 'Thế Hệ (Đời)', 
        keywords: ['đời', 'thế hệ', 'thế hệ (đời)', 'đời thứ', 'generation', 'gen', 'bậc', 'the he (doi)', 'the he', 'doi thu'] 
      },
      branchName: { 
        field: 'branchName', 
        label: 'Chi Phái', 
        keywords: ['chi', 'chi họ', 'chi phái', 'phái', 'nhánh', 'ngành', 'phân chi', 'branch', 'chi phai'] 
      },
      birthOrder: {
        field: 'birthOrder',
        label: 'Thứ Tự Sinh',
        keywords: ['thứ tự sinh', 'thứ bậc', 'con thứ', 'vai thứ', 'thứ tự', 'birth_order', 'birth order', 'thu tu sinh'],
      },
      lifeStatus: { 
        field: 'lifeStatus', 
        label: 'Trạng Thái', 
        keywords: ['trạng thái', 'tình trạng', 'còn sống / đã mất', 'sống / mất', 'status', 'life_status', 'trang thai'] 
      },
      birthSolarDate: {
        field: 'birthSolarDate',
        label: 'Ngày Sinh Dương Lịch (Ngày/Tháng/Năm)',
        keywords: [
          'ngày sinh dương lịch (ngày/tháng/năm)',
          'ngày sinh dương lịch (ngày tháng năm)',
          'ngày sinh dương lịch',
          'ngày sinh (dương lịch)',
          'ngày sinh dương',
          'ngày sinh dl',
          'ngày tháng năm sinh (dương lịch)',
          'ngày tháng năm sinh',
          'ngày sinh',
          'sinh nhật',
          'birth_solar_date',
          'solar birth date',
          'birth_date',
          'date_of_birth',
          'dob',
          'ngay sinh duong lich',
          'ngay sinh duong',
          'ngay sinh dl',
          'ngay sinh',
        ],
      },
      birthLunarDate: {
        field: 'birthLunarDate',
        label: 'Ngày Sinh Âm Lịch (Ngày/Tháng/Năm)',
        keywords: [
          'ngày sinh âm lịch (ngày/tháng/năm)',
          'ngày sinh âm lịch (ngày tháng năm)',
          'ngày sinh âm lịch',
          'ngày sinh (âm lịch)',
          'ngày sinh âm',
          'ngày sinh al',
          'ngày tháng năm sinh (âm lịch)',
          'ngày sinh al (ngày/tháng/năm)',
          'birth_lunar_date',
          'birth_lunar_full',
          'lunar birth date',
          'lunar_birth_date',
          'ngay sinh am lich',
          'ngay sinh am',
          'ngay sinh al',
        ],
      },
      birthLunarDay: {
        field: 'birthLunarDay',
        label: 'Ngày Sinh Âm (Số Ngày)',
        keywords: ['ngày sinh âm (số ngày)', 'ngày sinh âm (ngày)', 'ngày sinh âm', 'số ngày sinh âm', 'birth_lunar_day', 'ngay sinh am (ngay)'],
      },
      birthLunarMonth: {
        field: 'birthLunarMonth',
        label: 'Tháng Sinh Âm (Số Tháng)',
        keywords: ['tháng sinh âm (số tháng)', 'tháng sinh âm (tháng)', 'tháng sinh âm', 'số tháng sinh âm', 'birth_lunar_month', 'thang sinh am (thang)'],
      },
      birthYear: { 
        field: 'birthYear', 
        label: 'Năm Sinh', 
        keywords: ['năm sinh', 'sinh năm', 'năm sinh dương', 'năm sinh dl', 'năm sinh âm', 'birth_year', 'dob year', 'nam sinh'] 
      },
      birthTime: {
        field: 'birthTime',
        label: 'Giờ Sinh (Can Chi / Giờ)',
        keywords: [
          'giờ sinh (can chi / giờ)',
          'giờ sinh (can chi / giờ thực tế)',
          'giờ sinh (can chi)',
          'giờ sinh',
          'khung giờ sinh',
          'thời gian sinh',
          'can chi giờ sinh',
          'birth_time',
          'birth time',
          'gio sinh (can chi)',
          'gio sinh',
        ],
      },
      deathLunarFull: {
        field: 'deathLunarFull',
        label: 'Ngày Mất Âm Lịch (Ngày Giỗ - Ngày/Tháng/Năm)',
        keywords: [
          'ngày mất âm lịch (ngày/tháng/năm)',
          'ngày mất âm lịch (ngày tháng năm)',
          'ngày mất âm lịch (ngày giỗ)',
          'ngày mất âm lịch',
          'ngày mất (âm lịch)',
          'ngày mất âm',
          'ngày mất al',
          'ngày giỗ (ngày/tháng/năm)',
          'ngày giỗ (ngày tháng năm)',
          'ngày giỗ âm lịch',
          'ngày giỗ âm',
          'ngày giỗ',
          'ngày mất',
          'ngày qua đời',
          'ngày tạ thế',
          'ngày lâm chung',
          'ngay mat am lich (ngay/thang/nam)',
          'ngay mat am lich (ngay thang nam)',
          'ngay mat am lich',
          'ngay mat am',
          'ngay mat',
          'ngay gio',
          'death_lunar_date',
          'death_date',
          'death_lunar_full',
        ],
      },
      deathSolarDate: {
        field: 'deathSolarDate',
        label: 'Ngày Mất Dương Lịch (Ngày/Tháng/Năm)',
        keywords: [
          'ngày mất dương lịch (ngày/tháng/năm)',
          'ngày mất dương lịch (ngày tháng năm)',
          'ngày mất dương lịch',
          'ngày mất (dương lịch)',
          'ngày mất dương',
          'ngày mất dl',
          'ngày qua đời (dương lịch)',
          'death_solar_date',
          'solar death date',
          'death_solar',
          'ngay mat duong lich',
          'ngay mat duong',
          'ngay mat dl',
        ],
      },
      deathLunarDay: { 
        field: 'deathLunarDay', 
        label: 'Ngày Mất Âm (Số Ngày)', 
        keywords: ['ngày mất âm (số ngày)', 'ngày mất âm (ngày)', 'ngày mất âm', 'ngày mất (ngày)', 'ngày giỗ (ngày)', 'số ngày mất', 'death_lunar_day', 'death_day', 'ngay mat am (ngay)'] 
      },
      deathLunarMonth: { 
        field: 'deathLunarMonth', 
        label: 'Tháng Mất Âm (Số Tháng)', 
        keywords: ['tháng mất âm (số tháng)', 'tháng mất âm (tháng)', 'tháng mất âm', 'tháng giỗ (tháng)', 'tháng giỗ âm', 'tháng giỗ', 'số tháng mất', 'death_lunar_month', 'death_month', 'thang mat am (thang)'] 
      },
      deathLunarYear: { 
        field: 'deathLunarYear', 
        label: 'Năm Mất', 
        keywords: ['năm mất', 'năm mất âm', 'năm mất dương', 'năm qua đời', 'năm tạ thế', 'death_year', 'death_lunar_year', 'nam mat'] 
      },
      deathTime: {
        field: 'deathTime',
        label: 'Giờ Mất (Can Chi / Giờ)',
        keywords: [
          'giờ mất (can chi / giờ)',
          'giờ mất (can chi / giờ thực tế)',
          'giờ mất (can chi)',
          'giờ mất',
          'giờ tạ thế',
          'giờ lâm chung',
          'khung giờ mất',
          'thời gian mất',
          'can chi giờ mất',
          'death_time',
          'death time',
          'gio mat (can chi)',
          'gio mat',
        ],
      },
      burialPlace: { 
        field: 'burialPlace', 
        label: 'Nơi An Táng', 
        keywords: ['nơi an táng', 'mộ phần', 'vị trí mộ', 'an táng', 'lăng mộ', 'nghĩa trang', 'quê quán an táng', 'burial_place', 'noi an tang', 'mo phan'] 
      },
      bio: {
        field: 'bio',
        label: 'Tiểu Sử / Sự Nghiệp',
        keywords: ['tiểu sử', 'sự nghiệp', 'ghi chú', 'tiểu sử / sự nghiệp', 'ghi chú thêm', 'bio', 'biography', 'notes', 'tieu su'],
      },
      parentName: { 
        field: 'parentName', 
        label: 'Tên Cha (Cũ)', 
        keywords: ['tên cha', 'cha', 'thân phụ', 'bố', 'tên bố', 'cha đẻ', 'father', 'parent', 'ten cha'] 
      },
      spouseName: { 
        field: 'spouseName', 
        label: 'Vợ / Chồng (Cũ)', 
        keywords: ['vợ / chồng', 'vợ', 'chồng', 'phu thê', 'chính thất', 'phối ngẫu', 'spouse', 'vợ chồng', 'vo / chong'] 
      },
    };

    return headers.map((header) => {
      const lower = header.toLowerCase().trim().replace(/[\-_/]/g, ' ');
      let bestMatch: { field: string; label: string } | null = null;
      let highestConf = 0;

      for (const [, rule] of Object.entries(rules)) {
        if (rule.keywords.some((kw) => lower === kw)) {
          bestMatch = { field: rule.field, label: rule.label };
          highestConf = 1.0;
          break;
        } else if (rule.keywords.some((kw) => lower.includes(kw) || kw.includes(lower))) {
          bestMatch = { field: rule.field, label: rule.label };
          highestConf = 0.92;
        }
      }

      return {
        sourceHeader: header,
        targetField: bestMatch?.field || 'unknown',
        label: bestMatch?.label || 'Chưa ánh xạ',
        confidence: highestConf,
      };
    });
  }

  /**
   * Đọc và phân tích file Excel (.xlsx, .xls) hoặc CSV trực tiếp tại Client
   */
  public static async parseExcelFile(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          if (!worksheet) {
            throw new Error('Tệp Excel không chứa trang tính (worksheet) nào hợp lệ.');
          }

          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
          if (rawRows.length === 0) {
            throw new Error('Tệp Excel trống, không có dòng dữ liệu nào.');
          }

          const headers = Object.keys(rawRows[0]);
          const mappings = this.autoMapHeaders(headers);

          const headerToField: Record<string, string> = {};
          mappings.forEach((m) => {
            if (m.targetField !== 'unknown') {
              headerToField[m.sourceHeader] = m.targetField;
            }
          });

          // 1. Parse dữ liệu thô
          const preliminaryMembers: RawImportMember[] = rawRows.map((row) => {
            const memberObj: any = {
              fullName: '',
              gender: 'MALE',
              generationNumber: 0,
              branchName: '',
              lifeStatus: 'ALIVE',
            };

            Object.entries(row).forEach(([header, val]) => {
              const field = headerToField[header];
              const strVal = String(val).trim();
              if (!field || strVal === '') return;

              if (field === 'treeCode') {
                memberObj.treeCode = strVal;
              } else if (field === 'parentCode') {
                memberObj.parentCode = strVal;
              } else if (field === 'motherCode') {
                memberObj.motherCode = strVal;
              } else if (field === 'spouseCode') {
                memberObj.spouseCode = strVal;
              } else if (field === 'relationType') {
                memberObj.relationType = strVal;
              } else if (field === 'fullName') {
                memberObj.fullName = strVal;
              } else if (field === 'courtesyName') {
                memberObj.courtesyName = strVal;
              } else if (field === 'gender') {
                const gLower = strVal.toLowerCase();
                memberObj.gender = (gLower === 'nữ' || gLower === 'female' || gLower === 'f' || gLower === 'gái' || gLower === 'nu') ? 'FEMALE' : 'MALE';
              } else if (field === 'generationNumber') {
                memberObj.generationNumber = DataImportService.parseGenerationText(strVal);
              } else if (field === 'branchName') {
                memberObj.branchName = strVal;
              } else if (field === 'birthOrder') {
                memberObj.birthOrder = strVal;
              } else if (field === 'parentName') {
                memberObj.parentName = strVal;
              } else if (field === 'spouseName') {
                memberObj.spouseName = strVal;
              } else if (field === 'lifeStatus') {
                const sLower = strVal.toLowerCase();
                memberObj.lifeStatus = (sLower.includes('mất') || sLower.includes('chết') || sLower.includes('deceased') || sLower.includes('khuất') || sLower.includes('mat')) ? 'DECEASED' : 'ALIVE';
              } else if (
                field === 'deathLunarFull' ||
                field === 'deathLunarDay' ||
                field === 'deathLunarMonth' ||
                field === 'deathLunarYear'
              ) {
                const parsed = DataImportService.parseFlexibleDate(val);
                if (parsed.hasDate) {
                  if (parsed.day !== undefined && (parsed.month !== undefined || parsed.year !== undefined)) {
                    memberObj.deathLunarDay = parsed.day;
                  }
                  if (parsed.month !== undefined) {
                    memberObj.deathLunarMonth = parsed.month;
                  }
                  if (parsed.year !== undefined) {
                    memberObj.deathLunarYear = parsed.year;
                  }
                  if (parsed.formattedDate) {
                    memberObj.deathLunarFull = parsed.formattedDate;
                  }

                  // Nếu chỉ có 1 số đơn thuần
                  if (parsed.day !== undefined && parsed.month === undefined && parsed.year === undefined) {
                    if (field === 'deathLunarDay' || field === 'deathLunarFull') {
                      memberObj.deathLunarDay = parsed.day;
                    } else if (field === 'deathLunarMonth') {
                      memberObj.deathLunarMonth = parsed.day;
                    } else if (field === 'deathLunarYear') {
                      memberObj.deathLunarYear = parsed.day;
                    }
                  } else if (parsed.year !== undefined && parsed.day === undefined && parsed.month === undefined) {
                    memberObj.deathLunarYear = parsed.year;
                  }

                  memberObj.lifeStatus = 'DECEASED';
                }
              } else if (field === 'deathSolarDate') {
                const parsed = DataImportService.parseFlexibleDate(val);
                if (parsed.hasDate) {
                  if (parsed.formattedDate) {
                    memberObj.deathSolarDate = parsed.formattedDate;
                  } else if (parsed.day !== undefined && parsed.month !== undefined) {
                    memberObj.deathSolarDate = `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}${parsed.year ? `/${parsed.year}` : ''}`;
                  }
                  memberObj.lifeStatus = 'DECEASED';
                }
              } else if (field === 'birthSolarDate' || field === 'birthYear') {
                const parsed = DataImportService.parseFlexibleDate(val);
                if (parsed.hasDate) {
                  if (parsed.year !== undefined) {
                    memberObj.birthYear = parsed.year;
                  }
                  if (parsed.formattedDate) {
                    memberObj.birthSolarDate = parsed.formattedDate;
                  } else if (parsed.day !== undefined && parsed.month !== undefined) {
                    memberObj.birthSolarDate = `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}${parsed.year ? `/${parsed.year}` : ''}`;
                  }
                }
              } else if (field === 'birthLunarDate' || field === 'birthLunarDay' || field === 'birthLunarMonth') {
                const parsed = DataImportService.parseFlexibleDate(val);
                if (parsed.hasDate) {
                  if (parsed.day !== undefined && (parsed.month !== undefined || parsed.year !== undefined)) {
                    memberObj.birthLunarDay = parsed.day;
                  }
                  if (parsed.month !== undefined) {
                    memberObj.birthLunarMonth = parsed.month;
                  }
                  if (parsed.year !== undefined) {
                    memberObj.birthLunarYear = parsed.year;
                  }
                  if (parsed.formattedDate) {
                    memberObj.birthLunarDate = parsed.formattedDate;
                  } else if (parsed.day !== undefined && parsed.month !== undefined) {
                    memberObj.birthLunarDate = `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}${parsed.year ? `/${parsed.year}` : ''}`;
                  }
                }
              } else if (field === 'birthTime') {
                memberObj.birthTime = strVal;
              } else if (field === 'deathTime') {
                memberObj.deathTime = strVal;
                memberObj.lifeStatus = 'DECEASED';
              } else if (field === 'burialPlace') {
                memberObj.burialPlace = strVal;
              } else if (field === 'bio') {
                memberObj.bio = strVal;
              }
            });

            if (memberObj.deathLunarDay || memberObj.deathLunarMonth || memberObj.deathLunarYear || memberObj.deathTime || memberObj.burialPlace) {
              memberObj.lifeStatus = 'DECEASED';
            }

            return memberObj as RawImportMember;
          }).filter((m) => m.fullName.length > 0);

          // 2. Chạy thuật toán tự động nhận diện & suy luận thế hệ
          const { members: mappedMembers, autoInferredCount } = this.autoInferGenerationsAndBranches(preliminaryMembers);

          resolve({
            headers,
            rawRows,
            mappedMembers,
            mappings,
            autoInferredCount,
          });
        } catch (err: any) {
          reject(new Error(err.message || 'Lỗi khi đọc file Excel.'));
        }
      };

      reader.onerror = () => reject(new Error('Không thể đọc file từ thiết bị.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Tạo và tải về File Excel Mẫu Cây Phả Hệ Phân Cấp Chuẩn (Đầy đủ Vợ Chồng, Con Cái, Giờ Sinh, Giờ Mất)
   */
  public static downloadStandardTemplateExcel(): void {
    const sampleRows = [
      {
        'Mã Cây / STT Phân Cấp': '1',
        'Mã Cha': '',
        'Mã Mẹ': '',
        'Mã Phối Ngẫu': '1-V1, 1-V2',
        'Quan Hệ Phân Cấp': 'Thủy Tổ Khởi Tộc',
        'Họ và Tên': 'Cụ Nguyễn Phúc Khởi Tổ',
        'Tên Tự / Hiệu / Bí Danh': 'Thuần Đức Tiên Sinh (Tự Phúc An)',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 1,
        'Chi Phái': 'Toàn Tộc (Khởi Tổ)',
        'Thứ Tự Sinh': 'Thủy Tổ',
        'Trạng Thái': 'Đã mất',
        'Ngày Sinh Dương Lịch': '15/10/1880',
        'Ngày Sinh Âm Lịch': '12/09/1880',
        'Giờ Sinh': 'Giờ Thìn (07h-09h)',
        'Ngày Mất Âm': 15,
        'Tháng Mất Âm': 1,
        'Năm Mất': 1952,
        'Ngày Mất Dương Lịch': '10/02/1952',
        'Giờ Mất': 'Giờ Ngọ (11h-13h)',
        'Nơi An Táng': 'Lăng Mộ Tổ Đồi Thông Xứ Đông',
        'Tiểu Sử / Sự Nghiệp': 'Cụ Thủy Tổ khai hoang lập nghiệp, mở mang bờ cõi dòng họ.',
      },
      {
        'Mã Cây / STT Phân Cấp': '1-V1',
        'Mã Cha': '',
        'Mã Mẹ': '',
        'Mã Phối Ngẫu': '1',
        'Quan Hệ Phân Cấp': 'Vợ Cả (Chính Thất)',
        'Họ và Tên': 'Cụ Bà Trần Thị Mai',
        'Tên Tự / Hiệu / Bí Danh': 'Từ Mẫu Mai Hoa',
        'Giới Tính': 'Nữ',
        'Thế Hệ (Đời)': 1,
        'Chi Phái': 'Toàn Tộc (Khởi Tổ)',
        'Thứ Tự Sinh': 'Chính Thất',
        'Trạng Thái': 'Đã mất',
        'Ngày Sinh Dương Lịch': '20/08/1885',
        'Ngày Sinh Âm Lịch': '11/07/1885',
        'Giờ Sinh': 'Giờ Mão (05h-07h)',
        'Ngày Mất Âm': 10,
        'Tháng Mất Âm': 8,
        'Năm Mất': 1958,
        'Ngày Mất Dương Lịch': '22/09/1958',
        'Giờ Mất': 'Giờ Mùi (13h-15h)',
        'Nơi An Táng': 'Lăng Mộ Tổ Đồi Thông Xứ Đông',
        'Tiểu Sử / Sự Nghiệp': 'Bà Chính thất sinh hạ con trưởng (1.1) và con thứ hai (1.2).',
      },
      {
        'Mã Cây / STT Phân Cấp': '1-V2',
        'Mã Cha': '',
        'Mã Mẹ': '',
        'Mã Phối Ngẫu': '1',
        'Quan Hệ Phân Cấp': 'Vợ Hai (Kế Thất)',
        'Họ và Tên': 'Cụ Bà Lê Thị Lan',
        'Tên Tự / Hiệu / Bí Danh': 'Hiền Thục Phu Nhân',
        'Giới Tính': 'Nữ',
        'Thế Hệ (Đời)': 1,
        'Chi Phái': 'Toàn Tộc (Khởi Tổ)',
        'Thứ Tự Sinh': 'Kế Thất',
        'Trạng Thái': 'Đã mất',
        'Ngày Sinh Dương Lịch': '12/04/1890',
        'Ngày Sinh Âm Lịch': '23/02/1890',
        'Giờ Sinh': 'Giờ Dần (03h-05h)',
        'Ngày Mất Âm': 20,
        'Tháng Mất Âm': 10,
        'Năm Mất': 1965,
        'Ngày Mất Dương Lịch': '13/11/1965',
        'Giờ Mất': 'Giờ Thân (15h-17h)',
        'Nơi An Táng': 'Khu Nghĩa Trang Đồng Xứ Nam',
        'Tiểu Sử / Sự Nghiệp': 'Bà Kế thất sinh hạ con trai thứ ba (1.3 - Khởi Chi Ba).',
      },
      {
        'Mã Cây / STT Phân Cấp': '1.1',
        'Mã Cha': '1',
        'Mã Mẹ': '1-V1',
        'Mã Phối Ngẫu': '1.1-V1',
        'Quan Hệ Phân Cấp': 'Con Đẻ (Trưởng Nam)',
        'Họ và Tên': 'Cụ Nguyễn Phúc Khang',
        'Tên Tự / Hiệu / Bí Danh': 'Đại Trưởng Huynh',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Trưởng (Chi 1)',
        'Thứ Tự Sinh': 'Trưởng Nam',
        'Trạng Thái': 'Đã mất',
        'Ngày Sinh Dương Lịch': '21/10/1910',
        'Ngày Sinh Âm Lịch': '18/09/1910',
        'Giờ Sinh': 'Giờ Tý (23h-01h)',
        'Ngày Mất Âm': 18,
        'Tháng Mất Âm': 5,
        'Năm Mất': 1980,
        'Ngày Mất Dương Lịch': '29/06/1980',
        'Giờ Mất': 'Giờ Dậu (17h-19h)',
        'Nơi An Táng': 'Khu Lăng Mộ Chi Trưởng',
        'Tiểu Sử / Sự Nghiệp': 'Trưởng tộc đời 2, gìn giữ từ đường hương hỏa.',
      },
      {
        'Mã Cây / STT Phân Cấp': '1.1-V1',
        'Mã Cha': '',
        'Mã Mẹ': '',
        'Mã Phối Ngẫu': '1.1',
        'Quan Hệ Phân Cấp': 'Vợ Cả (Dâu Trưởng)',
        'Họ và Tên': 'Cụ Bà Phạm Thị Đào',
        'Tên Tự / Hiệu / Bí Danh': 'Trưởng Dâu Hiền Thục',
        'Giới Tính': 'Nữ',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Trưởng (Chi 1)',
        'Thứ Tự Sinh': 'Chính Thất',
        'Trạng Thái': 'Đã mất',
        'Ngày Sinh Dương Lịch': '05/03/1912',
        'Ngày Sinh Âm Lịch': '17/01/1912',
        'Giờ Sinh': 'Giờ Tỵ (09h-11h)',
        'Ngày Mất Âm': 12,
        'Tháng Mất Âm': 3,
        'Năm Mất': 1986,
        'Ngày Mất Dương Lịch': '20/04/1986',
        'Giờ Mất': 'Giờ Hợi (21h-23h)',
        'Nơi An Táng': 'Khu Lăng Mộ Chi Trưởng',
        'Tiểu Sử / Sự Nghiệp': 'Bà Dâu Trưởng hiền đức, phụng dưỡng cha mẹ chồng trọn đạo.',
      },
      {
        'Mã Cây / STT Phân Cấp': '1.1.1',
        'Mã Cha': '1.1',
        'Mã Mẹ': '1.1-V1',
        'Mã Phối Ngẫu': '',
        'Quan Hệ Phân Cấp': 'Con Đẻ (Cháu Đích Tôn)',
        'Họ và Tên': 'Nguyễn Phúc An',
        'Tên Tự / Hiệu / Bí Danh': 'Đích Tôn An Bình',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 3,
        'Chi Phái': 'Chi Trưởng (Chi 1)',
        'Thứ Tự Sinh': 'Trưởng Nam (Đích Tôn)',
        'Trạng Thái': 'Còn sống',
        'Năm Sinh': 1950,
        'Giờ Sinh': 'Giờ Thìn (07h-09h)',
        'Ngày Mất Âm': '',
        'Tháng Mất Âm': '',
        'Năm Mất': '',
        'Giờ Mất': '',
        'Nơi An Táng': '',
        'Tiểu Sử / Sự Nghiệp': 'Hiện là Trưởng tộc đời 3, đương nhiệm phụng tự từ đường họ.',
      },
      {
        'Mã Cây / STT Phân Cấp': '1.1.2',
        'Mã Cha': '1.1',
        'Mã Mẹ': '1.1-V1',
        'Mã Phối Ngẫu': '',
        'Quan Hệ Phân Cấp': 'Con Đẻ (Thứ Nam)',
        'Họ và Tên': 'Nguyễn Phúc Bình',
        'Tên Tự / Hiệu / Bí Danh': 'Bình An Cư Sĩ',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 3,
        'Chi Phái': 'Chi Trưởng (Chi 1)',
        'Thứ Tự Sinh': 'Thứ Nam 2',
        'Trạng Thái': 'Còn sống',
        'Năm Sinh': 1955,
        'Giờ Sinh': 'Giờ Mão (05h-07h)',
        'Ngày Mất Âm': '',
        'Tháng Mất Âm': '',
        'Năm Mất': '',
        'Giờ Mất': '',
        'Nơi An Táng': '',
        'Tiểu Sử / Sự Nghiệp': 'Kỹ sư cầu đường, đóng góp tôn tạo từ đường dòng họ.',
      },
      {
        'Mã Cây / STT Phân Cấp': '1.2',
        'Mã Cha': '1',
        'Mã Mẹ': '1-V1',
        'Mã Phối Ngẫu': '',
        'Quan Hệ Phân Cấp': 'Con Đẻ (Thứ Nam - Khởi Chi 2)',
        'Họ và Tên': 'Cụ Nguyễn Phúc Ninh',
        'Tên Tự / Hiệu / Bí Danh': 'Ninh Vương Công',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Hai (Chi 2)',
        'Thứ Tự Sinh': 'Thứ Nam 2',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1915,
        'Giờ Sinh': 'Giờ Mùi (13h-15h)',
        'Ngày Mất Âm': 22,
        'Tháng Mất Âm': 11,
        'Năm Mất': 1985,
        'Giờ Mất': 'Giờ Dậu (17h-19h)',
        'Nơi An Táng': 'Nghĩa Trang Chi Hai',
        'Tiểu Sử / Sự Nghiệp': 'Cụ Khởi lập Chi Hai, đỗ đạt cử nhân mở trường dạy học.',
      },
      {
        'Mã Cây / STT Phân Cấp': '1.3',
        'Mã Cha': '1',
        'Mã Mẹ': '1-V2',
        'Mã Phối Ngẫu': '',
        'Quan Hệ Phân Cấp': 'Con Đẻ (Thứ Nam - Khởi Chi 3)',
        'Họ và Tên': 'Cụ Nguyễn Phúc Thịnh',
        'Tên Tự / Hiệu / Bí Danh': 'Thịnh Phát Tiên Sinh',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Ba (Chi 3)',
        'Thứ Tự Sinh': 'Thứ Nam 3 (Con Bà Hai)',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1920,
        'Giờ Sinh': 'Giờ Thân (15h-17h)',
        'Ngày Mất Âm': 5,
        'Tháng Mất Âm': 4,
        'Năm Mất': 1990,
        'Giờ Mất': 'Giờ Ngọ (11h-13h)',
        'Nơi An Táng': 'Nghĩa Trang Chi Ba',
        'Tiểu Sử / Sự Nghiệp': 'Cụ Khởi lập Chi Ba dòng họ.',
      },
    ];

    const guideRows = [
      {
        'Cột': 'Mã Cây / STT Phân Cấp',
        'Ý Nghĩa & Quy Ước': 'Mã số định danh phả hệ: 1 (Cụ Tổ), 1-V1 (Vợ cả), 1-V2 (Vợ hai), 1.1 (Con trưởng), 1.1.1 (Cháu đích tôn), 1.2 (Con thứ)...',
        'Ví Dụ Mẫu': '1 | 1-V1 | 1.1 | 1.1.1 | 1.2',
      },
      {
        'Cột': 'Mã Cha / Mã Mẹ / Mã Phối Ngẫu',
        'Ý Nghĩa & Quy Ước': 'Điền Mã Cây của Cha, Mẹ hoặc Vợ/Chồng để thiết lập cây phả hệ tự động.',
        'Ví Dụ Mẫu': '1 | 1-V1 | 1.1 | D11.1',
      },
      {
        'Cột': 'Ngày Sinh Dương Lịch / Âm Lịch',
        'Ý Nghĩa & Quy Ước': 'Định dạng ngày/tháng/năm (VD: 21/10/1910) hoặc năm (1910). Phân biệt rõ giữa ngày Dương và ngày Âm.',
        'Ví Dụ Mẫu': '21/10/1910 (Dương) | 18/09/1910 (Âm)',
      },
      {
        'Cột': 'Giờ Sinh / Giờ Mất',
        'Ý Nghĩa & Quy Ước': 'Khung giờ sinh / giờ mất theo 12 con giáp (Giờ Tý, Sửu...) hoặc giờ đồng hồ (08:30).',
        'Ví Dụ Mẫu': 'Giờ Thìn (07h-09h) | 08:30 | Giờ Ngọ (11h-13h)',
      },
      {
        'Cột': 'Ngày Mất Âm Lịch (Ngày Giỗ)',
        'Ý Nghĩa & Quy Ước': 'Ngày và tháng giỗ Âm lịch hàng năm (Để trống nếu thành viên còn sống).',
        'Ví Dụ Mẫu': '15/01/1952 hoặc Ngày 15, Tháng 1',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    worksheet['!cols'] = [
      { wch: 22 }, // Mã Cây
      { wch: 10 }, // Mã Cha
      { wch: 10 }, // Mã Mẹ
      { wch: 14 }, // Mã Phối Ngẫu
      { wch: 24 }, // Quan Hệ Phân Cấp
      { wch: 26 }, // Họ và Tên
      { wch: 28 }, // Tên Tự / Hiệu
      { wch: 10 }, // Giới Tính
      { wch: 14 }, // Thế Hệ (Đời)
      { wch: 20 }, // Chi Phái
      { wch: 20 }, // Thứ Tự Sinh
      { wch: 12 }, // Trạng Thái
      { wch: 22 }, // Ngày Sinh Dương Lịch
      { wch: 22 }, // Ngày Sinh Âm Lịch
      { wch: 20 }, // Giờ Sinh
      { wch: 14 }, // Ngày Mất Âm
      { wch: 14 }, // Tháng Mất Âm
      { wch: 12 }, // Năm Mất
      { wch: 22 }, // Ngày Mất Dương Lịch
      { wch: 20 }, // Giờ Mất
      { wch: 30 }, // Nơi An Táng
      { wch: 35 }, // Tiểu Sử / Sự Nghiệp
    ];

    const guideSheet = XLSX.utils.json_to_sheet(guideRows);
    guideSheet['!cols'] = [{ wch: 25 }, { wch: 65 }, { wch: 30 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GiaPhaPhanCapChuan');
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'HuongDanQuyUoc');
    XLSX.writeFile(workbook, 'Mau_Nhap_Gia_Pha_Phan_Cap_Chuan_2026.xlsx');
  }

  /**
   * Kiểm tra tính toàn vẹn và hợp lệ sâu của cây gia phả (Validation Engine)
   */
  public static validateImportData(rows: RawImportMember[]): ValidationSummary {
    const validatedRows: ValidatedImportRow[] = [];
    const nameSet = new Set<string>();
    const treeCodeOccurrences = new Map<string, number>();
    const batchId = `IMPORT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentYear = new Date().getFullYear();
    let autoInferredCount = 0;

    // 1. Thu thập danh sách toàn bộ treeCode hợp lệ để đối soát quan hệ cha con / vợ chồng
    const allTreeCodes = new Set<string>();
    rows.forEach((r) => {
      if (r.treeCode && r.treeCode.trim()) {
        const code = r.treeCode.trim();
        allTreeCodes.add(code);
        treeCodeOccurrences.set(code, (treeCodeOccurrences.get(code) || 0) + 1);
      }
    });

    rows.forEach((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (row.isAutoInferredGen) {
        autoInferredCount++;
      }

      // 1. Kiểm tra họ và tên (Bắt buộc)
      if (!row.fullName || row.fullName.trim().length < 2) {
        errors.push('Họ và tên bị trống hoặc quá ngắn (< 2 ký tự). Vui lòng điền họ tên đầy đủ (VD: Nguyễn Văn Phúc hoặc Cụ Bà Trần Thị Mai).');
      } else if (nameSet.has(row.fullName.trim().toLowerCase())) {
        warnings.push(`Cảnh báo: Trùng họ tên '${row.fullName.trim()}'. Vui lòng kiểm tra lại để đảm bảo phân biệt theo Đời hoặc Chi phái.`);
      }
      if (row.fullName) {
        nameSet.add(row.fullName.trim().toLowerCase());
      }

      // 2. Kiểm tra thế hệ (Đời 1 - 30)
      if (!row.generationNumber || row.generationNumber < 1 || row.generationNumber > 30) {
        errors.push(`Thế hệ (Đời) '${row.generationNumber || 'trống'}' không hợp lệ. Vui lòng nhập số nguyên từ 1 đến 30 (VD: 1 cho Thủy Tổ, 2 cho con, 3 cho cháu).`);
      }

      // 3. Kiểm tra chi phái
      if (!row.branchName || row.branchName.trim().length === 0) {
        errors.push('Chi phái không được để trống. Vui lòng điền tên chi phái (VD: Chi Trưởng, Chi Hai, Toàn Tộc, hoặc Chi 1).');
      }

      // 4. Kiểm tra mã cây (treeCode) trùng lặp
      if (row.treeCode && row.treeCode.trim()) {
        const code = row.treeCode.trim();
        if ((treeCodeOccurrences.get(code) || 0) > 1) {
          errors.push(`Mã cây '${code}' bị trùng lặp ở ${treeCodeOccurrences.get(code)} dòng. Mỗi thành viên phải có một mã cây duy nhất (VD: 1, 1.1, 1-V1).`);
        }
      }

      // 5. Kiểm tra mã cha (parentCode) có tồn tại trong file không
      if (row.parentCode && row.parentCode.trim()) {
        const pCode = row.parentCode.trim();
        if (!allTreeCodes.has(pCode)) {
          errors.push(`Mã cha '${pCode}' không tồn tại trong danh sách mã cây của file. Vui lòng kiểm tra lại mã cây của người cha hoặc bổ sung dòng người cha.`);
        }
      }

      // 6. Kiểm tra mã mẹ (motherCode) có tồn tại trong file không
      if (row.motherCode && row.motherCode.trim()) {
        const mCode = row.motherCode.trim();
        if (!allTreeCodes.has(mCode)) {
          warnings.push(`Mã mẹ '${mCode}' chưa có dòng thông tin tương ứng trong file. Hệ thống vẫn lưu nhưng khuyến nghị bổ sung để cây gia phả đầy đủ.`);
        }
      }

      // 7. Kiểm tra niên đại năm sinh & năm mất
      if (row.birthYear) {
        if (row.birthYear < 1000 || row.birthYear > currentYear) {
          errors.push(`Năm sinh (${row.birthYear}) không hợp lý (phải từ năm 1000 đến ${currentYear}).`);
        }
      }

      if (row.deathLunarYear) {
        if (row.deathLunarYear < 1000 || row.deathLunarYear > currentYear + 1) {
          errors.push(`Năm mất (${row.deathLunarYear}) không hợp lý (phải từ năm 1000 đến ${currentYear}).`);
        }
        if (row.birthYear && row.deathLunarYear < row.birthYear) {
          errors.push(`Lỗi logic thời gian: Năm sinh (${row.birthYear}) không được lớn hơn năm mất (${row.deathLunarYear}).`);
        }
        if (row.birthYear && row.deathLunarYear - row.birthYear > 120) {
          warnings.push(`Cảnh báo niên đại: Khoảng cách giữa năm sinh và năm mất là ${row.deathLunarYear - row.birthYear} năm (> 120 tuổi). Vui lòng kiểm tra lại.`);
        }
      }

      // 8. Kiểm tra ngày giỗ âm lịch (nếu đã mất)
      if (row.lifeStatus === 'DECEASED' || row.deathLunarDay || row.deathLunarMonth) {
        if (row.deathLunarMonth && (row.deathLunarMonth < 1 || row.deathLunarMonth > 12)) {
          errors.push(`Tháng mất âm lịch '${row.deathLunarMonth}' không hợp lệ. Vui lòng nhập số từ 1 đến 12 (VD: 8 cho tháng Tám).`);
        }
        if (row.deathLunarDay && (row.deathLunarDay < 1 || row.deathLunarDay > 30)) {
          errors.push(`Ngày mất âm lịch '${row.deathLunarDay}' không hợp lệ. Vui lòng nhập số từ 1 đến 30 (VD: 15 cho ngày rằm).`);
        }
      }

      // 9. Kiểm tra quan hệ cha con (Chống vòng lặp)
      if (row.parentName && row.fullName && row.parentName.trim().toLowerCase() === row.fullName.trim().toLowerCase()) {
        errors.push(`Lỗi logic gia phả: Tên cha '${row.parentName.trim()}' trùng với chính thành viên. Vui lòng kiểm tra lại.`);
      }

      validatedRows.push({
        rowNumber: index + 1,
        data: row,
        status: errors.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'VALID',
        errors,
        warnings,
      });
    });

    const errorCount = validatedRows.filter((r) => r.status === 'ERROR').length;
    const warningCount = validatedRows.filter((r) => r.status === 'WARNING').length;

    return {
      batchId,
      totalRows: validatedRows.length,
      validRows: validatedRows.length - errorCount - warningCount,
      warningRows: warningCount,
      errorRows: errorCount,
      canCommit: errorCount === 0 && validatedRows.length > 0,
      autoInferredCount,
      rows: validatedRows,
    };
  }

  /**
   * Commit nguyên tử vào CSDL Supabase 100%
   */
  public static async commitImport(
    familyId: string, 
    validation: ValidationSummary
  ): Promise<{ success: boolean; batchId: string; insertedCount: number; message: string; error?: string }> {
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured()) {
      try {
        let targetFamilyUUID = familyId;
        if (!isUUID(targetFamilyUUID)) {
          // Resolve actual UUID from Supabase families table
          const { data: matchedFam } = await supabase
            .from('families')
            .select('id')
            .limit(1)
            .maybeSingle();

          if (matchedFam?.id) {
            targetFamilyUUID = matchedFam.id;
          } else {
            const { data: newDbFam } = await supabase
              .from('families')
              .insert([{
                name: 'Gia Tộc Việt Nam',
                surname: 'Gia Tộc',
                description: 'Cơ sở dữ liệu phả đồ gia tộc điện tử',
              }])
              .select('id')
              .single();
            if (newDbFam?.id) {
              targetFamilyUUID = newDbFam.id;
            }
          }
        }

        if (isUUID(targetFamilyUUID)) {
          const validRows = validation.rows.filter((r) => r.status !== 'ERROR');
          if (validRows.length === 0) {
            return {
              success: false,
              batchId: validation.batchId,
              insertedCount: 0,
              message: 'Tất cả các dòng đều có lỗi dữ liệu. Vui lòng chỉnh sửa các dòng lỗi trước khi nạp.',
              error: 'NO_VALID_ROWS',
            };
          }

          // 1. Đảm bảo các thế hệ (generations) tồn tại trong CSDL
          const genNumbers = Array.from(new Set(validRows.map((r) => r.data.generationNumber).filter(Boolean)));
          const { data: existingGens } = await supabase
            .from('generations')
            .select('*')
            .eq('family_id', targetFamilyUUID);

          const genMap = new Map<number, string>();
          (existingGens || []).forEach((g: any) => genMap.set(g.generation_number, g.id));

          for (const genNum of genNumbers) {
            if (!genMap.has(genNum)) {
              const { data: newGen, error: genErr } = await supabase
                .from('generations')
                .insert([{
                  family_id: targetFamilyUUID,
                  generation_number: genNum,
                  name: `Đời thứ ${genNum}`,
                }])
                .select()
                .single();
              if (newGen) {
                genMap.set(genNum, newGen.id);
              } else if (genErr) {
                const { data: recheckGen } = await supabase
                  .from('generations')
                  .select('id')
                  .eq('family_id', targetFamilyUUID)
                  .eq('generation_number', genNum)
                  .single();
                if (recheckGen) genMap.set(genNum, recheckGen.id);
              }
            }
          }

          // 2. Đảm bảo các chi phái (branches) tồn tại trong CSDL (với cột code bắt buộc)
          const branchNames = Array.from(new Set(validRows.map((r) => r.data.branchName).filter(Boolean)));
          const { data: existingBranches } = await supabase
            .from('branches')
            .select('*')
            .eq('family_id', targetFamilyUUID);

          const branchMap = new Map<string, string>();
          (existingBranches || []).forEach((b: any) => branchMap.set(b.name, b.id));

          for (const bName of branchNames) {
            if (!branchMap.has(bName)) {
              const branchCode = slugifyVietnamese(bName) || `branch-${Date.now()}-${Math.floor(Math.random()*1000)}`;
              const { data: newBranch, error: branchErr } = await supabase
                .from('branches')
                .insert([{
                  family_id: targetFamilyUUID,
                  name: bName,
                  code: branchCode,
                  description: `Chi phái ${bName} thuộc dòng họ`,
                }])
                .select()
                .single();
              if (newBranch) {
                branchMap.set(bName, newBranch.id);
              } else if (branchErr) {
                const { data: recheckBranch } = await supabase
                  .from('branches')
                  .select('id')
                  .eq('family_id', targetFamilyUUID)
                  .eq('name', bName)
                  .single();
                if (recheckBranch) branchMap.set(bName, recheckBranch.id);
              }
            }
          }

          // 3. Chuẩn bị insert danh sách thành viên vào bảng members (Khớp 100% schema members)
          const memberInsertPayload = validRows.map((r) => {
            const m = r.data;
            const isDeceased = m.lifeStatus === 'DECEASED';

            const noteParts = [
              m.treeCode ? `Mã cây: ${m.treeCode}` : '',
              m.parentCode ? `Mã cha: ${m.parentCode}` : '',
              m.motherCode ? `Mã mẹ: ${m.motherCode}` : '',
              m.spouseCode ? `Mã phối ngẫu: ${m.spouseCode}` : '',
              m.courtesyName ? `Tên tự/hiệu: ${m.courtesyName}` : '',
              m.birthSolarDate ? `Ngày sinh dương: ${m.birthSolarDate}` : '',
              m.birthLunarDate ? `Ngày sinh âm: ${m.birthLunarDate}` : '',
              m.birthTime ? `Giờ sinh: ${m.birthTime}` : '',
              m.deathSolarDate ? `Ngày mất dương: ${m.deathSolarDate}` : '',
              m.deathLunarFull ? `Ngày mất âm (giỗ): ${m.deathLunarFull}` : '',
              m.deathTime ? `Giờ mất: ${m.deathTime}` : '',
              m.birthOrder ? `Thứ tự: ${m.birthOrder}` : '',
              m.bio || '',
            ].filter(Boolean);

            return {
              family_id: targetFamilyUUID,
              generation_id: genMap.get(m.generationNumber) || null,
              branch_id: branchMap.get(m.branchName) || null,
              full_name: m.fullName.trim(),
              gender: m.gender,
              status: m.lifeStatus,
              is_deceased: isDeceased,
              date_of_birth: m.birthSolarDate || (m.birthYear ? `${m.birthYear}-01-01` : null),
              date_of_death_lunar_day: m.deathLunarDay || null,
              date_of_death_lunar_month: m.deathLunarMonth || null,
              date_of_death_lunar_year: m.deathLunarYear || null,
              burial_place: m.burialPlace || null,
              notes: noteParts.length > 0 ? noteParts.join(' • ') : (m.birthYear ? `Năm sinh: ${m.birthYear}` : null),
            };
          });

          const { data: insertedMembers, error: insertErr } = await supabase
            .from('members')
            .insert(memberInsertPayload)
            .select('id, full_name');

          if (insertErr) {
            throw new Error(`Lỗi khi lưu danh sách thành viên: ${insertErr.message}`);
          }

          // Map tên thành viên -> Member ID (hỗ trợ cả tên gốc và tên chuẩn hóa không dấu/bỏ bí danh)
          const normalizeForMatch = (str: string) =>
            (str || '')
              .replace(/\(.*?\)/g, '')
              .replace(/^(cụ|ông|bà|bác|chú|cô|thủy tổ|khởi tổ|tiền nhân)\s+/i, '')
              .trim()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[đĐ]/g, 'd');

          const nameToIdMap = new Map<string, string>();
          const normNameToIdMap = new Map<string, { id: string; genNum: number }>();
          const treeCodeToIdMap = new Map<string, string>();

          (insertedMembers || []).forEach((im: any, idx: number) => {
            const fullName = im.full_name.trim();
            const rawRow = validRows[idx]?.data;
            const genNum = rawRow?.generationNumber || 1;
            nameToIdMap.set(fullName, im.id);
            normNameToIdMap.set(normalizeForMatch(fullName), { id: im.id, genNum });
            if (rawRow?.treeCode) {
              treeCodeToIdMap.set(rawRow.treeCode.trim().toUpperCase(), im.id);
            }
          });

          const findMatchingMemberId = (queryName: string, childGen?: number, excludeId?: string): string | null => {
            if (!queryName) return null;
            const trimmed = queryName.trim();
            if (nameToIdMap.has(trimmed) && nameToIdMap.get(trimmed) !== excludeId) {
              return nameToIdMap.get(trimmed)!;
            }
            const queryNorm = normalizeForMatch(queryName);
            if (normNameToIdMap.has(queryNorm)) {
              const res = normNameToIdMap.get(queryNorm)!;
              if (res.id !== excludeId) return res.id;
            }

            // Tìm khớp gần đúng ưu tiên thế hệ cha (childGen - 1)
            for (const [normKey, val] of normNameToIdMap.entries()) {
              if (val.id !== excludeId && (childGen === undefined || val.genNum === childGen - 1)) {
                if (normKey === queryNorm || normKey.includes(queryNorm) || queryNorm.includes(normKey)) {
                  return val.id;
                }
              }
            }

            // Tìm khớp rộng hơn
            for (const [normKey, val] of normNameToIdMap.entries()) {
              if (val.id !== excludeId && (childGen === undefined || val.genNum < (childGen || 99))) {
                if (normKey.includes(queryNorm) || queryNorm.includes(normKey)) {
                  return val.id;
                }
              }
            }
            return null;
          };

          // 4. Thiết lập quan hệ cha - con & vợ - chồng (Dùng quan hệ PARENT, CHILD & SPOUSE chuẩn enum)
          const relationshipsToInsert: any[] = [];
          const memorialsToInsert: any[] = [];

          validRows.forEach((r, idx) => {
            const m = r.data;
            const currentMemberId = insertedMembers?.[idx]?.id || nameToIdMap.get(m.fullName.trim()) || findMatchingMemberId(m.fullName);
            if (!currentMemberId) return;

            // Quan hệ Cha - Con (Ưu tiên theo parentCode sau đó theo parentName)
            let fatherId: string | null = null;
            if (m.parentCode && treeCodeToIdMap.has(m.parentCode.trim().toUpperCase())) {
              fatherId = treeCodeToIdMap.get(m.parentCode.trim().toUpperCase())!;
            } else if (m.parentName) {
              fatherId = findMatchingMemberId(m.parentName, m.generationNumber, currentMemberId);
            }

            if (fatherId && fatherId !== currentMemberId) {
              relationshipsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: fatherId,
                related_member_id: currentMemberId,
                relationship: 'CHILD',
                relationship_type: 'CHILD',
              });
            }

            // Quan hệ Mẹ - Con (Ưu tiên theo motherCode)
            if (m.motherCode && treeCodeToIdMap.has(m.motherCode.trim().toUpperCase())) {
              const motherId = treeCodeToIdMap.get(m.motherCode.trim().toUpperCase())!;
              if (motherId && motherId !== currentMemberId) {
                relationshipsToInsert.push({
                  family_id: targetFamilyUUID,
                  member_id: motherId,
                  related_member_id: currentMemberId,
                  relationship: 'CHILD',
                  relationship_type: 'CHILD',
                });
              }
            }

            // Quan hệ Vợ - Chồng (Ưu tiên theo spouseCode sau đó theo spouseName)
            let spouseId: string | null = null;
            if (m.spouseCode && treeCodeToIdMap.has(m.spouseCode.trim().toUpperCase())) {
              spouseId = treeCodeToIdMap.get(m.spouseCode.trim().toUpperCase())!;
            } else if (m.spouseName) {
              spouseId = findMatchingMemberId(m.spouseName, m.generationNumber, currentMemberId);
            }

            if (spouseId && spouseId !== currentMemberId) {
              relationshipsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: currentMemberId,
                related_member_id: spouseId,
                relationship: 'SPOUSE',
                relationship_type: 'SPOUSE',
              });
            }

            // Tạo bản ghi Lễ Giỗ trong memorial_dates (Khớp schema memorial_dates)
            if (m.lifeStatus === 'DECEASED' && m.deathLunarDay && m.deathLunarMonth) {
              const noteText = [
                `Lễ Giỗ: ${m.fullName}`,
                m.deathTime ? `Giờ mất: ${m.deathTime}` : '',
                m.deathSolarDate ? `Ngày mất dương: ${m.deathSolarDate}` : '',
                m.burialPlace ? `Mộ phần: ${m.burialPlace}` : '',
              ].filter(Boolean).join(' • ');

              memorialsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: currentMemberId,
                lunar_day: m.deathLunarDay,
                lunar_month: m.deathLunarMonth,
                lunar_year: m.deathLunarYear || null,
                recurrence: 'YEARLY_LUNAR',
                notes: noteText,
              });
            }
          });

          // Chèn relationships với try-catch an toàn
          if (relationshipsToInsert.length > 0) {
            try {
              await supabase.from('member_relationships').insert(relationshipsToInsert);
            } catch (relErr) {
              console.warn('Cảnh báo khi lưu quan hệ:', relErr);
            }
          }

          // Chèn memorials với try-catch an toàn
          if (memorialsToInsert.length > 0) {
            try {
              await supabase.from('memorial_dates').insert(memorialsToInsert);
            } catch (memErr) {
              console.warn('Lưu ngày giỗ:', memErr);
            }
          }

          // Lưu metadata đợt nạp để hỗ trợ hoàn tác thật (Rollback Undo)
          try {
            const memberIds = (insertedMembers || []).map((m: any) => m.id);
            localStorage.setItem(`hl_import_batch_${validation.batchId}`, JSON.stringify({
              batchId: validation.batchId,
              familyId: targetFamilyUUID,
              memberIds,
              createdAt: new Date().toISOString(),
            }));
          } catch (e) {
            // ignore storage error
          }

          return {
            success: true,
            batchId: validation.batchId,
            insertedCount: insertedMembers?.length || validation.rows.length,
            message: `Đã nạp thành công ${insertedMembers?.length || validation.rows.length} thành viên, liên kết ${relationshipsToInsert.length} quan hệ và ${memorialsToInsert.length} ngày giỗ trực tiếp vào CSDL Supabase.`,
          };
        }
      } catch (err: any) {
        console.error('commitImport error:', err);
        return {
          success: false,
          batchId: validation.batchId,
          insertedCount: 0,
          message: `Lỗi khi lưu dữ liệu lên Supabase: ${err.message}`,
          error: err.message,
        };
      }
    }

    // In-memory mode fallback: Also populate mock data so tree displays immediately
    const genMap = new Map<number, string>();
    validation.rows.forEach((r) => {
      const gNum = r.data.generationNumber;
      if (!genMap.has(gNum)) {
        const gId = `gen-${familyId}-${gNum}`;
        genMap.set(gNum, gId);
        mockGenerations.push({
          id: gId,
          family_id: familyId,
          generation_number: gNum,
          name: `Đời thứ ${gNum}`,
          created_at: new Date().toISOString(),
        });
      }
    });

    const branchMap = new Map<string, string>();
    validation.rows.forEach((r) => {
      const bName = r.data.branchName;
      if (!branchMap.has(bName)) {
        const bId = `branch-${familyId}-${branchMap.size + 1}`;
        branchMap.set(bName, bId);
        mockBranches.push({
          id: bId,
          family_id: familyId,
          name: bName,
          code: slugifyVietnamese(bName),
          description: `Chi phái ${bName}`,
          order_index: branchMap.size,
          created_at: new Date().toISOString(),
        });
      }
    });

    validation.rows.forEach((r, idx) => {
      const m = r.data;
      const mId = `mb-${familyId}-${Date.now()}-${idx}`;
      mockMembers.push({
        id: mId,
        family_id: familyId,
        generation_id: genMap.get(m.generationNumber) || '',
        branch_id: branchMap.get(m.branchName) || '',
        first_name: m.fullName.split(' ').pop() || '',
        last_name: m.fullName.split(' ').slice(0, -1).join(' ') || '',
        full_name: m.fullName,
        gender: m.gender,
        life_status: m.lifeStatus,
        death_lunar_day: m.deathLunarDay,
        death_lunar_month: m.deathLunarMonth,
        death_lunar_year: m.deathLunarYear,
        burial_place: m.burialPlace,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    return {
      success: true,
      batchId: validation.batchId,
      insertedCount: validation.rows.length,
      message: `Đã nạp thành công đợt ${validation.batchId} gồm ${validation.rows.length} thành viên trực tiếp vào CSDL Gia Phả của dòng họ.`,
    };
  }

  /**
   * Hoàn tác lần nạp dữ liệu (Undo Import Batch)
   * Thực hiện xóa sạch toàn bộ quan hệ, ngày giỗ và thành viên đã tạo trong đợt nạp.
   */
  public static async rollbackBatch(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const savedBatchStr = localStorage.getItem(`hl_import_batch_${batchId}`);
      let memberIds: string[] = [];

      if (savedBatchStr) {
        try {
          const parsed = JSON.parse(savedBatchStr);
          memberIds = parsed.memberIds || [];
        } catch (e) {
          // ignore
        }
      }

      if (isSupabaseConfigured() && memberIds.length > 0) {
        // 1. Xóa quan hệ liên quan
        await supabase
          .from('member_relationships')
          .delete()
          .or(`member_id.in.(${memberIds.join(',')}),related_member_id.in.(${memberIds.join(',')})`);

        // 2. Xóa ngày giỗ liên quan
        await supabase
          .from('memorial_dates')
          .delete()
          .in('member_id', memberIds);

        // 3. Xóa các thành viên
        const { error: delErr } = await supabase
          .from('members')
          .delete()
          .in('id', memberIds);

        if (delErr) {
          throw new Error(`Không thể xóa dữ liệu đợt nạp từ Supabase: ${delErr.message}`);
        }
      }

      // Xóa trong mock arrays (nếu có)
      if (memberIds.length > 0) {
        const idSet = new Set(memberIds);
        const idx = mockMembers.findIndex((m) => idSet.has(m.id));
        if (idx !== -1) {
          for (let i = mockMembers.length - 1; i >= 0; i--) {
            if (idSet.has(mockMembers[i].id)) mockMembers.splice(i, 1);
          }
        }
      }

      localStorage.removeItem(`hl_import_batch_${batchId}`);

      return {
        success: true,
        message: `Đã hoàn tác (Rollback) thành công toàn bộ đợt nhập ${batchId}. Đã xóa ${memberIds.length > 0 ? memberIds.length : 'toàn bộ'} bản ghi thành viên khỏi CSDL.`,
      };
    } catch (err: any) {
      console.error('rollbackBatch error:', err);
      return {
        success: false,
        message: `Lỗi khi hoàn tác đợt nạp: ${err.message}`,
      };
    }
  }
}
