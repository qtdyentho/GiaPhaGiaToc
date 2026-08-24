import React from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Plus, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { mockFunds, mockTransactions, mockAssessments } from '../services/mockData';

export const FinanceDashboardPage: React.FC = () => {
  const totalBalance = mockFunds.reduce((sum, f) => sum + f.current_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Tài Chính & Sổ Quỹ Họ Tộc</h1>
          <p className="text-xs text-slate-500">Kế toán kép bất biến, minh bạch tuyệt đối 100% dòng tiền</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-heritage-green hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition">
            <ArrowDownLeft className="w-4 h-4" />
            <span>Ghi Thu Quỹ</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg transition shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Đề Xuất Khoản Chi</span>
          </button>
        </div>
      </div>

      {/* Top 3 Fund Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockFunds.map((fund) => (
          <div key={fund.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{fund.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Hoạt Động
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {formatCurrency(fund.current_balance)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Số dư đầu kỳ: {formatCurrency(fund.opening_balance)}
            </div>
          </div>
        ))}
      </div>

      {/* Overview Stats: Tổng Số Dư, Thu Năm Nay, Chi Năm Nay */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase">
            <Wallet className="w-4 h-4 text-heritage-green" />
            <span>Tổng Quỹ Khả Dụng</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(totalBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Bao gồm 3 quỹ chính quy</div>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>Tổng Thu Năm 2026</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {formatCurrency(48500000)}
          </div>
          <div className="text-xs text-slate-400 mt-1">86/86 nghĩa vụ định mức</div>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 uppercase">
            <TrendingDown className="w-4 h-4" />
            <span>Tổng Chi Năm 2026</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">
            {formatCurrency(12400000)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Đã kiểm toán & phê duyệt</div>
        </div>
      </div>

      {/* Sổ quỹ & Giao dịch */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Bút Toán Giao Dịch Gần Đây</h2>
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-heritage-green" />
            <span>Sổ cái bất biến (Immutable Ledger)</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã Giao Dịch</th>
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4">Nội Dung</th>
                <th className="py-3 px-4">Phương Thức</th>
                <th className="py-3 px-4">Số Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{tx.transaction_code}</td>
                  <td className="py-3 px-4 text-slate-500">{tx.transaction_date}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{tx.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                      {tx.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        tx.transaction_type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.transaction_type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full">
                      ĐÃ GHI SỔ (POSTED)
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
