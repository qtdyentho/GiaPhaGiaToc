import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { BRAND } from '../lib/constants';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('truongtoc.nguyen@giapha.vn');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-heritage-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-heritage-green text-heritage-gold font-black text-2xl rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          GP
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">{BRAND.name}</h2>
        <p className="text-xs text-slate-500 mt-1">{BRAND.slogan}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-heritage rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Email / Tài Khoản</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:border-heritage-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Mật Khẩu</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-heritage-green focus:border-heritage-green"
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
                  className="h-4 w-4 text-heritage-green focus:ring-heritage-green border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-600">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-xs font-semibold text-heritage-green hover:underline">
                Quên mật khẩu?
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-heritage-green hover:bg-heritage-green-light focus:outline-none transition"
              >
                <span>Đăng Nhập Gia Tộc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Chưa có tài khoản gia tộc?{' '}
            <Link to="/register" className="font-bold text-heritage-navy hover:underline">
              Đăng ký mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
