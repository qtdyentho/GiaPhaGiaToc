import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Heart, GitFork, Sparkles, Edit3, Plus, ShieldCheck, Compass, ScrollText } from 'lucide-react';
import { mockMembers, mockRelationships, mockMemorialDates, mockFamily } from '../services/mockData';
import { formatLunarDate, formatDate } from '../lib/utils';
import { CreateMemorialModal } from '../components/calendar/CreateMemorialModal';
import { LunarCalendarService } from '../services/calendar/LunarCalendarService';
import { calculateBatTu } from '../lib/fengshui';
import { MemorialPrayerViewerModal } from '../components/genealogy/MemorialPrayerViewerModal';

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'relations' | 'memorial'>('info');
  const [showAddMemorialModal, setShowAddMemorialModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const member = mockMembers.find((m) => m.id === id) || mockMembers[0];
  const memorial = mockMemorialDates.find((m) => m.member_id === member.id);

  const nextOccurrence = LunarCalendarService.getNextSolarDateForMemorial(
    member.death_lunar_day || 15,
    member.death_lunar_month || 1,
    false
  );
  const nextSolarDate = memorial?.next_solar_date || nextOccurrence.solarDate;

  const batTu = calculateBatTu(
    member.birth_solar_date,
    member.birth_lunar_year,
    undefined,
    undefined,
    member.birth_time,
    member.gender
  );

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
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                member.first_name[0]
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-2xl font-black text-slate-900 font-serif">{member.full_name}</h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    member.life_status === 'DECEASED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {member.life_status === 'DECEASED' ? 'Tiền Nhân (Đã mất)' : 'Đương Thời (Còn sống)'}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${batTu.napAm.bgClass} ${batTu.napAm.colorClass} ${batTu.napAm.borderClass}`}>
                  {batTu.napAm.napAm}
                </span>
              </div>

              {member.courtesy_name && (
                <div className="text-xs text-amber-800 font-serif italic mt-0.5 flex items-center gap-1">
                  <span>📜</span>
                  <span>{member.courtesy_name}</span>
                </div>
              )}

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                  {member.generation_id ? `Đời thứ ${member.generation_id.replace('gen-', '')}` : 'N/A'}
                </span>
                <span>• Giới tính: {member.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
                {member.religious_name && <span>• Pháp danh: <strong className="text-amber-800">{member.religious_name}</strong></span>}
                <span>• Chi phái: Chi Trưởng</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {member.life_status === 'DECEASED' && (
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
          {member.life_status === 'DECEASED' && (
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
              {member.bio || 'Chưa cập nhật tiểu sử chi tiết cho thành viên này.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Giờ & Năm sinh ÂL:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {member.birth_time ? `${member.birth_time}, ` : ''}{member.birth_lunar_year || 'Chưa rõ'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Giờ & Năm mất ÂL:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {member.death_time ? `${member.death_time}, ` : ''}{member.death_lunar_year || '—'}
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
            {mockRelationships
              .filter((r) => r.member_id === member.id || r.related_member_id === member.id)
              .map((rel) => {
                const targetId = rel.member_id === member.id ? rel.related_member_id : rel.member_id;
                const target = mockMembers.find((m) => m.id === targetId);
                return (
                  <div key={rel.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{target?.full_name}</div>
                      <div className="text-[11px] text-slate-500">Mối quan hệ: Con trực hệ</div>
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-[#166534] px-2 py-0.5 rounded-full">
                      Trực Hệ
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab Content: MEMORIAL */}
      {activeTab === 'memorial' && member.life_status === 'DECEASED' && (
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
                Ngày {member.death_lunar_day || 15} Tháng {member.death_lunar_month || 1} (Âm Lịch)
              </div>
              {member.death_time && (
                <div className="text-[11px] text-amber-900 font-medium">
                  Giờ Quy Tiên: <strong>{member.death_time}</strong>
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
                {member.burial_place || 'Chưa cập nhật vị trí lăng mộ'}
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
        defaultMemberId={member.id}
      />

      <MemorialPrayerViewerModal
        isOpen={showPrayerModal}
        onClose={() => setShowPrayerModal(false)}
        member={member}
        familyName={mockFamily.name}
      />
    </div>
  );
};
export default MemberProfilePage;
