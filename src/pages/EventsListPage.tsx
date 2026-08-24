import React, { useState } from 'react';
import { Landmark, Calendar, MapPin, DollarSign, Plus, Search, Filter, Clock } from 'lucide-react';
import { mockEvents } from '../services/mockData';
import { formatCurrency, formatDate } from '../lib/utils';
import { EVENT_TYPE_LABELS } from '../lib/constants';

export const EventsListPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = mockEvents.filter(
    (e) => filterType === 'ALL' || e.event_type === filterType
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sự Kiện & Đại Lễ Họ Tộc</h1>
          <p className="text-xs text-slate-500">Quản lý các chương trình giỗ tổ, họp họ, mừng thọ và tu sửa từ đường</p>
        </div>

        <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Tạo Sự Kiện Mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'ALL'
              ? 'bg-heritage-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả sự kiện
        </button>
        <button
          onClick={() => setFilterType('CLAN_ANCESTRAL_DAY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'CLAN_ANCESTRAL_DAY'
              ? 'bg-heritage-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Giỗ tổ họ
        </button>
        <button
          onClick={() => setFilterType('FAMILY_MEETING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'FAMILY_MEETING'
              ? 'bg-heritage-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Họp họ / Hội đồng
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-heritage transition p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-heritage-green flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{event.title}</h2>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 text-slate-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-heritage-green shrink-0" />
                <span>
                  {formatDate(event.solar_date)} ({event.lunar_day}/{event.lunar_month} Âm)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{event.solar_time || '08:00'}</span>
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Dự toán ngân sách:{' '}
                <strong className="text-heritage-navy">{formatCurrency(event.estimated_budget)}</strong>
              </div>

              <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition">
                Chi tiết chương trình
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
