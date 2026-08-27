import React, { useState, useEffect } from 'react';
import { 
  Shield, MapPin, Building, Copy, Plus, UserCheck, Key, CheckCircle2,
  Image, Camera, Sparkles, Landmark, Check, Scroll, QrCode, RefreshCw, Lock, Eye, EyeOff
} from 'lucide-react';
import { ROLE_LABELS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { AncestralBannerModal, ANCESTRAL_PRESETS } from '../components/family/AncestralBannerModal';
import { ClanCovenantModal } from '../components/family/ClanCovenantModal';
import { PrintableClanQRCodeModal } from '../components/family/PrintableClanQRCodeModal';
import { ClanPassService } from '../services/security/ClanPassService';
import { ShortLinkService, ClanShortLink } from '../services/security/ShortLinkService';

export const FamilySettingsPage: React.FC = () => {
  const { user, activeFamily, activeMembership, memberships, updateFamily } = useAuth();
  const currentFamily = activeFamily;
  const [copied, setCopied] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isCovenantModalOpen, setIsCovenantModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Clan Access Pass & PIN states
  const [passToken, setPassToken] = useState<string>(() => currentFamily?.id ? `CP-FAM-${currentFamily.id.slice(0, 8).toUpperCase()}` : 'CP-FAM-CLAN');
  const [clanPin, setClanPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isSavingPin, setIsSavingPin] = useState<boolean>(false);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Unique Short Link states
  const [shortCode, setShortCode] = useState<string>(() => currentFamily?.code?.toLowerCase().slice(0, 6) || 'giaphatoc');
  const [customSlug, setCustomSlug] = useState<string>('');
  const [isEditingSlug, setIsEditingSlug] = useState<boolean>(false);
  const [isSavingSlug, setIsSavingSlug] = useState<boolean>(false);
  const [slugSuccess, setSlugSuccess] = useState<boolean>(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copiedShortUrl, setCopiedShortUrl] = useState<boolean>(false);

  // Form states
  const [familyName, setFamilyName] = useState(currentFamily?.name || '');
  const [ancestralHallAddress, setAncestralHallAddress] = useState(currentFamily?.ancestral_hall_address || '');
  const [description, setDescription] = useState(currentFamily?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clicksCount, setClicksCount] = useState<number>(0);

  const bannerImageUrl = currentFamily?.banner_url || ANCESTRAL_PRESETS[0].url;

  useEffect(() => {
    async function loadPassAndShortLink() {
      if (currentFamily?.id) {
        setFamilyName(currentFamily.name);
        setAncestralHallAddress(currentFamily.ancestral_hall_address || '');
        setDescription(currentFamily.description || '');

        const config = await ClanPassService.getFamilyPassConfig(currentFamily.id);
        if (config?.pass_token) {
          setPassToken(config.pass_token);
        }

        let link = await ShortLinkService.getShortLinkByFamily(currentFamily.id, currentFamily.name);
        if (!link) {
          const res = await ShortLinkService.createOrUpdateShortLink(currentFamily.id, config.pass_token, undefined, currentFamily.name);
          link = res.shortLink || null;
        }
        if (link) {
          setShortCode(link.short_code);
          setCustomSlug(link.short_code);
          setClicksCount(link.clicks_count || 0);
        }
      }
    }
    loadPassAndShortLink();
  }, [currentFamily?.id, currentFamily?.name]);

  const handleCopyShortLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn';
    navigator.clipboard.writeText(`${origin}/c/${shortCode}`);
    setCopiedShortUrl(true);
    setTimeout(() => setCopiedShortUrl(false), 2000);
  };

  const handleSaveCustomSlug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSlug.trim() || !currentFamily?.id) return;

    setIsSavingSlug(true);
    setSlugError(null);
    try {
      const res = await ShortLinkService.createOrUpdateShortLink(
        currentFamily.id,
        passToken,
        customSlug.trim(),
        currentFamily.name
      );
      if (res.success && res.shortLink) {
        setShortCode(res.shortLink.short_code);
        setSlugSuccess(true);
        setIsEditingSlug(false);
        setTimeout(() => setSlugSuccess(false), 3000);
      } else {
        setSlugError(res.error || 'Không thể cập nhật mã định danh gia tộc.');
      }
    } catch (err: any) {
      setSlugError(err.message || 'Lỗi khi lưu mã định danh gia tộc.');
    } finally {
      setIsSavingSlug(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clanPin.trim() || clanPin.trim().length < 4 || !currentFamily?.id) {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFamily?.id) return;
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

  if (!currentFamily) {
    return (
      <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <Building className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Chưa Chọn Dòng Họ Quản Trị</h2>
        <p className="text-xs text-slate-500">Vui lòng chọn hoặc tạo dòng họ trong hệ thống để thực hiện cài đặt.</p>
      </div>
    );
  }

  // Lọc ban quản trị theo dòng họ hiện tại
  const familyMemberships = memberships.filter((m) => m.family_id === currentFamily.id);
  const currentAdminRole = activeMembership?.role || 'OWNER';

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Left 2 Cols: Ảnh Từ Đường & Thông Tin Cơ Bản */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
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
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Thay Đổi Ảnh</span>
              </button>
            </div>

            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-900 group">
              <img
                src={bannerImageUrl}
                alt={`Từ Đường ${familyName}`}
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
                  value={currentFamily.code || 'GIAPHA'}
                  className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono"
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
                className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
              {familyMemberships.length > 0 ? (
                familyMemberships.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {user?.id === m.user_id ? user.full_name : 'Quản Trị Viên Gia Tộc'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {user?.id === m.user_id ? user.email : 'banquantri@giapha.vn'}
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROLE_LABELS[m.role]?.color}`}>
                      {ROLE_LABELS[m.role]?.label || m.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user?.full_name || 'Trưởng Tộc'}</div>
                    <div className="text-[11px] text-slate-500">{user?.email || 'truongtoc@giapha.vn'}</div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROLE_LABELS[currentAdminRole]?.color}`}>
                    {ROLE_LABELS[currentAdminRole]?.label || 'Trưởng Tộc'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mã QR, Link Rút Gọn & Hương ước */}
        <div className="space-y-6 min-w-0">
          {/* Box A: Mã QR & Link Rút Gọn & Mã PIN */}
          <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-6 rounded-2xl border border-amber-300 shadow-sm space-y-4">
            <div className="border-b border-amber-200/80 pb-2">
              <h2 className="text-sm font-bold text-amber-950 flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-amber-800" />
                <span>Mã QR & Liên Kết Tra Cứu Gia Phong</span>
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Con cháu quét mã QR hoặc truy cập <strong>Liên kết dòng họ</strong> và nhập <strong>Mã PIN gia tộc</strong> để xem Cây Phả Hệ & <strong>Số Dư Sổ Quỹ</strong>.
            </p>

            {/* Unique Short Link Card */}
            <div className="p-4 bg-white border border-amber-300/80 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase">Liên Kết Mở Cây Phả Hệ:</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {clicksCount} lượt truy cập
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#166534] truncate">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn'}/c/{shortCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyShortLink}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#166534] text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedShortUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedShortUrl ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Form Tùy Chỉnh Mã Rút Gọn / Custom Slug */}
              {!isEditingSlug ? (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingSlug(true)}
                    className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold underline block text-left cursor-pointer"
                  >
                    + Tùy chỉnh liên kết riêng (Ví dụ: ho-nguyen-yen-mo)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveCustomSlug} className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-600">Đổi Tên Định Danh Gia Tộc:</label>
                    <button
                      type="button"
                      onClick={() => setCustomSlug(ShortLinkService.suggestSlugFromName(familyName))}
                      className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      🪄 Tự tạo từ tên họ
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus-within:border-[#166534]">
                      <span className="text-[11px] text-slate-400 font-mono">/c/</span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="ten-dong-ho"
                        className="w-full text-xs font-mono font-bold text-slate-900 focus:outline-none pl-1"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingSlug || !customSlug.trim()}
                      className="px-3 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingSlug ? '...' : 'Lưu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(false)}
                      className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                  {slugError && <p className="text-[10px] text-rose-600 font-semibold">{slugError}</p>}
                </form>
              )}

              {slugSuccess && (
                <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã cập nhật liên kết dòng họ thành công!
                </p>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="w-full py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Xem, Tùy Biến & In Mã QR Từ Đường</span>
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSavingPin || !clanPin}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
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
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
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

      {/* Modal In Mã QR Dán Từ Đường */}
      <PrintableClanQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        family={currentFamily}
        passToken={passToken}
        shortCode={shortCode}
        clanPin={clanPin}
      />
    </div>
  );
};

export default FamilySettingsPage;
