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
    support_email: 'billing@giaphagiatoc.vn',
    default_invoice_validity_days: 7,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  private static readonly WEBHOOK_SECRET = 'secret-alpha-key-2026';

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
    } = {}
  ): { success: boolean; invoice: Invoice; payment: Payment } {
    const invoice = mockInvoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn: ${invoiceId}`);
    }

    if (invoice.status === 'PAID') {
      throw new Error('Hóa đơn này đã được xác nhận thanh toán trước đó.');
    }

    const now = new Date().toISOString();
    invoice.status = 'WAITING_CONFIRMATION';
    invoice.customer_submitted_at = now;
    invoice.customer_bank_reference = claimData.customerBankReference || `REF-${Date.now()}`;
    invoice.customer_note = claimData.customerNote || 'Khách hàng đã bấm xác nhận chuyển khoản';
    invoice.updated_at = now;

    // Tạo hoặc cập nhật bản ghi Payment với status = 'SUBMITTED'
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

    return { success: true, invoice, payment };
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

    if (isSupabaseConfigured()) {
      await supabase.rpc('activate_subscription_via_webhook', {
        p_family_id: invoice.family_id,
        p_subscription_id: invoice.subscription_id,
        p_invoice_id: invoice.id,
        p_payment_code: transactionId,
        p_amount: amount,
      });
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
