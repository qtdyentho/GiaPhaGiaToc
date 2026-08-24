import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MemorialService } from '../../services/calendar/MemorialService';
import { EventService } from '../../services/calendar/EventService';
import { formatDate } from '../../lib/utils';

export const UpcomingEventsWidget: React.FC<{ familyId?: string; limit?: number }> = ({
  familyId = 'fam-0000-0001',
  limit = 5,
}) => {
  const [upcomingMemorials, setUpcomingMemorials] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [mems, evts] = await Promise.all([
        MemorialService.getUpcomingMemorials(familyId, limit),
        EventService.getUpcomingEvents(familyId, limit),
      ]);
      setUpcomingMemorials(mems);
      setUpcomingEvents(evts);
      setLoading(false);
    }
    loadData();
  }, [familyId, limit]);

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-16 bg-slate-100 rounded-xl"></div>
        <div className="h-16 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-heritage-gold" />
          <span>Sự Kiện & Ngày Giỗ Họ Sắp Tới</span>
        </h2>
        <Link
          to="/app/calendar"
          className="text-xs font-semibold text-heritage-green hover:text-heritage-green-light flex items-center space-x-0.5"
        >
          <span>Xem Lịch</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {/* Memorials */}
        {upcomingMemorials.map((mem) => (
          <div
            key={mem.id}
            className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl hover:border-amber-400 transition flex items-start justify-between gap-2"
          >
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                <span>🕯️</span>
                <span>{mem.title}</span>
              </div>
              <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                Ngày {mem.lunar_day}/{mem.lunar_month} Âm Lịch {mem.is_leap_month ? '(Tháng Nhuận)' : ''}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Dương lịch: {formatDate(mem.solarDate)}
              </div>
            </div>

            <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
              {mem.daysRemaining === 0
                ? 'Hôm nay'
                : mem.daysRemaining > 0
                ? `Còn ${mem.daysRemaining} ngày`
                : `Đã qua`}
            </span>
          </div>
        ))}

        {/* Events */}
        {upcomingEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-heritage-green transition flex items-start justify-between gap-2"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <span>🏛️</span>
                <span>{evt.title}</span>
              </div>
              {evt.location && (
                <div className="text-[11px] text-slate-600 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              )}
              <div className="text-[10px] font-semibold text-heritage-green mt-0.5">
                {formatDate(evt.solar_date)} lúc {evt.solar_time || '08:00'}
              </div>
            </div>
          </div>
        ))}

        {upcomingMemorials.length === 0 && upcomingEvents.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            Chưa có ngày giỗ hay sự kiện nào trong thời gian tới
          </div>
        )}
      </div>
    </div>
  );
};
