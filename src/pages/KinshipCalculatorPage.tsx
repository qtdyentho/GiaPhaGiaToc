import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, ArrowRightLeft, Sparkles, UserCheck, ShieldCheck, 
  BookOpen, GitMerge, Network, Check, Search, ChevronRight,
  Info, Heart, Landmark, HelpCircle, Award
} from 'lucide-react';
import { Member, KinshipResult } from '../types/database';
import { KinshipService } from '../services/genealogy/KinshipService';
import { mockMembers } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const KinshipCalculatorPage: React.FC = () => {
  const { activeFamily } = useAuth();
  const currentFamilyId = activeFamily?.id || '';

  // Filter members belonging to current family
  const familyMembers = useMemo(() => {
    if (!currentFamilyId) return [];
    return mockMembers.filter((m) => m.family_id === currentFamilyId);
  }, [currentFamilyId]);

  // Default selection
  const [memberAId, setMemberAId] = useState<string>(
    familyMembers[0]?.id || ''
  );
  const [memberBId, setMemberBId] = useState<string>(
    familyMembers[1]?.id || ''
  );

  const [kinshipResult, setKinshipResult] = useState<KinshipResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const memberA = useMemo(
    () => familyMembers.find((m) => m.id === memberAId),
    [familyMembers, memberAId]
  );
  const memberB = useMemo(
    () => familyMembers.find((m) => m.id === memberBId),
    [familyMembers, memberBId]
  );

  // Compute kinship whenever selection changes
  useEffect(() => {
    if (!memberAId || !memberBId) return;

    setLoading(true);
    KinshipService.calculateKinship(memberAId, memberBId, familyMembers)
      .then((res) => {
        setKinshipResult(res);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [memberAId, memberBId, familyMembers]);

  const handleSwap = () => {
    const temp = memberAId;
    setMemberAId(memberBId);
    setMemberBId(temp);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Trí Tuệ Nhân Tạo & Thuật Toán Phân Vai Vế Gia Tộc</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-serif tracking-tight text-amber-950">
            Tra Cứu Danh Xưng & Thứ Bậc Dòng Họ
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Tính toán chính xác danh xưng xưng hô chuẩn mực giữa 2 thành viên bất kỳ theo cành nhánh, đời thứ và tục lệ gia phong <em>« Bé bằng củ khoai, cứ vai mà gọi »</em>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/app/genealogy"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5"
          >
            <Network className="w-4 h-4 text-[#166534]" />
            <span>Xem Cây Gia Phả</span>
          </Link>
        </div>
      </div>

      {/* Selectors Grid: Member A <-> Swap <-> Member B */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Member A Selector */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px]">
                  A
                </span>
                <span>Người Xưng (Tôi / Người A)</span>
              </label>
              {memberA?.generation_index && (
                <span className="text-[11px] font-bold bg-white text-[#166534] px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Đời thứ {memberA.generation_index}
                </span>
              )}
            </div>

            <select
              value={memberAId}
              onChange={(e) => setMemberAId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#166534]"
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} — Đời {m.generation_index || '?'} ({m.gender === 'FEMALE' ? 'Nữ' : 'Nam'})
                </option>
              ))}
            </select>

            {memberA && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#166534] font-bold flex items-center justify-center shrink-0 border border-emerald-300 text-sm">
                  {memberA.avatar_url ? (
                    <img
                      src={memberA.avatar_url}
                      alt={memberA.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    memberA.first_name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {memberA.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {memberA.branch_code ? `Chi/Nhánh: ${memberA.branch_code}` : 'Thành viên trực hệ'} • {memberA.is_direct_lineage ? 'Dòng Trưởng (Đích tôn)' : 'Dòng Thứ'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Swap Button in Middle */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              title="Đảo vị trí Người A và Người B"
              className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-xs hover:shadow-sm transition hover:scale-105"
            >
              <ArrowRightLeft className="w-5 h-5 text-amber-700" />
            </button>
          </div>

          {/* Member B Selector */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[10px]">
                  B
                </span>
                <span>Người Được Gọi (Người B)</span>
              </label>
              {memberB?.generation_index && (
                <span className="text-[11px] font-bold bg-white text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Đời thứ {memberB.generation_index}
                </span>
              )}
            </div>

            <select
              value={memberBId}
              onChange={(e) => setMemberBId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700"
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} — Đời {m.generation_index || '?'} ({m.gender === 'FEMALE' ? 'Nữ' : 'Nam'})
                </option>
              ))}
            </select>

            {memberB && (
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 border border-amber-300 text-sm">
                  {memberB.avatar_url ? (
                    <img
                      src={memberB.avatar_url}
                      alt={memberB.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    memberB.first_name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {memberB.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {memberB.branch_code ? `Chi/Nhánh: ${memberB.branch_code}` : 'Thành viên trực hệ'} • {memberB.is_direct_lineage ? 'Dòng Trưởng (Đích tôn)' : 'Dòng Thứ'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kinship Calculation Results Card */}
      {kinshipResult && (
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 bg-[radial-gradient(#C49A3A_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Result Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-950 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>KẾT QUẢ DANH XƯNG CHUẨN XÁC</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif tracking-tight">
                {memberA?.first_name} gọi {memberB?.first_name} là «{' '}
                <span className="text-[#166534] underline decoration-amber-400">
                  {kinshipResult.term_a_calls_b}
                </span>{' '}
                »
              </h2>
              <p className="text-xs text-slate-600">
                Ngược lại, {memberB?.first_name} gọi {memberA?.first_name} là «{' '}
                <strong>{kinshipResult.term_b_calls_a}</strong> »
              </p>
            </div>

            {/* Seniority Badge */}
            <div className="p-3.5 rounded-2xl bg-white border border-amber-300 shadow-2xs text-center shrink-0">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Thứ Bậc Gia Tộc
              </div>
              <div className="text-xs font-black text-amber-950 mt-0.5">
                {kinshipResult.seniority === 'B_IS_SENIOR'
                  ? 'B ở Vế Trên (Bậc Anh / Bác)'
                  : kinshipResult.seniority === 'A_IS_SENIOR'
                  ? 'A ở Vế Trên (Bậc Anh / Bác)'
                  : 'Ngang Hàng / Đồng Thế Hệ'}
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                Khoảng cách thế hệ: ΔG = {kinshipResult.generation_distance} đời
              </div>
            </div>
          </div>

          {/* 3 Detail Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Block 1: LCA Tổ Tiên Chung */}
            <div className="p-4 rounded-2xl bg-white/90 border border-amber-200 space-y-1.5">
              <div className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-700" />
                <span>Tổ Tiên Chung Gần Nhất (LCA)</span>
              </div>
              <div className="text-xs font-bold text-slate-900 font-serif">
                {kinshipResult.lca_name}
              </div>
              <p className="text-[11px] text-slate-500">
                Gốc gác chung kết nối huyết thống giữa 2 cành nhánh gia đình.
              </p>
            </div>

            {/* Block 2: Căn cứ vai vế */}
            <div className="p-4 rounded-2xl bg-white/90 border border-amber-200 space-y-1.5">
              <div className="text-[11px] font-bold text-[#166534] uppercase flex items-center gap-1.5">
                <GitMerge className="w-4 h-4 text-[#166534]" />
                <span>Quy Tắc Nhánh Cành</span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                {memberA?.branch_code || 'Chi 1'} ↔ {memberB?.branch_code || 'Chi 2'}
              </div>
              <p className="text-[11px] text-slate-500">
                Phân định rõ rệt giữa cành Trưởng (Đích tôn) và cành Thứ.
              </p>
            </div>

            {/* Block 3: Gợi ý xưng hô */}
            <div className="p-4 rounded-2xl bg-white/90 border border-amber-200 space-y-1.5">
              <div className="text-[11px] font-bold text-rose-900 uppercase flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-700" />
                <span>Giao Tiếp Ngày Giỗ Tết</span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                {kinshipResult.greeting_guide || 'Xưng hô lễ phép, tôn ti trật tự'}
              </div>
              <p className="text-[11px] text-slate-500">
                Giữ trọn đạo hiếu và gia phong trong mọi cuộc gặp gỡ gia tộc.
              </p>
            </div>
          </div>

          {/* Lineage Explanation Box */}
          <div className="p-5 rounded-2xl bg-amber-100/60 border-l-4 border-amber-600 text-xs sm:text-sm text-amber-950 font-serif leading-relaxed space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Căn Cứ Văn Hóa & Tộc Ước Dòng Họ:</span>
            </div>
            <p className="italic">
              "{kinshipResult.explanation}"
            </p>
          </div>
        </div>
      )}

      {/* Clan Kinship Quick Reference Matrix (Bảng Tra Cứu Nhanh 5 Đời) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#166534]" />
          <span>Bảng Tra Cứu Nhanh Thứ Bậc 5 Đời Theo Phong Tục Gia Tộc Việt Nam</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 border-r border-slate-200">Khoảng Cách Đời</th>
                <th className="p-3 border-r border-slate-200">Bậc Tiền Bối (Vế Trên)</th>
                <th className="p-3 border-r border-slate-200">Bậc Hậu Bối (Vế Dưới)</th>
                <th className="p-3">Nguyên Tắc Xưng Hô Truyền Thống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-amber-900 border-r border-slate-200">
                  Đồng thế hệ (ΔG = 0)
                </td>
                <td className="p-3 font-semibold text-[#166534] border-r border-slate-200">
                  Anh họ / Chị họ (Con Bác)
                </td>
                <td className="p-3 font-semibold border-r border-slate-200">
                  Em họ (Con Chú)
                </td>
                <td className="p-3 text-[11px] text-slate-600">
                  Dù nhiều tuổi hơn ngoài đời nhưng sinh ra ở nhánh con Chú thì vẫn gọi nhánh con Bác là Anh/Chị.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-amber-900 border-r border-slate-200">
                  Lệch 1 đời (ΔG = 1)
                </td>
                <td className="p-3 font-semibold text-[#166534] border-r border-slate-200">
                  Bác họ / Chú họ / Cô / Cậu / Dì
                </td>
                <td className="p-3 font-semibold border-r border-slate-200">
                  Cháu
                </td>
                <td className="p-3 text-[11px] text-slate-600">
                  Anh của Bố gọi là Bác, em trai của Bố gọi là Chú, chị/em gái của Bố gọi là Cô.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-amber-900 border-r border-slate-200">
                  Lệch 2 đời (ΔG = 2)
                </td>
                <td className="p-3 font-semibold text-[#166534] border-r border-slate-200">
                  Ông Trưởng / Ông Chú / Bà Cô
                </td>
                <td className="p-3 font-semibold border-r border-slate-200">
                  Cháu nội tộc
                </td>
                <td className="p-3 text-[11px] text-slate-600">
                  Ngang hàng với Ông/Bà nội. Thêm hậu tố Trưởng/Thứ/Chú theo đúng thứ bậc của đời trước.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-amber-900 border-r border-slate-200">
                  Lệch 3 đời (ΔG = 3)
                </td>
                <td className="p-3 font-semibold text-[#166534] border-r border-slate-200">
                  Cụ / Cố nội tộc
                </td>
                <td className="p-3 font-semibold border-r border-slate-200">
                  Chắt
                </td>
                <td className="p-3 text-[11px] text-slate-600">
                  Bậc Cụ sinh ra Ông/Bà. Con cháu xưng Chắt.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-amber-900 border-r border-slate-200">
                  Lệch 4 đời (ΔG = 4)
                </td>
                <td className="p-3 font-semibold text-[#166534] border-r border-slate-200">
                  Cụ Kỵ
                </td>
                <td className="p-3 font-semibold border-r border-slate-200">
                  Chút
                </td>
                <td className="p-3 text-[11px] text-slate-600">
                  Bậc Kỵ sinh ra Cụ. Con cháu đời sau xưng Chút.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-amber-900 border-r border-slate-200">
                  Lệch 5 đời trở lên (ΔG ≥ 5)
                </td>
                <td className="p-3 font-semibold text-[#166534] border-r border-slate-200">
                  Tiên Tổ Tiền Nhân
                </td>
                <td className="p-3 font-semibold border-r border-slate-200">
                  Chít / Hậu duệ
                </td>
                <td className="p-3 text-[11px] text-slate-600">
                  Các bậc Thủy Tổ, Cao Tằng Tổ Khảo lập làng dựng họ muôn đời phụng thờ.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KinshipCalculatorPage;
