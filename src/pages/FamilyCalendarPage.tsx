import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Filter,
  List,
  Grid,
  Moon,
  Sun,
  MapPin,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { LunarCalendarService, CalendarDayInfo } from '../services/calendar/LunarCalendarService';
import { MemorialService } from '../services/calendar/MemorialService';
import { EventService } from '../services/calendar/EventService';
import { MemorialDate, Event } from '../types/database';
import { CalendarDayDetailDrawer } from '../components/calendar/CalendarDayDetailDrawer';
import { CreateMemorialModal } from '../components/calendar/CreateMemorialModal';
import { CreateEventModal } from '../components/calendar/CreateEventModal';
import { formatDate } from '../lib/utils';

export const FamilyCalendarPage: React.FC = () => {
  const todayInfo = LunarCalendarService.getTodayInfo();

  const [currentYear, setCurrentYear] = useState<number>(todayInfo.solarYear);
  const [currentMonth, setCurrentMonth] = useState<number>(todayInfo.solarMonth);
  const [viewMode, setViewMode] = useState<'MONTH' | 'LIST'>('MONTH');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const [memorials, setMemorials] = useState<MemorialDate[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [selectedDay, setSelectedDay] = useState<CalendarDayInfo | null>(null);
  const [showCreateMemorialModal, setShowCreateMemorialModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  const loadCalendarData = async () => {
    setLoading(true);
    const [mems, evts] = await Promise.all([
      MemorialService.getMemorials('fam-0000-0001'),
      EventService.getEvents('fam-0000-0001'),
    ]);
    setMemorials(mems);
    setEvents(evts);
    setLoading(false);
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(todayInfo.solarYear);
    setCurrentMonth(todayInfo.solarMonth);
  };

  // Lấy dữ liệu ma trận các ngày trong tháng
  const monthDays = LunarCalendarService.getMonthCalendar(currentYear, currentMonth, memorials, events);

  // Lọc theo loại
  const filteredMonthDays = monthDays.map((day) => {
    let dayMemorials = day.memorials;
    let dayEvents = day.events;

    if (selectedFilter === 'MEMORIAL') {
      dayEvents = [];
    } else if (selectedFilter === 'EVENT') {
      dayMemorials = [];
    }
    return {
      ...day,
      memorials: dayMemorials,
      events: dayEvents,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Lịch Gia Tộc & Ngày Giỗ Vạn Niên</span>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              UTC+7 Việt Nam
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Tra cứu Lịch Âm-Dương song hành, Can Chi, Tiết Khí, Giờ Hoàng Đạo & Ngày Giỗ Tổ Tiên
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateMemorialModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thêm Ngày Giỗ</span>
          </button>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sự Kiện</span>
          </button>
        </div>
      </div>

      {/* 2. Today Astronomical Widget (Heritage Style) */}
      <div className="bg-gradient-to-r from-heritage-navy via-slate-900 to-heritage-green text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-bold uppercase text-amber-300">Hôm nay</span>
            <span className="text-2xl font-black leading-none mt-0.5">{todayInfo.solarDay}</span>
          </div>

          <div>
            <div className="text-base font-bold text-white flex items-center space-x-2">
              <span>Tháng {todayInfo.solarMonth}, Năm {todayInfo.solarYear} (Dương Lịch)</span>
            </div>
            <div className="text-xs text-amber-300 font-semibold mt-0.5">
              Ngày {todayInfo.lunarDay} Tháng {todayInfo.lunarMonth} {todayInfo.isLeap ? '(Nhuận)' : ''} Năm {todayInfo.canChiYear} (Âm Lịch)
            </div>
          </div>
        </div>

        {/* Can Chi & Tiết khí Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
            <span className="text-slate-300 text-[10px] block font-medium">CAN CHI NGÀY</span>
            <strong className="text-white font-bold">{todayInfo.canChiDay}</strong>
          </div>
          <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
            <span className="text-slate-300 text-[10px] block font-medium">TIẾT KHÍ</span>
            <strong className="text-emerald-300 font-bold">{todayInfo.tietKhi}</strong>
          </div>
          <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
            <span className="text-slate-300 text-[10px] block font-medium">THÁNG ÂM</span>
            <strong className="text-amber-300 font-bold">
              {todayInfo.daysInLunarMonth === 30 ? 'Tháng Đủ (30d)' : 'Tháng Thiếu (29d)'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Navigator & Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Month Picker Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-sm font-bold text-slate-900 block leading-tight">
              Tháng {currentMonth} / {currentYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-200 rounded-xl transition"
          >
            Hôm nay
          </button>
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center space-x-2">
          {/* Filter Type */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="ALL">Tất cả sự kiện & ngày giỗ</option>
              <option value="MEMORIAL">Chỉ ngày giỗ họ tộc</option>
              <option value="EVENT">Chỉ sự kiện họ tộc</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'MONTH' ? 'bg-white text-heritage-green shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'LIST' ? 'bg-white text-heritage-green shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Calendar Main View */}
      {viewMode === 'MONTH' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-xs font-bold uppercase py-2 rounded-lg ${
                  idx === 5 ? 'text-amber-700 bg-amber-50/50' : idx === 6 ? 'text-rose-700 bg-rose-50/50' : 'text-slate-500'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid 7x5 or 7x6 */}
          <div className="grid grid-cols-7 gap-1.5">
            {filteredMonthDays.map((day, index) => {
              const isCurrentMonth = day.solarMonth === currentMonth;
              const hasMemorial = day.memorials.length > 0;
              const hasEvent = day.events.length > 0;

              return (
                <div
                  key={`${day.solarDate}-${index}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition relative group ${
                    day.isToday
                      ? 'border-heritage-green bg-emerald-50/60 ring-2 ring-heritage-green/20'
                      : hasMemorial
                      ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                      : isCurrentMonth
                      ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      : 'border-slate-100 bg-slate-50/40 opacity-40 hover:opacity-100'
                  }`}
                >
                  {/* Date Header: Solar (Bold) + Lunar (Color) */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        day.isToday ? 'text-heritage-green' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {day.solarDay}
                    </span>

                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-1 py-0.2 rounded ${
                        day.lunarDay === 1 || day.lunarDay === 15
                          ? 'bg-amber-200/80 text-amber-900 font-bold'
                          : 'text-amber-700'
                      }`}
                    >
                      {day.lunarDay}/{day.lunarMonth}
                    </span>
                  </div>

                  {/* Badges / Items */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {day.memorials.slice(0, 2).map((mem) => (
                      <div
                        key={mem.id}
                        className="text-[9px] font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded-md truncate border border-amber-300/80"
                        title={mem.title}
                      >
                        🕯️ {mem.title}
                      </div>
                    ))}

                    {day.events.slice(0, 1).map((evt) => (
                      <div
                        key={evt.id}
                        className="text-[9px] font-bold text-emerald-950 bg-emerald-100/90 px-1.5 py-0.5 rounded-md truncate border border-emerald-300"
                        title={evt.title}
                      >
                        🏛️ {evt.title}
                      </div>
                    ))}

                    {day.memorials.length + day.events.length > 3 && (
                      <div className="text-[8px] text-slate-400 font-bold text-center">
                        +{day.memorials.length + day.events.length - 2} sự kiện khác
                      </div>
                    )}
                  </div>

                  {/* Can Chi Hint */}
                  <div className="text-[8px] text-slate-400 truncate text-right">
                    {day.canChiDay.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View Mode */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Danh Sách Sự Kiện & Lễ Giỗ Tháng {currentMonth}/{currentYear}
          </h2>

          <div className="space-y-3">
            {monthDays
              .filter((d) => d.solarMonth === currentMonth && (d.memorials.length > 0 || d.events.length > 0))
              .map((day) => (
                <div
                  key={day.solarDate}
                  onClick={() => setSelectedDay(day)}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-heritage-green transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-900">{day.solarDay}</span>
                      <span className="text-[9px] font-semibold text-amber-700">
                        {day.lunarDay}/{day.lunarMonth} Âm
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {day.memorials.map((m) => m.title).join(', ')}
                        {day.events.map((e) => e.title).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {day.solarDate} — Can Chi: {day.canChiDay} ({day.tietKhi})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {day.memorials.map((m) => (
                      <span
                        key={m.id}
                        className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200"
                      >
                        Ngày Giỗ
                      </span>
                    ))}
                    {day.events.map((e) => (
                      <span
                        key={e.id}
                        className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200"
                      >
                        Sự Kiện
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. Drawers & Modals */}
      <CalendarDayDetailDrawer
        dayInfo={selectedDay}
        onClose={() => setSelectedDay(null)}
        onAddMemorial={(day) => {
          setSelectedDay(null);
          setShowCreateMemorialModal(true);
        }}
        onAddEvent={(day) => {
          setSelectedDay(null);
          setShowCreateEventModal(true);
        }}
      />

      <CreateMemorialModal
        isOpen={showCreateMemorialModal}
        onClose={() => setShowCreateMemorialModal(false)}
        onSuccess={loadCalendarData}
      />

      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSuccess={loadCalendarData}
      />
    </div>
  );
};
