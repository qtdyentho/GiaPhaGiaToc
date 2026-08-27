import React, { useState } from 'react';
import { 
  X, Copy, Check, Printer, Sparkles, ScrollText, Flame, 
  User, MapPin, BookOpen, Calendar, ChevronRight 
} from 'lucide-react';
import { Member } from '../../types/database';
import { calculateBatTu } from '../../lib/fengshui';

export type PrayerCeremonyType = 
  | 'CHINH_KY' 
  | 'TIEN_THUONG' 
  | 'TAT_NIEN_30_TET' 
  | 'MUNG_1_TET' 
  | 'THANH_MINH' 
  | 'DOAN_NGO' 
  | 'VU_LAN' 
  | 'TE_TO';

interface CeremonyInfo {
  id: PrayerCeremonyType;
  title: string;
  shortDesc: string;
  icon: string;
}

export const CEREMONY_TYPES: CeremonyInfo[] = [
  { id: 'CHINH_KY', title: 'Cúng Giỗ Chính Kỵ', shortDesc: 'Ngày mất chính thức của Tiền Nhân', icon: '🕯️' },
  { id: 'TIEN_THUONG', title: 'Cúng Tiên Thường', shortDesc: 'Lễ cáo giỗ chiều hôm trước', icon: '🏮' },
  { id: 'TAT_NIEN_30_TET', title: 'Tất Niên 30 Tết', shortDesc: 'Lễ rước Tổ Tiên về ăn Tết', icon: '🧧' },
  { id: 'MUNG_1_TET', title: 'Mùng 1 Tết Nguyên Đán', shortDesc: 'Cúng sáng đầu năm mới', icon: '🌸' },
  { id: 'THANH_MINH', title: 'Tiết Thanh Minh', shortDesc: 'Lễ Tảo mộ & đắp mộ tiên tổ', icon: '🌱' },
  { id: 'DOAN_NGO', title: 'Tiết Đoan Ngọ (5/5 ÂL)', shortDesc: 'Lễ giết sâu bọ & dâng hương', icon: '🍃' },
  { id: 'VU_LAN', title: 'Vu Lan Báo Hiếu (Rằm 7)', shortDesc: 'Cầu siêu & xá tội vong nhân', icon: '🪷' },
  { id: 'TE_TO', title: 'Đại Lễ Tế Tổ Từ Đường', shortDesc: 'Họp họ & khánh thành nhà thờ', icon: '🏛️' },
];

interface MemorialPrayerViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  familyName?: string;
  initialCeremony?: PrayerCeremonyType;
}

export const MemorialPrayerViewerModal: React.FC<MemorialPrayerViewerModalProps> = ({
  isOpen,
  onClose,
  member,
  familyName = 'Đại Tộc Gia Tiên',
  initialCeremony = 'CHINH_KY',
}) => {
  const [selectedCeremony, setSelectedCeremony] = useState<PrayerCeremonyType>(initialCeremony);
  const [copied, setCopied] = useState(false);
  const [worshipperRole, setWorshipperRole] = useState<'TRUONG_TOC' | 'CON_TRUONG' | 'CHAU_DICH_TON' | 'DAI_DIEN'>('TRUONG_TOC');
  const [worshipperName, setWorshipperName] = useState('Trưởng Tộc & Hội Đồng Gia Tộc');

  if (!isOpen) return null;

  const batTu = member ? calculateBatTu(
    member.birth_solar_date,
    member.birth_lunar_year,
    undefined,
    undefined,
    member.birth_time,
    member.gender
  ) : null;

  const cleanName = member?.full_name ? member.full_name.replace(/\(.*?\)/g, '').trim() : 'CHƯ VỊ TIỀN BỐI TIÊN TỔ';
  const deathDayStr = member?.death_lunar_day && member?.death_lunar_month
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
    switch (selectedCeremony) {
      case 'TIEN_THUONG':
        return `
VĂN KHẤN LỄ CÚNG TIÊN THƯỜNG (CÁO GIỖ CHIỀU HÔM TRƯỚC)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
- Con kính lạy Hoàng Thiên Hậu Thổ chư vị Tôn thần.
- Con kính lạy ngài Đông Trù Tư Mệnh Táo Phủ Thần Quân, Thổ Địa Long Mạch Tôn Thần.
- Con kính lạy các bậc Cao Tằng Tổ Khảo, Cao Tằng Tổ Tỷ, Tiên Linh nội ngoại gia tộc ${familyName}.

Hôm nay là chiều ngày: ${member?.death_lunar_day ? member.death_lunar_day - 1 : 'tiền kỵ'} tháng ${member?.death_lunar_month || '...'} Âm lịch.
Tín chủ con là: ${worshipperName} (${roleText})
Cùng toàn thể gia đình, con cháu dòng tộc ${familyName}.

Nhân ngày mai là Chính Kỵ của Cố Tiền Nhân: ${cleanName.toUpperCase()}
${member?.courtesy_name ? `• Tự hiệu: ${member.courtesy_name}` : ''}
${member?.burial_place ? `• Mộ phần an táng tại: ${member.burial_place}` : ''}

Thiết nghĩ: Ơn đức cù lao, ngút trời biển rộng. Trước ngày chính giỗ, lòng dạ bồi hồi.
Nay chúng con sắm sửa hương đăng trà quả, dâng phẩm vật Tiên Thường, kính thỉnh Tiên Nhân cùng chư vị Tiên Linh về ngự trước án tiền thụ hưởng lễ vật, để ngày mai chứng giám lòng thành ngày Chính Kỵ.

Cúi xin chư vị Tôn Thần chứng giám, Tiền Tổ giáng lâm án tọa.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'TAT_NIEN_30_TET':
        return `
VĂN KHẤN LỄ TẤT NIÊN CHIỀU 30 TẾT NGUYÊN ĐÁN (RƯỚC ÔNG BÀ TỔ TIÊN)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy Hoàng Thiên Hậu Thổ chư vị Tôn Thần.
- Con kính lạy ngài Kim Niên Đương Cai Thái Tuế Chí Đức Tôn Thần.
- Con kính lạy ngài Bản Cảnh Thành Hoàng Chư Vị Đại Vương.
- Con kính lạy ngài Bản Xứ Thần Linh Thổ Địa, Đông Trù Tư Mệnh Táo Phủ Thần Quân.
- Con kính lạy Tổ Tiên nội ngoại dòng họ ${familyName}.

Hôm nay là chiều 30 tháng Chạp năm cũ, giờ phút thiêng liêng đất trời chuyển giao.
Tín chủ con là: ${worshipperName} (${roleText})
Cùng toàn thể con cháu dâu rể nội ngoại gia tộc ${familyName}.

Kính nghĩ: Một năm mưa thuận gió hòa, làm ăn tấn tới, cây có cội nước có nguồn.
Nay trước thềm năm mới, con cháu sắm sửa mâm cơm Tất Niên, hoa quả thanh trà, thắp nén tâm hương kính cẩn rước Chư Vị Tiền Nhân, Tổ Khảo, Tổ Tỷ cùng Cố Tiền Nhân ${cleanName} về ngự tại Từ Đường / Gia Trạch ăn Tết cùng con cháu.

Cúi xin Tiên Tổ phù hộ cho toàn gia tộc sang năm mới: An khang thịnh vượng, vạn sự như ý, con cháu thảo hiền, phúc lộc trường tồn.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'MUNG_1_TET':
        return `
VĂN KHẤN SÁNG MÙNG 1 TẾT NGUYÊN ĐÁN (XUẤT HÀNH ĐẦU NĂM)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy Đức Đương Lai Hạ Sinh Di Lặc Tôn Phật.
- Con kính lạy Chư vị Thần linh bản xứ cai quản nơi này.
- Con kính lạy Cửu Huyền Thất Tổ nội ngoại dòng họ ${familyName}.

Hôm nay là sớm mùng Một tháng Giêng, ngày đầu năm mới Nguyên Đán.
Tín chủ con là: ${worshipperName} (${roleText})
Hợp cùng toàn thể con cháu gia tộc tề tựu trước án tiền.

Nhân tiết đầu xuân, giọt sương ban mai thanh khiết, kính dâng quả ngọt trà thơm, hương hoa tinh khiết, kính mừng Tiên Tổ thêm một xuân trường tồn nơi cõi vĩnh hằng.
Cúi xin chứng giám tấc dạ chí thành, phù hộ toàn thể con cháu bước sang năm mới hanh thông tài lộc, học hành đỗ đạt, gia đạo hưng thịnh.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'THANH_MINH':
        return `
VĂN KHẤN TIẾT THANH MINH (TẢO MỘ & ĐẮP MỘ TIỀN NHÂN)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy ngài Kim Niên Đương Cai Thái Tuế Tôn Thần.
- Con kính lạy ngài Bản Cảnh Thành Hoàng, ngài Hậu Thổ Long Mạch cai quản nghĩa trang phần mộ.
- Con kính lạy hương linh Cố Tiền Nhân ${cleanName.toUpperCase()} cùng các bậc tiền nhân an nghỉ nơi sinh phần.

Hôm nay là tiết Thanh Minh, con cháu dòng họ ${familyName} về trước mộ phần.
Tín chủ con là: ${worshipperName} (${roleText})
Kính nghĩ: "Thanh minh trong tiết tháng ba / Lễ là tảo mộ hội là đạp thanh".
Nay chúng con về tu sửa đắp lại nấm mồ, dọn dẹp cỏ rác, kính dâng nén hương thơm, chén rượu nồng tỏ lòng hiếu nghĩa muôn đời.

Kính xin Thần Linh Thổ Địa phù trợ che chở cho phần mộ được yên lành tĩnh lặng, tiền tổ ngậm cười nơi chín suối, ban phúc đức cho con cháu vạn đời.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'DOAN_NGO':
        return `
VĂN KHẤN TIẾT ĐOAN NGỌ (MÙNG 5 THÁNG 5 ÂM LỊCH)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Con kính lạy chín phương Trời, mười phương Chư Phật.
- Con kính lạy ngài Đông Trù Tư Mệnh Táo Phủ Thần Quân, Bản Xứ Thổ Địa.
- Con kính lạy Tiên Linh nội ngoại gia tộc ${familyName}.

Hôm nay là ngày mùng 5 tháng 5 Âm lịch, đúng tiết Đoan Ngọ giữa mùa hạ.
Tín chủ con là: ${worshipperName} (${roleText})
Dâng lễ vật phẩm quả mùa hè, cơm rượu nếp, hương hoa thanh thủy. Kính thỉnh Chư vị Tiên Tổ thụ hưởng, phù hộ cho gia đình thân tâm an lạc, tiêu trừ dịch bệnh uế khí, mùa màng bội thu, con cháu khỏe mạnh bình an.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'VU_LAN':
        return `
VĂN KHẤN ĐẠI LỄ VU LAN BÁO HIẾU (RẰM THÁNG BẢY)
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)
Nam mô Đại Hiếu Mục Kiền Liên Bồ Tát!

- Con kính lạy Mười phương Tam Bảo, Chư Phật Chư Đại Bồ Tát.
- Con kính lạy Đức U Minh Giáo Chủ Địa Tạng Vương Bồ Tát.
- Con kính lạy Cửu Huyền Thất Tổ, các bậc tiền bối, liệt vị hương linh dòng họ ${familyName}.

Hôm nay là tiết Vu Lan Báo Hiếu Rằm tháng Bảy Âm lịch.
Tín chủ con là: ${worshipperName} (${roleText})
Noi gương Đức Mục Kiền Liên cứu mẹ, con cháu một lòng hướng thiện, sắm sửa phẩm vật thanh chay, lập đàn lễ cầu nguyện cho cha mẹ hiện tiền tăng long phúc thọ, cửu huyền thất tổ tiền nhân quá vãng được siêu sinh cõi tịnh độ an nhàn.

Cúi xin Tam Bảo chứng minh, Tiên Tổ giáng lâm thụ hưởng, phù trì cho muôn đời con cháu giữ trọn đạo hiếu nghĩa gia phong.
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'TE_TO':
        return `
VĂN KHẤN ĐẠI LỄ TẾ TỔ & KHÁNH THÀNH TỪ ĐƯỜNG
DÒNG HỌ: ${familyName.toUpperCase()}

Nam mô A Di Đà Phật! (3 lần, 3 lạy)

- Kính lạy Hoàng Thiên Hậu Thổ chư vị Tôn Thần.
- Kính lạy Đức Thủy Tổ, Cao Tằng Tổ Khảo, Tổ Tỷ, liệt vị Tiền Hiền khai sáng bản tộc ${familyName}.

Hôm nay ngày lành tháng tốt, trời đất quang đãng.
Tín chủ: ${worshipperName} (Trưởng Tộc) cùng toàn thể các Chi, Cành, Nhánh đại diện con cháu nội ngoại quy tụ trước Từ Đường.

Kính cẩn tấu trình: Dòng họ muôn người như một, chung tay góp công góp của tôn tạo Từ Đường nguy nga tráng lệ, để làm nơi phụng thờ muôn đời hương hỏa.
Nay kính cẩn dâng lễ đại tế, xin cáo yết Tiên Tổ anh linh chứng giám, an vị tại Tổ Điện, phù hộ cho dòng họ cành lá sum suê, muôn đời phát đạt, văn võ song toàn, rạng danh non sông đất nước!
Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();

      case 'CHINH_KY':
      default:
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
${member?.courtesy_name ? `• TỰ HIỆU / THỤY HIỆU: ${member.courtesy_name}` : ''}
${member?.religious_name ? `• PHÁP DANH / TÊN THÁNH: ${member.religious_name}` : ''}
${member?.death_time ? `• GIỜ QUY TIÊN: ${member.death_time}` : ''}
${member?.burial_place ? `• PHẦN MỘ AN TÁNG TẠI: ${member.burial_place}` : ''}
${batTu ? `• BẢN MỆNH NẠP ÂM: ${batTu.napAm.napAm} (${batTu.napAm.meaning})` : ''}

Kính nghĩ: Bậc tiền tổ công cao đức dày, sinh thành dưỡng dục, vun trồng cội rễ cho con cháu đời đời hưởng phúc. Nay gặp ngày húy kỵ, tấc dạ tưởng nhớ khôn nguôi.
Chúng con kính cẩn sắm sửa hương hoa lễ vật, phẩm oản thanh thủy, kim ngân trà quả, thắp nén tâm hương thành kính dâng lên trước án tiền.

Cúi xin Chư vị Tôn Thần, Tiền Tổ chứng giám lòng thành, giáng lâm án tọa, thụ hưởng lễ vật.
Nguyện cầu Tiên Nhân linh thiêng phù hộ độ trì cho toàn thể gia tộc:
- Già trẻ bình an, gia đạo thuận hòa, phúc lộc dồi dào.
- Con cháu học hành đỗ đạt, công danh hiển đạt, sự nghiệp hanh thông.
- Dòng họ đại tộc mãi mãi đoàn kết, trường tồn hưng thịnh muôn đời.

Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin được phù hộ độ trì.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)
        `.trim();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrayerText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const activeCeremonyInfo = CEREMONY_TYPES.find((c) => c.id === selectedCeremony);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activeCeremonyInfo?.title} - ${familyName}</title>
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
            <h1>${activeCeremonyInfo?.title.toUpperCase()}</h1>
            <h2>${familyName.toUpperCase()} — PHỤNG SỰ TIÊN TỔ</h2>
          </div>
          <div class="prayer-content">${generatePrayerText()}</div>
          <div class="footer">
            Trích lục ngày: ${new Date().toLocaleDateString('vi-VN')} • Nền Tảng Gia Phả Gia Tộc
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#FFFDF7] dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/70 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-b border-amber-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-800 dark:bg-amber-700 text-amber-100 flex items-center justify-center shadow-md shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 dark:text-amber-200 text-base font-serif flex items-center gap-2">
                <span>Kho Tàng Văn Khấn & Nghi Lễ Gia Tộc</span>
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold">
                  8 Bài Chuẩn Cổ Truyền
                </span>
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-400">
                {member ? `Phụng kính Cố Tiền Nhân: ${cleanName}` : `Dòng tộc: ${familyName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-amber-800 dark:text-slate-400 hover:text-amber-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ceremony Picker Pills (Cuộn Ngang) */}
        <div className="px-5 sm:px-6 py-2.5 bg-amber-50/50 dark:bg-slate-800/60 border-b border-amber-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          {CEREMONY_TYPES.map((ceremony) => {
            const isSelected = selectedCeremony === ceremony.id;
            return (
              <button
                key={ceremony.id}
                type="button"
                onClick={() => setSelectedCeremony(ceremony.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#166534] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{ceremony.icon}</span>
                <span>{ceremony.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Cấu hình Người Đứng Cúng */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Thiết lập người chủ trì dâng hương lễ bái:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={worshipperRole}
                onChange={(e: any) => setWorshipperRole(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl text-xs font-medium text-amber-900 dark:text-amber-200 focus:outline-none cursor-pointer"
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
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl text-xs text-amber-950 dark:text-amber-100 placeholder-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Khung Thông Tin Tiền Nhân Tóm Tắt (nếu có member) */}
          {member && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block">Ngày Kỵ Nhật</span>
                <strong className="text-amber-950 dark:text-amber-200 font-bold">{member.death_lunar_day ? `${member.death_lunar_day}/${member.death_lunar_month} ÂL` : 'Kỵ Giỗ'}</strong>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block">Giờ Quy Tiên</span>
                <strong className="text-amber-950 dark:text-amber-200 font-bold">{member.death_time || 'Chưa rõ'}</strong>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block">Bản Mệnh Nạp Âm</span>
                <strong className="text-amber-950 dark:text-amber-200 font-bold">{batTu?.napAm.napAm || 'Bản Mệnh'}</strong>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block">Cung Phi Mệnh</span>
                <strong className="text-amber-950 dark:text-amber-200 font-bold">{batTu?.cungPhi?.cung || 'Cung Khôn'} ({batTu?.cungPhi?.menhType || 'Tây Tứ'})</strong>
              </div>
            </div>
          )}

          {/* Bản Văn Khấn Hiển Thị */}
          <div className="relative p-6 bg-gradient-to-b from-[#FFFDF2] to-[#FFF9E6] dark:from-slate-800/90 dark:to-slate-800/60 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-2xl shadow-inner font-serif text-amber-950 dark:text-amber-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
            <div className="absolute top-3 right-3 opacity-10 dark:opacity-5 pointer-events-none">
              <Flame className="w-16 h-16 text-amber-800 dark:text-amber-400" />
            </div>
            {generatePrayerText()}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-amber-100/50 dark:bg-slate-800 border-t border-amber-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Đóng Lại
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Sao Chép Văn Khấn</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-950/20 cursor-pointer"
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
