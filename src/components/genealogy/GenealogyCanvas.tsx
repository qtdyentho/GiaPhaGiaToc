import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  User,
  Plus,
  Calendar,
  Layers,
  Heart,
  Eye,
  Info,
  GitFork,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';
import { getLineageHierarchyInfo } from '../../utils/lineageHierarchy';

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
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 40 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(Math.round((prev + 0.15) * 100) / 100, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(Math.round((prev - 0.15) * 100) / 100, 0.35));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 60, y: 40 });
  };
  const handleFitToView = () => {
    setZoom(0.75);
    setPan({ x: 30, y: 30 });
  };

  // Mouse wheel zoom & pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.35), 2.0));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  // Pan Mouse Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.member-card-interactive') || (e.target as HTMLElement).closest('.canvas-control-button')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Sort generations
  const sortedGenerations = [...generations].sort((a, b) => a.generation_number - b.generation_number);

  // Spouses helper
  const getSpouses = (memberId: string): Member[] => {
    const spouseRels = relationships.filter(
      (r) =>
        (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
        (r.member_id === memberId || r.related_member_id === memberId)
    );
    const spouseIds = spouseRels.map((r) => (r.member_id === memberId ? r.related_member_id : r.member_id));
    return members.filter((m) => spouseIds.includes(m.id));
  };

  // Children helper
  const getChildren = (memberId: string): Member[] => {
    const childRels = relationships.filter(
      (r) => (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') && r.member_id === memberId
    );
    const childIds = childRels.map((r) => r.related_member_id);
    return members.filter((m) => childIds.includes(m.id));
  };

  const getBranch = (branchId?: string) => branches.find((b) => b.id === branchId);

  // Group members by generation and assemble Nuclear Family Unions
  const membersByGen: Record<string, Member[]> = {};
  sortedGenerations.forEach((gen) => {
    membersByGen[gen.id] = members.filter((m) => m.generation_id === gen.id);
  });

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full bg-[#F6F8F5] dark:bg-slate-950 overflow-hidden select-none flex flex-col ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Heritage Dot Matrix */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Floating Heritage Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200">
          <Layers className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
          <span className="font-bold">Chi Phái Hiển Thị:</span>
          <select
            value={selectedBranchId || ''}
            onChange={(e) => onBranchChange && onBranchChange(e.target.value)}
            className="font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 rounded-xl px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
          >
            <option value="">Toàn Thể Dòng Họ (Đa Chi Phái)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Vợ Chồng ngang hàng • Kéo thả để duyệt • Click vào thẻ để mở cửa sổ 360°</span>
        </div>
      </div>

      {/* Floating Canvas Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Thu nhỏ (-)"
          className="canvas-control-button p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="px-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </div>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Phóng to (+)"
          className="canvas-control-button p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={handleResetZoom}
          title="Thu phóng 100%"
          className="canvas-control-button p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100%</span>
        </button>

        <button
          type="button"
          onClick={handleFitToView}
          title="Xem toàn bộ cây phả hệ"
          className="canvas-control-button p-2 rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
        >
          <span>Xem Toàn Bộ</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
          className="canvas-control-button p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Infinite Canvas Viewport */}
      <div
        className="flex-1 w-full h-full relative overflow-visible transition-transform duration-75 ease-out origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Render Generations Hierarchy with Strict Horizontal Alignment */}
        <div className="inline-flex flex-col space-y-16 p-12 min-w-max">
          {sortedGenerations.map((gen, gIdx) => {
            const genMembers = membersByGen[gen.id] || [];
            if (genMembers.length === 0 && members.length > 0) return null;

            // Track rendered spouse IDs to prevent duplicating them as separate nuclear units
            const renderedSpouseIds = new Set<string>();

            return (
              <div key={gen.id} className="relative space-y-5">
                {/* Generation Header Horizontal Line */}
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] text-white text-xs font-bold tracking-wider shadow-sm uppercase font-serif flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>
                      {gIdx === 0 ? 'ĐỜI THỨ NHẤT: THỦY TỔ KHỞI NGHIỆP' : `ĐỜI THỨ ${gen.generation_number}: ${gen.name.toUpperCase()}`}
                    </span>
                    <span className="text-[11px] text-emerald-200 font-sans font-normal">
                      • {genMembers.length} Vị
                    </span>
                  </div>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-600/40 via-amber-400/40 to-transparent min-w-[400px]" />
                </div>

                {/* Nuclear Families Row in this Generation (All on exact same horizontal Y) */}
                <div className="flex items-stretch gap-10 pl-6 flex-nowrap">
                  {genMembers.map((m) => {
                    if (renderedSpouseIds.has(m.id)) return null;

                    const branch = getBranch(m.branch_id);
                    const spouses = getSpouses(m.id);
                    const children = getChildren(m.id);
                    const isSelected = selectedMemberId === m.id;
                    const isDeceased = m.life_status === 'DECEASED';
                    const lineageInfo = getLineageHierarchyInfo(m, generations, branches, members);

                    // Mark spouses as rendered in this nuclear unit
                    spouses.forEach((s) => renderedSpouseIds.add(s.id));

                    return (
                      <div key={m.id} className="flex flex-col items-center">
                        {/* Nuclear Couple Container (Vợ Chồng Ngang Hàng) */}
                        <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-3 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 relative group">
                          
                          {/* Primary Member Card (Chồng hoặc Người Trực Hệ) */}
                          <div
                            onClick={() => onSelectMember(m)}
                            className={`member-card-interactive w-64 bg-white dark:bg-slate-800 rounded-2xl p-4 transition-all duration-200 cursor-pointer border-2 ${
                              isSelected
                                ? 'border-[#166534] dark:border-emerald-400 ring-4 ring-emerald-500/20 bg-emerald-50/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                            }`}
                          >
                            {/* Card Top Pill: Lineage Level Badge (Thủy Tổ / Chi / Cành / Nhánh) */}
                            <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-serif truncate max-w-[140px] ${lineageInfo.badgeColor}`}>
                                {lineageInfo.badgeLabel}
                              </span>
                              <span className={`text-[10px] font-bold ${isDeceased ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                {isDeceased ? '🕯️ Tiên Tổ' : '🌿 Còn Sống'}
                              </span>
                            </div>

                            {/* Main Info */}
                            <div className="flex items-start gap-3">
                              <div className="relative shrink-0">
                                {m.avatar_url ? (
                                  <img
                                    src={m.avatar_url}
                                    alt={m.full_name}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                  />
                                ) : (
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xs ${
                                    m.gender === 'MALE' ? 'bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                  }`}>
                                    {m.gender === 'MALE' ? '👨' : '👩'}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-0.5">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate font-serif group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition-colors">
                                  {m.full_name.replace(/\(.*?\)/g, '').trim()}
                                </h4>

                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>
                                    {isDeceased && m.death_lunar_day && m.death_lunar_month
                                      ? `Giỗ: ${m.death_lunar_day}/${m.death_lunar_month} ÂL`
                                      : m.birth_solar_date
                                      ? `Sinh: ${new Date(m.birth_solar_date).getFullYear()}`
                                      : 'Ghi chép ngọc phả'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Actions & Hierarchy Level */}
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-[#166534] dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                <Eye className="w-3 h-3" />
                                <span>Xem 360°</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium font-serif">
                                {lineageInfo.levelName} (Đời {gen.generation_number})
                              </span>
                            </div>
                          </div>

                          {/* Marriage Connector Symbol (💍 / ❖) */}
                          {spouses.length > 0 && (
                            <div className="flex flex-col items-center justify-center px-1">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 flex items-center justify-center text-xs font-serif font-bold shadow-xs">
                                ❖
                              </div>
                              <span className="text-[9px] font-serif italic text-amber-800 dark:text-amber-400 mt-0.5">
                                Hôn Phối
                              </span>
                            </div>
                          )}

                          {/* Spouses Cards (Vợ Cả, Vợ Thứ - Xếp Ngang Hàng Cùng Trục Y) */}
                          {spouses.map((s, sIdx) => {
                            const isSpouseSelected = selectedMemberId === s.id;
                            const isSpouseDeceased = s.life_status === 'DECEASED';
                            
                            // Danh hiệu thứ bậc vợ cổ truyền
                            const wifeTitle = sIdx === 0
                              ? '👑 Bà Cả (Chính Thất)'
                              : sIdx === 1
                              ? '🌿 Bà Hai (Kế Thất)'
                              : sIdx === 2
                              ? '🍃 Bà Ba (Trắc Thất)'
                              : `🌸 Bà Thứ ${sIdx + 1}`;

                            const wifeBadgeColor = sIdx === 0
                              ? 'border-amber-300 text-amber-900 bg-amber-50 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                              : sIdx === 1
                              ? 'border-teal-300 text-teal-900 bg-teal-50 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-700'
                              : 'border-rose-200 text-rose-900 bg-rose-50 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';

                            return (
                              <div
                                key={s.id}
                                onClick={() => onSelectMember(s)}
                                className={`member-card-interactive w-60 bg-white dark:bg-slate-800 rounded-2xl p-4 transition-all duration-200 cursor-pointer border-2 ${
                                  isSpouseSelected
                                    ? 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-rose-400'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-serif ${wifeBadgeColor}`}>
                                    {wifeTitle}
                                  </span>
                                  <span className={`text-[10px] font-bold ${isSpouseDeceased ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                    {isSpouseDeceased ? '🕯️ Đã Mất' : '🌿 Còn Sống'}
                                  </span>
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xs shrink-0 ${
                                    sIdx === 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-900' : 'bg-rose-100 dark:bg-rose-950 text-rose-800'
                                  }`}>
                                    👩
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-0.5">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate font-serif">
                                      {s.full_name.replace(/\(.*?\)/g, '').trim()}
                                    </h4>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                      {isSpouseDeceased && s.death_lunar_day && s.death_lunar_month
                                        ? `Giỗ: ${s.death_lunar_day}/${s.death_lunar_month} ÂL`
                                        : 'Hiền thê phụng thờ'}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold flex items-center gap-0.5">
                                    <Eye className="w-3 h-3" />
                                    <span>Xem 360°</span>
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-serif">
                                    Hôn Phối Đời {gen.generation_number}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Quick Add Buttons on Card Container */}
                          <div className="flex flex-col gap-1.5 pl-1 border-l border-slate-100 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddRelation(m, 'CHILD');
                              }}
                              title="Thêm Con Trai / Con Gái"
                              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-[#166534] dark:text-emerald-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="hidden group-hover:inline">Thêm Con</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddRelation(m, 'SPOUSE');
                              }}
                              title={spouses.length === 0 ? "Thêm Vợ (Chính Thất)" : "Thêm Kế Thất / Thứ Thiếp"}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-800 dark:text-rose-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-800"
                            >
                              <Heart className="w-3 h-3" />
                              <span className="hidden group-hover:inline">{spouses.length === 0 ? 'Thêm Vợ' : '+ Thêm Thứ Thất'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Descent Vertical Branch Connector Line dropping down to children */}
                        {children.length > 0 && (
                          <div className="flex flex-col items-center mt-2">
                            <div className="w-[2px] h-8 bg-gradient-to-b from-amber-400 to-[#166534]" />
                            <div className="flex items-center gap-1.5">
                              {spouses.length <= 1 ? (
                                <div className="px-3 py-0.5 rounded-full bg-[#166534] text-white text-[10px] font-bold shadow-xs font-serif">
                                  {children.length} Hậu Duệ (Đời {gen.generation_number + 1})
                                </div>
                              ) : (
                                <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-800 via-[#166534] to-teal-800 text-white text-[10px] font-bold shadow-xs font-serif flex items-center gap-1">
                                  <span>{children.length} Hậu Duệ ({spouses.length} Dòng Mẹ • Đời {gen.generation_number + 1})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GenealogyCanvas;
