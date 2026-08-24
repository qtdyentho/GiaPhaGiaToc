import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, DollarSign, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { Fund, IncomeAssessment, PaymentMethod } from '../../types/database';
import { FundService } from '../../services/FundService';
import { VietQRService } from '../../services/VietQRService';
import { mockMembers } from '../../services/mockData';

interface RecordIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assessment?: IncomeAssessment | null;
  funds: Fund[];
  familyId?: string;
}

export const RecordIncomeModal: React.FC<RecordIncomeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assessment,
  funds,
  familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}) => {
  const member = mockMembers.find((m) => m.id === assessment?.member_id);
  const remaining = assessment ? Math.max(0, Number(assessment.amount_due) - Number(assessment.amount_paid)) : 500000;

  const [fundId, setFundId] = useState(assessment?.fund_id || funds[0]?.id || '');
  const [amount, setAmount] = useState<string>(remaining.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(
    assessment ? `Thu tiền ${assessment.title} - ${member?.full_name || 'Thành viên'}` : 'Thu quỹ gia tộc'
  );
  const [showQR, setShowQR] = useState(paymentMethod === 'VIETQR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const memo = VietQRService.generateMemo('ASSESSMENT', assessment?.id || 'THU', member?.full_name);
  const qrUrl = VietQRService.generateQRUrl({
    amount: Number(amount) || 0,
    memo,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Số tiền thanh toán phải lớn hơn 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await FundService.recordIncomePayment({
        familyId,
        fundId,
        assessmentId: assessment?.id,
        memberId: assessment?.member_id,
        amount: numAmount,
        paymentMethod,
        transactionDate,
        description: description.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Lỗi khi ghi nhận thu tiền');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Ghi Nhận Thực Thu Tiền</h3>
              <p className="text-xs text-slate-400">
                {member ? `Thành viên: ${member.full_name}` : 'Nộp tiền vào quỹ gia tộc'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {assessment && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Khoản phải thu:</span>
                <p className="font-semibold text-slate-200">{assessment.title}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Còn lại phải nộp:</span>
                <p className="font-bold text-amber-400 font-mono">{remaining.toLocaleString()} ₫</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quỹ nộp vào</label>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Số tiền thực thu (VNĐ) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phương thức thanh toán</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('VIETQR');
                  setShowQR(true);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'VIETQR'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Mã VietQR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setShowQR(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tiền Mặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('BANK_TRANSFER');
                  setShowQR(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Chuyển Khoản</span>
              </button>
            </div>
          </div>

          {/* VietQR Display Card */}
          {paymentMethod === 'VIETQR' && showQR && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <img
                  src={qrUrl}
                  alt="VietQR Chuyển Khoản"
                  className="w-48 h-48 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-center text-xs space-y-1">
                <p className="text-slate-300 font-medium">Nội dung chuyển khoản chuẩn:</p>
                <code className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs">
                  {memo}
                </code>
                <p className="text-[11px] text-slate-500">Quét mã bằng ứng dụng Ngân hàng để thanh toán tự động</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày nộp tiền</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ghi chú phiếu thu</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Nguyễn Văn Hoàng nộp quỹ..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Thao tác sẽ tự động ghi sổ cái POSTED, cập nhật hạn mức và số dư quỹ tức thì.</span>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Nộp Tiền Vào Sổ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
