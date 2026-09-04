import React, { useState } from 'react';
import { 
  X, Download, Printer, FileText, CheckCircle2, ShieldCheck, 
  Image as ImageIcon, Sparkles, Settings2, FileSpreadsheet, Eye
} from 'lucide-react';
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
  const [exportFormat, setExportFormat] = useState<'PDF_PRINT' | 'IMAGE' | 'VECTOR_SVG' | 'CSV'>('PDF_PRINT');
  const [paperSize, setPaperSize] = useState<'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'BANNER_BAT'>('A0');
  const [orientation, setOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [resolutionScale, setResolutionScale] = useState<'1' | '2' | '4'>('2');
  const [includeDeceasedInfo, setIncludeDeceasedInfo] = useState(true);
  const [includeBio, setIncludeBio] = useState(true);
  const [includeLunarDates, setIncludeLunarDates] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Open Direct Print Engine Window
  const handlePrintDocument = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Trình duyệt đang chặn cửa sổ bật lên. Vui lòng cho phép mở popup để in ấn.');
      return;
    }

    const sortedGens = [...generations].sort((a, b) => a.generation_number - b.generation_number);

    // Build Generation Rows HTML
    const gensHtml = sortedGens
      .map((gen) => {
        const genMembers = members.filter((m) => m.generation_id === gen.id);
        if (genMembers.length === 0) return '';

        const membersCardsHtml = genMembers
          .map((m) => {
            const branch = branches.find((b) => b.id === m.branch_id);
            const isDeceased = m.life_status === 'DECEASED';

            // Spouses
            const spouseRels = relationships.filter(
              (r) =>
                (r.relationship === 'SPOUSE' || r.relationship_type === 'SPOUSE') &&
                (r.member_id === m.id || r.related_member_id === m.id)
            );
            const spouseIds = spouseRels.map((r) => (r.member_id === m.id ? r.related_member_id : r.member_id));
            const spouses = members.filter((sp) => spouseIds.includes(sp.id));

            return `
              <div class="member-card ${isDeceased ? 'deceased' : 'alive'}">
                <div class="member-branch">${branch ? branch.name : 'Chi Trưởng'}</div>
                <div class="member-name">${m.full_name.replace(/\(.*?\)/g, '').trim()}</div>
                ${m.courtesy_name ? `<div class="member-courtesy" style="font-size:10px; color:#78350f; font-style:italic; margin-bottom:2px;">📜 ${m.courtesy_name}</div>` : ''}
                <div class="member-info">
                  ${
                    m.birth_time ? `<span>⏰ Sinh: ${m.birth_time}</span> ` : ''
                  }
                  ${
                    includeLunarDates && m.death_lunar_day && m.death_lunar_month
                      ? `<span>🕯️ Giỗ: ${m.death_lunar_day}/${m.death_lunar_month} ÂL</span>`
                      : m.birth_solar_date
                      ? `<span>Sinh: ${new Date(m.birth_solar_date).getFullYear()}</span>`
                      : ''
                  }
                  ${isDeceased ? '<span class="status-tag">Đã mất</span>' : '<span class="status-tag live">Còn sống</span>'}
                </div>
                ${
                  m.occupation || m.current_residence || m.hometown
                    ? `<div style="font-size:7.5pt; color:#475569; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${m.occupation ? `💼 ${m.occupation}` : `📍 ${m.current_residence || m.hometown}`}
                      </div>`
                    : ''
                }
                ${
                  spouses.length > 0
                    ? `<div class="member-spouse">Phối: ${spouses.map((s) => s.full_name.replace(/\(.*?\)/g, '').trim()).join(', ')}</div>`
                    : ''
                }
              </div>
            `;
          })
          .join('');

        return `
          <div class="gen-section">
            <div class="gen-title">
              <span>ĐỜI THỨ ${gen.generation_number}: ${gen.name.toUpperCase()}</span>
              <span class="gen-count">(${genMembers.length} thành viên)</span>
            </div>
            <div class="gen-grid">
              ${membersCardsHtml}
            </div>
          </div>
        `;
      })
      .join('');

    // Full Print HTML Template
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Phả Đồ Đại Tộc - ${familyName}</title>
        <style>
          @page {
            size: ${paperSize} ${orientation.toLowerCase()};
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: "Times New Roman", "Be Vietnam Pro", serif;
            color: #0F172A;
            background: #FFFFFF;
            margin: 0;
            padding: 16px;
          }
          .border-container {
            border: 4px double #C49A3A;
            padding: 24px;
            min-height: 96vh;
            position: relative;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #166534;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .header h1 {
            color: #166534;
            font-size: 26pt;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header .subtitle {
            font-size: 11pt;
            color: #475569;
            font-style: italic;
          }
          .gen-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .gen-title {
            background: #166534;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 11pt;
            padding: 4px 12px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 10px;
          }
          .gen-count {
            font-size: 9pt;
            color: #FEF3C7;
            font-weight: normal;
            margin-left: 8px;
          }
          .gen-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .member-card {
            border: 1.5px solid #94A3B8;
            border-radius: 8px;
            padding: 8px 12px;
            width: 210px;
            background: #FAFAFA;
            font-size: 9.5pt;
          }
          .member-card.alive {
            border-color: #166534;
            background: #F0FDF4;
          }
          .member-branch {
            font-size: 7.5pt;
            font-weight: bold;
            color: #166534;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .member-name {
            font-weight: bold;
            font-size: 11pt;
            color: #0F172A;
            margin-bottom: 4px;
          }
          .member-info {
            font-size: 8pt;
            color: #64748B;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .member-spouse {
            font-size: 8pt;
            color: #B45309;
            margin-top: 4px;
            border-top: 1px dashed #E2E8F0;
            padding-top: 2px;
          }
          .status-tag {
            font-size: 7pt;
            padding: 1px 4px;
            border-radius: 3px;
            background: #E2E8F0;
            color: #475569;
          }
          .status-tag.live {
            background: #DCFCE7;
            color: #166534;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 8.5pt;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="border-container">
          <div class="header">
            <h1>PHẢ ĐỒ ĐẠI TỘC — ${familyName.toUpperCase()}</h1>
            <div class="subtitle">
              Lưu truyền truyền thống huyết thống • ${members.length} Thành viên • ${generations.length} Thế hệ • Khổ giấy in: ${paperSize} (${orientation})
            </div>
          </div>

          <div class="tree-content">
            ${gensHtml}
          </div>

          <div class="footer">
            Trích xuất từ Nền Tảng Quản Trị Gia Phả Gia Tộc (Heritage Ledger SaaS) — Ngày in: ${new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  };

  // High-Res Image Export
  const handleExportHighResImage = () => {
    setIsExporting(true);
    try {
      const scale = Number(resolutionScale) || 2;
      const sortedGens = [...generations].sort((a, b) => a.generation_number - b.generation_number);

      const nodeWidth = 240 * scale;
      const nodeHeight = 80 * scale;
      const marginX = 80 * scale;
      const gapX = 20 * scale;
      const subRowGapY = 16 * scale;
      const genHeaderHeight = 36 * scale;
      const genMarginBottom = 36 * scale;

      const width = 2400 * scale;
      const availableWidth = width - marginX * 2;
      const cardsPerRow = Math.max(1, Math.floor((availableWidth + gapX) / (nodeWidth + gapX)));

      // Precompute layout per generation and total height
      let totalHeightNeeded = 220 * scale; // header space

      const genLayouts = sortedGens.map((gen) => {
        const genMembers = members.filter((m) => m.generation_id === gen.id);
        const rowCount = Math.max(1, Math.ceil(genMembers.length / cardsPerRow));
        const genHeight = genHeaderHeight + rowCount * nodeHeight + (rowCount - 1) * subRowGapY + genMarginBottom;
        const layout = {
          gen,
          genMembers,
          rowCount,
          genHeight,
          yStart: totalHeightNeeded,
        };
        totalHeightNeeded += genHeight;
        return layout;
      });

      totalHeightNeeded += 100 * scale; // bottom padding
      const height = Math.max(1600 * scale, totalHeightNeeded);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Background
        ctx.fillStyle = '#F7F8F5';
        ctx.fillRect(0, 0, width, height);

        // Heritage Borders
        ctx.strokeStyle = '#C49A3A';
        ctx.lineWidth = 6 * scale;
        ctx.strokeRect(30 * scale, 30 * scale, width - 60 * scale, height - 60 * scale);

        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(40 * scale, 40 * scale, width - 80 * scale, height - 80 * scale);

        // Title
        ctx.fillStyle = '#166534';
        ctx.font = `bold ${36 * scale}px "Be Vietnam Pro", serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`PHẢ ĐỒ ĐẠI TỘC — ${familyName.toUpperCase()}`, width / 2, 100 * scale);

        ctx.fillStyle = '#1E3A5F';
        ctx.font = `${16 * scale}px "Be Vietnam Pro", sans-serif`;
        ctx.fillText(
          `Khổ ${paperSize} (${orientation}) • ${members.length} Thành viên • ${generations.length} Thế hệ • Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
          width / 2,
          135 * scale
        );

        // Render generation rows
        genLayouts.forEach(({ gen, genMembers, yStart }) => {
          ctx.fillStyle = '#166534';
          ctx.font = `bold ${14 * scale}px "Be Vietnam Pro", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(`ĐỜI ${gen.generation_number}: ${gen.name.toUpperCase()} (${genMembers.length} thành viên)`, marginX, yStart + 16 * scale);

          if (genMembers.length > 0) {
            genMembers.forEach((m, mIdx) => {
              const rowIdx = Math.floor(mIdx / cardsPerRow);
              const colIdx = mIdx % cardsPerRow;

              const totalInThisRow = Math.min(cardsPerRow, genMembers.length - rowIdx * cardsPerRow);
              const rowTotalWidth = totalInThisRow * nodeWidth + (totalInThisRow - 1) * gapX;
              const startX = Math.max((width - rowTotalWidth) / 2, marginX);

              const x = startX + colIdx * (nodeWidth + gapX);
              const y = yStart + genHeaderHeight + rowIdx * (nodeHeight + subRowGapY);

              // Node Box
              ctx.fillStyle = '#FFFFFF';
              ctx.strokeStyle = m.life_status === 'DECEASED' ? '#CBD5E1' : '#166534';
              ctx.lineWidth = 2 * scale;
              ctx.beginPath();
              ctx.roundRect(x, y, nodeWidth, nodeHeight, 10 * scale);
              ctx.fill();
              ctx.stroke();

              // Name
              ctx.fillStyle = '#0F172A';
              ctx.font = `bold ${13 * scale}px "Be Vietnam Pro", sans-serif`;
              ctx.textAlign = 'left';
              ctx.fillText(m.full_name.replace(/\(.*?\)/g, '').trim(), x + 15 * scale, y + 25 * scale);

              // Status & Info
              ctx.fillStyle = '#64748B';
              ctx.font = `${10 * scale}px "Be Vietnam Pro", sans-serif`;
              const genLabel = gen.generation_number === 1 ? 'Thủy Tổ' : `Đời ${gen.generation_number}`;
              const statusLabel = m.life_status === 'DECEASED' ? '🕯️ Đã mất' : '🌿 Còn sống';
              ctx.fillText(`${genLabel} • ${statusLabel}`, x + 15 * scale, y + 45 * scale);

              if (includeLunarDates && m.death_lunar_day && m.death_lunar_month) {
                ctx.fillStyle = '#92400E';
                ctx.fillText(`Giỗ: Ngày ${m.death_lunar_day}/${m.death_lunar_month} ÂL`, x + 15 * scale, y + 65 * scale);
              } else if (m.birth_solar_date) {
                ctx.fillStyle = '#64748B';
                const yearMatch = m.birth_solar_date.match(/\b(1\d{3}|20\d{2})\b/);
                const yearStr = yearMatch ? yearMatch[1] : m.birth_solar_date;
                ctx.fillText(`Sinh: ${yearStr}`, x + 15 * scale, y + 65 * scale);
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
      console.error('Lỗi khi xuất ảnh:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Họ Tên', 'Tên Húy/Hiệu', 'Pháp Danh', 'Giới Tính', 'Tình Trạng', 'Chi Phái', 'Đời', 'Giờ Sinh', 'Năm Sinh', 'Giờ Mất', 'Ngày Giỗ ÂL', 'Nơi An Táng', 'Tiểu Sử'];
    const rows = members.map((m) => {
      const branchName = branches.find((b) => b.id === m.branch_id)?.name || '';
      const genName = generations.find((g) => g.id === m.generation_id)?.name || '';
      const deathDate = m.death_lunar_day && m.death_lunar_month ? `${m.death_lunar_day}/${m.death_lunar_month}` : '';
      return [
        m.id,
        `"${m.full_name}"`,
        `"${m.courtesy_name || ''}"`,
        `"${m.religious_name || ''}"`,
        m.gender === 'MALE' ? 'Nam' : 'Nữ',
        m.life_status === 'DECEASED' ? 'Đã mất' : 'Còn sống',
        `"${branchName}"`,
        `"${genName}"`,
        `"${m.birth_time || ''}"`,
        m.birth_solar_date ? new Date(m.birth_solar_date).getFullYear() : (m.birth_lunar_year || ''),
        `"${m.death_time || ''}"`,
        deathDate,
        `"${m.burial_place || ''}"`,
        `"${m.bio || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DanhSachGiaPha_${familyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  // 🚀 XUẤT FILE VECTOR SVG SIÊU NÉT (KHÔNG BỊ VỠ KHI IN BẠT DÀI HOẶC KHỔ A0)
  const handleExportVectorSVG = () => {
    setIsExporting(true);
    try {
      const sortedGens = [...generations].sort((a, b) => a.generation_number - b.generation_number);
      const width = 3600;
      const cardWidth = 240;
      const cardHeight = 110;
      const gapX = 30;
      const gapY = 80;
      const bannerHeight = 160;

      let currentY = bannerHeight + 60;
      let svgElements: string[] = [];

      // 1. Hoành Phi / Cuốn Thư Vector ở đỉnh
      svgElements.push(`
        <g id="cuon_thu_banner" transform="translate(${width / 2 - 400}, 30)">
          <defs>
            <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#92400E" />
              <stop offset="50%" stop-color="#78350F" />
              <stop offset="100%" stop-color="#451A03" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.3" />
            </filter>
          </defs>
          <rect x="0" y="0" width="800" height="130" rx="28" fill="url(#bannerGrad)" stroke="#F59E0B" stroke-width="4" filter="url(#shadow)" />
          <rect x="250" y="15" width="300" height="36" rx="18" fill="#000000" fill-opacity="0.4" stroke="#FBBF24" stroke-width="1.5" />
          <text x="400" y="39" text-anchor="middle" font-family="'Times New Roman', serif" font-size="18" font-weight="bold" fill="#FDE68A" letter-spacing="4">ẨM THỦY TƯ NGUYÊN</text>
          <text x="400" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-size="30" font-weight="bold" fill="#FEF3C7" letter-spacing="2">${familyName.toUpperCase()}</text>
          <text x="400" y="115" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#FCD34D" opacity="0.9">Khổ in: ${paperSize} • ${sortedGens.length} Thế Hệ • ${members.length} Thành Viên</text>
        </g>
      `);

      // 2. Từng thế hệ và các Node thành viên
      sortedGens.forEach((gen) => {
        const genMembers = members.filter((m) => m.generation_id === gen.id);
        if (genMembers.length === 0) return;

        // Gen Title Badge
        svgElements.push(`
          <g transform="translate(60, ${currentY})">
            <rect x="0" y="0" width="380" height="34" rx="10" fill="#166534" />
            <text x="16" y="22" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">ĐỜI THỨ ${gen.generation_number}: ${gen.name.toUpperCase()} (${genMembers.length} thành viên)</text>
          </g>
        `);

        currentY += 50;

        const maxCardsPerRow = 12;
        const totalCards = genMembers.length;
        const rowCount = Math.ceil(totalCards / maxCardsPerRow);

        for (let r = 0; r < rowCount; r++) {
          const rowMembers = genMembers.slice(r * maxCardsPerRow, (r + 1) * maxCardsPerRow);
          const rowWidth = rowMembers.length * cardWidth + (rowMembers.length - 1) * gapX;
          const startX = Math.max((width - rowWidth) / 2, 60);

          rowMembers.forEach((m, cIdx) => {
            const x = startX + cIdx * (cardWidth + gapX);
            const y = currentY;
            const isDeceased = m.life_status === 'DECEASED';
            const isMale = m.gender === 'MALE';
            const strokeColor = isDeceased ? '#CBD5E1' : isMale ? '#0284C7' : '#DB2777';
            const bgColor = isDeceased ? '#F8FAFC' : isMale ? '#F0F9FF' : '#FDF2F8';

            const cleanName = m.full_name.replace(/\(.*?\)/g, '').trim();
            const branchName = branches.find((b) => b.id === m.branch_id)?.name || 'Chi Trưởng';

            svgElements.push(`
              <g id="member_${m.id}" transform="translate(${x}, ${y})">
                <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="${bgColor}" stroke="${strokeColor}" stroke-width="2" filter="url(#shadow)" />
                <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="bold" fill="#166534">${branchName.toUpperCase()}</text>
                <text x="${cardWidth - 14}" y="24" text-anchor="end" font-family="sans-serif" font-size="10" fill="${isDeceased ? '#64748B' : '#059669'}">${isDeceased ? '🕯️ Đã mất' : '🌿 Còn sống'}</text>
                <text x="14" y="52" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#0F172A">${cleanName}</text>
                <line x1="14" y1="62" x2="${cardWidth - 14}" y2="62" stroke="#E2E8F0" stroke-width="1" />
                <text x="14" y="80" font-family="sans-serif" font-size="11" fill="#475569">${m.birth_solar_date ? `Sinh: ${new Date(m.birth_solar_date).getFullYear()}` : 'Niên đại gia phả'}</text>
                ${
                  includeLunarDates && m.death_lunar_day && m.death_lunar_month
                    ? `<text x="14" y="96" font-family="sans-serif" font-size="10" fill="#92400E">🕯️ Giỗ: ${m.death_lunar_day}/${m.death_lunar_month} ÂL</text>`
                    : ''
                }
              </g>
            `);
          });

          currentY += cardHeight + 24;
        }

        currentY += gapY;
      });

      const totalHeight = Math.max(currentY + 100, 2400);

      const svgContent = `<?xml version="1.0" standalone="no"?>
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">
          <rect width="${width}" height="${totalHeight}" fill="#FAFBF8" />
          <rect x="20" y="20" width="${width - 40}" height="${totalHeight - 40}" rx="24" fill="none" stroke="#D97706" stroke-width="4" />
          <rect x="28" y="28" width="${width - 56}" height="${totalHeight - 56}" rx="18" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="8 4" />
          ${svgElements.join('\n')}
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PhaDo_Vector_${familyName.replace(/\s+/g, '_')}_${paperSize}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Lỗi khi xuất SVG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExecuteExport = () => {
    if (exportFormat === 'PDF_PRINT') {
      handlePrintDocument();
      return;
    }
    if (exportFormat === 'VECTOR_SVG') {
      handleExportVectorSVG();
      return;
    }
    if (exportFormat === 'IMAGE') {
      handleExportHighResImage();
      return;
    }
    if (exportFormat === 'CSV') {
      handleExportCSV();
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">Xuất File & In Ấn Gia Phả</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Xuất file in PDF khổ lớn (A0 - A4), ảnh siêu nét 4K/8K và file Excel dữ liệu dòng họ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-slate-800 dark:text-slate-200 text-xs">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Định Dạng Xuất Bản:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setExportFormat('PDF_PRINT')}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  exportFormat === 'PDF_PRINT'
                    ? 'border-[#166534] dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Printer className={`w-5 h-5 ${exportFormat === 'PDF_PRINT' ? 'text-[#166534] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">In Ấn / PDF</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Chuẩn in ấn A0 - A4</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('VECTOR_SVG')}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  exportFormat === 'VECTOR_SVG'
                    ? 'border-[#166534] dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${exportFormat === 'VECTOR_SVG' ? 'text-[#166534] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">Vector SVG</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">In bạt nhà thờ họ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('IMAGE')}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  exportFormat === 'IMAGE'
                    ? 'border-[#166534] dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ImageIcon className={`w-5 h-5 ${exportFormat === 'IMAGE' ? 'text-[#166534] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">Ảnh PNG Nét</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Độ nét cao 4K/8K</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('CSV')}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  exportFormat === 'CSV'
                    ? 'border-[#166534] dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${exportFormat === 'CSV' ? 'text-[#166534] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <div>
                  <div className="font-bold text-xs">Excel (CSV)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Danh sách thành viên</div>
                </div>
              </button>
            </div>
          </div>

          {/* Paper Size & Layout Options (Only for PDF / Print / Image) */}
          {(exportFormat === 'PDF_PRINT' || exportFormat === 'IMAGE') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F8F5] dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">Khổ Giấy In Ấn:</label>
                <select
                  value={paperSize}
                  onChange={(e: any) => setPaperSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
                >
                  <option value="A4">Khổ A4 (210 x 297 mm - Xem nhanh)</option>
                  <option value="A3">Khổ A3 (297 x 420 mm - Chuẩn in phòng họp)</option>
                  <option value="A2">Khổ A2 (420 x 594 mm - Khổ vừa)</option>
                  <option value="A1">Khổ A1 (594 x 841 mm - Nhà thờ họ)</option>
                  <option value="A0">Khổ A0 (841 x 1189 mm - Đại lễ khánh thành)</option>
                  <option value="BANNER_BAT">Dải Bạt Dài Treo Nhà Thờ Họ (Dài 2m - 10m)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">Hướng Trang Giấy:</label>
                <select
                  value={orientation}
                  onChange={(e: any) => setOrientation(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
                >
                  <option value="LANDSCAPE">Nằm ngang (Landscape - Khuyên dùng)</option>
                  <option value="PORTRAIT">Nằm dọc (Portrait)</option>
                </select>
              </div>
            </div>
          )}

          {/* Content Checklist */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Thông Tin Hiển Thị:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60">
                <input
                  type="checkbox"
                  checked={includeLunarDates}
                  onChange={(e) => setIncludeLunarDates(e.target.checked)}
                  className="rounded text-[#166534] focus:ring-[#166534]"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">Ngày giỗ Âm Lịch</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60">
                <input
                  type="checkbox"
                  checked={includeDeceasedInfo}
                  onChange={(e) => setIncludeDeceasedInfo(e.target.checked)}
                  className="rounded text-[#166534] focus:ring-[#166534]"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">Trạng thái sinh tử</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60">
                <input
                  type="checkbox"
                  checked={includeBio}
                  onChange={(e) => setIncludeBio(e.target.checked)}
                  className="rounded text-[#166534] focus:ring-[#166534]"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">Thông tin phối ngẫu</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            Tổng cộng: <strong className="text-slate-900 dark:text-white">{members.length}</strong> thành viên • <strong className="text-slate-900 dark:text-white">{generations.length}</strong> thế hệ
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="px-6 py-2.5 bg-[#166534] hover:bg-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {exportFormat === 'PDF_PRINT' ? (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Mở Cửa Sổ In Ấn / Lưu PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Đang xuất bản...' : 'Tải File Xuống'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportTreeModal;
