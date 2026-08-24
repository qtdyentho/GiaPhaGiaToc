import { Subscription, Invoice, Payment, Plan } from '../../types/database';
import { mockPlans, mockInvoices, mockPayments } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface SaasRevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  arpu: number; // Average Revenue Per User/Family
  activeSubscriptions: number;
  trialSubscriptions: number;
  pastDueSubscriptions: number;
  expiredSubscriptions: number;
  churnRatePercentage: number;
  totalCollectedRevenue: number;
  revenueByPlan: { planName: string; count: number; revenue: number }[];
  monthlyRevenueHistory: { month: string; amount: number }[];
}

export class AdminBillingService {
  /**
   * Lấy toàn bộ chỉ số tài chính SaaS cho Super Admin
   */
  static async getRevenueMetrics(): Promise<SaasRevenueMetrics> {
    const activeSubs = 142;
    const trialSubs = 28;
    const pastDueSubs = 3;
    const expiredSubs = 12;

    const mrr = 14850000;
    const arr = mrr * 12;
    const arpu = Math.round(mrr / (activeSubs || 1));
    const totalCollected = mockPayments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 245000000);

    const revenueByPlan = [
      { planName: 'Gói Gia Tộc (GiaToc)', count: 98, revenue: 194040000 },
      { planName: 'Gói Chi Họ (Family)', count: 32, revenue: 31680000 },
      { planName: 'Gói Đại Tộc (DongHo)', count: 12, revenue: 59880000 },
    ];

    const monthlyRevenueHistory = [
      { month: '03/2026', amount: 18500000 },
      { month: '04/2026', amount: 22400000 },
      { month: '05/2026', amount: 26800000 },
      { month: '06/2026', amount: 31200000 },
      { month: '07/2026', amount: 35600000 },
      { month: '08/2026', amount: 42500000 },
    ];

    return {
      mrr,
      arr,
      arpu,
      activeSubscriptions: activeSubs,
      trialSubscriptions: trialSubs,
      pastDueSubscriptions: pastDueSubs,
      expiredSubscriptions: expiredSubs,
      churnRatePercentage: 1.8,
      totalCollectedRevenue: totalCollected,
      revenueByPlan,
      monthlyRevenueHistory,
    };
  }

  /**
   * Admin can thiệp gia hạn hoặc thay đổi gói thủ công (Yêu cầu bắt buộc lý do kiểm toán)
   */
  static async adminOverrideSubscription(
    adminUserId: string,
    subscriptionId: string,
    action: 'EXTEND_TRIAL' | 'MANUAL_ACTIVATE' | 'SUSPEND',
    reason: string,
    days?: number
  ): Promise<{ success: boolean; message: string }> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Lý do can thiệp kiểm toán bắt buộc phải có ít nhất 5 ký tự');
    }

    // Ghi nhận Audit Log
    console.log(`[ADMIN_AUDIT] User ${adminUserId} performed ${action} on ${subscriptionId}. Reason: ${reason}`);

    return {
      success: true,
      message: `Đã thực thi thành công tác vụ ${action} cho thuê bao ${subscriptionId}.`,
    };
  }
}
