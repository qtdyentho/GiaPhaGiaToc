import React, { useState } from 'react';
import { X, RotateCcw, ShieldAlert, Check, AlertTriangle } from 'lucide-react';
import { FinancialTransaction, Fund } from '../../types/database';
import { FundService } from '../../services/FundService';
import { useAuth } from '../../contexts/AuthContext';

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
  familyId,
}) => {
  const { activeFamily } = useAuth();
  const targetFamId = familyId || activeFamily?.id || '';
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
      const res = await FundService.reverseTransaction(transaction.id, targetFamId, reason.trim());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hoàn Trả Bút Toán Thu Chi</h3>
              <p className="text-xs text-slate-500">Ghi nhận phiếu hoàn trả & bảo toàn lịch sử sổ quỹ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Transaction Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã chứng từ:</span>
              <span className="font-bold text-slate-900">{transaction.transaction_code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Loại giao dịch:</span>
              <span
                className={`font-semibold ${
                  transaction.transaction_type === 'INCOME' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {transaction.transaction_type === 'INCOME' ? 'Phiếu thu' : 'Phiếu chi'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-bold text-slate-900">{Number(transaction.amount).toLocaleString()} ₫</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Quỹ:</span>
              <span className="text-slate-900">{fund?.name || 'Quỹ gia tộc'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Nguyên tắc minh bạch:</strong> Chứng từ gốc được lưu giữ nguyên vẹn để đối soát. Hệ thống sẽ tạo một phiếu hoàn trả đối ứng <code>REV-{transaction.transaction_code}</code> để cân bằng số dư quỹ chính xác.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lý do đảo ngược giao dịch <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Nhập nhầm số tiền, hủy phiếu thu do thanh toán trùng..."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
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
