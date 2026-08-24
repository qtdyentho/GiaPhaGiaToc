import React, { useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Member, Generation, Branch, MemberRelationship } from '../../types/database';

interface ExportTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  generations: Generation[];
  branches: Branch[];
  relationships: MemberRelationship[];
  familyName?: string;
}

export const ExportTreeModal: React.FC<ExportTreeModalProps> = ({
  isOpen,
  onClose,
  members,
  generations,
  branches,
  relationships,
  familyName = 'Đại Tộc Nguyễn Văn',
}) => {
  const [exportFormat, setExportFormat] = useState<'PRINT' | 'JSON' | 'CSV'>('PRINT');
  const [includeDeceasedInfo, setIncludeDeceasedInfo] = useState(true);
  const [includeBio, setIncludeBio] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    if (exportFormat === 'PRINT') {
      window.print();
      onClose();
      return;
    }

    if (exportFormat === 'JSON') {
      const dataToExport = {
        familyName,
        exportedAt: new Date().toISOString(),
        totalMembers: members.length,
        generations,
        branches,
        members: members.map((m) => ({
          ...m,
          burial_place: includeDeceasedInfo ? m.burial_place : undefined,
          bio: includeBio ? m.bio : undefined,
        })),
        relationships,
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GiaPha_${familyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      return;
    }

    if (exportFormat === 'CSV') {
      const headers = ['ID', 'Họ Tên', 'Giới Tính', 'Tình Trạng', 'Chi Phái', 'Đời', 'Năm Sinh', 'Ngày Giỗ ÂL', 'Nơi An Táng', 'Tiểu Sử'];
      const rows = members.map((m) => {
        const branchName = branches.find((b) => b.id === m.branch_id)?.name || '';
        const genName = generations.find((g) => g.id === m.generation_id)?.name || '';
        const deathDate = m.death_lunar_day && m.death_lunar_month ? `${m.death_lunar_day}/${m.death_lunar_month}` : '';
        return [
          m.id,
          `"${m.full_name}"`,
          m.gender === 'MALE' ? 'Nam' : 'Nữ',
          m.life_status === 'DECEASED' ? 'Đã mất' : 'Còn sống',
          `"${branchName}"`,
          `"${genName}"`,
          m.birth_solar_date ? m.birth_solar_date.slice(0, 4) : '',
          deathDate,
          includeDeceasedInfo ? `"${m.burial_place || ''}"` : '""',
          includeBio ? `"${(m.bio || '').replace(/"/g, '""')}"` : '""',
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DanhSachThanhVien_${familyName.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Xuất Bản & In Phả Đồ Gia Tộc</h3>
              <p className="text-xs text-slate-400">{familyName} • {members.length} nhân khẩu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Định dạng xuất dữ liệu
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('PRINT')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'PRINT'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span className="text-xs font-medium">Bản In Phả Đồ</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('CSV')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'CSV'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('JSON')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'JSON'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Sao Lưu JSON</span>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">Tùy chọn trường thông tin kèm theo:</h4>
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDeceasedInfo}
                onChange={(e) => setIncludeDeceasedInfo(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500"
              />
              <span>Bao gồm ngày giỗ âm lịch & nơi an táng / mộ phần</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBio}
                onChange={(e) => setIncludeBio(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500"
              />
              <span>Bao gồm tiểu sử, chức tước & công trạng</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dữ liệu xuất ra đảm bảo an toàn và bảo mật theo chuẩn Multi-tenant.</span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Đã Xuất File Thành Công!</span>
                </>
              ) : exportFormat === 'PRINT' ? (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Mở Giao Diện In Phả Đồ</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải Xuống Tệp Dữ Liệu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
