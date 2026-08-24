import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit3, CheckCircle2, History, Layers } from 'lucide-react';
import { mockPlans, mockPlanVersions, mockPlanFeatures } from '../services/mockData';
import { formatCurrency } from '../lib/utils';

export const AdminPlansPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Quản Trị Danh Mục Gói Cước & Phiên Bản Giá</span>
            <span className="text-xs bg-indigo-100 text-indigo-900 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Plan Versioning
            </span>
          </h1>
          <p className="text-xs text-slate-500">Quản lý biểu phí, hạn mức tính năng và bảo toàn hợp đồng cũ khi cập nhật giá mới</p>
        </div>

        <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Tạo Gói Cước Mới</span>
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Gói</th>
                <th className="py-3.5 px-4">Tên Gói</th>
                <th className="py-3.5 px-4">Giá Tháng</th>
                <th className="py-3.5 px-4">Giá Năm</th>
                <th className="py-3.5 px-4">Kỳ Dùng Thử</th>
                <th className="py-3.5 px-4">Phiên Bản Hiện Tại</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Chỉnh Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPlans.map((plan) => {
                const version = mockPlanVersions.find((v) => v.plan_id === plan.id);
                return (
                  <tr key={plan.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{plan.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{plan.name}</div>
                      <div className="text-[11px] text-slate-500">{plan.short_description}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {version ? formatCurrency(version.price_monthly) : '0 ₫'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-heritage-green">
                      {version ? formatCurrency(version.price_yearly) : '0 ₫'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {version?.trial_days ? `${version.trial_days} ngày` : 'Không'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                        v{version?.version_number || 1}.0
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        CÔNG KHAI
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-heritage-green hover:underline font-semibold inline-flex items-center space-x-1">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa gói</span>
                      </button>
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
