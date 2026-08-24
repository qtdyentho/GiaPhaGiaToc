import React from 'react';
import { CreditCard, CheckCircle2, ShieldAlert, ArrowUpRight, Download, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { mockActiveSubscription, mockPlans, mockInvoices, mockUsageCounters } from '../services/mockData';
import { Link } from 'react-router-dom';

export const BillingOverviewPage: React.FC = () => {
  const currentPlan = mockPlans.find((p) => p.id === mockActiveSubscription.plan_id) || mockPlans[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gói Dịch Vụ Gia Tộc</h1>
          <p className="text-xs text-slate-500">Quản lý hạn mức thành viên, dung lượng lưu trữ và lịch sử thanh toán</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/pricing"
            className="flex items-center space-x-1.5 px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <span>Nâng Cấp Gói Cước</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Subscription Hero Card */}
      <div className="bg-gradient-to-r from-heritage-navy to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-heritage relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đang Hoạt Động (Gói 1 Năm)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{currentPlan.name}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              {currentPlan.description}
            </p>
            <div className="text-xs text-amber-300 font-semibold mt-3 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>
                Thời hạn: {formatDate(mockActiveSubscription.current_period_start)} — {formatDate(mockActiveSubscription.current_period_end)}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/15 text-right shrink-0">
            <div className="text-xs text-slate-300 font-medium">Chi phí duy trì gói</div>
            <div className="text-2xl font-black text-heritage-gold mt-1">990.000 ₫ <span className="text-xs font-normal text-slate-300">/ năm</span></div>
            <div className="text-[11px] text-emerald-300 mt-1">Tự động gia hạn khi đến hạn</div>
          </div>
        </div>
      </div>

      {/* Resource Usage Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Usage 1: Members */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Số Lượng Thành Viên</span>
            <span className="text-slate-900 font-bold">86 / 300</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-heritage-green h-full rounded-full" style={{ width: '28.6%' }}></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Còn lại 214 thành viên khả dụng</div>
        </div>

        {/* Usage 2: Storage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Dung Lượng Lưu Trữ</span>
            <span className="text-slate-900 font-bold">1.24 GB / 5 GB</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-heritage-gold h-full rounded-full" style={{ width: '24.8%' }}></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Đã lưu trữ 142 ảnh tư liệu & gia phả scan</div>
        </div>

        {/* Usage 3: Branches */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Chi Phái Trực Thuộc</span>
            <span className="text-slate-900 font-bold">3 / 30 Chi</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: '10%' }}></div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Chi Trưởng, Chi Hai, Chi Ba</div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Lịch Sử Hóa Đơn & Thanh Toán</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Số Hóa Đơn</th>
                <th className="py-3 px-4">Ngày Xuất</th>
                <th className="py-3 px-4">Nội Dung</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Tải Hóa Đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.invoice_number}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(inv.issued_at)}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{inv.billing_reason}</td>
                  <td className="py-3 px-4 font-bold text-heritage-navy">{formatCurrency(inv.total)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full">
                      ĐÃ THANH TOÁN
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-heritage-green hover:underline font-semibold inline-flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
