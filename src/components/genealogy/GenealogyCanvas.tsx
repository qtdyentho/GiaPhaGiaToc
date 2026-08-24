import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  UserPlus,
  Heart,
  Eye,
  Sparkles,
  User,
  Plus,
  MapPin,
  FileText
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';

interface GenealogyCanvasProps {
  members: Member[];
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
  onAddRelation: (targetMember: Member, defaultType: 'CHILD' | 'SPOUSE' | 'PARENT') => void;
  onSelectMember: (member: Member) => void;
  selectedMemberId?: string | null;
  selectedBranchId?: string;
  onBranchChange?: (branchId: string) => void;
}

export const GenealogyCanvas: React.FC<GenealogyCanvasProps> = ({
  members,
  generations,
  branches,
  relationships,
  onAddRelation,
  onSelectMember,
  selectedMemberId,
  selectedBranchId,
  onBranchChange,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Filter members by selected branch if set
  const filteredMembers = selectedBranchId
    ? members.filter((m) => !m.branch_id || m.branch_id === selectedBranchId)
    : members;

  // Group members by generation sorted by generation_number
  const sortedGenerations = [...generations].sort((a, b) => a.generation_number - b.generation_number);

  const getBranchName = (branchId?: string) => {
    return branches.find((b) => b.id === branchId)?.name || 'Chi Trưởng';
  };

  const getSpouses = (memberId: string) => {
    const spouseRels = relationships.filter(
      (r) =>
        (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
        (r.member_id === memberId || r.related_member_id === memberId)
    );
    const spouseIds = spouseRels.map((r) =>
      r.member_id === memberId ? r.related_member_id : r.member_id
    );
    return members.filter((m) => spouseIds.includes(m.id));
  };

  const getChildren = (memberId: string) => {
    const childRels = relationships.filter(
      (r) => (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') && r.member_id === memberId
    );
    const childIds = childRels.map((r) => r.related_member_id);
    return members.filter((m) => childIds.includes(m.id));
  };

  return (
    <div className="relative w-full h-full min-h-[640px] bg-[#F7F8F5] flex flex-col select-none overflow-hidden">
      {/* Top Floating Branch Badges & Canvas Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>{selectedBranchId ? getBranchName(selectedBranchId).toUpperCase() : 'CHI TRƯỞNG'}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          <span>CÀNH 1</span>
        </div>
      </div>

      {/* Floating Zoom Controls (Bottom Right of Canvas) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-md">
        <button
          onClick={handleZoomOut}
          title="Thu nhỏ"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold px-2 text-slate-700 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          title="Phóng to"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
        <button
          onClick={handleResetZoom}
          title="Mặc định 100%"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 pt-16 relative bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"
      >
        <div
          className="transition-transform duration-150 origin-top-left flex flex-col gap-12 min-w-max pb-20"
          style={{ transform: `scale(${zoom})` }}
        >
          {sortedGenerations.map((gen, genIdx) => {
            const genMembers = filteredMembers.filter((m) => m.generation_id === gen.id);

            return (
              <div key={gen.id} className="flex flex-col items-center gap-4 relative">
                {/* Generation Indicator */}
                <div className="flex items-center gap-2">
                  <div className="h-[1px] w-12 bg-slate-300"></div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white/80 px-3 py-0.5 rounded-full border border-slate-200 shadow-sm">
                    {gen.name} (ĐỜI {gen.generation_number})
                  </span>
                  <div className="h-[1px] w-12 bg-slate-300"></div>
                </div>

                {/* Member Nodes in Generation */}
                <div className="flex flex-wrap justify-center items-center gap-8 relative">
                  {genMembers.length === 0 ? (
                    <div className="py-3 px-5 rounded-xl border border-dashed border-slate-300 bg-white/60 text-slate-500 text-xs">
                      Chưa có thành viên thuộc thế hệ này
                    </div>
                  ) : (
                    genMembers.map((member) => {
                      const isSelected = selectedMemberId === member.id;
                      const isDeceased = member.life_status === 'DECEASED';
                      const isRoot = gen.generation_number === 1;

                      return (
                        <div key={member.id} className="relative flex flex-col items-center">
                          {/* Tree Vertical Connector Above (except Root) */}
                          {!isRoot && (
                            <div className="w-[2px] h-6 bg-emerald-700/60 -mt-6 mb-2"></div>
                          )}

                          {/* Member Card */}
                          <div
                            onClick={() => onSelectMember(member)}
                            className={`w-64 bg-white rounded-2xl border transition-all duration-200 p-3.5 flex items-center gap-3.5 cursor-pointer select-none ${
                              isSelected
                                ? 'border-2 border-emerald-700 ring-4 ring-emerald-100 shadow-xl scale-105'
                                : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
                            }`}
                          >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={member.full_name}
                                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                                />
                              ) : (
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${
                                    member.gender === 'MALE'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {member.gender === 'MALE' ? '👨' : '👩'}
                                </div>
                              )}
                            </div>

                            {/* Name & Metadata */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
                                {member.full_name.replace(/\(.*?\)/g, '').trim()}
                              </h4>
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                {isRoot ? 'THỦY TỔ' : `ĐỜI ${gen.generation_number}`}
                              </p>
                              <div className="mt-1">
                                <span
                                  className={`inline-block text-[10px] px-2 py-0.5 rounded font-medium ${
                                    isDeceased
                                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                                  }`}
                                >
                                  {isDeceased ? 'Đã khuất' : 'Còn sống'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tree Vertical Connector Below (if not last generation) */}
                          {genIdx < sortedGenerations.length - 1 && (
                            <div className="w-[2px] h-6 bg-emerald-700/60 mt-2 -mb-6"></div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
