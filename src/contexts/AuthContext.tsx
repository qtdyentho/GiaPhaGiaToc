import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Family, FamilyMembership, MembershipRole } from '../types/database';
import { mockProfile, mockFamily, mockMemberships } from '../services/mockData';

export type PlatformRole = 'SUPER_ADMIN' | 'USER';

export interface UserFamilyContext {
  family: Family;
  membership: FamilyMembership;
}

interface AuthContextType {
  user: Profile | null;
  platformRole: PlatformRole;
  memberships: FamilyMembership[];
  activeFamily: Family | null;
  activeMembership: FamilyMembership | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isFamilyAdmin: boolean;
  switchFamily: (familyId: string) => void;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Available demo families for multi-family testing
const AVAILABLE_FAMILIES: Family[] = [
  mockFamily,
  {
    id: 'fam-0000-0002',
    name: 'Đại Tộc Trần Lê',
    code: 'TRAN-LE-HP',
    slug: 'tran-le-hai-phong',
    description: 'Dòng họ Trần Lê tại Thủy Nguyên, Hải Phòng.',
    origin_province: 'Hải Phòng',
    origin_district: 'Thủy Nguyên',
    origin_commune: 'Hoa Động',
    ancestral_hall_address: 'Thôn 3, Xã Hoa Động, Thủy Nguyên, Hải Phòng',
    created_by: 'usr-0000-0001',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(mockProfile);
  const [platformRole, setPlatformRole] = useState<PlatformRole>('USER');
  const [memberships, setMemberships] = useState<FamilyMembership[]>(mockMemberships);
  const [activeFamily, setActiveFamily] = useState<Family | null>(mockFamily);
  const [activeMembership, setActiveMembership] = useState<FamilyMembership | null>(mockMemberships[0] || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize and check saved family in session
  useEffect(() => {
    const savedFamilyId = sessionStorage.getItem('active_family_id');
    if (savedFamilyId) {
      const found = AVAILABLE_FAMILIES.find((f) => f.id === savedFamilyId);
      if (found) {
        setActiveFamily(found);
      }
    }
  }, []);

  const switchFamily = (familyId: string) => {
    const target = AVAILABLE_FAMILIES.find((f) => f.id === familyId);
    if (target) {
      setActiveFamily(target);
      sessionStorage.setItem('active_family_id', target.id);
      // Resolve membership in target family
      const mem = memberships.find((m) => m.family_id === familyId) || {
        id: `mem-${familyId}`,
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

  const signIn = async (email: string, _password?: string) => {
    setIsLoading(true);
    // If email is superadmin, grant platform role
    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('super')) {
      setPlatformRole('SUPER_ADMIN');
    } else {
      setPlatformRole('USER');
    }
    setUser({ ...mockProfile, email });
    setIsLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    setActiveFamily(null);
    setActiveMembership(null);
    setPlatformRole('USER');
    sessionStorage.removeItem('active_family_id');
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
        memberships,
        activeFamily,
        activeMembership,
        isAuthenticated: Boolean(user),
        isLoading,
        isSuperAdmin,
        isFamilyAdmin,
        switchFamily,
        signIn,
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
