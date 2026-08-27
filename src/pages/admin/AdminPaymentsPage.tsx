import React, { useState, useEffect } from 'react';
import { Landmark, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminBillingService } from '../../services/billing/AdminBillingService';
import { Invoice } from '../../types/database';
import { mockInvoices } from '../../services/mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function AdminPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Form states for confirmation
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState('');
  const [bankDate, setBankDate] = useState(new Date().toISOString().slice(0, 10));
  const [auditReason, setAuditReason] = useState('Đã kiểm tra sao kê ngân hàng MBBank ngày ' + new Date().toLocaleDateString('vi-VN'));

  // Form state for rejection
  const [rejectReason, setRejectReason] = useState('');

  // Notification message
  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  useEffect(() => {
    async function loadLiveInvoices() {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('subscription_invoices')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            setInvoices(data as Invoice[]);
          }
        } catch (err) {
          console.warn('loadLiveInvoices error:', err);
        }
      }
    }
    loadLiveInvoices();
  }, []);

  const openConfirmModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setReceivedAmount(inv.total);
    setTransactionRef(`FT${Date.now().toString().slice(-8)}`);
    setBankDate(new Date().toISOString().slice(0, 10));
    setAuditReason('Đã đối chiếu khớp sao kê ngân hàng ngày ' + new Date().toLocaleDateString('vi-VN'));
    setIsConfirmModalOpen(true);
  };

  const openRejectModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setRejectReason('Không tìm thấy giao dịch chuyển khoản trong sao kê ngân hàng');
    setIsRejectModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await AdminBillingService.adminConfirmPayment('usr-super-admin', selectedInvoice.id, {
        receivedAmount,
        transactionReference: transactionRef,
        bankTransactionDate: bankDate,
        auditReason,
      });

      if (res.success) {
        setFeedback({ type: 'SUCCESS', message: res.message });
        setInvoices((prev) =>
          prev.map((i) => (i.id === selectedInvoice.id ? { ...i, status: 'PAID' as const } : i))
        );
      } else {
        setFeedback({ type: 'ERROR', message: res.message });
      }
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message || 'Lỗi xác nhận thanh toán' });
    }
  };

  const handleRejectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await AdminBillingService.adminRejectPayment('usr-super-admin', selectedInvoice.id, {
        rejectReason,
      });

      setFeedback({ type: 'SUCCESS', message: res.message });
      setInvoices((prev) =>
        prev.map((i) => (i.id === selectedInvoice.id ? { ...i, status: 'REJECTED' as const } : i))
      );
      setIsRejectModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'ERROR', message: err.message || 'Lỗi từ chối thanh toán' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING_CONFIRMATION':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">🟠 Chờ Admin Xác Nhận</span>;
      case 'PENDING_PAYMENT':
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">🟡 Chờ Chuyển Khoản</span>;
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">🟢 Đã Thanh Toán</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">🔴 Đã Từ Chối</span>;
      case 'PARTIAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">🟣 Thanh Toán Thiếu</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link to="/admin/beta" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Trung Tâm Chỉ Huy
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-600" />
            Xác Nhận Thanh Toán Thủ Công (Manual Admin Payment Confirmation)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kiểm tra sao kê ngân hàng thực tế bên ngoài hệ thống và xác nhận kích hoạt gói cước cho các dòng họ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/billing/config"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            ⚙️ Cấu Hình Tài Khoản Nhận
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Payment Requests Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Danh Sách Yêu Cầu Thanh Toán ({invoices.length})
          </h2>
          <span className="text-xs text-gray-400">Atomic Database Transaction Guard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Mã Hóa Đơn</th>
                <th className="py-2.5 px-3">Lý Do Thu / Gói</th>
                <th className="py-2.5 px-3 text-right">Số Tiền</th>
                <th className="py-2.5 px-3">Thời Gian Tạo</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-900">{inv.invoice_number}</td>
                  <td className="py-3 px-3 text-gray-700">{inv.billing_reason}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">
                    {inv.total.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {inv.created_at ? new Date(inv.created_at).toLocaleDateString('vi-VN') : '24/08/2026'}
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(inv.status)}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {inv.status !== 'PAID' ? (
                      <>
                        <button
                          onClick={() => openConfirmModal(inv)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
                        >
                          Xác Nhận
                        </button>
                        <button
                          onClick={() => openRejectModal(inv)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg transition-all"
                        >
                          Từ Chối
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 font-semibold italic text-[11px]">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Xác Nhận Thanh Toán & Kích Hoạt Thuê Bao
              </h3>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã hóa đơn:</span>
                  <span className="font-bold text-gray-900">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền hóa đơn:</span>
                  <span className="font-bold text-emerald-700">{selectedInvoice.total.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Số Tiền Thực Nhận Trên Sao Kê (VNĐ) *</label>
                <input
                  type="number"
                  required
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mã Giao Dịch Ngân Hàng (Bank Ref / FT...) *</label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="FT260824123456"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Ngày Ghi Nhận Tiền Vào Tài Khoản *</label>
                <input
                  type="date"
                  required
                  value={bankDate}
                  onChange={(e) => setBankDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Lý Do Kiểm Toán (Audit Reason) *</label>
                <textarea
                  required
                  rows={2}
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Thao tác này sẽ ghi nhận thanh toán SUCCESS, chuyển hóa đơn sang PAID và kích hoạt/gia hạn thuê bao 365 ngày.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Xác Nhận Đã Nhận Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Từ Chối Yêu Cầu Thanh Toán
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã hóa đơn:</span>
                  <span className="font-bold text-gray-900">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-red-600">{selectedInvoice.total.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Lý Do Từ Chối (Bắt buộc) *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Không tìm thấy giao dịch chuyển tiền trên sao kê ngân hàng..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
