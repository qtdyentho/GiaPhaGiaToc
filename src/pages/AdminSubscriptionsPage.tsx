import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Users, Search, Filter, ShieldCheck, CheckCircle2, Clock, 
  RotateCcw, Sparkles, AlertTriangle, ArrowUpRight, Plus, Download, Calendar,
  Check, X, Ban, RefreshCw
} from 'lucide-react';
import { mockPlans, mockFamily } from '../services/mockData';
import { formatDate, formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export interface AdminSubscriptionItem {
  id: string;
  family_id: string;
  family_name: string;
  family_code: string;
  plan_code: 'FREE_TRIAL' | 'GIA_DINH' | 'GIA_TOC' | 'DAI_TOC';
  plan_name: string;
  status: 'ACTIVE' | 'TRIALING' | 'EXPIRED' | 'WAITING_CONFIRMATION' | 'SUSPENDED';
  billing_cycle: 'YEARLY' | 'MONTHLY';
  members_count: number;
  quota_limit: number;
  price_yearly: number;
  period_start: string;
  period_end: string;
  contact_name: string;
  contact_phone: string;
  last_payment_ref?: string;
}

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionItem[]>([
    {
      id: 'sub-001',
      family_id: 'fam-0000-0001',
      family_name: 'Đại Tộc Nguyễn Văn',
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
      status: 'EXPIRED',
      billing_cycle: 'YEARLY',
      members_count: 55,
      quota_limit: 100,
      price_yearly: 490000,
      period_start: '2025-07-01T00:00:00Z',
      period_end: '2026-07-01T00:00:00Z',
      contact_name: 'Phạm Đức Long',
      contact_phone: '0966778899',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'TRIALING' | 'WAITING_CONFIRMATION' | 'EXPIRED'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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
      arr: subscriptions.filter((s) => s.status === 'ACTIVE').reduce((sum, s) => sum + s.price_yearly, 0),
    };
  }, [subscriptions]);

  const handleExtendTrial = (subId: string) => {
    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        const curEnd = new Date(s.period_end);
        curEnd.setDate(curEnd.getDate() + 30);
        return {
          ...s,
          status: 'TRIALING' as const,
          period_end: curEnd.toISOString(),
        };
      }
      return s;
    });
    setSubscriptions(updated);
    setActionNotice('Đã gia hạn thêm 30 ngày dùng thử thành công!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleActivateSubscription = (subId: string) => {
    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        const curEnd = new Date();
        curEnd.setFullYear(curEnd.getFullYear() + 1);
        return {
          ...s,
          status: 'ACTIVE' as const,
          period_end: curEnd.toISOString(),
        };
      }
      return s;
    });
    setSubscriptions(updated);
    setActionNotice('Kích hoạt thuê bao chính thức thành công (Thời hạn 1 năm)!');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Thuê Bao Toàn Nền Tảng</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giám sát hợp đồng dịch vụ các dòng họ, gia hạn dùng thử và kích hoạt thuê bao chính thức
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionNotice('Đã đồng bộ trạng thái thanh toán từ cổng ngân hàng.');
              setTimeout(() => setActionNotice(null), 2500);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer border border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đồng Bộ Hóa Đơn</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-medium animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Thuê Bao</div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Dòng họ đã đăng ký</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang Hiệu Lực (Active)</div>
          <div className="text-2xl font-black text-emerald-700">{stats.active}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Gia hạn hàng năm</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dùng Thử / Chờ Duyệt</div>
          <div className="text-2xl font-black text-amber-700">{stats.trialing + stats.pending}</div>
          <div className="text-[10px] text-amber-600 font-medium">{stats.pending} giao dịch chờ duyệt</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doanh Thu ARR Ước Tính</div>
          <div className="text-xl font-black text-[#166534]">{formatCurrency(stats.arr)}</div>
          <div className="text-[10px] text-slate-500">Doanh thu định kỳ năm</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên dòng họ, mã gia tộc, người đại diện, SĐT..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#166534]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang kích hoạt (Active)</option>
            <option value="TRIALING">Đang dùng thử (Trial)</option>
            <option value="WAITING_CONFIRMATION">Chờ xác nhận thanh toán</option>
            <option value="EXPIRED">Đã hết hạn</option>
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
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                  {/* Family name & code */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{sub.family_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sub.family_code}</div>
                  </td>

                  {/* Plan */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                      {sub.plan_name}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(sub.price_yearly)} / năm</div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{sub.contact_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sub.contact_phone}</div>
                  </td>

                  {/* Quota */}
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

                  {/* Period End */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 font-medium">{formatDate(sub.period_end)}</div>
                    <div className="text-[10px] text-slate-400">Bắt đầu: {formatDate(sub.period_start)}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'TRIALING'
                          ? 'bg-amber-100 text-amber-900'
                          : sub.status === 'WAITING_CONFIRMATION'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.status === 'ACTIVE'
                        ? 'Đang hiệu lực'
                        : sub.status === 'TRIALING'
                        ? 'Dùng thử 30 ngày'
                        : sub.status === 'WAITING_CONFIRMATION'
                        ? 'Chờ duyệt tiền'
                        : 'Hết hạn'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {sub.status === 'TRIALING' && (
                        <button
                          onClick={() => handleExtendTrial(sub.id)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[11px] transition shadow-2xs cursor-pointer border border-amber-300"
                        >
                          +30 Ngày Trial
                        </button>
                      )}
                      {sub.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleActivateSubscription(sub.id)}
                          className="px-2.5 py-1 bg-[#166534] hover:bg-[#14532D] text-white font-bold rounded-lg text-[11px] transition shadow-2xs cursor-pointer"
                        >
                          Kích Hoạt
                        </button>
                      )}
                      {sub.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleExtendTrial(sub.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition cursor-pointer border border-slate-300"
                        >
                          Gia Hạn
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Không tìm thấy hợp đồng thuê bao phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
