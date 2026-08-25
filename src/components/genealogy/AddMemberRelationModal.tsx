import React, { useState } from 'react';
import { X, UserPlus, Heart, Users, Sparkles, Calendar, Moon, Sun, Clock, MapPin } from 'lucide-react';
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

type BirthDateMode = 'SOLAR_FULL' | 'LUNAR_FULL' | 'YEAR_ONLY' | 'UNKNOWN';
type DeathDateMode = 'LUNAR_MEMORIAL' | 'SOLAR_FULL' | 'YEAR_ONLY' | 'UNKNOWN';

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

      const res = await GenealogyService.addMember(
        {
          family_id: targetMember?.family_id || 'fam-0000-0001',
          generation_id: calculatedGenId,
          branch_id: selectedBranchId,
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
                placeholder="VD: Cụ Nguyễn Văn An / Nguyễn Văn Bình..."
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
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'MALE'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  👨 Nam (Đinh)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'FEMALE'
                      ? 'bg-pink-50 border-pink-500 text-pink-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  👩 Nữ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tình trạng nhân khẩu</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLifeStatus('ALIVE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lifeStatus === 'ALIVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🌿 Còn sống
                </button>
                <button
                  type="button"
                  onClick={() => setLifeStatus('DECEASED')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lifeStatus === 'DECEASED'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🕯️ Đã tạ thế
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Thuộc Chi Phái & Thế Hệ (Tự Động Xác Định)</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ⚡ Thuật toán phả hệ tự động
                </span>
              </label>
              
              {targetMember ? (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#166534]">
                      {relationType === 'CHILD'
                        ? `Kế Thừa: Đời Thứ ${(generations.find(g => g.id === targetMember.generation_id)?.generation_number || 1) + 1}`
                        : relationType === 'SPOUSE'
                        ? `Đồng Bậc: Đời Thứ ${generations.find(g => g.id === targetMember.generation_id)?.generation_number || 1}`
                        : `Tiền Bối: Đời Thứ ${Math.max(1, (generations.find(g => g.id === targetMember.generation_id)?.generation_number || 2) - 1)}`}
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Chi Nhánh: <span className="font-semibold text-slate-800">{branches.find(b => b.id === selectedBranchId)?.name || 'Chi Trưởng'}</span> (Kế thừa trực hệ)
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#166534] bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                    {relationType === 'CHILD' ? 'Con Trực Hệ' : relationType === 'SPOUSE' ? 'Phối Ngẫu' : 'Thân Sinh'}
                  </span>
                </div>
              ) : (
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#166534]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* CHẾ ĐỘ NHẬP NGÀY / NĂM SINH LINH HOẠT */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Thông tin ngày sinh / năm sinh
              </label>
              <span className="text-[10px] text-slate-500">Linh hoạt theo dữ liệu lưu truyền</span>
            </div>

            {/* Radio / Tabs chọn kiểu ngày sinh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setBirthMode('YEAR_ONLY')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  birthMode === 'YEAR_ONLY'
                    ? 'bg-emerald-100 text-[#166534] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                📜 Chỉ Biết Năm
              </button>
              <button
                type="button"
                onClick={() => setBirthMode('SOLAR_FULL')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  birthMode === 'SOLAR_FULL'
                    ? 'bg-emerald-100 text-[#166534] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ☀️ Dương Lịch Đầy Đủ
              </button>
              <button
                type="button"
                onClick={() => setBirthMode('LUNAR_FULL')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  birthMode === 'LUNAR_FULL'
                    ? 'bg-emerald-100 text-[#166534] shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                🌙 Âm Lịch Đầy Đủ
              </button>
              <button
                type="button"
                onClick={() => setBirthMode('UNKNOWN')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  birthMode === 'UNKNOWN'
                    ? 'bg-slate-200 text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                ❓ Chưa Rõ
              </button>
            </div>

            {/* Inputs tương ứng với birthMode */}
            {birthMode === 'YEAR_ONLY' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Năm sinh (Phù hợp ghi nhận các Cụ / Tiền nhân)
                </label>
                <input
                  type="number"
                  value={birthYearOnly}
                  onChange={(e) => setBirthYearOnly(e.target.value)}
                  placeholder="VD: 1895, 1912..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>
            )}

            {birthMode === 'SOLAR_FULL' && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Ngày sinh (Dương)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={birthSolarDay}
                    onChange={(e) => setBirthSolarDay(e.target.value)}
                    placeholder="Ngày (1-31)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tháng sinh (Dương)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={birthSolarMonth}
                    onChange={(e) => setBirthSolarMonth(e.target.value)}
                    placeholder="Tháng (1-12)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Năm sinh</label>
                  <input
                    type="number"
                    value={birthSolarYear}
                    onChange={(e) => setBirthSolarYear(e.target.value)}
                    placeholder="VD: 1988"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              </div>
            )}

            {birthMode === 'LUNAR_FULL' && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Ngày sinh (Âm lịch)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={birthLunarDay}
                    onChange={(e) => setBirthLunarDay(e.target.value)}
                    placeholder="Ngày (1-30)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tháng sinh (Âm lịch)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={birthLunarMonth}
                    onChange={(e) => setBirthLunarMonth(e.target.value)}
                    placeholder="Tháng (1-12)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Năm sinh (Âm lịch)</label>
                  <input
                    type="number"
                    value={birthLunarYear}
                    onChange={(e) => setBirthLunarYear(e.target.value)}
                    placeholder="VD: 1952"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              </div>
            )}

            {birthMode === 'UNKNOWN' && (
              <div className="text-center py-2 text-[11px] text-slate-400 italic">
                Chưa rõ thông tin ngày/năm sinh. Có thể bổ sung và cập nhật sau.
              </div>
            )}
          </div>

          {/* PHẦN DÀNH RIÊNG CHO NGƯỜI ĐÃ TẠ THẾ (NGÀY GIỖ & AN TÁNG) */}
          {lifeStatus === 'DECEASED' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <Moon className="w-4 h-4 text-amber-700" />
                  <span>Thông tin ngày giỗ, năm mất & an táng</span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold">Tự động đồng bộ lên Lịch Gia Tộc</span>
              </div>

              {/* Radio / Tabs chọn kiểu ngày mất */}
              <div className="grid grid-cols-3 gap-1.5 bg-white/90 p-1 rounded-xl border border-amber-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDeathMode('LUNAR_MEMORIAL')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    deathMode === 'LUNAR_MEMORIAL'
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🌙 Giỗ Âm Lịch (Chuẩn)
                </button>
                <button
                  type="button"
                  onClick={() => setDeathMode('YEAR_ONLY')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    deathMode === 'YEAR_ONLY'
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📜 Chỉ Biết Năm Mất
                </button>
                <button
                  type="button"
                  onClick={() => setDeathMode('UNKNOWN')}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    deathMode === 'UNKNOWN'
                      ? 'bg-slate-200 text-slate-800 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  ❓ Chưa Rõ
                </button>
              </div>

              {deathMode === 'LUNAR_MEMORIAL' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Ngày Giỗ (Âm lịch)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={deathLunarDay}
                      onChange={(e) => setDeathLunarDay(e.target.value)}
                      placeholder="Ngày (1-30)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tháng Giỗ (Âm lịch)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={deathLunarMonth}
                      onChange={(e) => setDeathLunarMonth(e.target.value)}
                      placeholder="Tháng (1-12)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Năm tạ thế</label>
                    <input
                      type="number"
                      value={deathLunarYear}
                      onChange={(e) => setDeathLunarYear(e.target.value)}
                      placeholder="VD: 1980"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    />
                  </div>
                </div>
              )}

              {deathMode === 'YEAR_ONLY' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Năm tạ thế (Chỉ biết năm)</label>
                  <input
                    type="number"
                    value={deathYearOnly}
                    onChange={(e) => setDeathYearOnly(e.target.value)}
                    placeholder="VD: 1968, 1975..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                </div>
              )}

              {deathMode === 'UNKNOWN' && (
                <div className="text-center py-2 text-[11px] text-amber-800/80 italic">
                  Chưa rõ ngày mất / ngày giỗ. Sẽ cập nhật sau khi tìm được gia phả cũ.
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Nơi an táng / Mộ phần tiền nhân</span>
                </label>
                <input
                  type="text"
                  value={burialPlace}
                  onChange={(e) => setBurialPlace(e.target.value)}
                  placeholder="VD: Khu Lăng Mộ Tổ họ Nguyễn, Nghĩa trang Đồi Thông..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>
            </div>
          )}

          {/* Tiểu sử tóm tắt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tiểu sử, công trạng & ghi chú
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="VD: Có công lập ấp, cử nhân Nho học, đóng góp xây dựng từ đường..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Xác Nhận Thêm Thành Viên</span>
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
