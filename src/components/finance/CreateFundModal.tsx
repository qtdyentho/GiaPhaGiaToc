import React, { useState } from 'react';
import { X, Landmark, Check } from 'lucide-react';
import { FundService } from '../../services/FundService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  familyId?: string;
}

export const CreateFundModal: React.FC<CreateFundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  familyId,
}) => {
  const { activeFamily } = useAuth();
  const targetFamId = familyId || activeFamily?.id || '';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [openingBalance, setOpeningBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên quỹ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await FundService.createFund({
        family_id: targetFamId,
        name: name.trim(),
        description: description.trim() || undefined,
        opening_balance: Number(openingBalance) || 0,
        current_balance: Number(openingBalance) || 0,
        status: 'ACTIVE',
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Không thể tạo quỹ');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-amber-50 via-white to-amber-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Khởi Tạo Quỹ Gia Tộc Mới</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý quỹ minh bạch & độc lập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên quỹ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quỹ Khuyến Học, Quỹ Tu Bổ Từ Đường..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white dark:focus:bg-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Số dư ban đầu (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="VD: 10000000"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mô tả & Mục đích chi tiêu</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục đích sử dụng quỹ, quy chế thu chi..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tạo Quỹ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFundModal;
