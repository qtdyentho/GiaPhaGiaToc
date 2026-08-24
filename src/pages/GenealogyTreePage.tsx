import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Plus, Info } from 'lucide-react';
import { mockMembers, mockGenerations } from '../services/mockData';

export const GenealogyTreePage: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Cây Phả Hệ Gia Tộc</span>
            <span className="text-xs bg-emerald-100 text-heritage-green font-semibold px-2 py-0.5 rounded-full">
              5 Thế Hệ
            </span>
          </h1>
          <p className="text-xs text-slate-500">Tương tác trực quan phả hệ theo chuẩn dòng tộc Việt Nam</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Branch Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent focus:outline-none font-medium"
            >
              <option value="ALL">Tất cả chi phái</option>
              <option value="br-1">Chi Trưởng</option>
              <option value="br-2">Chi Hai</option>
              <option value="br-3">Chi Ba</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 space-x-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-600 transition"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-600 transition"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-600 transition"
              title="Đặt lại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Member Button */}
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-lg transition shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Interactive Tree Canvas Container */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-8 min-h-[600px] overflow-auto flex flex-col items-center justify-start relative shadow-inner">
        {/* Helper Note */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] text-slate-600 flex items-center space-x-1.5 shadow-sm">
          <Info className="w-3.5 h-3.5 text-heritage-green" />
          <span>Nhấp vào thành viên để xem tiểu sử và thông tin ngày giỗ</span>
        </div>

        {/* Tree Nodes by Generation */}
        <div
          className="w-full flex flex-col items-center space-y-12 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {mockGenerations.slice(0, 4).map((gen) => {
            const genMembers = mockMembers.filter((m) => m.generation_id === gen.id);
            return (
              <div key={gen.id} className="w-full flex flex-col items-center relative">
                {/* Generation Label Pill */}
                <div className="bg-heritage-navy text-amber-300 text-xs font-bold px-4 py-1 rounded-full shadow-sm mb-4 border border-amber-400/30">
                  {gen.name}
                </div>

                {/* Nodes Row */}
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {genMembers.length > 0 ? (
                    genMembers.map((member) => (
                      <div
                        key={member.id}
                        className="w-64 bg-white border-2 border-slate-200 hover:border-heritage-green p-4 rounded-xl shadow-md hover:shadow-heritage transition cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-heritage-green/10 border-2 border-heritage-gold flex items-center justify-center font-bold text-heritage-navy text-base shrink-0 group-hover:scale-105 transition">
                            {member.first_name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-heritage-green transition">
                              {member.full_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {member.life_status === 'DECEASED' ? `Mất: ${member.death_lunar_day}/${member.death_lunar_month} Âm` : 'Còn sống'}
                            </div>
                          </div>
                        </div>

                        {member.bio && (
                          <div className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100 line-clamp-2">
                            {member.bio}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">Chưa cập nhật thành viên đời này</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
