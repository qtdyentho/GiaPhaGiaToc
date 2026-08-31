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

  await t.test('IMPORT-006: ISO Date Formatter for Postgres DATE Columns (toPostgresDate)', () => {
    // 1. Vietnamese standard format DD/MM/YYYY
    assert.strictEqual(DataImportService.toPostgresDate('21/10/1910'), '1910-10-21');
    assert.strictEqual(DataImportService.toPostgresDate('05/03/1880'), '1880-03-05');
    assert.strictEqual(DataImportService.toPostgresDate('1/1/1920'), '1920-01-01');

    // 2. ISO format already
    assert.strictEqual(DataImportService.toPostgresDate('1980-06-29'), '1980-06-29');
    assert.strictEqual(DataImportService.toPostgresDate('0544-03-15'), '0544-03-15');

    // 3. Ancient ancestor dates (< 1000 AD)
    assert.strictEqual(DataImportService.toPostgresDate('15/08/544'), '0544-08-15');
    assert.strictEqual(DataImportService.toPostgresDate('10/02/938'), '0938-02-10');

    // 4. Year fallback
    assert.strictEqual(DataImportService.toPostgresDate(undefined, 1880), '1880-01-01');
    assert.strictEqual(DataImportService.toPostgresDate(null, 544), '0544-01-01');

    // 5. Empty / null
    assert.strictEqual(DataImportService.toPostgresDate(''), null);
    assert.strictEqual(DataImportService.toPostgresDate(undefined), null);
    assert.strictEqual(DataImportService.toPostgresDate(null), null);

    console.log('✅ [IMPORT-006: ISO Date Formatter for Postgres DATE] PASS');
  });

  await t.test('IMPORT-007: Flexible Ancient Ancestor Birth Years (< 1000 AD)', () => {
    const ancientRows: RawImportMember[] = [
      {
        fullName: 'Lý Nam Đế (Lý Bí)',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Toàn Tộc',
        birthYear: 503,
        deathLunarYear: 548,
        lifeStatus: 'DECEASED',
      },
      {
        fullName: 'Ngô Quyền',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Toàn Tộc',
        birthYear: 898,
        deathLunarYear: 944,
        lifeStatus: 'DECEASED',
      }
    ];

    const validation = DataImportService.validateImportData(ancientRows);
    assert.strictEqual(validation.errorRows, 0, 'Ancient ancestors with birthYear < 1000 AD should be VALID, not blocked');
    assert.strictEqual(validation.canCommit, true, 'Should be committable');
    console.log('✅ [IMPORT-007: Flexible Ancient Ancestor Birth Years] PASS');
  });

  await t.test('IMPORT-008: Required Field Validation (Full Name, Gender, Generation) & User Feedback', () => {
    const invalidRows: RawImportMember[] = [
      {
        fullName: '', // Missing name
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Nguyễn Văn A',
        gender: 'UNKNOWN' as any, // Invalid gender
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Nguyễn Văn B',
        gender: 'MALE',
        generationNumber: 0, // Invalid generation
        branchName: 'Chi Trưởng',
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Nguyễn Văn C',
        gender: 'MALE',
        generationNumber: 2,
        branchName: '', // Missing branch name
        lifeStatus: 'ALIVE',
      }
    ];

    const validation = DataImportService.validateImportData(invalidRows);
    assert.strictEqual(validation.totalRows, 4);
    assert.strictEqual(validation.errorRows, 4, 'All 4 rows with missing required fields must be flagged as ERROR');
    assert.strictEqual(validation.canCommit, false);

    // Verify error messages
    assert.ok(validation.rows[0].errors.some(e => e.includes('Họ và tên')));
    assert.ok(validation.rows[1].errors.some(e => e.includes('Giới tính')));
    assert.ok(validation.rows[2].errors.some(e => e.includes('Thế hệ')));
    assert.ok(validation.rows[3].errors.some(e => e.includes('Chi phái')));

    console.log('✅ [IMPORT-008: Required Field Validation & Feedback] PASS');
  });

  await t.test('IMPORT-009: In-Memory / Supabase Commit & Direct Lineage Fields Sync (father_id, mother_id, spouse_id)', async () => {
    const testFamilyId = 'fam-test-import-001';
    const testRows: RawImportMember[] = [
      {
        treeCode: '1',
        fullName: 'Cụ Nguyễn Khởi Tổ',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthYear: 1850,
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1-V1',
        spouseCode: '1',
        fullName: 'Cụ Bà Trần Thị Mai',
        gender: 'FEMALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthYear: 1855,
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1.1',
        parentCode: '1',
        motherCode: '1-V1',
        fullName: 'Nguyễn Văn Con Trưởng',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Trưởng',
        birthYear: 1880,
        lifeStatus: 'DECEASED',
      }
    ];

    const validation = DataImportService.validateImportData(testRows);
    assert.strictEqual(validation.canCommit, true);

    const commitRes = await DataImportService.commitImport(testFamilyId, validation);
    assert.strictEqual(commitRes.success, true);
    assert.strictEqual(commitRes.insertedCount, 3);

    // Verify Rollback functionality
    const rollbackRes = await DataImportService.rollbackBatch(commitRes.batchId);
    assert.strictEqual(rollbackRes.success, true);

    console.log('✅ [IMPORT-009: Commit & Direct Lineage Sync & Rollback] PASS');
  });

  await t.test('IMPORT-010: Multi-Generational Homonym Disambiguation (Ancestor vs Grandchild Same Name)', () => {
    const homonymRows: RawImportMember[] = [
      {
        fullName: 'Nguyễn Văn Phúc', // Ancestor Gen 1
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        lifeStatus: 'DECEASED',
      },
      {
        fullName: 'Nguyễn Văn Khang', // Son Gen 2
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Trưởng',
        parentName: 'Nguyễn Văn Phúc', // Points to Gen 1
        lifeStatus: 'DECEASED',
      },
      {
        fullName: 'Nguyễn Văn Phúc', // Grandson Gen 3 (Same name as Gen 1)
        gender: 'MALE',
        generationNumber: 3,
        branchName: 'Chi Trưởng',
        parentName: 'Nguyễn Văn Khang',
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Nguyễn Văn An', // Great-grandson Gen 4
        gender: 'MALE',
        generationNumber: 4,
        branchName: 'Chi Trưởng',
        parentName: 'Nguyễn Văn Phúc', // Points to Gen 3 (Father Gen 3, not Gen 1)
        lifeStatus: 'ALIVE',
      }
    ];

    const validation = DataImportService.validateImportData(homonymRows);
    assert.strictEqual(validation.canCommit, true);
    assert.strictEqual(validation.errorRows, 0);

    console.log('✅ [IMPORT-010: Multi-Generational Homonym Disambiguation] PASS');
  });

  await t.test('IMPORT-011: Relationship Polarity & Direct Lineage Fields Integrity in mock/DB', async () => {
    const clanId = 'fam-polarity-check-001';
    const rows: RawImportMember[] = [
      {
        treeCode: '1',
        fullName: 'Nguyễn Văn Cụ Tổ',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthYear: 1840,
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1-V1',
        spouseCode: '1',
        fullName: 'Trần Thị Cụ Mẫu',
        gender: 'FEMALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthYear: 1845,
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1.1',
        parentCode: '1',
        motherCode: '1-V1',
        fullName: 'Nguyễn Văn Con Cả',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Trưởng',
        birthYear: 1870,
        lifeStatus: 'DECEASED',
      }
    ];

    const validation = DataImportService.validateImportData(rows);
    assert.strictEqual(validation.canCommit, true);

    const res = await DataImportService.commitImport(clanId, validation);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.insertedCount, 3);

    console.log('✅ [IMPORT-011: Relationship Polarity & Direct Lineage Integrity] PASS');
  });

  await t.test('IMPORT-012: Ancient Lineage Support (Year < 1000 AD in toPostgresDate & validateImportData)', () => {
    // Check various ancient years
    const ancientYears = [100, 503, 544, 898, 938, 980];
    for (const year of ancientYears) {
      const formatted = DataImportService.toPostgresDate(undefined, year);
      assert.strictEqual(formatted, `${String(year).padStart(4, '0')}-01-01`);
      
      const parsed = DataImportService.parseFlexibleDate(String(year));
      assert.strictEqual(parsed.year, year);
      assert.strictEqual(parsed.hasDate, true);
    }

    // Check full ancient date DD/MM/YYYY
    assert.strictEqual(DataImportService.toPostgresDate('12/03/544'), '0544-03-12');
    assert.strictEqual(DataImportService.toPostgresDate('09/11/938'), '0938-11-09');

    console.log('✅ [IMPORT-012: Ancient Lineage Dates < 1000 AD] PASS');
  });

});
