import React, { useState } from 'react';
import { Scroll, Sparkles, Edit3, ChevronDown, ChevronUp, ShieldCheck, BookOpen, Quote } from 'lucide-react';
import { Family } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { ClanCovenantModal, DEFAULT_COVENANT_TEMPLATE } from './ClanCovenantModal';

interface ClanCovenantCardProps {
  family: Family;
}

export const ClanCovenantCard: React.FC<ClanCovenantCardProps> = ({ family }) => {
  const { isFamilyAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const title = family.covenant_title || DEFAULT_COVENANT_TEMPLATE.title;
  const preamble = family.covenant_preamble || DEFAULT_COVENANT_TEMPLATE.preamble;
  const articles =
    family.covenant_articles && family.covenant_articles.length > 0
      ? family.covenant_articles
      : DEFAULT_COVENANT_TEMPLATE.articles;

  const displayedArticles = isExpanded ? articles : articles.slice(0, 4);

  return (
    <div className="relative bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 border-2 border-amber-300/80 rounded-3xl p-6 md:p-8 shadow-xs overflow-hidden">
      {/* Delicate Archival Watermark Pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 bg-[radial-gradient(#C49A3A_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/40">
            <Scroll className="w-3.5 h-3.5 text-amber-700" />
            <span>Tộc Ước & Gia Phong Dòng Họ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif tracking-tight text-amber-950">
            {title}
          </h2>
        </div>

        {/* Action button: Edit for Family Admin */}
        {isFamilyAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 shadow-xs hover:shadow-sm transition self-start sm:self-auto shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span>Chỉnh Sửa Hương Ước</span>
          </button>
        )}
      </div>

      {/* Preamble / Lời Tựa Răn Dạy */}
      <div className="mt-5 relative bg-amber-100/50 border-l-4 border-amber-600 rounded-r-2xl p-4 sm:p-5">
        <Quote className="w-6 h-6 text-amber-500/40 absolute right-3 top-3 pointer-events-none" />
        <div className="text-xs sm:text-sm text-amber-950 font-serif italic leading-relaxed">
          "{preamble}"
        </div>
      </div>

      {/* Articles Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedArticles.map((article, idx) => {
          // Check if article has title prefix (e.g. "Hiếu Kính Tổ Tiên: ...")
          const parts = article.split(':');
          const hasTitle = parts.length > 1;
          const articleTitle = hasTitle ? parts[0].trim() : `Điều ${idx + 1}`;
          const articleBody = hasTitle ? parts.slice(1).join(':').trim() : article;

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-2xs hover:shadow-xs hover:border-amber-400 transition space-y-1.5 flex gap-3.5 items-start"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-serif">
                  <span>{articleTitle}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {articleBody}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Button if articles > 4 */}
      {articles.length > 4 && (
        <div className="mt-5 text-center pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-white/80 hover:bg-white px-4 py-2 rounded-full border border-amber-300 shadow-2xs transition"
          >
            <span>
              {isExpanded ? 'Thu gọn quy ước' : `Xem toàn văn tất cả ${articles.length} điều quy ước`}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-700" />
            )}
          </button>
        </div>
      )}

      {/* Modal for editing */}
      <ClanCovenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        family={family}
      />
    </div>
  );
};
