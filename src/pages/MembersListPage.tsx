import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Sparkles,
  MapPin,
  Users,
  ArrowRightLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  X,
  Save,
  BookOpen,
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../types/database';
import { GenealogyService } from '../services/GenealogyService';
import { Link } from 'react-router-dom';
import { DataImportWizardModal } from '../components/genealogy/DataImportWizardModal';
import { AddMemberRelationModal } from '../components/genealogy/AddMemberRelationModal';
import { useAuth } from '../contexts/AuthContext';

export const MembersListPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [selectedGenFilter, setSelectedGenFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [familyGenerations, setFamilyGenerations] = useState<Generation[]>([]);
  const [familyBranches, setFamilyBranches] = useState<Branch[]>([]);
  const [familyRelationships, setFamilyRelationships] = useState<MemberRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for Detail & Edit
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    life_status: 'ALIVE' | 'DECEASED';
    birth_solar_date: string;
    death_solar_date: string;
    death_lunar_day: string;
    death_lunar_month: string;
    death_lunar_year: string;
    burial_place: string;
    courtesy_name: string;
    religious_name: string;
    bio: string;
  }>({
    full_name: '',
    gender: 'MALE',
    life_status: 'ALIVE',
    birth_solar_date: '',
    death_solar_date: '',
    death_lunar_day: '',
    death_lunar_month: '',
    death_lunar_year: '',
    burial_place: '',
    courtesy_name: '',
    religious_name: '',
    bio: '',
  });

  const currentFamId = activeFamily?.id || '';

  const loadData = useCallback(async () => {
    if (!currentFamId) {
      setFamilyMembers([]);
      setFamilyGenerations([]);
      setFamilyBranches([]);
      setFamilyRelationships([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const tree = await GenealogyService.getFamilyTree(currentFamId);
      setFamilyMembers(tree.members || []);
      setFamilyGenerations(tree.generations || []);
      setFamilyBranches(tree.branches || []);
      setFamilyRelationships(tree.relationships || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành viên:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBranchFilter, selectedGenFilter, selectedStatusFilter, selectedGenderFilter, pageSize]);

  const filteredMembers = useMemo(() => {
    return familyMembers.filter((m) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.full_name.toLowerCase().includes(q) ||
        m.first_name.toLowerCase().includes(q) ||
        (m.courtesy_name && m.courtesy_name.toLowerCase().includes(q)) ||
        (m.religious_name && m.religious_name.toLowerCase().includes(q)) ||
        (m.birth_time && m.birth_time.toLowerCase().includes(q)) ||
        (m.death_time && m.death_time.toLowerCase().includes(q)) ||
        (m.burial_place && m.burial_place.toLowerCase().includes(q)) ||
        (m.bio && m.bio.toLowerCase().includes(q));

      const matchesGen =
        selectedGenFilter === 'ALL' ||
        m.generation_id === selectedGenFilter ||
        (m.generation_id && m.generation_id.includes(selectedGenFilter));

      const matchesBranch =
        selectedBranchFilter === 'ALL' ||
        m.branch_id === selectedBranchFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        m.life_status === selectedStatusFilter;

      const matchesGender =
        selectedGenderFilter === 'ALL' ||
        m.gender === selectedGenderFilter;

      return matchesSearch && matchesGen && matchesBranch && matchesStatus && matchesGender;
    });
  }, [familyMembers, search, selectedGenFilter, selectedBranchFilter, selectedStatusFilter, selectedGenderFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const getGenerationName = (genId?: string) => {
    const gen = familyGenerations.find((g) => g.id === genId);
    return gen?.name || 'Đời 1';
  };

  const getBranchName = (branchId?: string) => {
    const branch = familyBranches.find((b) => b.id === branchId);
    return branch?.name || 'Tiền nhân Khởi tổ';
  };

  const formatLifeSpan = (m: any) => {
    const birth = m.birth_year || (m.birth_solar_date ? m.birth_solar_date.slice(0, 4) : undefined);
    const death = m.death_year || (m.death_solar_date ? m.death_solar_date.slice(0, 4) : undefined);

    if (birth && death) return `${birth} — ${death}`;
    if (birth) return `Sinh ${birth}`;
    if (death) return `Mất ${death}`;
    return 'Chưa rõ';
  };

  const handleOpenEdit = (m: Member) => {
    setEditMember(m);
    setEditForm({
      full_name: m.full_name || '',
      gender: m.gender || 'MALE',
      life_status: m.life_status || 'ALIVE',
      birth_solar_date: m.birth_solar_date ? m.birth_solar_date.slice(0, 10) : '',
      death_solar_date: m.death_solar_date ? m.death_solar_date.slice(0, 10) : '',
      death_lunar_day: m.death_lunar_day ? String(m.death_lunar_day) : '',
      death_lunar_month: m.death_lunar_month ? String(m.death_lunar_month) : '',
      death_lunar_year: m.death_lunar_year ? String(m.death_lunar_year) : '',
      burial_place: m.burial_place || '',
      courtesy_name: m.courtesy_name || '',
      religious_name: m.religious_name || '',
      bio: m.bio || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    setIsSavingEdit(true);
    try {
      const updates: Partial<Member> = {
        full_name: editForm.full_name.trim(),
        gender: editForm.gender,
        life_status: editForm.life_status,
        birth_solar_date: editForm.birth_solar_date || undefined,
        death_solar_date: editForm.death_solar_date || undefined,
        death_lunar_day: editForm.death_lunar_day ? parseInt(editForm.death_lunar_day, 10) : undefined,
        death_lunar_month: editForm.death_lunar_month ? parseInt(editForm.death_lunar_month, 10) : undefined,
        death_lunar_year: editForm.death_lunar_year ? parseInt(editForm.death_lunar_year, 10) : undefined,
        burial_place: editForm.burial_place.trim() || undefined,
        courtesy_name: editForm.courtesy_name.trim() || undefined,
        religious_name: editForm.religious_name.trim() || undefined,
        bio: editForm.bio.trim() || undefined,
      };

      const res = await GenealogyService.updateMember(editMember.id, updates);
      if (res.success) {
        setEditMember(null);
        if (detailMember && detailMember.id === editMember.id) {
          setDetailMember({ ...detailMember, ...updates });
        }
        await loadData();
      } else {
        alert(`Không thể cập nhật thành viên: ${res.error || 'Lỗi không xác định'}`);
      }
    } catch (err: any) {
      alert(`Lỗi khi lưu: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Họ và Tên', 'Giới Tính', 'Thế Hệ', 'Chi Phái', 'Trạng Thái', 'Năm Sinh', 'Năm Mất', 'Ngày Giỗ Âm', 'Nơi An Táng', 'Ghi Chú/Tiểu Sử'];
    const rows = filteredMembers.map((m) => [
      `"${m.full_name.replace(/"/g, '""')}"`,
      m.gender === 'MALE' ? 'Nam' : 'Nữ',
      getGenerationName(m.generation_id),
      getBranchName(m.branch_id),
      m.life_status === 'ALIVE' ? 'Còn sống' : 'Đã mất',
      m.birth_solar_date || '',
      m.death_solar_date || '',
      m.death_lunar_day && m.death_lunar_month ? `${m.death_lunar_day}/${m.death_lunar_month}` : '',
      `"${(m.burial_place || '').replace(/"/g, '""')}"`,
      `"${(m.bio || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_thanh_vien_${activeFamily?.code || 'gia_toc'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFilterActive =
    search !== '' ||
    selectedBranchFilter !== 'ALL' ||
    selectedGenFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL' ||
    selectedGenderFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setSelectedBranchFilter('ALL');
    setSelectedGenFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSelectedGenderFilter('ALL');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            <span>Danh Sách Thành Viên Dòng Họ</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold">
              {activeFamily?.name || 'Trịnh Lưu Gia Tộc'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý {familyMembers.length} thành viên thuộc 17 thế hệ và 4 chi phái ({activeFamily?.origin_province || 'Thanh Hoá'})
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <Link
            to="/app/genealogy"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition shadow-2xs border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Xem Cây Phả Hệ</span>
          </Link>
          <Link
            to="/app/kinship"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition shadow-2xs border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Tra Cứu Xưng Hô</span>
          </Link>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer"
            title="Xuất bảng Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Nạp Excel</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Multi-dimensional Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, tự hiệu, nơi an táng, ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#166534] transition"
            />
          </div>

          {/* Chi Phái Filter */}
          <div>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="ALL">Tất cả chi phái (4 chi)</option>
              {familyBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Thế Hệ Filter */}
          <div>
            <select
              value={selectedGenFilter}
              onChange={(e) => setSelectedGenFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="ALL">Tất cả thế hệ (Đời 1-17)</option>
              {familyGenerations.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng Thái & Giới Tính Filter */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="ALL">Trạng thái</option>
              <option value="ALIVE">🌿 Còn sống</option>
              <option value="DECEASED">🕯️ Đã mất</option>
            </select>

            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="ALL">Giới tính</option>
              <option value="MALE">👨 Nam (Đinh)</option>
              <option value="FEMALE">👩 Nữ</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Reset Button */}
        {isFilterActive && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Kết quả lọc: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{filteredMembers.length}</strong> / {familyMembers.length} thành viên
            </div>
            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Họ Và Tên</th>
                <th className="py-3.5 px-4">Giới Tính</th>
                <th className="py-3.5 px-4">Thế Hệ & Chi Họ</th>
                <th className="py-3.5 px-4">Năm Sinh / Mất</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Giỗ (Âm Lịch)</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách thành viên...
                  </td>
                </tr>
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy thành viên nào khớp với bộ lọc
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => setDetailMember(member)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center font-bold text-[#166534] dark:text-emerald-300 shrink-0">
                          {member.first_name[0] || member.full_name[0] || 'T'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition flex items-center gap-1.5">
                            <span>{member.full_name}</span>
                            {member.courtesy_name && (
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">
                                ({member.courtesy_name})
                              </span>
                            )}
                          </div>
                          {member.burial_place && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{member.burial_place}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium dark:text-slate-300">
                      {member.gender === 'MALE' ? '👨 Nam (Đinh)' : '👩 Nữ'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {getGenerationName(member.generation_id)}
                        </span>
                        <span className="text-[10px] text-[#166534] dark:text-emerald-400 font-semibold truncate max-w-[150px]">
                          {getBranchName(member.branch_id)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {formatLifeSpan(member)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.life_status === 'ALIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {member.life_status === 'ALIVE' ? '🌿 Còn sống' : '🕯️ Đã tạ thế'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-900 dark:text-amber-300">
                      {member.death_lunar_day && member.death_lunar_month ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>
                            {member.death_lunar_day}/{member.death_lunar_month} Âm lịch
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setDetailMember(member)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#166534] dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                          title="Xem chi tiết 360°"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-700 dark:hover:text-amber-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/app/genealogy?member=${member.id}`}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#166534] dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition"
                        >
                          Cây Phả
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value={15}>15 dòng</option>
              <option value={25}>25 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
              <option value={9999}>Tất cả</option>
            </select>
            <span>
              (<strong>{filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
              <strong>{Math.min(currentPage * pageSize, filteredMembers.length)}</strong> trên{' '}
              <strong>{filteredMembers.length}</strong> thành viên)
            </span>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        currentPage === p
                          ? 'bg-[#166534] dark:bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 360° Member Detail Modal */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent dark:from-emerald-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-xl font-black text-[#166534] dark:text-emerald-300">
                  {detailMember.first_name[0] || detailMember.full_name[0] || 'T'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{detailMember.full_name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        detailMember.life_status === 'ALIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {detailMember.life_status === 'ALIVE' ? 'Còn sống' : 'Đã mất'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getGenerationName(detailMember.generation_id)} • {getBranchName(detailMember.branch_id)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailMember(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">Giới tính:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {detailMember.gender === 'MALE' ? '👨 Nam (Đinh)' : '👩 Nữ'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">Niên đại:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {formatLifeSpan(detailMember)}
                  </span>
                </div>
              </div>

              {detailMember.courtesy_name && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800">
                  <span className="text-amber-800 dark:text-amber-300 font-bold block mb-0.5">Tên Tự / Hiệu / Bí danh:</span>
                  <span className="text-slate-800 dark:text-slate-200">{detailMember.courtesy_name}</span>
                </div>
              )}

              {/* Lễ Giỗ Âm Lịch */}
              {detailMember.death_lunar_day && detailMember.death_lunar_month && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">
                      Ngày Giỗ Hàng Năm (Âm Lịch): Ngày {detailMember.death_lunar_day} tháng {detailMember.death_lunar_month}
                    </span>
                    {detailMember.death_lunar_year && (
                      <span className="text-[11px] text-amber-700 dark:text-amber-300">
                        Năm tạ thế: {detailMember.death_lunar_year}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mộ Phần */}
              {detailMember.burial_place && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block mb-0.5">Nơi An Táng / Mộ Phần:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{detailMember.burial_place}</span>
                  </div>
                </div>
              )}

              {/* Ghi Chú & Tiểu Sử */}
              {detailMember.bio && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tiểu Sử & Sự Nghiệp:</span>
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {detailMember.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                to={`/app/genealogy?member=${detailMember.id}`}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Định Vị Trên Cây</span>
              </Link>
              <button
                onClick={() => {
                  const m = detailMember;
                  setDetailMember(null);
                  handleOpenEdit(m);
                }}
                className="px-4 py-2 bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh Sửa Thông Tin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-amber-500/10 to-transparent dark:from-amber-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Chỉnh Sửa Thành Viên</span>
              </h2>
              <button
                onClick={() => setEditMember(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Họ và Tên */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Họ Và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              {/* Giới Tính & Trạng Thái */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Giới Tính</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  >
                    <option value="MALE">👨 Nam (Đinh)</option>
                    <option value="FEMALE">👩 Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Trạng Thái</label>
                  <select
                    value={editForm.life_status}
                    onChange={(e) => setEditForm({ ...editForm, life_status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  >
                    <option value="ALIVE">🌿 Còn sống</option>
                    <option value="DECEASED">🕯️ Đã tạ thế</option>
                  </select>
                </div>
              </div>

              {/* Ngày sinh Dương lịch */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Ngày / Năm Sinh (Dương lịch)</label>
                <input
                  type="date"
                  value={editForm.birth_solar_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_solar_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              {/* Nếu đã mất: Ngày Giỗ Âm lịch */}
              {editForm.life_status === 'DECEASED' && (
                <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <label className="block text-amber-900 dark:text-amber-200 font-bold">
                    Ngày Giỗ (Âm Lịch) & Năm Mất
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="Ngày (1-30)"
                        value={editForm.death_lunar_day}
                        onChange={(e) => setEditForm({ ...editForm, death_lunar_day: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-medium text-xs text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Tháng (1-12)"
                        value={editForm.death_lunar_month}
                        onChange={(e) => setEditForm({ ...editForm, death_lunar_month: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-medium text-xs text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Năm mất"
                        value={editForm.death_lunar_year}
                        onChange={(e) => setEditForm({ ...editForm, death_lunar_year: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-medium text-xs text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mộ Phần & An Táng */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nơi An Táng / Mộ Phần</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xứ Ninh, ruộng Hương Hỏa..."
                  value={editForm.burial_place}
                  onChange={(e) => setEditForm({ ...editForm, burial_place: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              {/* Tên Tự / Hiệu */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tên Tự / Hiệu / Bí Danh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kim Hạm, Chu Cấp, Quang..."
                  value={editForm.courtesy_name}
                  onChange={(e) => setEditForm({ ...editForm, courtesy_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              {/* Ghi chú / Tiểu sử */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Ghi Chú & Tiểu Sử</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú thêm về thành viên..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Import Wizard Modal */}
      <DataImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Add Member Relation Modal */}
      <AddMemberRelationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        generations={familyGenerations}
        branches={familyBranches}
      />
    </div>
  );
};

export default MembersListPage;
