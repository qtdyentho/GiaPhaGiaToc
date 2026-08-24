import React, { useState } from 'react';
import { ReceiptText, Plus, CheckCircle2, QrCode, Search, Filter, ArrowDownLeft, Clock } from 'lucide-react';
import { mockAssessments, mockMembers, mockFunds } from '../services/mockData';
import { formatCurrency, formatDate } from '../lib/utils';

export const IncomeAssessmentsPage: React.FC = () => {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const handleOpenRecord = (id: string) => {
    setSelectedAssessmentId(id);
    setShowRecordModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Khoản Thu Định Mức & Đóng Góp</h1>
          <p className="text-xs text-slate-500">
            Tách bạch giữa Nghĩa vụ thu (Assessment) và Thực thu (Payment) theo chuẩn BR-FUND-001
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Lập Đợt Thu Mới (Gán 86 Thành Viên)</span>
          </button>
        </div>
      </div>

      {/* Campaign Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase">Tổng Nghĩa Vụ Phải Thu</div>
          <div className="text-2xl font-black text-slate-900 mt-1">43.000.000 ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">86 suất thu định mức 500k</div>
        </div>

        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase">Đã Thực Thu (Vào Quỹ)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">36.500.000 ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">73 thành viên đã hoàn thành</div>
        </div>

        <div>
          <div className="text-xs font-bold text-amber-600 uppercase">Còn Tồn Đọng Chưa Thu</div>
          <div className="text-2xl font-black text-amber-700 mt-1">6.500.000 ₫</div>
          <div className="text-xs text-slate-400 mt-0.5">13 thành viên chưa đóng</div>
        </div>
      </div>

      {/* Assessments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khoản Thu / Chiến Dịch</th>
                <th className="py-3.5 px-4">Thành Viên Phải Nộp</th>
                <th className="py-3.5 px-4">Mức Thu Phải Nộp</th>
                <th className="py-3.5 px-4">Đã Thu</th>
                <th className="py-3.5 px-4">Hạn Nộp</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Ghi Nhận Thực Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAssessments.map((asm) => {
                const member = mockMembers.find((m) => m.id === asm.member_id);
                return (
                  <tr key={asm.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{asm.title}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{member?.full_name}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(asm.amount_due)}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{formatCurrency(asm.amount_paid)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(asm.due_date)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          asm.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {asm.status === 'PAID' ? 'ĐÃ NỘP ĐỦ' : 'CHỜ NỘP'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {asm.status !== 'PAID' ? (
                        <button
                          onClick={() => handleOpenRecord(asm.id)}
                          className="px-3 py-1.5 bg-heritage-green hover:bg-heritage-green-light text-white font-bold rounded-lg text-xs transition shadow-sm inline-flex items-center space-x-1"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Ghi Thu Tiền</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-semibold text-xs flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-heritage-green" />
                          <span>Đã vào quỹ</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ghi Thu Tiền */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ArrowDownLeft className="w-5 h-5 text-heritage-green" />
              <span>Ghi Nhận Thực Thu Tiền Quỹ</span>
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Thao tác này sẽ tự động sinh mã bút toán <strong>THU-YYYYMMDD-XXXX</strong> và cập nhật số dư Quỹ nguyên tử (Atomicity).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase">Số Tiền Nộp (VNĐ) *</label>
                <input
                  type="number"
                  defaultValue={500000}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green font-bold text-heritage-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase">Phương Thức Thanh Toán</label>
                <select className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green">
                  <option value="VIETQR">Chuyển khoản VietQR</option>
                  <option value="CASH">Tiền mặt (Thủ quỹ nhận)</option>
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase">Ghi Chú Bút Toán</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Tuấn nộp quỹ thường niên 2026..."
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Xác Nhận Thu Tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
