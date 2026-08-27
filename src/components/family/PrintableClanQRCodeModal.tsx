import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Printer, Download, Copy, Check, QrCode, Sparkles, Landmark, 
  ShieldCheck, Palette, Layout, MessageSquare, ChevronDown, CheckCircle2,
  Edit2, Save, AlertCircle, RefreshCw
} from 'lucide-react';
import { Family } from '../../types/database';
import { ShortLinkService, slugifyVietnamese } from '../../services/security/ShortLinkService';

interface PrintableClanQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
  passToken: string;
  shortCode?: string;
  clanPin?: string;
}

type ThemeKey = 'hoang-kim' | 'son-mai' | 'ngoc-bich';
type SizeKey = 'A4' | 'A5' | 'CARD';

const THEME_CONFIG: Record<ThemeKey, {
  name: string;
  badgeBg: string;
  borderColor: string;
  headerColor: string;
  titleColor: string;
  bgCard: string;
  cornerColor: string;
  accentBg: string;
  stampBg: string;
  canvasPrimary: string;
  canvasAccent: string;
  canvasBg: string;
}> = {
  'hoang-kim': {
    name: 'Hoàng Kim Cổ Kính',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-900/40',
    headerColor: 'text-amber-900',
    titleColor: 'text-[#166534]',
    bgCard: 'bg-[#FAF6EE]',
    cornerColor: 'text-amber-800/40',
    accentBg: 'bg-amber-50/90 border-amber-200 text-amber-950',
    stampBg: 'bg-amber-900 text-amber-100',
    canvasPrimary: '#166534',
    canvasAccent: '#78350F',
    canvasBg: '#FAF6EE',
  },
  'son-mai': {
    name: 'Sơn Mài Đỏ Son',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    borderColor: 'border-rose-900/40',
    headerColor: 'text-rose-900',
    titleColor: 'text-rose-900',
    bgCard: 'bg-[#FFF8F6]',
    cornerColor: 'text-rose-800/40',
    accentBg: 'bg-rose-50/90 border-rose-200 text-rose-950',
    stampBg: 'bg-rose-900 text-rose-100',
    canvasPrimary: '#991B1B',
    canvasAccent: '#7F1D1D',
    canvasBg: '#FFF8F6',
  },
  'ngoc-bich': {
    name: 'Ngọc Bích Trầm Mặc',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'border-emerald-900/40',
    headerColor: 'text-emerald-900',
    titleColor: 'text-[#065F46]',
    bgCard: 'bg-[#F2F9F6]',
    cornerColor: 'text-emerald-800/40',
    accentBg: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
    stampBg: 'bg-emerald-900 text-emerald-100',
    canvasPrimary: '#065F46',
    canvasAccent: '#047857',
    canvasBg: '#F2F9F6',
  },
};

const MOTTO_PRESETS = [
  'Ẩm Hà Tư Nguyên • Lưu Truyền Vạn Đời',
  'Cây Có Cội — Nước Có Nguồn',
  'Uống Nước Nhớ Nguồn — Ăn Quả Nhớ Kẻ Trồng Cây',
  'Tổ Tiên Tích Đức — Con Cháu Hưởng Phúc',
  'Vạn Cổ Trường Tồn — Vĩnh Thế Lưu Phương',
];

export const PrintableClanQRCodeModal: React.FC<PrintableClanQRCodeModalProps> = ({
  isOpen,
  onClose,
  family,
  passToken,
  shortCode,
  clanPin,
}) => {
  const [theme, setTheme] = useState<ThemeKey>('hoang-kim');
  const [selectedSize, setSelectedSize] = useState<SizeKey>('A4');
  const [selectedMotto, setSelectedMotto] = useState<string>(MOTTO_PRESETS[0]);
  const [isCustomMotto, setIsCustomMotto] = useState(false);
  const [customMottoText, setCustomMottoText] = useState('');
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedZaloMsg, setCopiedZaloMsg] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Shortcode state & inline editor
  const defaultSlug = slugifyVietnamese(family?.name || '') || 'giaphatoc';
  const initialCode = (shortCode && shortCode !== 'dai-toc-nguyen-van') ? shortCode : defaultSlug;
  const [currentShortCode, setCurrentShortCode] = useState<string>(initialCode);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInputValue, setSlugInputValue] = useState(initialCode);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSavingSlug, setIsSavingSlug] = useState(false);

  const plaqueRef = useRef<HTMLDivElement>(null);

  // Auto-sync slug to Supabase on mount
  useEffect(() => {
    if (isOpen && family?.id) {
      const targetCode = (shortCode && shortCode !== 'dai-toc-nguyen-van') ? shortCode : defaultSlug;
      setCurrentShortCode(targetCode);
      setSlugInputValue(targetCode);
      ShortLinkService.createOrUpdateShortLink(family.id, passToken, targetCode, family.name);
    }
  }, [isOpen, family?.id, shortCode, defaultSlug, passToken, family?.name]);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn';
  const passUrl = `${currentHost}/c/${currentShortCode}`;
  
  // High-res QR code URL (using 600x600 for sharp rendering)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(passUrl)}&margin=8`;

  const activeMotto = isCustomMotto && customMottoText.trim() ? customMottoText.trim() : selectedMotto;
  const currentTheme = THEME_CONFIG[theme];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyZaloMessage = () => {
    const msg = ShortLinkService.generateShareMessage(family.name, passUrl, clanPin);
    navigator.clipboard.writeText(msg);
    setCopiedZaloMsg(true);
    setTimeout(() => setCopiedZaloMsg(false), 2500);
  };

  const handleSaveSlug = async () => {
    const clean = slugifyVietnamese(slugInputValue);
    if (!clean) {
      setSlugError('Tên định danh không hợp lệ.');
      return;
    }

    setIsSavingSlug(true);
    setSlugError(null);
    try {
      const res = await ShortLinkService.createOrUpdateShortLink(family.id, passToken, clean, family.name);
      if (res.success && res.shortLink) {
        setCurrentShortCode(res.shortLink.short_code);
        setIsEditingSlug(false);
      } else {
        setSlugError(res.error || 'Không thể lưu tên liên kết.');
      }
    } catch (err: any) {
      setSlugError(err.message || 'Lỗi khi lưu.');
    } finally {
      setIsSavingSlug(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  /**
   * Tải ảnh chất lượng cao dạng Canvas PNG (1200 x 1600 px)
   * Tự động kết xuất không gian khung gỗ, con dấu và QR sắc nét
   */
  const handleDownloadPlaquePNG = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1200;
      const height = 1600;
      canvas.width = width;
      canvas.height = height;

      // 1. Nền Giấy Điệp Cổ Phong
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // 2. Viền ngoài & Viền trong (Double Border)
      ctx.strokeStyle = currentTheme.canvasAccent;
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      // 3. Khung Trắng Trung Tâm
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(80, 80, width - 160, height - 160);
      ctx.strokeStyle = currentTheme.canvasAccent + '40';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 80, width - 160, height - 160);

      // 4. Header: Tên Dòng Họ & Khẩu Hiệu
      ctx.fillStyle = currentTheme.canvasPrimary;
      ctx.font = 'bold 52px "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.fillText(family.name.toUpperCase(), width / 2, 190);

      // Địa chỉ Từ Đường / Quê quán
      ctx.fillStyle = '#4B5563';
      ctx.font = 'italic 24px "Times New Roman", serif';
      const addressText = family.ancestral_hall_address ? `Từ Đường: ${family.ancestral_hall_address}` : 'Từ Đường Gia Tộc';
      ctx.fillText(addressText, width / 2, 235);

      // 5. Đường kẻ phân cách hoa văn
      ctx.strokeStyle = currentTheme.canvasAccent + '80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(350, 265);
      ctx.lineTo(850, 265);
      ctx.stroke();

      // Vẽ họa tiết tâm điểm
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.font = 'bold 20px serif';
      ctx.fillText('✦ ❖ ✦', width / 2, 272);

      // 6. Khẩu hiệu / Hoành phi
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.font = 'bold 30px "Times New Roman", serif';
      ctx.fillText(`“ ${activeMotto} ”`, width / 2, 330);

      // 7. Vẽ Mã QR Chính giữa
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = qrImageUrl;

      await new Promise((res, rej) => {
        qrImg.onload = res;
        qrImg.onerror = rej;
      });

      const qrSize = 640;
      const qrX = (width - qrSize) / 2;
      const qrY = 380;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // 8. Huy hiệu Trung tâm QR (Đè lên giữa QR)
      ctx.fillStyle = currentTheme.canvasPrimary;
      ctx.beginPath();
      ctx.arc(width / 2, qrY + qrSize / 2, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GIA', width / 2, qrY + qrSize / 2 - 4);
      ctx.fillText('TỘC', width / 2, qrY + qrSize / 2 + 18);

      // 9. Khung Hướng Dẫn Con Cháu (Bottom Box)
      const boxY = 1070;
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(160, boxY, width - 320, 260);
      ctx.strokeStyle = currentTheme.canvasAccent + '60';
      ctx.lineWidth = 2;
      ctx.strokeRect(160, boxY, width - 320, 260);

      ctx.fillStyle = currentTheme.canvasPrimary;
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HƯỚNG DẪN TRA CỨU DÀNH CHO CON CHÁU', width / 2, boxY + 45);

      ctx.fillStyle = '#1F2937';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('1. Dùng Camera điện thoại hoặc Zalo quét mã QR ở trên.', 210, boxY + 95);
      ctx.fillText('2. Nhập Mã PIN Gia Tộc để xác thực tư cách con cháu dòng họ.', 210, boxY + 140);
      ctx.fillText('3. Tra cứu Cây Phả Hệ, Lịch Âm Ngày Giỗ & Sổ Quỹ minh bạch.', 210, boxY + 185);

      // Đường dẫn trực tiếp /c/code
      ctx.fillStyle = '#4B5563';
      ctx.font = 'italic 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Liên kết trực tiếp: ${passUrl}`, width / 2, boxY + 232);

      // 10. Con Dấu Gia Tộc (Red Seal Stamp - Góc dưới phải)
      const sealX = width - 230;
      const sealY = height - 190;
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.fillRect(sealX, sealY, 110, 110);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeRect(sealX + 6, sealY + 6, 98, 98);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('GIA TỘC', sealX + 55, sealY + 42);
      ctx.fillText('TRUYỀN', sealX + 55, sealY + 66);
      ctx.fillText('THỐNG', sealX + 55, sealY + 90);

      // 11. Footer Niên Hiệu
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Nền tảng Quản trị Gia Phả Gia Tộc • ${new Date().getFullYear()}`, width / 2, height - 60);

      // Xuất file PNG tải về
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `KhungQR_${currentShortCode}_${selectedSize}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Download Plaque PNG Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-amber-900/30 animate-fade-in print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none">
        
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-amber-100 flex items-center justify-between border-b border-amber-900/50 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-800/80 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Mã QR & Bản In Khung Dán Từ Đường</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  /c/{currentShortCode}
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/80">Tra cứu Cây Phả Hệ, Lễ Giỗ & Số Dư Quỹ bằng Mã PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-300/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-100">
          
          {/* Left Panel: Tùy biến & Chia sẻ (5 Cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 bg-white border-r border-slate-200 print:hidden overflow-y-auto">
            
            {/* Box 1: Chọn Theme Phong Cách */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-700" />
                <span>Phong Cách Bản In:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['hoang-kim', 'son-mai', 'ngoc-bich'] as ThemeKey[]).map((tKey) => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setTheme(tKey)}
                    className={`p-2.5 rounded-xl border text-left transition text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      theme === tKey
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs ring-1 ring-amber-600'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm">
                      {tKey === 'hoang-kim' ? '🌟' : tKey === 'son-mai' ? '🏮' : '🌿'}
                    </span>
                    <span className="text-[11px] text-center leading-tight">
                      {THEME_CONFIG[tKey].name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 2: Chọn Khổ In */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-amber-700" />
                <span>Khổ Giấy Đóng Khung:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'A4', label: 'Khổ A4', desc: 'Dán Từ Đường' },
                  { key: 'A5', label: 'Khổ A5', desc: 'Khung Để Bàn' },
                  { key: 'CARD', label: 'Thẻ Nhỏ', desc: 'Cầm Tay' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedSize(s.key as SizeKey)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      selectedSize === s.key
                        ? 'border-[#166534] bg-emerald-50 text-[#166534] font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="text-[10px] text-slate-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 3: Chọn Câu Khẩu Hiệu Tiên Tổ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Khẩu Hiệu / Hoành Phi Tiên Tổ:</span>
              </label>
              <select
                value={isCustomMotto ? 'custom' : selectedMotto}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomMotto(true);
                  } else {
                    setIsCustomMotto(false);
                    setSelectedMotto(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                {MOTTO_PRESETS.map((m, idx) => (
                  <option key={idx} value={m}>
                    {m}
                  </option>
                ))}
                <option value="custom">+ Nhập câu đối / khẩu hiệu riêng...</option>
              </select>

              {isCustomMotto && (
                <input
                  type="text"
                  value={customMottoText}
                  onChange={(e) => setCustomMottoText(e.target.value)}
                  placeholder="Ví dụ: Vạn Cổ Trường Tồn • Phúc Lộc Đầy Nhà"
                  className="mt-1 w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-amber-50/50 text-slate-900 focus:outline-none"
                />
              )}
            </div>

            {/* Box 4: Quản lý & Chia Sẻ Link Rút Gọn */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Liên Kết Dòng Họ & Chia Sẻ:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(!isEditingSlug)}
                  className="text-[11px] font-bold text-[#166534] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingSlug ? 'Đóng sửa' : 'Đổi tên link'}</span>
                </button>
              </div>

              {/* Inline Slug Editor */}
              {isEditingSlug && (
                <div className="p-2.5 bg-white border border-amber-300 rounded-xl space-y-2 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Tên định danh rút gọn (không dấu, cách nhau bởi dấu gạch ngang):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-400">/c/</span>
                    <input
                      type="text"
                      value={slugInputValue}
                      onChange={(e) => setSlugInputValue(e.target.value)}
                      placeholder="trinh-luu-gia-toc"
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    />
                    <button
                      type="button"
                      disabled={isSavingSlug}
                      onClick={handleSaveSlug}
                      className="px-3 py-1.5 bg-[#166534] text-white rounded-lg text-xs font-bold hover:bg-[#14532d] disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingSlug ? '...' : 'Lưu'}</span>
                    </button>
                  </div>
                  {slugError && (
                    <div className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{slugError}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-mono font-bold text-[#166534] truncate">
                  /c/{currentShortCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl border border-emerald-300 transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã Chép' : 'Chép Link'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyZaloMessage}
                className="w-full py-2.5 bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {copiedZaloMsg ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Đã Sao Chép Lời Nhắn Zalo!</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Sao Chép Lời Nhắn Zalo Đầy Đủ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Live Plaque Preview (7 Cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center overflow-y-auto bg-slate-200/60 print:p-0 print:bg-white">
            
            {/* The Actual Printable Frame Card */}
            <div
              ref={plaqueRef}
              id="clan-plaque-print-area"
              className={`w-full max-w-[480px] rounded-2xl border-4 ${currentTheme.borderColor} shadow-2xl p-6 sm:p-8 relative flex flex-col items-center text-center space-y-4 print:shadow-none print:border-8 print:max-w-none print:w-full print:h-screen`}
              style={{ backgroundColor: currentTheme.canvasBg }}
            >
              {/* Corner Traditional Accents */}
              <div className="absolute top-2 left-2 text-xs opacity-40">╔═</div>
              <div className="absolute top-2 right-2 text-xs opacity-40">═╗</div>
              <div className="absolute bottom-2 left-2 text-xs opacity-40">╚═</div>
              <div className="absolute bottom-2 right-2 text-xs opacity-40">═╝</div>

              {/* Clan Header */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-wide" style={{ color: currentTheme.canvasPrimary }}>
                  {family.name.toUpperCase()}
                </h2>
                <p className="text-xs italic text-slate-600 font-serif">
                  {family.ancestral_hall_address ? `Từ Đường: ${family.ancestral_hall_address}` : 'Từ Đường Gia Tộc'}
                </p>
                <div className="w-24 h-0.5 mx-auto opacity-40" style={{ backgroundColor: currentTheme.canvasAccent }} />
              </div>

              {/* Motto */}
              <div className="px-3 py-1 rounded-full text-xs font-bold border" style={{ backgroundColor: currentTheme.bgCard, color: currentTheme.canvasAccent, borderColor: currentTheme.canvasAccent + '40' }}>
                “ {activeMotto} ”
              </div>

              {/* Central QR Code with Badge */}
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src={qrImageUrl}
                  alt={`Mã QR ${family.name}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                />
                
                {/* Center Badge Icon */}
                <div 
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full border-2 border-white shadow-lg flex flex-col items-center justify-center text-[9px] font-black text-white leading-none"
                  style={{ backgroundColor: currentTheme.canvasAccent }}
                >
                  <span>GIA</span>
                  <span>TỘC</span>
                </div>
              </div>

              {/* Instructions Box for Clan Members */}
              <div className="w-full p-3.5 rounded-xl border text-left text-xs space-y-1" style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.canvasAccent + '30' }}>
                <div className="font-bold flex items-center gap-1.5" style={{ color: currentTheme.canvasPrimary }}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hướng dẫn dành cho con cháu trong dòng họ:</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-700 space-y-0.5 pl-1">
                  <li>Dùng Camera điện thoại hoặc Zalo quét mã QR ở trên.</li>
                  <li>Nhập <strong>Mã PIN Gia Tộc</strong> để xác thực tư cách con cháu.</li>
                  <li>Tra cứu toàn bộ <strong>Cây Phả Hệ, Lịch Âm Ngày Giỗ & Số Dư Quỹ</strong> minh bạch.</li>
                </ol>
              </div>

              {/* Bottom Seal Stamp & URL */}
              <div className="w-full pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="truncate">{passUrl}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ backgroundColor: currentTheme.canvasAccent, color: '#FFFFFF' }}>
                  GIA TỘC
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Actions - Hidden on Print */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mã QR sắc nét chuẩn in ấn khổ A4 / A5</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPlaquePNG}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Đang tạo ảnh...' : 'Tải Ảnh PNG Bản In'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Khung Treo Từ Đường</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
