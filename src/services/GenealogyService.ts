import { Member, Generation, Branch, MemberRelationship } from '../types/database';
import { mockMembers, mockGenerations, mockBranches, mockRelationships } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FamilyTreeData {
  members: Member[];
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
}

export class GenealogyService {
  static async getFamilyTree(familyId?: string): Promise<FamilyTreeData> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('members').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const [membersRes, genRes, branchRes, relRes] = await Promise.all([
        query,
        supabase.from('generations').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('member_relationships').select('*'),
      ]);

      if (!membersRes.error && membersRes.data && membersRes.data.length > 0) {
        return {
          members: membersRes.data as Member[],
          generations: (genRes.data as Generation[]) || mockGenerations,
          branches: (branchRes.data as Branch[]) || mockBranches,
          relationships: (relRes.data as MemberRelationship[]) || mockRelationships,
        };
      }
    }

    return {
      members: mockMembers,
      generations: mockGenerations,
      branches: mockBranches,
      relationships: mockRelationships,
    };
  }

  static async getMembers(familyId?: string): Promise<Member[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('members').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Member[];
    }
    return mockMembers;
  }

  static async getMemberById(id: string): Promise<Member | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
      if (!error && data) return data as Member;
    }
    return mockMembers.find((m) => m.id === id);
  }

  static async addMember(member: Partial<Member>): Promise<{ success: boolean; member?: Member; error?: string }> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('members').insert([member]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, member: data as Member };
    }
    const newMember: Member = {
      ...(member as Member),
      id: `mb-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockMembers.push(newMember);
    return { success: true, member: newMember };
  }
}
