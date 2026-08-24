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
  const { isFamilyAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await EventService.getEvents('fam-0000-0001', {
      eventType: eventTypeFilter,
      search,
    });
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [eventTypeFilter, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Sự Kiện & Đại Lễ Gia Tộc</span>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              {events.length} Sự Kiện
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Kế hoạch đại lễ giỗ tổ họ, họp hội đồng gia tộc, tu bổ từ đường & lễ khuyến học
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isFamilyAdmin && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold rounded-xl transition shadow-xs border border-amber-400"
            >
              <Megaphone className="w-4 h-4" />
              <span>Phát Thông Báo Đẩy</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sự Kiện Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sự kiện, địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-medium"
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
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-heritage hover:border-emerald-300 transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-heritage-green font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{evt.title}</h2>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
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
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-heritage-green shrink-0" />
                  <span>
                    Dương lịch: <strong className="text-slate-800">{formatDate(evt.solar_date)}</strong> lúc {evt.solar_time || '08:00'}
                  </span>
                </div>

                {evt.lunar_day && evt.lunar_month && (
                  <div className="text-[11px] text-amber-800 font-semibold pl-5">
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
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Dự toán chi phí: {new Intl.NumberFormat('vi-VN').format(evt.estimated_budget)} đ
                    </span>
                  </div>
                )}

                {evt.description && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {evt.description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Quy mô: Toàn gia tộc</span>
              <Link
                to={`/app/events/${evt.id}`}
                className="text-heritage-green hover:text-heritage-green-light font-bold flex items-center space-x-1"
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
