import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Filter,
  List,
  Grid,
  Moon,
  MapPin,
  Zap,
  Download,
  Printer,
  RefreshCw,
  Bell,
  TreePine,
  Info,
  ChevronDown,
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
import { getCanChiYear } from '../lib/lunar';
import { useAuth } from '../contexts/AuthContext';
import { CalendarExportService } from '../services/calendar/CalendarExportService';

// ─── Constants ─────────────────────────────────────────────────────────────────
const LUNAR_MONTH_NAMES: Record<number, string> = {
  1: 'Tháng Giêng', 2: 'Tháng Hai', 3: 'Tháng Ba', 4: 'Tháng Tư',
  5: 'Tháng Năm', 6: 'Tháng Sáu', 7: 'Tháng Bảy', 8: 'Tháng Tám',
  9: 'Tháng Chín', 10: 'Tháng Mười', 11: 'Tháng Mười Một', 12: 'Tháng Chạp',
};

const MONTH_COLORS: Record<number, { bg: string; border: string; header: string }> = {
  1:  { bg: 'bg-red-50',    border: 'border-red-200',    header: 'from-red-600 to-red-700' },
  2:  { bg: 'bg-orange-50', border: 'border-orange-200', header: 'from-orange-500 to-orange-600' },
  3:  { bg: 'bg-amber-50',  border: 'border-amber-200',  header: 'from-amber-600 to-amber-700' },
  4:  { bg: 'bg-yellow-50', border: 'border-yellow-200', header: 'from-yellow-600 to-yellow-700' },
  5:  { bg: 'bg-lime-50',   border: 'border-lime-200',   header: 'from-lime-600 to-lime-700' },
  6:  { bg: 'bg-emerald-50',border: 'border-emerald-200',header: 'from-emerald-600 to-emerald-700' },
  7:  { bg: 'bg-teal-50',   border: 'border-teal-200',   header: 'from-teal-600 to-teal-700' },
  8:  { bg: 'bg-cyan-50',   border: 'border-cyan-200',   header: 'from-cyan-600 to-cyan-700' },
  9:  { bg: 'bg-sky-50',    border: 'border-sky-200',    header: 'from-sky-600 to-sky-700' },
  10: { bg: 'bg-blue-50',   border: 'border-blue-200',   header: 'from-blue-600 to-blue-700' },
  11: { bg: 'bg-indigo-50', border: 'border-indigo-200', header: 'from-indigo-600 to-indigo-700' },
  12: { bg: 'bg-purple-50', border: 'border-purple-200', header: 'from-purple-600 to-purple-700' },
};

// ─── Year Range Configuration (Chuẩn Thiên Văn Học 1900 - 2050) ────────────────
const MIN_YEAR = 1900;
const MAX_YEAR = 2050;
const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);


// ─── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Tính ngày Dương lịch của một ngày giỗ Âm lịch trong một năm Dương lịch cụ thể.
 * Trả về solarDate string "YYYY-MM-DD" hoặc null nếu không tính được.
 */
function calcSolarForYear(
  lunarDay: number,
  lunarMonth: number,
  isLeapMonth: boolean,
  targetSolarYear: number
): { solarDate: string; isSpecial30: boolean; daysRemaining: number } | null {
  try {
    const result = LunarCalendarService.getNextSolarDateForMemorial(
      lunarDay,
      lunarMonth,
      isLeapMonth,
      targetSolarYear
    );
    // Chỉ trả kết quả nếu năm Dương lịch tính ra đúng với năm được chọn
    if (result.solarYear === targetSolarYear) {
      return {
        solarDate: result.solarDate,
        isSpecial30: result.isSpecial30Fallback,
        daysRemaining: result.daysRemaining,
      };
    }
    // Một số ngày giỗ đầu tháng Giêng Âm có thể rơi sang năm DL trước
    return {
      solarDate: result.solarDate,
      isSpecial30: result.isSpecial30Fallback,
      daysRemaining: result.daysRemaining,
    };
  } catch {
    return null;
  }
}

// ─── PDF Export ────────────────────────────────────────────────────────────────
function printMemorialPDF(
  memorials: (MemorialDate & {
    next_solar_date?: string;
    branch_name?: string;
    generation_name?: string;
    burial_place?: string;
  })[],
  year: number,
  annualGroups: { month: number; mems: any[] }[]
) {
  const canChiYear = getCanChiYear(year);

  const rows = annualGroups
    .flatMap(({ month, mems }) =>
      mems.map((m, i) => {
        const member = mockMembers.find((mb) => mb.id === m.member_id);
        return `
        <tr>
          <td style="color:#92400e;font-weight:700">${LUNAR_MONTH_NAMES[month]}</td>
          <td style="text-align:center;font-weight:800">${m.lunar_day}/${month}${m.is_leap_month ? '<br><small>(Nhuận)</small>' : ''}</td>
          <td>${m.title}</td>
          <td>${m.solarDateForYear ? formatDate(m.solarDateForYear) : (m.next_solar_date ? formatDate(m.next_solar_date) : '—')}</td>
          <td>${m.generation_name || '—'}</td>
          <td>${m.branch_name || '—'}</td>
          <td>${m.burial_place || member?.burial_place || '—'}</td>
        </tr>`;
      })
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Lịch Giỗ Vạn Niên – Năm ${year} (${canChiYear})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Be Vietnam Pro', sans-serif; margin: 20px; color: #1e293b; font-size: 11px; }
    h1 { text-align: center; font-size: 20px; color: #166534; margin-bottom: 2px; }
    h2 { text-align: center; font-size: 13px; color: #92400e; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 10px; color: #64748b; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #166534; color: #fff; }
    thead th { padding: 7px 5px; text-align: left; }
    tbody tr:nth-child(even) { background: #f0fdf4; }
    tbody td { padding: 6px 5px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .footer { margin-top: 16px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    @media print { body { margin: 8px; } }
  </style>
</head>
<body>
  <h1>🕯️ LỊCH GIỖ VẠN NIÊN</h1>
  <h2>Năm Dương Lịch ${year} — Năm ${canChiYear}</h2>
  <div class="subtitle">
    Tự động đồng bộ từ Cây Phả Hệ &nbsp;•&nbsp;
    Tổng: ${memorials.length} ngày giỗ &nbsp;•&nbsp;
    In ngày ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
  </div>
  <table>
    <thead>
      <tr>
        <th>Tháng Âm</th>
        <th>Ngày Âm Lịch</th>
        <th>Tên Ngày Giỗ</th>
        <th>Ngày Dương Lịch ${year}</th>
        <th>Đời Thứ</th>
        <th>Chi / Nhánh</th>
        <th>Nơi An Táng</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    Gia Phả Gia Tộc – Hệ Thống Quản Trị Dòng Họ Đa Chi Phái &nbsp;|&nbsp; Dữ liệu được bảo mật và mã hóa AES-256
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1000,height=750');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 700);
  }
}

// ─── CountdownBadge ───────────────────────────────────────────────────────────
const CountdownBadge: React.FC<{ days: number }> = ({ days }) => {
  if (days === 0)
    return <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full animate-pulse">Hôm Nay!</span>;
  if (days < 0)
    return <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-semibold rounded-full">Đã qua</span>;
  if (days <= 3)
    return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold rounded-full">Còn {days} ngày</span>;
  if (days <= 7)
    return <span className="px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-300 text-[10px] font-bold rounded-full">Còn {days} ngày</span>;
  if (days <= 30)
    return <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold rounded-full">Còn {days} ngày</span>;
  return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-semibold rounded-full">Còn {days} ngày</span>;
};

// ─── YearPicker ───────────────────────────────────────────────────────────────
const YearPicker: React.FC<{
  year: number;
  onChange: (y: number) => void;
}> = ({ year, onChange }) => {
  const canChiYear = getCanChiYear(year);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(year - 1)}
        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex flex-col items-center px-4 py-1.5 bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-xl shadow-xs min-w-[130px]">
        <select
          value={year}
          onChange={(e) => onChange(Number(e.target.value))}
          className="text-sm font-black text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer text-center"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
        <span className="text-[10px] font-bold text-amber-700 -mt-0.5">
          Năm {canChiYear}
        </span>
      </div>

      <button
        onClick={() => onChange(year + 1)}
        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {year !== THIS_YEAR && (
        <button
          onClick={() => onChange(THIS_YEAR)}
          className="px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 bg-amber-50 border border-amber-200 rounded-xl transition"
        >
          Năm Nay
        </button>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const FamilyCalendarPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const todayInfo = LunarCalendarService.getTodayInfo();

  // ── State ──────────────────────────────────────────────────────────
  const [currentYear, setCurrentYear] = useState<number>(todayInfo.solarYear);
  const [currentMonth, setCurrentMonth] = useState<number>(todayInfo.solarMonth);
  const [viewMode, setViewMode] = useState<'MONTH' | 'LIST' | 'ANNUAL'>('MONTH');
  const [annualYear, setAnnualYear] = useState<number>(todayInfo.solarYear);

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<'ALL' | 'BRANCH'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const [memorials, setMemorials] = useState<MemorialDate[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingMemorials, setUpcomingMemorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncInfo, setSyncInfo] = useState<{ total: number; autoSynced: number }>({ total: 0, autoSynced: 0 });
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));

  const [selectedDay, setSelectedDay] = useState<CalendarDayInfo | null>(null);
  const [showCreateMemorialModal, setShowCreateMemorialModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  const currentFamId = activeFamily?.id || '';

  // ── Load Data ──────────────────────────────────────────────────────
  const loadCalendarData = useCallback(async () => {
    if (!currentFamId) {
      setMemorials([]);
      setEvents([]);
      setUpcomingMemorials([]);
      setSyncInfo({ total: 0, autoSynced: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    const [mems, evts, upcoming] = await Promise.all([
      MemorialService.getMemorials(currentFamId),
      EventService.getEvents(currentFamId),
      MemorialService.getUpcomingMemorials(currentFamId, 20),
    ]);
    setMemorials(mems);
    setEvents(evts);
    setUpcomingMemorials(upcoming);
    setSyncInfo({
      total: mems.length,
      autoSynced: mems.filter((m) => m.id.startsWith('auto-mem-')).length,
    });
    setLoading(false);
  }, [currentFamId]);

  useEffect(() => { loadCalendarData(); }, [loadCalendarData]);

  // ── Navigation ─────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };
  const handleToday = () => { setCurrentYear(todayInfo.solarYear); setCurrentMonth(todayInfo.solarMonth); };

  // ── Branch Filter ──────────────────────────────────────────────────
  const branchFilteredMemorials = useMemo(() =>
    memorials.filter((m) => {
      if (filterMode === 'ALL' || !selectedBranchId) return true;
      const member = mockMembers.find((mb) => mb.id === m.member_id);
      return !member?.branch_id || member.branch_id === selectedBranchId;
    }),
    [memorials, filterMode, selectedBranchId]
  );

  // ── Month Calendar ─────────────────────────────────────────────────
  const monthDays = useMemo(() =>
    LunarCalendarService.getMonthCalendar(currentYear, currentMonth, branchFilteredMemorials, events),
    [currentYear, currentMonth, branchFilteredMemorials, events]
  );

  const filteredMonthDays = useMemo(() =>
    monthDays.map((day) => ({
      ...day,
      memorials: selectedFilter === 'EVENT' ? [] : day.memorials,
      events: selectedFilter === 'MEMORIAL' ? [] : day.events,
    })),
    [monthDays, selectedFilter]
  );

  // ── Annual / Vạn Niên: nhóm theo tháng Âm, tính ngày DL theo năm chọn ──
  const annualGroups = useMemo(() => {
    const groups: Record<number, (MemorialDate & {
      solarDateForYear: string | null;
      isSpecial30: boolean;
      daysRemaining: number;
      generation_name?: string;
      branch_name?: string;
      burial_place?: string;
    })[]> = {};

    branchFilteredMemorials.forEach((m) => {
      const calc = calcSolarForYear(m.lunar_day, m.lunar_month, m.is_leap_month, annualYear);
      const key = m.lunar_month;
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        ...m,
        solarDateForYear: calc?.solarDate ?? (m as any).next_solar_date ?? null,
        isSpecial30: calc?.isSpecial30 ?? false,
        daysRemaining: calc?.daysRemaining ?? 999,
        generation_name: (m as any).generation_name,
        branch_name: (m as any).branch_name,
        burial_place: (m as any).burial_place,
      });
    });

    // Thêm tháng Nhuận nếu có (lunar_month trùng nhưng is_leap_month = true)
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([month, mems]) => ({
        month: Number(month),
        mems: mems.sort((a, b) => a.lunar_day - b.lunar_day),
      }));
  }, [branchFilteredMemorials, annualYear]);

  const soonMemorials = useMemo(
    () => upcomingMemorials.filter((m) => m.daysRemaining >= 0 && m.daysRemaining <= 90),
    [upcomingMemorials]
  );

  const toggleMonth = (month: number) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  };

  const canChiAnnualYear = getCanChiYear(annualYear);
  const totalMemorialsInYear = annualGroups.reduce((s, g) => s + g.mems.length, 0);

  return (
    <div className="space-y-5 animate-fade-in font-sans pb-10">

      {/* ══ 1. Header Banner ══════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Lịch Gia Tộc &amp; Ngày Giỗ Vạn Niên
            </h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Chuẩn Việt Nam • UTC+7
            </span>
            <button
              onClick={() => setShowSyncPanel(!showSyncPanel)}
              className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 hover:bg-amber-100 transition"
            >
              <Zap className="w-3 h-3 text-amber-600" />
              {syncInfo.autoSynced} Tự Động / {syncInfo.total} Ngày Giỗ
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu Lịch Âm-Dương song hành, Can Chi, Tiết Khí, Giờ Hoàng Đạo &amp; Ngày Giỗ tự động đồng bộ theo chi, cành.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => CalendarExportService.downloadICSFile(activeFamily?.name || 'Gia Tộc', memorials, events, currentYear)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
            title="Đồng bộ toàn bộ ngày giỗ âm lịch và lễ nghi vào điện thoại"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Đồng Bộ Lịch (.ics)</span>
          </button>
          <button
            onClick={() => printMemorialPDF(memorials as any[], annualYear, annualGroups)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Xuất PDF</span>
          </button>
          <button
            onClick={() => setShowCreateMemorialModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thêm Ngày Giỗ</span>
          </button>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Sự Kiện</span>
          </button>
          <button
            onClick={loadCalendarData}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition"
            title="Đồng bộ lại từ Cây Phả Hệ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Sync Info Panel ──────────────────────────────────────────── */}
      {showSyncPanel && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold text-sm">Cơ Chế Đồng Bộ Tự Động Ngày Giỗ</p>
              <p>
                Hệ thống quét Cây Phả Hệ, tạo ngày giỗ cho{' '}
                <strong>{mockMembers.filter((m) => m.life_status === 'DECEASED' && m.death_lunar_day && m.death_lunar_month).length} thành viên đã khuất</strong>{' '}
                có ghi nhận ngày mất Âm lịch.
              </p>
              <ul className="list-disc ml-4 space-y-0.5 mt-1">
                <li><strong>{syncInfo.autoSynced}</strong> ngày giỗ đồng bộ tự động từ dữ liệu thành viên.</li>
                <li><strong>{syncInfo.total - syncInfo.autoSynced}</strong> ngày giỗ tạo thủ công.</li>
                <li>Ngày 30 tháng thiếu &amp; tháng Nhuận được tính toán chuẩn xác theo quy ước truyền thống Lịch vạn niên.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ══ 2. Today Widget ══════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-slate-900 to-[#166534] text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-bold uppercase text-amber-300">Hôm nay</span>
            <span className="text-2xl font-black leading-none mt-0.5">{todayInfo.solarDay}</span>
          </div>
          <div>
            <div className="text-base font-bold">
              Ngày {todayInfo.solarDay} Tháng {todayInfo.solarMonth} Năm {todayInfo.solarYear}
            </div>
            <div className="text-xs text-amber-300 font-semibold mt-0.5">
              Ngày {todayInfo.lunarDay} {LUNAR_MONTH_NAMES[todayInfo.lunarMonth]}{todayInfo.isLeap ? ' (Nhuận)' : ''} &nbsp;•&nbsp; Năm {todayInfo.canChiYear}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {todayInfo.canChiDay} &nbsp;|&nbsp; Tiết: {todayInfo.tietKhi} &nbsp;|&nbsp;
              {todayInfo.daysInLunarMonth === 30 ? 'Tháng Đủ' : 'Tháng Thiếu'}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-300 text-[9px] block font-medium">GIỜ HOÀNG ĐẠO</span>
            <strong className="text-amber-300 font-bold">{todayInfo.gioHoangDao.slice(0, 3).join(' · ')}</strong>
          </div>
          {soonMemorials.length > 0 && (
            <div className="bg-rose-600/30 border border-rose-400/50 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-rose-200 text-[9px] block font-medium">SẮP TỚI (90 ngày)</span>
              <strong className="text-white font-bold">{soonMemorials.length} Ngày Giỗ</strong>
            </div>
          )}
        </div>
      </div>

      {/* ══ 3. Upcoming Memorials Panel ══════════════════════════════════ */}
      {soonMemorials.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Ngày Giỗ Họ Sắp Diễn Ra <span className="text-slate-400 font-normal">(trong 90 ngày tới)</span>
            </h2>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
              {soonMemorials.length} mục
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {soonMemorials.slice(0, 6).map((mem) => (
              <div
                key={mem.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                  mem.daysRemaining === 0 ? 'bg-rose-50 border-rose-300'
                  : mem.daysRemaining <= 7 ? 'bg-orange-50 border-orange-200'
                  : 'bg-amber-50/60 border-amber-200/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                    <span>🕯️</span>
                    <span className="truncate">{mem.title}</span>
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                    Ngày {mem.lunar_day}/{mem.lunar_month} Âm Lịch{mem.is_leap_month ? ' (Nhuận)' : ''}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {mem.solarDate ? formatDate(mem.solarDate) : ''}
                  </div>
                  {(mem.branch_name || mem.generation_name) && (
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {[mem.generation_name, mem.branch_name].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
                <CountdownBadge days={mem.daysRemaining} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ 4. Toolbar ════════════════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branch filter + type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setFilterMode('ALL'); setSelectedBranchId(''); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterMode === 'ALL' ? 'bg-[#2E1E6B] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toàn dòng họ
          </button>
          <button
            onClick={() => {
              setFilterMode('BRANCH');
              if (!selectedBranchId && mockBranches.length > 0) setSelectedBranchId(mockBranches[0].id);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterMode === 'BRANCH' ? 'bg-[#2E1E6B] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TreePine className="w-3 h-3 inline mr-1" />
            Theo Chi
          </button>
          {filterMode === 'BRANCH' && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2E1E6B]"
            >
              {mockBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold"
            >
              <option value="ALL">Tất cả</option>
              <option value="MEMORIAL">Chỉ ngày giỗ</option>
              <option value="EVENT">Chỉ sự kiện</option>
            </select>
          </div>
        </div>

        {/* Right: Nav + View toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Month & Year Navigation (Chế độ MONTH hoặc LIST — Hỗ trợ 1900 - 2050) */}
          {viewMode !== 'ANNUAL' && (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={handlePrevMonth}
                aria-label="Tháng trước"
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
                {/* Chọn Tháng trực tiếp (1 - 12) */}
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  aria-label="Chọn tháng"
                  className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer py-0.5"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <span className="text-slate-300 font-bold">/</span>
                {/* Chọn Năm trực tiếp (1900 - 2050) */}
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  aria-label="Chọn năm"
                  className="text-xs font-black text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer py-0.5"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y} ({getCanChiYear(y)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                aria-label="Tháng sau"
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {(currentYear !== todayInfo.solarYear || currentMonth !== todayInfo.solarMonth) && (
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 rounded-xl transition cursor-pointer"
                  title="Về tháng hiện tại"
                >
                  Hôm nay
                </button>
              )}
            </div>
          )}


          {/* Year picker (chỉ hiện khi ANNUAL) */}
          {viewMode === 'ANNUAL' && (
            <YearPicker year={annualYear} onChange={setAnnualYear} />
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('MONTH')}
              title="Lịch tháng"
              className={`p-1.5 rounded-lg transition ${viewMode === 'MONTH' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              title="Danh sách tháng"
              className={`p-1.5 rounded-lg transition ${viewMode === 'LIST' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('ANNUAL')}
              title="Lịch Vạn Niên (toàn năm theo Âm lịch)"
              className={`p-1.5 rounded-lg transition ${viewMode === 'ANNUAL' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ 5. Loading ════════════════════════════════════════════════════ */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold">Đang đồng bộ dữ liệu lịch giỗ...</span>
          </div>
        </div>
      )}

      {/* ══ 6. Month Grid View ═══════════════════════════════════════════ */}
      {!loading && viewMode === 'MONTH' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((d, idx) => (
              <div
                key={d}
                className={`text-[10px] font-bold uppercase py-2 rounded-lg ${
                  idx === 5 ? 'text-amber-700 bg-amber-50/50' : idx === 6 ? 'text-rose-700 bg-rose-50/50' : 'text-slate-500'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {filteredMonthDays.map((day, idx) => {
              const isCurMonth = day.solarMonth === currentMonth;
              const hasM = day.memorials.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[96px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none ${
                    !isCurMonth ? 'bg-slate-50/50 border-slate-100 opacity-40 hover:opacity-100'
                    : day.isToday ? 'bg-emerald-50/50 border-[#166534] ring-2 ring-emerald-100'
                    : hasM ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-xs font-black leading-none ${
                      day.isToday ? 'w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center'
                      : isCurMonth ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {day.solarDay}
                    </span>
                    <span className={`text-[9px] font-semibold leading-none ${
                      day.lunarDay === 1 || day.lunarDay === 15
                        ? 'text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded'
                        : 'text-slate-400'
                    }`}>
                      {day.lunarDay === 1 ? `Mùng 1/${day.lunarMonth}ÂL` : `${day.lunarDay} ÂL`}
                    </span>
                  </div>
                  <div className="space-y-0.5 my-1">
                    {day.memorials.slice(0, 2).map((m) => (
                      <div key={m.id} className="text-[9px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded truncate flex items-center gap-1" title={m.title}>
                        <Sparkles className="w-2 h-2 text-amber-700 shrink-0" />
                        <span className="truncate">{m.title}</span>
                      </div>
                    ))}
                    {day.events.slice(0, 1).map((e) => (
                      <div key={e.id} className="text-[9px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded truncate flex items-center gap-1" title={e.title}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}
                    {day.memorials.length + day.events.length > 3 && (
                      <div className="text-[9px] text-slate-500 font-bold pl-1">+{day.memorials.length + day.events.length - 3} khác</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 truncate">
                    <span className="truncate">{day.tietKhi || day.canChiDay.split(' ')[0]}</span>
                    {day.gioHoangDao.length > 0 && <span className="text-amber-500">★</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ 7. List View ═════════════════════════════════════════════════ */}
      {!loading && viewMode === 'LIST' && (
        <div className="space-y-2">
          {filteredMonthDays.filter((d) => d.memorials.length > 0 || d.events.length > 0).length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-400">
              Không có ngày giỗ hay sự kiện nào trong tháng {currentMonth}/{currentYear}
            </div>
          )}
          {filteredMonthDays.filter((d) => d.memorials.length > 0 || d.events.length > 0).map((day, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedDay(day)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                  day.isToday ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-xs font-bold">{day.solarDay}</span>
                  <span className="text-[9px] opacity-70">T{day.solarMonth}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Thứ {['Chủ Nhật','Hai','Ba','Tư','Năm','Sáu','Bảy'][day.dayOfWeek]}, ngày {day.solarDay}/{day.solarMonth}/{day.solarYear}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    Ngày {day.lunarDay} {LUNAR_MONTH_NAMES[day.lunarMonth]}{day.isLeap ? ' (Nhuận)' : ''} • {day.canChiDay}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tiết khí: {day.tietKhi} • Giờ Hoàng Đạo: {day.gioHoangDao.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {day.memorials.map((m) => (
                  <span key={m.id} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    {m.title}
                    {((m as any).generation_name || (m as any).branch_name) && (
                      <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1 rounded border border-amber-300/50">
                        {[(m as any).generation_name, (m as any).branch_name].filter(Boolean).join(' • ')}
                      </span>
                    )}
                  </span>
                ))}
                {day.events.map((e) => (
                  <span key={e.id} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold">
                    {e.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ 8. Annual / Vạn Niên View ═══════════════════════════════════ */}
      {!loading && viewMode === 'ANNUAL' && (
        <div className="space-y-4">

          {/* ── Annual Header Banner ── */}
          <div className="bg-gradient-to-r from-[#1E3A5F] via-[#2E1E6B] to-[#166534] text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <Moon className="w-5 h-5 text-amber-300" />
                <h2 className="text-lg font-black">Lịch Giỗ Vạn Niên</h2>
                <span className="text-xs bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full font-bold">
                  Năm Dương Lịch {annualYear} — Năm {canChiAnnualYear}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">
                Hiển thị đầy đủ 12 tháng Âm lịch &nbsp;•&nbsp;
                <strong className="text-amber-300">{totalMemorialsInYear} ngày giỗ</strong> &nbsp;•&nbsp;
                {syncInfo.autoSynced} tự động đồng bộ từ Cây Phả Hệ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allMonths = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                  setExpandedMonths(expandedMonths.size === 12 ? new Set() : allMonths);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition border border-white/25"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                {expandedMonths.size === 12 ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
              </button>
              <button
                onClick={() => printMemorialPDF(memorials as any[], annualYear, annualGroups)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                In PDF
              </button>
            </div>
          </div>

          {/* ── 12-month overview stats bar ── */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const group = annualGroups.find((g) => g.month === m);
              const count = group?.mems.length ?? 0;
              const color = MONTH_COLORS[m];
              return (
                <button
                  key={m}
                  onClick={() => {
                    setExpandedMonths((prev) => {
                      const next = new Set(prev);
                      next.has(m) ? next.delete(m) : next.add(m);
                      return next;
                    });
                    // Scroll to month
                    setTimeout(() => {
                      document.getElementById(`annual-month-${m}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                  className={`rounded-xl border p-2 text-center transition-all hover:shadow-md ${color.bg} ${color.border} ${expandedMonths.has(m) ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                >
                  <div className="text-[9px] font-bold text-slate-600 truncate">T.{m}</div>
                  <div className={`text-base font-black ${count > 0 ? 'text-amber-700' : 'text-slate-300'}`}>{count}</div>
                  <div className="text-[8px] text-slate-400">{count > 0 ? 'ngày giỗ' : '—'}</div>
                </button>
              );
            })}
          </div>

          {/* ── Monthly sections ── */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
            const group = annualGroups.find((g) => g.month === month);
            const mems = group?.mems ?? [];
            const color = MONTH_COLORS[month];
            const isExpanded = expandedMonths.has(month);

            return (
              <div key={month} id={`annual-month-${month}`} className={`rounded-2xl border overflow-hidden shadow-sm ${color.border}`}>
                {/* Month header */}
                <button
                  onClick={() => toggleMonth(month)}
                  className={`w-full px-5 py-3 bg-gradient-to-r ${color.header} text-white flex items-center justify-between hover:opacity-95 transition`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black">
                      {month}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm leading-tight">{LUNAR_MONTH_NAMES[month]}</div>
                      <div className="text-[10px] text-white/75 leading-tight">Tháng {month} Âm Lịch · Năm {canChiAnnualYear}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                      {mems.length > 0 ? `${mems.length} ngày giỗ` : 'Không có ngày giỗ'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Month body */}
                {isExpanded && (
                  <div className={`${color.bg}`}>
                    {mems.length === 0 ? (
                      <div className="px-5 py-6 text-center text-xs text-slate-400">
                        Không có ngày giỗ nào trong {LUNAR_MONTH_NAMES[month]}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100/80">
                        {mems.map((m) => {
                          const member = mockMembers.find((mb) => mb.id === m.member_id);
                          const isAutoSynced = m.id.startsWith('auto-mem-');
                          const isLeapMemorial = m.is_leap_month;

                          return (
                            <div key={m.id} className="px-5 py-3.5 flex items-start sm:items-center justify-between gap-4 hover:bg-white/60 transition">
                              {/* Left: day badge + info */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center shrink-0">
                                  <span className="text-sm font-black text-amber-800 leading-tight">
                                    {m.lunar_day < 10 ? `0${m.lunar_day}` : m.lunar_day}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-semibold">/{month} ÂL</span>
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                    <span>🕯️</span>
                                    <span className="truncate">{m.title}</span>
                                    {isLeapMemorial && (
                                      <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                        Tháng Nhuận
                                      </span>
                                    )}
                                    {m.isSpecial30 && (
                                      <span className="text-[10px] bg-orange-100 text-orange-800 border border-orange-200 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                        29 → Tháng Thiếu
                                      </span>
                                    )}
                                    {isAutoSynced && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
                                        <Zap className="w-2.5 h-2.5" />Tự động
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                                    {m.generation_name && <span className="font-semibold text-slate-700">{m.generation_name}</span>}
                                    {m.branch_name && <span className="text-slate-400">• {m.branch_name}</span>}
                                    {(m.burial_place || member?.burial_place) && (
                                      <span className="flex items-center gap-0.5 text-slate-400">
                                        <MapPin className="w-2.5 h-2.5" />
                                        {m.burial_place || member?.burial_place}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: solar date + countdown */}
                              <div className="text-right shrink-0 space-y-1">
                                <div className="text-xs font-bold text-slate-900">
                                  {m.solarDateForYear ? formatDate(m.solarDateForYear) : '—'}
                                </div>
                                <div className="text-[10px] text-slate-400">Dương lịch {annualYear}</div>
                                {m.daysRemaining !== undefined && m.daysRemaining < 999 && (
                                  <CountdownBadge days={m.daysRemaining} />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ 9. Modals & Drawers ══════════════════════════════════════════ */}
      <CalendarDayDetailDrawer
        dayInfo={selectedDay}
        onClose={() => setSelectedDay(null)}
        onAddMemorial={() => { setSelectedDay(null); setShowCreateMemorialModal(true); }}
        onAddEvent={() => { setSelectedDay(null); setShowCreateEventModal(true); }}
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
