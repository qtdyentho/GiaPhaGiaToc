import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-amber-200 border-t-amber-700 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-emerald-700/10 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-800 animate-ping" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Gia Phả Gia Tộc</p>
        <p className="text-[11px] text-slate-400">Đang tải dữ liệu trang...</p>
      </div>
    </div>
  );
};
