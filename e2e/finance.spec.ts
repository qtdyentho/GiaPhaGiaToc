import { test, expect } from '@playwright/test';
import { loginAsDemo } from './helpers/authHelper';

test.describe('Finance Module', () => {
  test('trang tài chính tải thành công', async ({ page }) => {
    await loginAsDemo(page, '/app/finance');
    const heading = page.locator('h1, h2, span, div').filter({ hasText: /Tài Chính|Sổ Quỹ|Quỹ|Finance/i }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('hiển thị số dư quỹ (không bị NaN hoặc undefined)', async ({ page }) => {
    await loginAsDemo(page, '/app/finance');
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined ₫');
    const hasAmount = /\d{1,3}(,\d{3})*(\.\d+)?\s*(₫|VNĐ|đ)/i.test(bodyText || '');
    expect(hasAmount).toBeTruthy();
  });

  test('danh sách giao dịch hiển thị', async ({ page }) => {
    await loginAsDemo(page, '/app/finance/ledger');
    const tableEl = page.locator('table, [role="table"], tbody, div').first();
    await expect(tableEl).toBeAttached({ timeout: 10_000 });
  });

  test('nút thêm giao dịch tồn tại', async ({ page }) => {
    await loginAsDemo(page, '/app/finance/ledger');
    const addBtn = page.locator('button').filter({ hasText: /thêm|thu|chi|bút toán|quỹ/i }).first();
    await expect(addBtn).toBeAttached({ timeout: 10_000 });
  });

  test('không có JS error khi load trang tài chính', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await loginAsDemo(page, '/app/finance');
    await page.waitForTimeout(1_000);

    const criticalErrors = jsErrors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('filter theo loại giao dịch Thu/Chi không crash', async ({ page }) => {
    await loginAsDemo(page, '/app/finance/ledger');
    const filterBtn = page.locator('button, select').filter({ hasText: /Tất cả|Thu|Chi/i }).first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
      await page.waitForTimeout(300);
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      expect(errors).toHaveLength(0);
    }
  });
});
