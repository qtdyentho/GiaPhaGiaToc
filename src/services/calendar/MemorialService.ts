import { MemorialDate } from '../../types/database';
import { mockMemorialDates, mockMembers, mockGenerations, mockBranches } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { LunarCalendarService } from './LunarCalendarService';
import { getDaysInLunarMonth, getLeapMonth } from '../../lib/lunar';

export class MemorialService {
  /**
   * Lấy danh sách ngày giỗ theo gia tộc kèm thông tin chi cành và thế hệ
   */
  static async getMemorials(familyId?: string): Promise<MemorialDate[]> {
    if (!familyId) return [];

    if (isSupabaseConfigured()) {
      // JOIN memorial_dates → members → generations + branches để lấy đầy đủ thông tin
      const { data, error } = await supabase
        .from('memorial_dates')
        .select(`
          *,
          members (
            id,
            full_name,
            burial_place,
            generation_id,
            branch_id,
            generations ( name, generation_number ),
            branches ( name )
          )
        `)
        .eq('family_id', familyId)
        .order('lunar_month', { ascending: true })
        .order('lunar_day', { ascending: true });

      if (!error && data) {
        return data.map((row: any) => {
          const next = LunarCalendarService.getNextSolarDateForMemorial(
            row.lunar_day,
            row.lunar_month,
            row.is_leap_month
          );
          const member = row.members;
          const gen = member?.generations;
          const branch = member?.branches;

          return {
            ...row,
            members: undefined, // loại bỏ nested object khỏi response
            next_solar_date: next.solarDate,
            generation_name: gen?.name || (member ? `Đời thứ ${gen?.generation_number || '?'}` : undefined),
            generation_number: gen?.generation_number || 1,
            branch_name: branch?.name || 'Chi Trưởng',
            burial_place: member?.burial_place,
          } as MemorialDate;
        });
      }
    }


    // Fallback Mock Store with dynamic next solar date calculation + Auto-sync from deceased genealogy members
    const deceasedMembers = mockMembers.filter(
      (m) => m.family_id === familyId && m.life_status === 'DECEASED' && m.death_lunar_day && m.death_lunar_month
    );

    const merged = [...mockMemorialDates.filter((m) => m.family_id === familyId)];

    for (const d of deceasedMembers) {
      if (!merged.some((m) => m.member_id === d.id)) {
        merged.push({
          id: `auto-mem-${d.id}`,
          family_id: d.family_id,
          member_id: d.id,
          title: `Lễ Giỗ: ${d.full_name.replace(/\(.*?\)/g, '').trim()}`,
          lunar_day: d.death_lunar_day!,
          lunar_month: d.death_lunar_month!,
          is_leap_month: false,
          notes: `Tự động đồng bộ từ Cây Phả Hệ (${d.burial_place || 'Khu lăng mộ Tổ'})`,
          created_at: d.created_at,
        });
      }
    }

    return merged.map((mem) => {
      const next = LunarCalendarService.getNextSolarDateForMemorial(
        mem.lunar_day,
        mem.lunar_month,
        mem.is_leap_month
      );
      const member = mockMembers.find((m) => m.id === mem.member_id);
      const generation = mockGenerations.find((g) => g.id === member?.generation_id);
      const branch = mockBranches.find((b) => b.id === member?.branch_id);

      return {
        ...mem,
        next_solar_date: next.solarDate,
        generation_name: generation?.name || (member ? 'Đời thứ ' + (member.generation_id || 1) : undefined),
        generation_number: generation?.generation_number || 1,
        branch_name: branch?.name || 'Chi Trưởng',
        burial_place: member?.burial_place,
      };
    });
  }

  /**
   * Lấy danh sách các ngày giỗ sắp tới (sắp xếp theo số ngày còn lại)
   */
  static async getUpcomingMemorials(
    familyId?: string,
    limit: number = 5
  ): Promise<
    Array<
      MemorialDate & {
        solarDate: string;
        daysRemaining: number;
        isSpecial30Fallback: boolean;
        memberName?: string;
      }
    >
  > {
    if (!familyId) return [];
    const memorials = await this.getMemorials(familyId);
    const calculated = memorials.map((mem) => {
      const next = LunarCalendarService.getNextSolarDateForMemorial(
        mem.lunar_day,
        mem.lunar_month,
        mem.is_leap_month
      );
      const member = mockMembers.find((m) => m.id === mem.member_id);
      return {
        ...mem,
        solarDate: next.solarDate,
        daysRemaining: next.daysRemaining,
        isSpecial30Fallback: next.isSpecial30Fallback,
        memberName: member?.full_name,
      };
    });

    // Sắp xếp theo ngày gần nhất (daysRemaining >= 0)
    return calculated
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, limit);
  }

  /**
   * Tạo ngày giỗ mới
   */
  static async createMemorial(data: {
    family_id: string;
    member_id: string;
    title: string;
    lunar_day: number;
    lunar_month: number;
    is_leap_month?: boolean;
    notes?: string;
  }): Promise<{ success: boolean; memorial?: MemorialDate; error?: string }> {
    try {
      // 1. Validation
      if (!data.family_id || !data.member_id || !data.title) {
        return { success: false, error: 'Thiếu thông tin bắt buộc của ngày giỗ' };
      }
      if (data.lunar_day < 1 || data.lunar_day > 30) {
        return { success: false, error: 'Ngày Âm lịch phải từ 1 đến 30' };
      }
      if (data.lunar_month < 1 || data.lunar_month > 12) {
        return { success: false, error: 'Tháng Âm lịch phải từ 1 đến 12' };
      }

      const next = LunarCalendarService.getNextSolarDateForMemorial(
        data.lunar_day,
        data.lunar_month,
        Boolean(data.is_leap_month)
      );

      const newRecord: MemorialDate = {
        id: `mem-${Date.now()}`,
        family_id: data.family_id,
        member_id: data.member_id,
        title: data.title,
        lunar_day: data.lunar_day,
        lunar_month: data.lunar_month,
        is_leap_month: Boolean(data.is_leap_month),
        notes: data.notes || '',
        next_solar_date: next.solarDate,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { data: dbData, error } = await supabase
          .from('memorial_dates')
          .insert({
            family_id: data.family_id,
            member_id: data.member_id,
            title: data.title,
            lunar_day: data.lunar_day,
            lunar_month: data.lunar_month,
            is_leap_month: Boolean(data.is_leap_month),
            notes: data.notes,
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase memorial insert fallback:', error.message);
        } else if (dbData) {
          return { success: true, memorial: { ...dbData, next_solar_date: next.solarDate } };
        }
      }

      mockMemorialDates.push(newRecord);
      return { success: true, memorial: newRecord };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi khi tạo ngày giỗ' };
    }
  }

  /**
   * Cập nhật ngày giỗ
   */
  static async updateMemorial(
    id: string,
    familyId: string,
    data: Partial<MemorialDate>
  ): Promise<{ success: boolean; memorial?: MemorialDate; error?: string }> {
    const next = data.lunar_day && data.lunar_month
      ? LunarCalendarService.getNextSolarDateForMemorial(
          data.lunar_day,
          data.lunar_month,
          Boolean(data.is_leap_month)
        )
      : null;

    if (isSupabaseConfigured()) {
      const { data: dbData, error } = await supabase
        .from('memorial_dates')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('family_id', familyId)
        .select()
        .single();

      if (!error && dbData) {
        return {
          success: true,
          memorial: { ...dbData, next_solar_date: next?.solarDate },
        };
      }
    }

    const idx = mockMemorialDates.findIndex((m) => m.id === id && m.family_id === familyId);
    if (idx !== -1) {
      mockMemorialDates[idx] = {
        ...mockMemorialDates[idx],
        ...data,
        next_solar_date: next?.solarDate || mockMemorialDates[idx].next_solar_date,
      };
      return { success: true, memorial: mockMemorialDates[idx] };
    }

    return { success: false, error: 'Không tìm thấy ngày giỗ' };
  }

  /**
   * Xóa ngày giỗ
   */
  static async deleteMemorial(id: string, familyId: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('memorial_dates')
        .delete()
        .eq('id', id)
        .eq('family_id', familyId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    const idx = mockMemorialDates.findIndex((m) => m.id === id && m.family_id === familyId);
    if (idx !== -1) {
      mockMemorialDates.splice(idx, 1);
      return { success: true };
    }

    return { success: false, error: 'Không tìm thấy ngày giỗ để xóa' };
  }

  /**
   * Kiểm tra xem một ngày giỗ có rơi vào ngày 30 Âm của tháng thiếu (29 ngày) không
   */
  static checkSpecial30thLunarDay(lunarDay: number, lunarMonth: number, targetSolarYear: number) {
    if (lunarDay !== 30) return { isSpecial: false };
    const daysInMonth = getDaysInLunarMonth(lunarMonth, targetSolarYear);
    if (daysInMonth === 29) {
      return {
        isSpecial: true,
        message: `Năm ${targetSolarYear} tháng ${lunarMonth} Âm lịch chỉ có 29 ngày. Lễ cúng sẽ được tiến hành vào ngày 29.`,
        fallbackDay: 29,
      };
    }
    return { isSpecial: false };
  }
}
