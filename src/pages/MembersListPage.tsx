import React, { useState } from 'react';
import { Search, Filter, Plus, Download, FileSpreadsheet, Sparkles, MapPin, Users } from 'lucide-react';
import { mockMembers, mockGenerations, mockBranches, mockFamily } from '../services/mockData';
import { Link } from 'react-router-dom';
import { DataImportWizardModal } from '../components/genealogy/DataImportWizardModal';
import { AddMemberRelationModal } from '../components/genealogy/AddMemberRelationModal';
import { useAuth } from '../contexts/AuthContext';

export const MembersListPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedGenFilter, setSelectedGenFilter] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentFamId = activeFamily?.id || mockFamily.id;
  const familyMembers = mockMembers.filter((m) => m.family_id === currentFamId);
  const familyGenerations = mockGenerations.filter((g) => g.family_id === currentFamId);
  const familyBranches = mockBranches.filter((b) => b.family_id === currentFamId);

  const filteredMembers = familyMembers.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.first_name.toLowerCase().includes(search.toLowerCase());

    const matchesGen =
      selectedGenFilter === 'ALL' ||
      m.generation_id === selectedGenFilter ||
      (m.generation_id && m.generation_id.includes(selectedGenFilter));

    return matchesSearch && matchesGen;
  });

  const getGenerationName = (genId?: string) => {
    const gen = familyGenerations.find((g) => g.id === genId);
    return gen?.name || 'Đời 1';
  };

  const getBranchName = (branchId?: string) => {
    const branch = familyBranches.find((b) => b.id === branchId);
    return branch?.name || 'Chi Trưởng';
  };

  const formatLifeSpan = (m: any) => {
    const birth = m.birth_year || (m.birth_solar_date ? m.birth_solar_date.slice(0, 4) : undefined);
    const death = m.death_year || (m.death_solar_date ? m.death_solar_date.slice(0, 4) : undefined);

    if (birth && death) return `${birth} — ${death}`;
    if (birth) return `Sinh ${birth}`;
    if (death) return `Mất ${death}`;
    return 'Chưa rõ';
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Danh Sách Thành Viên Dòng Họ</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-[#166534] border border-emerald-200 rounded-full font-bold">
              {activeFamily?.name || mockFamily.name}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý {familyMembers.length} thành viên thuộc các chi phái và thế hệ
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập Excel (4 Bước)</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thành viên, đời, chi họ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedGenFilter}
              onChange={(e) => setSelectedGenFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-xs"
            >
              <option value="ALL">Tất cả thế hệ</option>
              {familyGenerations.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Họ Và Tên</th>
                <th className="py-3.5 px-4">Giới Tính</th>
                <th className="py-3.5 px-4">Thế Hệ & Chi Họ</th>
                <th className="py-3.5 px-4">Năm Sinh / Mất</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Giỗ (Âm Lịch)</th>
                <th className="py-3.5 px-4 text-right">Phả Hệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-[#166534]">
                        {member.first_name[0] || 'N'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.full_name}</div>
                        {member.burial_place && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{member.burial_place}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {member.gender === 'MALE' ? '👨 Nam (Đinh)' : '👩 Nữ'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800">{getGenerationName(member.generation_id)}</span>
                      <span className="text-[10px] text-[#166534] font-semibold">{getBranchName(member.branch_id)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {formatLifeSpan(member)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.life_status === 'ALIVE'
                          ? 'bg-emerald-50 text-[#166534] border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {member.life_status === 'ALIVE' ? '🌿 Còn sống' : '🕯️ Đã tạ thế'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-900">
                    {member.death_lunar_day && member.death_lunar_month ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px]">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{member.death_lunar_day}/{member.death_lunar_month} Âm lịch</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/app/genealogy?member=${member.id}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-[#166534] text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Xem Cây Phả
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Import Wizard Modal */}
      <DataImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Add Member Relation Modal */}
      <AddMemberRelationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {}}
        generations={familyGenerations}
        branches={familyBranches}
      />
    </div>
  );
};

export default MembersListPage;
