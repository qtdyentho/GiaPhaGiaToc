import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Sun, ArrowRightLeft } from 'lucide-react';
import { solarToLunar, lunarToSolar, getDaysInLunarMonth, getLeapMonth } from '../../lib/lunar';

interface LunarDatePickerProps {
  solarValue?: string; // YYYY-MM-DD
  lunarDayValue?: number;
  lunarMonthValue?: number;
  lunarYearValue?: number;
  isLeapMonthValue?: boolean;
  onChange: (data: {
    solarDate: string;
    lunarDay: number;
    lunarMonth: number;
    lunarYear: number;
    isLeapMonth: boolean;
    canChiYear: string;
  }) => void;
  showLunarToggleDefault?: boolean;
}

export const LunarDatePicker: React.FC<LunarDatePickerProps> = ({
  solarValue,
  lunarDayValue,
  lunarMonthValue,
  lunarYearValue,
  isLeapMonthValue = false,
  onChange,
  showLunarToggleDefault = false,
}) => {
  const [inputMode, setInputMode] = useState<'SOLAR' | 'LUNAR'>(showLunarToggleDefault ? 'LUNAR' : 'SOLAR');

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const [solarDate, setSolarDate] = useState<string>(
    solarValue || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  );
  const [lunarDay, setLunarDay] = useState<number>(lunarDayValue || 1);
  const [lunarMonth, setLunarMonth] = useState<number>(lunarMonthValue || 1);
  const [lunarYear, setLunarYear] = useState<number>(lunarYearValue || today.getFullYear());
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(isLeapMonthValue);

  // Khi người dùng đổi ngày Dương
  const handleSolarChange = (newSolarStr: string) => {
    setSolarDate(newSolarStr);
    const parts = newSolarStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const lunar = solarToLunar(parts[2], parts[1], parts[0]);
      setLunarDay(lunar.day);
      setLunarMonth(lunar.month);
      setLunarYear(lunar.year);
      setIsLeapMonth(lunar.isLeap);

      onChange({
        solarDate: newSolarStr,
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        lunarYear: lunar.year,
        isLeapMonth: lunar.isLeap,
        canChiYear: lunar.canChiYear,
      });
    }
  };

  // Khi người dùng đổi ngày Âm
  const handleLunarChange = (d: number, m: number, y: number, leap: boolean) => {
    setLunarDay(d);
    setLunarMonth(m);
    setLunarYear(y);
    setIsLeapMonth(leap);

    const [sd, sm, sy] = lunarToSolar(d, m, y, leap);
    if (sd !== 0) {
      const newSolarStr = `${sy}-${pad(sm)}-${pad(sd)}`;
      setSolarDate(newSolarStr);
      const lunar = solarToLunar(sd, sm, sy);

      onChange({
        solarDate: newSolarStr,
        lunarDay: d,
        lunarMonth: m,
        lunarYear: y,
        isLeapMonth: leap,
        canChiYear: lunar.canChiYear,
      });
    }
  };

  const currentLunar = solarDate ? (() => {
    const p = solarDate.split('-').map(Number);
    return solarToLunar(p[2], p[1], p[0]);
  })() : null;

  const leapMonthInYear = getLeapMonth(lunarYear);
  const daysInCurrentLunarMonth = getDaysInLunarMonth(lunarMonth, lunarYear, isLeapMonth);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
      {/* Mode Switch Tabs */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-heritage-green" />
          <span>Chọn Theo Lịch</span>
        </span>

        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs text-xs">
          <button
            type="button"
            onClick={() => setInputMode('SOLAR')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition font-semibold ${
              inputMode === 'SOLAR'
                ? 'bg-heritage-green text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Dương Lịch</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('LUNAR')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition font-semibold ${
              inputMode === 'LUNAR'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Âm Lịch</span>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      {inputMode === 'SOLAR' ? (
        <div>
          <input
            type="date"
            value={solarDate}
            onChange={(e) => handleSolarChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-heritage-green"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ngày Âm</label>
              <select
                value={lunarDay}
                onChange={(e) => handleLunarChange(Number(e.target.value), lunarMonth, lunarYear, isLeapMonth)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {Array.from({ length: daysInCurrentLunarMonth || 30 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Ngày {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tháng Âm</label>
              <select
                value={lunarMonth}
                onChange={(e) => handleLunarChange(lunarDay, Number(e.target.value), lunarYear, isLeapMonth)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Năm Âm</label>
              <input
                type="number"
                value={lunarYear}
                onChange={(e) => handleLunarChange(lunarDay, lunarMonth, Number(e.target.value), isLeapMonth)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Tháng nhuận checkbox */}
          {leapMonthInYear === lunarMonth && (
            <label className="flex items-center space-x-2 text-xs font-semibold text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => handleLunarChange(lunarDay, lunarMonth, lunarYear, e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Tháng {lunarMonth} này là Tháng Nhuận (Năm {lunarYear})</span>
            </label>
          )}
        </div>
      )}

      {/* Dual Preview Box */}
      {currentLunar && (
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs grid grid-cols-2 gap-2 divide-x divide-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dương Lịch</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {currentLunar.solarDate}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tiết: <span className="font-semibold text-heritage-green">{currentLunar.tietKhi}</span>
            </div>
          </div>

          <div className="pl-2">
            <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Âm Lịch Việt Nam</div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              {currentLunar.day}/{currentLunar.month} {currentLunar.isLeap ? '(Nhuận)' : ''} ({currentLunar.canChiYear})
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 truncate">
              Ngày: <span className="font-semibold">{currentLunar.canChiDay}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
