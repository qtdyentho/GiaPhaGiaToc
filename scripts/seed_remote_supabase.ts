import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jgpxhwizqrdtifdodeoe.supabase.co';
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function checkAndSeed() {
  console.log('============================================================');
  console.log('SUPABASE LIVE DATABASE STATUS CHECK');
  console.log('============================================================');
  console.log('Project URL:', supabaseUrl);

  const tablesToCheck = ['families', 'plans', 'funds', 'members', 'memorial_dates'];
  let allTablesExist = true;

  for (const t of tablesToCheck) {
    const { error } = await supabase.from(t).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Bảng '${t}': Chưa tạo (Lỗi: ${error.message})`);
      allTablesExist = false;
    } else {
      console.log(`✅ Bảng '${t}': Đã tồn tại`);
    }
  }

  if (!allTablesExist) {
    console.log('\n------------------------------------------------------------');
    console.log('👉 HƯỚNG DẪN 1 CLICK TẠO BẢNG TRÊN SUPABASE:');
    console.log('1. Mở link SQL Editor: https://supabase.com/dashboard/project/jgpxhwizqrdtifdodeoe/sql/new');
    console.log('2. Dán toàn bộ nội dung file DATABASE_SCHEMA.sql và bấm RUN.');
    console.log('3. Chạy lại script này để tự động nạp dữ liệu mẫu Alpha!');
    console.log('------------------------------------------------------------');
  } else {
    console.log('\n🎉 TOÀN BỘ BẢNG CSDL ĐÃ SẴN SÀNG! ĐANG TIẾN HÀNH NẠP DỮ LIỆU...');
    // Seed families
    const { error: famErr } = await supabase.from('families').upsert([
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Đại Tộc Nguyễn Văn (Hà Nội)',
        code: 'ALPHA-NGUYEN',
        description: 'Dòng họ Nguyễn Văn Thủy Tổ phát tích từ thế kỷ 18.',
        origin_province: 'Hà Nội',
        ancestral_house_address: 'Số 18 Đường Làng, Thôn Đông, Xã Tiên Phương, Huyện Chương Mỹ, TP. Hà Nội',
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Gia Tộc Trần Bá (Bắc Ninh)',
        code: 'BETA-TRAN',
        description: 'Chi phái Trần Bá gốc Kinh Bắc.',
        origin_province: 'Bắc Ninh',
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Dòng Họ Lê Quang (Thanh Hóa)',
        code: 'GAMMA-LE',
        description: 'Họ Lê Quang vùng Lam Sơn.',
        origin_province: 'Thanh Hóa',
      },
    ]);

    if (famErr) console.error('Lỗi nạp families:', famErr.message);
    else console.log('✅ Đã nạp thành công 3 Gia Tộc Mẫu!');
  }
}

checkAndSeed();
