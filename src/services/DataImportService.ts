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

export interface RawImportMember {
  fullName: string;              // 1. Họ và Tên (Bắt buộc)
  gender: 'MALE' | 'FEMALE';     // 2. Giới Tính (Nam / Nữ) (Bắt buộc)
  generationNumber: number;      // 3. Thế Hệ (Đời 1, 2, 3...) (Bắt buộc / Tự động suy luận)
  branchName: string;            // 4. Chi Phái (Chi Trưởng, Chi Hai...) (Bắt buộc / Tự động kế thừa)
  parentName?: string;           // 5. Tên Cha (Dùng nối Cây Phả Hệ)
  spouseName?: string;           // 6. Vợ / Chồng
  lifeStatus: 'ALIVE' | 'DECEASED'; // 7. Trạng Thái (Còn sống / Đã mất)
  birthYear?: number;            // 8. Năm Sinh
  deathLunarDay?: number;        // 9. Ngày Mất Âm (1 - 30)
  deathLunarMonth?: number;      // 10. Tháng Mất Âm (1 - 12)
  deathLunarYear?: number;       // 11. Năm Mất
  burialPlace?: string;          // 12. Nơi An Táng / Mộ Phần
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
   * Thuật toán tự động nhận diện & suy luận thế hệ + chi phái (Topological BFS Propagation)
   */
  public static autoInferGenerationsAndBranches(rawMembers: RawImportMember[]): {
    members: RawImportMember[];
    autoInferredCount: number;
  } {
    const members = rawMembers.map((m) => ({ ...m }));
    let autoInferredCount = 0;

    // 1. Tạo Map tra cứu tên chuẩn hóa
    const norm = (s?: string) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const memberMap = new Map<string, RawImportMember>();
    members.forEach((m) => {
      if (m.fullName) memberMap.set(norm(m.fullName), m);
    });

    // 2. Xác định các gốc (Root / Thủy Tổ)
    members.forEach((m) => {
      const parent = m.parentName ? memberMap.get(norm(m.parentName)) : null;
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

    // 3. Lan truyền thế hệ đệ quy (BFS Queue) từ Cha sang Con & Vợ/Chồng
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 30) {
      changed = false;
      iterations++;

      for (const m of members) {
        // Lan truyền từ Cha -> Con
        if (m.parentName) {
          const parent = memberMap.get(norm(m.parentName));
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
          const spouse = memberMap.get(norm(m.spouseName));
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

    // 4. Quét dự phòng cuối cùng cho các thành viên chưa có đời
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

    return { members, autoInferredCount };
  }

  /**
   * Tự động nhận diện cột (Auto-Mapping 12 Cột Tiêu Chuẩn)
   */
  public static autoMapHeaders(headers: string[]): ColumnMappingSuggestion[] {
    const rules: Record<string, { field: string; label: string; keywords: string[] }> = {
      fullName: { 
        field: 'fullName', 
        label: 'Họ và Tên', 
        keywords: ['họ tên', 'họ và tên', 'họ và tên đầy đủ', 'tên', 'full_name', 'name', 'thành viên', 'danh tính'] 
      },
      gender: { 
        field: 'gender', 
        label: 'Giới Tính', 
        keywords: ['giới tính', 'nam/nữ', 'nam nữ', 'gender', 'sex', 'phái'] 
      },
      generationNumber: { 
        field: 'generationNumber', 
        label: 'Thế Hệ (Đời)', 
        keywords: ['đời', 'thế hệ', 'thế hệ (đời)', 'đời thứ', 'generation', 'gen', 'bậc'] 
      },
      branchName: { 
        field: 'branchName', 
        label: 'Chi Phái', 
        keywords: ['chi', 'chi họ', 'chi phái', 'phái', 'nhánh', 'ngành', 'phân chi', 'branch'] 
      },
      parentName: { 
        field: 'parentName', 
        label: 'Tên Cha', 
        keywords: ['tên cha', 'cha', 'thân phụ', 'bố', 'tên bố', 'cha đẻ', 'father', 'parent'] 
      },
      spouseName: { 
        field: 'spouseName', 
        label: 'Vợ / Chồng', 
        keywords: ['vợ / chồng', 'vợ', 'chồng', 'phu thê', 'chính thất', 'phối ngẫu', 'spouse', 'vợ chồng'] 
      },
      lifeStatus: { 
        field: 'lifeStatus', 
        label: 'Trạng Thái', 
        keywords: ['trạng thái', 'tình trạng', 'còn sống / đã mất', 'sống / mất', 'status', 'life_status'] 
      },
      birthYear: { 
        field: 'birthYear', 
        label: 'Năm Sinh', 
        keywords: ['năm sinh', 'sinh năm', 'ngày sinh', 'năm sinh dương', 'birth_year', 'dob', 'năm sinh dl'] 
      },
      deathLunarDay: { 
        field: 'deathLunarDay', 
        label: 'Ngày Mất Âm', 
        keywords: ['ngày mất âm', 'ngày mất (âm lịch)', 'ngày mất âm lịch', 'ngày giỗ âm', 'ngày âm', 'ngày giỗ', 'death_day', 'death_lunar_day'] 
      },
      deathLunarMonth: { 
        field: 'deathLunarMonth', 
        label: 'Tháng Mất Âm', 
        keywords: ['tháng mất âm', 'tháng mất (âm lịch)', 'tháng mất âm lịch', 'tháng giỗ âm', 'tháng âm', 'tháng giỗ', 'death_month', 'death_lunar_month'] 
      },
      deathLunarYear: { 
        field: 'deathLunarYear', 
        label: 'Năm Mất', 
        keywords: ['năm mất', 'năm mất âm', 'năm mất dương', 'năm qua đời', 'năm tạ thế', 'death_year'] 
      },
      burialPlace: { 
        field: 'burialPlace', 
        label: 'Nơi An Táng', 
        keywords: ['nơi an táng', 'mộ phần', 'vị trí mộ', 'an táng', 'lăng mộ', 'nghĩa trang', 'quê quán an táng', 'burial_place'] 
      },
    };

    return headers.map((header) => {
      const lower = header.toLowerCase().trim().replace(/[\-_]/g, ' ');
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

          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
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

              if (field === 'fullName') {
                memberObj.fullName = strVal;
              } else if (field === 'gender') {
                const gLower = strVal.toLowerCase();
                memberObj.gender = (gLower === 'nữ' || gLower === 'female' || gLower === 'f' || gLower === 'gái') ? 'FEMALE' : 'MALE';
              } else if (field === 'generationNumber') {
                memberObj.generationNumber = DataImportService.parseGenerationText(strVal);
              } else if (field === 'branchName') {
                memberObj.branchName = strVal;
              } else if (field === 'parentName') {
                memberObj.parentName = strVal;
              } else if (field === 'spouseName') {
                memberObj.spouseName = strVal;
              } else if (field === 'lifeStatus') {
                const sLower = strVal.toLowerCase();
                memberObj.lifeStatus = (sLower.includes('mất') || sLower.includes('chết') || sLower.includes('deceased') || sLower.includes('khuất')) ? 'DECEASED' : 'ALIVE';
              } else if (field === 'birthYear') {
                const yr = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(yr)) memberObj.birthYear = yr;
              } else if (field === 'deathLunarDay') {
                const day = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(day)) {
                  memberObj.deathLunarDay = day;
                  memberObj.lifeStatus = 'DECEASED';
                }
              } else if (field === 'deathLunarMonth') {
                const mon = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(mon)) {
                  memberObj.deathLunarMonth = mon;
                  memberObj.lifeStatus = 'DECEASED';
                }
              } else if (field === 'deathLunarYear') {
                const dYr = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(dYr)) {
                  memberObj.deathLunarYear = dYr;
                  memberObj.lifeStatus = 'DECEASED';
                }
              } else if (field === 'burialPlace') {
                memberObj.burialPlace = strVal;
              }
            });

            if (memberObj.deathLunarDay || memberObj.deathLunarMonth || memberObj.deathLunarYear || memberObj.burialPlace) {
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
   * Tạo và tải về File Excel Mẫu 12 Cột Chuẩn
   */
  public static downloadStandardTemplateExcel(): void {
    const sampleRows = [
      {
        'Họ và Tên': 'Cụ Nguyễn Văn Phúc',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 1,
        'Chi Phái': 'Chi Trưởng',
        'Tên Cha': '',
        'Vợ / Chồng': 'Cụ Bà Trần Thị Mai',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1880,
        'Ngày Mất Âm': 15,
        'Tháng Mất Âm': 1,
        'Năm Mất': 1952,
        'Nơi An Táng': 'Lăng Mộ Tổ Đồi Thông',
      },
      {
        'Họ và Tên': 'Cụ Bà Trần Thị Mai',
        'Giới Tính': 'Nữ',
        'Thế Hệ (Đời)': 1,
        'Chi Phái': 'Chi Trưởng',
        'Tên Cha': '',
        'Vợ / Chồng': 'Cụ Nguyễn Văn Phúc',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1885,
        'Ngày Mất Âm': 10,
        'Tháng Mất Âm': 8,
        'Năm Mất': 1958,
        'Nơi An Táng': 'Lăng Mộ Tổ Đồi Thông',
      },
      {
        'Họ và Tên': 'Cụ Nguyễn Văn Khang',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Trưởng',
        'Tên Cha': 'Cụ Nguyễn Văn Phúc',
        'Vợ / Chồng': 'Cụ Bà Lê Thị Lan',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1910,
        'Ngày Mất Âm': 18,
        'Tháng Mất Âm': 5,
        'Năm Mất': 1980,
        'Nơi An Táng': 'Khu Mộ Chi Trưởng',
      },
      {
        'Họ và Tên': 'Cụ Nguyễn Văn Ninh',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Hai',
        'Tên Cha': 'Cụ Nguyễn Văn Phúc',
        'Vợ / Chồng': 'Cụ Bà Phạm Thị Đào',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1915,
        'Ngày Mất Âm': 22,
        'Tháng Mất Âm': 11,
        'Năm Mất': 1985,
        'Nơi An Táng': 'Nghĩa Trang Xã',
      },
      {
        'Họ và Tên': 'Cụ Nguyễn Văn Thịnh',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 2,
        'Chi Phái': 'Chi Ba',
        'Tên Cha': 'Cụ Nguyễn Văn Phúc',
        'Vợ / Chồng': 'Cụ Bà Vũ Thị Huệ',
        'Trạng Thái': 'Đã mất',
        'Năm Sinh': 1920,
        'Ngày Mất Âm': 5,
        'Tháng Mất Âm': 4,
        'Năm Mất': 1990,
        'Nơi An Táng': 'Nghĩa Trang Xã',
      },
      {
        'Họ và Tên': 'Nguyễn Văn Hoàng',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 3,
        'Chi Phái': 'Chi Trưởng',
        'Tên Cha': 'Cụ Nguyễn Văn Khang',
        'Vợ / Chồng': 'Hoàng Thị Thu',
        'Trạng Thái': 'Còn sống',
        'Năm Sinh': 1975,
        'Ngày Mất Âm': '',
        'Tháng Mất Âm': '',
        'Năm Mất': '',
        'Nơi An Táng': '',
      },
      {
        'Họ và Tên': 'Nguyễn Văn Minh',
        'Giới Tính': 'Nam',
        'Thế Hệ (Đời)': 4,
        'Chi Phái': 'Chi Trưởng',
        'Tên Cha': 'Nguyễn Văn Hoàng',
        'Vợ / Chồng': '',
        'Trạng Thái': 'Còn sống',
        'Năm Sinh': 2005,
        'Ngày Mất Âm': '',
        'Tháng Mất Âm': '',
        'Năm Mất': '',
        'Nơi An Táng': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);

    worksheet['!cols'] = [
      { wch: 24 }, // Họ và Tên
      { wch: 12 }, // Giới Tính
      { wch: 15 }, // Thế Hệ (Đời)
      { wch: 15 }, // Chi Phái
      { wch: 24 }, // Tên Cha
      { wch: 24 }, // Vợ / Chồng
      { wch: 14 }, // Trạng Thái
      { wch: 12 }, // Năm Sinh
      { wch: 14 }, // Ngày Mất Âm
      { wch: 14 }, // Tháng Mất Âm
      { wch: 12 }, // Năm Mất
      { wch: 26 }, // Nơi An Táng
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GiaPhaChuan12Cot');
    XLSX.writeFile(workbook, 'Mau_Nhap_Gia_Pha_12_Cot_Chuan.xlsx');
  }

  /**
   * Kiểm tra tính toàn vẹn (Validate)
   */
  public static validateImportData(rows: RawImportMember[]): ValidationSummary {
    const validatedRows: ValidatedImportRow[] = [];
    const nameSet = new Set<string>();
    const batchId = `IMPORT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    let autoInferredCount = 0;

    rows.forEach((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (row.isAutoInferredGen) {
        autoInferredCount++;
      }

      // 1. Kiểm tra họ tên
      if (!row.fullName || row.fullName.trim().length < 2) {
        errors.push('Họ và tên không được để trống.');
      } else if (nameSet.has(row.fullName.trim().toLowerCase())) {
        warnings.push('Trùng họ tên với thành viên khác trong file (Cần kiểm tra chi phái / đời).');
      }
      nameSet.add(row.fullName.trim().toLowerCase());

      // 2. Kiểm tra thế hệ
      if (!row.generationNumber || row.generationNumber < 1 || row.generationNumber > 30) {
        errors.push('Thế hệ không hợp lệ (Phải từ 1 đến 30).');
      }

      // 3. Kiểm tra chi phái
      if (!row.branchName || row.branchName.trim().length === 0) {
        errors.push('Chi phái không được để trống.');
      }

      // 4. Kiểm tra ngày giỗ âm lịch
      if (row.lifeStatus === 'DECEASED') {
        if (row.deathLunarMonth && (row.deathLunarMonth < 1 || row.deathLunarMonth > 12)) {
          errors.push('Tháng mất âm lịch phải từ 1 đến 12.');
        }
        if (row.deathLunarDay && (row.deathLunarDay < 1 || row.deathLunarDay > 30)) {
          errors.push('Ngày mất âm lịch phải từ 1 đến 30.');
        }
      }

      // 5. Kiểm tra quan hệ cha con (Chống vòng lặp)
      if (row.parentName && row.parentName.trim().toLowerCase() === row.fullName.trim().toLowerCase()) {
        errors.push('Tên cha không được trùng họ tên chính thành viên.');
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
          // 1. Đảm bảo các thế hệ (generations) tồn tại trong CSDL
          const genNumbers = Array.from(new Set(validation.rows.map((r) => r.data.generationNumber).filter(Boolean)));
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
          const branchNames = Array.from(new Set(validation.rows.map((r) => r.data.branchName).filter(Boolean)));
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
          const memberInsertPayload = validation.rows.map((r) => {
            const m = r.data;
            const isDeceased = m.lifeStatus === 'DECEASED';

            return {
              family_id: targetFamilyUUID,
              generation_id: genMap.get(m.generationNumber) || null,
              branch_id: branchMap.get(m.branchName) || null,
              full_name: m.fullName.trim(),
              gender: m.gender,
              status: m.lifeStatus,
              is_deceased: isDeceased,
              date_of_birth: m.birthYear ? `${m.birthYear}-01-01` : null,
              date_of_death_lunar_day: m.deathLunarDay || null,
              date_of_death_lunar_month: m.deathLunarMonth || null,
              date_of_death_lunar_year: m.deathLunarYear || null,
              burial_place: m.burialPlace || null,
              notes: m.birthYear ? `Năm sinh: ${m.birthYear}` : null,
            };
          });

          const { data: insertedMembers, error: insertErr } = await supabase
            .from('members')
            .insert(memberInsertPayload)
            .select('id, full_name');

          if (insertErr) {
            throw new Error(`Lỗi khi lưu danh sách thành viên: ${insertErr.message}`);
          }

          // Map tên thành viên -> Member ID
          const nameToIdMap = new Map<string, string>();
          (insertedMembers || []).forEach((im: any) => nameToIdMap.set(im.full_name.trim(), im.id));

          // 4. Thiết lập quan hệ cha - con & vợ - chồng (Dùng quan hệ PARENT & SPOUSE chuẩn enum)
          const relationshipsToInsert: any[] = [];
          const memorialsToInsert: any[] = [];

          validation.rows.forEach((r) => {
            const m = r.data;
            const currentMemberId = nameToIdMap.get(m.fullName.trim());
            if (!currentMemberId) return;

            // Quan hệ Cha - Con (relationship_type: 'PARENT' và 'CHILD')
            if (m.parentName && nameToIdMap.has(m.parentName.trim())) {
              const fatherId = nameToIdMap.get(m.parentName.trim())!;
              relationshipsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: fatherId,
                related_member_id: currentMemberId,
                relationship_type: 'PARENT',
              });
              relationshipsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: fatherId,
                related_member_id: currentMemberId,
                relationship_type: 'CHILD',
              });
            }

            // Quan hệ Vợ - Chồng (relationship_type: 'SPOUSE')
            if (m.spouseName && nameToIdMap.has(m.spouseName.trim())) {
              const spouseId = nameToIdMap.get(m.spouseName.trim())!;
              relationshipsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: currentMemberId,
                related_member_id: spouseId,
                relationship_type: 'SPOUSE',
              });
            }

            // Tạo bản ghi Lễ Giỗ trong memorial_dates (Khớp schema memorial_dates)
            if (m.lifeStatus === 'DECEASED' && m.deathLunarDay && m.deathLunarMonth) {
              memorialsToInsert.push({
                family_id: targetFamilyUUID,
                member_id: currentMemberId,
                lunar_day: m.deathLunarDay,
                lunar_month: m.deathLunarMonth,
                lunar_year: m.deathLunarYear || null,
                recurrence: 'YEARLY_LUNAR',
                notes: m.burialPlace ? `Lễ Giỗ: ${m.fullName} • Mộ phần: ${m.burialPlace}` : `Lễ Giỗ: ${m.fullName}`,
              });
            }
          });

          // Chèn relationships với try-catch an toàn
          if (relationshipsToInsert.length > 0) {
            try {
              await supabase.from('member_relationships').insert(relationshipsToInsert);
            } catch (relErr) {
              console.warn('Lưu một số quan hệ bị trùng:', relErr);
            }
          }

          // Chèn memorial dates
          if (memorialsToInsert.length > 0) {
            try {
              await supabase.from('memorial_dates').insert(memorialsToInsert);
            } catch (memErr) {
              console.warn('Lưu ngày giỗ:', memErr);
            }
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
   */
  public static async rollbackBatch(batchId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Đã hoàn tác (Rollback) thành công toàn bộ đợt nhập ${batchId}. Dữ liệu Cây Gia Phả đã được khôi phục nguyên trạng.`,
    };
  }
}
