import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit3,
  CheckCircle2,
  History,
  Layers,
  X,
  Save,
  Check,
  Zap,
  Sparkles,
  Users,
  HardDrive,
  UserCheck,
} from 'lucide-react';
import { BillingService } from '../services/BillingService';
import { Plan, PlanVersion, PlanTier } from '../types/database';
import { formatCurrency } from '../lib/utils';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { plans: livePlans, versions: liveVersions } = await BillingService.getPublicPlans();
        setPlans(livePlans || []);
        setVersions(liveVersions || []);
      } catch (err) {
        console.error('Lỗi tải gói cước:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Form states
  const [planCode, setPlanCode] = useState<PlanTier>('GIA_TOC');
  const [planName, setPlanName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<number>(0);
  const [priceYearly, setPriceYearly] = useState<number>(0);
  const [trialDays, setTrialDays] = useState<number>(14);
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setIsNewPlan(true);
    setSelectedPlan(null);
    setPlanCode('GIA_TOC');
    setPlanName('');
    setShortDesc('');
    setPriceMonthly(99000);
    setPriceYearly(990000);
    setTrialDays(14);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setIsNewPlan(false);
    setSelectedPlan(plan);
    const ver = versions.find((v) => v.plan_id === plan.id);
    setPlanCode(plan.code);
    setPlanName(plan.name);
    setShortDesc(plan.short_description || '');
    setPriceMonthly(ver?.price_monthly || 0);
    setPriceYearly(ver?.price_yearly || 0);
    setTrialDays(ver?.trial_days || 0);
    setIsActive(plan.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    if (isNewPlan) {
      const newPlanId = `plan-${Date.now()}`;
      const newPlan: Plan = {
        id: newPlanId,
        code: planCode,
        name: planName.trim(),
        short_description: shortDesc.trim(),
        is_public: true,
        is_active: isActive,
        sort_order: plans.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newVersion: PlanVersion = {
        id: `ver-${Date.now()}`,
        plan_id: newPlanId,
        version_number: 1,
        price_monthly: Number(priceMonthly),
        price_yearly: Number(priceYearly),
        currency: 'VND',
        trial_days: Number(trialDays),
        is_current: true,
        effective_from: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setPlans((prev) => [...prev, newPlan]);
      setVersions((prev) => [...prev, newVersion]);
      setFeedback(`Đã tạo thành công gói cước mới "${newPlan.name}"!`);
    } else if (selectedPlan) {
      // Update existing plan
      const updatedPlans = plans.map((p) =>
        p.id === selectedPlan.id
          ? {
              ...p,
              name: planName.trim(),
              short_description: shortDesc.trim(),
              is_active: isActive,
              updated_at: new Date().toISOString(),
            }
          : p
      );
      setPlans(updatedPlans);

      // Create new version or update current version
      const updatedVersions = versions.map((v) =>
        v.plan_id === selectedPlan.id
          ? {
              ...v,
              price_monthly: Number(priceMonthly),
              price_yearly: Number(priceYearly),
              trial_days: Number(trialDays),
              version_number: v.version_number + 1,
              updated_at: new Date().toISOString(),
            }
          : v
      );
      setVersions(updatedVersions);
      setFeedback(`Đã cập nhật biểu phí và nâng cấp phiên bản cho gói "${planName}"!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <span>Quản Trị Danh Mục Gói Cước & Biểu Phí SaaS</span>
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Plan Versioning Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý biểu phí, số ngày dùng thử, tính năng và bảo toàn hợp đồng cũ khi cập nhật giá mới.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Gói Cước Mới</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Gói</th>
                <th className="py-3.5 px-4">Tên Gói & Mô Tả</th>
                <th className="py-3.5 px-4 text-right">Giá Tháng</th>
                <th className="py-3.5 px-4 text-right">Giá Năm</th>
                <th className="py-3.5 px-4 text-center">Dùng Thử</th>
                <th className="py-3.5 px-4 text-center">Phiên Bản</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => {
                const version = versions.find((v) => v.plan_id === plan.id);
                return (
                  <tr key={plan.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{plan.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-serif text-sm">{plan.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{plan.short_description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                      {version ? formatCurrency(version.price_monthly) : '0 ₫'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 dark:text-emerald-400">
                      {version ? formatCurrency(version.price_yearly) : '0 ₫'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      {version?.trial_days ? `${version.trial_days} ngày` : 'Không'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700 font-mono">
                        v{version?.version_number || 1}.0
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 font-bold text-[10px] rounded-full ${
                          plan.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {plan.is_active !== false ? '🟢 CÔNG KHAI' : '⚪ TẠM ẨN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(plan)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-semibold inline-flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#14532D] to-[#166534] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif">
                    {isNewPlan ? 'Tạo Gói Cước Mới' : `Chỉnh Sửa Gói: ${planName}`}
                  </h2>
                  <p className="text-xs text-emerald-200">Thiết lập biểu phí và phiên bản giá</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Mã Gói Cước (Tier) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value as PlanTier)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                  >
                    <option value="FREE">FREE (Trải nghiệm)</option>
                    <option value="FAMILY">FAMILY (Hộ gia đình)</option>
                    <option value="GIA_TOC">GIA_TOC (Chi phái gia tộc)</option>
                    <option value="DONG_HO">DONG_HO (Đại tộc vạn niên)</option>
                    <option value="PREMIUM">PREMIUM (Cao cấp đặc biệt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Tên Gói Hiển Thị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="VD: Gói Gia Tộc Chuẩn Mực"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Mô Tả Ngắn
                </label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Dành cho dòng họ quy mô 100 - 300 thành viên..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Giá Tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    step={10000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Giá Năm (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(Number(e.target.value))}
                    step={10000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-bold text-emerald-700 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Kỳ Dùng Thử (Ngày)
                  </label>
                  <input
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#166534] rounded focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Công khai gói cước này trên Bảng giá thanh toán (Active Plan)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isNewPlan ? 'Lưu Gói Mới' : 'Cập Nhật Phiên Bản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlansPage;
