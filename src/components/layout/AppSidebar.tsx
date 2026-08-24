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
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Bảng Điều Khiển' },
    ],
  },
  {
    title: 'PHẢ HỆ & THÀNH VIÊN',
    items: [
      { to: '/app/genealogy', icon: GitFork, label: 'Cây Gia Phả', badge: 'Interactive' },
      { to: '/app/members', icon: Users, label: 'Thành Viên Dòng Họ' },
    ],
  },
  {
    title: 'LỊCH & TƯỞNG NIỆM',
    items: [
      { to: '/app/calendar', icon: Calendar, label: 'Lịch Gia Tộc (Âm/Dương)' },
      { to: '/app/memorials', icon: Sparkles, label: 'Ngày Giỗ Tổ Tiên' },
      { to: '/app/events', icon: Landmark, label: 'Sự Kiện & Đại Lễ' },
      { to: '/app/reminders', icon: Settings, label: 'Cấu Hình Nhắc Lễ' },
    ],
  },
  {
    title: 'TÀI CHÍNH & SỔ QUỸ',
    items: [
      { to: '/app/finance', icon: Wallet, label: 'Tổng Quan Tài Chính' },
      { to: '/app/finance/ledger', icon: BookOpen, label: 'Sổ Quỹ Bất Biến' },
      { to: '/app/finance/income', icon: ReceiptText, label: 'Khoản Thu Định Mức' },
      { to: '/app/finance/expenses', icon: BadgePercent, label: 'Khoản Chi & Duyệt Chi' },
      { to: '/app/finance/contributions', icon: HeartHandshake, label: 'Đóng Góp & Tài Trợ' },
      { to: '/app/finance/honor-roll', icon: Trophy, label: 'Bảng Vàng Công Đức', badge: 'Vinh Danh' },
    ],
  },
  {
    title: 'DỊCH VỤ & THUÊ BAO',
    items: [
      { to: '/app/billing', icon: CreditCard, label: 'Gói Dịch Vụ Gia Tộc', badge: 'Gia Tộc' },
      { to: '/app/billing/usage', icon: ShieldCheck, label: 'Hạn Mức & Sử Dụng' },
      { to: '/app/billing/invoices', icon: ReceiptText, label: 'Lịch Sử Hóa Đơn' },
      { to: '/app/support', icon: LifeBuoy, label: 'Hỗ Trợ & Góp Ý', badge: 'Beta' },
    ],
  },
  {
    title: 'HỆ THỐNG & QUẢN TRỊ',
    items: [
      { to: '/app/family/settings', icon: Settings, label: 'Cài Đặt Gia Tộc' },
      { to: '/admin/payments', icon: Landmark, label: 'Duyệt Thanh Toán (Admin)', badge: 'Mới' },
      { to: '/admin/beta', icon: ShieldCheck, label: 'Trung Tâm Chỉ Huy Beta', badge: 'Beta' },
      { to: '/admin/revenue', icon: ShieldCheck, label: 'Quản Trị Doanh Thu' },
      { to: '/admin/billing/config', icon: Settings, label: 'Cấu Hình Tài Khoản Nhận' },
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

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[280px] bg-heritage-navy text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-700/60 bg-heritage-navy-dark">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-heritage-green flex items-center justify-center text-heritage-gold shadow-md font-bold text-lg border border-heritage-gold/30">
              GP
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-wide">{BRAND.name}</div>
              <div className="text-[10px] text-amber-300 font-medium tracking-tight">Heritage Ledger v2.0</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-heritage-green text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-heritage-gold text-slate-900 font-bold">
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

      {/* Subscription Status Card */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-amber-300 uppercase">Gói Gia Tộc</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded">
            Đang Hoạt Động
          </span>
        </div>
        <div className="text-xs text-slate-300 mb-2">
          86 / 300 Thành viên
        </div>
        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
          <div className="bg-heritage-gold h-full rounded-full" style={{ width: '28.6%' }}></div>
        </div>
        <NavLink
          to="/app/billing"
          className="flex items-center justify-center space-x-1 text-[11px] font-semibold text-white bg-heritage-green hover:bg-heritage-green-light py-1.5 rounded-lg transition"
        >
          <span>Quản lý thuê bao</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>
      </aside>
    </>
  );
};
