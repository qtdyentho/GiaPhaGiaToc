import React, { useState } from 'react';
import { X, UserPlus, Heart, Users, Sparkles, Check } from 'lucide-react';
import { Member, Generation, Branch, RelationshipType, GenderType, MemberLifeStatus } from '../../types/database';
import { GenealogyService } from '../../services/GenealogyService';

interface AddMemberRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetMember?: Member | null;
  initialRelationType?: RelationshipType;
  generations: Generation[];
  branches: Branch[];
}

export const AddMemberRelationModal: React.FC<AddMemberRelationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetMember,
  initialRelationType = 'CHILD',
  generations,
  branches,
}) => {
  const [relationType, setRelationType] = useState<RelationshipType>(initialRelationType);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<GenderType>(initialRelationType === 'SPOUSE' && targetMember?.gender === 'MALE' ? 'FEMALE' : 'MALE');
  const [lifeStatus, setLifeStatus] = useState<MemberLifeStatus>('ALIVE');
  const [birthYear, setBirthYear] = useState<string>('');
  const [deathLunarDay, setDeathLunarDay] = useState<string>('');
  const [deathLunarMonth, setDeathLunarMonth] = useState<string>('');
  const [deathLunarYear, setDeathLunarYear] = useState<string>('');
  const [burialPlace, setBurialPlace] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(targetMember?.branch_id || branches[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate target generation based on relation
  const targetGenIndex = generations.findIndex((g) => g.id === targetMember?.generation_id);
  let calculatedGenId = targetMember?.generation_id || generations[0]?.id;
  if (relationType === 'CHILD' && targetGenIndex !== -1 && targetGenIndex + 1 < generations.length) {
    calculatedGenId = generations[targetGenIndex + 1].id;
  } else if (relationType === 'PARENT' && targetGenIndex !== -1 && targetGenIndex - 1 >= 0) {
    calculatedGenId = generations[targetGenIndex - 1].id;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên thành viên');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const names = fullName.trim().split(' ');
      const firstName = names.pop() || '';
      const lastName = names.join(' ');

      const res = await GenealogyService.addMember(
        {
          family_id: targetMember?.family_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          generation_id: calculatedGenId,
          branch_id: selectedBranchId,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName.trim(),
          gender,
          life_status: lifeStatus,
          birth_solar_date: birthYear ? `${birthYear}-01-01` : undefined,
          death_lunar_day: deathLunarDay ? parseInt(deathLunarDay, 10) : undefined,
          death_lunar_month: deathLunarMonth ? parseInt(deathLunarMonth, 10) : undefined,
          death_lunar_year: deathLunarYear ? parseInt(deathLunarYear, 10) : undefined,
          burial_place: burialPlace.trim() || undefined,
          bio: bio.trim() || undefined,
        },
        targetMember
          ? {
              targetMemberId: targetMember.id,
              relationType: relationType,
            }
          : undefined
      );

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Không thể thêm thành viên');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Thêm Thành Viên Vào Phả Hệ
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                  Cây Gia Phả
                </span>
              </h3>
              {targetMember && (
                <p className="text-xs text-slate-400">
                  Quan hệ gắn liền với: <strong className="text-amber-400">{targetMember.full_name}</strong>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Chọn Mối Quan Hệ (nếu có targetMember) */}
          {targetMember && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Xác định quan hệ họ tộc
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRelationType('CHILD');
                    setGender('MALE');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    relationType === 'CHILD'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-medium">Là Con (Hậu duệ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRelationType('SPOUSE');
                    setGender(targetMember.gender === 'MALE' ? 'FEMALE' : 'MALE');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    relationType === 'SPOUSE'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-sm shadow-rose-500/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-xs font-medium">Là Vợ / Chồng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRelationType('PARENT')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    relationType === 'PARENT'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-medium">Là Cha / Mẹ</span>
                </button>
              </div>
            </div>
          )}

          {/* Thông Tin Cơ Bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Họ và tên thành viên <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Cụ Nguyễn Văn An / Nguyễn Văn Bình..."
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Giới tính</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    gender === 'MALE'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  👨 Nam (Đinh)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    gender === 'FEMALE'
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  👩 Nữ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tình trạng nhân khẩu</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLifeStatus('ALIVE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    lifeStatus === 'ALIVE'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  🌿 Còn sống
                </button>
                <button
                  type="button"
                  onClick={() => setLifeStatus('DECEASED')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    lifeStatus === 'DECEASED'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  🕯️ Đã tạ thế (Hưởng thọ)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Thuộc Chi / Nhánh Họ</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Năm sinh (Dương lịch)</label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="VD: 1985"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Phần Dành Riêng Cho Người Đã Mất */}
          {lifeStatus === 'DECEASED' && (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <span>🕯️ Thông tin ngày giỗ & an táng</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ngày Giỗ (Âm lịch)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={deathLunarDay}
                    onChange={(e) => setDeathLunarDay(e.target.value)}
                    placeholder="Ngày (1-30)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tháng Giỗ (Âm lịch)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={deathLunarMonth}
                    onChange={(e) => setDeathLunarMonth(e.target.value)}
                    placeholder="Tháng (1-12)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Năm tạ thế</label>
                  <input
                    type="number"
                    value={deathLunarYear}
                    onChange={(e) => setDeathLunarYear(e.target.value)}
                    placeholder="VD: 1980"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nơi an táng / Mộ phần</label>
                <input
                  type="text"
                  value={burialPlace}
                  onChange={(e) => setBurialPlace(e.target.value)}
                  placeholder="VD: Khu Lăng Mộ Tổ, Nghĩa trang Thôn Đông Khê..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Tiểu sử tóm tắt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tiểu sử, công trạng & ghi chú
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="VD: Có công lập ấp, cử nhân Nho học, đóng góp xây dựng từ đường..."
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Lưu Vào Cây</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
