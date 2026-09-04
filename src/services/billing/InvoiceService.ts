import { Invoice, InvoiceItem } from '../../types/database';
import { mockInvoices, mockPlans, mockPlanVersions } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SubscriptionService } from './SubscriptionService';

export class InvoiceService {
  /**
   * Tạo hóa đơn đăng ký/gia hạn gói cước (Server-side price calculation)
   */
  static async createSubscriptionInvoice(
    familyId: string,
    subscriptionId: string,
    planId: string,
    versionId: string,
    cycle: 'MONTHLY' | 'YEARLY' = 'YEARLY'
  ): Promise<Invoice> {
    const plan = mockPlans.find((p) => p.id === planId) || mockPlans[2]; // Gói Gia Tộc
    const version = mockPlanVersions.find((v) => v.id === versionId) || mockPlanVersions[2];

    const amount = cycle === 'YEARLY' ? version.price_yearly : version.price_monthly;
    const invNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const now = new Date().toISOString();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured() && isUUID(familyId)) {
      let resolvedSubId: string | null = isUUID(subscriptionId) ? subscriptionId : null;
      if (!resolvedSubId) {
        const { data: subData } = await supabase.from('subscriptions').select('id').eq('family_id', familyId).maybeSingle();
        if (subData?.id) {
          resolvedSubId = subData.id;
        }
      }

      if (!resolvedSubId) {
        try {
          const newSub = await SubscriptionService.createTrialSubscription(familyId);
          if (isUUID(newSub?.id)) {
            resolvedSubId = newSub.id;
          }
        } catch (e) {
          console.warn('createSubscriptionInvoice auto-subscription error:', e);
        }
      }

      if (!resolvedSubId) {
        throw new Error('Không thể tạo hóa đơn khi chưa có mã thuê bao hợp lệ');
      }

      const payload: Record<string, any> = {
        family_id: familyId,
        subscription_id: resolvedSubId,
        invoice_number: invNumber,
        status: 'OPEN',
        subtotal: amount,
        discount: 0,
        tax: 0,
        total: amount,
        currency: 'VND',
        billing_reason: `${plan.name} (${cycle === 'YEARLY' ? '1 năm' : '1 tháng'})`,
        issued_at: now,
        due_at: dueDate,
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('createSubscriptionInvoice error:', error);
        throw new Error(error.message || 'Không thể tạo hóa đơn trên cơ sở dữ liệu');
      }
      if (data) return data as Invoice;
    }

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      family_id: familyId,
      subscription_id: subscriptionId,
      invoice_number: invNumber,
      status: 'OPEN',
      subtotal: amount,
      discount: 0,
      tax: 0,
      total: amount,
      currency: 'VND',
      billing_reason: `${plan.name} (${cycle === 'YEARLY' ? '1 năm' : '1 tháng'})`,
      issued_at: now,
      due_at: dueDate,
      created_at: now,
      updated_at: now,
    };

    mockInvoices.push(invoice);
    return invoice;
  }

  /**
   * Lấy danh sách hóa đơn của Family (Strict Single-Tenant Isolation)
   */
  static async getInvoices(familyId?: string): Promise<Invoice[]> {
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (!familyId) return [];

    if (isSupabaseConfigured() && isUUID(familyId)) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`InvoiceService.getInvoices error: ${error.message}`);
      }
      return (data || []) as Invoice[];
    }

    return mockInvoices.filter((i) => i.family_id === familyId);
  }

  /**
   * Lấy chi tiết hóa đơn theo ID
   */
  static async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    const isUUID = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (isSupabaseConfigured() && isUUID(invoiceId)) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();

      if (error) {
        throw new Error(`InvoiceService.getInvoiceById error: ${error.message}`);
      }
      return (data as Invoice) || null;
    }

    return mockInvoices.find((i) => i.id === invoiceId) || null;
  }
}
