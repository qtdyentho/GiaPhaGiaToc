import {
  solarToLunar,
  lunarToSolar,
  getCanChiYear,
  getCanChiDay,
  getCanChiMonth,
  getDaysInLunarMonth,
  getLeapMonth,
  getTietKhi,
  getGioHoangDao,
  LunarDate,
} from '../../lib/lunar';
import { MemorialDate, Event } from '../../types/database';
import { mockMemorialDates, mockEvents } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface CalendarDayInfo {
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  solarDate: string; // YYYY-MM-DD
  dayOfWeek: number; // 0: CN, 1: T2, ... 6: T7
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeap: boolean;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  tietKhi: string;
  gioHoangDao: string[];
  daysInLunarMonth: number;
  isToday: boolean;
  memorials: MemorialDate[];
  events: Event[];
}

export class LunarCalendarService {
  /**
   * Lấy thông tin ngày hôm nay (Solar + Lunar + Can Chi + Tiết khí + Giờ Hoàng Đạo)
   */
  static getTodayInfo(): CalendarDayInfo {
    const today = new Date();
    const sd = today.getDate();
    const sm = today.getMonth() + 1;
    const sy = today.getFullYear();
    const lunar = solarToLunar(sd, sm, sy);

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      solarDay: sd,
      solarMonth: sm,
      solarYear: sy,
      solarDate: `${sy}-${pad(sm)}-${pad(sd)}`,
      dayOfWeek: today.getDay(),
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      lunarYear: lunar.year,
      isLeap: lunar.isLeap,
      canChiDay: lunar.canChiDay,
      canChiMonth: lunar.canChiMonth,
      canChiYear: lunar.canChiYear,
      tietKhi: lunar.tietKhi,
      gioHoangDao: lunar.gioHoangDao,
      daysInLunarMonth: lunar.daysInMonth,
      isToday: true,
      memorials: [],
      events: [],
    };
  }

  /**
   * Tính ngày Dương lịch tiếp theo cho một ngày Giỗ Âm lịch
   * Xử lý chính xác:
   * - Giỗ bình thường (lặp hàng năm)
   * - Giỗ trong tháng nhuận (BR-MEMORIAL-003)
   * - Giỗ ngày 30 Âm lịch vào tháng thiếu 29 ngày (BR-MEMORIAL-004)
   */
  static getNextSolarDateForMemorial(
    lunarDay: number,
    lunarMonth: number,
    isLeapMonth: boolean = false,
    referenceYear?: number
  ): {
    solarDate: string;
    solarDay: number;
    solarMonth: number;
    solarYear: number;
    isSpecial30Fallback: boolean;
    actualLunarDayUsed: number;
    isLeapOccurred: boolean;
    daysRemaining: number;
  } {
    const now = new Date();
    const currentSolarYear = referenceYear || now.getFullYear();

    // Thử tính ngày giỗ cho năm hiện tại
    let targetSolarYear = currentSolarYear;
    let res = this.calculateMemorialSolarDate(lunarDay, lunarMonth, isLeapMonth, targetSolarYear);

    // Nếu ngày giỗ năm nay đã qua (trước hôm nay > 0 ngày), tính cho năm tiếp theo
    const todayJd = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetDateObj = new Date(res.solarYear, res.solarMonth - 1, res.solarDay).getTime();

    if (targetDateObj < todayJd && !referenceYear) {
      targetSolarYear = currentSolarYear + 1;
      res = this.calculateMemorialSolarDate(lunarDay, lunarMonth, isLeapMonth, targetSolarYear);
    }

    const finalDateObj = new Date(res.solarYear, res.solarMonth - 1, res.solarDay);
    const diffTime = finalDateObj.getTime() - todayJd;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      solarDate: `${res.solarYear}-${pad(res.solarMonth)}-${pad(res.solarDay)}`,
      solarDay: res.solarDay,
      solarMonth: res.solarMonth,
      solarYear: res.solarYear,
      isSpecial30Fallback: res.isSpecial30Fallback,
      actualLunarDayUsed: res.actualLunarDayUsed,
      isLeapOccurred: res.isLeapOccurred,
      daysRemaining,
    };
  }

  private static calculateMemorialSolarDate(
    lunarDay: number,
    lunarMonth: number,
    isLeapMonth: boolean,
    targetSolarYear: number
  ) {
    // 1. Kiểm tra năm targetSolarYear có tháng nhuận lunarMonth không
    const leapInYear = getLeapMonth(targetSolarYear);
    let useLeap = isLeapMonth;
    let isLeapOccurred = isLeapMonth && leapInYear === lunarMonth;

    if (isLeapMonth && leapInYear !== lunarMonth) {
      // Nếu ngày giỗ ghi nhận vào tháng nhuận, nhưng năm nay không có tháng đó nhuận -> cúng vào tháng chính
      useLeap = false;
      isLeapOccurred = false;
    }

    // 2. Kiểm tra số ngày trong tháng âm lịch (BR-MEMORIAL-004: ngày 30 tháng thiếu)
    let actualLunarDayUsed = lunarDay;
    let isSpecial30Fallback = false;
    const daysInMonth = getDaysInLunarMonth(lunarMonth, targetSolarYear, useLeap);

    if (lunarDay === 30 && daysInMonth === 29) {
      actualLunarDayUsed = 29;
      isSpecial30Fallback = true;
    }

    const [sd, sm, sy] = lunarToSolar(actualLunarDayUsed, lunarMonth, targetSolarYear, useLeap);
    return {
      solarDay: sd,
      solarMonth: sm,
      solarYear: sy,
      isSpecial30Fallback,
      actualLunarDayUsed,
      isLeapOccurred,
    };
  }

  /**
   * Sinh ma trận dữ liệu hiển thị lịch cả tháng (35 - 42 ngày)
   */
  static getMonthCalendar(
    solarYear: number,
    solarMonth: number,
    memorials: MemorialDate[] = [],
    events: Event[] = []
  ): CalendarDayInfo[] {
    const firstDayOfMonth = new Date(solarYear, solarMonth - 1, 1);
    const lastDayOfMonth = new Date(solarYear, solarMonth, 0);
    const daysInCurrentMonth = lastDayOfMonth.getDate();

    // 0: Chủ Nhật, 1: Thứ Hai...
    // Chuẩn Việt Nam: Tuần bắt đầu từ Thứ Hai (index 1) đến Chủ Nhật (index 0)
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0-6
    let leadingDays = (startDayOfWeek + 6) % 7; // Số ngày của tháng trước hiển thị bù đầu tuần

    const calendarDays: CalendarDayInfo[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // 1. Ngày của tháng trước (Leading days)
    const prevMonthLastDay = new Date(solarYear, solarMonth - 1, 0).getDate();
    for (let i = leadingDays - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = solarMonth === 1 ? 12 : solarMonth - 1;
      const prevYear = solarMonth === 1 ? solarYear - 1 : solarYear;
      calendarDays.push(this.createDayInfo(day, prevMonth, prevYear, todayDateStr, memorials, events));
    }

    // 2. Các ngày trong tháng hiện tại
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      calendarDays.push(this.createDayInfo(d, solarMonth, solarYear, todayDateStr, memorials, events));
    }

    // 3. Ngày của tháng tiếp theo để lấp đầy ma trận (Trailing days tới 35 hoặc 42 ô)
    const totalSlots = calendarDays.length > 35 ? 42 : 35;
    const trailingDays = totalSlots - calendarDays.length;
    for (let d = 1; d <= trailingDays; d++) {
      const nextMonth = solarMonth === 12 ? 1 : solarMonth + 1;
      const nextYear = solarMonth === 12 ? solarYear + 1 : solarYear;
      calendarDays.push(this.createDayInfo(d, nextMonth, nextYear, todayDateStr, memorials, events));
    }

    return calendarDays;
  }

  private static createDayInfo(
    sd: number,
    sm: number,
    sy: number,
    todayDateStr: string,
    memorials: MemorialDate[],
    events: Event[]
  ): CalendarDayInfo {
    const lunar = solarToLunar(sd, sm, sy);
    const pad = (n: number) => String(n).padStart(2, '0');
    const solarDate = `${sy}-${pad(sm)}-${pad(sd)}`;
    const isToday = solarDate === todayDateStr;

    // Gắn memorials trùng ngày âm
    const matchedMemorials = memorials.filter((m) => {
      if (m.lunar_month !== lunar.month) return false;
      if (m.lunar_day === lunar.day) return true;
      // Xử lý giỗ 30 âm vào tháng thiếu 29 ngày
      if (m.lunar_day === 30 && lunar.day === 29 && lunar.daysInMonth === 29) return true;
      return false;
    });

    // Gắn events trùng ngày dương
    const matchedEvents = events.filter((e) => {
      if (e.solar_date === solarDate) return true;
      if (e.lunar_day === lunar.day && e.lunar_month === lunar.month) return true;
      return false;
    });

    const dateObj = new Date(sy, sm - 1, sd);

    return {
      solarDay: sd,
      solarMonth: sm,
      solarYear: sy,
      solarDate,
      dayOfWeek: dateObj.getDay(),
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      lunarYear: lunar.year,
      isLeap: lunar.isLeap,
      canChiDay: lunar.canChiDay,
      canChiMonth: lunar.canChiMonth,
      canChiYear: lunar.canChiYear,
      tietKhi: lunar.tietKhi,
      gioHoangDao: lunar.gioHoangDao,
      daysInLunarMonth: lunar.daysInMonth,
      isToday,
      memorials: matchedMemorials,
      events: matchedEvents,
    };
  }
}
