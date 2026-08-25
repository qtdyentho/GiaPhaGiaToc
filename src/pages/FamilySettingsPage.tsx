import React, { useState, useEffect } from 'react';
import { 
  Shield, MapPin, Building, Copy, Plus, UserCheck, Key, CheckCircle2,
  Image, Camera, Sparkles, Landmark, Check, Scroll, QrCode, RefreshCw, Lock, Eye, EyeOff
} from 'lucide-react';
import { mockFamily, mockMemberships } from '../services/mockData';
import { ROLE_LABELS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { AncestralBannerModal, ANCESTRAL_PRESETS } from '../components/family/AncestralBannerModal';
import { ClanCovenantModal } from '../components/family/ClanCovenantModal';
import { PrintableClanQRCodeModal } from '../components/family/PrintableClanQRCodeModal';
import { ClanPassService } from '../services/security/ClanPassService';

export const FamilySettingsPage: React.FC = () => {
  const { activeFamily, updateFamily } = useAuth();
  const currentFamily = activeFamily || mockFamily;
  const [copied, setCopied] = useState(false);
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [generatedToken, setGeneratedToken] = useState('GP-INVITE-2026-HN01');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isCovenantModalOpen, setIsCovenantModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Clan Access Pass & PIN states
  const [passToken, setPassToken] = useState<string>('CP-FAM-NGUYEN-VAN-2026-X89');
  const [clanPin, setClanPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isSavingPin, setIsSavingPin] = useState<boolean>(false);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Form states
  const [familyName, setFamilyName] = useState(currentFamily.name);
  const [ancestralHallAddress, setAncestralHallAddress] = useState(currentFamily.ancestral_hall_address || '');
  const [description, setDescription] = useState(currentFamily.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bannerImageUrl = currentFamily.banner_url || ANCESTRAL_PRESETS[0].url;

  useEffect(() => {
    async function loadPass() {
      if (currentFamily?.id) {
        const config = await ClanPassService.getFamilyPassConfig(currentFamily.id);
        setPassToken(config.pass_token);
      }
    }
    loadPass();
  }, [currentFamily?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://giapha.vn/join?token=${generatedToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clanPin.trim() || clanPin.trim().length < 4) {
      setPinError('Mã PIN phải có tối thiểu 4 chữ số.');
      return;
    }
    setIsSavingPin(true);
    setPinError(null);
    try {
      const res = await ClanPassService.setClanPin(currentFamily.id, clanPin.trim());
      if (res.success) {
        setPinSuccess(true);
        setClanPin('');
        setTimeout(() => setPinSuccess(false), 3000);
      } else {
        setPinError(res.error || 'Lỗi khi cập nhật mã PIN.');
      }
    } catch (err: any) {
      setPinError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn thu hồi mã QR cũ và sinh mã mới? Các bản in cũ tại Từ Đường sẽ không còn sử dụng được.')) {
      return;
    }
    setIsRegenerating(true);
    try {
      const res = await ClanPassService.regeneratePassToken(currentFamily.id);
      if (res.success && res.newToken) {
        setPassToken(res.newToken);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateFamily(currentFamily.id, {
        name: familyName,
        ancestral_hall_address: ancestralHallAddress,
        description: description,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Cài Đặt & Quản Trị Gia Tộc</h1>
          <p className="text-xs text-slate-500">Cấu hình thông tin dòng họ, Mã QR Từ Đường và phân công ban quản trị</p>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ảnh Từ Đường & Thông Tin Cơ Bản */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box 1: Ảnh Từ Đường & Banner Dòng Họ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-[#166534]" />
                <span>Ảnh Từ Đường & Không Gian Phụng Tự</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Thay Đổi Ảnh</span>
              </button>
            </div>

            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-900 group">
              <img
                src={bannerImageUrl}
                alt="Banner Từ Đường"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ANCESTRAL_PRESETS[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-black/10" />

              <div className="absolute bottom-4 left-5 right-5 text-white flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-amber-500/30 text-amber-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-1.5 border border-amber-400/30 backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Ẩm Hà Tư Nguyên • Nơi Lưu Giữ Cội Nguồn</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif">{familyName}</h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              * Ảnh này sẽ hiển thị làm biểu tượng trang trọng nhất trên trang chủ dòng họ cho tất cả bà con cùng chiêm bái.
            </p>
          </div>

          {/* Box 2: Thông tin cơ bản dòng họ */}
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-[#166534]" />
              <span>Thông Tin Nhận Diện Gia Tộc</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Tên Dòng Họ</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Mã Gia Tộc (Hệ Thống)</label>
                <input
                  type="text"
                  disabled
                  value={currentFamily.code}
                  className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Địa Chỉ Nhà Thờ Tổ (Từ Đường)</label>
              <input
                type="text"
                value={ancestralHallAddress}
                onChange={(e) => setAncestralHallAddress(e.target.value)}
                placeholder="Ví dụ: Thôn 3, Xã Định Công, Hoàng Mai, Hà Nội"
                className="mt-1 block w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Mô Tả & Lịch Sử Tóm Tắt Dòng Họ</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tóm tắt nguồn gốc, cụ thủy tổ, niên hiệu khởi lập dòng họ..."
                className="mt-1 block w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Đã lưu thông tin dòng họ thành công!
                  </span>
                )}
              </div>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>

          {/* Box 3: Danh sách phân công ban quản trị */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-[#166534]" />
              <span>Ban Quản Trị & Phân Công Nhiệm Vụ</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {mockMemberships.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Nguyễn Văn Hoàng</div>
                    <div className="text-[11px] text-slate-500">truongtoc.nguyen@giapha.vn</div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROLE_LABELS[m.role]?.color}`}>
                    {ROLE_LABELS[m.role]?.label || m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mã QR & Hương ước */}
        <div className="space-y-6">
          {/* Box A: Mã QR & Mã PIN Tra Cứu Gia Tộc (Định danh không cần tài khoản) */}
          <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-6 rounded-2xl border border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <h2 className="text-sm font-bold text-amber-950 flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-amber-800" />
                <span>Mã QR & PIN Tra Cứu Từ Đường</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Bảo Mật SHA-256
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Con cháu quét mã QR và nhập <strong>Mã PIN bí mật</strong> để xem trọn vẹn Cây Phả Hệ, Ngày Giỗ & <strong>Số Dư Sổ Quỹ</strong> mà không cần đăng ký tài khoản.
            </p>

            <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2 text-center shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Mã Token Định Danh Dòng Họ:</div>
              <div className="text-xs font-mono font-bold text-[#166534] break-all bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                {passToken}
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="w-full py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Xem & In Mã QR Dán Từ Đường</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerateToken}
                  disabled={isRegenerating}
                  className="w-full py-1.5 text-slate-500 hover:text-rose-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Thu hồi & Cấp mã QR mới</span>
                </button>
              </div>
            </div>

            {/* Form Thiết lập Mã PIN */}
            <form onSubmit={handleSavePin} className="space-y-3 pt-2 border-t border-amber-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-800" />
                  <span>Mã PIN Gia Tộc (4 – 6 Số)</span>
                </label>
                {pinSuccess && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã cập nhật PIN!
                  </span>
                )}
              </div>

              {pinError && (
                <div className="p-2 bg-rose-50 text-rose-700 text-[11px] font-semibold rounded-lg border border-rose-200">
                  {pinError}
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={8}
                    value={clanPin}
                    onChange={(e) => setClanPin(e.target.value)}
                    placeholder="Đặt PIN mới (VD: 1986)"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSavingPin || !clanPin}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 shrink-0"
                >
                  {isSavingPin ? 'Đang lưu...' : 'Lưu PIN'}
                </button>
              </div>
            </form>
          </div>

          {/* Box: Quản trị Hương Ước Dòng Họ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Scroll className="w-4 h-4 text-amber-700" />
              <span>Hương Ước & Tộc Quy</span>
            </h2>

            <p className="text-xs text-slate-500">
              Quy tắc nếp sống, rèn đức luyện tài, hiếu kính tổ tiên và giữ gìn gia phong dòng họ.
            </p>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-amber-950 font-serif line-clamp-1">
                {currentFamily.covenant_title || 'Hương Ước & Tộc Quy Dòng Họ'}
              </div>
              <div className="text-[11px] text-amber-900 line-clamp-2 italic font-serif">
                "{currentFamily.covenant_preamble || 'Cây có cội mới trổ cành xanh lá, nước có nguồn mới biển rộng sông sâu...'}"
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCovenantModalOpen(true)}
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Soạn Thảo / Sửa Hương Ước</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thay Đổi Ảnh Từ Đường */}
      <AncestralBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        family={currentFamily}
      />

      {/* Modal Chỉnh Sửa Hương Ước */}
      <ClanCovenantModal
        isOpen={isCovenantModalOpen}
        onClose={() => setIsCovenantModalOpen(false)}
        family={currentFamily}
      />
    </div>
  );
};

export default FamilySettingsPage;
