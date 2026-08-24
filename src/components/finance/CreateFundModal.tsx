import React, { useState } from 'react';
import { X, Landmark, Plus, Check } from 'lucide-react';
import { Fund } from '../../types/database';
import { FundService } from '../../services/FundService';

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
  familyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
}) => {
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
        family_id: familyId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Khởi Tạo Quỹ Gia Tộc Mới</h3>
              <p className="text-xs text-slate-400">Quản lý quỹ minh bạch & độc lập</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên quỹ <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quỹ Khuyến Học, Quỹ Tu Bổ Từ Đường..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số dư ban đầu (VNĐ)</label>
            <input
              type="number"
              min="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="VD: 10000000"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mô tả & Mục đích chi tiêu</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục đích sử dụng quỹ, quy chế thu chi..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
