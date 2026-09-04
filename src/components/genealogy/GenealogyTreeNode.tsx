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
  const lineageInfo = React.useMemo(
    () => getLineageHierarchyInfo(m, generations, branches, allMembers),
    [m, generations, branches, allMembers]
  );
  const isCollapsed = collapsedNodeIds ? collapsedNodeIds.has(m.id) : false;

  return (
    <div className="flex flex-col items-center relative">
      {/* 🏛️ KHỐI VỢ CHỒNG (NUCLEAR COUPLE CONTAINER) */}
      <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 relative group z-10">
        {/* Thẻ Thành Viên Trực Hệ (Chồng / Vị Đứng Đầu Nhánh) */}
        <div
          id={`member-node-${m.id}`}
          data-member-id={m.id}
          onClick={() => onSelectMember(m)}
          className={`member-card-interactive w-64 bg-white dark:bg-slate-800 rounded-2xl p-4 transition-all duration-200 cursor-pointer border-2 ${
            isSelected
              ? 'border-[#166534] dark:border-emerald-400 ring-4 ring-emerald-500/20 bg-emerald-50/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500'
          }`}
        >
          {/* Huy hiệu thứ bậc dòng họ */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-serif truncate max-w-[140px] ${lineageInfo.badgeColor}`}>
              {lineageInfo.badgeLabel}
            </span>
            <span className={`text-[10px] font-bold ${isDeceased ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {isDeceased ? '🕯️ Tiên Tổ' : '🌿 Còn Sống'}
            </span>
          </div>

          {/* Thông tin cơ bản */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              {m.avatar_url ? (
                <img
                  src={m.avatar_url}
                  alt={m.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xs ${
                    m.gender === 'MALE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}
                >
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

          {/* Chân thẻ */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-[10px] text-[#166534] dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              <span>Xem 360°</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium font-serif">
              {lineageInfo.levelName} (Đời {generationNumber})
            </span>
          </div>
        </div>

        {/* Biểu tượng Hôn Phối ❖ */}
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

        {/* Danh sách Vợ / Chồng (Xếp ngang hàng chuẩn mực, sắp xếp theo thứ tự hôn phối) */}
        {(() => {
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

          return sortedSpouses.map((s, sIdx) => {
            const isSpouseSelected = selectedMemberId === s.id;
            const isSpouseDeceased = s.life_status === 'DECEASED';
            const isMaleSpouse = s.gender === 'MALE';

            let spouseTitle = '';
            let spouseBadgeColor = '';

            if (isMaleSpouse) {
              if (s.spouse_rank === 'CHINH_THAT' || sIdx === 0) {
                spouseTitle = '👑 Phu Quân (Chính Phu)';
              } else if (s.spouse_rank === 'KE_THAT' || sIdx === 1) {
                spouseTitle = '🌿 Kế Phu';
              } else if (s.spouse_rank === 'THAC_THAT' || sIdx === 2) {
                spouseTitle = '🍃 Trượng Phu';
              } else {
                spouseTitle = `🌸 Trượng Phu ${sIdx + 1}`;
              }
              spouseBadgeColor =
                sIdx === 0
                  ? 'border-blue-300 text-blue-900 bg-blue-50 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700'
                  : sIdx === 1
                  ? 'border-teal-300 text-teal-900 bg-teal-50 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-700'
                  : 'border-slate-200 text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800';
            } else {
              if (s.spouse_rank === 'CHINH_THAT' || sIdx === 0) {
                spouseTitle = '👑 Bà Cả (Chính Thất)';
              } else if (s.spouse_rank === 'KE_THAT' || sIdx === 1) {
                spouseTitle = '🌿 Bà Hai (Kế Thất)';
              } else if (s.spouse_rank === 'THAC_THAT' || sIdx === 2) {
                spouseTitle = '🍃 Bà Ba (Trắc Thất)';
              } else {
                spouseTitle = `🌸 Bà Thứ ${sIdx + 1}`;
              }
              spouseBadgeColor =
                sIdx === 0
                  ? 'border-amber-300 text-amber-900 bg-amber-50 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                  : sIdx === 1
                  ? 'border-teal-300 text-teal-900 bg-teal-50 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-700'
                  : 'border-rose-200 text-rose-900 bg-rose-50 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
            }

            return (
              <div
                key={s.id}
                id={`member-node-${s.id}`}
                data-member-id={s.id}
                onClick={() => onSelectMember(s)}
                className={`member-card-interactive w-60 bg-white dark:bg-slate-800 rounded-2xl p-4 transition-all duration-200 cursor-pointer border-2 ${
                  isSpouseSelected
                    ? isMaleSpouse
                      ? 'border-blue-500 ring-4 ring-blue-500/20 bg-blue-50/20'
                      : 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/20'
                    : isMaleSpouse
                    ? 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-serif ${spouseBadgeColor}`}>
                    {spouseTitle}
                  </span>
                  <span className={`text-[10px] font-bold ${isSpouseDeceased ? 'text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {isSpouseDeceased ? '🕯️ Đã Mất' : '🌿 Còn Sống'}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xs shrink-0 ${
                      isMaleSpouse
                        ? sIdx === 0
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-900'
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-800'
                        : sIdx === 0
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800'
                    }`}
                  >
                    {isMaleSpouse ? '👨' : '👩'}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate font-serif">
                      {s.full_name.replace(/\(.*?\)/g, '').trim()}
                    </h4>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {isSpouseDeceased && s.death_lunar_day && s.death_lunar_month
                        ? `Giỗ: ${s.death_lunar_day}/${s.death_lunar_month} ÂL`
                        : isMaleSpouse
                        ? 'Trượng phu phụng thờ'
                        : 'Hiền thê phụng thờ'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className={`text-[10px] ${isMaleSpouse ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400'} font-bold flex items-center gap-0.5`}>
                    <Eye className="w-3 h-3" />
                    <span>Xem 360°</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-serif">Hôn Phối Đời {generationNumber}</span>
                </div>
              </div>
            );
          });
        })()}

        {/* Nút Thao Tác Thêm Nhanh (Thêm Con / Thêm Hôn Phối) */}
        {onAddRelation && (
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
              title={
                m.gender === 'FEMALE'
                  ? spouses.length === 0
                    ? 'Thêm Chồng (Phu Quân)'
                    : 'Thêm Kế Phu / Trượng Phu'
                  : spouses.length === 0
                  ? 'Thêm Vợ (Chính Thất)'
                  : 'Thêm Kế Thất / Thứ Thiếp'
              }
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-800 dark:text-rose-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-800"
            >
              <Heart className="w-3 h-3" />
              <span className="hidden group-hover:inline">
                {m.gender === 'FEMALE'
                  ? spouses.length === 0
                    ? 'Thêm Chồng'
                    : '+ Thêm Phu Quân'
                  : spouses.length === 0
                  ? 'Thêm Vợ'
                  : '+ Thêm Thứ Thất'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 🌿 DÂY NỐI PHẢ HỆ VÀ CÁC CHI NHÁNH CON (CHILDREN BRANCHING CONNECTOR) */}
      {children.length > 0 && (
        <div className="flex flex-col items-center w-full relative">
          {/* Trục đứng liên tục từ đáy cha mẹ xuyên qua badge xuống thanh ngang con */}
          <div className="relative flex flex-col items-center justify-center my-1">
            {/* Dây đứng xuyên suốt không đứt đoạn */}
            {!isCollapsed && <div className="absolute inset-y-0 w-[2px] bg-emerald-600/80 dark:bg-emerald-400/80" />}
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
                    : 'bg-[#166534] hover:bg-[#15803d] text-white border-emerald-500/40'
                }`}
                title={isCollapsed ? "Bấm để mở rộng cành con cháu" : "Bấm để thu gọn cành con cháu"}
              >
                <Sparkles className={`w-3 h-3 ${isCollapsed ? 'text-white' : 'text-amber-300'}`} />
                <span>
                  {isCollapsed
                    ? `[+] ${children.length} Hậu Duệ (Đã Thu Gọn)`
                    : `${children.length} Hậu Duệ (Đời Thứ ${generationNumber + 1})`}
                </span>
              </button>
            </div>
          </div>

          {/* Khung chứa các con: Căn giữa hoàn hảo so với cha mẹ (chỉ hiển thị khi không thu gọn) */}
          {!isCollapsed && (
            <div className="flex items-start justify-center relative pt-6 animate-fade-in">
              {/* Render từng con cháu đệ quy với thanh nối liền mạch chuẩn xác */}
              {children.map((childNode, cIdx) => (
                <div key={childNode.id} className="flex flex-col items-center relative px-6">
                  {/* Đường dây nhánh ngang (Horizontal Connector Segment) */}
                  {children.length > 1 && (
                    <div
                      className={`absolute top-0 h-[2px] bg-emerald-600/80 dark:bg-emerald-400/80 ${
                        cIdx === 0
                          ? 'left-1/2 right-0'
                          : cIdx === children.length - 1
                          ? 'left-0 right-1/2'
                          : 'left-0 right-0'
                      }`}
                    />
                  )}

                  {/* Đường đứng nối từ thanh ngang xuống đỉnh của người con */}
                  <div className="w-[2px] h-6 bg-emerald-600/80 dark:bg-emerald-400/80 absolute -top-6 left-1/2 -translate-x-1/2" />

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
