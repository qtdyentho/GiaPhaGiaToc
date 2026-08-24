import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Eye, Clock, User, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const mockAuditLogs = [
    {
      id: 'aud-001',
      action: 'POST',
      entity_type: 'financial_transactions',
      entity_id: 'tx-001',
      actor: 'Nguyễn Văn Hoàng (Trưởng Tộc)',
      ip_address: '113.190.242.15',
      created_at: '2026-08-20T14:15:00Z',
      description: 'Ghi sổ bút toán thu quỹ 500.000 ₫ (THU-20260815-1024)',
      old_data: { status: 'PENDING', amount_paid: 0 },
      new_data: { status: 'POSTED', amount_paid: 500000, fund_balance: '+500000' },
    },
    {
      id: 'aud-002',
      action: 'APPROVE',
      entity_type: 'expense_records',
      entity_id: 'exp-001',
      actor: 'Nguyễn Văn Tuấn (Ban Kiểm Soát)',
      ip_address: '113.190.242.18',
      created_at: '2026-08-19T09:30:00Z',
      description: 'Phê duyệt phiếu chi 5.200.000 ₫ mua sắm đồ lễ Giỗ Cụ Thủy Tổ',
      old_data: { status: 'PENDING_APPROVAL' },
      new_data: { status: 'APPROVED', approved_by: 'usr-0002' },
    },
    {
      id: 'aud-003',
      action: 'CREATE',
      entity_type: 'members',
      entity_id: 'mb-004',
      actor: 'Nguyễn Văn Hoàng (Ban Gia Phả)',
      ip_address: '113.190.242.15',
      created_at: '2026-08-01T10:00:00Z',
      description: 'Thêm mới thành viên Nguyễn Văn Tuấn (Đời thứ 4, Chi Trưởng)',
      old_data: null,
      new_data: { full_name: 'Nguyễn Văn Tuấn', generation_id: 'gen-4', branch_id: 'br-1' },
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Nhật Ký Hoạt Động & Ghi Nhận Dòng Họ</span>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Lưu Truyền Minh Bạch
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Ghi nhận toàn bộ các thao tác chỉnh sửa phả hệ, thu chi quỹ họ và duyệt phiếu chi
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung hành động, đối tượng, người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select className="bg-transparent focus:outline-none font-medium">
              <option value="ALL">Tất cả hành động</option>
              <option value="POST">Ghi sổ (POST)</option>
              <option value="APPROVE">Duyệt chi (APPROVE)</option>
              <option value="CREATE">Tạo mới (CREATE)</option>
              <option value="REVERSE">Đảo ngược (REVERSE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4">Người Thực Hiện</th>
                <th className="py-3.5 px-4">Hành Động</th>
                <th className="py-3.5 px-4">Đối Tượng</th>
                <th className="py-3.5 px-4">Chi Tiết Thao Tác</th>
                <th className="py-3.5 px-4">Địa Chỉ IP</th>
                <th className="py-3.5 px-4 text-right">Chi Tiết Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.actor}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.action === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'APPROVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{log.entity_type}</td>
                  <td className="py-3.5 px-4 text-slate-800">{log.description}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{log.ip_address}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-heritage-green hover:text-heritage-green-light font-bold inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Diff</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-heritage-green" />
              <span>Chi Tiết Dữ Liệu Thay Đổi (Audit Diff)</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Dữ Liệu Cũ (Old Data):</span>
                <pre className="mt-1 bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>

              <div>
                <span className="font-bold text-emerald-600 uppercase text-[10px]">Dữ Liệu Mới (New Data):</span>
                <pre className="mt-1 bg-slate-900 text-emerald-300 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-heritage-navy hover:bg-heritage-navy-light text-white text-xs font-bold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
