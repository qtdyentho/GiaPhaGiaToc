import {
  CAN,
  CHI,
  TIET_KHI,
  GIO_HOANG_DAO,
  getCanChiYear,
  getCanChiMonth,
  getCanChiDay,
  getTietKhi,
  getGioHoangDao,
} from '../../lib/lunar';

export class CanChiService {
  static getCanList() {
    return CAN;
  }

  static getChiList() {
    return CHI;
  }

  static get24TietKhi() {
    return TIET_KHI;
  }

  static getHoangDaoHours(jdn: number) {
    return getGioHoangDao(jdn);
  }

  static getCanChiFull(jdn: number, lunarMonth: number, lunarYear: number) {
    return {
      day: getCanChiDay(jdn),
      month: getCanChiMonth(lunarMonth, lunarYear),
      year: getCanChiYear(lunarYear),
      tietKhi: getTietKhi(jdn),
      gioHoangDao: getGioHoangDao(jdn),
    };
  }
}
