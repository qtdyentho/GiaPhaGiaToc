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

async function main() {
  console.log('⚡ Applying clan_guestbook_entries migration to Supabase Cloud...');
  const sql = `
    CREATE TABLE IF NOT EXISTS public.clan_guestbook_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
        author_name TEXT NOT NULL,
        branch_name TEXT,
        location TEXT,
        message TEXT NOT NULL,
        incense_count INTEGER DEFAULT 1,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_guestbook_family ON public.clan_guestbook_entries (family_id, created_at DESC);
    ALTER TABLE public.clan_guestbook_entries ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS guestbook_public_read ON public.clan_guestbook_entries;
    CREATE POLICY guestbook_public_read ON public.clan_guestbook_entries
        FOR SELECT USING (true);

    DROP POLICY IF EXISTS guestbook_public_insert ON public.clan_guestbook_entries;
    CREATE POLICY guestbook_public_insert ON public.clan_guestbook_entries
        FOR INSERT WITH CHECK (true);
  `;
  await querySql(sql);
  console.log('✅ clan_guestbook_entries table & RLS policies created on Supabase Cloud!');
}

main();
