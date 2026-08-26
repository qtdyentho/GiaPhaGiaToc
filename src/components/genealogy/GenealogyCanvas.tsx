import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Info,
  Sparkles,
  TreePine,
  LayoutGrid,
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';
import { GenealogyTreeNode, FamilyTreeNodeData } from './GenealogyTreeNode';

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
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 50 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(Math.round((prev + 0.15) * 100) / 100, 2.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(Math.round((prev - 0.15) * 100) / 100, 0.35));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 100, y: 60 });
  };
  const handleFitToView = () => {
    setZoom(0.75);
    setPan({ x: 60, y: 40 });
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
    if (
      (e.target as HTMLElement).closest('.member-card-interactive') ||
      (e.target as HTMLElement).closest('.canvas-control-button')
    ) {
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

  // 🌳 XÂY DỰNG CẤU TRÚC CÂY PHẢ HỆ ĐỆ QUY (HIERARCHICAL RECURSIVE TREE)
  const treeRoots = useMemo(() => {
    let filteredMembers = members;
    if (selectedBranchId) {
      filteredMembers = members.filter((m) => !m.branch_id || m.branch_id === selectedBranchId);
    }

    const genMap = new Map(generations.map((g) => [g.id, g.generation_number]));

    // 1. Tập hợp các ID vợ/chồng để không chọn làm Root độc lập
    const spouseIds = new Set<string>();
    relationships
      .filter((r) => r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE')
      .forEach((r) => {
        const m1 = members.find((m) => m.id === r.member_id);
        const m2 = members.find((m) => m.id === r.related_member_id);
        if (m1?.gender === 'MALE' && m2?.gender === 'FEMALE') {
          spouseIds.add(m2.id);
        } else if (m1?.gender === 'FEMALE' && m2?.gender === 'MALE') {
          spouseIds.add(m1.id);
        } else {
          spouseIds.add(r.related_member_id);
        }
      });

    // 2. Tập hợp các ID con cái (có quan hệ CHILD)
    const childIds = new Set<string>();
    relationships
      .filter((r) => r.relationship === 'CHILD' || r.relationship_type === 'CHILD')
      .forEach((r) => childIds.add(r.related_member_id));

    // 3. Root Members: Không có cha mẹ trong cây và không phải là vợ phụ thuộc
    let roots = filteredMembers.filter((m) => !childIds.has(m.id) && !spouseIds.has(m.id));

    if (roots.length === 0 && filteredMembers.length > 0) {
      const minGenNum = Math.min(
        ...filteredMembers.map((m) => genMap.get(m.generation_id || '') || 1)
      );
      roots = filteredMembers.filter(
        (m) => (genMap.get(m.generation_id || '') || 1) === minGenNum && !spouseIds.has(m.id)
      );
    }

    const visited = new Set<string>();

    function buildNode(member: Member): FamilyTreeNodeData {
      visited.add(member.id);
      const genNum = genMap.get(member.generation_id || '') || 1;

      // Tìm tất cả spouses của member
      const memberSpouses: Member[] = [];
      relationships
        .filter(
          (r) =>
            (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
            (r.member_id === member.id || r.related_member_id === member.id)
        )
        .forEach((r) => {
          const spouseId = r.member_id === member.id ? r.related_member_id : r.member_id;
          const spouse = members.find((m) => m.id === spouseId);
          if (spouse && !memberSpouses.some((s) => s.id === spouse.id)) {
            memberSpouses.push(spouse);
            visited.add(spouse.id);
          }
        });

      // Tìm tất cả children của member (hoặc spouses của member)
      const childMembers: Member[] = [];
      const parentIds = [member.id, ...memberSpouses.map((s) => s.id)];

      relationships
        .filter(
          (r) =>
            (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') &&
            parentIds.includes(r.member_id)
        )
        .forEach((r) => {
          const child = members.find((m) => m.id === r.related_member_id);
          if (child && !childMembers.some((c) => c.id === child.id)) {
            childMembers.push(child);
          }
        });

      // Sắp xếp con theo năm sinh
      childMembers.sort((a, b) => {
        const yearA = a.birth_solar_date ? new Date(a.birth_solar_date).getFullYear() : 0;
        const yearB = b.birth_solar_date ? new Date(b.birth_solar_date).getFullYear() : 0;
        return yearA - yearB;
      });

      const childrenNodes = childMembers
        .filter((c) => !visited.has(c.id))
        .map((c) => buildNode(c));

      return {
        id: member.id,
        primaryMember: member,
        spouses: memberSpouses,
        children: childrenNodes,
        generationNumber: genNum,
      };
    }

    return roots.map((r) => buildNode(r));
  }, [members, relationships, generations, selectedBranchId]);

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
          <span>
            Đời trên luôn ở chính giữa đời dưới • Dây nối chi nhánh trực hệ • Kéo chuột để duyệt
          </span>
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
        {/* Render Hierarchical Tree Nodes with Centering & Branch Connectors */}
        <div className="inline-flex items-start justify-center gap-24 p-16 min-w-max">
          {treeRoots.length > 0 ? (
            treeRoots.map((rootNode) => (
              <div key={rootNode.id} className="flex flex-col items-center">
                {/* Banner Tiêu Đề Thủy Tổ / Khởi Đầu Nhánh */}
                <div className="mb-6 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] text-white text-xs font-bold tracking-wider shadow-sm uppercase font-serif flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>
                    👑 THỦY TỔ KHỞI NGHIỆP • ĐỜI THỨ {rootNode.generationNumber}
                  </span>
                </div>

                <GenealogyTreeNode
                  node={rootNode}
                  generations={generations}
                  branches={branches}
                  allMembers={members}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={onSelectMember}
                  onAddRelation={onAddRelation}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-20 px-8 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
              <TreePine className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Chưa Có Dữ Liệu Phả Hệ
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Bấm nút &quot;Thêm Thành Viên&quot; hoặc &quot;Nhập Gia Phả Excel&quot; để khởi tạo cây phả hệ dòng họ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenealogyCanvas;
