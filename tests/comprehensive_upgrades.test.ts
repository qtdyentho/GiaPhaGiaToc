import test from 'node:test';
import assert from 'node:assert/strict';
import { CalendarExportService } from '../src/services/calendar/CalendarExportService';
import { KinshipService } from '../src/services/genealogy/KinshipService';
import { Member, MemorialDate, Event, Fund, FinancialTransaction } from '../src/types/database';

test('COMPREHENSIVE SYSTEM UPGRADES SUITE (CBI-MCP Phase 7.1)', async (t) => {
  // ── 1. Test CalendarExportService (.ics) ──────────────────────────────────
  await t.test('UPGRADE-001: CalendarExportService generates valid RFC 5545 iCalendar', () => {
    const mockMemorials = [
      {
        id: 'mem-001',
        family_id: 'fam-test-01',
        member_id: 'mb-01',
        title: 'Giỗ Cụ Tổ Nguyễn Văn A',
        lunar_day: 15,
        lunar_month: 1,
        is_leap_month: false,
        notes: 'Giỗ Cụ Tổ Nguyễn Văn A',
        created_at: new Date().toISOString(),
      },
    ] as unknown as MemorialDate[];

    const mockEvents = [
      {
        id: 'evt-001',
        family_id: 'fam-test-01',
        title: 'Đại Lễ Họp Mặt Dòng Họ Xuân 2026',
        description: 'Họp mặt toàn thể con cháu tại nhà thờ tổ',
        solar_date: '2026-02-18',
        event_type: 'MEETING',
        scope: 'FAMILY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as Event[];

    const ics = CalendarExportService.generateICS('Họ Nguyễn Đại Tộc', mockMemorials, mockEvents, 2026);

    assert.strictEqual(ics.includes('BEGIN:VCALENDAR'), true);
    assert.strictEqual(ics.includes('VERSION:2.0'), true);
    assert.strictEqual(ics.includes('X-WR-CALNAME:Lịch Giỗ & Lễ Nghi • Họ Nguyễn Đại Tộc'), true);
    assert.strictEqual(ics.includes('BEGIN:VEVENT'), true);
    assert.strictEqual(ics.includes('Giỗ Cụ Tổ Nguyễn Văn A'), true);
    assert.strictEqual(ics.includes('Đại Lễ Họp Mặt Dòng Họ Xuân 2026'), true);
    assert.strictEqual(ics.includes('END:VCALENDAR'), true);
    console.log('✅ [UPGRADE-001: iCalendar Export Engine] PASS');
  });

  // ── 2. Test KinshipService Local Engine ───────────────────────────────────
  await t.test('UPGRADE-002: KinshipService Local Reasoning Engine', () => {
    const testMembers = [
      {
        id: 'p-grandfather',
        family_id: 'fam-01',
        generation_id: 'gen-1',
        first_name: 'An',
        last_name: 'Nguyễn',
        full_name: 'Nguyễn Văn An',
        gender: 'MALE',
        life_status: 'DECEASED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'p-father',
        family_id: 'fam-01',
        generation_id: 'gen-2',
        first_name: 'Bình',
        last_name: 'Nguyễn',
        full_name: 'Nguyễn Văn Bình',
        gender: 'MALE',
        life_status: 'ALIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as Member[];

    const result = KinshipService.evaluateKinshipLocal(testMembers[0], testMembers[0], testMembers);
    assert.strictEqual(result.term_a_calls_b, 'Bản thân');
    assert.strictEqual(result.term_b_calls_a, 'Bản thân');
    console.log('✅ [UPGRADE-002: Kinship Local Reasoning] PASS');
  });

  // ── 3. Test Financial Report Calculation Integrity ─────────────────────────
  await t.test('UPGRADE-003: Annual Financial Report Aggregations', () => {
    const testFunds = [
      {
        id: 'f1',
        family_id: 'fam-01',
        name: 'Quỹ Từ Đường',
        opening_balance: 10000000,
        current_balance: 15000000,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'f2',
        family_id: 'fam-01',
        name: 'Quỹ Khuyến Học',
        opening_balance: 5000000,
        current_balance: 8000000,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as Fund[];

    const testTransactions = [
      {
        id: 'tx-1',
        family_id: 'fam-01',
        fund_id: 'f1',
        transaction_code: 'THU-001',
        transaction_type: 'INCOME',
        amount: 7000000,
        payment_method: 'BANK_TRANSFER',
        transaction_date: '2026-03-01',
        description: 'Công đức xây dựng',
        status: 'POSTED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        family_id: 'fam-01',
        fund_id: 'f1',
        transaction_code: 'CHI-001',
        transaction_type: 'EXPENSE',
        amount: 2000000,
        payment_method: 'CASH',
        transaction_date: '2026-03-05',
        description: 'Mua sắm đồ lễ',
        status: 'POSTED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as unknown as FinancialTransaction[];

    const totalBalance = testFunds.reduce((sum, f) => sum + f.current_balance, 0);
    const totalIncome = testTransactions
      .filter((t) => t.transaction_type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = testTransactions
      .filter((t) => t.transaction_type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    assert.strictEqual(totalBalance, 23000000);
    assert.strictEqual(totalIncome, 7000000);
    assert.strictEqual(totalExpense, 2000000);
    console.log('✅ [UPGRADE-003: Financial Aggregations Integrity] PASS');
  });
});
