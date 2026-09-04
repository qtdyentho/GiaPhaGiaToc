import React, { useState, useEffect } from 'react';
import { X, Save, User, Users, GitBranch, Calendar, Heart, Shield, Clock, MapPin, Loader2, Briefcase, Phone, GraduationCap, Globe } from 'lucide-react';
import { Member, Generation, Branch, SpouseRankType, GenderType, MemberLifeStatus, WorkStatusType } from '../../types/database';
import { GenealogyService } from '../../services/GenealogyService';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedMember: Member) => void;
  member: Member | null;
  allMembers: Member[];
  generations: Generation[];
  branches: Branch[];
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  member,
  allMembers,
  generations,
  branches,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<GenderType>('MALE');
  const [lifeStatus, setLifeStatus] = useState<MemberLifeStatus>('ALIVE');
  const [branchId, setBranchId] = useState<string>('');
  const [branchCode, setBranchCode] = useState<string>('');
  const [generationId, setGenerationId] = useState<string>('');
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  const [spouseId, setSpouseId] = useState<string>('');
  const [spouseRank, setSpouseRank] = useState<SpouseRankType>('CHINH_THAT');
  const [birthOrder, setBirthOrder] = useState<string>('');
  const [courtesyName, setCourtesyName] = useState<string>('');
  const [religiousName, setReligiousName] = useState<string>('');
  const [birthSolarDate, setBirthSolarDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [deathSolarDate, setDeathSolarDate] = useState<string>('');
  const [deathLunarDay, setDeathLunarDay] = useState<string>('');
  const [deathLunarMonth, setDeathLunarMonth] = useState<string>('');
  const [deathLunarYear, setDeathLunarYear] = useState<string>('');
  const [deathTime, setDeathTime] = useState<string>('');
  const [burialPlace, setBurialPlace] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Extended fields states
  const [hometown, setHometown] = useState<string>('');
  const [currentResidence, setCurrentResidence] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [workStatus, setWorkStatus] = useState<WorkStatusType>('WORKING');
  const [phone, setPhone] = useState<string>('');
  const [educationLevel, setEducationLevel] = useState<string>('');
  const [facebookUrl, setFacebookUrl] = useState<string>('');
  const [zaloPhone, setZaloPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');

  useEffect(() => {
    if (!member) return;

    setFullName(member.full_name || '');
    setGender(member.gender || 'MALE');
    setLifeStatus(member.life_status || 'ALIVE');
    setBranchId(member.branch_id || '');
    setBranchCode(member.branch_code || '');
    setGenerationId(member.generation_id || '');
    setFatherId(member.father_id || '');
    setMotherId(member.mother_id || '');
    setSpouseId(member.spouse_id || '');
    setSpouseRank(member.spouse_rank || 'CHINH_THAT');
    setBirthOrder(member.birth_order ? String(member.birth_order) : '');
    setCourtesyName(member.courtesy_name || '');
    setReligiousName(member.religious_name || '');
    setBirthSolarDate(member.birth_solar_date ? member.birth_solar_date.split('T')[0] : '');
    setBirthTime(member.birth_time || '');
    setBirthYear(member.birth_year ? String(member.birth_year) : member.birth_lunar_year ? String(member.birth_lunar_year) : '');
    setDeathSolarDate(member.death_solar_date ? member.death_solar_date.split('T')[0] : '');
    setDeathLunarDay(member.death_lunar_day ? String(member.death_lunar_day) : '');
    setDeathLunarMonth(member.death_lunar_month ? String(member.death_lunar_month) : '');
    setDeathLunarYear(member.death_lunar_year ? String(member.death_lunar_year) : '');
    setDeathTime(member.death_time || '');
    setBurialPlace(member.burial_place || '');
    setBio(member.bio || '');
    setAvatarUrl(member.avatar_url || '');
    setHometown(member.hometown || '');
    setCurrentResidence(member.current_residence || '');
    setOccupation(member.occupation || '');
    setWorkStatus(member.work_status || 'WORKING');
    setPhone(member.phone || '');
    setEducationLevel(member.education_level || '');
    setFacebookUrl(member.social_links?.facebook || '');
    setZaloPhone(member.social_links?.zalo || '');
    setContactEmail(member.social_links?.email || '');
    setError(null);
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  // Lọc danh sách ứng viên Bố (Nam, khác chính mình)
  const candidateFathers = allMembers.filter((m) => m.id !== member.id && m.gender === 'MALE');
  // Lọc danh sách ứng viên Mẹ (Nữ, khác chính mình)
  const candidateMothers = allMembers.filter((m) => m.id !== member.id && m.gender === 'FEMALE');
  // Lọc danh sách ứng viên Vợ/Chồng (Khác chính mình, ưu tiên khác giới hoặc bất kỳ ai)
  const candidateSpouses = allMembers.filter((m) => m.id !== member.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên thành viên');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const names = fullName.trim().split(' ');
      const firstName = names.pop() || '';
      const lastName = names.join(' ');

      const updates: Partial<Member> = {
        full_name: fullName.trim(),
        first_name: firstName,
        last_name: lastName,
        gender,
        life_status: lifeStatus,
        branch_id: branchId || undefined,
        branch_code: branchCode.trim() || undefined,
        generation_id: generationId || undefined,
        father_id: fatherId || undefined,
        mother_id: motherId || undefined,
        spouse_id: spouseId || undefined,
        spouse_rank: spouseId ? spouseRank : undefined,
        birth_order: birthOrder ? parseInt(birthOrder, 10) : undefined,
        courtesy_name: courtesyName.trim() || undefined,
        religious_name: religiousName.trim() || undefined,
        birth_solar_date: birthSolarDate || undefined,
        birth_time: birthTime.trim() || undefined,
        birth_year: birthYear ? parseInt(birthYear, 10) : undefined,
        death_solar_date: deathSolarDate || undefined,
        death_lunar_day: deathLunarDay ? parseInt(deathLunarDay, 10) : undefined,
        death_lunar_month: deathLunarMonth ? parseInt(deathLunarMonth, 10) : undefined,
        death_lunar_year: deathLunarYear ? parseInt(deathLunarYear, 10) : undefined,
        death_time: deathTime.trim() || undefined,
        burial_place: burialPlace.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        hometown: hometown.trim() || undefined,
        current_residence: currentResidence.trim() || undefined,
        occupation: occupation.trim() || undefined,
        work_status: workStatus,
        phone: phone.trim() || undefined,
        education_level: educationLevel.trim() || undefined,
        social_links:
          facebookUrl.trim() || zaloPhone.trim() || contactEmail.trim()
            ? {
                facebook: facebookUrl.trim() || undefined,
                zalo: zaloPhone.trim() || undefined,
                email: contactEmail.trim() || undefined,
              }
            : undefined,
        family_id: member.family_id,
      };

      const res = await GenealogyService.updateMember(member.id, updates);
      if (res.success && res.member) {
        onSuccess(res.member);
        onClose();
      } else {
        setError(res.error || 'Không thể lưu thông tin. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật thành viên:', err);
      setError(err?.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#166534] to-[#14532D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-xs">
              ✏️
            </div>
            <div>
              <h3 className="text-base font-bold font-serif leading-tight">
                Chỉnh Sửa Thông Tin Thành Viên
              </h3>
              <p className="text-xs text-emerald-100/80">
                Điều chỉnh họ tên, chi cành, quan hệ huyết thống cha mẹ và hôn phối
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto text-xs text-slate-800 dark:text-slate-200">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* 1. THÔNG TIN ĐỊNH DANH CỐT LÕI */}
          <div className="space-y-4">
            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#166534] dark:text-emerald-400" />
              <span>1. Thông Tin Định Danh Cốt Lõi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Họ và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Trịnh Lưu Đạt"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Giới Tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="MALE">Nam (👨)</option>
                  <option value="FEMALE">Nữ (👩)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tình Trạng Sinh Tử</label>
                <select
                  value={lifeStatus}
                  onChange={(e) => setLifeStatus(e.target.value as MemberLifeStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALIVE">🌿 Còn Sống (Hậu duệ hiện tiền)</option>
                  <option value="DECEASED">🕯️ Đã Mất (Tiên tổ tiền nhân)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tên Tự / Tên Hiệu (Chữ Đệm Cổ)</label>
                <input
                  type="text"
                  value={courtesyName}
                  onChange={(e) => setCourtesyName(e.target.value)}
                  placeholder="VD: Huyền Minh, Phúc Thành"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pháp Danh / Thụy Hiệu</label>
                <input
                  type="text"
                  value={religiousName}
                  onChange={(e) => setReligiousName(e.target.value)}
                  placeholder="VD: Thích Trí Dũng, Tuệ Tâm"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Đường Dẫn Ảnh Đại Diện (Avatar URL)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... hoặc link ảnh online"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 2. THỨ BẬC GIA TỘC & CHI CÀNH NHÁNH */}
          <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl space-y-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5 text-[#166534] dark:text-emerald-400" />
              <span>2. Thứ Bậc Dòng Họ: Thế Hệ, Chi Phái & Cành Nhánh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Thế Hệ / Đời Thứ
                </label>
                <select
                  value={generationId}
                  onChange={(e) => setGenerationId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- Chọn Thế Hệ / Đời --</option>
                  {generations.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Đời {g.generation_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Chi Phái Dòng Họ
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- Thuộc Chi Phái Nào --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Cành / Nhánh Cụ Thể (Mã Phân Nhánh)
                </label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="VD: Cành 1, Nhánh 2, Giáp Đông..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Thứ Tự Sinh Trong Gia Đình (Con thứ mấy)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={birthOrder}
                  onChange={(e) => setBirthOrder(e.target.value)}
                  placeholder="VD: 1 (Trưởng), 2 (Thứ hai)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. HUYẾT THỐNG CHA MẸ & HÔN PHỐI */}
          <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl space-y-4">
            <div className="font-bold text-amber-950 dark:text-amber-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>3. Quan Hệ Huyết Thống Cha Mẹ & Hôn Phối (Vợ/Chồng)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Bố (Thân Phụ)
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- Không rõ / Cụ Thủy Tổ khai sáng --</option>
                  {candidateFathers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name} ({f.birth_solar_date ? new Date(f.birth_solar_date).getFullYear() : f.birth_year || 'Đời tiền bối'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Mẹ (Thân Mẫu)
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- Không rõ mẹ --</option>
                  {candidateMothers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.birth_solar_date ? new Date(m.birth_solar_date).getFullYear() : m.birth_year || 'Đời tiền bối'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Vợ / Chồng (Phối Ngẫu)
                </label>
                <select
                  value={spouseId}
                  onChange={(e) => setSpouseId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- Độc thân / Chưa ghi nhận --</option>
                  {candidateSpouses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.gender === 'MALE' ? 'Nam' : 'Nữ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Thứ Bậc Hôn Phối (Danh phận)
                </label>
                <select
                  disabled={!spouseId}
                  value={spouseRank}
                  onChange={(e) => setSpouseRank(e.target.value as SpouseRankType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                >
                  <option value="CHINH_THAT">👑 Chính Thất (Bà Cả / Chính Phu)</option>
                  <option value="KE_THAT">🌿 Kế Thất (Bà Hai / Kế Phu)</option>
                  <option value="THAC_THAT">🍃 Trắc Thất (Bà Ba / Vợ bé)</option>
                  <option value="KHONG_RO">Chưa xác định thứ bậc</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. NGÀY SINH, NGÀY MẤT & NƠI AN TÁNG */}
          <div className="space-y-4">
            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#166534] dark:text-emerald-400" />
              <span>4. Thông Tin Ngày Sinh, Giờ Sinh & Tang Lễ / Kỵ Giỗ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ngày Sinh (Dương Lịch)</label>
                <input
                  type="date"
                  value={birthSolarDate}
                  onChange={(e) => setBirthSolarDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Giờ Sinh</label>
                <input
                  type="text"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  placeholder="VD: Giờ Thìn (07:30)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Năm Sinh (Nếu chỉ nhớ năm)</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="VD: 1952"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {lifeStatus === 'DECEASED' && (
              <div className="p-4 bg-amber-50/50 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 rounded-2xl space-y-4">
                <div className="text-amber-900 dark:text-amber-300 font-bold text-xs">
                  🕯️ Thông Tin Tiên Nhân Quy Tiên & Lễ Giỗ Hàng Năm:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ngày Mất (Dương Lịch)</label>
                    <input
                      type="date"
                      value={deathSolarDate}
                      onChange={(e) => setDeathSolarDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Giờ Mất (Quy Tiên)</label>
                    <input
                      type="text"
                      value={deathTime}
                      onChange={(e) => setDeathTime(e.target.value)}
                      placeholder="VD: Giờ Tỵ (09:15)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ngày Giỗ (Âm)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={deathLunarDay}
                      onChange={(e) => setDeathLunarDay(e.target.value)}
                      placeholder="VD: 15"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tháng Giỗ (Âm)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={deathLunarMonth}
                      onChange={(e) => setDeathLunarMonth(e.target.value)}
                      placeholder="VD: 8"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Năm Mất</label>
                    <input
                      type="number"
                      value={deathLunarYear}
                      onChange={(e) => setDeathLunarYear(e.target.value)}
                      placeholder="VD: 1982"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nơi An Táng / Mộ Phần</label>
                  <input
                    type="text"
                    value={burialPlace}
                    onChange={(e) => setBurialPlace(e.target.value)}
                    placeholder="VD: Nghĩa trang dòng họ Trịnh Lưu, xã Thiệu Viên, Thanh Hóa"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. TIỂU SỬ & CÔNG ĐỨC */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. Tiểu Sử & Ghi Chép Ngọc Phả
            </h4>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ghi chép công đức, chức vụ, đóng góp xây dựng từ đường và sự tích dòng tộc..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 6. THÔNG TIN MỞ RỘNG (CƯ TRÚ, NGHỀ NGHIỆP, LIÊN LẠC & HỌC VẤN) */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>6. Thông Tin Mở Rộng (Cư Trú, Sự Nghiệp & Liên Lạc)</span>
              </h4>
              <span className="text-[10px] text-slate-400 italic">Dành cho danh bạ & kết nối dòng họ</span>
            </div>

            {/* Quê quán & Nơi ở hiện tại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>Quê Quán / Nguyên Quán</span>
                </label>
                <input
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  placeholder="VD: Thiệu Viên, Thiệu Hóa, Thanh Hóa"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Chỗ Ở Hiện Nay</span>
                </label>
                <input
                  type="text"
                  value={currentResidence}
                  onChange={(e) => setCurrentResidence(e.target.value)}
                  placeholder="VD: P. Định Công, Q. Hoàng Mai, Hà Nội"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Nghề nghiệp & Trạng thái công tác */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-sky-600" />
                  <span>Nghề Nghiệp / Đơn Vị Công Tác</span>
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="VD: Kỹ sư CNTT, Giảng viên đại học, Doanh nhân..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Trạng Thái Công Tác</label>
                <select
                  value={workStatus}
                  onChange={(e) => setWorkStatus(e.target.value as WorkStatusType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="WORKING">💼 Đang Làm Việc</option>
                  <option value="RETIRED">🎖️ Đã Nghỉ Hưu</option>
                  <option value="STUDENT">🎓 Học Sinh / Sinh Viên</option>
                  <option value="OTHER">🌿 Khác / Tự Do</option>
                </select>
              </div>
            </div>

            {/* Trình độ học vấn & Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-600" />
                  <span>Trình Độ Học Vấn / Học Vị</span>
                </label>
                <input
                  type="text"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  placeholder="VD: Cử nhân, Thạc sĩ, Tiến sĩ, Giáo sư..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Số Điện Thoại Liên Hệ</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Mạng xã hội & Kênh liên kết */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>Mạng Xã Hội & Kênh Kết Nối Nội Tộc</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="Link Facebook cá nhân"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={zaloPhone}
                    onChange={(e) => setZaloPhone(e.target.value)}
                    placeholder="SĐT / Link Zalo"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email cá nhân"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
