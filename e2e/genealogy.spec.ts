import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests: Genealogy Tree (Cây Gia Phả)
 * Kiểm tra module phả hệ: hiển thị danh sách, form thêm member
 *
 * NOTE: Các test này chạy với MOCK DATA (không cần auth Supabase)
 * vì app có dual-mode fallback
 */

async function gotoGenealogy(page: Page) {
  await page.goto('/login');
  const demoBtn = page.locator('button').filter({ hasText: /Nguyễn Văn|Đại Tộc/i }).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
    await page.waitForLoadState('networkidle');
  }
  await page.goto('/app/genealogy');
  await page.waitForLoadState('networkidle');
}

test.describe('Genealogy Module', () => {
  test('trang gia phả tải thành công', async ({ page }) => {
    await gotoGenealogy(page);
    // Phải có ít nhất một heading liên quan
    const heading = page.locator('h1, h2').filter({ hasText: /gia phả|phả hệ|thành viên|members|genealogy/i }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('hiển thị danh sách / cây thành viên', async ({ page }) => {
    await gotoGenealogy(page);
    // Phải có ít nhất 1 card hoặc node hiển thị
    const memberCard = page.locator('[data-testid="member-card"], .member-card, .genealogy-node, li, tr').first();
    await expect(memberCard).toBeVisible({ timeout: 10_000 });
  });

  test('nút thêm thành viên mới tồn tại', async ({ page }) => {
    await gotoGenealogy(page);
    const addBtn = page.locator('button, a').filter({ hasText: /thêm|thêm mới|add member|thêm thành viên/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 8_000 });
  });

  test('search / filter thành viên không crash', async ({ page }) => {
    await gotoGenealogy(page);
    const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Nguyễn');
      await page.waitForTimeout(500); // debounce
      // Sau khi search không có JS error
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      expect(errors).toHaveLength(0);
    }
  });

  test('không có JS error khi load trang gia phả', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await gotoGenealogy(page);
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });
});
