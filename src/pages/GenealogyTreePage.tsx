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

import { filterLineageTree } from '../utils/lineageHierarchy';
import { useAuth } from '../contexts/AuthContext';

export const GenealogyTreePage: React.FC = () => {
  const { activeFamily, isFamilyAdmin } = useAuth();
  const [treeData, setTreeData] = useState<FamilyTreeData>({
    members: [],
    generations: [],
    branches: [],
    relationships: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHI' | 'CANH' | 'NHANH'>('ALL');
  const [selectedChiId, setSelectedChiId] = useState<string>('');
  const [selectedCanh, setSelectedCanh] = useState<string>('Cành 1');
  const [selectedNhanh, setSelectedNhanh] = useState<string>('Nhánh 1');
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
    if (!activeFamily?.id) {
      setTreeData({ members: [], generations: [], branches: [], relationships: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await GenealogyService.getFamilyTree(activeFamily.id);
      setTreeData(data);
    } catch (err) {
      console.error('Lỗi khi tải cây phả hệ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [activeFamily?.id]);

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

  // Filter members based on traditional lineage hierarchy (Thủy Tổ -> Chi -> Cành -> Nhánh) & Search
  const hierarchyFilteredMembers = filterLineageTree(
    treeData.members,
    treeData.generations,
    treeData.branches,
    {
      mode: filterMode,
      selectedChiId: selectedChiId || undefined,
      selectedCanh: filterMode === 'CANH' ? selectedCanh : undefined,
      selectedNhanh: filterMode === 'NHANH' ? selectedNhanh : undefined,
    }
  );

  const filteredMembers = hierarchyFilteredMembers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      (m.courtesy_name && m.courtesy_name.toLowerCase().includes(q)) ||
      (m.religious_name && m.religious_name.toLowerCase().includes(q)) ||
      (m.birth_time && m.birth_time.toLowerCase().includes(q)) ||
      (m.death_time && m.death_time.toLowerCase().includes(q)) ||
      (m.burial_place && m.burial_place.toLowerCase().includes(q)) ||
      (m.bio && m.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden font-sans bg-slate-50 dark:bg-slate-950">
      {/* Top Filter & Actions Bar */}
      <div className="px-3 sm:px-6 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 z-20 shrink-0 overflow-x-auto no-scrollbar min-h-[52px]">
        {/* Left: Traditional Lineage Hierarchy Segmented Filter & Search */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented Filter Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
            <button
              onClick={() => {
                setFilterMode('ALL');
                setSelectedChiId('');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                filterMode === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-[#166534] dark:text-emerald-400 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>🌳 Toàn Họ</span>
            </button>

            <button
              onClick={() => {
                setFilterMode('CHI');
                if (!selectedChiId && treeData.branches.length > 0) {
                  setSelectedChiId(treeData.branches[0].id);
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                filterMode === 'CHI'
                  ? 'bg-white dark:bg-slate-900 text-[#166534] dark:text-emerald-400 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>🌿 Theo Chi</span>
            </button>

            <button
              onClick={() => {
                setFilterMode('CANH');
                if (!selectedChiId && treeData.branches.length > 0) {
                  setSelectedChiId(treeData.branches[0].id);
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                filterMode === 'CANH'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-400 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>🌱 Theo Cành</span>
            </button>

            <button
              onClick={() => {
                setFilterMode('NHANH');
                if (!selectedChiId && treeData.branches.length > 0) {
                  setSelectedChiId(treeData.branches[0].id);
                }
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                filterMode === 'NHANH'
                  ? 'bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-400 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>🍃 Theo Nhánh</span>
            </button>
          </div>

          {/* Conditional Dropdown when filtering by Chi */}
          {(filterMode === 'CHI' || filterMode === 'CANH' || filterMode === 'NHANH') && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={selectedChiId}
                onChange={(e) => setSelectedChiId(e.target.value)}
                className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-[#166534] dark:text-emerald-300 font-bold focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer max-w-[150px] truncate"
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
          {filterMode === 'CANH' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={selectedCanh}
                onChange={(e) => setSelectedCanh(e.target.value)}
                className="px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 rounded-xl text-xs text-teal-900 dark:text-teal-300 font-bold focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer"
              >
                <option value="Cành 1">Cành 1 (Trưởng Chi)</option>
                <option value="Cành 2">Cành 2 (Thứ)</option>
                <option value="Cành 3">Cành 3</option>
              </select>
            </div>
          )}

          {/* Conditional Dropdown when filtering by Nhánh */}
          {filterMode === 'NHANH' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={selectedNhanh}
                onChange={(e) => setSelectedNhanh(e.target.value)}
                className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-700 cursor-pointer"
              >
                <option value="Nhánh 1">Nhánh 1</option>
                <option value="Nhánh 2">Nhánh 2</option>
                <option value="Nhánh 3">Nhánh 3</option>
              </select>
            </div>
          )}

          {/* Search Member Input */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, Húy..."
              className="pl-7 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#166534] w-28 sm:w-40 md:w-52"
            />
          </div>
        </div>

        {/* Right Actions: Export Print Button & Add Member */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isFamilyAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer shrink-0"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Nhập File</span>
              </button>

              <button
                onClick={handleOpenAddNewRoot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition cursor-pointer border border-slate-300 dark:border-slate-700 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Thêm Thành Viên</span>
                <span className="xs:hidden">Thêm</span>
              </button>
            </>
          )}

          <Link
            to="/app/kinship"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-950 dark:text-amber-200 text-xs font-bold transition border border-amber-300 dark:border-amber-700 shadow-2xs shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span className="hidden sm:inline">Tra Cứu Xưng Hô</span>
            <span className="sm:hidden">Xưng Hô</span>
          </Link>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất Cây (PDF)</span>
            <span className="sm:hidden">PDF</span>
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
            onAddRelation={isFamilyAdmin ? handleOpenAddRelation : undefined}
            onSelectMember={handleSelectMember}
            selectedMemberId={selectedMember?.id}
            selectedBranchId={selectedChiId}
            onBranchChange={setSelectedChiId}
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
        onMemberUpdated={(updated) => {
          setSelectedMember(updated);
          loadTree();
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
