import React, { useState } from 'react';
import { Search, Filter, Plus, Download, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { mockMembers } from '../services/mockData';
import { Link } from 'react-router-dom';
import { DataImportWizardModal } from '../components/genealogy/DataImportWizardModal';

export const MembersListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const filteredMembers = mockMembers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.first_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh Sách Thành Viên Dòng Họ</h1>
          <p className="text-xs text-slate-500">Quản lý 86 thành viên thuộc các chi phái và thế hệ</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-heritage-green text-xs font-bold rounded-lg transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập Excel / CSV (4 Bước)</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition shadow-sm">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg transition shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thành viên, đời, chi họ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select className="bg-transparent focus:outline-none font-medium">
              <option value="ALL">Tất cả đời</option>
              <option value="1">Đời 1</option>
              <option value="2">Đời 2</option>
              <option value="3">Đời 3</option>
              <option value="4">Đời 4</option>
              <option value="5">Đời 5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Họ Và Tên</th>
                <th className="py-3.5 px-4">Giới Tính</th>
                <th className="py-3.5 px-4">Thế Hệ</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Giỗ (Âm Lịch)</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-heritage-navy">
                        {member.first_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.full_name}</div>
                        <div className="text-[11px] text-slate-400">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {member.gender === 'MALE' ? 'Nam' : 'Nữ'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded">
                      {member.generation_id ? `Đời ${member.generation_id.replace('gen-', '')}` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        member.life_status === 'DECEASED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {member.life_status === 'DECEASED' ? 'Tiền nhân' : 'Còn sống'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {member.death_lunar_day
                      ? `${member.death_lunar_day}/${member.death_lunar_month} Âm Lịch`
                      : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/app/members/${member.id}`}
                      className="text-heritage-green hover:text-heritage-green-light font-semibold inline-flex items-center space-x-1"
                    >
                      <span>Xem hồ sơ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
        onSuccess={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
