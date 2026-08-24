import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MembershipRole } from '../../types/database';

interface RoleGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  allowedRoles?: MembershipRole[];
  fallbackUrl?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requireSuperAdmin = false,
  allowedRoles,
  fallbackUrl = '/app/dashboard',
}) => {
  const { isSuperAdmin, activeMembership, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // If Super Admin is required
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mx-auto font-bold text-xl">
            ✕
          </div>
          <h2 className="text-lg font-bold text-slate-900">Truy Cập Bị Từ Chối (403)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn không có quyền quản trị nền tảng SaaS (Super Admin) để truy cập không gian này.
          </p>
          <a
            href="/app/dashboard"
            className="inline-block px-4 py-2 bg-[#166534] text-white text-xs font-bold rounded-xl hover:bg-[#14532d] transition"
          >
            Quay Về Trang Dòng Họ
          </a>
        </div>
      </div>
    );
  }

  // If specific membership roles are required
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = activeMembership?.role;
    const hasRole = currentRole && allowedRoles.includes(currentRole);
    if (!hasRole && !isSuperAdmin) {
      return <Navigate to={fallbackUrl} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;
