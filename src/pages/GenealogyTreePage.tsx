import React, { useState, useEffect } from 'react';
import {
  Plus,
  UploadCloud,
  Printer,
  Sparkles,
  Search,
  LayoutGrid,
  GitFork,
  X,
  Heart,
  UserPlus,
  Calendar,
  MapPin,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../types/database';
import { GenealogyService, FamilyTreeData } from '../services/GenealogyService';
import { GenealogyCanvas } from '../components/genealogy/GenealogyCanvas';
import { AddMemberRelationModal } from '../components/genealogy/AddMemberRelationModal';
import { ExportTreeModal } from '../components/genealogy/ExportTreeModal';
import { DataImportWizardModal } from '../components/genealogy/DataImportWizardModal';

export const GenealogyTreePage: React.FC = () => {
  const [treeData, setTreeData] = useState<FamilyTreeData>({
    members: [],
    generations: [],
    branches: [],
    relationships: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'CANVAS' | 'GRID'>('CANVAS');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [relationTarget, setRelationTarget] = useState<Member | null>(null);
  const [initialRelationType, setInitialRelationType] = useState<'CHILD' | 'SPOUSE' | 'PARENT'>('CHILD');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const loadTree = async () => {
    setLoading(true);
    try {
      const data = await GenealogyService.getFamilyTree();
      setTreeData(data);
    } catch (err) {
      console.error('Lỗi khi tải cây phả hệ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const handleOpenAddRelation = (target: Member, relType: 'CHILD' | 'SPOUSE' | 'PARENT') => {
    setRelationTarget(target);
    setInitialRelationType(relType);
    setIsAddModalOpen(true);
  };

  const handleOpenAddNewRoot = () => {
    setRelationTarget(null);
    setInitialRelationType('CHILD');
    setIsAddModalOpen(true);
  };

  // Filter members based on search and branch
  const filteredMembers = treeData.members.filter((m) => {
    const matchSearch =
      !searchQuery.trim() ||
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchBranch = !selectedBranchId || m.branch_id === selectedBranchId;
    return matchSearch && matchBranch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>Cây Phả Hệ Tương Tác</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold">
                {treeData.generations.length} Thế Hệ
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold">
                {treeData.members.length} Nhân Khẩu
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Khám phá cội nguồn, trực quan hóa phả đồ chi phái & kết nối trực hệ dòng tộc
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Nhập Excel / CSV</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Xuất & In Phả Đồ</span>
          </button>

          <button
            onClick={handleOpenAddNewRoot}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc tiểu sử thành viên..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setViewMode('CANVAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'CANVAS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Cây Phả Hệ Đồ Họa</span>
          </button>

          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'GRID'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Danh Sách Theo Đời</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 mt-4">Đang kết nối cơ sở dữ liệu và tải cây phả hệ...</p>
        </div>
      ) : viewMode === 'CANVAS' ? (
        <GenealogyCanvas
          members={filteredMembers}
          generations={treeData.generations}
          branches={treeData.branches}
          relationships={treeData.relationships}
          onAddRelation={handleOpenAddRelation}
          onSelectMember={setSelectedMember}
          selectedBranchId={selectedBranchId}
          onBranchChange={setSelectedBranchId}
        />
      ) : (
        /* Grid by Generation View */
        <div className="space-y-6">
          {treeData.generations.map((gen) => {
            const genMembers = filteredMembers.filter((m) => m.generation_id === gen.id);
            return (
              <div key={gen.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                      {gen.name} (Đời thứ {gen.generation_number})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{genMembers.length} thành viên</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {genMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold">
                            {member.gender === 'MALE' ? '👨' : '👩'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                              {member.full_name}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {member.life_status === 'DECEASED' ? '🕯️ Đã mất' : '🌿 Còn sống'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-slate-400 line-clamp-2 italic">{member.bio}</p>
                      )}

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          {treeData.branches.find((b) => b.id === member.branch_id)?.name || 'Chi Trưởng'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddRelation(member, 'CHILD');
                            }}
                            className="p-1 rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-medium"
                          >
                            + Con
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddRelation(member, 'SPOUSE');
                            }}
                            className="p-1 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[11px] font-medium"
                          >
                            + Vợ/Chồng
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Details Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md h-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col justify-between space-y-5">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
                    {selectedMember.gender === 'MALE' ? '👨' : '👩'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedMember.full_name}</h3>
                    <p className="text-xs text-amber-400">
                      {treeData.generations.find((g) => g.id === selectedMember.generation_id)?.name || 'Thế hệ'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Details */}
              <div className="py-4 space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tình trạng nhân khẩu:</span>
                    <span className="font-semibold text-slate-200">
                      {selectedMember.life_status === 'DECEASED' ? '🕯️ Đã tạ thế' : '🌿 Còn sống'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Chi phái:</span>
                    <span className="font-semibold text-slate-200">
                      {treeData.branches.find((b) => b.id === selectedMember.branch_id)?.name || 'Chi Trưởng'}
                    </span>
                  </div>
                  {selectedMember.birth_solar_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Năm sinh:</span>
                      <span className="font-semibold text-slate-200">{selectedMember.birth_solar_date.slice(0, 4)}</span>
                    </div>
                  )}
                  {selectedMember.death_lunar_day && selectedMember.death_lunar_month && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Ngày Giỗ Tổ (Âm lịch):</span>
                      <span className="font-semibold text-amber-300">
                        Ngày {selectedMember.death_lunar_day} tháng {selectedMember.death_lunar_month} ÂL
                      </span>
                    </div>
                  )}
                </div>

                {selectedMember.burial_place && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Nơi an táng / Mộ phần:
                    </span>
                    <p className="text-slate-200">{selectedMember.burial_place}</p>
                  </div>
                )}

                {selectedMember.bio && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <FileText className="w-3.5 h-3.5 text-amber-400" /> Tiểu sử & Công trạng:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  handleOpenAddRelation(selectedMember, 'CHILD');
                  setSelectedMember(null);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm Con</span>
              </button>

              <button
                onClick={() => {
                  handleOpenAddRelation(selectedMember, 'SPOUSE');
                  setSelectedMember(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>+ Thêm Vợ/Chồng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddMemberRelationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadTree}
        targetMember={relationTarget}
        initialRelationType={initialRelationType}
        generations={treeData.generations}
        branches={treeData.branches}
      />

      <ExportTreeModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        members={treeData.members}
        generations={treeData.generations}
        branches={treeData.branches}
        relationships={treeData.relationships}
      />

      <DataImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadTree}
      />
    </div>
  );
};
