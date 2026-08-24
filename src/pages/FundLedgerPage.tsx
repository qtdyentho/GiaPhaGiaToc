import React, { useState } from 'react';
import { BookOpen, Filter, Search, ShieldCheck, Download, RotateCcw, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { mockFunds, mockTransactions } from '../services/mockData';
import { formatCurrency, formatDate } from '../lib/utils';

export const FundLedgerPage: React.FC = () => {
  const [selectedFund, setSelectedFund] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [reversalTxId, setReversalTxId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [showReversalModal, setShowReversalModal] = useState(false);

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchFund = selectedFund === 'ALL' || tx.fund_id === selectedFund;
    const matchSearch = tx.transaction_code.toLowerCase().includes(search.toLowerCase()) || (tx.description || '').toLowerCase().includes(search.toLowerCase());
    return matchFund && matchSearch;
  });

  const handleOpenReversal = (id: string) => {
    setReversalTxId(id);
    setReversalReason('');
    setShowReversalModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Sổ Quỹ Gia Tộc Bất Biến</span>
            <span className="text-xs bg-emerald-100 text-heritage-green font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Immutable Ledger
            </span>
          </h1>
          <p className="text-xs text-slate-500">Mọi bút toán POSTED không xóa vật lý, chỉ cho phép đảo ngược đối ứng</p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-sm">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Báo Cáo Sổ Quỹ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã bút toán, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              className="bg-transparent focus:outline-none font-medium"
            >
              <option value="ALL">Tất cả các quỹ</option>
              {mockFunds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Bút Toán</th>
                <th className="py-3.5 px-4">Ngày Hạch Toán</th>
                <th className="py-3.5 px-4">Diễn Giải Bút Toán</th>
                <th className="py-3.5 px-4">Quỹ Hạch Toán</th>
                <th className="py-3.5 px-4">Phương Thức</th>
                <th className="py-3.5 px-4">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Đảo Ngược</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const fund = mockFunds.find((f) => f.id === tx.fund_id);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.transaction_code}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(tx.transaction_date)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{tx.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {fund?.name || 'Quỹ Chung'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-sm ${
                          tx.transaction_type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.transaction_type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        POSTED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReversal(tx.id)}
                        className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded text-xs font-semibold inline-flex items-center space-x-1 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đảo bút toán</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Đảo Ngược Bút Toán */}
      {showReversalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <span>Tạo Bút Toán Đảo Ngược (Reversal)</span>
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Theo chuẩn kiểm toán <strong>BR-REV-001</strong>, hệ thống sẽ tự động tạo một bút toán đối ứng âm để triệt tiêu giao dịch gốc và hoàn trả số dư quỹ nguyên tử.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Lý Do Đảo Ngược Bút Toán *</label>
              <textarea
                rows={3}
                required
                placeholder="VD: Ghi nhầm số tiền đóng góp từ 500k thành 5tr..."
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowReversalModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => setShowReversalModal(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Xác Nhận Đảo Ngược
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
