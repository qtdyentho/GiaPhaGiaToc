import { Event, FinancialTransaction } from '../../types/database';
import { mockEvents, mockTransactions } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { solarToLunar, lunarToSolar } from '../../lib/lunar';

export interface EventBudgetSummary {
  eventId: string;
  title: string;
  estimatedBudget: number;
  spentAmount: number;
  remainingBudget: number;
  fundId?: string;
  transactions: FinancialTransaction[];
}

export class EventService {
  /**
   * Lấy danh sách sự kiện họ tộc có hỗ trợ bộ lọc
   */
  static async getEvents(
    familyId?: string,
    filters?: {
      branchId?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ): Promise<Event[]> {
    if (!familyId) return [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .eq('family_id', familyId)
          .order('solar_date', { ascending: true });

        if (filters?.eventType && filters.eventType !== 'ALL') {
          query = query.eq('event_type', filters.eventType);
        }
        if (filters?.branchId && filters.branchId !== 'ALL') {
          query = query.eq('branch_id', filters.branchId);
        }

        const { data, error } = await query;
        if (!error && data) {
          let list = data as Event[];
          if (filters?.search) {
            const s = filters.search.toLowerCase();
            list = list.filter((e) => e.title.toLowerCase().includes(s) || e.location?.toLowerCase().includes(s));
          }
          return list;
        }
        if (error) {
          console.error('Lỗi khi truy vấn events:', error);
        }
        return [];
      } catch (err) {
        console.error('EventService getEvents error:', err);
        return [];
      }
    }

    // Mock Fallback
    let list = mockEvents.filter((e) => e.family_id === familyId);
    if (filters?.eventType && filters.eventType !== 'ALL') {
      list = list.filter((e) => e.event_type === filters.eventType);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(s) || e.location?.toLowerCase().includes(s));
    }
    return list;
  }

  /**
   * Lấy chi tiết sự kiện theo ID
   */
  static async getEventById(id: string, familyId?: string): Promise<Event | null> {
    if (!familyId) return null;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .eq('family_id', familyId)
          .single();
        if (!error && data) return data as Event;
        return null;
      } catch (err) {
        return null;
      }
    }

    const evt = mockEvents.find((e) => e.id === id && e.family_id === familyId);
    return evt || null;
  }

  /**
   * Tạo sự kiện mới (tự động đồng bộ Ngày Âm / Ngày Dương)
   */
  static async createEvent(data: {
    family_id: string;
    title: string;
    description?: string;
    event_type: any;
    scope?: any;
    solar_date?: string;
    lunar_day?: number;
    lunar_month?: number;
    lunar_year?: number;
    is_leap_month?: boolean;
    location?: string;
    estimated_budget?: number;
    branch_id?: string;
    generation_id?: string;
    member_id?: string;
    fund_id?: string;
  }): Promise<{ success: boolean; event?: Event; error?: string }> {
    try {
      if (!data.family_id || !data.title) {
        return { success: false, error: 'Thiếu thông tin tiêu đề sự kiện' };
      }

      let solarDate = data.solar_date;
      let lunarDay = data.lunar_day;
      let lunarMonth = data.lunar_month;
      let lunarYear = data.lunar_year;
      let isLeap = Boolean(data.is_leap_month);

      // Nếu nhập ngày Âm mà chưa có ngày Dương -> Quy đổi sang Dương
      if (!solarDate && lunarDay && lunarMonth && lunarYear) {
        const [sd, sm, sy] = lunarToSolar(lunarDay, lunarMonth, lunarYear, isLeap);
        const pad = (n: number) => String(n).padStart(2, '0');
        solarDate = `${sy}-${pad(sm)}-${pad(sd)}`;
      } else if (solarDate && (!lunarDay || !lunarMonth)) {
        // Nếu nhập ngày Dương mà chưa có ngày Âm -> Quy đổi sang Âm
        const parts = solarDate.split('-').map(Number);
        if (parts.length === 3) {
          const lunar = solarToLunar(parts[2], parts[1], parts[0]);
          lunarDay = lunar.day;
          lunarMonth = lunar.month;
          lunarYear = lunar.year;
          isLeap = lunar.isLeap;
        }
      }

      const newRecord: Event = {
        id: `evt-${Date.now()}`,
        family_id: data.family_id,
        title: data.title,
        description: data.description || '',
        event_type: data.event_type || 'OTHER',
        scope: data.scope || 'FAMILY',
        solar_date: solarDate || new Date().toISOString().split('T')[0],
        solar_time: '08:00',
        lunar_day: lunarDay,
        lunar_month: lunarMonth,
        lunar_year: lunarYear,
        is_leap_month: isLeap,
        location: data.location || '',
        estimated_budget: data.estimated_budget || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { data: dbData, error } = await supabase
          .from('events')
          .insert({
            family_id: data.family_id,
            title: data.title,
            description: data.description,
            event_type: data.event_type,
            scope: data.scope,
            solar_date: newRecord.solar_date,
            lunar_day: newRecord.lunar_day,
            lunar_month: newRecord.lunar_month,
            lunar_year: newRecord.lunar_year,
            is_leap_month: newRecord.is_leap_month,
            location: data.location,
            estimated_budget: data.estimated_budget,
            branch_id: data.branch_id,
            generation_id: data.generation_id,
            member_id: data.member_id,
          })
          .select()
          .single();

        if (!error && dbData) {
          return { success: true, event: dbData as Event };
        }
      }

      mockEvents.push(newRecord);
      return { success: true, event: newRecord };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi khi tạo sự kiện' };
    }
  }

  /**
   * Cập nhật sự kiện
   */
  static async updateEvent(
    id: string,
    familyId: string,
    data: Partial<Event>
  ): Promise<{ success: boolean; event?: Event; error?: string }> {
    if (isSupabaseConfigured()) {
      const { data: dbData, error } = await supabase
        .from('events')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('family_id', familyId)
        .select()
        .single();

      if (!error && dbData) {
        return { success: true, event: dbData as Event };
      }
    }

    const idx = mockEvents.findIndex((e) => e.id === id && e.family_id === familyId);
    if (idx !== -1) {
      mockEvents[idx] = {
        ...mockEvents[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { success: true, event: mockEvents[idx] };
    }

    return { success: false, error: 'Không tìm thấy sự kiện' };
  }

  /**
   * Xóa sự kiện
   */
  static async deleteEvent(id: string, familyId: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('family_id', familyId);

      if (error) return { success: false, error: error.message };
    }

    const idx = mockEvents.findIndex((e) => e.id === id && e.family_id === familyId);
    if (idx !== -1) {
      mockEvents.splice(idx, 1);
      return { success: true };
    }

    return { success: false, error: 'Không tìm thấy sự kiện' };
  }

  /**
   * Lấy danh sách sự kiện sắp diễn ra
   */
  static async getUpcomingEvents(familyId?: string, limit: number = 5): Promise<Event[]> {
    if (!familyId) return [];
    const list = await this.getEvents(familyId);
    const today = new Date().toISOString().split('T')[0];
    return list
      .filter((e) => e.solar_date >= today)
      .sort((a, b) => a.solar_date.localeCompare(b.solar_date))
      .slice(0, limit);
  }

  /**
   * Tính toán ngân sách sự kiện từ Sổ Cái Bất Biến (BR-EVENT-004)
   * Đọc các khoản EXPENSE trạng thái POSTED liên kết với eventId
   */
  static async getEventBudgetSummary(eventId: string, familyId?: string): Promise<EventBudgetSummary> {
    if (!familyId) {
      return {
        eventId,
        title: 'Sự kiện',
        estimatedBudget: 0,
        spentAmount: 0,
        remainingBudget: 0,
        transactions: [],
      };
    }
    const event = await this.getEventById(eventId, familyId);
    const estimatedBudget = event?.estimated_budget || 0;

    let eventTx: FinancialTransaction[] = [];
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('family_id', familyId)
        .eq('event_id', eventId)
        .eq('status', 'POSTED');

      if (data) eventTx = data as FinancialTransaction[];
    } else {
      eventTx = mockTransactions.filter(
        (t) => t.family_id === familyId && t.event_id === eventId && t.status === 'POSTED'
      );
    }

    const spentAmount = eventTx
      .filter((t) => t.transaction_type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const remainingBudget = estimatedBudget - spentAmount;

    return {
      eventId,
      title: event?.title || 'Sự kiện',
      estimatedBudget,
      spentAmount,
      remainingBudget,
      transactions: eventTx,
    };
  }
}
