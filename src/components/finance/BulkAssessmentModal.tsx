import React, { useState } from 'react';
import { X, Layers, Users, Calendar, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Fund, IncomeCategory, Branch, Generation, Member } from '../../types/database';
import { FundService } from '../../services/FundService';
import { mockMembers } from '../../services/mockData';

interface BulkAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  funds: Fund[];
  categories: IncomeCategory[];
  branches: Branch[];
  generations: Generation[];
  familyId?: string;
}

export const BulkAssessmentModal: React.FC<BulkAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funds,
  categories,
  branches,
  generations,
  familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('Đóng góp Quỹ Gia Tộc Thường Niên 2026');
  const [fundId, setFundId] = useState(funds[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [amountDue, setAmountDue] = useState<string>('500000');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [targetScope, setTargetScope] = useState<'ALL' | 'BRANCH' | 'GENERATION'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
  const [selectedGenId, setSelectedGenId] = useState(generations[0]?.id || '');
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter members based on target scope
  let eligibleMembers = mockMembers.filter((m) => m.life_status === 'ALIVE');
  if (targetScope === 'BRANCH' && selectedBranchId) {
    eligibleMembers = eligibleMembers.filter((m) => m.branch_id === selectedBranchId);
  } else if (targetScope === 'GENERATION' && selectedGenId) {
    eligibleMembers = eligibleMembers.filter((m) => m.generation_id === selectedGenId);
  }

  const totalEstimatedAmount = eligibleMembers.reduce((sum, m) => {
    const amt = overrides[m.id] !== undefined ? overrides[m.id] : Number(amountDue) || 0;
    return sum + amt;
  }, 0);

  const handleCommit = async () => {
    if (!title.trim() || !fundId || !amountDue) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await FundService.createBulkAssessment({
        familyId,
        fundId,
        categoryId,
        title: title.trim(),
        amountDue: Number(amountDue),
        dueDate,
        targetScope,
        branchId: selectedBranchId,
        generationId: selectedGenId,
        customAmounts: overrides,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Lỗi khi tạo định mức thu.');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Lập Định Mức Thu Phí Thành Viên</h3>
              <p className="text-xs text-slate-400">
                {step === 1 ? 'Bước 1: Thiết lập tiêu chí & mức thu cơ bản' : 'Bước 2: Xem trước & Tùy chỉnh từng thành viên'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: CONFIG */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên đợt thu <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Đóng góp thường niên 2026, Quỹ sửa chữa từ đường..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quỹ thụ hưởng</label>
                  <select
                    value={fundId}
                    onChange={(e) => setFundId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} (Số dư: {Number(f.current_balance || 0).toLocaleString()} ₫)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Danh mục nguồn thu</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phạm vi phân bổ */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Phạm vi phân bổ
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetScope('ALL')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      targetScope === 'ALL'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">Toàn Gia Tộc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetScope('BRANCH')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      targetScope === 'BRANCH'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-medium">Theo Chi Phái</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetScope('GENERATION')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      targetScope === 'GENERATION'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Theo Thế Hệ (Đời)</span>
                  </button>
                </div>
              </div>

              {targetScope === 'BRANCH' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chọn Chi Phái</label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetScope === 'GENERATION' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chọn Thế Hệ (Đời)</label>
                  <select
                    value={selectedGenId}
                    onChange={(e) => setSelectedGenId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {generations.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (Đời {g.generation_number})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mức thu mặc định (VNĐ) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="10000"
                    value={amountDue}
                    onChange={(e) => setAmountDue(e.target.value)}
                    placeholder="VD: 500000"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hạn chót đóng góp</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Quy tắc nghiệp vụ:</strong> Tạo nghĩa vụ thu (Assessment) <strong>KHÔNG</strong> làm tăng số dư quỹ ngay. Số dư quỹ chỉ tăng khi thành viên thực tế nộp tiền và được đối soát vào Sổ cái (Ledger).
                </span>
              </div>
            </div>
          ) : (
            /* STEP 2: PREVIEW & CUSTOMIZE */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Số lượng thành viên áp dụng:</span>
                  <p className="text-base font-bold text-slate-100">{eligibleMembers.length} thành viên</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Tổng dự thu:</span>
                  <p className="text-base font-bold text-amber-400 font-mono">
                    {totalEstimatedAmount.toLocaleString()} ₫
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {eligibleMembers.map((m) => {
                  const currentAmt = overrides[m.id] !== undefined ? overrides[m.id] : Number(amountDue);
                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{m.full_name}</span>
                        <span className="text-slate-400 text-[11px] block">
                          {branches.find((b) => b.id === m.branch_id)?.name || 'Chi Trưởng'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Mức thu:</span>
                        <input
                          type="number"
                          step="10000"
                          value={currentAmt}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setOverrides((prev) => ({ ...prev, [m.id]: val }));
                          }}
                          className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono text-right focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-slate-400">₫</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Toàn bộ bản ghi sẽ được tạo nguyên tử trong một phiên giao dịch duy nhất.</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                ← Quay lại Bước 1
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Hủy
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <span>Xem Trước ({eligibleMembers.length} người)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang khởi tạo...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Xác Nhận & Tạo Nghĩa Vụ Thu</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
