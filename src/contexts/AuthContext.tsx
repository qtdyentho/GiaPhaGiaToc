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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_FAMILIES: Family[] = [
  mockFamily,
];

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
    return mockMemberships;
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

    // 🔒 Enforce strictly 1 owned family per user account
    const existingOwnedFamily = families.find(
      (f) => f.created_by === currentUserId || memberships.some((m) => m.user_id === currentUserId && m.family_id === f.id && m.role === 'OWNER')
    );

    if (existingOwnedFamily) {
      setIsLoading(false);
      throw new Error(`Mỗi tài khoản người dùng chỉ được khởi tạo và quản lý duy nhất 1 dòng họ (Hiện đang quản lý: ${existingOwnedFamily.name}).`);
    }

    const newFamilyId = `fam-${Date.now()}`;
    const newFam: Family = {
      id: newFamilyId,
      name: data.name,
      code: data.code,
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

    // Create OWNER membership
    const newMem: FamilyMembership = {
      id: `mem-${newFamilyId}`,
      family_id: newFamilyId,
      user_id: user?.id || 'usr-0000-0001',
      role: 'OWNER',
      status: 'ACTIVE',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Seed default initial funds for this new family (Clean 0 balance)
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

    // If founder name is given, seed Generation 1 and Founder member for this family
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
  const _mockSignIn = async (email: string): Promise<{ success: boolean; activeFamily: Family | null; isSuperAdmin: boolean }> => {
    console.warn(
      '[⚠️ DEV MOCK AUTH] Đang dùng mock authentication.\n' +
      'Cấu hình VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY để bật Supabase Auth thực.'
    );
    const isSuper = email.toLowerCase().includes('admin') || email.toLowerCase().includes('super');
    const role: PlatformRole = isSuper ? 'SUPER_ADMIN' : 'USER';
    setPlatformRole(role);
    localStorage.setItem('hl_platform_role', role);

    // Demo account shortcut
    if (email === 'truongtoc.nguyen@giapha.vn' || email === 'demo@giapha.vn') {
      setUser(mockProfile);
      setActiveFamily(mockFamily);
      setActiveMembership(mockMemberships[0]);
      sessionStorage.setItem('active_family_id', mockFamily.id);
      localStorage.setItem('hl_active_family_id', mockFamily.id);
      setIsLoading(false);
      return { success: true, activeFamily: mockFamily, isSuperAdmin: isSuper };
    }

    const existingUser: Profile = {
      id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email,
      full_name: email.split('@')[0].toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(existingUser);

    const userMem = memberships.find((m) => m.user_id === existingUser.id);
    if (userMem) {
      const fam = families.find((f) => f.id === userMem.family_id) || null;
      setActiveFamily(fam);
      setActiveMembership(userMem);
      if (fam) {
        sessionStorage.setItem('active_family_id', fam.id);
        localStorage.setItem('hl_active_family_id', fam.id);
      }
      setIsLoading(false);
      return { success: true, activeFamily: fam, isSuperAdmin: isSuper };
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

    // ── PATH A: Supabase Auth thực (production/staging) ─────────────────
    if (isSupabaseConfigured()) {
      if (password) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (!error && data?.user) {
            // Lấy profile từ DB
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            const isSuper = Boolean(
              (profile as any)?.is_superadmin === true ||
              (profile as any)?.platform_role === 'SUPER_ADMIN' ||
              cleanEmail.includes('admin')
            );
            setUser(profile ?? { id: data.user.id, email: cleanEmail, full_name: cleanEmail, created_at: '', updated_at: '' });
            setPlatformRole(isSuper ? 'SUPER_ADMIN' : 'USER');
            localStorage.setItem('hl_platform_role', isSuper ? 'SUPER_ADMIN' : 'USER');

            // Lấy family membership đầu tiên
            const { data: mems } = await supabase
              .from('family_memberships')
              .select('*, families(*)')
              .eq('user_id', data.user.id)
              .eq('status', 'ACTIVE')
              .limit(1);

            const firstMem = mems?.[0] ?? null;
            const firstFam = (firstMem as any)?.families ?? null;
            setActiveFamily(firstFam);
            setActiveMembership(firstMem);
            if (firstFam?.id) {
              sessionStorage.setItem('active_family_id', firstFam.id);
              localStorage.setItem('hl_active_family_id', firstFam.id);
            } else {
              sessionStorage.removeItem('active_family_id');
              localStorage.removeItem('hl_active_family_id');
            }
            setIsLoading(false);
            return { success: true, activeFamily: firstFam, isSuperAdmin: isSuper };
          }
        } catch (err) {
          console.warn('[Auth] Supabase auth attempt error, evaluating fallback:', err);
        }
      }
    }

    // ── PATH B: Seamless Demo Fallback (Dành cho tài khoản thử nghiệm) ──
    return _mockSignIn(cleanEmail);
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
