import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'anwtruyxyraedrtpzchm';

async function executeSql(query: string, label: string) {
  console.log(`\n⚡ [${label}] Executing SQL (${query.length} characters)...`);
  const queryRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (queryRes.ok) {
    const result = await queryRes.json();
    console.log(`✅ [${label}] SUCCESS!`);
    return { success: true, result };
  } else {
    const errText = await queryRes.text();
    console.error(`❌ [${label}] FAILED (${queryRes.status}):`, errText);
    return { success: false, error: errText };
  }
}

async function run() {
  console.log('============================================================');
  console.log('🚀 EXECUTING COMPLETE SUPABASE CLOUD MIGRATION PIPELINE');
  console.log('============================================================');
  console.log('📌 Target Project: GiaPhaGiaToc Project (' + PROJECT_REF + ')');

  // 1. Fetch & Store API Keys
  try {
    const keysRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      },
    });

    if (keysRes.ok) {
      const keys = await keysRes.json();
      const anonKey = keys.find((k: any) => k.name === 'anon')?.api_key || keys[0]?.api_key;
      const serviceRoleKey = keys.find((k: any) => k.name === 'service_role')?.api_key;
      
      const envContent = [
        `VITE_SUPABASE_URL="https://${PROJECT_REF}.supabase.co"`,
        `VITE_SUPABASE_ANON_KEY="${anonKey || ''}"`,
        `SUPABASE_SERVICE_ROLE_KEY="${serviceRoleKey || ''}"`,
        `SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN}"`,
        `SUPABASE_PROJECT_REF="${PROJECT_REF}"`,
      ].join('\n');
      
      fs.writeFileSync('.env', envContent, 'utf-8');
      console.log('💾 Updated local .env with project keys.');
    }
  } catch (err: any) {
    console.warn('⚠️ API Keys warning:', err.message);
  }

  // 2. STEP 1: Execute BASE SCHEMA (DATABASE_SCHEMA.sql)
  const baseSchemaPath = path.resolve('DATABASE_SCHEMA.sql');
  if (fs.existsSync(baseSchemaPath)) {
    const baseSql = fs.readFileSync(baseSchemaPath, 'utf-8');
    const baseRes = await executeSql(baseSql, 'STEP 1: BASE DATABASE SCHEMA (31 TABLES)');
    if (!baseRes.success) {
      console.warn('Base schema warning, proceeding with consolidated migrations...');
    }
  }

  // 3. STEP 2: Execute CONSOLIDATED MIGRATIONS (ALL_LATEST_MIGRATIONS_CONSOLIDATED.sql)
  const migrationPath = path.resolve('supabase/ALL_LATEST_MIGRATIONS_CONSOLIDATED.sql');
  if (fs.existsSync(migrationPath)) {
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    const migRes = await executeSql(migrationSql, 'STEP 2: CONSOLIDATED MIGRATIONS & RLS POLICIES');
    if (migRes.success) {
      console.log('\n🎉 ALL CONSOLIDATED MIGRATIONS APPLIED SUCCESSFULLY!');
    }
  }

  // 4. STEP 3: Verify Tables
  console.log('\n============================================================');
  console.log('🔍 VERIFYING CREATED TABLES IN SUPABASE CLOUD...');
  console.log('============================================================');
  const verifySql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  const verifyRes = await executeSql(verifySql, 'STEP 3: TABLE AUDIT');
  if (verifyRes.success && Array.isArray(verifyRes.result)) {
    const tables = verifyRes.result.map((r: any) => r.table_name);
    console.log(`\n📊 Total Tables in Supabase Cloud: ${tables.length}`);
    console.log(tables.join(', '));
  }
}

run();
