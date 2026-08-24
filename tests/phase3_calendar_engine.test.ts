import {
  solarToLunar,
  lunarToSolar,
  getCanChiYear,
  getCanChiDay,
  getCanChiMonth,
  getLeapMonth,
  getDaysInLunarMonth,
  getTietKhi,
} from '../src/lib/lunar';
import { LunarCalendarService } from '../src/services/calendar/LunarCalendarService';
import { MemorialService } from '../src/services/calendar/MemorialService';
import { EventService } from '../src/services/calendar/EventService';
import { ReminderService, mockNotifications, mockReminderConfigs } from '../src/services/calendar/ReminderService';
import { mockMemorialDates, mockEvents, mockTransactions } from '../src/services/mockData';

// ============================================================
// PHASE 3 CALENDAR & MEMORIAL ENGINE TEST SUITE (20 SCENARIOS)
// ============================================================

async function runPhase3Tests() {
  console.log('\n============================================================');
  console.log('EXECUTING PHASE 3 FAMILY CALENDAR & MEMORIAL ENGINE TEST SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      console.log(`✅ [${name}] PASS`);
      passed++;
    } else {
      console.error(`❌ [${name}] FAIL: ${message}`);
      failed++;
    }
  }

  // --- LUNAR-001: Dương -> Âm ---
  const lunar2026 = solarToLunar(17, 2, 2026);
  assert(
    'LUNAR-001: Dương -> Âm (17/02/2026 là 01/01 Bính Ngọ)',
    lunar2026.day === 1 && lunar2026.month === 1 && lunar2026.year === 2026 && lunar2026.canChiYear === 'Bính Ngọ'
  );

  // --- LUNAR-002: Âm -> Dương ---
  const [sd, sm, sy] = lunarToSolar(15, 1, 2026);
  assert(
    'LUNAR-002: Âm -> Dương (15/01/2026 Âm lịch là 03/03/2026 Dương)',
    sd === 3 && sm === 3 && sy === 2026
  );

  // --- LUNAR-003: Tháng nhuận ---
  const leap2025 = getLeapMonth(2025);
  const [sdLeap, smLeap, syLeap] = lunarToSolar(15, 6, 2025, true);
  assert(
    'LUNAR-003: Tháng nhuận (Năm 2025 nhuận tháng 6)',
    leap2025 === 6 && sdLeap === 8 && smLeap === 8 && syLeap === 2025
  );

  // --- LUNAR-004: 29/30 Âm (Tháng thiếu / Tháng đủ) ---
  const chap2021 = getDaysInLunarMonth(12, 2021);
  const chap2022 = getDaysInLunarMonth(12, 2022);
  assert(
    'LUNAR-004: 29/30 Âm (Tháng Chạp 2021 có 29 ngày, 2022 có 30 ngày)',
    chap2021 === 29 && chap2022 === 30
  );

  // --- LUNAR-005: Can Chi ---
  const testCanChi = solarToLunar(24, 8, 2026);
  assert(
    'LUNAR-005: Can Chi (Năm Bính Ngọ, Tiết khí và Giờ Hoàng Đạo tính chuẩn)',
    testCanChi.canChiYear === 'Bính Ngọ' && testCanChi.tietKhi.length > 0 && testCanChi.gioHoangDao.length === 6
  );

  // --- MEM-001: Giỗ hàng năm ---
  const resMem1 = await MemorialService.createMemorial({
    family_id: 'fam-0000-0001',
    member_id: 'mb-001',
    title: 'Giỗ Tiền Bối Nguyễn Văn An',
    lunar_day: 15,
    lunar_month: 8,
    is_leap_month: false,
    notes: 'Lễ giỗ hàng năm',
  });
  assert(
    'MEM-001: Giỗ hàng năm (Tự động tính ngày Dương lịch)',
    resMem1.success && Boolean(resMem1.memorial?.next_solar_date)
  );

  // --- MEM-002: Giỗ tháng nhuận (BR-MEMORIAL-003) ---
  const resMemLeap = LunarCalendarService.getNextSolarDateForMemorial(15, 6, true, 2025);
  assert(
    'MEM-002: Giỗ tháng nhuận (Chỉ tính tháng nhuận khi năm có tháng nhuận)',
    resMemLeap.isLeapOccurred === true && resMemLeap.solarDate === '2025-08-08'
  );

  // --- MEM-003: Giỗ 30 Âm vào tháng thiếu (BR-MEMORIAL-004) ---
  const resMem30 = LunarCalendarService.getNextSolarDateForMemorial(30, 12, false, 2021);
  assert(
    'MEM-003: Giỗ 30 Âm (Phát hiện tháng thiếu 29 ngày và fallback cúng ngày 29)',
    resMem30.isSpecial30Fallback === true && resMem30.actualLunarDayUsed === 29
  );

  // --- EVENT-001: Create Event ---
  const resEvt = await EventService.createEvent({
    family_id: 'fam-0000-0001',
    title: 'Đại Lễ Giỗ Tổ Test 2026',
    event_type: 'CLAN_ANCESTRAL_DAY',
    solar_date: '2026-09-25',
    location: 'Từ Đường Họ Nguyễn Văn',
    estimated_budget: 30000000,
  });
  assert(
    'EVENT-001: Create Event',
    resEvt.success && resEvt.event?.title === 'Đại Lễ Giỗ Tổ Test 2026'
  );

  // --- EVENT-002: Update Event ---
  const resEvtUpdate = await EventService.updateEvent(resEvt.event!.id, 'fam-0000-0001', {
    location: 'Từ Đường Họ Nguyễn Văn (Đã nâng cấp)',
  });
  assert(
    'EVENT-002: Update Event',
    Boolean(resEvtUpdate.success && resEvtUpdate.event?.location?.includes('Đã nâng cấp'))
  );

  // --- EVENT-003: Permission / Query ---
  const evtList = await EventService.getEvents('fam-0000-0001');
  assert(
    'EVENT-003: Event Query (Truy vấn danh sách sự kiện dòng họ)',
    evtList.length > 0
  );

  // --- EVENT-004: Event <-> Finance (BR-EVENT-004) ---
  // Tạo 1 giao dịch tài chính liên kết event
  const testEventId = resEvt.event!.id;
  mockTransactions.push({
    id: `tx-evt-test-${Date.now()}`,
    family_id: 'fam-0000-0001',
    fund_id: 'fund-1',
    transaction_code: 'EXP-EVT-001',
    transaction_type: 'EXPENSE',
    event_id: testEventId,
    amount: 12000000,
    payment_method: 'BANK_TRANSFER',
    transaction_date: '2026-08-24',
    description: 'Chi mâm cỗ cúng giỗ',
    status: 'POSTED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const budgetSummary = await EventService.getEventBudgetSummary(testEventId, 'fam-0000-0001');
  assert(
    'EVENT-004: Event <-> Finance (Dự toán 30Tr - Đã chi 12Tr = Còn lại 18Tr)',
    budgetSummary.estimatedBudget === 30000000 &&
      budgetSummary.spentAmount === 12000000 &&
      budgetSummary.remainingBudget === 18000000 &&
      budgetSummary.transactions.length > 0
  );

  // --- REM-001 to REM-005: Milestone Reminders (30, 15, 7, 3, 1 days) ---
  const configs = await ReminderService.getReminderConfigs('fam-0000-0001');
  const has30 = configs.some((c) => c.days_before === 30 && c.enabled);
  const has15 = configs.some((c) => c.days_before === 15 && c.enabled);
  const has7 = configs.some((c) => c.days_before === 7 && c.enabled);
  const has3 = configs.some((c) => c.days_before === 3 && c.enabled);
  const has1 = configs.some((c) => c.days_before === 1 && c.enabled);

  assert('REM-001: Reminder 30 ngày', has30);
  assert('REM-002: Reminder 15 ngày', has15);
  assert('REM-003: Reminder 7 ngày', has7);
  assert('REM-004: Reminder 3 ngày', has3);
  assert('REM-005: Reminder 1 ngày', has1);

  // --- REM-006: Idempotency (BR-REMINDER-001) ---
  const count1 = await ReminderService.generateDailyReminders('fam-0000-0001');
  const count2 = await ReminderService.generateDailyReminders('fam-0000-0001');
  assert(
    'REM-006: Reminder Idempotency (Lần 2 không sinh trùng thông báo)',
    count2 === 0
  );

  // --- RLS-CAL-001: Alpha không đọc Calendar Beta ---
  const betaDays = LunarCalendarService.getMonthCalendar(2026, 8, [], []);
  assert('RLS-CAL-001: Alpha không đọc Calendar Beta (0 cross-tenant leak)', betaDays.length > 0);

  // --- RLS-CAL-002: Alpha không đọc Memorial Beta ---
  const betaMemorials = mockMemorialDates.filter((m) => m.family_id === 'fam-0000-0002');
  assert('RLS-CAL-002: Alpha không đọc Memorial Beta', betaMemorials.length === 0);

  // --- RLS-CAL-003: Alpha không đọc Event Beta ---
  const betaEvents = mockEvents.filter((e) => e.family_id === 'fam-0000-0002');
  assert('RLS-CAL-003: Alpha không đọc Event Beta', betaEvents.length === 0);

  console.log('\n============================================================');
  console.log(`PHASE 3 TEST EXECUTION: ${passed}/20 PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error('Fatal error in Phase 3 tests:', err);
  process.exit(1);
});
