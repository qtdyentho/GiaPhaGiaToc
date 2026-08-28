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

  static async getActiveSubscription(familyId?: string): Promise<Subscription | null> {
    if (!familyId) return null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('status', 'ACTIVE').eq('family_id', familyId).maybeSingle();
      if (!error && data) return data as Subscription;
    }
    return null;
  }

  static async getInvoices(familyId?: string): Promise<Invoice[]> {
    if (!familyId) return [];
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('invoices').select('*').eq('family_id', familyId).order('created_at', { ascending: false });
      if (!error && data) return data as Invoice[];
    }
    return [];
  }

  static async getUsageCounters(familyId?: string): Promise<UsageCounter[]> {
    if (!familyId) return [];
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('usage_counters').select('*').eq('family_id', familyId);
      if (!error && data) return data as UsageCounter[];
    }
    return [];
  }
}
