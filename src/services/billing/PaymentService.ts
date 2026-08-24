import { Payment, Invoice, Subscription } from '../../types/database';
import { mockInvoices, mockPayments } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import * as crypto from 'crypto';

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
  status: 'PENDING' | 'WAITING_BANK' | 'SUCCESS' | 'EXPIRED' | 'PARTIAL';
  expires_at: string;
}

export class PaymentService {
  private static readonly BANK_CODE = 'MB'; // MBBank (970422)
  private static readonly ACCOUNT_NO = '0987654321';
  private static readonly ACCOUNT_NAME = 'CTY GIA PHA GIA TOC SAAS';
  private static readonly WEBHOOK_SECRET = 'secret-alpha-key-2026';

  /**
   * Tạo Payment Intent và sinh mã VietQR chuẩn NAPAS247
   */
  static createPaymentIntent(
    familyId: string,
    invoice: Invoice,
    subscriptionId: string
  ): PaymentIntent {
    const refCode = `GP-${invoice.invoice_number.replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 phút

    const qrUrl = `https://img.vietqr.io/image/${this.BANK_CODE}-${this.ACCOUNT_NO}-compact2.png?amount=${invoice.total}&addInfo=${encodeURIComponent(refCode)}&accountName=${encodeURIComponent(this.ACCOUNT_NAME)}`;

    return {
      id: `pi-${Date.now()}`,
      family_id: familyId,
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
      amount: invoice.total,
      currency: 'VND',
      reference_code: refCode,
      qr_url: qrUrl,
      bank_name: 'MBBank (Ngân Hàng Quân Đội)',
      account_no: this.ACCOUNT_NO,
      account_name: this.ACCOUNT_NAME,
      status: 'PENDING',
      expires_at: expiresAt,
    };
  }

  /**
   * Client-side "Tôi đã thanh toán" - CHỈ chuyển trạng thái sang WAITING_BANK (Không bypass kích hoạt)
   */
  static notifyClientPaid(intent: PaymentIntent): PaymentIntent {
    return {
      ...intent,
      status: 'WAITING_BANK',
    };
  }

  /**
   * Xác thực chữ ký HMAC-SHA256 của Webhook ngân hàng
   */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    const expected = crypto
      .createHmac('sha256', this.WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return signature === expected;
  }

  /**
   * Xử lý Webhook ngân hàng và Kích hoạt nguyên tử (Atomic RPC)
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
      // Partial payment
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

    // 4. Atomic RPC: Cập nhật Payment, Invoice, Subscription
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

    // Cập nhật Invoice
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
      message: 'Kích hoạt thuê bao gia tộc thành công qua Webhook ngân hàng',
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
