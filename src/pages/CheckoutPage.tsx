import React, { useState } from 'react';
import { QrCode, CheckCircle2, Copy, ArrowLeft, Clock, ShieldCheck, AlertCircle, Send, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PaymentService } from '../services/billing/PaymentService';
import { mockInvoices } from '../services/mockData';

export const CheckoutPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [customerRef, setCustomerRef] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const navigate = useNavigate();

  const billingConfig = PaymentService.getActiveBillingConfig();
  const currentInvoice = mockInvoices[0] || {
    id: 'inv-demo',
    invoice_number: 'GP-INV-20260824-001',
    total: 990000,
    currency: 'VND',
    billing_reason: 'Gói Gia Tộc (1 Năm)',
  };

  const refCode = `GP-${currentInvoice.invoice_number.replace(/-/g, '')}`;
  const qrUrl = `https://img.vietqr.io/image/${billingConfig.bank_code}-${billingConfig.account_number}-${billingConfig.qr_template}.png?amount=${currentInvoice.total}&addInfo=${encodeURIComponent(refCode)}&accountName=${encodeURIComponent(billingConfig.account_name)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    PaymentService.submitPaymentClaim(currentInvoice.id, {
      customerBankReference: customerRef,
      customerNote: customerNote,
    });
    setClaimSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 animate-fade-in text-gray-900">
      <Link
        to="/pricing"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại bảng giá</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Thanh Toán Chuyển Khoản VietQR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Thông Tin Chuyển Khoản Gói Dịch Vụ</h1>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng chuyển khoản chính xác số tiền và nội dung bên dưới. Sau khi chuyển, bấm nút xác nhận để Ban Quản Trị đối soát sao kê.
          </p>
        </div>

        {/* QR Code & Transfer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 border-t border-slate-100">
          {/* Left: Dynamic QR */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl">
            <div className="w-56 h-56 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-48 h-48 object-contain rounded-lg"
                onError={(e) => {
                  // Fallback if VietQR server is unreachable
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="text-xs font-bold text-slate-700 mt-3 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Hóa đơn hiệu lực trong {billingConfig.default_invoice_validity_days || 7} ngày</span>
            </div>
          </div>

          {/* Right: Bank Details & Verification Status */}
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-slate-500">
                <span>Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-900">{billingConfig.bank_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-800 text-sm tracking-wider">{billingConfig.account_number}</span>
                  <button onClick={() => handleCopy(billingConfig.account_number)} className="text-gray-400 hover:text-gray-700">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Chủ tài khoản:</span>
                <span className="font-bold text-slate-900 uppercase">{billingConfig.account_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Số tiền thanh toán:</span>
                <span className="font-extrabold text-emerald-700 text-sm">{currentInvoice.total.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200">
                <span>Nội dung chuyển khoản:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {refCode}
                  </span>
                  <button
                    onClick={() => handleCopy(refCode)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                    title="Sao chép"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {copied && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl text-center font-semibold">
                ✓ Đã sao chép vào bộ nhớ tạm!
              </div>
            )}

            {/* Submission Form / Status */}
            {!claimSubmitted ? (
              <form onSubmit={handleSubmitClaim} className="space-y-3 pt-1">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 text-[11px]">
                    Mã giao dịch / Mã tham chiếu ngân hàng của bạn (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={customerRef}
                    onChange={(e) => setCustomerRef(e.target.value)}
                    placeholder="Ví dụ: MB-FT123456..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 text-xs"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Sau khi chuyển khoản, vui lòng bấm nút dưới đây. Ban Quản Trị sẽ kiểm tra sao kê và kích hoạt gói cước cho dòng họ trong thời gian sớm nhất.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" /> Tôi Đã Chuyển Khoản
                </button>
              </form>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>🟠 Đã gửi yêu cầu — Chờ Ban Quản Trị xác nhận</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Yêu cầu thanh toán cho hóa đơn <span className="font-bold text-gray-900">{currentInvoice.invoice_number}</span> đã được ghi nhận vào hệ thống. Ban Quản Trị sẽ kiểm tra sao kê ngân hàng và kích hoạt tài khoản của bạn.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => navigate('/app/billing')}
                    className="flex-1 py-2 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl transition shadow-xs"
                  >
                    Xem Lịch Sử Hóa Đơn
                  </button>
                  <button
                    onClick={() => navigate('/app/support')}
                    className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition"
                  >
                    Cần Trợ Giúp?
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
