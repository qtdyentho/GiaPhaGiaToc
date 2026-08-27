import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  KeyRound,
  ShieldCheck,
  Landmark,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  TreePine,
  Wallet,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ClanPassService } from '../services/security/ClanPassService';
import { useAuth } from '../contexts/AuthContext';
import { ANCESTRAL_PRESETS } from '../components/family/AncestralBannerModal';
import { ClanGuestbookModal } from '../components/family/ClanGuestbookModal';
import { BookOpen, Flame } from 'lucide-react';

export const ClanPassUnlockPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { switchFamily } = useAuth();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passData, setPassData] = useState<{
    family_id?: string;
    family_name?: string;
    banner_url?: string;
    is_locked?: boolean;
  }>({});

  useEffect(() => {
    async function loadPassInfo() {
      setInitialLoading(true);
      setError(null);
      const res = await ClanPassService.getPassByToken(token);
      if (res.success) {
        setPassData({
          family_id: res.family_id,
          family_name: res.family_name,
          banner_url: res.banner_url,
          is_locked: res.is_locked,
        });
      } else {
        setError(res.error || 'Mã QR không tồn tại hoặc đã hết hạn.');
      }
      setInitialLoading(false);
    }
    if (token) {
      loadPassInfo();
    }
  }, [token]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pin.trim().length < 4) {
      setError('Vui lòng nhập đầy đủ mã PIN gia tộc (tối thiểu 4 số).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ClanPassService.verifyClanPass(token, pin.trim());
      if (res.success && res.session) {
        // Switch active family in context
        switchFamily(res.session.family_id);
        navigate('/app');
      } else {
        setError(res.error || 'Mã PIN không chính xác.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xác thực mã PIN.');
    } finally {
      setLoading(false);
    }
  };

  const bannerImg = passData.banner_url || ANCESTRAL_PRESETS[0].url;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-amber-200/80 font-serif">Đang kiểm tra mã QR dòng họ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-700 rounded-full blur-[140px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-sm group-hover:scale-105 transition">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="font-serif font-black text-base text-amber-200 tracking-wide">
            GIA PHẢ GIA TỘC
          </span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cổng Tra Cứu Con Cháu</span>
        </div>
      </header>

      {/* Main Unlock Card */}
      <main className="relative z-10 max-w-lg mx-auto w-full px-4 py-6">
        <div className="bg-slate-900/90 border border-amber-900/40 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Ancestral Hero Banner Header */}
          <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-950">
            <img
              src={bannerImg}
              alt="Từ Đường"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ANCESTRAL_PRESETS[0].url;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950/60 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
              <div className="inline-flex items-center gap-1 bg-amber-500/30 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
                <Landmark className="w-3 h-3" />
                <span>Không Gian Phụng Tự Tiên Tổ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-100 font-serif">
                {passData.family_name || 'Đại Tộc Gia Phả'}
              </h1>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Xác Thực Tư Cách Con Cháu</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Vui lòng nhập <strong>Mã PIN gia tộc</strong> để mở khóa xem Cây Phả Hệ, Ngày Giỗ và Số Dư Quỹ dòng họ.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-200 text-center uppercase tracking-wider">
                  Mã PIN Gia Tộc (4 – 6 số)
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={8}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="• • • •"
                    className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 bg-slate-950/80 border-2 border-amber-500/40 rounded-2xl text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition shadow-inner font-mono"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 text-center font-serif italic">
                  Mã PIN do Ban Quản Trị thiết lập nhằm bảo vệ thông tin nội bộ gia tộc.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(passData.is_locked)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-[#166534] hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                    <span>Mở Khóa Tra Cứu Gia Tộc</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Feature Highlights & Guestbook Grid */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <button
                type="button"
                onClick={() => setIsGuestbookOpen(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-serif flex items-center justify-center gap-2 transition shadow-inner cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>🏮 Dâng Nén Tâm Hương & Ký Sổ Lưu Bút Từ Đường</span>
                <BookOpen className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
                <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-800">
                  <TreePine className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-300">Cây Phả Hệ</span>
                </div>
                <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-300">Lịch Âm Giỗ</span>
                </div>
                <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-800">
                  <Wallet className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-300">Số Dư Quỹ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sổ Lưu Bút Ký Tên Modal */}
      <ClanGuestbookModal
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
        familyId={passData.family_id}
        familyName={passData.family_name}
      />

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-slate-500 font-serif">
        Nền Tảng Quản Trị Gia Phả & Tài Chính Dòng Họ Đa Chi Phái
      </footer>
    </div>
  );
};

export default ClanPassUnlockPage;
