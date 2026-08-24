import React from 'react';
import { 
  X, User, Calendar, MapPin, Heart, ArrowRightLeft, 
  ExternalLink, Edit, Plus, Users, Award, ShieldAlert, Sparkles
} from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';
import { useNavigate } from 'react-router-dom';

interface MemberDetailPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
  allMembers: Member[];
  onOpenKinship: (member: Member) => void;
  onOpenAddRelation: (target: Member, relType: 'CHILD' | 'SPOUSE' | 'PARENT') => void;
  onSelectAnotherMember?: (member: Member) => void;
}

export const MemberDetailPopupModal: React.FC<MemberDetailPopupModalProps> = ({
  isOpen,
  onClose,
  member,
  generations,
  branches,
  relationships,
  allMembers,
  onOpenKinship,
  onOpenAddRelation,
  onSelectAnotherMember,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !member) return null;

  // Helpers to fetch related family members
  const getBranch = () => branches.find((b) => b.id === member.branch_id);
  const getGeneration = () => generations.find((g) => g.id === member.generation_id);

  // Parents
  const parentRels = relationships.filter(
    (r) => (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') && r.related_member_id === member.id
  );
  const parents = allMembers.filter((m) => parentRels.some((r) => r.member_id === m.id));

  // Spouses
  const spouseRels = relationships.filter(
    (r) =>
      (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
      (r.member_id === member.id || r.related_member_id === member.id)
  );
  const spouseIds = spouseRels.map((r) => (r.member_id === member.id ? r.related_member_id : r.member_id));
  const spouses = allMembers.filter((m) => spouseIds.includes(m.id));

  // Children
  const childRels = relationships.filter(
    (r) => (r.relationship === 'CHILD' || r.relationship_type === 'CHILD') && r.member_id === member.id
  );
  const children = allMembers.filter((m) => childRels.some((r) => r.related_member_id === m.id));

  const branch = getBranch();
  const generation = getGeneration();
  const isDeceased = member.life_status === 'DECEASED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Modal Top Header Bar */}
        <div className="relative bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-md border-2 border-white/20 ${
                  member.gender === 'MALE' ? 'bg-emerald-900 text-emerald-100' : 'bg-rose-950 text-rose-100'
                }`}>
                  {member.gender === 'MALE' ? '👨' : '👩'}
                </div>
              )}
            </div>

            {/* Name & Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950">
                  {generation ? `Đời thứ ${generation.generation_number}` : 'Đời 1'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  {branch ? branch.name : 'Chi Trưởng'}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isDeceased ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500 text-white'
                }`}>
                  {isDeceased ? '🕯️ Đã Mất' : '🌿 Còn Sống'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white font-serif leading-snug">
                {member.full_name.replace(/\(.*?\)/g, '').trim()}
              </h2>
              <div className="text-xs text-emerald-100">
                {member.gender === 'MALE' ? 'Nam' : 'Nữ'} • Mã định danh: <span className="font-mono">{member.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-slate-800 text-xs">
          
          {/* Sinh Tử & Ngày Giỗ */}
          <div className="bg-[#F7F8F5] p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#166534]" />
              <span>Thông Tin Sinh Tử & Lễ Giỗ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500">Ngày Sinh (Dương Lịch):</span>
                <div className="font-semibold text-slate-900">
                  {member.birth_solar_date ? new Date(member.birth_solar_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  {member.birth_lunar_year && <span className="text-slate-500 font-normal ml-1">({member.birth_lunar_year})</span>}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500">Ngày Giỗ (Âm Lịch):</span>
                <div className="font-semibold text-amber-900">
                  {member.death_lunar_day && member.death_lunar_month
                    ? `Ngày ${member.death_lunar_day} Tháng ${member.death_lunar_month} ÂL`
                    : isDeceased ? 'Chưa lưu ngày giỗ' : '—'}
                  {member.death_lunar_year && <span className="text-slate-500 font-normal ml-1">({member.death_lunar_year})</span>}
                </div>
              </div>

              {member.burial_place && (
                <div className="sm:col-span-2 space-y-0.5">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-700" />
                    <span>Nơi An Táng / Mộ Phần:</span>
                  </span>
                  <div className="font-semibold text-slate-900">
                    {member.burial_place}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quan Hệ Huyết Thống */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#166534]" />
              <span>Quan Hệ Thân Tộc Trong Gia Phả</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cha Mẹ */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                <span className="text-slate-500 font-medium">Bố / Mẹ:</span>
                {parents.length > 0 ? (
                  <div className="space-y-1">
                    {parents.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectAnotherMember && onSelectAnotherMember(p)}
                        className="text-left font-bold text-slate-900 hover:text-[#166534] block hover:underline"
                      >
                        {p.full_name.replace(/\(.*?\)/g, '').trim()} ({p.gender === 'MALE' ? 'Bố' : 'Mẹ'})
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Cụ Thủy Tổ khai sáng</div>
                )}
              </div>

              {/* Vợ / Chồng */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                <span className="text-slate-500 font-medium">Vợ / Chồng:</span>
                {spouses.length > 0 ? (
                  <div className="space-y-1">
                    {spouses.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSelectAnotherMember && onSelectAnotherMember(s)}
                        className="text-left font-bold text-slate-900 hover:text-[#166534] block hover:underline"
                      >
                        {s.full_name.replace(/\(.*?\)/g, '').trim()}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Chưa ghi nhận</div>
                )}
              </div>

              {/* Con Cái */}
              <div className="sm:col-span-2 p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">
                    Con Cái ({children.length} người):
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddRelation(member, 'CHILD');
                    }}
                    className="text-[11px] font-bold text-[#166534] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm con</span>
                  </button>
                </div>

                {children.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {children.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onSelectAnotherMember && onSelectAnotherMember(c)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-800 hover:text-[#166534] font-medium transition cursor-pointer text-xs"
                      >
                        {c.full_name.replace(/\(.*?\)/g, '').trim()} ({c.gender === 'MALE' ? 'Trai' : 'Gái'})
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Chưa có thông tin con cái</div>
                )}
              </div>
            </div>
          </div>

          {/* Tiểu Sử & Ghi Chú */}
          {member.bio && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Tiểu Sử / Công Trạng:</span>
              <p className="text-slate-700 leading-relaxed italic">{member.bio}</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenKinship(member);
            }}
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-800" />
            <span>Tra Cứu Xưng Hô</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddRelation(member, 'CHILD');
              }}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Chỉnh Sửa
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/app/members/${member.id}`);
              }}
              className="px-4 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Xem Hồ Sơ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDetailPopupModal;
