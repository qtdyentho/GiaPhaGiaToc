import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  ShieldCheck,
  Building,
  User,
  Heart,
  Crown,
  Medal,
} from 'lucide-react';
import { FundService, HonorRollItem } from '../services/FundService';
import { Fund } from '../types/database';
import { AddContributionModal } from '../components/finance/AddContributionModal';

export const HonorRollPage: React.FC = () => {
  const [honorList, setHonorList] = useState<HonorRollItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, fundsData] = await Promise.all([
        FundService.getHonorRoll(),
        FundService.getFunds(),
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
  }, []);

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
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Crown className="w-3.5 h-3.5" /> Kim Cương (≥ 50 Triệu)
          </span>
        );
      case 'GOLD':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Medal className="w-3.5 h-3.5" /> Vàng (≥ 20 Triệu)
          </span>
        );
      case 'SILVER':
        return (
          <span className="px-3 py-1 rounded-full bg-slate-400/20 border border-slate-400/40 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Award className="w-3.5 h-3.5" /> Bạc (≥ 5 Triệu)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Đồng (≥ 1 Triệu)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-500/30 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                  Heritage Ledger
                </span>
                <span className="text-xs text-slate-400">Niên hiệu 2026</span>
              </div>
              <h1 className="text-2xl font-black text-slate-100 mt-1">🏆 BẢNG VÀNG CÔNG ĐỨC & TÀI TRỢ DÒNG HỌ</h1>
              <p className="text-xs text-amber-200/80 mt-1 max-w-xl">
                Tri ân và khắc ghi công đức các bậc tiền bối, con cháu và các nhà hảo tâm đã chung tay xây dựng, trùng tu từ đường và phát triển quỹ dòng họ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>In Bảng Vàng A4</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Công Đức Mới</span>
            </button>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-500/20">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Tổng Tiền Công Đức:</span>
            <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
              {totalSponsorshipAmount.toLocaleString()} ₫
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Số Lượng Nhà Hảo Tâm:</span>
            <p className="text-lg font-bold text-slate-100 mt-0.5">{honorList.length} Người / Tổ chức</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Hạng Kim Cương (≥ 50Tr):</span>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">
              {honorList.filter((i) => i.tier === 'DIAMOND').length}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs text-slate-400">Hạng Vàng (≥ 20Tr):</span>
            <p className="text-lg font-bold text-amber-300 mt-0.5">
              {honorList.filter((i) => i.tier === 'GOLD').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhà hảo tâm hoặc mục đích công đức..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['ALL', 'DIAMOND', 'GOLD', 'SILVER', 'BRONZE'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === tier
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-bold text-center w-16">Thứ Hạng</th>
                <th className="py-3.5 px-4 font-bold">Người / Đơn Vị Công Đức</th>
                <th className="py-3.5 px-4 font-bold">Mục Đích / Hạng Mục</th>
                <th className="py-3.5 px-4 font-bold text-right">Tổng Số Tiền</th>
                <th className="py-3.5 px-4 font-bold text-center">Hạng Vinh Danh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách công đức...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Không có thông tin phù hợp với bộ lọc tìm kiếm
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      {idx === 0 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto text-sm">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center mx-auto text-sm">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/40 flex items-center justify-center mx-auto text-sm">
                          🥉
                        </span>
                      ) : (
                        <span className="font-mono text-slate-500">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                          {item.donorType === 'BUSINESS' ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                            {item.donorName}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {item.donorType === 'BUSINESS' ? 'Doanh nghiệp / Tổ chức' : 'Thành viên dòng họ'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 max-w-xs">
                      <div className="space-y-1">
                        {item.purposes.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300 mr-1.5 mb-1"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-base text-amber-400">
                      {item.totalAmount.toLocaleString()} ₫
                    </td>

                    <td className="py-4 px-4 text-center">{getTierBadge(item.tier)}</td>
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
      />
    </div>
  );
};
