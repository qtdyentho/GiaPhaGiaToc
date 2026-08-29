import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Calendar,
  ChevronDown,
  User,
  Shield,
  Check,
  LogOut,
  Settings,
  Sparkles,
  X,
  ArrowUpRight,
  DollarSign,
  Users,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  Sun,
  Moon,
  QrCode,
  Building,
  Plus,
  Landmark,
} from 'lucide-react';
import { LunarCalendarService } from '../../services/LunarCalendarService';
import { ShortLinkService } from '../../services/security/ShortLinkService';
import { ClanPassService } from '../../services/security/ClanPassService';
import { GenealogyService } from '../../services/GenealogyService';
import { FundService } from '../../services/FundService';
import { MemorialService } from '../../services/calendar/MemorialService';
import { ReminderService } from '../../services/calendar/ReminderService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';
import { CreateBroadcastModal } from '../notifications/CreateBroadcastModal';
import { PrintableClanQRCodeModal } from '../family/PrintableClanQRCodeModal';

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
  const {
    user,
    activeFamily,
    activeMembership,
    isSuperAdmin,
    isFamilyAdmin,
    signOut,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const todayInfo = LunarCalendarService.getTodayInfo();
  const navigate = useNavigate();

  // Dropdown states
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [shortCode, setShortCode] = useState<string>('');
  const [passToken, setPassToken] = useState<string>('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load Clan QR and Link
  useEffect(() => {
    async function loadQR() {
      if (activeFamily?.id) {
        const config = await ClanPassService.getFamilyPassConfig(activeFamily.id);
        if (config?.pass_token) setPassToken(config.pass_token);
        const link = await ShortLinkService.getShortLinkByFamily(activeFamily.id);
        if (link?.short_code) setShortCode(link.short_code);
      }
    }
    loadQR();
  }, [activeFamily?.id]);

  // Keyboard shortcut (Ctrl+K / Cmd+K) for quick search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearching(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Notifications Data strictly scoped to activeFamily
  const currentFamId = activeFamily?.id || '';
  const currentFamName = activeFamily?.name || 'Gia Tộc';

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!currentFamId) {
        setNotifications([]);
        return;
      }
      try {
        const notifs = await ReminderService.getNotifications(currentFamId);
        if (notifs && notifs.length > 0) {
          setNotifications(
            notifs.slice(0, 5).map((n) => ({
              id: n.id,
              title: n.title,
              message: n.content,
              time: 'Mới nhận',
              type: n.type === 'MEMORIAL_REMINDER' ? 'MEMORIAL' : 'FINANCE',
              unread: !n.is_read,
              link: n.reference_type === 'MEMORIAL' ? '/app/calendar' : '/app/finance',
            }))
          );
        } else {
          setNotifications([
            {
              id: 'notif-welcome',
              title: 'Không Gian Gia Tộc',
              message: `Chào mừng bạn đến với không gian số ${currentFamName}.`,
              time: 'Hôm nay',
              type: 'MEMORIAL',
              unread: false,
              link: '/app/dashboard',
            },
          ]);
        }
      } catch {
        setNotifications([]);
      }
    }
    loadNotifications();
  }, [currentFamId, currentFamName]);

  // Debounced search with real database services
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const query = searchQuery.toLowerCase();
      const results: SearchResultItem[] = [];
      const currentFamId = activeFamily?.id || '';

      if (!currentFamId) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const [members, memorials, funds] = await Promise.all([
          GenealogyService.getMembers(currentFamId),
          MemorialService.getMemorials(currentFamId),
          FundService.getFunds(currentFamId),
        ]);

        // 1. Search Members
        const memList = members || [];
        memList
          .filter((m) => m.full_name.toLowerCase().includes(query) || (m.bio && m.bio.toLowerCase().includes(query)))
          .slice(0, 4)
          .forEach((m) => {
            results.push({
              id: m.id,
              type: 'MEMBER',
              title: m.full_name,
              subtitle: `Thành viên • ${m.life_status === 'DECEASED' ? 'Đã mất' : 'Còn sống'}`,
              link: `/app/genealogy?member=${m.id}`,
            });
          });

        // 2. Search Memorial Dates
        const memorialList = memorials || [];
        memorialList
          .filter((m) => m.title.toLowerCase().includes(query))
          .slice(0, 3)
          .forEach((m) => {
            results.push({
              id: m.id,
              type: 'MEMORIAL',
              title: m.title,
              subtitle: `Ngày Giỗ • ${m.lunar_day}/${m.lunar_month} Âm lịch`,
              link: '/app/calendar',
            });
          });

        // 3. Search Funds
        const fundList = funds || [];
        fundList
          .filter((f) => f.name.toLowerCase().includes(query))
          .slice(0, 2)
          .forEach((f) => {
            results.push({
              id: f.id,
              type: 'FUND',
              title: f.name,
              subtitle: `Quỹ Gia Tộc • Số dư: ${formatCurrency(f.current_balance)}`,
              link: '/app/finance',
            });
          });

        setSearchResults(results);
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFamily]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Quản Trị Tối Cao (Super Admin)';
    if (activeMembership?.role === 'OWNER' || (activeFamily && user && activeFamily.created_by === user.id)) return 'Trưởng Tộc / Quản Trị';
    if (activeMembership?.role === 'ADMIN') return 'Quản Trị Viên';
    if (activeMembership?.role === 'TREASURER') return 'Thủ Quỹ';
    if (activeMembership?.role === 'APPROVER') return 'Kế Toán / Kiểm Soát';
    if (activeMembership?.role === 'GENEALOGY_ADMIN') return 'Ban Trị Sự Phả Hệ';
    if (isFamilyAdmin) return 'Ban Quản Trị';
    return 'Thành Viên Gia Tộc';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs font-sans transition-colors duration-200 min-w-0">
      
      {/* ── LEFT ZONE: Sidebar Toggle + Clan Switcher Dropdown + Mini Lunar Badge ── */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 1024) {
              onMenuToggle?.();
            } else {
              onToggleCollapse?.();
            }
          }}
          aria-label={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#166534] dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
          title={isSidebarCollapsed ? 'Mở rộng Menu' : 'Thu gọn / Ẩn Menu'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-[#166534] dark:text-emerald-400" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Official Clan Identity Badge (Single Family Model) */}
        <Link
          to="/app/family/settings"
          className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-slate-800/90 hover:bg-emerald-100 dark:hover:bg-slate-800 border border-emerald-200/90 dark:border-slate-700 transition cursor-pointer text-left shadow-2xs max-w-[200px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[380px] group"
          title="Thông Tin & Cài Đặt Dòng Họ"
        >
          <div className="w-6 h-6 rounded-lg bg-[#166534] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 truncate">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <span className="truncate">{activeFamily?.name || 'ĐẠI TỘC GIA PHẢ'}</span>
              {activeFamily?.origin_province && (
                <span className="hidden sm:inline text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold opacity-90">
                  ({activeFamily.origin_province})
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Minimalist Lunar Calendar Badge (Desktop only) */}
        <Link
          to="/app/calendar"
          aria-label={`Lịch âm hôm nay ${todayInfo.lunarDay}/${todayInfo.lunarMonth} năm ${todayInfo.canChiYear}`}
          title="Bấm để mở Lịch Gia Tộc & Ngày Giỗ Vạn Niên"
          className="hidden 2xl:flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 transition shadow-2xs shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {todayInfo.solarDay}/{todayInfo.solarMonth}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
            Âl {todayInfo.lunarDay}/{todayInfo.lunarMonth} ({todayInfo.canChiYear})
          </span>
        </Link>
      </div>

      {/* ── CENTER ZONE: Clean Command Search Bar ── */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-3 sm:mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setIsSearching(true);
            }}
            aria-label="Tìm nhanh thành viên, ngày giỗ, sổ quỹ"
            placeholder="Tìm nhanh bà con, ngày giỗ, sổ quỹ..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-slate-900 transition shadow-2xs"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setIsSearching(false);
              }}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none shadow-2xs">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearching && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
            <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                  className="px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs transition group block"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'MEMBER' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' :
                      item.type === 'MEMORIAL' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' :
                      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {item.type === 'MEMBER' && <Users className="w-3.5 h-3.5" />}
                      {item.type === 'MEMORIAL' && <Sparkles className="w-3.5 h-3.5" />}
                      {item.type === 'FUND' && <DollarSign className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition truncate max-w-[200px]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{item.subtitle}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {isSearching && searchQuery.trim() && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 text-center text-xs text-slate-400 dark:text-slate-500">
            Không tìm thấy thông tin phù hợp với "{searchQuery}"
          </div>
        )}
      </div>

      {/* ── RIGHT ZONE: Utilities (QR, Theme, Notifs) + User Profile ── */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        
        {/* QR Code Từ Đường */}
        {activeFamily && (
          <button
            type="button"
            onClick={() => setIsQRModalOpen(true)}
            aria-label="Mã QR Dòng Họ & Link Rút Gọn"
            title="Mở & In Mã QR Dòng Họ Dán Từ Đường"
            className="w-9 h-9 text-slate-600 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-300 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </button>
        )}

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          title={isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}
          className="w-9 h-9 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            aria-label="Thông báo dòng họ"
            aria-haspopup="true"
            aria-expanded={isNotificationOpen}
            title="Thông báo dòng họ"
            className="w-9 h-9 text-slate-500 dark:text-slate-400 hover:text-[#166534] dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl relative transition cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <span>Thông Báo Gia Tộc</span>
                    <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold">2 mới</span>
                  </div>
                  <span className="text-[11px] text-[#166534] dark:text-emerald-400 font-medium cursor-pointer hover:underline">
                    Đã đọc tất cả
                  </span>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      onClick={() => setIsNotificationOpen(false)}
                      className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-start space-x-3 transition block ${
                        notif.unread ? 'bg-emerald-50/40 dark:bg-emerald-950/40' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'MEMORIAL' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                        notif.type === 'FINANCE' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                        'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}>
                        {notif.type === 'MEMORIAL' && <Sparkles className="w-4 h-4" />}
                        {notif.type === 'FINANCE' && <DollarSign className="w-4 h-4" />}
                        {notif.type === 'EXPENSE' && <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span className="truncate">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {isFamilyAdmin && (
                  <div className="p-2 bg-amber-50/70 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        setIsBroadcastModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Phát Thông Báo Đẩy Sự Kiện</span>
                    </button>
                  </div>
                )}

                <div className="p-2 text-center">
                  <Link
                    to="/app/notifications"
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline block py-1"
                  >
                    Xem tất cả thông báo & nhắc nhở →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none"
            title="Hồ sơ tài khoản"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden xl:block text-left pr-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight max-w-[120px] truncate">{user?.full_name || 'Khách'}</div>
              <div className="text-[10px] font-semibold text-amber-800 dark:text-amber-400">{getRoleLabel()}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block transition-transform shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-2.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.full_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-1 text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md font-bold inline-block">
                    {getRoleLabel()}
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    to="/app/members/me"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Hồ Sơ Của Tôi</span>
                  </Link>

                  {isFamilyAdmin && (
                    <Link
                      to="/app/family/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>Cài Đặt Dòng Họ</span>
                    </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      to="/admin/beta"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-2 font-bold"
                    >
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Quản Trị Hệ Thống Nền Tảng</span>
                    </Link>
                  )}
                </div>

                <div className="p-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3.5 py-2 text-left text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
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

      {/* Modal Phát Thông Báo Đẩy Sự Kiện */}
      <CreateBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* Modal Mã QR Dòng Họ */}
      {activeFamily && (
        <PrintableClanQRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          family={activeFamily}
          passToken={passToken}
          shortCode={shortCode}
        />
      )}
    </header>
  );
};

export default AppHeader;
