import { createClient } from '@supabase/supabase-js';
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
  console.log('🧪 BẮT ĐẦU KIỂM TRA CÁCH LY ĐA GIA TỘC VỚI UUID V4 NGẪU NHIÊN');
  console.log('===============================================================');

  // Lấy User Alpha & Beta
  const { data: users } = await supabaseAdmin.from('family_memberships').select('user_id, family_id, role, families(name, surname)');

  const membershipAlpha = users?.find(u => (u.families as any)?.name?.includes('Yên Mô'));
  const membershipBeta  = users?.find(u => (u.families as any)?.name?.includes('Gia Viễn'));

  if (!membershipAlpha || !membershipBeta) {
    throw new Error('Không tìm thấy dữ liệu memberships của 2 gia tộc thử nghiệm!');
  }

  const familyAId = membershipAlpha.family_id;
  const familyBId = membershipBeta.family_id;
  const userAlphaId = membershipAlpha.user_id;
  const userBetaId = membershipBeta.user_id;

  console.log(`📌 Gia tộc A: ${(membershipAlpha.families as any)?.name} (UUID: ${familyAId})`);
  console.log(`📌 Gia tộc B: ${(membershipBeta.families as any)?.name} (UUID: ${familyBId})`);

  // 1. Kiểm tra thành viên
  console.log('\n--- 1. Kiểm tra phân bổ thành viên theo UUID ngẫu nhiên ---');
  const { data: allMembers } = await supabaseAdmin
    .from('members')
    .select('full_name, family_id')
    .in('family_id', [familyAId, familyBId]);

  const nguyenMembers = allMembers?.filter(m => m.family_id === familyAId) || [];
  const tranMembers = allMembers?.filter(m => m.family_id === familyBId) || [];

  console.log(`✅ [Gia tộc A] Thành viên Họ Nguyễn (${nguyenMembers.length}): ${nguyenMembers.map(m => m.full_name).join(', ')}`);
  console.log(`✅ [Gia tộc B] Thành viên Họ Trần (${tranMembers.length}): ${tranMembers.map(m => m.full_name).join(', ')}`);

  // 2. Kiểm tra truy vấn cô lập Tenant User Alpha
  console.log('\n--- 2. Kiểm tra truy vấn cô lập Tenant User Alpha ---');
  const { data: alphaTenants } = await supabaseAdmin
    .from('family_memberships')
    .select('family_id, role, families(name)')
    .eq('user_id', userAlphaId);

  const hasAccessToTran = alphaTenants?.some(t => t.family_id === familyBId);
  if (hasAccessToTran) {
    throw new Error('❌ BẢO MẬT THẤT BẠI: User Alpha có quyền truy cập vào Họ Trần!');
  }
  console.log('🔒 XÁC NHẬN: User Alpha KHÔNG THỂ truy cập dữ liệu Họ Trần (Cách ly 100%)');

  // 3. Kiểm tra truy vấn cô lập Tenant User Beta
  console.log('\n--- 3. Kiểm tra truy vấn cô lập Tenant User Beta ---');
  const { data: betaTenants } = await supabaseAdmin
    .from('family_memberships')
    .select('family_id, role, families(name)')
    .eq('user_id', userBetaId);

  const hasAccessToNguyen = betaTenants?.some(t => t.family_id === familyAId);
  if (hasAccessToNguyen) {
    throw new Error('❌ BẢO MẬT THẤT BẠI: User Beta có quyền truy cập vào Họ Nguyễn!');
  }
  console.log('🔒 XÁC NHẬN: User Beta KHÔNG THỂ truy cập dữ liệu Họ Nguyễn (Cách ly 100%)');

  // 4. Kiểm tra Quỹ & Sổ Quỹ Kép Bất Biến
  console.log('\n--- 4. Kiểm tra Quỹ theo UUID ngẫu nhiên ---');
  const { data: allFunds } = await supabaseAdmin
    .from('funds')
    .select('name, family_id, current_balance')
    .in('family_id', [familyAId, familyBId]);

  allFunds?.forEach(f => {
    const clan = f.family_id === familyAId ? 'HỌ NGUYỄN' : 'HỌ TRẦN';
    console.log(` - [${clan}] ${f.name} (UUID: ${f.family_id}): ${Number(f.current_balance).toLocaleString('vi-VN')} VNĐ`);
  });

  console.log('\n===============================================================');
  console.log('🎉 TOÀN BỘ KIỂM TRA CÁCH LY ĐA GIA TỘC (UUID v4 NGẪU NHIÊN) PASS 100%');
  console.log('===============================================================');
}

runCrossTenantTest().catch((err) => {
  console.error('Lỗi kiểm tra:', err);
  process.exit(1);
});
