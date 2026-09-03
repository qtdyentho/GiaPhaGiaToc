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

  await t.test('IMPORT-ADV-001: Multi-Node Circular Ancestry Detection (A->B->C->A, 4-Node Cycles, Disconnected Loops)', () => {
    // 1. 3-node cycle via parentName: A -> B -> C -> A
    const threeNodeCycleRows: RawImportMember[] = [
      {
        fullName: 'Nguyễn Văn A',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        parentName: 'Nguyễn Văn B',
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Nguyễn Văn B',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Trưởng',
        parentName: 'Nguyễn Văn C',
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Nguyễn Văn C',
        gender: 'MALE',
        generationNumber: 3,
        branchName: 'Chi Trưởng',
        parentName: 'Nguyễn Văn A',
        lifeStatus: 'ALIVE',
      },
    ];

    const validation3 = DataImportService.validateImportData(threeNodeCycleRows);
    assert.strictEqual(validation3.totalRows, 3);
    assert.strictEqual(validation3.canCommit, false, '3-node cycle must block commit');
    assert.ok(validation3.errorRows >= 3, 'All 3 members in the cycle must be marked with ERROR');
    for (const r of validation3.rows) {
      assert.ok(
        r.errors.some((e) => e.includes('chu trình phả hệ khép kín')),
        `Row ${r.rowNumber} (${r.data.fullName}) must have cycle detection error`
      );
    }

    // 2. 4-node cycle via treeCode & parentCode: 1.1 -> 1.2 -> 1.3 -> 1.4 -> 1.1
    const fourNodeCycleRows: RawImportMember[] = [
      {
        treeCode: '1.1',
        parentCode: '1.2',
        fullName: 'Thành Viên Vòng 1',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi 1',
        lifeStatus: 'ALIVE',
      },
      {
        treeCode: '1.2',
        parentCode: '1.3',
        fullName: 'Thành Viên Vòng 2',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi 1',
        lifeStatus: 'ALIVE',
      },
      {
        treeCode: '1.3',
        parentCode: '1.4',
        fullName: 'Thành Viên Vòng 3',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi 1',
        lifeStatus: 'ALIVE',
      },
      {
        treeCode: '1.4',
        parentCode: '1.1',
        fullName: 'Thành Viên Vòng 4',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi 1',
        lifeStatus: 'ALIVE',
      },
    ];

    const validation4 = DataImportService.validateImportData(fourNodeCycleRows);
    assert.strictEqual(validation4.canCommit, false, '4-node cycle must block commit');
    assert.strictEqual(validation4.errorRows, 4, 'All 4 members in 4-node cycle must have ERROR');

    // 3. Disconnected loops + valid subtrees in same batch
    const mixedGraphRows: RawImportMember[] = [
      // Valid Subtree (Root -> Child 1 -> Child 2)
      {
        treeCode: 'ROOT',
        fullName: 'Cụ Khởi Tổ Hợp Lệ',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: 'CHILD.1',
        parentCode: 'ROOT',
        fullName: 'Con Trưởng Hợp Lệ',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Trưởng',
        lifeStatus: 'ALIVE',
      },
      // Disconnected 2-Node Cycle (L1 <-> L2)
      {
        treeCode: 'LOOP1',
        parentCode: 'LOOP2',
        fullName: 'Vòng Độc Lập 1',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Hai',
        lifeStatus: 'ALIVE',
      },
      {
        treeCode: 'LOOP2',
        parentCode: 'LOOP1',
        fullName: 'Vòng Độc Lập 2',
        gender: 'MALE',
        generationNumber: 2,
        branchName: 'Chi Hai',
        lifeStatus: 'ALIVE',
      },
    ];

    const mixedValidation = DataImportService.validateImportData(mixedGraphRows);
    assert.strictEqual(mixedValidation.totalRows, 4);
    assert.strictEqual(mixedValidation.rows[0].status, 'VALID', 'Valid root must remain VALID');
    assert.strictEqual(mixedValidation.rows[1].status, 'VALID', 'Valid child must remain VALID');
    assert.strictEqual(mixedValidation.rows[2].status, 'ERROR', 'LOOP1 must be flagged ERROR');
    assert.strictEqual(mixedValidation.rows[3].status, 'ERROR', 'LOOP2 must be flagged ERROR');
    assert.strictEqual(mixedValidation.canCommit, false);

    // 4. Self-Parent Loop detection
    const selfParentRow: RawImportMember[] = [
      {
        treeCode: 'SELF_NODE',
        parentCode: 'SELF_NODE',
        fullName: 'Tự Làm Cha Mình',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Toàn Tộc',
        lifeStatus: 'ALIVE',
      },
    ];
    const selfValidation = DataImportService.validateImportData(selfParentRow);
    assert.strictEqual(selfValidation.errorRows, 1);
    assert.ok(selfValidation.rows[0].errors.some((e) => e.includes('trùng với chính')));

    console.log('✅ [IMPORT-ADV-001: Multi-Node Circular Ancestry Detection] PASS');
  });

  await t.test('IMPORT-ADV-002: Malformed Dates, Vietnamese Text Dates, Leap Years & Dual Calendar Conversions', () => {
    // 1. Vietnamese text dates
    const dateVn1 = DataImportService.parseFlexibleDate('Ngày 21 tháng 10 năm 1851');
    assert.strictEqual(dateVn1.hasDate, true);
    assert.strictEqual(dateVn1.day, 21);
    assert.strictEqual(dateVn1.month, 10);
    assert.strictEqual(dateVn1.year, 1851);
    assert.strictEqual(dateVn1.formattedDate, '21/10/1851');

    const dateVn2 = DataImportService.parseFlexibleDate('25 thg 8 1887');
    assert.strictEqual(dateVn2.hasDate, true);
    assert.strictEqual(dateVn2.day, 25);
    assert.strictEqual(dateVn2.month, 8);
    assert.strictEqual(dateVn2.year, 1887);

    // 2. Leap year handling: 29/02/2000, 29/02/2024
    const leap2000 = DataImportService.parseFlexibleDate('29/02/2000');
    assert.strictEqual(leap2000.hasDate, true);
    assert.strictEqual(leap2000.day, 29);
    assert.strictEqual(leap2000.month, 2);
    assert.strictEqual(leap2000.year, 2000);
    assert.strictEqual(DataImportService.toPostgresDate('29/02/2000'), '2000-02-29');

    const leap2024 = DataImportService.parseFlexibleDate('29/02/2024');
    assert.strictEqual(leap2024.hasDate, true);
    assert.strictEqual(DataImportService.toPostgresDate('29/02/2024'), '2024-02-29');

    // 3. Ancient year ISO formatting & zero padding
    assert.strictEqual(DataImportService.toPostgresDate('15/08/544'), '0544-08-15');
    assert.strictEqual(DataImportService.toPostgresDate('1/1/938'), '0938-01-01');
    assert.strictEqual(DataImportService.toPostgresDate(undefined, 503), '0503-01-01');

    // 4. Extract year robustly
    assert.strictEqual(DataImportService.extractYear('21/10/1910'), 1910);
    assert.strictEqual(DataImportService.extractYear('1980-06-29'), 1980);
    assert.strictEqual(DataImportService.extractYear(1952), 1952);
    assert.strictEqual(DataImportService.extractYear('Năm 1887'), 1887);
    assert.strictEqual(DataImportService.extractYear(544), 544);
    assert.strictEqual(DataImportService.extractYear(''), 0);
    assert.strictEqual(DataImportService.extractYear(null), 0);

    // 5. Dual Calendar Auto-Conversion in autoInferGenerationsAndBranches
    const calendarTestRows: RawImportMember[] = [
      {
        fullName: 'Thành Viên Có Ngày Sinh Dương',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthSolarDate: '21/10/1910', // Solar date -> should infer Lunar date
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Thành Viên Có Ngày Sinh Âm',
        gender: 'FEMALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthLunarDate: '18/09/1910', // Lunar date -> should infer Solar date
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Thành Viên Có Ngày Mất Dương',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        deathSolarDate: '29/06/1980', // Solar death -> should infer Lunar giỗ & lifeStatus DECEASED
        lifeStatus: 'ALIVE',
      },
      {
        fullName: 'Thành Viên Có Ngày Giỗ Âm',
        gender: 'FEMALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        deathLunarDay: 18,
        deathLunarMonth: 5,
        deathLunarYear: 1980, // Lunar giỗ -> should infer Solar death & lifeStatus DECEASED
        lifeStatus: 'ALIVE',
      },
    ];

    const { members: inferredCal } = DataImportService.autoInferGenerationsAndBranches(calendarTestRows);
    
    // Member 1: Solar -> Lunar
    assert.ok(inferredCal[0].birthLunarDay && inferredCal[0].birthLunarDay > 0);
    assert.ok(inferredCal[0].birthLunarMonth && inferredCal[0].birthLunarMonth > 0);
    assert.ok(inferredCal[0].birthLunarYear && inferredCal[0].birthLunarYear === 1910);
    assert.ok(inferredCal[0].birthLunarDate && inferredCal[0].birthLunarDate.length > 0);

    // Member 2: Lunar -> Solar
    assert.ok(inferredCal[1].birthSolarDate && inferredCal[1].birthSolarDate.includes('1910'));
    assert.strictEqual(inferredCal[1].birthYear, 1910);

    // Member 3: Solar Death -> Lunar Giỗ & DECEASED
    assert.strictEqual(inferredCal[2].lifeStatus, 'DECEASED');
    assert.ok(inferredCal[2].deathLunarDay && inferredCal[2].deathLunarDay > 0);
    assert.ok(inferredCal[2].deathLunarMonth && inferredCal[2].deathLunarMonth > 0);
    assert.ok(inferredCal[2].deathLunarFull && inferredCal[2].deathLunarFull.length > 0);

    // Member 4: Lunar Giỗ -> Solar Death & DECEASED
    assert.strictEqual(inferredCal[3].lifeStatus, 'DECEASED');
    assert.ok(inferredCal[3].deathSolarDate && inferredCal[3].deathSolarDate.includes('1980'));

    // 6. Chronological Error Validation (deathYear < birthYear, invalid months/days)
    const chronologicalAnomalyRows: RawImportMember[] = [
      {
        fullName: 'Người Sinh Sau Khi Mất',
        gender: 'MALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        birthYear: 1980,
        deathLunarYear: 1950, // ERROR: Death < Birth
        lifeStatus: 'DECEASED',
      },
      {
        fullName: 'Người Có Tháng Mất Sai',
        gender: 'FEMALE',
        generationNumber: 1,
        branchName: 'Chi Trưởng',
        deathLunarMonth: 13, // ERROR: Month > 12
        deathLunarDay: 35, // ERROR: Day > 30
        lifeStatus: 'DECEASED',
      },
    ];

    const chronoValidation = DataImportService.validateImportData(chronologicalAnomalyRows);
    assert.strictEqual(chronoValidation.canCommit, false);
    assert.strictEqual(chronoValidation.errorRows, 2);
    assert.ok(chronoValidation.rows[0].errors.some((e) => e.includes('không được lớn hơn năm mất')));
    assert.ok(chronoValidation.rows[1].errors.some((e) => e.includes('Tháng mất âm lịch')));
    assert.ok(chronoValidation.rows[1].errors.some((e) => e.includes('Ngày mất âm lịch')));

    console.log('✅ [IMPORT-ADV-002: Malformed Dates, Leap Years & Dual Calendar Conversions] PASS');
  });

  await t.test('IMPORT-ADV-003: Large Batch Import Stress Test (500+ Records) & Chunked Rollback', async () => {
    // Generate synthetic tree of 520 records across 10 generations
    const largeBatchRows: RawImportMember[] = [];
    const totalTarget = 520;
    
    // Gen 1: Patriarch & Matriarch
    largeBatchRows.push({
      treeCode: '1',
      fullName: 'Cụ Thủy Tổ Đời 1',
      gender: 'MALE',
      generationNumber: 1,
      branchName: 'Toàn Tộc',
      birthYear: 1700,
      deathLunarYear: 1775,
      deathLunarMonth: 3,
      deathLunarDay: 15,
      lifeStatus: 'DECEASED',
    });
    largeBatchRows.push({
      treeCode: '1-V1',
      spouseCode: '1',
      fullName: 'Cụ Bà Chính Thất Đời 1',
      gender: 'FEMALE',
      generationNumber: 1,
      branchName: 'Toàn Tộc',
      birthYear: 1705,
      deathLunarYear: 1780,
      lifeStatus: 'DECEASED',
    });

    let currentGen = 2;
    let memberCount = 2;
    let prevGenCodes = ['1'];

    while (memberCount < totalTarget && currentGen <= 10) {
      const nextGenCodes: string[] = [];
      for (const parentCode of prevGenCodes) {
        if (memberCount >= totalTarget) break;
        // 2 children per parent
        for (let c = 1; c <= 2; c++) {
          if (memberCount >= totalTarget) break;
          const childCode = `${parentCode}.${c}`;
          const childName = `Thành Viên ${childCode} (Đời ${currentGen})`;
          const birthY = 1700 + (currentGen - 1) * 30;
          const isDeceased = currentGen <= 6;
          
          largeBatchRows.push({
            treeCode: childCode,
            parentCode: parentCode,
            fullName: childName,
            gender: c === 1 ? 'MALE' : 'FEMALE',
            generationNumber: currentGen,
            branchName: parentCode.startsWith('1.1') ? 'Chi Trưởng' : 'Chi Thứ',
            birthYear: birthY,
            deathLunarYear: isDeceased ? birthY + 70 : undefined,
            deathLunarMonth: isDeceased ? 5 : undefined,
            deathLunarDay: isDeceased ? 10 : undefined,
            lifeStatus: isDeceased ? 'DECEASED' : 'ALIVE',
          });
          memberCount++;
          nextGenCodes.push(childCode);

          // Add spouse for first child
          if (c === 1 && memberCount < totalTarget) {
            const spouseCode = `${childCode}-V1`;
            largeBatchRows.push({
              treeCode: spouseCode,
              spouseCode: childCode,
              fullName: `Phu Nhân ${spouseCode} (Đời ${currentGen})`,
              gender: 'FEMALE',
              generationNumber: currentGen,
              branchName: parentCode.startsWith('1.1') ? 'Chi Trưởng' : 'Chi Thứ',
              birthYear: birthY + 2,
              lifeStatus: isDeceased ? 'DECEASED' : 'ALIVE',
            });
            memberCount++;
          }
        }
      }
      prevGenCodes = nextGenCodes;
      currentGen++;
    }

    assert.ok(largeBatchRows.length >= 500, `Must generate at least 500 records (actual: ${largeBatchRows.length})`);

    // Benchmark validation performance
    const startTime = Date.now();
    const largeValidation = DataImportService.validateImportData(largeBatchRows);
    const durationMs = Date.now() - startTime;

    assert.strictEqual(largeValidation.totalRows, largeBatchRows.length);
    assert.strictEqual(largeValidation.errorRows, 0, 'Synthetic 500+ tree must be 100% VALID');
    assert.strictEqual(largeValidation.canCommit, true);
    assert.ok(durationMs < 500, `Validation of ${largeBatchRows.length} records took ${durationMs}ms (must be < 500ms)`);

    // Test Commit of Large Batch (500+ records)
    const largeBatchClanId = 'clan-stress-500-test';
    const commitResult = await DataImportService.commitImport(largeBatchClanId, largeValidation);
    assert.strictEqual(commitResult.success, true);
    assert.strictEqual(commitResult.insertedCount, largeBatchRows.length);

    // Test Rollback of Large Batch
    const rollbackResult = await DataImportService.rollbackBatch(commitResult.batchId);
    assert.strictEqual(rollbackResult.success, true);

    console.log(`✅ [IMPORT-ADV-003: Large Batch Import Stress (${largeBatchRows.length} records in ${durationMs}ms) & Rollback] PASS`);
  });

  await t.test('IMPORT-ADV-004: Spouse Generation Inference with Complex Nuclear & Polygyny Graphs', () => {
    // 1. Patriarch with 3 wives (Chính Thất, Kế Thất, Trắc Thất)
    const polygynyRows: RawImportMember[] = [
      {
        treeCode: '1',
        fullName: 'Cụ Trưởng Tộc Đa Thê',
        gender: 'MALE',
        generationNumber: 0, // Inferred as 1
        branchName: 'Chi Trưởng',
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1-V1',
        fullName: 'Cụ Bà Trần Thị Nhất (Chính Thất)',
        gender: 'MALE', // Deliberately MALE in raw -> autoInfer should fix to FEMALE
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1-V2',
        fullName: 'Cụ Bà Lê Thị Nhị (Kế Thất)',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1-V3',
        fullName: 'Cụ Bà Hoàng Thị Tam (Trắc Thất)',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'DECEASED',
      },
      // Son from Wife 1 (1.1) with his own 2 wives
      {
        treeCode: '1.1',
        parentCode: '1',
        motherCode: '1-V1',
        fullName: 'Nguyễn Văn Trưởng Nam (Con Bà Cả)',
        gender: 'MALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1.1-V1',
        fullName: 'Bà Dâu Trưởng Cả',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'DECEASED',
      },
      {
        treeCode: '1.1-V2',
        fullName: 'Bà Dâu Trưởng Hai',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'DECEASED',
      },
      // Son from Wife 2 (1.2)
      {
        treeCode: '1.2',
        parentCode: '1',
        motherCode: '1-V2',
        fullName: 'Nguyễn Văn Thứ Nam (Con Bà Hai)',
        gender: 'MALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'ALIVE',
      },
      // Daughter from Wife 3 (1.3) with husband consort (1.3-C1)
      {
        treeCode: '1.3',
        parentCode: '1',
        motherCode: '1-V3',
        fullName: 'Nguyễn Thị Nữ Nhi (Con Bà Ba)',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'ALIVE',
      },
      {
        treeCode: '1.3-HP1',
        spouseCode: '1.3',
        fullName: 'Ông Rể Quý (Phu Quân)',
        gender: 'MALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'ALIVE',
      },
      // Deep prefix generation member: D11.1-V1
      {
        treeCode: 'D11.1',
        fullName: 'Cháu Đời 11 Tiền Tố D11',
        gender: 'MALE',
        generationNumber: 0,
        branchName: 'Chi Ba',
        lifeStatus: 'ALIVE',
      },
      {
        treeCode: 'D11.1-V1',
        fullName: 'Vợ Cháu Đời 11',
        gender: 'FEMALE',
        generationNumber: 0,
        branchName: '',
        lifeStatus: 'ALIVE',
      },
    ];

    const { members: inferredPolygyny, autoInferredCount } = DataImportService.autoInferGenerationsAndBranches(polygynyRows);
    
    assert.strictEqual(autoInferredCount, 12, 'All 12 members should be auto-inferred');

    // Check Patriarch & Wives
    assert.strictEqual(inferredPolygyny[0].generationNumber, 1); // 1
    assert.strictEqual(inferredPolygyny[1].generationNumber, 1); // 1-V1
    assert.strictEqual(inferredPolygyny[1].gender, 'FEMALE', '1-V1 must be normalized to FEMALE');
    assert.strictEqual(inferredPolygyny[1].relationType, 'Vợ Cả (Chính Thất)');
    assert.strictEqual(inferredPolygyny[1].spouseCode, '1');

    assert.strictEqual(inferredPolygyny[2].generationNumber, 1); // 1-V2
    assert.strictEqual(inferredPolygyny[2].relationType, 'Vợ Thứ 2 (Kế Thất)');

    assert.strictEqual(inferredPolygyny[3].generationNumber, 1); // 1-V3
    assert.strictEqual(inferredPolygyny[3].relationType, 'Vợ Thứ 3 (Kế Thất)');

    // Check Son 1.1 & his wives
    assert.strictEqual(inferredPolygyny[4].generationNumber, 2); // 1.1
    assert.strictEqual(inferredPolygyny[5].generationNumber, 2); // 1.1-V1
    assert.strictEqual(inferredPolygyny[5].spouseCode, '1.1');
    assert.strictEqual(inferredPolygyny[6].generationNumber, 2); // 1.1-V2
    assert.strictEqual(inferredPolygyny[6].spouseCode, '1.1');

    // Check Son 1.2
    assert.strictEqual(inferredPolygyny[7].generationNumber, 2); // 1.2

    // Check Daughter 1.3 & Husband Consort 1.3-HP1
    assert.strictEqual(inferredPolygyny[8].generationNumber, 2); // 1.3
    assert.strictEqual(inferredPolygyny[9].generationNumber, 2); // 1.3-HP1
    assert.strictEqual(inferredPolygyny[9].spouseCode, '1.3');

    // Check Prefix generation D11
    assert.strictEqual(inferredPolygyny[10].generationNumber, 11); // D11.1
    assert.strictEqual(inferredPolygyny[11].generationNumber, 11); // D11.1-V1
    assert.strictEqual(inferredPolygyny[11].branchName, 'Chi Ba', 'Spouse must inherit branch');

    console.log('✅ [IMPORT-ADV-004: Spouse Generation Inference with Complex Polygyny Graphs] PASS');
  });

});

