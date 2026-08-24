import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CryptoStorageService } from '../src/services/security/CryptoStorageService';

describe('PII ENCRYPTION & DATA MASKING STORAGE SECURITY TEST SUITE', () => {
  it('[CRYPTO-001] Phone number data masking: 0912345678 -> 091••••678', () => {
    const raw = '0912345678';
    const masked = CryptoStorageService.maskPhone(raw);
    assert.strictEqual(masked, '091••••678');
    assert.ok(!masked.includes('345'));
  });

  it('[CRYPTO-002] Email data masking: hoang.nguyen@giaphatoc.vn -> ho••••n@giaphatoc.vn', () => {
    const raw = 'hoang.nguyen@giaphatoc.vn';
    const masked = CryptoStorageService.maskEmail(raw);
    assert.ok(masked.startsWith('ho'));
    assert.ok(masked.endsWith('@giaphatoc.vn'));
    assert.ok(masked.includes('••••'));
  });

  it('[CRYPTO-003] Citizen ID data masking: 001085001234 -> 001••••••234', () => {
    const raw = '001085001234';
    const masked = CryptoStorageService.maskCitizenId(raw);
    assert.strictEqual(masked, '001••••••234');
    assert.ok(!masked.includes('085001'));
  });

  it('[CRYPTO-004] Encrypt & Decrypt Roundtrip preserves plaintext', async () => {
    const sensitive = '001085001234_Secret_Citizen_ID';
    const encrypted = await CryptoStorageService.encrypt(sensitive);
    assert.ok(encrypted.startsWith('enc:v1:'));
    assert.notStrictEqual(encrypted, sensitive);

    const decrypted = await CryptoStorageService.decrypt(encrypted);
    assert.strictEqual(decrypted, sensitive);
  });

  it('[CRYPTO-005] Encrypted user dataset retrieval & data integrity', () => {
    const users = CryptoStorageService.getEncryptedUsers();
    assert.ok(users.length >= 6);
    const admin = users.find((u) => u.role === 'SUPER_ADMIN');
    assert.ok(admin);
    assert.strictEqual(admin?.id, 'usr-super-admin');

    const owner = users.find((u) => u.family_role === 'OWNER' && u.role === 'USER');
    assert.ok(owner);
    assert.strictEqual(owner?.family_code, 'NGUYEN-VAN-HN');
  });
});
