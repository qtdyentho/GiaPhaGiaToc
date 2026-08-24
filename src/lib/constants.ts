export const BRAND = {
  name: 'Gia Phả Gia Tộc',
  slogan: 'Lưu giữ cội nguồn – Kết nối các thế hệ',
  colors: {
    primary: '#166534',       // Living Green
    secondary: '#1E3A5F',     // Archival Navy
    accent: '#C49A3A',        // Warm Gold
    background: '#F7F8F5',    // Warm Papyrus
  },
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
};

export const ROLE_LABELS: Record<string, { label: string; description: string; color: string }> = {
  OWNER: {
    label: 'Trưởng Tộc',
    description: 'Chủ sở hữu gia tộc, toàn quyền quản trị và phân quyền.',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  ADMIN: {
    label: 'Quản Trị Viên',
    description: 'Quản trị chung các thiết lập và cấu hình gia tộc.',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  GENEALOGY_ADMIN: {
    label: 'Ban Gia Phả',
    description: 'Quản trị thế hệ, chi phái, thông tin nhân khẩu và cây gia phả.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  TREASURER: {
    label: 'Thủ Quỹ',
    description: 'Quản lý thu quỹ, ghi nhận đóng góp, lập phiếu chi và theo dõi sổ quỹ.',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  APPROVER: {
    label: 'Ban Kiểm Soát',
    description: 'Phê duyệt các phiếu chi và kiểm toán dòng tiền.',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  EVENT_MANAGER: {
    label: 'Ban Khánh Tiết',
    description: 'Quản lý sự kiện, lễ giỗ tổ, kỷ niệm và nhắc lịch.',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  MEMBER: {
    label: 'Thành Viên',
    description: 'Thành viên chính thức, xem gia phả, nhận thông báo và đóng quỹ.',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  VIEWER: {
    label: 'Khách Xem',
    description: 'Chỉ có quyền xem thông tin cơ bản không bảo mật.',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CLAN_ANCESTRAL_DAY: 'Giỗ tổ họ',
  MEMORIAL: 'Ngày giỗ cá nhân',
  BRANCH_MEMORIAL: 'Giỗ chi / phái',
  FAMILY_MEETING: 'Họp họ / Hội đồng',
  ANCESTRAL_HALL_OPENING: 'Khánh thành từ đường',
  ANCESTRAL_HALL_RENOVATION: 'Tu sửa từ đường',
  CLAN_ANNIVERSARY: 'Kỷ niệm thành lập họ',
  BIRTHDAY: 'Sinh nhật',
  LONGEVITY: 'Mừng thọ',
  WEDDING: 'Lễ cưới',
  FUNERAL: 'Lễ tang',
  OTHER: 'Sự kiện khác',
};
