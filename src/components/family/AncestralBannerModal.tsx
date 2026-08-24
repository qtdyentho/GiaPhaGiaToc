import React, { useState } from 'react';
import { X, Image, Upload, Check, Sparkles, Landmark, Eye } from 'lucide-react';
import { Family } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';

interface AncestralBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
}

export const ANCESTRAL_PRESETS = [
  {
    id: 'preset-1',
    name: 'Từ Đường Cổ Kính',
    description: 'Mái ngói rêu phong, chạm trổ truyền thống Bắc Bộ',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    tag: 'Kiến Trúc Cổ',
  },
  {
    id: 'preset-2',
    name: 'Gian Thờ Tiên Tổ',
    description: 'Sơn son thếp vàng, hoành phi câu đối trang nghiêm',
    url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=1600&auto=format&fit=crop',
    tag: 'Nơi Thờ Tự',
  },
  {
    id: 'preset-3',
    name: 'Nhà Thờ Tổ Ba Gian',
    description: 'Khuôn viên thanh tịnh, rợp bóng cây xanh & sân gạch',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop',
    tag: 'Từ Đường Gia Tộc',
  },
  {
    id: 'preset-4',
    name: 'Không Gian Phụng Tự',
    description: 'Khói trầm ấm cúng, hương hỏa lưu truyền muôn đời',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    tag: 'Linh Thiêng',
  },
];

export const AncestralBannerModal: React.FC<AncestralBannerModalProps> = ({
  isOpen,
  onClose,
  family,
}) => {
  const { updateFamily } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<string>(
    family.banner_url || ANCESTRAL_PRESETS[0].url
  );
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PRESETS' | 'UPLOAD' | 'URL'>('PRESETS');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateFamily(family.id, {
        banner_url: selectedUrl,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#166534] to-[#14532D] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/30 text-amber-300">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ảnh Từ Đường & Banner Gia Tộc</h3>
              <p className="text-xs text-emerald-100">
                Hiển thị trang trọng tại vị trí cao nhất của trang tổng quan dòng họ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Live Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#166534]" />
                Xem Trước Hiển Thị Thực Tế
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Tỉ lệ chuẩn 16:9 sắc nét</span>
            </div>

            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-900 group">
              <img
                src={selectedUrl}
                alt="Banner Từ Đường"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ANCESTRAL_PRESETS[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

              {/* Sample Overlay */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="inline-flex items-center space-x-1.5 bg-amber-500/30 text-amber-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-1 border border-amber-400/30 backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Ẩm Hà Tư Nguyên • Uống Nước Nhớ Nguồn</span>
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight drop-shadow-sm font-serif">
                  {family.name}
                </h4>
                <p className="text-[11px] text-slate-200 truncate mt-0.5 opacity-90">
                  {family.ancestral_hall_address || 'Địa chỉ nhà thờ tổ dòng họ'}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div>
            <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('PRESETS')}
                className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'PRESETS'
                    ? 'border-[#166534] text-[#166534]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mẫu Từ Đường Truyền Thống
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('UPLOAD')}
                className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'UPLOAD'
                    ? 'border-[#166534] text-[#166534]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Tải Ảnh Lên Từ Máy
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('URL')}
                className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'URL'
                    ? 'border-[#166534] text-[#166534]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                Nhập Link Ảnh Trực Tiếp
              </button>
            </div>

            {/* Tab 1: Presets Grid */}
            {activeTab === 'PRESETS' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ANCESTRAL_PRESETS.map((preset) => {
                  const isSelected = selectedUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedUrl(preset.url)}
                      className={`relative rounded-xl border p-2 cursor-pointer transition flex gap-3 items-center ${
                        isSelected
                          ? 'border-[#166534] bg-emerald-50/70 ring-2 ring-[#166534]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#166534]/40 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-white text-[#166534] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {preset.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Upload */}
            {activeTab === 'UPLOAD' && (
              <div className="mt-4">
                <label className="border-2 border-dashed border-slate-300 hover:border-[#166534] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-emerald-50/30 group">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#166534] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Bấm để chọn ảnh từ điện thoại / máy tính
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Hỗ trợ định dạng JPG, PNG, WEBP (Khuyên dùng ảnh phong cảnh ngang sắc nét)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Tab 3: Direct URL */}
            {activeTab === 'URL' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đường dẫn liên kết hình ảnh (Image URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/anh-tu-duong.jpg"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customUrl.trim()) {
                          setSelectedUrl(customUrl.trim());
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dán đường dẫn ảnh từ các dịch vụ lưu trữ hoặc ảnh trực tuyến của dòng họ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Đã cập nhật ảnh Từ Đường thành công!
              </span>
            ) : (
              'Ảnh sẽ được lưu tự động cho toàn bộ bà con trong dòng họ.'
            )}
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu Ảnh Banner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
