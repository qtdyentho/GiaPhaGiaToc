import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Filter,
  Search,
  ShieldCheck,
  Download,
  RotateCcw,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Landmark,
  FileSpreadsheet,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { FinancialTransaction, Fund, TransactionType } from '../types/database';
import { ReversalModal } from '../components/finance/ReversalModal';
import { CreateFundModal } from '../components/finance/CreateFundModal';
import { RecordIncomeModal } from '../components/finance/RecordIncomeModal';

export const FundLedgerPage: React.FC = () => {
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, txData] = await Promise.all([
        FundService.getFunds(),
        FundService.getLedger(),
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
  }, []);

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>Sổ Quỹ Gia Tộc Bất Biến</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Immutable Ledger
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Mọi bút toán POSTED không xóa vật lý, chỉ cho phép đảo ngược đối ứng (BR-REV-001)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateFundOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Landmark className="w-4 h-4 text-amber-400" />
            <span>Tạo Quỹ Mới</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất File CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>In Bản A4</span>
          </button>

          <button
            onClick={() => setIsRecordIncomeOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thu Quỹ Trực Tiếp</span>
          </button>
        </div>
      </div>

      {/* Funds Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {funds.map((f) => (
          <div key={f.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{f.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono">
              {Number(f.current_balance || 0).toLocaleString()} ₫
            </p>
            {f.description && <p className="text-[11px] text-slate-400 line-clamp-1 italic">{f.description}</p>}
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã bút toán, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {['ALL', 'INCOME', 'EXPENSE', 'REVERSAL'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === t
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'Tất cả' : t === 'INCOME' ? 'Thu' : t === 'EXPENSE' ? 'Chi' : 'Đảo'}
              </button>
            ))}
          </div>

          <select
            value={selectedFundId}
            onChange={(e) => setSelectedFundId(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
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
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                    Đang tải sổ cái...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không có bút toán nào trong sổ cái
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const fund = funds.find((f) => f.id === tx.fund_id);
                  const isReversal = tx.transaction_type === 'REVERSAL';
                  const isIncome = tx.transaction_type === 'INCOME';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{tx.transaction_code}</td>
                      <td className="py-3.5 px-4 text-slate-400">{tx.transaction_date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{tx.description}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {fund?.name || 'Quỹ Chung'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black text-sm font-mono ${
                            isReversal
                              ? 'text-amber-400'
                              : isIncome
                              ? 'text-emerald-400'
                              : 'text-rose-400'
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
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.status === 'POSTED' && !isReversal ? (
                          <button
                            onClick={() => setReversalTarget(tx)}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Đảo bút toán</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
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

      {/* Modals */}
      <ReversalModal
        isOpen={Boolean(reversalTarget)}
        onClose={() => setReversalTarget(null)}
        onSuccess={loadData}
        transaction={reversalTarget}
        funds={funds}
      />

      <CreateFundModal
        isOpen={isCreateFundOpen}
        onClose={() => setIsCreateFundOpen(false)}
        onSuccess={loadData}
      />

      <RecordIncomeModal
        isOpen={isRecordIncomeOpen}
        onClose={() => setIsRecordIncomeOpen(false)}
        onSuccess={loadData}
        funds={funds}
      />
    </div>
  );
};
