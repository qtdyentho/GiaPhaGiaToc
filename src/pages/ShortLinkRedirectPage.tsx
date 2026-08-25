import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Landmark, ShieldAlert, ArrowLeft, Loader2, QrCode } from 'lucide-react';
import { ShortLinkService } from '../services/security/ShortLinkService';

export const ShortLinkRedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveLink() {
      if (!code) {
        setError('Mã liên kết rút gọn không hợp lệ.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await ShortLinkService.resolveShortCode(code);
        if (res.success && res.pass_token) {
          // Seamless redirect to clan pass unlock screen
          navigate(`/clan-pass/${res.pass_token}`, { replace: true });
        } else {
          setError(res.error || 'Liên kết gia tộc không tồn tại hoặc đã hết hạn.');
          setLoading(false);
        }
      } catch (err: any) {
        setError('Có lỗi xảy ra trong quá trình giải mã liên kết. Vui lòng thử lại.');
        setLoading(false);
      }
    }

    resolveLink();
  }, [code, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#166534]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Đang Kết Nối Dòng Họ...</h2>
            <p className="text-xs text-slate-500">Đang giải mã liên kết an toàn <span className="font-mono font-bold text-emerald-800">/c/{code}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Liên Kết Không Khả Dụng</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'Mã liên kết rút gọn này không tồn tại, đã bị thu hồi hoặc Trưởng tộc đã đổi mã QR mới.'}
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-700">
              /c/{code}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          <Link
            to="/"
            className="w-full py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Landmark className="w-4 h-4" />
            <span>Về Trang Chủ Gia Phả</span>
          </Link>

          <Link
            to="/login"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Đăng Nhập Bằng Tài Khoản</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShortLinkRedirectPage;
