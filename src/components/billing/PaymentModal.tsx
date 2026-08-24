import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { PaymentIntent, PaymentService } from '../../services/billing/PaymentService';
import { formatCurrency } from '../../lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent: PaymentIntent | null;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  intent,
  onPaymentSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 phút

  useEffect(() => {
    if (intent) {
      setPaymentStatus(intent.status);
    }
  }, [intent]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen || !intent) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClientPaid = () => {
    const updated = PaymentService.notifyClientPaid(intent);
    setPaymentStatus(updated.status);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-heritage-navy to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-heritage-green flex items-center justify-center text-heritage-gold font-bold shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Thanh Toán VietQR NAPAS247</h2>
              <p className="text-[11px] text-amber-300">Tự động kích hoạt ngay khi ngân hàng khớp lệnh</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {paymentStatus === 'WAITING_BANK' ? (
            /* Waiting Bank State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto text-heritage-green animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Đang Chờ Ngân Hàng Xác Nhận Giao Dịch
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Hệ thống đang lắng nghe Webhook ngân hàng. Gói cước sẽ được kích hoạt tự động sau 5-15 giây.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 text-left space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>An Toàn Giao Dịch:</span>
                </div>
                <div>Mã nội dung: <strong>{intent.reference_code}</strong></div>
                <div>Số tiền: <strong>{formatCurrency(intent.amount)}</strong></div>
              </div>
            </div>
          ) : (
            /* VietQR QR Code & Bank Info */
            <>
              {/* QR Image Frame */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <img
                  src={intent.qr_url}
                  alt="VietQR Payment"
                  className="w-56 h-56 object-contain rounded-xl shadow-xs border border-slate-200 bg-white"
                />
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold mt-2.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Mã QR hết hạn sau:{' '}
                    <strong className="text-slate-800">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Transfer Details Cards */}
              <div className="space-y-2 text-xs">
                {/* Bank Name */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Ngân hàng:</span>
                  <strong className="text-slate-900">{intent.bank_name}</strong>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Số tài khoản:</span>
                  <div className="flex items-center space-x-2">
                    <strong className="text-slate-900 font-mono text-sm">{intent.account_no}</strong>
                    <button
                      onClick={() => handleCopy(intent.account_no, 'account_no')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                      title="Sao chép"
                    >
                      {copiedField === 'account_no' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-heritage-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 font-medium">Số tiền chính xác:</span>
                  <strong className="text-emerald-950 font-mono text-sm font-black">
                    {formatCurrency(intent.amount)}
                  </strong>
                </div>

                {/* Reference Code (Bắt buộc giữ nguyên) */}
                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-amber-800 font-medium block">Nội dung chuyển khoản:</span>
                    <span className="text-[10px] text-amber-700">(Bắt buộc giữ nguyên để tự động kích hoạt)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <strong className="text-amber-950 font-mono text-sm font-bold bg-white px-2 py-0.5 rounded border border-amber-300">
                      {intent.reference_code}
                    </strong>
                    <button
                      onClick={() => handleCopy(intent.reference_code, 'reference_code')}
                      className="p-1 hover:bg-amber-200 rounded text-amber-900 transition"
                      title="Sao chép"
                    >
                      {copiedField === 'reference_code' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-heritage-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Đóng
          </button>

          {paymentStatus !== 'WAITING_BANK' && (
            <button
              onClick={handleClientPaid}
              className="flex items-center space-x-1.5 px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tôi Đã Chuyển Khoản</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
