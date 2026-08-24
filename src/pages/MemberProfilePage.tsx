import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Heart, GitFork, Sparkles, Edit3, Plus, ShieldCheck } from 'lucide-react';
import { mockMembers, mockRelationships, mockMemorialDates } from '../services/mockData';
import { formatLunarDate, formatDate } from '../lib/utils';

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'relations' | 'memorial'>('info');

  const member = mockMembers.find((m) => m.id === id) || mockMembers[0];
  const memorial = mockMemorialDates.find((m) => m.member_id === member.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        to="/app/members"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại danh bạ thành viên</span>
      </Link>

      {/* Profile Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-heritage p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-heritage-green/10 border-2 border-heritage-gold flex items-center justify-center font-bold text-heritage-navy text-2xl shadow-sm">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                member.first_name[0]
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900">{member.full_name}</h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    member.life_status === 'DECEASED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {member.life_status === 'DECEASED' ? 'Tiền Nhân (Đã mất)' : 'Đương Thời (Còn sống)'}
                </span>
              </div>

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                  {member.generation_id ? `Đời thứ ${member.generation_id.replace('gen-', '')}` : 'N/A'}
                </span>
                <span>• Giới tính: {member.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
                <span>• Chi phái: Chi Trưởng</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-sm">
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Sửa Thông Tin</span>
            </button>
            <button className="px-3.5 py-2 bg-heritage-green hover:bg-heritage-green-light text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thân Nhân</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mt-8 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-heritage-green text-heritage-green'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tiểu Sử & Thông Tin Chi Tiết
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'relations'
                ? 'border-heritage-green text-heritage-green'
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
                  ? 'border-heritage-green text-heritage-green'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Lễ Giỗ & Nơi An Táng
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Thông Tin Tiểu Sử</h2>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {member.bio || 'Chưa cập nhật tiểu sử chi tiết cho thành viên này.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400">Năm sinh Âm Lịch:</span>{' '}
              <span className="font-semibold text-slate-800">{member.birth_lunar_year || 'Chưa rõ'}</span>
            </div>
            <div>
              <span className="text-slate-400">Năm mất Âm Lịch:</span>{' '}
              <span className="font-semibold text-slate-800">{member.death_lunar_year || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'relations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-heritage-green" />
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
                    <span className="text-[11px] font-semibold bg-emerald-100 text-heritage-green px-2 py-0.5 rounded-full">
                      Trực Hệ
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeTab === 'memorial' && member.life_status === 'DECEASED' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-heritage-gold" />
            <span>Thông Tin Ngày Giỗ & Phần Mộ Tổ Tiên</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-950">Lễ Giỗ Thường Niên</div>
              <div className="text-sm font-extrabold text-amber-900">
                Ngày {member.death_lunar_day} Tháng {member.death_lunar_month} (Âm Lịch)
              </div>
              <div className="text-[11px] text-amber-800">
                Tự động tính ngày Dương lịch và gửi thông báo nhắc lễ trước 30-15-7-3-1 ngày.
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
    </div>
  );
};
