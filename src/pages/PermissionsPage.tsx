import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Shield,
  Lock,
  Check,
  X,
  Search,
  Filter,
  User,
  UserPlus,
  Edit3,
  Trash2,
  KeyRound,
  Mail,
  Phone,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  CheckCircle2
} from 'lucide-react';
import { ROLE_LABELS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { MembershipRole, FamilyMembership, Profile } from '../types/database';

export const PermissionsPage: React.FC = () => {
  const {
    user,
    activeFamily,
    activeMembership,
    isFamilyAdmin,
    getFamilyMemberships,
    addFamilyMemberRole,
    updateFamilyMemberRole,
    removeFamilyMemberRole,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'MATRIX'>('MEMBERS');
  const [membershipsList, setMembershipsList] = useState<Array<FamilyMembership & { profile?: Profile }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedMemForEdit, setSelectedMemForEdit] = useState<(FamilyMembership & { profile?: Profile }) | null>(null);

  // Add Form State
  const [formEmail, setFormEmail] = useState<string>('');
  const [formFullName, setFormFullName] = useState<string>('');
  const [formRole, setFormRole] = useState<MembershipRole>('TREASURER');
  const [formPassword, setFormPassword] = useState<string>('giapha2026');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 8 Roles Matrix Definition
  const rolesList: MembershipRole[] = [
    'OWNER',
    'ADMIN',
    'GENEALOGY_ADMIN',
    'TREASURER',
    'APPROVER',
    'EVENT_MANAGER',
    'MEMBER',
    'VIEWER',
  ];

  const permissionsMatrix = [
    { module: 'Quản lý thông tin & Cài đặt Gia tộc', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: false, member: false, viewer: false },
    { module: 'Thêm, sửa, xóa thành viên & Cây gia phả', owner: true, admin: true, genealogy: true, treasurer: false, approver: false, event: false, member: false, viewer: false },
    { module: 'Lập đợt thu quỹ & Ghi nhận thu tiền', owner: true, admin: true, genealogy: false, treasurer: true, approver: false, event: false, member: false, viewer: false },
    { module: 'Lập phiếu chi & Xuất quỹ trực tiếp', owner: true, admin: true, genealogy: false, treasurer: true, approver: false, event: false, member: false, viewer: false },
    { module: 'Xem cây gia phả & Lịch âm ngày giỗ', owner: true, admin: true, genealogy: true, treasurer: true, approver: true, event: true, member: true, viewer: true },
    { module: 'Giám sát minh bạch Sổ quỹ & Hóa đơn chứng từ (Open Ledger)', owner: true, admin: true, genealogy: true, treasurer: true, approver: true, event: true, member: true, viewer: true },
    { module: 'Tạo và điều hành sự kiện họ tộc', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: true, member: false, viewer: false },
    { module: 'Quản lý gói dịch vụ thuê bao (Billing)', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: false, member: false, viewer: false },
    { module: 'Phân quyền & Cấp tài khoản Ban Quản Trị', owner: true, admin: true, genealogy: false, treasurer: false, approver: false, event: false, member: false, viewer: false },
  ];

  const loadMemberships = useCallback(async () => {
    if (!activeFamily?.id) return;
    setLoading(true);
    try {
      const data = await getFamilyMemberships(activeFamily.id);
      setMembershipsList(data);
    } catch (err) {
      console.error('Lỗi tải danh sách memberships:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFamily?.id, getFamilyMemberships]);

  useEffect(() => {
    loadMemberships();
  }, [loadMemberships]);

  const handleOpenAddModal = () => {
    setFormEmail('');
    setFormFullName('');
    setFormRole('TREASURER');
    setFormPassword('giapha2026');
    setFormMessage(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim()) {
      setFormMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ Email đăng nhập của thành viên.' });
      return;
    }
    setFormSubmitting(true);
    setFormMessage(null);

    const res = await addFamilyMemberRole(formEmail, formFullName, formRole, formPassword);
    setFormSubmitting(false);

    if (res.success) {
      setFormMessage({
        type: 'success',
        text: `Đã phân quyền thành công! Thành viên có thể đăng nhập bằng email: ${formEmail.trim().toLowerCase()} (Mật khẩu: ${formPassword})`,
      });
      setTimeout(() => {
        setIsAddModalOpen(false);
        loadMemberships();
      }, 1500);
    } else {
      setFormMessage({ type: 'error', text: res.error || 'Có lỗi xảy ra khi lưu phân quyền.' });
    }
  };

  const handleOpenEditModal = (mem: FamilyMembership & { profile?: Profile }) => {
    setSelectedMemForEdit(mem);
    setFormRole(mem.role);
    setFormMessage(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemForEdit) return;
    setFormSubmitting(true);
    setFormMessage(null);

    const res = await updateFamilyMemberRole(selectedMemForEdit.id, formRole);
    setFormSubmitting(false);

    if (res.success) {
      setIsEditModalOpen(false);
      loadMemberships();
    } else {
      setFormMessage({ type: 'error', text: res.error || 'Có lỗi xảy ra khi cập nhật.' });
    }
  };

  const handleRemoveMembership = async (membershipId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền quản trị của "${memberName}" khỏi dòng họ?`)) {
      return;
    }
    const res = await removeFamilyMemberRole(membershipId);
    if (res.success) {
      loadMemberships();
    } else {
      alert(res.error || 'Không thể thu hồi quyền.');
    }
  };

  const filteredMemberships = membershipsList.filter((m) => {
    const q = search.toLowerCase().trim();
    const name = m.profile?.full_name?.toLowerCase() || '';
    const email = m.profile?.email?.toLowerCase() || '';
    const matchSearch = !q || name.includes(q) || email.includes(q);
    const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Phân Công Nhiệm Vụ & Ban Quản Trị</span>
            </h1>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
              {activeFamily?.name || 'Dòng Họ'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân định rõ ràng vai trò: Thủ quỹ & Kế toán trực tiếp thu chi, Ban gia phả quản trị phả hệ, Toàn thể con cháu cùng giám sát minh bạch.
          </p>
        </div>

        {/* Right action button */}
        {isFamilyAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm / Phân Quyền Thành Viên</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'MEMBERS'
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-[#166534] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Ban Quản Trị ({membershipsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('MATRIX')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'MATRIX'
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-[#166534] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Ma Trận Quyền Hạn Chi Tiết</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS LIST */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-6">
          {/* Role Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rolesList.map((roleKey) => {
              const roleInfo = ROLE_LABELS[roleKey];
              const count = membershipsList.filter((m) => m.role === roleKey).length;
              return (
                <div
                  key={roleKey}
                  onClick={() => setRoleFilter(roleFilter === roleKey ? 'ALL' : roleKey)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    roleFilter === roleKey
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-[#166534] ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {count} người
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {roleInfo.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm họ tên, email tài khoản..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Memberships Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Thành Viên</th>
                    <th className="py-3 px-4">Email Đăng Nhập</th>
                    <th className="py-3 px-4">Chức Vụ / Vai Trò</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4">Ngày Tham Gia</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span>Đang tải danh sách ban quản trị...</span>
                      </td>
                    </tr>
                  ) : filteredMemberships.length > 0 ? (
                    filteredMemberships.map((m) => {
                      const roleMeta = ROLE_LABELS[m.role] || ROLE_LABELS.MEMBER;
                      const isCurrentUser = m.user_id === user?.id;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-[#166534] dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {m.profile?.full_name ? m.profile.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div>{m.profile?.full_name || 'Chưa cập nhật tên'}</div>
                              {isCurrentUser && (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                  (Tài khoản của bạn)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                            {m.profile?.email || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleMeta.color}`}>
                              {roleMeta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Hoạt động</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                            {m.joined_at ? new Date(m.joined_at).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isFamilyAdmin && m.role !== 'OWNER' && !isCurrentUser ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(m)}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                                  title="Đổi vai trò"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMembership(m.id, m.profile?.full_name || m.profile?.email || 'Thành viên')}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                                  title="Thu hồi quyền"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Mặc định</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Không tìm thấy thành viên phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bảng Đối Chiếu Ma Trận Quyền Hạn Chi Tiết</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Phân Hệ Nghiệp Vụ</th>
                    <th className="py-3 px-2">Trưởng Tộc</th>
                    <th className="py-3 px-2">Quản Trị</th>
                    <th className="py-3 px-2">Ban Gia Phả</th>
                    <th className="py-3 px-2">Thủ Quỹ</th>
                    <th className="py-3 px-2">Kiểm Soát</th>
                    <th className="py-3 px-2">Khánh Tiết</th>
                    <th className="py-3 px-2">Thành Viên</th>
                    <th className="py-3 px-2">Khách Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {permissionsMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 text-left font-semibold text-slate-900 dark:text-white">{row.module}</td>
                      <td className="py-3 px-2">{row.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.genealogy ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.treasurer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.approver ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.event ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.member ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-2">{row.viewer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / ASSIGN MEMBER ROLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#166534] dark:bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Thêm / Phân Quyền Thành Viên</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Cấp tài khoản và giao nhiệm vụ cho dòng họ</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    formMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formMessage.text}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Email Đăng Nhập <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="vi_du@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Họ Và Tên Thành Viên</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chức Vụ / Vai Trò Phân Công <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as MembershipRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
                >
                  <option value="TREASURER">💰 Thủ Quỹ / Kế Toán Thu Chi (TREASURER)</option>
                  <option value="APPROVER">⚖️ Ban Kiểm Soát / Duyệt Chi (APPROVER)</option>
                  <option value="GENEALOGY_ADMIN">📜 Ban Gia Phả / Trị Sự Phả Hệ (GENEALOGY_ADMIN)</option>
                  <option value="ADMIN">🛡️ Ban Quản Trị / Phó Ban Trị Sự (ADMIN)</option>
                  <option value="EVENT_MANAGER">🎪 Ban Khánh Tiết / Tổ Chức Lễ Hội (EVENT_MANAGER)</option>
                  <option value="MEMBER">👥 Thành Viên Dòng Họ (MEMBER)</option>
                  <option value="VIEWER">👁️ Khách Xem (VIEWER)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  💡 <strong>Quyền hạn:</strong> {ROLE_LABELS[formRole]?.description}
                </p>
              </div>

              {/* Initial Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mật Khẩu Khởi Tạo Ban Đầu</span>
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
                <p className="text-[10px] text-slate-400">
                  Thành viên sẽ dùng Email và Mật khẩu này để đăng nhập ngay trên hệ thống.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Đang Lưu...' : 'Xác Nhận Cấp Quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ROLE */}
      {isEditModalOpen && selectedMemForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Thay Đổi Vai Trò Thành Viên</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedMemForEdit.profile?.full_name || 'Thành viên'}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {selectedMemForEdit.profile?.email}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chọn Vai Trò Mới
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as MembershipRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#166534] cursor-pointer"
                >
                  <option value="TREASURER">💰 Thủ Quỹ / Kế Toán Thu Chi (TREASURER)</option>
                  <option value="APPROVER">⚖️ Ban Kiểm Soát / Duyệt Chi (APPROVER)</option>
                  <option value="GENEALOGY_ADMIN">📜 Ban Gia Phả / Trị Sự Phả Hệ (GENEALOGY_ADMIN)</option>
                  <option value="ADMIN">🛡️ Ban Quản Trị / Phó Ban Trị Sự (ADMIN)</option>
                  <option value="EVENT_MANAGER">🎪 Ban Khánh Tiết / Tổ Chức Lễ Hội (EVENT_MANAGER)</option>
                  <option value="MEMBER">👥 Thành Viên Dòng Họ (MEMBER)</option>
                  <option value="VIEWER">👁️ Khách Xem (VIEWER)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {ROLE_LABELS[formRole]?.description}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {formSubmitting ? 'Đang Cập Nhật...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
