import React from 'react';
import { Crown } from 'lucide-react';

interface AncestralBannerProps {
  familyName?: string;
  clanTitle?: string;
  bannerUrl?: string;
  hometown?: string;
  generationCount?: number;
  totalMembers?: number;
  className?: string;
}

export const AncestralBanner: React.FC<AncestralBannerProps> = ({
  familyName = 'ĐẠI TỘC GIA PHẢ',
  clanTitle = 'ẨM THỦY TƯ NGUYÊN',
  bannerUrl,
  hometown,
  generationCount,
  totalMembers,
  className = '',
}) => {
  return (
    <div data-testid="ancestral-banner" className={`flex flex-col items-center select-none ${className}`}>
      {bannerUrl ? (
        <div className="relative mb-6 max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/80 bg-black/40">
          <img
            src={bannerUrl}
            alt={familyName}
            className="w-full h-auto max-h-36 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-center">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 tracking-widest drop-shadow-md">
              {familyName.toUpperCase()}
            </h1>
            {clanTitle && (
              <p className="text-xs sm:text-sm font-serif text-amber-100/90 tracking-widest mt-0.5">
                • {clanTitle.toUpperCase()} •
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative mb-8 group pointer-events-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 rounded-full blur-xl opacity-75" />
          <div className="relative bg-gradient-to-b from-[#78350F] via-[#92400E] to-[#451A03] border-4 border-[#F59E0B] rounded-3xl p-5 sm:px-12 sm:py-6 shadow-2xl text-center flex flex-col items-center min-w-[320px] sm:min-w-[540px] max-w-2xl">
            <div className="absolute top-2 left-3 text-amber-400 text-sm opacity-70">❖</div>
            <div className="absolute top-2 right-3 text-amber-400 text-sm opacity-70">❖</div>
            <div className="absolute bottom-2 left-3 text-amber-400 text-sm opacity-70">❖</div>
            <div className="absolute bottom-2 right-3 text-amber-400 text-sm opacity-70">❖</div>

            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-amber-300" />
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-inner">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <span className="w-8 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-amber-300" />
            </div>

            <div className="px-6 py-1 bg-black/40 border border-amber-400/50 rounded-full shadow-inner mb-2">
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-[0.25em] text-amber-300 drop-shadow">
                {clanTitle.toUpperCase()}
              </h2>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 drop-shadow-md">
              {familyName.toUpperCase()}
            </h1>

            <div className="mt-2.5 pt-2 border-t border-amber-400/30 w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-amber-200/80 font-serif">
              {hometown && <span>📍 Khởi tích: {hometown}</span>}
              {generationCount !== undefined && generationCount > 0 && (
                <span>🏛️ Quy tụ: {generationCount} Thế hệ</span>
              )}
              {totalMembers !== undefined && totalMembers > 0 && (
                <span>🌳 Thành viên: {totalMembers} vị</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AncestralBanner;
