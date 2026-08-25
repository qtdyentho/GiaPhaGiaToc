import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Search,
  Plus,
  Printer,
  Building,
  User,
  Crown,
  Medal,
} from 'lucide-react';
import { FundService, HonorRollItem } from '../services/FundService';
import { Fund } from '../types/database';
import { AddContributionModal } from '../components/finance/AddContributionModal';
import { useAuth } from '../contexts/AuthContext';

export const HonorRollPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [honorList, setHonorList] = useState<HonorRollItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    if (!activeFamily?.id) {
      setHonorList([]);
      setFunds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const famId = activeFamily.id;
      const [data, fundsData] = await Promise.all([
        FundService.getHonorRoll(famId),
        FundService.getFunds(famId),
      ]);
      setHonorList(data);
      setFunds(fundsData);
    } catch (err) {
      console.error('Lỗi khi tải Bảng Vàng Công Đức:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFamily?.id]);

  const totalSponsorshipAmount = honorList.reduce((sum, item) => sum + item.totalAmount, 0);

  const filteredList = honorList.filter((item) => {
    const matchSearch =
      !searchQuery.trim() ||
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purposes.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTier = selectedTier === 'ALL' || item.tier === selectedTier;
    return matchSearch && matchTier;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'DIAMOND':
        return (
          <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Crown className="w-3.5 h-3.5 text-cyan-600" /> Kim Cương (≥ 50 Triệu)
          </span>
        );
      case 'GOLD':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-400 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Medal className="w-3.5 h-3.5 text-amber-600" /> Vàng (≥ 20 Triệu)
          </span>
        );
      case 'SILVER':
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Award className="w-3.5 h-3.5 text-slate-600" /> Bạc (≥ 5 Triệu)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-300 text-orange-900 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Đồng (≥ 1 Triệu)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Ceremonial Header Banner (Professional Gold & Light Heritage Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 border-2 border-amber-300/80 p-8 shadow-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C49A3A] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  Heritage Ledger • Niên Hiệu 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heritage mt-1.5 tracking-tight">
                🏆 BẢNG VÀNG CÔNG ĐỨC & TÀI TRỢ DÒNG HỌ
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Tri ân và khắc ghi công đức các bậc tiền bối, con cháu và các nhà hảo tâm đã chung tay xây dựng, trùng tu từ đường và phát triển quỹ dòng họ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-amber-700" />
              <span>In Bảng Vàng A4</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Công Đức Mới</span>
            </button>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-200/80">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Tổng Tiền Công Đức:</span>
            <p className="text-xl font-black text-amber-800 mt-0.5">
              {totalSponsorshipAmount.toLocaleString()} ₫
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Số Lượng Nhà Hảo Tâm:</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{honorList.length} Người / Đơn vị</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Hạng Kim Cương (≥ 50Tr):</span>
            <p className="text-xl font-bold text-cyan-800 mt-0.5">
              {honorList.filter((i) => i.tier === 'DIAMOND').length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Hạng Vàng (≥ 20Tr):</span>
            <p className="text-xl font-bold text-amber-800 mt-0.5">
              {honorList.filter((i) => i.tier === 'GOLD').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhà hảo tâm hoặc mục đích công đức..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {['ALL', 'DIAMOND', 'GOLD', 'SILVER', 'BRONZE'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTier === tier
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tier === 'ALL'
                ? 'Tất cả'
                : tier === 'DIAMOND'
                ? 'Kim Cương'
                : tier === 'GOLD'
                ? 'Vàng'
                : tier === 'SILVER'
                ? 'Bạc'
                : 'Đồng'}
            </button>
          ))}
        </div>
      </div>

      {/* Honor Roll Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-amber-50/60 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-700 font-bold">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Thứ Hạng</th>
                <th className="py-3.5 px-4">Người / Đơn Vị Công Đức</th>
                <th className="py-3.5 px-4">Mục Đích / Hạng Mục</th>
                <th className="py-3.5 px-4 text-right">Tổng Số Tiền</th>
                <th className="py-3.5 px-4 text-center">Hạng Vinh Danh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-amber-500/20 border-t-[#C49A3A] rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách công đức...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không có thông tin phù hợp với bộ lọc tìm kiếm
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-4 text-center font-bold text-slate-500">
                      {idx === 0 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center mx-auto text-sm shadow-xs">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center mx-auto text-sm shadow-xs">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-900 border border-orange-300 flex items-center justify-center mx-auto text-sm shadow-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="font-bold text-slate-600">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                          {item.donorName.includes('Công ty') || item.donorName.includes('Tập đoàn') ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                            {item.donorName}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {item.contributionsCount} lần đóng góp
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 max-w-sm">
                      <div className="flex flex-wrap gap-1">
                        {item.purposes.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-base text-amber-800">
                      {item.totalAmount.toLocaleString()} ₫
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">{getTierBadge(item.tier)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddContributionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        funds={funds}
        familyId={activeFamily?.id}
      />
    </div>
  );
};

export default HonorRollPage;
