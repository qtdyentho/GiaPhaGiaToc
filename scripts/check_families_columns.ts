const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'anwtruyxyraedrtpzchm';

async function checkFamilies() {
  const queryRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'families' AND table_schema = 'public';`
    }),
  });

  const cols = await queryRes.json();
  console.log('📌 Families Columns:');
  console.table(cols);
}

checkFamilies();
