import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, QrCode, Sparkles, Landmark, ShieldCheck } from 'lucide-react';
import { Family } from '../../types/database';

interface PrintableClanQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
  passToken: string;
  shortCode?: string;
}

export const PrintableClanQRCodeModal: React.FC<PrintableClanQRCodeModalProps> = ({
  isOpen,
  onClose,
  family,
  passToken,
  shortCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn';
  const passUrl = shortCode ? `${currentHost}/c/${shortCode}` : `${currentHost}/clan-pass/${passToken}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(passUrl)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-amber-900/30 animate-fade-in print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 text-amber-100 flex items-center justify-between border-b border-amber-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800/80 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Mã QR Bản In Dán Tại Từ Đường</h3>
              <p className="text-[11px] text-amber-200/80">Tra cứu Gia Phả & Số Dư Quỹ bằng Mã PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-300/70 hover:text-white hover:bg-amber-800/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Heritage Certificate / QR Plaque */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE] print:bg-white text-slate-900 text-center space-y-5 print:space-y-4">
          {/* Traditional Border Frame */}
          <div className="border-4 border-double border-amber-900/40 rounded-2xl p-6 bg-white/80 shadow-xs relative overflow-hidden">
            {/* Corner traditional ornaments */}
            <div className="absolute top-2 left-2 text-amber-800/30 text-xs font-serif">❖</div>
            <div className="absolute top-2 right-2 text-amber-800/30 text-xs font-serif">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-800/30 text-xs font-serif">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-800/30 text-xs font-serif">❖</div>

            {/* Header Text */}
            <div className="space-y-1 mb-4">
              <div className="inline-flex items-center gap-1.5 text-amber-900 text-xs font-black uppercase tracking-widest font-serif border-b border-amber-300 pb-1">
                <Landmark className="w-4 h-4 text-amber-800" />
                <span>Ẩm Hà Tư Nguyên • Lưu Truyền Vạn Đời</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#166534] font-serif uppercase pt-1">
                {family.name}
              </h2>
              {family.ancestral_hall_address && (
                <p className="text-[11px] text-slate-600 font-serif italic">
                  Từ Đường: {family.ancestral_hall_address}
                </p>
              )}
            </div>

            {/* QR Code Container */}
            <div className="relative inline-block p-3.5 bg-white rounded-2xl border-2 border-amber-800/20 shadow-md my-2">
              <img
                src={qrImageUrl}
                alt={`Mã QR ${family.name}`}
                className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full border-2 border-amber-800 flex items-center justify-center shadow-xs">
                  <span className="text-[10px] font-black text-amber-900 font-serif">GIA TỘC</span>
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-left text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Hướng dẫn dành cho con cháu trong dòng họ:</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed pl-5">
                1. Dùng Camera điện thoại hoặc ứng dụng Zalo quét mã QR ở trên.<br />
                2. Nhập <strong>Mã PIN Gia Tộc</strong> để xác thực tư cách con cháu.<br />
                3. Tra cứu toàn bộ <strong>Cây Phả Hệ, Lịch Âm Ngày Giỗ & Số Dư Sổ Quỹ</strong> minh bạch.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 transition shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã Chép Link Zalo!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao Chép Link Zalo</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <a
              href={qrImageUrl}
              download={`QRCode_${family.code || 'GiaToc'}.png`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh PNG</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Khung Ảnh Từ Đường</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
