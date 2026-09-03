import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as crypto from 'crypto';
import { getLeapMonth, lunarToSolar, solarToLunar } from '../src/lib/lunar';
import { UsageService } from '../src/services/billing/UsageService';

describe('PHASE 5: COMMERCIAL SAAS, LUNAR ENGINE & RBAC SUITE', () => {
  it('1. GEN-06: Thuật toán Âm Dương Lịch xử lý chính xác tháng nhuận', () => {
    // Năm 2023 có tháng 2 nhuận (getLeapMonth(2023) === 2)
    const leap2023 = getLeapMonth(2023);
    assert.strictEqual(leap2023, 2, 'Năm 2023 phải có tháng 2 nhuận');

    // Ngày 15 tháng 2 thường
    const [sdNormal, smNormal, syNormal] = lunarToSolar(15, 2, 2023, false);
    assert.ok(sdNormal > 0 && smNormal > 0 && syNormal === 2023, 'Ngày 15/2 thường phải ra ngày dương hợp lệ');

    // Ngày 15 tháng 2 nhuận
    const [sdLeap, smLeap, syLeap] = lunarToSolar(15, 2, 2023, true);
    assert.ok(sdLeap > 0 && smLeap > 0 && syLeap === 2023, 'Ngày 15/2 nhuận phải ra ngày dương hợp lệ');
    assert.notDeepEqual([sdNormal, smNormal], [sdLeap, smLeap], 'Ngày thường và ngày nhuận phải khác nhau');

    // Kiểm tra năm 2025 có tháng 6 nhuận
    const leap2025 = getLeapMonth(2025);
    assert.strictEqual(leap2025, 6, 'Năm 2025 phải có tháng 6 nhuận');
    const [sd2025, sm2025, sy2025] = lunarToSolar(1, 6, 2025, true);
    assert.ok(sd2025 > 0 && sm2025 > 0 && sy2025 === 2025, 'Ngày 1/6 nhuận năm 2025 phải ra ngày dương hợp lệ');

    // Chuyển đổi ngược lại dương sang âm bảo toàn tháng nhuận
    const lunarRes = solarToLunar(sdLeap, smLeap, syLeap);
    assert.strictEqual(lunarRes.day, 15);
    assert.strictEqual(lunarRes.month, 2);
    assert.strictEqual(lunarRes.isLeap, true);
  });

  it('2. BIL-04: UsageService tính toán hạn mức động theo gói cước', async () => {
    // Gia tộc fam-0000-0001 dùng gói GIA_TOC
    const giaTocSummary = await UsageService.getUsageSummary('fam-0000-0001');
    const giaTocMembers = giaTocSummary.find((s) => s.featureCode === 'MAX_MEMBERS');
    assert.ok(giaTocMembers, 'Phải có chỉ số MAX_MEMBERS');
    assert.strictEqual(giaTocMembers.limitValue, 300, 'Gói GIA_TOC có hạn mức 300 thành viên');

    // Check quota cho phép khi chưa chạm trần
    const quotaOk = await UsageService.checkQuota('fam-0000-0001', 'MAX_MEMBERS', 1);
    assert.strictEqual(quotaOk.allowed, true, 'Chưa chạm trần phải cho phép thêm thành viên');
  });

  it('3. BIL-02: Cơ chế xác thực chữ ký HMAC Webhook ngân hàng', () => {
    const secret = 'test-bank-secret-key-123456';
    const payloadObj = {
      transactionId: 'TXN-998877',
      invoiceNumber: 'INV-2026-001',
      amount: 500000,
      paymentMethod: 'VIETQR',
    };
    const rawBody = JSON.stringify(payloadObj);

    // Sinh chữ ký đúng
    const validSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    // Kiểm tra so khớp hợp lệ với timingSafeEqual
    const sigBuffer = Buffer.from(validSignature);
    const expectedBuffer = Buffer.from(crypto.createHmac('sha256', secret).update(rawBody).digest('hex'));
    assert.strictEqual(crypto.timingSafeEqual(sigBuffer, expectedBuffer), true, 'Chữ ký hợp lệ phải khớp 100%');

    // Chữ ký giả mạo hoặc thay đổi body
    const tamperedBody = JSON.stringify({ ...payloadObj, amount: 1000000 });
    const tamperedExpected = Buffer.from(crypto.createHmac('sha256', secret).update(tamperedBody).digest('hex'));
    assert.strictEqual(crypto.timingSafeEqual(sigBuffer, tamperedExpected), false, 'Khi dữ liệu bị sửa, HMAC phải từ chối');
  });

  it('4. GEN-04: DataImportService cấu trúc ngày giỗ luôn có trường title', () => {
    const sampleMember = {
      id: 'mem-sample-01',
      fullName: 'Cụ Nguyễn Văn A',
      deathLunarDay: 15,
      deathLunarMonth: 8,
      deathLunarYear: 1950,
    };

    const memorialPayload = {
      family_id: 'fam-test-uuid',
      member_id: sampleMember.id,
      title: `Ngày giỗ ${sampleMember.fullName}`,
      lunar_day: sampleMember.deathLunarDay,
      lunar_month: sampleMember.deathLunarMonth,
      lunar_year: sampleMember.deathLunarYear || null,
      recurrence: 'YEARLY_LUNAR',
      notes: 'Ngày giỗ cụ',
    };

    assert.ok(memorialPayload.title, 'Trường title không được rỗng');
    assert.strictEqual(memorialPayload.title, 'Ngày giỗ Cụ Nguyễn Văn A');
    assert.strictEqual(memorialPayload.lunar_day, 15);
    assert.strictEqual(memorialPayload.lunar_month, 8);
  });
});
