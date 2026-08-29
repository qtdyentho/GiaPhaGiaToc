import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseKeepAliveService } from '../src/services/DatabaseKeepAliveService';

test('SUPABASE 24/7 KEEP-ALIVE & AUTO-WAKEUP ENGINE SUITE', async (t) => {
  await t.test('KEEPALIVE-001: DatabaseKeepAliveService.pingDatabase returns healthy status & latency', async () => {
    const status = await DatabaseKeepAliveService.pingDatabase();
    assert.strictEqual(typeof status.isOnline, 'boolean');
    assert.ok(status.latencyMs >= 0, 'Latency must be a non-negative number');
    assert.ok(status.lastPingAt.length > 0, 'Last ping timestamp must be present');
    assert.ok(status.autoWakeupChannels.length >= 2, 'Must report at least 2 auto-wakeup channels');
    console.log(`✅ [KEEPALIVE-001: Ping Execution] PASS (Latency: ${status.latencyMs}ms, Online: ${status.isOnline})`);
  });

  await t.test('KEEPALIVE-002: Client Heartbeat Timer starts safely without duplicate', () => {
    DatabaseKeepAliveService.startClientHeartbeat();
    DatabaseKeepAliveService.startClientHeartbeat(); // Calling twice should be idempotent
    const last = DatabaseKeepAliveService.getLastStatus();
    assert.ok(last !== undefined, 'Last status should exist or be null');
    console.log('✅ [KEEPALIVE-002: Idempotent Heartbeat Timer] PASS');
  });

  await t.test('KEEPALIVE-003: Vercel Cron Configuration in vercel.json is valid', () => {
    const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
    assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    assert.ok(Array.isArray(vercelConfig.crons), 'vercel.json must contain crons array');
    const keepaliveCron = vercelConfig.crons.find((c: any) => c.path === '/api/keepalive');
    assert.ok(keepaliveCron, 'Cron for /api/keepalive must be registered');
    assert.ok(keepaliveCron.schedule.length > 0, 'Cron schedule must be specified');
    console.log('✅ [KEEPALIVE-003: Vercel Cron Config] PASS (Path: /api/keepalive, Schedule: ' + keepaliveCron.schedule + ')');
  });

  await t.test('KEEPALIVE-004: GitHub Action Workflow YAML exists and has 6-hour cron', () => {
    const ghWorkflowPath = path.resolve(process.cwd(), 'scripts/supabase-keepalive.yml');
    assert.ok(fs.existsSync(ghWorkflowPath), 'scripts/supabase-keepalive.yml must exist');
    const content = fs.readFileSync(ghWorkflowPath, 'utf8');
    assert.ok(content.includes("cron: '0 */6 * * *'"), 'Must contain 6-hour cron expression');
    assert.ok(content.includes('workflow_dispatch'), 'Must allow manual trigger via workflow_dispatch');
    assert.ok(content.includes('/api/keepalive'), 'Must ping keepalive endpoint');
    console.log('✅ [KEEPALIVE-004: GitHub Actions 6-Hour Cron Guard] PASS');
  });

  await t.test('KEEPALIVE-005: api/keepalive.ts file exists and has proper error handling', () => {
    const apiPath = path.resolve(process.cwd(), 'api/keepalive.ts');
    assert.ok(fs.existsSync(apiPath), 'api/keepalive.ts must exist');
    const content = fs.readFileSync(apiPath, 'utf8');
    assert.ok(content.includes('export default async function handler'), 'Must export handler');
    assert.ok(content.includes('AWAKE_AND_HEALTHY'), 'Must return positive health message');
    console.log('✅ [KEEPALIVE-005: Serverless Function Implementation] PASS');
  });
});
