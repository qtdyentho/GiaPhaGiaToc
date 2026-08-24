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
  Zap
} from 'lucide-react';
import { LunarCalendarService, CalendarDayInfo } from '../services/calendar/LunarCalendarService';
import { MemorialService } from '../services/calendar/MemorialService';
import { EventService } from '../services/calendar/EventService';
import { MemorialDate, Event } from '../types/database';
import { mockBranches, mockMembers } from '../services/mockData';
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
  const [filterMode, setFilterMode] = useState<'ALL' | 'BRANCH' | 'SUB_BRANCH'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedSubBranch, setSelectedSubBranch] = useState<string>('CÀNH 1');

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

  // Filter memorials by branch if selected
  const branchFilteredMemorials = memorials.filter((m) => {
    if (filterMode === 'ALL' || !selectedBranchId) return true;
    const member = mockMembers.find((mb) => mb.id === m.member_id);
    return !member?.branch_id || member.branch_id === selectedBranchId;
  });

  // Lấy dữ liệu ma trận các ngày trong tháng
  const monthDays = LunarCalendarService.getMonthCalendar(currentYear, currentMonth, branchFilteredMemorials, events);

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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 1. Header Banner & Actions */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />
        
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Lịch Gia Tộc & Ngày Giỗ Vạn Niên
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              UTC+7 Việt Nam
            </span>
            <span className="text-xs bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" /> Tự Động Đồng Bộ Giỗ Tổ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu Lịch Âm-Dương song hành, Can Chi, Tiết Khí, Giờ Hoàng Đạo & Ngày Giỗ tự động đồng bộ theo chi, cành.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateMemorialModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thêm Ngày Giỗ</span>
          </button>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sự Kiện</span>
          </button>
        </div>
      </div>

      {/* 2. Today Astronomical Widget (Heritage Style) */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-slate-900 to-[#166534] text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* 3. Navigator & Branch Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Pill Segmented Filter Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setFilterMode('ALL');
              setSelectedBranchId('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterMode === 'ALL'
                ? 'bg-[#2E1E6B] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toàn dòng họ
          </button>

          <button
            onClick={() => {
              setFilterMode('BRANCH');
              if (!selectedBranchId && mockBranches.length > 0) {
                setSelectedBranchId(mockBranches[0].id);
              }
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterMode === 'BRANCH'
                ? 'bg-[#2E1E6B] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Theo Chi
          </button>

          <button
            onClick={() => setFilterMode('SUB_BRANCH')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterMode === 'SUB_BRANCH'
                ? 'bg-[#2E1E6B] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Theo Cành
          </button>

          {/* Conditional Dropdown when filtering by Chi */}
          {filterMode === 'BRANCH' && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2E1E6B]"
            >
              {mockBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Conditional Dropdown when filtering by Cành */}
          {filterMode === 'SUB_BRANCH' && (
            <select
              value={selectedSubBranch}
              onChange={(e) => setSelectedSubBranch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2E1E6B]"
            >
              <option value="CÀNH 1">Cành 1 (Trưởng chi)</option>
              <option value="CÀNH 2">Cành 2 (Chi thứ)</option>
              <option value="CÀNH 3">Cành 3</option>
            </select>
          )}
        </div>

        {/* Month Picker Buttons & View Modes */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition"
              title="Tháng trước"
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
              title="Tháng sau"
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

          {/* Filter Type */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold"
            >
              <option value="ALL">Tất cả mục</option>
              <option value="MEMORIAL">Chỉ ngày giỗ</option>
              <option value="EVENT">Chỉ sự kiện</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'MONTH' ? 'bg-white text-[#166534] shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'LIST' ? 'bg-white text-[#166534] shadow-xs font-bold' : 'text-slate-500'
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
            {filteredMonthDays.map((day, idx) => {
              const isCurrentMonth = day.solarMonth === currentMonth;
              const hasMemorials = day.memorials.length > 0;
              const hasEvents = day.events.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[96px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                    !isCurrentMonth
                      ? 'bg-slate-50/50 border-slate-100 opacity-40 hover:opacity-100'
                      : day.isToday
                      ? 'bg-emerald-50/50 border-[#166534] ring-2 ring-emerald-100'
                      : hasMemorials
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Solar Day & Lunar Day */}
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-xs font-black leading-none ${
                        day.isToday
                          ? 'w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.solarDay}
                    </span>

                    <span
                      className={`text-[10px] font-semibold leading-none ${
                        day.lunarDay === 1 || day.lunarDay === 15
                          ? 'text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.lunarDay === 1 ? `${day.lunarDay}/${day.lunarMonth}` : day.lunarDay} ÂL
                    </span>
                  </div>

                  {/* Badges / Events list */}
                  <div className="space-y-1 my-1">
                    {day.memorials.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className="text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded truncate flex items-center gap-1"
                        title={m.title}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                        <span className="truncate">{m.title}</span>
                      </div>
                    ))}

                    {day.events.slice(0, 1).map((e) => (
                      <div
                        key={e.id}
                        className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded truncate flex items-center gap-1"
                        title={e.title}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}

                    {day.memorials.length + day.events.length > 3 && (
                      <div className="text-[9px] text-slate-500 font-bold pl-1">
                        +{day.memorials.length + day.events.length - 2} sự kiện khác
                      </div>
                    )}
                  </div>

                  {/* Bottom: Tiết khí / Can chi ngày (rất nhỏ) */}
                  <div className="flex items-center justify-between text-[9px] text-slate-400 truncate">
                    <span className="truncate">{day.tietKhi || day.canChiDay.split(' ')[0]}</span>
                    {day.isHoangDao && <span className="text-amber-500 font-bold">★ H.Đạo</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredMonthDays
            .filter((d) => d.memorials.length > 0 || d.events.length > 0)
            .map((day, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-800">{day.solarDay}</span>
                    <span className="text-[10px] text-slate-500">T{day.solarMonth}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <span>
                        Dương lịch: {day.solarDay}/{day.solarMonth}/{day.solarYear}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-700 font-semibold">
                        Âm lịch: {day.lunarDay}/{day.lunarMonth} ({day.canChiDay})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Tiết khí: {day.tietKhi} • Giờ hoàng đạo: {day.gioHoangDao.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {day.memorials.map((m) => (
                    <span
                      key={m.id}
                      className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {m.title}
                    </span>
                  ))}
                  {day.events.map((e) => (
                    <span
                      key={e.id}
                      className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-bold"
                    >
                      {e.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 5. Modals & Drawers */}
      <CalendarDayDetailDrawer
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        dayInfo={selectedDay}
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

export default FamilyCalendarPage;
