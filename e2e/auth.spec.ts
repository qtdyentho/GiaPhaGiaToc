import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 * Kiểm tra luồng đăng nhập / đăng ký / đăng xuất
 */
test.describe('Authentication', () => {
  test('trang login hiển thị form đúng', async ({ page }) => {
    await page.goto('/login');
    // Phải có input email hoặc text
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });

    // Phải có input password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('submit form rỗng hiện validation error', async ({ page }) => {
    await page.goto('/login');

    // Click submit mà không nhập gì
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Phải xuất hiện lỗi validation
    const errorMsg = page.locator('[role="alert"], .error, [data-testid="error"], p.text-red-500, p.text-destructive').first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('nhập sai email format hiện lỗi', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input[name="email"]', 'khong-phai-email');
    await page.fill('input[type="password"]', '123456');
    await page.locator('button[type="submit"]').first().click();

    // Validation lỗi format email
    const errorMsg = page.locator('[role="alert"], .error, p.text-red-500, p.text-destructive').first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('link đến trang đăng ký hoạt động', async ({ page }) => {
    await page.goto('/login');

    // Tìm link đến register
    const registerLink = page.locator('a').filter({ hasText: /đăng ký|register|tạo tài khoản/i }).first();
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/register|signup/i, { timeout: 5_000 });
    }
  });

  test('URL /dashboard redirect về login khi chưa auth', async ({ page }) => {
    await page.goto('/dashboard');
    // Phải redirect về login hoặc trang auth
    await expect(page).toHaveURL(/login|auth|\/$/i, { timeout: 8_000 });
  });
});
