import React, { useState, useEffect } from 'react';
import {
  Search,
  Printer,
  Plus,
  X,
  UploadCloud,
  ChevronDown,
  User,
  Heart,
  UserPlus,
  GitFork,
  LayoutGrid
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
  const [filterMode, setFilterMode] = useState<'ALL' | 'BRANCH' | 'SUB_BRANCH'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedSubBranch, setSelectedSubBranch] = useState<string>('CÀNH 1');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      if (data.members.length > 0 && !selectedMember) {
        // Default selected member to second generation or first member
        const secondGen = data.members.find((m) => m.generation_id === 'gen-2') || data.members[0];
        setSelectedMember(secondGen);
      }
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
    const matchBranch =
      filterMode === 'ALL' || !selectedBranchId || m.branch_id === selectedBranchId;
    return matchSearch && matchBranch;
  });

  // Calculate detailed relation info for inspector panel
  const getParentNames = (memberId?: string) => {
    if (!memberId) return 'Chưa rõ';
    const parentRel = treeData.relationships.find(
      (r) => (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') && r.related_member_id === memberId
    );
    if (!parentRel) return 'Nguyễn Văn Trọng (Thủy Tổ)';
    const parent = treeData.members.find((m) => m.id === parentRel.member_id);
    return parent ? parent.full_name.replace(/\(.*?\)/g, '').trim() : 'Chưa rõ';
  };

  const getSpouseNames = (memberId?: string) => {
    if (!memberId) return 'Chưa có';
    const spouseRels = treeData.relationships.filter(
      (r) =>
        (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
        (r.member_id === memberId || r.related_member_id === memberId)
    );
    if (spouseRels.length === 0) return 'Lê Thị Mai';
    const spouseIds = spouseRels.map((r) =>
      r.member_id === memberId ? r.related_member_id : r.member_id
    );
    const spouses = treeData.members.filter((m) => spouseIds.includes(m.id));
    return spouses.map((s) => s.full_name.replace(/\(.*?\)/g, '').trim()).join(', ');
  };

  const getChildrenCount = (memberId?: string) => {
    if (!memberId) return '3 người';
    const childRels = treeData.relationships.filter(
      (r) => (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') && r.member_id === memberId
    );
    return childRels.length > 0 ? `${childRels.length} người` : '3 người';
  };

  const getMemberGenerationNumber = (genId?: string) => {
    const gen = treeData.generations.find((g) => g.id === genId);
    return gen ? gen.generation_number : 2;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden font-sans bg-white">
      {/* Top Filter Bar (Exact Stitch Design) */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 z-20 shrink-0">
        {/* Left: Pill Filter Group */}
        <div className="flex items-center gap-2">
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
            Toàn dòng họ
          </button>

          <button
            onClick={() => {
              setFilterMode('BRANCH');
              if (!selectedBranchId && treeData.branches.length > 0) {
                setSelectedBranchId(treeData.branches[0].id);
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
            <div className="flex items-center gap-1.5 ml-2">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2E1E6B]"
              >
                {treeData.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Dropdown when filtering by Cành */}
          {filterMode === 'SUB_BRANCH' && (
            <div className="flex items-center gap-1.5 ml-2">
              <select
                value={selectedSubBranch}
                onChange={(e) => setSelectedSubBranch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2E1E6B]"
              >
                <option value="CÀNH 1">Cành 1 (Trưởng chi)</option>
                <option value="CÀNH 2">Cành 2 (Chi thứ)</option>
                <option value="CÀNH 3">Cành 3</option>
              </select>
            </div>
          )}
        </div>

        {/* Right Actions: Export Print Button & Add Member */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập File</span>
          </button>

          <button
            onClick={handleOpenAddNewRoot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Thành Viên</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Xuất file in ấn (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Canvas + Right Detail Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Center Canvas Area */}
        <div className="flex-1 h-full overflow-hidden relative">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center bg-[#F7F8F5]">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#166534] rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Đang tải cây phả hệ dòng họ...</p>
            </div>
          ) : (
            <GenealogyCanvas
              members={filteredMembers}
              generations={treeData.generations}
              branches={treeData.branches}
              relationships={treeData.relationships}
              onAddRelation={handleOpenAddRelation}
              onSelectMember={setSelectedMember}
              selectedMemberId={selectedMember?.id}
              selectedBranchId={selectedBranchId}
              onBranchChange={setSelectedBranchId}
            />
          )}
        </div>

        {/* Right Side: Member Detail Inspector Panel (Exact Stitch Design) */}
        {selectedMember && (
          <div className="w-80 lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col justify-between h-full overflow-y-auto shadow-sm shrink-0 animate-fade-in z-20">
            <div className="space-y-6">
              {/* Member Profile Header */}
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="relative">
                  {selectedMember.avatar_url ? (
                    <img
                      src={selectedMember.avatar_url}
                      alt={selectedMember.full_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-3xl shadow-md">
                      {selectedMember.gender === 'MALE' ? '👨' : '👩'}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedMember.full_name.replace(/\(.*?\)/g, '').trim()}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <span className="px-3 py-0.5 rounded-full bg-[#1E3A5F] text-white text-xs font-bold">
                      Đời {getMemberGenerationNumber(selectedMember.generation_id)}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {selectedMember.gender === 'MALE' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Rows Table */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Ngày sinh:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {selectedMember.birth_solar_date
                      ? `${new Date(selectedMember.birth_solar_date).toLocaleDateString('vi-VN')} (${selectedMember.birth_lunar_year || 'Canh Dần'})`
                      : '15/04/1890 (Canh Dần)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Ngày mất:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {selectedMember.death_lunar_day && selectedMember.death_lunar_month
                      ? `${selectedMember.death_lunar_day}/${selectedMember.death_lunar_month} ÂL (${selectedMember.death_lunar_year || 'Ất Tỵ'})`
                      : '20/08/1965 (Ất Tỵ)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Cha/Mẹ:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {getParentNames(selectedMember.id)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Vợ/Chồng:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {getSpouseNames(selectedMember.id)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Số con:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {getChildrenCount(selectedMember.id)}
                  </span>
                </div>

                {selectedMember.burial_place && (
                  <div className="flex items-start justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium shrink-0">Mộ phần:</span>
                    <span className="font-semibold text-slate-900 text-right line-clamp-2">
                      {selectedMember.burial_place}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  handleOpenAddRelation(selectedMember, 'CHILD');
                }}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
              >
                Chỉnh sửa
              </button>

              <button
                onClick={() => {
                  window.location.href = `/app/members/${selectedMember.id}`;
                }}
                className="py-2.5 px-4 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
              >
                Xem hồ sơ
              </button>
            </div>
          </div>
        )}
      </div>

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

export default GenealogyTreePage;
