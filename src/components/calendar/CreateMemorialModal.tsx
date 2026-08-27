import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { MemorialService } from '../../services/calendar/MemorialService';
import { GenealogyService } from '../../services/GenealogyService';
import { Member, MemorialDate } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { LunarCalendarService } from '../../services/calendar/LunarCalendarService';
import { getDaysInLunarMonth, getLeapMonth } from '../../lib/lunar';

interface CreateMemorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  familyId?: string;
  defaultMemberId?: string;
}

export const CreateMemorialModal: React.FC<CreateMemorialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  familyId,
  defaultMemberId,
}) => {
  const { activeFamily } = useAuth();
  const targetFamId = familyId || activeFamily?.id;
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState(defaultMemberId || '');
  const [title, setTitle] = useState('');
  const [lunarDay, setLunarDay] = useState<number>(15);
  const [lunarMonth, setLunarMonth] = useState<number>(8);
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      if (isOpen && targetFamId) {
        try {
          const members = await GenealogyService.getMembers(targetFamId);
          setMembersList(members || []);
          if (!memberId) {
            const initialId = defaultMemberId || members[0]?.id || '';
            setMemberId(initialId);
            const initialMember = members.find((m) => m.id === initialId);
            if (initialMember) {
              setTitle(`Lễ Giỗ: ${initialMember.full_name}`);
              if (initialMember.death_lunar_day) setLunarDay(initialMember.death_lunar_day);
              if (initialMember.death_lunar_month) setLunarMonth(initialMember.death_lunar_month);
            }
          }
        } catch (err) {
          console.error('Lỗi khi tải danh sách thành viên:', err);
        }
      }
    }
    loadMembers();
  }, [isOpen, targetFamId, defaultMemberId]);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const nextOccurrence = LunarCalendarService.getNextSolarDateForMemorial(
    lunarDay,
    lunarMonth,
    isLeapMonth,
    currentYear
  );

  const leapInYear = getLeapMonth(currentYear);
  const daysInLunarMonth = getDaysInLunarMonth(lunarMonth, currentYear, isLeapMonth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên ngày giỗ');
      return;
    }
    if (!memberId) {
      setError('Vui lòng chọn tiền nhân / thành viên gia tộc');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await MemorialService.createMemorial({
      family_id: targetFamId || '',
      member_id: memberId,
      title: title.trim(),
      lunar_day: lunarDay,
      lunar_month: lunarMonth,
      is_leap_month: isLeapMonth,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(res.error || 'Không thể tạo ngày giỗ');
    }
  };

  const handleMemberChange = (selectedId: string) => {
    setMemberId(selectedId);
    const m = membersList.find((item) => item.id === selectedId);
    if (m && !title) {
      setTitle(`Lễ Giỗ Cụ ${m.full_name}`);
      if (m.death_lunar_day) setLunarDay(m.death_lunar_day);
      if (m.death_lunar_month) setLunarMonth(m.death_lunar_month);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 dark:from-amber-950/40 via-emerald-500/5 to-transparent">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Thiết Lập Ngày Giỗ Họ Tộc</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chu kỳ Âm lịch hàng năm (Tự động quy đổi Dương lịch)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-heritage-green" />
              <span>Tiền Nhân / Thành Viên Quá Cố *</span>
            </label>
            <select
              value={memberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-semibold text-slate-800 dark:text-white"
            >
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.gender === 'MALE' ? 'Nam' : 'Nữ'} - {m.life_status === 'DECEASED' ? '🕯️ Tiền nhân' : '🌿 Thành viên'})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên / Danh Xưng Lễ Giỗ *
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Giỗ Cụ Thủy Tổ Nguyễn Văn Phúc, Giỗ Cụ Chi Trưởng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-semibold dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Lunar Date Pickers */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800">
            <div>
              <label className="block text-[11px] font-bold text-amber-950 dark:text-amber-200 mb-1">Ngày Âm Lịch (1 - 30)</label>
              <select
                value={lunarDay}
                onChange={(e) => setLunarDay(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Ngày {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-950 dark:text-amber-200 mb-1">Tháng Âm Lịch (1 - 12)</label>
              <select
                value={lunarMonth}
                onChange={(e) => setLunarMonth(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1} {i === 0 ? '(Tháng Giêng)' : i === 11 ? '(Tháng Chạp)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Leap Month Option (BR-MEMORIAL-003) */}
            <div className="col-span-2 mt-1">
              <label className="flex items-center space-x-2 text-xs font-semibold text-amber-900 dark:text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Ngày giỗ thuộc Tháng Nhuận âm lịch</span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Dương lịch năm {nextOccurrence.solarYear}:</span>
              <span className="text-heritage-green font-bold text-sm bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 dark:text-emerald-300">
                {nextOccurrence.solarDate}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Đếm ngược thời gian:</span>
              <span className="font-semibold text-amber-700">
                {nextOccurrence.daysRemaining >= 0
                  ? `Còn ${nextOccurrence.daysRemaining} ngày`
                  : `Đã qua ${Math.abs(nextOccurrence.daysRemaining)} ngày`}
              </span>
            </div>

            {/* 30th Lunar Month Fallback Alert (BR-MEMORIAL-004) */}
            {nextOccurrence.isSpecial30Fallback && (
              <div className="mt-2 p-2.5 bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                ⚠️ <strong>Lưu ý ngày giỗ 30 Âm:</strong> Năm {nextOccurrence.solarYear} tháng {lunarMonth} chỉ có 29 ngày (tháng thiếu). Lễ cúng sẽ được gợi ý tiến hành vào ngày 29.
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi Chú Nghi Lễ / Hướng Dẫn Cúng Tế</label>
            <textarea
              rows={2}
              placeholder="Ghi chú về phân công chuẩn bị mâm lễ, địa điểm nhà thờ hoặc chi phái..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-medium dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Lưu...' : 'Lưu Ngày Giỗ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
