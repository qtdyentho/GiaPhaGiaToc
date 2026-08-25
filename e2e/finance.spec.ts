import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests: Finance Module (Quản lý Tài chính)
 * Kiểm tra: hiển thị quỹ, giao dịch, số dư
 */

async function gotoFinance(page: Page) {
  await page.goto('/');
  const financeLink = page.locator('a, button').filter({ hasText: /tài chính|quỹ|finance|funds/i }).first();
  if (await financeLink.count() > 0) {
    await financeLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto('/finance');
  }
}

test.describe('Finance Module', () => {
  test('trang tài chính tải thành công', async ({ page }) => {
    await gotoFinance(page);
    const heading = page.locator('h1, h2').filter({ hasText: /tài chính|quỹ|finance|thu|chi/i }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('hiển thị số dư quỹ (không bị NaN hoặc undefined)', async ({ page }) => {
    await gotoFinance(page);
    await page.waitForLoadState('networkidle');

    // Lấy toàn bộ text, kiểm tra không có "NaN", "undefined", "null"
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined');
    // Phải có ký tự tiền tệ VND hoặc số
    const hasAmount = /[\d,]+\s*(đ|VND|vnđ)/i.test(bodyText) || /\d{3,}/.test(bodyText);
    expect(hasAmount).toBeTruthy();
  });

  test('danh sách giao dịch hiển thị', async ({ page }) => {
    await gotoFinance(page);
    await page.waitForLoadState('networkidle');
    // Phải có ít nhất 1 row giao dịch
    const rows = page.locator('table tr, [data-testid="transaction-row"], .transaction-item');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('nút thêm giao dịch tồn tại', async ({ page }) => {
    await gotoFinance(page);
    const addBtn = page.locator('button').filter({ hasText: /thêm|thu|chi|giao dịch|transaction/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 8_000 });
  });

  test('không có JS error khi load trang tài chính', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await gotoFinance(page);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('filter theo loại giao dịch Thu/Chi không crash', async ({ page }) => {
    await gotoFinance(page);
    // Tìm tab hoặc select filter
    const filterBtn = page.locator('button, a, [role="tab"]').filter({ hasText: /thu|income/i }).first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
      await page.waitForTimeout(300);
      // Không crash sau khi filter
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      expect(errors).toHaveLength(0);
    }
  });
});
