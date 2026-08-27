import React, { useState, useRef } from 'react';
import { 
  X, Printer, Download, Copy, Check, QrCode, Sparkles, Landmark, 
  ShieldCheck, Palette, Layout, MessageSquare, ChevronDown, CheckCircle2 
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

  const plaqueRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn';
  const effectiveShortCode = shortCode || slugifyVietnamese(family.name) || family.code?.toLowerCase() || 'giaphatoc';
  const passUrl = `${currentHost}/c/${effectiveShortCode}`;
  
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

      // 4. Hoa văn 4 góc (❖)
      ctx.fillStyle = currentTheme.canvasAccent + '80';
      ctx.font = 'bold 36px serif';
      ctx.fillText('❖', 100, 130);
      ctx.fillText('❖', width - 135, 130);
      ctx.fillText('❖', 100, height - 110);
      ctx.fillText('❖', width - 135, height - 110);

      // 5. Khẩu Hiệu Tiên Tổ
      ctx.textAlign = 'center';
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.font = 'bold 26px serif';
      ctx.fillText(`🏛️  ${activeMotto.toUpperCase()}  🏛️`, width / 2, 170);

      // Đường kẻ ngang trang trí
      ctx.strokeStyle = currentTheme.canvasAccent + '60';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, 195);
      ctx.lineTo(width - 300, 195);
      ctx.stroke();

      // 6. Tên Dòng Họ
      ctx.fillStyle = currentTheme.canvasPrimary;
      ctx.font = 'bold 52px serif';
      ctx.fillText(family.name.toUpperCase(), width / 2, 270);

      // 7. Địa chỉ Từ Đường
      if (family.ancestral_hall_address) {
        ctx.fillStyle = '#475569';
        ctx.font = 'italic 24px serif';
        ctx.fillText(`Từ Đường: ${family.ancestral_hall_address}`, width / 2, 320);
      }

      // 8. Tải và Vẽ Mã QR
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = qrImageUrl;

      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve(); // Tiếp tục vẽ nếu API offline
      });

      const qrSize = 540;
      const qrX = (width - qrSize) / 2;
      const qrY = 380;

      // Khung chứa QR
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      ctx.strokeStyle = currentTheme.canvasAccent + '40';
      ctx.lineWidth = 4;
      ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

      try {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      } catch (err) {
        console.warn('Canvas draw image error:', err);
      }

      // Con dấu Gia Tộc ở giữa QR
      const stampSize = 90;
      const stampX = width / 2 - stampSize / 2;
      const stampY = qrY + qrSize / 2 - stampSize / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(width / 2, qrY + qrSize / 2, stampSize / 2 + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = currentTheme.canvasAccent;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.font = 'bold 18px serif';
      ctx.fillText('GIA TỘC', width / 2, qrY + qrSize / 2 + 6);

      // 9. Khung Hướng Dẫn Quét & Mã PIN
      const guideY = 1000;
      ctx.fillStyle = currentTheme.canvasBg;
      ctx.fillRect(140, guideY, width - 280, 420);
      ctx.strokeStyle = currentTheme.canvasAccent + '50';
      ctx.lineWidth = 2;
      ctx.strokeRect(140, guideY, width - 280, 420);

      ctx.textAlign = 'left';
      ctx.fillStyle = currentTheme.canvasAccent;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('🛡️  HƯỚNG DẪN DÀNH CHO CON CHÁU DÒNG HỌ:', 180, guideY + 55);

      ctx.fillStyle = '#1E293B';
      ctx.font = '22px sans-serif';
      ctx.fillText('1. Dùng Camera điện thoại hoặc ứng dụng Zalo quét mã QR ở trên.', 180, guideY + 115);
      ctx.fillText(`2. Truy cập trực tiếp liên kết rút gọn: ${passUrl}`, 180, guideY + 165);
      ctx.fillText('3. Nhập Mã PIN Gia Tộc để xác thực tư cách con cháu họ tộc.', 180, guideY + 215);
      ctx.fillText('4. Tra cứu Cây Phả Hệ, Ngày Giỗ Tiên Tổ & Minh Bạch Sổ Quỹ.', 180, guideY + 265);

      if (clanPin) {
        ctx.fillStyle = currentTheme.canvasPrimary;
        ctx.font = 'bold 26px monospace';
        ctx.fillText(`🔑 MÃ PIN TRA CỨU: ${clanPin}`, 180, guideY + 340);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('Nền tảng Quản trị Gia Phả & Tài Chính Dòng Họ — giaphagiatoc.vn', width / 2, height - 120);

      // Xuất file PNG
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `KhungQR_${effectiveShortCode}_${selectedSize}.png`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-amber-900/30 animate-fade-in print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none">
        
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-amber-100 flex items-center justify-between border-b border-amber-900/50 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-800/80 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Mã QR & Bản In Khung Dán Từ Đường</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  /c/{effectiveShortCode}
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

        {/* Modal Body: 2 Columns on Desktop (Left: Control Panel, Right: Live Plaque Preview) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-100">
          
          {/* Left Panel: Tùy biến & Chia sẻ (Hidden on Print) - 5 Cols */}
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

            {/* Box 4: Chia sẻ Zalo & Facebook */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Chia Sẻ Nhanh Cho Bà Con:</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-mono font-bold text-[#166534] truncate">
                  /c/{effectiveShortCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl border border-emerald-300 transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã Chép' : 'Chép Link'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyZaloMessage}
                className="w-full py-2 bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {copiedZaloMsg ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã Chép Lời Nhắn Zalo Chuẩn Mực!</span>
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

          {/* Right Panel: Live Plaque Preview (In ấn & Hiển thị) - 7 Cols */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex items-center justify-center bg-slate-200/70 overflow-y-auto">
            <div
              ref={plaqueRef}
              className={`w-full max-w-md ${currentTheme.bgCard} text-slate-900 text-center rounded-2xl shadow-xl p-6 sm:p-7 border-4 border-double ${currentTheme.borderColor} relative overflow-hidden transition-all duration-300 print:m-0 print:p-8 print:border-none print:shadow-none print:max-w-none print:w-full`}
            >
              {/* Corner Ornaments */}
              <div className={`absolute top-2 left-2 ${currentTheme.cornerColor} text-xs font-serif`}>❖</div>
              <div className={`absolute top-2 right-2 ${currentTheme.cornerColor} text-xs font-serif`}>❖</div>
              <div className={`absolute bottom-2 left-2 ${currentTheme.cornerColor} text-xs font-serif`}>❖</div>
              <div className={`absolute bottom-2 right-2 ${currentTheme.cornerColor} text-xs font-serif`}>❖</div>

              {/* Plaque Header: Motto & Clan Name */}
              <div className="space-y-1.5 mb-3">
                <div className={`inline-flex items-center gap-1.5 ${currentTheme.headerColor} text-[11px] font-black uppercase tracking-widest font-serif border-b border-amber-300/80 pb-1`}>
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{activeMotto}</span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-black ${currentTheme.titleColor} font-serif uppercase pt-1 tracking-wide`}>
                  {family.name}
                </h2>
                {family.ancestral_hall_address && (
                  <p className="text-[11px] text-slate-600 font-serif italic">
                    Từ Đường: {family.ancestral_hall_address}
                  </p>
                )}
              </div>

              {/* QR Code Container with Central Stamp */}
              <div className="relative inline-block p-3 bg-white rounded-2xl border-2 border-amber-900/20 shadow-md my-2">
                <img
                  src={qrImageUrl}
                  alt={`Mã QR ${family.name}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-11 h-11 rounded-full border-2 border-white flex items-center justify-center shadow-md ${currentTheme.stampBg}`}>
                    <span className="text-[9px] font-black font-serif tracking-tight text-center">GIA<br/>TỘC</span>
                  </div>
                </div>
              </div>

              {/* Instruction Box for Descendants */}
              <div className={`mt-3 p-3 rounded-xl border text-left text-xs space-y-1.5 ${currentTheme.accentBg}`}>
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Hướng dẫn dành cho con cháu trong dòng họ:</span>
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed pl-5 space-y-0.5">
                  <p>1. Dùng Camera điện thoại hoặc Zalo quét mã QR ở trên.</p>
                  <p>2. Nhập <strong>Mã PIN Gia Tộc</strong> để xác thực tư cách con cháu.</p>
                  <p>3. Tra cứu toàn bộ <strong>Cây Phả Hệ, Lịch Âm Ngày Giỗ & Số Dư Quỹ</strong> minh bạch.</p>
                </div>
                {clanPin && (
                  <div className="mt-1 pt-1.5 border-t border-amber-200/80 pl-5 text-[11px] font-bold text-amber-900 flex items-center justify-between">
                    <span>Mã PIN Mặc Định:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-amber-300 text-[#166534]">
                      {clanPin}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 text-[10px] text-slate-500 font-serif italic">
                giaphagiatoc.vn • Bảo Tồn & Trao Truyền Cội Nguồn
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPlaquePNG}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Đang Kết Xuất...' : 'Tải Ảnh PNG Bản In'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
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

export default PrintableClanQRCodeModal;
