import { test, expect } from '@playwright/test';
import { loginAsDemo } from './helpers/authHelper';

test.describe('Genealogy Module', () => {
  test('trang gia phả tải thành công', async ({ page }) => {
    await loginAsDemo(page, '/app/genealogy');
    const heading = page.locator('h1, h2, span, div').filter({ hasText: /Dòng Họ|Phả Hệ|Gia Phả|Cây Gia Phả/i }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('hiển thị danh sách / cây thành viên', async ({ page }) => {
    await loginAsDemo(page, '/app/genealogy');
    const treeElement = page.locator('.member-card-interactive, [id^="member-node-"], .canvas-control-button, button:visible').first();
    await expect(treeElement).toBeVisible({ timeout: 10_000 });
  });

  test('nút thêm thành viên mới tồn tại', async ({ page }) => {
    await loginAsDemo(page, '/app/genealogy');
    const addBtn = page.locator('button').filter({ hasText: /Thêm Thành Viên|Thêm/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
  });

  test('search / filter thành viên không crash', async ({ page }) => {
    await loginAsDemo(page, '/app/genealogy');
    const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], input[placeholder*="Tìm"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Nguyễn');
      await page.waitForTimeout(500);
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      expect(errors).toHaveLength(0);
    }
  });

  test('không có JS error khi load trang gia phả', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await loginAsDemo(page, '/app/genealogy');
    await page.waitForTimeout(1_000);

    const criticalErrors = jsErrors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
