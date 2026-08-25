import React from 'react';
import { X, Printer, Download, CheckCircle2, Landmark, ShieldCheck, FileText } from 'lucide-react';
import { Invoice, Family } from '../../types/database';
import { formatDate, formatCurrency } from '../../lib/utils';

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  family: Family | null;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  family,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'PAID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-fade-in print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Chứng Từ Hóa Đơn Thuê Bao</h3>
              <p className="text-[11px] text-slate-400">Mã số: {invoice.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 space-y-6 text-slate-900 print:p-6 bg-[#FCFDFB]">
          {/* Top Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#166534] font-black text-lg font-serif">
                <Landmark className="w-5 h-5" />
                <span>GIA PHẢ GIA TỘC SaaS</span>
              </div>
              <p className="text-[11px] text-slate-500">Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái</p>
              <p className="text-[11px] text-slate-500">Website: https://giaphagiatoc.vn • Hotline: 1900 6868</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">HÓA ĐƠN ĐIỆN TỬ</div>
              <div className="text-base font-black text-slate-900 font-mono">{invoice.invoice_number}</div>
              <div className="text-xs text-slate-500">
                Ngày: {formatDate(invoice.issued_at || invoice.created_at)}
              </div>
            </div>
          </div>

          {/* Customer & Beneficiary Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase text-[10px]">ĐƠN VỊ THU HƯỞNG (DÒNG HỌ)</span>
              <p className="font-bold text-slate-900 text-sm">{family?.name || 'Đại Tộc Gia Phả'}</p>
              <p className="text-slate-600">Mã dòng họ: <span className="font-mono font-semibold">{family?.code || 'CLAN'}</span></p>
              {family?.ancestral_hall_address && (
                <p className="text-slate-500 text-[11px]">Từ đường: {family.ancestral_hall_address}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-slate-500 uppercase text-[10px]">TRẠNG THÁI THANH TOÁN</span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isPaid ? 'ĐÃ QUYẾT TOÁN' : 'CHỜ THANH TOÁN'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Phương thức: <span className="font-semibold">Chuyển khoản VietQR (Napas247)</span>
              </p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Diễn Giải Dịch Vụ</th>
                  <th className="py-3 px-4 text-center">Thời Hạn</th>
                  <th className="py-3 px-4 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div>{invoice.billing_reason || 'Gói Dịch Vụ Gia Tộc (Bản Quyền Đầy Đủ)'}</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Bao gồm: Cây phả hệ đa đời, Lịch âm ngày giỗ, Quản lý thu chi sổ quỹ kép & Mã QR Từ Đường
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600">1 Năm (12 Tháng)</td>
                  <td className="py-4 px-4 text-right font-black text-sm text-slate-900 font-mono">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right text-slate-700">TỔNG CỘNG THANH TOÁN:</td>
                  <td className="py-3 px-4 text-right font-black text-base text-[#166534] font-mono">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Seal / Digital Signature */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Chứng từ điện tử lưu vết bất biến trên Sổ Cái Gia Tộc. Hợp lệ quyết toán nội bộ dòng họ.</span>
            </div>

            <div className="text-center sm:text-right">
              <div className="w-28 h-10 border-2 border-emerald-600 rounded-lg flex items-center justify-center text-emerald-700 font-black text-[10px] uppercase tracking-wider font-serif bg-emerald-50/50 shadow-xs mx-auto sm:ml-auto">
                ĐÃ DUYỆT THU
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Xác thực hệ thống tự động</span>
            </div>
          </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn / Xuất PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoiceModal;
