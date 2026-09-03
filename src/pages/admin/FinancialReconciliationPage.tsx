import React, { useState, useEffect } from 'react';
import { Landmark, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialReconciliationService, DailyFundReconciliationReport } from '../../services/FinancialReconciliationService';
import { useAuth } from '../../contexts/AuthContext';

export default function FinancialReconciliationPage() {
  const { activeFamily } = useAuth();
  const [reports, setReports] = useState<DailyFundReconciliationReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadReconciliation = async () => {
    setIsLoading(true);
    try {
      const data = await FinancialReconciliationService.reconcileFamilyFunds(activeFamily?.id);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reconciliation reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReconciliation();
  }, [activeFamily?.id]);

  const hasMismatch = reports.some((r) => r.status !== 'MATCHED');
  const criticalCount = reports.filter((r) => r.status === 'CRITICAL').length;

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

        <div className="flex items-center gap-3">
          <button
            onClick={loadReconciliation}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Làm mới đối soát"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <div className={`px-3.5 py-1.5 font-bold text-xs rounded-xl border flex items-center gap-1.5 ${
            hasMismatch
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}>
            {hasMismatch ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Phát hiện lệch sổ ({criticalCount} Quỹ nghiêm trọng)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Trạng thái: 100% Cân Đối (Matched)</span>
              </>
            )}
          </div>
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    Đang tải và tính toán đối soát số dư sổ cái...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Chưa có quỹ nào được tạo trong gia tộc này.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.fundId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.fundName}</td>
                    <td className="py-3.5 px-3 text-right text-slate-700 dark:text-slate-300">{r.openingBalance.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400">+{r.totalIncome.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3.5 px-3 text-right text-rose-600 dark:text-rose-400">-{r.totalExpense.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">{r.expectedBalance.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">{r.actualBalance.toLocaleString('vi-VN')} đ</td>
                    <td className={`py-3.5 px-3 text-right font-bold ${
                      r.difference === 0
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {r.difference.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        r.status === 'MATCHED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : r.status === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
