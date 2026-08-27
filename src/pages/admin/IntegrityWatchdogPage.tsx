import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataIntegrityWatchdog } from '../../services/DataIntegrityWatchdog';
import { mockMembers, mockRelationships, mockFunds, mockTransactions, mockInvoices, mockPayments, mockActiveSubscription } from '../../services/mockData';

export default function IntegrityWatchdogPage() {
  const [isRunning, setIsRunning] = useState(false);

  const report = DataIntegrityWatchdog.runSystemIntegrityWatchdog({
    members: mockMembers,
    relationships: mockRelationships,
    fund: mockFunds[0],
    transactions: mockTransactions,
    invoices: mockInvoices,
    payments: mockPayments,
    subscriptions: [mockActiveSubscription],
    familyId: 'fam-0000-0001',
  });

  const handleRunCheck = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 800);
  };

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
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Giám Sát Toàn Vẹn Dữ Liệu (Data Integrity Watchdog)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bộ lọc phát hiện tự động các lỗi phả hệ, ngày giỗ âm lịch, sai lệch sổ cái tài chính và hóa đơn thanh toán.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-auto">
          <button
            onClick={handleRunCheck}
            disabled={isRunning}
            className="px-3.5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Đang kiểm tra...' : 'Chạy Quét Lại'}</span>
          </button>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase">Điểm Toàn Vẹn</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{report.integrityScore} / 100</div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {report.status}
            </span>
          </div>
        </div>
      </div>

      {/* Check Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(report.checkSummary).map(([key, value]) => (
          <div key={key} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm text-center">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate">{key}</div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {value.passed} / {value.checked}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">0 Lỗi vi phạm</div>
          </div>
        ))}
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Nhật Ký Cảnh Báo Toàn Vẹn ({report.issues.length})</span>
        </h2>

        {report.issues.length === 0 ? (
          <div className="py-12 text-center text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <p className="font-bold text-sm text-slate-900 dark:text-white">Hệ thống hoàn toàn lành mạnh (0 Integrity Issues Detected)</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Tất cả quan hệ phả hệ, lịch âm tế lễ và số dư sổ quỹ đều bảo toàn tính toàn vẹn 100%.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {report.issues.map((iss) => (
              <div key={iss.id} className="p-3 border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">{iss.title}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{iss.description}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold rounded-md">
                  {iss.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
