import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  CreditCard,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { InvoiceService } from '../services/billing/InvoiceService';
import { Invoice } from '../types/database';
import { formatDate, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PrintableInvoiceModal } from '../components/billing/PrintableInvoiceModal';

export const InvoicesPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const familyId = activeFamily?.id || 'fam-0000-0001';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await InvoiceService.getInvoices(familyId);
      setInvoices(data);
      setLoading(false);
    }
    loadData();
  }, [familyId]);

  // Tính toán tổng tiền đã thanh toán
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              CHỨNG TỪ ĐIỆN TỬ
            </span>
            <span className="text-xs text-slate-400 font-medium">Bản Quyền Dòng Họ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-2 font-serif">
            <span>Lịch Sử Hóa Đơn & Chứng Từ Thuê Bao</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hóa đơn điện tử hợp lệ phục vụ công tác quyết toán chi phí và báo cáo tài chính minh bạch cho dòng họ.
          </p>
        </div>

        <Link
          to="/app/billing"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <span>Quản lý gói dịch vụ</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Đã Thanh Toán</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-[#1E3A5F] dark:text-emerald-400 font-mono">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Khớp với Sổ Quỹ Dòng Họ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hóa Đơn / Chứng Từ</span>
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {invoices.length} <span className="text-xs font-normal text-slate-400">Chứng từ</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            100% Đã quyết toán hợp lệ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tình Trạng Sổ Cái</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            Bất Biến & Minh Bạch
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Lưu vết tự động trong Sổ Quỹ
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Danh Sách Hóa Đơn Điện Tử
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Hiển thị {invoices.length} hóa đơn
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Số Hóa Đơn</th>
                <th className="py-3.5 px-4">Ngày Phát Hành</th>
                <th className="py-3.5 px-4">Gói Thuê Bao & Diễn Giải</th>
                <th className="py-3.5 px-4">Tổng Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Chứng Từ PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Chưa có hóa đơn nào được phát hành cho dòng họ này.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoice_number}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(inv.issued_at || inv.created_at)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{inv.billing_reason || 'Gói Dịch Vụ Gia Tộc (1 Năm)'}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        Hình thức: Chuyển khoản VietQR
                      </div>
                    </td>
                    <td className="py-4 px-4 font-black text-[#1E3A5F] dark:text-emerald-400 font-mono text-sm">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{inv.status === 'PAID' ? 'ĐÃ QUYẾT TOÁN' : 'CHỜ THANH TOÁN'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-[#166534] dark:text-emerald-400 hover:text-[#14532D] font-bold inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs shadow-2xs hover:shadow-xs transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem & In HĐ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Note Box */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Hướng dẫn thanh quyết toán nội bộ dòng họ:</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Hóa đơn điện tử này đã được ký số tự động và lưu vết đồng bộ trong Sổ Quỹ Gia Tộc. Ban Quản Trị / Trưởng Tộc có thể bấm <strong>"Xem & In HĐ"</strong> để xuất bản in hoặc lưu file PDF làm chứng từ chi quỹ thường niên của dòng họ một cách minh bạch.
          </p>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      <PrintableInvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        family={activeFamily}
      />
    </div>
  );
};

export default InvoicesPage;
