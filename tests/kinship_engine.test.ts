import { describe, it } from 'node:test';
import assert from 'node:assert';
import { KinshipService } from '../src/services/genealogy/KinshipService';
import { mockMembers } from '../src/services/mockData';

describe('VIETNAMESE CLAN KINSHIP REASONING ENGINE (PHÂN VAI VẾ & XƯNG HÔ GIA TỘC)', () => {
  const members = mockMembers;

  it('[KIN-001] Self kinship check: A calls A -> Bản thân', () => {
    const tuan = members.find((m) => m.id === 'mb-004')!;
    const res = KinshipService.evaluateKinshipLocal(tuan, tuan, members);
    assert.strictEqual(res.term_a_calls_b, 'Bản thân');
    assert.strictEqual(res.generation_distance, 0);
    assert.strictEqual(res.relationship_category, 'SELF');
  });

  it('[KIN-002] Direct father and son check: Bố -> Con & Con -> Bố', () => {
    const hoang = members.find((m) => m.id === 'mb-003')!; // Bố
    const tuan = members.find((m) => m.id === 'mb-004')!; // Con trai

    const sonToFather = KinshipService.evaluateKinshipLocal(tuan, hoang, members);
    assert.ok(sonToFather.term_a_calls_b.includes('Bố'));
    assert.ok(sonToFather.term_b_calls_a.includes('Con'));
    assert.strictEqual(sonToFather.generation_distance, 1);
    assert.strictEqual(sonToFather.seniority, 'B_IS_SENIOR');

    const fatherToSon = KinshipService.evaluateKinshipLocal(hoang, tuan, members);
    assert.ok(fatherToSon.term_a_calls_b.includes('Con'));
    assert.ok(fatherToSon.term_b_calls_a.includes('Bố'));
    assert.strictEqual(fatherToSon.generation_distance, -1);
    assert.strictEqual(fatherToSon.seniority, 'A_IS_SENIOR');
  });

  it('[KIN-003] Sibling relationship check: Anh ruột -> Em ruột', () => {
    const tuan = members.find((m) => m.id === 'mb-004')!; // Con thứ 1 (Nam)
    const mai = members.find((m) => m.id === 'mb-009')!; // Con thứ 2 (Nữ)

    const elderToYounger = KinshipService.evaluateKinshipLocal(tuan, mai, members);
    assert.strictEqual(elderToYounger.term_a_calls_b, 'Em ruột');
    assert.strictEqual(elderToYounger.generation_distance, 0);

    const youngerToElder = KinshipService.evaluateKinshipLocal(mai, tuan, members);
    assert.strictEqual(youngerToElder.term_a_calls_b, 'Anh ruột');
    assert.strictEqual(youngerToElder.generation_distance, 0);
  });

  it('[KIN-004] Same generation cousin branch seniority (Con Bác vs Con Chú)', () => {
    // Tuấn: Đời 4, Chi Trưởng (Bố là Trưởng tộc Hoàng)
    // Đức: Đời 4, Chi Hai (Bố là Bình - con của cụ Tín Chi 2)
    const tuan = members.find((m) => m.id === 'mb-004')!;
    const duc = members.find((m) => m.id === 'mb-011')!;

    // Tuấn (Chi Trưởng) gọi Đức (Chi Hai) là Em họ
    const tuanCallsDuc = KinshipService.evaluateKinshipLocal(tuan, duc, members);
    assert.ok(tuanCallsDuc.term_a_calls_b.includes('Em họ'));
    assert.strictEqual(tuanCallsDuc.generation_distance, 0);
    assert.strictEqual(tuanCallsDuc.seniority, 'A_IS_SENIOR');

    // Đức (Chi Hai) dù nhiều tuổi hơn ngoài đời vẫn phải gọi Tuấn là Anh họ (Vế trên / Con Bác)
    const ducCallsTuan = KinshipService.evaluateKinshipLocal(duc, tuan, members);
    assert.ok(ducCallsTuan.term_a_calls_b.includes('Anh họ'));
    assert.strictEqual(ducCallsTuan.generation_distance, 0);
    assert.strictEqual(ducCallsTuan.seniority, 'B_IS_SENIOR');
  });

  it('[KIN-005] 1 Generation distance (ΔG = 1): Cháu gọi Chú họ & Bác họ', () => {
    // Tuấn (Đời 4) và Bình (Đời 3 Chi Hai)
    const tuan = members.find((m) => m.id === 'mb-004')!;
    const binh = members.find((m) => m.id === 'mb-008')!;

    const nephewToUncle = KinshipService.evaluateKinshipLocal(tuan, binh, members);
    assert.ok(nephewToUncle.term_a_calls_b.includes('Chú họ') || nephewToUncle.term_a_calls_b.includes('Bác họ'));
    assert.strictEqual(nephewToUncle.term_b_calls_a, 'Cháu');
    assert.strictEqual(nephewToUncle.generation_distance, 1);
  });

  it('[KIN-006] 2 Generations distance (ΔG = 2): Cháu gọi Ông nội tộc', () => {
    // Cháu An (Đời 5) và Ông Trưởng Tộc Hoàng (Đời 3)
    const an = members.find((m) => m.id === 'mb-012')!;
    const hoang = members.find((m) => m.id === 'mb-003')!;

    const res = KinshipService.evaluateKinshipLocal(an, hoang, members);
    assert.ok(res.term_a_calls_b.includes('Ông'));
    assert.strictEqual(res.term_b_calls_a, 'Cháu nội tộc');
    assert.strictEqual(res.generation_distance, 2);
    assert.strictEqual(res.relationship_category, 'GRANDPARENT_GRANDCHILD');
  });

  it('[KIN-007] 3 Generations distance (ΔG = 3): Chắt gọi Cụ nội tộc', () => {
    // Cháu An (Đời 5) và Cụ Trọng (Đời 2)
    const an = members.find((m) => m.id === 'mb-012')!;
    const trong = members.find((m) => m.id === 'mb-002')!;

    const res = KinshipService.evaluateKinshipLocal(an, trong, members);
    assert.ok(res.term_a_calls_b.includes('Cụ'));
    assert.strictEqual(res.term_b_calls_a, 'Chắt');
    assert.strictEqual(res.generation_distance, 3);
    assert.strictEqual(res.relationship_category, 'GREAT_GRANDPARENT');
  });

  it('[KIN-008] 4 Generations distance (ΔG = 4): Chút gọi Cụ Kỵ Thủy Tổ', () => {
    // Cháu An (Đời 5) và Cụ Thủy Tổ Phúc (Đời 1)
    const an = members.find((m) => m.id === 'mb-012')!;
    const phuc = members.find((m) => m.id === 'mb-001')!;

    const res = KinshipService.evaluateKinshipLocal(an, phuc, members);
    assert.ok(res.term_a_calls_b.includes('Cụ Kỵ'));
    assert.ok(res.term_b_calls_a.includes('Chút'));
    assert.strictEqual(res.generation_distance, 4);
    assert.strictEqual(res.relationship_category, 'ANCESTOR');
  });

  it('[KIN-009] Paternal Aunt (Cô họ) check for female relative in parent generation', () => {
    // Tuấn (Đời 4) và Cụ Bà Cô Loan (Đời 2)
    const tuan = members.find((m) => m.id === 'mb-004')!;
    const loan = members.find((m) => m.id === 'mb-006')!;

    const res = KinshipService.evaluateKinshipLocal(tuan, loan, members);
    assert.ok(res.term_a_calls_b.includes('Bà') || res.term_a_calls_b.includes('Cô'));
    assert.strictEqual(res.generation_distance, 2);
  });
});
