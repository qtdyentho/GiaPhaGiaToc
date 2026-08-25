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

  // 4 Thematic Ancestral Carousel Slides Data with REALISTIC PHOTOGRAPHIC SCENES
  const carouselSlides = [
    {
      id: 'slide-1',
      shortTab: '1. Nối Dòng Tiên Tổ',
      tag: '⚜️ Cội Nguồn Tiên Tổ • Bách Niên Hưng Long',
      titleLine1: 'Gìn Vàng Giữ Ngọc • Nối Dòng Tiên Tổ',
      titleLine2: 'Lưu Truyền Bách Đại — Hưng Thịnh Vĩnh Cửu',
      description: 'Lưu giữ cội nguồn huyết thống ngàn năm truyền thừa, trăm đời rạng danh. Số hóa cây phả hệ, gìn giữ gia quy và truyền lại cho muôn đời con cháu phụng dựng.',
      primaryCta: 'Khởi Tạo Dòng Họ (30 Ngày)',
      secondaryCta: 'Xem Cây Phả Hệ Mẫu',
      imageSrc: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Từ đường và Nhà thờ họ cổ kính Việt Nam',
      imageLocation: '📍 Từ Đường & Nhà Thờ Họ Cổ Truyền',
      imageCaption: 'Từ Đường Cổ Kính — Nơi phụng thờ tiên tổ muôn đời hưng thịnh'
    },
    {
      id: 'slide-2',
      shortTab: '2. Ngọc Phả Di Sản',
      tag: '📜 Chuẩn Mực Tộc Ước • Phân Chi Minh Bạch',
      titleLine1: 'Ngọc Phả Di Sản & Quản Trị Gia Tộc',
      titleLine2: 'Phân Vai Xưng Hô — Chuẩn Mực Gia Lễ',
      description: 'Công nghệ phân định cây LTree vô cực, tự động xác định danh xưng vai vế theo chuẩn mực gia phong « Bé bằng củ khoai, cứ vai mà gọi », con Bác luôn ở vế trên.',
      primaryCta: 'Thử Nghiệm Tra Cứu Vai Vế',
      secondaryCta: 'Xem Bản Đồ Chi Phái',
      imageSrc: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Bản thảo ngọc phả gia phả cổ giấy dó',
      imageLocation: '📜 Ngọc Phả & Bản Thảo Giấy Dó Cổ',
      imageCaption: 'Gia Phả Truyền Đời — Bút tích tiên tổ lưu dấu trăm năm'
    },
    {
      id: 'slide-3',
      shortTab: '3. Lịch Giỗ Thiên Văn',
      tag: '🏮 Thiên Văn UTC+7 • 16 Năm Vạn Niên',
      titleLine1: 'Ẩm Thủy Tư Nguyên • Lịch Giỗ Thiên Văn',
      titleLine2: 'Chu Toàn Lễ Tiết — Báo Giỗ Đúng Ngày',
      description: 'Phụng định lịch giỗ âm dương chính xác theo thiên văn học trọn vẹn 16 năm (2021 — 2036), nhận diện năm nhuận, tháng Chạp thiếu và gửi thông báo nhắc lễ chu đáo.',
      primaryCta: 'Xem Lịch Giỗ Vạn Niên',
      secondaryCta: 'Tra Cứu Ngày Âm Dương',
      imageSrc: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Khói hương trầm tế tự trong lễ giỗ họ tộc',
      imageLocation: '🏮 Hương Trầm Tế Tự & Ngày Đại Lễ',
      imageCaption: 'Lễ Giỗ Gia Tộc — Khói trầm quyện tỏa, con cháu sum vầy'
    },
    {
      id: 'slide-4',
      shortTab: '4. Bảng Vàng Công Đức',
      tag: '🏆 Bảng Vàng VietQR • Sổ Quỹ Bất Biến',
      titleLine1: 'Tổ Đức Vun Trồng • Bảng Vàng Công Đức',
      titleLine2: 'Sổ Quỹ Kép 100% — Tri Ân Tấm Lòng',
      description: 'Sổ quỹ kép bất biến minh bạch tuyệt đối, tự động sinh mã VietQR công đức theo từng quỹ từ đường, khuyến học, tu bổ và khắc ghi tấm lòng phụng sự của con cháu.',
      primaryCta: 'Trải Nghiệm Sổ Quỹ Mẫu',
      secondaryCta: 'Tạo Thử Mã VietQR',
      imageSrc: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Hoành phi câu đối sơn son thếp vàng',
      imageLocation: '🏆 Hoành Phi Câu Đối Thếp Vàng',
      imageCaption: 'Bảng Vàng Tri Ân — Ghi danh công đức con cháu phụng dựng'
    }
  ];

  // Carousel Active State & Auto-Play (5.5s timer)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (isCarouselPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isCarouselPaused, carouselSlides.length]);

  // Hero Tree Interactive States
  const [treeZoom, setTreeZoom] = useState(1);
  const [treeFilter, setTreeFilter] = useState<'ALL' | 'TRUONG' | 'THU'>('ALL');
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
  }>({
    id: 'hero-1',
    name: 'Cụ Thủy Tổ Nguyễn Quý Công (1885 - 1962)',
    generation: 1,
    branch: 'Khai Sáng Dòng Họ',
    branchType: 'TRUONG',
    title: 'Thủy Tổ Khởi Nghiệp',
    desc: 'Bậc tiền bối khai canh lập ấp tại vùng đất Định Công. Đức độ rạng ngời, để lại gia quy ngũ thường cho muôn đời con cháu phụng dựng.',
    birthDeath: 'Ất Dậu 1885 — Nhâm Dần 1962',
    relationText: 'Đời 1 • Khởi Tổ',
    burialSite: 'Khu Lăng Mộ Cổ, Định Công Thượng'
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

  const heroMembers = [
    {
      id: 'hero-1',
      name: 'Cụ Thủy Tổ Nguyễn Quý Công',
      generation: 1,
      branch: 'Khai Sáng Dòng Họ',
      branchType: 'TRUONG' as const,
      title: 'Thủy Tổ Khởi Nghiệp',
      desc: 'Bậc tiền bối khai canh lập ấp tại vùng đất Định Công. Đức độ rạng ngời, để lại gia quy ngũ thường cho muôn đời con cháu phụng dựng.',
      birthDeath: 'Ất Dậu 1885 — Nhâm Dần 1962',
      relationText: 'Đời 1 • Khởi Tổ',
      burialSite: 'Khu Lăng Mộ Cổ, Định Công Thượng'
    },
    {
      id: 'hero-2',
      name: 'Cụ Nguyễn Văn An (Trưởng Chi)',
      generation: 2,
      branch: 'Chi Cả (Trưởng)',
      branchType: 'TRUONG' as const,
      title: 'Trưởng Chi Đời 2',
      desc: 'Kế thừa từ đường, giữ gìn ngọc phả và lãnh đạo việc hương khói tế tự trong dòng tộc qua nhiều biến thiên thời cuộc.',
      birthDeath: 'Canh Tuất 1910 — Tân Mùi 1991',
      relationText: 'Đời 2 • Trưởng Chi',
      burialSite: 'Khu Nghĩa Trang Dòng Họ'
    },
    {
      id: 'hero-3',
      name: 'Cụ Nguyễn Văn Bình (Thứ Chi)',
      generation: 2,
      branch: 'Chi Hai (Thứ)',
      branchType: 'THU' as const,
      title: 'Thứ Chi Đời 2',
      desc: 'Đỗ đạt cử nhân, lập nghiệp tại phương Nam, kết nối mở rộng thanh danh dòng họ trên khắp các miền tổ quốc.',
      birthDeath: 'Quý Sửu 1913 — Ất Hợi 1995',
      relationText: 'Đời 2 • Thứ Chi',
      burialSite: 'Nghĩa Trang Thành Phố'
    },
    {
      id: 'hero-4',
      name: 'Ông Nguyễn Văn Tuấn (Trưởng Tộc)',
      generation: 3,
      branch: 'Chi Cả (Đời 3)',
      branchType: 'TRUONG' as const,
      title: 'Trưởng Tộc Đương Nhiệm',
      desc: 'Đang quản lý từ đường và chủ trì việc số hóa cây gia phả gia tộc kết nối toàn thể bà con họ tộc toàn quốc.',
      birthDeath: 'Kỷ Dậu 1969 (Còn sống)',
      relationText: 'Đời 3 • Đương Nhiệm',
      burialSite: 'Từ Đường Dòng Họ'
    }
  ];

  const filteredMembers = heroMembers.filter(m => {
    if (treeFilter === 'ALL') return true;
    return m.branchType === treeFilter;
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
      a: 'Hệ thống sử dụng thuật toán cây LTree tìm Tổ tiên chung gần nhất (LCA) và đối chiếu thứ tự cành nhánh. Con của người anh (chi trưởng / con bác) tự động được xếp vào Vế Trên so với con của người em (chi thứ / con chú), bất kể tuổi đời thực tế ngoài đời, đảm bảo chuẩn mực thuần phong mỹ tục Việt Nam.'
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">6 Trụ Cột</a>
            <a href="#interactive-tree" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Cây Phả Hệ Mini</a>
            <a href="#kinship-tool" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Tra Cứu Vai Vế</a>
            <a href="#calendar-demo" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Lịch Vạn Niên</a>
            <a href="#pricing" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Bảng Giá</a>
            <a href="#consult" className="hover:text-[#166534] dark:hover:text-emerald-400 transition-colors">Tư Vấn Miễn Phí</a>
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-5 space-y-3 animate-fade-in shadow-xl">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              6 Trụ Cột Đột Phá
            </a>
            <a 
              href="#interactive-tree" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Cây Phả Hệ Mini Live
            </a>
            <a 
              href="#kinship-tool" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Tra Cứu Vai Vế Xưng Hô
            </a>
            <a 
              href="#calendar-demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#166534]"
            >
              Lịch Vạn Niên 2021-2036
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
              Đăng Ký Tư Vấn Dòng Họ
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

      {/* Hero Section: Di Sản Cổ Điển Gặp SaaS Hiện Đại — Carousel 4 Slide */}
      <section 
        className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24 bg-gradient-to-b from-white via-[#F7F8F5] to-[#FBFBF9] dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        {/* Background Subtle Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 bg-[radial-gradient(#166534_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          {/* Classical Imperial Seal & Heritage Scroll Banner */}
          <div className="flex flex-col items-center justify-center space-y-2.5 text-center">
            {/* Ancient Seal Badge (Kim Bài / Dấu Ấn Triện Chu Sa) */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 dark:from-amber-950/60 dark:via-slate-900 dark:to-amber-950/60 border-2 border-amber-500/60 dark:border-amber-600/60 shadow-lg shadow-amber-950/5 relative">
              {/* Antique Red Seal Stamp */}
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

            {/* Classical Horizontal Paired Proverb (Đôi Câu Đối Cổ) */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-amber-900/90 dark:text-amber-300/90 font-serif italic tracking-wide">
              <span className="hidden md:inline-block w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
              <span>« Tổ Tông Công Đức Thiên Niên Thịnh</span>
              <span className="text-amber-500">❖</span>
              <span>Tử Hiếu Tôn Hiền Vạn Đại Vinh »</span>
              <span className="hidden md:inline-block w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>
          </div>

          {/* MAIN HERO CAROUSEL CONTAINER */}
          <div className="relative bg-white/95 dark:bg-slate-900/90 rounded-3xl border-2 border-amber-200/80 dark:border-amber-900/40 shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10 backdrop-blur-md">
            {/* Decorative Corner Flourishes (4 Góc Hồi Văn Cổ Điển) */}
            <div className="absolute top-2 left-2 text-amber-500/30 dark:text-amber-400/20 text-xs font-serif select-none pointer-events-none">╔══</div>
            <div className="absolute top-2 right-2 text-amber-500/30 dark:text-amber-400/20 text-xs font-serif select-none pointer-events-none">══╗</div>
            <div className="absolute bottom-2 left-2 text-amber-500/30 dark:text-amber-400/20 text-xs font-serif select-none pointer-events-none">╚══</div>
            <div className="absolute bottom-2 right-2 text-amber-500/30 dark:text-amber-400/20 text-xs font-serif select-none pointer-events-none">══╝</div>

            {/* Slide Content with Crossfade & Slide Transition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px]">
              {/* Left Column: Text & Call To Actions (7 Cols) */}
              <div className="lg:col-span-7 space-y-5 text-left animate-fade-in key={currentSlide}">
                {/* Slide Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 text-xs font-bold font-serif">
                  <span>{carouselSlides[currentSlide].tag}</span>
                </div>

                {/* Grand Title */}
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-serif">
                  <span className="block text-slate-900 dark:text-slate-100">
                    {carouselSlides[currentSlide].titleLine1}
                  </span>
                  <span className="mt-1 block text-transparent bg-clip-text bg-gradient-to-r from-[#14532D] via-[#166534] to-[#B45309] dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400">
                    {carouselSlides[currentSlide].titleLine2}
                  </span>
                </h1>

                {/* Classical Ornamental Divider */}
                <div className="flex items-center gap-2 py-0.5 text-amber-700 dark:text-amber-400 opacity-80">
                  <span className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-transparent rounded-full" />
                  <span className="text-xs">✦ ⚜️ ✦</span>
                  <span className="w-24 h-0.5 bg-gradient-to-l from-transparent via-amber-500 to-transparent rounded-full" />
                </div>

                {/* Subtitle Description */}
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                  {carouselSlides[currentSlide].description}
                </p>

                {/* Call To Action Buttons for Active Slide */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/register"
                    className="px-6 py-3.5 rounded-2xl bg-[#166534] hover:bg-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs shadow-xl shadow-emerald-950/20 hover:scale-102 transition-all flex items-center gap-2"
                  >
                    <span>{carouselSlides[currentSlide].primaryCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => {
                      if (currentSlide === 0) setShowSampleTreeModal(true);
                      else if (currentSlide === 1) {
                        const el = document.getElementById('kinship-tool');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      } else if (currentSlide === 2) {
                        const el = document.getElementById('calendar-demo');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setShowQrModal(true);
                      }
                    }}
                    className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{carouselSlides[currentSlide].secondaryCta}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Right Column: Realistic Photographic Scene with Lacquer Frame (5 Cols) */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="w-full max-w-md rounded-3xl overflow-hidden border-2 border-amber-400/90 dark:border-amber-600/80 shadow-2xl relative group bg-slate-950">
                  {/* Real Photo Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={carouselSlides[currentSlide].imageSrc}
                      alt={carouselSlides[currentSlide].imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 contrast-105"
                    />

                    {/* Rich Dark Gradient Overlays for Elegance and Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/30 rounded-3xl pointer-events-none" />

                    {/* Top Location & Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-amber-300 font-serif text-[11px] font-bold rounded-full border border-amber-400/40 shadow-md">
                        {carouselSlides[currentSlide].imageLocation}
                      </span>
                    </div>

                    {/* Top Right Imperial Seal Indicator */}
                    <div className="absolute top-3 right-3">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-red-700 to-red-900 text-amber-200 flex items-center justify-center font-serif text-[10px] font-black border border-amber-300 shadow-md">
                        ẤN
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white space-y-1">
                      <div className="text-xs font-bold text-amber-200 font-serif line-clamp-1">
                        {carouselSlides[currentSlide].imageCaption}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 font-sans">
                        <span>Hình ảnh di sản thực tế</span>
                        <span className="text-emerald-400 font-mono">Bản Quyền 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Toolbar & Slide Selector Tabs */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlide((currentSlide - 1 + carouselSlides.length) % carouselSlides.length)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="Câu trước"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx
                          ? 'w-8 bg-[#166534] dark:bg-emerald-500'
                          : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-amber-400'
                      }`}
                      title={`Chuyển đến Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSlide((currentSlide + 1) % carouselSlides.length)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="Câu kế tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Quick Selector Pill Tabs */}
              <div className="hidden md:flex items-center gap-2">
                {carouselSlides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition cursor-pointer border ${
                      currentSlide === idx
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border-amber-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    }`}
                  >
                    {slide.shortTab}
                  </button>
                ))}
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
                    <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-serif">
                      Đại Tộc Nguyễn Văn (Định Công, Hà Nội)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Mã Tộc: NGUYEN-VAN-HN • 86 Thành Viên • 5 Thế Hệ Phụng Dựng
                    </div>
                  </div>
                </div>

                {/* Toolbar Controls */}
                <div className="flex items-center gap-2">
                  {/* Branch Filter Pills */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    <button
                      onClick={() => setTreeFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition ${treeFilter === 'ALL' ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Tất Cả
                    </button>
                    <button
                      onClick={() => setTreeFilter('TRUONG')}
                      className={`px-2.5 py-1 rounded-lg transition ${treeFilter === 'TRUONG' ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Chi Trưởng
                    </button>
                    <button
                      onClick={() => setTreeFilter('THU')}
                      className={`px-2.5 py-1 rounded-lg transition ${treeFilter === 'THU' ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Chi Thứ
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 gap-1">
                    <button 
                      onClick={() => setTreeZoom(Math.max(0.8, treeZoom - 0.1))} 
                      title="Thu nhỏ"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold px-1 text-slate-500">
                      {Math.round(treeZoom * 100)}%
                    </span>
                    <button 
                      onClick={() => setTreeZoom(Math.min(1.3, treeZoom + 0.1))} 
                      title="Phóng to"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Tree Nodes Matrix with Zoom Scale */}
              <div className="space-y-3 overflow-x-auto pb-2">
                <div 
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 transition-transform duration-200 origin-top-left"
                  style={{ transform: `scale(${treeZoom})` }}
                >
                  {filteredMembers.map((member) => {
                    const isSelected = selectedHeroMember.id === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => setSelectedHeroMember(member)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-[#166534] text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {member.relationText}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate font-serif">
                          {member.name.split(' (')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {member.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Member Detail Box (Live Popup / Inspection) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-emerald-50/50 to-white dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 border border-amber-200/80 dark:border-slate-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/50 dark:border-slate-700 pb-2.5">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base font-serif flex items-center gap-2">
                      <span>{selectedHeroMember.name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#166534] dark:text-emerald-300 font-sans font-bold">
                        {selectedHeroMember.branch}
                      </span>
                    </h3>
                    <div className="text-xs text-amber-800 dark:text-amber-300 font-medium mt-0.5">
                      Âm/Dương Lịch: {selectedHeroMember.birthDeath} • An Táng: {selectedHeroMember.burialSite}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSampleTreeModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-[#166534] dark:text-emerald-400 border border-emerald-200 dark:border-slate-600 hover:bg-emerald-50 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem Phả Đồ Toàn Chi</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedHeroMember.desc}
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
                Thuật toán LCA tự động tính toán xưng hô theo tục lệ « Bé bằng củ khoai, cứ vai mà gọi », con Bác luôn là anh/chị vế trên so với con Chú.
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
              Tra cứu nhanh ngày giỗ tiên tổ, nhận diện tự động tháng nhuận và tháng Chạp thiếu 29 ngày theo thuật toán Hồ Ngọc Đức UTC+7:
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
