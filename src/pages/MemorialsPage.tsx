import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { MemorialService } from '../services/calendar/MemorialService';
import { MemorialDate } from '../types/database';
import { mockMembers } from '../services/mockData';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { CreateMemorialModal } from '../components/calendar/CreateMemorialModal';

export const MemorialsPage: React.FC = () => {
  const [memorials, setMemorials] = useState<MemorialDate[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await MemorialService.getMemorials('fam-0000-0001');
    setMemorials(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngày giỗ này khỏi danh bạ gia tộc?')) {
      await MemorialService.deleteMemorial(id, 'fam-0000-0001');
      loadData();
    }
  };

  const filteredMemorials = memorials.filter((m) => {
    const matchMonth = selectedMonth === 'ALL' || String(m.lunar_month) === selectedMonth;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Ngày Giỗ Tổ Tiên & Thân Nhân</span>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              Chu Kỳ Âm Lịch Vạn Niên
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Tự động quy đổi ngày Dương lịch hàng năm, xử lý tháng nhuận và gửi thông báo nhắc lễ
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ngày Giỗ Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên ngày giỗ, tên tiền nhân..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none font-medium"
            >
              <option value="ALL">Tất cả các tháng Âm</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Tháng {i + 1} Âm Lịch {i === 0 ? '(Giêng)' : i === 11 ? '(Chạp)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memorial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemorials.map((mem) => {
          const member = mockMembers.find((m) => m.id === mem.member_id);
          const is30thDay = mem.lunar_day === 30;

          return (
            <div
              key={mem.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-heritage hover:border-amber-300 transition p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-heritage-gold font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{mem.title}</h2>
                      <div className="text-xs text-slate-500">{member?.full_name}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                      Ngày {mem.lunar_day}/{mem.lunar_month} Âm Lịch
                    </span>
                    {mem.is_leap_month && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                        Tháng Nhuận
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Location */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-heritage-green shrink-0" />
                    <span>
                      Dương lịch dự kiến: <strong className="text-slate-800">{formatDate(mem.next_solar_date)}</strong>
                    </span>
                  </div>
                  {member?.burial_place && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">{member.burial_place}</span>
                    </div>
                  )}
                </div>

                {/* 30th day Special Alert Warning */}
                {is30thDay && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Hệ thống tự động điều chỉnh cúng vào ngày 29 nếu năm thiếu 29 ngày.</span>
                  </div>
                )}

                {mem.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg mt-3 border border-slate-100">
                    {mem.notes}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Nhắc tự động: 30 - 15 - 7 - 3 - 1 ngày
                </span>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Xóa ngày giỗ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/app/members/${mem.member_id}`}
                    className="text-heritage-green hover:text-heritage-green-light font-bold flex items-center space-x-1"
                  >
                    <span>Xem thân thế</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreateMemorialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
