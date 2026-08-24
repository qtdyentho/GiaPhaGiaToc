import { Plan, PlanVersion, Subscription, Invoice, UsageCounter } from '../types/database';
import { mockPlans, mockPlanVersions, mockActiveSubscription, mockInvoices, mockUsageCounters } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export * from './billing/SubscriptionService';
export * from './billing/UsageService';
export * from './billing/InvoiceService';
export * from './billing/PaymentService';
export * from './billing/AdminBillingService';

export class BillingService {
  static async getPublicPlans(): Promise<{ plans: Plan[]; versions: PlanVersion[] }> {
    if (isSupabaseConfigured()) {
      const [plansRes, versRes] = await Promise.all([
        supabase.from('plans').select('*').eq('is_active', true),
        supabase.from('plan_versions').select('*').eq('is_current', true),
      ]);
      if (!plansRes.error && plansRes.data && plansRes.data.length > 0) {
        return {
          plans: plansRes.data as Plan[],
          versions: (versRes.data as PlanVersion[]) || mockPlanVersions,
        };
      }
    }

    return {
      plans: mockPlans,
      versions: mockPlanVersions,
    };
  }

  static async getActiveSubscription(familyId?: string): Promise<Subscription> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('subscriptions').select('*').eq('status', 'ACTIVE').limit(1);
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query.single();
      if (!error && data) return data as Subscription;
    }
    return mockActiveSubscription;
  }

  static async getInvoices(familyId?: string): Promise<Invoice[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Invoice[];
    }
    return mockInvoices;
  }

  static async getUsageCounters(familyId?: string): Promise<UsageCounter[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('usage_counters').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as UsageCounter[];
    }
    return mockUsageCounters;
  }
}
