import test from 'node:test';
import assert from 'node:assert/strict';
import { ShortLinkService } from '../src/services/security/ShortLinkService';

test('UNIQUE CLAN SHORT LINK & HIGH-READABILITY QR SUITE', async (t) => {
  const familyAlpha = { id: 'fam-alpha-001', name: 'Họ Nguyễn Đại Tộc' };
  const familyBeta = { id: 'fam-beta-002', name: 'Họ Trần Đông Triều' };

  await t.test('SHORT-001: Random code generator produces valid Base62 alphanumeric codes', () => {
    const code1 = ShortLinkService.generateRandomCode(6);
    const code2 = ShortLinkService.generateRandomCode(6);

    assert.strictEqual(code1.length, 6);
    assert.strictEqual(code2.length, 6);
    assert.match(code1, /^[a-z0-9]+$/);
    assert.notStrictEqual(code1, code2, 'Subsequent generated codes must be distinct');
    console.log('✅ [SHORT-001: Base62 Code Generator] PASS');
  });

  await t.test('SHORT-002: Custom slug validator strictly enforces formatting and reserved words', () => {
    // Valid slugs
    assert.strictEqual(ShortLinkService.validateCustomSlug('ho-nguyen-dong-ky').valid, true);
    assert.strictEqual(ShortLinkService.validateCustomSlug('tran-toc-2026').valid, true);
    assert.strictEqual(ShortLinkService.validateCustomSlug('nv86').valid, true);

    // Invalid length (< 3 chars)
    const tooShort = ShortLinkService.validateCustomSlug('nv');
    assert.strictEqual(tooShort.valid, false);
    assert.ok(tooShort.error?.includes('ít nhất 3 ký tự'));

    // Invalid characters (spaces, special accents)
    const withAccents = ShortLinkService.validateCustomSlug('họ nguyễn');
    assert.strictEqual(withAccents.valid, false);

    // Reserved system keywords
    const reservedAdmin = ShortLinkService.validateCustomSlug('admin');
    assert.strictEqual(reservedAdmin.valid, false);
    assert.ok(reservedAdmin.error?.includes('từ khóa hệ thống'));

    const reservedBilling = ShortLinkService.validateCustomSlug('billing');
    assert.strictEqual(reservedBilling.valid, false);
    console.log('✅ [SHORT-002: Custom Slug Validator] PASS');
  });

  await t.test('SHORT-003: Uniqueness enforcement blocks duplicate code assignment', async () => {
    // Creating short link for Family Alpha
    const resAlpha = await ShortLinkService.createOrUpdateShortLink(
      familyAlpha.id,
      'CP-FAM-ALPHA-TOKEN-999',
      'alpha-clan'
    );
    assert.strictEqual(resAlpha.success, true);
    assert.strictEqual(resAlpha.shortLink?.short_code, 'alpha-clan');

    // Family Beta attempts to claim the exact same short code 'alpha-clan'
    const resBetaCollision = await ShortLinkService.createOrUpdateShortLink(
      familyBeta.id,
      'CP-FAM-BETA-TOKEN-111',
      'alpha-clan'
    );
    assert.strictEqual(resBetaCollision.success, false);
    assert.ok(resBetaCollision.error?.includes('đã được sử dụng bởi dòng họ khác'));

    // Case-insensitive collision check ('ALPHA-CLAN')
    const resBetaCaseCollision = await ShortLinkService.createOrUpdateShortLink(
      familyBeta.id,
      'CP-FAM-BETA-TOKEN-111',
      'ALPHA-CLAN'
    );
    assert.strictEqual(resBetaCaseCollision.success, false);
    console.log('✅ [SHORT-003: Global Uniqueness & Case-Insensitive Anti-Collision] PASS');
  });

  await t.test('SHORT-004: Atomic resolution from short_code to pass_token and clicks counting', async () => {
    // Resolving Family Alpha short link
    const initialRes = await ShortLinkService.resolveShortCode('alpha-clan');
    assert.strictEqual(initialRes.success, true);
    assert.strictEqual(initialRes.family_id, familyAlpha.id);
    assert.strictEqual(initialRes.pass_token, 'CP-FAM-ALPHA-TOKEN-999');
    assert.ok(typeof initialRes.clicks_count === 'number' && initialRes.clicks_count >= 1);

    // Resolving non-existent code returns friendly error
    const nonExistent = await ShortLinkService.resolveShortCode('random-ghost-code-404');
    assert.strictEqual(nonExistent.success, false);
    assert.ok(nonExistent.error?.includes('không tồn tại'));
    console.log('✅ [SHORT-004: Atomic Resolver & Click Counter] PASS');
  });

  await t.test('SHORT-005: Raw ID & Token Obfuscation Guarantee', () => {
    const shortCode = 'nv86';
    const shortUrl = ShortLinkService.buildShortUrl(shortCode);

    assert.ok(!shortUrl.includes('CP-FAM-'), 'Short URL must NEVER contain raw pass_token');
    assert.ok(!shortUrl.includes('fam-0000-'), 'Short URL must NEVER contain raw family_id');
    assert.ok(shortUrl.endsWith('/c/nv86'), 'Short URL must conform to clean /c/:shortCode format');
    console.log('✅ [SHORT-005: Obfuscation Guarantee] PASS');
  });

  await t.test('SHORT-006: Multi-tenant Isolation allows family to update their own slug without collision', async () => {
    // Family Alpha updates their slug to 'alpha-heritage-2026'
    const updateRes = await ShortLinkService.createOrUpdateShortLink(
      familyAlpha.id,
      'CP-FAM-ALPHA-TOKEN-999',
      'alpha-heritage-2026'
    );
    assert.strictEqual(updateRes.success, true);
    assert.strictEqual(updateRes.shortLink?.short_code, 'alpha-heritage-2026');

    // Family Alpha saving the same slug again is allowed (idempotent)
    const reSaveRes = await ShortLinkService.createOrUpdateShortLink(
      familyAlpha.id,
      'CP-FAM-ALPHA-TOKEN-999',
      'alpha-heritage-2026'
    );
    assert.strictEqual(reSaveRes.success, true);
    console.log('✅ [SHORT-006: Multi-Tenant Owner Re-assignment Idempotency] PASS');
  });
});
