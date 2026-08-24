import React, { useState } from 'react';
import { X, HeartHandshake, QrCode, Check, Building, User, EyeOff, Sparkles } from 'lucide-react';
import { Fund, PaymentMethod, SponsorType } from '../../types/database';
import { FundService } from '../../services/FundService';
import { VietQRService } from '../../services/VietQRService';
import { mockMembers } from '../../services/mockData';

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  funds: Fund[];
  familyId?: string;
}

export const AddContributionModal: React.FC<AddContributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funds,
  familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}) => {
  const [donorType, setDonorType] = useState<SponsorType>('MEMBER');
  const [selectedMemberId, setSelectedMemberId] = useState(mockMembers[0]?.id || '');
  const [customDonorName, setCustomDonorName] = useState('');
  const [fundId, setFundId] = useState(funds[0]?.id || '');
  const [amount, setAmount] = useState<string>('5000000');
  const [purpose, setPurpose] = useState('Công đức tu bổ nhà thờ họ');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR');
  const [showQR, setShowQR] = useState(paymentMethod === 'VIETQR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedDonorName =
    donorType === 'MEMBER'
      ? mockMembers.find((m) => m.id === selectedMemberId)?.full_name || 'Thành viên'
      : donorType === 'ANONYMOUS'
      ? 'Nhà hảo tâm ẩn danh'
      : customDonorName.trim() || 'Nhà tài trợ';

  const memo = VietQRService.generateMemo('CONTRIBUTION', 'CONGDUC', resolvedDonorName);
  const qrUrl = VietQRService.generateQRUrl({
    amount: Number(amount) || 0,
    memo,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Số tiền đóng góp phải lớn hơn 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await FundService.createContribution({
        family_id: familyId,
        member_id: donorType === 'MEMBER' ? selectedMemberId : undefined,
        donor_name: resolvedDonorName,
        fund_id: fundId,
        amount: numAmount,
        purpose: purpose.trim(),
        payment_method: paymentMethod,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Lỗi khi ghi nhận đóng góp');
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
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Ghi Nhận Đóng Góp / Công Đức</h3>
              <p className="text-xs text-slate-400">Vinh danh công đức dòng họ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Donor Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Đối tượng đóng góp</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDonorType('MEMBER')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  donorType === 'MEMBER'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Thành Viên Tộc</span>
              </button>

              <button
                type="button"
                onClick={() => setDonorType('BUSINESS')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  donorType === 'BUSINESS'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Doanh Nghiệp / Tổ Chức</span>
              </button>

              <button
                type="button"
                onClick={() => setDonorType('ANONYMOUS')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  donorType === 'ANONYMOUS'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ẩn Danh</span>
              </button>
            </div>
          </div>

          {donorType === 'MEMBER' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chọn thành viên trong gia tộc</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              >
                {mockMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.life_status === 'DECEASED' ? 'Tiền bối' : 'Hậu duệ'})
                  </option>
                ))}
              </select>
            </div>
          ) : donorType === 'BUSINESS' || donorType === 'OTHER' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên cá nhân / Doanh nghiệp tài trợ <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customDonorName}
                onChange={(e) => setCustomDonorName(e.target.value)}
                placeholder="VD: Công ty TNHH Xây dựng Thành Đạt..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quỹ tiếp nhận</label>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
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
                Số tiền công đức (VNĐ) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mục đích / Hạng mục tài trợ</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="VD: Tài trợ ngói âm dương lợp nhà thờ, Học bổng thủ khoa..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hình thức tiếp nhận</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('VIETQR');
                  setShowQR(true);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'VIETQR'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Mã VietQR Chuyển Khoản</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('BANK_TRANSFER');
                  setShowQR(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Chuyển Khoản Trực Tiếp / Khác</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'VIETQR' && showQR && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <img src={qrUrl} alt="VietQR" className="w-44 h-44 object-contain rounded-lg" />
              </div>
              <div className="text-center text-xs space-y-1">
                <p className="text-slate-300">Nội dung chuyển khoản:</p>
                <code className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs">
                  {memo}
                </code>
              </div>
            </div>
          )}

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
                <span>Đang ghi nhận...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Vinh Danh Công Đức</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
