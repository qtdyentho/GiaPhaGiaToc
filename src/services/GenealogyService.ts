import { Member, Generation, Branch, MemberRelationship, RelationshipType } from '../types/database';
import { mockMembers, mockGenerations, mockBranches, mockRelationships } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FamilyTreeData {
  members: Member[];
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
}

const isUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export class GenealogyService {
  static async getFamilyTree(familyId?: string): Promise<FamilyTreeData> {
    if (!familyId) {
      return {
        members: [],
        generations: [],
        branches: [],
        relationships: [],
      };
    }

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const [membersRes, genRes, branchRes, relRes] = await Promise.all([
          supabase.from('members').select('*').eq('family_id', familyId),
          supabase.from('generations').select('*').eq('family_id', familyId).order('generation_number', { ascending: true }),
          supabase.from('branches').select('*').eq('family_id', familyId),
          supabase.from('member_relationships').select('*').eq('family_id', familyId),
        ]);

        if (!membersRes.error && membersRes.data) {
          const mappedMembers: Member[] = (membersRes.data || []).map((dbRow: any) => ({
            id: dbRow.id,
            family_id: dbRow.family_id,
            generation_id: dbRow.generation_id,
            branch_id: dbRow.branch_id,
            first_name: dbRow.first_name || dbRow.full_name?.split(' ').pop() || '',
            last_name: dbRow.last_name || dbRow.full_name?.split(' ').slice(0, -1).join(' ') || '',
            full_name: dbRow.full_name || `${dbRow.last_name || ''} ${dbRow.first_name || ''}`.trim(),
            gender: dbRow.gender || 'MALE',
            life_status: dbRow.status || (dbRow.is_deceased ? 'DECEASED' : 'ALIVE'),
            birth_solar_date: dbRow.date_of_birth,
            birth_time: dbRow.birth_time,
            courtesy_name: dbRow.courtesy_name,
            death_solar_date: dbRow.date_of_death_solar,
            death_lunar_day: dbRow.date_of_death_lunar_day,
            death_lunar_month: dbRow.date_of_death_lunar_month,
            death_lunar_year: dbRow.date_of_death_lunar_year,
            death_time: dbRow.death_time,
            religious_name: dbRow.religious_name,
            burial_place: dbRow.burial_place,
            bio: dbRow.biography || dbRow.notes,
            avatar_url: dbRow.avatar_url,
            created_at: dbRow.created_at,
            updated_at: dbRow.updated_at,
          }));

          return {
            members: mappedMembers,
            generations: (genRes.data as Generation[]) || [],
            branches: (branchRes.data as Branch[]) || [],
            relationships: (relRes.data as MemberRelationship[]) || [],
          };
        }
      } catch (err) {
        console.warn('getFamilyTree Supabase fetch error:', err);
      }
    }

    // Local / In-memory Store: Filter strictly by familyId
    return {
      members: mockMembers.filter((m) => m.family_id === familyId),
      generations: mockGenerations.filter((g) => g.family_id === familyId),
      branches: mockBranches.filter((b) => b.family_id === familyId),
      relationships: mockRelationships.filter((r) => r.family_id === familyId),
    };
  }

  static async getMembers(familyId?: string): Promise<Member[]> {
    const tree = await this.getFamilyTree(familyId);
    return tree.members;
  }

  static async getMemberById(id: string): Promise<Member | undefined> {
    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            id: data.id,
            family_id: data.family_id,
            generation_id: data.generation_id,
            branch_id: data.branch_id,
            first_name: data.first_name || data.full_name?.split(' ').pop() || '',
            last_name: data.last_name || data.full_name?.split(' ').slice(0, -1).join(' ') || '',
            full_name: data.full_name,
            gender: data.gender || 'MALE',
            life_status: data.status || (data.is_deceased ? 'DECEASED' : 'ALIVE'),
            birth_solar_date: data.date_of_birth,
            birth_time: data.birth_time,
            courtesy_name: data.courtesy_name,
            death_solar_date: data.date_of_death_solar,
            death_lunar_day: data.date_of_death_lunar_day,
            death_lunar_month: data.date_of_death_lunar_month,
            death_lunar_year: data.date_of_death_lunar_year,
            death_time: data.death_time,
            religious_name: data.religious_name,
            burial_place: data.burial_place,
            bio: data.biography || data.notes,
            avatar_url: data.avatar_url,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('getMemberById Supabase error:', err);
      }
    }
    return mockMembers.find((m) => m.id === id);
  }

  static async addMember(
    member: Partial<Member>,
    relationTarget?: { targetMemberId: string; relationType: RelationshipType }
  ): Promise<{ success: boolean; member?: Member; error?: string }> {
    const isDeceased = member.life_status === 'DECEASED';
    
    // Đảm bảo UUID hợp lệ trước khi gửi sang Supabase
    const safeFamilyId = isUUID(member.family_id) ? member.family_id : null;
    const safeBranchId = isUUID(member.branch_id) ? member.branch_id : null;
    const safeGenId = isUUID(member.generation_id) ? member.generation_id : null;

    if (isSupabaseConfigured() && safeFamilyId) {
      const memberPayload: any = {
        family_id: safeFamilyId,
        branch_id: safeBranchId,
        generation_id: safeGenId,
        full_name: member.full_name,
        gender: member.gender || 'MALE',
        status: member.life_status || 'ALIVE',
        is_deceased: isDeceased,
        date_of_birth: member.birth_solar_date || null,
        birth_time: member.birth_time || null,
        courtesy_name: member.courtesy_name || null,
        date_of_death_solar: member.death_solar_date || null,
        date_of_death_lunar_day: member.death_lunar_day || null,
        date_of_death_lunar_month: member.death_lunar_month || null,
        date_of_death_lunar_year: member.death_lunar_year || null,
        death_time: member.death_time || null,
        religious_name: member.religious_name || null,
        burial_place: member.burial_place || null,
        biography: member.bio || null,
      };

      try {
        const { data, error } = await supabase.from('members').insert([memberPayload]).select().single();
        if (error) {
          console.error('Supabase addMember error:', error);
          return { success: false, error: error.message };
        }

        const createdMember: Member = {
          id: data.id,
          family_id: data.family_id,
          generation_id: data.generation_id,
          branch_id: data.branch_id,
          first_name: member.first_name || member.full_name?.split(' ').pop() || '',
          last_name: member.last_name || member.full_name?.split(' ').slice(0, -1).join(' ') || '',
          full_name: data.full_name,
          gender: data.gender,
          life_status: data.status,
          birth_solar_date: data.date_of_birth,
          birth_time: data.birth_time,
          courtesy_name: data.courtesy_name,
          death_solar_date: data.date_of_death_solar,
          death_lunar_day: data.date_of_death_lunar_day,
          death_lunar_month: data.date_of_death_lunar_month,
          death_lunar_year: data.date_of_death_lunar_year,
          death_time: data.death_time,
          religious_name: data.religious_name,
          burial_place: data.burial_place,
          bio: data.biography,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        if (relationTarget && isUUID(relationTarget.targetMemberId)) {
          await this.addRelationship({
            family_id: createdMember.family_id,
            member_id: relationTarget.targetMemberId,
            related_member_id: createdMember.id,
            relationship: relationTarget.relationType,
            relationship_type: relationTarget.relationType,
          });

          // Cập nhật quan hệ trực hệ father_id / mother_id / spouse_id
          if (relationTarget.relationType === 'CHILD') {
            const target = await this.getMemberById(relationTarget.targetMemberId);
            if (target) {
              const updateFields: any = target.gender === 'FEMALE' ? { mother_id: target.id } : { father_id: target.id };
              await supabase.from('members').update(updateFields).eq('id', createdMember.id);
            }
          } else if (relationTarget.relationType === 'SPOUSE') {
            await supabase.from('members').update({ spouse_id: relationTarget.targetMemberId }).eq('id', createdMember.id);
            await supabase.from('members').update({ spouse_id: createdMember.id }).eq('id', relationTarget.targetMemberId);
          } else if (relationTarget.relationType === 'PARENT') {
            const updateFields: any = createdMember.gender === 'FEMALE' ? { mother_id: createdMember.id } : { father_id: createdMember.id };
            await supabase.from('members').update(updateFields).eq('id', relationTarget.targetMemberId);
          }
        }

        return { success: true, member: createdMember };
      } catch (err: any) {
        console.error('addMember exception:', err);
        return { success: false, error: err.message };
      }
    }

    // Local in-memory Fallback
    const newMember: Member = {
      id: `mb-${Date.now()}`,
      family_id: member.family_id || `fam-${Date.now()}`,
      branch_id: member.branch_id,
      generation_id: member.generation_id,
      first_name: member.first_name || member.full_name?.split(' ').pop() || '',
      last_name: member.last_name || member.full_name?.split(' ').slice(0, -1).join(' ') || '',
      full_name: member.full_name || '',
      gender: member.gender || 'MALE',
      life_status: member.life_status || 'ALIVE',
      birth_solar_date: member.birth_solar_date,
      birth_time: member.birth_time,
      courtesy_name: member.courtesy_name,
      death_solar_date: member.death_solar_date,
      death_lunar_day: member.death_lunar_day,
      death_lunar_month: member.death_lunar_month,
      death_lunar_year: member.death_lunar_year,
      death_time: member.death_time,
      religious_name: member.religious_name,
      burial_place: member.burial_place,
      bio: member.bio,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockMembers.push(newMember);

    if (relationTarget) {
      mockRelationships.push({
        id: `rel-${Date.now()}`,
        family_id: newMember.family_id,
        member_id: relationTarget.targetMemberId,
        related_member_id: newMember.id,
        relationship: relationTarget.relationType,
        relationship_type: relationTarget.relationType,
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, member: newMember };
  }

  static async updateMember(
    id: string,
    updates: Partial<Member>
  ): Promise<{ success: boolean; member?: Member; error?: string }> {
    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        const payload: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.full_name !== undefined) payload.full_name = updates.full_name;
        if (updates.gender !== undefined) payload.gender = updates.gender;
        if (updates.life_status !== undefined) {
          payload.status = updates.life_status;
          payload.is_deceased = updates.life_status === 'DECEASED';
        }
        if (updates.birth_solar_date !== undefined) payload.date_of_birth = updates.birth_solar_date;
        if (updates.birth_time !== undefined) payload.birth_time = updates.birth_time;
        if (updates.courtesy_name !== undefined) payload.courtesy_name = updates.courtesy_name;
        if (updates.death_solar_date !== undefined) payload.date_of_death_solar = updates.death_solar_date;
        if (updates.death_lunar_day !== undefined) payload.date_of_death_lunar_day = updates.death_lunar_day;
        if (updates.death_lunar_month !== undefined) payload.date_of_death_lunar_month = updates.death_lunar_month;
        if (updates.death_lunar_year !== undefined) payload.date_of_death_lunar_year = updates.death_lunar_year;
        if (updates.death_time !== undefined) payload.death_time = updates.death_time;
        if (updates.religious_name !== undefined) payload.religious_name = updates.religious_name;
        if (updates.burial_place !== undefined) payload.burial_place = updates.burial_place;
        if (updates.bio !== undefined) payload.biography = updates.bio;
        if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;

        const { data, error } = await supabase.from('members').update(payload).eq('id', id).select().single();
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, member: data as unknown as Member };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const idx = mockMembers.findIndex((m) => m.id === id);
    if (idx !== -1) {
      mockMembers[idx] = { ...mockMembers[idx], ...updates, updated_at: new Date().toISOString() };
      return { success: true, member: mockMembers[idx] };
    }
    return { success: false, error: 'Không tìm thấy thành viên' };
  }

  static async addRelationship(rel: Partial<MemberRelationship>): Promise<{ success: boolean; error?: string }> {
    const relType = rel.relationship || rel.relationship_type || 'CHILD';
    
    if (isSupabaseConfigured() && isUUID(rel.family_id) && isUUID(rel.member_id) && isUUID(rel.related_member_id)) {
      try {
        const { error } = await supabase.from('member_relationships').insert([{
          family_id: rel.family_id,
          member_id: rel.member_id,
          related_member_id: rel.related_member_id,
          relationship_type: relType,
        }]);
        if (error) {
          console.error('Supabase addRelationship error:', error);
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.error('addRelationship exception:', err);
        return { success: false, error: err.message };
      }
    }

    mockRelationships.push({
      id: `rel-${Date.now()}`,
      family_id: rel.family_id || `fam-${Date.now()}`,
      member_id: rel.member_id || '',
      related_member_id: rel.related_member_id || '',
      relationship: relType,
      relationship_type: relType,
      created_at: new Date().toISOString(),
    });

    return { success: true };
  }
}
