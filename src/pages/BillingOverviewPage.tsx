import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldAlert, ArrowUpRight, Download, Clock, Sparkles, AlertCircle, Building } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionService } from '../services/billing/SubscriptionService';
import { InvoiceService } from '../services/billing/InvoiceService';
import { GenealogyService } from '../services/GenealogyService';
import { Subscription, Invoice, Member, Branch } from '../types/database';

export const BillingOverviewPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [branchesCount, setBranchesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const familyId = activeFamily?.id;

  useEffect(() => {
    async function loadBillingData() {
      if (!familyId) {
        setSubscription(null);
        setInvoices([]);
        setMembersCount(0);
        setBranchesCount(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [sub, invs, tree] = await Promise.all([
          SubscriptionService.getSubscription(familyId),
          InvoiceService.getInvoices(familyId),
          GenealogyService.getFamilyTree(familyId),
        ]);

        setSubscription(sub);
        setInvoices(invs || []);
        setMembersCount(tree.members?.length || 0);
        setBranchesCount(tree.branches?.length || 0);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu gói cước:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, [familyId]);

  if (!activeFamily) {
    return (
      <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12 font-sans">
        <Building className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Chưa Chọn Dòng Họ</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng chọn hoặc tạo dòng họ để xem thông tin gói dịch vụ.</p>
      </div>
    );
  }

  const isTrial = subscription?.status === 'TRIALING';
  const isActive = subscription?.status === 'ACTIVE';
  const planName = isTrial ? 'Gói Gia Tộc (Dùng Thử 30 Ngày)' : isActive ? 'Gói Gia Tộc Tiêu Chuẩn' : 'Gói Miễn Phí Cơ Bản';
  const maxMembers = isTrial ? 300 : isActive ? 500 : 50;
  const maxBranches = isTrial ? 10 : isActive ? 30 : 2;

  const memberPercentage = Math.min(Math.round((membersCount / maxMembers) * 100), 100);
  const branchPercentage = Math.min(Math.round((branchesCount / maxBranches) * 100), 100);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Gói Dịch Vụ Gia Tộc</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold">
              {activeFamily.name}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý hạn mức thành viên, dung lượng lưu trữ và lịch sử thanh toán dòng họ
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/pricing"
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <span>Nâng Cấp Gói Cước</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Subscription Hero Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isTrial ? 'Giai Đoạn Dùng Thử Trải Nghiệm' : isActive ? 'Thuê Bao Đang Hoạt Động' : 'Gói Cơ Bản'}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white font-serif">{planName}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Số hóa phả đồ toàn tộc, tự động tính ngày giỗ âm lịch, quản lý sổ quỹ kép bất biến và mã QR Từ Đường.
            </p>
            {subscription && (
              <div className="text-xs text-amber-300 font-semibold mt-3 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>
                  Thời hạn: {formatDate(subscription.current_period_start)} — {formatDate(subscription.current_period_end)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/15 text-right shrink-0">
            <div className="text-xs text-slate-300 font-medium">Chi phí duy trì gói</div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {isTrial ? '0 ₫' : isActive ? '990.000 ₫' : '0 ₫'}{' '}
              <span className="text-xs font-normal text-slate-300">/ năm</span>
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">
              {isTrial ? 'Miễn phí trải nghiệm đầy đủ tính năng' : 'Chuyển khoản VietQR Napas247'}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Usage 1: Members */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <span>Số Lượng Thành Viên</span>
            <span className="text-slate-900 dark:text-white font-bold">{membersCount} / {maxMembers}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-[#166534] dark:bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${memberPercentage}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Còn lại {Math.max(0, maxMembers - membersCount)} thành viên khả dụng
          </div>
        </div>

        {/* Usage 2: Storage */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <span>Dung Lượng Lưu Trữ</span>
            <span className="text-slate-900 dark:text-white font-bold">WebP Nén Tối Ưu</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '12%' }}></div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Tự động nén ảnh WebP giảm 90% dung lượng
          </div>
        </div>

        {/* Usage 3: Branches */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <span>Chi Phái Trực Thuộc</span>
            <span className="text-slate-900 dark:text-white font-bold">{branchesCount} / {maxBranches} Chi</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${branchPercentage}%` }}></div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Quản lý độc lập từng chi phái trong gia tộc
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lịch Sử Hóa Đơn & Thanh Toán</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <p>Dòng họ chưa có hóa đơn phát sinh. Khi nâng cấp gói cước, thông tin hóa đơn sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Số Hóa Đơn</th>
                  <th className="py-3 px-4">Ngày Xuất</th>
                  <th className="py-3 px-4">Nội Dung</th>
                  <th className="py-3 px-4">Tổng Tiền</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{formatDate(inv.issued_at)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{inv.billing_reason}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(inv.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 font-semibold rounded-full text-[10px] ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {inv.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ ĐỐI SOÁT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center space-x-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
