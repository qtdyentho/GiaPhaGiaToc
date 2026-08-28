import { MemorialDate, Event } from '../../types/database';
import { lunarToSolar } from '../../lib/lunar';

export class CalendarExportService {
  /**
   * Sinh nội dung tệp iCalendar (.ics) cho toàn bộ ngày giỗ và sự kiện dòng họ
   */
  static generateICS(
    familyName: string,
    memorials: MemorialDate[],
    events: Event[],
    targetYear: number = new Date().getFullYear()
  ): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GiaPhaGiaToc//Nen Tang Quan Tri Gia Pha//VI',
      `X-WR-CALNAME:Lịch Giỗ & Lễ Nghi • ${familyName}`,
      'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    // 1. Xuất các ngày giỗ tổ tiên (Tính dương lịch tương ứng cho targetYear và targetYear + 1)
    const years = [targetYear, targetYear + 1];
    memorials.forEach((mem) => {
      const deceasedName = mem.notes?.replace('Giỗ', '').trim() || 'Tiên Tổ';

      years.forEach((yr) => {
        try {
          const [sDay, sMonth, sYear] = lunarToSolar(
            mem.lunar_day,
            mem.lunar_month,
            yr,
            mem.is_leap_month || false,
            7
          );

          if (sDay > 0 && sMonth > 0 && sYear > 0) {
            const dateStr = `${sYear}${String(sMonth).padStart(2, '0')}${String(sDay).padStart(2, '0')}`;
            const uid = `memorial-${mem.id}-${yr}@giaphaviet.vercel.app`;

            lines.push(
              'BEGIN:VEVENT',
              `UID:${uid}`,
              `DTSTAMP:${dateStr}T000000Z`,
              `DTSTART;VALUE=DATE:${dateStr}`,
              `SUMMARY:🕯️ Giỗ ${deceasedName} (${mem.lunar_day}/${mem.lunar_month} ÂL)`,
              `DESCRIPTION:Ngày giỗ tổ tiên ${deceasedName} thuộc dòng họ ${familyName}. Ngày Âm Lịch: ${mem.lunar_day}/${mem.lunar_month} ÂL. Kính cẩn dâng hương tưởng nhớ công đức tiên tổ.`,
              'STATUS:CONFIRMED',
              'TRANSP:TRANSPARENT',
              'END:VEVENT'
            );
          }
        } catch (e) {
          console.warn('Lỗi tính ngày giỗ ics:', e);
        }
      });
    });

    // 2. Xuất các sự kiện dòng họ (Lễ hội, Họp họ, Khánh thành)
    events.forEach((evt) => {
      if (!evt.solar_date) return;
      const cleanDate = evt.solar_date.replace(/-/g, '');
      const uid = `event-${evt.id}@giaphaviet.vercel.app`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${cleanDate}T000000Z`,
        `DTSTART;VALUE=DATE:${cleanDate}`,
        `SUMMARY:🏛️ ${evt.title}`,
        `DESCRIPTION:${evt.description || 'Sự kiện dòng họ'} - Dòng họ: ${familyName}.`,
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Tải tệp .ics về máy người dùng
   */
  static downloadICSFile(
    familyName: string,
    memorials: MemorialDate[],
    events: Event[],
    targetYear?: number
  ): void {
    const icsContent = this.generateICS(familyName, memorials, events, targetYear);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedFamily = familyName.replace(/\s+/g, '_').toLowerCase();
    link.download = `lich_gio_to_${sanitizedFamily}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
