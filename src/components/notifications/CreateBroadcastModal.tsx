import React, { useState } from 'react';
import { 
  X, BellRing, Calendar, Clock, MapPin, Send, Sparkles, 
  Check, UserCheck, Megaphone, AlertCircle
} from 'lucide-react';
import { BroadcastService } from '../../services/calendar/BroadcastService';
import { useAuth } from '../../contexts/AuthContext';
import { mockEvents } from '../../services/mockData';

interface CreateBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    title: 'Đại Lễ Tế Tổ & Khánh Thành Tu Bổ Từ Đường',
    message:
      'Kính mời toàn thể con cháu nội ngoại tề tựu đông đủ về Nhà thờ tổ dòng họ để dâng hương kính cáo tiên tổ và tham dự đại lễ khánh thành nhà thờ họ.',
    location: 'Nhà Thờ Tổ Dòng Họ',
  },
  {
    title: 'Lễ Mừng Thọ & Tri Ân Các Bậc Cao Niên Dòng Tộc',
    message:
      'Hội đồng gia tộc trân trọng kính mời bà con toàn tộc cùng tề tựu chúc thọ các cụ cao niên trong họ, phát huy truyền thống kính lão đắc thọ.',
    location: 'Sân Từ Đường Dòng Họ',
  },
  {
    title: 'Lễ Tuyên Dương & Trao Học Bổng Khuyến Học Gia Tộc',
    message:
      'Ban Khuyến học dòng họ tổ chức lễ khen thưởng các cháu học sinh, sinh viên đạt thành tích xuất sắc trong năm học vừa qua.',
    location: 'Gian Hội Trường Nhà Thờ Tổ',
  },
  {
    title: 'Họp Hội Đồng Gia Tộc Triển Khai Việc Họ Đầu Xuân',
    message:
      'Kính mời các vị trưởng chi, trưởng cành cùng đại diện các hộ gia đình về dự buổi họp trù bị đầu xuân.',
    location: 'Phòng Hội Đồng Gia Tộc',
  },
];

export const CreateBroadcastModal: React.FC<CreateBroadcastModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, activeFamily, isFamilyAdmin } = useAuth();
  const currentFamilyId = activeFamily?.id || 'fam-0000-0001';

  // Default event date: 7 days from now at 08:00
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  defaultDate.setHours(8, 0, 0, 0);

  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [eventDate, setEventDate] = useState(
    defaultDate.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
  );
  const [location, setLocation] = useState(
    activeFamily?.ancestral_hall_address || TEMPLATES[0].location
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setLocation(tpl.location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      BroadcastService.createBroadcast({
        family_id: currentFamilyId,
        title: title.trim(),
        message: message.trim(),
        event_date: new Date(eventDate).toISOString(),
        location: location.trim(),
        author_name: user?.full_name || 'Hội Đồng Gia Tộc',
        author_role: isFamilyAdmin ? 'Ban Quản Trị / Trưởng Tộc' : 'Ban Liên Lạc',
        link_url: '/app/events',
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#166534] to-[#14532D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/30 text-amber-300">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tạo Thông Báo Đẩy Về Sự Kiện Quan Trọng
              </h3>
              <p className="text-xs text-emerald-100">
                Phát thông báo nổi kèm đồng hồ đếm ngược trực tiếp cho toàn thể con cháu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates */}
        <div className="bg-amber-50/70 p-4 border-b border-amber-200">
          <div className="text-[11px] font-bold text-amber-900 uppercase mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Mẫu Sự Kiện Thường Niên Chuẩn Mực</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 transition"
              >
                {tpl.title.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tiêu Đề Thông Báo Sự Kiện <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Đại Lễ Tế Tổ & Khánh Thành Từ Đường"
              required
              className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>

          {/* Date & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Thời Gian Diễn Ra Sự Kiện <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                * Hệ thống sẽ tự động kích hoạt đếm ngược ngày, giờ, phút, giây đến thời điểm này.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Địa Điểm Tổ Chức <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Nhà thờ tổ họ, Từ đường..."
                required
                className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nội Dung Hiệu Triệu / Chi Tiết Thông Báo <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Kính mời toàn thể con cháu nội ngoại..."
              required
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] leading-relaxed"
            />
          </div>

          {/* Preview Note */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              Sau khi bấm <strong>Phát Thông Báo</strong>, một thông báo nổi trang trọng kèm đồng hồ đếm ngược sẽ lập tức hiển thị cho bà con và tự ẩn sau 5 giây (hoặc khi bà con bấm xem chi tiết).
            </span>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {isSuccess ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Đã phát thông báo đẩy thành công!
                </span>
              ) : (
                'Thông báo sẽ được gửi toàn tộc'
              )}
            </p>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang gửi...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Phát Thông Báo Đẩy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
