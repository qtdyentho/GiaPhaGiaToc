import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Eye, Calendar, User, Pin, Sparkles } from 'lucide-react';
import { ClanChronicle, CHRONICLE_CATEGORY_LABELS } from '../../types/chronicle';
import { formatDate } from '../../lib/utils';

interface ChronicleCardProps {
  chronicle: ClanChronicle;
  onLike?: (id: string) => void;
}

export const ChronicleCard: React.FC<ChronicleCardProps> = ({ chronicle, onLike }) => {
  const categoryInfo = CHRONICLE_CATEGORY_LABELS[chronicle.category] || {
    label: 'Ký Sự Gia Tộc',
    color: 'bg-slate-100 text-slate-800',
    icon: '📜',
  };

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all overflow-hidden flex flex-col justify-between">
      {/* Cover Image / Gradient Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {chronicle.cover_image_url ? (
          <img
            src={chronicle.cover_image_url}
            alt={chronicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-slate-900/40 flex items-center justify-center">
            <span className="text-4xl">{categoryInfo.icon}</span>
          </div>
        )}

        {/* Category Badge & Pin */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-md ${categoryInfo.color}`}
          >
            {categoryInfo.icon} {categoryInfo.label}
          </span>
          {chronicle.is_pinned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs flex items-center gap-1">
              <Pin className="w-3 h-3" /> Ghim
            </span>
          )}
        </div>

        {/* View Count Overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
          <Eye className="w-3 h-3" /> {chronicle.views_count || 1}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(chronicle.published_at || chronicle.created_at)}</span>
            {chronicle.author_branch && <span>• {chronicle.author_branch}</span>}
          </div>

          <Link to={`/app/clan/chronicles/${chronicle.id}`} className="block">
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
              {chronicle.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {chronicle.summary}
          </p>
        </div>

        {/* Card Footer: Author & Interactions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">
              {chronicle.author_name.charAt(0)}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-[11px]">
              {chronicle.author_name}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onLike && onLike(chronicle.id)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition cursor-pointer"
              title="Thắp nén tâm hương / Tri ân"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 hover:fill-rose-500" />
              <span>{chronicle.likes_count || 0}</span>
            </button>

            <Link
              to={`/app/clan/chronicles/${chronicle.id}#comments`}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-amber-600 transition"
              title="Lưu bút & Bình luận"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>{chronicle.comments_count || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
