import React, { useState } from 'react';
import { 
  X, Save, Landmark, Plus, Trash2, BookOpen, AlertCircle, 
  Upload, Image as ImageIcon, Sparkles, Check, ChevronRight 
} from 'lucide-react';
import { ClanIntroConfig, ClanIntroCouplet, ClanLeaderItem } from '../../types/chronicle';
import { ClanChronicleService } from '../../services/ClanChronicleService';
import { compressImage, ANCESTRAL_HALL_PRESETS } from '../../lib/imageCompressor';

interface EditClanIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: ClanIntroConfig) => void;
  initialIntro: ClanIntroConfig;
}

export const EditClanIntroModal: React.FC<EditClanIntroModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIntro,
}) => {
  const [foundingAncestor, setFoundingAncestor] = useState(initialIntro.founding_ancestor || '');
  const [foundingYearEra, setFoundingYearEra] = useState(initialIntro.founding_year_era || '');
  const [originProvince, setOriginProvince] = useState(initialIntro.origin_province || '');
  const [historicalOrigin, setHistoricalOrigin] = useState(initialIntro.historical_origin || '');
  const [clanMotto, setClanMotto] = useState(initialIntro.clan_motto || '');
  const [ancestralHallAddress, setAncestralHallAddress] = useState(initialIntro.ancestral_hall_address || '');
  const [ancestralHallArchitect, setAncestralHallArchitect] = useState(initialIntro.ancestral_hall_architect || '');
  const [relicsDescription, setRelicsDescription] = useState(initialIntro.relics_description || '');

  // Ancestral Hall Images State
  const [ancestralHallImages, setAncestralHallImages] = useState<string[]>(
    initialIntro.ancestral_hall_images && initialIntro.ancestral_hall_images.length > 0
      ? initialIntro.ancestral_hall_images
      : [ANCESTRAL_HALL_PRESETS[0].url, ANCESTRAL_HALL_PRESETS[1].url]
  );
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const [couplets, setCouplets] = useState<ClanIntroCouplet[]>(
    initialIntro.couplets && initialIntro.couplets.length > 0
      ? initialIntro.couplets
      : [{ horizontal: 'ĐỨC LƯU QUANG', left: 'Tổ tông công đức thiên niên thịnh', right: 'Tử hiếu tôn hiền vạn đại vinh' }]
  );

  const [leadershipBoard, setLeadershipBoard] = useState<ClanLeaderItem[]>(
    initialIntro.leadership_board && initialIntro.leadership_board.length > 0
      ? initialIntro.leadership_board
      : [
          { role: 'Trưởng Tộc', name: 'Đại diện Trưởng tộc' },
          { role: 'Phó Trưởng Tộc', name: 'Ban Quản trị dòng họ' },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCouplet = () => {
    setCouplets([...couplets, { horizontal: '', left: '', right: '' }]);
  };

  const handleRemoveCouplet = (index: number) => {
    setCouplets(couplets.filter((_, i) => i !== index));
  };

  const handleAddLeader = () => {
    setLeadershipBoard([...leadershipBoard, { role: 'Thành viên Hội đồng', name: '' }]);
  };

  const handleRemoveLeader = (index: number) => {
    setLeadershipBoard(leadershipBoard.filter((_, i) => i !== index));
  };

  // Image Management Handlers
  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setAncestralHallImages([...ancestralHallImages, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleSelectPresetImage = (url: string) => {
    if (!ancestralHallImages.includes(url)) {
      setAncestralHallImages([...ancestralHallImages, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setAncestralHallImages(ancestralHallImages.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setError(null);
    try {
      const file = files[0];
      // Tự động nén ảnh chất lượng cao max 1200px
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.82);
      setAncestralHallImages([...ancestralHallImages, compressedBase64]);
    } catch (err: any) {
      setError('Lỗi khi xử lý nén ảnh: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await ClanChronicleService.updateClanIntro(initialIntro.family_id, {
      founding_ancestor: foundingAncestor.trim(),
      founding_year_era: foundingYearEra.trim(),
      origin_province: originProvince.trim(),
      historical_origin: historicalOrigin.trim(),
      clan_motto: clanMotto.trim(),
      ancestral_hall_address: ancestralHallAddress.trim(),
      ancestral_hall_architect: ancestralHallArchitect.trim(),
      ancestral_hall_images: ancestralHallImages,
      relics_description: relicsDescription.trim(),
      couplets,
      leadership_board: leadershipBoard,
    });

    setIsSubmitting(false);
    if (res.success && res.intro) {
      onSuccess(res.intro);
      onClose();
    } else {
      setError(res.error || 'Có lỗi xảy ra khi lưu thông tin.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Chỉnh Sửa Giới Thiệu & Lịch Sử Dòng Họ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cập nhật cội nguồn phát tích, ảnh từ đường, hoành phi câu đối và ban trị sự
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Cội Nguồn Phát Tích */}
          <div className="p-5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <span>📜</span> 1. Cội Nguồn & Thủy Tổ Phát Tích
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cụ Thủy Tổ / Khởi Tổ
                </label>
                <input
                  type="text"
                  value={foundingAncestor}
                  onChange={(e) => setFoundingAncestor(e.target.value)}
                  placeholder="VD: Cụ Khởi Tổ Nguyễn Văn..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Niên đại phát tích
                </label>
                <input
                  type="text"
                  value={foundingYearEra}
                  onChange={(e) => setFoundingYearEra(e.target.value)}
                  placeholder="VD: Thế kỷ XV thời Hậu Lê..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quê cha đất tổ (Địa danh)
                </label>
                <input
                  type="text"
                  value={originProvince}
                  onChange={(e) => setOriginProvince(e.target.value)}
                  placeholder="VD: Xã Yên Từ, Huyện Yên Mô, Ninh Bình"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lịch sử cội nguồn, sự tích khai hoang lập ấp & di cư
              </label>
              <textarea
                rows={4}
                value={historicalOrigin}
                onChange={(e) => setHistoricalOrigin(e.target.value)}
                placeholder="Ghi chép nguồn gốc tổ tiên di cư, công đức tiền nhân..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phương châm sống & Cổ huấn tổ tiên
              </label>
              <input
                type="text"
                value={clanMotto}
                onChange={(e) => setClanMotto(e.target.value)}
                placeholder="VD: Uống nước nhớ nguồn • Đoàn kết tương thân • Rạng danh tiên tổ"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Quản Lý Hình Ảnh Từ Đường & Presets */}
          <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                <span>🖼️</span> 2. Quản Lý Hình Ảnh Từ Đường & Nhà Thờ Họ
              </h3>
              <span className="text-[11px] text-slate-400">
                Đã chọn: <strong>{ancestralHallImages.length}</strong> ảnh
              </span>
            </div>

            {/* Current Images List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ancestralHallImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative h-28 rounded-xl overflow-hidden border-2 border-emerald-500/40 dark:border-emerald-700/60 group shadow-xs"
                >
                  <img
                    src={imgUrl}
                    alt={`Từ đường ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                    Ảnh #{idx + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload & Add Custom URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Upload with Auto-compression */}
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Tải ảnh từ máy tính (Tự động nén WebP)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-bold cursor-pointer transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCompressing ? 'Đang nén ảnh...' : 'Chọn file ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isCompressing}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                </div>
              </div>

              {/* Add Custom URL */}
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Hoặc nhập đường dẫn link ảnh (URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#166534] text-white text-xs font-bold shrink-0 hover:bg-[#14532d]"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bộ Sưu Tập Mẫu Từ Đường Cổ Truyền Việt Nam (Bấm để chọn thêm)</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ANCESTRAL_HALL_PRESETS.map((preset) => {
                  const isSelected = ancestralHallImages.includes(preset.url);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPresetImage(preset.url)}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 relative ${
                        isSelected
                          ? 'bg-emerald-100/80 dark:bg-emerald-950 border-emerald-500 ring-2 ring-emerald-500'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <img
                        src={preset.thumbnail}
                        alt={preset.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {preset.title}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {isSelected ? 'Đã thêm vào bộ ảnh' : 'Bấm để thêm'}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Hoành Phi & Câu Đối */}
          <div className="p-5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/60 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-950 dark:text-rose-300 flex items-center gap-2">
                <span>🏮</span> 3. Hoành Phi & Câu Đối Từ Đường
              </h3>
              <button
                type="button"
                onClick={handleAddCouplet}
                className="text-xs font-bold text-rose-800 dark:text-rose-300 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm câu đối
              </button>
            </div>

            <div className="space-y-3">
              {couplets.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Bộ câu đối #{idx + 1}</span>
                    {couplets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCouplet(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={c.horizontal || ''}
                      onChange={(e) => {
                        const next = [...couplets];
                        next[idx].horizontal = e.target.value;
                        setCouplets(next);
                      }}
                      placeholder="Bức Đại tự / Hoành phi (VD: ĐỨC LƯU QUANG)"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={c.left}
                      onChange={(e) => {
                        const next = [...couplets];
                        next[idx].left = e.target.value;
                        setCouplets(next);
                      }}
                      placeholder="Vế trái: Tổ tông công đức thiên niên thịnh"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={c.right}
                      onChange={(e) => {
                        const next = [...couplets];
                        next[idx].right = e.target.value;
                        setCouplets(next);
                      }}
                      placeholder="Vế phải: Tử hiếu tôn hiền vạn đại vinh"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Nhà Thờ Họ & Di Tích Chi Tiết */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏯</span> 4. Thông Tin Địa Lý & Kiến Trúc Từ Đường
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ Nhà thờ tổ / Từ đường
                </label>
                <input
                  type="text"
                  value={ancestralHallAddress}
                  onChange={(e) => setAncestralHallAddress(e.target.value)}
                  placeholder="Thôn/Xóm, Xã, Huyện, Tỉnh..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kiến trúc & Năm trùng tu
                </label>
                <input
                  type="text"
                  value={ancestralHallArchitect}
                  onChange={(e) => setAncestralHallArchitect(e.target.value)}
                  placeholder="VD: 3 gian 2 chái, trùng tu năm 2020..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Di vật, bảo vật, văn bia & sắc phong lưu giữ
              </label>
              <textarea
                rows={2}
                value={relicsDescription}
                onChange={(e) => setRelicsDescription(e.target.value)}
                placeholder="Ghi chú về văn bia, đỉnh đồng, gia phả cổ, sắc phong..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Ban Trị Sự & Hội Đồng Gia Tộc */}
          <div className="p-5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/60 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-blue-950 dark:text-blue-300 flex items-center gap-2">
                <span>👥</span> 5. Hội Đồng Gia Tộc & Ban Trị Sự Đương Nhiệm
              </h3>
              <button
                type="button"
                onClick={handleAddLeader}
                className="text-xs font-bold text-blue-800 dark:text-blue-300 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm thành viên ban trị sự
              </button>
            </div>

            <div className="space-y-3">
              {leadershipBoard.map((leader, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl relative"
                >
                  <input
                    type="text"
                    value={leader.role}
                    onChange={(e) => {
                      const next = [...leadershipBoard];
                      next[idx].role = e.target.value;
                      setLeadershipBoard(next);
                    }}
                    placeholder="Chức vụ (VD: Trưởng tộc)"
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={leader.name}
                    onChange={(e) => {
                      const next = [...leadershipBoard];
                      next[idx].name = e.target.value;
                      setLeadershipBoard(next);
                    }}
                    placeholder="Họ và tên"
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={leader.phone || ''}
                      onChange={(e) => {
                        const next = [...leadershipBoard];
                        next[idx].phone = e.target.value;
                        setLeadershipBoard(next);
                      }}
                      placeholder="Số ĐT liên hệ"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                    {leadershipBoard.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLeader(idx)}
                        className="text-red-500 hover:text-red-700 p-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-6 py-2.5 rounded-2xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thông Tin Giới Thiệu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
