import React from 'react';
import { Landmark, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialReconciliationService } from '../../services/FinancialReconciliationService';
import { mockFunds, mockTransactions } from '../../services/mockData';

export default function FinancialReconciliationPage() {
  const reports = mockFunds.map((fund) =>
    FinancialReconciliationService.reconcileFund(fund, mockTransactions)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link to="/admin/beta" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Trung Tâm Điều Hành
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-600" />
            Đối Soát Sổ Quỹ & Doanh Thu Tự Động (Financial Reconciliation)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đối soát định kỳ cân đối Sổ Cái và đối soát 3 bên giữa Ngân hàng - Thanh toán - Hóa đơn điện tử.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
          Trạng thái: 100% Cân Đối (Matched)
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Báo Cáo Cân Đối Các Quỹ ({reports.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Tên Quỹ</th>
                <th className="py-2.5 px-2 text-right">Số Dư Đầu</th>
                <th className="py-2.5 px-2 text-right">Tổng Thu (+)</th>
                <th className="py-2.5 px-2 text-right">Tổng Chi (-)</th>
                <th className="py-2.5 px-2 text-right">Số Dư Tính Toán</th>
                <th className="py-2.5 px-2 text-right">Số Dư Thực Tế</th>
                <th className="py-2.5 px-2 text-right">Chênh Lệch</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {reports.map((r) => (
                <tr key={r.fundId} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-900">{r.fundName}</td>
                  <td className="py-3 px-2 text-right">{r.openingBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-2 text-right text-emerald-600">+{r.totalIncome.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-2 text-right text-red-600">-{r.totalExpense.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-2 text-right font-bold text-gray-900">{r.expectedBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-2 text-right font-bold text-emerald-700">{r.actualBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-2 text-right font-bold text-gray-500">{r.difference} đ</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {r.status}
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
}
