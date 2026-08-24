import React from 'react';
import { Bell, Search, Calendar, ChevronDown, User, Shield } from 'lucide-react';
import { LunarCalendarService } from '../../services/LunarCalendarService';
import { mockFamily, mockProfile } from '../../services/mockData';

export const AppHeader: React.FC = () => {
  const todayInfo = LunarCalendarService.getTodayInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Active Family & Lunar Widget */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-heritage-bg px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition">
          <Shield className="w-4 h-4 text-heritage-green" />
          <span className="text-sm font-semibold text-heritage-navy">{mockFamily.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Lunar Date Pill */}
        <div className="hidden md:flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-medium text-amber-900">
          <Calendar className="w-3.5 h-3.5 text-heritage-gold" />
          <span>Hôm nay: {todayInfo.solarDay}/{todayInfo.solarMonth}/{todayInfo.solarYear}</span>
          <span className="text-amber-400">•</span>
          <span className="font-semibold text-heritage-green">Âm lịch: {todayInfo.lunarDay}/{todayInfo.lunarMonth} ({todayInfo.canChiYear})</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative hidden sm:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm thành viên, ngày giỗ..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
          />
        </div>

        {/* Notifications */}
        <button
          title="Thông báo"
          className="p-2 text-slate-500 hover:text-heritage-green hover:bg-slate-100 rounded-lg relative transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 cursor-pointer">
          {mockProfile.avatar_url ? (
            <img
              src={mockProfile.avatar_url}
              alt={mockProfile.full_name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-heritage-green/10 text-heritage-green flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">{mockProfile.full_name}</div>
            <div className="text-[10px] font-medium text-amber-700">Trưởng Tộc (Owner)</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
