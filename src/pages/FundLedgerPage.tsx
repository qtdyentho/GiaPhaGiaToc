import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  RotateCcw,
  Plus,
  Printer,
  Landmark,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { FinancialTransaction, Fund } from '../types/database';
import { ReversalModal } from '../components/finance/ReversalModal';
import { CreateFundModal } from '../components/finance/CreateFundModal';
import { RecordIncomeModal } from '../components/finance/RecordIncomeModal';
import { FundDetailModal } from '../components/finance/FundDetailModal';
import { useAuth } from '../contexts/AuthContext';

export const FundLedgerPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFundId, setSelectedFundId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [reversalTarget, setReversalTarget] = useState<FinancialTransaction | null>(null);
  const [isCreateFundOpen, setIsCreateFundOpen] = useState(false);
  const [isRecordIncomeOpen, setIsRecordIncomeOpen] = useState(false);
  const [selectedFundDetail, setSelectedFundDetail] = useState<Fund | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const famId = activeFamily?.id || 'fam-0000-0001';
      const [fData, txData] = await Promise.all([
        FundService.getFunds(famId),
        FundService.getLedger(famId),
      ]);
      setFunds(fData);
      setTransactions(txData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Sổ Quỹ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFamily?.id]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchFund = selectedFundId === 'ALL' || tx.fund_id === selectedFundId;
    const matchType = selectedType === 'ALL' || tx.transaction_type === selectedType;
    const matchSearch =
      !search.trim() ||
      tx.transaction_code.toLowerCase().includes(search.toLowerCase()) ||
      (tx.description || '').toLowerCase().includes(search.toLowerCase());
    return matchFund && matchType && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['Mã Bút Toán', 'Ngày', 'Loại', 'Số Tiền', 'Quỹ', 'Phương Thức', 'Diễn Giải', 'Trạng Thái'];
    const rows = filteredTransactions.map((tx) => [
      tx.transaction_code,
      tx.transaction_date,
      tx.transaction_type,
      tx.amount,
      funds.find((f) => f.id === tx.fund_id)?.name || 'Quỹ',
      tx.payment_method,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `so_quy_gia_toc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span>Sổ Quỹ Gia Tộc</span>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Lưu Trữ Vĩnh Viễn
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Mọi khoản thu chi đã ghi sổ đều được lưu giữ vĩnh viễn, trường hợp sai sót sẽ thực hiện hoàn tác đối ứng
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateFundOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Landmark className="w-4 h-4 text-amber-700" />
            <span>Tạo Quỹ Mới</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Xuất File CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-cyan-700" />
            <span>In Bản A4</span>
          </button>

          <button
            onClick={() => setIsRecordIncomeOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thu Quỹ Trực Tiếp</span>
          </button>
        </div>
      </div>

      {/* Funds Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {funds.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFundDetail(f)}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-[#166534] hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider group-hover:text-[#166534] transition">
                {f.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  ACTIVE
                </span>
                <Info className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#166534] transition" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-800">
              {Number(f.current_balance || 0).toLocaleString()} ₫
            </p>
            {f.description && <p className="text-[11px] text-slate-500 line-clamp-1 italic">{f.description}</p>}
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã bút toán, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['ALL', 'INCOME', 'EXPENSE', 'REVERSAL'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedType === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'Tất cả' : t === 'INCOME' ? 'Thu' : t === 'EXPENSE' ? 'Chi' : 'Đảo'}
              </button>
            ))}
          </div>

          <select
            value={selectedFundId}
            onChange={(e) => setSelectedFundId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
          >
            <option value="ALL">Tất cả các quỹ</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Bút Toán</th>
                <th className="py-3.5 px-4">Ngày Hạch Toán</th>
                <th className="py-3.5 px-4">Diễn Giải Bút Toán</th>
                <th className="py-3.5 px-4">Quỹ Hạch Toán</th>
                <th className="py-3.5 px-4">Phương Thức</th>
                <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin mx-auto mb-2" />
                    Đang tải sổ cái...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không có bút toán nào trong sổ cái
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const fund = funds.find((f) => f.id === tx.fund_id);
                  const isReversal = tx.transaction_type === 'REVERSAL';
                  const isIncome = tx.transaction_type === 'INCOME';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{tx.transaction_code}</td>
                      <td className="py-3.5 px-4 text-slate-600">{tx.transaction_date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{tx.description}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {fund?.name || 'Quỹ Chung'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black text-sm ${
                            isReversal
                              ? 'text-amber-700'
                              : isIncome
                              ? 'text-emerald-800'
                              : 'text-rose-700'
                          }`}
                        >
                          {isReversal ? '↺ ' : isIncome ? '+ ' : '- '}
                          {Number(tx.amount).toLocaleString()} ₫
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 font-bold text-[10px] rounded-full ${
                            tx.status === 'POSTED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {tx.status === 'POSTED' ? 'Đã Ghi Sổ' : 'Đã Hoàn Tác'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.status === 'POSTED' && !isReversal ? (
                          <button
                            onClick={() => setReversalTarget(tx)}
                            className="text-amber-800 hover:text-amber-900 hover:bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Hoàn tác giao dịch</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Detail Modal */}
      <FundDetailModal
        isOpen={Boolean(selectedFundDetail)}
        onClose={() => setSelectedFundDetail(null)}
        fund={selectedFundDetail}
      />

      {/* Modals */}
      <ReversalModal
        isOpen={Boolean(reversalTarget)}
        onClose={() => setReversalTarget(null)}
        onSuccess={loadData}
        transaction={reversalTarget}
        funds={funds}
        familyId={activeFamily?.id}
      />

      <CreateFundModal
        isOpen={isCreateFundOpen}
        onClose={() => setIsCreateFundOpen(false)}
        onSuccess={loadData}
        familyId={activeFamily?.id}
      />

      <RecordIncomeModal
        isOpen={isRecordIncomeOpen}
        onClose={() => setIsRecordIncomeOpen(false)}
        onSuccess={loadData}
        funds={funds}
        familyId={activeFamily?.id}
      />
    </div>
  );
};

export default FundLedgerPage;
