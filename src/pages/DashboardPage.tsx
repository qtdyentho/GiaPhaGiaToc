import React from 'react';
import { Users, Landmark, Wallet, Calendar, ArrowUpRight, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LunarCalendarService } from '../services/LunarCalendarService';
import { formatCurrency, formatDate } from '../lib/utils';
import { mockFamily, mockMembers, mockFunds, mockMemorialDates, mockTransactions } from '../services/mockData';
import { Link } from 'react-router-dom';
import { UpcomingEventsWidget } from '../components/calendar/UpcomingEventsWidget';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const todayInfo = LunarCalendarService.getTodayInfo();
  
  const currentFamily = activeFamily || mockFamily;
  const familyFunds = mockFunds.filter((f) => f.family_id === currentFamily.id);
  const totalBalance = familyFunds.reduce((sum, f) => sum + Number(f.current_balance || 0), 0);
  const familyMembers = mockMembers.filter((m) => m.family_id === currentFamily.id);
  const familyMemorials = mockMemorialDates.filter((m) => m.family_id === currentFamily.id);
  const nextMemorial = familyMemorials[0] || mockMemorialDates[0];
  const familyTransactions = mockTransactions.filter((t) => t.family_id === currentFamily.id);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Top Banner: Lunar Calendar & Heritage Message */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#162D4A] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#C49A3A_2px,transparent_2px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gia Tộc Hưng Thịnh — Lưu Truyền Muôn Đời</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {currentFamily.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              {currentFamily.description} {currentFamily.origin_commune ? `• Nhà thờ tổ: ${currentFamily.origin_commune}, ${currentFamily.origin_district || ''}, ${currentFamily.origin_province}.` : ''}
            </p>
          </div>

          {/* Today Lunar Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0 text-right md:min-w-[220px]">
            <div className="text-xs text-amber-200 font-medium">Hôm nay ({todayInfo.solarDay}/{todayInfo.solarMonth}/{todayInfo.solarYear})</div>
            <div className="text-xl font-bold text-white mt-0.5">
              Ngày {todayInfo.lunarDay} Tháng {todayInfo.lunarMonth}
            </div>
            <div className="text-xs text-amber-300 font-medium mt-0.5">
              Năm {todayInfo.canChiYear} (Âm Lịch)
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Thành viên */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thành Viên Ghi Nhận</div>
            <div className="p-2 bg-emerald-50 text-[#166534] rounded-xl border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{familyMembers.length || (currentFamily.id === mockFamily.id ? 86 : 1)} <span className="text-xs font-normal text-slate-500 font-sans">thành viên</span></div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">Trực hệ</span>
            <span>• Dòng họ chính thống</span>
          </div>
        </div>

        {/* Stat 2: Quỹ gia tộc */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Số Dư Quỹ</div>
            <div className="p-2 bg-emerald-50 text-[#166534] rounded-xl border border-emerald-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{formatCurrency(totalBalance)}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">{familyFunds.length || 3} Quỹ</span>
            <span>• Sổ quỹ minh bạch</span>
          </div>
        </div>

        {/* Stat 3: Lễ giỗ gần nhất */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày Giỗ Gần Nhất</div>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 mt-2 truncate">
            {nextMemorial ? nextMemorial.title.replace('Lễ Giỗ: ', '') : 'Chưa có lịch giỗ'}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-amber-800 font-semibold">
              {nextMemorial ? `${nextMemorial.lunar_day}/${nextMemorial.lunar_month} Âm lịch` : '—'}
            </span>
          </div>
        </div>

        {/* Stat 4: Hoạt động dòng họ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hoạt Động / Bút Toán</div>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{familyTransactions.length || (currentFamily.id === mockFamily.id ? 24 : 0)} <span className="text-xs font-normal text-slate-500 font-sans">phát sinh</span></div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-blue-700 font-semibold">Minh bạch 100%</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fast Navigation & Recent Memorials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/app/genealogy"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#166534] shadow-xs hover:shadow-sm transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#166534] uppercase tracking-wider">Phả Hệ</div>
                <div className="text-base font-bold text-slate-900 group-hover:text-[#166534] transition">Cây Gia Phả Dòng Họ</div>
                <p className="text-xs text-slate-500">Tra cứu trực hệ và thông tin các thế hệ</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-[#166534] text-[#166534] group-hover:text-white flex items-center justify-center transition shrink-0 border border-emerald-200">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>

            <Link
              to="/app/finance"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#166534] shadow-xs hover:shadow-sm transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#166534] uppercase tracking-wider">Tài Chính</div>
                <div className="text-base font-bold text-slate-900 group-hover:text-[#166534] transition">Sổ Quỹ & Công Đức</div>
                <p className="text-xs text-slate-500">Theo dõi thu chi và bảng vàng vinh danh</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-[#166534] text-[#166534] group-hover:text-white flex items-center justify-center transition shrink-0 border border-emerald-200">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Sổ Quỹ Gia Tộc List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-[#166534]" />
                <span>Các Quỹ Đang Hoạt Động ({currentFamily.name})</span>
              </h2>
              <Link to="/app/finance" className="text-xs font-bold text-[#166534] hover:underline flex items-center space-x-1">
                <span>Xem chi tiết</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {familyFunds.map((fund) => (
                <div key={fund.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#166534] font-bold flex items-center justify-center text-sm">
                      {fund.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{fund.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{fund.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 font-mono">{formatCurrency(fund.current_balance)}</div>
                    <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200">
                      Khả dụng
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events & Memorials Widget */}
        <div className="space-y-6">
          <UpcomingEventsWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
