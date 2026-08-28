import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Landmark, Wallet, Calendar, ArrowUpRight, Sparkles, 
  ChevronRight, MapPin, Camera, Image, ShieldCheck, HeartHandshake,
  BookOpen, Megaphone, QrCode, Flame, GitFork, TreePine, Crown, Clock, Activity, ArrowRight
} from 'lucide-react';
import { LunarCalendarService } from '../services/LunarCalendarService';
import { ShortLinkService } from '../services/security/ShortLinkService';
import { ClanPassService } from '../services/security/ClanPassService';
import { GenealogyService } from '../services/GenealogyService';
import { FundService } from '../services/FundService';
import { MemorialService } from '../services/calendar/MemorialService';
import { Fund, Member, MemorialDate, FinancialTransaction, Generation, Branch } from '../types/database';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { UpcomingEventsWidget } from '../components/calendar/UpcomingEventsWidget';
import { useAuth } from '../contexts/AuthContext';
import { AncestralBannerModal, ANCESTRAL_PRESETS } from '../components/family/AncestralBannerModal';
import { ClanCovenantCard } from '../components/family/ClanCovenantCard';
import { CreateBroadcastModal } from '../components/notifications/CreateBroadcastModal';
import { PrintableClanQRCodeModal } from '../components/family/PrintableClanQRCodeModal';
import { RecentChroniclesWidget } from '../components/chronicles/RecentChroniclesWidget';

export const DashboardPage: React.FC = () => {
  const { activeFamily, isFamilyAdmin, user } = useAuth();
  const todayInfo = LunarCalendarService.getTodayInfo();
  
  // ——— ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURN ———
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [shortCode, setShortCode] = useState<string>('');
  const [passToken, setPassToken] = useState<string>('');
  const [familyFunds, setFamilyFunds] = useState<Fund[]>([]);
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [familyGenerations, setFamilyGenerations] = useState<Generation[]>([]);
  const [familyBranches, setFamilyBranches] = useState<Branch[]>([]);
  const [familyMemorials, setFamilyMemorials] = useState<MemorialDate[]>([]);
  const [familyTransactions, setFamilyTransactions] = useState<FinancialTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const currentFamily = activeFamily!; // safe: early return below guards all JSX usages
  const totalBalance = familyFunds.reduce((sum, f) => sum + Number(f.current_balance || 0), 0);
  const nextMemorial = familyMemorials[0] || null;
  const bannerImageUrl = currentFamily?.banner_url || ANCESTRAL_PRESETS[0].url;

  const loadData = async () => {
    if (currentFamily?.id) {
      setLoadingData(true);
      setFetchError(null);
      try {
        const [funds, treeData, mems, txs, config, link] = await Promise.all([
          FundService.getFunds(currentFamily.id),
          GenealogyService.getFamilyTree(currentFamily.id),
          MemorialService.getUpcomingMemorials(currentFamily.id, 5),
          FundService.getLedger(currentFamily.id),
          ClanPassService.getFamilyPassConfig(currentFamily.id),
          ShortLinkService.getShortLinkByFamily(currentFamily.id, currentFamily.name),
        ]);

        setFamilyFunds(funds || []);
        setFamilyMembers(treeData.members || []);
        setFamilyGenerations(treeData.generations || []);
        setFamilyBranches(treeData.branches || []);
        setFamilyMemorials(mems || []);
        setFamilyTransactions(txs || []);

        if (config?.pass_token) setPassToken(config.pass_token);
        if (link?.short_code) setShortCode(link.short_code);
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu trang tổng quan:', err);
        setFetchError(err?.message || 'Không thể kết nối máy chủ để tải dữ liệu. Vui lòng kiểm tra kết nối.');
      } finally {
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFamily?.id]);

  // Thống kê chi tiết phả đồ & quy mô dòng họ
  const clanStats = useMemo(() => {
    const total = familyMembers.length;
    const dinh = familyMembers.filter((m) => m.gender === 'MALE').length;
    const nu = familyMembers.filter((m) => m.gender === 'FEMALE').length;
    const alive = familyMembers.filter((m) => m.life_status === 'ALIVE').length;
    const deceased = familyMembers.filter((m) => m.life_status === 'DECEASED').length;
    const gens = familyGenerations.length || (total > 0 ? Math.max(...familyMembers.map((m) => Number(m.generation_id?.replace(/\D/g, '') || 1)), 1) : 0);
    const branchCount = familyBranches.length || (total > 0 ? new Set(familyMembers.map((m) => m.branch_id).filter(Boolean)).size : 0);

    const earliestBirthYear = familyMembers.reduce((minYr, m) => {
      const y = m.birth_solar_date ? new Date(m.birth_solar_date).getFullYear() : (m as any).birth_year;
      if (y && y > 1000 && y < minYr) return y;
      return minYr;
    }, 9999);

    const foundingYearStr = earliestBirthYear !== 9999 ? `Năm ${earliestBirthYear}` : (currentFamily as any)?.founding_year || 'Thời dựng họ';

    return {
      total,
      dinh,
      nu,
      alive,
      deceased,
      generationsCount: gens,
      branchesCount: branchCount,
      foundingYear: foundingYearStr,
    };
  }, [familyMembers, familyGenerations, familyBranches, currentFamily]);

  // Early return AFTER all hooks — only show onboarding when no family
  if (!activeFamily) {
    return (
      <div className="space-y-6 font-sans animate-fade-in max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-amber-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/60 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
            🏛️
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              Chào mừng {user?.full_name || 'Quý Khách'} đến với Gia Phả Gia Tộc
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Tài khoản của bạn hiện chưa khởi tạo hoặc tham gia vào dòng họ nào. Hãy bắt đầu phụng sự tiên tổ bằng cách lập cây phả hệ đầu tiên.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/onboarding/create-family" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Khởi Tạo Dòng Họ Đầu Tiên</span>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-slate-700 font-bold text-sm transition flex items-center justify-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              <span>Xem Bảng Giá & Tính Năng</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {fetchError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-700 dark:text-red-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadData}
            disabled={loadingData}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{loadingData ? 'Đang tải lại...' : 'Thử lại'}</span>
          </button>
        </div>
      )}

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

          {/* Action Buttons: Thắp Hương, Mã QR, Phát Thông Báo & Thay Đổi Ảnh Từ Đường */}
          <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-y-2">
            <Link
              to="/app/memorials"
              className="inline-flex items-center space-x-1.5 bg-amber-500/90 hover:bg-amber-500 text-amber-950 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-300 backdrop-blur-md transition shadow-xs cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
              <span>Thắp Hương Online</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-emerald-700/90 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-400/50 backdrop-blur-md transition shadow-xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mã QR Dòng Họ</span>
            </button>

            {isFamilyAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-blue-700/90 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-400/50 backdrop-blur-md transition shadow-xs cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Phát Thông Báo Đẩy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 bg-black/40 hover:bg-black/60 text-amber-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md transition shadow-xs hover:border-amber-400/50 cursor-pointer"
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

      {/* 🏛️ BẢNG THỐNG KÊ QUY MÔ & DI SẢN PHẢ HỆ DÒNG HỌ */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 p-5 sm:p-6 rounded-3xl border border-amber-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-xl">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <span>Quy Mô & Cội Nguồn Dòng Tộc</span>
                <span className="text-[11px] font-sans font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {clanStats.foundingYear}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thống kê toàn diện trực hệ thế hệ, các chi cành, đinh số và sự tiếp nối dòng dõi muôn đời
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/clan/intro"
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Sử Ký & Cội Nguồn</span>
            </Link>
            <Link
              to="/app/genealogy"
              className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Xem Cây Phả Hệ</span>
            </Link>
          </div>
        </div>

        {/* 5 Thống Kê Trọng Điểm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Box 1: Năm Khởi Thủy */}
          <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-amber-200/80 dark:border-slate-700 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Khởi Thủy</span>
            </div>
            <div className="text-lg font-black text-amber-900 dark:text-amber-300 mt-1">
              {clanStats.foundingYear}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tiên tổ khai cơ lập nghiệp</div>
          </div>

          {/* Box 2: Thế Hệ / Đời */}
          <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Số Thế Hệ</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {clanStats.generationsCount}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Đời</span>
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Từ Đời 1 đến Đời {clanStats.generationsCount}
            </div>
          </div>

          {/* Box 3: Số Chi Phái / Cành */}
          <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-blue-600" />
              <span>Chi Phái & Cành</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {clanStats.branchesCount}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Chi Phái</span>
            </div>
            <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Phân nhánh huyết thống</div>
          </div>

          {/* Box 4: Đinh Số (Nam giới) */}
          <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#166534] dark:text-emerald-400" />
              <span>Đinh Số (Nam)</span>
            </div>
            <div className="text-lg font-black text-[#166534] dark:text-emerald-300 mt-1">
              {clanStats.dinh}{' '}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Đinh</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Cùng {clanStats.nu} Nữ / Dâu
            </div>
          </div>

          {/* Box 5: Tình Trạng Hiện Tại */}
          <div className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>Hiện Diện</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {clanStats.alive}{' '}
              <span className="text-xs font-semibold text-emerald-600 font-sans">Sống</span>
              <span className="text-slate-400 mx-1">•</span>
              <span className="text-sm font-bold text-amber-800 dark:text-amber-400">{clanStats.deceased} Khuất</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tổng: {clanStats.total} Thành viên</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Thành viên bà con */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bà Con Dòng Họ</div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {familyMembers.length}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">thành viên</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Phả đồ trực hệ</span>
            <span>• Đinh & Nữ toàn tộc</span>
          </div>
        </div>

        {/* Stat 2: Sổ quỹ gia tộc */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Dư Quỹ Dòng Họ</div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalBalance)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{familyFunds.length} Quỹ hoạt động</span>
            <span>• Minh bạch thu chi</span>
          </div>
        </div>

        {/* Stat 3: Lễ giỗ gần nhất */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày Giỗ Tiền Nhân Gần Nhất</div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-2 truncate">
            {nextMemorial ? nextMemorial.title.replace('Lễ Giỗ: ', '') : 'Chưa có lịch giỗ'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-amber-800 dark:text-amber-400 font-semibold">
              {nextMemorial ? `${nextMemorial.lunar_day}/${nextMemorial.lunar_month} Âm lịch` : '—'}
            </span>
          </div>
        </div>

        {/* Stat 4: Hoạt động & Ghi chép */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sự Kiện & Ghi Chép</div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {familyTransactions.length}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">bút toán</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-blue-700 dark:text-blue-400 font-semibold">Lưu truyền muôn đời</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fast Navigation & Recent Memorials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/app/clan/intro"
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-600 shadow-xs hover:shadow-sm transition flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Cội Nguồn</div>
                <div className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  Giới Thiệu Dòng Họ
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Lịch sử phát tích, từ đường, hoành phi câu đối & ban trị sự</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400">
                <span>Khám phá</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              to="/app/genealogy"
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#166534] dark:hover:border-emerald-600 shadow-xs hover:shadow-sm transition flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#166534] dark:text-emerald-400 uppercase tracking-wider">Phả Hệ</div>
                <div className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition">
                  Cây Gia Phả Dòng Họ
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Tra cứu chi cành, thứ bậc và các thế hệ tiền nhân</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#166534] dark:text-emerald-400">
                <span>Tra cứu</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              to="/app/finance"
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#166534] dark:hover:border-emerald-600 shadow-xs hover:shadow-sm transition flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#166534] dark:text-emerald-400 uppercase tracking-wider">Tài Chính</div>
                <div className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition">
                  Sổ Quỹ & Công Đức
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Ghi chép thu chi, hương khói và bảng vàng tri ân</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#166534] dark:text-emerald-400">
                <span>Sổ quỹ</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Sổ Quỹ Gia Tộc List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
                <span>Các Quỹ Đang Hoạt Động ({currentFamily.name})</span>
              </h2>
              <Link to="/app/finance" className="text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline flex items-center space-x-1">
                <span>Xem chi tiết</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {familyFunds.map((fund) => (
                <div key={fund.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#166534] dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                      {fund.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{fund.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{fund.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(fund.current_balance)}</div>
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200 dark:border-emerald-800">
                      Khả dụng
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events & Recent Chronicles Widget */}
        <div className="space-y-6">
          <UpcomingEventsWidget familyId={activeFamily.id} />
          <RecentChroniclesWidget familyId={activeFamily.id} isFamilyAdmin={isFamilyAdmin} />
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

      {/* 📱 Modal Mã QR Dán Từ Đường */}
      <PrintableClanQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        family={currentFamily}
        passToken={passToken}
        shortCode={shortCode}
      />
    </div>
  );
};

export default DashboardPage;
