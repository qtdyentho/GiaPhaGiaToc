import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Heart,
  MessageSquare,
  Eye,
  Filter,
  Landmark,
  Share2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClanChronicle, ChronicleCategory, CHRONICLE_CATEGORY_LABELS } from '../types/chronicle';
import { ClanChronicleService } from '../services/ClanChronicleService';
import { ChronicleCard } from '../components/chronicles/ChronicleCard';
import { CreateChronicleModal } from '../components/chronicles/CreateChronicleModal';

export const ClanChroniclesPage: React.FC = () => {
  const { activeFamily, isFamilyAdmin } = useAuth();
  const currentFamId = activeFamily?.id || '';

  const [chronicles, setChronicles] = useState<ClanChronicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = async () => {
    if (!currentFamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await ClanChronicleService.getChronicles(
        currentFamId,
        selectedCategory === 'ALL' ? undefined : (selectedCategory as ChronicleCategory),
        searchQuery
      );
      setChronicles(list);
    } catch (err) {
      console.warn('Lỗi tải danh sách ký sự gia tộc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFamId, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleLike = async (id: string) => {
    const res = await ClanChronicleService.likeChronicle(id, currentFamId);
    if (res.success) {
      setChronicles((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes_count: res.likes } : c))
      );
    }
  };

  const featuredChronicles = chronicles.filter((c) => c.is_featured || c.is_pinned);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* ── 1. Header Banner ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kho Tàng Lưu Ký & Ký Sự Họ Tộc</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Lưu Ký & Ký Sự Gia Tộc
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Lưu giữ những câu chuyện xúc động, hồi ký tiền nhân, ký sự ngày hội giỗ tổ và truyền thống hiếu học cho muôn đời con cháu mai sau.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/app/clan/intro"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Landmark className="w-4 h-4" />
            <span>Giới Thiệu Dòng Họ</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Bài / Gửi Lưu Ký</span>
          </button>
        </div>
      </div>

      {/* ── 2. Filter & Search Bar ── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất cả ({chronicles.length})
            </button>
            {Object.entries(CHRONICLE_CATEGORY_LABELS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === key
                    ? 'bg-[#166534] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ký sự, tác giả..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </form>
        </div>
      </div>

      {/* ── 3. Featured Stories (if any) ── */}
      {selectedCategory === 'ALL' && !searchQuery && featuredChronicles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>KÝ SỰ & BÀI VIẾT NỔI BẬT ĐƯỢC GHIM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredChronicles.slice(0, 3).map((chronicle) => (
              <ChronicleCard
                key={chronicle.id}
                chronicle={chronicle}
                onLike={handleLike}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Main Chronicles Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
          <span>DANH SÁCH BÀI VIẾT & LƯU BÚT ({chronicles.length})</span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-[#166534] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Đang nạp danh sách ký sự gia tộc...</p>
          </div>
        ) : chronicles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="text-4xl">📜</div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chưa Có Bài Viết Nào Trong Danh Mục Này
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Hãy là người đầu tiên ghi lại những câu chuyện truyền thống, sự tích tiền nhân hoặc ký sự giỗ tổ cho dòng họ.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 rounded-2xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-md transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Gửi Bài Viết Ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chronicles.map((chronicle) => (
              <ChronicleCard
                key={chronicle.id}
                chronicle={chronicle}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Chronicle Modal */}
      <CreateChronicleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
export default ClanChroniclesPage;
