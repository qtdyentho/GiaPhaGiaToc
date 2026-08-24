import React from 'react';
import { NavLink } from 'react-router-dom';
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
  LifeBuoy
} from 'lucide-react';
import { BRAND } from '../../lib/constants';
import { UI_COPY } from '../../config/uiCopy';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
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
    title: 'GÓI DỊCH VỤ',
    items: [
      { to: '/app/billing', icon: CreditCard, label: UI_COPY.navigation.billing },
      { to: '/app/billing/usage', icon: ShieldCheck, label: UI_COPY.navigation.usage },
      { to: '/app/billing/invoices', icon: ReceiptText, label: UI_COPY.navigation.invoices },
      { to: '/app/support', icon: LifeBuoy, label: UI_COPY.navigation.support },
    ],
  },
  {
    title: 'HỆ THỐNG & QUẢN TRỊ',
    items: [
      { to: '/app/family/settings', icon: Settings, label: UI_COPY.navigation.settings },
      { to: '/admin/payments', icon: Landmark, label: UI_COPY.navigation.adminPayments },
      { to: '/admin/beta', icon: ShieldCheck, label: UI_COPY.navigation.adminOperations },
      { to: '/admin/revenue', icon: ShieldCheck, label: 'Báo Cáo Doanh Thu' },
      { to: '/admin/billing/config', icon: Settings, label: 'Tài Khoản Nhận Tiền' },
    ],
  },
];

export const AppSidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#1E3A5F] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-[#162D4A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#166534] flex items-center justify-center font-bold text-white shadow-sm text-sm border border-emerald-400/30">
              GP
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-tight font-sans">
                {BRAND.name}
              </span>
              <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase font-sans">
                Quản Trị Gia Tộc
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar font-sans">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold text-slate-300/80 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/app/dashboard'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-[#166534] text-white shadow-sm font-bold'
                            : 'text-slate-200 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-slate-300 group-hover:text-white" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / User Profile summary */}
        <div className="p-3 border-t border-white/10 bg-[#162D4A]/50 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                Trưởng Tộc
              </span>
              <span className="text-[10px] text-slate-300">
                Hội Đồng Gia Tộc
              </span>
            </div>
          </div>
          <NavLink
            to="/app/family/settings"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Cài đặt gia tộc"
          >
            <ChevronRight className="w-4 h-4" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
