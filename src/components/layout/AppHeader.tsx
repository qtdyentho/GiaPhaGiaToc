import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Search, Calendar, ChevronDown, User, Shield, Menu, Check, 
  LogOut, Settings, Sparkles, X, ArrowUpRight, DollarSign, Users, Clock,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { LunarCalendarService } from '../../services/LunarCalendarService';
import { useAuth } from '../../contexts/AuthContext';
import { mockMembers, mockMemorialDates, mockFunds } from '../../services/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';

interface SearchResultItem {
  id: string;
  type: 'MEMBER' | 'MEMORIAL' | 'FUND';
  title: string;
  subtitle: string;
  link: string;
}

interface AppHeaderProps {
  onMenuToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuToggle,
  isSidebarCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, families, activeFamily, activeMembership, isSuperAdmin, isFamilyAdmin, switchFamily, signOut } = useAuth();
  const todayInfo = LunarCalendarService.getTodayInfo();
  const navigate = useNavigate();

  const [isFamilyMenuOpen, setIsFamilyMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notifications Data
  const sampleNotifications = [
    {
      id: 'notif-1',
      title: 'Lễ Giỗ Sắp Diễn Ra',
      message: 'Lễ giỗ Cụ Thủy Tổ Nguyễn Văn Phúc diễn ra vào ngày 15/7 Âm lịch (còn 3 ngày).',
      time: '10 phút trước',
      type: 'MEMORIAL',
      unread: true,
      link: '/app/calendar',
    },
    {
      id: 'notif-2',
      title: 'Đóng Góp Công Đức Mới',
      message: 'Nguyễn Văn Hoàng vừa đóng góp 10.000.000 ₫ vào Quỹ Tu Bổ Từ Đường.',
      time: '2 giờ trước',
      type: 'FINANCE',
      unread: true,
      link: '/app/finance/honor-roll',
    },
    {
      id: 'notif-3',
      title: 'Phiếu Chi Chờ Phê Duyệt',
      message: 'Phiếu chi 5.000.000 ₫ mua hương hoa lễ vật đang chờ Hội đồng duyệt.',
      time: '1 ngày trước',
      type: 'EXPENSE',
      unread: false,
      link: '/app/finance/expenses',
    },
  ];

  // Perform search across active family scope
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results: SearchResultItem[] = [];
    const currentFamId = activeFamily?.id || 'fam-0000-0001';

    // 1. Search Members
    const familyMembers = mockMembers.filter(m => m.family_id === currentFamId);
    familyMembers
      .filter(m => m.full_name.toLowerCase().includes(query) || (m.bio && m.bio.toLowerCase().includes(query)))
      .slice(0, 4)
      .forEach(m => {
        results.push({
          id: m.id,
          type: 'MEMBER',
          title: m.full_name,
          subtitle: `Thành viên • ${m.life_status === 'DECEASED' ? 'Đã mất' : 'Còn sống'}`,
          link: `/app/genealogy?member=${m.id}`,
        });
      });

    // 2. Search Memorial Dates
    const familyMemorials = mockMemorialDates.filter(m => m.family_id === currentFamId);
    familyMemorials
      .filter(m => m.title.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach(m => {
        results.push({
          id: m.id,
          type: 'MEMORIAL',
          title: m.title,
          subtitle: `Ngày Giỗ • ${m.lunar_day}/${m.lunar_month} Âm lịch`,
          link: '/app/calendar',
        });
      });

    // 3. Search Funds
    const familyFunds = mockFunds.filter(f => f.family_id === currentFamId);
    familyFunds
      .filter(f => f.name.toLowerCase().includes(query))
      .slice(0, 2)
      .forEach(f => {
        results.push({
          id: f.id,
          type: 'FUND',
          title: f.name,
          subtitle: `Quỹ Gia Tộc • Số dư: ${formatCurrency(f.current_balance)}`,
          link: '/app/finance',
        });
      });

    setSearchResults(results);
  }, [searchQuery, activeFamily]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      {/* Left: Menu Toggle & Active Family & Lunar Widget */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Toggle Sidebar Button (Desktop & Mobile) */}
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              onMenuToggle?.();
            } else {
              onToggleCollapse?.();
            }
          }}
          className="p-2 text-slate-600 hover:text-[#166534] hover:bg-emerald-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-200 shadow-2xs"
          title={isSidebarCollapsed ? 'Mở rộng Menu' : 'Thu gọn / Ẩn Menu'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-[#166534]" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600" />
          )}
          <span className="text-xs font-bold hidden xl:inline text-slate-700">
            {isSidebarCollapsed ? 'Hiện Menu' : 'Ẩn Menu'}
          </span>
        </button>

        {/* Dynamic Family Switcher */}
        <div className="relative">
          <div
            onClick={() => setIsFamilyMenuOpen(!isFamilyMenuOpen)}
            className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition select-none shadow-2xs"
          >
            <Shield className="w-4 h-4 text-[#166534] shrink-0" />
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
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100">
                <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Dòng họ của bạn ({families.length})</span>
                  <span className="text-[10px] text-[#166534] font-semibold">Chuyển đổi tức thì</span>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {families.map((fam) => (
                    <button
                      key={fam.id}
                      onClick={() => {
                        switchFamily(fam.id);
                        setIsFamilyMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs hover:bg-emerald-50/70 flex items-center justify-between transition group cursor-pointer ${
                        activeFamily?.id === fam.id ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <div className="pr-2 truncate">
                        <div className={`font-bold truncate ${activeFamily?.id === fam.id ? 'text-[#166534]' : 'text-slate-900 group-hover:text-[#166534]'}`}>
                          {fam.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {fam.code} • {fam.origin_commune ? `${fam.origin_commune}, ` : ''}{fam.origin_province}
                        </div>
                      </div>
                      {activeFamily?.id === fam.id && <Check className="w-4 h-4 text-[#166534] shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="p-2">
                  <Link
                    to="/onboarding/create-family"
                    onClick={() => setIsFamilyMenuOpen(false)}
                    className="w-full text-center px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl block transition border border-emerald-200"
                  >
                    + Khởi Tạo Dòng Họ Mới
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Interactive Lunar Date Pill */}
        <Link
          to="/app/calendar"
          title="Bấm để xem chi tiết Lịch Gia Tộc & Ngày Giỗ"
          className="hidden md:flex items-center space-x-2 bg-amber-50/80 hover:bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-medium text-amber-900 shadow-2xs transition group"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition" />
          <span>Hôm nay: {todayInfo.solarDay}/{todayInfo.solarMonth}/{todayInfo.solarYear}</span>
          <span className="text-amber-400">•</span>
          <span className="font-bold text-[#166534]">Âm lịch: {todayInfo.lunarDay}/{todayInfo.lunarMonth} ({todayInfo.canChiYear})</span>
        </Link>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Interactive Real-Time Search */}
        <div ref={searchContainerRef} className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setIsSearching(true);
            }}
            placeholder="Tìm thành viên, ngày giỗ..."
            className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setIsSearching(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100 max-h-80 overflow-y-auto">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Kết quả tìm kiếm ({searchResults.length})
              </div>
              <div className="py-1">
                {searchResults.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.link}
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery('');
                    }}
                    className="px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition group block"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'MEMBER' ? 'bg-blue-50 text-blue-700' :
                        item.type === 'MEMORIAL' ? 'bg-amber-50 text-amber-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.type === 'MEMBER' && <Users className="w-3.5 h-3.5" />}
                        {item.type === 'MEMORIAL' && <Sparkles className="w-3.5 h-3.5" />}
                        {item.type === 'FUND' && <DollarSign className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-[#166534] transition truncate max-w-[150px]">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#166534] transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 text-center text-xs text-slate-400">
              Không tìm thấy thông tin phù hợp với "{searchQuery}"
            </div>
          )}
        </div>

        {/* Interactive Notifications Bell Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            title="Thông báo dòng họ"
            className="p-2 text-slate-500 hover:text-[#166534] hover:bg-slate-100 rounded-xl relative transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>Thông Báo Gia Tộc</span>
                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">2 mới</span>
                  </div>
                  <span className="text-[11px] text-[#166534] font-medium cursor-pointer hover:underline">
                    Đã đọc tất cả
                  </span>
                </div>

                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {sampleNotifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      onClick={() => setIsNotificationOpen(false)}
                      className={`p-3 hover:bg-slate-50 flex items-start space-x-3 transition block ${
                        notif.unread ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'MEMORIAL' ? 'bg-amber-100 text-amber-800' :
                        notif.type === 'FINANCE' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notif.type === 'MEMORIAL' && <Sparkles className="w-4 h-4" />}
                        {notif.type === 'FINANCE' && <DollarSign className="w-4 h-4" />}
                        {notif.type === 'EXPENSE' && <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span className="truncate">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="p-2 text-center">
                  <Link
                    to="/app/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-xs font-bold text-[#166534] hover:underline block py-1"
                  >
                    Xem tất cả thông báo & nhắc nhở →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
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
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100">
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
                      <span>Cài Đặt Dòng Họ ({activeFamily?.name})</span>
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
                    className="w-full px-3.5 py-2 text-left text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
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
