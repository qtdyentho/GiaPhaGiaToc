import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Heart, GitFork, Sparkles, Edit3, Plus, ShieldCheck, Compass, ScrollText } from 'lucide-react';
import { Member, MemberRelationship, MemorialDate } from '../types/database';
import { GenealogyService } from '../services/GenealogyService';
import { MemorialService } from '../services/calendar/MemorialService';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatLunarDate, formatDate } from '../lib/utils';
import { CreateMemorialModal } from '../components/calendar/CreateMemorialModal';
import { LunarCalendarService } from '../services/calendar/LunarCalendarService';
import { calculateBatTu } from '../lib/fengshui';
import { MemorialPrayerViewerModal } from '../components/genealogy/MemorialPrayerViewerModal';
import { useAuth } from '../contexts/AuthContext';
import { mockMembers } from '../services/mockData';

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeFamily } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'relations' | 'memorial'>('info');
  const [showAddMemorialModal, setShowAddMemorialModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const [member, setMember] = useState<Member | null>(null);
  const [memorial, setMemorial] = useState<MemorialDate | null>(null);
  const [relationships, setRelationships] = useState<MemberRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMemberData() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const found = await GenealogyService.getMemberById(id);
        if (found) {
          setMember(found);
          const [mems, tree] = await Promise.all([
            MemorialService.getMemorials(found.family_id),
            GenealogyService.getFamilyTree(found.family_id),
          ]);
          const mem = mems.find((m) => m.member_id === found.id) || null;
          setMemorial(mem);
          setRelationships(tree.relationships.filter((r) => r.member_id === found.id || r.related_member_id === found.id));
        } else if (!isSupabaseConfigured()) {
          const mockFound = mockMembers.find((m) => m.id === id) || null;
          setMember(mockFound);
        } else {
          setMember(null);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin thành viên:', err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }
    loadMemberData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 font-sans">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Đang tải hồ sơ thành viên...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg mx-auto font-sans">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy thành viên</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Thành viên này không tồn tại hoặc bạn không có quyền truy cập thông tin gia phả này.
        </p>
        <Link
          to="/app/members"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh bạ dòng họ</span>
        </Link>
      </div>
    );
  }

  const effectiveMember = member;

  const nextOccurrence = LunarCalendarService.getNextSolarDateForMemorial(
    effectiveMember.death_lunar_day || 15,
    effectiveMember.death_lunar_month || 1,
    false
  );
  const nextSolarDate = memorial?.next_solar_date || nextOccurrence.solarDate;

  const batTu = calculateBatTu(
    effectiveMember.birth_solar_date,
    effectiveMember.birth_lunar_year,
    undefined,
    undefined,
    effectiveMember.birth_time,
    effectiveMember.gender
  );

  const displayMember = effectiveMember;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Back link */}
      <Link
        to="/app/members"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại danh bạ thành viên</span>
      </Link>

      {/* Profile Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-amber-300 flex items-center justify-center font-bold text-emerald-950 text-2xl shadow-xs overflow-hidden">
              {displayMember.avatar_url ? (
                <img src={displayMember.avatar_url} alt={displayMember.full_name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                displayMember.first_name[0]
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-2xl font-black text-slate-900 font-serif">{displayMember.full_name}</h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    displayMember.life_status === 'DECEASED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {displayMember.life_status === 'DECEASED' ? 'Tiền Nhân (Đã mất)' : 'Đương Thời (Còn sống)'}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${batTu.napAm.bgClass} ${batTu.napAm.colorClass} ${batTu.napAm.borderClass}`}>
                  {batTu.napAm.napAm}
                </span>
              </div>

              {displayMember.courtesy_name && (
                <div className="text-xs text-amber-800 font-serif italic mt-0.5 flex items-center gap-1">
                  <span>📜</span>
                  <span>{displayMember.courtesy_name}</span>
                </div>
              )}

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                  {displayMember.generation_id ? `Đời thứ ${displayMember.generation_id.replace('gen-', '')}` : 'N/A'}
                </span>
                <span>• Giới tính: {displayMember.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
                {displayMember.religious_name && <span>• Pháp danh: <strong className="text-amber-800">{displayMember.religious_name}</strong></span>}
                <span>• Chi phái: Chi Trưởng</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {displayMember.life_status === 'DECEASED' && (
              <button
                onClick={() => setShowPrayerModal(true)}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200/80 border border-amber-300 text-amber-950 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
              >
                <ScrollText className="w-3.5 h-3.5 text-amber-800" />
                <span>Văn Khấn Cúng Giỗ</span>
              </button>
            )}
            <button className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-xs cursor-pointer">
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Sửa Thông Tin</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mt-8 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-[#166534] text-[#166534]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tiểu Sử & Bát Tự Phong Thủy
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'relations'
                ? 'border-[#166534] text-[#166534]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Quan Hệ Nhân Thân & Phả Hệ
          </button>
          {displayMember.life_status === 'DECEASED' && (
            <button
              onClick={() => setActiveTab('memorial')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'memorial'
                  ? 'border-[#166534] text-[#166534]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Lễ Giỗ, Văn Khấn & Nơi An Táng
            </button>
          )}
        </div>
      </div>

      {/* Tab Content: INFO */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          {/* Tiểu Sử */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 font-serif">Thông Tin Tiểu Sử & Ghi Chép Công Đức</h2>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              {displayMember.bio || 'Chưa cập nhật tiểu sử chi tiết cho thành viên này.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Giờ & Năm sinh ÂL:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {displayMember.birth_time ? `${displayMember.birth_time}, ` : ''}{displayMember.birth_lunar_year || 'Chưa rõ'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Giờ & Năm mất ÂL:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {displayMember.death_time ? `${displayMember.death_time}, ` : ''}{displayMember.death_lunar_year || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Khối Bát Tự & Cung Mệnh Phong Thủy */}
          <div className="bg-gradient-to-br from-amber-50/70 to-emerald-50/50 rounded-2xl border border-amber-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-amber-950 font-serif flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-800" />
                <span>Bát Tự & Bản Mệnh Phong Thủy Truyền Thống</span>
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${batTu.napAm.bgClass} ${batTu.napAm.colorClass} ${batTu.napAm.borderClass}`}>
                {batTu.napAm.napAm} ({batTu.napAm.meaning})
              </span>
            </div>

            {/* Bốn Trụ Bát Tự */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white border border-amber-200/80 rounded-xl shadow-2xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Trụ Năm (Thiên Can / Địa Chi)</span>
                <strong className="text-sm text-slate-900 font-serif font-bold">{batTu.truNam}</strong>
              </div>
              <div className="p-3 bg-white border border-amber-200/80 rounded-xl shadow-2xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Trụ Tháng</span>
                <strong className="text-sm text-slate-900 font-serif font-bold">{batTu.truThang}</strong>
              </div>
              <div className="p-3 bg-white border border-amber-200/80 rounded-xl shadow-2xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Trụ Ngày</span>
                <strong className="text-sm text-slate-900 font-serif font-bold">{batTu.truNgay}</strong>
              </div>
              <div className="p-3 bg-white border border-amber-200/80 rounded-xl shadow-2xs">
                <span className="text-[11px] text-slate-500 block mb-0.5">Trụ Giờ (Ngũ Thử Độn)</span>
                <strong className="text-sm text-slate-900 font-serif font-bold">{batTu.truGio}</strong>
              </div>
            </div>

            {/* Cung Phi Bát Trạch */}
            {batTu.cungPhi && (
              <div className="p-3.5 bg-white border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Cung Phi Mệnh: </span>
                  <strong className="text-amber-950 font-bold">Cung {batTu.cungPhi.cung} ({batTu.cungPhi.elementName}) • {batTu.cungPhi.menhType}</strong>
                </div>
                <div className="text-emerald-800 text-[11px]">
                  <strong>Các hướng cát lành:</strong> {batTu.cungPhi.favorableDirections.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: RELATIONS */}
      {activeTab === 'relations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-serif">
            <GitFork className="w-4 h-4 text-[#166534]" />
            <span>Mối Quan Hệ Trực Hệ Trong Cây Phả Hệ</span>
          </h2>

          <div className="space-y-3">
            {relationships.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Chưa có ghi nhận mối quan hệ trực hệ
              </div>
            ) : (
              relationships.map((rel) => {
                const targetId = rel.member_id === displayMember.id ? rel.related_member_id : rel.member_id;
                return (
                  <div key={rel.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Mã quan hệ: {targetId}</div>
                      <div className="text-[11px] text-slate-500">Mối quan hệ: {rel.relationship_type || 'Trực hệ'}</div>
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-[#166534] px-2 py-0.5 rounded-full">
                      {rel.relationship_type || 'Trực Hệ'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab Content: MEMORIAL */}
      {activeTab === 'memorial' && displayMember.life_status === 'DECEASED' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-serif">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Thông Tin Ngày Giỗ & Phần Mộ Tiền Nhân</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrayerModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
              >
                <ScrollText className="w-3.5 h-3.5 text-amber-800" />
                <span>Trích Lục Văn Khấn</span>
              </button>
              <button
                onClick={() => setShowAddMemorialModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thiết Lập Ngày Giỗ</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-950 flex items-center justify-between">
                <span>Lễ Giỗ Âm Lịch Thường Niên</span>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Lặp hàng năm
                </span>
              </div>
              <div className="text-sm font-extrabold text-amber-900 font-serif">
                Ngày {displayMember.death_lunar_day || 15} Tháng {displayMember.death_lunar_month || 1} (Âm Lịch)
              </div>
              {displayMember.death_time && (
                <div className="text-[11px] text-amber-900 font-medium">
                  Giờ Quy Tiên: <strong>{displayMember.death_time}</strong>
                </div>
              )}
              <div className="text-[11px] text-amber-800">
                Dương lịch dự kiến năm nay: <strong className="text-slate-900">{formatDate(nextSolarDate)}</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Nơi An Táng / Mộ Phần</span>
              </div>
              <div className="text-slate-700 font-medium">
                {displayMember.burial_place || 'Chưa cập nhật vị trí lăng mộ'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateMemorialModal
        isOpen={showAddMemorialModal}
        onClose={() => setShowAddMemorialModal(false)}
        onSuccess={() => {}}
        defaultMemberId={displayMember.id}
      />

      <MemorialPrayerViewerModal
        isOpen={showPrayerModal}
        onClose={() => setShowPrayerModal(false)}
        member={member}
        familyName={activeFamily?.name || 'Gia Tộc'}
      />
    </div>
  );
};
export default MemberProfilePage;
