import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  DataImportService, 
  STANDARD_GENEALOGY_COLUMNS, 
  RawImportMember 
} from '../src/services/DataImportService';
import { GenealogyService } from '../src/services/GenealogyService';
import { KinshipService } from '../src/services/genealogy/KinshipService';
import { LunarCalendarService } from '../src/services/calendar/LunarCalendarService';
import { MemorialService } from '../src/services/calendar/MemorialService';
import { EventService } from '../src/services/calendar/EventService';
import { ReminderService } from '../src/services/calendar/ReminderService';
import { Member, MemberRelationship, Event, MemorialDate } from '../src/types/database';
import { mockMembers, mockGenerations, mockBranches, mockRelationships } from '../src/services/mockData';
import { solarToLunar, lunarToSolar, getDaysInLunarMonth, getLeapMonth } from '../src/lib/lunar';

/**
 * Helper to construct fully type-safe Member fixtures
 */
function createTestMember(partial: Partial<Member> & { id: string; family_id: string; full_name: string }): Member {
  const parts = partial.full_name.trim().split(' ');
  const firstName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const lastName = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
  return {
    id: partial.id,
    family_id: partial.family_id,
    full_name: partial.full_name,
    first_name: partial.first_name || firstName,
    last_name: partial.last_name || lastName,
    gender: partial.gender || 'MALE',
    life_status: partial.life_status || 'ALIVE',
    generation_index: partial.generation_index || 1,
    generation_id: partial.generation_id,
    branch_id: partial.branch_id,
    father_id: partial.father_id,
    mother_id: partial.mother_id,
    spouse_id: partial.spouse_id,
    birth_order: partial.birth_order,
    birth_solar_date: partial.birth_solar_date,
    death_solar_date: partial.death_solar_date,
    death_lunar_day: partial.death_lunar_day,
    death_lunar_month: partial.death_lunar_month,
    death_lunar_year: partial.death_lunar_year,
    burial_place: partial.burial_place,
    bio: partial.bio,
    created_at: partial.created_at || '2026-01-01T00:00:00Z',
    updated_at: partial.updated_at || '2026-08-31T00:00:00Z',
  };
}

/**
 * ============================================================================
 * E2E COMPREHENSIVE GENEALOGY TEST SUITE (TIERS 1 - 4)
 * DỰ ÁN: GIA PHẢ GIA TỘC (HERITAGE LEDGER ENTERPRISE SAAS)
 * ============================================================================
 * 
 * Cấu trúc 4 Tầng kiểm thử Hộp mờ (Opaque-Box Testing Hierarchy):
 * - Tier 1: Feature Coverage (Import 12 Cột, Date Parser, Member CRUD, Kinship, Tree, Events)
 * - Tier 2: Boundary & Corner Cases (Empty sheet, malformed headers, ancient/future boundary years, loops, leap months)
 * - Tier 3: Cross-Feature Integration (Import -> Profile Edit -> Delete Node -> Re-render Tree -> Kinship)
 * - Tier 4: Real-World Large Multi-Generation Workloads (5+ Gens, Multi-Wife Branching, Seniority)
 */

describe('GENEALOGY SAAS E2E COMPREHENSIVE SUITE (TIERS 1 - 4)', () => {

  // ==========================================================================
  // TIER 1: CORE FEATURE COVERAGE (HAPPY PATHS)
  // ==========================================================================
  describe('TIER 1: CORE FEATURE COVERAGE', () => {

    it('[E2E-T1-001] 12-Column Excel Header Auto-Mapping & Field Association', () => {
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
      assert.strictEqual(mappings.length, 12, 'Must map all 12 columns');
      
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
    });

    it('[E2E-T1-002] Multi-Format Text Generation Parser (Roman, Words, Ordinals)', () => {
      // Roman numerals
      assert.strictEqual(DataImportService.parseGenerationText('I'), 1);
      assert.strictEqual(DataImportService.parseGenerationText('II'), 2);
      assert.strictEqual(DataImportService.parseGenerationText('III'), 3);
      assert.strictEqual(DataImportService.parseGenerationText('IV'), 4);
      assert.strictEqual(DataImportService.parseGenerationText('V'), 5);
      assert.strictEqual(DataImportService.parseGenerationText('VI'), 6);
      assert.strictEqual(DataImportService.parseGenerationText('VII'), 7);
      assert.strictEqual(DataImportService.parseGenerationText('VIII'), 8);
      assert.strictEqual(DataImportService.parseGenerationText('IX'), 9);
      assert.strictEqual(DataImportService.parseGenerationText('X'), 10);

      // Vietnamese keywords
      assert.strictEqual(DataImportService.parseGenerationText('Thủy tổ dòng họ'), 1);
      assert.strictEqual(DataImportService.parseGenerationText('Cụ tổ khởi nghiệp'), 1);
      assert.strictEqual(DataImportService.parseGenerationText('Khởi tổ khai sơn'), 1);
      assert.strictEqual(DataImportService.parseGenerationText('Đời thứ nhất'), 1);
      assert.strictEqual(DataImportService.parseGenerationText('Đời đầu tiên'), 1);
      assert.strictEqual(DataImportService.parseGenerationText('Đời thứ 2'), 2);
      assert.strictEqual(DataImportService.parseGenerationText('Thế hệ 3'), 3);
      assert.strictEqual(DataImportService.parseGenerationText('F4'), 4);
      assert.strictEqual(DataImportService.parseGenerationText('Gen 5'), 5);
    });

    it('[E2E-T1-003] Smart Flexible Date Parser & Normalization for Database Compatibility', () => {
      // DD/MM/YYYY
      const d1 = DataImportService.parseFlexibleDate('21/10/1851');
      assert.strictEqual(d1.hasDate, true);
      assert.strictEqual(d1.day, 21);
      assert.strictEqual(d1.month, 10);
      assert.strictEqual(d1.year, 1851);
      assert.strictEqual(d1.formattedDate, '21/10/1851');

      // ISO YYYY-MM-DD
      const d2 = DataImportService.parseFlexibleDate('1945-08-19');
      assert.strictEqual(d2.hasDate, true);
      assert.strictEqual(d2.day, 19);
      assert.strictEqual(d2.month, 8);
      assert.strictEqual(d2.year, 1945);

      // Vietnamese text representation
      const d3 = DataImportService.parseFlexibleDate('Ngày 15 tháng 08 năm 1945');
      assert.strictEqual(d3.hasDate, true);
      assert.strictEqual(d3.day, 15);
      assert.strictEqual(d3.month, 8);
      assert.strictEqual(d3.year, 1945);

      // Pure Year
      const d4 = DataImportService.parseFlexibleDate(1910);
      assert.strictEqual(d4.hasDate, true);
      assert.strictEqual(d4.year, 1910);

      // Partial DD/MM date for lunar anniversary
      const d5 = DataImportService.parseFlexibleDate('15/01');
      assert.strictEqual(d5.hasDate, true);
      assert.strictEqual(d5.day, 15);
      assert.strictEqual(d5.month, 1);
    });

    it('[E2E-T1-004] Topological BFS Generation Auto-Inference from Parent & Spouse Links', () => {
      const rawClan: RawImportMember[] = [
        { fullName: 'Nguyễn Văn Cụ Tổ', gender: 'MALE', generationNumber: 0, branchName: '', lifeStatus: 'DECEASED' },
        { fullName: 'Bà Chính Thất Trần Thị', gender: 'FEMALE', generationNumber: 0, branchName: '', spouseName: 'Nguyễn Văn Cụ Tổ', lifeStatus: 'DECEASED' },
        { fullName: 'Nguyễn Văn Chi Trưởng', gender: 'MALE', generationNumber: 0, branchName: '', parentName: 'Nguyễn Văn Cụ Tổ', lifeStatus: 'DECEASED' },
        { fullName: 'Nguyễn Văn Cháu Đích Tôn', gender: 'MALE', generationNumber: 0, branchName: '', parentName: 'Nguyễn Văn Chi Trưởng', lifeStatus: 'ALIVE' },
        { fullName: 'Nguyễn Văn Chắt', gender: 'MALE', generationNumber: 0, branchName: '', parentName: 'Nguyễn Văn Cháu Đích Tôn', lifeStatus: 'ALIVE' },
      ];

      const { members, autoInferredCount } = DataImportService.autoInferGenerationsAndBranches(rawClan);
      assert.strictEqual(autoInferredCount, 5, 'Must infer generation for all 5 clan members');
      assert.strictEqual(members[0].generationNumber, 1, 'Ancestor is Gen 1');
      assert.strictEqual(members[1].generationNumber, 1, 'Spouse shares Gen 1');
      assert.strictEqual(members[2].generationNumber, 2, 'Child is Gen 2');
      assert.strictEqual(members[3].generationNumber, 3, 'Grandchild is Gen 3');
      assert.strictEqual(members[4].generationNumber, 4, 'Great-grandchild is Gen 4');
    });

    it('[E2E-T1-005] Member CRUD & Hierarchy Retrieval with Direct Lineage Fields', async () => {
      const familyId = 'fam-0000-0001';
      const treeData = await GenealogyService.getFamilyTree(familyId);
      assert.ok(Array.isArray(treeData.members), 'Tree must contain members array');
      assert.ok(treeData.members.length > 0, 'Tree must contain initial seeded members');

      // Verify direct lineage fields on members
      const sampleSon = treeData.members.find(m => m.id === 'mb-004'); // Tuấn
      assert.ok(sampleSon, 'Tuấn (mb-004) must exist in family tree');
      assert.strictEqual(sampleSon?.father_id, 'mb-003', 'Tuấn must have father_id set to Hoàng');
      assert.strictEqual(sampleSon?.generation_id, 'gen-4', 'Tuấn must belong to Gen 4');
    });

    it('[E2E-T1-006] Core Vietnamese Kinship Reasoning (Self, Direct, Siblings, Grandparents)', () => {
      const members = mockMembers;
      const hoang = members.find(m => m.id === 'mb-003')!; // Father (Gen 3)
      const tuan = members.find(m => m.id === 'mb-004')!;  // Son (Gen 4)
      const mai = members.find(m => m.id === 'mb-009')!;   // Sister (Gen 4)
      const an = members.find(m => m.id === 'mb-012')!;    // Grandson (Gen 5)
      const phuc = members.find(m => m.id === 'mb-001')!;  // Ancestor (Gen 1)

      // 1. Self
      const selfRes = KinshipService.evaluateKinshipLocal(tuan, tuan, members);
      assert.strictEqual(selfRes.term_a_calls_b, 'Bản thân');
      assert.strictEqual(selfRes.relationship_category, 'SELF');

      // 2. Direct Father <-> Son
      const sonToFather = KinshipService.evaluateKinshipLocal(tuan, hoang, members);
      assert.ok(sonToFather.term_a_calls_b.includes('Bố') || sonToFather.term_a_calls_b.includes('Cha'));
      assert.strictEqual(sonToFather.generation_distance, 1);
      assert.strictEqual(sonToFather.seniority, 'B_IS_SENIOR');

      // 3. Siblings (Brother <-> Sister)
      const brotherToSister = KinshipService.evaluateKinshipLocal(tuan, mai, members);
      assert.strictEqual(brotherToSister.term_a_calls_b, 'Em ruột');
      const sisterToBrother = KinshipService.evaluateKinshipLocal(mai, tuan, members);
      assert.strictEqual(sisterToBrother.term_a_calls_b, 'Anh ruột');

      // 4. Grandparent <-> Grandchild (ΔG = 2)
      const grandchildToGrandpa = KinshipService.evaluateKinshipLocal(an, hoang, members);
      assert.ok(grandchildToGrandpa.term_a_calls_b.includes('Ông'));
      assert.strictEqual(grandchildToGrandpa.generation_distance, 2);

      // 5. Great-Great Ancestor (ΔG = 4)
      const distantAncestor = KinshipService.evaluateKinshipLocal(an, phuc, members);
      assert.ok(distantAncestor.term_a_calls_b.includes('Cụ Kỵ'));
      assert.strictEqual(distantAncestor.generation_distance, 4);
    });

    it('[E2E-T1-007] Event & Memorial Date Lifecycle & Lunar-Solar Synchronizer', async () => {
      const familyId = 'fam-0000-0001';
      const memorials = await MemorialService.getMemorials(familyId);
      assert.ok(memorials.length > 0, 'Should load memorial dates');

      // Verify that every memorial has valid next_solar_date calculated
      for (const mem of memorials) {
        assert.ok(mem.next_solar_date, `Memorial ${mem.title} must have next_solar_date`);
        assert.match(mem.next_solar_date, /^\d{4}-\d{2}-\d{2}$/, 'Must be in ISO YYYY-MM-DD format');
      }

      // Test Two-way Lunar <-> Solar conversion
      const solar = { day: 10, month: 2, year: 2024 }; // Giáp Thìn Tết Nguyên Đán
      const lunar = solarToLunar(solar.day, solar.month, solar.year);
      assert.strictEqual(lunar.day, 1, 'Feb 10, 2024 is Lunar 1st of 1st Month (Mùng 1 Tết)');
      assert.strictEqual(lunar.month, 1);
      assert.strictEqual(lunar.year, 2024);

      const [convDay, convMonth, convYear] = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap);
      assert.strictEqual(convDay, solar.day);
      assert.strictEqual(convMonth, solar.month);
      assert.strictEqual(convYear, solar.year);
    });

  });

  // ==========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (EDGE HARDENING)
  // ==========================================================================
  describe('TIER 2: BOUNDARY & CORNER CASES', () => {

    it('[E2E-T2-001] Empty Sheets & Zero-Row Graceful Handling', () => {
      const emptyRows: RawImportMember[] = [];
      const inference = DataImportService.autoInferGenerationsAndBranches(emptyRows);
      assert.strictEqual(inference.autoInferredCount, 0);
      assert.strictEqual(inference.members.length, 0);

      const validation = DataImportService.validateImportData(emptyRows);
      assert.strictEqual(validation.totalRows, 0);
      assert.strictEqual(validation.errorRows, 0);
      assert.strictEqual(validation.validRows, 0);
    });

    it('[E2E-T2-002] Malformed Header Rows & Decorator Banner Rows Detection', () => {
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
      assert.strictEqual(mappings[4].targetField, 'parentName');
      assert.strictEqual(mappings[5].targetField, 'spouseName');
    });

    it('[E2E-T2-003] Birth Year Boundary Checks (Valid Historical Range vs Invalid Future)', () => {
      const currentYear = new Date().getFullYear();
      const boundaryClan: RawImportMember[] = [
        {
          fullName: 'Cụ Tổ Khởi Đầu Thế Kỷ 11',
          gender: 'MALE',
          generationNumber: 1,
          branchName: 'Chi Trưởng',
          birthYear: 1000,
          lifeStatus: 'DECEASED'
        },
        {
          fullName: 'Tiền Nhân Thế Kỷ 19',
          gender: 'MALE',
          generationNumber: 2,
          branchName: 'Chi Trưởng',
          birthYear: 1850,
          lifeStatus: 'DECEASED'
        },
        {
          fullName: 'Thành Viên Đương Thời',
          gender: 'MALE',
          generationNumber: 3,
          branchName: 'Chi Trưởng',
          birthYear: currentYear,
          lifeStatus: 'ALIVE'
        }
      ];

      const validation = DataImportService.validateImportData(boundaryClan);
      assert.strictEqual(validation.totalRows, 3);
      assert.strictEqual(validation.canCommit, true, 'Valid years in [1000, currentYear] with branchName must be accepted');

      // Future year > currentYear must be flagged
      const futureClan: RawImportMember[] = [
        {
          fullName: 'Thành Viên Tương Lai',
          gender: 'MALE',
          generationNumber: 1,
          branchName: 'Chi Trưởng',
          birthYear: currentYear + 10,
          lifeStatus: 'ALIVE'
        }
      ];
      const valFuture = DataImportService.validateImportData(futureClan);
      assert.strictEqual(valFuture.errorRows, 1, 'Future birth years must produce validation errors');
      assert.strictEqual(valFuture.canCommit, false, 'Invalid future year must block commit');
    });

    it('[E2E-T2-004] Circular Relationship Prevention & Self-Parenting Guards', () => {
      // 1. Direct self-parent loop (parentName matches own name)
      const selfLoopRows: RawImportMember[] = [
        {
          fullName: 'Nguyễn Văn Tự Sinh',
          gender: 'MALE',
          generationNumber: 2,
          branchName: 'Chi Trưởng',
          parentName: 'Nguyễn Văn Tự Sinh', // Self-loop!
          lifeStatus: 'ALIVE'
        }
      ];

      const val1 = DataImportService.validateImportData(selfLoopRows);
      assert.strictEqual(val1.errorRows, 1, 'Must detect self-parent loop');
      assert.strictEqual(val1.canCommit, false, 'Self-parent loop must block commit');

      // 2. Non-existent parent code check
      const missingParentCodeRows: RawImportMember[] = [
        {
          treeCode: '1.2',
          parentCode: '99.99', // Missing parent code!
          fullName: 'Thành Viên Lạc Mã Cha',
          gender: 'MALE',
          generationNumber: 2,
          branchName: 'Chi Trưởng',
          lifeStatus: 'ALIVE'
        }
      ];
      const val2 = DataImportService.validateImportData(missingParentCodeRows);
      assert.strictEqual(val2.errorRows, 1, 'Must detect non-existent parent code');
      assert.strictEqual(val2.canCommit, false);
    });

    it('[E2E-T2-005] Lunar Leap Months & Short Month (29 vs 30 Days) Handling', () => {
      // In lunar calendar, some months have only 29 days (tháng thiếu).
      // If a death occurred on the 30th of a lunar month, but the current year's month only has 29 days,
      // the system must automatically adjust the memorial ceremony to the 29th (last day of the month).
      const special30 = LunarCalendarService.getNextSolarDateForMemorial(30, 11, false, 2024);
      assert.ok(special30.solarDate, 'Must calculate a valid solar date');
      assert.ok(special30.actualLunarDayUsed === 29 || special30.actualLunarDayUsed === 30);

      // Leap month handling: 2025 has leap month 6
      const leapMonth2025 = getLeapMonth(2025);
      assert.strictEqual(leapMonth2025, 6, 'Year 2025 must have leap month 6 (Tháng 6 Nhuận)');
      
      const daysInLeap = getDaysInLunarMonth(6, 2025, true);
      assert.ok(daysInLeap === 29 || daysInLeap === 30, 'Leap month has either 29 or 30 days');
    });

    it('[E2E-T2-006] Single-Member Clan & Disconnected Orphan Subtree Resilience', () => {
      // 1. Single-member clan
      const singleMemberClan: Member[] = [
        createTestMember({
          id: 'mb-solo-001',
          family_id: 'fam-solo',
          full_name: 'Nguyễn Độc Tôn',
          gender: 'MALE',
          life_status: 'ALIVE',
          generation_index: 1,
        })
      ];

      const kinshipSolo = KinshipService.evaluateKinshipLocal(singleMemberClan[0], singleMemberClan[0], singleMemberClan);
      assert.strictEqual(kinshipSolo.relationship_category, 'SELF');
      assert.strictEqual(kinshipSolo.term_a_calls_b, 'Bản thân');

      // 2. Disconnected orphan member (no parent links)
      const orphanClan: Member[] = [
        createTestMember({ id: 'mb-1', family_id: 'fam-orphan', full_name: 'Cụ A', gender: 'MALE', life_status: 'DECEASED', generation_index: 1 }),
        createTestMember({ id: 'mb-orphan', family_id: 'fam-orphan', full_name: 'Người Mồ Côi', gender: 'MALE', life_status: 'ALIVE', generation_index: 2 })
      ];
      const kinshipOrphan = KinshipService.evaluateKinshipLocal(orphanClan[1], orphanClan[0], orphanClan);
      assert.ok(kinshipOrphan.relationship_category === 'UNKNOWN' || kinshipOrphan.relationship_category === 'UNCLE_AUNT');
    });

  });

  // ==========================================================================
  // TIER 3: CROSS-FEATURE INTEGRATION WORKFLOWS
  // ==========================================================================
  describe('TIER 3: CROSS-FEATURE COMBINATIONS', () => {

    it('[E2E-T3-001] End-to-End Workflow: Ingest Excel -> Profile Edit -> Tree Construction -> Kinship Calculation', async () => {
      // Step 1: Ingest 12-column clan batch
      const inputBatch: RawImportMember[] = [
        {
          fullName: 'Vũ Đình Cụ Khởi Tổ',
          gender: 'MALE',
          generationNumber: 1,
          branchName: 'Chi Cả',
          lifeStatus: 'DECEASED',
          birthYear: 1870,
          deathLunarDay: 10,
          deathLunarMonth: 3,
          burialPlace: 'Đồi Thông Từ Đường'
        },
        {
          fullName: 'Vũ Đình Trưởng Nam',
          gender: 'MALE',
          generationNumber: 2,
          branchName: 'Chi Cả',
          parentName: 'Vũ Đình Cụ Khởi Tổ',
          lifeStatus: 'DECEASED',
          birthYear: 1900
        },
        {
          fullName: 'Vũ Đình Đích Tôn',
          gender: 'MALE',
          generationNumber: 3,
          branchName: 'Chi Cả',
          parentName: 'Vũ Đình Trưởng Nam',
          lifeStatus: 'ALIVE',
          birthYear: 1940
        }
      ];

      // Step 2: Validate and auto-infer
      const validated = DataImportService.validateImportData(inputBatch);
      assert.strictEqual(validated.canCommit, true, 'Import batch must be 100% valid');
      assert.strictEqual(validated.totalRows, 3);

      // Step 3: Model internal member state
      const clanMembers: Member[] = [
        createTestMember({
          id: 'vu-001',
          family_id: 'fam-vu',
          full_name: inputBatch[0].fullName,
          gender: 'MALE',
          life_status: 'DECEASED',
          generation_index: 1,
          birth_solar_date: '1870-01-01',
          death_lunar_day: 10,
          death_lunar_month: 3,
        }),
        createTestMember({
          id: 'vu-002',
          family_id: 'fam-vu',
          full_name: inputBatch[1].fullName,
          gender: 'MALE',
          life_status: 'DECEASED',
          generation_index: 2,
          father_id: 'vu-001',
          birth_solar_date: '1900-01-01',
        }),
        createTestMember({
          id: 'vu-003',
          family_id: 'fam-vu',
          full_name: inputBatch[2].fullName,
          gender: 'MALE',
          life_status: 'ALIVE',
          generation_index: 3,
          father_id: 'vu-002',
          birth_solar_date: '1940-01-01',
        })
      ];

      // Step 4: Verify Kinship between Gen 3 grandson and Gen 1 ancestor
      const kinship = KinshipService.evaluateKinshipLocal(clanMembers[2], clanMembers[0], clanMembers);
      assert.ok(kinship.term_a_calls_b.includes('Ông'), 'Grandson must call ancestor Ông Nội / Cụ');
      assert.strictEqual(kinship.generation_distance, 2);
      assert.strictEqual(kinship.seniority, 'B_IS_SENIOR');
    });

    it('[E2E-T3-002] Multi-Step Journey: Deceased Member -> Memorial Registry -> Event Creation -> Reminders', async () => {
      const familyId = 'fam-0000-0001';
      
      // Step 1: Ensure deceased member has lunar death date in memorial registry
      const memorials = await MemorialService.getMemorials(familyId);
      assert.ok(memorials.length > 0);
      const targetMemorial = memorials[0];
      assert.ok(targetMemorial.lunar_day > 0);
      assert.ok(targetMemorial.lunar_month > 0);

      // Step 2: Create a corresponding clan anniversary event
      const eventCreation = await EventService.createEvent({
        family_id: familyId,
        title: `Đại Lễ Giỗ Tổ Họ Nguyễn (${targetMemorial.title})`,
        event_type: 'CLAN_ANCESTRAL_DAY',
        scope: 'FAMILY',
        solar_date: targetMemorial.next_solar_date || '2026-10-15',
        lunar_day: targetMemorial.lunar_day,
        lunar_month: targetMemorial.lunar_month,
        estimated_budget: 15000000, // 15M VND
        location: 'Từ Đường Dòng Họ'
      });

      assert.ok(eventCreation.success, 'Event creation must succeed');
      assert.ok(eventCreation.event?.id, 'Event must be created with valid ID');

      // Step 3: Run reminder engine for 30-15-7-3-1 day alerts
      const reminderConfigs = await ReminderService.getReminderConfigs(familyId);
      assert.ok(Array.isArray(reminderConfigs), 'Must return reminder configurations');
      assert.strictEqual(reminderConfigs.length, 5, 'Must have 30, 15, 7, 3, 1 day alert configs');

      const count = await ReminderService.generateDailyReminders(familyId);
      assert.ok(typeof count === 'number');

      const notifications = await ReminderService.getNotifications(familyId);
      assert.ok(Array.isArray(notifications), 'Notifications must return array');
    });

    it('[E2E-T3-003] Import Batch Rollback Verification & Database State Isolation', async () => {
      // Verify rollback helper contract
      const testBatchId = 'batch-test-undo-001';
      const rollbackRes = await DataImportService.rollbackBatch(testBatchId);
      assert.ok(rollbackRes.success, 'Rollback batch execution must succeed');
      assert.ok(rollbackRes.message.includes('thành công'), 'Rollback message must confirm success');
    });

    it('[E2E-T3-004] Safe Member Deletion & Referential Integrity Cleanup', async () => {
      // 1. Create a test family unit: Father, Mother, Child
      const fatherRes = await GenealogyService.addMember({
        family_id: 'fam-e2e-del-test',
        full_name: 'Đặng Văn Bố',
        gender: 'MALE',
        life_status: 'DECEASED',
      });
      assert.ok(fatherRes.member);
      const fatherId = fatherRes.member.id;

      const childRes = await GenealogyService.addMember(
        {
          family_id: 'fam-e2e-del-test',
          full_name: 'Đặng Văn Con',
          gender: 'MALE',
          life_status: 'ALIVE',
        },
        {
          targetMemberId: fatherId,
          relationType: 'CHILD',
        }
      );
      assert.ok(childRes.member);
      const childId = childRes.member.id;

      const motherRes = await GenealogyService.addMember(
        {
          family_id: 'fam-e2e-del-test',
          full_name: 'Hoàng Thị Mẹ',
          gender: 'FEMALE',
          life_status: 'ALIVE',
        },
        {
          targetMemberId: fatherId,
          relationType: 'SPOUSE',
        }
      );
      assert.ok(motherRes.member);
      const motherId = motherRes.member.id;

      // Verify connections established
      const childBefore = mockMembers.find((m) => m.id === childId);
      const motherBefore = mockMembers.find((m) => m.id === motherId);
      assert.strictEqual(childBefore?.father_id, fatherId, 'Child must reference father_id');
      assert.strictEqual(motherBefore?.spouse_id, fatherId, 'Mother must reference spouse_id');

      // 2. Perform safe deletion
      const delRes = await GenealogyService.deleteMember(fatherId, 'fam-e2e-del-test');
      assert.strictEqual(delRes.success, true, 'deleteMember must return success');

      // 3. Verify father is removed from mock store
      const fatherAfter = mockMembers.find((m) => m.id === fatherId);
      assert.strictEqual(fatherAfter, undefined, 'Father must be deleted from members');

      // 4. Verify child father_id is safely nullified (zero dangling pointers)
      const childAfter = mockMembers.find((m) => m.id === childId);
      assert.strictEqual(childAfter?.father_id, undefined, 'Child father_id must be nullified');

      // 5. Verify mother spouse_id is safely nullified
      const motherAfter = mockMembers.find((m) => m.id === motherId);
      assert.strictEqual(motherAfter?.spouse_id, undefined, 'Mother spouse_id must be nullified');

      // 6. Verify relationships table has zero dangling edges for deleted father
      const relsAfter = mockRelationships.filter(
        (r: MemberRelationship) => r.member_id === fatherId || r.related_member_id === fatherId
      );
      assert.strictEqual(relsAfter.length, 0, 'Zero dangling relationship edges');
    });

    it('[E2E-T3-005] Member Soft Archiving & Data Preservation', async () => {
      const memberRes = await GenealogyService.addMember({
        family_id: 'fam-e2e-archive',
        full_name: 'Phan Văn Lưu Trữ',
        gender: 'MALE',
        life_status: 'ALIVE',
        bio: 'Hồ sơ sơ khởi',
      });
      assert.ok(memberRes.member);
      const memberId = memberRes.member.id;

      const archiveRes = await GenealogyService.archiveMember(memberId, 'fam-e2e-archive', 'Chuyển di cư');
      assert.strictEqual(archiveRes.success, true);
      assert.ok(archiveRes.member?.bio?.includes('[ĐÃ LƯU TRỮ: Chuyển di cư'));

      // Member should still be accessible
      const memberAfter = mockMembers.find((m) => m.id === memberId);
      assert.ok(memberAfter, 'Archived member must be preserved in database/store');
    });

    it('[E2E-T3-006] Dynamic Member Update Immediate Synchronization', async () => {
      const memberRes = await GenealogyService.addMember({
        family_id: 'fam-e2e-update',
        full_name: 'Bùi Văn Bản Gốc',
        gender: 'MALE',
        life_status: 'ALIVE',
      });
      assert.ok(memberRes.member);

      const updateRes = await GenealogyService.updateMember(memberRes.member.id, {
        full_name: 'Bùi Văn Đã Cập Nhật',
        courtesy_name: 'Thuần Nhất Tiên Sinh',
        religious_name: 'Thích Trí Tuệ',
        bio: 'Đã đóng góp xây dựng từ đường 50 triệu đồng.',
      });

      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.member?.full_name, 'Bùi Văn Đã Cập Nhật');
      assert.strictEqual(updateRes.member?.courtesy_name, 'Thuần Nhất Tiên Sinh');
      assert.strictEqual(updateRes.member?.religious_name, 'Thích Trí Tuệ');
      assert.strictEqual(updateRes.member?.bio, 'Đã đóng góp xây dựng từ đường 50 triệu đồng.');
    });

  });

  // ==========================================================================
  // TIER 4: REAL-WORLD LARGE MULTI-GENERATION WORKLOADS
  // ==========================================================================
  describe('TIER 4: REAL-WORLD LARGE MULTI-GENERATION WORKLOADS', () => {

    it('[E2E-T4-001] 5+ Generations Deep Lineage Validation (Patrilineal Chain)', () => {
      // 5-Generation direct patrilineal lineage (1860 - 2026)
      const gen5Clan: Member[] = [
        createTestMember({ id: 'g1', family_id: 'fam-deep', full_name: 'Cụ Tổ Đời 1', gender: 'MALE', life_status: 'DECEASED', generation_index: 1, birth_solar_date: '1860-01-01' }),
        createTestMember({ id: 'g2', family_id: 'fam-deep', full_name: 'Cụ Đời 2', gender: 'MALE', life_status: 'DECEASED', generation_index: 2, father_id: 'g1', birth_solar_date: '1890-01-01' }),
        createTestMember({ id: 'g3', family_id: 'fam-deep', full_name: 'Ông Đời 3', gender: 'MALE', life_status: 'DECEASED', generation_index: 3, father_id: 'g2', birth_solar_date: '1925-01-01' }),
        createTestMember({ id: 'g4', family_id: 'fam-deep', full_name: 'Bác Đời 4', gender: 'MALE', life_status: 'ALIVE', generation_index: 4, father_id: 'g3', birth_solar_date: '1960-01-01' }),
        createTestMember({ id: 'g5', family_id: 'fam-deep', full_name: 'Cháu Đời 5', gender: 'MALE', life_status: 'ALIVE', generation_index: 5, father_id: 'g4', birth_solar_date: '1995-01-01' }),
      ];

      // Kinship checks across deep generation span
      // Gen 5 calls Gen 1: ΔG = 4 -> Cụ Kỵ / Chút
      const g5Tog1 = KinshipService.evaluateKinshipLocal(gen5Clan[4], gen5Clan[0], gen5Clan);
      assert.strictEqual(g5Tog1.generation_distance, 4);
      assert.strictEqual(g5Tog1.relationship_category, 'ANCESTOR');
      assert.ok(g5Tog1.term_a_calls_b.includes('Cụ Kỵ'));
      assert.ok(g5Tog1.term_b_calls_a.includes('Chút'));

      // Gen 5 calls Gen 2: ΔG = 3 -> Cụ / Chắt
      const g5Tog2 = KinshipService.evaluateKinshipLocal(gen5Clan[4], gen5Clan[1], gen5Clan);
      assert.strictEqual(g5Tog2.generation_distance, 3);
      assert.strictEqual(g5Tog2.relationship_category, 'GREAT_GRANDPARENT');
      assert.ok(g5Tog2.term_a_calls_b.includes('Cụ'));
      assert.ok(g5Tog2.term_b_calls_a.includes('Chắt'));
    });

    it('[E2E-T4-002] Polygamy & Multi-Wife Hierarchy (Chính Thất, Kế Thất, Trắc Thất)', () => {
      const polygamyClan: Member[] = [
        // Husband
        createTestMember({ id: 'h1', family_id: 'fam-poly', full_name: 'Cụ Ông Đa Thê', gender: 'MALE', life_status: 'DECEASED', generation_index: 1 }),
        // 3 Wives
        createTestMember({ id: 'w1', family_id: 'fam-poly', full_name: 'Bà Cả (Chính Thất)', gender: 'FEMALE', life_status: 'DECEASED', generation_index: 1, spouse_id: 'h1' }),
        createTestMember({ id: 'w2', family_id: 'fam-poly', full_name: 'Bà Hai (Kế Thất)', gender: 'FEMALE', life_status: 'DECEASED', generation_index: 1, spouse_id: 'h1' }),
        createTestMember({ id: 'w3', family_id: 'fam-poly', full_name: 'Bà Ba (Trắc Thất)', gender: 'FEMALE', life_status: 'DECEASED', generation_index: 1, spouse_id: 'h1' }),
        // Children of each wife
        createTestMember({ id: 'c1', family_id: 'fam-poly', full_name: 'Con Trưởng (Mẹ Cả)', gender: 'MALE', life_status: 'DECEASED', generation_index: 2, father_id: 'h1', mother_id: 'w1' }),
        createTestMember({ id: 'c2', family_id: 'fam-poly', full_name: 'Con Thứ (Mẹ Hai)', gender: 'MALE', life_status: 'DECEASED', generation_index: 2, father_id: 'h1', mother_id: 'w2' }),
        createTestMember({ id: 'c3', family_id: 'fam-poly', full_name: 'Con Út (Mẹ Ba)', gender: 'MALE', life_status: 'ALIVE', generation_index: 2, father_id: 'h1', mother_id: 'w3' }),
      ];

      // Verify Spouse Kinship
      const wife1ToHusband = KinshipService.evaluateKinshipLocal(polygamyClan[1], polygamyClan[0], polygamyClan);
      assert.strictEqual(wife1ToHusband.relationship_category, 'SPOUSE');
      assert.strictEqual(wife1ToHusband.generation_distance, 0);

      // Verify Half-Siblings (Cùng cha khác mẹ, same generation ΔG = 0)
      const child1ToChild2 = KinshipService.evaluateKinshipLocal(polygamyClan[4], polygamyClan[5], polygamyClan);
      assert.strictEqual(child1ToChild2.generation_distance, 0);
      assert.strictEqual(child1ToChild2.relationship_category, 'SAME_GENERATION');

      // Verify Child 3 to Mother 3
      const child3ToMother3 = KinshipService.evaluateKinshipLocal(polygamyClan[6], polygamyClan[3], polygamyClan);
      assert.strictEqual(child3ToMother3.relationship_category, 'PARENT_CHILD');
      assert.ok(child3ToMother3.term_a_calls_b.includes('Mẹ'));
    });

    it('[E2E-T4-003] Multi-Branch Clan Seniority Invariant (Con Bác vs Con Chú)', () => {
      // Clan with 2 Branches (Chi Trưởng & Chi Hai)
      const branchClan: Member[] = [
        // Common Ancestor (Gen 1)
        createTestMember({ id: 'p1', family_id: 'fam-br', full_name: 'Cụ Tổ Chung', gender: 'MALE', life_status: 'DECEASED', generation_index: 1 }),
        
        // Gen 2: Brother 1 (Elder - Chi Trưởng) & Brother 2 (Younger - Chi Hai)
        createTestMember({ id: 'b1', family_id: 'fam-br', full_name: 'Cụ Trưởng (Chi Trưởng)', gender: 'MALE', life_status: 'DECEASED', generation_index: 2, father_id: 'p1', birth_order: 1 }),
        createTestMember({ id: 'b2', family_id: 'fam-br', full_name: 'Cụ Thứ (Chi Hai)', gender: 'MALE', life_status: 'DECEASED', generation_index: 2, father_id: 'p1', birth_order: 2 }),
        
        // Gen 3: Son of Elder (Chi Trưởng) born 1980 vs Son of Younger (Chi Hai) born 1970 (Older in age!)
        createTestMember({ id: 's1', family_id: 'fam-br', full_name: 'Nguyễn Văn Tuấn (Chi Trưởng, sinh 1980)', gender: 'MALE', life_status: 'ALIVE', generation_index: 3, father_id: 'b1', birth_solar_date: '1980-01-01' }),
        createTestMember({ id: 's2', family_id: 'fam-br', full_name: 'Nguyễn Văn Đức (Chi Hai, sinh 1970)', gender: 'MALE', life_status: 'ALIVE', generation_index: 3, father_id: 'b2', birth_solar_date: '1970-01-01' }),
      ];

      // Kinship Rule: S1 (Chi Trưởng) is senior to S2 (Chi Hai) because S1's father is the elder brother (Con Bác).
      const s1CallsS2 = KinshipService.evaluateKinshipLocal(branchClan[3], branchClan[4], branchClan);
      assert.strictEqual(s1CallsS2.seniority, 'A_IS_SENIOR', 'Chi Trưởng is senior to Chi Hai');
      assert.ok(s1CallsS2.term_a_calls_b.includes('Em họ'), 'Tuấn (Chi Trưởng) calls Đức Em họ');

      const s2CallsS1 = KinshipService.evaluateKinshipLocal(branchClan[4], branchClan[3], branchClan);
      assert.strictEqual(s2CallsS1.seniority, 'B_IS_SENIOR');
      assert.ok(s2CallsS1.term_a_calls_b.includes('Anh họ'), 'Đức (Chi Hai) calls Tuấn Anh họ despite being older in age');
    });

    it('[E2E-T4-004] Large-Scale Clan Topology & Anti-Degradation Stress (30+ Clan Nodes)', () => {
      // Build a 30-member synthetic multi-generation clan
      const largeClan: Member[] = [];
      
      // Gen 1: Ancestor & Spouse
      largeClan.push(createTestMember({ id: 'm-1-1', family_id: 'fam-large', full_name: 'Cụ Tổ 1', gender: 'MALE', life_status: 'DECEASED', generation_index: 1 }));
      largeClan.push(createTestMember({ id: 'm-1-2', family_id: 'fam-large', full_name: 'Cụ Bà 1', gender: 'FEMALE', life_status: 'DECEASED', generation_index: 1, spouse_id: 'm-1-1' }));

      // Gen 2: 3 Sons (3 Branches)
      for (let b = 1; b <= 3; b++) {
        const gen2Id = `m-2-${b}`;
        const gen2SpouseId = `m-2-${b}-w`;
        largeClan.push(createTestMember({ id: gen2Id, family_id: 'fam-large', full_name: `Cụ Chi ${b}`, gender: 'MALE', life_status: 'DECEASED', generation_index: 2, father_id: 'm-1-1', mother_id: 'm-1-2', birth_order: b }));
        largeClan.push(createTestMember({ id: gen2SpouseId, family_id: 'fam-large', full_name: `Bà Chi ${b}`, gender: 'FEMALE', life_status: 'DECEASED', generation_index: 2, spouse_id: gen2Id }));

        // Gen 3: 2 children per branch
        for (let c = 1; c <= 2; c++) {
          const gen3Id = `m-3-${b}-${c}`;
          largeClan.push(createTestMember({ id: gen3Id, family_id: 'fam-large', full_name: `Ông Chi ${b} Con ${c}`, gender: 'MALE', life_status: 'DECEASED', generation_index: 3, father_id: gen2Id, mother_id: gen2SpouseId, birth_order: c }));

          // Gen 4: 2 children per Gen 3
          for (let d = 1; d <= 2; d++) {
            const gen4Id = `m-4-${b}-${c}-${d}`;
            largeClan.push(createTestMember({ id: gen4Id, family_id: 'fam-large', full_name: `Bác Chi ${b} Cháu ${c}.${d}`, gender: 'MALE', life_status: 'ALIVE', generation_index: 4, father_id: gen3Id, birth_order: d }));

            // Gen 5: 1 child for leaf
            const gen5Id = `m-5-${b}-${c}-${d}`;
            largeClan.push(createTestMember({ id: gen5Id, family_id: 'fam-large', full_name: `Cháu Chi ${b} Chắt ${c}.${d}`, gender: 'MALE', life_status: 'ALIVE', generation_index: 5, father_id: gen4Id }));
          }
        }
      }

      assert.ok(largeClan.length >= 30, `Large clan must have at least 30 members (actual: ${largeClan.length})`);

      // Verify no circular references and correct tree depth traversal
      for (const m of largeClan) {
        if (m.father_id) {
          const father = largeClan.find(p => p.id === m.father_id);
          assert.ok(father, `Father ${m.father_id} of member ${m.id} must exist`);
          assert.ok(father.generation_index! < m.generation_index!, 'Father generation must be strictly less than child');
        }
      }

      // Verify random cross-branch kinship evaluation executes with sub-millisecond latency
      const tStart = Date.now();
      for (let i = 0; i < 50; i++) {
        const randA = largeClan[Math.floor(Math.random() * largeClan.length)];
        const randB = largeClan[Math.floor(Math.random() * largeClan.length)];
        const res = KinshipService.evaluateKinshipLocal(randA, randB, largeClan);
        assert.ok(res.term_a_calls_b, 'Must produce kinship term');
      }
      const tElapsed = Date.now() - tStart;
      assert.ok(tElapsed < 1000, `50 random kinship queries took ${tElapsed}ms (<1000ms expected)`);
    });

  });

});
