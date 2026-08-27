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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-[#166534]" />
        <div>
          <Link to="/admin/beta" className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Trung Tâm Điều Hành
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Đối Soát Sổ Quỹ & Doanh Thu Tự Động</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đối soát định kỳ cân đối Sổ Cái và đối soát 3 bên giữa Ngân hàng - Thanh toán - Hóa đơn điện tử.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 self-start md:self-auto">
          Trạng thái: 100% Cân Đối (Matched)
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Báo Cáo Cân Đối Các Quỹ ({reports.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Tên Quỹ</th>
                <th className="py-3 px-3 text-right">Số Dư Đầu</th>
                <th className="py-3 px-3 text-right">Tổng Thu (+)</th>
                <th className="py-3 px-3 text-right">Tổng Chi (-)</th>
                <th className="py-3 px-3 text-right">Số Dư Tính Toán</th>
                <th className="py-3 px-3 text-right">Số Dư Thực Tế</th>
                <th className="py-3 px-3 text-right">Chênh Lệch</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {reports.map((r) => (
                <tr key={r.fundId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.fundName}</td>
                  <td className="py-3.5 px-3 text-right text-slate-700 dark:text-slate-300">{r.openingBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400">+{r.totalIncome.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3.5 px-3 text-right text-rose-600 dark:text-rose-400">-{r.totalExpense.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">{r.expectedBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">{r.actualBalance.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-500 dark:text-slate-400">{r.difference} đ</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
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
