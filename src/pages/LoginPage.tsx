import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { BRAND } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Định dạng email không hợp lệ (VD: user@example.com)');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(cleanEmail, password);
      const redirectUrl = searchParams.get('redirect');

      if (result.isSuperAdmin) {
        navigate('/admin/beta');
      } else if (result.activeFamily) {
        navigate(redirectUrl || '/app/dashboard');
      } else {
        navigate('/onboarding/create-family');
      }
    } catch (err: any) {
      setError(err?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setEmail(demoEmail);
    const result = await signIn(demoEmail, '123456');
    if (result.isSuperAdmin) {
      navigate('/admin/beta');
    } else {
      navigate('/app/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-heritage-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-[#166534] text-amber-300 font-black text-2xl rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-emerald-400/30">
          GP
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">{BRAND.name}</h2>
        <p className="text-xs text-slate-500 mt-1">{BRAND.slogan}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email / Tài Khoản</label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mật Khẩu</label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-[#166534] focus:ring-[#166534] border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-600">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-xs font-semibold text-[#166534] hover:underline cursor-pointer">
                Quên mật khẩu?
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-[#166534] hover:bg-[#14532d] focus:outline-none transition disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Gia Tộc'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Tài Khoản Thử Nghiệm Nhanh
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('truongtoc.nguyen@giapha.vn')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-[#166534] rounded-xl text-[11px] font-bold transition text-center"
              >
                Đại Tộc Nguyễn Văn
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('superadmin@giapha.vn')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-[11px] font-bold transition text-center"
              >
                Quản Trị Hệ Thống
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Chưa có tài khoản gia tộc?{' '}
            <Link to="/register" className="font-bold text-[#1E3A5F] hover:underline">
              Đăng ký dòng họ mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
