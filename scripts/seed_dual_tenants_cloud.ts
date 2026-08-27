import * as fs from 'fs';
import * as path from 'path';

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

async function seedDualTenants() {
  const seedPath = path.resolve('supabase/seed_dual_tenants.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');
  await querySql(seedSql);
  console.log('✅ Seeded Dual Tenants (Họ Nguyễn & Họ Trần) to Supabase Cloud!');
}

seedDualTenants();
