/**
 * HỆ THỐNG TÍNH TOÁN BÁT TỰ & PHONG THỦY TRUYỀN THỐNG VIỆT NAM
 * - 30 Ngũ Hành Nạp Âm (Lục Thập Hoa Giáp)
 * - Cung Phi Bát Trạch (Đông Tứ Mệnh / Tây Tứ Mệnh)
 * - Bát Tự 4 Trụ (Trụ Năm, Trụ Tháng, Trụ Ngày, Trụ Giờ theo Ngũ Thử Độn)
 */

import { CAN, CHI, getCanChiYear, getCanChiMonth, getCanChiDay, jdFromDate, LunarDate, solarToLunar } from './lunar';

export type ElementType = 'KIM' | 'MOC' | 'THUY' | 'HOA' | 'THO';

export interface NapAmInfo {
  canChi: string;
  element: ElementType;
  elementName: string;
  napAm: string;
  meaning: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface CungPhiInfo {
  cung: string;
  han: string;
  element: ElementType;
  elementName: string;
  menhType: 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh';
  favorableDirections: string[];
}

export interface BatTuResult {
  truNam: string;
  truThang: string;
  truNgay: string;
  truGio: string;
  napAm: NapAmInfo;
  cungPhi?: CungPhiInfo;
}

// Bảng 30 Ngũ Hành Nạp Âm theo 60 Hoa Giáp
const NAP_AM_TABLE: { [key: string]: { element: ElementType; elementName: string; napAm: string; meaning: string; color: string; bg: string; border: string } } = {
  'Giáp Tý': { element: 'KIM', elementName: 'Kim', napAm: 'Hải Trung Kim', meaning: 'Vàng dưới biển sâu, tiềm tàng thanh khiết', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Ất Sửu': { element: 'KIM', elementName: 'Kim', napAm: 'Hải Trung Kim', meaning: 'Vàng dưới biển sâu, tiềm tàng thanh khiết', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Bính Dần': { element: 'HOA', elementName: 'Hỏa', napAm: 'Lư Trung Hỏa', meaning: 'Lửa trong lò, rực cháy bền bỉ, chí khí kiên định', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Đinh Mão': { element: 'HOA', elementName: 'Hỏa', napAm: 'Lư Trung Hỏa', meaning: 'Lửa trong lò, rực cháy bền bỉ, chí khí kiên định', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Mậu Thìn': { element: 'MOC', elementName: 'Mộc', napAm: 'Đại Lâm Mộc', meaning: 'Cây rừng lớn, vững chãi, tỏa bóng chở che hậu thế', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Kỷ Tỵ': { element: 'MOC', elementName: 'Mộc', napAm: 'Đại Lâm Mộc', meaning: 'Cây rừng lớn, vững chãi, tỏa bóng chở che hậu thế', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Canh Ngọ': { element: 'THO', elementName: 'Thổ', napAm: 'Lộ Bàng Thổ', meaning: 'Đất ven đường, vững vàng rộng mở, giao thương thông suốt', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Tân Mùi': { element: 'THO', elementName: 'Thổ', napAm: 'Lộ Bàng Thổ', meaning: 'Đất ven đường, vững vàng rộng mở, giao thương thông suốt', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Nhâm Thân': { element: 'KIM', elementName: 'Kim', napAm: 'Kiếm Phong Kim', meaning: 'Vàng mũi kiếm, sắc bén cương trực, khí tiết thanh cao', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Quý Dậu': { element: 'KIM', elementName: 'Kim', napAm: 'Kiếm Phong Kim', meaning: 'Vàng mũi kiếm, sắc bén cương trực, khí tiết thanh cao', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Giáp Tuất': { element: 'HOA', elementName: 'Hỏa', napAm: 'Sơn Đầu Hỏa', meaning: 'Lửa đầu núi, rực sáng phương xa, đức độ quang minh', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Ất Hợi': { element: 'HOA', elementName: 'Hỏa', napAm: 'Sơn Đầu Hỏa', meaning: 'Lửa đầu núi, rực sáng phương xa, đức độ quang minh', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Bính Tý': { element: 'THUY', elementName: 'Thủy', napAm: 'Giản Hạ Thủy', meaning: 'Nước dưới khe suối, chảy êm đềm thấm sâu nuôi dưỡng vạn vật', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Đinh Sửu': { element: 'THUY', elementName: 'Thủy', napAm: 'Giản Hạ Thủy', meaning: 'Nước dưới khe suối, chảy êm đềm thấm sâu nuôi dưỡng vạn vật', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Mậu Dần': { element: 'THO', elementName: 'Thổ', napAm: 'Thành Đầu Thổ', meaning: 'Đất đắp mặt thành, che chở bảo vệ bờ cõi vững chắc', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Kỷ Mão': { element: 'THO', elementName: 'Thổ', napAm: 'Thành Đầu Thổ', meaning: 'Đất đắp mặt thành, che chở bảo vệ bờ cõi vững chắc', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Canh Thìn': { element: 'KIM', elementName: 'Kim', napAm: 'Bạch Lạp Kim', meaning: 'Vàng trong sáp ong, tinh sạch thuần khiết không tì vết', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Tân Tỵ': { element: 'KIM', elementName: 'Kim', napAm: 'Bạch Lạp Kim', meaning: 'Vàng trong sáp ong, tinh sạch thuần khiết không tì vết', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Nhâm Ngọ': { element: 'MOC', elementName: 'Mộc', napAm: 'Dương Liễu Mộc', meaning: 'Cây dương liễu mềm mại, dẻo dai nhu thuận, thích ứng khéo léo', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Quý Mùi': { element: 'MOC', elementName: 'Mộc', napAm: 'Dương Liễu Mộc', meaning: 'Cây dương liễu mềm mại, dẻo dai nhu thuận, thích ứng khéo léo', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Giáp Thân': { element: 'THUY', elementName: 'Thủy', napAm: 'Tuyền Trung Thủy', meaning: 'Nước trong suối nguồn, trong trẻo mát lành, khởi nguồn hưng vượng', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Ất Dậu': { element: 'THUY', elementName: 'Thủy', napAm: 'Tuyền Trung Thủy', meaning: 'Nước trong suối nguồn, trong trẻo mát lành, khởi nguồn hưng vượng', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Bính Tuất': { element: 'THO', elementName: 'Thổ', napAm: 'Ốc Thượng Thổ', meaning: 'Đất ngói lợp nhà, bền vững qua mưa nắng, che chở ấm êm', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Đinh Hợi': { element: 'THO', elementName: 'Thổ', napAm: 'Ốc Thượng Thổ', meaning: 'Đất ngói lợp nhà, bền vững qua mưa nắng, che chở ấm êm', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Mậu Tý': { element: 'HOA', elementName: 'Hỏa', napAm: 'Tích Lịch Hỏa', meaning: 'Lửa sấm sét, uy dũng phi thường, xoay vần chuyển hóa càn khôn', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Kỷ Sửu': { element: 'HOA', elementName: 'Hỏa', napAm: 'Tích Lịch Hỏa', meaning: 'Lửa sấm sét, uy dũng phi thường, xoay vần chuyển hóa càn khôn', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Canh Dần': { element: 'MOC', elementName: 'Mộc', napAm: 'Tùng Bách Mộc', meaning: 'Gỗ cây tùng bách, kiên cường bất khuất giữa sương giá', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Tân Mão': { element: 'MOC', elementName: 'Mộc', napAm: 'Tùng Bách Mộc', meaning: 'Gỗ cây tùng bách, kiên cường bất khuất giữa sương giá', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Nhâm Thìn': { element: 'THUY', elementName: 'Thủy', napAm: 'Trường Lưu Thủy', meaning: 'Nước sông dài cuồn cuộn, chảy mãi không ngừng, phúc lộc trường tồn', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Quý Tỵ': { element: 'THUY', elementName: 'Thủy', napAm: 'Trường Lưu Thủy', meaning: 'Nước sông dài cuồn cuộn, chảy mãi không ngừng, phúc lộc trường tồn', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Giáp Ngọ': { element: 'KIM', elementName: 'Kim', napAm: 'Sa Trung Kim', meaning: 'Vàng trong cát, ẩn tàng quý báu, bền bỉ mài giũa thành tài', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Ất Mùi': { element: 'KIM', elementName: 'Kim', napAm: 'Sa Trung Kim', meaning: 'Vàng trong cát, ẩn tàng quý báu, bền bỉ mài giũa thành tài', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Bính Thân': { element: 'HOA', elementName: 'Hỏa', napAm: 'Sơn Hạ Hỏa', meaning: 'Lửa dưới chân núi, ấm áp sum vầy, kết nối thân tộc', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Đinh Dậu': { element: 'HOA', elementName: 'Hỏa', napAm: 'Sơn Hạ Hỏa', meaning: 'Lửa dưới chân núi, ấm áp sum vầy, kết nối thân tộc', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Mậu Tuất': { element: 'MOC', elementName: 'Mộc', napAm: 'Bình Địa Mộc', meaning: 'Cây đồng bằng, dễ sinh sôi nảy nở, con đàn cháu đống thuận hòa', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Kỷ Hợi': { element: 'MOC', elementName: 'Mộc', napAm: 'Bình Địa Mộc', meaning: 'Cây đồng bằng, dễ sinh sôi nảy nở, con đàn cháu đống thuận hòa', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Canh Tý': { element: 'THO', elementName: 'Thổ', napAm: 'Bích Thượng Thổ', meaning: 'Đất trên vách tường, vững vàng kiên cố, ngăn che phong ba', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Tân Sửu': { element: 'THO', elementName: 'Thổ', napAm: 'Bích Thượng Thổ', meaning: 'Đất trên vách tường, vững vàng kiên cố, ngăn che phong ba', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Nhâm Dần': { element: 'KIM', elementName: 'Kim', napAm: 'Kim Bạch Kim', meaning: 'Vàng mạ bạc, sáng bóng quý phái, gia phong danh giá', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Quý Mão': { element: 'KIM', elementName: 'Kim', napAm: 'Kim Bạch Kim', meaning: 'Vàng mạ bạc, sáng bóng quý phái, gia phong danh giá', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Giáp Thìn': { element: 'HOA', elementName: 'Hỏa', napAm: 'Phú Đăng Hỏa', meaning: 'Lửa đèn dầu, soi sáng đêm đen, mang lại trí tuệ và học vấn', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Ất Tỵ': { element: 'HOA', elementName: 'Hỏa', napAm: 'Phú Đăng Hỏa', meaning: 'Lửa đèn dầu, soi sáng đêm đen, mang lại trí tuệ và học vấn', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Bính Ngọ': { element: 'THUY', elementName: 'Thủy', napAm: 'Thiên Hà Thủy', meaning: 'Nước mưa trên trời, tưới mát muôn phương, bao la rộng lớn', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Đinh Mùi': { element: 'THUY', elementName: 'Thủy', napAm: 'Thiên Hà Thủy', meaning: 'Nước mưa trên trời, tưới mát muôn phương, bao la rộng lớn', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Mậu Thân': { element: 'THO', elementName: 'Thổ', napAm: 'Đại Trạch Thổ', meaning: 'Đất đầm lầy cồn bãi, trù phú màu mỡ, vạn vật sinh sôi', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Kỷ Dậu': { element: 'THO', elementName: 'Thổ', napAm: 'Đại Trạch Thổ', meaning: 'Đất đầm lầy cồn bãi, trù phú màu mỡ, vạn vật sinh sôi', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Canh Tuất': { element: 'KIM', elementName: 'Kim', napAm: 'Thoa Xuyến Kim', meaning: 'Vàng trang sức vòng xuyến, tinh xảo quý báu, đức độ hiển vinh', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Tân Hợi': { element: 'KIM', elementName: 'Kim', napAm: 'Thoa Xuyến Kim', meaning: 'Vàng trang sức vòng xuyến, tinh xảo quý báu, đức độ hiển vinh', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  'Nhâm Tý': { element: 'MOC', elementName: 'Mộc', napAm: 'Tang Đố Mộc', meaning: 'Gỗ cây dâu tằm, nuôi tằm dệt lụa, nuôi nấng dòng giống thảo thơm', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Quý Sửu': { element: 'MOC', elementName: 'Mộc', napAm: 'Tang Đố Mộc', meaning: 'Gỗ cây dâu tằm, nuôi tằm dệt lụa, nuôi nấng dòng giống thảo thơm', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Giáp Dần': { element: 'THUY', elementName: 'Thủy', napAm: 'Đại Khê Thủy', meaning: 'Nước khe lớn, mạnh mẽ tuôn trào, nguồn sinh khí vô tận', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Ất Mão': { element: 'THUY', elementName: 'Thủy', napAm: 'Đại Khê Thủy', meaning: 'Nước khe lớn, mạnh mẽ tuôn trào, nguồn sinh khí vô tận', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Bính Thìn': { element: 'THO', elementName: 'Thổ', napAm: 'Sa Trung Thổ', meaning: 'Đất lẫn trong cát, trầm tích phù sa lắng đọng qua ngàn năm', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Đinh Tỵ': { element: 'THO', elementName: 'Thổ', napAm: 'Sa Trung Thổ', meaning: 'Đất lẫn trong cát, trầm tích phù sa lắng đọng qua ngàn năm', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'Mậu Ngọ': { element: 'HOA', elementName: 'Hỏa', napAm: 'Thiên Thượng Hỏa', meaning: 'Lửa trên trời (Mặt trời), chiếu rọi vạn vật, công đức vô lượng', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Kỷ Mùi': { element: 'HOA', elementName: 'Hỏa', napAm: 'Thiên Thượng Hỏa', meaning: 'Lửa trên trời (Mặt trời), chiếu rọi vạn vật, công đức vô lượng', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
  'Canh Thân': { element: 'MOC', elementName: 'Mộc', napAm: 'Thạch Lựu Mộc', meaning: 'Cây lựu trên đá, rễ cắm sâu vào đá kiên cường, sinh quả sai trĩu', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Tân Dậu': { element: 'MOC', elementName: 'Mộc', napAm: 'Thạch Lựu Mộc', meaning: 'Cây lựu trên đá, rễ cắm sâu vào đá kiên cường, sinh quả sai trĩu', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  'Nhâm Tuất': { element: 'THUY', elementName: 'Thủy', napAm: 'Đại Hải Thủy', meaning: 'Nước biển lớn, mênh mông vô lượng, dung nạp trăm sông về cội', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
  'Quý Hợi': { element: 'THUY', elementName: 'Thủy', napAm: 'Đại Hải Thủy', meaning: 'Nước biển lớn, mênh mông vô lượng, dung nạp trăm sông về cội', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-300' },
};

/**
 * Lấy thông tin Ngũ Hành Nạp Âm từ Can Chi Năm
 */
export function getNapAm(canChiYear: string): NapAmInfo {
  const match = NAP_AM_TABLE[canChiYear];
  if (match) {
    return {
      canChi: canChiYear,
      element: match.element,
      elementName: match.elementName,
      napAm: match.napAm,
      meaning: match.meaning,
      colorClass: match.color,
      bgClass: match.bg,
      borderClass: match.border,
    };
  }
  return {
    canChi: canChiYear,
    element: 'THO',
    elementName: 'Thổ',
    napAm: 'Bản Mệnh Truyền Thống',
    meaning: 'Nạp Âm Lục Thập Hoa Giáp',
    colorClass: 'text-amber-800',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
  };
}

/**
 * Tính Cung Phi Bát Trạch (Cung Mệnh Nam / Nữ)
 */
export function getCungPhi(birthYear: number, gender: 'MALE' | 'FEMALE' | 'OTHER' | string = 'MALE'): CungPhiInfo {
  // Lấy 2 chữ số cuối của năm sinh
  const lastTwo = Math.abs(birthYear) % 100;
  let sum = Math.floor(lastTwo / 10) + (lastTwo % 10);
  while (sum > 9) {
    sum = Math.floor(sum / 10) + (sum % 10);
  }

  const isPre2000 = birthYear < 2000;
  let cungNumber = 1;

  if (gender === 'FEMALE') {
    cungNumber = isPre2000 ? (5 + sum) % 9 : (6 + sum) % 9;
    if (cungNumber === 0) cungNumber = 9;
    if (cungNumber === 5) cungNumber = 8; // Nữ số 5 quy về Cấn (8 - Tây Tứ Mệnh)
  } else {
    cungNumber = isPre2000 ? (10 - sum) : (9 - sum);
    if (cungNumber <= 0) cungNumber += 9;
    if (cungNumber === 5) cungNumber = 2; // Nam số 5 quy về Khôn (2 - Tây Tứ Mệnh)
  }

  const CUNG_MAP: { [key: number]: { cung: string; han: string; element: ElementType; elementName: string; menhType: 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh'; favorableDirections: string[] } } = {
    1: { cung: 'Khảm', han: '坎', element: 'THUY', elementName: 'Thủy', menhType: 'Đông Tứ Mệnh', favorableDirections: ['Đông Nam (Sinh Khí)', 'Đông (Thiên Y)', 'Nam (Diên Niên)', 'Bắc (Phục Vị)'] },
    2: { cung: 'Khôn', han: '坤', element: 'THO', elementName: 'Thổ', menhType: 'Tây Tứ Mệnh', favorableDirections: ['Đông Bắc (Sinh Khí)', 'Tây (Thiên Y)', 'Tây Bắc (Diên Niên)', 'Tây Nam (Phục Vị)'] },
    3: { cung: 'Chấn', han: '震', element: 'MOC', elementName: 'Mộc', menhType: 'Đông Tứ Mệnh', favorableDirections: ['Nam (Sinh Khí)', 'Bắc (Thiên Y)', 'Đông Nam (Diên Niên)', 'Đông (Phục Vị)'] },
    4: { cung: 'Tốn', han: '巽', element: 'MOC', elementName: 'Mộc', menhType: 'Đông Tứ Mệnh', favorableDirections: ['Bắc (Sinh Khí)', 'Nam (Thiên Y)', 'Đông (Diên Niên)', 'Đông Nam (Phục Vị)'] },
    6: { cung: 'Càn', han: '乾', element: 'KIM', elementName: 'Kim', menhType: 'Tây Tứ Mệnh', favorableDirections: ['Tây (Sinh Khí)', 'Đông Bắc (Thiên Y)', 'Tây Nam (Diên Niên)', 'Tây Bắc (Phục Vị)'] },
    7: { cung: 'Đoài', han: '兌', element: 'KIM', elementName: 'Kim', menhType: 'Tây Tứ Mệnh', favorableDirections: ['Tây Bắc (Sinh Khí)', 'Tây Nam (Thiên Y)', 'Đông Bắc (Diên Niên)', 'Tây (Phục Vị)'] },
    8: { cung: 'Cấn', han: '艮', element: 'THO', elementName: 'Thổ', menhType: 'Tây Tứ Mệnh', favorableDirections: ['Tây Nam (Sinh Khí)', 'Tây Bắc (Thiên Y)', 'Tây (Diên Niên)', 'Đông Bắc (Phục Vị)'] },
    9: { cung: 'Ly', han: '離', element: 'HOA', elementName: 'Hỏa', menhType: 'Đông Tứ Mệnh', favorableDirections: ['Đông (Sinh Khí)', 'Đông Nam (Thiên Y)', 'Bắc (Diên Niên)', 'Nam (Phục Vị)'] },
  };

  const match = CUNG_MAP[cungNumber] || CUNG_MAP[1];
  return {
    cung: match.cung,
    han: match.han,
    element: match.element,
    elementName: match.elementName,
    menhType: match.menhType,
    favorableDirections: match.favorableDirections,
  };
}

/**
 * Trích xuất Can Chi Giờ Sinh dựa vào Can Ngày và Giờ
 * (Quy tắc Ngũ Thử Độn)
 */
export function getCanChiHour(birthTimeStr: string | undefined, dayCanChi: string): string {
  if (!birthTimeStr) return 'Chưa rõ giờ';

  // Nhận diện Chi của giờ
  let chiIndex = 0;
  for (let i = 0; i < CHI.length; i++) {
    if (birthTimeStr.toLowerCase().includes(CHI[i].toLowerCase())) {
      chiIndex = i;
      break;
    }
  }

  // Lấy Can của Ngày
  const dayCan = dayCanChi.split(' ')[0] || 'Giáp';
  let startCanIndex = 0; // Giáp/Kỷ khởi Giáp (0)
  if (dayCan === 'Ất' || dayCan === 'Canh') startCanIndex = 2; // Bính
  else if (dayCan === 'Bính' || dayCan === 'Tân') startCanIndex = 4; // Mậu
  else if (dayCan === 'Đinh' || dayCan === 'Nhâm') startCanIndex = 6; // Canh
  else if (dayCan === 'Mậu' || dayCan === 'Quý') startCanIndex = 8; // Nhâm

  const hourCan = CAN[(startCanIndex + chiIndex) % 10];
  const hourChi = CHI[chiIndex];
  return `${hourCan} ${hourChi}`;
}

/**
 * Tính Bát Tự 4 Trụ đầy đủ cho thành viên
 */
export function calculateBatTu(
  birthSolarDate?: string,
  birthLunarYear?: number,
  birthLunarMonth?: number,
  birthLunarDay?: number,
  birthTime?: string,
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string = 'MALE'
): BatTuResult {
  let lYear = birthLunarYear || 1980;
  let lMonth = birthLunarMonth || 1;
  let lDay = birthLunarDay || 1;
  let jdn = jdFromDate(1, 1, lYear);

  if (birthSolarDate) {
    const [y, m, d] = birthSolarDate.split('-').map(Number);
    if (y && m && d) {
      jdn = jdFromDate(d, m, y);
      const lunar = solarToLunar(d, m, y);
      lYear = lunar.year;
      lMonth = lunar.month;
      lDay = lunar.day;
    }
  }

  const truNam = getCanChiYear(lYear);
  const truThang = getCanChiMonth(lMonth, lYear);
  const truNgay = getCanChiDay(jdn);
  const truGio = getCanChiHour(birthTime, truNgay);

  const napAm = getNapAm(truNam);
  const cungPhi = getCungPhi(lYear, gender);

  return {
    truNam,
    truThang,
    truNgay,
    truGio,
    napAm,
    cungPhi,
  };
}
