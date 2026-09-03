import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Info,
  Search,
  X,
  Map as MapIcon,
  Sparkles,
  TreePine,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship, KinshipResult } from '../../types/database';
import { GenealogyTreeNode, FamilyTreeNodeData } from './GenealogyTreeNode';
import { KinshipService } from '../../services/genealogy/KinshipService';

interface GenealogyCanvasProps {
  members: Member[];
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
  onAddRelation?: (targetMember: Member, defaultType: 'CHILD' | 'SPOUSE' | 'PARENT') => void;
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
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);

  // Mini-map States
  const [showMinimap, setShowMinimap] = useState<boolean>(true);

  // Kinship Tooltip / Quick Compare States
  const [isKinshipMode, setIsKinshipMode] = useState<boolean>(false);
  const [kinshipPersonA, setKinshipPersonA] = useState<Member | null>(null);
  const [kinshipPersonB, setKinshipPersonB] = useState<Member | null>(null);
  const [kinshipResult, setKinshipResult] = useState<KinshipResult | null>(null);
  const [isCalculatingKinship, setIsCalculatingKinship] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const treeContentRef = useRef<HTMLDivElement>(null);

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

  // Smooth Auto-Pan to a target member node
  const panToMember = useCallback(
    (memberId: string) => {
      setHighlightedMemberId(memberId);
      const targetEl = document.getElementById(`member-node-${memberId}`);
      if (targetEl && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = targetEl.getBoundingClientRect();

        // Node position in unscaled content space
        const targetZoom = 1.0;
        const nodeContentX = (elRect.left - containerRect.left - pan.x) / zoom;
        const nodeContentY = (elRect.top - containerRect.top - pan.y) / zoom;
        const nodeContentW = elRect.width / zoom;
        const nodeContentH = elRect.height / zoom;

        const newPanX = containerRect.width / 2 - (nodeContentX + nodeContentW / 2) * targetZoom;
        const newPanY = containerRect.height / 2 - (nodeContentY + nodeContentH / 2) * targetZoom;

        setPan({
          x: Math.round(newPanX),
          y: Math.round(newPanY),
        });
        setZoom(targetZoom);
      }
      setTimeout(() => setHighlightedMemberId(null), 3500);
    },
    [pan, zoom]
  );

  // Mouse wheel zoom & pan with focal point compensation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const focalX = e.clientX - containerRect.left;
      const focalY = e.clientY - containerRect.top;
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      const newZoom = Math.min(Math.max(zoom + delta, 0.35), 2.0);
      const scaleFactor = newZoom / zoom;
      setPan((prev) => ({
        x: Math.round(focalX - (focalX - prev.x) * scaleFactor),
        y: Math.round(focalY - (focalY - prev.y) * scaleFactor),
      }));
      setZoom(newZoom);
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
      (e.target as HTMLElement).closest('.canvas-control-button') ||
      (e.target as HTMLElement).closest('.minimap-container') ||
      (e.target as HTMLElement).closest('.search-container') ||
      (e.target as HTMLElement).closest('select') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input')
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

  // Touch Gesture Handlers (Mobile & Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (
      (e.target as HTMLElement).closest('.member-card-interactive') ||
      (e.target as HTMLElement).closest('.canvas-control-button') ||
      (e.target as HTMLElement).closest('.minimap-container') ||
      (e.target as HTMLElement).closest('.search-container') ||
      (e.target as HTMLElement).closest('select') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input')
    ) {
      return;
    }

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
      setTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDistance !== null && containerRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const factor = dist / touchDistance;
      if (Math.abs(factor - 1) > 0.03) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const focalX = (touch1.clientX + touch2.clientX) / 2 - containerRect.left;
        const focalY = (touch1.clientY + touch2.clientY) / 2 - containerRect.top;
        const newZoom = Math.min(Math.max(zoom * factor, 0.35), 2.0);
        const scaleFactor = newZoom / zoom;
        setPan((prev) => ({
          x: Math.round(focalX - (focalX - prev.x) * scaleFactor),
          y: Math.round(focalY - (focalY - prev.y) * scaleFactor),
        }));
        setZoom(newZoom);
        setTouchDistance(dist);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
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

  // ⌨️ Keyboard Shortcuts: F=Fit, +/=/↑=ZoomIn, -/↓=ZoomOut, 0=Reset, Esc=ExitKinship
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside an input, textarea, or select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          handleFitToView();
          break;
        case '+':
        case '=':
        case 'ArrowUp':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case 'ArrowDown':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'Escape':
          if (isKinshipMode) {
            setIsKinshipMode(false);
            setKinshipPersonA(null);
            setKinshipPersonB(null);
            setKinshipResult(null);
          }
          if (isSearchOpen) {
            setIsSearchOpen(false);
            setSearchQuery('');
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isKinshipMode, isSearchOpen, handleFitToView, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Filtered members for Search
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return members
      .filter(
        (m) =>
          m.full_name.toLowerCase().includes(query) ||
          (m.courtesy_name && m.courtesy_name.toLowerCase().includes(query)) ||
          (m.religious_name && m.religious_name.toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [members, searchQuery]);

  // Handle member click inside canvas
  const handleMemberCardClick = (member: Member) => {
    if (isKinshipMode) {
      if (!kinshipPersonA) {
        setKinshipPersonA(member);
      } else if (!kinshipPersonB && kinshipPersonA.id !== member.id) {
        setKinshipPersonB(member);
      } else {
        // Reset to new selection A
        setKinshipPersonA(member);
        setKinshipPersonB(null);
        setKinshipResult(null);
      }
      return;
    }
    onSelectMember(member);
  };

  // Trigger Kinship Calculation when A & B are selected
  useEffect(() => {
    if (kinshipPersonA && kinshipPersonB) {
      setIsCalculatingKinship(true);
      KinshipService.calculateKinship(kinshipPersonA.id, kinshipPersonB.id, members)
        .then((res) => {
          setKinshipResult(res);
        })
        .finally(() => {
          setIsCalculatingKinship(false);
        });
    }
  }, [kinshipPersonA, kinshipPersonB, members]);

  // 🌳 XÂY DỰNG CẤU TRÚC CÂY PHẢ HỆ ĐỆ QUY CHUẨN XÁC
  const treeRoots = useMemo(() => {
    let filteredMembers = members;
    if (selectedBranchId) {
      filteredMembers = members.filter((m) => !m.branch_id || m.branch_id === selectedBranchId);
    }

    const genMap = new Map(generations.map((g) => [g.id, g.generation_number]));
    const memberMap = new Map(members.map((m) => [m.id, m]));

    // 1. Tập hợp các ID vợ/chồng phụ thuộc để không chọn làm Root độc lập
    const spouseIds = new Set<string>();
    const filteredMemberIds = new Set(filteredMembers.map((m) => m.id));

    relationships
      .filter((r) => r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE')
      .forEach((r) => {
        const m1 = members.find((m) => m.id === r.member_id);
        const m2 = members.find((m) => m.id === r.related_member_id);
        if (!m1 || !m2) return;

        // Chỉ đưa vào spouseIds nếu cả 2 bên đều có mặt hoặc bên phối ngẫu là thành viên hợp lệ
        if (m1.is_direct_lineage === true && m2.is_direct_lineage === false) {
          spouseIds.add(m2.id);
        } else if (m1.is_direct_lineage === false && m2.is_direct_lineage === true) {
          spouseIds.add(m1.id);
        } else if (m1.gender === 'MALE' && m2.gender === 'FEMALE') {
          if (filteredMemberIds.has(m1.id)) {
            spouseIds.add(m2.id);
          }
        } else if (m1.gender === 'FEMALE' && m2.gender === 'MALE') {
          if (filteredMemberIds.has(m2.id) && !m1.is_direct_lineage) {
            spouseIds.add(m1.id);
          } else if (filteredMemberIds.has(m1.id) && m1.is_direct_lineage) {
            spouseIds.add(m2.id);
          }
        } else {
          if (filteredMemberIds.has(m1.id)) {
            spouseIds.add(m2.id);
          }
        }
      });

    // Nạp thêm từ trường spouse_id trực tiếp trên member
    members.forEach((m) => {
      if (m.spouse_id) {
        const spouse = memberMap.get(m.spouse_id);
        if (spouse) {
          if (m.is_direct_lineage === true && spouse.is_direct_lineage === false) {
            spouseIds.add(spouse.id);
          } else if (m.is_direct_lineage === false && spouse.is_direct_lineage === true) {
            spouseIds.add(m.id);
          } else if (m.gender === 'MALE' && spouse.gender === 'FEMALE') {
            if (filteredMemberIds.has(m.id)) {
              spouseIds.add(spouse.id);
            }
          } else if (m.gender === 'FEMALE' && spouse.gender === 'MALE') {
            if (filteredMemberIds.has(spouse.id) && !m.is_direct_lineage) {
              spouseIds.add(m.id);
            } else if (filteredMemberIds.has(m.id) && m.is_direct_lineage) {
              spouseIds.add(spouse.id);
            }
          } else if (filteredMemberIds.has(m.id) && m.id < spouse.id && !spouseIds.has(m.id)) {
            spouseIds.add(spouse.id);
          }
        }
      }
    });

    // 2. Xây dựng bản đồ Cha/Mẹ -> Con cái chuẩn xác hai chiều
    const parentToChildrenMap = new Map<string, Set<string>>();
    const childHasParentSet = new Set<string>();

    const registerParentChild = (parentId: string, childId: string) => {
      if (!parentId || !childId || parentId === childId) return;

      // Chống vòng lặp ngược: Con không thể là cha của chính cha mình
      if (parentToChildrenMap.get(childId)?.has(parentId)) return;

      // Kiểm tra thế hệ: Cha mẹ phải có số đời nhỏ hơn hoặc bằng con
      const pGen = genMap.get(memberMap.get(parentId)?.generation_id || '') || 0;
      const cGen = genMap.get(memberMap.get(childId)?.generation_id || '') || 0;
      if (pGen > 0 && cGen > 0 && pGen > cGen) {
        // Nếu bị đảo thứ tự đời (pGen > cGen): Đảo lại đúng chiều
        if (!parentToChildrenMap.has(childId)) {
          parentToChildrenMap.set(childId, new Set());
        }
        parentToChildrenMap.get(childId)!.add(parentId);
        childHasParentSet.add(parentId);
        return;
      }

      if (!parentToChildrenMap.has(parentId)) {
        parentToChildrenMap.set(parentId, new Set());
      }
      parentToChildrenMap.get(parentId)!.add(childId);
      childHasParentSet.add(childId);
    };

    // Nạp quan hệ từ bảng relationships
    relationships.forEach((r) => {
      const relType = r.relationship_type || r.relationship;
      if (relType === 'CHILD') {
        // member_id là cha/mẹ, related_member_id là con
        registerParentChild(r.member_id, r.related_member_id);
      } else if (relType === 'PARENT') {
        // Harmonize: nếu member_id có thế hệ nhỏ hơn thì member_id là cha mẹ
        const m1 = memberMap.get(r.member_id);
        const m2 = memberMap.get(r.related_member_id);
        const gen1 = genMap.get(m1?.generation_id || '') || 0;
        const gen2 = genMap.get(m2?.generation_id || '') || 0;
        if (gen1 > 0 && gen2 > 0 && gen1 < gen2) {
          registerParentChild(r.member_id, r.related_member_id);
        } else {
          registerParentChild(r.related_member_id, r.member_id);
        }
      }
    });

    // Nạp thêm từ trường father_id / mother_id / parent_id trên member (nếu có)
    members.forEach((m: any) => {
      if (m.father_id) registerParentChild(m.father_id, m.id);
      if (m.mother_id) registerParentChild(m.mother_id, m.id);
      if (m.parent_id) registerParentChild(m.parent_id, m.id);
    });

    // Tự động phân giải cây từ ghi chú 'Mã cây: ...' và 'Mã cha: ...' (Phục hồi phân cấp từ Excel)
    const treeCodeToMemberId = new Map<string, string>();
    members.forEach((m) => {
      if (m.bio) {
        const treeMatch = m.bio.match(/Mã cây:\s*([^\s•|]+)/i);
        if (treeMatch && treeMatch[1]) {
          treeCodeToMemberId.set(treeMatch[1].trim().toUpperCase(), m.id);
        }
      }
    });

    members.forEach((m) => {
      if (m.bio) {
        const parentMatch = m.bio.match(/Mã cha:\s*([^\s•|]+)/i);
        if (parentMatch && parentMatch[1]) {
          const pCode = parentMatch[1].trim().toUpperCase();
          const pId = treeCodeToMemberId.get(pCode);
          if (pId) {
            registerParentChild(pId, m.id);
          }
        }
        const spouseMatch = m.bio.match(/Mã phối ngẫu:\s*([^\s•|]+)/i);
        if (spouseMatch && spouseMatch[1]) {
          const sCode = spouseMatch[1].trim().toUpperCase();
          const sId = treeCodeToMemberId.get(sCode);
          if (sId) {
            if (m.gender === 'FEMALE') {
              if (filteredMemberIds.has(sId) && !m.is_direct_lineage) {
                spouseIds.add(m.id);
              }
            } else {
              const spouseMember = memberMap.get(sId);
              if (spouseMember && spouseMember.gender === 'FEMALE' && filteredMemberIds.has(m.id)) {
                spouseIds.add(sId);
              }
            }
          }
        }
      }
    });

    // 3. Root Members: Không có cha mẹ trong cây và không phải là vợ phụ thuộc
    let roots = filteredMembers.filter((m) => !childHasParentSet.has(m.id) && !spouseIds.has(m.id));

    // Fallback nếu không có root hoặc tất cả đều có liên kết
    if (roots.length === 0 && filteredMembers.length > 0) {
      const minGenNum = Math.min(
        ...filteredMembers.map((m) => genMap.get(m.generation_id || '') || m.generation_index || 1)
      );
      roots = filteredMembers.filter(
        (m) => (genMap.get(m.generation_id || '') || m.generation_index || 1) === minGenNum && !spouseIds.has(m.id)
      );
    }

    // Nếu vẫn rỗng (ví dụ toàn bộ là nữ)
    if (roots.length === 0 && filteredMembers.length > 0) {
      const minGenNum = Math.min(
        ...filteredMembers.map((m) => genMap.get(m.generation_id || '') || m.generation_index || 1)
      );
      roots = filteredMembers.filter(
        (m) => (genMap.get(m.generation_id || '') || m.generation_index || 1) === minGenNum
      );
    }

    // Sắp xếp các roots theo thế hệ tăng dần (Đời 1 lên trước), sau đó theo thứ tự sinh / tên
    roots.sort((a, b) => {
      const genA = genMap.get(a.generation_id || '') || a.generation_index || 1;
      const genB = genMap.get(b.generation_id || '') || b.generation_index || 1;
      if (genA !== genB) return genA - genB;
      const orderA = a.birth_order || 1;
      const orderB = b.birth_order || 1;
      if (orderA !== orderB) return orderA - orderB;
      return a.full_name.localeCompare(b.full_name);
    });

    const visited = new Set<string>();

    function buildNode(member: Member): FamilyTreeNodeData {
      visited.add(member.id);
      const genNum = genMap.get(member.generation_id || '') || 1;

      // Tìm danh sách vợ / chồng
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

      if (member.spouse_id) {
        const spouse = members.find((m) => m.id === member.spouse_id);
        if (spouse && !memberSpouses.some((s) => s.id === spouse.id)) {
          memberSpouses.push(spouse);
          visited.add(spouse.id);
        }
      }

      // Lấy danh sách con cái từ parentToChildrenMap cho cả member và các spouse
      const childIdsSet = new Set<string>();
      const pIds = [member.id, ...memberSpouses.map((s) => s.id)];
      pIds.forEach((pId) => {
        const cIds = parentToChildrenMap.get(pId);
        if (cIds) {
          cIds.forEach((cId) => childIdsSet.add(cId));
        }
      });

      const childMembers: Member[] = [];
      childIdsSet.forEach((cId) => {
        const child = members.find((m) => m.id === cId);
        if (child && !childMembers.some((c) => c.id === child.id)) {
          childMembers.push(child);
        }
      });

      // Sắp xếp con cái theo thứ tự năm sinh hoặc tên
      childMembers.sort((a, b) => {
        const yearA = a.birth_solar_date ? new Date(a.birth_solar_date).getFullYear() : (a as any).birth_year || 0;
        const yearB = b.birth_solar_date ? new Date(b.birth_solar_date).getFullYear() : (b as any).birth_year || 0;
        if (yearA !== yearB) return yearA - yearB;
        return a.full_name.localeCompare(b.full_name);
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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

      {/* 🧭 Top Floating Heritage Control & Search Bar */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto max-w-[calc(100vw-2rem)]">
        {/* Bộ lọc Chi Phái */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#166534] dark:text-emerald-400 shrink-0" />
          <span className="font-bold hidden sm:inline">Chi Phái:</span>
          <select
            value={selectedBranchId || ''}
            onChange={(e) => onBranchChange && onBranchChange(e.target.value)}
            className="font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 rounded-xl px-2 sm:px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer max-w-[180px] sm:max-w-xs truncate"
          >
            <option value="">Toàn Thể Dòng Họ (Đa Chi)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🔍 Hộp Tìm Kiếm Nhanh Thành Viên & Auto-Pan */}
        <div className="search-container relative">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center px-3 py-1.5 sm:py-2 gap-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm nhanh thành viên..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none w-32 sm:w-44"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && filteredSearchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-64 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-30 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Tìm thấy {filteredSearchResults.length} kết quả
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredSearchResults.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      panToMember(m.id);
                      onSelectMember(m);
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {m.gender === 'MALE' ? '👨' : '👩'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {m.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {m.courtesy_name ? `Hiệu: ${m.courtesy_name}` : m.life_status === 'DECEASED' ? '🕯️ Tiên tổ' : '🌿 Thành viên'}
                      </div>
                    </div>
                    <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 📐 Nút Kích Hoạt Chế Độ Đo Xưng Hô (Kinship Mode) */}
        <button
          type="button"
          onClick={() => {
            setIsKinshipMode(!isKinshipMode);
            setKinshipPersonA(null);
            setKinshipPersonB(null);
            setKinshipResult(null);
          }}
          className={`px-3 py-1.5 sm:py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
            isKinshipMode
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500 ring-2 ring-amber-400/40'
              : 'bg-white/95 dark:bg-slate-900/95 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isKinshipMode ? 'Đang Đo Xưng Hô' : 'Đo Xưng Hô'}</span>
        </button>

        {/* Nút Bật/Tắt Mini-Map */}
        <button
          type="button"
          onClick={() => setShowMinimap(!showMinimap)}
          title="Bật / Tắt Bản Đồ Thu Nhỏ"
          className={`p-2 rounded-2xl border text-xs font-bold transition shadow-md ${
            showMinimap
              ? 'bg-emerald-800 text-white border-emerald-700'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <MapIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 🌟 Floating Kinship Result Banner (Khi kích hoạt chế độ Đo Xưng Hô) */}
      {isKinshipMode && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-20 bg-gradient-to-br from-amber-900/95 via-[#854D0E]/95 to-amber-950/95 backdrop-blur-md border-2 border-amber-400 text-white p-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/40">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-200">
              <Users className="w-4 h-4 text-amber-300" />
              <span>THƯỚC ĐO QUAN HỆ XƯNG HÔ GIA TỘC</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsKinshipMode(false);
                setKinshipPersonA(null);
                setKinshipPersonB(null);
                setKinshipResult(null);
              }}
              className="text-amber-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`p-2 rounded-xl border ${kinshipPersonA ? 'bg-amber-800/80 border-amber-300 font-bold' : 'bg-black/30 border-dashed border-amber-500/40 text-amber-200/60'}`}>
                <div className="text-[10px] text-amber-300 uppercase">Người Thứ Nhất (A)</div>
                <div className="truncate font-serif mt-0.5">{kinshipPersonA ? kinshipPersonA.full_name : '👉 Nhấp chọn trên cây'}</div>
              </div>
              <div className={`p-2 rounded-xl border ${kinshipPersonB ? 'bg-amber-800/80 border-amber-300 font-bold' : 'bg-black/30 border-dashed border-amber-500/40 text-amber-200/60'}`}>
                <div className="text-[10px] text-amber-300 uppercase">Người Thứ Hai (B)</div>
                <div className="truncate font-serif mt-0.5">{kinshipPersonB ? kinshipPersonB.full_name : '👉 Nhấp chọn trên cây'}</div>
              </div>
            </div>

            {isCalculatingKinship && (
              <div className="py-2 text-center text-amber-300 italic text-[11px]">
                Đang tra cứu thế thứ và quan hệ huyết thống...
              </div>
            )}

            {kinshipResult && !isCalculatingKinship && (
              <div className="mt-2 pt-2 border-t border-amber-500/40 space-y-1.5">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-amber-400/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-200">{kinshipPersonA?.full_name} gọi {kinshipPersonB?.full_name} là:</span>
                    <span className="font-bold text-amber-300 text-sm font-serif">{kinshipResult.term_a_calls_b}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-amber-500/20">
                    <span className="text-amber-200">{kinshipPersonB?.full_name} gọi {kinshipPersonA?.full_name} là:</span>
                    <span className="font-bold text-amber-300 text-sm font-serif">{kinshipResult.term_b_calls_a}</span>
                  </div>
                </div>
                <div className="text-[11px] text-amber-100/90 leading-relaxed bg-amber-950/60 p-2 rounded-xl">
                  📖 <span className="italic">{kinshipResult.explanation}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🗺️ MINI-MAP THU NHỎ (Góc Dưới Bên Trái) */}
      {showMinimap && (
        <div className="minimap-container absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-2 shadow-2xl pointer-events-auto hidden sm:block">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Bản Đồ Cây Phả Hệ</span>
            <button
              type="button"
              onClick={() => setShowMinimap(false)}
              className="hover:text-slate-800 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const pctX = clickX / rect.width;
              const pctY = clickY / rect.height;

              const contentW = treeContentRef.current?.scrollWidth || 2400;
              const contentH = treeContentRef.current?.scrollHeight || 1600;
              const containerW = containerRef.current?.clientWidth || 1000;
              const containerH = containerRef.current?.clientHeight || 800;

              const targetContentX = pctX * contentW;
              const targetContentY = pctY * contentH;

              setPan({
                x: Math.round(containerW / 2 - targetContentX * zoom),
                y: Math.round(containerH / 2 - targetContentY * zoom),
              });
            }}
            className="w-40 h-28 bg-emerald-950/10 dark:bg-emerald-950/40 rounded-xl relative overflow-hidden cursor-crosshair border border-emerald-200 dark:border-emerald-800 flex items-center justify-center"
          >
            {/* Render Abstract Tree Representation */}
            <div className="flex flex-col items-center gap-1 opacity-70 scale-75">
              <div className="w-6 h-2 bg-emerald-800 rounded-full" />
              <div className="w-16 h-1.5 bg-emerald-600 rounded-full" />
              <div className="w-24 h-1.5 bg-emerald-500 rounded-full" />
            </div>

            {/* Viewport Indicator Rectangle */}
            {(() => {
              const contentW = treeContentRef.current?.scrollWidth || 2400;
              const contentH = treeContentRef.current?.scrollHeight || 1600;
              const containerW = containerRef.current?.clientWidth || 1000;
              const containerH = containerRef.current?.clientHeight || 800;

              const viewRatioW = Math.min(100, Math.max(12, (containerW / (contentW * zoom)) * 100));
              const viewRatioH = Math.min(100, Math.max(12, (containerH / (contentH * zoom)) * 100));

              const leftPct = Math.min(
                100 - viewRatioW,
                Math.max(0, ((-pan.x / zoom) / contentW) * 100)
              );
              const topPct = Math.min(
                100 - viewRatioH,
                Math.max(0, ((-pan.y / zoom) / contentH) * 100)
              );

              return (
                <div
                  className="absolute border-2 border-emerald-600 bg-emerald-500/20 rounded shadow-xs pointer-events-none transition-all duration-75"
                  style={{
                    width: `${viewRatioW}%`,
                    height: `${viewRatioH}%`,
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                  }}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Floating Canvas Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-1 sm:p-1.5 shadow-xl pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Thu nhỏ (-)"
          className="canvas-control-button p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="px-1.5 sm:px-2 font-mono text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[40px] sm:min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </div>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Phóng to (+)"
          className="canvas-control-button p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={handleResetZoom}
          title="Thu phóng 100%"
          className="canvas-control-button p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100%</span>
        </button>

        <button
          type="button"
          onClick={handleFitToView}
          title="Xem toàn bộ cây phả hệ"
          className="canvas-control-button px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
        >
          <span className="hidden sm:inline">Xem Toàn Bộ</span>
          <span className="sm:hidden">Toàn Bộ</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
          className="canvas-control-button p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
        <div ref={treeContentRef} className="inline-flex items-start justify-center gap-24 p-16 min-w-max">
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
                  selectedMemberId={selectedMemberId || highlightedMemberId}
                  onSelectMember={handleMemberCardClick}
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
