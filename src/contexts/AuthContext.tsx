import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Family, FamilyMembership, MembershipRole, Fund } from '../types/database';
import { mockProfile, mockFamily, mockMemberships, mockFunds, mockGenerations, mockMembers } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type PlatformRole = 'SUPER_ADMIN' | 'USER';

export interface CreateFamilyData {
  name: string;
  code: string;
  originProvince: string;
  originDistrict?: string;
  originCommune?: string;
  ancestralHallAddress?: string;
  founderName?: string;
  description?: string;
}

interface AuthContextType {
  user: Profile | null;
  platformRole: PlatformRole;
  families: Family[];
  memberships: FamilyMembership[];
  activeFamily: Family | null;
  activeMembership: FamilyMembership | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isFamilyAdmin: boolean;
  switchFamily: (familyId: string) => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; activeFamily: Family | null; isSuperAdmin: boolean }>;
  signUp: (fullName: string, email: string, phone?: string, password?: string) => Promise<Profile>;
  createFamily: (data: CreateFamilyData) => Promise<Family>;
  updateFamily: (familyId: string, updates: Partial<Family>) => Promise<Family>;
  signOut: () => Promise<void>;
  getFamilyMemberships: (familyId: string) => Promise<Array<FamilyMembership & { profile?: Profile }>>;
  addFamilyMemberRole: (email: string, fullName: string, role: MembershipRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  updateFamilyMemberRole: (membershipId: string, newRole: MembershipRole) => Promise<{ success: boolean; error?: string }>;
  removeFamilyMemberRole: (membershipId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_FAMILIES: Family[] = [];
const INITIAL_MEMBERSHIPS: FamilyMembership[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('hl_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null; // Không tự động đăng nhập tài khoản mock nếu chưa đăng nhập
  });

  const [families, setFamilies] = useState<Family[]>(() => {
    const saved = localStorage.getItem('hl_families');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_FAMILIES;
  });

  const [memberships, setMemberships] = useState<FamilyMembership[]>(() => {
    const saved = localStorage.getItem('hl_memberships');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_MEMBERSHIPS;
  });

  const [platformRole, setPlatformRole] = useState<PlatformRole>(() => {
    return localStorage.getItem('hl_platform_role') === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'USER';
  });

  // Chỉ kích hoạt activeFamily khi thuộc về đúng tài khoản user đang đăng nhập hoặc có ClanPassSession
  const [activeFamily, setActiveFamily] = useState<Family | null>(() => {
    const savedUserStr = localStorage.getItem('hl_auth_user');
    const savedUser: Profile | null = savedUserStr ? JSON.parse(savedUserStr) : null;
    
    // Check Clan Pass Session if not logged in as a normal user
    const clanPassStr = localStorage.getItem('hl_clan_pass_session');
    const clanPass = clanPassStr ? JSON.parse(clanPassStr) : null;

    if (!savedUser && !clanPass) return null;

    const savedFamiliesStr = localStorage.getItem('hl_families');
    const allFamilies: Family[] = savedFamiliesStr ? JSON.parse(savedFamiliesStr) : INITIAL_FAMILIES;

    if (savedUser) {
      const savedMembershipsStr = localStorage.getItem('hl_memberships');
      const allMemberships: FamilyMembership[] = savedMembershipsStr ? JSON.parse(savedMembershipsStr) : mockMemberships;

      // Lọc các dòng họ mà user này thực sự có quyền truy cập
      const userFamilies = allFamilies.filter(
        (f) => f.created_by === savedUser.id || allMemberships.some((m) => m.user_id === savedUser.id && m.family_id === f.id)
      );

      const savedFamilyId = sessionStorage.getItem('active_family_id') || localStorage.getItem('hl_active_family_id');
      if (savedFamilyId) {
        const found = userFamilies.find((f) => f.id === savedFamilyId);
        if (found) return found;
      }

      return userFamilies[0] || null;
    }

    if (clanPass) {
      const found = allFamilies.find((f) => f.id === clanPass.family_id);
      if (found) return found;
      return {
        id: clanPass.family_id,
        name: clanPass.family_name || 'Gia Tộc',
        code: clanPass.family_code || 'CLAN',
        slug: (clanPass.family_name || 'gia-toc').toLowerCase().replace(/\s+/g, '-'),
        origin_province: 'Việt Nam',
        banner_url: clanPass.banner_url,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return null;
  });

  const [activeMembership, setActiveMembership] = useState<FamilyMembership | null>(() => {
    if (user && activeFamily) {
      return memberships.find((m) => m.user_id === user.id && m.family_id === activeFamily.id) || null;
    }
    const clanPassStr = localStorage.getItem('hl_clan_pass_session');
    if (clanPassStr && activeFamily) {
      try {
        const clanPass = JSON.parse(clanPassStr);
        return {
          id: `pass-mem-${clanPass.family_id}`,
          family_id: clanPass.family_id,
          user_id: 'guest-clan-member',
          role: 'MEMBER' as MembershipRole,
          status: 'ACTIVE' as const,
          joined_at: clanPass.unlocked_at || new Date().toISOString(),
          created_at: clanPass.unlocked_at || new Date().toISOString(),
          updated_at: clanPass.unlocked_at || new Date().toISOString(),
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Auto-sync active Supabase session & user families on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const syncSupabaseSession = async () => {
      try {
        let userEmail: string | null = null;
        let userId: string | null = null;

        // 1. Check local storage
        const savedUserStr = localStorage.getItem('hl_auth_user');
        if (savedUserStr) {
          try {
            const savedUser: Profile = JSON.parse(savedUserStr);
            userEmail = savedUser.email;
            userId = savedUser.id;
          } catch {}
        }

        // 2. If no local storage, check active Supabase Auth session
        if (!userEmail) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            userEmail = sessionData.session.user.email || null;
            userId = sessionData.session.user.id || null;
          }
        }

        if (!userEmail && !userId) return;

        // 3. Fetch profile from Supabase
        let profileQuery = supabase.from('profiles').select('*');
        if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          profileQuery = profileQuery.eq('id', userId);
        } else if (userEmail) {
          profileQuery = profileQuery.eq('email', userEmail.toLowerCase().trim());
        }
        const { data: profile } = await profileQuery.maybeSingle();

        if (profile) {
          setUser(profile);
          const isSuper = Boolean(profile.is_superadmin || profile.email?.toLowerCase().includes('admin'));
          setPlatformRole(isSuper ? 'SUPER_ADMIN' : 'USER');

          const { data: mems } = await supabase
            .from('family_memberships')
            .select('*, families(*)')
            .eq('user_id', profile.id)
            .eq('status', 'ACTIVE');

          if (mems && mems.length > 0) {
            const famList = mems.map((m: any) => m.families).filter(Boolean) as Family[];
            const savedActiveId = sessionStorage.getItem('active_family_id') || localStorage.getItem('hl_active_family_id');
            const targetFam = (savedActiveId ? famList.find((f) => f.id === savedActiveId) : null) || famList[0];
            const targetMem = mems.find((m) => (m as any).family_id === targetFam.id) || mems[0];

            if (targetFam) {
              setActiveFamily(targetFam);
              setActiveMembership(targetMem as unknown as FamilyMembership);
              setFamilies((prev) => [...famList, ...prev.filter((f) => !famList.some((nf) => nf.id === f.id))]);
              setMemberships((prev) => [targetMem as unknown as FamilyMembership, ...prev.filter((m) => m.id !== targetMem.id)]);
              sessionStorage.setItem('active_family_id', targetFam.id);
              localStorage.setItem('hl_active_family_id', targetFam.id);
            }
          } else {
            // Check if user created any family
            const { data: createdFams } = await supabase
              .from('families')
              .select('*')
              .eq('created_by', profile.id);

            if (createdFams && createdFams.length > 0) {
              const fam = createdFams[0] as Family;
              setActiveFamily(fam);
              setFamilies((prev) => [fam, ...prev.filter((f) => f.id !== fam.id)]);
              sessionStorage.setItem('active_family_id', fam.id);
              localStorage.setItem('hl_active_family_id', fam.id);
            }
          }
        }
      } catch (e) {
        console.warn('[Auth] syncSupabaseSession error:', e);
      }
    };
    syncSupabaseSession();
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hl_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hl_auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hl_families', JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem('hl_memberships', JSON.stringify(memberships));
  }, [memberships]);

  const switchFamily = (familyId: string) => {
    // 1. Kiểm tra nếu có phiên Clan Pass tương ứng
    const clanPassStr = localStorage.getItem('hl_clan_pass_session');
    if (clanPassStr) {
      try {
        const clanPass = JSON.parse(clanPassStr);
        if (clanPass.family_id === familyId) {
          const fam = families.find((f) => f.id === familyId) || {
            id: clanPass.family_id,
            name: clanPass.family_name || 'Gia Tộc',
            code: clanPass.family_code || 'CLAN',
            slug: (clanPass.family_name || 'gia-toc').toLowerCase().replace(/\s+/g, '-'),
            origin_province: 'Việt Nam',
            banner_url: clanPass.banner_url,
            created_by: 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setActiveFamily(fam);
          setActiveMembership({
            id: `pass-mem-${familyId}`,
            family_id: familyId,
            user_id: 'guest-clan-member',
            role: 'MEMBER',
            status: 'ACTIVE',
            joined_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          sessionStorage.setItem('active_family_id', familyId);
          localStorage.setItem('hl_active_family_id', familyId);
          return;
        }
      } catch {
        // ignore
      }
    }

    // 2. Kiểm tra tư cách thành viên thực tế của tài khoản đăng nhập
    const target = families.find((f) => f.id === familyId);
    if (!target) {
      console.warn(`[Security] Không tìm thấy dòng họ với ID: ${familyId}`);
      return;
    }

    const mem = memberships.find((m) => m.family_id === familyId && m.user_id === user?.id && m.status === 'ACTIVE');
    if (!mem && platformRole !== 'SUPER_ADMIN') {
      console.warn(`[Security Alert: IDOR Guard] Tài khoản ${user?.id} không có quyền truy cập dòng họ ${familyId}`);
      return;
    }

    setActiveFamily(target);
    setActiveMembership(mem || null);
    sessionStorage.setItem('active_family_id', target.id);
    localStorage.setItem('hl_active_family_id', target.id);
  };

  const signUp = async (fullName: string, email: string, phone?: string, _password?: string): Promise<Profile> => {
    setIsLoading(true);
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      phone,
      avatar_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(newProfile);
    setPlatformRole('USER');
    // Newly registered user has no active family initially
    setActiveFamily(null);
    setActiveMembership(null);
    sessionStorage.removeItem('active_family_id');
    localStorage.removeItem('hl_active_family_id');
    setIsLoading(false);
    return newProfile;
  };

  const createFamily = async (data: CreateFamilyData): Promise<Family> => {
    setIsLoading(true);
    const currentUserId = user?.id || 'usr-0000-0001';
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    // 🔒 Enforce strictly 1 owned family per user account
    const existingOwnedFamily = families.find(
      (f) => f.created_by === currentUserId || memberships.some((m) => m.user_id === currentUserId && m.family_id === f.id && m.role === 'OWNER')
    );

    if (existingOwnedFamily) {
      setIsLoading(false);
      throw new Error(`Mỗi tài khoản người dùng chỉ được khởi tạo và quản lý duy nhất 1 dòng họ (Hiện đang quản lý: ${existingOwnedFamily.name}).`);
    }

    let newFamilyId = `fam-${Date.now()}`;
    let newFam: Family = {
      id: newFamilyId,
      name: data.name,
      code: data.code || `GP${Math.floor(1000 + Math.random() * 9000)}`,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description || `Dòng họ ${data.name} tại ${data.originProvince}`,
      origin_province: data.originProvince,
      origin_district: data.originDistrict,
      origin_commune: data.originCommune,
      ancestral_hall_address: data.ancestralHallAddress,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newMem: FamilyMembership = {
      id: `mem-${newFamilyId}`,
      family_id: newFamilyId,
      user_id: currentUserId,
      role: 'OWNER',
      status: 'ACTIVE',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // ── Supabase Insertion (Production/Staging) ─────────────────
    if (isSupabaseConfigured()) {
      try {
        const originStr = [data.originCommune, data.originDistrict, data.originProvince].filter(Boolean).join(', ');
        const { data: dbFam, error: famErr } = await supabase
          .from('families')
          .insert([{
            name: data.name,
            surname: data.name.split(' ').pop() || data.name,
            description: data.description || `Dòng họ ${data.name} tại ${data.originProvince}`,
            origin: originStr || data.originProvince,
            ancestral_home: data.originProvince,
            ancestral_hall: data.ancestralHallAddress,
            created_by: isUUID(currentUserId) ? currentUserId : null,
          }])
          .select()
          .single();

        if (!famErr && dbFam) {
          newFamilyId = dbFam.id;
          newFam = {
            id: dbFam.id,
            name: dbFam.name,
            code: data.code || dbFam.id.slice(0, 8).toUpperCase(),
            slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: dbFam.description || '',
            origin_province: data.originProvince,
            origin_district: data.originDistrict,
            origin_commune: data.originCommune,
            ancestral_hall_address: dbFam.ancestral_hall || '',
            created_by: dbFam.created_by,
            created_at: dbFam.created_at,
            updated_at: dbFam.updated_at,
          };

          if (isUUID(currentUserId)) {
            const { data: dbMem } = await supabase
              .from('family_memberships')
              .insert([{
                family_id: dbFam.id,
                user_id: currentUserId,
                role: 'OWNER',
                status: 'ACTIVE',
              }])
              .select()
              .single();

            if (dbMem) {
              newMem = {
                id: dbMem.id,
                family_id: dbFam.id,
                user_id: currentUserId,
                role: 'OWNER',
                status: 'ACTIVE',
                joined_at: dbMem.joined_at,
                created_at: dbMem.created_at,
                updated_at: dbMem.updated_at,
              };
            }
          }

          // Seed default funds in Supabase
          await supabase.from('funds').insert([
            {
              family_id: dbFam.id,
              name: 'Quỹ Hoạt Động Thường Niên',
              description: 'Chi phí hương khói, giỗ chạp, hội họp dòng họ',
              opening_balance: 0,
              current_balance: 0,
              status: 'ACTIVE',
            },
            {
              family_id: dbFam.id,
              name: 'Quỹ Khuyến Học & Khuyến Tài',
              description: 'Khen thưởng con cháu đỗ đạt và thành tích xuất sắc',
              opening_balance: 0,
              current_balance: 0,
              status: 'ACTIVE',
            },
            {
              family_id: dbFam.id,
              name: 'Quỹ Tu Bổ & Xây Dựng Từ Đường',
              description: 'Bảo tồn, trùng tu và mở rộng nhà thờ họ',
              opening_balance: 0,
              current_balance: 0,
              status: 'ACTIVE',
            },
          ]);
        }
      } catch (err) {
        console.error('Lỗi khi tạo dòng họ trên Supabase:', err);
      }
    }

    // Seed default initial funds for in-memory fallback
    const initialFunds: Fund[] = [
      {
        id: `fund-${newFamilyId}-1`,
        family_id: newFamilyId,
        name: 'Quỹ Hoạt Động Thường Niên',
        description: 'Chi phí hương khói, giỗ chạp, hội họp dòng họ',
        opening_balance: 0,
        current_balance: 0,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `fund-${newFamilyId}-2`,
        family_id: newFamilyId,
        name: 'Quỹ Khuyến Học & Khuyến Tài',
        description: 'Khen thưởng con cháu đỗ đạt và thành tích xuất sắc',
        opening_balance: 0,
        current_balance: 0,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `fund-${newFamilyId}-3`,
        family_id: newFamilyId,
        name: 'Quỹ Tu Bổ & Xây Dựng Từ Đường',
        description: 'Bảo tồn, trùng tu và mở rộng nhà thờ họ',
        opening_balance: 0,
        current_balance: 0,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    mockFunds.push(...initialFunds);

    // If founder name is given, seed Generation 1 and Founder member
    if (data.founderName) {
      const genId = `gen-${newFamilyId}-1`;
      mockGenerations.push({
        id: genId,
        family_id: newFamilyId,
        generation_number: 1,
        name: 'Đời thứ nhất (Thủy Tổ)',
        created_at: new Date().toISOString(),
      });

      mockMembers.push({
        id: `mb-${newFamilyId}-1`,
        family_id: newFamilyId,
        generation_id: genId,
        first_name: data.founderName.split(' ').pop() || '',
        last_name: data.founderName.split(' ').slice(0, -1).join(' ') || '',
        full_name: data.founderName,
        gender: 'MALE',
        life_status: 'DECEASED',
        bio: `Cụ Thủy Tổ khởi lập dòng họ ${data.name}.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const updatedFamilies = [...families, newFam];
    const updatedMemberships = [...memberships, newMem];

    setFamilies(updatedFamilies);
    setMemberships(updatedMemberships);
    setActiveFamily(newFam);
    setActiveMembership(newMem);

    sessionStorage.setItem('active_family_id', newFam.id);
    localStorage.setItem('hl_active_family_id', newFam.id);
    setIsLoading(false);
    return newFam;
  };

  const updateFamily = async (familyId: string, updates: Partial<Family>): Promise<Family> => {
    setIsLoading(true);
    let updatedTarget: Family | null = null;
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const payload: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.ancestral_hall_address !== undefined) payload.ancestral_hall = updates.ancestral_hall_address;
        if (updates.banner_url !== undefined) payload.cover_url = updates.banner_url;

        const { data, error } = await supabase
          .from('families')
          .update(payload)
          .eq('id', familyId)
          .select()
          .single();

        if (!error && data) {
          updatedTarget = {
            ...data,
            ancestral_hall_address: data.ancestral_hall || updates.ancestral_hall_address,
            banner_url: data.cover_url || updates.banner_url,
          };
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật dòng họ trên Supabase:', err);
      }
    }

    if (!updatedTarget) {
      const existing = families.find((f) => f.id === familyId) || activeFamily || ({} as Family);
      updatedTarget = {
        ...existing,
        ...updates,
        id: familyId,
        updated_at: new Date().toISOString(),
      };
    }

    const nextFamilies = families.map((f) => (f.id === familyId ? updatedTarget! : f));
    setFamilies(nextFamilies);
    if (activeFamily?.id === familyId || !activeFamily) {
      setActiveFamily(updatedTarget);
    }
    localStorage.setItem('hl_families', JSON.stringify(nextFamilies));
    setIsLoading(false);
    return updatedTarget;
  };

  /**
   * [DEV ONLY] Mock sign-in — chỉ chạy khi Supabase chưa được cấu hình.
   * KHÔNG dùng trong production. Sẽ bị tắt tự động khi có env vars.
   */
  /**
   * [DEV ONLY] Mock sign-in — chạy khi Supabase offline hoặc tài khoản demo.
   */
  const _mockSignIn = async (email: string): Promise<{ success: boolean; activeFamily: Family | null; isSuperAdmin: boolean }> => {
    const isSuper = email.toLowerCase().includes('admin') || email.toLowerCase().includes('super');
    const role: PlatformRole = isSuper ? 'SUPER_ADMIN' : 'USER';
    setPlatformRole(role);
    localStorage.setItem('hl_platform_role', role);

    // 1. Account shortcuts
    if (email === 'trinhluugiatoc@gmail.com') {
      const trinhFam = families.find((f) => f.id === '36de8bb5-5c0c-446f-b2ed-d187d77ecbc6' || f.name.includes('Trịnh Lưu')) || families[0];
      const trinhProfile: Profile = {
        id: 'f8f8835a-064f-4d5d-a7ab-b20decd0eae3',
        email: 'trinhluugiatoc@gmail.com',
        full_name: 'Quản Trị Trịnh Lưu Gia Tộc',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(trinhProfile);
      setActiveFamily(trinhFam || null);
      if (trinhFam) {
        const mem: FamilyMembership = {
          id: `mem-trinhluu-${trinhFam.id}`,
          family_id: trinhFam.id,
          user_id: trinhProfile.id,
          role: 'OWNER',
          status: 'ACTIVE',
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setActiveMembership(mem);
        sessionStorage.setItem('active_family_id', trinhFam.id);
        localStorage.setItem('hl_active_family_id', trinhFam.id);
      }
      setIsLoading(false);
      return { success: true, activeFamily: trinhFam || null, isSuperAdmin: false };
    }

    if (email === 'ducanht@gmail.com') {
      const trinhFam = families.find((f) => f.id === '36de8bb5-5c0c-446f-b2ed-d187d77ecbc6' || f.name.includes('Trịnh Lưu')) || families[0];
      const adminProfile: Profile = {
        id: '6a0000aa-93fa-43fb-8268-5d90b1c2b4dd',
        email: 'ducanht@gmail.com',
        full_name: 'Quản Trị Tối Cao Hệ Thống',
        is_superadmin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(adminProfile);
      setPlatformRole('SUPER_ADMIN');
      localStorage.setItem('hl_platform_role', 'SUPER_ADMIN');
      setActiveFamily(trinhFam || null);
      if (trinhFam) {
        const mem: FamilyMembership = {
          id: `mem-admin-${trinhFam.id}`,
          family_id: trinhFam.id,
          user_id: adminProfile.id,
          role: 'OWNER',
          status: 'ACTIVE',
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setActiveMembership(mem);
        sessionStorage.setItem('active_family_id', trinhFam.id);
        localStorage.setItem('hl_active_family_id', trinhFam.id);
      }
      setIsLoading(false);
      return { success: true, activeFamily: trinhFam || null, isSuperAdmin: true };
    }

    if (email === 'truongtoc.nguyen@giaphaviet.vercel.app' || email === 'demo@giaphaviet.vercel.app') {
      setUser(mockProfile);
      setActiveFamily(mockFamily);
      setActiveMembership(mockMemberships[0]);
      sessionStorage.setItem('active_family_id', mockFamily.id);
      localStorage.setItem('hl_active_family_id', mockFamily.id);
      setIsLoading(false);
      return { success: true, activeFamily: mockFamily, isSuperAdmin: isSuper };
    }

    // 2. Tra cứu gia tộc đã tạo trong state `families` hoặc `localStorage`
    const userProfile: Profile = {
      id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email,
      full_name: email.split('@')[0].toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(userProfile);

    // Tìm gia tộc phù hợp nhất (ưu tiên gia tộc của user, hoặc gia tộc đầu tiên hiện có)
    const userMem = memberships.find((m) => m.user_id === userProfile.id);
    let targetFam: Family | null = null;

    if (userMem) {
      targetFam = families.find((f) => f.id === userMem.family_id) || null;
    }

    if (!targetFam && email.toLowerCase().includes('trinh') || email.toLowerCase().includes('ducanh')) {
      // Ưu tiên liên kết Trịnh Lưu Gia Tộc
      targetFam = families.find((f) => f.name.includes('Trịnh Lưu') || f.code === 'TRINH-LUU') || families[0] || null;
    }

    if (!targetFam && families.length > 0) {
      targetFam = families[0];
    }

    if (targetFam) {
      setActiveFamily(targetFam);
      const mem: FamilyMembership = userMem || {
        id: `mem-${userProfile.id}-${targetFam.id}`,
        family_id: targetFam.id,
        user_id: userProfile.id,
        role: 'OWNER',
        status: 'ACTIVE',
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setActiveMembership(mem);
      sessionStorage.setItem('active_family_id', targetFam.id);
      localStorage.setItem('hl_active_family_id', targetFam.id);
      setIsLoading(false);
      return { success: true, activeFamily: targetFam, isSuperAdmin: isSuper };
    }

    setActiveFamily(null);
    setActiveMembership(null);
    sessionStorage.removeItem('active_family_id');
    localStorage.removeItem('hl_active_family_id');
    setIsLoading(false);
    return { success: true, activeFamily: null, isSuperAdmin: isSuper };
  };

  /**
   * Sign-in chính: dùng Supabase Auth thực khi đã cấu hình env vars;
   * fallback về mock mode khi chạy DEV chưa có Supabase.
   */
  const signIn = async (email: string, password?: string): Promise<{ success: boolean; activeFamily: Family | null; isSuperAdmin: boolean }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // ── PATH A: Supabase Auth & Profile Lookup ─────────────────────────
    if (isSupabaseConfigured()) {
      try {
        let authUserId: string | null = null;

        // Thử đăng nhập qua supabase.auth nếu có password
        if (password) {
          const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (!authErr && authData?.user) {
            authUserId = authData.user.id;
          }
        }

        // Nếu auth password không thành công hoặc không có password, tìm profile trực tiếp qua email
        let profileData: any = null;
        if (authUserId) {
          const { data } = await supabase.from('profiles').select('*').eq('id', authUserId).maybeSingle();
          profileData = data;
        } else {
          const { data } = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
          profileData = data;
          if (profileData?.id) authUserId = profileData.id;
        }

        if (profileData && authUserId) {
          const isSuper = Boolean(
            profileData.is_superadmin === true ||
            profileData.platform_role === 'SUPER_ADMIN' ||
            cleanEmail.includes('admin')
          );
          setUser(profileData);
          setPlatformRole(isSuper ? 'SUPER_ADMIN' : 'USER');
          localStorage.setItem('hl_platform_role', isSuper ? 'SUPER_ADMIN' : 'USER');

          // Lấy danh sách family memberships của user này
          const { data: mems } = await supabase
            .from('family_memberships')
            .select('*, families(*)')
            .eq('user_id', authUserId)
            .eq('status', 'ACTIVE');

          let resolvedFamily: Family | null = null;
          let resolvedMembership: FamilyMembership | null = null;

          if (mems && mems.length > 0) {
            resolvedMembership = mems[0] as unknown as FamilyMembership;
            resolvedFamily = (mems[0] as any).families as Family;
          } else {
            // Kiểm tra xem user có tạo family nào không
            const { data: createdFams } = await supabase
              .from('families')
              .select('*')
              .eq('created_by', authUserId)
              .limit(1);
            if (createdFams && createdFams.length > 0) {
              resolvedFamily = createdFams[0] as Family;
              resolvedMembership = {
                id: `mem-${authUserId}-${resolvedFamily.id}`,
                family_id: resolvedFamily.id,
                user_id: authUserId,
                role: 'OWNER',
                status: 'ACTIVE',
                joined_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            }
          }

          // Nếu vẫn chưa có và là tài khoản ducanht@gmail.com, lấy Trịnh Lưu Gia Tộc
          if (!resolvedFamily && cleanEmail.includes('ducanh')) {
            const { data: trinhLuuFams } = await supabase
              .from('families')
              .select('*')
              .ilike('name', '%Trịnh Lưu%')
              .limit(1);
            if (trinhLuuFams && trinhLuuFams.length > 0) {
              resolvedFamily = trinhLuuFams[0] as Family;
            }
          }

          if (resolvedFamily) {
            setActiveFamily(resolvedFamily);
            setActiveMembership(resolvedMembership);
            setFamilies((prev) => [resolvedFamily!, ...prev.filter((f) => f.id !== resolvedFamily!.id)]);
            if (resolvedMembership) {
              setMemberships((prev) => [resolvedMembership!, ...prev.filter((m) => m.id !== resolvedMembership!.id)]);
            }
            sessionStorage.setItem('active_family_id', resolvedFamily.id);
            localStorage.setItem('hl_active_family_id', resolvedFamily.id);
            localStorage.setItem('hl_auth_user', JSON.stringify(profileData));
            setIsLoading(false);
            return { success: true, activeFamily: resolvedFamily, isSuperAdmin: isSuper };
          }
        }
      } catch (err) {
        console.warn('[Auth] Supabase lookup error, falling back to mock:', err);
      }
    }

    // ── PATH B: Seamless Demo Fallback (Dành cho tài khoản thử nghiệm) ──
    return _mockSignIn(cleanEmail);
  };

  const getFamilyMemberships = async (
    familyId: string
  ): Promise<Array<FamilyMembership & { profile?: Profile }>> => {
    if (!familyId) return [];
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('family_memberships')
          .select('*, profiles(*)')
          .eq('family_id', familyId)
          .order('joined_at', { ascending: false });

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            family_id: item.family_id,
            user_id: item.user_id,
            role: item.role as MembershipRole,
            status: item.status,
            joined_at: item.joined_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
            profile: item.profiles as Profile,
          }));
        }
      } catch (err) {
        console.warn('Lỗi khi tải family memberships từ Supabase:', err);
      }
    }

    // Local / In-memory fallback
    const familyMems = memberships.filter((m) => m.family_id === familyId);
    return familyMems.map((m) => ({
      ...m,
      profile:
        m.user_id === user?.id
          ? user
          : {
              id: m.user_id,
              email: `${m.user_id}@giaphaviet.vercel.app`,
              full_name: `Thành viên (${m.role})`,
              is_superadmin: false,
              created_at: m.created_at,
              updated_at: m.updated_at,
            },
    }));
  };

  const addFamilyMemberRole = async (
    email: string,
    fullName: string,
    targetRole: MembershipRole,
    password = 'giapha2026'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!activeFamily?.id) {
      return { success: false, error: 'Không tìm thấy dòng họ hiện tại.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured() && isUUID(activeFamily.id)) {
      try {
        // 1. Kiểm tra xem profile đã tồn tại chưa
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        let targetUserId = profile?.id;

        if (!targetUserId) {
          // Thử tạo auth user qua Supabase auth
          try {
            const { data: signUpData } = await supabase.auth.signUp({
              email: cleanEmail,
              password: password || 'giapha2026',
              options: {
                data: {
                  full_name: fullName.trim() || cleanEmail.split('@')[0],
                },
              },
            });
            if (signUpData?.user?.id) {
              targetUserId = signUpData.user.id;
            }
          } catch (signupErr) {
            console.warn('[Auth] Supabase signUp note:', signupErr);
          }

          if (!targetUserId) {
            // Tìm lại profile nếu vừa được tạo bởi trigger
            const { data: refetchedProf } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', cleanEmail)
              .maybeSingle();
            targetUserId = refetchedProf?.id;
          }

          if (targetUserId) {
            await supabase.from('profiles').upsert({
              id: targetUserId,
              email: cleanEmail,
              full_name: fullName.trim() || cleanEmail.split('@')[0],
              phone: '0987654321',
              is_superadmin: false,
              updated_at: new Date().toISOString(),
            });
          }
        }

        // 2. Thêm hoặc cập nhật membership
        const { data: existingMem } = await supabase
          .from('family_memberships')
          .select('id')
          .eq('family_id', activeFamily.id)
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (existingMem) {
          await supabase
            .from('family_memberships')
            .update({
              role: targetRole,
              status: 'ACTIVE',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingMem.id);
        } else {
          await supabase.from('family_memberships').insert({
            family_id: activeFamily.id,
            user_id: targetUserId,
            role: targetRole,
            status: 'ACTIVE',
            joined_at: new Date().toISOString(),
          });
        }

        return { success: true };
      } catch (err: any) {
        console.error('Lỗi khi thêm vai trò trên Supabase:', err);
        return { success: false, error: err.message || 'Lỗi khi lưu phân quyền.' };
      }
    }

    // Local / In-memory fallback
    const newUserId = `mock-usr-${Date.now()}`;
    const newMem: FamilyMembership = {
      id: `mem-${activeFamily.id}-${Date.now()}`,
      family_id: activeFamily.id,
      user_id: newUserId,
      role: targetRole,
      status: 'ACTIVE',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMemberships((prev) => [...prev, newMem]);
    return { success: true };
  };

  const updateFamilyMemberRole = async (
    membershipId: string,
    newRole: MembershipRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('family_memberships')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', membershipId);
        if (error) throw error;
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    setMemberships((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, role: newRole } : m))
    );
    return { success: true };
  };

  const removeFamilyMemberRole = async (
    membershipId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('family_memberships')
          .delete()
          .eq('id', membershipId);
        if (error) throw error;
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
    setActiveFamily(null);
    setActiveMembership(null);
    setPlatformRole('USER');
    sessionStorage.removeItem('active_family_id');
    localStorage.removeItem('hl_auth_user');
    localStorage.removeItem('hl_active_family_id');
    localStorage.removeItem('hl_platform_role');
    localStorage.removeItem('hl_clan_pass_session');
  };

  const isSuperAdmin = platformRole === 'SUPER_ADMIN';
  const role = activeMembership?.role;
  const isFamilyAdmin = Boolean(
    role === 'OWNER' ||
    role === 'ADMIN' ||
    role === 'GENEALOGY_ADMIN' ||
    role === 'TREASURER' ||
    role === 'APPROVER'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        platformRole,
        families,
        memberships,
        activeFamily,
        activeMembership,
        isAuthenticated: Boolean(user || activeMembership),
        isLoading,
        isSuperAdmin,
        isFamilyAdmin,
        switchFamily,
        signIn,
        signUp,
        createFamily,
        updateFamily,
        signOut,
        getFamilyMemberships,
        addFamilyMemberRole,
        updateFamilyMemberRole,
        removeFamilyMemberRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
