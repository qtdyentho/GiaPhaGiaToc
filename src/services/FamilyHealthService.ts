export type HealthLevel = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export interface FamilyHealthItem {
  familyId: string;
  familyName: string;
  memberCount: number;
  healthScore: number;
  level: HealthLevel;
  lastActive: string;
  featuresUsed: string[];
  openTickets: number;
  subscriptionStatus: string;
  riskFlags: string[];
  breakdown: {
    dataCompleteness: number; // Max 25
    featureAdoption: number; // Max 20
    weeklyActivity: number; // Max 20
    financialUsage: number; // Max 15
    calendarUsage: number; // Max 10
    supportHealth: number; // Max 10
  };
}

export class FamilyHealthService {
  /**
   * Tính toán điểm sức khỏe dòng họ (Family Health Score: 0 - 100)
   */
  static calculateHealthScore(params: {
    hasMembers: boolean;
    hasRelationships: boolean;
    hasMemorials: boolean;
    hasEvents: boolean;
    hasFunds: boolean;
    featuresAdoptedCount: number; // 0 - 8
    weeklyActiveUsersCount: number;
    hasFinancialTransactions: boolean;
    hasUpcomingMemorials: boolean;
    openCriticalTickets: number;
  }): { score: number; level: HealthLevel; riskFlags: string[]; breakdown: FamilyHealthItem['breakdown'] } {
    // 1. Data Completeness (25%)
    let dataCompleteness = 0;
    if (params.hasMembers) dataCompleteness += 10;
    if (params.hasRelationships) dataCompleteness += 5;
    if (params.hasMemorials) dataCompleteness += 5;
    if (params.hasFunds) dataCompleteness += 5;

    // 2. Feature Adoption (20%)
    const featureAdoption = Math.min(20, Math.round((params.featuresAdoptedCount / 8) * 20));

    // 3. Weekly Activity (20%)
    const weeklyActivity = params.weeklyActiveUsersCount >= 3 ? 20 : params.weeklyActiveUsersCount > 0 ? 12 : 0;

    // 4. Financial Usage (15%)
    const financialUsage = params.hasFinancialTransactions ? 15 : params.hasFunds ? 8 : 0;

    // 5. Calendar Usage (10%)
    const calendarUsage = params.hasUpcomingMemorials || params.hasEvents ? 10 : params.hasMemorials ? 5 : 0;

    // 6. Support Health (10%)
    const supportHealth = params.openCriticalTickets === 0 ? 10 : params.openCriticalTickets === 1 ? 5 : 0;

    const totalScore = Math.min(100, Math.max(0, dataCompleteness + featureAdoption + weeklyActivity + financialUsage + calendarUsage + supportHealth));

    let level: HealthLevel = 'HEALTHY';
    const riskFlags: string[] = [];

    if (totalScore >= 80) {
      level = 'HEALTHY';
    } else if (totalScore >= 60) {
      level = 'AT_RISK';
      riskFlags.push('Hoạt động tuần giảm', 'Chưa hoàn tất thiết lập quỹ');
    } else {
      level = 'CRITICAL';
      riskFlags.push('Chưa nhập cây gia phả', 'Không có hoạt động trong 14 ngày', 'Chưa kích hoạt tính năng');
    }

    return {
      score: totalScore,
      level,
      riskFlags,
      breakdown: {
        dataCompleteness,
        featureAdoption,
        weeklyActivity,
        financialUsage,
        calendarUsage,
        supportHealth,
      },
    };
  }

  /**
   * Danh sách bảng sức khỏe toàn bộ dòng họ Closed Beta
   */
  static getClosedBetaFamiliesHealth(): FamilyHealthItem[] {
    return [
      {
        familyId: 'fam-0000-0001',
        familyName: 'Đại Tộc Nguyễn Văn (Hoàng Mai, Hà Nội)',
        memberCount: 86,
        healthScore: 95,
        level: 'HEALTHY',
        lastActive: '2026-08-24T08:30:00Z',
        featuresUsed: ['Phả Hệ', 'Lịch Âm', 'Ngày Giỗ', 'Sổ Quỹ', 'VietQR', 'Công Đức'],
        openTickets: 0,
        subscriptionStatus: 'ACTIVE',
        riskFlags: [],
        breakdown: { dataCompleteness: 25, featureAdoption: 20, weeklyActivity: 20, financialUsage: 15, calendarUsage: 10, supportHealth: 10 },
      },
      {
        familyId: 'fam-0000-0002',
        familyName: 'Họ Trần Tộc (Nam Định)',
        memberCount: 142,
        healthScore: 88,
        level: 'HEALTHY',
        lastActive: '2026-08-23T15:20:00Z',
        featuresUsed: ['Phả Hệ', 'Lịch Âm', 'Sổ Quỹ', 'VietQR'],
        openTickets: 0,
        subscriptionStatus: 'TRIALING',
        riskFlags: [],
        breakdown: { dataCompleteness: 25, featureAdoption: 18, weeklyActivity: 20, financialUsage: 15, calendarUsage: 5, supportHealth: 10 },
      },
      {
        familyId: 'fam-0000-0003',
        familyName: 'Lê Tộc Đại Tôn (Thanh Hóa)',
        memberCount: 210,
        healthScore: 82,
        level: 'HEALTHY',
        lastActive: '2026-08-22T09:15:00Z',
        featuresUsed: ['Phả Hệ', 'Ngày Giỗ', 'Sổ Quỹ'],
        openTickets: 0,
        subscriptionStatus: 'TRIALING',
        riskFlags: [],
        breakdown: { dataCompleteness: 25, featureAdoption: 16, weeklyActivity: 16, financialUsage: 15, calendarUsage: 5, supportHealth: 10 },
      },
      {
        familyId: 'fam-0000-0004',
        familyName: 'Phạm Tộc Chi 2 (Hải Dương)',
        memberCount: 64,
        healthScore: 72,
        level: 'AT_RISK',
        lastActive: '2026-08-18T14:00:00Z',
        featuresUsed: ['Phả Hệ', 'Lịch Âm'],
        openTickets: 1,
        subscriptionStatus: 'TRIALING',
        riskFlags: ['Chưa thiết lập quỹ', 'Ít hoạt động trong 7 ngày'],
        breakdown: { dataCompleteness: 20, featureAdoption: 12, weeklyActivity: 12, financialUsage: 8, calendarUsage: 10, supportHealth: 10 },
      },
      {
        familyId: 'fam-0000-0005',
        familyName: 'Vũ Tộc Chi Trưởng (Bắc Ninh)',
        memberCount: 45,
        healthScore: 54,
        level: 'CRITICAL',
        lastActive: '2026-08-10T11:00:00Z',
        featuresUsed: ['Phả Hệ'],
        openTickets: 0,
        subscriptionStatus: 'READ_ONLY',
        riskFlags: ['Hết hạn dùng thử', 'Chưa có ngày giỗ & quỹ'],
        breakdown: { dataCompleteness: 15, featureAdoption: 8, weeklyActivity: 5, financialUsage: 0, calendarUsage: 5, supportHealth: 10 },
      },
    ];
  }
}
