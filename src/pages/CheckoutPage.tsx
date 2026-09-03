import React, { useState } from 'react';
import { QrCode, CheckCircle2, Copy, ArrowLeft, Clock, ShieldCheck, AlertCircle, Send, HelpCircle, Building } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentService } from '../services/billing/PaymentService';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';

export const CheckoutPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerRef, setCustomerRef] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const navigate = useNavigate();

  const planId = searchParams.get('plan') || 'plan-giatoc';
  const cycle = searchParams.get('cycle') === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';

  // Calculate pricing based on plan
  const planInfo = (() => {
    switch (planId) {
      case 'plan-free':
        return { name: 'Gói Trải Nghiệm Cơ Bản', total: 0, code: 'FREE' };
      case 'plan-family':
        return { name: 'Gói Gia Đình Nhỏ', total: cycle === 'YEARLY' ? 490000 : 49000, code: 'FAMILY' };
      case 'plan-giatoc':
        return { name: 'Gói Gia Tộc Tiêu Chuẩn', total: cycle === 'YEARLY' ? 990000 : 99000, code: 'GIA_TOC' };
      case 'plan-dongho':
        return { name: 'Gói Đại Tộc Quy Mô Lớn', total: cycle === 'YEARLY' ? 1990000 : 199000, code: 'DONG_HO' };
      case 'plan-premium':
        return { name: 'Gói Di Sản Vĩnh Cửu', total: cycle === 'YEARLY' ? 4990000 : 499000, code: 'PREMIUM' };
      default:
        return { name: 'Gói Gia Tộc Tiêu Chuẩn', total: cycle === 'YEARLY' ? 990000 : 99000, code: 'GIA_TOC' };
    }
  })();

  const billingConfig = PaymentService.getActiveBillingConfig();
  const familyCode = activeFamily?.code || 'GIAPHA';
  const refCode = `GP-${familyCode}-${planInfo.code}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;
  const qrUrl = `https://img.vietqr.io/image/${billingConfig.bank_code}-${billingConfig.account_number}-${billingConfig.qr_template}.png?amount=${planInfo.total}&addInfo=${encodeURIComponent(refCode)}&accountName=${encodeURIComponent(billingConfig.account_name)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      PaymentService.submitPaymentClaim(`inv-${Date.now()}`, {
        familyId: activeFamily?.id,
        amount: planInfo.total,
        billingReason: `${planInfo.name} (${activeFamily?.name})`,
        customerBankReference: customerRef,
        customerNote: customerNote,
      });
      setClaimSubmitted(true);
    } catch (err: any) {
      console.error('Lỗi gửi xác nhận thanh toán:', err);
      setErrorMessage(err.message || 'Không thể gửi xác nhận thanh toán. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeFamily) {
    return (
      <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12 font-sans">
        <Building className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Chưa Chọn Dòng Họ</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng chọn hoặc tạo dòng họ trước khi tiến hành thanh toán.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 animate-fade-in text-gray-900 font-sans">
      <Link
        to="/pricing"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại bảng giá dịch vụ</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 text-xs font-bold px-3.5 py-1 rounded-full mb-2 border border-emerald-300 dark:border-emerald-800">
            <QrCode className="w-3.5 h-3.5" />
            <span>Thanh Toán Chuyển Khoản VietQR Napas247</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
            Kích Hoạt Gói Dịch Vụ • {activeFamily.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Vui lòng quét mã QR hoặc chuyển khoản chính xác nội dung bên dưới để Ban Quản Trị đối soát và kích hoạt gói cước.
          </p>
        </div>

        {/* QR Code & Transfer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Left: Dynamic QR */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
            <div className="w-56 h-56 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-48 h-48 object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Hóa đơn hiệu lực trong {billingConfig.default_invoice_validity_days || 7} ngày</span>
            </div>
          </div>

          {/* Right: Bank Details & Verification Status */}
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Gói dịch vụ đăng ký:</span>
                <span className="font-bold text-slate-900 dark:text-white">{planInfo.name} ({cycle === 'YEARLY' ? '1 Năm' : '1 Tháng'})</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-900 dark:text-white">{billingConfig.bank_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 text-sm tracking-wider">{billingConfig.account_number}</span>
                  <button onClick={() => handleCopy(billingConfig.account_number)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Chủ tài khoản:</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">{billingConfig.account_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Số tiền thanh toán:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{formatCurrency(planInfo.total)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Nội dung chuyển khoản:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    {refCode}
                  </span>
                  <button
                    onClick={() => handleCopy(refCode)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition"
                    title="Sao chép"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {copied && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl text-center font-semibold border border-emerald-200 dark:border-emerald-800">
                ✓ Đã sao chép vào bộ nhớ tạm!
              </div>
            )}

            {/* Submission Form / Status */}
            {!claimSubmitted ? (
              <form onSubmit={handleSubmitClaim} className="space-y-3 pt-1">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                    Mã giao dịch / Mã tham chiếu ngân hàng của bạn (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={customerRef}
                    onChange={(e) => setCustomerRef(e.target.value)}
                    placeholder="VD: FT240824987654"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang Gửi Yêu Cầu...' : 'Tôi Đã Chuyển Khoản Thành Công'}</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã ghi nhận yêu cầu kích hoạt!</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Hệ thống tự động kích hoạt gói dịch vụ ngay sau khi ngân hàng báo có sao kê.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/app/billing')}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    Xem Tổng Quan Gói Dịch Vụ
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
