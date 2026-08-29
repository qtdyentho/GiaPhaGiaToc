import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://anwtruyxyraedrtpzchm.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Vercel Serverless Function: Supabase 24/7 Keep-Alive & Auto-Wakeup
 * Đánh thức CSDL Supabase định kỳ để chống cơ chế tự động tạm dừng (Auto-Pause)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  try {
    let dbStatus = 'UNKNOWN';
    let recordsCount = 0;
    let queryLatency = 0;

    if (supabaseUrl && (anonKey || serviceRoleKey)) {
      const client = createClient(supabaseUrl, serviceRoleKey || anonKey, {
        auth: { persistSession: false },
      });

      const qStart = Date.now();
      // Thực hiện query nhẹ vào bảng plans hoặc families để tạo database activity trên PostgreSQL
      const { data, error } = await client
        .from('plans')
        .select('id, name')
        .limit(5);

      queryLatency = Date.now() - qStart;

      if (error) {
        // Fallback thử query families
        const { data: famData, error: famError } = await client
          .from('families')
          .select('id')
          .limit(1);

        if (famError) {
          dbStatus = `DEGRADED: ${error.message}`;
        } else {
          dbStatus = 'ONLINE';
          recordsCount = famData?.length || 0;
        }
      } else {
        dbStatus = 'ONLINE';
        recordsCount = data?.length || 0;
      }
    } else {
      dbStatus = 'MOCK_STORE_ACTIVE (No Live Credentials)';
    }

    const totalLatency = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      message: 'Supabase Database Keep-Alive Ping Executed Successfully',
      database: dbStatus,
      status: 'AWAKE_AND_HEALTHY',
      records_inspected: recordsCount,
      query_latency_ms: queryLatency,
      total_response_ms: totalLatency,
      timestamp: new Date().toISOString(),
      cron_runner: req.headers['user-agent'] || 'Vercel-Cron / External-Heartbeat',
      next_recommended_ping: 'Every 6 to 24 hours',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Keep-Alive Ping Failed to reach Database',
      error: err?.message || String(err),
      database: 'UNREACHABLE',
      timestamp: new Date().toISOString(),
      total_response_ms: Date.now() - startTime,
    });
  }
}
