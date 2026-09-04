import React from 'react';
import { Calendar, Eye, Heart, Plus, Users, Sparkles } from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';
import { getLineageHierarchyInfo } from '../../utils/lineageHierarchy';

export interface FamilyTreeNodeData {
  id: string;
  primaryMember: Member;
  spouses: Member[];
  children: FamilyTreeNodeData[];
  generationNumber: number;
}

interface GenealogyTreeNodeProps {
  node: FamilyTreeNodeData;
  generations: Generation[];
  branches: Branch[];
  allMembers: Member[];
  selectedMemberId?: string | null;
  onSelectMember: (member: Member) => void;
  onAddRelation?: (targetMember: Member, defaultType: 'CHILD' | 'SPOUSE' | 'PARENT') => void;
  collapsedNodeIds?: Set<string>;
  onToggleCollapse?: (nodeId: string) => void;
}

const GenealogyTreeNodeComponent: React.FC<GenealogyTreeNodeProps> = ({
  node,
  generations,
  branches,
  allMembers,
  selectedMemberId,
  onSelectMember,
  onAddRelation,
  collapsedNodeIds,
  onToggleCollapse,
}) => {
  const { primaryMember: m, spouses, children, generationNumber } = node;
  const isSelected = selectedMemberId === m.id;
  const isDeceased = m.life_status === 'DECEASED';
  const isMale = m.gender === 'MALE';
  const lineageInfo = React.useMemo(
    () => getLineageHierarchyInfo(m, generations, branches, allMembers),
    [m, generations, branches, allMembers]
  );
  const isCollapsed = collapsedNodeIds ? collapsedNodeIds.has(m.id) : false;

  // Render a Member Card according to reference image visual language
  const renderMemberCard = (
    member: Member,
    isPrimary: boolean,
    spouseTitle?: string,
    spouseBadgeColor?: string
  ) => {
    const isMemSelected = selectedMemberId === member.id;
    const isMemDeceased = member.life_status === 'DECEASED';
    const isMemMale = member.gender === 'MALE';

    // Birth year formatting
    const birthYear = member.birth_solar_date
      ? new Date(member.birth_solar_date).getFullYear()
      : (member as any).birth_year || null;

    return (
      <div
        key={member.id}
        id={`member-node-${member.id}`}
        data-member-id={member.id}
        onClick={() => onSelectMember(member)}
        className={`member-card-interactive w-56 rounded-3xl p-4 transition-all duration-200 cursor-pointer border-2 shadow-sm hover:shadow-lg relative select-none ${
          isMemMale
            ? isMemSelected
              ? 'bg-sky-100/90 dark:bg-sky-950/80 border-sky-500 ring-4 ring-sky-500/20'
              : 'bg-sky-50/85 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 hover:border-sky-600'
            : isMemSelected
            ? 'bg-pink-100/90 dark:bg-pink-950/80 border-pink-500 ring-4 ring-pink-500/20'
            : 'bg-pink-50/85 dark:bg-pink-950/40 border-pink-400 dark:border-pink-500 hover:border-pink-600'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-serif truncate max-w-[130px] ${
              spouseBadgeColor || lineageInfo.badgeColor
            }`}
          >
            {spouseTitle || lineageInfo.badgeLabel}
          </span>
          <span
            className={`text-[10px] font-bold ${
              isMemDeceased
                ? 'text-slate-400 dark:text-slate-500'
                : isMemMale
                ? 'text-sky-700 dark:text-sky-400'
                : 'text-pink-700 dark:text-pink-400'
            }`}
          >
            {isMemDeceased ? '🕯️ Đã Mất' : '🌿 Còn Sống'}
          </span>
        </div>

        {/* Card Body: Circular Avatar + Name + Birth Year */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className={`w-12 h-12 rounded-full object-cover border-2 shadow-xs ${
                  isMemMale ? 'border-sky-400 dark:border-sky-500' : 'border-pink-400 dark:border-pink-500'
                }`}
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xs border-2 ${
                  isMemMale
                    ? 'bg-sky-200/70 dark:bg-sky-900/60 border-sky-400 text-sky-800 dark:text-sky-200'
                    : 'bg-pink-200/70 dark:bg-pink-900/60 border-pink-400 text-pink-800 dark:text-pink-200'
                }`}
              >
                {isMemMale ? '👨' : '👩'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <h4
              className={`font-bold text-sm truncate font-serif ${
                isMemMale
                  ? 'text-slate-900 dark:text-slate-100 group-hover:text-sky-700'
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-pink-700'
              }`}
            >
              {member.full_name.replace(/\(.*?\)/g, '').trim()}
            </h4>

            <div className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                {birthYear
                  ? birthYear
                  : isMemDeceased && member.death_lunar_day && member.death_lunar_month
                  ? `Giỗ: ${member.death_lunar_day}/${member.death_lunar_month} ÂL`
                  : 'Ghi chép ngọc phả'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer: Xem 360° & Level & Quick Action Buttons */}
        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span
            className={`text-[10px] font-bold flex items-center gap-0.5 ${
              isMemMale ? 'text-sky-700 dark:text-sky-400' : 'text-pink-700 dark:text-pink-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Xem 360°</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium font-serif">
            {isPrimary ? `${lineageInfo.levelName} (Đời ${generationNumber})` : `Hôn Phối Đời ${generationNumber}`}
          </span>
        </div>

        {/* ⚡ HÀNG NÚT THÊM NHANH CON / HÔN PHỐI TRỰC TIẾP TRÊN MỖI THẺ */}
        {onAddRelation && (
          <div className="mt-2 pt-1.5 border-t border-dashed border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddRelation(member, 'CHILD');
              }}
              title={`Thêm Con cho ${member.full_name}`}
              className="flex-1 py-1 px-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-sky-100 dark:hover:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-[10px] font-bold transition flex items-center justify-center gap-1 border border-sky-300 dark:border-sky-700 shadow-2xs hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-3 h-3 text-sky-600" />
              <span>+ Con</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddRelation(member, 'SPOUSE');
              }}
              title={
                member.gender === 'FEMALE'
                  ? `Thêm Chồng (Phu Quân) cho ${member.full_name}`
                  : `Thêm Vợ (Hôn Phối) cho ${member.full_name}`
              }
              className="flex-1 py-1 px-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-pink-100 dark:hover:bg-pink-950/80 text-pink-700 dark:text-pink-300 text-[10px] font-bold transition flex items-center justify-center gap-1 border border-pink-300 dark:border-pink-700 shadow-2xs hover:scale-[1.02] cursor-pointer"
            >
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              <span>{member.gender === 'FEMALE' ? '+ Chồng' : '+ Vợ'}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Sort spouses by rank/order
  const sortedSpouses = [...spouses].sort((a, b) => {
    const orderA = a.marriage_order || 1;
    const orderB = b.marriage_order || 1;
    if (orderA !== orderB) return orderA - orderB;
    const rankPriority: Record<string, number> = {
      CHINH_THAT: 1,
      KE_THAT: 2,
      THAC_THAT: 3,
      KHONG_RO: 4,
    };
    const pA = a.spouse_rank ? rankPriority[a.spouse_rank] || 5 : 5;
    const pB = b.spouse_rank ? rankPriority[b.spouse_rank] || 5 : 5;
    return pA - pB;
  });

  return (
    <div className="flex flex-col items-center relative">
      {/* 🏛️ KHỐI VỢ CHỒNG & HÔN PHỐI (COUPLE CONTAINER) */}
      <div className="flex items-center relative z-10 group">
        {/* Thẻ Thành Viên Chính */}
        {renderMemberCard(m, true)}

        {/* Nếu có Vợ / Chồng: Đường nối ngang cùng Trái Tim ❤️ ở giữa */}
        {sortedSpouses.map((s, sIdx) => {
          const isMaleSpouse = s.gender === 'MALE';
          let spouseTitle = '';
          let spouseBadgeColor = '';

          if (isMaleSpouse) {
            if (s.spouse_rank === 'CHINH_THAT' || sIdx === 0) {
              spouseTitle = '👑 Phu Quân (Chính)';
            } else if (s.spouse_rank === 'KE_THAT' || sIdx === 1) {
              spouseTitle = '🌿 Kế Phu';
            } else {
              spouseTitle = `🌸 Trượng Phu ${sIdx + 1}`;
            }
            spouseBadgeColor = 'border-sky-300 text-sky-900 bg-sky-50 dark:bg-sky-950 dark:text-sky-200';
          } else {
            if (s.spouse_rank === 'CHINH_THAT' || sIdx === 0) {
              spouseTitle = '👑 Bà Cả (Chính Thất)';
            } else if (s.spouse_rank === 'KE_THAT' || sIdx === 1) {
              spouseTitle = '🌿 Bà Hai (Kế Thất)';
            } else {
              spouseTitle = `🌸 Bà Thứ ${sIdx + 1}`;
            }
            spouseBadgeColor = 'border-pink-300 text-pink-900 bg-pink-50 dark:bg-pink-950 dark:text-pink-200';
          }

          return (
            <React.Fragment key={s.id}>
              {/* Connector Giữa Chồng và Vợ với Trái Tim Hồng ❤️ */}
              <div className="flex items-center justify-center relative w-16 px-1">
                {/* Đường nối ngang thẳng tắp */}
                <div className="w-full h-[2px] bg-slate-400 dark:bg-slate-500 absolute" />
                {/* Trái tim hồng ở tâm điểm */}
                <div
                  className="relative z-10 w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-950 border-2 border-pink-400 dark:border-pink-500 flex items-center justify-center text-xs shadow-xs hover:scale-110 transition-transform cursor-pointer"
                  title="Quan hệ Hôn Phối"
                >
                  ❤️
                </div>
              </div>

              {/* Thẻ Vợ / Chồng */}
              {renderMemberCard(s, false, spouseTitle, spouseBadgeColor)}
            </React.Fragment>
          );
        })}

        {/* Nút Thao Tác Thêm Nhanh (Thêm Con / Thêm Hôn Phối) */}
        {onAddRelation && (
          <div className="flex flex-col gap-1.5 ml-3 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddRelation(m, 'CHILD');
              }}
              title="Thêm Con Trai / Con Gái"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-sky-300 dark:border-sky-700 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden group-hover:inline">Thêm Con</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddRelation(m, 'SPOUSE');
              }}
              title={
                m.gender === 'FEMALE'
                  ? spouses.length === 0
                    ? 'Thêm Chồng (Phu Quân)'
                    : 'Thêm Kế Phu / Trượng Phu'
                  : spouses.length === 0
                  ? 'Thêm Vợ (Chính Thất)'
                  : 'Thêm Kế Thất / Thứ Thiếp'
              }
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-pink-300 dark:border-pink-700 shadow-xs"
            >
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              <span className="hidden group-hover:inline">
                {m.gender === 'FEMALE'
                  ? spouses.length === 0
                    ? 'Thêm Chồng'
                    : '+ Kế Phu'
                  : spouses.length === 0
                  ? 'Thêm Vợ'
                  : '+ Kế Thất'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 🌿 DÂY NỐI PHẢ HỆ VÀ CÁC CHI NHÁNH CON (CHILDREN BRANCHING CONNECTOR) */}
      {children.length > 0 && (
        <div className="flex flex-col items-center w-full relative">
          {/* Trục đứng từ khối cha mẹ xuống thanh ngang con cháu */}
          <div className="relative flex flex-col items-center justify-center my-2">
            {/* Dây đứng vuông góc màu slate sắc nét */}
            {!isCollapsed && <div className="absolute inset-y-0 w-[2px] bg-slate-400 dark:bg-slate-500" />}

            {/* Badge Thu Gọn / Mở Rộng Cành Con */}
            <div className="relative z-10 my-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse && onToggleCollapse(m.id);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-xs font-serif inline-flex items-center gap-1.5 border transition-all cursor-pointer hover:scale-105 ${
                  isCollapsed
                    ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
                title={isCollapsed ? 'Bấm để mở rộng cành con cháu' : 'Bấm để thu gọn cành con cháu'}
              >
                <Sparkles className={`w-3 h-3 ${isCollapsed ? 'text-white' : 'text-amber-300'}`} />
                <span>
                  {isCollapsed
                    ? `[+] ${children.length} Hậu Duệ (Đã Thu Gọn)`
                    : `${children.length} Hậu Duệ (Đời ${generationNumber + 1})`}
                </span>
              </button>
            </div>
          </div>

          {/* Khung chứa các con cháu: Căn giữa hoàn hảo so với cha mẹ */}
          {!isCollapsed && (
            <div className="flex items-start justify-center relative pt-6 animate-fade-in">
              {children.map((childNode, cIdx) => (
                <div key={childNode.id} className="flex flex-col items-center relative px-6">
                  {/* Thanh ngang liên kết giữa các con (Horizontal Branch Bar) */}
                  {children.length > 1 && (
                    <div
                      className={`absolute top-0 h-[2px] bg-slate-400 dark:bg-slate-500 ${
                        cIdx === 0
                          ? 'left-1/2 right-0'
                          : cIdx === children.length - 1
                          ? 'left-0 right-1/2'
                          : 'left-0 right-0'
                      }`}
                    />
                  )}

                  {/* Đường đứng vuông góc từ thanh ngang xuống đỉnh thẻ người con */}
                  <div className="w-[2px] h-6 bg-slate-400 dark:bg-slate-500 absolute -top-6 left-1/2 -translate-x-1/2" />

                  {/* Đệ quy Node Con */}
                  <GenealogyTreeNode
                    node={childNode}
                    generations={generations}
                    branches={branches}
                    allMembers={allMembers}
                    selectedMemberId={selectedMemberId}
                    onSelectMember={onSelectMember}
                    onAddRelation={onAddRelation}
                    collapsedNodeIds={collapsedNodeIds}
                    onToggleCollapse={onToggleCollapse}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const GenealogyTreeNode = React.memo(GenealogyTreeNodeComponent);
