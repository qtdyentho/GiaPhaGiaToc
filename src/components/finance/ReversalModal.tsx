import React, { useState } from 'react';
import { X, RotateCcw, ShieldAlert, Check, AlertTriangle } from 'lucide-react';
import { FinancialTransaction, Fund } from '../../types/database';
import { FundService } from '../../services/FundService';

interface ReversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: FinancialTransaction | null;
  funds: Fund[];
  familyId?: string;
}

export const ReversalModal: React.FC<ReversalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  funds,
  familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const fund = funds.find((f) => f.id === transaction.fund_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy/đảo ngược giao dịch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await FundService.reverseTransaction(transaction.id, familyId, reason.trim());
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Không thể thực hiện đảo bút toán');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Đảo Bút Toán Giao Dịch</h3>
              <p className="text-xs text-slate-400">Sổ cái bất biến (Immutable Ledger)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Transaction Info */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mã chứng từ:</span>
              <span className="font-mono font-bold text-slate-200">{transaction.transaction_code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Loại giao dịch:</span>
              <span
                className={`font-semibold ${
                  transaction.transaction_type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {transaction.transaction_type === 'INCOME' ? 'Thu tiền' : 'Chi tiền'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số tiền:</span>
              <span className="font-mono font-bold text-slate-100">{Number(transaction.amount).toLocaleString()} ₫</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Quỹ:</span>
              <span className="text-slate-200">{fund?.name || 'Quỹ gia tộc'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Quy tắc bất biến:</strong> Giao dịch gốc sẽ được giữ nguyên và đánh dấu <code>REVERSED</code>. Hệ thống tự động tạo bút toán đối ứng <code>REV-{transaction.transaction_code}</code> để hoàn trả quỹ chính xác.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lý do đảo ngược giao dịch <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Nhập nhầm số tiền, hủy phiếu thu do thanh toán trùng..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              required
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Đảo Bút Toán</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
