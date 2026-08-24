import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Filter,
  DollarSign,
  Building,
  User,
  CreditCard,
  QrCode,
  Calendar,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { Contribution, Fund } from '../types/database';
import { AddContributionModal } from '../components/finance/AddContributionModal';

export const ContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFundId, setSelectedFundId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ctbData, fundsData] = await Promise.all([
        FundService.getContributions(),
        FundService.getFunds(),
      ]);
      setContributions(ctbData);
      setFunds(fundsData);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đóng góp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const filteredContributions = contributions.filter((c) => {
    const matchSearch =
      !searchQuery.trim() ||
      (c.donor_name && c.donor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.purpose && c.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchFund = !selectedFundId || c.fund_id === selectedFundId;
    return matchSearch && matchFund;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>Đóng Góp & Tài Trợ Dòng Họ</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold">
                {contributions.length} Khoản Đóng Góp
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Quản lý các khoản hảo tâm, công đức và tài trợ tự nguyện của con cháu & doanh nghiệp
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi Nhận Đóng Góp Mới</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Tổng Tiền Đóng Góp</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {totalContributions.toLocaleString()} ₫
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Số Lượng Đóng Góp</span>
          <p className="text-2xl font-bold text-slate-100 mt-1">{contributions.length} lượt</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Bình Quân / Lượt Đóng Góp</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {contributions.length > 0
              ? Math.round(totalContributions / contributions.length).toLocaleString()
              : 0}{' '}
            ₫
          </p>
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
              placeholder="Tìm theo tên người đóng góp hoặc mục đích..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <select
            value={selectedFundId}
            onChange={(e) => setSelectedFundId(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">Tất cả các quỹ</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-bold">Người / Đơn Vị Đóng Góp</th>
                <th className="py-3.5 px-4 font-bold">Quỹ Tiếp Nhận</th>
                <th className="py-3.5 px-4 font-bold">Mục Đích / Nội Dung</th>
                <th className="py-3.5 px-4 font-bold">Phương Thức</th>
                <th className="py-3.5 px-4 font-bold text-right">Số Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách đóng góp...
                  </td>
                </tr>
              ) : filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Chưa có khoản đóng góp nào được ghi nhận
                  </td>
                </tr>
              ) : (
                filteredContributions.map((c) => {
                  const fund = funds.find((f) => f.id === c.fund_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                            {c.member_id ? <User className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{c.donor_name || 'Nhà hảo tâm'}</p>
                            <span className="text-[11px] text-slate-400">
                              {c.created_at ? c.created_at.slice(0, 10) : '2026-08-24'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {fund?.name || 'Quỹ gia tộc'}
                      </td>

                      <td className="py-4 px-4 text-slate-300 max-w-sm">{c.purpose}</td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium inline-flex items-center gap-1">
                          {c.payment_method === 'VIETQR' ? (
                            <QrCode className="w-3 h-3 text-amber-400" />
                          ) : (
                            <CreditCard className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{c.payment_method}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-base text-amber-400">
                        {Number(c.amount).toLocaleString()} ₫
                      </td>
                    </tr>
                  );
                })
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
