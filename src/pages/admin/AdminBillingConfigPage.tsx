import React, { useState } from 'react';
import { Landmark, ArrowLeft, Save, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentService } from '../../services/billing/PaymentService';
import { AdminBillingConfig } from '../../types/database';

export default function AdminBillingConfigPage() {
  const [config, setConfig] = useState<AdminBillingConfig>(PaymentService.getActiveBillingConfig());
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    PaymentService.updateBillingConfig(config);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link to="/admin/payments" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Quản Lý Thanh Toán
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-600" />
            Cấu Hình Tài Khoản Nhận Thanh Toán (Billing Configuration)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập thông tin tài khoản ngân hàng và mã VietQR nhận tiền chuyển khoản gói cước từ các dòng họ.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Đã lưu thành công cấu hình tài khoản thụ hưởng!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 text-xs">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Thông Tin Tài Khoản Ngân Hàng Thụ Hưởng
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Tên Ngân Hàng</label>
            <input
              type="text"
              required
              value={config.bank_name}
              onChange={(e) => setConfig({ ...config, bank_name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Mã Ngân Hàng (NAPAS Bank Code)</label>
            <input
              type="text"
              required
              value={config.bank_code}
              onChange={(e) => setConfig({ ...config, bank_code: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Số Tài Khoản</label>
            <input
              type="text"
              required
              value={config.account_number}
              onChange={(e) => setConfig({ ...config, account_number: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 font-bold tracking-wider"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Chủ Tài Khoản (Không Dấu / Có Dấu)</label>
            <input
              type="text"
              required
              value={config.account_name}
              onChange={(e) => setConfig({ ...config, account_name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Hotline Hỗ Trợ Thanh Toán</label>
            <input
              type="text"
              required
              value={config.support_phone}
              onChange={(e) => setConfig({ ...config, support_phone: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email Hỗ Trợ Kỹ Thuật / Hóa Đơn</label>
            <input
              type="email"
              required
              value={config.support_email}
              onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 font-medium"
            />
          </div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-[11px]">
          Thông tin trên sẽ được tự động đồng bộ vào mã VietQR và khung hướng dẫn chuyển khoản trên trang Checkout của tất cả các dòng họ.
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu Cấu Hình
          </button>
        </div>
      </form>
    </div>
  );
}
