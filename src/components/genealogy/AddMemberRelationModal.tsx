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
  const [courtesyName, setCourtesyName] = useState('');
  const [religiousName, setReligiousName] = useState('');
  const [gender, setGender] = useState<GenderType>(initialRelationType === 'SPOUSE' && targetMember?.gender === 'MALE' ? 'FEMALE' : 'MALE');
  const [lifeStatus, setLifeStatus] = useState<MemberLifeStatus>('ALIVE');
  
  // Birth Date & Time State
  const [birthMode, setBirthMode] = useState<BirthDateMode>('YEAR_ONLY');
  const [birthTime, setBirthTime] = useState<string>('');
  const [birthSolarDay, setBirthSolarDay] = useState<string>('');
  const [birthSolarMonth, setBirthSolarMonth] = useState<string>('');
  const [birthSolarYear, setBirthSolarYear] = useState<string>('');
  const [birthLunarDay, setBirthLunarDay] = useState<string>('');
  const [birthLunarMonth, setBirthLunarMonth] = useState<string>('');
  const [birthLunarYear, setBirthLunarYear] = useState<string>('');
  const [birthYearOnly, setBirthYearOnly] = useState<string>('');

  // Death Date & Time State
  const [deathMode, setDeathMode] = useState<DeathDateMode>('LUNAR_MEMORIAL');
  const [deathTime, setDeathTime] = useState<string>('');
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

      const safeBranch = isUUID(selectedBranchId) ? selectedBranchId : (isUUID(branches[0]?.id) ? branches[0].id : undefined);
      const safeGen = isUUID(calculatedGenId) ? calculatedGenId : undefined;
      const res = await GenealogyService.addMember(
        {
          family_id: resolvedFamilyId,
          generation_id: safeGen,
          branch_id: safeBranch,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName.trim(),
          courtesy_name: courtesyName.trim() || undefined,
          religious_name: religiousName.trim() || undefined,
          gender,
          life_status: lifeStatus,
          birth_solar_date,
          birth_lunar_day: computed_birth_lunar_day,
          birth_lunar_month: computed_birth_lunar_month,
          birth_lunar_year: computed_birth_lunar_year,
          birth_year: computed_birth_year,
          birth_time: birthTime.trim() || undefined,
          death_solar_date,
          death_lunar_day: computed_death_lunar_day,
          death_lunar_month: computed_death_lunar_month,
          death_lunar_year: computed_death_lunar_year,
          death_year: computed_death_year,
          death_time: deathTime.trim() || undefined,
          burial_place: burialPlace.trim() || undefined,
          bio: bio.trim() || undefined,
        },
        targetMember ? { targetMemberId: targetMember.id, relationType: relationType } : undefined
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
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in my-8">
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#166534] text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {targetMember ? 'Thêm Thân Nhân Trực Hệ' : 'Khởi Tạo Tiền Nhân / Thủy Tổ'}
              </h3>
              <p className="text-xs text-slate-500">
                {targetMember ? `Mối quan hệ với: ${targetMember.full_name}` : 'Khởi tạo vị đứng đầu dòng họ trong ngọc phả'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="font-bold">⚠️ Lỗi:</span> {error}
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#166534] text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Tên Húy / Tên Hiệu / Tự Hiệu (Cổ truyền)</span>
                <span className="text-[11px] font-normal text-slate-500">Tùy chọn</span>
              </label>
              <input
                type="text"
                value={courtesyName}
                onChange={(e) => setCourtesyName(e.target.value)}
                placeholder="VD: Húy: Phúc An, Tự: Minh Đức, Hiệu: Tùng Hiên, Thụy: Ôn Nhã"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#166534] text-sm"
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

          {/* Ngày sinh & Giờ sinh */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Thông tin ngày sinh & giờ sinh</span>
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
              <input
                type="number"
                placeholder="Năm sinh (VD: 1986)"
                value={birthYearOnly}
                onChange={(e) => setBirthYearOnly(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              />
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

            {/* Giờ Sinh Can Chi hoặc Giờ Tự Do */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Giờ sinh (Nếu nhớ)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">Canh giờ cổ truyền hoặc giờ hiện đại</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#166534]"
                >
                  <option value="">-- Chọn Canh Giờ Can Chi --</option>
                  <option value="Giờ Tý (23h - 01h)">Giờ Tý (23h00 - 01h00)</option>
                  <option value="Giờ Sửu (01h - 03h)">Giờ Sửu (01h00 - 03h00)</option>
                  <option value="Giờ Dần (03h - 05h)">Giờ Dần (03h00 - 05h00)</option>
                  <option value="Giờ Mão (05h - 07h)">Giờ Mão (05h00 - 07h00)</option>
                  <option value="Giờ Thìn (07h - 09h)">Giờ Thìn (07h00 - 09h00)</option>
                  <option value="Giờ Tỵ (09h - 11h)">Giờ Tỵ (09h00 - 11h00)</option>
                  <option value="Giờ Ngọ (11h - 13h)">Giờ Ngọ (11h00 - 13h00)</option>
                  <option value="Giờ Mùi (13h - 15h)">Giờ Mùi (13h00 - 15h00)</option>
                  <option value="Giờ Thân (15h - 17h)">Giờ Thân (15h00 - 17h00)</option>
                  <option value="Giờ Dậu (17h - 19h)">Giờ Dậu (17h00 - 19h00)</option>
                  <option value="Giờ Tuất (19h - 21h)">Giờ Tuất (19h00 - 21h00)</option>
                  <option value="Giờ Hợi (21h - 23h)">Giờ Hợi (21h00 - 23h00)</option>
                </select>
                <input
                  type="text"
                  placeholder="Hoặc nhập giờ tự do (VD: 08:30, 14:15...)"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Ngày Mất & Lễ Giỗ */}
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
                      deathMode === 'LUNAR_MEMORIAL'
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-white text-amber-900 border-amber-300'
                    }`}
                  >
                    Kỵ Giỗ ÂL
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeathMode('SOLAR_FULL')}
                    className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                      deathMode === 'SOLAR_FULL'
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-white text-amber-900 border-amber-300'
                    }`}
                  >
                    Dương Lịch
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeathMode('YEAR_ONLY')}
                    className={`px-2 py-1 rounded-lg border font-medium transition cursor-pointer ${
                      deathMode === 'YEAR_ONLY'
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-white text-amber-900 border-amber-300'
                    }`}
                  >
                    Chỉ Năm
                  </button>
                </div>
              </div>

              {deathMode === 'LUNAR_MEMORIAL' && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Ngày Giỗ ÂL"
                    min="1"
                    max="30"
                    value={deathLunarDay}
                    onChange={(e) => setDeathLunarDay(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="Tháng Giỗ ÂL"
                    min="1"
                    max="12"
                    value={deathLunarMonth}
                    onChange={(e) => setDeathLunarMonth(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                  <input
                    type="number"
                    placeholder="Năm Mất ÂL"
                    value={deathLunarYear}
                    onChange={(e) => setDeathLunarYear(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-center"
                  />
                </div>
              )}

              {deathMode === 'YEAR_ONLY' && (
                <input
                  type="number"
                  placeholder="Năm tạ thế (VD: 1945)"
                  value={deathYearOnly}
                  onChange={(e) => setDeathYearOnly(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm"
                />
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

              {/* Giờ Quy Tiên & Pháp Danh */}
              <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Giờ tạ thế / Quy tiên</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 21:30 hoặc Giờ Hợi"
                    value={deathTime}
                    onChange={(e) => setDeathTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Pháp danh / Tên thánh (Nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thích Trí Dũng, Maria..."
                    value={religiousName}
                    onChange={(e) => setReligiousName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs"
                  />
                </div>
              </div>

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
