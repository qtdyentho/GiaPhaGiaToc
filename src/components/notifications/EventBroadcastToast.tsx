import React, { useState, useEffect, useRef } from 'react';
import { 
  BellRing, X, Clock, ArrowUpRight, Sparkles, MapPin, Calendar, Check
} from 'lucide-react';
import { 
  BroadcastNotification, BroadcastService 
} from '../../services/calendar/BroadcastService';
import { BroadcastDetailModal } from './BroadcastDetailModal';
import { useAuth } from '../../contexts/AuthContext';

const AUTO_DISMISS_MS = 5000;

export const EventBroadcastToast: React.FC = () => {
  const { activeFamily } = useAuth();
  const familyId = activeFamily?.id || 'fam-0000-0001';

  const [broadcast, setBroadcast] = useState<BroadcastNotification | null>(() => {
    return BroadcastService.getActiveBroadcast(familyId);
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  // Listen to broadcast changes
  useEffect(() => {
    const unsub = BroadcastService.subscribe((newBroadcast) => {
      setBroadcast(newBroadcast);
      if (newBroadcast) {
        setIsVisible(true);
        setProgress(100);
      } else {
        setIsVisible(false);
      }
    });

    // Check if initial broadcast exists and hasn't been closed in this session
    const active = BroadcastService.getActiveBroadcast(familyId);
    if (active) {
      const isDismissed = sessionStorage.getItem(`dismissed_bc_${active.id}`);
      if (!isDismissed) {
        setBroadcast(active);
        setIsVisible(true);
      }
    }

    return () => unsub();
  }, [familyId]);

  // Live countdown ticker
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

  // 5s Auto-dismiss timer with pause on hover
  useEffect(() => {
    if (!isVisible || isPaused || !broadcast) return;

    const stepMs = 50;
    const decrement = (stepMs / AUTO_DISMISS_MS) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isVisible, isPaused, broadcast]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (broadcast) {
      sessionStorage.setItem(`dismissed_bc_${broadcast.id}`, 'true');
    }
  };

  if (!isVisible || !broadcast) return null;

  return (
    <>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full animate-slide-down shadow-2xl rounded-2xl overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-[#166534] via-[#14532D] to-[#0F3D21] text-white p-4.5 group"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#C49A3A_2px,transparent_2px)] [background-size:12px_12px] pointer-events-none" />

        <div className="relative z-10 flex items-start gap-3">
          {/* Pulsing Icon */}
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Tag & Close */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center space-x-1 bg-amber-400/25 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>THÔNG BÁO SỰ KIỆN QUAN TRỌNG</span>
              </span>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-white font-serif tracking-tight leading-snug line-clamp-1">
              {broadcast.title}
            </h4>

            {/* Message preview */}
            <p className="text-[11px] text-emerald-100 line-clamp-2 leading-relaxed">
              {broadcast.message}
            </p>

            {/* Real-time Countdown Timer Badge */}
            <div className="p-2 rounded-xl bg-black/30 border border-amber-300/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-1.5 text-amber-300 text-[11px] font-bold shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>Đếm ngược:</span>
              </div>

              {timeLeft.isPast ? (
                <span className="text-[11px] text-slate-300 font-semibold">Đang diễn ra</span>
              ) : (
                <div className="flex items-center space-x-1 text-[11px] font-extrabold text-amber-100">
                  <span className="bg-white/15 px-1.5 py-0.5 rounded text-amber-200">
                    {String(timeLeft.days).padStart(2, '0')} ngày
                  </span>
                  <span>:</span>
                  <span className="bg-white/15 px-1.5 py-0.5 rounded text-amber-200">
                    {String(timeLeft.hours).padStart(2, '0')} giờ
                  </span>
                  <span>:</span>
                  <span className="bg-white/15 px-1.5 py-0.5 rounded text-amber-200">
                    {String(timeLeft.minutes).padStart(2, '0')}p
                  </span>
                  <span>:</span>
                  <span className="bg-emerald-400/30 px-1.5 py-0.5 rounded text-emerald-200">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[10px] text-emerald-200/80">
                {isPaused ? 'Đã tạm dừng tự ẩn' : 'Tự ẩn sau 5s'}
              </span>

              <button
                type="button"
                onClick={() => setIsDetailOpen(true)}
                className="inline-flex items-center space-x-1 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                <span>Xem Chi Tiết</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5-Second Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Modal chi tiết sự kiện */}
      <BroadcastDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        broadcast={broadcast}
      />
    </>
  );
};
