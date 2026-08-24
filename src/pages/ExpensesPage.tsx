import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { ExpenseRecord, Fund, ExpenseCategory } from '../types/database';
import { CreateExpenseModal } from '../components/finance/CreateExpenseModal';
import { ExpenseApprovalModal } from '../components/finance/ExpenseApprovalModal';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState<ExpenseRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, fundsData, catData] = await Promise.all([
        FundService.getExpenses(),
        FundService.getFunds(),
        FundService.getExpenseCategories(),
      ]);
      setExpenses(expData);
      setFunds(fundsData);
      setCategories(catData);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chi phí:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalExpenseApproved = expenses
    .filter((e) => e.status === 'APPROVED')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalExpensePending = expenses
    .filter((e) => e.status === 'PENDING_APPROVAL')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const filteredExpenses = expenses.filter((exp) => {
    const matchStatus = selectedStatus === 'ALL' || exp.status === selectedStatus;
    const matchSearch =
      !search.trim() ||
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.recipient_name && exp.recipient_name.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>Quản Lý Khoản Chi & Quy Trình Phê Duyệt</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold">
                BR-EXP-001
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Duyệt chi nghiêm ngặt bởi Ban Kiểm Soát (Chỉ trừ quỹ khi APPROVED)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Xuất Chi Mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Đã Phê Duyệt & Xuất Quỹ</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{totalExpenseApproved.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {expenses.filter((e) => e.status === 'APPROVED').length} khoản chi đã giải ngân
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-5">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Đang Chờ Duyệt Chi</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{totalExpensePending.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {expenses.filter((e) => e.status === 'PENDING_APPROVAL').length} đề xuất cần thẩm định
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Đề Xuất Chi</div>
          <div className="text-2xl font-black text-slate-100 mt-1">{expenses.length} hồ sơ</div>
          <div className="text-xs text-slate-400 mt-0.5">Toàn bộ chi phái & ban ngành</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung chi hoặc người nhận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'ALL'
                ? 'Tất cả'
                : status === 'PENDING_APPROVAL'
                ? 'Chờ duyệt'
                : status === 'APPROVED'
                ? 'Đã duyệt'
                : 'Đã từ chối'}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khoản Chi / Mục Đích</th>
                <th className="py-3.5 px-4">Quỹ Chi Trả</th>
                <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Ngày Chi</th>
                <th className="py-3.5 px-4">Đơn Vị Thụ Hưởng</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái Duyệt</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách khoản chi...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không có đề xuất chi nào trong danh sách
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const fund = funds.find((f) => f.id === exp.fund_id);
                  const isApproved = exp.status === 'APPROVED';
                  const isRejected = exp.status === 'REJECTED';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">{exp.title}</div>
                        {exp.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 italic">{exp.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {fund?.name || 'Quỹ Chung'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-400 font-mono text-sm">
                        {Number(exp.amount).toLocaleString()} ₫
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{exp.expense_date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{exp.recipient_name || 'Nhà cung cấp'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isRejected
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isApproved ? 'ĐÃ DUYỆT CHI' : isRejected ? 'ĐÃ TỪ CHỐI' : 'CHỜ DUYỆT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isApproved ? (
                          <span className="text-slate-400 font-semibold text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Đã trừ quỹ</span>
                          </span>
                        ) : isRejected ? (
                          <span className="text-rose-400 font-semibold text-xs flex items-center justify-end gap-1">
                            <XCircle className="w-4 h-4" />
                            <span>Đã hủy</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setApprovalTarget(exp)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm inline-flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Thẩm Định / Duyệt</span>
                          </button>
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
      <CreateExpenseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
        funds={funds}
        categories={categories}
      />

      <ExpenseApprovalModal
        isOpen={Boolean(approvalTarget)}
        onClose={() => setApprovalTarget(null)}
        onSuccess={loadData}
        expense={approvalTarget}
        funds={funds}
      />
    </div>
  );
};
