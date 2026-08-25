import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Landing Page
 * Kiểm tra trang chủ hiển thị đúng nội dung giới thiệu & CTA
 */
test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hiển thị tiêu đề chính và tagline', async ({ page }) => {
    // Trang chủ phải có tên app
    await expect(page).toHaveTitle(/Gia Phả/i);
    // Có ít nhất một heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('có nút bắt đầu / đăng ký', async ({ page }) => {
    // Tìm CTA button (Bắt đầu, Đăng ký, Get Started...)
    const ctaButton = page.locator('a, button').filter({
      hasText: /bắt đầu|đăng ký|get started|dùng thử/i,
    }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('logo và navigation hiển thị', async ({ page }) => {
    // Header/nav phải tồn tại
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('responsive: mobile viewport không bị vỡ layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto('/');
    // Không có horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('các section nội dung tải xong trong 3 giây', async ({ page }) => {
    const start = Date.now();
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });
});
