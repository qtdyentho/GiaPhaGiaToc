import React, { useState } from 'react';
import { Landmark, ArrowLeft, Save, CheckCircle2, ShieldCheck, QrCode, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentService } from '../../services/billing/PaymentService';
import { AdminBillingConfig } from '../../types/database';
import { VIETNAMESE_BANKS } from '../../constants/vietnameseBanks';

export default function AdminBillingConfigPage() {
  const [config, setConfig] = useState<AdminBillingConfig>(PaymentService.getActiveBillingConfig());
  const [savedMessage, setSavedMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    PaymentService.updateBillingConfig(config);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleSelectBank = (bankCode: string) => {
    const found = VIETNAMESE_BANKS.find((b) => b.code === bankCode || b.shortName.toLowerCase() === bankCode.toLowerCase());
    if (found) {
      setConfig((prev) => ({
        ...prev,
        bank_code: found.code,
        bank_name: found.name,
      }));
    }
  };

  const popularBanks = VIETNAMESE_BANKS.filter((b) =>
    ['MB', 'VCB', 'TCB', 'CTG', 'BIDV', 'ACB', 'VPB', 'VBA', 'TPB'].includes(b.code)
  );

  const filteredBanks = searchTerm.trim()
    ? VIETNAMESE_BANKS.filter(
        (b) =>
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.bin.includes(searchTerm)
      )
    : VIETNAMESE_BANKS;

  // Sample VietQR preview URL
  const sampleQrUrl = `https://img.vietqr.io/image/${config.bank_code}-${config.account_number}-${config.qr_template}.png?amount=990000&addInfo=GP-SAMPLE&accountName=${encodeURIComponent(config.account_name)}`;

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Link to="/admin/payments" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Quản Lý Thanh Toán
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-heritage-green" />
            Cấu Hình Tài Khoản Nhận Thanh Toán (Billing Configuration)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập thông tin tài khoản ngân hàng và mã VietQR nhận tiền chuyển khoản gói cước từ các dòng họ.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Đã lưu thành công cấu hình tài khoản thụ hưởng!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-heritage-green" />
            Thông Tin Tài Khoản Ngân Hàng Thụ Hưởng
          </h2>
          <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 font-medium">
            Chuẩn NAPAS / VietQR
          </span>
        </div>

        {/* Quick Select Popular Banks */}
        <div className="space-y-2">
          <label className="block text-slate-700 font-semibold">Chọn Nhanh Ngân Hàng Phổ Biến:</label>
          <div className="flex flex-wrap gap-2">
            {popularBanks.map((b) => {
              const isSelected = config.bank_code === b.code;
              return (
                <button
                  type="button"
                  key={b.code}
                  onClick={() => handleSelectBank(b.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-emerald-50 border-heritage-green text-heritage-green shadow-sm ring-1 ring-heritage-green'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {b.shortName} <span className="text-[10px] opacity-70">({b.code})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bank Selection Dropdown / Search */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="text-slate-800 font-bold flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-heritage-green" />
              Chọn từ Danh Sách Ngân Hàng Chuẩn ({VIETNAMESE_BANKS.length} Ngân Hàng)
            </label>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, mã, số BIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-heritage-green"
              />
            </div>
          </div>

          <select
            value={config.bank_code}
            onChange={(e) => handleSelectBank(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-heritage-green"
          >
            <option value="">-- Chọn ngân hàng thụ hưởng --</option>
            {filteredBanks.map((b) => (
              <option key={b.code} value={b.code}>
                [{b.code}] {b.name} (Mã BIN: {b.bin})
              </option>
            ))}
          </select>
        </div>

        {/* Detailed Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tên Ngân Hàng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.bank_name}
              onChange={(e) => setConfig({ ...config, bank_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-heritage-green text-slate-900 font-medium"
              placeholder="VD: Ngân hàng TMCP Quân đội (MBBank)"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mã Ngân Hàng (NAPAS / VietQR Code) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.bank_code}
              onChange={(e) => setConfig({ ...config, bank_code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-heritage-green text-slate-900 font-bold tracking-wider"
              placeholder="VD: MB"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Số Tài Khoản <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.account_number}
              onChange={(e) => setConfig({ ...config, account_number: e.target.value.replace(/\s+/g, '') })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-heritage-green text-slate-900 font-bold tracking-wider text-sm"
              placeholder="VD: 088899998888"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Chủ Tài Khoản (Không Dấu / Có Dấu) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.account_name}
              onChange={(e) => setConfig({ ...config, account_name: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-heritage-green text-slate-900 font-bold uppercase text-sm"
              placeholder="VD: QUAN TRI VIEN GIA PHA GIA TOC"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Hotline Hỗ Trợ Thanh Toán <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={config.support_phone}
              onChange={(e) => setConfig({ ...config, support_phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-heritage-green text-slate-900 font-medium"
              placeholder="VD: 1900 6868"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Email Hỗ Trợ Kỹ Thuật / Hóa Đơn <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={config.support_email}
              onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-heritage-green text-slate-900 font-medium"
              placeholder="VD: billing@giaphaviet.vercel.app"
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 bg-white border border-emerald-200 rounded-xl flex items-center justify-center p-1 shrink-0 shadow-sm">
            <img
              src={sampleQrUrl}
              alt="Mã VietQR mẫu"
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <QrCode className="w-10 h-10 text-emerald-800 hidden" />
          </div>
          <div className="space-y-1 text-slate-700">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-heritage-green" />
              Xem Trước Đồng Bộ VietQR Trực Tiếp
            </h4>
            <p className="text-[11px] text-slate-600">
              Mã Ngân Hàng: <span className="font-bold text-heritage-green">{config.bank_code}</span> | 
              Số TK: <span className="font-bold text-slate-900">{config.account_number}</span> | 
              Chủ TK: <span className="font-bold text-slate-900">{config.account_name}</span>
            </p>
            <p className="text-[11px] text-slate-500 italic">
              Thông tin trên sẽ được tự động đồng bộ vào mã VietQR và khung hướng dẫn chuyển khoản trên trang Checkout của tất cả các dòng họ.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu Cấu Hình
          </button>
        </div>
      </form>
    </div>
  );
}
