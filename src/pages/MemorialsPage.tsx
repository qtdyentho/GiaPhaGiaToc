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
  GitFork,
  Zap,
  User,
  ScrollText
} from 'lucide-react';
import { MemorialService } from '../services/calendar/MemorialService';
import { MemorialDate, Branch, Generation, Member } from '../types/database';
import { mockMembers, mockBranches, mockGenerations } from '../services/mockData';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { CreateMemorialModal } from '../components/calendar/CreateMemorialModal';
import { MemorialPrayerViewerModal } from '../components/genealogy/MemorialPrayerViewerModal';
import { useAuth } from '../contexts/AuthContext';

export const MemorialsPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [memorials, setMemorials] = useState<MemorialDate[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'BRANCH' | 'SUB_BRANCH'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedSubBranch, setSelectedSubBranch] = useState<string>('CÀNH 1');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPrayerMember, setSelectedPrayerMember] = useState<Member | null>(null);

  const currentFamId = activeFamily?.id || '';

  const loadData = async () => {
    if (!currentFamId) {
      setMemorials([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await MemorialService.getMemorials(currentFamId);
    setMemorials(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentFamId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngày giỗ này khỏi danh bạ gia tộc?')) {
      await MemorialService.deleteMemorial(id, currentFamId);
      loadData();
    }
  };

  const filteredMemorials = memorials.filter((m) => {
    const member = mockMembers.find((mb) => mb.id === m.member_id);
    const matchMonth = selectedMonth === 'ALL' || String(m.lunar_month) === selectedMonth;
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (member?.full_name && member.full_name.toLowerCase().includes(search.toLowerCase()));

    let matchBranch = true;
    if (filterMode === 'BRANCH' && selectedBranchId) {
      matchBranch = !member?.branch_id || member.branch_id === selectedBranchId;
    }

    return matchMonth && matchSearch && matchBranch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner with Auto-Sync Callout */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#166534] via-[#C49A3A] to-[#1E3A5F]" />
        
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Ngày Giỗ Tổ Tiên & Thân Nhân
            </h1>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              Chu Kỳ Âm Lịch Vạn Niên
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> Tự Động Đồng Bộ Cây Phả Hệ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toàn bộ tiền nhân có ngày mất âm lịch trên Cây Phả Hệ được tự động đưa vào lịch giỗ hàng năm. Hỗ trợ xem theo dòng họ, theo chi, cành.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ngày Giỗ Bổ Sung</span>
        </button>
      </div>

      {/* Filter & View Switcher Bar (Exact Stitch Design) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
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
            Toàn dòng họ ({memorials.length})
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

        {/* Right Search & Month Filter */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px] justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên ngày giỗ, tiền nhân..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-slate-800"
            >
              <option value="ALL">Tất cả 12 tháng ÂL</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Tháng {i + 1} ÂL {i === 0 ? '(Giêng)' : i === 11 ? '(Chạp)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memorial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemorials.length === 0 ? (
          <div className="col-span-2 py-16 text-center bg-white border border-slate-200 rounded-2xl p-6">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy ngày giỗ phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc Chi, Cành hoặc tháng Âm lịch.</p>
          </div>
        ) : (
          filteredMemorials.map((mem) => {
            const member = mockMembers.find((m) => m.id === mem.member_id);
            const branchName = mockBranches.find((b) => b.id === member?.branch_id)?.name || 'Chi Trưởng';
            const genName = mockGenerations.find((g) => g.id === member?.generation_id)?.name || 'Thế hệ tiền bối';
            const is30thDay = mem.lunar_day === 30;
            const isAutoSynced = mem.id.startsWith('auto-mem-');

            return (
              <div
                key={mem.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold shadow-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                            {mem.title}
                          </h2>
                          {isAutoSynced && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              Tự động
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {member?.full_name} • <span className="text-slate-700 font-semibold">{branchName}</span> ({genName})
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200 shadow-xs">
                        Ngày {mem.lunar_day}/{mem.lunar_month} ÂL
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
                      <Calendar className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                      <span>
                        Dương lịch dự kiến: <strong className="text-slate-900 font-bold">{formatDate(mem.next_solar_date)}</strong>
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
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Hệ thống tự động điều chỉnh cúng vào ngày 29 nếu năm thiếu 29 ngày.</span>
                    </div>
                  )}

                  {mem.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-3 border border-slate-100">
                      {mem.notes}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Nhắc tự động: 30 - 15 - 7 - 3 - 1 ngày
                  </span>

                  <div className="flex items-center space-x-2">
                    {member && (
                      <button
                        type="button"
                        onClick={() => setSelectedPrayerMember(member)}
                        className="px-2.5 py-1 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <ScrollText className="w-3.5 h-3.5 text-amber-800" />
                        <span>Văn Khấn</span>
                      </button>
                    )}

                    {!isAutoSynced && (
                      <button
                        onClick={() => handleDelete(mem.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Xóa ngày giỗ thủ công"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <Link
                      to={`/app/members/${mem.member_id}`}
                      className="text-[#166534] hover:text-[#14532d] font-bold flex items-center space-x-1"
                    >
                      <span>Xem thân thế</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateMemorialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
      />

      {selectedPrayerMember && (
        <MemorialPrayerViewerModal
          isOpen={!!selectedPrayerMember}
          onClose={() => setSelectedPrayerMember(null)}
          member={selectedPrayerMember}
          familyName={activeFamily?.name}
        />
      )}
    </div>
  );
};

export default MemorialsPage;
