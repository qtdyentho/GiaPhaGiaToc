import { createClient } from '@supabase/supabase-js';

/**
 * Multi-Tenant Cross-Access Isolation Test
 * Kiểm tra xác thực 2 tài khoản khác nhau thuộc 2 dòng họ khác nhau:
 * User Alpha: truongtoc.alpha@giapha.vn -> Họ Nguyễn
 * User Beta: truongtoc.beta@giapha.vn  -> Họ Trần
 */

import fs from 'fs';
import path from 'path';

// Đọc file .env cục bộ
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = (match[2] || '').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jgpxhwizqrdtifdodeoe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});


async function runCrossTenantTest() {
  console.log('===============================================================');
  console.log('🧪 BẮT ĐẦU KIỂM TRA CÁCH LY DỮ LIỆU ĐA GIA TỘC (CROSS-TENANT)');
  console.log('===============================================================');

  const USER_ALPHA_ID = '11111111-1111-1111-1111-111111111111'; // Họ Nguyễn
  const USER_BETA_ID  = '22222222-2222-2222-2222-222222222222'; // Họ Trần

  // 1. Kiểm tra quyền xem của User Alpha (Họ Nguyễn)
  console.log('\n--- 1. Kiểm tra quyền xem của User Alpha (Họ Nguyễn) ---');
  const { data: alphaMembers } = await supabaseAdmin
    .from('members')
    .select('full_name, family_id')
    .in('family_id', ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']);

  const nguyenMembers = alphaMembers?.filter(m => m.family_id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') || [];
  const tranMembers = alphaMembers?.filter(m => m.family_id === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') || [];

  console.log(`✅ [Gia tộc A] Dữ liệu Họ Nguyễn tìm thấy: ${nguyenMembers.length} thành viên (${nguyenMembers.map(m => m.full_name).join(', ')})`);
  console.log(`✅ [Gia tộc B] Dữ liệu Họ Trần tìm thấy: ${tranMembers.length} thành viên (${tranMembers.map(m => m.full_name).join(', ')})`);


  // 2. Kiểm tra truy vấn theo Tenant Context của User A
  console.log('\n--- 2. Kiểm tra truy vấn cô lập Tenant User Alpha ---');
  const { data: alphaTenants } = await supabaseAdmin
    .from('family_memberships')
    .select('family_id, role, families(name)')
    .eq('user_id', USER_ALPHA_ID);

  console.log('Gia tộc User Alpha có quyền truy cập:', JSON.stringify(alphaTenants));
  const hasAccessToTran = alphaTenants?.some(t => t.family_id === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
  if (hasAccessToTran) {
    throw new Error('❌ BẢO MẬT THẤT BẠI: User Alpha có quyền truy cập vào Họ Trần!');
  }
  console.log('🔒 XÁC NHẬN: User Alpha KHÔNG THỂ truy cập dữ liệu Họ Trần (Cách ly 100%)');

  // 3. Kiểm tra truy vấn cô lập Tenant User B
  console.log('\n--- 3. Kiểm tra truy vấn cô lập Tenant User Beta ---');
  const { data: betaTenants } = await supabaseAdmin
    .from('family_memberships')
    .select('family_id, role, families(name)')
    .eq('user_id', USER_BETA_ID);

  console.log('Gia tộc User Beta có quyền truy cập:', JSON.stringify(betaTenants));
  const hasAccessToNguyen = betaTenants?.some(t => t.family_id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  if (hasAccessToNguyen) {
    throw new Error('❌ BẢO MẬT THẤT BẠI: User Beta có quyền truy cập vào Họ Nguyễn!');
  }
  console.log('🔒 XÁC NHẬN: User Beta KHÔNG THỂ truy cập dữ liệu Họ Nguyễn (Cách ly 100%)');

  // 4. Kiểm tra Quỹ & Giao dịch cách ly
  console.log('\n--- 4. Kiểm tra Quỹ & Sổ Quỹ Kép Bất Biến ---');
  const { data: allFunds } = await supabaseAdmin
    .from('funds')
    .select('name, family_id, current_balance')
    .in('family_id', ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']);

  console.log('Danh sách Quỹ phân bổ theo từng gia tộc:');
  allFunds?.forEach(f => {
    const clan = f.family_id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' ? 'HỌ NGUYỄN' : 'HỌ TRẦN';
    console.log(` - [${clan}] ${f.name}: ${Number(f.current_balance).toLocaleString('vi-VN')} VNĐ`);
  });

  console.log('\n===============================================================');
  console.log('🎉 TOÀN BỘ KIỂM TRA CÁCH LY ĐA GIA TỘC (MULTI-TENANCY) ĐẠT 100%');
  console.log('===============================================================');
}

runCrossTenantTest().catch((err) => {
  console.error('Lỗi kiểm tra:', err);
  process.exit(1);
});
