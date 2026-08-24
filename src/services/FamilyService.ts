import { Family, FamilyMembership } from '../types/database';
import { mockFamily, mockMemberships } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class FamilyService {
  static async getActiveFamily(): Promise<Family> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('families').select('*').limit(1).single();
      if (!error && data) return data as Family;
    }
    return mockFamily;
  }

  static async getFamilyMemberships(familyId: string): Promise<FamilyMembership[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('family_memberships').select('*').eq('family_id', familyId);
      if (!error && data) return data as FamilyMembership[];
    }
    return mockMemberships;
  }

  static async createFamily(name: string, description: string, originProvince: string): Promise<Family> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('families').insert([{
        name,
        description,
        origin_province: originProvince,
      }]).select().single();
      if (!error && data) return data as Family;
    }
    return {
      ...mockFamily,
      id: `fam-${Date.now()}`,
      name,
      description,
      origin_province: originProvince,
    };
  }

  static async getDashboardData() {
    if (isSupabaseConfigured()) {
      const { data: family } = await supabase.from('families').select('*').limit(1).single();
      const { count: membersCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
      const { count: generationsCount } = await supabase.from('generations').select('*', { count: 'exact', head: true });
      const { count: branchesCount } = await supabase.from('branches').select('*', { count: 'exact', head: true });
      const { count: upcomingEventsCount } = await supabase.from('family_events').select('*', { count: 'exact', head: true });
      const { data: funds } = await supabase.from('funds').select('current_balance');
      const totalFundBalance = funds ? funds.reduce((acc, f) => acc + (f.current_balance || 0), 0) : 235500000;

      return {
        family: family || mockFamily,
        membersCount: membersCount ?? 86,
        generationsCount: generationsCount ?? 5,
        branchesCount: branchesCount ?? 3,
        upcomingEventsCount: upcomingEventsCount ?? 2,
        totalFundBalance,
      };
    }

    return {
      family: mockFamily,
      membersCount: 86,
      generationsCount: 5,
      branchesCount: 3,
      upcomingEventsCount: 2,
      totalFundBalance: 235500000,
    };
  }
}
