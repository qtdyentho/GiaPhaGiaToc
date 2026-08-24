import {
  Profile,
  Family,
  FamilyMembership,
  Generation,
  Branch,
  Member,
  MemberRelationship,
  MemorialDate,
  Event,
  Fund,
  FinancialTransaction,
  IncomeAssessment,
  ExpenseRecord,
  Contribution,
  Sponsorship,
  Plan,
  PlanVersion,
  PlanFeature,
  Subscription,
  Invoice,
  InvoiceItem,
  Payment,
  UsageCounter,
  Notification,
  AuditLog
} from '../types/database';

export const mockProfile: Profile = {
  id: 'usr-0000-0001',
  email: 'truongtoc.nguyen@giapha.vn',
  full_name: 'Nguyễn Văn Hoàng',
  phone: '0988123456',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-08-24T00:00:00Z',
};

export const mockFamily: Family = {
  id: 'fam-0000-0001',
  name: 'Đại Tộc Nguyễn Văn',
  code: 'NGUYEN-VAN-HN',
  slug: 'nguyen-van-hoang-mai',
  description: 'Dòng họ Nguyễn Văn tại Hoàng Mai, Hà Nội - Khởi tổ từ thế kỷ 18.',
  origin_province: 'Hà Nội',
  origin_district: 'Hoàng Mai',
  origin_commune: 'Định Công',
  ancestral_hall_address: 'Số 18 Ngõ 42 Tổ 5, P. Định Công, Q. Hoàng Mai, Hà Nội',
  logo_url: '',
  banner_url: '',
  created_by: 'usr-0000-0001',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-08-24T00:00:00Z',
};

export const mockMemberships: FamilyMembership[] = [
  {
    id: 'mem-0001',
    family_id: 'fam-0000-0001',
    user_id: 'usr-0000-0001',
    role: 'OWNER',
    status: 'ACTIVE',
    joined_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  }
];

export const mockGenerations: Generation[] = [
  { id: 'gen-1', family_id: 'fam-0000-0001', generation_number: 1, name: 'Đời thứ nhất (Thủy Tổ)', created_at: '2026-01-01T00:00:00Z' },
  { id: 'gen-2', family_id: 'fam-0000-0001', generation_number: 2, name: 'Đời thứ hai', created_at: '2026-01-01T00:00:00Z' },
  { id: 'gen-3', family_id: 'fam-0000-0001', generation_number: 3, name: 'Đời thứ ba', created_at: '2026-01-01T00:00:00Z' },
  { id: 'gen-4', family_id: 'fam-0000-0001', generation_number: 4, name: 'Đời thứ tư', created_at: '2026-01-01T00:00:00Z' },
  { id: 'gen-5', family_id: 'fam-0000-0001', generation_number: 5, name: 'Đời thứ năm', created_at: '2026-01-01T00:00:00Z' },
];

export const mockBranches: Branch[] = [
  { id: 'br-1', family_id: 'fam-0000-0001', name: 'Chi Trưởng', order_index: 1, created_at: '2026-01-01T00:00:00Z' },
  { id: 'br-2', family_id: 'fam-0000-0001', name: 'Chi Hai', order_index: 2, created_at: '2026-01-01T00:00:00Z' },
  { id: 'br-3', family_id: 'fam-0000-0001', name: 'Chi Ba', order_index: 3, created_at: '2026-01-01T00:00:00Z' },
];

export const mockMembers: Member[] = [
  {
    id: 'mb-001',
    family_id: 'fam-0000-0001',
    generation_id: 'gen-1',
    first_name: 'Phúc',
    last_name: 'Nguyễn Văn',
    full_name: 'Nguyễn Văn Phúc (Cụ Thủy Tổ)',
    gender: 'MALE',
    life_status: 'DECEASED',
    birth_lunar_year: 1845,
    death_lunar_day: 15,
    death_lunar_month: 8,
    death_lunar_year: 1912,
    burial_place: 'Khu lăng mộ Tổ họ Nguyễn, Đồi Nghĩa Trang Định Công',
    bio: 'Thủy tổ dòng họ Nguyễn Văn tại Định Công, công đức khai hoang lập nghiệp.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: 'mb-002',
    family_id: 'fam-0000-0001',
    generation_id: 'gen-2',
    branch_id: 'br-1',
    first_name: 'Trọng',
    last_name: 'Nguyễn Văn',
    full_name: 'Nguyễn Văn Trọng (Cụ Tổ Chi Trưởng)',
    gender: 'MALE',
    life_status: 'DECEASED',
    birth_lunar_year: 1872,
    death_lunar_day: 10,
    death_lunar_month: 3,
    death_lunar_year: 1945,
    burial_place: 'Nghĩa trang họ Nguyễn',
    bio: 'Cụ tổ khởi lập Chi Trưởng họ Nguyễn Văn.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: 'mb-003',
    family_id: 'fam-0000-0001',
    generation_id: 'gen-3',
    branch_id: 'br-1',
    first_name: 'Hoàng',
    last_name: 'Nguyễn Văn',
    full_name: 'Nguyễn Văn Hoàng',
    gender: 'MALE',
    life_status: 'ALIVE',
    birth_solar_date: '1968-05-12',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Trưởng tộc đời thứ 3 họ Nguyễn Văn, phụ trách điều hành gia tộc.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: 'mb-004',
    family_id: 'fam-0000-0001',
    generation_id: 'gen-4',
    branch_id: 'br-1',
    first_name: 'Tuấn',
    last_name: 'Nguyễn Văn',
    full_name: 'Nguyễn Văn Tuấn',
    gender: 'MALE',
    life_status: 'ALIVE',
    birth_solar_date: '1995-10-24',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Đích tôn đời thứ 4, phụ trách số hóa gia phả.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  }
];

export const mockRelationships: MemberRelationship[] = [
  {
    id: 'rel-1',
    family_id: 'fam-0000-0001',
    member_id: 'mb-001',
    related_member_id: 'mb-002',
    relationship: 'CHILD',
    is_direct_lineage: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rel-2',
    family_id: 'fam-0000-0001',
    member_id: 'mb-002',
    related_member_id: 'mb-003',
    relationship: 'CHILD',
    is_direct_lineage: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rel-3',
    family_id: 'fam-0000-0001',
    member_id: 'mb-003',
    related_member_id: 'mb-004',
    relationship: 'CHILD',
    is_direct_lineage: true,
    created_at: '2026-01-01T00:00:00Z',
  }
];

export const mockMemorialDates: MemorialDate[] = [
  {
    id: 'mem-dt-1',
    family_id: 'fam-0000-0001',
    member_id: 'mb-001',
    title: 'Giỗ Cụ Thủy Tổ Nguyễn Văn Phúc',
    lunar_day: 15,
    lunar_month: 8,
    is_leap_month: false,
    notes: 'Lễ giỗ tổ họ lớn nhất trong năm tại Nhà thờ họ',
    next_solar_date: '2026-09-25',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mem-dt-2',
    family_id: 'fam-0000-0001',
    member_id: 'mb-002',
    title: 'Giỗ Cụ Tổ Chi Trưởng Nguyễn Văn Trọng',
    lunar_day: 10,
    lunar_month: 3,
    is_leap_month: false,
    notes: 'Chi Trưởng tổ chức cúng giỗ',
    next_solar_date: '2027-04-16',
    created_at: '2026-01-01T00:00:00Z',
  }
];

export const mockEvents: Event[] = [
  {
    id: 'evt-001',
    family_id: 'fam-0000-0001',
    title: 'Đại Lễ Giỗ Tổ Họ Nguyễn Văn 2026',
    description: 'Họp mặt toàn thể con cháu các chi phái tại Từ đường dâng hương tưởng niệm Thủy tổ.',
    event_type: 'CLAN_ANCESTRAL_DAY',
    scope: 'FAMILY',
    solar_date: '2026-09-25',
    solar_time: '08:00',
    lunar_day: 15,
    lunar_month: 8,
    lunar_year: 2026,
    location: 'Từ Đường Họ Nguyễn Văn, Hoàng Mai, Hà Nội',
    estimated_budget: 45000000,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  }
];

export const mockFunds: Fund[] = [
  {
    id: 'fund-1',
    family_id: 'fam-0000-0001',
    name: 'Quỹ Hoạt Động Thường Niên',
    code: 'QUY-THUONG-NIEN',
    description: 'Chi phí hương khói, lễ giỗ tổ, họp họ định kỳ',
    opening_balance: 20000000,
    current_balance: 68500000,
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: 'fund-2',
    family_id: 'fam-0000-0001',
    name: 'Quỹ Khuyến Học & Khuyến Tài',
    code: 'QUY-KHUYEN-HOC',
    description: 'Khen thưởng con cháu đỗ đạt và thành tích xuất sắc',
    opening_balance: 10000000,
    current_balance: 25000000,
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: 'fund-3',
    family_id: 'fam-0000-0001',
    name: 'Quỹ Tu Bổ & Xây Dựng Từ Đường',
    code: 'QUY-TU-BO',
    description: 'Bảo tồn, trùng tu và mở rộng nhà thờ tổ',
    opening_balance: 50000000,
    current_balance: 142000000,
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  }
];

export const mockAssessments: IncomeAssessment[] = [
  {
    id: 'asm-001',
    family_id: 'fam-0000-0001',
    title: 'Thu bổ sung Quỹ Hoạt Động 2026 (Chi Trưởng)',
    member_id: 'mb-003',
    amount_due: 500000,
    amount_paid: 500000,
    due_date: '2026-09-01',
    status: 'PAID',
    notes: 'Đã nộp qua VietQR ngày 15/08/2026',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-15T00:00:00Z',
  },
  {
    id: 'asm-002',
    family_id: 'fam-0000-0001',
    title: 'Thu bổ sung Quỹ Hoạt Động 2026 (Chi Trưởng)',
    member_id: 'mb-004',
    amount_due: 500000,
    amount_paid: 0,
    due_date: '2026-09-01',
    status: 'PENDING',
    notes: 'Chờ thanh toán',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  }
];

export const mockExpenses: ExpenseRecord[] = [
  {
    id: 'exp-001',
    family_id: 'fam-0000-0001',
    fund_id: 'fund-1',
    title: 'Mua sắm đồ lễ Giỗ Cụ Thủy Tổ',
    amount: 5200000,
    expense_date: '2026-08-20',
    payment_method: 'BANK_TRANSFER',
    recipient_name: 'Cửa hàng Đồ cúng Tâm Đức',
    status: 'APPROVED',
    description: 'Hoa quả, trầu cau, hương nến chuẩn bị ngày giỗ',
    created_at: '2026-08-19T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
  }
];

export const mockTransactions: FinancialTransaction[] = [
  {
    id: 'tx-001',
    family_id: 'fam-0000-0001',
    fund_id: 'fund-1',
    transaction_code: 'THU-20260815-1024',
    transaction_type: 'INCOME',
    assessment_id: 'asm-001',
    member_id: 'mb-003',
    amount: 500000,
    payment_method: 'VIETQR',
    transaction_date: '2026-08-15',
    description: 'Thu tiền đóng góp thường niên 2026 - Nguyễn Văn Hoàng',
    status: 'POSTED',
    created_at: '2026-08-15T09:30:00Z',
    updated_at: '2026-08-15T09:30:00Z',
  },
  {
    id: 'tx-002',
    family_id: 'fam-0000-0001',
    fund_id: 'fund-1',
    transaction_code: 'CHI-20260820-2048',
    transaction_type: 'EXPENSE',
    expense_id: 'exp-001',
    amount: 5200000,
    payment_method: 'BANK_TRANSFER',
    transaction_date: '2026-08-20',
    description: 'Chi mua sắm đồ lễ giỗ tổ',
    status: 'POSTED',
    created_at: '2026-08-20T14:15:00Z',
    updated_at: '2026-08-20T14:15:00Z',
  }
];

export const mockPlans: Plan[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'FREE',
    name: 'Gói Trải Nghiệm',
    description: 'Dành cho gia đình nhỏ tra cứu cơ bản',
    short_description: 'Miễn phí tối đa 30 thành viên',
    is_public: true,
    is_active: true,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'FAMILY',
    name: 'Gói Gia Đình',
    description: 'Quản lý tối đa 100 thành viên, sổ quỹ cơ bản',
    short_description: 'Gia đình hạt nhân 49k/tháng',
    is_public: true,
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: 'GIA_TOC',
    name: 'Gói Gia Tộc',
    description: 'Quản lý 300 thành viên, 30 chi nhánh, sổ quỹ kép đầy đủ',
    short_description: 'Dòng tộc vừa & nhỏ 99k/tháng',
    is_public: true,
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    code: 'DONG_HO',
    name: 'Gói Dòng Họ',
    description: 'Quản lý 1000 thành viên, đa quỹ, báo cáo chuyên sâu',
    short_description: 'Dòng họ lớn 199k/tháng',
    is_public: true,
    is_active: true,
    sort_order: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    code: 'PREMIUM',
    name: 'Gói Toàn Năng',
    description: 'Không giới hạn thành viên, API & sao lưu đám mây',
    short_description: 'Đại tộc toàn năng 499k/tháng',
    is_public: true,
    is_active: true,
    sort_order: 5,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-24T00:00:00Z',
  }
];

export const mockPlanVersions: PlanVersion[] = [
  { id: 'pv-1', plan_id: '00000000-0000-0000-0000-000000000001', version_number: 1, price_monthly: 0, price_yearly: 0, currency: 'VND', trial_days: 0, is_current: true, effective_from: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-24T00:00:00Z' },
  { id: 'pv-2', plan_id: '00000000-0000-0000-0000-000000000002', version_number: 1, price_monthly: 49000, price_yearly: 490000, currency: 'VND', trial_days: 14, is_current: true, effective_from: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-24T00:00:00Z' },
  { id: 'pv-3', plan_id: '00000000-0000-0000-0000-000000000003', version_number: 1, price_monthly: 99000, price_yearly: 990000, currency: 'VND', trial_days: 14, is_current: true, effective_from: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-24T00:00:00Z' },
  { id: 'pv-4', plan_id: '00000000-0000-0000-0000-000000000004', version_number: 1, price_monthly: 199000, price_yearly: 1990000, currency: 'VND', trial_days: 14, is_current: true, effective_from: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-24T00:00:00Z' },
  { id: 'pv-5', plan_id: '00000000-0000-0000-0000-000000000005', version_number: 1, price_monthly: 499000, price_yearly: 4990000, currency: 'VND', trial_days: 30, is_current: true, effective_from: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-08-24T00:00:00Z' },
];

export const mockPlanFeatures: PlanFeature[] = [
  { id: 'pf-1', plan_id: '00000000-0000-0000-0000-000000000001', feature_code: 'MAX_MEMBERS', feature_name: 'Số lượng thành viên', feature_type: 'INTEGER', limit_value: 30, is_enabled: true },
  { id: 'pf-2', plan_id: '00000000-0000-0000-0000-000000000001', feature_code: 'MAX_STORAGE_MB', feature_name: 'Dung lượng lưu trữ (MB)', feature_type: 'STORAGE', limit_value: 500, is_enabled: true },
  { id: 'pf-3', plan_id: '00000000-0000-0000-0000-000000000003', feature_code: 'MAX_MEMBERS', feature_name: 'Số lượng thành viên', feature_type: 'INTEGER', limit_value: 300, is_enabled: true },
  { id: 'pf-4', plan_id: '00000000-0000-0000-0000-000000000003', feature_code: 'MAX_STORAGE_MB', feature_name: 'Dung lượng lưu trữ (MB)', feature_type: 'STORAGE', limit_value: 5120, is_enabled: true },
];

export const mockActiveSubscription: Subscription = {
  id: 'sub-001',
  family_id: 'fam-0000-0001',
  plan_id: '00000000-0000-0000-0000-000000000003',
  plan_version_id: 'pv-3',
  status: 'ACTIVE',
  billing_cycle: 'YEARLY',
  current_period_start: '2026-01-01T00:00:00Z',
  current_period_end: '2027-01-01T00:00:00Z',
  cancel_at_period_end: false,
  auto_renew: true,
  payment_provider: 'VIETQR',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-08-24T00:00:00Z',
};

export const mockUsageCounters: UsageCounter[] = [
  { id: 'uc-1', family_id: 'fam-0000-0001', subscription_id: 'sub-001', feature_code: 'MEMBERS_COUNT', current_usage: 86, peak_usage: 86, updated_at: '2026-08-24T00:00:00Z' },
  { id: 'uc-2', family_id: 'fam-0000-0001', subscription_id: 'sub-001', feature_code: 'STORAGE_MB', current_usage: 1240, peak_usage: 1240, updated_at: '2026-08-24T00:00:00Z' },
  { id: 'uc-3', family_id: 'fam-0000-0001', subscription_id: 'sub-001', feature_code: 'BRANCHES_COUNT', current_usage: 3, peak_usage: 3, updated_at: '2026-08-24T00:00:00Z' },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    family_id: 'fam-0000-0001',
    subscription_id: 'sub-001',
    invoice_number: 'INV-20260101-0089',
    subtotal: 990000,
    discount: 0,
    tax: 0,
    total: 990000,
    currency: 'VND',
    status: 'PAID',
    billing_reason: 'Gói Gia Tộc (1 năm) - 300 thành viên',
    issued_at: '2026-01-01T00:00:00Z',
    due_at: '2026-01-10T00:00:00Z',
    paid_at: '2026-01-01T10:15:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T10:15:00Z',
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-0000-0001',
    family_id: 'fam-0000-0001',
    type: 'MEMORIAL_REMINDER',
    title: 'Sắp đến ngày Giỗ Cụ Thủy Tổ (còn 30 ngày)',
    message: 'Lễ giỗ Cụ Thủy Tổ Nguyễn Văn Phúc diễn ra vào ngày 15/08 Âm lịch (25/09 Dương lịch).',
    is_read: false,
    created_at: '2026-08-24T08:00:00Z',
  }
];
