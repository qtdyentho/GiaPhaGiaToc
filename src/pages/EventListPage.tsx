import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
  Building,
  Users,
} from 'lucide-react';
import { EventService } from '../services/calendar/EventService';
import { Event } from '../types/database';
import { formatDate } from '../lib/utils';
import { CreateEventModal } from '../components/calendar/CreateEventModal';
import { CreateBroadcastModal } from '../components/notifications/CreateBroadcastModal';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Megaphone } from 'lucide-react';

export const EventListPage: React.FC = () => {
  const { isFamilyAdmin, activeFamily } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentFamId = activeFamily?.id || '';

  const loadData = async () => {
    if (!currentFamId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await EventService.getEvents(currentFamId, {
      eventType: eventTypeFilter,
      search,
    });
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentFamId, eventTypeFilter, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Sự Kiện & Đại Lễ Gia Tộc</span>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              {events.length} Sự Kiện
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kế hoạch đại lễ giỗ tổ họ, họp hội đồng gia tộc, tu bổ từ đường & lễ khuyến học
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isFamilyAdmin && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold rounded-xl transition shadow-xs border border-amber-400 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Phát Thông Báo Đẩy</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sự Kiện Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sự kiện, địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-slate-900 dark:text-white"
            >
              <option value="ALL">Tất cả loại sự kiện</option>
              <option value="CLAN_ANCESTRAL_DAY">Đại Lễ Giỗ Tổ</option>
              <option value="FAMILY_MEETING">Họp Hội Đồng Gia Tộc</option>
              <option value="ANCESTRAL_HALL_RENOVATION">Tu Bổ Từ Đường</option>
              <option value="LONGEVITY">Khuyến Học / Mừng Thọ</option>
              <option value="OTHER">Sự Kiện Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#166534] dark:text-emerald-400 font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{evt.title}</h2>
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {evt.event_type === 'CLAN_ANCESTRAL_DAY'
                        ? '🏛️ Đại Lễ Giỗ Tổ'
                        : evt.event_type === 'FAMILY_MEETING'
                        ? '👥 Họp Hội Đồng'
                        : evt.event_type === 'LONGEVITY'
                        ? '💐 Khuyến Học / Mừng Thọ'
                        : '🌿 Sự Kiện Họ Tộc'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time & Location */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#166534] dark:text-emerald-400 shrink-0" />
                  <span>
                    Dương lịch: <strong className="text-slate-800 dark:text-white">{formatDate(evt.solar_date)}</strong> lúc {evt.solar_time || '08:00'}
                  </span>
                </div>

                {evt.lunar_day && evt.lunar_month && (
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold pl-5">
                    (Âm lịch: Ngày {evt.lunar_day}/{evt.lunar_month} {evt.is_leap_month ? 'Nhuận' : ''})
                  </div>
                )}

                {evt.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                )}

                {evt.estimated_budget > 0 && (
                  <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Dự toán chi phí: {new Intl.NumberFormat('vi-VN').format(evt.estimated_budget)} đ
                    </span>
                  </div>
                )}

                {evt.description && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {evt.description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Quy mô: Toàn gia tộc</span>
              <Link
                to={`/app/events/${evt.id}`}
                className="text-[#166534] hover:text-[#14532d] dark:text-emerald-400 dark:hover:text-emerald-300 font-bold flex items-center space-x-1"
              >
                <span>Xem chi tiết & ngân sách</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />

      <CreateBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </div>
  );
};
