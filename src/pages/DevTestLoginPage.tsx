import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Users, Lock, ArrowLeft, AlertTriangle } from 'lucide-react';

export const DevTestLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTestLogin = (role: 'ALPHA' | 'BETA' | 'GAMMA' | 'SUPER_ADMIN') => {
    // In dev environment, set mock session state and navigate
    if (role === 'SUPER_ADMIN') {
      navigate('/admin/beta');
    } else {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-800/90 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Về Trang Chủ
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            DEV / STAGING ENVIRONMENT ONLY
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            Bảng Đăng Nhập Tài Khoản Thử Nghiệm (Dev Panel)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chỉ kích hoạt trong môi trường phát triển (Development). Toàn bộ dữ liệu của Family Alpha, Beta, Gamma được giữ nguyên 100%.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {/* Super Admin */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between hover:border-emerald-500 transition-all">
            <div>
              <span className="font-bold text-white text-sm block">1. Super Admin (Ban Quản Trị Hệ Thống)</span>
              <span className="text-slate-400 block mt-0.5">Quyền cao nhất: Duyệt thanh toán thủ công, quản trị thuê bao, xem toàn cảnh.</span>
            </div>
            <button
              onClick={() => handleTestLogin('SUPER_ADMIN')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all"
            >
              Vào Admin
            </button>
          </div>

          {/* Family Alpha */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-between hover:border-slate-500 transition-all">
            <div>
              <span className="font-bold text-white text-sm block">2. Family Alpha (Đại Tộc Nguyễn Văn)</span>
              <span className="text-slate-400 block mt-0.5">86 thành viên, 78 quan hệ, đầy đủ lịch âm, sổ quỹ và ngày giỗ.</span>
            </div>
            <button
              onClick={() => handleTestLogin('ALPHA')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              Đăng Nhập
            </button>
          </div>

          {/* Family Beta */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-between hover:border-slate-500 transition-all">
            <div>
              <span className="font-bold text-white text-sm block">3. Family Beta (Họ Trần Tộc Nam Định)</span>
              <span className="text-slate-400 block mt-0.5">142 thành viên, đang trong thời gian dùng thử (Trial 30 ngày).</span>
            </div>
            <button
              onClick={() => handleTestLogin('BETA')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              Đăng Nhập
            </button>
          </div>

          {/* Family Gamma */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center justify-between hover:border-slate-500 transition-all">
            <div>
              <span className="font-bold text-white text-sm block">4. Family Gamma (Lê Tộc Đại Tôn - READ_ONLY)</span>
              <span className="text-slate-400 block mt-0.5">Đã hết hạn thuê bao, bảo toàn 500 thành viên ở chế độ Chỉ Đọc (Zero Data Loss).</span>
            </div>
            <button
              onClick={() => handleTestLogin('GAMMA')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              Đăng Nhập
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Trong môi trường Production thực tế, bảng này sẽ bị vô hiệu hóa hoàn toàn theo cấu hình bảo mật.</span>
        </div>
      </div>
    </div>
  );
};

export default DevTestLoginPage;
