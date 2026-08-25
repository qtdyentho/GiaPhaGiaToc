import { Family, FamilyMembership } from '../types/database';
import { mockFamily, mockMemberships } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class FamilyService {
  static async getActiveFamily(familyId?: string): Promise<Family | null> {
    if (!familyId) return null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('families').select('*').eq('id', familyId).single();
      if (!error && data) return data as Family;
    }
    return mockFamily.id === familyId ? mockFamily : null;
  }

  static async getFamilyMemberships(familyId?: string): Promise<FamilyMembership[]> {
    if (!familyId) return [];
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('family_memberships').select('*').eq('family_id', familyId);
      if (!error && data) return data as FamilyMembership[];
    }
    return mockMemberships.filter((m) => m.family_id === familyId);
  }

  static async createFamily(name: string, description: string, originProvince: string, userId?: string): Promise<Family> {
    const newId = `fam-${Date.now()}`;
    const payload = {
      name,
      description,
      origin_province: originProvince,
      created_by: userId,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('families').insert([payload]).select().single();
      if (!error && data) return data as Family;
    }

    return {
      ...mockFamily,
      id: newId,
      name,
      code: name.toUpperCase().replace(/\s+/g, '-').slice(0, 10),
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      origin_province: originProvince,
      created_by: userId || 'usr-local',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static async getDashboardData(familyId?: string) {
    if (!familyId) {
      return {
        family: null,
        membersCount: 0,
        generationsCount: 0,
        branchesCount: 0,
        upcomingEventsCount: 0,
        totalFundBalance: 0,
      };
    }

    if (isSupabaseConfigured()) {
      const [
        { data: family },
        { count: membersCount },
        { count: generationsCount },
        { count: branchesCount },
        { count: upcomingEventsCount },
        { data: funds }
      ] = await Promise.all([
        supabase.from('families').select('*').eq('id', familyId).single(),
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
        supabase.from('generations').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
        supabase.from('branches').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
        supabase.from('funds').select('current_balance').eq('family_id', familyId),
      ]);

      const totalFundBalance = funds ? funds.reduce((acc, f) => acc + (f.current_balance || 0), 0) : 0;

      return {
        family: (family as Family) || (mockFamily.id === familyId ? mockFamily : null),
        membersCount: membersCount ?? (mockFamily.id === familyId ? 86 : 0),
        generationsCount: generationsCount ?? (mockFamily.id === familyId ? 5 : 0),
        branchesCount: branchesCount ?? (mockFamily.id === familyId ? 3 : 0),
        upcomingEventsCount: upcomingEventsCount ?? (mockFamily.id === familyId ? 2 : 0),
        totalFundBalance,
      };
    }

    const isCurrentMock = mockFamily.id === familyId;
    return {
      family: isCurrentMock ? mockFamily : null,
      membersCount: isCurrentMock ? 86 : 0,
      generationsCount: isCurrentMock ? 5 : 0,
      branchesCount: isCurrentMock ? 3 : 0,
      upcomingEventsCount: isCurrentMock ? 2 : 0,
      totalFundBalance: isCurrentMock ? 235500000 : 0,
    };
  }
}
