import React, { useState } from 'react';
import { CreditCard, Users, Search, Filter, ShieldCheck, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { mockPlans, mockFamily, mockActiveSubscription } from '../services/mockData';
import { formatDate } from '../lib/utils';

export const AdminSubscriptionsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const mockAllSubscriptions = [
    {
      id: 'sub-001',
      family_name: 'Đại Tộc Nguyễn Văn (Hà Nội)',
      plan_code: 'GIA_TOC',
      status: 'ACTIVE',
      billing_cycle: 'YEARLY',
      members_count: 86,
      quota_limit: 300,
      period_end: '2027-01-01T00:00:00Z',
    },
    {
      id: 'sub-002',
      family_name: 'Gia Tộc Trần Bá (Bắc Ninh)',
      plan_code: 'FAMILY',
      status: 'ACTIVE',
      billing_cycle: 'YEARLY',
      members_count: 74,
      quota_limit: 100,
      period_end: '2026-11-15T00:00:00Z',
    },
    {
      id: 'sub-003',
      family_name: 'Dòng Họ Lê Quang (Thanh Hóa)',
      plan_code: 'DONG_HO',
      status: 'TRIALING',
      billing_cycle: 'YEARLY',
      members_count: 210,
      quota_limit: 1000,
      period_end: '2026-09-07T00:00:00Z',
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Thuê Bao Toàn Hệ Thống</h1>
          <p className="text-xs text-slate-500">Giám sát 142 hợp đồng gia tộc, gia hạn dùng thử và xử lý quá hạn</p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Gia Tộc / Tenant</th>
                <th className="py-3.5 px-4">Gói Cước</th>
                <th className="py-3.5 px-4">Chu Kỳ</th>
                <th className="py-3.5 px-4">Hạn Mức Sử Dụng</th>
                <th className="py-3.5 px-4">Hết Hạn Vào</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAllSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sub.family_name}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-heritage-navy">
                      {sub.plan_code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {sub.billing_cycle === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">
                      {sub.members_count} / {sub.quota_limit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(sub.period_end)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {sub.status === 'ACTIVE' ? 'ĐANG HIỆU LỰC' : 'DÙNG THỬ (TRIAL)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 bg-heritage-navy hover:bg-heritage-navy-light text-white font-bold rounded text-[11px] transition shadow-sm">
                      Gia hạn trial
                    </button>
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
