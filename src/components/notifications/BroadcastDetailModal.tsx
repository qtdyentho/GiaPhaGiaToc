import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Sparkles, Landmark, BellRing, 
  Share2, ArrowRight, UserCheck, Check
} from 'lucide-react';
import { BroadcastNotification } from '../../services/calendar/BroadcastService';
import { Link } from 'react-router-dom';

interface BroadcastDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: BroadcastNotification | null;
}

export const BroadcastDetailModal: React.FC<BroadcastDetailModalProps> = ({
  isOpen,
  onClose,
  broadcast,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!broadcast) return;

    const calculateTime = () => {
      const target = new Date(broadcast.event_date).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [broadcast]);

  if (!isOpen || !broadcast) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(
      `[THÔNG BÁO DÒNG HỌ] ${broadcast.title}\nThời gian: ${new Date(broadcast.event_date).toLocaleString('vi-VN')}\nĐịa điểm: ${broadcast.location || 'Từ đường dòng họ'}\nChi tiết: ${window.location.origin}/app/events`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = new Date(broadcast.event_date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = new Date(broadcast.event_date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-300/80 animate-scale-in">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-[#166534] via-[#14532D] to-[#0F3D21] text-white p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#C49A3A_2px,transparent_2px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-amber-400/25 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full border border-amber-300/30">
                <BellRing className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Thông Báo Khẩn • Sự Kiện Quan Trọng Dòng Họ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight drop-shadow-sm">
                {broadcast.title}
              </h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Phát bởi: <strong>{broadcast.author_role} {broadcast.author_name}</strong>
                </span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-emerald-100 hover:bg-white/10 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Countdown Timer Block */}
        <div className="bg-amber-50 border-b border-amber-200 p-5 text-center">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5 font-serif">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Đếm Ngược Thời Gian Đến Sự Kiện</span>
          </div>

          {timeLeft.isPast ? (
            <div className="text-base font-bold text-slate-700">
              Sự kiện đã hoặc đang diễn ra
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
              <div className="bg-white p-2.5 rounded-2xl border border-amber-300 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-amber-900">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Ngày</div>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-amber-300 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-amber-900">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Giờ</div>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-amber-300 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-amber-900">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Phút</div>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-amber-300 shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-[#166534]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Giây</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Key Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-[#166534] rounded-xl shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Thời Gian</div>
                <div className="text-xs font-bold text-slate-900 capitalize">{formattedDate}</div>
                <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Bắt đầu lúc: {formattedTime}</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Địa Điểm Tổ Chức</div>
                <div className="text-xs font-bold text-slate-900 leading-snug">
                  {broadcast.location || 'Từ đường / Nhà thờ tổ dòng họ'}
                </div>
              </div>
            </div>
          </div>

          {/* Full Message / Lời Hiệu Triệu */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Nội Dung Thông Báo</h4>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line">
              {broadcast.message}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-700">Đã Sao Chép Lời Mời!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Sao Chép Lời Mời Bà Con</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Đóng
            </button>
            <Link
              to={broadcast.link_url || '/app/events'}
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <span>Xem Lịch Sự Kiện</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
