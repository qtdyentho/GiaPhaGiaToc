import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  BookOpen,
  ReceiptText,
  Receipt,
  Trophy,
  Landmark,
  ChevronRight,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { Fund, FinancialTransaction } from '../types/database';
import { RecordIncomeModal } from '../components/finance/RecordIncomeModal';
import { CreateExpenseModal } from '../components/finance/CreateExpenseModal';
import { CreateFundModal } from '../components/finance/CreateFundModal';
import { FundDetailModal } from '../components/finance/FundDetailModal';
import { formatCurrency, formatDate } from '../lib/utils';
import { Button, Card, Badge, StatCard } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export const FinanceDashboardPage: React.FC = () => {
  const { activeFamily } = useAuth();
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
  const [selectedFundDetail, setSelectedFundDetail] = useState<Fund | null>(null);
  const [targetIncomeFund, setTargetIncomeFund] = useState<Fund | null>(null);
  const [targetExpenseFund, setTargetExpenseFund] = useState<Fund | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const famId = activeFamily?.id || 'fam-0000-0001';
      const [summaryData, catData] = await Promise.all([
        FundService.getSummary(famId),
        FundService.getExpenseCategories(famId),
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
  }, [activeFamily?.id]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-tight">
                Trung Tâm Tài Chính & Sổ Quỹ Gia Tộc
              </h1>
              <Badge variant="gold">Sổ Quỹ Minh Bạch</Badge>
              <Badge variant="success">Ghi Sổ Chuẩn Mực</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ghi chép thu chi minh bạch, lưu truyền lịch sử quỹ dòng họ qua các thế hệ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateFundOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Tạo Quỹ
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTargetIncomeFund(null);
              setIsRecordIncomeOpen(true);
            }}
            icon={<ArrowDownLeft className="w-4 h-4" />}
          >
            Thu Tiền
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setTargetExpenseFund(null);
              setIsCreateExpenseOpen(true);
            }}
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
          icon={<Wallet className="w-5 h-5 text-[#166534]" />}
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
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#166534] hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] group-hover:bg-[#166534] group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Sổ Quỹ Gia Tộc</div>
              <div className="text-[11px] text-slate-500">Thu chi minh bạch & lịch sử ghi sổ</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#166534] transition" />
        </Link>

        <Link
          to="/app/finance/income"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#166534] hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] group-hover:bg-[#166534] group-hover:text-white transition">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Đóng Góp Thường Niên</div>
              <div className="text-[11px] text-slate-500">Định mức hương khói & việc họ</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#166534] transition" />
        </Link>

        <Link
          to="/app/finance/expenses"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#166534] hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] group-hover:bg-[#166534] group-hover:text-white transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Khoản Chi & Duyệt Chi</div>
              <div className="text-[11px] text-slate-500">Trưởng tộc & Thủ quỹ xét duyệt</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#166534] transition" />
        </Link>

        <Link
          to="/app/finance/honor-roll"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#166534] hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800 group-hover:bg-amber-800 group-hover:text-white transition">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Bảng Vàng Danh Dự</div>
              <div className="text-[11px] text-slate-500">Vinh danh công đức dòng họ</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#166534] transition" />
        </Link>
      </div>

      {/* Main Content Grid: Funds and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Funds List with Clickable Interaction */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#166534]" />
                  <span>Danh Sách Quỹ Gia Tộc Hoạt Động</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nhấn vào từng quỹ để xem chi tiết số dư, quy chế và lịch sử giao dịch
                </p>
              </div>
              <Badge variant="neutral">{summary.funds.length} Quỹ</Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {summary.funds.map((fund) => (
                <div
                  key={fund.id}
                  onClick={() => setSelectedFundDetail(fund)}
                  className="p-4 sm:p-5 hover:bg-emerald-50/40 hover:border-emerald-200/60 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-[#166534] shrink-0 text-base group-hover:bg-[#166534] group-hover:text-white transition-colors shadow-xs">
                      {fund.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#166534] transition-colors">
                          {fund.name}
                        </h3>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#166534] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{fund.description || 'Quỹ chuyên dùng của dòng họ'}</p>
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
          <Card className="p-0 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E3A5F]" />
                <span>Bút Toán Gần Đây</span>
              </h2>
              <Link to="/app/finance/ledger" className="text-xs font-bold text-[#166534] hover:underline">
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
                    <p className={`font-bold ${tx.amount >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
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

      {/* Fund Detail Modal */}
      <FundDetailModal
        isOpen={Boolean(selectedFundDetail)}
        onClose={() => setSelectedFundDetail(null)}
        fund={selectedFundDetail}
        onRecordIncome={(fund) => {
          setTargetIncomeFund(fund);
          setIsRecordIncomeOpen(true);
        }}
        onCreateExpense={(fund) => {
          setTargetExpenseFund(fund);
          setIsCreateExpenseOpen(true);
        }}
      />

      {/* Modals */}
      <RecordIncomeModal
        isOpen={isRecordIncomeOpen}
        onClose={() => setIsRecordIncomeOpen(false)}
        onSuccess={loadData}
        funds={targetIncomeFund ? [targetIncomeFund, ...summary.funds.filter((f) => f.id !== targetIncomeFund.id)] : summary.funds}
        familyId={activeFamily?.id}
      />

      <CreateExpenseModal
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
        onSuccess={loadData}
        funds={targetExpenseFund ? [targetExpenseFund, ...summary.funds.filter((f) => f.id !== targetExpenseFund.id)] : summary.funds}
        categories={categories}
        familyId={activeFamily?.id}
      />

      <CreateFundModal
        isOpen={isCreateFundOpen}
        onClose={() => setIsCreateFundOpen(false)}
        onSuccess={loadData}
        familyId={activeFamily?.id}
      />
    </div>
  );
};

export default FinanceDashboardPage;
