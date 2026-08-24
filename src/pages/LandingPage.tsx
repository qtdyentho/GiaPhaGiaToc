import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trees, Calendar, Landmark, Sparkles, ArrowRight, CheckCircle2, Users, HeartHandshake, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">GIA PHẢ GIA TỘC</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block -mt-1">
                Heritage Ledger SaaS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Tính Năng Cốt Lõi</a>
            <a href="#pillars" className="hover:text-emerald-400 transition-colors">4 Trụ Cột</a>
            <Link to="/pricing" className="hover:text-emerald-400 transition-colors">Bảng Giá</Link>
            <Link to="/help" className="hover:text-emerald-400 transition-colors">Hướng Dẫn</Link>
          </nav>

          <div className="flex items-center gap-3">
            {import.meta.env.DEV && (
              <Link
                to="/dev/test-login"
                className="hidden lg:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                🛠️ Dev Test Panel
              </Link>
            )}
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-900/40 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-2"
            >
              Tạo Dòng Họ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Gìn Giữ Huyết Thống, <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Minh Bạch Sổ Quỹ Gia Tộc
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Hệ thống kết nối huyết thống vĩnh cửu, tính toán ngày giỗ âm lịch chuẩn xác theo thiên văn học, ghi chép sổ quỹ kép bất biến và thanh toán công đức hiện đại.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              Bắt Đầu Dùng Thử 30 Ngày <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all"
            >
              Xem Bảng Giá Dịch Vụ
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section id="pillars" className="py-20 border-t border-slate-800 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase">Kiến Trúc Toàn Diện</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">4 Trụ Cột Quản Trị Gia Tộc Hiện Đại</h2>
            <p className="text-slate-400 text-sm">Được thiết kế chuyên sâu theo phong tục, truyền thống và quản trị tài chính dòng họ Việt Nam.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Cây Phả Hệ Đa Chi</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Trực quan hóa cây phả hệ hàng ngàn thành viên, phân chia chi/phái/nhánh, quản lý tiền nhân và hậu thế bảo mật.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 hover:border-teal-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Lịch Âm & Ngày Giỗ</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Core Engine tính toán âm dương thiên văn chuẩn xác, tự động thông báo ngày giỗ tổ tiên, tháng nhuận và lễ tế.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Sổ Quỹ Kép Bất Biến</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Quản lý thu chi minh bạch, không thể xóa lịch sử giao dịch (Immutable Ledger), bút toán hoàn trả chuẩn mực.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">4. Công Đức & VietQR</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Tạo mã QR chuyển khoản công đức tự động, ghi danh Bảng Vàng Công Đức vinh danh con cháu muôn đời.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 Gia Phả Gia Tộc SaaS. Bảo lưu mọi quyền. Dữ liệu gia tộc được mã hóa và bảo toàn vĩnh cửu.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/help" className="hover:text-white transition-colors">Hướng Dẫn</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Bảng Giá</Link>
            <Link to="/login" className="hover:text-white transition-colors">Đăng Nhập Quản Trị</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
