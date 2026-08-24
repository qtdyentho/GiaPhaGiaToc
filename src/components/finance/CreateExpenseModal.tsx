import React, { useState } from 'react';
import { X, Receipt, Check, AlertTriangle, Building, CreditCard } from 'lucide-react';
import { Fund, ExpenseCategory, PaymentMethod } from '../../types/database';
import { FundService } from '../../services/FundService';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  funds: Fund[];
  categories: ExpenseCategory[];
  familyId?: string;
}

export const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funds,
  categories,
  familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}) => {
  const [title, setTitle] = useState('');
  const [fundId, setFundId] = useState(funds[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedFund = funds.find((f) => f.id === fundId);
  const isInsufficient = selectedFund && Number(amount) > Number(selectedFund.current_balance || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title.trim() || !numAmount || numAmount <= 0) {
      setError('Vui lòng điền tiêu đề và số tiền hợp lệ');
      return;
    }

    if (isInsufficient) {
      setError('Số dư quỹ hiện tại không đủ để đề xuất khoản chi này');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await FundService.createExpense({
        familyId,
        fundId,
        categoryId,
        title: title.trim(),
        amount: numAmount,
        recipientName: recipientName.trim() || 'Nhà cung cấp',
        expenseDate,
        paymentMethod,
        description: description.trim() || title.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Lỗi khi đề xuất chi');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Lập Phiếu Đề Xuất Chi Tiền</h3>
              <p className="text-xs text-slate-400">Quy trình kiểm soát & phê duyệt minh bạch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nội dung khoản chi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Mua lễ vật Giỗ Tổ, Sửa chữa mái từ đường..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quỹ chi trả</label>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Còn: {Number(f.current_balance || 0).toLocaleString()} ₫)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Danh mục chi</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Số tiền chi (VNĐ) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 5000000"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-rose-500"
                required
              />
              {isInsufficient && (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" /> Vượt quá số dư quỹ hiện tại!
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Người nhận / Đơn vị</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="VD: Nhà xe, Thợ nề, Cửa hàng hoa..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày dự kiến chi</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hình thức chi</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="BANK_TRANSFER">Chuyển Khoản Ngân Hàng</option>
                <option value="CASH">Tiền Mặt</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Diễn giải chi tiết</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú thêm về chứng từ, hóa đơn kèm theo..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(isInsufficient)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang gửi...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Gửi Đề Xuất Duyệt Chi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
