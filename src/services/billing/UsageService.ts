import { UsageCounter, PlanFeature } from '../../types/database';
import { mockUsageCounters, mockMembers, mockEvents, mockBranches } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SubscriptionService } from './SubscriptionService';

export type QuotaLevel = 'NORMAL' | 'WARNING' | 'NEAR_LIMIT' | 'LIMIT_REACHED';

export interface FeatureUsageSummary {
  featureCode: string;
  featureName: string;
  currentUsage: number;
  limitValue: number | null; // null = Unlimited
  unit: string;
  percentage: number;
  level: QuotaLevel;
  isBlocked: boolean;
}

export class UsageService {
  /**
   * Lấy danh sách thống kê sử dụng hạn mức của Family
   */
  static async getUsageSummary(familyId: string = 'fam-0000-0001'): Promise<FeatureUsageSummary[]> {
    // 1. Lấy dữ liệu thực tế từ usage counters
    const memberUsage = mockUsageCounters.find((u) => u.feature_code === 'MEMBERS_COUNT')?.current_usage ?? 86;
    const branchUsage = mockUsageCounters.find((u) => u.feature_code === 'BRANCHES_COUNT')?.current_usage ?? 3;
    const storageUsage = (mockUsageCounters.find((u) => u.feature_code === 'STORAGE_MB')?.current_usage ?? 1240) / 1024;
    const eventCount = mockEvents.filter((e) => e.family_id === familyId).length || 4;

    const metrics: {
      code: string;
      name: string;
      usage: number;
      limit: number | null;
      unit: string;
    }[] = [
      { code: 'MAX_MEMBERS', name: 'Số lượng thành viên', usage: memberUsage, limit: 300, unit: 'người' },
      { code: 'MAX_BRANCHES', name: 'Số chi / nhánh dòng họ', usage: branchUsage, limit: 10, unit: 'chi' },
      { code: 'MAX_EVENTS', name: 'Sự kiện & Đại lễ năm', usage: eventCount, limit: 50, unit: 'sự kiện' },
      { code: 'MAX_STORAGE', name: 'Dung lượng lưu trữ', usage: Number(storageUsage.toFixed(2)), limit: 5.0, unit: 'GB' },
      { code: 'MAX_EXPORTS', name: 'Xuất cây gia phả PDF', usage: 2, limit: 20, unit: 'lượt/tháng' },
      { code: 'MAX_REPORTS', name: 'Báo cáo thu chi chuyên sâu', usage: 5, limit: 30, unit: 'bản/tháng' },
    ];

    return metrics.map((m) => {
      const percentage = m.limit ? Math.min(100, Math.round((m.usage / m.limit) * 100)) : 0;
      let level: QuotaLevel = 'NORMAL';
      if (percentage >= 100) level = 'LIMIT_REACHED';
      else if (percentage >= 90) level = 'NEAR_LIMIT';
      else if (percentage >= 80) level = 'WARNING';

      return {
        featureCode: m.code,
        featureName: m.name,
        currentUsage: m.usage,
        limitValue: m.limit,
        unit: m.unit,
        percentage,
        level,
        isBlocked: m.limit !== null && m.usage >= m.limit,
      };
    });
  }

  /**
   * Kiểm tra hạn mức trước khi thêm mới (Quota Guard)
   */
  static async checkQuota(
    familyId: string,
    featureCode: string,
    delta: number = 1
  ): Promise<{ allowed: boolean; current: number; limit: number | null; message?: string }> {
    const summary = await this.getUsageSummary(familyId);
    const item = summary.find((s) => s.featureCode === featureCode);

    if (!item || item.limitValue === null) {
      return { allowed: true, current: item ? item.currentUsage : 0, limit: null };
    }

    if (item.currentUsage + delta > item.limitValue) {
      return {
        allowed: false,
        current: item.currentUsage,
        limit: item.limitValue,
        message: `Đã đạt hạn mức tối đa (${item.currentUsage}/${item.limitValue} ${item.unit}). Vui lòng nâng cấp gói để tiếp tục.`,
      };
    }

    return {
      allowed: true,
      current: item.currentUsage,
      limit: item.limitValue,
    };
  }
}
