import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, CheckCircle2, MapPin, DollarSign, Users, Building } from 'lucide-react';
import { EventService } from '../../services/calendar/EventService';
import { GenealogyService } from '../../services/GenealogyService';
import { FundService } from '../../services/FundService';
import { Branch, Fund } from '../../types/database';
import { LunarDatePicker } from '../common/LunarDatePicker';
import { useAuth } from '../../contexts/AuthContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  familyId?: string;
  defaultDate?: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  familyId,
  defaultDate,
}) => {
  const { activeFamily } = useAuth();
  const targetFamId = familyId || activeFamily?.id || '';
  
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [fundsList, setFundsList] = useState<Fund[]>([]);

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<string>('CLAN_ANCESTRAL_DAY');
  const [location, setLocation] = useState(activeFamily?.ancestral_hall_address || 'Nhà thờ họ / Từ đường');
  const [description, setDescription] = useState('');
  const [branchId, setBranchId] = useState<string>('ALL');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(0);
  const [fundId, setFundId] = useState<string>('');
  
  const [solarDate, setSolarDate] = useState<string>(defaultDate || new Date().toISOString().split('T')[0]);
  const [lunarDay, setLunarDay] = useState<number>(1);
  const [lunarMonth, setLunarMonth] = useState<number>(1);
  const [lunarYear, setLunarYear] = useState<number>(new Date().getFullYear());
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (isOpen && targetFamId) {
        try {
          const [tree, funds] = await Promise.all([
            GenealogyService.getFamilyTree(targetFamId),
            FundService.getFunds(targetFamId),
          ]);
          const bList = tree.branches || [];
          const fList = funds || [];
          setBranchesList(bList);
          setFundsList(fList);
          if (!fundId && fList[0]) {
            setFundId(fList[0].id);
          }
        } catch (err) {
          console.error('Lỗi khi tải danh sách chi phái và quỹ cho sự kiện:', err);
        }
      }
    }
    loadData();
  }, [isOpen, targetFamId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên sự kiện gia tộc');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await EventService.createEvent({
      family_id: targetFamId,
      title: title.trim(),
      description: description.trim(),
      event_type: eventType as any,
      scope: branchId === 'ALL' ? 'FAMILY' : 'BRANCH',
      solar_date: solarDate,
      lunar_day: lunarDay,
      lunar_month: lunarMonth,
      lunar_year: lunarYear,
      is_leap_month: isLeapMonth,
      location: location.trim(),
      estimated_budget: Number(estimatedBudget) || 0,
      branch_id: branchId !== 'ALL' ? branchId : undefined,
      fund_id: fundId || undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(res.error || 'Có lỗi xảy ra khi tạo sự kiện');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 dark:from-emerald-950/40 via-amber-500/5 to-transparent">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-900 dark:text-emerald-300 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Tạo Sự Kiện Gia Tộc Mới</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Giỗ Tổ, Họp Họ, Lễ Khuyến Học, Khánh Thành Từ Đường</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên Sự Kiện Họ Tộc *
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Đại Lễ Giỗ Tổ Năm 2026, Họp Hội Đồng Gia Tộc Rằm Tháng Giêng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-semibold dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Event Type & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Loại Sự Kiện</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-semibold text-slate-800 dark:text-white"
              >
                <option value="CLAN_ANCESTRAL_DAY">🏛️ Đại Lễ Giỗ Tổ Họ</option>
                <option value="FAMILY_MEETING">👥 Họp Hội Đồng Gia Tộc</option>
                <option value="ANCESTRAL_HALL_RENOVATION">🔨 Tu Bổ / Khánh Thành Từ Đường</option>
                <option value="LONGEVITY">💐 Lễ Mừng Thọ / Khuyến Học</option>
                <option value="WEDDING">💍 Hỷ Sự / Cưới Hỏi</option>
                <option value="FUNERAL">🕊️ Tang Lễ / Cầu Siêu</option>
                <option value="OTHER">🌿 Sự Kiện Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quy Mô / Chi Phái</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-semibold text-slate-800 dark:text-white"
              >
                <option value="ALL">Toàn Thể Dòng Họ (Toàn Tộc)</option>
                {branchesList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker Component */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Thời Gian Tổ Chức (Âm / Dương Đồng Bộ)</label>
            <LunarDatePicker
              solarValue={solarDate}
              onChange={(data) => {
                setSolarDate(data.solarDate);
                setLunarDay(data.lunarDay);
                setLunarMonth(data.lunarMonth);
                setLunarYear(data.lunarYear);
                setIsLeapMonth(data.isLeapMonth);
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Địa Điểm Tổ Chức</span>
            </label>
            <input
              type="text"
              placeholder="Địa chỉ nhà thờ họ, nhà văn hóa thôn hoặc tư gia..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-heritage-green focus:bg-white font-semibold dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {/* Event Budget Integration (BR-EVENT-004) */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-200">
              <DollarSign className="w-4 h-4 text-heritage-green dark:text-emerald-400" />
              <span>Dự Toán Ngân Sách & Nguồn Quỹ Chi Trả</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-0.5">Dự Toán Chi Phí (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  placeholder="0"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green font-bold text-emerald-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-0.5">Trích Từ Quỹ Họ</label>
                <select
                  value={fundId}
                  onChange={(e) => setFundId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green font-semibold text-slate-800 dark:text-white"
                >
                  {fundsList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Số dư: {new Intl.NumberFormat('vi-VN').format(f.current_balance)} đ)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Chi Tiết / Chương Trình Lễ</label>
            <textarea
              rows={2}
              placeholder="Chương trình dâng hương, đại hội tổng kết, văn nghệ con cháu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <span>{isSubmitting ? 'Đang Tạo...' : 'Tạo Sự Kiện'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
