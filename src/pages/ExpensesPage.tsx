import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  XCircle,
  Search,
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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-[#166534]" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span>Quản Lý Khoản Chi & Duyệt Chi</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                Quy Trình 2 Cấp
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Duyệt chi nghiêm ngặt bởi Ban Kiểm Soát & Trưởng Tộc (Chỉ xuất quỹ khi đã APPROVED)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Xuất Chi Mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã Phê Duyệt & Xuất Quỹ</div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{totalExpenseApproved.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {expenses.filter((e) => e.status === 'APPROVED').length} khoản chi đã giải ngân
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Đang Chờ Duyệt Chi</div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{totalExpensePending.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {expenses.filter((e) => e.status === 'PENDING_APPROVAL').length} đề xuất cần thẩm định
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Số Đề Xuất Chi</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{expenses.length} hồ sơ</div>
          <div className="text-xs text-slate-400 mt-0.5">Toàn bộ chi phái & ban ngành</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung chi hoặc người nhận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-rose-500/20 border-t-rose-600 rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách khoản chi...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không có đề xuất chi nào trong danh sách
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const fund = funds.find((f) => f.id === exp.fund_id);
                  const isApproved = exp.status === 'APPROVED';
                  const isRejected = exp.status === 'REJECTED';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{exp.title}</div>
                        {exp.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 italic">{exp.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {fund?.name || 'Quỹ Chung'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-700 font-mono text-sm">
                        {Number(exp.amount).toLocaleString()} ₫
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{exp.expense_date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{exp.recipient_name || 'Nhà cung cấp'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                          }`}
                        >
                          {isApproved ? 'ĐÃ DUYỆT CHI' : isRejected ? 'ĐÃ TỪ CHỐI' : 'CHỜ DUYỆT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isApproved ? (
                          <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã trừ quỹ</span>
                          </span>
                        ) : isRejected ? (
                          <span className="text-rose-700 font-semibold text-xs flex items-center justify-end gap-1">
                            <XCircle className="w-4 h-4" />
                            <span>Đã hủy</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setApprovalTarget(exp)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-xs inline-flex items-center gap-1"
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

export default ExpensesPage;
