import React, { useState, useMemo } from 'react';
import { 
  Users, Search, ShieldCheck, ShieldAlert, Lock, Unlock, Eye, EyeOff, 
  UserCheck, UserX, Download, KeyRound, AlertTriangle, CheckCircle2,
  Calendar, Phone, Mail, CreditCard, Building2, Sparkles, Filter, MoreHorizontal
} from 'lucide-react';
import { CryptoStorageService, MaskedUserView } from '../../services/security/CryptoStorageService';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export const AdminUsersPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<MaskedUserView[]>(() => CryptoStorageService.getEncryptedUsers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'MEMBER'>('ALL');
  const [revealPII, setRevealPII] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MaskedUserView | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (u.raw_email && u.raw_email.toLowerCase().includes(search.toLowerCase())) ||
        (u.raw_phone && u.raw_phone.includes(search)) ||
        (u.raw_citizen_id && u.raw_citizen_id.includes(search)) ||
        u.family_name.toLowerCase().includes(search.toLowerCase()) ||
        u.family_code.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'SUPER_ADMIN' && u.role === 'SUPER_ADMIN') ||
        (roleFilter !== 'SUPER_ADMIN' && u.family_role === roleFilter);

      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      suspended: users.filter((u) => u.status === 'SUSPENDED').length,
      owners: users.filter((u) => u.family_role === 'OWNER').length,
      admins: users.filter((u) => u.role === 'SUPER_ADMIN').length,
    };
  }, [users]);

  const handleToggleReveal = () => {
    if (!revealPII) {
      // Audit log when revealing PII
      console.log(`[AUDIT_LOG] Super Admin revealed PII dataset at ${new Date().toISOString()}`);
      setActionNotice('🔓 Đã giải mã hiển thị thông tin PII (Email, SĐT, CCCD). Hoạt động này đã được ghi nhật ký kiểm toán.');
    } else {
      setActionNotice('🔒 Đã bật lại chế độ che chắn mã hóa dữ liệu nhạy cảm (Data Masking).');
    }
    setRevealPII(!revealPII);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: 'ACTIVE' | 'SUSPENDED' = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    CryptoStorageService.saveUsers(updated);
    setActionNotice('Cập nhật trạng thái tài khoản thành công.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleToggleSuperAdmin = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextRole: 'SUPER_ADMIN' | 'USER' = u.role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN';
        return { ...u, role: nextRole };
      }
      return u;
    });
    setUsers(updated);
    CryptoStorageService.saveUsers(updated);
    setActionNotice('Cập nhật quyền quản trị nền tảng thành công.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExportCSV = () => {
    const csvHeader = 'ID,Họ Tên,Email,Số Điện Thoại,CCCD,Quyền Hạn,Vai Trò Gia Tộc,Dòng Họ,Trạng Thái,Ngày Tạo\n';
    const csvRows = users
      .map((u) =>
        `"${u.id}","${u.full_name}","${revealPII ? u.raw_email : CryptoStorageService.maskEmail(u.raw_email)}","${
          revealPII ? u.raw_phone : CryptoStorageService.maskPhone(u.raw_phone)
        }","${
          revealPII ? u.raw_citizen_id : CryptoStorageService.maskCitizenId(u.raw_citizen_id)
        }","${u.role}","${u.family_role}","${u.family_name}","${u.status}","${u.created_at}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GiaPhaGiaToc_Users_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Tài Khoản Người Dùng</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold">
              Mã Hóa AES-256
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị {stats.total} tài khoản đăng ký toàn hệ thống, bảo mật định danh PII và phân quyền truy cập
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleToggleReveal}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border ${
              revealPII
                ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 border-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            {revealPII ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-700" />}
            <span>{revealPII ? 'Ẩn Dữ Liệu PII' : 'Giải Mã Hiển Thị PII'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Danh Sách</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-medium animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Tài Khoản</div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-600" />
            <span>Đã đăng ký hệ thống</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang Hoạt Động</div>
          <div className="text-2xl font-black text-emerald-700">{stats.active}</div>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Trạng thái Active bình thường</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chủ Quản Gia Tộc</div>
          <div className="text-2xl font-black text-amber-700">{stats.owners}</div>
          <div className="text-[10px] text-amber-600 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-amber-600" />
            <span>Trưởng tộc & Quản trị viên</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tạm Khóa / Chờ Duyệt</div>
          <div className="text-2xl font-black text-rose-700">{stats.suspended}</div>
          <div className="text-[10px] text-rose-600 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Cần rà soát an ninh</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại, CCCD, dòng họ..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động (Active)</option>
              <option value="SUSPENDED">Đang tạm khóa (Suspended)</option>
              <option value="PENDING">Chờ kích hoạt (Pending)</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="ALL">Tất cả quyền hạn</option>
              <option value="SUPER_ADMIN">Super Admin (Nền tảng)</option>
              <option value="OWNER">Trưởng Tộc (Chủ Quản)</option>
              <option value="ADMIN">Hội Đồng Quản Trị</option>
              <option value="MEMBER">Thành Viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Người Dùng / Họ Tên</th>
                <th className="py-3.5 px-4">Thông Tin Liên Hệ (PII)</th>
                <th className="py-3.5 px-4">Định Danh CCCD</th>
                <th className="py-3.5 px-4">Dòng Họ Trực Thuộc</th>
                <th className="py-3.5 px-4">Vai Trò & Quyền</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Đăng Ký</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  {/* User Avatar + Full Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-[#166534] flex items-center justify-center font-bold text-xs shrink-0">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.full_name}</span>
                          {user.role === 'SUPER_ADMIN' && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-bold rounded">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact PII */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-slate-900 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className={revealPII ? 'font-mono text-emerald-950 font-bold' : 'text-slate-600'}>
                          {revealPII ? user.raw_email : CryptoStorageService.maskEmail(user.raw_email)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className={revealPII ? 'font-mono text-emerald-950 font-bold' : ''}>
                          {revealPII ? user.raw_phone : CryptoStorageService.maskPhone(user.raw_phone)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Citizen ID */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className={revealPII ? 'text-emerald-950 font-bold' : 'text-slate-600'}>
                        {revealPII ? user.raw_citizen_id : CryptoStorageService.maskCitizenId(user.raw_citizen_id)}
                      </span>
                    </div>
                  </td>

                  {/* Family */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{user.family_name}</div>
                    <div className="text-[10px] text-slate-400">{user.family_code}</div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.family_role === 'OWNER'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : user.family_role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.family_role === 'OWNER' ? 'Trưởng Tộc' : user.family_role === 'ADMIN' ? 'Hội Đồng' : 'Thành Viên'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.status === 'SUSPENDED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {user.status === 'ACTIVE'
                        ? 'Hoạt động'
                        : user.status === 'SUSPENDED'
                        ? 'Tạm khóa'
                        : 'Chờ duyệt'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-[11px] text-slate-500 font-medium">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          user.status === 'ACTIVE'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {user.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleToggleSuperAdmin(user.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-300"
                        title="Đổi quyền Super Admin"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    Không tìm thấy tài khoản người dùng phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
