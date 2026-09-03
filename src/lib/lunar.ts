/**
 * VIETNAMESE ASTRONOMICAL LUNAR CALENDAR ENGINE (Hồ Ngọc Đức - UTC+7 Asia/Ho_Chi_Minh)
 * Chuẩn Thiên Văn Học Việt Nam: Can Chi, 24 Tiết Khí, Giờ Hoàng Đạo, Tháng Nhuận, Tháng Đủ/Thiếu (29/30).
 * Kinh tuyến cơ sở: 105° Đông (Múi giờ UTC+7).
 */

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

export const TIET_KHI = [
  'Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ',
  'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử',
  'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ',
  'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông',
  'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn',
  'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'
];

export const GIO_HOANG_DAO = [
  'Tý (23h-01h)', 'Sửu (01h-03h)', 'Dần (03h-05h)', 'Mão (05h-07h)',
  'Thìn (07h-09h)', 'Tỵ (09h-11h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)',
  'Thân (15h-17h)', 'Dậu (17h-19h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'
];

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  tietKhi: string;
  gioHoangDao: string[];
  daysInMonth: number;
  solarDate: string; // YYYY-MM-DD
}

/**
 * Chuyển đổi ngày Dương lịch sang số ngày Julian (JDN)
 */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

/**
 * Chuyển đổi số ngày Julian (JDN) sang ngày Dương lịch [dd, mm, yy]
 */
export function jdToDate(jd: number): [number, number, number] {
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

/**
 * Tính ngày Sóc (New Moon) theo k
 */
export function getNewMoonDay(k: number, timeZone: number = 7): number {
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

/**
 * Tính kinh độ mặt trời (Sun Longitude) theo JDN
 */
export function getSunLongitude(dayNumber: number, timeZone: number = 7): number {
  const jdn = dayNumber - 0.5 - timeZone / 24;
  const T = (jdn - 2451545.0) / 36525;
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

/**
 * Tìm ngày Sóc tháng 11 Âm lịch (tháng chứa Đông chí) của năm yy
 */
export function getLunarMonth11(yy: number, timeZone: number = 7): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

/**
 * Xác định tháng nhuận trong năm âm lịch bắt đầu từ a11
 */
export function getLeapMonthOffset(a11: number, timeZone: number = 7): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Chuyển đổi Dương lịch sang Âm lịch Việt Nam chuẩn UTC+7
 */
export function solarToLunar(dd: number, mm: number, yy: number, timeZone: number = 7): LunarDate {
  const jdn = jdFromDate(dd, mm, yy);
  const k = Math.floor((jdn - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > jdn) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let isFromPrevYear = false;
  if (a11 >= monthStart) {
    a11 = getLunarMonth11(yy - 1, timeZone);
    isFromPrevYear = true;
  } else {
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = jdn - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let isLeap = false;
  let lunarMonth = diff + 11;
  let lunarYear = yy;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeap = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (isFromPrevYear && lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  // Tính số ngày trong tháng âm lịch hiện tại (29 hay 30)
  const nextMonthStart = getNewMoonDay(k + (monthStart === getNewMoonDay(k, timeZone) ? 1 : 2), timeZone);
  const daysInMonth = nextMonthStart - monthStart;

  // Tính Can Chi
  const canChiDay = getCanChiDay(jdn);
  const canChiMonth = getCanChiMonth(lunarMonth, lunarYear);
  const canChiYear = getCanChiYear(lunarYear);
  const tietKhi = getTietKhi(jdn, timeZone);
  const gioHoangDao = getGioHoangDao(jdn);

  const pad = (n: number) => String(n).padStart(2, '0');
  const solarDate = `${yy}-${pad(mm)}-${pad(dd)}`;

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap,
    canChiDay,
    canChiMonth,
    canChiYear,
    tietKhi,
    gioHoangDao,
    daysInMonth,
    solarDate,
  };
}

/**
 * Chuyển đổi Âm lịch sang Dương lịch [solarDay, solarMonth, solarYear]
 */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeap: boolean = false,
  timeZone: number = 7
): [number, number, number] {
  let a11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
  }

  let off = lunarMonth - 11;
  if (off < 0) off += 12;

  let b11 = getLunarMonth11(lunarYear, timeZone);
  if (lunarMonth >= 11) {
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }

  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth <= 0) leapMonth += 12;

    if (isLeap && lunarMonth !== leapMonth) {
      // Nếu yêu cầu tháng nhuận nhưng tháng này không nhuận trong năm
      return [0, 0, 0];
    }
    if (isLeap || off >= leapOff) {
      off++;
    }
  }

  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  const monthStart = getNewMoonDay(k + off, timeZone);
  const jdn = monthStart + lunarDay - 1;
  return jdToDate(jdn);
}

/**
 * Lấy tháng nhuận của năm âm lịch (trả về số tháng nhuận 1-12, hoặc 0 nếu không có)
 */
export function getLeapMonth(lunarYear: number, timeZone: number = 7): number {
  const a11 = getLunarMonth11(lunarYear - 1, timeZone);
  const b11 = getLunarMonth11(lunarYear, timeZone);
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth <= 0) leapMonth += 12;
    return leapMonth;
  }
  return 0;
}

/**
 * Lấy số ngày trong một tháng âm lịch bất kỳ (29 hoặc 30)
 */
export function getDaysInLunarMonth(
  lunarMonth: number,
  lunarYear: number,
  isLeap: boolean = false,
  timeZone: number = 7
): number {
  const [sd1, sm1, sy1] = lunarToSolar(1, lunarMonth, lunarYear, isLeap, timeZone);
  if (sd1 === 0) return 0;
  const jd1 = jdFromDate(sd1, sm1, sy1);

  // Tìm ngày mùng 1 của tháng kế tiếp
  let nextMonth = lunarMonth + 1;
  let nextYear = lunarYear;
  let nextLeap = false;
  const leapMonth = getLeapMonth(lunarYear, timeZone);

  if (isLeap) {
    nextMonth = lunarMonth + 1;
    nextLeap = false;
  } else if (lunarMonth === leapMonth) {
    nextMonth = lunarMonth;
    nextLeap = true;
  }

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = lunarYear + 1;
  }

  const [sd2, sm2, sy2] = lunarToSolar(1, nextMonth, nextYear, nextLeap, timeZone);
  const jd2 = jdFromDate(sd2, sm2, sy2);
  return jd2 - jd1;
}

/**
 * Tính Can Chi Năm
 */
export function getCanChiYear(lunarYear: number): string {
  const can = CAN[(lunarYear + 6) % 10];
  const chi = CHI[(lunarYear + 8) % 12];
  return `${can} ${chi}`;
}

/**
 * Tính Can Chi Tháng
 */
export function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const canIndex = (lunarYear * 12 + lunarMonth + 3) % 10;
  const chiIndex = (lunarMonth + 1) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

/**
 * Tính Can Chi Ngày theo JDN
 */
export function getCanChiDay(jdn: number): string {
  const canIndex = (jdn + 9) % 10;
  const chiIndex = (jdn + 1) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

/**
 * Tính Tiết Khí theo JDN
 */
export function getTietKhi(jdn: number, timeZone: number = 7): string {
  const sunLong = getSunLongitude(jdn, timeZone);
  return TIET_KHI[sunLong] || '';
}

/**
 * Tính các khung giờ Hoàng Đạo trong ngày
 */
export function getGioHoangDao(jdn: number): string[] {
  const chiDayIndex = (jdn + 1) % 12; // 0: Tý, 1: Sửu, 2: Dần...
  // Bảng giờ hoàng đạo tương ứng theo Chi của Ngày
  const HOANG_DAO_MAP: { [key: number]: number[] } = {
    0: [0, 1, 3, 6, 8, 9],   // Tý, Ngọ: Tý, Sửu, Mão, Ngọ, Thân, Dậu
    6: [0, 1, 3, 6, 8, 9],
    1: [2, 3, 5, 8, 10, 11], // Sửu, Mùi: Dần, Mão, Tỵ, Thân, Tuất, Hợi
    7: [2, 3, 5, 8, 10, 11],
    2: [0, 1, 4, 6, 7, 10],  // Dần, Thân: Tý, Sửu, Thìn, Tỵ, Mùi, Tuất
    8: [0, 1, 4, 6, 7, 10],
    3: [2, 4, 5, 8, 9, 11],  // Mão, Dậu: Dần, Thìn, Tỵ, Thân, Dậu, Hợi
    9: [2, 4, 5, 8, 9, 11],
    4: [2, 3, 5, 6, 8, 11],  // Thìn, Tuất: Dần, Mão, Tỵ, Ngọ, Thân, Hợi
    10: [2, 3, 5, 6, 8, 11],
    5: [0, 2, 4, 7, 9, 10],  // Tỵ, Hợi: Tý, Dần, Thìn, Mùi, Dậu, Tuất
    11: [0, 2, 4, 7, 9, 10],
  };

  const indices = HOANG_DAO_MAP[chiDayIndex] || [0, 1, 3, 6, 8, 9];
  return indices.map((idx) => GIO_HOANG_DAO[idx]);
}
