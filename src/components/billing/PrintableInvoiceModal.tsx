import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2, Landmark, ShieldCheck, FileText, QrCode, Building2, User } from 'lucide-react';
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
  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'PAID';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto font-sans animate-fade-in"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-scale-up print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
      >
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif">Chứng Từ Hóa Đơn Thuê Bao</h3>
              <p className="text-[11px] text-slate-400">Mã hóa đơn: <span className="font-mono text-emerald-400 font-bold">{invoice.invoice_number}</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Đóng cửa sổ (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 space-y-6 text-slate-900 dark:text-slate-100 print:p-6 bg-[#FCFDFB] dark:bg-slate-900">
          {/* Top Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#166534] dark:text-emerald-400 font-black text-xl font-serif">
                <Landmark className="w-6 h-6" />
                <span>GIA PHẢ GIA TỘC</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ SaaS</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500">Cổng Dịch Vụ: https://giaphagiatoc.vn • Hotline: 1900 6868</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                HÓA ĐƠN ĐIỆN TỬ HỢP LỆ
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono">{invoice.invoice_number}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Ngày lập: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(invoice.issued_at || invoice.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Beneficiary Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ĐƠN VỊ THU HƯỞNG (DÒNG HỌ)
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm font-serif">{family?.name || 'Đại Tộc Nguyễn Văn'}</p>
              <p className="text-slate-600 dark:text-slate-300">Mã định danh dòng họ: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{family?.code || 'CLAN-NGUYEN'}</span></p>
              {family?.ancestral_hall_address ? (
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Từ đường: {family.ancestral_hall_address}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Khu vực: Yên Mô, Ninh Bình / Hà Nội</p>
              )}
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                TRẠNG THÁI QUYẾT TOÁN
              </span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full border ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isPaid ? 'ĐÃ THANH TOÁN (HỢP LỆ)' : 'CHỜ THANH TOÁN'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                Phương thức: <span className="font-semibold text-slate-700 dark:text-slate-300">Chuyển khoản VietQR (Napas247)</span>
              </p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-3.5 px-4">Diễn Giải Gói Bản Quyền & Dịch Vụ</th>
                  <th className="py-3.5 px-4 text-center">Thời Hạn</th>
                  <th className="py-3.5 px-4 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                <tr>
                  <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="text-sm font-bold text-[#166534] dark:text-emerald-400">
                      {invoice.billing_reason || 'Gói Gia Tộc (1 năm) – 300 thành viên'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-1 leading-relaxed">
                      Bao gồm: Cây phả hệ đa đời không giới hạn, Lịch âm ngày giỗ & nhắc việc tự động, Quản lý thu chi sổ quỹ kép bất biến & Mã QR Từ Đường thông minh.
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                    1 Năm (12 Tháng)
                  </td>
                  <td className="py-4 px-4 text-right font-black text-sm text-slate-900 dark:text-white font-mono">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  <td colSpan={2} className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                    TỔNG CỘNG THANH TOÁN (VNĐ):
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-base text-[#166534] dark:text-emerald-400 font-mono">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Seal / Digital Signature & QR Verification */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Chứng từ điện tử lưu vết bất biến trên Sổ Cái Gia Tộc.</span>
                <p className="text-[11px]">Hợp lệ phục vụ công tác quyết toán nội bộ và báo cáo tài chính thường niên của dòng họ.</p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="w-32 h-11 border-2 border-emerald-600 dark:border-emerald-500 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-[11px] uppercase tracking-wider font-serif bg-emerald-50/60 dark:bg-emerald-950/50 shadow-xs mx-auto sm:ml-auto">
                ✓ ĐÃ DUYỆT THU
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Xác thực hệ thống tự động</span>
            </div>
          </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
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
