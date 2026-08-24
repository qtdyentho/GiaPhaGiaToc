import { solarToLunar, lunarToSolar, getCanChiYear } from '../src/lib/lunar';

/**
 * Automated Test Suite for Vietnamese Lunar Calendar Engine (Ho Ngoc Duc UTC+7)
 */
function runLunarTests() {
  console.log('--- RUNNING LUNAR CALENDAR TESTS ---');

  // Test 1: Convert Lunar to Solar for Giỗ Cụ Thủy Tổ (15/01 Lunar 2026)
  const [day, month, year] = lunarToSolar(15, 1, 2026, false, 7);
  console.log(`Test 1: 15/01/2026 Lunar -> Solar: ${day}/${month}/${year}`);
  if (year === 2026 && month > 0 && day > 0) {
    console.log(`✅ Test 1 PASS: Solar date computed successfully (${day}/${month}/${year})`);
  } else {
    console.error('❌ Test 1 FAIL');
  }

  // Test 2: Can Chi calculation for 2026 (Bính Ngọ)
  const canChi2026 = getCanChiYear(2026);
  console.log(`Test 2: Can Chi for 2026: ${canChi2026}`);
  if (canChi2026 === 'Bính Ngọ') {
    console.log('✅ Test 2 PASS: 2026 is correctly identified as Bính Ngọ');
  } else {
    console.error(`❌ Test 2 FAIL: Expected Bính Ngọ, got ${canChi2026}`);
  }

  // Test 3: Can Chi calculation for 2024 (Giáp Thìn)
  const canChi2024 = getCanChiYear(2024);
  console.log(`Test 3: Can Chi for 2024: ${canChi2024}`);
  if (canChi2024 === 'Giáp Thìn') {
    console.log('✅ Test 3 PASS: 2024 is correctly identified as Giáp Thìn');
  } else {
    console.error(`❌ Test 3 FAIL: Expected Giáp Thìn, got ${canChi2024}`);
  }

  console.log('--- LUNAR CALENDAR SUITE COMPLETED ---\n');
}

runLunarTests();
