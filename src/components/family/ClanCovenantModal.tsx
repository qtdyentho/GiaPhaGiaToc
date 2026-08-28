import React, { useState } from 'react';
import { X, Scroll, Plus, Trash2, Check, RotateCcw, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';
import { Family } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';

interface ClanCovenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
}

export const DEFAULT_COVENANT_TEMPLATE = {
  title: 'Hương Ước & Tộc Quy Dòng Họ',
  preamble:
    'Cây có cội mới trổ cành xanh lá, nước có nguồn mới biển rộng sông sâu. Người có tổ tông, ơn sinh thành dưỡng dục tựa biển trời. Bản Tộc ước được lập ra nhằm răn dạy con cháu giữ gìn gia phong, phát huy truyền thống hiếu học, đoàn kết tương thân tương ái, muôn đời hưng thịnh.',
  articles: [
    'Hiếu Kính Tổ Tiên: Phụng thờ tiên tổ chí thành, chăm lo hương khói, chu toàn các ngày kỵ giỗ và giữ gìn khuôn viên nhà thờ tổ tôn nghiêm.',
    'Kính Trên Nhường Dưới: Trong họ giữ nghiêm gia phong thứ bậc, kính trọng bậc cao niên, thương yêu đùm bọc con cháu, đối đãi hòa thuận trong ấm ngoài êm.',
    'Khuyến Học Khuyến Tài: Khích lệ con cháu chăm lo đèn sách, rèn đức luyện tài, đỗ đạt thành danh đóng góp vẻ vang cho dòng họ và quê hương đất nước.',
    'Đoàn Kết Tương Trợ: Bà con nội ngoại lúc khó khăn hoạn nạn cùng nhau thăm hỏi tương trợ, lúc hỷ sự cùng chia vui, giữ tròn nghĩa tình gia tộc.',
    'Giữ Gìn Gia Phong & Pháp Luật: Chấp hành nghiêm chỉnh pháp luật, tránh xa tệ nạn, giữ gìn danh dự nếp nhà và thanh danh dòng họ sáng trong.',
    'Minh Bạch Thu Chi & Sổ Quỹ: Mọi khoản đóng góp thường niên và công đức phụng tự đều được ghi chép công khai vào Sổ Quỹ, sử dụng đúng mục đích tu bổ từ đường và khuyến học.',
  ],
};

export const ClanCovenantModal: React.FC<ClanCovenantModalProps> = ({
  isOpen,
  onClose,
  family,
}) => {
  const { updateFamily } = useAuth();

  const [title, setTitle] = useState(
    family.covenant_title || `Hương Ước & Tộc Quy ${family.name}`
  );
  const [preamble, setPreamble] = useState(
    family.covenant_preamble || DEFAULT_COVENANT_TEMPLATE.preamble
  );
  const [articles, setArticles] = useState<string[]>(
    family.covenant_articles && family.covenant_articles.length > 0
      ? family.covenant_articles
      : DEFAULT_COVENANT_TEMPLATE.articles
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddArticle = () => {
    setArticles([
      ...articles,
      `Điều ${articles.length + 1}: Quy định mới về nếp sống gia tộc...`,
    ]);
  };

  const handleUpdateArticle = (index: number, val: string) => {
    const next = [...articles];
    next[index] = val;
    setArticles(next);
  };

  const handleRemoveArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const handleResetDefault = () => {
    if (
      window.confirm(
        'Bạn có chắc muốn khôi phục toàn bộ nội dung Hương ước về mẫu chuẩn truyền thống không?'
      )
    ) {
      setTitle(`Hương Ước & Tộc Quy ${family.name}`);
      setPreamble(DEFAULT_COVENANT_TEMPLATE.preamble);
      setArticles([...DEFAULT_COVENANT_TEMPLATE.articles]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateFamily(family.id, {
        covenant_title: title.trim(),
        covenant_preamble: preamble.trim(),
        covenant_articles: articles.filter((a) => a.trim().length > 0),
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#166534] to-[#14532D] dark:from-emerald-950 dark:to-slate-900 text-white flex items-center justify-between border-b dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/30 text-amber-300">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Chỉnh Sửa Hương Ước & Quy Ước Dòng Họ
              </h3>
              <p className="text-xs text-emerald-100 dark:text-emerald-300/80">
                Ghi nhận quy chế gia phong răn dạy con cháu muôn đời lưu truyền
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

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Action to reset default */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 text-xs">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>
                Bạn có thể tự do biên soạn hoặc dùng bộ mẫu Hương ước truyền thống chuẩn mực.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700 transition flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Dùng Mẫu Chuẩn</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">
              Tiêu Đề Bản Quy Ước
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hương Ước & Tộc Quy Đại Tộc Nguyễn Văn"
              required
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>

          {/* Preamble / Lời Tựa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">
              Lời Tựa / Lời Mở Đầu Răn Dạy (Preamble)
            </label>
            <textarea
              rows={3}
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              placeholder="Lời răn dạy cội nguồn, kính hiếu tiên tổ..."
              required
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534] leading-relaxed"
            />
          </div>

          {/* Articles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                Các Điều Khoản Quy Ước ({articles.length} điều)
              </label>
              <button
                type="button"
                onClick={handleAddArticle}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[#166534] dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Điều Khoản</span>
              </button>
            </div>

            <div className="space-y-3">
              {articles.map((article, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-[#166534] dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-700">
                    {idx + 1}
                  </div>
                  <textarea
                    rows={2}
                    value={article}
                    onChange={(e) => handleUpdateArticle(idx, e.target.value)}
                    required
                    placeholder={`Nội dung điều ${idx + 1}...`}
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
                  />
                  {articles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                      title="Xóa điều khoản này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Buttons inside Form */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {saveSuccess ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Đã cập nhật Hương ước dòng họ thành công!
                </span>
              ) : (
                'Hương ước sẽ hiển thị trang trọng tại trang tổng quan dòng họ.'
              )}
            </p>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Đang lưu...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lưu Hương Ước</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
