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
  familyId = 'fam-0000-0001',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ghi Nhận Thực Thu Tiền</h3>
              <p className="text-xs text-slate-500">
                {member ? `Thành viên: ${member.full_name}` : 'Nộp tiền vào quỹ gia tộc'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {assessment && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Khoản phải thu:</span>
                <p className="font-bold text-slate-900">{assessment.title}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Còn lại phải nộp:</span>
                <p className="font-bold text-amber-800 text-sm">{remaining.toLocaleString()} ₫</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Quỹ nộp vào</label>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số tiền thực thu (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Phương thức thanh toán</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('VIETQR');
                  setShowQR(true);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'VIETQR'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Mã VietQR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setShowQR(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-slate-700" />
                <span>Tiền Mặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('BANK_TRANSFER');
                  setShowQR(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-700" />
                <span>Chuyển Khoản</span>
              </button>
            </div>
          </div>

          {/* VietQR Display Card */}
          {paymentMethod === 'VIETQR' && showQR && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-3">
              <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={qrUrl}
                  alt="VietQR Chuyển Khoản"
                  className="w-44 h-44 object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-center text-xs space-y-1">
                <p className="text-slate-600 font-semibold">Nội dung chuyển khoản chuẩn:</p>
                <code className="px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-amber-900 text-xs font-bold">
                  {memo}
                </code>
                <p className="text-[11px] text-slate-400">Quét mã bằng ứng dụng Ngân hàng để thanh toán tự động</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày nộp tiền</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chú phiếu thu</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Nguyễn Văn Hoàng nộp quỹ..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" />
            <span>Thao tác sẽ tự động ghi sổ cái POSTED, cập nhật hạn mức và số dư quỹ tức thì.</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
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

export default RecordIncomeModal;
