import React from 'react';
import { Users, Landmark, Wallet, Calendar, ArrowUpRight, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LunarCalendarService } from '../services/LunarCalendarService';
import { formatCurrency } from '../lib/utils';
import { mockFamily, mockMembers, mockFunds, mockMemorialDates, mockTransactions } from '../services/mockData';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const todayInfo = LunarCalendarService.getTodayInfo();
  const nextMemorial = mockMemorialDates[0];
  const totalBalance = mockFunds.reduce((sum, f) => sum + f.current_balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Lunar Calendar & Heritage Message */}
      <div className="bg-gradient-to-r from-heritage-navy to-heritage-navy-light text-white p-6 rounded-2xl shadow-heritage relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#C49A3A_2px,transparent_2px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-heritage-gold/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gia Tộc Hưng Thịnh — Lưu Truyền Muôn Đời</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {mockFamily.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              {mockFamily.description} • Nhà thờ tổ: {mockFamily.origin_commune}, {mockFamily.origin_district}, {mockFamily.origin_province}.
            </p>
          </div>

          {/* Today Lunar Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl shrink-0 text-right md:min-w-[220px]">
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-heritage transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500 uppercase">Thành Viên Ghi Nhận</div>
            <div className="p-2 bg-emerald-50 text-heritage-green rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">86 <span className="text-xs font-normal text-slate-500">người</span></div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-600 font-semibold">5 Thế hệ</span>
            <span>• 3 Chi phái</span>
          </div>
        </div>

        {/* Stat 2: Quỹ gia tộc */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-heritage transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500 uppercase">Tổng Số Dư Quỹ</div>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalBalance)}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-teal-600 font-semibold">3 Quỹ</span>
            <span>• Sổ quỹ minh bạch</span>
          </div>
        </div>

        {/* Stat 3: Ngày giỗ gần nhất */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-heritage transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500 uppercase">Lễ Giỗ Sắp Tới</div>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
            {nextMemorial ? nextMemorial.title : 'Chưa có lịch'}
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-1">
            15/08 Âm Lịch (còn 30 ngày)
          </div>
        </div>

        {/* Stat 4: Gói Dịch Vụ */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-heritage transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500 uppercase">Gói Thuê Bao</div>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 flex items-center space-x-2">
            <span>Gói Gia Tộc</span>
            <CheckCircle2 className="w-4 h-4 text-heritage-green" />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Hạn mức 300 thành viên (28% đã dùng)
          </div>
        </div>
      </div>

      {/* Main Grid: Cây Gia Phả Nổi Bật & Lịch Sử Thu Chi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cây gia phả rút gọn & Thành viên đầu dòng */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Các Cụ Thủy Tổ & Chi Trưởng</h2>
              <p className="text-xs text-slate-500">Phả hệ nguồn cội dòng họ Nguyễn Văn</p>
            </div>
            <Link
              to="/app/genealogy"
              className="text-xs font-semibold text-heritage-green hover:text-heritage-green-light flex items-center space-x-1"
            >
              <span>Xem toàn bộ cây</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockMembers.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-heritage-navy text-sm">
                    {member.first_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{member.full_name}</div>
                    <div className="text-xs text-slate-500">
                      {member.life_status === 'DECEASED' ? `Mất ngày ${member.death_lunar_day}/${member.death_lunar_month} Âm lịch` : 'Đang sinh sống'}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    member.life_status === 'DECEASED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {member.life_status === 'DECEASED' ? 'Tiền nhân' : 'Đương thời'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Hoạt động Sổ quỹ gần đây */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sổ Quỹ Bất Biến</h2>
                <p className="text-xs text-slate-500">Giao dịch thu chi mới nhất</p>
              </div>
              <Link
                to="/app/finance/ledger"
                className="text-xs font-semibold text-heritage-green hover:underline flex items-center"
              >
                <span>Xem chi tiết</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">{tx.transaction_code}</span>
                    <span
                      className={`text-xs font-bold ${
                        tx.transaction_type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.transaction_type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-1 line-clamp-1">
                    {tx.description}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {tx.transaction_date} • {tx.payment_method}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/app/finance/income"
              className="w-full py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition shadow-sm"
            >
              <span>Ghi nhận khoản thu mới</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
