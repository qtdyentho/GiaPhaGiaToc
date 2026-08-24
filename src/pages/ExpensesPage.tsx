import React, { useState } from 'react';
import { BadgePercent, Plus, CheckCircle2, Clock, XCircle, Search, Filter, ShieldCheck } from 'lucide-react';
import { mockExpenses, mockFunds } from '../services/mockData';
import { formatCurrency, formatDate } from '../lib/utils';

export const ExpensesPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Khoản Chi & Quy Trình Phê Duyệt</h1>
          <p className="text-xs text-slate-500">
            Duyệt chi nghiêm ngặt bởi Ban Kiểm Soát theo quy tắc BR-EXP-001 (Chỉ trừ quỹ khi APPROVED)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Xuất Chi Mới</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khoản Chi / Mục Đích</th>
                <th className="py-3.5 px-4">Quỹ Chi Trả</th>
                <th className="py-3.5 px-4">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Ngày Chi</th>
                <th className="py-3.5 px-4">Đơn Vị Thụ Hưởng</th>
                <th className="py-3.5 px-4">Trạng Thái Duyệt</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockExpenses.map((exp) => {
                const fund = mockFunds.find((f) => f.id === exp.fund_id);
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                      <div className="text-[11px] text-slate-500">{exp.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {fund?.name || 'Quỹ Chung'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-rose-700 text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(exp.expense_date)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{exp.recipient_name || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          exp.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {exp.status === 'APPROVED' ? 'ĐÃ DUYỆT CHI' : 'CHỜ DUYỆT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {exp.status === 'APPROVED' ? (
                        <span className="text-slate-400 font-semibold text-xs flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-heritage-green" />
                          <span>Đã trừ quỹ</span>
                        </span>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          <button className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition shadow-sm">
                            Duyệt Chi
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
