import test from 'node:test';
import assert from 'node:assert';
import { GenealogyService } from '../src/services/GenealogyService';
import { FundService } from '../src/services/FundService';
import { FamilyService } from '../src/services/FamilyService';
import { MemorialService } from '../src/services/calendar/MemorialService';
import { EventService } from '../src/services/calendar/EventService';
import { ClanPassService } from '../src/services/security/ClanPassService';

console.log('\n============================================================');
console.log('EXECUTING STRICT SINGLE-FAMILY TENANT ISOLATION TEST SUITE');
console.log('============================================================\n');

test('TENANT-001: Genealogy tree strictly isolated per familyId', async () => {
  const familyAlpha = 'fam-0000-0001';
  const familyBeta = 'fam-beta-9999';

  const alphaTree = await GenealogyService.getFamilyTree(familyAlpha);
  assert.ok(alphaTree.members.length > 0, 'Alpha must have members');
  assert.ok(alphaTree.members.every((m) => m.family_id === familyAlpha), 'All Alpha members must belong to Alpha');

  const betaTree = await GenealogyService.getFamilyTree(familyBeta);
  assert.strictEqual(betaTree.members.length, 0, 'Beta has no members seeded, must return 0 rows');

  const undefinedTree = await GenealogyService.getFamilyTree(undefined);
  assert.strictEqual(undefinedTree.members.length, 0, 'Undefined familyId must return 0 rows (0 leak)');
  console.log('✅ [TENANT-001: Genealogy Zero-Leak Isolation] PASS');
});

test('TENANT-002: Fund & Financial Ledger strictly isolated per familyId', async () => {
  const familyAlpha = 'fam-0000-0001';
  const familyBeta = 'fam-beta-9999';

  const alphaFunds = await FundService.getFunds(familyAlpha);
  assert.ok(alphaFunds.length > 0, 'Alpha has funds');
  assert.ok(alphaFunds.every((f) => f.family_id === familyAlpha), 'All Alpha funds must belong to Alpha');

  const betaFunds = await FundService.getFunds(familyBeta);
  assert.strictEqual(betaFunds.length, 0, 'Beta has no funds, must return 0 rows');

  const undefinedFunds = await FundService.getFunds(undefined);
  assert.strictEqual(undefinedFunds.length, 0, 'Undefined familyId must return 0 funds (0 leak)');

  const alphaLedger = await FundService.getLedger(familyAlpha);
  assert.ok(alphaLedger.length > 0, 'Alpha has ledger transactions');
  assert.ok(alphaLedger.every((t) => t.family_id === familyAlpha), 'All Alpha ledger transactions must belong to Alpha');

  const betaLedger = await FundService.getLedger(familyBeta);
  assert.strictEqual(betaLedger.length, 0, 'Beta has no ledger, must return 0 rows');

  const undefinedLedger = await FundService.getLedger(undefined);
  assert.strictEqual(undefinedLedger.length, 0, 'Undefined familyId must return 0 transactions (0 leak)');
  console.log('✅ [TENANT-002: Financial Ledger Zero-Leak Isolation] PASS');
});

test('TENANT-003: Memorial dates strictly isolated per familyId', async () => {
  const familyAlpha = 'fam-0000-0001';
  const familyBeta = 'fam-beta-9999';

  const alphaMemorials = await MemorialService.getMemorials(familyAlpha);
  assert.ok(alphaMemorials.length > 0, 'Alpha has memorial dates');
  assert.ok(alphaMemorials.every((m) => m.family_id === familyAlpha), 'All Alpha memorials must belong to Alpha');

  const betaMemorials = await MemorialService.getMemorials(familyBeta);
  assert.strictEqual(betaMemorials.length, 0, 'Beta must return 0 memorials');

  const undefinedMemorials = await MemorialService.getMemorials(undefined);
  assert.strictEqual(undefinedMemorials.length, 0, 'Undefined familyId must return 0 memorials (0 leak)');
  console.log('✅ [TENANT-003: Memorial Dates Zero-Leak Isolation] PASS');
});

test('TENANT-004: Events & Budget strictly isolated per familyId', async () => {
  const familyAlpha = 'fam-0000-0001';
  const familyBeta = 'fam-beta-9999';

  const alphaEvents = await EventService.getEvents(familyAlpha);
  assert.ok(alphaEvents.length > 0, 'Alpha has events');
  assert.ok(alphaEvents.every((e) => e.family_id === familyAlpha), 'All Alpha events must belong to Alpha');

  const betaEvents = await EventService.getEvents(familyBeta);
  assert.strictEqual(betaEvents.length, 0, 'Beta must return 0 events');

  const undefinedEvents = await EventService.getEvents(undefined);
  assert.strictEqual(undefinedEvents.length, 0, 'Undefined familyId must return 0 events (0 leak)');
  console.log('✅ [TENANT-004: Events & Budget Zero-Leak Isolation] PASS');
});

test('TENANT-005: Dashboard metrics calculated strictly per familyId', async () => {
  const familyAlpha = 'fam-0000-0001';
  const familyBeta = 'fam-beta-9999';

  const alphaDashboard = await FamilyService.getDashboardData(familyAlpha);
  assert.ok(alphaDashboard.family !== null, 'Alpha family exists');
  assert.strictEqual(alphaDashboard.family?.id, familyAlpha, 'Dashboard must return Alpha family');
  assert.ok(alphaDashboard.totalFundBalance > 0, 'Alpha has fund balance');

  const betaDashboard = await FamilyService.getDashboardData(familyBeta);
  assert.strictEqual(betaDashboard.family, null, 'Beta has no family record');
  assert.strictEqual(betaDashboard.membersCount, 0, 'Beta member count must be 0');
  assert.strictEqual(betaDashboard.totalFundBalance, 0, 'Beta balance must be 0');

  const undefinedDashboard = await FamilyService.getDashboardData(undefined);
  assert.strictEqual(undefinedDashboard.family, null, 'Undefined familyId must return null');
  assert.strictEqual(undefinedDashboard.membersCount, 0, 'Undefined members count must be 0');
  assert.strictEqual(undefinedDashboard.totalFundBalance, 0, 'Undefined balance must be 0');
  console.log('✅ [TENANT-005: Dashboard Metrics Zero-Leak Isolation] PASS');
});

test('TENANT-006: Clan Pass unlocks ONLY target family with PIN verification', async () => {
  const familyAlpha = 'fam-0000-0001';
  const pass = await ClanPassService.getClanPass(familyAlpha);
  assert.ok(pass !== null, 'Alpha pass exists');

  // Verify PIN
  const verifyRes = await ClanPassService.verifyClanPIN(pass!.pass_token, '1986');
  assert.strictEqual(verifyRes.success, true, 'Correct PIN must succeed');
  assert.strictEqual(verifyRes.familyId, familyAlpha, 'Unlocked session must belong ONLY to Alpha');

  // Verify another family cannot be unlocked with Alpha token
  const wrongTokenRes = await ClanPassService.verifyClanPIN('invalid-token-xyz', '1986');
  assert.strictEqual(wrongTokenRes.success, false, 'Invalid token must be rejected');
  console.log('✅ [TENANT-006: Clan Pass Scope & PIN Guard] PASS');
});
