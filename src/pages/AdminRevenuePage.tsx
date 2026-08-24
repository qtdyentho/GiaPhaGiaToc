import React from 'react';
import { DollarSign, Users, CreditCard, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { mockPlans } from '../services/mockData';

export const AdminRevenuePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Trị Doanh Thu & Thuê Bao Toàn Hệ Thống</h1>
          <p className="text-xs text-slate-500">Giám sát MRR, ARR, tỷ lệ gia hạn và phân tích gói dịch vụ</p>
        </div>
      </div>

      {/* Admin KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Doanh Thu Hàng Tháng (MRR)</span>
            <DollarSign className="w-5 h-5 text-heritage-green" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">14.850.000 ₫</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">+18.5% so với tháng trước</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Dự Báo Doanh Thu (ARR)</span>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">178.200.000 ₫</div>
          <div className="text-xs text-slate-500 mt-1">142 hợp đồng đang hiệu lực</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Thuê Bao Dùng Thử (Trial)</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">28 Gia Tộc</div>
          <div className="text-xs text-amber-700 font-semibold mt-1">Tỷ lệ chuyển đổi ~ 42%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng Doanh Thu Lũy Kế</span>
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">245.000.000 ₫</div>
          <div className="text-xs text-slate-500 mt-1">100% thanh toán qua VietQR</div>
        </div>
      </div>

      {/* Plan Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Phân Bổ Gói Dịch Vụ Hệ Thống</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã Gói</th>
                <th className="py-3 px-4">Tên Gói Cước</th>
                <th className="py-3 px-4">Giá Năm</th>
                <th className="py-3 px-4">Số Thuê Bao Kích Hoạt</th>
                <th className="py-3 px-4">Hạn Mức Thành Viên</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{plan.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{plan.name}</td>
                  <td className="py-3 px-4 font-bold text-heritage-green">
                    {plan.code === 'FREE' ? 'Miễn phí' : plan.code === 'FAMILY' ? '490.000 ₫' : plan.code === 'GIA_TOC' ? '990.000 ₫' : plan.code === 'DONG_HO' ? '1.990.000 ₫' : '4.990.000 ₫'}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {plan.code === 'FREE' ? '310' : plan.code === 'GIA_TOC' ? '84' : plan.code === 'FAMILY' ? '42' : '16'}
                  </td>
                  <td className="py-3 px-4">
                    {plan.code === 'FREE' ? '30' : plan.code === 'FAMILY' ? '100' : plan.code === 'GIA_TOC' ? '300' : plan.code === 'DONG_HO' ? '1000' : 'Vô hạn'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full">
                      CÔNG KHAI (ACTIVE)
                    </span>
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
