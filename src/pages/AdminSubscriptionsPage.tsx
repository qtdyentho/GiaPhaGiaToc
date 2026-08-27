import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Download,
  Calendar,
  Check,
  X,
  Ban,
  RefreshCw,
  Edit3,
  Save,
  Layers,
  Phone,
  Building,
} from 'lucide-react';
import { mockPlans } from '../services/mockData';
import { formatDate, formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export interface AdminSubscriptionItem {
  id: string;
  family_id: string;
  family_name: string;
  family_code: string;
  plan_code: 'FREE_TRIAL' | 'GIA_DINH' | 'GIA_TOC' | 'DAI_TOC';
  plan_name: string;
  status: 'ACTIVE' | 'TRIALING' | 'EXPIRED' | 'WAITING_CONFIRMATION' | 'SUSPENDED' | 'READ_ONLY';
  billing_cycle: 'YEARLY' | 'MONTHLY';
  members_count: number;
  quota_limit: number;
  price_yearly: number;
  period_start: string;
  period_end: string;
  contact_name: string;
  contact_phone: string;
  last_payment_ref?: string;
  notes?: string;
}

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionItem[]>([
    {
      id: 'sub-001',
      family_id: 'fam-0000-0001',
      family_name: 'Đại Tộc Nguyễn Văn (Yên Mô)',
      family_code: 'NGUYEN-VAN-HN',
      plan_code: 'GIA_TOC',
      plan_name: 'Gói Gia Tộc Chuẩn Mực',
      status: 'ACTIVE',
      billing_cycle: 'YEARLY',
      members_count: 86,
      quota_limit: 300,
      price_yearly: 990000,
      period_start: '2026-01-01T00:00:00Z',
      period_end: '2027-01-01T00:00:00Z',
      contact_name: 'Nguyễn Văn Hoàng',
      contact_phone: '0912345678',
      last_payment_ref: 'FT260824998877',
      notes: 'Gia tộc hạt nhân thử nghiệm - Đã thanh toán chuyển khoản',
    },
    {
      id: 'sub-002',
      family_id: 'fam-0000-0002',
      family_name: 'Gia Tộc Trần Bá (Bắc Ninh)',
      family_code: 'TRAN-BA-BN',
      plan_code: 'GIA_DINH',
      plan_name: 'Gói Khởi Lập Gia Đình',
      status: 'ACTIVE',
      billing_cycle: 'YEARLY',
      members_count: 74,
      quota_limit: 100,
      price_yearly: 490000,
      period_start: '2025-11-15T00:00:00Z',
      period_end: '2026-11-15T00:00:00Z',
      contact_name: 'Trần Bá Hải',
      contact_phone: '0903456789',
      last_payment_ref: 'MB-TRANBA-2025',
    },
    {
      id: 'sub-003',
      family_id: 'fam-0000-0003',
      family_name: 'Dòng Họ Lê Quang (Thanh Hóa)',
      family_code: 'LE-QUANG-TH',
      plan_code: 'DAI_TOC',
      plan_name: 'Gói Đại Gia Tộc Vô Cực',
      status: 'TRIALING',
      billing_cycle: 'YEARLY',
      members_count: 210,
      quota_limit: 1000,
      price_yearly: 2490000,
      period_start: '2026-08-01T00:00:00Z',
      period_end: '2026-09-01T00:00:00Z',
      contact_name: 'Lê Quang Định',
      contact_phone: '0977112233',
    },
    {
      id: 'sub-004',
      family_id: 'fam-0000-0004',
      family_name: 'Đại Tộc Vũ Đình (Nam Định)',
      family_code: 'VU-DINH-ND',
      plan_code: 'GIA_TOC',
      plan_name: 'Gói Gia Tộc Chuẩn Mực',
      status: 'WAITING_CONFIRMATION',
      billing_cycle: 'YEARLY',
      members_count: 140,
      quota_limit: 300,
      price_yearly: 990000,
      period_start: '2026-08-20T00:00:00Z',
      period_end: '2027-08-20T00:00:00Z',
      contact_name: 'Vũ Đình Mạnh',
      contact_phone: '0934567890',
      last_payment_ref: 'FT-VUDINH-PENDING',
    },
    {
      id: 'sub-005',
      family_id: 'fam-0000-0005',
      family_name: 'Gia Tộc Phạm Đức (Hải Dương)',
      family_code: 'PHAM-DUC-HD',
      plan_code: 'GIA_DINH',
      plan_name: 'Gói Khởi Lập Gia Đình',
      status: 'READ_ONLY',
      billing_cycle: 'YEARLY',
      members_count: 55,
      quota_limit: 100,
      price_yearly: 490000,
      period_start: '2025-07-01T00:00:00Z',
      period_end: '2026-07-01T00:00:00Z',
      contact_name: 'Phạm Đức Long',
      contact_phone: '0966778899',
      notes: 'Hết hạn gói - Đã chuyển sang chế độ READ_ONLY bảo toàn dữ liệu',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Selected for Edit Modal
  const [selectedSub, setSelectedSub] = useState<AdminSubscriptionItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [editPlanCode, setEditPlanCode] = useState<any>('GIA_TOC');
  const [editStatus, setEditStatus] = useState<any>('ACTIVE');
  const [editQuota, setEditQuota] = useState<number>(300);
  const [editPeriodEnd, setEditPeriodEnd] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Filtered List
  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch =
        s.family_name.toLowerCase().includes(search.toLowerCase()) ||
        s.family_code.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_phone.includes(search);

      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [subscriptions, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === 'ACTIVE').length,
      trialing: subscriptions.filter((s) => s.status === 'TRIALING').length,
      pending: subscriptions.filter((s) => s.status === 'WAITING_CONFIRMATION').length,
      readOnly: subscriptions.filter((s) => s.status === 'READ_ONLY' || s.status === 'EXPIRED').length,
      arr: subscriptions.filter((s) => s.status === 'ACTIVE').reduce((sum, s) => sum + s.price_yearly, 0),
    };
  }, [subscriptions]);

  const openEditModal = (sub: AdminSubscriptionItem) => {
    setSelectedSub(sub);
    setEditPlanCode(sub.plan_code);
    setEditStatus(sub.status);
    setEditQuota(sub.quota_limit);
    setEditPeriodEnd(sub.period_end.slice(0, 10));
    setEditNotes(sub.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const planNames: Record<string, { name: string; price: number }> = {
      FREE_TRIAL: { name: 'Gói Dùng Thử Miễn Phí', price: 0 },
      GIA_DINH: { name: 'Gói Khởi Lập Gia Đình', price: 490000 },
      GIA_TOC: { name: 'Gói Gia Tộc Chuẩn Mực', price: 990000 },
      DAI_TOC: { name: 'Gói Đại Gia Tộc Vô Cực', price: 2490000 },
    };

    const updated = subscriptions.map((s) => {
      if (s.id === selectedSub.id) {
        return {
          ...s,
          plan_code: editPlanCode,
          plan_name: planNames[editPlanCode]?.name || s.plan_name,
          price_yearly: planNames[editPlanCode]?.price ?? s.price_yearly,
          status: editStatus,
          quota_limit: Number(editQuota),
          period_end: new Date(editPeriodEnd).toISOString(),
          notes: editNotes,
        };
      }
      return s;
    });

    setSubscriptions(updated);
    setIsEditModalOpen(false);
    setActionNotice(`Đã cập nhật thành công thuê bao của dòng họ ${selectedSub.family_name}!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleQuickExtend = (subId: string, days: number) => {
    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        const curEnd = new Date(s.period_end);
        curEnd.setDate(curEnd.getDate() + days);
        return {
          ...s,
          status: 'ACTIVE' as const,
          period_end: curEnd.toISOString(),
        };
      }
      return s;
    });
    setSubscriptions(updated);
    setActionNotice(`Đã gia hạn thành công thêm ${days} ngày cho hợp đồng!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Quản Lý Thuê Bao Toàn Nền Tảng</h1>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Subscription Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát hợp đồng dịch vụ các dòng họ, gia hạn dùng thử, chuyển trạng thái và quản lý hạn mức thành viên.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold uppercase">Tổng Thuê Bao</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dòng họ đã đăng ký</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-emerald-600 text-[11px] font-bold uppercase">Đang Kích Hoạt</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Doanh thu ARR: {formatCurrency(stats.arr)}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-amber-600 text-[11px] font-bold uppercase">Đang Dùng Thử</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.trialing}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Kỳ hạn 30 ngày</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-blue-600 text-[11px] font-bold uppercase">Chờ Xác Nhận Tiền</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Cần đối soát VietQR</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-purple-600 text-[11px] font-bold uppercase">Chế Độ Read-Only</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{stats.readOnly}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Bảo toàn 100% dữ liệu</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên dòng họ, mã gia tộc, người đại diện..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#166534]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">🟢 Đang hiệu lực (Active)</option>
            <option value="TRIALING">🟡 Đang dùng thử (Trial)</option>
            <option value="WAITING_CONFIRMATION">🔵 Chờ duyệt tiền</option>
            <option value="READ_ONLY">🟣 Chế độ Read-Only</option>
            <option value="EXPIRED">🔴 Đã hết hạn</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Gia Tộc / Tenant</th>
                <th className="py-3.5 px-4">Gói Dịch Vụ</th>
                <th className="py-3.5 px-4">Đại Diện / Liên Hệ</th>
                <th className="py-3.5 px-4">Thành Viên / Hạn Mức</th>
                <th className="py-3.5 px-4">Thời Hạn Hợp Đồng</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 font-serif">{sub.family_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sub.family_code}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                      {sub.plan_name}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(sub.price_yearly)} / năm</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{sub.contact_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sub.contact_phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900">{sub.members_count}</span>
                      <span className="text-slate-400">/ {sub.quota_limit} người</span>
                    </div>
                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#166534] h-full rounded-full"
                        style={{ width: `${Math.min(100, (sub.members_count / sub.quota_limit) * 100)}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 font-medium">{formatDate(sub.period_end)}</div>
                    <div className="text-[10px] text-slate-400">Bắt đầu: {formatDate(sub.period_start)}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'TRIALING'
                          ? 'bg-amber-100 text-amber-900'
                          : sub.status === 'WAITING_CONFIRMATION'
                          ? 'bg-blue-100 text-blue-900'
                          : sub.status === 'READ_ONLY'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.status === 'ACTIVE'
                        ? '🟢 Đang hiệu lực'
                        : sub.status === 'TRIALING'
                        ? '🟡 Dùng thử'
                        : sub.status === 'WAITING_CONFIRMATION'
                        ? '🔵 Chờ duyệt tiền'
                        : sub.status === 'READ_ONLY'
                        ? '🟣 Read-Only'
                        : '🔴 Hết hạn'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(sub.id, 365)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] transition cursor-pointer border border-emerald-200"
                        title="Gia hạn nhanh 1 năm"
                      >
                        +1 Năm
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(sub)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition cursor-pointer border border-slate-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Edit Modal */}
      {isEditModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-[#14532D] to-[#166534] text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-serif">Điều Chỉnh Hợp Đồng Thuê Bao</h2>
                <p className="text-xs text-emerald-200">{selectedSub.family_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Gói Dịch Vụ Cung Cấp
                </label>
                <select
                  value={editPlanCode}
                  onChange={(e) => setEditPlanCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="FREE_TRIAL">Gói Dùng Thử Miễn Phí (0 ₫)</option>
                  <option value="GIA_DINH">Gói Khởi Lập Gia Đình (490.000 ₫/năm)</option>
                  <option value="GIA_TOC">Gói Gia Tộc Chuẩn Mực (990.000 ₫/năm)</option>
                  <option value="DAI_TOC">Gói Đại Gia Tộc Vô Cực (2.490.000 ₫/năm)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Trạng Thái Thuê Bao
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="ACTIVE">🟢 Đang hiệu lực (ACTIVE)</option>
                    <option value="TRIALING">🟡 Đang dùng thử (TRIALING)</option>
                    <option value="WAITING_CONFIRMATION">🔵 Chờ xác nhận tiền</option>
                    <option value="READ_ONLY">🟣 Chế độ Read-Only (Bảo toàn)</option>
                    <option value="EXPIRED">🔴 Hết hạn (EXPIRED)</option>
                    <option value="SUSPENDED">⛔ Tạm ngưng (SUSPENDED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Hạn Mức Thành Viên (Quota)
                  </label>
                  <input
                    type="number"
                    value={editQuota}
                    onChange={(e) => setEditQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Ngày Hết Hạn Hợp Đồng (Period End)
                </label>
                <input
                  type="date"
                  value={editPeriodEnd}
                  onChange={(e) => setEditPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Ghi Chú Kiểm Toán Admin
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Lý do điều chỉnh hạn mức / gia hạn hợp đồng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionsPage;
