import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 * Kiểm tra luồng đăng nhập / quên mật khẩu / đăng ký / redirect bảo vệ
 */
test.describe('Authentication', () => {
  test('trang login hiển thị form đúng', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('submit form rỗng hiện validation error', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    const errorMsg = page.locator('[role="alert"], .error, [data-testid="error"], p.text-red-500, p.text-destructive').first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('nhập sai email format hiện lỗi', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input[name="email"]', 'khong-phai-email');
    await page.fill('input[type="password"]', '123456');
    await page.locator('button[type="submit"]').first().click();

    const errorMsg = page.locator('[role="alert"], .error, p.text-red-500, p.text-destructive').first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('chức năng quên mật khẩu mở modal và gửi yêu cầu thành công', async ({ page }) => {
    await page.goto('/login');

    // Bấm nút Quên mật khẩu
    const forgotBtn = page.locator('button:has-text("Quên mật khẩu?")').first();
    await expect(forgotBtn).toBeVisible();
    await forgotBtn.click();

    // Modal phải xuất hiện
    const modalHeading = page.locator('h3:has-text("Khôi Phục Quyền Truy Cập")');
    await expect(modalHeading).toBeVisible({ timeout: 5_000 });

    // Nhập email và submit
    const modalEmailInput = page.locator('div[role="dialog"] input[type="email"], .fixed input[type="email"]').first();
    await modalEmailInput.fill('truongtoc.nguyen@giapha.vn');

    const sendBtn = page.locator('button:has-text("Gửi Hướng Dẫn Khôi Phục")');
    await sendBtn.click();

    // Phải hiển thị thông báo đã tiếp nhận yêu cầu
    const successTitle = page.locator('h4:has-text("Đã Tiếp Nhận Yêu Cầu")');
    await expect(successTitle).toBeVisible({ timeout: 5_000 });
  });

  test('đăng nhập nhanh bằng nút Đại Tộc Nguyễn Văn thành công vào dashboard', async ({ page }) => {
    await page.goto('/login');

    const quickBtn = page.locator('button:has-text("Đại Tộc Nguyễn Văn")').first();
    await expect(quickBtn).toBeVisible();
    await quickBtn.click();

    // Điều hướng vào dashboard
    await expect(page).toHaveURL(/\/app|\/dashboard/i, { timeout: 10_000 });
  });

  test('link đến trang đăng ký hoạt động', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.locator('a').filter({ hasText: /đăng ký|register|tạo tài khoản/i }).first();
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/register|signup/i, { timeout: 5_000 });
    }
  });

  test('URL /dashboard redirect về login khi chưa auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login|auth|\/$/i, { timeout: 8_000 });
  });
});
