import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Landmark,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { Fund, FinancialTransaction, Family } from '../../types/database';

interface AnnualFinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  family?: Family | null;
  funds: Fund[];
  transactions: FinancialTransaction[];
}

export const AnnualFinancialReportModal: React.FC<AnnualFinancialReportModalProps> = ({
  isOpen,
  onClose,
  family,
  funds,
  transactions,
}) => {
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());

  if (!isOpen) return null;

  const familyName = family?.name || 'Dòng Họ';
  const familyCode = family?.code || 'GIA-TOC';

  // Filter transactions by selected year
  const yearTx = transactions.filter((t) => {
    if (!t.transaction_date) return false;
    const yr = new Date(t.transaction_date).getFullYear();
    return yr === reportYear && t.status === 'POSTED';
  });

  const totalIncome = yearTx
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = yearTx
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalBalance = funds.reduce((sum, f) => sum + (Number(f.current_balance) || 0), 0);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã Chứng Từ', 'Ngày', 'Quỹ', 'Loại', 'Số Tiền (VNĐ)', 'Phương Thức', 'Nội Dung'];
    const rows = yearTx.map((t) => {
      const fundName = funds.find((f) => f.id === t.fund_id)?.name || 'Quỹ Chung';
      const typeStr = t.transaction_type === 'INCOME' ? 'THU' : t.transaction_type === 'EXPENSE' ? 'CHI' : t.transaction_type;
      return [
        `"${t.transaction_code}"`,
        `"${t.transaction_date}"`,
        `"${fundName}"`,
        `"${typeStr}"`,
        t.amount,
        `"${t.payment_method}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao_cao_tai_chinh_nam_${reportYear}_${familyCode.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* Modal Toolbar (Hidden on Print) */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                Báo Cáo Tài Chính Tổng Kết Năm {reportYear}
              </h2>
              <p className="text-xs text-slate-500">Chuẩn in ấn A4 phục vụ ngày Họp Họ & Giỗ Tổ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Khổ A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-serif print:overflow-visible print:p-8">
          {/* Header Trang Trọng Cổ Phong */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800 dark:border-slate-300">
            <div className="text-xs uppercase font-bold tracking-widest text-slate-600 dark:text-slate-400">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐỘC LẬP • TỰ DO • HẠNH PHÚC
            </div>
            <div className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider pt-2">
              HỘI ĐỒNG GIA TỘC {familyName.toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase pt-1 font-serif">
              BÁO CÁO THU CHI & QUẢN TRỊ NGÂN SÁCH NĂM {reportYear}
            </h1>
            <p className="text-xs italic text-slate-500 dark:text-slate-400 font-sans">
              (Trình bày trước toàn thể con cháu tại Lễ Giỗ Tổ & Họp Mặt Cuối Năm)
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300 font-sans flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tổng Thu Trong Năm</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1 font-mono">
                {totalIncome.toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
              <div className="text-[11px] font-bold uppercase text-rose-800 dark:text-rose-300 font-sans flex items-center justify-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Tổng Chi Trong Năm</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-rose-900 dark:text-rose-200 mt-1 font-mono">
                {totalExpense.toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <div className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300 font-sans flex items-center justify-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                <span>Tổng Số Dư Hiện Tại</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-200 mt-1 font-mono">
                {totalBalance.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          {/* Section 1: Tổng Hợp Các Quỹ */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200 border-l-4 border-[#166534] pl-2.5">
              I. Bảng Tổng Hợp Số Dư Các Quỹ Nội Bộ
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-sans text-[10px]">
                <tr>
                  <th className="p-2.5 border border-slate-300 dark:border-slate-700">STT</th>
                  <th className="p-2.5 border border-slate-300 dark:border-slate-700">Tên Quỹ</th>
                  <th className="p-2.5 border border-slate-300 dark:border-slate-700">Mục Đích Sử Dụng</th>
                  <th className="p-2.5 border border-slate-300 dark:border-slate-700 text-right">Tồn Đầu Kỳ</th>
                  <th className="p-2.5 border border-slate-300 dark:border-slate-700 text-right">Hiện Tồn (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund, idx) => (
                  <tr key={fund.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center">{idx + 1}</td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-bold">{fund.name}</td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      {fund.description || 'Quản lý thu chi dòng tộc'}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono">
                      {(Number(fund.opening_balance) || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                      {(Number(fund.current_balance) || 0).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Chi Tiết Giao Dịch Trong Năm */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200 border-l-4 border-[#166534] pl-2.5">
              II. Bảng Kê Chứng Từ Thu - Chi Năm {reportYear} ({yearTx.length} Giao Dịch)
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-sans text-[10px]">
                <tr>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Mã Số</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Ngày</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Loại</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Nội Dung</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 text-right">Số Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {yearTx.slice(0, 15).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono text-[11px]">{t.transaction_code}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 whitespace-nowrap">{t.transaction_date}</td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.transaction_type === 'INCOME' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                        {t.transaction_type === 'INCOME' ? 'THU' : 'CHI'}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700">{t.description}</td>
                    <td className={`p-2 border border-slate-300 dark:border-slate-700 text-right font-mono font-bold ${t.transaction_type === 'INCOME' ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                      {(t.transaction_type === 'EXPENSE' ? -1 : 1) * Number(t.amount) > 0 ? '+' : ''}
                      {Number(t.amount).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Chữ Ký Ban Quản Trị Dòng Họ */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-serif">
            <div className="space-y-16">
              <div className="font-bold uppercase">THỦ QUỸ GIA TỘC</div>
              <div className="text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
            </div>
            <div className="space-y-16">
              <div className="font-bold uppercase">BAN KIỂM SOÁT</div>
              <div className="text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
            </div>
            <div className="space-y-16">
              <div className="font-bold uppercase">TRƯỞNG TỘC / CHỦ TỌA</div>
              <div className="text-slate-500 italic">(Ký, đóng dấu họ tộc nếu có)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualFinancialReportModal;
