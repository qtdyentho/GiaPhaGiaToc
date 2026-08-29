import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://anwtruyxyraedrtpzchm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RydXl4eXJhZWRydHB6Y2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDA0OTIsImV4cCI6MjEwMzExNjQ5Mn0.RMd8Z_NKGNum7iIi1QgHkLx6RaziRiNNaKenfhgRv44';

// Sử dụng truy cập tĩnh để Vite build-time AST replacement hoạt động chính xác 100% trên Vercel
const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const rawKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseUrl = String(rawUrl).trim();
export const supabaseAnonKey = String(rawKey).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('sample-project'));
};

