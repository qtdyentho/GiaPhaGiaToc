import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Sparkles, Heart, MessageSquare, Plus } from 'lucide-react';
import { ClanChronicle, CHRONICLE_CATEGORY_LABELS } from '../../types/chronicle';
import { ClanChronicleService } from '../../services/ClanChronicleService';
import { formatDate } from '../../lib/utils';
import { CreateChronicleModal } from './CreateChronicleModal';

interface RecentChroniclesWidgetProps {
  familyId: string;
  isFamilyAdmin?: boolean;
}

export const RecentChroniclesWidget: React.FC<RecentChroniclesWidgetProps> = ({
  familyId,
  isFamilyAdmin = false,
}) => {
  const [chronicles, setChronicles] = useState<ClanChronicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = async () => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await ClanChronicleService.getChronicles(familyId);
      setChronicles(list.slice(0, 3));
    } catch (err) {
      console.warn('Cannot load recent chronicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [familyId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Widget Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Lưu Ký & Ký Sự Gia Tộc</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Mới
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Kỷ niệm, sự tích tiền nhân & truyền thống dòng họ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1.5 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Viết bài mới"
          >
            <Plus className="w-4 h-4" />
          </button>
          <Link
            to="/app/clan/chronicles"
            className="text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline flex items-center"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Widget Body */}
      <div className="p-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Đang tải ký sự...</div>
        ) : chronicles.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-2xl">📜</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chưa có bài viết hay lưu ký nào được xuất bản.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-bold text-[#166534] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Viết bài lưu ký đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {chronicles.map((c) => {
              const catInfo = CHRONICLE_CATEGORY_LABELS[c.category] || {
                label: 'Ký Sự',
                color: 'bg-slate-100 text-slate-800',
                icon: '📜',
              };

              return (
                <Link
                  key={c.id}
                  to={`/app/clan/chronicles/${c.id}`}
                  className="group block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {catInfo.icon} {catInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(c.published_at || c.created_at)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {c.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3 text-rose-500" /> {c.likes_count || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CreateChronicleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
