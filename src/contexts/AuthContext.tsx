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
    return mockProfile;
  });

  const [families, setFamilies] = useState<Family[]>(() => {
    const saved = localStorage.getItem('hl_families');
    if (saved) {
      try {
        const parsed: Family[] = JSON.parse(saved);
        // Enforce 1 family per user constraint (clean up any legacy mock duplicates)
        const sanitized = parsed.filter(
          (f) => f.id === 'fam-0000-0001' || f.created_by !== 'usr-0000-0001'
        );
        if (sanitized.length > 0) return sanitized;
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

  const [activeFamily, setActiveFamily] = useState<Family | null>(() => {
    const savedFamilyId = sessionStorage.getItem('active_family_id') || localStorage.getItem('hl_active_family_id');
    if (savedFamilyId) {
      const savedFamilies = localStorage.getItem('hl_families');
      const allFamilies: Family[] = savedFamilies ? JSON.parse(savedFamilies) : INITIAL_FAMILIES;
      const found = allFamilies.find((f) => f.id === savedFamilyId);
      if (found) return found;
    }
    return mockFamily;
  });

  const [activeMembership, setActiveMembership] = useState<FamilyMembership | null>(() => {
    return memberships[0] || null;
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
    const target = families.find((f) => f.id === familyId);
    if (target) {
      setActiveFamily(target);
      sessionStorage.setItem('active_family_id', target.id);
      localStorage.setItem('hl_active_family_id', target.id);
      
      const mem = memberships.find((m) => m.family_id === familyId && m.user_id === user?.id) || {
        id: `mem-${familyId}-${user?.id || 'usr'}`,
        family_id: familyId,
        user_id: user?.id || 'usr-0000-0001',
        role: 'OWNER' as MembershipRole,
        status: 'ACTIVE' as const,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setActiveMembership(mem);
    }
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
    const nextFamilies = families.map((f) => {
      if (f.id === familyId) {
        updatedTarget = {
          ...f,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return updatedTarget;
      }
      return f;
    });

    if (!updatedTarget) {
      // If not in state yet, update mockFamily
      updatedTarget = {
        ...mockFamily,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      nextFamilies.push(updatedTarget);
    }

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

    // ── PATH A: Supabase Auth thực (production/staging) ─────────────────
    if (isSupabaseConfigured()) {
      if (!password) {
        setIsLoading(false);
        return { success: false, activeFamily: null, isSuperAdmin: false };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setIsLoading(false);
        console.error('[Auth] Supabase signIn error:', error?.message);
        return { success: false, activeFamily: null, isSuperAdmin: false };
      }

      // Lấy profile từ DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const isSuper = (profile?.platform_role ?? '') === 'SUPER_ADMIN';
      setUser(profile ?? { id: data.user.id, email, full_name: email, created_at: '', updated_at: '' });
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
      }
      setIsLoading(false);
      return { success: true, activeFamily: firstFam, isSuperAdmin: isSuper };
    }

    // ── PATH B: DEV Mock (chỉ khi Supabase chưa cấu hình) ───────────────
    return _mockSignIn(email);
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
        isAuthenticated: Boolean(user),
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
