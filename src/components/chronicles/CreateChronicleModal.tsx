import React, { useState } from 'react';
import { X, Send, Image, Tag, Sparkles, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { ChronicleCategory, CHRONICLE_CATEGORY_LABELS } from '../../types/chronicle';
import { ClanChronicleService } from '../../services/ClanChronicleService';
import { useAuth } from '../../contexts/AuthContext';
import { compressImage } from '../../lib/imageCompressor';

interface CreateChronicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateChronicleModal: React.FC<CreateChronicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeFamily, user, activeMembership } = useAuth();
  const currentFamilyId = activeFamily?.id || '';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ChronicleCategory>('ORIGIN_HISTORY');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [authorName, setAuthorName] = useState(user?.full_name || 'Con cháu dòng tộc');
  const [authorBranch, setAuthorBranch] = useState('');
  const [authorGeneration, setAuthorGeneration] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await ClanChronicleService.createChronicle({
      family_id: currentFamilyId,
      author_id: user?.id,
      author_name: authorName.trim(),
      author_branch: authorBranch.trim() || undefined,
      author_generation: authorGeneration ? Number(authorGeneration) : undefined,
      title: title.trim(),
      summary: summary.trim() || content.trim().slice(0, 150) + '...',
      content: content.trim(),
      category,
      cover_image_url: coverImageUrl.trim() || undefined,
      is_featured: isFeatured,
      is_pinned: isPinned,
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Có lỗi xảy ra khi lưu bài viết.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Viết Bài / Lưu Ký Gia Tộc
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ghi chép sự tích, kỷ niệm và truyền thống dòng họ cho muôn đời con cháu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tiêu đề bài viết / Ký sự <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Ký sự Đại Lễ Tế Tổ Xuân Bính Ngọ 2026..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#166534] transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chủ đề bài viết <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ChronicleCategory)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#166534]"
                >
                  {Object.entries(CHRONICLE_CATEGORY_LABELS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.icon} {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ảnh bìa bài viết (Tải file hoặc nhập URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                  <label className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-bold cursor-pointer transition shrink-0">
                    <span>{isCompressing ? 'Đang nén...' : 'Tải file ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressing}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        try {
                          setIsCompressing(true);
                          const compressed = await compressImage(files[0], 1200, 800, 0.82);
                          setCoverImageUrl(compressed);
                        } catch (err) {
                          console.warn('Lỗi nén ảnh:', err);
                        } finally {
                          setIsCompressing(false);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {coverImageUrl && (
                  <div className="mt-2 relative h-24 rounded-xl overflow-hidden border border-emerald-500/40 w-40">
                    <img
                      src={coverImageUrl}
                      alt="Xem trước ảnh bìa"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md hover:bg-black/80 text-[10px]"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Author info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Thông tin người viết / Ký tên
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Chi / Cành nhánh
                </label>
                <input
                  type="text"
                  value={authorBranch}
                  onChange={(e) => setAuthorBranch(e.target.value)}
                  placeholder="VD: Chi Trưởng, Cành 2..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Đời thứ mấy (trong họ)
                </label>
                <input
                  type="number"
                  value={authorGeneration}
                  onChange={(e) => setAuthorGeneration(e.target.value)}
                  placeholder="VD: 14"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tóm tắt ngắn gọn bài viết
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Lời tựa ngắn mô tả nội dung chính của bài viết..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nội dung bài viết / Lưu ký chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung chi tiết bài viết, diễn biến ký sự, câu chuyện gia đình..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm leading-relaxed text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#166534]"
              required
            />
          </div>

          {/* Featured & Pinned Options */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Ghim bài viết lên đầu trang</span>
            </label>
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span>Đưa vào mục Ký Sự Nổi Bật</span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang xuất bản...' : 'Xuất Bản Lưu Ký'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
