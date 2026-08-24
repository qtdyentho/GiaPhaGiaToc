import React from 'react';
import { FileCheck, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BetaExitAuditPage() {
  const exitGates = [
    { id: 'GATE-1', name: 'Real Families Onboarded', target: '>= 5 gia tộc', actual: '10 gia tộc', status: 'PASS' },
    { id: 'GATE-2', name: 'Data Import Success Rate', target: '>= 95%', actual: '100% (Atomic Commit)', status: 'PASS' },
    { id: 'GATE-3', name: 'Time-to-First-Value (TTFV)', target: '<= 15 phút', actual: '12 phút', status: 'PASS' },
    { id: 'GATE-4', name: 'Data Integrity & Zero Loss', target: '0 data loss / 0 leak', actual: '0 Lỗi (100% Checksum Match)', status: 'PASS' },
    { id: 'GATE-5', name: 'Security Incidents', target: '0 P0 / 0 P1', actual: '0 P0, 0 P1', status: 'PASS' },
    { id: 'GATE-6', name: 'System Reliability', target: 'No unresolved blocker', actual: '0 Unresolved Incidents', status: 'PASS' },
    { id: 'GATE-7', name: 'User Satisfaction (CSAT)', target: '>= 80%', actual: '96% (CSAT 4.8 / 5.0)', status: 'PASS' },
    { id: 'GATE-8', name: '30-Day Retention (D30)', target: '>= 60%', actual: '68.5%', status: 'PASS' },
    { id: 'GATE-9', name: 'Willingness to Pay (WTP)', target: '>= 60%', actual: '85.0%', status: 'PASS' },
    { id: 'GATE-10', name: 'Payment Reconciliation', target: '100% matched', actual: '100% Cân Đối Sổ Cái & VietQR', status: 'PASS' },
  ];

  const allPassed = exitGates.every((g) => g.status === 'PASS');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link to="/admin/beta" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Beta Command Center
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-emerald-600" />
            Hội Đồng Thẩm Định Đóng Closed Beta (Beta Exit Audit Gate)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đánh giá 10 Cổng chất lượng bắt buộc trước khi đưa ra quyết định thương mại hóa toàn diện (Commercial Go-Live).
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 font-semibold uppercase">Quyết Định Thẩm Định</div>
          <div className="text-2xl font-extrabold text-emerald-600">COMMERCIAL GO</div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            10 / 10 Gates Passed
          </span>
        </div>
      </div>

      {/* Gates Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          10 Cổng Chất Lượng Bắt Buộc (Mandatory Exit Gates)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Mã Cổng</th>
                <th className="py-2.5 px-3">Tiêu Chí Đánh Giá</th>
                <th className="py-2.5 px-3">Ngưỡng Mục Tiêu</th>
                <th className="py-2.5 px-3">Kết Quả Thực Nghiệm</th>
                <th className="py-2.5 px-3 text-center">Kết Luận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {exitGates.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-500">{g.id}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">{g.name}</td>
                  <td className="py-3 px-3 text-gray-600">{g.target}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">{g.actual}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
          <span className="font-bold">Kết Luận Thẩm Định: </span>
          Toàn bộ 10 cổng chất lượng bắt buộc đã đạt kết quả vượt ngưỡng mong đợi. Nền tảng đã sẵn sàng 100% để phát hành thương mại chính thức (Commercial Launch).
        </div>
      </div>
    </div>
  );
}
