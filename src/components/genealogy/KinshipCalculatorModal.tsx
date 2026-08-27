import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ArrowRightLeft, Sparkles, Award, Landmark, GitMerge, Heart, BookOpen, Network
} from 'lucide-react';
import { Member, KinshipResult } from '../../types/database';
import { KinshipService } from '../../services/genealogy/KinshipService';
import { GenealogyService } from '../../services/GenealogyService';
import { useAuth } from '../../contexts/AuthContext';

interface KinshipCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMemberAId?: string;
  initialMemberBId?: string;
}

export const KinshipCalculatorModal: React.FC<KinshipCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialMemberAId,
  initialMemberBId,
}) => {
  const { activeFamily } = useAuth();
  const currentFamilyId = activeFamily?.id;

  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function loadMembers() {
      if (isOpen && currentFamilyId) {
        try {
          const members = await GenealogyService.getMembers(currentFamilyId);
          setFamilyMembers(members || []);
        } catch (err) {
          console.error('Lỗi khi tải thành viên tra cứu xưng hô:', err);
        }
      }
    }
    loadMembers();
  }, [isOpen, currentFamilyId]);

  const [memberAId, setMemberAId] = useState<string>('');
  const [memberBId, setMemberBId] = useState<string>('');

  useEffect(() => {
    if (familyMembers.length > 0) {
      if (initialMemberAId) setMemberAId(initialMemberAId);
      else if (!memberAId) setMemberAId(familyMembers[0]?.id || '');

      if (initialMemberBId) setMemberBId(initialMemberBId);
      else if (!memberBId) setMemberBId(familyMembers[1]?.id || familyMembers[0]?.id || '');
    }
  }, [familyMembers, initialMemberAId, initialMemberBId]);

  const [kinshipResult, setKinshipResult] = useState<KinshipResult | null>(null);

  useEffect(() => {
  }, [initialMemberAId, initialMemberBId]);

  useEffect(() => {
    if (!memberAId || !memberBId) return;
    KinshipService.calculateKinship(memberAId, memberBId, familyMembers)
      .then((res) => setKinshipResult(res))
      .catch((err) => console.error(err));
  }, [memberAId, memberBId, familyMembers]);

  const memberA = useMemo(() => familyMembers.find((m) => m.id === memberAId), [familyMembers, memberAId]);
  const memberB = useMemo(() => familyMembers.find((m) => m.id === memberBId), [familyMembers, memberBId]);

  if (!isOpen) return null;

  const handleSwap = () => {
    const temp = memberAId;
    setMemberAId(memberBId);
    setMemberBId(temp);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-amber-300 animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#166534] via-[#14532D] to-[#0F3D21] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/30 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tra Cứu Danh Xưng & Phân Vai Vế Dòng Họ
              </h3>
              <p className="text-xs text-emerald-100">
                Tính toán xưng hô chuẩn xác theo tục lệ « Bé bằng củ khoai, cứ vai mà gọi »
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 2 Member Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            {/* Member A */}
            <div className="md:col-span-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <label className="text-[11px] font-bold text-[#166534] uppercase tracking-wider block">
                Người Xưng (Tôi / A)
              </label>
              <select
                value={memberAId}
                onChange={(e) => setMemberAId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} — Đời {m.generation_index || '?'}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition"
                title="Đảo vị trí"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-700" />
              </button>
            </div>

            {/* Member B */}
            <div className="md:col-span-5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                Người Được Gọi (B)
              </label>
              <select
                value={memberBId}
                onChange={(e) => setMemberBId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-700"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} — Đời {m.generation_index || '?'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Card */}
          {kinshipResult && (
            <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-amber-200 pb-3">
                <div className="text-[11px] font-bold text-amber-900 uppercase">Kết Quả Danh Xưng</div>
                <h4 className="text-xl font-black text-amber-950 font-serif mt-1">
                  {memberA?.first_name} gọi {memberB?.first_name} là «{' '}
                  <span className="text-[#166534] underline decoration-amber-400">
                    {kinshipResult.term_a_calls_b}
                  </span>{' '}
                  »
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {memberB?.first_name} gọi {memberA?.first_name} là «{' '}
                  <strong>{kinshipResult.term_b_calls_a}</strong> »
                </p>
              </div>

              {/* 3 Detail Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tổ Tiên Chung</div>
                  <div className="font-bold text-slate-900 font-serif mt-0.5">{kinshipResult.lca_name}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Thứ Bậc</div>
                  <div className="font-bold text-[#166534] mt-0.5">
                    {kinshipResult.seniority === 'B_IS_SENIOR' ? 'B ở Vế Trên' : kinshipResult.seniority === 'A_IS_SENIOR' ? 'A ở Vế Trên' : 'Đồng thế hệ'}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Khoảng Cách Đời</div>
                  <div className="font-bold text-amber-900 mt-0.5">ΔG = {kinshipResult.generation_distance} thế hệ</div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3.5 bg-amber-100/50 rounded-xl border-l-4 border-amber-600 text-xs text-amber-950 font-serif italic">
                "{kinshipResult.explanation}"
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
