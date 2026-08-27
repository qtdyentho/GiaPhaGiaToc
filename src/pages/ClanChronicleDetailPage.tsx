import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  Trash2,
  Send,
  BookOpen,
  Sparkles,
  Check,
  Landmark,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClanChronicle, ClanChronicleComment, CHRONICLE_CATEGORY_LABELS } from '../types/chronicle';
import { ClanChronicleService } from '../services/ClanChronicleService';
import { formatDate } from '../lib/utils';
import { PrintableClanQRCodeModal } from '../components/family/PrintableClanQRCodeModal';

export const ClanChronicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeFamily, user, isFamilyAdmin } = useAuth();
  const currentFamId = activeFamily?.id || '';

  const [chronicle, setChronicle] = useState<ClanChronicle | null>(null);
  const [comments, setComments] = useState<ClanChronicleComment[]>([]);
  const [loading, setLoading] = useState(true);

  // New Comment State
  const [commentContent, setCommentContent] = useState('');
  const [authorName, setAuthorName] = useState(user?.full_name || '');
  const [authorBranch, setAuthorBranch] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const loadChronicleData = async () => {
    if (!id || !currentFamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [data, cmts] = await Promise.all([
        ClanChronicleService.getChronicleById(id, currentFamId),
        ClanChronicleService.getComments(id, currentFamId),
      ]);
      setChronicle(data);
      setComments(cmts);
    } catch (err) {
      console.warn('Lỗi tải chi tiết ký sự:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChronicleData();
  }, [id, currentFamId]);

  const handleLike = async () => {
    if (!chronicle) return;
    const res = await ClanChronicleService.likeChronicle(chronicle.id, currentFamId);
    if (res.success) {
      setChronicle({ ...chronicle, likes_count: res.likes });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chronicle || !commentContent.trim()) return;

    setIsSubmittingComment(true);
    const res = await ClanChronicleService.addComment({
      chronicle_id: chronicle.id,
      family_id: currentFamId,
      author_id: user?.id,
      author_name: authorName.trim() || 'Con cháu dòng tộc',
      author_branch: authorBranch.trim() || undefined,
      content: commentContent.trim(),
    });

    setIsSubmittingComment(false);
    if (res.success && res.comment) {
      setComments([res.comment, ...comments]);
      setCommentContent('');
      setChronicle({ ...chronicle, comments_count: (chronicle.comments_count || 0) + 1 });
    }
  };

  const handleDelete = async () => {
    if (!chronicle) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa bài lưu ký này không?')) {
      await ClanChronicleService.deleteChronicle(chronicle.id, currentFamId);
      navigate('/app/clan/chronicles');
    }
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleZaloShare = () => {
    if (!chronicle) return;
    const text = encodeURIComponent(
      `[${activeFamily?.name || 'Gia Tộc'}] Đọc bài lưu ký: ${chronicle.title}\n${window.location.href}`
    );
    window.open(`https://zalo.me/share?url=${encodeURIComponent(window.location.href)}&text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Đang nạp bài ký sự...</p>
      </div>
    );
  }

  if (!chronicle) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">📜</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Không Tìm Thấy Bài Lưu Ký
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bài viết có thể đã được gỡ bỏ hoặc không thuộc dòng họ của bạn.
        </p>
        <Link
          to="/app/clan/chronicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#166534] text-white text-xs font-bold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về danh sách ký sự</span>
        </Link>
      </div>
    );
  }

  const categoryInfo = CHRONICLE_CATEGORY_LABELS[chronicle.category] || {
    label: 'Ký Sự Gia Tộc',
    color: 'bg-slate-100 text-slate-800',
    icon: '📜',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* ── Back button & Actions ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/app/clan/chronicles"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về danh sách lưu ký</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Đã sao chép link' : 'Sao chép link'}</span>
          </button>

          <button
            onClick={handleZaloShare}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Chia sẻ Zalo</span>
          </button>

          {isFamilyAdmin && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer"
              title="Xóa bài viết này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Article Container ── */}
      <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Cover Image Banner */}
        {chronicle.cover_image_url && (
          <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={chronicle.cover_image_url}
              alt={chronicle.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-6">
          {/* Metadata & Badges */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(chronicle.published_at || chronicle.created_at)}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {chronicle.views_count} lượt xem
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {chronicle.title}
            </h1>

            {/* Author Profile */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                {chronicle.author_name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {chronicle.author_name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {chronicle.author_branch || 'Thành viên gia tộc'}
                  {chronicle.author_generation ? ` • Đời thứ ${chronicle.author_generation}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Quote Box */}
          {chronicle.summary && (
            <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border-l-4 border-amber-500 text-xs sm:text-sm italic text-amber-950 dark:text-amber-200 leading-relaxed font-serif">
              "{chronicle.summary}"
            </div>
          )}

          {/* Article Body */}
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-sans">
            {chronicle.content}
          </div>

          {/* Interaction Bar */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={handleLike}
              className="px-6 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer border border-rose-200 dark:border-rose-800"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Thắp Nén Tâm Hương / Bày Tỏ Tri Ân ({chronicle.likes_count || 0})</span>
            </button>

            <div className="text-xs text-slate-400 font-medium">
              Gia Tộc: <strong>{activeFamily?.name}</strong>
            </div>
          </div>
        </div>
      </article>

      {/* ── Comments & Reflections Section (Lưu Bút Con Cháu) ── */}
      <section id="comments" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Lưu Bút & Cảm Nghĩ Con Cháu ({comments.length})
            </h2>
            <p className="text-xs text-slate-400">
              Gửi lời tri ân tiền nhân hoặc chia sẻ ký ức kỷ niệm dòng họ
            </p>
          </div>
        </div>

        {/* New Comment Input Form */}
        <form onSubmit={handleAddComment} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Họ và tên của bạn..."
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              required
            />
            <input
              type="text"
              value={authorBranch}
              onChange={(e) => setAuthorBranch(e.target.value)}
              placeholder="Chi / Cành nhánh (VD: Chi Hai, Nhánh Sài Gòn)..."
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <textarea
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Viết lời cảm nghĩ, lưu bút tri ân tiền nhân..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingComment ? 'Đang gửi...' : 'Gửi Lưu Bút'}</span>
            </button>
          </div>
        </form>

        {/* Comment List */}
        <div className="space-y-4 pt-2">
          {comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có lưu bút nào. Hãy là người đầu tiên để lại cảm nghĩ!
            </div>
          ) : (
            comments.map((cmt) => (
              <div
                key={cmt.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                      {cmt.author_name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cmt.author_name}
                    </span>
                    {cmt.author_branch && (
                      <span className="text-[11px] text-slate-400">
                        • {cmt.author_branch}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(cmt.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 pl-8 leading-relaxed">
                  {cmt.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Clan QR Modal */}
      {activeFamily && (
        <PrintableClanQRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          family={activeFamily}
          passToken={activeFamily.code || 'GIA-TOC'}
        />
      )}
    </div>
  );
};
export default ClanChronicleDetailPage;
