import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  BookOpen,
  GitFork,
  Users,
  Scroll,
  MapPin,
  Sparkles,
  Edit3,
  Share2,
  Phone,
  QrCode,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClanIntroConfig } from '../types/chronicle';
import { ClanChronicleService } from '../services/ClanChronicleService';
import { GenealogyService } from '../services/GenealogyService';
import { Branch, Generation, Member } from '../types/database';
import { EditClanIntroModal } from '../components/chronicles/EditClanIntroModal';
import { PrintableClanQRCodeModal } from '../components/family/PrintableClanQRCodeModal';
import { ANCESTRAL_HALL_PRESETS } from '../lib/imageCompressor';

export const ClanIntroductionPage: React.FC = () => {
  const { activeFamily, isFamilyAdmin } = useAuth();
  const currentFamId = activeFamily?.id || '';

  const [intro, setIntro] = useState<ClanIntroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'origin' | 'hall' | 'branches' | 'precepts' | 'board'>('origin');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const loadData = async () => {
    if (!currentFamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [introData, treeData] = await Promise.all([
        ClanChronicleService.getClanIntro(currentFamId),
        GenealogyService.getFamilyTree(currentFamId),
      ]);
      setIntro(introData);
      setBranches(treeData.branches || []);
      setGenerations(treeData.generations || []);
      setMembers(treeData.members || []);
    } catch (err) {
      console.warn('Lỗi tải thông tin giới thiệu dòng họ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFamId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Đang nạp dữ liệu cội nguồn & di sản gia tộc...
        </p>
      </div>
    );
  }

  const currentIntro = intro || {
    family_id: currentFamId,
    founding_ancestor: 'Khởi Tổ Tiên Công',
    founding_year_era: 'Khởi dựng từ thời lập ấp',
    historical_origin: 'Lịch sử cội nguồn dòng họ...',
    clan_motto: 'Uống nước nhớ nguồn • Rạng danh tiên tổ',
    couplets: [],
    leadership_board: [],
  };

  // Thống kê chi tiết phả đồ & quy mô dòng họ
  const clanStats = React.useMemo(() => {
    const total = members.length;
    const dinh = members.filter((m) => m.gender === 'MALE').length;
    const nu = members.filter((m) => m.gender === 'FEMALE').length;
    const alive = members.filter((m) => m.life_status === 'ALIVE').length;
    const deceased = members.filter((m) => m.life_status === 'DECEASED').length;
    const gens = generations.length || (total > 0 ? Math.max(...members.map((m) => Number(m.generation_id?.replace(/\D/g, '') || 1)), 1) : 0);
    const branchCount = branches.length || (total > 0 ? new Set(members.map((m) => m.branch_id).filter(Boolean)).size : 0);

    const earliestBirthYear = members.reduce((minYr, m) => {
      const y = m.birth_solar_date ? new Date(m.birth_solar_date).getFullYear() : (m as any).birth_year;
      if (y && y > 1000 && y < minYr) return y;
      return minYr;
    }, 9999);

    const foundingYearStr = earliestBirthYear !== 9999 ? `Năm ${earliestBirthYear}` : currentIntro.founding_year_era || 'Thời dựng họ';

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
  }, [members, generations, branches, currentIntro.founding_year_era]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* ── 1. Hero Banner: Đại Tự & Cội Nguồn Dòng Tộc ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-900 via-stone-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl overflow-hidden border border-amber-500/30">
        {/* Background Overlay Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                <Landmark className="w-3.5 h-3.5" />
                <span>Di Sản & Cội Nguồn Dòng Tộc</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold backdrop-blur-md">
                Niên hiệu: {clanStats.foundingYear}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-100 font-serif">
              {activeFamily?.name || 'Đại Tộc Gia Phả'}
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/90 font-medium italic leading-relaxed">
              "{currentIntro.clan_motto}"
            </p>

            {/* Quick Stats Grid — 5 Thẻ Thống Kê Chuẩn */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Khởi Thủy</div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{clanStats.foundingYear}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Thế Hệ (Đời)</div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{clanStats.generationsCount} Đời</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Chi Phái</div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{clanStats.branchesCount} Chi/Cành</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Đinh Số (Nam)</div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{clanStats.dinh} Đinh ({clanStats.nu} Nữ)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-amber-300 font-bold uppercase">Hiện Diện</div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{clanStats.alive} sống • {clanStats.deceased} khuất</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {isFamilyAdmin && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh Sửa Giới Thiệu</span>
              </button>
            )}

            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Mã QR Dòng Họ</span>
            </button>

            <Link
              to="/app/clan/chronicles"
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ký Sự & Lưu Ký</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'origin', label: 'Cội Nguồn & Thủy Tổ', icon: Scroll },
          { id: 'hall', label: 'Từ Đường & Di Tích', icon: Landmark },
          { id: 'branches', label: 'Hệ Thống Chi Phái', icon: GitFork },
          { id: 'precepts', label: 'Hoành Phi & Gia Quy', icon: Award },
          { id: 'board', label: 'Hội Đồng Gia Tộc', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#166534] dark:bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Tab Contents ── */}

      {/* TAB 1: Cội Nguồn & Thủy Tổ */}
      {activeTab === 'origin' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Scroll className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Sự Tích Phát Tích & Lịch Sử Di Cư
                  </h2>
                  <p className="text-xs text-slate-400">
                    Khởi lập từ {currentIntro.founding_year_era || 'thời lập ấp'}
                  </p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {currentIntro.historical_origin}
              </div>
            </div>

            {/* Ancestor Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-xl font-bold mx-auto shadow-inner">
                    🏛️
                  </div>
                  <h3 className="text-base font-black text-amber-950 dark:text-amber-200">
                    {currentIntro.founding_ancestor || 'Cụ Thủy Tổ Tiên Công'}
                  </h3>
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                    Đệ Nhất Thế Hệ • Khởi Tổ Dòng Họ
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Quê cha đất tổ:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {currentIntro.origin_province || activeFamily?.origin_province || 'Đang cập nhật'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Niên đại:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {currentIntro.founding_year_era || 'Cổ truyền'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Quy cách phả hệ:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Chính Phái Đa Chi
                    </strong>
                  </div>
                </div>

                <Link
                  to="/app/genealogy"
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Xem Trực Quan Cây Phả Hệ</span>
                </Link>
              </div>

              {/* Clan Motto Box */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Lời Cổ Huấn Tổ Tiên</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                  "{currentIntro.clan_motto}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Từ Đường & Di Tích Lăng Mộ */}
      {activeTab === 'hall' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>{currentIntro.ancestral_hall_address || 'Địa chỉ Từ đường gia tộc'}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Nhà Thờ Tổ & Lăng Mộ Tiên Tổ
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentIntro.ancestral_hall_architect || 'Kiến trúc cổ truyền 3 gian 2 chái'}
                </p>
              </div>

              {/* Hall Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(currentIntro.ancestral_hall_images && currentIntro.ancestral_hall_images.length > 0
                  ? currentIntro.ancestral_hall_images
                  : [ANCESTRAL_HALL_PRESETS[0].url, ANCESTRAL_HALL_PRESETS[1].url]
                ).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedLightboxImage({ url: imgUrl, title: `Hình ảnh từ đường tư liệu #${idx + 1}` })}
                    className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt="Từ đường dòng họ"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = ANCESTRAL_HALL_PRESETS[0].url;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[11px] font-bold text-white">
                        Tư liệu từ đường #{idx + 1}
                      </span>
                      <span className="text-[10px] bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-md font-semibold opacity-0 group-hover:opacity-100 transition">
                        Bấm để phóng to 🔍
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Relics Description */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🏺</span> Bảo Vật, Sắc Phong & Văn Bia Lưu Giữ
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentIntro.relics_description ||
                    'Văn bia ghi công đức các bậc tiền nhân, đại tự hoành phi câu đối và gia phả cổ.'}
                </p>
              </div>
            </div>

            {/* Quick Hall Info Card */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Quy Cách & Tọa Độ
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vị trí</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {currentIntro.ancestral_hall_address || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Kiến trúc</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentIntro.ancestral_hall_architect || 'Cổ truyền'}
                    </div>
                  </div>
                </div>

                <Link
                  to="/app/calendar"
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Xem Lịch Lễ Hội & Giỗ Tổ Tại Từ Đường</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Hệ Thống Chi Phái */}
      {activeTab === 'branches' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Cơ Cấu Các Chi Phái & Cành Nhánh
                </h2>
                <p className="text-xs text-slate-400">
                  Dòng họ hiện có {branches.length} chi phái phân bổ tại các địa phương
                </p>
              </div>
              <Link
                to="/app/genealogy"
                className="px-4 py-2 rounded-xl bg-[#166534] dark:bg-emerald-700 text-white text-xs font-bold hover:bg-[#14532d] transition flex items-center gap-1.5"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Tra Cứu Chi Phái Trên Cây Phả</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.length === 0 ? (
                <div className="col-span-3 py-8 text-center text-xs text-slate-400">
                  Chưa có chi phái nào được thiết lập.
                </div>
              ) : (
                branches.map((b) => {
                  const branchMembers = members.filter((m) => m.branch_id === b.id);
                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Chi #{b.order_index || 1}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {branchMembers.length} thành viên
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {b.name}
                      </h3>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        <span>Mã chi: <strong>{b.code || 'CHINH_PHAI'}</strong></span>
                        <Link
                          to={`/app/members?branch=${b.id}`}
                          className="text-[#166534] dark:text-emerald-400 font-bold hover:underline"
                        >
                          Xem danh sách
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hoành Phi & Gia Quy Cổ Huấn */}
      {activeTab === 'precepts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Hoành Phi & Câu Đối Section */}
          <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-rose-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/40 shadow-xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Đại Tự & Cổ Huấn
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif">
                Hoành Phi & Câu Đối Từ Đường
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(currentIntro.couplets && currentIntro.couplets.length > 0
                ? currentIntro.couplets
                : [
                    {
                      horizontal: 'ĐỨC LƯU QUANG',
                      left: 'Tổ tông công đức thiên niên thịnh',
                      right: 'Tử hiếu tôn hiền vạn đại vinh',
                    },
                    {
                      horizontal: 'ẨM THỦY TƯ NGUYÊN',
                      left: 'Mộc xuất thiên chi do hữu bản',
                      right: 'Thủy lưu vạn phái tổng quy nguyên',
                    },
                  ]
              ).map((c, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-amber-400/30 text-center space-y-4 shadow-lg"
                >
                  {c.horizontal && (
                    <div className="inline-block px-6 py-2 rounded-xl bg-amber-500/30 border border-amber-300/50 text-amber-200 text-base font-black tracking-widest font-serif shadow-inner">
                      {c.horizontal}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm font-bold text-amber-100/90 font-serif leading-relaxed pt-2">
                    <div className="p-3 bg-black/30 rounded-xl border border-amber-500/20">
                      {c.left}
                    </div>
                    <div className="p-3 bg-black/30 rounded-xl border border-amber-500/20">
                      {c.right}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gia Huấn & Quy Ước Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-600" />
              <span>Gia Huấn Ca & Quy Ước Dòng Tộc</span>
            </h3>
            <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                1. Kính Tổ Tri Ân:
              </p>
              <p>Mỗi năm đến ngày giỗ tổ, con cháu dù ở nơi đâu cũng hướng lòng về cội nguồn, tề tựu dâng hương.</p>

              <p className="font-bold text-amber-900 dark:text-amber-200 pt-2">
                2. Hiếu Đễ Gia Phong:
              </p>
              <p>Kính trên nhường dưới, anh em hòa thuận, giữ gìn danh dự và truyền thống thanh bạch của dòng tộc.</p>

              <p className="font-bold text-amber-900 dark:text-amber-200 pt-2">
                3. Khuyến Học Thành Tài:
              </p>
              <p>Động viên, giúp đỡ con cháu nỗ lực học tập, đỗ đạt thành tài, góp phần rạng danh tiên tổ và dựng xây đất nước.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Hội Đồng Gia Tộc & Ban Trị Sự */}
      {activeTab === 'board' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hội Đồng Gia Tộc & Ban Trị Sự Đương Nhiệm
              </h2>
              <p className="text-xs text-slate-400">
                Ban điều hành việc họ, khánh tiết, quản lý từ đường và khuyến học
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentIntro.leadership_board && currentIntro.leadership_board.length > 0
                ? currentIntro.leadership_board
                : [
                    { role: 'Trưởng Tộc', name: 'Đại diện Trưởng tộc', title: 'Chủ trì việc họ' },
                    { role: 'Phó Trưởng Tộc', name: 'Ban Quản trị dòng họ', title: 'Điều hành việc họ' },
                    { role: 'Thủ Quỹ & Tài Chính', name: 'Ban Tài Chính', title: 'Minh bạch sổ quỹ' },
                    { role: 'Ban Khuyến Học', name: 'Hội Khuyến Học', title: 'Khen thưởng con cháu' },
                  ]
              ).map((leader, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {leader.role}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                      {leader.name || 'Thành viên Ban Trị Sự'}
                    </h3>
                    {leader.title && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{leader.title}</p>
                    )}
                  </div>

                  {leader.phone && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs text-[#166534] dark:text-emerald-400 font-semibold">
                      <Phone className="w-3 h-3" />
                      <span>{leader.phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Clan Intro Modal */}
      {intro && (
        <EditClanIntroModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => setIntro(updated)}
          initialIntro={intro}
        />
      )}

      {/* QR Share Modal */}
      {activeFamily && (
        <PrintableClanQRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          family={activeFamily}
          passToken={activeFamily.code || 'GIA-TOC'}
        />
      )}

      {/* Fullscreen Lightbox Image Viewer */}
      {selectedLightboxImage && (
        <div
          onClick={() => setSelectedLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
          >
            <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                {selectedLightboxImage.title}
              </span>
              <button
                onClick={() => setSelectedLightboxImage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black">
              <img
                src={selectedLightboxImage.url}
                alt={selectedLightboxImage.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClanIntroductionPage;
