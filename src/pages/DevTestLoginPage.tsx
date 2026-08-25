import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, AlertTriangle } from 'lucide-react';

export const DevTestLoginPage: React.FC = () => {
  const navigate = useNavigate();

  // SECURITY GUARD: Trang này chỉ dành cho DEV/demo mode.
  // Khi Supabase đã được cấu hình (production/staging), redirect về login thực.
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
    const isProduction = supabaseUrl && !supabaseUrl.includes('sample-project');
    if (isProduction) {
      console.warn('[Security] DevTestLoginPage disabled in production. Redirecting to /login.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleTestLogin = (role: 'ALPHA' | 'BETA' | 'GAMMA' | 'SUPER_ADMIN') => {
    // In dev environment, set mock session state and navigate
    if (role === 'SUPER_ADMIN') {
      navigate('/admin/beta');
    } else {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-slate-900 font-sans flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white border border-slate-200/90 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#166534] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Về Trang Chủ
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            DEV / STAGING ENVIRONMENT ONLY
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 font-heritage">
            <Lock className="w-6 h-6 text-[#166534]" />
            Bảng Đăng Nhập Tài Khoản Thử Nghiệm (Dev Panel)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chỉ kích hoạt trong môi trường phát triển (Development). Toàn bộ dữ liệu của Family Alpha, Beta, Gamma được giữ nguyên 100%.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {/* Super Admin */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-300 flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-50/40 transition-all">
            <div>
              <span className="font-bold text-slate-900 text-sm block">1. Super Admin (Ban Quản Trị Hệ Thống)</span>
              <span className="text-slate-500 block mt-0.5">Quyền cao nhất: Duyệt thanh toán thủ công, quản trị thuê bao, xem toàn cảnh.</span>
            </div>
            <button
              onClick={() => handleTestLogin('SUPER_ADMIN')}
              className="px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded-xl transition-all shadow-xs"
            >
              Vào Admin
            </button>
          </div>

          {/* Family Alpha */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-400 transition-all">
            <div>
              <span className="font-bold text-slate-900 text-sm block">2. Family Alpha (Đại Tộc Nguyễn Văn)</span>
              <span className="text-slate-500 block mt-0.5">86 thành viên, 78 quan hệ, đầy đủ lịch âm, sổ quỹ và ngày giỗ.</span>
            </div>
            <button
              onClick={() => handleTestLogin('ALPHA')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition-all shadow-xs"
            >
              Đăng Nhập
            </button>
          </div>

          {/* Family Beta */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-400 transition-all">
            <div>
              <span className="font-bold text-slate-900 text-sm block">3. Family Beta (Họ Trần Tộc Nam Định)</span>
              <span className="text-slate-500 block mt-0.5">142 thành viên, đang trong thời gian dùng thử (Trial 30 ngày).</span>
            </div>
            <button
              onClick={() => handleTestLogin('BETA')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition-all shadow-xs"
            >
              Đăng Nhập
            </button>
          </div>

          {/* Family Gamma */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-400 transition-all">
            <div>
              <span className="font-bold text-slate-900 text-sm block">4. Family Gamma (Lê Tộc Đại Tôn - READ_ONLY)</span>
              <span className="text-slate-500 block mt-0.5">Đã hết hạn thuê bao, bảo toàn 500 thành viên ở chế độ Chỉ Đọc (Zero Data Loss).</span>
            </div>
            <button
              onClick={() => handleTestLogin('GAMMA')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition-all shadow-xs"
            >
              Đăng Nhập
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-[11px] flex items-start gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>Trong môi trường Production thực tế, bảng này sẽ bị vô hiệu hóa hoàn toàn theo cấu hình bảo mật.</span>
        </div>
      </div>
    </div>
  );
};

export default DevTestLoginPage;
