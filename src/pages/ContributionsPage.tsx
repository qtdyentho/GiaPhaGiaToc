import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Building,
  User,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { Contribution, Fund } from '../types/database';
import { AddContributionModal } from '../components/finance/AddContributionModal';
import { useAuth } from '../contexts/AuthContext';

export const ContributionsPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFundId, setSelectedFundId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    if (!activeFamily?.id) {
      setContributions([]);
      setFunds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const famId = activeFamily.id;
      const [ctbData, fundsData] = await Promise.all([
        FundService.getContributions(famId),
        FundService.getFunds(famId),
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
  }, [activeFamily?.id]);

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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shadow-sm">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Đóng Góp & Tài Trợ Dòng Họ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ghi nhận các khoản hảo tâm, công đức và tài trợ tự nguyện của con cháu dòng họ
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi Nhận Đóng Góp Mới</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tổng Tiền Đóng Góp</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {totalContributions.toLocaleString()} ₫
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Số Lượng Đóng Góp</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{contributions.length} lượt</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bình Quân / Lượt</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {contributions.length > 0
              ? Math.round(totalContributions / contributions.length).toLocaleString()
              : 0}{' '}
            ₫
          </p>
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
              placeholder="Tìm theo tên người đóng góp hoặc mục đích..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <select
            value={selectedFundId}
            onChange={(e) => setSelectedFundId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
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
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="py-3.5 px-4">Người / Đơn Vị Đóng Góp</th>
                <th className="py-3.5 px-4">Quỹ Tiếp Nhận</th>
                <th className="py-3.5 px-4">Mục Đích / Nội Dung</th>
                <th className="py-3.5 px-4">Phương Thức</th>
                <th className="py-3.5 px-4 text-right">Số Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách đóng góp...
                  </td>
                </tr>
              ) : filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Chưa có khoản đóng góp nào được ghi nhận
                  </td>
                </tr>
              ) : (
                filteredContributions.map((c) => {
                  const fund = funds.find((f) => f.id === c.fund_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                            {c.member_id ? <User className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.donor_name || 'Nhà hảo tâm'}</p>
                            <span className="text-[11px] text-slate-400">
                              {c.created_at ? c.created_at.slice(0, 10) : '2026-08-24'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        {fund?.name || 'Quỹ gia tộc'}
                      </td>

                      <td className="py-4 px-4 text-slate-600 max-w-sm">{c.purpose}</td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1">
                          {c.payment_method === 'VIETQR' ? (
                            <QrCode className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <CreditCard className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{c.payment_method}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-base text-amber-800">
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
        familyId={activeFamily?.id}
      />
    </div>
  );
};

export default ContributionsPage;
