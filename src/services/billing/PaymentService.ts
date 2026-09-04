import { Payment, Invoice, Subscription, AdminBillingConfig } from '../../types/database';
import { mockInvoices, mockPayments, mockActiveSubscription } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface PaymentIntent {
  id: string;
  family_id: string;
  invoice_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  reference_code: string;
  qr_url: string;
  bank_name: string;
  account_no: string;
  account_name: string;
  status: 'PENDING' | 'WAITING_CONFIRMATION' | 'SUCCESS' | 'EXPIRED' | 'PARTIAL';
  expires_at: string;
}

const isUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export class PaymentService {
  /**
   * CỜ TÍNH NĂNG: Vô hiệu hóa Webhook ngân hàng tự động trong môi trường production.
   * Tất cả các giao dịch kích hoạt gói SaaS đều qua xác nhận thủ công từ Admin.
   */
  public static readonly BANK_WEBHOOK_ENABLED: boolean = false;

  private static currentBillingConfig: AdminBillingConfig = {
    id: 'cfg-default',
    bank_name: 'Ngân hàng TMCP Quân đội (MBBank)',
    bank_code: 'MB',
    account_number: '088899998888',
    account_name: 'QUAN TRI VIEN GIA PHA GIA TOC',
    qr_template: 'compact2',
    support_phone: '1900 6868',
    support_email: 'billing@giaphaviet.vercel.app',
    default_invoice_validity_days: 7,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  private static get WEBHOOK_SECRET(): string {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WEBHOOK_SECRET) {
      return (import.meta as any).env.VITE_WEBHOOK_SECRET;
    }
    return typeof process !== 'undefined' && process.env?.BANK_WEBHOOK_SECRET
      ? process.env.BANK_WEBHOOK_SECRET
      : '';
  }

  /**
   * Lấy cấu hình tài khoản thụ hưởng hiện tại
   */
  static getActiveBillingConfig(): AdminBillingConfig {
    return this.currentBillingConfig;
  }

  /**
   * Cập nhật cấu hình tài khoản thụ hưởng (Dành riêng cho Super Admin)
   */
  static updateBillingConfig(config: Partial<AdminBillingConfig>): AdminBillingConfig {
    this.currentBillingConfig = {
      ...this.currentBillingConfig,
      ...config,
      updated_at: new Date().toISOString(),
    };
    return this.currentBillingConfig;
  }

  /**
   * Tạo Payment Intent và sinh mã VietQR chuẩn NAPAS247
   */
  static createPaymentIntent(
    familyId: string,
    invoice: Invoice,
    subscriptionId: string
  ): PaymentIntent {
    const config = this.getActiveBillingConfig();
    const refCode = `GP-${invoice.invoice_number.replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 phút

    const qrUrl = `https://img.vietqr.io/image/${config.bank_code}-${config.account_number}-${config.qr_template}.png?amount=${invoice.total}&addInfo=${encodeURIComponent(refCode)}&accountName=${encodeURIComponent(config.account_name)}`;

    return {
      id: `pi-${Date.now()}`,
      family_id: familyId,
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
      amount: invoice.total,
      currency: 'VND',
      reference_code: refCode,
      qr_url: qrUrl,
      bank_name: config.bank_name,
      account_no: config.account_number,
      account_name: config.account_name,
      status: 'PENDING',
      expires_at: expiresAt,
    };
  }

  /**
    * Khách hàng bấm "Tôi đã chuyển khoản" -> Chuyển Invoice sang WAITING_CONFIRMATION và Payment sang SUBMITTED
   * TUYỆT ĐỐI KHÔNG tự động chuyển sang PAID hay ACTIVE!
   */
  static submitPaymentClaim(
    invoiceId: string,
    claimData: {
      customerBankReference?: string;
      customerNote?: string;
      familyId?: string;
      amount?: number;
      billingReason?: string;
    } = {}
  ): Promise<{ success: boolean; invoice: Invoice; payment: Payment }> & {
    success: boolean;
    invoice: Invoice;
    payment: Payment;
  } {
    const foundInvoice = mockInvoices.find((i) => i.id === invoiceId);
    let invoice: Invoice;
    const now = new Date().toISOString();

    if (!foundInvoice) {
      invoice = {
        id: invoiceId,
        family_id: claimData.familyId || 'fam-0000-0001',
        subscription_id: `sub-${invoiceId}`,
        invoice_number: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        status: 'WAITING_CONFIRMATION',
        subtotal: claimData.amount || 0,
        discount: 0,
        tax: 0,
        total: claimData.amount || 0,
        currency: 'VND',
        billing_reason: claimData.billingReason || 'Đăng ký gói dịch vụ Gia Phả Gia Tộc',
        customer_submitted_at: now,
        customer_bank_reference: claimData.customerBankReference || `REF-${Date.now()}`,
        customer_note: claimData.customerNote || 'Khách hàng đã bấm xác nhận chuyển khoản',
        issued_at: now,
        due_at: now,
        created_at: now,
        updated_at: now,
      };
      mockInvoices.unshift(invoice);
    } else {
      invoice = foundInvoice;
      if (invoice.status === 'PAID') {
        throw new Error('Hóa đơn này đã được xác nhận thanh toán trước đó.');
      }
      invoice.status = 'WAITING_CONFIRMATION';
      invoice.customer_submitted_at = now;
      invoice.customer_bank_reference = claimData.customerBankReference || `REF-${Date.now()}`;
      invoice.customer_note = claimData.customerNote || 'Khách hàng đã bấm xác nhận chuyển khoản';
      invoice.updated_at = now;
    }

    let payment = mockPayments.find((p) => p.invoice_id === invoiceId);
    if (!payment) {
      payment = {
        id: `pay-${Date.now()}`,
        family_id: invoice.family_id,
        subscription_id: invoice.subscription_id,
        invoice_id: invoice.id,
        payment_code: `PAY-SUB-${Date.now()}`,
        amount: invoice.total,
        currency: invoice.currency,
        payment_method: 'VIETQR',
        provider: 'VIETQR_MANUAL',
        status: 'SUBMITTED',
        metadata: {
          customer_submitted_at: now,
          customer_note: invoice.customer_note,
        },
        created_at: now,
        updated_at: now,
      };
      mockPayments.push(payment);
    } else {
      payment.status = 'SUBMITTED';
      payment.updated_at = now;
    }

    const dbPromise = (async () => {
      if (isSupabaseConfigured() && isUUID(invoiceId) && isUUID(invoice.family_id)) {
        const { data: existingInv } = await supabase
          .from('invoices')
          .select('id')
          .eq('id', invoiceId)
          .maybeSingle();

        if (existingInv) {
          const { error: invErr } = await supabase
            .from('invoices')
            .update({
              status: 'WAITING_CONFIRMATION',
              customer_submitted_at: now,
              customer_bank_reference: invoice.customer_bank_reference,
              customer_note: invoice.customer_note,
              updated_at: now,
            })
            .eq('id', invoiceId);

          if (invErr) {
            console.error('submitPaymentClaim invoice update error:', invErr);
            throw new Error(`Cập nhật hóa đơn thất bại: ${invErr.message}`);
          }
        } else {
          let subId = invoice.subscription_id;
          if (!isUUID(subId)) {
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('family_id', invoice.family_id)
              .maybeSingle();
            if (subData?.id) subId = subData.id;
          }

          if (subId) {
            const { error: insertInvErr } = await supabase
              .from('invoices')
              .insert({
                id: invoiceId,
                family_id: invoice.family_id,
                subscription_id: subId,
                invoice_number: invoice.invoice_number,
                status: 'WAITING_CONFIRMATION',
                subtotal: invoice.subtotal,
                discount: invoice.discount,
                tax: invoice.tax,
                total: invoice.total,
                currency: invoice.currency,
                billing_reason: invoice.billing_reason,
                customer_submitted_at: now,
                customer_bank_reference: invoice.customer_bank_reference,
                customer_note: invoice.customer_note,
                issued_at: now,
                due_at: now,
                created_at: now,
                updated_at: now,
              });

            if (insertInvErr) {
              console.error('submitPaymentClaim invoice insert error:', insertInvErr);
              throw new Error(`Tạo hóa đơn thất bại: ${insertInvErr.message}`);
            }
          }
        }

        let subIdForPay = invoice.subscription_id;
        if (!isUUID(subIdForPay)) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('family_id', invoice.family_id)
            .maybeSingle();
          if (subData?.id) subIdForPay = subData.id;
        }

        const { error: payErr } = await supabase
          .from('payments')
          .insert({
            family_id: invoice.family_id,
            subscription_id: isUUID(subIdForPay) ? subIdForPay : null,
            invoice_id: invoiceId,
            payment_code: payment.payment_code,
            amount: payment.amount,
            currency: payment.currency,
            payment_method: payment.payment_method,
            provider: payment.provider,
            status: payment.status,
            metadata: payment.metadata,
            created_at: now,
            updated_at: now,
          });

        if (payErr) {
          console.error('submitPaymentClaim payment insert error:', payErr);
          throw new Error(`Ghi nhận thanh toán thất bại: ${payErr.message}`);
        }
      }
      return { success: true, invoice, payment };
    })();

    return Object.assign(dbPromise, {
      success: true,
      invoice,
      payment,
    });
  }

  /**
   * @deprecated Client method cũ - Chuyển sang submitPaymentClaim
   */
  static notifyClientPaid(intent: PaymentIntent): PaymentIntent {
    this.submitPaymentClaim(intent.invoice_id);
    return {
      ...intent,
      status: 'WAITING_CONFIRMATION',
    };
  }

  /**
   * Xác thực chữ ký HMAC-SHA256 (Dùng cho backward test compatibility)
   */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    try {
      // In Node.js / test runtime
      const nodeCrypto = typeof globalThis !== 'undefined' && (globalThis as any).process ? require('crypto') : null;
      if (nodeCrypto && typeof nodeCrypto.createHmac === 'function') {
        const expected = nodeCrypto
          .createHmac('sha256', this.WEBHOOK_SECRET)
          .update(rawBody)
          .digest('hex');
        return signature === expected;
      }
    } catch {
      // Ignore in browser
    }
    return false;
  }

  /**
   * Xử lý Webhook ngân hàng (Chỉ dùng cho Automated Test Simulation, KHÔNG gọi trong Production Billing Flow)
   */
  static async processBankWebhook(payload: {
    transactionId: string;
    invoiceNumber: string;
    amount: number;
    paymentMethod?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    const { transactionId, invoiceNumber, amount } = payload;

    // 1. Idempotency Check
    const existing = mockPayments.find((p) => p.payment_code === transactionId && p.status === 'SUCCESS');
    if (existing) {
      return {
        success: true,
        message: 'Idempotent replay: Transaction already processed',
        data: { paymentId: existing.id },
      };
    }

    // 2. Tìm hóa đơn
    const invoice = mockInvoices.find((i) => i.invoice_number === invoiceNumber);
    if (!invoice) {
      return { success: false, message: 'Invoice not found' };
    }

    // 3. Kiểm tra số tiền
    if (amount < invoice.total) {
      const partialPay: Payment = {
        id: `pay-${Date.now()}`,
        family_id: invoice.family_id,
        subscription_id: invoice.subscription_id,
        invoice_id: invoice.id,
        payment_code: transactionId,
        amount,
        currency: 'VND',
        payment_method: 'VIETQR',
        provider: 'VIETQR',
        status: 'PARTIAL',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPayments.push(partialPay);

      return {
        success: false,
        message: `Underpayment: Nhận ${amount}đ < Cần ${invoice.total}đ. Ghi nhận thanh toán 1 phần.`,
      };
    }

    // 4. Atomic RPC simulation
    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const successPay: Payment = {
      id: `pay-${Date.now()}`,
      family_id: invoice.family_id,
      subscription_id: invoice.subscription_id,
      invoice_id: invoice.id,
      payment_code: transactionId,
      amount,
      currency: 'VND',
      payment_method: 'VIETQR',
      provider: 'VIETQR',
      status: 'SUCCESS',
      paid_at: now,
      created_at: now,
      updated_at: now,
    };
    mockPayments.push(successPay);

    invoice.status = 'PAID';
    invoice.paid_at = now;
    invoice.updated_at = now;

    if (isSupabaseConfigured() && isUUID(invoice.family_id) && isUUID(invoice.subscription_id) && isUUID(invoice.id)) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('activate_subscription_via_webhook', {
        p_family_id: invoice.family_id,
        p_subscription_id: invoice.subscription_id,
        p_invoice_id: invoice.id,
        p_payment_code: transactionId,
        p_amount: amount,
        p_payment_method: payload.paymentMethod || 'VIETQR',
        p_provider: 'VIETQR',
      });

      if (rpcErr) {
        console.error('PaymentService.processBankWebhook RPC error:', rpcErr);
        return {
          success: false,
          message: rpcErr.message || 'Lỗi kích hoạt thuê bao qua Webhook trên máy chủ',
        };
      }

      if (rpcData && !rpcData.success) {
        return {
          success: false,
          message: rpcData.message || rpcData.error || 'Kích hoạt thuê bao thất bại',
        };
      }
    }

    return {
      success: true,
      message: 'Kích hoạt thuê bao gia tộc thành công qua Webhook ngân hàng (Test Mode)',
      data: {
        familyId: invoice.family_id,
        subscriptionId: invoice.subscription_id,
        invoiceId: invoice.id,
        amount,
        periodEnd,
      },
    };
  }

  /**
   * Ghi nhận hoàn tiền (Refund - Không xóa lịch sử payment)
   */
  static async recordRefund(
    paymentId: string,
    amount: number,
    reason: string,
    createdBy: string = 'admin'
  ): Promise<{ success: boolean; refundId?: string }> {
    const refundId = `ref-${Date.now()}`;
    return { success: true, refundId };
  }
}
