import { test, expect } from '@playwright/test';

// Helper: inject mock auth and reload so AuthContext picks up localStorage
async function injectMockAuth(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    const user = {
      id: 'usr-0000-0001',
      email: 'truongtoc.nguyen@giaphaviet.vercel.app',
      full_name: 'Nguyễn Văn Hoàng',
      phone: '0988123456',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-24T00:00:00Z',
    };
    const family = {
      id: 'fam-0000-0001',
      name: 'Đại Tộc Nguyễn Văn',
      code: 'NGUYEN-VAN-HN',
      slug: 'nguyen-van-hoang-mai',
      origin_province: 'Hà Nội',
      origin_district: 'Hoàng Mai',
      origin_commune: 'Định Công',
      ancestral_hall_address: 'Số 18 Ngõ 42 Tổ 5, P. Định Công, Q. Hoàng Mai, Hà Nội',
      covenant_title: 'ẨM THỦY TƯ NGUYÊN',
      created_by: 'usr-0000-0001',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-24T00:00:00Z',
    };
    const membership = {
      id: 'mem-0001',
      family_id: 'fam-0000-0001',
      user_id: 'usr-0000-0001',
      role: 'OWNER',
      status: 'ACTIVE',
      joined_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-24T00:00:00Z',
    };
    localStorage.setItem('hl_auth_user', JSON.stringify(user));
    localStorage.setItem('hl_families', JSON.stringify([family]));
    localStorage.setItem('hl_memberships', JSON.stringify([membership]));
    localStorage.setItem('hl_active_family_id', family.id);
    sessionStorage.setItem('active_family_id', family.id);
  });
  // Reload so AuthContext reads localStorage on mount (useState initializer)
  await page.reload();
  await page.waitForLoadState('networkidle');
}

test.describe('E2E Genealogy Tree & Member Management Auditing', () => {
  test.beforeEach(async ({ page }) => {
    await injectMockAuth(page);
  });

  test('TC-01: Render Ancestral Banner, Genealogy Tree Canvas & Pan-Zoom', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/app/genealogy');
    await page.waitForLoadState('networkidle');

    // Ensure not redirected to login
    await expect(page).not.toHaveURL(/\/login/);

    // 1. Kiểm tra Banner Hoành Phi — scoped bằng data-testid để tránh duplicate text
    const banner = page.locator('[data-testid="ancestral-banner"]');
    await expect(banner).toBeVisible({ timeout: 12000 });
    console.log('[AUDIT] AncestralBanner rendered OK');

    const renderDuration = Date.now() - startTime;
    console.log('[PERF] Tree Canvas Initial Render: ' + renderDuration + 'ms');

    // Chụp ảnh phả đồ toàn cảnh
    await page.screenshot({ path: 'e2e/screenshots/01_genealogy_tree_overview.png', fullPage: false });

    // 2. Kiểm tra các node thành viên có hiển thị
    const memberNodes = page.locator('.member-card-interactive');
    await memberNodes.first().waitFor({ state: 'visible', timeout: 12000 });
    const count = await memberNodes.count();
    expect(count).toBeGreaterThan(0);
    console.log('[AUDIT] Total visible member cards on canvas: ' + count);

    // 3. Kiểm tra Thước Đo Thế Hệ (Generation Ruler)
    const genRuler = page.locator('text=Thế Hệ Đời').first();
    if (await genRuler.isVisible().catch(() => false)) {
      console.log('[AUDIT] Generation Ruler rendered OK');
    }

    // 4. Kiểm tra nút Căn Giữa & Vừa Màn Hình
    const fitBtn = page.locator('button').filter({ hasText: /Vừa Màn Hình|Toàn Bộ/ }).first();
    if (await fitBtn.isVisible().catch(() => false)) {
      await fitBtn.click();
      await page.waitForTimeout(300);
      console.log('[AUDIT] Auto-fit to screen triggered');
    }

    const centerBtn = page.locator('button').filter({ hasText: /Căn Giữa/ }).first();
    if (await centerBtn.isVisible().catch(() => false)) {
      await centerBtn.click();
      await page.waitForTimeout(300);
      console.log('[AUDIT] Center tree triggered');
    }

    // Chụp chi tiết một node thành viên
    const firstNode = memberNodes.first();
    await firstNode.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'e2e/screenshots/02_member_node_detail.png' });
  });

  test('TC-02: Test Filters (Chỉ Nam & Đinh, Giới Hạn Đời, Theo Chi Phái & Người Đứng Đầu)', async ({ page }) => {
    await page.goto('http://localhost:3000/app/genealogy');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);

    // Chờ cây render xong
    await page.locator('.member-card-interactive').first().waitFor({ state: 'visible', timeout: 12000 });

    // Lọc Chỉ Nam & Đinh
    const genderSelect = page.locator('select[title="Lọc thành viên hiển thị trên cây"]');
    if (await genderSelect.isVisible()) {
      await genderSelect.selectOption('MALE_AND_DINH');
      await page.waitForTimeout(600);
      const afterFilter = await page.locator('.member-card-interactive').count();
      console.log('[AUDIT] MALE_AND_DINH cards: ' + afterFilter);
    }
    await page.screenshot({ path: 'e2e/screenshots/03_filter_male_and_dinh.png' });

    // Lọc Giới hạn đến Đời 3
    const depthSelect = page.locator('select[title="Giới hạn số thế hệ hiển thị giúp tối ưu cây lớn"]');
    if (await depthSelect.isVisible()) {
      await depthSelect.selectOption('3');
      await page.waitForTimeout(600);
      const afterDepth = await page.locator('.member-card-interactive').count();
      console.log('[AUDIT] Depth Gen3 cards: ' + afterDepth);
    }
    await page.screenshot({ path: 'e2e/screenshots/04_filter_depth_limit_gen3.png' });

    // Lọc Theo Chi
    const chiButton = page.locator('button').filter({ hasText: 'Theo Chi' });
    if (await chiButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await chiButton.first().click();
      await page.waitForTimeout(600);

      // Kiểm tra tiêu đề Khởi Tổ Chi
      const branchTitle = page.locator('text=/KHỞI TỔ/i').first();
      const hasBranchTitle = await branchTitle.isVisible({ timeout: 4000 }).catch(() => false);
      console.log('[AUDIT] Branch leader root title visible: ' + hasBranchTitle);
    }
    await page.screenshot({ path: 'e2e/screenshots/05_filter_by_branch_chi.png' });
  });

  test('TC-03: Member 360 Detail Modal & Edit Member Modal Audit', async ({ page }) => {
    await page.goto('http://localhost:3000/app/genealogy');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);

    // Nhấp vào thành viên đầu tiên để mở Modal 360°
    const firstNode = page.locator('.member-card-interactive').first();
    await firstNode.waitFor({ state: 'visible', timeout: 12000 });
    await firstNode.click();
    await page.waitForTimeout(500);

    // Kiểm tra Modal 360° bằng data-testid hoặc role="dialog"
    const modal360 = page.locator('[data-testid="member-detail-modal"], [role="dialog"]').first();
    await expect(modal360).toBeVisible({ timeout: 6000 });
    console.log('[AUDIT] Member modal visible: true');

    await page.screenshot({ path: 'e2e/screenshots/06_member_360_modal.png' });

    // Bấm nút Chỉnh Sửa
    const editBtn = page.locator('button').filter({ hasText: /Chỉnh Sửa|Sửa/ }).first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const editModal = page.locator('[data-testid="edit-member-modal"]').first();
      if (await editModal.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log('[AUDIT] Edit modal visible: true');
      }
      await page.screenshot({ path: 'e2e/screenshots/07_edit_member_modal.png' });
    } else {
      console.log('[WARN] Edit button not visible');
      await page.screenshot({ path: 'e2e/screenshots/07_edit_member_modal_skipped.png' });
    }
  });

  test('TC-04: Export Vector SVG & Large Print A0 Modal Audit', async ({ page }) => {
    await page.goto('http://localhost:3000/app/genealogy');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);

    await page.locator('.member-card-interactive').first().waitFor({ state: 'visible', timeout: 12000 });

    // Bấm nút Xuất Cây
    const exportBtn = page.locator('button').filter({ hasText: /Xuất Cây/ }).first();
    await expect(exportBtn).toBeVisible({ timeout: 8000 });
    await exportBtn.click();
    await page.waitForTimeout(600);

    // Kiểm tra ExportTreeModal
    const exportModal = page.locator('[data-testid="export-tree-modal"], [role="dialog"]').first();
    await expect(exportModal).toBeVisible({ timeout: 6000 });
    console.log('[AUDIT] Export modal visible: true');

    // Kiểm tra định dạng Vector SVG
    const svgBtn = page.locator('button').filter({ hasText: /Vector SVG|SVG/ }).first();
    if (await svgBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await svgBtn.click();
      await page.waitForTimeout(400);
    }

    await page.screenshot({ path: 'e2e/screenshots/08_export_modal_vector_svg.png' });
  });
});
