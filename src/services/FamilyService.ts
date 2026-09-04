import { Family, FamilyMembership } from '../types/database';
import { mockFamily, mockMemberships } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const isUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export class FamilyService {
  static async getActiveFamily(familyId?: string): Promise<Family | null> {
    if (!familyId) return null;
    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase.from('families').select('*').eq('id', familyId).single();
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw new Error(`Supabase getActiveFamily error: ${error.message}`);
        }
        if (data) return data as Family;
        return null;
      } catch (err: any) {
        console.error('getActiveFamily Supabase error:', err);
        throw err;
      }
    }
    if (isSupabaseConfigured() && !familyId.startsWith('fam-') && !familyId.startsWith('clan-')) {
      throw new Error(`Mã dòng họ (familyId: "${familyId}") không đúng định dạng UUID.`);
    }
    return mockFamily.id === familyId ? mockFamily : null;
  }

  static async getFamilyMemberships(familyId?: string): Promise<FamilyMembership[]> {
    if (!familyId) return [];
    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase.from('family_memberships').select('*').eq('family_id', familyId);
        if (error) {
          throw new Error(`Supabase getFamilyMemberships error: ${error.message}`);
        }
        return (data || []) as FamilyMembership[];
      } catch (err: any) {
        console.error('getFamilyMemberships Supabase error:', err);
        throw err;
      }
    }
    if (isSupabaseConfigured() && !familyId.startsWith('fam-')) {
      throw new Error(`Mã dòng họ (familyId: "${familyId}") không đúng định dạng UUID.`);
    }
    return mockMemberships.filter((m) => m.family_id === familyId);
  }

  static async createFamily(name: string, description: string, originProvince: string, userId?: string): Promise<Family> {
    const cleanedName = name.replace(/^(Gia tộc|Dòng họ|Họ)\s+/i, '').trim();
    const surname = cleanedName.split(/\s+/)[0] || name.trim().split(/\s+/)[0] || 'Họ';

    const payload = {
      name: name.trim(),
      surname,
      description: description?.trim() || null,
      origin: originProvince?.trim() || null,
      ancestral_home: originProvince?.trim() || null,
      created_by: userId && isUUID(userId) ? userId : null,
    };

    if (isSupabaseConfigured()) {
      if (userId && !isUUID(userId) && !userId.startsWith('usr-')) {
        throw new Error(`Mã người dùng (userId: "${userId}") không đúng định dạng UUID.`);
      }
      try {
        const { data, error } = await supabase.from('families').insert([payload]).select().single();
        if (error) {
          console.error('createFamily Supabase error:', error);
          throw new Error(error.message || 'Không thể tạo gia tộc trên cơ sở dữ liệu');
        }
        if (data) return data as Family;
        throw new Error('Không nhận được dữ liệu phản hồi từ máy chủ cơ sở dữ liệu');
      } catch (err: any) {
        console.error('createFamily Supabase error:', err);
        throw err;
      }
    }

    const newId = `fam-${Date.now()}`;
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

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const [
          { data: family, error: famErr },
          { count: membersCount, error: memErr },
          { count: generationsCount, error: genErr },
          { count: branchesCount, error: braErr },
          { count: upcomingEventsCount, error: eveErr },
          { data: funds, error: fndErr }
        ] = await Promise.all([
          supabase.from('families').select('*').eq('id', familyId).single(),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('generations').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('branches').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('funds').select('current_balance').eq('family_id', familyId),
        ]);

        if (famErr && famErr.code !== 'PGRST116') {
          throw new Error(`Supabase getDashboardData family error: ${famErr.message}`);
        }
        if (memErr) throw new Error(`Supabase getDashboardData members error: ${memErr.message}`);
        if (genErr) throw new Error(`Supabase getDashboardData generations error: ${genErr.message}`);
        if (braErr) throw new Error(`Supabase getDashboardData branches error: ${braErr.message}`);
        if (eveErr) throw new Error(`Supabase getDashboardData events error: ${eveErr.message}`);
        if (fndErr) throw new Error(`Supabase getDashboardData funds error: ${fndErr.message}`);

        const totalFundBalance = funds ? funds.reduce((acc, f) => acc + (f.current_balance || 0), 0) : 0;

        return {
          family: (family as Family) || null,
          membersCount: membersCount || 0,
          generationsCount: generationsCount || 0,
          branchesCount: branchesCount || 0,
          upcomingEventsCount: upcomingEventsCount || 0,
          totalFundBalance,
        };
      } catch (err: any) {
        console.error('getDashboardData Supabase error:', err);
        throw err;
      }
    }

    if (isSupabaseConfigured() && !familyId.startsWith('fam-')) {
      throw new Error(`Mã dòng họ (familyId: "${familyId}") không đúng định dạng UUID.`);
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
