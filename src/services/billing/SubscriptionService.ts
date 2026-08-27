import {
  Subscription,
  SubscriptionStatus,
  SubscriptionEventType,
  Plan,
  PlanVersion,
  TrialPeriod,
} from '../../types/database';
import {
  mockPlans,
  mockPlanVersions,
  mockActiveSubscription,
} from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export class SubscriptionService {
  /**
   * Tạo gói dùng thử 30 ngày cho Family mới thành lập (BR-TRIAL-001)
   */
  static async createTrialSubscription(familyId: string, planId: string = 'plan-giatoc'): Promise<Subscription> {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const sub: Subscription = {
      id: `sub-trial-${Date.now()}`,
      family_id: familyId,
      plan_id: planId,
      plan_version_id: 'pv-giatoc-v1',
      status: 'TRIALING',
      billing_cycle: 'YEARLY',
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      cancel_at_period_end: false,
      auto_renew: true,
      payment_provider: 'VIETQR',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(sub)
        .select()
        .single();
      if (!error && data) return data as Subscription;
    }

    return sub;
  }

  /**
   * Lấy thông tin thuê bao hiện tại của Family (Strict Single-Tenant Isolation)
   */
  static async getSubscription(familyId?: string): Promise<Subscription> {
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured() && familyId && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('family_id', familyId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) return data as Subscription;
      } catch (err) {
        console.warn('Subscription fetch error:', err);
      }

      // Default Trialing subscription for newly created real family
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return {
        id: `sub-trial-${familyId.slice(0, 8)}`,
        family_id: familyId,
        plan_id: 'plan-giatoc',
        plan_version_id: 'pv-giatoc-v1',
        status: 'TRIALING',
        billing_cycle: 'YEARLY',
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
        cancel_at_period_end: false,
        auto_renew: false,
        payment_provider: 'VIETQR',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
    }

    if (familyId && familyId !== mockActiveSubscription.family_id) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return {
        id: `sub-trial-${familyId}`,
        family_id: familyId,
        plan_id: 'plan-giatoc',
        plan_version_id: 'pv-giatoc-v1',
        status: 'TRIALING',
        billing_cycle: 'YEARLY',
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
        cancel_at_period_end: false,
        auto_renew: false,
        payment_provider: 'VIETQR',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
    }

    return mockActiveSubscription;
  }

  /**
   * Nâng cấp gói thuê bao (Upgrade Plan)
   */
  static async upgradePlan(
    familyId: string,
    newPlanId: string,
    newPlanVersionId: string,
    cycle: 'MONTHLY' | 'YEARLY' = 'YEARLY'
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    const current = await this.getSubscription(familyId);
    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + (cycle === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    const updated: Subscription = {
      ...current,
      plan_id: newPlanId,
      plan_version_id: newPlanVersionId,
      status: 'ACTIVE',
      billing_cycle: cycle,
      current_period_start: now,
      current_period_end: periodEnd,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('subscriptions')
        .update(updated)
        .eq('id', current.id);

      if (error) return { success: false, error: error.message };
    }

    return { success: true, subscription: updated };
  }

  /**
   * Hạ cấp gói thuê bao (Downgrade - Có hiệu lực vào cuối kỳ)
   */
  static async downgradePlan(
    familyId: string,
    newPlanId: string,
    newPlanVersionId: string
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    const current = await this.getSubscription(familyId);
    const updated: Subscription = {
      ...current,
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('subscriptions')
        .update(updated)
        .eq('id', current.id);

      if (error) return { success: false, error: error.message };
    }

    return { success: true, subscription: updated };
  }

  /**
   * Hủy gia hạn thuê bao (Cancel at period end)
   */
  static async cancelSubscription(
    familyId: string,
    reason: string = 'User requested cancellation'
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    const current = await this.getSubscription(familyId);
    const now = new Date().toISOString();

    const updated: Subscription = {
      ...current,
      cancel_at_period_end: true,
      cancelled_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('subscriptions')
        .update(updated)
        .eq('id', current.id);

      if (error) return { success: false, error: error.message };
    }

    return { success: true, subscription: updated };
  }

  /**
   * Khôi phục gia hạn thuê bao (Resume subscription)
   */
  static async resumeSubscription(
    familyId: string
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    const current = await this.getSubscription(familyId);
    const updated: Subscription = {
      ...current,
      cancel_at_period_end: false,
      cancelled_at: undefined,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('subscriptions')
        .update(updated)
        .eq('id', current.id);

      if (error) return { success: false, error: error.message };
    }

    return { success: true, subscription: updated };
  }

  /**
   * Chuyển trạng thái sang READ_ONLY khi hết hạn (Zero Data Loss Grace Mode)
   */
  static async expireToReadOnly(
    familyId: string,
    reason: string = 'Billing Period Ended'
  ): Promise<Subscription> {
    const current = await this.getSubscription(familyId);
    const now = new Date().toISOString();

    const updated: Subscription = {
      ...current,
      status: 'READ_ONLY',
      expired_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      await supabase
        .from('subscriptions')
        .update(updated)
        .eq('id', current.id);
    }

    return updated;
  }

  /**
   * Kiểm tra quyền ghi dữ liệu (Write Permission Guard)
   */
  static isReadOnlyMode(sub: Subscription): boolean {
    return sub.status === 'READ_ONLY' || sub.status === 'EXPIRED' || sub.status === 'SUSPENDED';
  }
}
