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

async function patchAndSeed() {
  console.log('⚡ Adding missing columns to families table...');
  const patchSql = `
    ALTER TABLE families
      ADD COLUMN IF NOT EXISTS code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
      ADD COLUMN IF NOT EXISTS banner_url TEXT,
      ADD COLUMN IF NOT EXISTS ancestral_hall_address TEXT,
      ADD COLUMN IF NOT EXISTS origin_province VARCHAR(100),
      ADD COLUMN IF NOT EXISTS origin_district VARCHAR(100),
      ADD COLUMN IF NOT EXISTS origin_commune VARCHAR(100),
      ADD COLUMN IF NOT EXISTS covenant_title TEXT,
      ADD COLUMN IF NOT EXISTS covenant_preamble TEXT,
      ADD COLUMN IF NOT EXISTS covenant_articles JSONB;
  `;
  await querySql(patchSql);
  console.log('✅ Families table schema extended!');

  console.log('⚡ Seeding dual tenants...');
  const seedPath = path.resolve('supabase/seed_dual_tenants.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');
  await querySql(seedSql);
  console.log('✅ Dual tenants seeded successfully on Supabase Cloud!');
}

patchAndSeed();
