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
  ChevronRight,
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../types/database';
import { GenealogyService, FamilyTreeData } from '../services/GenealogyService';
import { GenealogyCanvas } from '../components/genealogy/GenealogyCanvas';
import { AddMemberRelationModal } from '../components/genealogy/AddMemberRelationModal';
import { ExportTreeModal } from '../components/genealogy/ExportTreeModal';
import { DataImportWizardModal } from '../components/genealogy/DataImportWizardModal';
import { Button, Card, Badge, PageHeader, EmptyState } from '../components/ui';

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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Heritage Theme */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-heritage-green via-heritage-gold to-heritage-navy" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-heritage-green shrink-0">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-tight">
                Cây Phả Hệ Trực Quan
              </h1>
              <Badge variant="gold">{treeData.generations.length} Thế Hệ</Badge>
              <Badge variant="success">{treeData.members.length} Nhân Khẩu</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Khám phá cội nguồn, trực quan hóa phả đồ chi phái & kết nối trực hệ dòng tộc
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            icon={<UploadCloud className="w-4 h-4 text-heritage-green" />}
          >
            Nhập Excel / CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            icon={<Printer className="w-4 h-4 text-heritage-gold" />}
          >
            Xuất & In Phả Đồ
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddNewRoot}
            icon={<Plus className="w-4 h-4" />}
          >
            Thêm Thành Viên
          </Button>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc tiểu sử..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('CANVAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'CANVAS'
                ? 'bg-white text-heritage-green shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Cây Phả Hệ Đồ Họa</span>
          </button>

          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'GRID'
                ? 'bg-white text-heritage-green shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Danh Sách Theo Đời</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-heritage-green rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Đang kết nối cơ sở dữ liệu và tải cây phả hệ...</p>
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
              <Card key={gen.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-heritage-green"></span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {gen.name} (Đời thứ {gen.generation_number})
                    </h3>
                  </div>
                  <Badge variant="neutral">{genMembers.length} thành viên</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {genMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-heritage-green/50 hover:bg-white hover:shadow-card transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold shadow-sm">
                            {member.gender === 'MALE' ? '👨' : '👩'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-heritage-green transition-colors">
                              {member.full_name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {member.life_status === 'DECEASED' ? '🕯️ Đã tạ thế' : '🌿 Còn sống'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic">{member.bio}</p>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {treeData.branches.find((b) => b.id === member.branch_id)?.name || 'Chi Trưởng'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddRelation(member, 'CHILD');
                            }}
                            className="px-2 py-1 rounded bg-emerald-50 text-heritage-green hover:bg-emerald-100 text-[11px] font-semibold transition"
                          >
                            + Con
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddRelation(member, 'SPOUSE');
                            }}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold transition"
                          >
                            + Vợ/Chồng
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Member Details Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md h-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col justify-between space-y-5">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shadow-sm">
                    {selectedMember.gender === 'MALE' ? '👨' : '👩'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedMember.full_name}</h3>
                    <p className="text-xs text-heritage-green font-medium">
                      {treeData.generations.find((g) => g.id === selectedMember.generation_id)?.name || 'Thế hệ'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Details */}
              <div className="py-4 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tình trạng nhân khẩu:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedMember.life_status === 'DECEASED' ? '🕯️ Đã tạ thế' : '🌿 Còn sống'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chi phái:</span>
                    <span className="font-semibold text-slate-800">
                      {treeData.branches.find((b) => b.id === selectedMember.branch_id)?.name || 'Chi Trưởng'}
                    </span>
                  </div>
                  {selectedMember.birth_solar_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Năm sinh:</span>
                      <span className="font-semibold text-slate-800">{selectedMember.birth_solar_date.slice(0, 4)}</span>
                    </div>
                  )}
                  {selectedMember.death_lunar_day && selectedMember.death_lunar_month && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ngày Giỗ Tổ (Âm lịch):</span>
                      <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Ngày {selectedMember.death_lunar_day} tháng {selectedMember.death_lunar_month} ÂL
                      </span>
                    </div>
                  )}
                </div>

                {selectedMember.burial_place && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-heritage-green" /> Nơi an táng / Mộ phần:
                    </span>
                    <p className="text-slate-800">{selectedMember.burial_place}</p>
                  </div>
                )}

                {selectedMember.bio && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <FileText className="w-3.5 h-3.5 text-heritage-gold" /> Tiểu sử & Công trạng:
                    </span>
                    <p className="text-slate-800 leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  handleOpenAddRelation(selectedMember, 'CHILD');
                  setSelectedMember(null);
                }}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                + Thêm Con
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  handleOpenAddRelation(selectedMember, 'SPOUSE');
                  setSelectedMember(null);
                }}
                icon={<Heart className="w-3.5 h-3.5 text-rose-500" />}
              >
                + Thêm Vợ/Chồng
              </Button>
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
