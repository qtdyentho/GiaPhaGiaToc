import React from 'react';
import { Link } from 'react-router-dom';
import { Trees, Calendar, Landmark, Sparkles, ArrowRight, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8F5] text-slate-900 font-sans selection:bg-[#166534] selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-200/90 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#166534] to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-900/10">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block">GIA PHẢ GIA TỘC</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#166534] block -mt-1">
                Heritage Ledger SaaS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#166534] transition-colors">Tính Năng Cốt Lõi</a>
            <a href="#pillars" className="hover:text-[#166534] transition-colors">4 Trụ Cột</a>
            <Link to="/pricing" className="hover:text-[#166534] transition-colors">Bảng Giá</Link>
            <Link to="/help" className="hover:text-[#166534] transition-colors">Hướng Dẫn</Link>
          </nav>

          <div className="flex items-center gap-3">
            {import.meta.env.DEV && (
              <Link
                to="/dev/test-login"
                className="hidden lg:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all"
              >
                🛠️ Dev Test Panel
              </Link>
            )}
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-[#166534] transition-colors"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-[#166534] text-white text-sm font-bold shadow-sm hover:bg-[#14532d] transition-all flex items-center gap-2"
            >
              Tạo Dòng Họ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-[#166534]" />
            Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight font-heritage">
            Gìn Giữ Huyết Thống, <br className="hidden sm:block" />
            <span className="text-[#166534]">
              Minh Bạch Sổ Quỹ Gia Tộc
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nơi lưu giữ cội nguồn gia tộc, phụng tự tiên tổ, tự động tính ngày giỗ âm lịch chuẩn xác và quản lý thu chi dòng họ minh bạch qua các thế hệ.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#166534] hover:bg-[#14532d] text-white font-extrabold text-base shadow-lg shadow-emerald-900/10 transition-all flex items-center justify-center gap-2"
            >
              Bắt Đầu Trải Nghiệm 30 Ngày <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm transition-all"
            >
              Xem Gói Phụng Dựng Dòng Họ
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section id="pillars" className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#166534] uppercase">Nền Tảng Phụng Tự</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heritage">4 Trụ Cột Quản Trị Dòng Họ</h2>
            <p className="text-slate-500 text-sm">Được thiết kế chuyên sâu theo nghi lễ, phong tục tập quán và truyền thống dòng họ Việt Nam.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 space-y-4 hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-[#166534] shadow-xs">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Cây Phả Hệ Đa Chi</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Biên soạn và tra cứu cây gia phả nhiều thế hệ, phân định rõ chi phái cành nhánh, lưu giữ tiểu sử tiền nhân và hậu duệ.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 space-y-4 hover:border-teal-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100/70 border border-teal-300 flex items-center justify-center text-teal-800 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Lịch Giỗ Vạn Niên</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Tự động tính lịch giỗ âm dương theo thiên văn học, nhắc lễ giỗ tiên tổ, ngày kỵ nhật và các dịp tế tự lớn của dòng họ.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 space-y-4 hover:border-cyan-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100/70 border border-cyan-300 flex items-center justify-center text-cyan-800 shadow-xs">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Sổ Quỹ Gia Tộc Minh Bạch</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Ghi chép thu chi quỹ họ rõ ràng, quản lý quỹ tu bổ từ đường, quỹ khuyến học và quỹ hương khói truyền đời.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F8F5] border border-slate-200/90 space-y-4 hover:border-amber-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Bảng Vàng Công Đức</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Hỗ trợ công đức quét mã VietQR thuận tiện, ghi danh bảng vàng tri ân tấm lòng con cháu khắp mọi miền.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 Gia Phả Gia Tộc. Nền Tảng Quản Lý Gia Phả & Tài Chính Dòng Họ Việt Nam.
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/help" className="hover:text-slate-900 transition-colors">Hướng Dẫn</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Bảng Giá</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Đăng Nhập Quản Trị</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
