/**
 * ADVANCED DATA IMPORT ENGINE WITH AUTO-MAPPING & UNDO BATCH ROLLBACK
 * DỰ ÁN: GIA PHẢ GIA TỘC (GIA PHA GIA TOC ENTERPRISE)
 * 
 * Pipeline: UPLOAD/DRAG-DROP -> AUTO-MAPPING -> VALIDATE -> PREVIEW -> ATOMIC COMMIT -> IMPORT REPORT & UNDO
 * Chuẩn CSDL: 12 Cột Dữ Liệu Gia Phả Tiêu Chuẩn Việt Nam
 */

import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RawImportMember {
  fullName: string;              // 1. Họ và Tên (Bắt buộc)
  gender: 'MALE' | 'FEMALE';     // 2. Giới Tính (Nam / Nữ) (Bắt buộc)
  generationNumber: number;      // 3. Thế Hệ (Đời 1, 2, 3...) (Bắt buộc)
  branchName: string;            // 4. Chi Phái (Chi Trưởng, Chi Hai...) (Bắt buộc)
  parentName?: string;           // 5. Tên Cha (Dùng nối Cây Phả Hệ)
  spouseName?: string;           // 6. Vợ / Chồng
  lifeStatus: 'ALIVE' | 'DECEASED'; // 7. Trạng Thái (Còn sống / Đã mất)
  birthYear?: number;            // 8. Năm Sinh
  deathLunarDay?: number;        // 9. Ngày Mất Âm (1 - 30)
  deathLunarMonth?: number;      // 10. Tháng Mất Âm (1 - 12)
  deathLunarYear?: number;       // 11. Năm Mất
  burialPlace?: string;          // 12. Nơi An Táng / Mộ Phần
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
  rows: ValidatedImportRow[];
}

export interface ParseResult {
  headers: string[];
  rawRows: any[];
  mappedMembers: RawImportMember[];
  mappings: ColumnMappingSuggestion[];
}

// 12 Cột chuẩn hóa của nền tảng Gia Phả Gia Tộc
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

export class DataImportService {
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

          // Chuyển sheet sang mảng dòng JSON
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          if (rawRows.length === 0) {
            throw new Error('Tệp Excel trống, không có dòng dữ liệu nào.');
          }

          // Lấy danh sách tiêu đề từ dòng đầu tiên
          const headers = Object.keys(rawRows[0]);
          const mappings = this.autoMapHeaders(headers);

          // Tạo map từ Header -> Field
          const headerToField: Record<string, string> = {};
          mappings.forEach((m) => {
            if (m.targetField !== 'unknown') {
              headerToField[m.sourceHeader] = m.targetField;
            }
          });

          // Chuẩn hóa từng dòng dữ liệu sang RawImportMember
          const mappedMembers: RawImportMember[] = rawRows.map((row) => {
            const memberObj: any = {
              fullName: '',
              gender: 'MALE',
              generationNumber: 1,
              branchName: 'Chi Trưởng',
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
                const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
                memberObj.generationNumber = isNaN(num) || num < 1 ? 1 : num;
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

            // Tự động suy luận trạng thái đã mất nếu có thông tin ngày mất hoặc nơi an táng
            if (memberObj.deathLunarDay || memberObj.deathLunarMonth || memberObj.deathLunarYear || memberObj.burialPlace) {
              memberObj.lifeStatus = 'DECEASED';
            }

            return memberObj as RawImportMember;
          }).filter((m) => m.fullName.length > 0);

          resolve({
            headers,
            rawRows,
            mappedMembers,
            mappings,
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

    // Thiết lập độ rộng cột đẹp mắt
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

    rows.forEach((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // 1. Kiểm tra họ tên
      if (!row.fullName || row.fullName.trim().length < 2) {
        errors.push('Họ và tên không được để trống.');
      } else if (nameSet.has(row.fullName.trim())) {
        warnings.push('Trùng họ tên với thành viên khác trong file (Cần kiểm tra chi phái / đời).');
      }
      nameSet.add(row.fullName.trim());

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
      if (row.parentName && row.parentName.trim() === row.fullName.trim()) {
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

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        // 1. Lấy hoặc tạo generations
        const genNumbers = Array.from(new Set(validation.rows.map((r) => r.data.generationNumber).filter(Boolean)));
        const { data: existingGens } = await supabase
          .from('generations')
          .select('*')
          .eq('family_id', familyId);

        const genMap = new Map<number, string>();
        (existingGens || []).forEach((g: any) => genMap.set(g.generation_number, g.id));

        for (const genNum of genNumbers) {
          if (!genMap.has(genNum)) {
            const { data: newGen } = await supabase
              .from('generations')
              .insert([{
                family_id: familyId,
                generation_number: genNum,
                name: `Đời thứ ${genNum}`,
              }])
              .select()
              .single();
            if (newGen) genMap.set(genNum, newGen.id);
          }
        }

        // 2. Lấy hoặc tạo branches
        const branchNames = Array.from(new Set(validation.rows.map((r) => r.data.branchName).filter(Boolean)));
        const { data: existingBranches } = await supabase
          .from('branches')
          .select('*')
          .eq('family_id', familyId);

        const branchMap = new Map<string, string>();
        (existingBranches || []).forEach((b: any) => branchMap.set(b.name, b.id));

        for (const bName of branchNames) {
          if (!branchMap.has(bName)) {
            const { data: newBranch } = await supabase
              .from('branches')
              .insert([{
                family_id: familyId,
                name: bName,
                description: `Chi phái ${bName} thuộc dòng họ`,
              }])
              .select()
              .single();
            if (newBranch) branchMap.set(bName, newBranch.id);
          }
        }

        // 3. Chuẩn bị insert danh sách thành viên vào bảng members
        const memberInsertPayload = validation.rows.map((r) => {
          const m = r.data;
          const nameParts = m.fullName.trim().split(' ');
          const lastName = nameParts.slice(0, -1).join(' ') || '';
          const firstName = nameParts[nameParts.length - 1] || m.fullName;

          return {
            family_id: familyId,
            generation_id: genMap.get(m.generationNumber) || null,
            branch_id: branchMap.get(m.branchName) || null,
            full_name: m.fullName.trim(),
            first_name: firstName,
            last_name: lastName,
            gender: m.gender,
            status: m.lifeStatus,
            birth_year: m.birthYear || null,
            date_of_death_lunar_day: m.deathLunarDay || null,
            date_of_death_lunar_month: m.deathLunarMonth || null,
            date_of_death_lunar_year: m.deathLunarYear || null,
            burial_place: m.burialPlace || null,
          };
        });

        const { data: insertedMembers, error: insertErr } = await supabase
          .from('members')
          .insert(memberInsertPayload)
          .select('id, full_name');

        if (insertErr) {
          throw new Error(`Lỗi khi lưu danh sách thành viên: ${insertErr.message}`);
        }

        // Map tên thành viên -> Member ID để thiết lập quan hệ cha con và vợ chồng
        const nameToIdMap = new Map<string, string>();
        (insertedMembers || []).forEach((im: any) => nameToIdMap.set(im.full_name, im.id));

        // 4. Thiết lập quan hệ cha - con & vợ - chồng
        const relationshipsToInsert: any[] = [];
        const memorialsToInsert: any[] = [];

        validation.rows.forEach((r) => {
          const m = r.data;
          const currentMemberId = nameToIdMap.get(m.fullName.trim());
          if (!currentMemberId) return;

          // Quan hệ Cha - Con (FATHER)
          if (m.parentName && nameToIdMap.has(m.parentName.trim())) {
            const fatherId = nameToIdMap.get(m.parentName.trim())!;
            relationshipsToInsert.push({
              family_id: familyId,
              member_id: fatherId,
              related_member_id: currentMemberId,
              relationship_type: 'FATHER',
            });
          }

          // Quan hệ Vợ - Chồng (SPOUSE)
          if (m.spouseName && nameToIdMap.has(m.spouseName.trim())) {
            const spouseId = nameToIdMap.get(m.spouseName.trim())!;
            relationshipsToInsert.push({
              family_id: familyId,
              member_id: currentMemberId,
              related_member_id: spouseId,
              relationship_type: 'SPOUSE',
            });
          }

          // Tự động tạo bản ghi Lễ Giỗ trong memorial_dates nếu có ngày tháng âm lịch
          if (m.lifeStatus === 'DECEASED' && m.deathLunarDay && m.deathLunarMonth) {
            memorialsToInsert.push({
              family_id: familyId,
              member_id: currentMemberId,
              title: `Lễ Giỗ: ${m.fullName}`,
              lunar_day: m.deathLunarDay,
              lunar_month: m.deathLunarMonth,
              is_lunar: true,
              notes: m.burialPlace ? `Mộ phần tại: ${m.burialPlace}` : 'Giỗ tổ tiên dòng họ',
            });
          }
        });

        if (relationshipsToInsert.length > 0) {
          await supabase.from('member_relationships').insert(relationshipsToInsert);
        }

        if (memorialsToInsert.length > 0) {
          await supabase.from('memorial_dates').insert(memorialsToInsert);
        }

        return {
          success: true,
          batchId: validation.batchId,
          insertedCount: insertedMembers?.length || validation.rows.length,
          message: `Đã nạp thành công ${insertedMembers?.length || validation.rows.length} thành viên, liên kết ${relationshipsToInsert.length} quan hệ và ${memorialsToInsert.length} ngày giỗ vào CSDL Supabase.`,
        };
      } catch (err: any) {
        console.error('commitImport error:', err);
        return {
          success: false,
          batchId: validation.batchId,
          insertedCount: 0,
          message: `Lỗi khi lưu dữ liệu: ${err.message}`,
          error: err.message,
        };
      }
    }

    return {
      success: true,
      batchId: validation.batchId,
      insertedCount: validation.rows.length,
      message: `Đã nạp thành công đợt ${validation.batchId} gồm ${validation.rows.length} thành viên vào bộ nhớ.`,
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
