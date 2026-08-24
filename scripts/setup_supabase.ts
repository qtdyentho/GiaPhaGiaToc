import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jgpxhwizqrdtifdodeoe.supabase.co';
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  console.log('--- TESTING SUPABASE CONNECTION ---');
  console.log('URL:', supabaseUrl);

  try {
    const { data, error } = await supabase.from('families').select('*').limit(1);
    if (error) {
      console.log('Query families response error:', error.message, error.code);
    } else {
      console.log('Query families successful! Rows:', data);
    }
  } catch (err: any) {
    console.error('Error:', err);
  }
}

main();
