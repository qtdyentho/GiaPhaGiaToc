import { Page } from '@playwright/test';

export async function loginAsDemo(page: Page, targetUrl: string = '/app/dashboard') {
  const userId = '532e22f4-f452-457b-974e-992d9021fdff';
  const familyId = '532e22f4-f452-457b-974e-992d9021fdff';

  await page.addInitScript(({ userId, familyId }) => {
    const user = {
      id: userId,
      email: 'truongtoc.nguyen@giapha.vn',
      full_name: 'Nguyễn Văn Hoàng',
      phone: '0988123456',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-24T00:00:00Z',
    };
    const family = {
      id: familyId,
      name: 'Đại Tộc Nguyễn Văn',
      code: 'NGUYEN-VAN-HN',
      slug: 'nguyen-van-hoang-mai',
      description: 'Dòng họ Nguyễn Văn tại Hoàng Mai, Hà Nội',
      origin_province: 'Hà Nội',
      created_by: userId,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-08-24T00:00:00Z',
    };
    const membership = {
      id: 'mem-0000-0001',
      family_id: familyId,
      user_id: userId,
      role: 'OWNER',
      status: 'ACTIVE',
      created_at: '2026-01-01T00:00:00Z',
    };

    localStorage.setItem('hl_auth_user', JSON.stringify(user));
    localStorage.setItem('hl_active_family_id', familyId);
    sessionStorage.setItem('active_family_id', familyId);
    localStorage.setItem('hl_families', JSON.stringify([family]));
    localStorage.setItem('hl_memberships', JSON.stringify([membership]));
  }, { userId, familyId });

  await page.goto(targetUrl);
  await page.waitForLoadState('networkidle');
}
