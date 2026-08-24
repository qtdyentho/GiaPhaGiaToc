import React, { useState } from 'react';
import { Bell, Search, Calendar, ChevronDown, User, Shield, Menu, Check, LogOut, Settings, ExternalLink } from 'lucide-react';
import { LunarCalendarService } from '../../services/LunarCalendarService';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const AppHeader: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { user, activeFamily, activeMembership, isSuperAdmin, isFamilyAdmin, switchFamily, signOut } = useAuth();
  const todayInfo = LunarCalendarService.getTodayInfo();
  const navigate = useNavigate();

  const [isFamilyMenuOpen, setIsFamilyMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Quản Trị Nền Tảng (Super Admin)';
    if (activeMembership?.role === 'OWNER') return 'Trưởng Tộc (Chủ Quản)';
    if (isFamilyAdmin) return 'Hội Đồng Quản Trị Gia Tộc';
    return 'Thành Viên Dòng Họ';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs font-sans">
      {/* Left: Mobile Toggle & Active Family & Lunar Widget */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-600 hover:text-heritage-green hover:bg-slate-100 rounded-lg transition"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Family Switcher */}
        <div className="relative">
          <div
            onClick={() => setIsFamilyMenuOpen(!isFamilyMenuOpen)}
            className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition select-none shadow-2xs"
          >
            <Shield className="w-4 h-4 text-[#166534]" />
            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[200px] block leading-tight">
                {activeFamily?.name || 'Chưa chọn dòng họ'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
                {activeFamily?.code || 'Gia Tộc'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isFamilyMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Family Dropdown Menu */}
          {isFamilyMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsFamilyMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100">
                <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Dòng họ bạn quản lý & tham gia
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      switchFamily('fam-0000-0001');
                      setIsFamilyMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-emerald-50/70 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#166534]">Đại Tộc Nguyễn Văn</div>
                      <div className="text-[10px] text-slate-400">NGUYEN-VAN-HN • Định Công, Hà Nội</div>
                    </div>
                    {activeFamily?.id === 'fam-0000-0001' && <Check className="w-4 h-4 text-[#166534]" />}
                  </button>

                  <button
                    onClick={() => {
                      switchFamily('fam-0000-0002');
                      setIsFamilyMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-emerald-50/70 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-[#166534]">Đại Tộc Trần Lê</div>
                      <div className="text-[10px] text-slate-400">TRAN-LE-HP • Thủy Nguyên, Hải Phòng</div>
                    </div>
                    {activeFamily?.id === 'fam-0000-0002' && <Check className="w-4 h-4 text-[#166534]" />}
                  </button>
                </div>
                <div className="p-2">
                  <Link
                    to="/onboarding/create-family"
                    onClick={() => setIsFamilyMenuOpen(false)}
                    className="w-full text-center px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl block transition border border-slate-200"
                  >
                    + Tạo lập Dòng Họ Mới
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Lunar Date Pill */}
        <div className="hidden md:flex items-center space-x-2 bg-amber-50/80 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-medium text-amber-900 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>Hôm nay: {todayInfo.solarDay}/{todayInfo.solarMonth}/{todayInfo.solarYear}</span>
          <span className="text-amber-400">•</span>
          <span className="font-bold text-[#166534]">Âm lịch: {todayInfo.lunarDay}/{todayInfo.lunarMonth} ({todayInfo.canChiYear})</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Search */}
        <div className="relative hidden md:block w-44 lg:w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm thành viên, ngày giỗ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
        </div>

        {/* Notifications */}
        <Link
          to="/app/notifications"
          title="Thông báo"
          className="p-2 text-slate-500 hover:text-[#166534] hover:bg-slate-100 rounded-xl relative transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Link>

        {/* User Profile */}
        <div className="relative">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200 cursor-pointer select-none"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#166534] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-300">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name || 'Khách'}</div>
              <div className="text-[10px] font-semibold text-amber-800">{getRoleLabel()}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100">
                <div className="px-4 py-2.5">
                  <div className="text-xs font-bold text-slate-900">{user?.full_name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-1 text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold inline-block">
                    {getRoleLabel()}
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    to="/app/members/me"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Hồ Sơ Của Tôi</span>
                  </Link>

                  {isFamilyAdmin && (
                    <Link
                      to="/app/family/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Cài Đặt Dòng Họ</span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      to="/admin/beta"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-bold"
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Chuyển Sang Quản Trị SaaS</span>
                    </Link>
                  )}
                </div>

                <div className="p-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3.5 py-2 text-left text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
