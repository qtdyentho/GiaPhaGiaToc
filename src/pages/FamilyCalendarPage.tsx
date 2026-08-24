import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { LunarCalendarService } from '../services/LunarCalendarService';
import { mockMemorialDates, mockEvents } from '../services/mockData';

export const FamilyCalendarPage: React.FC = () => {
  const todayInfo = LunarCalendarService.getTodayInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lịch Gia Tộc & Ngày Giỗ</h1>
          <p className="text-xs text-slate-500">Đối chiếu lịch Dương & Lịch Âm Việt Nam (UTC+7)</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg transition shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Thêm Sự Kiện / Ngày Giỗ</span>
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-heritage-green" />
          <div>
            <div className="text-base font-bold text-slate-900">
              Tháng {todayInfo.solarMonth} Năm {todayInfo.solarYear} (Dương Lịch)
            </div>
            <div className="text-xs text-amber-700 font-semibold">
              Tháng {todayInfo.lunarMonth} Năm {todayInfo.canChiYear} (Âm Lịch)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
            Hôm nay
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid + Upcoming Events Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (Mock 7x5) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center mb-3 text-xs font-bold text-slate-500 uppercase">
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div className="text-amber-700">T7</div>
            <div className="text-rose-700">CN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const isToday = day === todayInfo.solarDay;
              const hasMemorial = day === 25; // 25/09 Giỗ tổ họ

              return (
                <div
                  key={day}
                  className={`min-h-[75px] p-2 rounded-lg border text-left flex flex-col justify-between transition ${
                    isToday
                      ? 'border-heritage-green bg-emerald-50/50'
                      : hasMemorial
                      ? 'border-amber-400 bg-amber-50/60'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-heritage-green' : 'text-slate-800'}`}>
                      {day}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {(day + 10) % 30 + 1}
                    </span>
                  </div>

                  {hasMemorial && (
                    <div className="text-[9px] font-bold text-amber-900 bg-amber-200/80 px-1 py-0.5 rounded truncate">
                      Giỗ Cụ Tổ
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Memorials List */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-heritage-gold" />
              <span>Ngày Giỗ Họ Tộc Sắp Tới</span>
            </h2>

            <div className="space-y-3">
              {mockMemorialDates.map((mem) => (
                <div key={mem.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <div className="text-xs font-bold text-amber-950">{mem.title}</div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">
                    Ngày {mem.lunar_day}/{mem.lunar_month} Âm Lịch
                  </div>
                  {mem.next_solar_date && (
                    <div className="text-[10px] text-slate-500 mt-1">
                      Dương lịch dự kiến: {mem.next_solar_date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Sự Kiện Sắp Diễn Ra</h2>
            {mockEvents.map((evt) => (
              <div key={evt.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                <div className="text-[11px] text-slate-600 mt-1">{evt.location}</div>
                <div className="text-[10px] font-semibold text-heritage-green mt-1">
                  {evt.solar_date} lúc {evt.solar_time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
