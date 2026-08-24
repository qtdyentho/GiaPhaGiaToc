import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  User,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Heart,
  Eye,
  Info,
  ChevronDown
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
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
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
    setPan({ x: 20, y: 20 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl + Wheel
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.35), 2.0));
    } else {
      // Regular pan with wheel
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

  // Spouses & Children helper
  const getSpouses = (memberId: string) => {
    const spouseRels = relationships.filter(
      (r) =>
        (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
        (r.member_id === memberId || r.related_member_id === memberId)
    );
    const spouseIds = spouseRels.map((r) => (r.member_id === memberId ? r.related_member_id : r.member_id));
    return members.filter((m) => spouseIds.includes(m.id));
  };

  const getBranch = (branchId?: string) => branches.find((b) => b.id === branchId);

  // Group members by generation
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
      className={`relative w-full h-full bg-[#F5F6F2] overflow-hidden select-none flex flex-col ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Decorative Heritage Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Floating Branch Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2.5 text-xs text-slate-800">
          <Layers className="w-4 h-4 text-[#166534]" />
          <span className="font-bold">Chi Phái Đang Xem:</span>
          <select
            value={selectedBranchId || ''}
            onChange={(e) => onBranchChange && onBranchChange(e.target.value)}
            className="font-bold text-xs bg-emerald-50 border border-emerald-300 text-[#166534] rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
          >
            <option value="">Toàn Thể Dòng Họ (Đa Chi Phái)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600">
          <Info className="w-3.5 h-3.5 text-amber-700" />
          <span>Kéo chuột để di chuyển • Nhấn vào thẻ để xem chi tiết</span>
        </div>
      </div>

      {/* Floating Canvas Zoom & Navigation Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-xl pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Thu nhỏ (-)"
          className="canvas-control-button p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="px-2 font-mono text-xs font-bold text-slate-700 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </div>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Phóng to (+)"
          className="canvas-control-button p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={handleResetZoom}
          title="Thu phóng 100%"
          className="canvas-control-button p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100%</span>
        </button>

        <button
          type="button"
          onClick={handleFitToView}
          title="Xem toàn bộ cây phả hệ"
          className="canvas-control-button p-2 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-200"
        >
          <span>Xem Toàn Bộ</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
          className="canvas-control-button p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
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
        {/* Render Generation by Generation Vertical / Horizontal Hierarchy */}
        <div className="inline-flex flex-col space-y-12 p-12 min-w-max">
          {sortedGenerations.map((gen, gIdx) => {
            const genMembers = membersByGen[gen.id] || [];
            if (genMembers.length === 0 && members.length > 0) return null;

            return (
              <div key={gen.id} className="relative space-y-4">
                {/* Generation Header Divider */}
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#14532D] to-[#166534] text-white text-xs font-bold tracking-wider shadow-sm uppercase font-serif flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>
                      {gIdx === 0 ? 'ĐỜI THỨ NHẤT: KHAI SÁNG THỦY TỔ' : `ĐỜI THỨ ${gen.generation_number}: ${gen.name.toUpperCase()}`}
                    </span>
                    <span className="text-[11px] text-emerald-200 font-sans font-normal">
                      ({genMembers.length} Thành Viên)
                    </span>
                  </div>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-600/40 via-amber-400/40 to-transparent min-w-[300px]" />
                </div>

                {/* Member Cards Row in this Generation */}
                <div className="flex flex-wrap items-start gap-6 pl-4">
                  {genMembers.map((m) => {
                    const branch = getBranch(m.branch_id);
                    const spouses = getSpouses(m.id);
                    const isSelected = selectedMemberId === m.id;
                    const isDeceased = m.life_status === 'DECEASED';

                    // Branch color accent
                    const branchColor = branch?.id?.includes('1') 
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50' 
                      : branch?.id?.includes('2')
                      ? 'border-blue-600 text-blue-800 bg-blue-50'
                      : 'border-amber-600 text-amber-800 bg-amber-50';

                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectMember(m)}
                        className={`member-card-interactive group relative w-72 bg-white rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl border-2 ${
                          isSelected
                            ? 'border-[#166534] ring-4 ring-emerald-500/20 scale-102 bg-emerald-50/20'
                            : 'border-slate-200/90 hover:border-[#166534]'
                        }`}
                      >
                        {/* Top Accent Tag */}
                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${branchColor}`}>
                            {branch ? branch.name : 'Chi Trưởng'}
                          </span>
                          <span className={`text-[10px] font-bold ${isDeceased ? 'text-slate-400' : 'text-emerald-700'}`}>
                            {isDeceased ? '🕯️ Đã Mất' : '🌿 Còn Sống'}
                          </span>
                        </div>

                        {/* Card Main Info */}
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {m.avatar_url ? (
                              <img
                                src={m.avatar_url}
                                alt={m.full_name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xs ${
                                m.gender === 'MALE' ? 'bg-emerald-100 text-[#166534]' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {m.gender === 'MALE' ? '👨' : '👩'}
                              </div>
                            )}
                          </div>

                          {/* Name & Details */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className="font-bold text-slate-900 text-sm truncate font-serif group-hover:text-[#166534] transition-colors">
                              {m.full_name.replace(/\(.*?\)/g, '').trim()}
                            </h4>

                            {/* Memorial / Birth Date */}
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {isDeceased && m.death_lunar_day && m.death_lunar_month
                                  ? `Giỗ: ${m.death_lunar_day}/${m.death_lunar_month} ÂL`
                                  : m.birth_solar_date
                                  ? `Sinh: ${new Date(m.birth_solar_date).getFullYear()}`
                                  : 'Chưa rõ năm'}
                              </span>
                            </div>

                            {/* Resting place or Spouse */}
                            {spouses.length > 0 && (
                              <div className="text-[10px] text-slate-600 flex items-center gap-1 truncate font-medium">
                                <Heart className="w-3 h-3 text-rose-500 shrink-0" />
                                <span>Phối: {spouses.map((s) => s.full_name.replace(/\(.*?\)/g, '').trim()).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Hover Action Buttons */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMember(m);
                            }}
                            className="text-[#166534] hover:underline font-bold text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Chi tiết</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddRelation(m, 'CHILD');
                            }}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-[#166534] rounded-lg text-[10px] font-bold transition flex items-center gap-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Thêm con</span>
                          </button>
                        </div>
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
