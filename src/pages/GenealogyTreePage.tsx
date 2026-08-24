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
  LayoutGrid,
  ArrowRightLeft,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../types/database';
import { GenealogyService, FamilyTreeData } from '../services/GenealogyService';
import { GenealogyCanvas } from '../components/genealogy/GenealogyCanvas';
import { AddMemberRelationModal } from '../components/genealogy/AddMemberRelationModal';
import { ExportTreeModal } from '../components/genealogy/ExportTreeModal';
import { DataImportWizardModal } from '../components/genealogy/DataImportWizardModal';
import { KinshipCalculatorModal } from '../components/genealogy/KinshipCalculatorModal';
import { MemberDetailPopupModal } from '../components/genealogy/MemberDetailPopupModal';
import { Link } from 'react-router-dom';

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
  const [isKinshipModalOpen, setIsKinshipModalOpen] = useState(false);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
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

  // Open detail popup when member card is clicked
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsDetailPopupOpen(true);
  };

  // Open kinship calculator with member
  const handleOpenKinshipForMember = (member: Member) => {
    setSelectedMember(member);
    setIsKinshipModalOpen(true);
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden font-sans bg-white">
      {/* Top Filter & Actions Bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-20 shrink-0">
        {/* Left: Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterMode('ALL');
              setSelectedBranchId('');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toàn Dòng Họ
          </button>

          <button
            onClick={() => {
              setFilterMode('BRANCH');
              if (!selectedBranchId && treeData.branches.length > 0) {
                setSelectedBranchId(treeData.branches[0].id);
              }
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'BRANCH'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Theo Chi
          </button>

          <button
            onClick={() => setFilterMode('SUB_BRANCH')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'SUB_BRANCH'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Theo Cành
          </button>

          {/* Conditional Dropdown when filtering by Chi */}
          {filterMode === 'BRANCH' && (
            <div className="flex items-center gap-1.5 ml-1">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#166534]"
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
            <div className="flex items-center gap-1.5 ml-1">
              <select
                value={selectedSubBranch}
                onChange={(e) => setSelectedSubBranch(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 font-bold focus:outline-none focus:border-[#166534]"
              >
                <option value="CÀNH 1">Cành 1 (Trưởng chi)</option>
                <option value="CÀNH 2">Cành 2 (Chi thứ)</option>
                <option value="CÀNH 3">Cành 3</option>
              </select>
            </div>
          )}
        </div>

        {/* Right Actions: Export Print Button & Add Member */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhập File</span>
          </button>

          <button
            onClick={handleOpenAddNewRoot}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer border border-slate-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Thành Viên</span>
          </button>

          <Link
            to="/app/kinship"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition border border-amber-300 shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-800" />
            <span>Tra Cứu Xưng Hô</span>
          </Link>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Ấn & Xuất File (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Canvas Area (100% Width) */}
      <div className="flex-1 w-full h-full overflow-hidden relative">
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
            onSelectMember={handleSelectMember}
            selectedMemberId={selectedMember?.id}
            selectedBranchId={selectedBranchId}
            onBranchChange={setSelectedBranchId}
          />
        )}
      </div>

      {/* Member Detail Popup Modal */}
      <MemberDetailPopupModal
        isOpen={isDetailPopupOpen}
        onClose={() => setIsDetailPopupOpen(false)}
        member={selectedMember}
        generations={treeData.generations}
        branches={treeData.branches}
        relationships={treeData.relationships}
        allMembers={treeData.members}
        onOpenKinship={handleOpenKinshipForMember}
        onOpenAddRelation={handleOpenAddRelation}
        onSelectAnotherMember={(anotherMember) => {
          setSelectedMember(anotherMember);
        }}
      />

      {/* Add Member Relation Modal */}
      <AddMemberRelationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadTree}
        targetMember={relationTarget}
        initialRelationType={initialRelationType}
        generations={treeData.generations}
        branches={treeData.branches}
      />

      {/* Export & Print Modal */}
      <ExportTreeModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        members={treeData.members}
        generations={treeData.generations}
        branches={treeData.branches}
        relationships={treeData.relationships}
      />

      {/* Data Import Wizard Modal */}
      <DataImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadTree}
      />

      {/* Tra Cứu Danh Xưng Kinship Modal */}
      <KinshipCalculatorModal
        isOpen={isKinshipModalOpen}
        onClose={() => setIsKinshipModalOpen(false)}
        initialMemberBId={selectedMember?.id}
      />
    </div>
  );
};

export default GenealogyTreePage;
