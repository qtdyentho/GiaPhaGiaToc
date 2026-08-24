import React from 'react';
import { X, Sparkles, Calendar as CalendarIcon, Clock, MapPin, Plus, Sun, Moon, Info } from 'lucide-react';
import { CalendarDayInfo } from '../../services/calendar/LunarCalendarService';
import { MemorialDate, Event } from '../../types/database';

interface CalendarDayDetailDrawerProps {
  dayInfo: CalendarDayInfo | null;
  onClose: () => void;
  onAddMemorial: (dayInfo: CalendarDayInfo) => void;
  onAddEvent: (dayInfo: CalendarDayInfo) => void;
}

export const CalendarDayDetailDrawer: React.FC<CalendarDayDetailDrawerProps> = ({
  dayInfo,
  onClose,
  onAddMemorial,
  onAddEvent,
}) => {
  if (!dayInfo) return null;

  const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-heritage-green/10 via-amber-500/5 to-transparent flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-heritage-green bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {DAY_NAMES[dayInfo.dayOfWeek]}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Ngày {dayInfo.solarDay} Tháng {dayInfo.solarMonth} Năm {dayInfo.solarYear}
            </h2>
            <div className="text-xs text-amber-900 font-semibold mt-0.5 flex items-center space-x-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-600" />
              <span>
                Ngày {dayInfo.lunarDay} Tháng {dayInfo.lunarMonth} {dayInfo.isLeap ? '(Nhuận)' : ''} Năm {dayInfo.canChiYear}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Astronomical & Can Chi Badge Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="font-bold text-amber-950 flex items-center space-x-1.5 border-b border-amber-200/60 pb-2">
              <Sparkles className="w-4 h-4 text-heritage-gold" />
              <span>Thiên Văn & Can Chi Ngày</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Can Chi Ngày:</span>{' '}
                <strong className="text-slate-800">{dayInfo.canChiDay}</strong>
              </div>
              <div>
                <span className="text-slate-500">Can Chi Tháng:</span>{' '}
                <strong className="text-slate-800">{dayInfo.canChiMonth}</strong>
              </div>
              <div>
                <span className="text-slate-500">Tiết Khí:</span>{' '}
                <strong className="text-heritage-green">{dayInfo.tietKhi}</strong>
              </div>
              <div>
                <span className="text-slate-500">Tháng Âm:</span>{' '}
                <strong className="text-slate-800">
                  {dayInfo.daysInLunarMonth === 30 ? 'Tháng Đủ (30 ngày)' : 'Tháng Thiếu (29 ngày)'}
                </strong>
              </div>
            </div>

            {/* Giờ Hoàng Đạo */}
            <div className="pt-2 border-t border-amber-200/60">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">GIỜ HOÀNG ĐẠO TỐT TRONG NGÀY:</span>
              <div className="flex flex-wrap gap-1">
                {dayInfo.gioHoangDao.map((g, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-white border border-amber-300 text-amber-900 px-1.5 py-0.5 rounded font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Memorials on this day */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Ngày Giỗ Trong Ngày ({dayInfo.memorials.length})</span>
              </span>
            </h3>

            {dayInfo.memorials.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                Không có ngày giỗ họ tộc vào ngày này
              </div>
            ) : (
              dayInfo.memorials.map((mem) => (
                <div key={mem.id} className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-1.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-amber-950">{mem.title}</div>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-200/60 text-amber-900 font-bold rounded-full shrink-0 border border-amber-300/60">
                      {mem.lunar_day}/{mem.lunar_month} Âm lịch
                    </span>
                  </div>

                  {/* Chi Cành & Thế Hệ Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {mem.generation_name && (
                      <span className="text-[10px] bg-amber-100/80 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-md font-bold">
                        {mem.generation_name}
                      </span>
                    )}
                    {mem.branch_name && (
                      <span className="text-[10px] bg-emerald-100/80 text-[#166534] border border-emerald-300/80 px-2 py-0.5 rounded-md font-bold">
                        {mem.branch_name}
                      </span>
                    )}
                    {mem.burial_place && (
                      <span className="text-[10px] text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{mem.burial_place}</span>
                      </span>
                    )}
                  </div>

                  {mem.notes && (
                    <p className="text-[10px] text-slate-600 bg-white/90 p-2 rounded-xl mt-1 border border-amber-200/60 leading-relaxed">
                      {mem.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Events on this day */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-heritage-green" />
                <span>Sự Kiện Gia Tộc ({dayInfo.events.length})</span>
              </span>
            </h3>

            {dayInfo.events.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                Chưa có sự kiện nào được xếp lịch vào ngày này
              </div>
            ) : (
              dayInfo.events.map((evt) => (
                <div key={evt.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                  {evt.location && (
                    <div className="text-[11px] text-slate-600 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}
                  {evt.estimated_budget > 0 && (
                    <div className="text-[10px] font-bold text-emerald-700">
                      Dự toán: {new Intl.NumberFormat('vi-VN').format(evt.estimated_budget)} đ
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center space-x-2">
          <button
            onClick={() => onAddMemorial(dayInfo)}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Ngày Giỗ</span>
          </button>
          <button
            onClick={() => onAddEvent(dayInfo)}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Sự Kiện</span>
          </button>
        </div>
      </div>
    </div>
  );
};
