import test from 'node:test';
import assert from 'node:assert/strict';
import { ClanChronicleService } from '../src/services/ClanChronicleService';

test('▶ CLAN HERITAGE INTRODUCTION & CHRONICLES TEST SUITE', async (t) => {
  const familyAlpha = 'fam-alpha-1111';
  const familyBeta = 'fam-beta-2222';

  await t.test('CHRONICLE-001: Create and isolate chronicles strictly by familyId', async () => {
    const resA = await ClanChronicleService.createChronicle({
      family_id: familyAlpha,
      author_name: 'Nguyễn Văn Nam',
      author_branch: 'Chi Trưởng',
      author_generation: 12,
      title: 'Ký sự Đại Lễ Tế Tổ Họ Nguyễn Yên Mô',
      summary: 'Ghi lại không khí linh thiêng ngày giỗ tổ đầu xuân',
      content: 'Toàn thể con cháu tề tựu đông đủ dâng hương kính cáo tiên tổ...',
      category: 'FESTIVAL_REPORT',
      is_featured: true,
    });

    assert.equal(resA.success, true);
    assert.ok(resA.chronicle);
    assert.equal(resA.chronicle.family_id, familyAlpha);

    const resB = await ClanChronicleService.createChronicle({
      family_id: familyBeta,
      author_name: 'Trần Văn Hưng',
      author_branch: 'Chi Hai',
      author_generation: 15,
      title: 'Sự Tích Tiền Nhân Họ Trần',
      summary: 'Khởi thủy lập ấp từ thế kỷ XV',
      content: 'Tổ tiên di cư từ phương Bắc về khai hoang bờ cõi...',
      category: 'ORIGIN_HISTORY',
    });

    assert.equal(resB.success, true);
    assert.ok(resB.chronicle);
    assert.equal(resB.chronicle.family_id, familyBeta);

    // Verify isolation
    const listAlpha = await ClanChronicleService.getChronicles(familyAlpha);
    const listBeta = await ClanChronicleService.getChronicles(familyBeta);

    assert.ok(listAlpha.some((c) => c.id === resA.chronicle?.id));
    assert.ok(!listAlpha.some((c) => c.id === resB.chronicle?.id));

    assert.ok(listBeta.some((c) => c.id === resB.chronicle?.id));
    assert.ok(!listBeta.some((c) => c.id === resA.chronicle?.id));
  });

  await t.test('CHRONICLE-002: Category filtering and search functionality', async () => {
    const listOrigin = await ClanChronicleService.getChronicles(familyBeta, 'ORIGIN_HISTORY');
    assert.ok(listOrigin.length > 0);
    assert.equal(listOrigin[0].category, 'ORIGIN_HISTORY');

    const searchResults = await ClanChronicleService.getChronicles(familyAlpha, undefined, 'Lễ Tế Tổ');
    assert.ok(searchResults.length > 0);
    assert.ok(searchResults[0].title.includes('Tế Tổ'));
  });

  await t.test('CHRONICLE-003: Like counter and reflections/comments thread', async () => {
    const listA = await ClanChronicleService.getChronicles(familyAlpha);
    const target = listA[0];
    assert.ok(target);

    // Test Like
    const likeRes = await ClanChronicleService.likeChronicle(target.id, familyAlpha);
    assert.equal(likeRes.success, true);
    assert.ok(likeRes.likes >= 1);

    // Test Add Comment
    const commentRes = await ClanChronicleService.addComment({
      chronicle_id: target.id,
      family_id: familyAlpha,
      author_name: 'Nguyễn Văn Minh',
      author_branch: 'Chi Hai',
      content: 'Con cháu phương xa kính bái tiên tổ, nguyện noi gương các cụ!',
    });

    assert.equal(commentRes.success, true);
    assert.ok(commentRes.comment);
    assert.equal(commentRes.comment.chronicle_id, target.id);

    const comments = await ClanChronicleService.getComments(target.id, familyAlpha);
    assert.ok(comments.some((c) => c.id === commentRes.comment?.id));
  });

  await t.test('CHRONICLE-004: Clan Heritage Introduction retrieval & updates', async () => {
    const introBefore = await ClanChronicleService.getClanIntro(familyAlpha);
    assert.ok(introBefore);

    const updateRes = await ClanChronicleService.updateClanIntro(familyAlpha, {
      founding_ancestor: 'Cụ Thủy Tổ Nguyễn Quý Công',
      founding_year_era: 'Năm 1428 thời Lê Thái Tổ',
      clan_motto: 'Uống nước nhớ nguồn • Đoàn kết tương thân • Rạng danh tiên tổ',
      couplets: [
        {
          horizontal: 'ĐỨC LƯU QUANG',
          left: 'Tổ tông công đức thiên niên thịnh',
          right: 'Tử hiếu tôn hiền vạn đại vinh',
        },
      ],
      leadership_board: [
        { role: 'Trưởng Tộc', name: 'Nguyễn Văn Trưởng' },
      ],
    });

    assert.equal(updateRes.success, true);
    assert.ok(updateRes.intro);
    assert.equal(updateRes.intro.founding_ancestor, 'Cụ Thủy Tổ Nguyễn Quý Công');
    assert.equal(updateRes.intro.couplets.length, 1);
    assert.equal(updateRes.intro.couplets[0].horizontal, 'ĐỨC LƯU QUANG');
  });

  await t.test('CHRONICLE-005: Ancestral Hall Images management & persistence', async () => {
    const imagesToSave = [
      'https://images.unsplash.com/photo-1548625361-195fe57871b6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200',
    ];

    const updateRes = await ClanChronicleService.updateClanIntro(familyAlpha, {
      ancestral_hall_images: imagesToSave,
    });

    assert.equal(updateRes.success, true);
    assert.ok(updateRes.intro);
    assert.ok(updateRes.intro.ancestral_hall_images);
    assert.equal(updateRes.intro.ancestral_hall_images.length, 2);
    assert.equal(updateRes.intro.ancestral_hall_images[0], imagesToSave[0]);

    // Retrieve again to confirm persistence
    const reloaded = await ClanChronicleService.getClanIntro(familyAlpha);
    assert.ok(reloaded.ancestral_hall_images);
    assert.equal(reloaded.ancestral_hall_images.length, 2);
    assert.equal(reloaded.ancestral_hall_images[0], imagesToSave[0]);
  });
});
