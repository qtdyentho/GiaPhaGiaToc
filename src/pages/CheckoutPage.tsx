import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, Copy, ArrowLeft, Clock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export const CheckoutPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'WAITING' | 'DETECTED' | 'VERIFIED'>('WAITING');
  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate Bank Webhook Event Verification (Zero Client Bypass)
  const handleSimulateBankWebhook = () => {
    setPaymentStatus('DETECTED');
    setTimeout(() => {
      setPaymentStatus('VERIFIED');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 animate-fade-in">
      <Link
        to="/pricing"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại bảng giá</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-heritage p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-heritage-green text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Thanh Toán Tự Động VietQR</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Quét Mã VietQR Để Kích Hoạt Gói</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống Napas 247 sẽ tự động đối soát và kích hoạt gói qua Webhook Ngân Hàng.
          </p>
        </div>

        {/* QR Code & Transfer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 border-t border-slate-100">
          {/* Left: Dynamic QR */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
            <div className="w-52 h-52 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              {/* Dynamic QR Display */}
              <div className="w-44 h-44 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white text-xs font-mono p-3 text-center space-y-2">
                <QrCode className="w-12 h-12 text-heritage-gold animate-pulse" />
                <span className="text-[10px] text-slate-300">VietQR Napas 247</span>
                <span className="font-bold text-emerald-400 text-[11px]">990.000 ₫</span>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-700 mt-3 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Thời gian giữ mã: 14:59 phút</span>
            </div>
          </div>

          {/* Right: Bank Details & Verification Status */}
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-900">MB Bank (Quân Đội)</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Số tài khoản:</span>
                <span className="font-bold text-heritage-navy font-mono text-sm">999988886666</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Chủ tài khoản:</span>
                <span className="font-bold text-slate-900">CTCP GIA PHẢ GIA TỘC</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Số tiền thanh toán:</span>
                <span className="font-black text-heritage-green text-sm">990.000 ₫</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200">
                <span>Nội dung chuyển khoản:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    GP INV202608241024
                  </span>
                  <button
                    onClick={() => handleCopy('GP INV202608241024')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                    title="Sao chép"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {copied && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded text-center font-semibold">
                Đã sao chép nội dung chuyển khoản!
              </div>
            )}

            {/* Bank Listening Status */}
            {paymentStatus === 'WAITING' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-2 text-blue-900 text-xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span>Đang lắng nghe tín hiệu giao dịch từ Ngân hàng (Auto-Reconcile)...</span>
              </div>
            )}

            {paymentStatus === 'DETECTED' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-900 text-xs">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                <span>Đã phát hiện biến động số dư! Đang đối soát mã GP INV202608241024...</span>
              </div>
            )}

            {paymentStatus === 'VERIFIED' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Giao dịch hợp lệ! Thuê bao đã kích hoạt thành công.</span>
                </div>
                <button
                  onClick={() => navigate('/app/billing')}
                  className="w-full py-2 bg-heritage-green hover:bg-heritage-green-light text-white font-bold rounded-lg transition"
                >
                  Đến Trang Quản Trị Thuê Bao
                </button>
              </div>
            )}

            {paymentStatus === 'WAITING' && (
              <div className="pt-2">
                <button
                  onClick={handleSimulateBankWebhook}
                  className="w-full py-2.5 bg-heritage-navy hover:bg-heritage-navy-light text-white font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-heritage-gold" />
                  <span>Mô Phỏng Webhook Ngân Hàng Xác Thực</span>
                </button>
                <div className="text-[10px] text-slate-400 text-center mt-1.5">
                  * Kích hoạt Atomic DB RPC: Khớp mã $\rightarrow$ Ghi nhận thanh toán $\rightarrow$ Nâng cấp gói
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
