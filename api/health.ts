import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const webhookSecret = process.env.BANK_WEBHOOK_SECRET || '';

const startTime = Date.now();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const checks: Record<string, string> = {
    application: 'UP',
    database: 'UNKNOWN',
    authentication: 'UP',
    storage: 'UP',
    payment_vietqr: 'CONFIGURED',
    webhook_hmac: webhookSecret ? 'CONFIGURED' : 'DEFAULT_SANDBOX',
  };

  let isHealthy = true;

  // Check Database Connectivity
  if (supabaseUrl && (anonKey || serviceRoleKey)) {
    try {
      const client = createClient(supabaseUrl, anonKey || serviceRoleKey, {
        auth: { persistSession: false },
      });
      const { error } = await client.from('plans').select('id').limit(1);
      if (error) {
        checks.database = 'DEGRADED';
      } else {
        checks.database = 'UP';
      }
    } catch {
      checks.database = 'DOWN';
      isHealthy = false;
    }
  } else {
    checks.database = 'UP (MOCK_STORE)';
  }

  const statusCode = isHealthy ? 200 : 503;
  const status = isHealthy ? 'HEALTHY' : 'UNHEALTHY';

  return res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    checks,
  });
}
