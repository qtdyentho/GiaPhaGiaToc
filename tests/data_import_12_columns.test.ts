import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  DataImportService, 
  STANDARD_GENEALOGY_COLUMNS,
  RawImportMember 
} from '../src/services/DataImportService';

test('12-COLUMN EXCEL GENEALOGY IMPORT & GENERATION AUTO-INFERENCE TEST SUITE', async (t) => {

  await t.test('IMPORT-001: 12 Standard Columns Definition & Integrity', () => {
    assert.strictEqual(STANDARD_GENEALOGY_COLUMNS.length, 12, 'Must have exactly 12 standard columns');
    const fields = STANDARD_GENEALOGY_COLUMNS.map(c => c.field);
    assert.ok(fields.includes('fullName'));
    assert.ok(fields.includes('gender'));
    assert.ok(fields.includes('generationNumber'));
    assert.ok(fields.includes('branchName'));
    assert.ok(fields.includes('parentName'));
    assert.ok(fields.includes('spouseName'));
    assert.ok(fields.includes('lifeStatus'));
    assert.ok(fields.includes('birthYear'));
    assert.ok(fields.includes('deathLunarDay'));
    assert.ok(fields.includes('deathLunarMonth'));
    assert.ok(fields.includes('deathLunarYear'));
    assert.ok(fields.includes('burialPlace'));
    console.log('✅ [IMPORT-001: 12 Standard Columns Definition] PASS');
  });

  await t.test('IMPORT-002: Auto-Mapping Vietnamese Headers with Accents & Variations', () => {
    const inputHeaders = [
      'Họ và Tên',
      'Giới Tính',
      'Thế Hệ (Đời)',
      'Chi Phái',
      'Tên Cha',
      'Vợ / Chồng',
      'Trạng Thái',
      'Năm Sinh',
      'Ngày Mất Âm',
      'Tháng Mất Âm',
      'Năm Mất',
      'Nơi An Táng'
    ];

    const mappings = DataImportService.autoMapHeaders(inputHeaders);
    assert.strictEqual(mappings.length, 12);
    
    assert.strictEqual(mappings[0].targetField, 'fullName');
    assert.strictEqual(mappings[1].targetField, 'gender');
    assert.strictEqual(mappings[2].targetField, 'generationNumber');
    assert.strictEqual(mappings[3].targetField, 'branchName');
    assert.strictEqual(mappings[4].targetField, 'parentName');
    assert.strictEqual(mappings[5].targetField, 'spouseName');
    assert.strictEqual(mappings[6].targetField, 'lifeStatus');
    assert.strictEqual(mappings[7].targetField, 'birthYear');
    assert.strictEqual(mappings[8].targetField, 'deathLunarDay');
    assert.strictEqual(mappings[9].targetField, 'deathLunarMonth');
    assert.strictEqual(mappings[10].targetField, 'deathLunarYear');
    assert.strictEqual(mappings[11].targetField, 'burialPlace');
    console.log('✅ [IMPORT-002: Auto-Mapping Vietnamese Headers] PASS');
  });

  await t.test('IMPORT-003: Multi-Format Text Generation Parser (Roman, Words, Ordinals)', () => {
    assert.strictEqual(DataImportService.parseGenerationText('I'), 1);
    assert.strictEqual(DataImportService.parseGenerationText('II'), 2);
    assert.strictEqual(DataImportService.parseGenerationText('IV'), 4);
    assert.strictEqual(DataImportService.parseGenerationText('V'), 5);
    assert.strictEqual(DataImportService.parseGenerationText('X'), 10);
    assert.strictEqual(DataImportService.parseGenerationText('Thủy tổ'), 1);
    assert.strictEqual(DataImportService.parseGenerationText('Cụ tổ'), 1);
    assert.strictEqual(DataImportService.parseGenerationText('Đời thứ nhất'), 1);
    assert.strictEqual(DataImportService.parseGenerationText('Đời thứ 3'), 3);
    assert.strictEqual(DataImportService.parseGenerationText('Thế hệ 4'), 4);
    assert.strictEqual(DataImportService.parseGenerationText('F2'), 2);
    assert.strictEqual(DataImportService.parseGenerationText('Gen 5'), 5);
    console.log('✅ [IMPORT-003: Multi-Format Text Generation Parser] PASS');
  });

  await t.test('IMPORT-004: Topological Generation Auto-Inference from Parent & Spouse Links', () => {
    // Unfilled generations: only names and parent links provided
    const unassignedRows: RawImportMember[] = [
      {
        fullName: 'Cụ Nguyễn Văn Phúc',
        gender: 'MALE',
        generationNumber: 0, // Not provided
        branchName: '',
        lifeStatus: 'DECEASED'
      },
      {
        fullName: 'Cụ Bà Trần Thị Mai',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        spouseName: 'Cụ Nguyễn Văn Phúc',
        lifeStatus: 'DECEASED'
      },
      {
        fullName: 'Nguyễn Văn Khang',
        gender: 'MALE',
        generationNumber: 0,
        branchName: '',
        parentName: 'Cụ Nguyễn Văn Phúc',
        lifeStatus: 'DECEASED'
      },
      {
        fullName: 'Nguyễn Văn Hoàng',
        gender: 'MALE',
        generationNumber: 0,
        branchName: '',
        parentName: 'Nguyễn Văn Khang',
        lifeStatus: 'ALIVE'
      },
      {
        fullName: 'Nguyễn Văn Minh',
        gender: 'MALE',
        generationNumber: 0,
        branchName: '',
        parentName: 'Nguyễn Văn Hoàng',
        lifeStatus: 'ALIVE'
      }
    ];

    const { members: inferred, autoInferredCount } = DataImportService.autoInferGenerationsAndBranches(unassignedRows);
    assert.strictEqual(autoInferredCount, 5, 'All 5 members should have their generation auto-inferred');
    
    // Thủy tổ -> Gen 1
    assert.strictEqual(inferred[0].generationNumber, 1);
    // Vợ Thủy tổ -> Gen 1
    assert.strictEqual(inferred[1].generationNumber, 1);
    // Con Thủy tổ (Khang) -> Gen 2
    assert.strictEqual(inferred[2].generationNumber, 2);
    // Cháu (Hoàng) -> Gen 3
    assert.strictEqual(inferred[3].generationNumber, 3);
    // Chắt (Minh) -> Gen 4
    assert.strictEqual(inferred[4].generationNumber, 4);

    console.log('✅ [IMPORT-004: Topological Generation Auto-Inference] PASS');
  });

  await t.test('IMPORT-005: Validation Logic & Loop Detection Guard', () => {
    const sampleRows: RawImportMember[] = [
      {
        fullName: 'Cụ Nguyễn Văn Phúc',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        lifeStatus: 'DECEASED',
        deathLunarDay: 15,
        deathLunarMonth: 1,
        deathLunarYear: 1952,
        burialPlace: 'Lăng Mộ Tổ'
      },
      {
        fullName: 'Thành Viên Lỗi Tên Cha Trùng',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Trưởng',
        parentName: 'Thành Viên Lỗi Tên Cha Trùng',
        lifeStatus: 'ALIVE'
      }
    ];

    const validation = DataImportService.validateImportData(sampleRows);
    assert.strictEqual(validation.totalRows, 2);
    assert.strictEqual(validation.errorRows, 1, 'Should detect self-parent loop error');
    assert.strictEqual(validation.canCommit, false, 'Cannot commit when errors exist');
    console.log('✅ [IMPORT-005: Validation Logic & Loop Detection] PASS');
  });

});
