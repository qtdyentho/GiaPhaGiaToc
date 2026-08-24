import React, { useState } from 'react';
import { Shield, MapPin, Building, Copy, Plus, UserCheck, Key, CheckCircle2 } from 'lucide-react';
import { mockFamily, mockMemberships } from '../services/mockData';
import { ROLE_LABELS } from '../lib/constants';

export const FamilySettingsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [generatedToken, setGeneratedToken] = useState('GP-INVITE-2026-HN01');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://giapha.vn/join?token=${generatedToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cài Đặt & Cấu Hình Không Gian Gia Tộc</h1>
          <p className="text-xs text-slate-500">Quản lý hồ sơ dòng tộc, phân quyền thành viên và mã mời tham gia</p>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Thông tin Từ đường & Dòng họ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box 1: Thông tin cơ bản */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-heritage-green" />
              <span>Hồ Sơ Gia Tộc</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Tên Gia Tộc</label>
                <input
                  type="text"
                  defaultValue={mockFamily.name}
                  className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Mã Gia Tộc (Code)</label>
                <input
                  type="text"
                  disabled
                  defaultValue={mockFamily.code}
                  className="mt-1 block w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Địa Chỉ Nhà Thờ Tổ (Từ Đường)</label>
              <input
                type="text"
                defaultValue={mockFamily.ancestral_hall_address}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Mô Tả & Lịch Sử Tóm Tắt</label>
              <textarea
                rows={3}
                defaultValue={mockFamily.description}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button className="px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg transition shadow-sm">
                Lưu Thay Đổi
              </button>
            </div>
          </div>

          {/* Box 2: Danh sách thành viên quản trị */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-heritage-green" />
              <span>Danh Sách Phân Quyền (RBAC)</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {mockMemberships.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Nguyễn Văn Hoàng</div>
                    <div className="text-[11px] text-slate-500">truongtoc.nguyen@giapha.vn</div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROLE_LABELS[m.role]?.color}`}>
                    {ROLE_LABELS[m.role]?.label || m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mã mời & Liên kết tham gia */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Key className="w-4 h-4 text-heritage-gold" />
              <span>Mời Thành Viên Gia Tộc</span>
            </h2>

            <p className="text-xs text-slate-500">
              Tạo mã mời hoặc đường dẫn chia sẻ cho con cháu gia tộc tham gia xem gia phả.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Gán Vai Trò Khi Tham Gia</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green"
              >
                <option value="MEMBER">Thành viên gia tộc (Xem & Đóng quỹ)</option>
                <option value="GENEALOGY_ADMIN">Ban Gia Phả (Chỉnh sửa cây)</option>
                <option value="TREASURER">Thủ Quỹ (Quản lý thu chi)</option>
                <option value="VIEWER">Khách xem (Chỉ đọc)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-600">Đường dẫn mời tham gia:</div>
              <div className="text-xs font-mono font-bold text-heritage-navy break-all bg-white p-2 rounded border border-slate-200">
                https://giapha.vn/join?token={generatedToken}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 bg-heritage-navy hover:bg-heritage-navy-light text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Đã sao chép link!' : 'Sao chép link mời'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              * Mã mời có thời hạn 7 ngày kể từ lúc tạo và tự động gắn vào chi phái.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
