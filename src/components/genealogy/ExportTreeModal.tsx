import React, { useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck, Image as ImageIcon, Sparkles, Settings2 } from 'lucide-react';
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
  const [exportFormat, setExportFormat] = useState<'IMAGE' | 'PRINT' | 'CSV' | 'JSON'>('IMAGE');
  const [paperSize, setPaperSize] = useState<'A0' | 'A1' | 'A2' | 'A3' | 'A4'>('A1');
  const [orientation, setOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [resolutionScale, setResolutionScale] = useState<'1' | '2' | '4'>('2');
  const [includeDeceasedInfo, setIncludeDeceasedInfo] = useState(true);
  const [includeBio, setIncludeBio] = useState(true);
  const [includeLunarDates, setIncludeLunarDates] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  if (!isOpen) return null;

  const handleExportHighResImage = () => {
    setIsExportingImage(true);
    try {
      const scale = Number(resolutionScale) || 2;
      const canvas = document.createElement('canvas');
      const width = 2400 * scale;
      const height = 1600 * scale;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Background - Warm Papyrus
        ctx.fillStyle = '#F7F8F5';
        ctx.fillRect(0, 0, width, height);

        // Outer Decorative Heritage Border
        ctx.strokeStyle = '#C49A3A';
        ctx.lineWidth = 6 * scale;
        ctx.strokeRect(30 * scale, 30 * scale, width - 60 * scale, height - 60 * scale);

        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(40 * scale, 40 * scale, width - 80 * scale, height - 80 * scale);

        // Header Title
        ctx.fillStyle = '#166534';
        ctx.font = `bold ${36 * scale}px "Be Vietnam Pro", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`PHẢ ĐỒ ĐẠI TỘC — ${familyName.toUpperCase()}`, width / 2, 100 * scale);

        // Subtitle
        ctx.fillStyle = '#1E3A5F';
        ctx.font = `${16 * scale}px "Be Vietnam Pro", sans-serif`;
        ctx.fillText(
          `Khổ giấy ${paperSize} • ${members.length} Nhân khẩu • ${generations.length} Thế hệ • Xuất ngày ${new Date().toLocaleDateString('vi-VN')}`,
          width / 2,
          135 * scale
        );

        // Render generation levels & nodes
        const sortedGens = [...generations].sort((a, b) => a.generation_number - b.generation_number);
        const yStart = 200 * scale;
        const genSpacing = (height - 300 * scale) / Math.max(sortedGens.length, 1);

        sortedGens.forEach((gen, gIdx) => {
          const genMembers = members.filter((m) => m.generation_id === gen.id);
          const y = yStart + gIdx * genSpacing;

          // Generation header line
          ctx.fillStyle = '#94A3B8';
          ctx.font = `bold ${12 * scale}px "Be Vietnam Pro", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(`THẾ HỆ ${gen.generation_number}: ${gen.name.toUpperCase()}`, 70 * scale, y - 20 * scale);

          if (genMembers.length > 0) {
            const nodeWidth = 240 * scale;
            const nodeHeight = 80 * scale;
            const totalWidth = genMembers.length * nodeWidth + (genMembers.length - 1) * 30 * scale;
            let startX = Math.max((width - totalWidth) / 2, 70 * scale);

            genMembers.forEach((m, mIdx) => {
              const x = startX + mIdx * (nodeWidth + 30 * scale);

              // Node Box
              ctx.fillStyle = '#FFFFFF';
              ctx.strokeStyle = m.life_status === 'DECEASED' ? '#CBD5E1' : '#166534';
              ctx.lineWidth = 2 * scale;
              ctx.beginPath();
              ctx.roundRect(x, y, nodeWidth, nodeHeight, 10 * scale);
              ctx.fill();
              ctx.stroke();

              // Member Name
              ctx.fillStyle = '#0F172A';
              ctx.font = `bold ${13 * scale}px "Be Vietnam Pro", sans-serif`;
              ctx.textAlign = 'left';
              ctx.fillText(m.full_name.replace(/\(.*?\)/g, '').trim(), x + 15 * scale, y + 25 * scale);

              // Details
              ctx.fillStyle = '#64748B';
              ctx.font = `${10 * scale}px "Be Vietnam Pro", sans-serif`;
              const genLabel = gIdx === 0 ? 'Thủy Tổ' : `Đời ${gen.generation_number}`;
              const statusLabel = m.life_status === 'DECEASED' ? '🕯️ Đã mất' : '🌿 Còn sống';
              ctx.fillText(`${genLabel} • ${statusLabel}`, x + 15 * scale, y + 45 * scale);

              if (includeLunarDates && m.death_lunar_day && m.death_lunar_month) {
                ctx.fillStyle = '#92400E';
                ctx.fillText(`Giỗ: Ngày ${m.death_lunar_day}/${m.death_lunar_month} ÂL`, x + 15 * scale, y + 65 * scale);
              }
            });
          }
        });

        // Trigger Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PhaDo_${familyName.replace(/\s+/g, '_')}_${paperSize}_${resolutionScale}x.png`;
            a.click();
            URL.revokeObjectURL(url);
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
          }
        }, 'image/png');
      }
    } catch (err) {
      console.error('Lỗi khi xuất ảnh độ phân giải cao:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'IMAGE') {
      handleExportHighResImage();
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xuất Bản & Cấu Hình In Ấn Phả Đồ</h3>
              <p className="text-xs text-slate-500">{familyName} • {members.length} nhân khẩu • {generations.length} thế hệ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Format Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Định dạng xuất dữ liệu
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('IMAGE')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'IMAGE'
                    ? 'bg-emerald-50 border-heritage-green text-heritage-green font-bold shadow-sm ring-1 ring-heritage-green'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-[11px]">Ảnh Siêu Nét</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('PRINT')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'PRINT'
                    ? 'bg-emerald-50 border-heritage-green text-heritage-green font-bold shadow-sm ring-1 ring-heritage-green'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span className="text-[11px]">In Phả Đồ</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('CSV')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'CSV'
                    ? 'bg-emerald-50 border-heritage-green text-heritage-green font-bold shadow-sm ring-1 ring-heritage-green'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-[11px]">Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('JSON')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  exportFormat === 'JSON'
                    ? 'bg-emerald-50 border-heritage-green text-heritage-green font-bold shadow-sm ring-1 ring-heritage-green'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="text-[11px]">Sao Lưu JSON</span>
              </button>
            </div>
          </div>

          {/* Print & High-Res Image Configuration */}
          {(exportFormat === 'IMAGE' || exportFormat === 'PRINT') && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-heritage-green" /> Cấu hình bản in & độ phân giải xuất bản
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Khổ Giấy In Ấn</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-heritage-green"
                  >
                    <option value="A0">Khổ Lớn A0 (841 x 1189 mm - Treo Từ Đường)</option>
                    <option value="A1">Khổ Lớn A1 (594 x 841 mm - Chuẩn Phổ Biến)</option>
                    <option value="A2">Khổ Vừa A2 (420 x 594 mm)</option>
                    <option value="A3">Khổ A3 (297 x 420 mm - Đóng Sách Lớn)</option>
                    <option value="A4">Khổ A4 (210 x 297 mm - Tài Liệu Họ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hướng Giấy</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-heritage-green"
                  >
                    <option value="LANDSCAPE">Khổ Ngang (Landscape - Đẹp nhất)</option>
                    <option value="PORTRAIT">Khổ Dọc (Portrait)</option>
                  </select>
                </div>
              </div>

              {exportFormat === 'IMAGE' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Độ Phân Giải Xuất Ảnh</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setResolutionScale('1')}
                      className={`py-1.5 px-2 rounded-xl border text-center font-bold transition ${
                        resolutionScale === '1'
                          ? 'bg-white border-heritage-green text-heritage-green shadow-sm'
                          : 'bg-white/60 border-slate-200 text-slate-600'
                      }`}
                    >
                      Full HD (1x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolutionScale('2')}
                      className={`py-1.5 px-2 rounded-xl border text-center font-bold transition ${
                        resolutionScale === '2'
                          ? 'bg-white border-heritage-green text-heritage-green shadow-sm'
                          : 'bg-white/60 border-slate-200 text-slate-600'
                      }`}
                    >
                      4K Ultra (2x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolutionScale('4')}
                      className={`py-1.5 px-2 rounded-xl border text-center font-bold transition ${
                        resolutionScale === '4'
                          ? 'bg-white border-heritage-green text-heritage-green shadow-sm'
                          : 'bg-white/60 border-slate-200 text-slate-600'
                      }`}
                    >
                      8K Master (4x)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Options */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900">Tùy chọn trường thông tin kèm theo:</h4>
            
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLunarDates}
                onChange={(e) => setIncludeLunarDates(e.target.checked)}
                className="w-4 h-4 rounded text-heritage-green focus:ring-heritage-green"
              />
              <span>Bao gồm ngày giỗ âm lịch & can chi năm</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDeceasedInfo}
                onChange={(e) => setIncludeDeceasedInfo(e.target.checked)}
                className="w-4 h-4 rounded text-heritage-green focus:ring-heritage-green"
              />
              <span>Bao gồm nơi an táng & mộ phần</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBio}
                onChange={(e) => setIncludeBio(e.target.checked)}
                className="w-4 h-4 rounded text-heritage-green focus:ring-heritage-green"
              />
              <span>Bao gồm tiểu sử, chức tước & công trạng</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dữ liệu xuất ra đảm bảo an toàn, bảo toàn tính chuẩn xác và phân quyền gia tộc.</span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExportingImage}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Đã Xuất Thành Công!</span>
                </>
              ) : isExportingImage ? (
                <span>Đang kết xuất ảnh Ultra HD...</span>
              ) : exportFormat === 'IMAGE' ? (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Tải Xuống Ảnh Độ Phân Giải Cao</span>
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
