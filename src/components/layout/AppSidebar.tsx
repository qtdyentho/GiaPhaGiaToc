import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitFork,
  Users,
  Calendar,
  Sparkles,
  Wallet,
  BookOpen,
  CreditCard,
  Settings,
  ShieldCheck,
  ChevronRight,
  Landmark,
  BadgePercent,
  ReceiptText,
  HeartHandshake,
  Trophy,
  LifeBuoy,
  ShieldAlert,
  BarChart3,
  FileCheck2,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRightLeft,
} from 'lucide-react';
import { BRAND } from '../../lib/constants';
import { UI_COPY } from '../../config/uiCopy';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, isSuperAdmin, isFamilyAdmin, activeFamily, activeMembership } = useAuth();
  const location = useLocation();
  const isAdminSpace = location.pathname.startsWith('/admin');

  // 1. Super Admin Platform Navigation (ONLY in /admin space)
  const superAdminSections: NavSection[] = [
    {
      title: 'TỔNG QUAN NỀN TẢNG',
      items: [
        { to: '/admin/beta', icon: ShieldCheck, label: 'Kiểm Soát Vận Hành' },
        { to: '/admin/users', icon: Users, label: 'Tài Khoản Đăng Ký' },
        { to: '/admin/revenue', icon: BarChart3, label: 'Báo Cáo Doanh Thu' },
      ],
    },
    {
      title: 'THANH TOÁN & GÓI CƯỚC',
      items: [
        { to: '/admin/payments', icon: Landmark, label: 'Duyệt Chuyển Khoản' },
        { to: '/admin/billing/config', icon: Settings, label: 'Tài Khoản Nhận Tiền' },
        { to: '/admin/plans', icon: CreditCard, label: 'Cấu Hình Gói Dịch Vụ' },
        { to: '/admin/subscriptions', icon: ReceiptText, label: 'Danh Sách Thuê Bao' },
      ],
    },
    {
      title: 'GIÁM SÁT DỮ LIỆU',
      items: [
        { to: '/admin/integrity', icon: ShieldAlert, label: 'Giám Sát Toàn Vẹn' },
        { to: '/admin/reconciliation', icon: BookOpen, label: 'Đối Soát 3 Bên' },
        { to: '/admin/beta/evidence', icon: FileCheck2, label: 'Bằng Chứng Triển Khai' },
      ],
    },
  ];

  // 2. Family Admin / Owner Navigation (Trưởng tộc & Hội đồng quản trị dòng họ)
  const familyAdminSections: NavSection[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { to: '/app/dashboard', icon: LayoutDashboard, label: UI_COPY.navigation.overview },
      ],
    },
    {
      title: 'PHẢ HỆ & THÀNH VIÊN',
      items: [
        { to: '/app/genealogy', icon: GitFork, label: UI_COPY.navigation.genealogy },
        { to: '/app/members', icon: Users, label: UI_COPY.navigation.members },
        { to: '/app/kinship', icon: ArrowRightLeft, label: 'Tra Cứu Danh Xưng (Xưng Hô)' },
      ],
    },
    {
      title: 'LỊCH & TƯỞNG NIỆM',
      items: [
        { to: '/app/calendar', icon: Calendar, label: UI_COPY.navigation.calendar },
        { to: '/app/memorials', icon: Sparkles, label: UI_COPY.navigation.memorials },
        { to: '/app/events', icon: Landmark, label: UI_COPY.navigation.events },
        { to: '/app/reminders', icon: Settings, label: UI_COPY.navigation.reminders },
      ],
    },
    {
      title: 'TÀI CHÍNH & SỔ QUỸ',
      items: [
        { to: '/app/finance', icon: Wallet, label: UI_COPY.navigation.financeOverview },
        { to: '/app/finance/ledger', icon: BookOpen, label: UI_COPY.navigation.fundLedger },
        { to: '/app/finance/income', icon: ReceiptText, label: UI_COPY.navigation.income },
        { to: '/app/finance/expenses', icon: BadgePercent, label: UI_COPY.navigation.expenses },
        { to: '/app/finance/contributions', icon: HeartHandshake, label: UI_COPY.navigation.contributions },
        { to: '/app/finance/honor-roll', icon: Trophy, label: UI_COPY.navigation.honorRoll },
      ],
    },
    {
      title: 'GÓI DỊCH VỤ & CÀI ĐẶT',
      items: [
        { to: '/app/billing', icon: CreditCard, label: UI_COPY.navigation.billing },
        { to: '/app/billing/usage', icon: ShieldCheck, label: UI_COPY.navigation.usage },
        { to: '/app/billing/invoices', icon: ReceiptText, label: UI_COPY.navigation.invoices },
        { to: '/app/family/settings', icon: Settings, label: UI_COPY.navigation.settings },
        { to: '/app/support', icon: LifeBuoy, label: UI_COPY.navigation.support },
      ],
    },
  ];

  // 3. Family Member Navigation (Thành viên bà con xem phả hệ & công đức)
  const familyMemberSections: NavSection[] = [
    {
      title: 'TRANG CHỦ',
      items: [
        { to: '/app/dashboard', icon: LayoutDashboard, label: 'Trang Chủ Dòng Họ' },
      ],
    },
    {
      title: 'PHẢ HỆ & BÀ CON',
      items: [
        { to: '/app/genealogy', icon: GitFork, label: 'Xem Cây Gia Phả' },
        { to: '/app/members', icon: Users, label: 'Danh Sách Bà Con' },
        { to: '/app/kinship', icon: ArrowRightLeft, label: 'Tra Cứu Xưng Hô' },
      ],
    },
    {
      title: 'LỊCH TỘC & GIỖ TẾ',
      items: [
        { to: '/app/calendar', icon: Calendar, label: 'Lịch Gia Tộc' },
        { to: '/app/memorials', icon: Sparkles, label: 'Ngày Giỗ Thân Nhân' },
        { to: '/app/events', icon: Landmark, label: 'Sự Kiện & Đại Lễ' },
      ],
    },
    {
      title: 'CÔNG ĐỨC & TRI ÂN',
      items: [
        { to: '/app/finance/contributions', icon: HeartHandshake, label: 'Đóng Góp Công Đức' },
        { to: '/app/finance/honor-roll', icon: Trophy, label: 'Bảng Vàng Công Đức' },
      ],
    },
    {
      title: 'HỖ TRỢ & HƯỚNG DẪN',
      items: [
        { to: '/app/support', icon: LifeBuoy, label: 'Hỗ Trợ & Góp Ý' },
      ],
    },
  ];

  // Strictly route sections by current space and role
  const activeSections = isAdminSpace
    ? superAdminSections
    : isFamilyAdmin
    ? familyAdminSections
    : familyMemberSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[#1E3A5F] text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl ${
          isOpen
            ? 'translate-x-0 w-64'
            : isCollapsed
            ? 'max-lg:-translate-x-full lg:w-20 lg:translate-x-0'
            : 'translate-x-0 w-64 max-lg:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 px-3 flex items-center border-b border-white/10 bg-[#162D4A] shrink-0 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-[#166534] flex items-center justify-center font-bold text-white shadow-xs text-sm border border-emerald-400/30 hover:scale-105 transition cursor-pointer group relative"
              title="Nhấn để mở rộng Menu"
            >
              <span>GP</span>
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-amber-300 text-xs font-bold rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 border border-slate-700">
                Mở rộng Menu (Gia Phả Gia Tộc)
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#166534] flex items-center justify-center font-bold text-white shadow-xs text-sm border border-emerald-400/30 shrink-0">
                  GP
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-sm tracking-tight text-white leading-tight font-sans truncate">
                    {BRAND.name}
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase font-sans truncate">
                    {isAdminSpace ? 'Quản Trị Nền Tảng' : isFamilyAdmin ? (activeFamily?.name || 'Quản Trị Dòng Họ') : 'Không Gian Gia Tộc'}
                  </span>
                </div>
              </div>

              {/* Close / Collapse Button */}
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose?.();
                  } else {
                    onToggleCollapse?.();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                title="Ẩn thanh điều hướng (Thu gọn thành Icon)"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-4 space-y-3' : 'px-3 py-4 space-y-6'} custom-scrollbar font-sans`}>
          {activeSections.map((section, idx) => (
            <div key={idx} className={isCollapsed ? 'space-y-1' : 'space-y-1'}>
              {!isCollapsed ? (
                <h3 className="px-3 text-[11px] font-bold text-slate-300/80 uppercase tracking-wider">
                  {section.title}
                </h3>
              ) : idx > 0 ? (
                <div className="border-t border-white/10 my-2 mx-1" />
              ) : null}

              <div className="space-y-1 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/app/dashboard' || item.to === '/admin/beta'}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose?.();
                      }}
                      className={({ isActive }) =>
                        isCollapsed
                          ? `relative group flex items-center justify-center w-12 h-11 mx-auto rounded-xl transition-all ${
                              isActive
                                ? 'bg-[#166534] text-white shadow-md border border-emerald-400/40 font-bold'
                                : 'text-slate-200 hover:text-white hover:bg-white/10'
                            }`
                          : `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                              isActive
                                ? 'bg-[#166534] text-white shadow-xs font-bold'
                                : 'text-slate-200 hover:text-white hover:bg-white/10'
                            }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isCollapsed ? (
                            <>
                              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                              {item.badge && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 border-2 border-[#1E3A5F] rounded-full" />
                              )}
                              {/* Hover Floating Tooltip */}
                              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 border border-slate-700 flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500 text-amber-950">
                                    {item.badge}
                                  </span>
                                )}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-slate-300 group-hover:text-white" />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-white/20 text-white">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / User Profile summary */}
        <div
          className={`p-3 border-t border-white/10 bg-[#162D4A]/60 flex items-center text-xs font-sans shrink-0 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="absolute left-full ml-3 bottom-0 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 border border-slate-700">
                <div className="font-bold text-white">{user?.full_name || 'Người dùng'}</div>
                <div className="text-[10px] text-amber-300">
                  {isAdminSpace ? 'Super Admin' : activeMembership?.role === 'OWNER' ? 'Trưởng Tộc' : isFamilyAdmin ? 'Hội Đồng Dòng Họ' : 'Thành Viên'}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-[11px] truncate">
                    {user?.full_name || 'Người dùng'}
                  </span>
                  <span className="text-[10px] text-slate-300 truncate">
                    {isAdminSpace ? 'Super Admin' : activeMembership?.role === 'OWNER' ? 'Trưởng Tộc' : isFamilyAdmin ? 'Hội Đồng Dòng Họ' : 'Thành Viên'}
                  </span>
                </div>
              </div>
              {isFamilyAdmin && !isAdminSpace && (
                <NavLink
                  to="/app/family/settings"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition shrink-0"
                  title="Cài đặt gia tộc"
                >
                  <ChevronRight className="w-4 h-4" />
                </NavLink>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
