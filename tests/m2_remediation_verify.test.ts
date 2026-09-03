import test from 'node:test';
import assert from 'node:assert/strict';
import { DataImportService, extractYear, RawImportMember } from '../src/services/DataImportService';

test('Milestone 2 Remediation Verification Suite', async (t) => {

  await t.test('BUG 1: Deterministic UUID mapping and index alignment in commitImport', async () => {
    const clanId = 'fam-test-uuid-mapping';
    const rows: RawImportMember[] = [
      { treeCode: '1', fullName: 'Cụ Tổ Khởi Lập', gender: 'MALE', generationNumber: 1, branchName: 'Chi Trưởng', birthYear: 1850, lifeStatus: 'DECEASED' },
      { treeCode: '1-V1', spouseCode: '1', fullName: 'Bà Cụ Tổ', gender: 'FEMALE', generationNumber: 1, branchName: 'Chi Trưởng', birthYear: 1855, lifeStatus: 'DECEASED' },
      { treeCode: '1.1', parentCode: '1', motherCode: '1-V1', fullName: 'Trưởng Nam Đời 2', gender: 'MALE', generationNumber: 2, branchName: 'Chi Trưởng', birthYear: 1880, lifeStatus: 'DECEASED' },
      { treeCode: '1.2', parentCode: '1', motherCode: '1-V1', fullName: 'Thứ Nam Đời 2', gender: 'MALE', generationNumber: 2, branchName: 'Chi Hai', birthYear: 1885, lifeStatus: 'DECEASED' },
    ];
    const validation = DataImportService.validateImportData(rows);
    assert.strictEqual(validation.canCommit, true);
    const res = await DataImportService.commitImport(clanId, validation);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.insertedCount, 4);

    // Rollback
    const roll = await DataImportService.rollbackBatch(res.batchId);
    assert.strictEqual(roll.success, true);
  });

  await t.test('BUG 2: Rollback with chunking and batch notes fallback', async () => {
    const dummyBatchId = 'IMPORT-TEST-CHUNK-001';
    const res = await DataImportService.rollbackBatch(dummyBatchId);
    assert.strictEqual(res.success, true);
  });

  await t.test('BUG 3: BFS Spouse Generation Inference (No premature Gen 1 on in-law spouses)', () => {
    const clanWithSpouse: RawImportMember[] = [
      { fullName: 'Cụ Tổ', gender: 'MALE', generationNumber: 1, branchName: 'Chi Trưởng', lifeStatus: 'DECEASED' },
      { fullName: 'Con Trưởng', gender: 'MALE', generationNumber: 0, branchName: 'Chi Trưởng', parentName: 'Cụ Tổ', lifeStatus: 'DECEASED' },
      { fullName: 'Cháu Đích Tôn', gender: 'MALE', generationNumber: 0, branchName: 'Chi Trưởng', parentName: 'Con Trưởng', lifeStatus: 'DECEASED' },
      { fullName: 'Chắt Đời 4', gender: 'MALE', generationNumber: 0, branchName: 'Chi Trưởng', parentName: 'Cháu Đích Tôn', lifeStatus: 'ALIVE' },
      { fullName: 'Dâu Đời 4 (Không Cha)', gender: 'FEMALE', generationNumber: 0, branchName: '', spouseName: 'Chắt Đời 4', lifeStatus: 'ALIVE' },
    ];
    const { members: inferred, autoInferredCount } = DataImportService.autoInferGenerationsAndBranches(clanWithSpouse);
    assert.strictEqual(autoInferredCount, 4, 'Should infer 4 descendants/spouses');
    const chat = inferred.find(m => m.fullName === 'Chắt Đời 4');
    const dau = inferred.find(m => m.fullName === 'Dâu Đời 4 (Không Cha)');
    assert.strictEqual(chat?.generationNumber, 4, 'Chắt must be Gen 4');
    assert.strictEqual(dau?.generationNumber, 4, 'Dâu Đời 4 must match spouse Gen 4, not Gen 1');
  });

  await t.test('BUG 4: Multi-Node Family Cycle Detection (A -> B -> C -> A)', () => {
    const cycleRows: RawImportMember[] = [
      { fullName: 'Cụ A', gender: 'MALE', generationNumber: 1, branchName: 'Chi 1', parentName: 'Cụ C', lifeStatus: 'DECEASED' },
      { fullName: 'Cụ B', gender: 'MALE', generationNumber: 2, branchName: 'Chi 1', parentName: 'Cụ A', lifeStatus: 'DECEASED' },
      { fullName: 'Cụ C', gender: 'MALE', generationNumber: 3, branchName: 'Chi 1', parentName: 'Cụ B', lifeStatus: 'DECEASED' },
    ];
    const valCycle = DataImportService.validateImportData(cycleRows);
    assert.strictEqual(valCycle.canCommit, false, 'Cycle must block commit');
    assert.ok(valCycle.errorRows >= 1, 'Must report cycle error rows');
    assert.ok(valCycle.rows.some(r => r.errors.some(e => e.includes('chu trình phả hệ khép kín'))), 'Must contain cycle error message');
  });

  await t.test('BUG 5: Date Parsing Helper & extractYear (DD/MM/YYYY support without NaN)', () => {
    assert.strictEqual(extractYear('21/10/1910'), 1910);
    assert.strictEqual(extractYear('05/03/1880'), 1880);
    assert.strictEqual(extractYear('1980-06-29'), 1980);
    assert.strictEqual(extractYear('15/08/544'), 544);
    assert.strictEqual(extractYear(1950), 1950);
    assert.strictEqual(extractYear(''), 0);
    assert.strictEqual(extractYear(undefined), 0);
    assert.strictEqual(extractYear(null), 0);

    assert.strictEqual(DataImportService.toPostgresDate('21/10/1910'), '1910-10-21');
    assert.strictEqual(DataImportService.toPostgresDate('05/03/1880'), '1880-03-05');
  });

});
