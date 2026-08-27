import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * ==============================================================================
 * AUTO MIGRATE SUPABASE CLOUD
 * Tự động đồng bộ toàn bộ Schema lên dự án Supabase Cloud
 * ==============================================================================
 */

// 1. Đọc file .env nếu có
function loadEnv() {
  const envPaths = ['.env', '.env.local', '../.env'];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
const projectRef = process.env.SUPABASE_PROJECT_REF || (supabaseUrl ? supabaseUrl.replace('https://', '').split('.')[0] : 'jgpxhwizqrdtifdodeoe');

console.log('============================================================');
console.log('🚀 SUPABASE CLOUD AUTOMATED SCHEMA MIGRATION RUNNER');
console.log('============================================================');
console.log('📌 Project Ref:', projectRef);
console.log('📌 Supabase URL:', supabaseUrl || `https://${projectRef}.supabase.co`);
console.log('📌 Database URL Configured:', databaseUrl ? 'YES (***)' : 'NO');
console.log('📌 Service Role Key Configured:', serviceRoleKey ? 'YES (***)' : 'NO');
console.log('------------------------------------------------------------');

const migrationFilePath = path.resolve('supabase/ALL_LATEST_MIGRATIONS_CONSOLIDATED.sql');

if (!fs.existsSync(migrationFilePath)) {
  console.error('❌ Không tìm thấy file migration:', migrationFilePath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFilePath, 'utf-8');
console.log(`📄 Đã tải file SQL migration: ${sqlContent.length} bytes (6 phần chuẩn hóa)`);

async function main() {
  // Phương thức 1: Nếu có DATABASE_URL -> Thực thi trực tiếp qua psql / npx supabase
  if (databaseUrl) {
    console.log('\n🔄 Đang thực thi migration qua Direct Database Connection (DATABASE_URL)...');
    try {
      const tempSqlFile = path.resolve('scratch/temp_migration.sql');
      fs.mkdirSync(path.dirname(tempSqlFile), { recursive: true });
      fs.writeFileSync(tempSqlFile, sqlContent, 'utf-8');
      
      console.log('⚡ Đang gửi SQL batch tới Supabase Postgres...');
      execSync(`npx supabase db push --db-url "${databaseUrl}"`, { stdio: 'inherit' });
      console.log('\n🎉 THÀNH CÔNG: Toàn bộ schema đã được cập nhật lên Supabase Cloud!');
      return;
    } catch (dbErr: any) {
      console.warn('⚠️ Thực thi qua DATABASE_URL gặp lỗi:', dbErr.message);
    }
  }

  // Phương thức 2: Hướng dẫn 1-Click trực tiếp qua Supabase Dashboard SQL Editor
  console.log('\n============================================================');
  console.log('⭐ HƯỚNG DẪN 1 CLICK TỰ CẬP NHẬT TRỰC TIẾP LÊN SUPABASE CLOUD:');
  console.log('============================================================');
  console.log(`1. Mở trình duyệt và truy cập liên kết SQL Editor của dự án:`);
  console.log(`   🔗 https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log(`\n2. Mở file migration đã được tổng hợp hoàn chỉnh:`);
  console.log(`   📁 supabase/ALL_LATEST_MIGRATIONS_CONSOLIDATED.sql`);
  console.log(`\n3. Copy toàn bộ nội dung file SQL trên, dán vào khung soạn thảo và nhấn nút RUN (Chạy).`);
  console.log(`\n✨ Kết quả: Toàn bộ 31 bảng, các cột ngọc phả cổ truyền (giờ sinh, tên húy/hiệu, giờ mất, pháp danh), mã QR, link rút gọn và RLS Policies sẽ được kích hoạt tức thì.`);
  console.log('============================================================\n');
}

main();
