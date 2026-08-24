import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { InvoiceService } from '../services/billing/InvoiceService';
import { Invoice } from '../types/database';
import { formatDate, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await InvoiceService.getInvoices('fam-0000-0001');
      setInvoices(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Lịch Sử Hóa Đơn & Chứng Từ Thuê Bao</span>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              {invoices.length} Hóa Đơn
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Hóa đơn điện tử hợp lệ phục vụ quyết toán chi phí dòng tộc minh bạch
          </p>
        </div>

        <Link
          to="/app/billing"
          className="text-xs font-semibold text-heritage-green hover:underline flex items-center space-x-1"
        >
          <span>Quản lý gói dịch vụ</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Số Hóa Đơn</th>
                <th className="py-3.5 px-4">Ngày Phát Hành</th>
                <th className="py-3.5 px-4">Gói Thuê Bao</th>
                <th className="py-3.5 px-4">Tổng Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Chứng Từ PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {inv.invoice_number}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {formatDate(inv.issued_at || inv.created_at)}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {inv.billing_reason || 'Gói Dịch Vụ Gia Tộc (1 Năm)'}
                  </td>
                  <td className="py-4 px-4 font-black text-heritage-navy">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {inv.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => alert(`Tải xuống hóa đơn điện tử ${inv.invoice_number}`)}
                      className="text-heritage-green hover:underline font-semibold inline-flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải PDF</span>
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
