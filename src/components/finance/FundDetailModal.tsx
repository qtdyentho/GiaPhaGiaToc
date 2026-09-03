import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Landmark,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Fund, FinancialTransaction } from '../../types/database';
import { FundService } from '../../services/FundService';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Badge } from '../ui';

interface FundDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fund: Fund | null;
  onRecordIncome?: (fund: Fund) => void;
  onCreateExpense?: (fund: Fund) => void;
}

export const FundDetailModal: React.FC<FundDetailModalProps> = ({
  isOpen,
  onClose,
  fund,
  onRecordIncome,
  onCreateExpense,
}) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen && fund) {
      loadFundTransactions(fund.id);
    }
  }, [isOpen, fund]);

  const loadFundTransactions = async (fundId: string) => {
    setLoading(true);
    try {
      const allTx = await FundService.getLedger(fund?.family_id);
      const fundTx = allTx.filter((t) => t.fund_id === fundId);
      setTransactions(fundTx);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử bút toán của quỹ:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !fund) return null;

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME' && t.status === 'POSTED')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE' && t.status === 'POSTED')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const filteredTransactions = transactions.filter((t) => {
    if (selectedType === 'ALL') return true;
    return t.transaction_type === selectedType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-white to-amber-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-[#166534] dark:text-emerald-400 shadow-xs shrink-0 font-bold text-lg">
              {fund.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {fund.name}
                </h2>
                <Badge variant={fund.current_balance > 0 ? 'success' : 'neutral'} size="sm">
                  {fund.current_balance > 0 ? 'Đang hoạt động' : 'Số dư 0đ'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mã định danh: <span className="text-slate-700 dark:text-slate-300 font-semibold">{fund.id.slice(0, 13)}...</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Số Dư Khả Dụng</span>
                <Wallet className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-[#166534] dark:text-emerald-400">
                {formatCurrency(fund.current_balance)}
              </p>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Khởi tạo: {formatCurrency(fund.opening_balance || 0)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Thu Đã Vào</span>
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                +{formatCurrency(totalIncome)}
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {transactions.filter((t) => t.transaction_type === 'INCOME').length} lượt thu quỹ
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Đã Giải Ngân</span>
                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-400">
                -{formatCurrency(totalExpense)}
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {transactions.filter((t) => t.transaction_type === 'EXPENSE').length} khoản đã chi
              </div>
            </div>
          </div>

          {/* Description & Rules */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
              <span>Mục Đích & Quy Chế Thu Chi Của Quỹ</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {fund.description || 'Quỹ chuyên dùng của dòng họ phục vụ các hoạt động thường niên, khuyến học khuyến tài và xây dựng từ đường.'}
            </p>
          </div>

          {/* Fund Transactions Breakdown */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E3A5F] dark:text-emerald-400" />
                <span>Nhật Ký Bút Toán Quỹ ({filteredTransactions.length})</span>
              </h3>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                {['ALL', 'INCOME', 'EXPENSE', 'REVERSAL'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedType === t
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t === 'ALL' ? 'Tất cả' : t === 'INCOME' ? 'Thu' : t === 'EXPENSE' ? 'Chi' : 'Đảo'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <tr>
                      <th className="py-3 px-3.5">Mã / Ngày</th>
                      <th className="py-3 px-3.5">Nội Dung Bút Toán</th>
                      <th className="py-3 px-3.5">Phương Thức</th>
                      <th className="py-3 px-3.5 text-right">Số Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin mx-auto mb-1.5" />
                          Đang tải bút toán...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Chưa có phát sinh giao dịch nào thuộc quỹ này
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isIncome = tx.transaction_type === 'INCOME';
                        const isReversal = tx.transaction_type === 'REVERSAL';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">{tx.transaction_code}</div>
                              <div className="text-[10px] text-slate-400">{formatDate(tx.transaction_date)}</div>
                            </td>
                            <td className="py-3 px-3.5">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{tx.description}</p>
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                {tx.payment_method}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right font-bold text-sm">
                              <span
                                className={
                                  isReversal
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : isIncome
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-rose-700 dark:text-rose-400'
                                }
                              >
                                {isReversal ? '↺ ' : isIncome ? '+' : '-'}
                                {Number(tx.amount).toLocaleString()} ₫
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/app/finance/ledger');
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#1E3A5F] dark:text-emerald-400" />
            <span>Mở Toàn Bộ Sổ Cái</span>
          </button>

          <div className="flex items-center gap-2.5">
            {onRecordIncome && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordIncome(fund);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Thu Vào Quỹ Này</span>
              </button>
            )}

            {onCreateExpense && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateExpense(fund);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 dark:bg-rose-800 dark:hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Đề Xuất Chi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetailModal;
