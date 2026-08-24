import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trees, Calendar, Landmark, Sparkles, ArrowRight, Award, ShieldCheck, 
  Users, CheckCircle2, ChevronRight, BookOpen, HeartHandshake, Phone, 
  HelpCircle, QrCode, Lock, ArrowUpRight, Check, Star, ShieldAlert,
  ArrowRightLeft, Sparkle
} from 'lucide-react';
import { BRAND } from '../lib/constants';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Dữ liệu gia phả của dòng họ có được bảo mật và lưu giữ vĩnh viễn không?',
      a: 'Hoàn toàn an toàn và vĩnh cửu. Nền tảng Gia Phả Gia Tộc áp dụng cơ chế Multi-tenancy phân lập 100% giữa các dòng họ, mã hóa thông tin định danh cá nhân (PII) AES-256 cấp ngân hàng. Kể cả khi hết hạn gói cước, dữ liệu của dòng họ vẫn được bảo toàn nguyên vẹn ở chế độ đọc.'
    },
    {
      q: 'Hệ thống tính vai vế xưng hô « Bé bằng củ khoai, cứ vai mà gọi » hoạt động thế nào?',
      a: 'Hệ thống sử dụng thuật toán cây LTree tìm Tổ tiên chung gần nhất (LCA) và đối chiếu thứ tự cành nhánh. Con của người anh (chi trưởng / con bác) tự động được xếp vào Vế Trên so với con của người em (chi thứ / con chú), bất kể tuổi đời thực tế ngoài đời, đảm bảo chuẩn mực thuần phong mỹ tục Việt Nam.'
    },
    {
      q: 'Lịch giỗ có tính chính xác tháng nhuận và năm thiếu 29 ngày không?',
      a: 'Chính xác 100% theo thiên văn học Việt Nam. Hệ thống tự động chuyển đổi âm dương 2 chiều, nhận diện chính xác các năm nhuận (như năm 2025 nhuận tháng 6, năm 2028 nhuận tháng 5) và các tháng Chạp thiếu chỉ có 29 ngày để nhắc lễ cúng giỗ đúng ngày.'
    },
    {
      q: 'Các cụ cao tuổi hoặc con cháu ở xa có xem được gia phả trên điện thoại không?',
      a: 'Giao diện được thiết kế Responsive tối ưu cho mọi thiết bị di động, cỡ chữ to rõ ràng, có chế độ tra cứu nhanh và cây phả hệ trực quan giúp con cháu ở xa hay trong nước đều dễ dàng tìm về cội nguồn.'
    },
    {
      q: 'Làm thế nào để in cuốn gia phả hoặc sơ đồ cây khổ lớn cho nhà thờ họ?',
      a: 'Bạn có thể xuất file PDF sơ đồ cây gia phả khổ lớn (A0, A1, A2) hoặc trích xuất toàn bộ tiểu sử các đời ra file bản thảo chuẩn để chuyển trực tiếp cho nhà in phục vụ đại lễ khánh thành nhà thờ họ.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-slate-900 font-sans selection:bg-[#166534] selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] text-amber-200 text-xs py-2 px-4 text-center font-medium border-b border-amber-400/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
        <span>Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái — Trải Nghiệm Miễn Phí 30 Ngày!</span>
        <Link to="/register" className="underline font-bold text-white hover:text-amber-300 ml-1">Đăng ký ngay →</Link>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-200/90 sticky top-0 z-50 backdrop-blur-md bg-white/95 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#166534] flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-900/20 border border-emerald-400/30 group-hover:scale-105 transition-transform">
              GP
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block font-serif">
                GIA PHẢ GIA TỘC
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#166534] block -mt-1 font-sans">
                Heritage Ledger Platform
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#166534] transition-colors">Tính Năng Cốt Lõi</a>
            <a href="#kinship" className="hover:text-[#166534] transition-colors">Tra Cứu Vai Vế</a>
            <a href="#calendar" className="hover:text-[#166534] transition-colors">Lịch Giỗ Âm Dương</a>
            <a href="#finance" className="hover:text-[#166534] transition-colors">Sổ Quỹ & Công Đức</a>
            <a href="#pricing" className="hover:text-[#166534] transition-colors">Bảng Giá</a>
            <a href="#faq" className="hover:text-[#166534] transition-colors">Hỏi Đáp</a>
          </nav>

          <div className="flex items-center gap-3">
            {import.meta.env.DEV && (
              <Link
                to="/dev/test-login"
                className="hidden xl:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all"
              >
                🛠️ Dev Panel
              </Link>
            )}
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#166534] transition-colors"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>Khởi Tạo Dòng Họ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-[#F7F8F5] to-[#FBFBF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          {/* Slogan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300/80 text-[#166534] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Phụng Dựng Tiên Tổ — Nối Dòng Truyền Thống — Quản Trị Minh Bạch</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight font-serif">
            Gìn Giữ Huyết Thống Cội Nguồn, <br className="hidden sm:block" />
            <span className="text-[#166534] underline decoration-amber-400 decoration-wavy decoration-2">
              Số Hóa & Quản Trị Dòng Họ
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Nền tảng số hóa cây gia phả đa chi phái, tự động phân vai vế xưng hô chuẩn mực theo tục ước, báo giỗ âm dương chính xác theo thiên văn học và minh bạch 100% sổ quỹ tài chính dòng tộc.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-white font-extrabold text-sm shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              <span>Khởi Tạo Dòng Họ Miễn Phí (30 Ngày)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all flex items-center justify-center gap-2"
            >
              <Trees className="w-4 h-4 text-[#166534]" />
              <span>Xem Cây Gia Phả Mẫu</span>
            </Link>
          </div>

          {/* Live Hero Showcase Visual Cards */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Top Card Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-[#166534] flex items-center justify-center font-bold text-sm">
                    ĐN
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm font-serif">Đại Tộc Nguyễn Văn (Định Công, Hà Nội)</div>
                    <div className="text-[11px] text-slate-500">Mã: NGUYEN-VAN-HN • 86 Thành Viên • 5 Thế Hệ</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#166534] rounded-full font-bold">
                    ✓ Đã Xác Thực Gia Tộc
                  </span>
                </div>
              </div>

              {/* 3 Live Interactive Showcase Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Block 1: Kinship Reasoning */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase">
                    <span className="flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                      Phân Vai Vế Xưng Hô
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Tộc Ước</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Tuấn (Đời 4, Chi Trưởng) gọi Đức (Đời 4, Chi Hai):
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-300 text-xs font-black text-amber-950 font-serif shadow-2xs">
                    « Em họ (Vế dưới / Con Chú) »
                  </div>
                  <p className="text-[10px] text-slate-600 italic">
                    * Đức dù lớn tuổi hơn vẫn gọi Tuấn là « Anh họ (Con Bác) » theo đúng lệ cổ.
                  </p>
                </div>

                {/* Block 2: Lunar Calendar & Memorials */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#166534] uppercase">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#166534]" />
                      Lịch Giỗ Thiên Văn
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-bold">Bính Ngọ 2026</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Đại Lễ Giỗ Cụ Thủy Tổ:
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-300 text-xs font-black text-[#166534] font-serif shadow-2xs flex items-center justify-between">
                    <span>15 Tháng Giêng Âm Lịch</span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">Dương: 03/03/2026</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    * Tự động gửi thông báo đếm ngược nhắc lễ trước 30-15-7 ngày.
                  </p>
                </div>

                {/* Block 3: Sổ Quỹ & Công Đức */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 uppercase">
                    <span className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-700" />
                      Sổ Quỹ Bất Biến
                    </span>
                    <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded font-bold">Minh Bạch 100%</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Tổng Số Dư Quỹ Gia Tộc:
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-blue-300 text-xs font-black text-blue-950 font-serif shadow-2xs flex items-center justify-between">
                    <span>128.500.000 VNĐ</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">+3 Quỹ Độc Lập</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    * Bút toán hoàn trả Reversal kép, con cháu theo dõi thu chi tức thì.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Live Metrics Strip */}
      <section className="py-8 bg-[#162D4A] text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-serif">1.250+</div>
              <div className="text-xs text-slate-300">Dòng họ tin tưởng sử dụng</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-serif">95.000+</div>
              <div className="text-xs text-slate-300">Thành viên được số hóa</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-serif">100%</div>
              <div className="text-xs text-slate-300">Mã hóa PII & An toàn dữ liệu</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-serif">99.9%</div>
              <div className="text-xs text-slate-300">Chính xác lịch thiên văn âm dương</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Pillars & Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black tracking-widest text-[#166534] uppercase font-sans">
              Hệ Thống Phụng Dựng Toàn Diện
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
              6 Phân Hệ Cốt Lõi Của Gia Tộc Số
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Được thiết kế chuyên sâu theo phong tục tập quán, nghi lễ tế tự và truyền thống gia phả Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#166534] shadow-xs group-hover:scale-110 transition-transform">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">1. Cây Phả Hệ Đa Chi Phái (LTree)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Biên soạn và tra cứu cây gia phả nhiều thế hệ, phân định rõ chi phái cành nhánh. Xuất file in khổ lớn PDF A0/A1 chuẩn nhà in.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 hover:border-amber-500 hover:shadow-lg transition-all space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">2. Tra Cứu Danh Xưng & Vai Vế</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động tính toán xưng hô theo tục lệ « Bé bằng củ khoai, cứ vai mà gọi », phân định chính xác con Bác vế trên, con Chú vế dưới.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 hover:border-teal-500 hover:shadow-lg transition-all space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 shadow-xs group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">3. Lịch Gia Tộc & Giỗ Vạn Niên</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tính toán chính xác lịch âm dương thiên văn, xử lý chuẩn năm nhuận, tháng thiếu 29 ngày và gửi thông báo nhắc cúng giỗ kịp thời.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 hover:border-blue-500 hover:shadow-lg transition-all space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 shadow-xs group-hover:scale-110 transition-transform">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">4. Sổ Quỹ Kép Bất Biến 100%</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quản lý độc lập Quỹ Hoạt Động, Quỹ Khuyến Học, Quỹ Tu Bổ Từ Đường. Cơ chế bút toán hoàn trả Reversal chống thất thoát tài chính.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 hover:border-amber-600 hover:shadow-lg transition-all space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-900 shadow-xs group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">5. Bảng Vàng Công Đức VietQR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hỗ trợ công đức quét mã QR ngân hàng tiện lợi, tự động cập nhật danh sách bảng vàng tri ân tấm lòng phụng sự của con cháu.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 hover:border-emerald-600 hover:shadow-lg transition-all space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#166534] shadow-xs group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">6. Hương Ước & Thông Báo Khẩn</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lưu giữ tộc quy răn dạy đạo đức gia phong, phát thông báo đẩy sự kiện trọng đại kèm đồng hồ đếm ngược trực tiếp cho bà con.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps Simple Onboarding */}
      <section className="py-20 bg-[#F7F8F5] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">Dễ Dàng Sử Dụng</span>
            <h2 className="text-3xl font-black text-slate-900 font-serif">4 Bước Số Hóa Dòng Họ Của Bạn</h2>
            <p className="text-xs text-slate-500">Chỉ mất 5 phút để tạo lập không gian phụng dựng gia tộc trực tuyến</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] text-white font-bold flex items-center justify-center mx-auto text-sm">1</div>
              <h4 className="font-bold text-slate-900 text-sm">Đăng Ký & Khởi Tạo</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Nhập tên gia tộc, quê quán gốc tích và chỉ định Cụ Thủy Tổ khai sáng.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] text-white font-bold flex items-center justify-center mx-auto text-sm">2</div>
              <h4 className="font-bold text-slate-900 text-sm">Nhập Danh Sách Thành Viên</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Nhập trực quan trên cây hoặc import tự động 4 bước từ file Excel có sẵn.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] text-white font-bold flex items-center justify-center mx-auto text-sm">3</div>
              <h4 className="font-bold text-slate-900 text-sm">Kích Hoạt Lịch & Sổ Quỹ</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Hệ thống tự động đồng bộ ngày giỗ âm dương và thiết lập các quỹ phụng tự.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#166534] text-white font-bold flex items-center justify-center mx-auto text-sm">4</div>
              <h4 className="font-bold text-slate-900 text-sm">Gắn Kết Con Cháu</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Gửi liên kết cho bà con họ tộc để cùng tra cứu phả hệ, xưng hô và đóng góp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">Gói Dịch Vụ Phụng Dựng</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">Bảng Giá Dịch Vụ Minh Bạch</h2>
            <p className="text-xs sm:text-sm text-slate-500">Lựa chọn gói cước phù hợp với quy mô thành viên của dòng họ bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Plan 1: Khởi Lập */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase">Gói Khởi Lập</div>
                <div className="text-3xl font-black text-slate-900 font-serif">Miễn Phí</div>
                <p className="text-xs text-slate-500">Dành cho gia đình hoặc dòng họ trải nghiệm số hóa ban đầu.</p>
                <div className="border-t border-slate-200 pt-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Tối đa <strong>30 thành viên</strong></span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Cây phả hệ 3 đời cơ bản</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Lịch giỗ tự động</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Dùng thử đầy đủ 30 ngày</span></div>
                </div>
              </div>
              <Link to="/register" className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 text-center block transition">
                Bắt Đầu Miễn Phí
              </Link>
            </div>

            {/* Plan 2: Gia Tộc (Popular) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#14532D] via-[#166534] to-[#0F3D21] text-white shadow-xl border-2 border-amber-400 space-y-6 flex flex-col justify-between relative">
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
              <Link to="/register" className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-xl text-center block transition shadow-md">
                Khởi Tạo Gói Gia Tộc
              </Link>
            </div>

            {/* Plan 3: Đại Tộc */}
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase">Gói Đại Gia Tộc</div>
                <div className="text-3xl font-black text-slate-900 font-serif">2.490.000đ <span className="text-xs font-normal text-slate-500">/ năm</span></div>
                <p className="text-xs text-slate-500">Dành cho đại gia tộc lớn, đa chi phái trên toàn quốc.</p>
                <div className="border-t border-slate-200 pt-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Hạn mức <strong>1.000+ thành viên (Không giới hạn)</strong></span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Toàn bộ tính năng cao cấp nhất</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Phân quyền chi phái đa cấp độ</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#166534]" /> <span>Hỗ trợ kỹ thuật 24/7 chuyên biệt</span></div>
                </div>
              </div>
              <Link to="/register" className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 text-center block transition">
                Khởi Tạo Gói Đại Tộc
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#F7F8F5] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">Giải Đáp Thắc Mắc</span>
            <h2 className="text-3xl font-black text-slate-900 font-serif">Câu Hỏi Thường Gặp</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-[#166534] transition cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90 text-[#166534]' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-16 bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0F3D21] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black font-serif text-white">
            Bắt Đầu Lưu Truyền Di Sản Gia Tộc Hôm Nay
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Hãy cùng hàng nghìn dòng họ Việt Nam số hóa gia phả, kết nối con cháu và phụng dựng cội nguồn tiên tổ vững bền qua các thế hệ.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              <span>Khởi Tạo Dòng Họ Miễn Phí (30 Ngày)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#166534] text-white font-black flex items-center justify-center text-xs">
                  GP
                </div>
                <span className="font-bold text-slate-900 text-sm font-serif">GIA PHẢ GIA TỘC</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Nền tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái số 1 Việt Nam.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Phân Hệ Cốt Lõi</div>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#features" className="hover:text-[#166534]">Cây Phả Hệ Đa Chi (LTree)</a></li>
                <li><a href="#kinship" className="hover:text-[#166534]">Tra Cứu Vai Vế Xưng Hô</a></li>
                <li><a href="#calendar" className="hover:text-[#166534]">Lịch Giỗ Thiên Văn</a></li>
                <li><a href="#finance" className="hover:text-[#166534]">Sổ Quỹ Kép Minh Bạch</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Hỗ Trợ & Hướng Dẫn</div>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/support" className="hover:text-[#166534]">Trung Tâm Trợ Giúp</Link></li>
                <li><Link to="/pricing" className="hover:text-[#166534]">Biểu Phí Gói Dịch Vụ</Link></li>
                <li><Link to="/login" className="hover:text-[#166534]">Đăng Nhập Quản Trị</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">An Toàn Dữ Liệu</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Mọi thông tin gia tộc được bảo mật tuyệt đối với tiêu chuẩn mã hóa AES-256 và cách ly đa gia tộc RLS.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Gia Phả Gia Tộc (Heritage Ledger). Bản quyền được bảo hộ.
            </div>
            <div className="flex items-center gap-4">
              <span>Chính Sách Bảo Mật PII</span>
              <span>Điều Khoản Tộc Quy Số</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
