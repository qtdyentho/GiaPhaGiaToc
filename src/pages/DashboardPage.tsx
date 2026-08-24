import React, { useState } from 'react';
import { 
  Users, Landmark, Wallet, Calendar, ArrowUpRight, Sparkles, 
  ChevronRight, MapPin, Camera, Image, ShieldCheck, HeartHandshake,
  BookOpen, Megaphone
} from 'lucide-react';
import { LunarCalendarService } from '../services/LunarCalendarService';
import { formatCurrency } from '../lib/utils';
import { mockFamily, mockMembers, mockFunds, mockMemorialDates, mockTransactions } from '../services/mockData';
import { Link } from 'react-router-dom';
import { UpcomingEventsWidget } from '../components/calendar/UpcomingEventsWidget';
import { useAuth } from '../contexts/AuthContext';
import { AncestralBannerModal, ANCESTRAL_PRESETS } from '../components/family/AncestralBannerModal';
import { ClanCovenantCard } from '../components/family/ClanCovenantCard';
import { CreateBroadcastModal } from '../components/notifications/CreateBroadcastModal';

export const DashboardPage: React.FC = () => {
  const { activeFamily, isFamilyAdmin } = useAuth();
  const todayInfo = LunarCalendarService.getTodayInfo();
  
  const currentFamily = activeFamily || mockFamily;
  const familyFunds = mockFunds.filter((f) => f.family_id === currentFamily.id);
  const totalBalance = familyFunds.reduce((sum, f) => sum + Number(f.current_balance || 0), 0);
  const familyMembers = mockMembers.filter((m) => m.family_id === currentFamily.id);
  const familyMemorials = mockMemorialDates.filter((m) => m.family_id === currentFamily.id);
  const nextMemorial = familyMemorials[0] || mockMemorialDates[0];
  const familyTransactions = mockTransactions.filter((t) => t.family_id === currentFamily.id);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const bannerImageUrl = currentFamily.banner_url || ANCESTRAL_PRESETS[0].url;

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* 🏛️ ANCESTRAL HERO BANNER: Không Gian Từ Đường & Phụng Tự Trang Trọng */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-amber-900/20 bg-slate-900 group min-h-[260px] md:min-h-[300px] flex flex-col justify-between p-6 md:p-8 text-white">
        {/* Background Image of Ancestral Hall / Từ Đường */}
        <img
          src={bannerImageUrl}
          alt={`Từ Đường ${currentFamily.name}`}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition duration-1000 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = ANCESTRAL_PRESETS[0].url;
          }}
        />

        {/* Traditional Heritage Gradients for Depth & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/55 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/40 to-transparent" />

        {/* Top Section: Motto & Lunar Calendar & Admin Edit Button */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Traditional Motto Badge */}
          <div className="inline-flex items-center space-x-2 bg-amber-500/25 text-amber-200 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-amber-400/40 backdrop-blur-md self-start shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="tracking-wide">Ẩm Hà Tư Nguyên • Mộc Hữu Bản, Thủy Hữu Nguyên</span>
          </div>

          {/* Action Buttons: Phát Thông Báo & Thay Đổi Ảnh Từ Đường (Trưởng tộc / Quản trị viên) */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {isFamilyAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-amber-500/90 hover:bg-amber-500 text-amber-950 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-300 backdrop-blur-md transition shadow-xs"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Phát Thông Báo Đẩy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-black/40 hover:bg-black/60 text-amber-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md transition shadow-xs hover:border-amber-400/50"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>Đổi Ảnh Từ Đường</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: Clan Name, Ancestral Hall Address & Today's Lunar Info */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-bold text-amber-300/90 uppercase tracking-widest flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>Từ Đường & Không Gian Thờ Tự Tiên Tổ</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md font-serif text-amber-50">
              {currentFamily.name}
            </h1>

            {/* Address & Origin */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-200">
              {currentFamily.ancestral_hall_address && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{currentFamily.ancestral_hall_address}</span>
                </div>
              )}
              {currentFamily.origin_commune && !currentFamily.ancestral_hall_address && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {currentFamily.origin_commune}, {currentFamily.origin_district ? `${currentFamily.origin_district}, ` : ''}{currentFamily.origin_province}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 pt-1 font-light opacity-95">
              {currentFamily.description || 'Nơi kết nối huyết thống tiền nhân và con cháu muôn đời.'}
            </p>
          </div>

          {/* Today Lunar Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-left sm:text-right lg:min-w-[220px] shadow-sm">
            <div className="text-[11px] text-amber-200 font-medium flex sm:justify-end items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Dương Lịch ({todayInfo.solarDay}/{todayInfo.solarMonth}/{todayInfo.solarYear})</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-white mt-0.5">
              Ngày {todayInfo.lunarDay} Tháng {todayInfo.lunarMonth}
            </div>
            <div className="text-xs text-amber-300 font-semibold mt-0.5">
              Năm {todayInfo.canChiYear} (Âm Lịch)
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Thành viên bà con */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bà Con Dòng Họ</div>
            <div className="p-2 bg-emerald-50 text-[#166534] rounded-xl border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {familyMembers.length || (currentFamily.id === mockFamily.id ? 86 : 1)}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">thành viên</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">Phả đồ trực hệ</span>
            <span>• Đinh & Nữ toàn tộc</span>
          </div>
        </div>

        {/* Stat 2: Sổ quỹ gia tộc */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số Dư Quỹ Dòng Họ</div>
            <div className="p-2 bg-emerald-50 text-[#166534] rounded-xl border border-emerald-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(totalBalance)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-semibold">{familyFunds.length || 3} Quỹ hoạt động</span>
            <span>• Minh bạch thu chi</span>
          </div>
        </div>

        {/* Stat 3: Lễ giỗ gần nhất */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày Giỗ Tiền Nhân Gần Nhất</div>
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

        {/* Stat 4: Hoạt động & Ghi chép */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sự Kiện & Ghi Chép</div>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {familyTransactions.length || (currentFamily.id === mockFamily.id ? 24 : 0)}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">bút toán</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-blue-700 font-semibold">Lưu truyền muôn đời</span>
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
                <div className="text-base font-bold text-slate-900 group-hover:text-[#166534] transition">
                  Cây Gia Phả Dòng Họ
                </div>
                <p className="text-xs text-slate-500">Tra cứu chi cành, thứ bậc và các thế hệ tiền nhân</p>
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
                <div className="text-base font-bold text-slate-900 group-hover:text-[#166534] transition">
                  Sổ Quỹ & Công Đức
                </div>
                <p className="text-xs text-slate-500">Ghi chép thu chi, hương khói và bảng vàng tri ân</p>
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
                    <div className="text-sm font-black text-slate-900">{formatCurrency(fund.current_balance)}</div>
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

      {/* 📜 HƯƠNG ƯỚC & TỘC QUY DÒNG HỌ */}
      <ClanCovenantCard family={currentFamily} />

      {/* 🖼️ Modal Thay Đổi Ảnh Từ Đường & Banner */}
      <AncestralBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        family={currentFamily}
      />

      {/* 📢 Modal Phát Thông Báo Đẩy Sự Kiện */}
      <CreateBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
