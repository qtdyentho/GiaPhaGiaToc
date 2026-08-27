import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { FundService } from '../services/FundService';
import { ExpenseRecord, Fund, ExpenseCategory } from '../types/database';
import { CreateExpenseModal } from '../components/finance/CreateExpenseModal';
import { useAuth } from '../contexts/AuthContext';

export const ExpensesPage: React.FC = () => {
  const { activeFamily, isFamilyAdmin } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFundId, setSelectedFundId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  const loadData = async () => {
    if (!activeFamily?.id) {
      setExpenses([]);
      setFunds([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const famId = activeFamily.id;
      const [expData, fundsData, catData] = await Promise.all([
        FundService.getExpenses(famId),
        FundService.getFunds(famId),
        FundService.getExpenseCategories(famId),
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
  }, [activeFamily?.id]);

  const totalExpenseDisbursed = expenses
    .filter((e) => e.status === 'APPROVED' || e.status === 'POSTED')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const filteredExpenses = expenses.filter((exp) => {
    const matchFund = selectedFundId === 'ALL' || exp.fund_id === selectedFundId;
    const matchSearch =
      !search.trim() ||
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.recipient_name && exp.recipient_name.toLowerCase().includes(search.toLowerCase())) ||
      (exp.description && exp.description.toLowerCase().includes(search.toLowerCase()));
    return matchFund && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-[#166534]" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-700 dark:text-rose-300 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Quản Lý Chi Phí & Xuất Quỹ Gia Tộc</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Minh Bạch Toàn Tộc
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Thủ quỹ & Kế toán ghi sổ xuất quỹ trực tiếp • Mọi thành viên cùng giám sát và đánh giá tính hợp lệ
            </p>
          </div>
        </div>

        {isFamilyAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Phiếu Chi & Xuất Quỹ</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Tiền Đã Xuất Quỹ</div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{totalExpenseDisbursed.toLocaleString()} ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {expenses.length} khoản chi đã ghi sổ cái bất biến
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Giám Sát Cộng Đồng</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">100% Công Khai</div>
          <div className="text-xs text-slate-400 mt-0.5">
            Mọi thành viên đều được tra cứu chứng từ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Quỹ Hoạt Động</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{funds.length} Quỹ Họ</div>
          <div className="text-xs text-slate-400 mt-0.5">Quản lý tài chính độc lập từng mục đích</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung chi, người nhận hoặc ghi chú chứng từ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white dark:focus:bg-slate-900 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Lọc theo Quỹ:</span>
          <select
            value={selectedFundId}
            onChange={(e) => setSelectedFundId(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600"
          >
            <option value="ALL">Tất Cả Các Quỹ</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khoản Chi / Nội Dung</th>
                <th className="py-3.5 px-4">Quỹ Chi Trả</th>
                <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Ngày Chi</th>
                <th className="py-3.5 px-4">Bên Nhận / Thụ Hưởng</th>
                <th className="py-3.5 px-4 text-center">Hóa Đơn / Chứng Từ</th>
                <th className="py-3.5 px-4 text-right">Trạng Thái Sổ Quỹ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-rose-500/20 border-t-rose-600 rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách chi tiêu...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có khoản chi nào được ghi nhận
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const fund = funds.find((f) => f.id === exp.fund_id);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                        {exp.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">{exp.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {fund?.name || 'Quỹ Họ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-700 dark:text-rose-400 text-sm">
                        {Number(exp.amount).toLocaleString()} ₫
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{exp.expense_date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{exp.recipient_name || 'Nhà cung cấp'}</td>
                      <td className="py-3.5 px-4 text-center">
                        {exp.receipt_url ? (
                          <button
                            onClick={() => setViewingReceiptUrl(exp.receipt_url || null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Ảnh/HĐ</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Phiếu chi nội bộ</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>ĐÃ XUẤT QUỸ</span>
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

      {/* Receipt Image Modal */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-heritage-green dark:text-emerald-400" />
                <span>Hóa Đơn / Chứng Từ Chi Tiêu Minh Bạch</span>
              </h3>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold"
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2">
              <img
                src={viewingReceiptUrl}
                alt="Chứng từ chi tiêu"
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Chung+Tu+Hop+Le';
                }}
              />
            </div>
            <div className="text-right">
              <a
                href={viewingReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateExpenseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
        funds={funds}
        categories={categories}
        familyId={activeFamily?.id}
      />
    </div>
  );
};

export default ExpensesPage;
