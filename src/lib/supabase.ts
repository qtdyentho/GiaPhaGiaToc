import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const DEFAULT_SUPABASE_URL = 'https://anwtruyxyraedrtpzchm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RydXl4eXJhZWRydHB6Y2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDA0OTIsImV4cCI6MjEwMzExNjQ5Mn0.RMd8Z_NKGNum7iIi1QgHkLx6RaziRiNNaKenfhgRv44';

const supabaseUrl = getEnv('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
  return !!url && !!key && !url.includes('sample-project');
};
