import React, { useState } from 'react';
import { 
  Shield, MapPin, Building, Copy, Plus, UserCheck, Key, CheckCircle2,
  Image, Camera, Sparkles, Landmark, Check, Scroll
} from 'lucide-react';
import { mockFamily, mockMemberships } from '../services/mockData';
import { ROLE_LABELS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { AncestralBannerModal, ANCESTRAL_PRESETS } from '../components/family/AncestralBannerModal';
import { ClanCovenantModal } from '../components/family/ClanCovenantModal';

export const FamilySettingsPage: React.FC = () => {
  const { activeFamily, updateFamily } = useAuth();
  const currentFamily = activeFamily || mockFamily;
  const [copied, setCopied] = useState(false);
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [generatedToken, setGeneratedToken] = useState('GP-INVITE-2026-HN01');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isCovenantModalOpen, setIsCovenantModalOpen] = useState(false);

  // Form states
  const [familyName, setFamilyName] = useState(currentFamily.name);
  const [ancestralHallAddress, setAncestralHallAddress] = useState(currentFamily.ancestral_hall_address || '');
  const [description, setDescription] = useState(currentFamily.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bannerImageUrl = currentFamily.banner_url || ANCESTRAL_PRESETS[0].url;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://giapha.vn/join?token=${generatedToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <p className="text-xs text-slate-500">Cấu hình thông tin dòng họ, hình ảnh Từ Đường và phân công ban quản trị</p>
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
                  <h3 className="text-xl font-bold font-serif text-amber-50">
                    {currentFamily.name}
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5 opacity-90">
                    {currentFamily.ancestral_hall_address || 'Chưa cập nhật địa chỉ nhà thờ tổ'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              * Ảnh này sẽ hiển thị làm biểu tượng trang trọng nhất trên trang chủ dòng họ cho tất cả bà con cùng chiêm bái.
            </p>
          </div>

          {/* Box 2: Thông tin cơ bản */}
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-[#166534]" />
              <span>Hồ Sơ Gia Tộc</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Tên Gia Tộc</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Mã Gia Tộc (Code)</label>
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

        {/* Right 1 Col: Mã mời & Hương ước */}
        <div className="space-y-6">
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

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Mời Bà Con Vào Xem Gia Phả</span>
            </h2>

            <p className="text-xs text-slate-500">
              Tạo đường dẫn chia sẻ cho con cháu trong dòng họ cùng truy cập xem phả hệ, ngày giỗ và đóng góp công đức.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Vai Trò Khi Tham Gia</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                <option value="MEMBER">Bà con gia tộc (Xem phả hệ, lịch giỗ & đóng quỹ)</option>
                <option value="GENEALOGY_ADMIN">Ban Gia Phả (Biên soạn & chỉnh sửa cây)</option>
                <option value="TREASURER">Thủ Quỹ (Ghi chép thu chi dòng họ)</option>
                <option value="VIEWER">Khách viếng thăm (Chỉ xem)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-600">Đường dẫn mời tham gia:</div>
              <div className="text-xs font-bold text-[#166534] break-all bg-white p-2 rounded-lg border border-slate-200">
                https://giapha.vn/join?token={generatedToken}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Đã sao chép link!' : 'Sao chép link mời'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              * Mã mời có giá trị kết nối trực tiếp con cháu vào gia tộc một cách an toàn và thuận tiện.
            </div>
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
