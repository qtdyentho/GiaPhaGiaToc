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
  ChevronRight,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { Fund, FinancialTransaction } from '../types/database';
import { RecordIncomeModal } from '../components/finance/RecordIncomeModal';
import { CreateExpenseModal } from '../components/finance/CreateExpenseModal';
import { CreateFundModal } from '../components/finance/CreateFundModal';
import { formatCurrency, formatDate } from '../lib/utils';
import { Button, Card, Badge, PageHeader, StatCard } from '../components/ui';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRecordIncomeOpen, setIsRecordIncomeOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isCreateFundOpen, setIsCreateFundOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, catData] = await Promise.all([
        FundService.getSummary(),
        FundService.getExpenseCategories(),
      ]);
      setSummary(summaryData);
      setCategories(catData);
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
      {/* Page Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-heritage-green via-heritage-gold to-heritage-navy" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-heritage-gold shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-tight">
                Trung Tâm Tài Chính & Sổ Quỹ Gia Tộc
              </h1>
              <Badge variant="gold">Financial Core v2.0</Badge>
              <Badge variant="success">Bất biến 100%</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kế toán kép bất biến, minh bạch tuyệt đối 100% dòng tiền & công đức dòng họ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateFundOpen(true)}
            icon={<Landmark className="w-4 h-4 text-heritage-gold" />}
          >
            Tạo Quỹ Mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRecordIncomeOpen(true)}
            icon={<ArrowDownLeft className="w-4 h-4" />}
          >
            Ghi Thu Quỹ
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsCreateExpenseOpen(true)}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            Đề Xuất Chi
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Số Dư Khả Dụng"
          value={formatCurrency(summary.totalBalance)}
          subtitle={`${summary.funds.length} Quỹ hoạt động`}
          icon={<Wallet className="w-5 h-5 text-heritage-green" />}
          variant="green"
        />

        <StatCard
          title="Tổng Thu Lũy Kế"
          value={formatCurrency(summary.totalIncome)}
          subtitle="Bổ phần & Công đức"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          variant="default"
        />

        <StatCard
          title="Tổng Chi Lũy Kế"
          value={formatCurrency(summary.totalExpense)}
          subtitle={`${summary.pendingExpensesCount} Khoản chi chờ duyệt`}
          icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          variant="default"
        />

        <StatCard
          title="Công Nợ Cần Thu"
          value={formatCurrency(summary.totalReceivable)}
          subtitle="Bổ phần định kỳ chưa thu"
          icon={<ReceiptText className="w-5 h-5 text-amber-600" />}
          variant="gold"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/app/finance/ledger"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-heritage-green hover:shadow-card transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-heritage-green group-hover:bg-heritage-green group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Sổ Quỹ Bất Biến</div>
              <div className="text-[11px] text-slate-500">Tra cứu & Bút toán hoàn trả</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-green transition" />
        </Link>

        <Link
          to="/app/finance/income"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-heritage-green hover:shadow-card transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-heritage-green group-hover:bg-heritage-green group-hover:text-white transition">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Thu Định Mức</div>
              <div className="text-[11px] text-slate-500">Bổ phần định kỳ dòng họ</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-green transition" />
        </Link>

        <Link
          to="/app/finance/expenses"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-heritage-green hover:shadow-card transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-heritage-green group-hover:bg-heritage-green group-hover:text-white transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Khoản Chi & Duyệt Chi</div>
              <div className="text-[11px] text-slate-500">Quy trình duyệt chi 2 cấp</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-green transition" />
        </Link>

        <Link
          to="/app/finance/honor-roll"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-heritage-green hover:shadow-card transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-heritage-gold group-hover:bg-heritage-gold group-hover:text-white transition">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Bảng Vàng Danh Dự</div>
              <div className="text-[11px] text-slate-500">Vinh danh công đức dòng họ</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-green transition" />
        </Link>
      </div>

      {/* Main Content Grid: Funds and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Funds List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-heritage-green" />
                <span>Danh Sách Quỹ Gia Tộc Hoạt Động</span>
              </h2>
              <Badge variant="neutral">{summary.funds.length} Quỹ</Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {summary.funds.map((fund) => (
                <div key={fund.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-heritage-green shrink-0">
                      {fund.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{fund.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{fund.description || 'Quỹ chuyên dùng của dòng họ'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-bold text-slate-900">{formatCurrency(fund.current_balance)}</div>
                    <Badge variant={fund.current_balance > 0 ? 'success' : 'neutral'} size="sm">
                      {fund.current_balance > 0 ? 'Có số dư' : 'Số dư 0đ'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Recent Transactions */}
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-heritage-navy" />
                <span>Bút Toán Gần Đây</span>
              </h2>
              <Link to="/app/finance/ledger" className="text-xs font-semibold text-heritage-green hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {summary.recentTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 hover:bg-slate-50/80 transition text-xs flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 line-clamp-1">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(tx.transaction_date)} • {tx.transaction_type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant="neutral" size="sm">{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
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
        categories={categories}
      />

      <CreateFundModal
        isOpen={isCreateFundOpen}
        onClose={() => setIsCreateFundOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
