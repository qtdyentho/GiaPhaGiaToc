import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataIntegrityWatchdog } from '../../services/DataIntegrityWatchdog';
import { mockMembers, mockRelationships, mockFunds, mockTransactions, mockInvoices, mockPayments, mockActiveSubscription } from '../../services/mockData';

export default function IntegrityWatchdogPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link to="/admin/beta" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Beta Command Center
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Giám Sát Toàn Vẹn Dữ Liệu (Data Integrity Watchdog)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bộ lọc phát hiện tự động các lỗi phả hệ, ngày giỗ âm lịch, sai lệch sổ cái tài chính và hóa đơn thanh toán.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 font-semibold uppercase">Điểm Toàn Vẹn Hệ Thống</div>
          <div className="text-3xl font-extrabold text-emerald-600">{report.integrityScore} / 100</div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {report.status}
          </span>
        </div>
      </div>

      {/* Check Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(report.checkSummary).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="text-[11px] text-gray-400 font-bold uppercase">{key}</div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {value.passed} / {value.checked}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">0 Lỗi vi phạm</div>
          </div>
        ))}
      </div>

      {/* Issues Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-emerald-600" />
          Nhật Ký Cảnh Báo Toàn Vẹn ({report.issues.length})
        </h2>

        {report.issues.length === 0 ? (
          <div className="py-12 text-center text-emerald-700">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-600" />
            <p className="font-bold text-sm">Hệ thống hoàn toàn lành mạnh (0 Integrity Issues Detected)</p>
            <p className="text-xs text-gray-500 mt-1">
              Tất cả quan hệ phả hệ, lịch âm tế lễ và số dư sổ quỹ đều bảo toàn tính toàn vẹn 100%.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {report.issues.map((iss) => (
              <div key={iss.id} className="p-3 border border-red-100 bg-red-50/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-800">{iss.title}</span>
                  <p className="text-xs text-gray-600">{iss.description}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-md">
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
