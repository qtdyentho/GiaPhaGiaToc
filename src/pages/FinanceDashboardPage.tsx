import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ShieldCheck,
  BookOpen,
  ReceiptText,
  Receipt,
  HeartHandshake,
  Trophy,
  Landmark,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { Fund, FinancialTransaction } from '../types/database';
import { RecordIncomeModal } from '../components/finance/RecordIncomeModal';
import { CreateExpenseModal } from '../components/finance/CreateExpenseModal';
import { CreateFundModal } from '../components/finance/CreateFundModal';

export const FinanceDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<{
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    totalReceivable: number;
    pendingExpensesCount: number;
    funds: Fund[];
    recentTransactions: FinancialTransaction[];
  }>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalReceivable: 0,
    pendingExpensesCount: 0,
    funds: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRecordIncomeOpen, setIsRecordIncomeOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isCreateFundOpen, setIsCreateFundOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await FundService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Lỗi khi tải tổng quan tài chính:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>Trung Tâm Tài Chính & Sổ Quỹ Gia Tộc</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold">
                Financial Core v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Kế toán kép bất biến, minh bạch tuyệt đối 100% dòng tiền & công đức dòng họ
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
            onClick={() => setIsRecordIncomeOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Ghi Thu Quỹ</span>
          </button>

          <button
            onClick={() => setIsCreateExpenseOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Đề Xuất Chi Quỹ</span>
          </button>
        </div>
      </div>

      {/* Navigation Hub: 5 Core Modules */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Link
          to="/app/finance/ledger"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col items-center text-center gap-2 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Sổ Quỹ Bất Biến</h4>
            <span className="text-[11px] text-slate-500">Immutable Ledger</span>
          </div>
        </Link>

        <Link
          to="/app/finance/income"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col items-center text-center gap-2 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Định Mức Thu</h4>
            <span className="text-[11px] text-slate-500">Phân bổ & Thực thu</span>
          </div>
        </Link>

        <Link
          to="/app/finance/expenses"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col items-center text-center gap-2 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 transition-colors">Duyệt Chi Quỹ</h4>
            <span className="text-[11px] text-slate-500">Kiểm soát giải ngân</span>
          </div>
        </Link>

        <Link
          to="/app/finance/contributions"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col items-center text-center gap-2 group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Đóng Góp & Tài Trợ</h4>
            <span className="text-[11px] text-slate-500">Hảo tâm tự nguyện</span>
          </div>
        </Link>

        <Link
          to="/app/finance/honor-roll"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 transition-all flex flex-col items-center text-center gap-2 group shadow-lg col-span-2 md:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">Bảng Vàng Công Đức</h4>
            <span className="text-[11px] text-slate-500">Vinh danh dòng họ</span>
          </div>
        </Link>
      </div>

      {/* Overview Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Tổng Quỹ Khả Dụng</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            {summary.totalBalance.toLocaleString()} ₫
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{summary.funds.length} quỹ đang hoạt động</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Tổng Thu Vào Quỹ</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {summary.totalIncome.toLocaleString()} ₫
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã vào Sổ cái POSTED</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" />
            <span>Tổng Chi Đã Phê Duyệt</span>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-2">
            {summary.totalExpense.toLocaleString()} ₫
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã kiểm toán & trừ quỹ</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <ReceiptText className="w-4 h-4" />
            <span>Chờ Nộp / Tồn Đọng</span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-2">
            {summary.totalReceivable.toLocaleString()} ₫
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{summary.pendingExpensesCount} phiếu chi chờ duyệt</div>
        </div>
      </div>

      {/* Funds Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-400" />
          <span>Danh Sách Các Quỹ Gia Tộc</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.funds.map((fund) => (
            <div key={fund.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{fund.name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full">
                  HOẠT ĐỘNG
                </span>
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {Number(fund.current_balance || 0).toLocaleString()} ₫
              </div>
              <div className="text-[11px] text-slate-400">
                Số dư đầu kỳ: {Number(fund.opening_balance || 0).toLocaleString()} ₫
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Bút Toán Giao Dịch Gần Đây</span>
          </h3>
          <Link
            to="/app/finance/ledger"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>Xem tất cả sổ cái</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã Giao Dịch</th>
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4">Nội Dung</th>
                <th className="py-3 px-4">Phương Thức</th>
                <th className="py-3 px-4 text-right">Số Tiền</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summary.recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{tx.transaction_code}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.transaction_date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{tx.description}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-medium text-[11px]">
                      {tx.payment_method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-bold font-mono ${
                        tx.transaction_type === 'INCOME'
                          ? 'text-emerald-400'
                          : tx.transaction_type === 'REVERSAL'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tx.transaction_type === 'INCOME' ? '+' : tx.transaction_type === 'REVERSAL' ? '↺' : '-'}
                      {Number(tx.amount).toLocaleString()} ₫
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold rounded-full text-[10px]">
                      POSTED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateFundModal
        isOpen={isCreateFundOpen}
        onClose={() => setIsCreateFundOpen(false)}
        onSuccess={loadData}
      />

      <RecordIncomeModal
        isOpen={isRecordIncomeOpen}
        onClose={() => setIsRecordIncomeOpen(false)}
        onSuccess={loadData}
        funds={summary.funds}
      />

      <CreateExpenseModal
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
        onSuccess={loadData}
        funds={summary.funds}
        categories={[]}
      />
    </div>
  );
};
