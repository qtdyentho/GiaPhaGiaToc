import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  UserPlus,
  Heart,
  Eye,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';

interface GenealogyCanvasProps {
  members: Member[];
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
  onAddRelation: (targetMember: Member, defaultType: 'CHILD' | 'SPOUSE' | 'PARENT') => void;
  onSelectMember: (member: Member) => void;
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
  selectedBranchId,
  onBranchChange,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Filter members by selected branch if set
  const filteredMembers = selectedBranchId
    ? members.filter((m) => !m.branch_id || m.branch_id === selectedBranchId)
    : members;

  // Group members by generation
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
    <div className="relative w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[620px]">
      {/* Control Bar Header */}
      <div className="px-5 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Chi phái:</span>
            <select
              value={selectedBranchId || ''}
              onChange={(e) => onBranchChange && onBranchChange(e.target.value)}
              className="bg-transparent text-amber-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">
                Tất Cả Các Chi ({branches.length} chi)
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Tổng: <strong>{filteredMembers.length}</strong> nhân khẩu</span>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-1">
          <button
            onClick={handleZoomOut}
            title="Thu nhỏ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 text-slate-300 min-w-[48px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Phóng to"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
          <button
            onClick={handleResetZoom}
            title="Mặc định 100%"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors text-xs font-medium"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 relative bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] select-none"
      >
        <div
          className="transition-transform duration-150 origin-top-left flex flex-col gap-10 min-w-max pb-16"
          style={{ transform: `scale(${zoom})` }}
        >
          {sortedGenerations.map((gen) => {
            const genMembers = filteredMembers.filter((m) => m.generation_id === gen.id);

            return (
              <div key={gen.id} className="flex items-start gap-6 relative">
                {/* Generation Label Column */}
                <div className="w-44 flex-shrink-0 sticky left-0 z-10">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-lg shadow-amber-950/20 backdrop-blur-md">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{gen.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Đời thứ {gen.generation_number} ({genMembers.length} người)
                    </div>
                  </div>
                </div>

                {/* Member Nodes in Generation */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  {genMembers.length === 0 ? (
                    <div className="py-3 px-4 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                      Chưa có thành viên thuộc đời này
                    </div>
                  ) : (
                    genMembers.map((member) => {
                      const isSelected = activeMemberId === member.id;
                      const isDeceased = member.life_status === 'DECEASED';
                      const spouses = getSpouses(member.id);
                      const children = getChildren(member.id);

                      return (
                        <div
                          key={member.id}
                          className={`relative group rounded-2xl border transition-all duration-200 ${
                            isSelected
                              ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/10'
                              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700 shadow-md'
                          } p-4 w-72 flex flex-col gap-3 cursor-pointer`}
                          onClick={() => {
                            setActiveMemberId(member.id);
                            onSelectMember(member);
                          }}
                        >
                          {/* Top Tag: Branch & Life Status */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                              {getBranchName(member.branch_id)}
                            </span>
                            {isDeceased ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                                <span>🕯️</span> Đã mất
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                                <span>🌿</span> Còn sống
                              </span>
                            )}
                          </div>

                          {/* Member Avatar & Name */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base border ${
                                member.gender === 'MALE'
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                  : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                              }`}
                            >
                              {member.gender === 'MALE' ? '👨' : '👩'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                                {member.full_name}
                              </h4>
                              <p className="text-xs text-slate-400 truncate">
                                {member.birth_solar_date ? `Sinh: ${member.birth_solar_date.substring(0, 4)}` : ''}
                                {member.death_lunar_day && member.death_lunar_month
                                  ? ` • Giỗ: ${member.death_lunar_day}/${member.death_lunar_month} ÂL`
                                  : ''}
                              </p>
                            </div>
                          </div>

                          {/* Quick Relations Summary */}
                          {(spouses.length > 0 || children.length > 0) && (
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              {spouses.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3 text-rose-400" />
                                  <span>{spouses.map((s) => s.full_name).join(', ')}</span>
                                </span>
                              )}
                              {children.length > 0 && (
                                <span className="text-slate-400 font-mono ml-auto">
                                  {children.length} con
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Bar on Hover/Active */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddRelation(member, 'CHILD');
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                              title="Thêm con cho thành viên này"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Con</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddRelation(member, 'SPOUSE');
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                              title="Thêm vợ/chồng cho thành viên này"
                            >
                              <Heart className="w-3 h-3" />
                              <span>+ Vợ/Chồng</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMember(member);
                              }}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Đinh (Nam)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span> Nữ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Tiền Bối (Đã tạ thế)
          </span>
        </div>
        <div className="text-[11px] text-slate-500 hidden sm:block">
          💡 Nhấp vào thành viên để xem tiểu sử & cây trực hệ
        </div>
      </div>
    </div>
  );
};
