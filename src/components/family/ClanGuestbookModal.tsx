import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Send,
  Sparkles,
  Heart,
  X,
  MapPin,
  Flame,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ClanGuestbookEntry } from '../../types/database';

interface ClanGuestbookModalProps {
  familyId?: string;
  familyName?: string;
  isOpen: boolean;
  onClose: () => void;
  onIncenseOffered?: () => void;
}

// In-memory fallback guestbook records
const defaultMockGuestbook: ClanGuestbookEntry[] = [];

export const ClanGuestbookModal: React.FC<ClanGuestbookModalProps> = ({
  familyId,
  familyName = 'Dòng Họ',
  isOpen,
  onClose,
  onIncenseOffered,
}) => {
  const [entries, setEntries] = useState<ClanGuestbookEntry[]>(defaultMockGuestbook);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Form states
  const [authorName, setAuthorName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [incenseCount, setIncenseCount] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  // Load guestbook entries
  useEffect(() => {
    if (!isOpen || !familyId) return;

    async function fetchEntries() {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('clan_guestbook_entries')
            .select('*')
            .eq('family_id', familyId)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setEntries(data as ClanGuestbookEntry[]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('fetchEntries Supabase error:', err);
        }
      }
      // Fallback
      setEntries(familyId === 'fam-0000-0001' ? defaultMockGuestbook : []);
      setLoading(false);
    }

    fetchEntries();
  }, [isOpen, familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) {
      setError('Vui lòng nhập Họ tên và Lời nhắn gửi.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const newEntry: ClanGuestbookEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `gb-${Date.now()}`,
      family_id: familyId || 'fam-0000-0001',
      author_name: authorName.trim(),
      branch_name: branchName.trim() || undefined,
      location: location.trim() || undefined,
      message: message.trim(),
      incense_count: incenseCount,
      is_public: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && familyId) {
      try {
        const { error: dbError } = await supabase.from('clan_guestbook_entries').insert({
          family_id: newEntry.family_id,
          author_name: newEntry.author_name,
          branch_name: newEntry.branch_name,
          location: newEntry.location,
          message: newEntry.message,
          incense_count: newEntry.incense_count,
          is_public: true,
        });

        if (dbError) {
          console.warn('DB insert error, saving locally:', dbError.message);
        }
      } catch (err) {
        console.warn('DB insert exception:', err);
      }
    }

    setEntries((prev) => [newEntry, ...prev]);
    setSubmitting(false);
    setSubmitSuccess(true);
    setAuthorName('');
    setMessage('');
    setLocation('');
    setBranchName('');

    if (onIncenseOffered) {
      onIncenseOffered();
    }

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-[#78350F] to-amber-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sổ Lưu Bút Ký Tên Bái Tổ</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white">
                {familyName} • Cổng Từ Đường
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Form Ký Tên & Thắp Hương */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Ghi Lời Tâm Hương & Cảm Tưởng Bái Tổ</span>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đã ghi nhận lời tâm hương bái tổ thành kính của bạn!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Họ & Tên Con Cháu <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Phúc An"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Chi Phái / Ngành
                </label>
                <input
                  type="text"
                  placeholder="VD: Chi Trưởng / Đời 4"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nơi Cư Trú Hiện Tại
                </label>
                <input
                  type="text"
                  placeholder="VD: Hà Nội / TP.HCM / Hải Ngoại"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Lời Nguyện Cầu & Kính Bái Tiên Tổ <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Kính cẩn bái tạ Tiên Tổ, phù hộ độ trì cho gia quyến và con cháu dòng tộc bình an, may mắn, vạn sự hanh thông..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-serif">Số Nén Tâm Hương:</span>
                {[1, 3, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setIncenseCount(count)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-serif transition ${
                      incenseCount === count
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🔥 {count} nén
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Đang gửi...' : 'Gửi Lời Bái Tổ'}</span>
              </button>
            </div>
          </form>

          {/* Danh Sách Lưu Bút Đã Ký */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider font-serif text-amber-200">
                📜 Danh Sách Con Cháu Ghi Lưu Bút ({entries.length})
              </span>
              <span>Cập nhật theo thời gian thực</span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">Đang tải sổ lưu bút...</div>
            ) : entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                          {entry.author_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white font-serif">{entry.author_name}</div>
                          <div className="text-[10px] text-amber-300/80 flex items-center gap-2">
                            {entry.branch_name && <span>{entry.branch_name}</span>}
                            {entry.location && (
                              <span className="flex items-center gap-0.5 text-slate-400">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>{entry.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-serif flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>{entry.incense_count} nén hương</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-serif italic pl-9">
                      &quot;{entry.message}&quot;
                    </p>

                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(entry.created_at).toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Chưa có lưu bút nào. Hãy là người đầu tiên dâng nén tâm hương bái tổ!
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 font-serif">
          Hương khói phụng tự • Muôn đời nhớ ơn Tiên Tổ • Vạn sự an khang
        </div>
      </div>
    </div>
  );
};

export default ClanGuestbookModal;
