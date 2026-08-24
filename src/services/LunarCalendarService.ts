import { solarToLunar, getCanChiYear } from '../lib/lunar';
import { MemorialDate, Event } from '../types/database';
import { mockMemorialDates, mockEvents } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class LunarCalendarService {
  static getTodayInfo() {
    const today = new Date();
    const lunar = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    return {
      solarDate: today.toISOString().split('T')[0],
      solarDay: today.getDate(),
      solarMonth: today.getMonth() + 1,
      solarYear: today.getFullYear(),
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      lunarYear: lunar.year,
      canChiYear: getCanChiYear(lunar.year),
      isLeap: lunar.isLeap,
    };
  }

  static async getMemorials(familyId?: string): Promise<MemorialDate[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('memorial_dates').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as MemorialDate[];
    }
    return mockMemorialDates;
  }

  static async getUpcomingEvents(familyId?: string): Promise<Event[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('family_events').select('*').order('solar_date', { ascending: true });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Event[];
    }
    return mockEvents;
  }
}
