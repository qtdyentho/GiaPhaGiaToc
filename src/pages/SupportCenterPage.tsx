import React, { useState } from 'react';
import { LifeBuoy, Send, MessageSquare, CheckCircle, AlertCircle, Clock, ShieldCheck, ThumbsUp } from 'lucide-react';
import { BetaOperationsService, SupportTicket } from '../services/BetaOperationsService';
import { Logger } from '../lib/logger';
import { useAuth } from '../contexts/AuthContext';

export default function SupportCenterPage() {
  const { activeFamily, user } = useAuth();
  const currentFamilyId = activeFamily?.id || '';
  const currentUserId = user?.id || '';

  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    currentFamilyId ? BetaOperationsService.getTicketsByFamily(currentFamilyId) : []
  );
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('GENEALOGY');
  const [severity, setSeverity] = useState<SupportTicket['severity']>('LOW');
  const [description, setDescription] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [nps, setNps] = useState(10);
  const [csat, setCsat] = useState(5);
  const [willingToPay, setWillingToPay] = useState(true);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const reqId = Logger.generateRequestId();
    const newTicket = BetaOperationsService.createSupportTicket(
      {
        familyId: currentFamilyId,
        userId: currentUserId,
        category,
        severity,
        subject,
        description,
      },
      reqId
    );

    setTickets([newTicket, ...tickets]);
    setSubject('');
    setDescription('');
    setSubmittedMessage(`Đã gửi yêu cầu hỗ trợ thành công (Mã phiếu: ${newTicket.id})`);
    setTimeout(() => setSubmittedMessage(null), 5000);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const reqId = Logger.generateRequestId();
    BetaOperationsService.submitBetaFeedback(
      {
        familyId: currentFamilyId,
        userId: currentUserId,
        npsScore: nps,
        csatScore: csat,
        easeOfUseScore: 5,
        dataImportDifficulty: 'EASY',
        genealogyUsability: 'EXCELLENT',
        financialUsability: 'EXCELLENT',
        calendarUsability: 'EXCELLENT',
        willingnessToPay: willingToPay,
        comment: feedbackComment,
      },
      reqId
    );

    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setShowFeedbackModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-emerald-600" />
            Trung Tâm Hỗ Trợ & Tiếp Nhận Ý Kiến Gia Tộc
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đội ngũ Kỹ thuật và Ban Cố vấn luôn đồng hành phụng sự và hỗ trợ dòng họ 24/7 trong suốt quá trình vận hành.
          </p>
        </div>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ThumbsUp className="w-4 h-4" />
          Đóng Góp Ý Kiến Gia Tộc
        </button>
      </div>

      {submittedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{submittedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Gửi Yêu Cầu */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            Gửi Phiếu Yêu Cầu Hỗ Trợ
          </h2>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Phân Loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="GENEALOGY">Phả Hệ & Cây Gia Phả</option>
                <option value="MEMORIAL">Lịch Âm & Ngày Giỗ</option>
                <option value="FINANCE">Sổ Quỹ & Tài Chính</option>
                <option value="PAYMENT">Thanh Toán & Hóa Đơn</option>
                <option value="BUG">Báo Lỗi Hệ Thống</option>
                <option value="FEATURE_REQUEST">Đề Xuất Tính Năng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Mức Độ Ưu Tiên
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LOW">Thấp (Low) - Tư vấn / Thắc mắc</option>
                <option value="MEDIUM">Trung bình (Medium) - Khó thao tác</option>
                <option value="HIGH">Cao (High) - Tính năng bị lỗi</option>
                <option value="CRITICAL">Khẩn cấp (Critical) - Sự cố dữ liệu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Tiêu Đề Yêu Cầu
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Cần hỗ trợ tải cây gia phả..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Chi Tiết Vấn Đề
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Mô tả cụ thể mong muốn của dòng họ..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-all"
            >
              Gửi Yêu Cầu
            </button>
          </form>
        </div>

        {/* Danh Sách Phiếu Đã Gửi */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Lịch Sử Phiếu Hỗ Trợ Của Dòng Họ ({tickets.length})
          </h2>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                      {t.id}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{t.subject}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status === 'RESOLVED'
                      ? 'Đã Giải Quyết'
                      : t.status === 'IN_PROGRESS'
                      ? 'Đang Xử Lý'
                      : 'Đang Tiếp Nhận'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-2">{t.description}</p>

                {t.resolution && (
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs text-emerald-900 mb-2">
                    <span className="font-semibold">Phản hồi từ Kỹ thuật: </span>
                    {t.resolution}
                  </div>
                )}

                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span>Phân loại: {t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Đánh Giá Chất Lượng Dịch Vụ Gia Tộc</h3>
            <p className="text-xs text-gray-500 mb-4">
              Ý kiến quý báu của Quý Gia Tộc giúp chúng tôi không ngừng hoàn thiện chất lượng phục vụ dòng họ.
            </p>

            {feedbackSuccess ? (
              <div className="p-6 text-center text-emerald-700">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-600" />
                <p className="font-bold">Trân trọng cảm ơn Quý Gia Tộc đã đóng góp ý kiến!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mức độ sẵn lòng giới thiệu cho các chi phái hoặc dòng họ khác (0 - 10)?
                  </label>
                  <div className="flex justify-between items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        type="button"
                        key={score}
                        onClick={() => setNps(score)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          nps === score ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mức độ hài lòng chung (1 - 5 sao)?
                  </label>
                  <select
                    value={csat}
                    onChange={(e) => setCsat(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value={5}>5 sao - Rất hài lòng và trang nghiêm</option>
                    <option value={4}>4 sao - Hài lòng, dễ sử dụng</option>
                    <option value={3}>3 sao - Bình thường</option>
                    <option value={2}>2 sao - Cần cải thiện</option>
                    <option value={1}>1 sao - Chưa đáp ứng yêu cầu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Dòng họ có mong muốn duy trì gói dịch vụ thường niên lâu dài không?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={willingToPay}
                        onChange={() => setWillingToPay(true)}
                        name="wtp"
                      />
                      Có, rất sẵn lòng
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        checked={!willingToPay}
                        onChange={() => setWillingToPay(false)}
                        name="wtp"
                      />
                      Cần xem xét thêm
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Góp ý thêm</label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={3}
                    placeholder="Góp ý về tính năng phả hệ, lịch âm hay sổ quỹ..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    Gửi Đánh Giá
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
