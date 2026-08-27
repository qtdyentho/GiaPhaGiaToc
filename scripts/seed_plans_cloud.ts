import * as fs from 'fs';

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'anwtruyxyraedrtpzchm';

async function querySql(query: string) {
  const queryRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (queryRes.ok) {
    return await queryRes.json();
  } else {
    throw new Error(await queryRes.text());
  }
}

async function seedPlans() {
  const seedSql = `
    -- 1. Khởi tạo 5 Gói dịch vụ cốt lõi
    INSERT INTO plans (id, code, name, description, short_description, is_public, is_active, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000001', 'FREE', 'Gói Trải Nghiệm', 'Dành cho gia đình nhỏ tra cứu cơ bản', 'Miễn phí tối đa 30 thành viên', true, true, 1),
    ('00000000-0000-0000-0000-000000000002', 'FAMILY', 'Gói Gia Đình', 'Quản lý tối đa 100 thành viên, sổ quỹ cơ bản', 'Gia đình hạt nhân 49k/tháng', true, true, 2),
    ('00000000-0000-0000-0000-000000000003', 'GIA_TOC', 'Gói Gia Tộc', 'Quản lý 300 thành viên, 30 chi nhánh, sổ quỹ kép đầy đủ', 'Dòng tộc vừa & nhỏ 99k/tháng', true, true, 3),
    ('00000000-0000-0000-0000-000000000004', 'DONG_HO', 'Gói Dòng Họ', 'Quản lý 1000 thành viên, đa quỹ, báo cáo chuyên sâu', 'Dòng họ lớn 199k/tháng', true, true, 4),
    ('00000000-0000-0000-0000-000000000005', 'PREMIUM', 'Gói Toàn Năng', 'Không giới hạn thành viên, API & sao lưu đám mây', 'Đại tộc toàn năng 499k/tháng', true, true, 5)
    ON CONFLICT (code) DO NOTHING;

    -- 2. Khởi tạo Phiên bản giá hiện tại (v1)
    INSERT INTO plan_versions (plan_id, version_number, price_monthly, price_yearly, currency, trial_days, is_current, effective_from) VALUES
    ('00000000-0000-0000-0000-000000000001', 1, 0, 0, 'VND', 0, true, NOW()),
    ('00000000-0000-0000-0000-000000000002', 1, 49000, 490000, 'VND', 14, true, NOW()),
    ('00000000-0000-0000-0000-000000000003', 1, 99000, 990000, 'VND', 14, true, NOW()),
    ('00000000-0000-0000-0000-000000000004', 1, 199000, 1990000, 'VND', 14, true, NOW()),
    ('00000000-0000-0000-0000-000000000005', 1, 499000, 4990000, 'VND', 14, true, NOW())
    ON CONFLICT DO NOTHING;
  `;
  await querySql(seedSql);
  console.log('✅ Seeded 5 standard subscription plans and pricing versions!');
}

seedPlans();
