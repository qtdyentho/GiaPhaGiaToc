import React from 'react';
import { FileCheck, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BetaEvidenceService } from '../../services/BetaEvidenceService';

export default function BetaEvidencePage() {
  const realEvidences = BetaEvidenceService.getRealBetaEvidenceList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link to="/admin/beta" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Trung Tâm Điều Hành
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-emerald-600" />
            Hồ Sơ Minh Chứng & Nhật Ký Vận Hành (System Evidence Trail)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Minh chứng số hóa độc lập từ các dòng họ đang hoạt động thực tế (Mã giao dịch ngân hàng, bản ghi CSDL, nhật ký đối soát).
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
          Tổng hồ sơ: {realEvidences.length} Dòng Họ Thật
        </div>
      </div>

      <div className="space-y-4">
        {realEvidences.map((ev) => (
          <div key={ev.evidenceId} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md mr-2">
                  {ev.familyCode}
                </span>
                <span className="text-base font-bold text-gray-900">{ev.familyName}</span>
              </div>
              <div className="text-xs text-gray-400 font-medium">Mã hồ sơ: {ev.evidenceId}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">Quy Mô Phả Hệ</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                  {ev.onboarding.memberCount} người ({ev.onboarding.relationshipCount} quan hệ)
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">Thời Gian Đạt Giá Trị (TTFV)</span>
                <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                  {ev.activation.timeToFirstValueMinutes} phút ({'<='} 15p)
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">Xác Thực Thanh Toán Thật</span>
                <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                  {ev.financial.realPaymentVerified ? 'Đã Xác Thực (Verified)' : 'Chưa'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block font-semibold">Đánh Giá & Khảo Sát</span>
                <span className="text-sm font-bold text-amber-600 mt-0.5 block">
                  CSAT {ev.feedback.csatScore}/5 | NPS {ev.feedback.npsScore}/10
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Bằng Chứng Số Hóa ({ev.evidenceItems.length})
              </h3>
              <div className="space-y-1.5">
                {ev.evidenceItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-900 mr-2">[{item.type}]</span>
                      <span className="text-gray-700">{item.reference}</span>
                    </div>
                    <span className="text-gray-400 text-[11px]">Xác nhận bởi: {item.verifiedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
