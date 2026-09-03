import { UsageCounter, PlanFeature } from '../../types/database';
import { mockUsageCounters, mockMembers, mockEvents, mockBranches, mockTransactions, mockPlans } from '../mockData';
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
   * Lấy danh sách thống kê sử dụng hạn mức thực tế của Gia Tộc
   */
  static async getUsageSummary(familyId: string = 'fam-0000-0001'): Promise<FeatureUsageSummary[]> {
    let memberCount = 0;
    let branchCount = 0;
    let eventCount = 0;
    let txCount = 0;

    if (isSupabaseConfigured() && familyId && familyId.includes('-')) {
      try {
        const [
          { count: memC },
          { count: brC },
          { count: evC },
          { count: txC },
        ] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('branches').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
          supabase.from('financial_transactions').select('*', { count: 'exact', head: true }).eq('family_id', familyId),
        ]);

        memberCount = memC ?? 0;
        branchCount = brC ?? 0;
        eventCount = evC ?? 0;
        txCount = txC ?? 0;
      } catch (err) {
        console.warn('Lỗi khi đếm quota từ Supabase:', err);
      }
    }

    // Fallback: đếm theo mock/local state của familyId
    if (memberCount === 0) {
      if (familyId === 'fam-0000-0001') {
        memberCount = 86;
      } else {
        memberCount = mockMembers.filter((m) => m.family_id === familyId).length || 2;
      }
    }

    if (branchCount === 0) {
      branchCount = mockBranches.filter((b) => b.family_id === familyId).length || 3;
    }

    if (eventCount === 0) {
      eventCount = mockEvents.filter((e) => e.family_id === familyId).length || 4;
    }

    if (txCount === 0) {
      txCount = mockTransactions.filter((t) => t.family_id === familyId).length || 5;
    }

    const storageUsageGB = Number(((memberCount * 12 + 100) / 1024).toFixed(2));

    // Đọc động hạn mức theo gói cước thực tế của dòng họ (BIL-04)
    let maxMembers: number | null = 300;
    let maxBranches: number | null = 15;
    let maxEvents: number | null = 50;
    let maxStorage: number | null = 5.0;

    try {
      const sub = await SubscriptionService.getSubscription(familyId);
      if (sub) {
        const plan = mockPlans.find((p) => p.id === sub.plan_id) || mockPlans.find((p) => p.code === (sub as any).plan_tier);
        const planCode = plan?.code || (sub as any).plan_tier || 'GIA_TOC';
        switch (planCode) {
          case 'FREE':
            maxMembers = 30;
            maxBranches = 3;
            maxEvents = 5;
            maxStorage = 1.0;
            break;
          case 'FAMILY':
            maxMembers = 100;
            maxBranches = 5;
            maxEvents = 20;
            maxStorage = 2.0;
            break;
          case 'GIA_TOC':
            maxMembers = 300;
            maxBranches = 15;
            maxEvents = 50;
            maxStorage = 5.0;
            break;
          case 'DONG_HO':
            maxMembers = 1000;
            maxBranches = 50;
            maxEvents = 100;
            maxStorage = 15.0;
            break;
          case 'PREMIUM':
            maxMembers = null;
            maxBranches = null;
            maxEvents = null;
            maxStorage = null;
            break;
        }
      }
    } catch {
      // Giữ default an toàn
    }

    const metrics: {
      code: string;
      name: string;
      usage: number;
      limit: number | null;
      unit: string;
    }[] = [
      { code: 'MAX_MEMBERS', name: 'Số lượng thành viên', usage: memberCount, limit: maxMembers, unit: 'người' },
      { code: 'MAX_BRANCHES', name: 'Số chi / nhánh dòng họ', usage: branchCount, limit: maxBranches, unit: 'chi' },
      { code: 'MAX_EVENTS', name: 'Sự kiện & Đại lễ năm', usage: eventCount, limit: maxEvents, unit: 'sự kiện' },
      { code: 'MAX_STORAGE', name: 'Dung lượng lưu trữ', usage: storageUsageGB, limit: maxStorage, unit: 'GB' },
      { code: 'MAX_EXPORTS', name: 'Xuất cây gia phả PDF', usage: 2, limit: 20, unit: 'lượt/tháng' },
      { code: 'MAX_REPORTS', name: 'Báo cáo thu chi chuyên sâu', usage: Math.min(txCount, 30), limit: 30, unit: 'bản/tháng' },
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
        message: `Đã đạt hạn mức tối đa (${item.currentUsage}/${item.limitValue} ${item.unit}). Vui lòng nâng cấp gói để tiếp tục phụng sự gia tộc.`,
      };
    }

    return {
      allowed: true,
      current: item.currentUsage,
      limit: item.limitValue,
    };
  }
}
