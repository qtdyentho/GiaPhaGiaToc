import React, { useState } from 'react';
import { X, UserPlus, Heart, Users, Sparkles, Calendar, Moon, Sun, Clock, MapPin } from 'lucide-react';
import { Member, Generation, Branch, RelationshipType, GenderType, MemberLifeStatus, ChildLineageType } from '../../types/database';
import { GenealogyService } from '../../services/GenealogyService';
import { useAuth } from '../../contexts/AuthContext';

interface AddMemberRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetMember?: Member | null;
  initialRelationType?: RelationshipType;
  generations: Generation[];
  branches: Branch[];
}

type BirthDateMode = 'SOLAR_FULL' | 'LUNAR_FULL' | 'YEAR_ONLY' | 'UNKNOWN';
type DeathDateMode = 'LUNAR_MEMORIAL' | 'SOLAR_FULL' | 'YEAR_ONLY' | 'UNKNOWN';

const isUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export const AddMemberRelationModal: React.FC<AddMemberRelationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetMember,
  initialRelationType = 'CHILD',
  generations,
  branches,
}) => {
  const { activeFamily, families } = useAuth();
  const [relationType, setRelationType] = useState<RelationshipType>(initialRelationType);
  const [childLineageType, setChildLineageType] = useState<ChildLineageType>('BIOLOGICAL');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<GenderType>(initialRelationType === 'SPOUSE' && targetMember?.gender === 'MALE' ? 'FEMALE' : 'MALE');
  const [lifeStatus, setLifeStatus] = useState<MemberLifeStatus>('ALIVE');
  
  // Birth Date Mode State
  const [birthMode, setBirthMode] = useState<BirthDateMode>('YEAR_ONLY');
  const [birthSolarDay, setBirthSolarDay] = useState<string>('');
  const [birthSolarMonth, setBirthSolarMonth] = useState<string>('');
  const [birthSolarYear, setBirthSolarYear] = useState<string>('');
  const [birthLunarDay, setBirthLunarDay] = useState<string>('');
  const [birthLunarMonth, setBirthLunarMonth] = useState<string>('');
  const [birthLunarYear, setBirthLunarYear] = useState<string>('');
  const [birthYearOnly, setBirthYearOnly] = useState<string>('');

  // Death Date Mode State
  const [deathMode, setDeathMode] = useState<DeathDateMode>('LUNAR_MEMORIAL');
  const [deathLunarDay, setDeathLunarDay] = useState<string>('');
  const [deathLunarMonth, setDeathLunarMonth] = useState<string>('');
  const [deathLunarYear, setDeathLunarYear] = useState<string>('');
  const [deathSolarDay, setDeathSolarDay] = useState<string>('');
  const [deathSolarMonth, setDeathSolarMonth] = useState<string>('');
  const [deathSolarYear, setDeathSolarYear] = useState<string>('');
  const [deathYearOnly, setDeathYearOnly] = useState<string>('');
  
  const [burialPlace, setBurialPlace] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(targetMember?.branch_id || branches[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Lấy family_id chuẩn xác của gia tộc đang chọn
  const resolvedFamilyId = targetMember?.family_id || activeFamily?.id || (families[0]?.id || '');

  // Tính toán đời thế hệ
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

    if (!resolvedFamilyId) {
      setError('Chưa xác định được mã gia tộc. Vui lòng tải lại trang.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const names = fullName.trim().split(' ');
      const firstName = names.pop() || '';
      const lastName = names.join(' ');

      // Compute Birth Information based on mode
      let birth_solar_date: string | undefined = undefined;
      let computed_birth_lunar_day: number | undefined = undefined;
      let computed_birth_lunar_month: number | undefined = undefined;
      let computed_birth_lunar_year: number | undefined = undefined;
      let computed_birth_year: number | undefined = undefined;

      if (birthMode === 'SOLAR_FULL' && birthSolarYear) {
        const d = birthSolarDay ? birthSolarDay.padStart(2, '0') : '01';
        const m = birthSolarMonth ? birthSolarMonth.padStart(2, '0') : '01';
        birth_solar_date = `${birthSolarYear}-${m}-${d}`;
        computed_birth_year = parseInt(birthSolarYear, 10);
      } else if (birthMode === 'LUNAR_FULL' && birthLunarYear) {
        computed_birth_lunar_day = birthLunarDay ? parseInt(birthLunarDay, 10) : undefined;
        computed_birth_lunar_month = birthLunarMonth ? parseInt(birthLunarMonth, 10) : undefined;
        computed_birth_lunar_year = parseInt(birthLunarYear, 10);
        computed_birth_year = parseInt(birthLunarYear, 10);
      } else if (birthMode === 'YEAR_ONLY' && birthYearOnly) {
        computed_birth_year = parseInt(birthYearOnly, 10);
        birth_solar_date = `${birthYearOnly}-01-01`;
      }

      // Compute Death / Memorial Information based on mode
      let death_solar_date: string | undefined = undefined;
      let computed_death_lunar_day: number | undefined = undefined;
      let computed_death_lunar_month: number | undefined = undefined;
      let computed_death_lunar_year: number | undefined = undefined;
      let computed_death_year: number | undefined = undefined;

      if (lifeStatus === 'DECEASED') {
        if (deathMode === 'LUNAR_MEMORIAL') {
          computed_death_lunar_day = deathLunarDay ? parseInt(deathLunarDay, 10) : undefined;
          computed_death_lunar_month = deathLunarMonth ? parseInt(deathLunarMonth, 10) : undefined;
          computed_death_lunar_year = deathLunarYear ? parseInt(deathLunarYear, 10) : undefined;
          computed_death_year = deathLunarYear ? parseInt(deathLunarYear, 10) : undefined;
        } else if (deathMode === 'SOLAR_FULL' && deathSolarYear) {
          const d = deathSolarDay ? deathSolarDay.padStart(2, '0') : '01';
          const m = deathSolarMonth ? deathSolarMonth.padStart(2, '0') : '01';
          death_solar_date = `${deathSolarYear}-${m}-${d}`;
          computed_death_year = parseInt(deathSolarYear, 10);
        } else if (deathMode === 'YEAR_ONLY' && deathYearOnly) {
          computed_death_year = parseInt(deathYearOnly, 10);
        }
      }

      const safeBranch = isUUID(selectedBranchId)
        ? selectedBranchId
        : isUUID(branches[0]?.id)
        ? branches[0].id
        : undefined;

      const safeGen = isUUID(calculatedGenId) ? calculatedGenId : undefined;

      const res = await GenealogyService.addMember(
        {
          family_id: resolvedFamilyId,
          generation_id: safeGen,
          branch_id: safeBranch,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName.trim(),
          gender,
          life_status: lifeStatus,
          birth_solar_date,
          birth_lunar_day: computed_birth_lunar_day,
          birth_lunar_month: computed_birth_lunar_month,
          birth_lunar_year: computed_birth_lunar_year,
          birth_year: computed_birth_year,
          death_solar_date,
          death_lunar_day: computed_death_lunar_day,
          death_lunar_month: computed_death_lunar_month,
          death_lunar_year: computed_death_lunar_year,
          death_year: computed_death_year,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Thêm Thành Viên Vào Phả Hệ
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
                  Cây Gia Phả
                </span>
              </h3>
              {targetMember && (
                <p className="text-xs text-slate-500">
                  Xác lập mối quan hệ họ hàng với <strong className="text-slate-800">{targetMember.full_name}</strong>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Chọn Mối Quan Hệ */}
          {targetMember && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Xác định quan hệ họ tộc
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRelationType('CHILD');
                    setGender('MALE');
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    relationType === 'CHILD'
                      ? 'bg-emerald-50 border-[#166534] text-[#166534] shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Là Con (Hậu duệ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRelationType('SPOUSE');
                    setGender(targetMember.gender === 'MALE' ? 'FEMALE' : 'MALE');
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    relationType === 'SPOUSE'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-xs">Là Vợ / Chồng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRelationType('PARENT')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    relationType === 'PARENT'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs">Là Cha / Mẹ</span>
                </button>
              </div>
            </div>
          )}

          {/* Phân Loại Nhánh Con Cái */}
          {relationType === 'CHILD' && (
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                Phân loại quan hệ con cái
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChildLineageType('BIOLOGICAL')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    childLineageType === 'BIOLOGICAL'
                      ? 'bg-white dark:bg-slate-800 border-[#166534] text-[#166534] dark:text-emerald-400 shadow-xs'
                      : 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-white'
                  }`}
                >
                  Con Trực Hệ
                </button>
                <button
                  type="button"
                  onClick={() => setChildLineageType('MATERNAL_STEPCHILD')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    childLineageType === 'MATERNAL_STEPCHILD'
                      ? 'bg-white dark:bg-slate-800 border-purple-600 text-purple-900 dark:text-purple-300 shadow-xs'
                      : 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-white'
                  }`}
                >
                  Con Kế / Con Riêng
                </button>
                <button
                  type="button"
                  onClick={() => setChildLineageType('ADOPTED')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    childLineageType === 'ADOPTED'
                      ? 'bg-white dark:bg-slate-800 border-blue-600 text-blue-900 dark:text-blue-300 shadow-xs'
                      : 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-white'
                  }`}
                >
                  Con Nuôi (Thừa Tự)
                </button>
              </div>
            </div>
          )}

          {/* Thông Tin Cơ Bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Họ và tên thành viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn An, Trần Thị Mai..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Giới tính</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'MALE'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>👨 Nam (Đinh)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'FEMALE'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>👩 Nữ</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tình trạng nhân khẩu</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLifeStatus('ALIVE')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lifeStatus === 'ALIVE'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>🌿 Còn sống</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLifeStatus('DECEASED')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lifeStatus === 'DECEASED'
                      ? 'bg-slate-100 border-slate-400 text-slate-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>🕯️ Đã tạ thế</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chi Phái & Thứ Bậc */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  {relationType === 'CHILD' && 'Đời Hậu Duệ Kế Tiếp'}
                  {relationType === 'SPOUSE' && 'Đồng Bậc Hôn Phối'}
                  {relationType === 'PARENT' && 'Đời Bậc Thân Sinh (Đời Trước)'}
                </div>
                <div className="text-[11px] text-emerald-800">
                  Chi Nhánh: {branches.find((b) => b.id === selectedBranchId)?.name || 'Chi Trưởng'}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800">
                {relationType === 'CHILD' ? 'Hậu Duệ' : relationType === 'SPOUSE' ? 'Hôn Phối' : 'Thân Sinh'}
              </span>
            </div>
          </div>

          {/* Thông Tin Ngày Sinh */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Thông tin ngày sinh / năm sinh</span>
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setBirthMode('YEAR_ONLY')}
                  className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    birthMode === 'YEAR_ONLY' ? 'bg-[#166534] text-white border-[#166534]' : 'bg-white text-slate-600'
                  }`}
                >
                  Chỉ Năm
                </button>
                <button
                  type="button"
                  onClick={() => setBirthMode('SOLAR_FULL')}
                  className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    birthMode === 'SOLAR_FULL' ? 'bg-[#166534] text-white border-[#166534]' : 'bg-white text-slate-600'
                  }`}
                >
                  Dương Lịch
                </button>
                <button
                  type="button"
                  onClick={() => setBirthMode('LUNAR_FULL')}
                  className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    birthMode === 'LUNAR_FULL' ? 'bg-[#166534] text-white border-[#166534]' : 'bg-white text-slate-600'
                  }`}
                >
                  Âm Lịch
                </button>
              </div>
            </div>

            {birthMode === 'YEAR_ONLY' && (
              <div>
                <input
                  type="number"
                  placeholder="Năm sinh (VD: 1986)"
                  value={birthYearOnly}
                  onChange={(e) => setBirthYearOnly(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                />
              </div>
            )}

            {birthMode === 'SOLAR_FULL' && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Ngày"
                  min="1"
                  max="31"
                  value={birthSolarDay}
                  onChange={(e) => setBirthSolarDay(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center"
                />
                <input
                  type="number"
                  placeholder="Tháng"
                  min="1"
                  max="12"
                  value={birthSolarMonth}
                  onChange={(e) => setBirthSolarMonth(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center"
                />
                <input
                  type="number"
                  placeholder="Năm"
                  value={birthSolarYear}
                  onChange={(e) => setBirthSolarYear(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center"
                />
              </div>
            )}

            {birthMode === 'LUNAR_FULL' && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Ngày ÂL"
                  min="1"
                  max="30"
                  value={birthLunarDay}
                  onChange={(e) => setBirthLunarDay(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center"
                />
                <input
                  type="number"
                  placeholder="Tháng ÂL"
                  min="1"
                  max="12"
                  value={birthLunarMonth}
                  onChange={(e) => setBirthLunarMonth(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center"
                />
                <input
                  type="number"
                  placeholder="Năm ÂL"
                  value={birthLunarYear}
                  onChange={(e) => setBirthLunarYear(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center"
                />
              </div>
            )}
          </div>

          {/* Thông Tin Ngày Mất / Lễ Giỗ (Nếu Đã Mất) */}
          {lifeStatus === 'DECEASED' && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ngày Giỗ & Ngày Tạ Thế</span>
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDeathMode('LUNAR_MEMORIAL')}
                    className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                      deathMode === 'LUNAR_MEMORIAL' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-slate-600'
                    }`}
                  >
                    Ngày Giỗ Âm Lịch
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeathMode('SOLAR_FULL')}
                    className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                      deathMode === 'SOLAR_FULL' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-slate-600'
                    }`}
                  >
                    Dương Lịch
                  </button>
                </div>
              </div>

              {deathMode === 'LUNAR_MEMORIAL' && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Ngày Giỗ (ÂL) *"
                    min="1"
                    max="30"
                    value={deathLunarDay}
                    onChange={(e) => setDeathLunarDay(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="Tháng Giỗ (ÂL) *"
                    min="1"
                    max="12"
                    value={deathLunarMonth}
                    onChange={(e) => setDeathLunarMonth(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="Năm Mất (ÂL)"
                    value={deathLunarYear}
                    onChange={(e) => setDeathLunarYear(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                </div>
              )}

              {deathMode === 'SOLAR_FULL' && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Ngày"
                    min="1"
                    max="31"
                    value={deathSolarDay}
                    onChange={(e) => setDeathSolarDay(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="Tháng"
                    min="1"
                    max="12"
                    value={deathSolarMonth}
                    onChange={(e) => setDeathSolarMonth(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="Năm"
                    value={deathSolarYear}
                    onChange={(e) => setDeathSolarYear(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Nơi an táng / Mộ phần (VD: Nghĩa trang quê nhà, đồi Thông...)"
                  value={burialPlace}
                  onChange={(e) => setBurialPlace(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* Ghi chú & Tiểu sử */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ghi chép ngọc phả / Công đức</label>
            <textarea
              rows={2}
              placeholder="Ghi chú về chức tước, học vị, công đức hoặc sự nghiệp phụng sự gia tộc..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>

          {/* Nút Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Đang lưu dữ liệu...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Lưu Vào Phả Hệ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberRelationModal;
