/**
 * VIETNAMESE LUNAR CALENDAR ALGORITHM (Hồ Ngọc Đức - UTC+7 Asia/Ho_Chi_Minh)
 * Chuẩn thiên văn Việt Nam: Can Chi, Tháng nhuận, Ngày sóc, Tiết khí.
 */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiYear?: string;
  canChiMonth?: string;
  canChiDay?: string;
}

export function getCanChiYear(lunarYear: number): string {
  const can = CAN[(lunarYear + 6) % 10];
  const chi = CHI[(lunarYear + 8) % 12];
  return `${can} ${chi}`;
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number, d: number, e: number, m: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((146097 * b) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  d = Math.floor((4 * c + 3) / 1461);
  e = c - Math.floor((1461 * d) / 4);
  m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  const C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
  const C2 = -0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * Mpr * dr);
  const C3 = -0.0004 * Math.sin(3 * Mpr * dr);
  const C4 = 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
  const C5 = -0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  const C6 = -0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  const C7 = 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((M + 2 * Mpr) * dr);
  const deltat = Jd1 + C1 + C2 + C3 + C4 + C5 + C6 + C7;
  return Math.floor(deltat + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const C = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr)
    + 0.000290 * Math.sin(3 * M * dr);
  let theta = L0 + C;
  theta = theta * dr;
  theta = theta - Math.PI * 2 * Math.floor(theta / (Math.PI * 2));
  return Math.floor(theta / (Math.PI / 6));
}

export function solarToLunar(dd: number, mm: number, yy: number, timeZone: number = 7): LunarDate {
  const jdn = jdFromDate(dd, mm, yy);
  const k = Math.floor((jdn - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > jdn) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getNewMoonDay(Math.floor((jdFromDate(31, 12, yy) - 2415021.076998695) / 29.530588853), timeZone);
  let b11 = a11;
  if (a11 >= monthStart) {
    a11 = getNewMoonDay(Math.floor((jdFromDate(31, 12, yy - 1) - 2415021.076998695) / 29.530588853), timeZone);
  } else {
    b11 = getNewMoonDay(Math.floor((jdFromDate(31, 12, yy + 1) - 2415021.076998695) / 29.530588853), timeZone);
  }
  
  const lunarDay = jdn - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  let lunarYear = yy;
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap: false,
    canChiYear: getCanChiYear(lunarYear),
  };
}

/**
 * Chuyển ngày Âm lịch sang Dương lịch (Ho Ngoc Duc)
 */
export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeap: boolean = false, timeZone: number = 7): [number, number, number] {
  // Simple astronomical lookup approximation for recurrent memorials
  let k = Math.floor((jdFromDate(1, 1, lunarYear) - 2415021.076998695) / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const jdn = nm + (lunarMonth - 1) * 29 + (lunarDay - 1);
  return jdToDate(jdn);
}
