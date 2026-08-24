import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ShieldAlert, DollarSign, Calendar, UserCheck } from 'lucide-react';
import { ExpenseRecord, Fund } from '../../types/database';
import { FundService } from '../../services/FundService';

interface ExpenseApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense: ExpenseRecord | null;
  funds: Fund[];
  familyId?: string;
  currentUserId?: string;
}

export const ExpenseApprovalModal: React.FC<ExpenseApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expense,
  funds,
  familyId = 'fam-0000-0001',
  currentUserId = '11111111-1111-1111-1111-111111111111',
}) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !expense) return null;

  const fund = funds.find((f) => f.id === expense.fund_id);
  const isBalanceSufficient = fund ? Number(fund.current_balance || 0) >= Number(expense.amount || 0) : false;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await FundService.approveExpense(expense.id, familyId, currentUserId);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Không thể phê duyệt khoản chi');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi xảy ra trong quá trình phê duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    setLoading(true);
    // update status
    expense.status = 'REJECTED';
    expense.rejection_reason = rejectReason.trim();
    onSuccess();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thẩm Định & Phê Duyệt Chi Quỹ</h3>
              <p className="text-xs text-slate-500">Mã phiếu: {expense.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Expense Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-500">Khoản chi:</span>
                <h4 className="text-sm font-bold text-slate-900">{expense.title}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Số tiền:</span>
                <p className="text-base font-bold text-rose-600 font-mono">
                  {Number(expense.amount).toLocaleString()} ₫
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-500">Quỹ thanh toán:</span>
                <p className="font-semibold text-slate-900">{fund?.name || 'Quỹ'}</p>
              </div>
              <div>
                <span className="text-slate-500">Người nhận:</span>
                <p className="font-semibold text-slate-900">{expense.recipient_name || 'Nhà cung cấp'}</p>
              </div>
              <div>
                <span className="text-slate-500">Ngày dự kiến chi:</span>
                <p className="text-slate-700">{expense.expense_date}</p>
              </div>
              <div>
                <span className="text-slate-500">Hình thức:</span>
                <p className="text-slate-700">{expense.payment_method}</p>
              </div>
            </div>

            {expense.description && (
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">Diễn giải:</span>
                <p className="text-slate-700 italic">{expense.description}</p>
              </div>
            )}
          </div>

          {/* Fund Impact Preview */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số dư quỹ hiện tại:</span>
              <span className="font-mono text-slate-900">
                {Number(fund?.current_balance || 0).toLocaleString()} ₫
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số dư sau khi duyệt:</span>
              <span
                className={`font-mono font-bold ${
                  isBalanceSufficient ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {(Number(fund?.current_balance || 0) - Number(expense.amount || 0)).toLocaleString()} ₫
              </span>
            </div>
          </div>

          {!isBalanceSufficient && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Số dư quỹ không đủ để thực hiện phê duyệt khoản chi này.</span>
            </div>
          )}

          {rejectMode && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-rose-700">Lý do từ chối phê duyệt *</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ghi rõ lý do để người lập phiếu chỉnh sửa..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Đóng
            </button>

            <div className="flex items-center gap-2">
              {!rejectMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Từ Chối</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading || !isBalanceSufficient}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span>Đang duyệt...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Phê Duyệt & Xuất Quỹ</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectMode(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Hủy từ chối
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Xác Nhận Từ Chối
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
