import React, { useState } from 'react';
import { X, Copy, Check, Printer, Sparkles, ScrollText, Flame, User, MapPin } from 'lucide-react';
import { Member } from '../../types/database';
import { calculateBatTu } from '../../lib/fengshui';

interface MemorialPrayerViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  familyName?: string;
}

export const MemorialPrayerViewerModal: React.FC<MemorialPrayerViewerModalProps> = ({
  isOpen,
  onClose,
  member,
  familyName = 'Đại Tộc Gia Tiên',
}) => {
  const [copied, setCopied] = useState(false);
  const [worshipperRole, setWorshipperRole] = useState<'TRUONG_TOC' | 'CON_TRUONG' | 'CHAU_DICH_TON' | 'DAI_DIEN'>('TRUONG_TOC');
  const [worshipperName, setWorshipperName] = useState('Trưởng Tộc & Hội Đồng Gia Tộc');

  if (!isOpen) return null;

  const batTu = calculateBatTu(
    member.birth_solar_date,
    member.birth_lunar_year,
    undefined,
    undefined,
    member.birth_time,
    member.gender
  );

  const cleanName = member.full_name.replace(/\(.*?\)/g, '').trim();
  const deathDayStr = member.death_lunar_day && member.death_lunar_month
    ? `Ngày ${member.death_lunar_day} Tháng ${member.death_lunar_month} Âm Lịch`
    : 'Ngày Kỵ Nhật Âm Lịch';

  const roleText =
    worshipperRole === 'TRUONG_TOC'
      ? 'Trưởng Tộc'
      : worshipperRole === 'CON_TRUONG'
      ? 'Trưởng Nam'
      : worshipperRole === 'CHAU_DICH_TON'
      ? 'Đích Tôn'
      : 'Đại Diện Hậu Duệ';

  const generatePrayerText = () => {
    return `
VĂN KHẤN CÚNG GIỖ TIÊN NHÂN (KỴ NHẬT TRUYỀN THỐNG)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
- Con kính lạy Hoàng Thiên Hậu Thổ chư vị Tôn thần.
- Con kính lạy ngài Đông Trù Tư Mệnh Táo Phủ Thần Quân.
- Con kính lạy ngài Bản Gia Thổ Địa Long Mạch Tôn Thần.
- Con kính lạy các ngài Ngũ Phương, Ngũ Thổ, Phúc Đức Tôn Thần.
- Con kính lạy ngài Tiền Hậu Địa Chủ Tài Thần.
- Con kính lạy các bậc Tiên Linh, Cao Tằng Tổ Khảo, Cao Tằng Tổ Tỷ, Bá Thúc Huynh Đệ, Cô Di Tỷ Muội nội ngoại tông thân ${familyName}.

Hôm nay là tiết Kỵ Nhật: ${deathDayStr}
Tín chủ con là: ${worshipperName} (${roleText})
Cùng toàn thể con cháu, dâu rể, nội ngoại hậu duệ dòng tộc ${familyName}.
Ngụ tại từ đường / gia trạch kính cẩn dâng lễ.

Nhân ngày cát nhật kỵ giỗ của bậc Tiền Nhân:
CỐ TIỀN NHÂN: ${cleanName.toUpperCase()}
${member.courtesy_name ? `• TỰ HIỆU / THỤY HIỆU: ${member.courtesy_name}` : ''}
${member.religious_name ? `• PHÁP DANH / TÊN THÁNH: ${member.religious_name}` : ''}
${member.death_time ? `• GIỜ QUY TIÊN: ${member.death_time}` : ''}
${member.burial_place ? `• PHẦN MỘ AN TÁNG TẠI: ${member.burial_place}` : ''}
• BẢN MỆNH NẠP ÂM: ${batTu.napAm.napAm} (${batTu.napAm.meaning})

Kính nghĩ: Bậc tiền tổ công cao đức dày, sinh thành dưỡng dục, vun trồng cội rễ cho con cháu đời đời hưởng phúc. Nay gặp ngày húy kỵ, tấc dạ tưởng nhớ khôn nguôi.
Chúng con kính cẩn sắm sửa hương hoa lễ vật, phẩm oản thanh thủy, kim ngân trà quả, thắp nén tâm hương thành kính dâng lên trước án tiền.

Cúi xin Chư vị Tôn Thần, Tiền Tổ chứng giám lòng thành, giáng lâm án tọa, thụ hưởng lễ vật.
Nguyện cầu Tiên Nhân linh thiêng phù hộ độ trì cho toàn thể gia tộc:
- Già trẻ bình an, gia đạo thuận hòa, phúc lộc dồi dào.
- Con cháu học hành đỗ đạt, công danh hiển đạt, sự nghiệp hanh thông.
- Dòng họ Nguyễn đại tộc mãi mãi đoàn kết, trường tồn hưng thịnh muôn đời.

Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin được phù hộ độ trì.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrayerText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Văn Khấn Cúng Giỗ - ${cleanName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body {
            font-family: "Times New Roman", "Be Vietnam Pro", serif;
            line-height: 1.8;
            color: #1a1a1a;
            background: #fff;
            padding: 10px;
          }
          .border-frame {
            border: 3px double #854d0e;
            padding: 25px;
            border-radius: 8px;
          }
          .header-title {
            text-align: center;
            color: #78350f;
            margin-bottom: 20px;
          }
          .header-title h1 {
            font-size: 22px;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header-title h2 {
            font-size: 15px;
            font-weight: normal;
            color: #854d0e;
            margin: 0;
          }
          .prayer-content {
            font-size: 14px;
            text-align: justify;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 30px;
            text-align: right;
            font-style: italic;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="border-frame">
          <div class="header-title">
            <h1>Văn Khấn Cúng Giỗ Tiền Nhân</h1>
            <h2>${familyName.toUpperCase()} — KỴ NHẬT TIÊN TỔ</h2>
          </div>
          <div class="prayer-content">${generatePrayerText()}</div>
          <div class="footer">
            In ngày: ${new Date().toLocaleDateString('vi-VN')} • Nền tảng Gia Phả Gia Tộc
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in my-8">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/70 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shadow-md">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-base font-serif flex items-center gap-2">
                <span>Văn Khấn Cúng Giỗ Tiền Nhân</span>
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300 font-bold">
                  Nghi Lễ Cổ Truyền
                </span>
              </h3>
              <p className="text-xs text-amber-800">
                Phụng kính Cố Tiền Nhân: <strong className="font-serif">{cleanName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-amber-800 hover:text-amber-950 hover:bg-amber-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cấu hình Người Đứng Cúng */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>Thiết lập người chủ trì dâng hương lễ bái:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={worshipperRole}
                onChange={(e: any) => setWorshipperRole(e.target.value)}
                className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-amber-900 focus:outline-none"
              >
                <option value="TRUONG_TOC">Trưởng Tộc (Thay mặt toàn họ)</option>
                <option value="CON_TRUONG">Trưởng Nam (Con trai trưởng)</option>
                <option value="CHAU_DICH_TON">Đích Tôn (Cháu trai trưởng)</option>
                <option value="DAI_DIEN">Đại Diện Hậu Duệ</option>
              </select>
              <input
                type="text"
                value={worshipperName}
                onChange={(e) => setWorshipperName(e.target.value)}
                placeholder="Tên người dâng hương (VD: Nguyễn Văn Hoàng...)"
                className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-amber-950 placeholder-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Khung Thông Tin Tiền Nhân Tóm Tắt */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 bg-white border border-amber-200 rounded-xl">
              <span className="text-[11px] text-amber-700 block">Ngày Kỵ Nhật</span>
              <strong className="text-amber-950 font-bold">{member.death_lunar_day ? `${member.death_lunar_day}/${member.death_lunar_month} ÂL` : 'Kỵ Giỗ'}</strong>
            </div>
            <div className="p-2.5 bg-white border border-amber-200 rounded-xl">
              <span className="text-[11px] text-amber-700 block">Giờ Quy Tiên</span>
              <strong className="text-amber-950 font-bold">{member.death_time || 'Chưa rõ'}</strong>
            </div>
            <div className="p-2.5 bg-white border border-amber-200 rounded-xl">
              <span className="text-[11px] text-amber-700 block">Bản Mệnh Nạp Âm</span>
              <strong className="text-amber-950 font-bold">{batTu.napAm.napAm}</strong>
            </div>
            <div className="p-2.5 bg-white border border-amber-200 rounded-xl">
              <span className="text-[11px] text-amber-700 block">Cung Phi Mệnh</span>
              <strong className="text-amber-950 font-bold">{batTu.cungPhi?.cung || 'Cung Khôn'} ({batTu.cungPhi?.menhType || 'Tây Tứ'})</strong>
            </div>
          </div>

          {/* Bản Văn Khấn Hiển Thị */}
          <div className="relative p-6 bg-gradient-to-b from-[#FFFDF2] to-[#FFF9E6] border-2 border-amber-300/80 rounded-2xl shadow-inner font-serif text-amber-950 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
            <div className="absolute top-3 right-3 opacity-15 pointer-events-none">
              <Flame className="w-16 h-16 text-amber-800" />
            </div>
            {generatePrayerText()}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-amber-100/50 border-t border-amber-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-50 transition cursor-pointer"
          >
            Đóng Lại
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-700" />
                  <span>Sao Chép Văn Khấn</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-950/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Văn Sớ A4</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MemorialPrayerViewerModal;
