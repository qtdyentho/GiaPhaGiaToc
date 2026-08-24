import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Shield, Lock, Check, X, Search, Filter, User } from 'lucide-react';
import { ROLE_LABELS } from '../lib/constants';
import { mockMemberships, mockMembers } from '../services/mockData';

export const PermissionsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  // 8 Roles Matrix Definition
  const rolesList = ['OWNER', 'ADMIN', 'GENEALOGY_ADMIN', 'TREASURER', 'APPROVER', 'EVENT_MANAGER', 'MEMBER', 'VIEWER'];

  const permissionsMatrix = [
    { module: 'Quản lý thông tin & Cài đặt Gia tộc', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: false, member: false, viewer: false },
    { module: 'Thêm, sửa, xóa thành viên & Cây gia phả', owner: true, admin: true, genealogy: true, treasurer: false, approver: false, event: false, member: false, viewer: false },
    { module: 'Lập đợt thu quỹ & Ghi nhận thu tiền', owner: true, admin: true, genealogy: false, treasurer: true, approver: false, event: false, member: false, viewer: false },
    { module: 'Đề xuất khoản chi từ quỹ', owner: true, admin: true, genealogy: false, treasurer: true, approver: false, event: true, member: false, viewer: false },
    { module: 'Phê duyệt khoản chi (Ban Kiểm Soát)', owner: true, admin: false, genealogy: false, treasurer: false, approver: true, event: false, member: false, viewer: false },
    { module: 'Tạo và điều hành sự kiện họ tộc', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: true, member: false, viewer: false },
    { module: 'Xem cây gia phả & Lịch âm ngày giỗ', owner: true, admin: true, genealogy: true, treasurer: true, approver: true, event: true, member: true, viewer: true },
    { module: 'Quản lý gói dịch vụ thuê bao (Billing)', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: false, member: false, viewer: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Ma Trận Phân Quyền Gia Tộc (RBAC)</span>
            <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              8 Cấp Độ Vai Trò
            </span>
          </h1>
          <p className="text-xs text-slate-500">Phân định rành mạch quyền hạn giữa Trưởng họ, Ban Gia phả, Thủ quỹ và Ban Kiểm soát</p>
        </div>
      </div>

      {/* Role Descriptions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rolesList.map((roleKey) => {
          const roleInfo = ROLE_LABELS[roleKey];
          return (
            <div key={roleKey} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">{roleInfo.description}</p>
            </div>
          );
        })}
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-heritage-green" />
            <span>Ma Trận Quyền Hạn Chi Tiết Từng Phân Hệ</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Phân Hệ Nghiệp Vụ</th>
                <th className="py-3 px-2">Trưởng Tộc</th>
                <th className="py-3 px-2">Quản Trị</th>
                <th className="py-3 px-2">Ban Gia Phả</th>
                <th className="py-3 px-2">Thủ Quỹ</th>
                <th className="py-3 px-2">Kiểm Soát</th>
                <th className="py-3 px-2">Khánh Tiết</th>
                <th className="py-3 px-2">Thành Viên</th>
                <th className="py-3 px-2">Khách Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-left font-semibold text-slate-900">{row.module}</td>
                  <td className="py-3 px-2">{row.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.genealogy ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.treasurer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.approver ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.event ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.member ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 px-2">{row.viewer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
