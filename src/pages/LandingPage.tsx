import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trees, Calendar, Landmark, Sparkles, ArrowRight, Award, ShieldCheck, 
  Users, CheckCircle2, ChevronRight, BookOpen, HeartHandshake, Phone, 
  HelpCircle, QrCode, Lock, ArrowUpRight, Check, Star, ShieldAlert,
  ArrowRightLeft, Sparkle, Sun, Moon, Eye, Clock, Shield, ChevronDown,
  Layers, Download, Compass, Scale, ScrollText, ZoomIn, ZoomOut, RotateCcw,
  X, Send, CheckCircle, Calculator, FileText, Share2, Menu
} from 'lucide-react';
import { BRAND } from '../lib/constants';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  
  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showSampleTreeModal, setShowSampleTreeModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);

  // Hero Tree Interactive States
  const [treeZoom, setTreeZoom] = useState(1);
  const [treeFilter, setTreeFilter] = useState<'ALL' | 'TRUONG' | 'THU'>('ALL');
  const [generationFilter, setGenerationFilter] = useState<number | 'ALL'>('ALL');
  const [selectedHeroMember, setSelectedHeroMember] = useState<{
    id: string;
    name: string;
    generation: number;
    branch: string;
    branchType: 'TRUONG' | 'THU';
    title: string;
    desc: string;
    birthDeath: string;
    relationText: string;
    burialSite?: string;
    isAlive?: boolean;
  }>({
    id: 'hero-1',
    name: 'Cụ Thủy Tổ Nguyễn Quý Công (1885 - 1962)',
    generation: 1,
    branch: 'Khai Sáng Dòng Họ',
    branchType: 'TRUONG',
    title: 'Thủy Tổ Khởi Nghiệp',
    desc: 'Bậc tiền bối khai canh lập ấp tại vùng đất Định Công. Đức độ rạng ngời, để lại gia quy ngũ thường và đất sinh phần cho muôn đời con cháu phụng dựng.',
    birthDeath: 'Ất Dậu 1885 — Nhâm Dần 1962 (Thọ 78 tuổi)',
    relationText: 'Đời 1 • Khởi Tổ',
    burialSite: 'Khu Lăng Mộ Cổ, Đồi Thông Định Công Thượng',
    isAlive: false
  });

  // Interactive Kinship Demo States
  const [genA, setGenA] = useState<number>(4);
  const [genB, setGenB] = useState<number>(4);
  const [branchA, setBranchA] = useState<'TRUONG' | 'THU'>('TRUONG');
  const [branchB, setBranchB] = useState<'THU' | 'TRUONG'>('THU');
  const [ageA, setAgeA] = useState<number>(24);
  const [ageB, setAgeB] = useState<number>(48);

  // Interactive Lunar Calendar State
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(1);

  // Interactive Pricing Calculator State
  const [memberCount, setMemberCount] = useState<number>(120);
  const [billingCycle, setBillingCycle] = useState<'YEARLY' | 'MONTHLY'>('YEARLY');

  // Consultation Form State
  const [consultForm, setConsultForm] = useState({
    clanName: '',
    contactName: '',
    phone: '',
    province: 'Hà Nội',
    memberEstimate: '100 - 300 thành viên'
  });

  // QR Donation Demo State
  const [qrAmount, setQrAmount] = useState<number>(500000);
  const [qrFund, setQrFund] = useState<'TU_BO' | 'KHUYEN_HOC' | 'HOAT_DONG'>('TU_BO');
  const [qrDonorName, setQrDonorName] = useState<string>('Nguyễn Văn Tuấn (Chi Trưởng)');

  // Full 5-Generation Lineage Sample Dataset (Đời 1 -> Đời 5)
  const heroMembers = [
    // ĐỜI 1: KHỞI TỔ
    {
      id: 'hero-1',
      name: 'Cụ Thủy Tổ Nguyễn Quý Công',
      generation: 1,
      branch: 'Khai Sáng Dòng Họ',
      branchType: 'TRUONG' as const,
      title: 'Thủy Tổ Khởi Nghiệp',
      desc: 'Bậc tiền bối khai canh lập ấp tại vùng đất Định Công. Đức độ rạng ngời, để lại gia quy ngũ thường và đất sinh phần cho muôn đời con cháu phụng dựng.',
      birthDeath: 'Ất Dậu 1885 — Nhâm Dần 1962 (Thọ 78 tuổi)',
      relationText: 'Đời 1 • Khởi Tổ',
      burialSite: 'Khu Lăng Mộ Cổ, Đồi Thông Định Công Thượng',
      isAlive: false
    },
    // ĐỜI 2: TIÊN TỔ PHÂN CHI (CHI TRƯỞNG & CHI THỨ)
    {
      id: 'hero-2',
      name: 'Cụ Nguyễn Văn An',
      generation: 2,
      branch: 'Chi Cả (Trưởng Chi)',
      branchType: 'TRUONG' as const,
      title: 'Trưởng Chi Đời 2',
      desc: 'Kế thừa từ đường chi trưởng, giữ gìn cuốn ngọc phả cổ giấy dó và chủ trì tế tự dòng tộc qua các thời kỳ khó khăn.',
      birthDeath: 'Canh Tuất 1910 — Tân Mùi 1991 (Thọ 82 tuổi)',
      relationText: 'Đời 2 • Trưởng Chi',
      burialSite: 'Khu Nghĩa Trang Dòng Họ, Khu A Lô 01',
      isAlive: false
    },
    {
      id: 'hero-3',
      name: 'Cụ Nguyễn Văn Bình',
      generation: 2,
      branch: 'Chi Hai (Thứ Chi)',
      branchType: 'THU' as const,
      title: 'Thứ Chi Đời 2',
      desc: 'Đỗ đạt cử nhân Nho học, lập nghiệp phương xa mở rộng thanh danh gia tộc, đóng góp xây dựng cầu đá làng quê.',
      birthDeath: 'Quý Sửu 1913 — Ất Hợi 1995 (Thọ 83 tuổi)',
      relationText: 'Đời 2 • Thứ Chi',
      burialSite: 'Khu Nghĩa Trang Dòng Họ, Khu B Lô 05',
      isAlive: false
    },
    // ĐỜI 3: ĐƯƠNG NIÊN TỘC TRƯỞNG & CAO NIÊN
    {
      id: 'hero-4',
      name: 'Ông Nguyễn Văn Tuấn',
      generation: 3,
      branch: 'Chi Cả (Đời 3)',
      branchType: 'TRUONG' as const,
      title: 'Nguyên Trưởng Tộc',
      desc: 'Chủ trì việc đại trùng tu nhà thờ họ năm 1998, lập quỹ khuyến học dòng họ và lập hội đồng gia tộc định kỳ.',
      birthDeath: 'Mậu Tý 1948 — Canh Tý 2020 (Thọ 73 tuổi)',
      relationText: 'Đời 3 • Chi Trưởng',
      burialSite: 'Khu Lăng Mộ Chi Trưởng',
      isAlive: false
    },
    {
      id: 'hero-5',
      name: 'Ông Nguyễn Văn Thành',
      generation: 3,
      branch: 'Chi Hai (Đời 3)',
      branchType: 'THU' as const,
      title: 'Trưởng Chi Thứ Đời 3',
      desc: 'Doanh nhân thành đạt, tài trợ 50% kinh phí đúc chuông đồng và dựng bia đá ghi danh công đức tại từ đường.',
      birthDeath: 'Nhâm Thìn 1952 (75 tuổi)',
      relationText: 'Đời 3 • Chi Thứ',
      burialSite: 'Đang sinh sống tại Cầu Giấy, Hà Nội',
      isAlive: true
    },
    {
      id: 'hero-6',
      name: 'Bà Nguyễn Thị Mai',
      generation: 3,
      branch: 'Chi Cả (Đời 3)',
      branchType: 'TRUONG' as const,
      title: 'Cô Họ Cao Niên',
      desc: 'Bậc cao niên am hiểu nghi lễ tế tự cổ truyền, hướng dẫn ban khánh tiết chuẩn bị các tuần tế trong đại lễ giỗ tổ.',
      birthDeath: 'Bính Thân 1956 (71 tuổi)',
      relationText: 'Đời 3 • Chi Trưởng',
      burialSite: 'Đang sinh sống tại Định Công, Hà Nội',
      isAlive: true
    },
    // ĐỜI 4: ĐƯƠNG NHIỆM & TRƯỞNG THÀNH
    {
      id: 'hero-7',
      name: 'Anh Nguyễn Văn Minh',
      generation: 4,
      branch: 'Chi Cả (Đời 4)',
      branchType: 'TRUONG' as const,
      title: 'Trưởng Tộc Đương Nhiệm',
      desc: 'Chủ trì việc số hóa ngọc phả trực tuyến năm 2026, kết nối dữ liệu bà con kiều bào và quản lý lịch giỗ vạn niên.',
      birthDeath: 'Ất Mão 1975 (52 tuổi)',
      relationText: 'Đời 4 • Trưởng Tộc',
      burialSite: 'Đang sinh sống tại Từ Đường Định Công',
      isAlive: true
    },
    {
      id: 'hero-8',
      name: 'Anh Nguyễn Văn Hùng',
      generation: 4,
      branch: 'Chi Hai (Đời 4)',
      branchType: 'THU' as const,
      title: 'Trưởng Ban Khuyến Học',
      desc: 'Thạc sĩ Khoa học, điều hành hội đồng khen thưởng học sinh, sinh viên đỗ đạt xuất sắc hàng năm vào dịp rằm tháng Tám.',
      birthDeath: 'Mậu Ngọ 1978 (49 tuổi)',
      relationText: 'Đời 4 • Chi Thứ',
      burialSite: 'Đang sinh sống tại Hoàng Mai, Hà Nội',
      isAlive: true
    },
    {
      id: 'hero-9',
      name: 'Chị Nguyễn Thị Lan',
      generation: 4,
      branch: 'Chi Cả (Đời 4)',
      branchType: 'TRUONG' as const,
      title: 'Thủ Quỹ Từ Đường',
      desc: 'Quản lý sổ quỹ kép bất biến, đối soát tài chính minh bạch 100% và tạo mã VietQR cho con cháu cúng tiến.',
      birthDeath: 'Nhâm Tuất 1982 (45 tuổi)',
      relationText: 'Đời 4 • Chi Trưởng',
      burialSite: 'Đang sinh sống tại Thanh Xuân, Hà Nội',
      isAlive: true
    },
    // ĐỜI 5: HẬU DUỆ TIẾP NỐI (THẾ HỆ TRẺ)
    {
      id: 'hero-10',
      name: 'Cháu Nguyễn Văn Hoàng',
      generation: 5,
      branch: 'Chi Cả (Đời 5)',
      branchType: 'TRUONG' as const,
      title: 'Đích Tôn Đời 5',
      desc: 'Kỹ sư Công nghệ phần mềm, phụ trách kỹ thuật nhập liệu gia phả số và hỗ trợ các chi nhánh họ tộc cập nhật thông tin.',
      birthDeath: 'Nhâm Ngọ 2002 (25 tuổi)',
      relationText: 'Đời 5 • Đích Tôn',
      burialSite: 'Đang công tác tại Hà Nội',
      isAlive: true
    },
    {
      id: 'hero-11',
      name: 'Cháu Nguyễn Minh Quân',
      generation: 5,
      branch: 'Chi Hai (Đời 5)',
      branchType: 'THU' as const,
      title: 'Bảng Vàng Khuyến Học',
      desc: 'Đoạt Huy chương Vàng Olympic Toán học trẻ, được vinh danh trên Bảng Vàng Danh Dự tại Từ Đường dòng tộc.',
      birthDeath: 'Mậu Tý 2008 (19 tuổi)',
      relationText: 'Đời 5 • Chi Thứ',
      burialSite: 'Sinh viên Đại học Bách Khoa',
      isAlive: true
    },
    {
      id: 'hero-12',
      name: 'Cháu Nguyễn Ngọc Linh',
      generation: 5,
      branch: 'Chi Cả (Đời 5)',
      branchType: 'TRUONG' as const,
      title: 'Hậu Duệ Đời 5',
      desc: 'Thành viên thế hệ trẻ mầm non của dòng họ, chăm ngoan học giỏi, tấm gương sáng trong các kỳ tuyên dương gia tộc.',
      birthDeath: 'Ất Mùi 2015 (12 tuổi)',
      relationText: 'Đời 5 • Hậu Duệ',
      burialSite: 'Học sinh Trường THCS Định Công',
      isAlive: true
    }
  ];

  const filteredMembers = heroMembers.filter(m => {
    const matchBranch = treeFilter === 'ALL' || m.branchType === treeFilter;
    const matchGen = generationFilter === 'ALL' || m.generation === generationFilter;
    return matchBranch && matchGen;
  });

  // Calculate Kinship Result
  const computeKinship = () => {
    if (genA === genB) {
      if (branchA === 'TRUONG' && branchB === 'THU') {
        return {
          relationAtoB: '« Anh/Chị Họ (Vế Trên / Con Bác) »',
          relationBtoA: '« Em Họ (Vế Dưới / Con Chú) »',
          reason: `Dù Người B (${ageB} tuổi) nhiều tuổi hơn Người A (${ageA} tuổi), nhưng vì Người A thuộc Chi Trưởng (Con Bác) nên theo phong tục gia lễ Việt Nam « Bé bằng củ khoai, cứ vai mà gọi », Người A luôn ở Vế Trên.`
        };
      } else if (branchA === 'THU' && branchB === 'TRUONG') {
        return {
          relationAtoB: '« Em Họ (Vế Dưới / Con Chú) »',
          relationBtoA: '« Anh/Chị Họ (Vế Trên / Con Bác) »',
          reason: `Người B thuộc Chi Trưởng (Con Bác) nên ở Vế Trên so với Người A thuộc Chi Thứ (Con Chú).`
        };
      } else {
        return {
          relationAtoB: ageA >= ageB ? '« Anh/Chị Họ (Theo Tuổi) »' : '« Em Họ (Theo Tuổi) »',
          relationBtoA: ageB >= ageA ? '« Anh/Chị Họ (Theo Tuổi) »' : '« Em Họ (Theo Tuổi) »',
          reason: `Hai người cùng một cành chi và cùng đời thứ ${genA}, danh xưng phân định theo tuổi đời thực tế.`
        };
      }
    } else if (genA < genB) {
      const diff = genB - genA;
      if (diff === 1) {
        return {
          relationAtoB: branchA === 'TRUONG' ? '« Bác Họ (Bậc Cha Chú) »' : '« Chú/Cô/Dì Họ »',
          relationBtoA: '« Cháu Họ (Hàng Con Cháu) »',
          reason: `Người A ở đời thứ ${genA} (trên 1 đời so với Người B ở đời thứ ${genB}), do đó Người B gọi Người A là Bác/Chú/Cô và xưng Cháu.`
        };
      } else {
        return {
          relationAtoB: '« Cụ / Ông / Bà Họ »',
          relationBtoA: '« Chắt / Cháu Họ »',
          reason: `Người A cách Người B ${diff} thế hệ, thuộc hàng Trưởng Thượng.`
        };
      }
    } else {
      const diff = genA - genB;
      if (diff === 1) {
        return {
          relationAtoB: '« Cháu Họ (Hàng Con Cháu) »',
          relationBtoA: branchB === 'TRUONG' ? '« Bác Họ (Bậc Cha Chú) »' : '« Chú/Cô/Dì Họ »',
          reason: `Người B ở đời thứ ${genB} (trên 1 đời so với Người A ở đời thứ ${genA}), do đó Người A gọi Người B là Bác/Chú và xưng Cháu.`
        };
      } else {
        return {
          relationAtoB: '« Chắt / Cháu Họ »',
          relationBtoA: '« Cụ / Ông / Bà Họ »',
          reason: `Người B cách Người A ${diff} thế hệ, thuộc hàng Trưởng Thượng.`
        };
      }
    }
  };

  const kinshipResult = computeKinship();

  // Lunar Calendar Demo Data
  const getCanChiYear = (y: number) => {
    const can = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'][y % 10];
    const chi = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'][y % 12];
    return `${can} ${chi} (${y})`;
  };

  const sampleMemorials = [
    { title: 'Đại Lễ Giỗ Cụ Thủy Tổ', lunar: '15/01 (Rằm Tháng Giêng)', solar: `03/03/${calendarYear}`, branch: 'Toàn Thể Dòng Tộc', daysLeft: 12 },
    { title: 'Lễ Giỗ Cụ Bà Khởi Tổ', lunar: '08/03 (Mùng 8 Tháng 3)', solar: `24/04/${calendarYear}`, branch: 'Từ Đường Định Công', daysLeft: 45 },
    { title: 'Lễ Giỗ Cụ Trưởng Chi Đời 2', lunar: '20/07 (Hai Mươi Tháng 7)', solar: `31/08/${calendarYear}`, branch: 'Chi Cả', daysLeft: 160 },
    { title: 'Lễ Cúng Tế Thu Tế', lunar: '15/08 (Tết Trung Thu)', solar: `25/09/${calendarYear}`, branch: 'Hội Đồng Gia Tộc', daysLeft: 185 },
  ];

  // Pricing Plan Recommendation logic
  const getRecommendedPlan = (count: number) => {
    if (count <= 30) return 'FREE';
    if (count <= 300) return 'CLAN';
    return 'GREAT_CLAN';
  };

  const recommendedPlan = getRecommendedPlan(memberCount);

  const faqs = [
    {
      q: 'Dữ liệu gia phả của dòng họ có được bảo mật và lưu giữ vĩnh viễn không?',
      a: 'Hoàn toàn an toàn và vĩnh cửu. Nền tảng Gia Phả Gia Tộc áp dụng cơ chế Multi-tenancy phân lập 100% giữa các dòng họ, mã hóa thông tin định danh cá nhân (PII) theo chuẩn Web Crypto AES-GCM 256-bit cấp ngân hàng. Kể cả khi hết hạn gói cước, dữ liệu của dòng họ vẫn được bảo toàn nguyên vẹn ở chế độ lưu trữ vĩnh viễn.'
    },
    {
      q: 'Hệ thống tính vai vế xưng hô « Bé bằng củ khoai, cứ vai mà gọi » hoạt động thế nào?',
      a: 'Hệ thống phân tích cấu trúc cây phả hệ tìm Tổ tiên chung gần nhất và đối chiếu thứ tự cành nhánh. Con của người anh (chi trưởng / con bác) được xếp vào Vế Trên so với con của người em (chi thứ / con chú), bất kể tuổi đời thực tế ngoài đời, đảm bảo chuẩn mực thuần phong mỹ tục Việt Nam.'
    },
    {
      q: 'Lịch giỗ có tính chính xác tháng nhuận và năm thiếu 29 ngày không?',
      a: 'Chính xác 100% theo thiên văn học Việt Nam (Múi giờ UTC+7 Hồ Ngọc Đức). Hệ thống tự động chuyển đổi âm dương 2 chiều trọn vẹn 16 năm (2021 - 2036), nhận diện chính xác các năm nhuận (như năm 2025 nhuận tháng 6, năm 2028 nhuận tháng 5) và các tháng Chạp thiếu chỉ có 29 ngày để nhắc lễ cúng giỗ đúng ngày.'
    },
    {
      q: 'Các cụ cao tuổi hoặc con cháu ở xa có xem được gia phả trên điện thoại không?',
      a: 'Giao diện được thiết kế chuẩn Responsive tối ưu cho mọi thiết bị di động, cỡ chữ to rõ ràng, hỗ trợ cả giao diện Sáng và Tối (Dark Mode) dịu mắt, có chế độ tra cứu nhanh và cây phả hệ trực quan giúp con cháu ở xa hay trong nước đều dễ dàng tìm về cội nguồn.'
    },
    {
      q: 'Làm thế nào để in cuốn gia phả hoặc sơ đồ cây khổ lớn cho nhà thờ họ?',
      a: 'Bạn có thể xuất file PDF sơ đồ cây gia phả khổ lớn (A0, A1, A2) hoặc trích xuất toàn bộ niên giám ngày giỗ, tiểu sử các đời ra file bản thảo chuẩn để chuyển trực tiếp cho xưởng in phục vụ đại lễ khánh thành nhà thờ họ.'
    }
  ];

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.clanName || !consultForm.phone) return;
    setConsultSuccess(true);
  };

  return (
    <div className="min-h-screen bg-heritage-bg dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-[#166534] selection:text-white">
      {/* Top Banner with Classical Motto */}
      <div className="bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] text-amber-200 text-xs py-2.5 px-4 text-center font-medium border-b border-amber-400/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
        <span className="font-serif italic tracking-wide">
          « Cây có gốc mới nở ngành xanh ngọn, Nước có nguồn mới biển rộng sông sâu »
        </span>
        <span className="hidden md:inline text-amber-400/60">•</span>
        <span className="hidden md:inline text-white/90">Trải Nghiệm Đầy Đủ 30 Ngày Không Ràng Buộc</span>
        <Link to="/register" className="underline font-bold text-amber-300 hover:text-white ml-1">Đăng ký ngay →</Link>
      </div>

      {/* Glassmorphism Sticky Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#166534] dark:bg-emerald-700 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-900/20 border border-amber-400/30 group-hover:scale-105 transition-transform">
              GP
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white block font-serif">
                GIA PHẢ GIA TỘC
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#166534] dark:text-emerald-400 block -mt-1 font-sans">
                Heritage Ledger Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — Giản Lược Gọn Gàng */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700 dark:text-slate-200">
            <a href="#features" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Tính Năng Cốt Lõi</a>
            <a href="#interactive-tree" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Cây Phả Hệ Mẫu</a>
            <a href="#pricing" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Bảng Giá</a>
            <a href="#consult" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Tư Vấn Dòng Họ</a>
            <a href="#faq" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Hỏi Đáp</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              title={isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}
              className="p-2.5 rounded-xl text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {import.meta.env.DEV && (
              <Link
                to="/dev/test-login"
                className="hidden xl:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-all"
              >
                🛠️ Dev Panel
              </Link>
            )}

            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534] dark:hover:text-emerald-400 transition-colors"
            >
              Đăng Nhập
            </Link>

            <Link
              to="/register"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>Khởi Tạo Dòng Họ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu — Giản Lược Gọn Gàng */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-5 space-y-3 animate-fade-in shadow-xl">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Tính Năng Cốt Lõi
            </a>
            <a 
              href="#interactive-tree" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Cây Phả Hệ Mẫu
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Bảng Giá Gói Cước
            </a>
            <a 
              href="#consult" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Đăng Ký Tư Vấn
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Hỏi Đáp Thường Gặp
            </a>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link 
                to="/login"
                className="flex-1 py-2.5 text-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl"
              >
                Đăng Nhập
              </Link>
              <Link 
                to="/register"
                className="flex-1 py-2.5 text-center text-xs font-bold bg-[#166534] text-white rounded-xl"
              >
                Khởi Tạo Ngay
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section: Di Sản Cổ Điển Gặp SaaS Hiện Đại */}
      <section 
        className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-white via-[#F8F9F6] to-[#FAFBF9] dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
      >
        {/* Background Subtle Lineage Watermark & Radial Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[radial-gradient(#166534_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10 text-center">
          {/* Classical Imperial Seal & Heritage Tag */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-100/95 via-amber-50 to-amber-100/95 dark:from-amber-950/70 dark:via-slate-900 dark:to-amber-950/70 border-2 border-amber-500/70 dark:border-amber-600/70 shadow-lg shadow-amber-950/10 relative">
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-red-700 to-red-900 text-amber-200 flex items-center justify-center font-serif text-[10px] font-black border border-amber-300 shadow-xs rotate-3">
                ẤN
              </span>
              <span className="font-serif font-black text-amber-950 dark:text-amber-200 text-xs tracking-wider uppercase">
                Ẩm Thủy Tư Nguyên • Quốc Âm Ngọc Phả 2026
              </span>
              <span className="text-amber-500 text-xs">❖</span>
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 font-serif tracking-wide hidden sm:inline">
                Phụng Dựng Tiên Tổ — Bách Niên Hưng Long
              </span>
            </div>
          </div>

          {/* ĐÔI LIỄN CÂU ĐỐI SƠN SON THẾP VÀNG HOÀNG TRIỀU — NỔI BẬT TRANG NGHIÊM */}
          <div className="max-w-4xl mx-auto rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#2B0909] via-[#450A0A] to-[#2B0909] dark:from-slate-950 dark:via-red-950/90 dark:to-slate-950 border-2 border-amber-400/90 dark:border-amber-500/80 shadow-2xl shadow-red-950/30 relative overflow-hidden group">
            {/* 4 Góc Hồi Văn Thếp Vàng Cổ Điển */}
            <div className="absolute top-2 left-3 text-amber-300/40 text-xs font-serif select-none pointer-events-none">╔══</div>
            <div className="absolute top-2 right-3 text-amber-300/40 text-xs font-serif select-none pointer-events-none">══╗</div>
            <div className="absolute bottom-2 left-3 text-amber-300/40 text-xs font-serif select-none pointer-events-none">╚══</div>
            <div className="absolute bottom-2 right-3 text-amber-300/40 text-xs font-serif select-none pointer-events-none">══╝</div>

            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
              {/* Vế Đối Trái (5 Cols) */}
              <div className="md:col-span-5 text-center md:text-right space-y-1">
                <div className="text-base sm:text-xl lg:text-2xl font-serif font-black tracking-wide text-amber-200 drop-shadow-md">
                  « Tổ Tông Công Đức Thiên Niên Thịnh
                </div>
                <div className="text-[11px] sm:text-xs text-amber-300/80 font-serif italic">
                  Trăm đời phụng dưỡng • Cội nguồn bền lâu
                </div>
              </div>

              {/* Con Dấu Triện Hoàng Triều Trung Tâm (1 Col) */}
              <div className="md:col-span-1 flex flex-col items-center justify-center">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 text-red-950 flex items-center justify-center font-serif text-sm font-black shadow-lg border border-amber-200 rotate-45 transform group-hover:rotate-0 transition-transform duration-500">
                  <span className="-rotate-45 font-bold text-xs">ẤN</span>
                </div>
                <span className="text-[9px] font-serif font-bold text-amber-300 mt-2 uppercase tracking-widest hidden md:inline">
                  TỘC ƯỚC
                </span>
              </div>

              {/* Vế Đối Phải (5 Cols) */}
              <div className="md:col-span-5 text-center md:text-left space-y-1">
                <div className="text-base sm:text-xl lg:text-2xl font-serif font-black tracking-wide text-amber-200 drop-shadow-md">
                  Tử Hiếu Tôn Hiền Vạn Đại Vinh »
                </div>
                <div className="text-[11px] sm:text-xs text-amber-300/80 font-serif italic">
                  Muôn thuở rạng danh • Phúc ấm lưu truyền
                </div>
              </div>
            </div>
          </div>

          {/* 4 BỨC ĐẠI TỰ TÁCH RỜI RIÊNG BIỆT — KHÍ CHẤT GIA PHẢ HOÀNG GIA */}
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest font-serif">
                ✦ TỨ ĐẠI TÔN KÍNH PHỤNG SỰ GIA TỘC ✦
              </span>
            </div>

            {/* 4 Khối Đại Tự Tách Rời (Grid 4 Thẻ Độc Lập) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Đại Tự 1: Gìn Vàng Giữ Ngọc */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-white via-amber-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border-2 border-amber-300/90 dark:border-amber-800/60 shadow-xl hover:shadow-2xl hover:scale-103 transition-all duration-300 relative overflow-hidden group">
                <div className="text-2xl mb-2">💎</div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-100 font-serif tracking-tight">
                  Gìn Vàng Giữ Ngọc
                </h2>
                <div className="text-xs text-[#166534] dark:text-emerald-400 font-serif italic mt-1">
                  Cội Nguồn Bách Niên
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Lưu giữ cội nguồn huyết thống, gia phong và ngọc phả muôn đời rạng rỡ.
                </p>
              </div>

              {/* Đại Tự 2: Nối Dòng Tiên Tổ */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-white via-amber-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border-2 border-amber-300/90 dark:border-amber-800/60 shadow-xl hover:shadow-2xl hover:scale-103 transition-all duration-300 relative overflow-hidden group">
                <div className="text-2xl mb-2">🌿</div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-100 font-serif tracking-tight">
                  Nối Dòng Tiên Tổ
                </h2>
                <div className="text-xs text-amber-800 dark:text-amber-400 font-serif italic mt-1">
                  Truyền Thừa Ngàn Thu
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Gắn kết huyết mạch con cháu từ đường, truyền lửa gia phong bất diệt.
                </p>
              </div>

              {/* Đại Tự 3: Ngọc Phả Di Sản */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-white via-amber-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border-2 border-amber-300/90 dark:border-amber-800/60 shadow-xl hover:shadow-2xl hover:scale-103 transition-all duration-300 relative overflow-hidden group">
                <div className="text-2xl mb-2">📜</div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-100 font-serif tracking-tight">
                  Ngọc Phả Di Sản
                </h2>
                <div className="text-xs text-teal-800 dark:text-teal-400 font-serif italic mt-1">
                  Tộc Ước Phân Minh
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Số hóa gia phả đa chi phái, phân vai xưng hô chuẩn mực tục ước cổ truyền.
                </p>
              </div>

              {/* Đại Tự 4: Quản Trị Gia Tộc */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-white via-amber-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border-2 border-amber-300/90 dark:border-amber-800/60 shadow-xl hover:shadow-2xl hover:scale-103 transition-all duration-300 relative overflow-hidden group">
                <div className="text-2xl mb-2">🏛️</div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-100 font-serif tracking-tight">
                  Quản Trị Gia Tộc
                </h2>
                <div className="text-xs text-amber-800 dark:text-amber-400 font-serif italic mt-1">
                  Vạn Đại Hưng Long
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Minh bạch sổ quỹ từ đường 100%, lịch giỗ thiên văn và gắn kết tông môn.
                </p>
              </div>
            </div>

            {/* Subtitle — Lời Tựa Phụng Dựng */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-serif pt-2">
              Nền tảng số hóa ngọc phả đa chi phái, chuẩn hóa phân vai xưng hô theo tục ước cổ truyền <span className="font-bold text-[#166534] dark:text-emerald-400">« Bé bằng củ khoai, cứ vai mà gọi »</span>, phụng định lịch giỗ thiên văn vạn niên và minh bạch 100% sổ quỹ từ đường dòng họ.
            </p>
          </div>

          {/* Main Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#166534] hover:bg-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              <span>Khởi Tạo Dòng Họ Miễn Phí (30 Ngày)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowSampleTreeModal(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border-2 border-amber-300/80 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trees className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
              <span>Xem Cây Gia Phả Mẫu Toàn Bộ</span>
            </button>
          </div>

          {/* 4 INTERACTIVE HERITAGE PILLARS (BENTO SHOWCASE: CỔ ĐIỂN GẶP HIỆN ĐẠI) */}
          <div className="pt-6">
            <div className="text-center mb-6 space-y-1">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-serif">
                ❖ 4 Trụ Cột Ngọc Phả & Di Sản Gia Tộc ❖
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-serif">
                Kết Tinh Đạo Hiếu Ngàn Năm • Vận Hành Chuẩn Mực 2026
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Pillar 1: Gìn Vàng Giữ Ngọc • Cội Nguồn Tiên Tổ */}
              <div 
                onClick={() => {
                  const el = document.getElementById('interactive-tree');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-5 rounded-3xl bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-slate-900/80 border-2 border-amber-300/80 dark:border-amber-900/40 shadow-lg hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                    🌳
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-serif">
                    Trụ Cột I
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white font-serif text-sm group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition-colors">
                  Gìn Vàng Giữ Ngọc
                </h3>
                <div className="text-[11px] font-serif italic text-amber-800 dark:text-amber-400 mb-2">
                  Cội Nguồn & Phả Hệ Đa Chi
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  Cây phả hệ đại thụ LTree đa tầng mở rộng vô cực, minh định chi trưởng, chi thứ, lưu giữ cội nguồn ngàn năm không thất lạc.
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-[#166534] dark:text-emerald-400 font-serif">
                  <span>Trải nghiệm Cây Mini</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Pillar 2: Nối Dòng Tiên Tổ • Ngọc Phả Hoàng Triều */}
              <div 
                onClick={() => {
                  const el = document.getElementById('kinship-tool');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-5 rounded-3xl bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-slate-900/80 border-2 border-amber-300/80 dark:border-amber-900/40 shadow-lg hover:shadow-2xl hover:border-amber-500 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                    📜
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-serif">
                    Trụ Cột II
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white font-serif text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Nối Dòng Tiên Tổ
                </h3>
                <div className="text-[11px] font-serif italic text-amber-800 dark:text-amber-400 mb-2">
                  Tộc Ước & Phân Vai Xưng Hô
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  Tự động tra cứu danh xưng chuẩn mực lễ tục: « Bé bằng củ khoai, cứ vai mà gọi », phân rõ con Bác vế trên, con Chú vế dưới.
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 font-serif">
                  <span>Tra cứu vai vế tức thì</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Pillar 3: Ẩm Thủy Tư Nguyên • Lịch Giỗ Thiên Văn */}
              <div 
                onClick={() => {
                  const el = document.getElementById('calendar-demo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-5 rounded-3xl bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-slate-900/80 border-2 border-amber-300/80 dark:border-amber-900/40 shadow-lg hover:shadow-2xl hover:border-teal-500 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                    🏮
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-serif">
                    Trụ Cột III
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white font-serif text-sm group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  Ẩm Thủy Tư Nguyên
                </h3>
                <div className="text-[11px] font-serif italic text-teal-800 dark:text-teal-400 mb-2">
                  Lịch Giỗ Thiên Văn 16 Năm
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  Lịch vạn niên chuẩn thiên văn (2021 — 2036), nhận diện năm nhuận, tháng Chạp thiếu và tự động gửi thông báo ngày giỗ tiên tổ.
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-teal-700 dark:text-teal-400 font-serif">
                  <span>Xem Lịch Âm Dương</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Pillar 4: Tổ Đức Vun Trồng • Bảng Vàng Công Đức */}
              <div 
                onClick={() => setShowQrModal(true)}
                className="p-5 rounded-3xl bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-slate-900/80 border-2 border-amber-300/80 dark:border-amber-900/40 shadow-lg hover:shadow-2xl hover:border-yellow-500 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                    🏆
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-serif">
                    Trụ Cột IV
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white font-serif text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Tổ Đức Vun Trồng
                </h3>
                <div className="text-[11px] font-serif italic text-amber-800 dark:text-amber-400 mb-2">
                  Bảng Vàng & Sổ Quỹ VietQR
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  Sổ quỹ kép bất biến minh bạch 100%, tự động sinh mã VietQR công đức tu bổ từ đường và khắc ghi tấm lòng phụng sự của con cháu.
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 font-serif">
                  <span>Tạo thử mã VietQR</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Showcase: Mini Tree Viewer with Zoom & Branch Filter */}
          <div id="interactive-tree" className="pt-4 max-w-5xl mx-auto text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-2xl p-5 sm:p-7 lg:p-8 space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 flex items-center justify-center font-bold text-sm font-serif">
                    ĐN
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-serif flex items-center gap-2">
                      <span>Đại Tộc Nguyễn Văn (Định Công, Hà Nội)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-300 font-sans font-bold">
                        5 Thế Hệ Mẫu
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Mã Tộc: NGUYEN-VAN-HN • 12 Vị Tiên Tổ & Hậu Duệ Tiêu Biểu (Đời 1 ➔ Đời 5)
                    </div>
                  </div>
                </div>

                {/* Toolbar Controls (Branch & Generation Filters + Zoom) */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Generation Filter Pills */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    <button
                      onClick={() => setGenerationFilter('ALL')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${generationFilter === 'ALL' ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
                    >
                      5 Đời
                    </button>
                    {[1, 2, 3, 4, 5].map((gen) => (
                      <button
                        key={gen}
                        onClick={() => setGenerationFilter(gen)}
                        className={`px-2 py-1 rounded-lg transition cursor-pointer ${generationFilter === gen ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
                      >
                        Đời {gen}
                      </button>
                    ))}
                  </div>

                  {/* Branch Filter Pills */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    <button
                      onClick={() => setTreeFilter('ALL')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${treeFilter === 'ALL' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Tất Cả Chi
                    </button>
                    <button
                      onClick={() => setTreeFilter('TRUONG')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${treeFilter === 'TRUONG' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Chi Trưởng
                    </button>
                    <button
                      onClick={() => setTreeFilter('THU')}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${treeFilter === 'THU' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Chi Thứ
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 gap-1">
                    <button 
                      onClick={() => setTreeZoom(Math.max(0.8, treeZoom - 0.1))} 
                      title="Thu nhỏ"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold px-1 text-slate-500">
                      {Math.round(treeZoom * 100)}%
                    </span>
                    <button 
                      onClick={() => setTreeZoom(Math.min(1.3, treeZoom + 0.1))} 
                      title="Phóng to"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Tree Nodes Matrix with Zoom Scale (Full 5 Generations) */}
              <div className="space-y-3 overflow-x-auto pb-2">
                <div 
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 transition-transform duration-200 origin-top-left"
                  style={{ transform: `scale(${treeZoom})` }}
                >
                  {filteredMembers.map((member) => {
                    const isSelected = selectedHeroMember.id === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => setSelectedHeroMember(member)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-50 via-amber-50/40 to-white dark:from-emerald-950/70 dark:via-slate-800 dark:to-slate-800 border-emerald-500 shadow-lg ring-2 ring-emerald-400/40 scale-102'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 hover:border-amber-400 dark:hover:border-emerald-500 hover:shadow-md'
                        }`}
                      >
                        {/* Generation Badge & Status Icon */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md font-serif ${
                            isSelected
                              ? 'bg-[#166534] text-white'
                              : member.generation === 1
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                : member.branchType === 'TRUONG'
                                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-800 dark:bg-slate-700 dark:text-amber-300'
                          }`}>
                            {member.relationText}
                          </span>

                          <span title={member.isAlive ? 'Còn sống' : 'Đã khuất (Hương khói phụng thờ)'} className="text-xs">
                            {member.isAlive ? '🟢' : '🕯️'}
                          </span>
                        </div>

                        {/* Member Full Name */}
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate font-serif group-hover:text-[#166534] dark:group-hover:text-emerald-400 transition-colors">
                          {member.name}
                        </div>

                        {/* Title & Branch Subtitle */}
                        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate">{member.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                            member.branchType === 'TRUONG' 
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                              : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
                          }`}>
                            {member.branchType === 'TRUONG' ? 'Trưởng' : 'Thứ'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Member Detail Box (Live 360° Profile Popup) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-emerald-50/40 to-white dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-2 border-amber-300/80 dark:border-slate-700 shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 dark:border-slate-700 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-serif">
                        {selectedHeroMember.name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#166534] text-white font-sans font-bold">
                        Đời Thứ {selectedHeroMember.generation}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-bold ${
                        selectedHeroMember.branchType === 'TRUONG'
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                      }`}>
                        {selectedHeroMember.branch}
                      </span>
                    </div>

                    <div className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                      📅 Năm Sinh/Tử: <span className="font-semibold">{selectedHeroMember.birthDeath}</span> • 📍 Vị Trí / Mộ Phần: <span className="font-semibold">{selectedHeroMember.burialSite}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSampleTreeModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Toàn Bộ Sơ Đồ Phả Hệ</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                  « {selectedHeroMember.desc} »
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Live Metrics Strip */}
      <section className="py-9 bg-[#162D4A] dark:bg-slate-900 text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 border-r border-white/10 last:border-none">
              <div className="text-2xl sm:text-4xl font-black text-amber-300 font-serif">1.250+</div>
              <div className="text-xs text-slate-300">Dòng họ phụng dựng tin dùng</div>
            </div>
            <div className="space-y-1 border-r border-white/10 last:border-none">
              <div className="text-2xl sm:text-4xl font-black text-emerald-300 font-serif">95.000+</div>
              <div className="text-xs text-slate-300">Thành viên dòng tộc được số hóa</div>
            </div>
            <div className="space-y-1 border-r border-white/10 last:border-none">
              <div className="text-2xl sm:text-4xl font-black text-amber-300 font-serif">100%</div>
              <div className="text-xs text-slate-300">Mã hóa PII AES-256 vĩnh cửu</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-emerald-300 font-serif">2021-2036</div>
              <div className="text-xs text-slate-300">Lịch giỗ thiên văn vạn niên</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid 6 Core Pillars */}
      <section id="features" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black tracking-widest text-[#166534] dark:text-emerald-400 uppercase font-sans">
              Hệ Thống Phụng Dựng Toàn Diện
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif">
              6 Trụ Cột Đột Phá Của Gia Tộc Số
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Được thiết kế chuyên sâu theo phong tục tập quán, nghi lễ tế tự và truyền thống gia phả Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Cây Phả Hệ LTree (Large Column) */}
            <div className="p-7 rounded-3xl bg-heritage-surface dark:bg-slate-900 border border-heritage-border dark:border-slate-800 shadow-card hover:shadow-heritage hover:border-emerald-500 transition-all space-y-4 group md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-[#166534] dark:text-emerald-400 shadow-xs group-hover:scale-110 transition-transform">
                  <Trees className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-[#166534] dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
                  LTree Infinite Hierarchy
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                1. Cây Phả Hệ Đa Chi Phái — Thu Phóng Trực Quan & Xuất Bản Khổ Lớn
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Biên soạn và hiển thị cây gia phả không giới hạn số đời. Phân tách rõ ràng Chi Trưởng, Chi Thứ, Nhánh, Cành. Tích hợp tính năng xuất file sơ đồ PDF độ phân giải cao A0, A1, A2 phục vụ in ấn khánh thành nhà thờ họ.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#166534] dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <button onClick={() => setShowSampleTreeModal(true)} className="flex items-center gap-1.5 cursor-pointer">
                  <span>Trải nghiệm canvas cây gia phả mẫu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bento 2: AI Tra Cứu Vai Vế */}
            <div className="p-7 rounded-3xl bg-heritage-surface dark:bg-slate-900 border border-heritage-border dark:border-slate-800 shadow-card hover:shadow-heritage hover:border-amber-500 transition-all space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-400 shadow-xs group-hover:scale-110 transition-transform">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                  Tộc Ước Cổ Truyền
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                2. Tra Cứu Danh Xưng & Vai Vế
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tự động tính toán xưng hô chuẩn mực theo tục lệ « Bé bằng củ khoai, cứ vai mà gọi », con Bác luôn là anh/chị vế trên so với con Chú.
              </p>
            </div>

            {/* Bento 3: Lịch Vạn Niên 2021-2036 */}
            <div className="p-7 rounded-3xl bg-heritage-surface dark:bg-slate-900 border border-heritage-border dark:border-slate-800 shadow-card hover:shadow-heritage hover:border-teal-500 transition-all space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-teal-800 dark:text-teal-400 shadow-xs group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800">
                  Thiên Văn UTC+7
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                3. Lịch Gia Tộc & Giỗ Vạn Niên (16 Năm)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tính toán chính xác lịch âm dương thiên văn (2021-2036), nhận diện năm nhuận và tháng Chạp thiếu 29 ngày. Tự động đồng bộ ngày giỗ từ cây phả hệ.
              </p>
            </div>

            {/* Bento 4: Sổ Quỹ Kép & Reversal */}
            <div className="p-7 rounded-3xl bg-heritage-surface dark:bg-slate-900 border border-heritage-border dark:border-slate-800 shadow-card hover:shadow-heritage hover:border-blue-500 transition-all space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-800 dark:text-blue-400 shadow-xs group-hover:scale-110 transition-transform">
                  <Landmark className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                  Immutable Ledger
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                4. Sổ Quỹ Kép Bất Biến 100%
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Quản lý độc lập Quỹ Hoạt Động, Quỹ Khuyến Học, Quỹ Tu Bổ Từ Đường. Bút toán hoàn trả Reversal kép bảo đảm không bao giờ thất thoát tài chính.
              </p>
            </div>

            {/* Bento 5: Bảng Vàng VietQR & Thông Báo Đẩy */}
            <div className="p-7 rounded-3xl bg-heritage-surface dark:bg-slate-900 border border-heritage-border dark:border-slate-800 shadow-card hover:shadow-heritage hover:border-amber-600 transition-all space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-900 dark:text-amber-400 shadow-xs group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                  VietQR Automation
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                5. Bảng Vàng Công Đức VietQR
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tạo mã QR công đức động ghi nhận tấm lòng con cháu tức thì. Tự động cập nhật bảng vàng vinh danh công khai minh bạch.
              </p>
              <button 
                onClick={() => setShowQrModal(true)}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Thử nghiệm tạo mã QR công đức</span>
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Kinship Reasoning Tool Widget */}
      <section id="kinship-tool" className="py-20 bg-[#F7F8F5] dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">
              Công Cụ Trải Nghiệm Tương Tác
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">
              Thử Nghiệm Tra Cứu Vai Vế Xưng Hô
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Xem cách hệ thống tự động giải quyết các tình huống xưng hô phức tạp theo truyền thống gia lễ Việt Nam:
            </p>
          </div>

          {/* Interactive Calculation Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Person A Selector */}
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900 dark:text-amber-300 uppercase">Người Thứ Nhất (A)</span>
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-slate-500">Đời:</label>
                    <select
                      value={genA}
                      onChange={(e) => setGenA(Number(e.target.value))}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-amber-300 rounded font-bold text-xs text-amber-900 dark:text-amber-300"
                    >
                      <option value={2}>Đời 2</option>
                      <option value={3}>Đời 3</option>
                      <option value={4}>Đời 4</option>
                      <option value={5}>Đời 5</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Thuộc Cành:</label>
                      <select
                        value={branchA}
                        onChange={(e) => setBranchA(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-xs"
                      >
                        <option value="TRUONG">Con Bác (Chi Trưởng)</option>
                        <option value="THU">Con Chú (Chi Thứ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Tuổi đời thực:</label>
                      <input
                        type="number"
                        value={ageA}
                        onChange={(e) => setAgeA(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Person B Selector */}
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase">Người Thứ Hai (B)</span>
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-slate-500">Đời:</label>
                    <select
                      value={genB}
                      onChange={(e) => setGenB(Number(e.target.value))}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-blue-300 rounded font-bold text-xs text-blue-900 dark:text-blue-300"
                    >
                      <option value={2}>Đời 2</option>
                      <option value={3}>Đời 3</option>
                      <option value={4}>Đời 4</option>
                      <option value={5}>Đời 5</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Thuộc Cành:</label>
                      <select
                        value={branchB}
                        onChange={(e) => setBranchB(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-xs"
                      >
                        <option value="THU">Con Chú (Chi Thứ)</option>
                        <option value="TRUONG">Con Bác (Chi Trưởng)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Tuổi đời thực:</label>
                      <input
                        type="number"
                        value={ageB}
                        onChange={(e) => setAgeB(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Result Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-slate-800 dark:to-amber-950/40 border border-emerald-300 dark:border-emerald-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#166534] dark:text-emerald-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  Kết Luận Phân Vai Danh Xưng Theo Tục Ước:
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100">
                  Chuẩn Tục Lệ Gia Phong Việt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Người A ({ageA} tuổi, Đời {genA}) xưng là:</div>
                  <div className="text-base font-black text-[#166534] dark:text-emerald-400 font-serif">
                    {kinshipResult.relationAtoB}
                  </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Người B ({ageB} tuổi, Đời {genB}) xưng là:</div>
                  <div className="text-base font-black text-amber-800 dark:text-amber-400 font-serif">
                    {kinshipResult.relationBtoA}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 italic text-center pt-1">
                * {kinshipResult.reason}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Lunar Calendar 2021-2036 Demo Section */}
      <section id="calendar-demo" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">
              Thiên Văn Học Âm Dương
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">
              Lịch Giỗ Vạn Niên (2021 — 2036)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Tra cứu nhanh ngày giỗ tiên tổ, nhận diện chuẩn xác tháng nhuận và tháng Chạp thiếu 29 ngày theo Lịch Thiên văn Việt Nam UTC+7:
            </p>
          </div>

          <div className="bg-heritage-surface dark:bg-slate-900 rounded-3xl border border-heritage-border dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
            {/* Year Selector Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn Năm Vạn Niên:</span>
                <select
                  value={calendarYear}
                  onChange={(e) => setCalendarYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-[#166534] dark:text-emerald-400 font-serif"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036].map(y => (
                    <option key={y} value={y}>Năm {getCanChiYear(y)}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                {calendarYear === 2025 ? '⚠️ Năm 2025 có Nhuận Tháng 6 Âm Lịch' :
                 calendarYear === 2028 ? '⚠️ Năm 2028 có Nhuận Tháng 5 Âm Lịch' :
                 calendarYear === 2031 ? '⚠️ Năm 2031 có Nhuận Tháng 3 Âm Lịch' :
                 '✓ Năm thường — 12 Tháng Âm Lịch'}
              </div>
            </div>

            {/* Sample Memorials List in Selected Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleMemorials.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 hover:border-emerald-400 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-serif">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold">
                      Còn {item.daysLeft} ngày
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-[#166534] dark:text-emerald-400 font-bold">Âm: {item.lunar}</div>
                    <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Dương: {item.solar}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Phụ trách: {item.branch}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Simple Onboarding Steps */}
      <section className="py-20 bg-[#F7F8F5] dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">Quy Trình Khởi Tạo</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">4 Bước Số Hóa Dòng Họ</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Chỉ mất 5 phút để thiết lập không gian phụng dựng gia tộc trực tuyến</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-heritage-surface dark:bg-slate-900 p-6 rounded-2xl border border-heritage-border dark:border-slate-800 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] dark:bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-sm font-serif">1</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-serif">Đăng Ký & Khởi Tạo</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Nhập tên gia tộc, quê quán gốc tích và chỉ định Cụ Thủy Tổ khai sáng.</p>
            </div>

            <div className="bg-heritage-surface dark:bg-slate-900 p-6 rounded-2xl border border-heritage-border dark:border-slate-800 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] dark:bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-sm font-serif">2</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-serif">Nhập Danh Sách Thành Viên</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Nhập trực quan trên cây hoặc import tự động 4 bước từ file Excel có sẵn.</p>
            </div>

            <div className="bg-heritage-surface dark:bg-slate-900 p-6 rounded-2xl border border-heritage-border dark:border-slate-800 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] dark:bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-sm font-serif">3</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-serif">Kích Hoạt Lịch & Sổ Quỹ</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Hệ thống tự động đồng bộ ngày giỗ âm dương và thiết lập các quỹ phụng tự.</p>
            </div>

            <div className="bg-heritage-surface dark:bg-slate-900 p-6 rounded-2xl border border-heritage-border dark:border-slate-800 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] dark:bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-sm font-serif">4</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm font-serif">Gắn Kết Con Cháu</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Gửi liên kết cho bà con họ tộc để cùng tra cứu phả hệ, xưng hô và đóng góp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Matrix with Member Slider */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">Gói Cước Phụng Dựng</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif">Bảng Giá Dịch Vụ Minh Bạch</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Lựa chọn gói cước phù hợp với quy mô thành viên của dòng họ bạn</p>

            {/* Member Slider Tool */}
            <div className="pt-6 max-w-md mx-auto space-y-2 text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Ước tính quy mô họ tộc:</span>
                <span className="text-[#166534] dark:text-emerald-400 font-serif">{memberCount} thành viên</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={memberCount}
                onChange={(e) => setMemberCount(Number(e.target.value))}
                className="w-full accent-[#166534] cursor-pointer"
              />
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                {recommendedPlan === 'FREE' ? '👉 Phù hợp: Gói Khởi Lập (Miễn phí)' :
                 recommendedPlan === 'CLAN' ? '👉 Phù hợp: Gói Gia Tộc Chuẩn Mực (990.000đ/năm)' :
                 '👉 Phù hợp: Gói Đại Gia Tộc (2.490.000đ/năm)'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Plan 1: Khởi Lập */}
            <div className={`p-6 rounded-3xl border transition-all space-y-6 flex flex-col justify-between ${
              recommendedPlan === 'FREE' 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-2 ring-emerald-400/20' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}>
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Gói Khởi Lập</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-serif">Miễn Phí</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dành cho gia đình hoặc dòng họ trải nghiệm số hóa ban đầu.</p>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Tối đa <strong>30 thành viên</strong></span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Cây phả hệ 3 đời cơ bản</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Lịch giỗ tự động</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Dùng thử đầy đủ 30 ngày</span></div>
                </div>
              </div>
              <Link to="/register" className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-center block transition">
                Bắt Đầu Miễn Phí
              </Link>
            </div>

            {/* Plan 2: Gia Tộc (Popular & Featured) */}
            <div className={`p-6 rounded-3xl bg-gradient-to-b from-[#14532D] via-[#166534] to-[#0F3D21] text-white shadow-2xl border-2 space-y-6 flex flex-col justify-between relative transform lg:-translate-y-2 ${
              recommendedPlan === 'CLAN' ? 'border-amber-300 ring-4 ring-amber-400/30' : 'border-amber-400'
            }`}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                Được Lựa Chọn Nhiều Nhất
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold text-amber-200 uppercase">Gói Gia Tộc Chuẩn Mực</div>
                <div className="text-3xl font-black text-white font-serif">990.000đ <span className="text-xs font-normal text-emerald-200">/ năm</span></div>
                <p className="text-xs text-emerald-100">Dành cho dòng họ vừa và lớn, đầy đủ các phân hệ quản trị.</p>
                <div className="border-t border-white/20 pt-4 space-y-2.5 text-xs text-emerald-50">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-300" /> <span>Hạn mức <strong>300 thành viên</strong></span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-300" /> <span>Cây gia phả đa chi phái (LTree)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-300" /> <span>Tra cứu danh xưng vai vế tự động</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-300" /> <span>Sổ quỹ kép & Bảng vàng VietQR</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-300" /> <span>Xuất file PDF sơ đồ in A0/A1</span></div>
                </div>
              </div>
              <Link to="/register" className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black rounded-xl text-center block transition shadow-lg">
                Khởi Tạo Gói Gia Tộc
              </Link>
            </div>

            {/* Plan 3: Đại Tộc */}
            <div className={`p-6 rounded-3xl border transition-all space-y-6 flex flex-col justify-between ${
              recommendedPlan === 'GREAT_CLAN'
                ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}>
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Gói Đại Gia Tộc</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-serif">2.490.000đ <span className="text-xs font-normal text-slate-500">/ năm</span></div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dành cho đại gia tộc lớn, đa chi phái trên toàn quốc.</p>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Hạn mức <strong>1.000+ thành viên (Không giới hạn)</strong></span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Toàn bộ tính năng cao cấp nhất</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Phân quyền chi phái đa cấp độ</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534] dark:text-emerald-400" /> <span>Hỗ trợ kỹ thuật 24/7 chuyên biệt</span></div>
                </div>
              </div>
              <Link to="/register" className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-center block transition">
                Khởi Tạo Gói Đại Tộc
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free Clan Consultation Form Section */}
      <section id="consult" className="py-20 bg-[#F7F8F5] dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">Đồng Hành Cùng Trưởng Tộc</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">Đăng Ký Tư Vấn Số Hóa Gia Tộc Miễn Phí</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đội ngũ chuyên gia gia phả học của chúng tôi sẽ liên hệ hỗ trợ nhập liệu, chuẩn hóa cây phả hệ và số hóa tộc ước cho dòng họ bạn.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            {consultSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-[#166534] dark:text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Đã Gửi Yêu Cầu Tư Vấn Thành Công!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Chuyên viên hỗ trợ của Gia Phả Gia Tộc sẽ liên hệ với bác/anh qua số điện thoại <strong>{consultForm.phone}</strong> trong vòng 24 giờ làm việc.
                </p>
                <button
                  onClick={() => setConsultSuccess(false)}
                  className="mt-4 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Dòng Họ / Gia Tộc *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Đại Tộc Nguyễn Văn (Định Công)"
                      value={consultForm.clanName}
                      onChange={(e) => setConsultForm({ ...consultForm, clanName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Người Đại Diện / Trưởng Tộc *</label>
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên của bác/anh"
                      value={consultForm.contactName}
                      onChange={(e) => setConsultForm({ ...consultForm, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại Liên Hệ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={consultForm.phone}
                      onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tỉnh / Thành Quê Quán</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hà Nội, Nam Định, Thanh Hóa..."
                      value={consultForm.province}
                      onChange={(e) => setConsultForm({ ...consultForm, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#166534] hover:bg-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi Yêu Cầu Tư Vấn Ngay</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials from Clan Elders */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">Niềm Tin Dòng Họ</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">Trưởng Tộc & Hội Đồng Chia Sẻ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-heritage-bg dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed font-serif">
                « Nhờ có Gia Phả Gia Tộc, đợt khánh thành từ đường vừa qua chúng tôi đã xuất được file in sơ đồ cây phả hệ khổ A0 cực kỳ trang trọng. Con cháu xa gần nhìn vào đều biết rõ nguồn gốc cội nguồn. »
              </p>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Cụ Nguyễn Văn Thuận (76 tuổi)</div>
                <div className="text-[11px] text-[#166534] dark:text-emerald-400">Trưởng Tộc họ Nguyễn Văn — Nam Định</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-heritage-bg dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed font-serif">
                « Tính năng tra cứu vai vế thật sự tuyệt vời. Nhiều cháu thanh niên thế hệ sau gặp các bác trong họ cứ lúng túng xưng hô, nay chỉ cần mở app là biết ngay phải chào Bác hay chào Anh theo đúng gia lễ. »
              </p>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Ông Trần Đức Toàn</div>
                <div className="text-[11px] text-[#166534] dark:text-emerald-400">Hội Đồng Quản Trị họ Trần — Hải Dương</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-heritage-bg dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed font-serif">
                « Sổ quỹ minh bạch và bảng vàng đóng góp qua QR giúp dòng họ chúng tôi vận động quỹ khuyến học và quỹ tu bổ từ đường rất thuận lợi. Mọi khoản thu chi đều công khai 100%. »
              </p>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Bà Lê Thị Mai Lan</div>
                <div className="text-[11px] text-[#166534] dark:text-emerald-400">Thủ Quỹ họ Lê — Thanh Hóa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#F7F8F5] dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400">Giải Đáp Thắc Mắc</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">Câu Hỏi Thường Gặp</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-[#166534] dark:hover:text-emerald-400 transition cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90 text-[#166534] dark:text-emerald-400' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-20 bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-200 text-xs font-bold font-serif">
            <ScrollText className="w-3.5 h-3.5" />
            <span>Kế Thừa Muôn Đời — Vạn Đại Hưng Long</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-serif text-white">
            Bắt Đầu Lưu Truyền Di Sản Gia Tộc Hôm Nay
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Hãy cùng hàng nghìn dòng họ Việt Nam số hóa gia phả, kết nối con cháu và phụng dựng cội nguồn tiên tổ vững bền qua các thế hệ.
          </p>
          <div className="pt-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm rounded-2xl shadow-2xl hover:scale-105 transition-all"
            >
              <span>Khởi Tạo Dòng Họ Miễn Phí (30 Ngày)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Classical Heritage Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#166534] dark:bg-emerald-700 text-white font-black flex items-center justify-center text-xs shadow-xs font-serif">
                  GP
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm font-serif">GIA PHẢ GIA TỘC</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Nền tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái số 1 Việt Nam. Phụng dựng cội nguồn, kết nối muôn đời.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Phân Hệ Cốt Lõi</div>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#features" className="hover:text-[#166534] dark:hover:text-emerald-400">Cây Phả Hệ Đa Chi (LTree)</a></li>
                <li><a href="#kinship-tool" className="hover:text-[#166534] dark:hover:text-emerald-400">Tra Cứu Vai Vế Xưng Hô</a></li>
                <li><a href="#calendar-demo" className="hover:text-[#166534] dark:hover:text-emerald-400">Lịch Giỗ Thiên Văn 2021-2036</a></li>
                <li><a href="#features" className="hover:text-[#166534] dark:hover:text-emerald-400">Sổ Quỹ Kép Bất Biến</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Hỗ Trợ & Dịch Vụ</div>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/support" className="hover:text-[#166534] dark:hover:text-emerald-400">Trung Tâm Trợ Giúp</Link></li>
                <li><a href="#pricing" className="hover:text-[#166534] dark:hover:text-emerald-400">Biểu Phí Gói Cước</a></li>
                <li><Link to="/login" className="hover:text-[#166534] dark:hover:text-emerald-400">Đăng Nhập Quản Trị</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">An Toàn & Bảo Mật</div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Mọi thông tin gia tộc được bảo mật tuyệt đối với tiêu chuẩn Web Crypto AES-GCM 256-bit và cách ly đa gia tộc RLS.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Gia Phả Gia Tộc (Heritage Ledger Platform). Bản quyền được bảo hộ.
            </div>
            <div className="flex items-center gap-4">
              <span>Chính Sách Bảo Mật PII</span>
              <span>Điều Khoản Tộc Quy Số</span>
            </div>
          </div>
        </div>
      </footer>

      {/* SAMPLE GENEALOGY TREE FULLSCREEN MODAL */}
      {showSampleTreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-[#166534] to-[#0F3D21] text-white">
              <div className="flex items-center gap-3">
                <Trees className="w-6 h-6 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-serif">Sơ Đồ Phả Tộc Mẫu — Đại Tộc Nguyễn Văn</h3>
                  <p className="text-[11px] text-emerald-200">Bản đồ cấu trúc 4 thế hệ đa chi phái (LTree Canvas Demo)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSampleTreeModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Generation 1 */}
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-full font-bold text-xs uppercase">
                  Đời 1 • Khai Sáng Thủy Tổ
                </span>
                <div className="max-w-xs mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-400 shadow-md">
                  <div className="font-bold text-sm text-slate-900 dark:text-white font-serif">Cụ Nguyễn Quý Công (1885 - 1962)</div>
                  <div className="text-xs text-amber-800 dark:text-amber-300">Thủy Tổ Khởi Nghiệp • Cụ Bà: Lê Thị Ngọc</div>
                </div>
              </div>

              {/* Vertical Branch Line */}
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700 mx-auto" />

              {/* Generation 2: 2 Branches */}
              <div className="space-y-2">
                <div className="text-center">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-[#166534] dark:text-emerald-300 rounded-full font-bold text-xs uppercase">
                    Đời 2 • Phân Định Chi Phái
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch 1 */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-[#166534] dark:text-emerald-400 uppercase font-serif">Chi Trưởng (Chi Cả)</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-serif">Cụ Nguyễn Văn An (1910 - 1991)</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Gìn giữ từ đường, truyền thừa chi trưởng.</p>
                    <div className="pt-2 text-[11px] text-slate-500">Đời 3: Nguyễn Văn Tuấn (Trưởng tộc), Nguyễn Văn Minh</div>
                  </div>

                  {/* Branch 2 */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800 border border-blue-300 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-blue-800 dark:text-blue-400 uppercase font-serif">Chi Thứ (Chi Hai)</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-serif">Cụ Nguyễn Văn Bình (1913 - 1995)</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Lập nghiệp phương Nam, mở rộng thanh danh.</p>
                    <div className="pt-2 text-[11px] text-slate-500">Đời 3: Nguyễn Văn Đức, Nguyễn Thị Hạnh</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
              <span className="text-xs text-slate-500">Đầy đủ tính năng: Zoom, Thêm nhánh, Xuất PDF A0/A1.</span>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold shadow-md hover:bg-[#14532D] transition"
              >
                Khởi Tạo Cây Cho Họ Bạn
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VIETQR DONATION DEMO MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold font-serif text-base">
                <QrCode className="w-5 h-5 text-[#166534] dark:text-emerald-400" />
                <span>Mã QR Đóng Góp Công Đức</span>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fund Selector */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">Chọn Quỹ Dòng Họ:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setQrFund('TU_BO')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition ${qrFund === 'TU_BO' ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-950 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                  Tu Bổ Từ Đường
                </button>
                <button
                  onClick={() => setQrFund('KHUYEN_HOC')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition ${qrFund === 'KHUYEN_HOC' ? 'bg-blue-100 dark:bg-blue-950 border-blue-500 text-blue-950 dark:text-blue-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                  Quỹ Khuyến Học
                </button>
                <button
                  onClick={() => setQrFund('HOAT_DONG')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition ${qrFund === 'HOAT_DONG' ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-950 dark:text-emerald-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                  Quỹ Hoạt Động
                </button>
              </div>
            </div>

            {/* Amount Presets */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">Mức Đóng Góp Công Đức:</label>
              <div className="grid grid-cols-3 gap-2">
                {[200000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setQrAmount(amt)}
                    className={`py-1.5 rounded-xl border font-bold text-xs ${qrAmount === amt ? 'bg-[#166534] text-white border-[#166534]' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'}`}
                  >
                    {amt.toLocaleString('vi-VN')}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Generated QR Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                <img
                  src={`https://api.vietqr.io/image/970422-0912345678-compact2.png?amount=${qrAmount}&addInfo=CONGDUC%20${qrFund}`}
                  alt="VietQR Demo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to QR icon if offline
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Số Tiền: <span className="text-[#166534] dark:text-emerald-400 font-serif text-sm">{qrAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Nội dung: CONGDUC NGUYEN-VAN-HN ({qrFund})
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[#166534] hover:bg-[#14532D] text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
