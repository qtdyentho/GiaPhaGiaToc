import {
  solarToLunar,
  lunarToSolar,
  getLeapMonth,
  getLunarMonth11,
  getLeapMonthOffset,
  getNewMoonDay,
  getSunLongitude,
  jdFromDate,
  jdToDate,
} from '../src/lib/lunar';

console.log('2020 a11:', getLunarMonth11(2019));
const a11_2019 = getLunarMonth11(2019);
const b11_2020 = getLunarMonth11(2020);
console.log('2020 span:', b11_2020 - a11_2019);
const leapOff2020 = getLeapMonthOffset(a11_2019);
console.log('2020 leapOff:', leapOff2020);
console.log('2020 leapMonth function:', getLeapMonth(2020));

console.log('\n2025 a11:', getLunarMonth11(2024));
const a11_2024 = getLunarMonth11(2024);
const b11_2025 = getLunarMonth11(2025);
console.log('2025 span:', b11_2025 - a11_2024);
const leapOff2025 = getLeapMonthOffset(a11_2024);
console.log('2025 leapOff:', leapOff2025);
console.log('2025 leapMonth function:', getLeapMonth(2025));

console.log('\n2030 tet (03/02/2030):', solarToLunar(3, 2, 2030));
console.log('2030 lunar 1/1 to solar:', lunarToSolar(1, 1, 2030));
console.log('2030 a11:', getLunarMonth11(2029));
console.log('2030 b11:', getLunarMonth11(2030));

console.log('\n2033 a11:', getLunarMonth11(2032));
const a11_2032 = getLunarMonth11(2032);
const b11_2033 = getLunarMonth11(2033);
console.log('2033 span:', b11_2033 - a11_2032);
const leapOff2033 = getLeapMonthOffset(a11_2032);
console.log('2033 leapOff:', leapOff2033);
console.log('2033 leapMonth function:', getLeapMonth(2033));
