import { Member, Generation, Branch, MemberRelationship, RelationshipType } from '../types/database';
import { mockMembers, mockGenerations, mockBranches, mockRelationships, mockMemorialDates } from './mockData';
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
        const targetUUID = familyId;
        const [membersRes, genRes, branchRes, relRes] = await Promise.all([
            supabase.from('members').select('*').eq('family_id', targetUUID),
            supabase.from('generations').select('*').eq('family_id', targetUUID).order('generation_number', { ascending: true }),
            supabase.from('branches').select('*').eq('family_id', targetUUID),
            supabase.from('member_relationships').select('*').eq('family_id', targetUUID),
          ]);

        if (!membersRes.error && membersRes.data) {
          const mappedMembers: Member[] = (membersRes.data || []).map((dbRow: any) => {
            const notesStr = dbRow.notes || dbRow.biography || '';
            const extractNote = (prefix: string) => {
              const match = notesStr.match(new RegExp(`${prefix}:\\s*([^•|]+)`, 'i'));
              return match && match[1] ? match[1].trim() : undefined;
            };

            return {
              id: dbRow.id,
              family_id: dbRow.family_id,
              generation_id: dbRow.generation_id,
              branch_id: dbRow.branch_id,
              father_id: dbRow.father_id,
              mother_id: dbRow.mother_id,
              spouse_id: dbRow.spouse_id,
              union_id: dbRow.union_id,
              birth_order: dbRow.birth_order,
              generation_index: dbRow.generation_index,
              branch_code: dbRow.branch_code,
              branch_path: dbRow.branch_path,
              is_direct_lineage: dbRow.is_direct_lineage,
              child_lineage_type: dbRow.child_lineage_type,
              is_stepchild: dbRow.is_stepchild,
              biological_mother_id: dbRow.biological_mother_id,
              biological_father_id: dbRow.biological_father_id,
              spouse_rank: dbRow.spouse_rank,
              marriage_order: dbRow.marriage_order,
              first_name: dbRow.first_name || dbRow.full_name?.split(' ').pop() || '',
              last_name: dbRow.last_name || dbRow.full_name?.split(' ').slice(0, -1).join(' ') || '',
              full_name: dbRow.full_name || `${dbRow.last_name || ''} ${dbRow.first_name || ''}`.trim(),
              gender: dbRow.gender || 'MALE',
              life_status: dbRow.status || (dbRow.is_deceased ? 'DECEASED' : 'ALIVE'),
              birth_solar_date: dbRow.date_of_birth || extractNote('Ngày sinh dương'),
              birth_time: dbRow.birth_time || extractNote('Giờ sinh'),
              courtesy_name: dbRow.courtesy_name || extractNote('Tên tự/hiệu'),
              death_solar_date: dbRow.date_of_death_solar || extractNote('Ngày mất dương'),
              death_lunar_day: dbRow.date_of_death_lunar_day,
              death_lunar_month: dbRow.date_of_death_lunar_month,
              death_lunar_year: dbRow.date_of_death_lunar_year,
              death_time: dbRow.death_time || extractNote('Giờ mất'),
              religious_name: dbRow.religious_name,
              burial_place: dbRow.burial_place || extractNote('Mộ phần'),
              bio: dbRow.biography || dbRow.notes,
              avatar_url: dbRow.avatar_url,
              created_at: dbRow.created_at,
              updated_at: dbRow.updated_at,
            };
          });

          return {
            members: mappedMembers,
            generations: (genRes.data as Generation[]) || [],
            branches: (branchRes.data as Branch[]) || [],
            relationships: (relRes.data as MemberRelationship[]) || [],
          };
        }
        return { members: [], generations: [], branches: [], relationships: [] };
      } catch (err) {
        console.warn('getFamilyTree Supabase fetch error:', err);
        return { members: [], generations: [], branches: [], relationships: [] };
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
    if (!familyId) return [];

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('family_id', familyId)
          .order('full_name', { ascending: true });

        if (!error && data) {
          return data.map((dbRow: any) => {
            const notesStr = dbRow.notes || dbRow.biography || '';
            const extractNote = (prefix: string) => {
              const match = notesStr.match(new RegExp(`${prefix}:\\s*([^•|]+)`, 'i'));
              return match && match[1] ? match[1].trim() : undefined;
            };

            return {
              id: dbRow.id,
              family_id: dbRow.family_id,
              generation_id: dbRow.generation_id,
              branch_id: dbRow.branch_id,
              father_id: dbRow.father_id,
              mother_id: dbRow.mother_id,
              spouse_id: dbRow.spouse_id,
              union_id: dbRow.union_id,
              birth_order: dbRow.birth_order,
              generation_index: dbRow.generation_index,
              branch_code: dbRow.branch_code,
              branch_path: dbRow.branch_path,
              is_direct_lineage: dbRow.is_direct_lineage,
              child_lineage_type: dbRow.child_lineage_type,
              is_stepchild: dbRow.is_stepchild,
              biological_mother_id: dbRow.biological_mother_id,
              biological_father_id: dbRow.biological_father_id,
              spouse_rank: dbRow.spouse_rank,
              marriage_order: dbRow.marriage_order,
              first_name: dbRow.first_name || dbRow.full_name?.split(' ').pop() || '',
              last_name: dbRow.last_name || dbRow.full_name?.split(' ').slice(0, -1).join(' ') || '',
              full_name: dbRow.full_name || `${dbRow.last_name || ''} ${dbRow.first_name || ''}`.trim(),
              gender: dbRow.gender || 'MALE',
              life_status: dbRow.status || (dbRow.is_deceased ? 'DECEASED' : 'ALIVE'),
              birth_solar_date: dbRow.date_of_birth || extractNote('Ngày sinh dương'),
              birth_time: dbRow.birth_time || extractNote('Giờ sinh'),
              courtesy_name: dbRow.courtesy_name || extractNote('Tên tự/hiệu'),
              death_solar_date: dbRow.date_of_death_solar || extractNote('Ngày mất dương'),
              death_lunar_day: dbRow.date_of_death_lunar_day,
              death_lunar_month: dbRow.date_of_death_lunar_month,
              death_lunar_year: dbRow.date_of_death_lunar_year,
              burial_place: dbRow.burial_place,
              bio: dbRow.biography || dbRow.notes,
              notes: dbRow.notes,
              avatar_url: dbRow.avatar_url,
              created_at: dbRow.created_at,
              updated_at: dbRow.updated_at,
            };
          });
        }
      } catch (err) {
        console.warn('getMembers direct query error:', err);
      }
    }

    return mockMembers.filter((m) => m.family_id === familyId);
  }

  static async getMemberById(id: string, familyId?: string): Promise<Member | undefined> {
    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        let query = supabase.from('members').select('*').eq('id', id);
        if (familyId && isUUID(familyId)) {
          query = query.eq('family_id', familyId);
        }
        const { data, error } = await query.single();
        if (!error && data) {
          const notesStr = data.notes || data.biography || '';
          const extractNote = (prefix: string) => {
            const match = notesStr.match(new RegExp(`${prefix}:\\s*([^•|]+)`, 'i'));
            return match && match[1] ? match[1].trim() : undefined;
          };

          return {
            id: data.id,
            family_id: data.family_id,
            generation_id: data.generation_id,
            branch_id: data.branch_id,
            father_id: data.father_id,
            mother_id: data.mother_id,
            spouse_id: data.spouse_id,
            union_id: data.union_id,
            birth_order: data.birth_order,
            generation_index: data.generation_index,
            branch_code: data.branch_code,
            branch_path: data.branch_path,
            is_direct_lineage: data.is_direct_lineage,
            child_lineage_type: data.child_lineage_type,
            is_stepchild: data.is_stepchild,
            biological_mother_id: data.biological_mother_id,
            biological_father_id: data.biological_father_id,
            spouse_rank: data.spouse_rank,
            marriage_order: data.marriage_order,
            first_name: data.first_name || data.full_name?.split(' ').pop() || '',
            last_name: data.last_name || data.full_name?.split(' ').slice(0, -1).join(' ') || '',
            full_name: data.full_name,
            gender: data.gender || 'MALE',
            life_status: data.status || (data.is_deceased ? 'DECEASED' : 'ALIVE'),
            birth_solar_date: data.date_of_birth || extractNote('Ngày sinh dương'),
            birth_time: data.birth_time || extractNote('Giờ sinh'),
            courtesy_name: data.courtesy_name || extractNote('Tên tự/hiệu'),
            death_solar_date: data.date_of_death_solar || extractNote('Ngày mất dương'),
            death_lunar_day: data.date_of_death_lunar_day,
            death_lunar_month: data.date_of_death_lunar_month,
            death_lunar_year: data.date_of_death_lunar_year,
            death_time: data.death_time || extractNote('Giờ mất'),
            religious_name: data.religious_name,
            burial_place: data.burial_place || extractNote('Mộ phần'),
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
    return mockMembers.find((m) => m.id === id && (!familyId || m.family_id === familyId));
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
        father_id: member.father_id || null,
        mother_id: member.mother_id || null,
        spouse_id: member.spouse_id || null,
        birth_order: member.birth_order || null,
        generation_index: member.generation_index || null,
        branch_code: member.branch_code || null,
        spouse_rank: member.spouse_rank || null,
        marriage_order: member.marriage_order || null,
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
          father_id: data.father_id,
          mother_id: data.mother_id,
          spouse_id: data.spouse_id,
          union_id: data.union_id,
          birth_order: data.birth_order,
          generation_index: data.generation_index,
          branch_code: data.branch_code,
          branch_path: data.branch_path,
          is_direct_lineage: data.is_direct_lineage,
          child_lineage_type: data.child_lineage_type,
          is_stepchild: data.is_stepchild,
          biological_mother_id: data.biological_mother_id,
          biological_father_id: data.biological_father_id,
          spouse_rank: data.spouse_rank,
          marriage_order: data.marriage_order,
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
          const relType = relationTarget.relationType;

          if (relType === 'CHILD') {
            const target = await this.getMemberById(relationTarget.targetMemberId);
            if (target) {
              const updateFields: any = target.gender === 'FEMALE' ? { mother_id: target.id } : { father_id: target.id };
              await supabase.from('members').update(updateFields).eq('id', createdMember.id);
              if (target.gender === 'FEMALE') createdMember.mother_id = target.id;
              else createdMember.father_id = target.id;
            }
            await this.addRelationship({
              family_id: createdMember.family_id,
              member_id: relationTarget.targetMemberId,
              related_member_id: createdMember.id,
              relationship: 'CHILD',
              relationship_type: 'CHILD',
            });
          } else if (relType === 'PARENT') {
            const updateFields: any = createdMember.gender === 'FEMALE' ? { mother_id: createdMember.id } : { father_id: createdMember.id };
            await supabase.from('members').update(updateFields).eq('id', relationTarget.targetMemberId);
            await this.addRelationship({
              family_id: createdMember.family_id,
              member_id: createdMember.id,
              related_member_id: relationTarget.targetMemberId,
              relationship: 'CHILD',
              relationship_type: 'CHILD',
            });
          } else if (relType === 'SPOUSE') {
            await supabase.from('members').update({ spouse_id: relationTarget.targetMemberId }).eq('id', createdMember.id);
            await supabase.from('members').update({ spouse_id: createdMember.id }).eq('id', relationTarget.targetMemberId);
            createdMember.spouse_id = relationTarget.targetMemberId;
            await this.addRelationship({
              family_id: createdMember.family_id,
              member_id: relationTarget.targetMemberId,
              related_member_id: createdMember.id,
              relationship: 'SPOUSE',
              relationship_type: 'SPOUSE',
            });
          } else {
            await this.addRelationship({
              family_id: createdMember.family_id,
              member_id: relationTarget.targetMemberId,
              related_member_id: createdMember.id,
              relationship: relType,
              relationship_type: relType,
            });
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
      id: member.id || `mb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      family_id: member.family_id || `fam-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      father_id: member.father_id,
      mother_id: member.mother_id,
      spouse_id: member.spouse_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockMembers.push(newMember);

    if (relationTarget) {
      const relType = relationTarget.relationType;
      const target = mockMembers.find((m) => m.id === relationTarget.targetMemberId);

      if (relType === 'CHILD') {
        if (target) {
          if (target.gender === 'FEMALE') {
            newMember.mother_id = target.id;
          } else {
            newMember.father_id = target.id;
          }
        }
        mockRelationships.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          family_id: newMember.family_id,
          member_id: relationTarget.targetMemberId,
          related_member_id: newMember.id,
          relationship: 'CHILD',
          relationship_type: 'CHILD',
          created_at: new Date().toISOString(),
        });
      } else if (relType === 'PARENT') {
        if (target) {
          if (newMember.gender === 'FEMALE') {
            target.mother_id = newMember.id;
          } else {
            target.father_id = newMember.id;
          }
        }
        mockRelationships.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          family_id: newMember.family_id,
          member_id: newMember.id,
          related_member_id: relationTarget.targetMemberId,
          relationship: 'CHILD',
          relationship_type: 'CHILD',
          created_at: new Date().toISOString(),
        });
      } else if (relType === 'SPOUSE') {
        newMember.spouse_id = relationTarget.targetMemberId;
        if (target) {
          target.spouse_id = newMember.id;
        }
        mockRelationships.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          family_id: newMember.family_id,
          member_id: relationTarget.targetMemberId,
          related_member_id: newMember.id,
          relationship: 'SPOUSE',
          relationship_type: 'SPOUSE',
          created_at: new Date().toISOString(),
        });
      } else {
        mockRelationships.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          family_id: newMember.family_id,
          member_id: relationTarget.targetMemberId,
          related_member_id: newMember.id,
          relationship: relType,
          relationship_type: relType,
          created_at: new Date().toISOString(),
        });
      }
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
        if (updates.father_id !== undefined) payload.father_id = updates.father_id;
        if (updates.mother_id !== undefined) payload.mother_id = updates.mother_id;
        if (updates.spouse_id !== undefined) payload.spouse_id = updates.spouse_id;
        if (updates.birth_order !== undefined) payload.birth_order = updates.birth_order;
        if (updates.generation_index !== undefined) payload.generation_index = updates.generation_index;
        if (updates.branch_code !== undefined) payload.branch_code = updates.branch_code;
        if (updates.spouse_rank !== undefined) payload.spouse_rank = updates.spouse_rank;
        if (updates.marriage_order !== undefined) payload.marriage_order = updates.marriage_order;
        if (updates.branch_id !== undefined) payload.branch_id = updates.branch_id;
        if (updates.generation_id !== undefined) payload.generation_id = updates.generation_id;

        let updateQuery = supabase.from('members').update(payload).eq('id', id);
        if (updates.family_id && isUUID(updates.family_id)) {
          updateQuery = updateQuery.eq('family_id', updates.family_id);
        }
        const { data, error } = await updateQuery.select().single();
        if (error) {
          return { success: false, error: error.message };
        }
        const updatedMember: Member = {
          id: data.id,
          family_id: data.family_id,
          generation_id: data.generation_id,
          branch_id: data.branch_id,
          father_id: data.father_id,
          mother_id: data.mother_id,
          spouse_id: data.spouse_id,
          union_id: data.union_id,
          birth_order: data.birth_order,
          generation_index: data.generation_index,
          branch_code: data.branch_code,
          branch_path: data.branch_path,
          is_direct_lineage: data.is_direct_lineage,
          child_lineage_type: data.child_lineage_type,
          is_stepchild: data.is_stepchild,
          biological_mother_id: data.biological_mother_id,
          biological_father_id: data.biological_father_id,
          spouse_rank: data.spouse_rank,
          marriage_order: data.marriage_order,
          first_name: data.first_name || data.full_name?.split(' ').pop() || '',
          last_name: data.last_name || data.full_name?.split(' ').slice(0, -1).join(' ') || '',
          full_name: data.full_name,
          gender: data.gender,
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
        return { success: true, member: updatedMember };
      } catch (err: any) {
        console.error('updateMember exception:', err);
        return { success: false, error: err.message };
      }
    }

    const idx = mockMembers.findIndex((m) => m.id === id && (!updates.family_id || m.family_id === updates.family_id));
    if (idx !== -1) {
      mockMembers[idx] = { ...mockMembers[idx], ...updates, updated_at: new Date().toISOString() };
      return { success: true, member: mockMembers[idx] };
    }
    return { success: false, error: 'Không tìm thấy thành viên' };
  }

  /**
   * Xóa thành viên an toàn (Safe Member Deletion):
   * 1. Xóa các quan hệ trong bảng member_relationships liên quan đến memberId
   * 2. Nullify các liên kết trực hệ father_id, mother_id, spouse_id trên các thành viên khác để tránh dangling pointer
   * 3. Xóa các ngày giỗ liên kết trong memorial_dates
   * 4. Xóa bản ghi thành viên khỏi bảng members
   */
  static async deleteMember(id: string, familyId?: string): Promise<{ success: boolean; error?: string }> {
    if (!id) return { success: false, error: 'ID thành viên không hợp lệ' };

    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        // 1. Xóa quan hệ liên quan
        let relQuery = supabase
          .from('member_relationships')
          .delete()
          .or(`member_id.eq.${id},related_member_id.eq.${id}`);
        if (familyId && isUUID(familyId)) {
          relQuery = relQuery.eq('family_id', familyId);
        }
        await relQuery;

        // 2. Nullify father_id, mother_id, spouse_id trên các thành viên trỏ tới id này
        let fQuery = supabase.from('members').update({ father_id: null }).eq('father_id', id);
        let mQuery = supabase.from('members').update({ mother_id: null }).eq('mother_id', id);
        let sQuery = supabase.from('members').update({ spouse_id: null }).eq('spouse_id', id);
        if (familyId && isUUID(familyId)) {
          fQuery = fQuery.eq('family_id', familyId);
          mQuery = mQuery.eq('family_id', familyId);
          sQuery = sQuery.eq('family_id', familyId);
        }
        await Promise.all([fQuery, mQuery, sQuery]);

        // 3. Xóa ngày giỗ liên kết
        let memQuery = supabase.from('memorial_dates').delete().eq('member_id', id);
        if (familyId && isUUID(familyId)) {
          memQuery = memQuery.eq('family_id', familyId);
        }
        await memQuery;

        // 4. Xóa bản ghi thành viên
        let query = supabase.from('members').delete().eq('id', id);
        if (familyId && isUUID(familyId)) {
          query = query.eq('family_id', familyId);
        }
        const { error } = await query;
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.error('deleteMember exception:', err);
        return { success: false, error: err.message };
      }
    }

    // In-memory mock store cleanup
    const idx = mockMembers.findIndex((m) => m.id === id);
    if (idx === -1) {
      return { success: false, error: 'Không tìm thấy thành viên' };
    }

    // 1. Xóa thành viên
    mockMembers.splice(idx, 1);

    // 2. Xóa các quan hệ liên quan
    for (let i = mockRelationships.length - 1; i >= 0; i--) {
      if (mockRelationships[i].member_id === id || mockRelationships[i].related_member_id === id) {
        mockRelationships.splice(i, 1);
      }
    }

    // 3. Nullify father_id, mother_id, spouse_id trên các thành viên còn lại
    mockMembers.forEach((m) => {
      if (m.father_id === id) m.father_id = undefined;
      if (m.mother_id === id) m.mother_id = undefined;
      if (m.spouse_id === id) m.spouse_id = undefined;
    });

    // 4. Xóa ngày giỗ liên kết
    for (let i = mockMemorialDates.length - 1; i >= 0; i--) {
      if (mockMemorialDates[i].member_id === id) {
        mockMemorialDates.splice(i, 1);
      }
    }

    return { success: true };
  }

  /**
   * Lưu trữ thành viên (Soft Archive):
   * Đánh dấu lưu trữ hồ sơ thành viên mà không xóa vĩnh viễn dữ liệu
   */
  static async archiveMember(
    id: string,
    familyId?: string,
    reason?: string
  ): Promise<{ success: boolean; member?: Member; error?: string }> {
    const archiveNote = `[ĐÃ LƯU TRỮ${reason ? `: ${reason}` : ''} - ${new Date().toLocaleDateString('vi-VN')}]`;

    if (isSupabaseConfigured() && isUUID(id)) {
      try {
        const member = await this.getMemberById(id);
        const existingBio = member?.bio || '';
        const updatedBio = existingBio ? `${existingBio}\n${archiveNote}` : archiveNote;

        return await this.updateMember(id, {
          bio: updatedBio,
        });
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const member = mockMembers.find((m) => m.id === id);
    if (!member) {
      return { success: false, error: 'Không tìm thấy thành viên' };
    }

    member.bio = member.bio ? `${member.bio}\n${archiveNote}` : archiveNote;
    member.updated_at = new Date().toISOString();
    return { success: true, member };
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
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      family_id: rel.family_id || `fam-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      member_id: rel.member_id || '',
      related_member_id: rel.related_member_id || '',
      relationship: relType,
      relationship_type: relType,
      created_at: new Date().toISOString(),
    });

    return { success: true };
  }
}
