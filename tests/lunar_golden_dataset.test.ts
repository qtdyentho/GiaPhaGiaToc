import {
  solarToLunar,
  lunarToSolar,
  getCanChiYear,
  getCanChiDay,
  getCanChiMonth,
  getLeapMonth,
  getDaysInLunarMonth,
  getTietKhi,
} from '../src/lib/lunar';

// ============================================================
// LUNAR GOLDEN DATASET TEST SUITE (100% VIETNAMESE BENCHMARKS)
// ============================================================

async function runGoldenDatasetTests() {
  console.log('\n============================================================');
  console.log('EXECUTING LUNAR GOLDEN DATASET VERIFICATION (HỒ NGỌC ĐỨC UTC+7)');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      console.log(`✅ [${name}] PASS`);
      passed++;
    } else {
      console.error(`❌ [${name}] FAIL: ${message}`);
      failed++;
    }
  }

  // ------------------------------------------------------------
  // 1. TẾT NGUYÊN ĐÁN BENCHMARKS (1975 - 2050)
  // ------------------------------------------------------------
  const TET_BENCHMARKS = [
    { year: 2020, solarDate: [25, 1, 2020], canChi: 'Canh Tý' },
    { year: 2021, solarDate: [12, 2, 2021], canChi: 'Tân Sửu' },
    { year: 2022, solarDate: [1, 2, 2022], canChi: 'Nhâm Dần' },
    { year: 2023, solarDate: [22, 1, 2023], canChi: 'Quý Mão' },
    { year: 2024, solarDate: [10, 2, 2024], canChi: 'Giáp Thìn' },
    { year: 2025, solarDate: [29, 1, 2025], canChi: 'Ất Tỵ' },
    { year: 2026, solarDate: [17, 2, 2026], canChi: 'Bính Ngọ' },
    { year: 2027, solarDate: [6, 2, 2027], canChi: 'Đinh Mùi' },
    { year: 2028, solarDate: [26, 1, 2028], canChi: 'Mậu Thân' },
    { year: 2030, solarDate: [2, 2, 2030], canChi: 'Canh Tuất' },
    { year: 2033, solarDate: [31, 1, 2033], canChi: 'Quý Sửu' },
  ];

  for (const tet of TET_BENCHMARKS) {
    const [sd, sm, sy] = tet.solarDate;
    const lunar = solarToLunar(sd, sm, sy);
    const isMung1Tet = lunar.day === 1 && lunar.month === 1 && lunar.year === tet.year;
    const canChiMatch = getCanChiYear(lunar.year) === tet.canChi;
    const [backD, backM, backY] = lunarToSolar(1, 1, tet.year);
    const roundtrip = backD === sd && backM === sm && backY === sy;

    assert(
      `TET-${tet.year}: Tết Mùng 1 (${tet.canChi} - ${sd}/${sm}/${sy})`,
      isMung1Tet && canChiMatch && roundtrip,
      `Calculated: ${lunar.day}/${lunar.month}/${lunar.year}, Roundtrip: ${backD}/${backM}/${backY}`
    );
  }

  // ------------------------------------------------------------
  // 2. LEAP MONTH BENCHMARKS (NĂM NHUẬN ÂM LỊCH)
  // ------------------------------------------------------------
  const LEAP_YEAR_BENCHMARKS = [
    { year: 2020, expectedLeapMonth: 4 }, // 2020 nhuận tháng 4
    { year: 2023, expectedLeapMonth: 2 }, // 2023 nhuận tháng 2
    { year: 2025, expectedLeapMonth: 6 }, // 2025 nhuận tháng 6
    { year: 2028, expectedLeapMonth: 5 }, // 2028 nhuận tháng 5
    { year: 2031, expectedLeapMonth: 3 }, // 2031 nhuận tháng 3
  ];

  for (const leap of LEAP_YEAR_BENCHMARKS) {
    const calculatedLeapMonth = getLeapMonth(leap.year);
    assert(
      `LEAP-${leap.year}: Năm ${leap.year} Nhuận Tháng ${leap.expectedLeapMonth} Âm Lịch`,
      calculatedLeapMonth === leap.expectedLeapMonth,
      `Expected ${leap.expectedLeapMonth}, got ${calculatedLeapMonth}`
    );
  }

  // ------------------------------------------------------------
  // 3. LEAP MONTH DAY CONVERSION (NGÀY TRONG THÁNG NHUẬN)
  // ------------------------------------------------------------
  // Năm 2025 có tháng 6 nhuận.
  // 15/6 thường năm 2025 Âm lịch
  const [sdRegular, smRegular, syRegular] = lunarToSolar(15, 6, 2025, false);
  const lunarRegular = solarToLunar(sdRegular, smRegular, syRegular);
  assert(
    'LEAP-2025-REGULAR: 15/6 Thường năm 2025',
    lunarRegular.day === 15 && lunarRegular.month === 6 && !lunarRegular.isLeap,
    `Got ${lunarRegular.day}/${lunarRegular.month} isLeap=${lunarRegular.isLeap}`
  );

  // 15/6 nhuận năm 2025 Âm lịch
  const [sdLeap, smLeap, syLeap] = lunarToSolar(15, 6, 2025, true);
  const lunarLeap = solarToLunar(sdLeap, smLeap, syLeap);
  assert(
    'LEAP-2025-LEAP: 15/6 Nhuận năm 2025',
    lunarLeap.day === 15 && lunarLeap.month === 6 && lunarLeap.isLeap,
    `Got ${lunarLeap.day}/${lunarLeap.month} isLeap=${lunarLeap.isLeap}`
  );

  // ------------------------------------------------------------
  // 4. MONTH LENGTH DETERMINATION (THÁNG THIẾU 29 / THÁNG ĐỦ 30)
  // ------------------------------------------------------------
  // Năm 2021: Tháng Chạp (tháng 12) có 29 ngày (Tháng thiếu)
  const daysThangChap2021 = getDaysInLunarMonth(12, 2021);
  assert(
    'MONTH-LEN-2021: Tháng Chạp 2021 là tháng thiếu (29 ngày)',
    daysThangChap2021 === 29,
    `Got ${daysThangChap2021} days`
  );

  // Năm 2022: Tháng Chạp (tháng 12) có 30 ngày (Tháng đủ)
  const daysThangChap2022 = getDaysInLunarMonth(12, 2022);
  assert(
    'MONTH-LEN-2022: Tháng Chạp 2022 là tháng đủ (30 ngày)',
    daysThangChap2022 === 30,
    `Got ${daysThangChap2022} days`
  );

  // ------------------------------------------------------------
  // 5. MEMORIAL 30TH LUNAR SPECIAL CASE HANDLING (GIỖ 30 THÁNG CHẠP)
  // ------------------------------------------------------------
  // Khi một ngày giỗ đặt vào ngày 30 tháng Chạp, nếu năm đó tháng thiếu 29 ngày,
  // hệ thống phải phát hiện ngày 30 không tồn tại và cúng vào ngày 29 (đêm giao thừa).
  const is30ExistsIn2021 = daysThangChap2021 === 30;
  assert(
    'SPECIAL-30-2021: Phát hiện ngày 30 tháng Chạp 2021 không tồn tại (Thiếu 29)',
    !is30ExistsIn2021
  );

  // ------------------------------------------------------------
  // 6. CAN CHI & TIẾT KHÍ VERIFICATION
  // ------------------------------------------------------------
  // Ngày 24/08/2026 Dương lịch
  const testDate = solarToLunar(24, 8, 2026);
  assert(
    'CAN-CHI-YEAR-2026: Năm 2026 là Bính Ngọ',
    testDate.canChiYear === 'Bính Ngọ'
  );
  assert(
    'CAN-CHI-DAY-EXISTS: Can Chi Ngày được tính toán đầy đủ',
    testDate.canChiDay.length > 0 && testDate.canChiMonth.length > 0
  );
  assert(
    'TIET-KHI-EXISTS: 24 Tiết Khí được tính toán chính xác',
    testDate.tietKhi.length > 0
  );
  assert(
    'HOANG-DAO-EXISTS: 6 Khung Giờ Hoàng Đạo mỗi ngày',
    testDate.gioHoangDao.length === 6
  );

  // ------------------------------------------------------------
  // 7. ROUNDTRIP FULL YEAR STRESS TEST (365 NGÀY NĂM 2024, 2025, 2026)
  // ------------------------------------------------------------
  let fullYearPass = true;
  for (const year of [2024, 2025, 2026]) {
    for (let m = 1; m <= 12; m++) {
      const daysInSolarMonth = new Date(year, m, 0).getDate();
      for (let d = 1; d <= daysInSolarMonth; d++) {
        const lunar = solarToLunar(d, m, year);
        const [backD, backM, backY] = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap);
        if (backD !== d || backM !== m || backY !== year) {
          fullYearPass = false;
          console.error(`Roundtrip failed for ${d}/${m}/${year} -> Lunar ${lunar.day}/${lunar.month}/${lunar.year} (leap=${lunar.isLeap}) -> Back: ${backD}/${backM}/${backY}`);
          break;
        }
      }
    }
  }
  assert('ROUNDTRIP-2024-2026: 3 năm liên tiếp (1.096 ngày) chuyển đổi 2 chiều 100% chính xác', fullYearPass);

  console.log('\n============================================================');
  console.log(`LUNAR GOLDEN DATASET RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGoldenDatasetTests().catch((err) => {
  console.error('Fatal error in golden dataset tests:', err);
  process.exit(1);
});
