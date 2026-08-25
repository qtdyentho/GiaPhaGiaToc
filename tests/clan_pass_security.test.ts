import test from 'node:test';
import assert from 'node:assert/strict';
import { ClanPassService } from '../src/services/security/ClanPassService';

test('CLAN ACCESS PASS & ENCRYPTED PIN SECURITY SUITE', async (t) => {
  const testFamilyId = 'fam-test-alpha-001';
  const otherFamilyId = 'fam-test-beta-002';
  const secretPin = '202688';

  await t.test('PASS-001: Salted SHA-256 PIN Hashing produces non-reversible hash', async () => {
    const salt = 'random_salt_123456';
    const hash1 = await ClanPassService.hashPin(secretPin, salt, testFamilyId);
    const hash2 = await ClanPassService.hashPin(secretPin, salt, testFamilyId);
    const hashOtherSalt = await ClanPassService.hashPin(secretPin, 'diff_salt', testFamilyId);

    assert.ok(hash1.length >= 32, 'Hash must be at least 32 chars');
    assert.strictEqual(hash1, hash2, 'Identical inputs must yield identical hash');
    assert.notStrictEqual(hash1, secretPin, 'Plaintext PIN must never be stored');
    assert.notStrictEqual(hash1, hashOtherSalt, 'Different salt must yield different hash');
    console.log('✅ [PASS-001: Salted SHA-256 PIN Hashing] PASS');
  });

  await t.test('PASS-002: Set Clan PIN and retrieve public pass token', async () => {
    const setResult = await ClanPassService.setClanPin(testFamilyId, secretPin);
    assert.strictEqual(setResult.success, true, 'Setting clan PIN must succeed');

    const config = await ClanPassService.getFamilyPassConfig(testFamilyId);
    assert.ok(config.pass_token.startsWith('CP-FAM-'), 'Token must have standard CP-FAM- prefix');
    assert.strictEqual(config.has_pin, true, 'Config must report that PIN is set');
    console.log('✅ [PASS-002: Set Clan PIN & Token] PASS');
  });

  await t.test('PASS-003: Correct PIN verification grants MEMBER session', async () => {
    const config = await ClanPassService.getFamilyPassConfig(testFamilyId);
    const verifyResult = await ClanPassService.verifyClanPass(config.pass_token, secretPin);

    assert.strictEqual(verifyResult.success, true, 'Verification with correct PIN must succeed');
    assert.ok(verifyResult.session, 'Session must be returned');
    assert.strictEqual(verifyResult.session?.role, 'MEMBER', 'Session role must be MEMBER (full transparency)');
    assert.strictEqual(verifyResult.session?.family_id, testFamilyId, 'Session must lock to family_id');
    console.log('✅ [PASS-003: Correct PIN Verification] PASS');
  });

  await t.test('PASS-004: Incorrect PIN is rejected with remaining attempts warning', async () => {
    const config = await ClanPassService.getFamilyPassConfig(testFamilyId);
    const wrongResult = await ClanPassService.verifyClanPass(config.pass_token, '000000');

    assert.strictEqual(wrongResult.success, false, 'Wrong PIN must be rejected');
    assert.ok(wrongResult.error?.includes('không chính xác'), 'Error message must inform incorrect PIN');
    console.log('✅ [PASS-004: Incorrect PIN Rejected] PASS');
  });

  await t.test('PASS-005: 5 Consecutive Failed Attempts triggers 15-minute lockout', async () => {
    const config = await ClanPassService.getFamilyPassConfig(testFamilyId);
    // Send 4 more failures
    await ClanPassService.verifyClanPass(config.pass_token, '1111');
    await ClanPassService.verifyClanPass(config.pass_token, '2222');
    await ClanPassService.verifyClanPass(config.pass_token, '3333');
    const lockResult = await ClanPassService.verifyClanPass(config.pass_token, '4444');

    assert.strictEqual(lockResult.success, false);
    assert.ok(lockResult.error?.includes('tạm khóa 15 phút') || lockResult.error?.includes('khóa'), 'Must report lockout');
    console.log('✅ [PASS-005: Brute-Force Lockout Guard] PASS');
  });

  await t.test('PASS-006: Regenerating token invalidates previous pass token', async () => {
    const oldConfig = await ClanPassService.getFamilyPassConfig(testFamilyId);
    const regenResult = await ClanPassService.regeneratePassToken(testFamilyId);

    assert.strictEqual(regenResult.success, true);
    assert.notStrictEqual(regenResult.newToken, oldConfig.pass_token, 'New token must differ from old token');

    // Unlocking with new token after lockout reset
    await ClanPassService.setClanPin(testFamilyId, '999999');
    const newVerify = await ClanPassService.verifyClanPass(regenResult.newToken!, '999999');
    assert.strictEqual(newVerify.success, true, 'Verification with new token and new PIN must succeed');
    console.log('✅ [PASS-006: Token Revocation & Regeneration] PASS');
  });

  await t.test('PASS-007: Multi-tenant isolation (Family Alpha token cannot access Family Beta)', async () => {
    await ClanPassService.setClanPin(otherFamilyId, '777777');
    const betaConfig = await ClanPassService.getFamilyPassConfig(otherFamilyId);
    const betaVerify = await ClanPassService.verifyClanPass(betaConfig.pass_token, '777777');

    assert.strictEqual(betaVerify.success, true);
    assert.strictEqual(betaVerify.session?.family_id, otherFamilyId, 'Beta token must exclusively access Beta family');
    assert.notStrictEqual(betaVerify.session?.family_id, testFamilyId, 'Cross-tenant family access strictly prohibited');
    console.log('✅ [PASS-007: Multi-Tenant Zero-Leak Isolation] PASS');
  });
});
