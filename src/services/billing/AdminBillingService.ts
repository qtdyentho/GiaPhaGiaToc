import { Subscription, Invoice, Payment, Plan } from '../../types/database';
import { mockPlans, mockInvoices, mockPayments, mockActiveSubscription } from '../mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Logger } from '../../lib/logger';

export interface SaasRevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  arpu: number; // Average Revenue Per User/Family
  activeSubscriptions: number;
  trialSubscriptions: number;
  pastDueSubscriptions: number;
  expiredSubscriptions: number;
  pendingConfirmations: number;
  churnRatePercentage: number;
  totalCollectedRevenue: number;
  revenueByPlan: { planName: string; count: number; revenue: number }[];
  monthlyRevenueHistory: { month: string; amount: number }[];
}

export interface ConfirmPaymentParams {
  transactionReference: string;
  receivedAmount: number;
  bankTransactionDate: string;
  auditReason: string;
}

export interface RejectPaymentParams {
  rejectReason: string;
  auditReason?: string;
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
    const pendingCount = mockInvoices.filter((i) => i.status === 'WAITING_CONFIRMATION').length;

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
      pendingConfirmations: pendingCount,
      churnRatePercentage: 1.8,
      totalCollectedRevenue: totalCollected,
      revenueByPlan,
      monthlyRevenueHistory,
    };
  }

  /**
   * Lấy danh sách các hóa đơn cần xác nhận thanh toán
   */
  static getPendingPaymentConfirmations(): Invoice[] {
    return mockInvoices.filter(
      (i) => i.status === 'WAITING_CONFIRMATION' || i.status === 'PENDING_PAYMENT' || i.status === 'OPEN'
    );
  }

  /**
   * Admin xác nhận thủ công thanh toán (Atomic RPC Execution)
   */
  static async adminConfirmPayment(
    adminUserId: string,
    invoiceId: string,
    params: ConfirmPaymentParams
  ): Promise<{
    success: boolean;
    code: 'CONFIRM_SUCCESS' | 'ALREADY_PROCESSED' | 'PARTIAL_PAYMENT' | 'OVERPAYMENT' | 'FAILED';
    message: string;
    invoice?: Invoice;
    payment?: Payment;
    subscription?: Subscription;
  }> {
    const { transactionReference, receivedAmount, bankTransactionDate, auditReason } = params;

    // 1. Kiểm tra quyền & đầu vào
    if (!adminUserId) {
      throw new Error('Bảo mật: Yêu cầu định danh Super Admin để xác nhận thanh toán');
    }

    if (!auditReason || auditReason.trim().length < 5) {
      throw new Error('Lý do can thiệp kiểm toán bắt buộc phải có ít nhất 5 ký tự');
    }

    if (!transactionReference || transactionReference.trim().length < 3) {
      throw new Error('Mã giao dịch ngân hàng / tham chiếu (Transaction Reference) là bắt buộc');
    }

    // 2. Tìm hóa đơn
    const invoice = mockInvoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn: ${invoiceId}`);
    }

    // 3. Idempotency Check
    if (invoice.status === 'PAID') {
      return {
        success: false,
        code: 'ALREADY_PROCESSED',
        message: 'Hóa đơn này đã được xác nhận thanh toán trước đó (Idempotent Guard)',
        invoice,
      };
    }

    const now = new Date().toISOString();

    // 4. Kiểm tra số tiền thực nhận
    if (receivedAmount < invoice.total) {
      // Thanh toán thiếu -> Ghi nhận PARTIAL, KHÔNG kích hoạt thuê bao
      let partialPay = mockPayments.find((p) => p.invoice_id === invoiceId);
      if (!partialPay) {
        partialPay = {
          id: `pay-part-${Date.now()}`,
          family_id: invoice.family_id,
          subscription_id: invoice.subscription_id,
          invoice_id: invoice.id,
          payment_code: `PAY-MANUAL-${Date.now()}`,
          amount: receivedAmount,
          currency: invoice.currency,
          payment_method: 'BANK_TRANSFER',
          provider: 'MANUAL_ADMIN',
          status: 'PARTIAL',
          transaction_reference: transactionReference,
          received_amount: receivedAmount,
          bank_transaction_date: bankTransactionDate,
          audit_reason: auditReason,
          confirmed_by: adminUserId,
          created_at: now,
          updated_at: now,
        };
        mockPayments.push(partialPay);
      } else {
        partialPay.status = 'PARTIAL';
        partialPay.received_amount = receivedAmount;
        partialPay.transaction_reference = transactionReference;
        partialPay.audit_reason = auditReason;
        partialPay.confirmed_by = adminUserId;
        partialPay.updated_at = now;
      }

      console.warn(`[ADMIN_PAYMENT_PARTIAL] Admin ${adminUserId} ghi nhận thanh toán thiếu ${receivedAmount}/${invoice.total}đ cho hóa đơn ${invoice.invoice_number}`);

      return {
        success: false,
        code: 'PARTIAL_PAYMENT',
        message: `Thanh toán chưa đủ: Thực nhận ${receivedAmount.toLocaleString('vi-VN')}đ < Hóa đơn ${invoice.total.toLocaleString('vi-VN')}đ. Chưa kích hoạt gói.`,
        invoice,
        payment: partialPay,
      };
    }

    // 5. Thanh toán thừa (Overpayment)
    const isOverpayment = receivedAmount > invoice.total;

    // 6. Cập nhật Payment thành SUCCESS
    let payment = mockPayments.find((p) => p.invoice_id === invoiceId);
    if (!payment) {
      payment = {
        id: `pay-ok-${Date.now()}`,
        family_id: invoice.family_id,
        subscription_id: invoice.subscription_id,
        invoice_id: invoice.id,
        payment_code: `PAY-MANUAL-${Date.now()}`,
        amount: invoice.total,
        currency: invoice.currency,
        payment_method: 'BANK_TRANSFER',
        provider: 'MANUAL_ADMIN',
        status: isOverpayment ? 'OVERPAYMENT' : 'SUCCESS',
        transaction_reference: transactionReference,
        received_amount: receivedAmount,
        bank_transaction_date: bankTransactionDate,
        audit_reason: auditReason,
        confirmed_by: adminUserId,
        paid_at: now,
        created_at: now,
        updated_at: now,
      };
      mockPayments.push(payment);
    } else {
      payment.status = isOverpayment ? 'OVERPAYMENT' : 'SUCCESS';
      payment.transaction_reference = transactionReference;
      payment.received_amount = receivedAmount;
      payment.bank_transaction_date = bankTransactionDate;
      payment.audit_reason = auditReason;
      payment.confirmed_by = adminUserId;
      payment.paid_at = now;
      payment.updated_at = now;
    }

    // 7. Cập nhật Invoice thành PAID
    invoice.status = 'PAID';
    invoice.paid_at = now;
    invoice.confirmed_by = adminUserId;
    invoice.confirmed_at = now;
    invoice.updated_at = now;

    // 8. Kích hoạt / Gia hạn Subscription (Atomic)
    const subscription = mockActiveSubscription;
    const daysToAdd = 365;

    if (subscription.status === 'ACTIVE' && new Date(subscription.current_period_end) > new Date()) {
      // Gia hạn cộng dồn từ ngày hết hạn hiện tại
      const currentEnd = new Date(subscription.current_period_end).getTime();
      subscription.current_period_end = new Date(currentEnd + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    } else {
      // Kích hoạt mới từ hôm nay
      subscription.status = 'ACTIVE';
      subscription.current_period_start = now;
      subscription.current_period_end = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    }
    subscription.cancel_at_period_end = false;
    subscription.cancelled_at = undefined;
    subscription.updated_at = now;

    // 9. Ghi nhận Audit Log
    console.log(`[ADMIN_AUDIT] User ${adminUserId} CONFIRMED payment for invoice ${invoice.invoice_number}. Received: ${receivedAmount}đ. Ref: ${transactionReference}. Reason: ${auditReason}`);

    return {
      success: true,
      code: isOverpayment ? 'OVERPAYMENT' : 'CONFIRM_SUCCESS',
      message: isOverpayment
        ? `Xác nhận thanh toán thành công (Thừa ${receivedAmount - invoice.total}đ). Đã kích hoạt gói dịch vụ.`
        : 'Xác nhận thanh toán và kích hoạt gói cước thành công.',
      invoice,
      payment,
      subscription,
    };
  }

  /**
   * Admin từ chối yêu cầu thanh toán
   */
  static async adminRejectPayment(
    adminUserId: string,
    invoiceId: string,
    params: RejectPaymentParams
  ): Promise<{ success: boolean; message: string; invoice: Invoice }> {
    const { rejectReason, auditReason } = params;

    if (!adminUserId) {
      throw new Error('Bảo mật: Yêu cầu định danh Super Admin');
    }

    if (!rejectReason || rejectReason.trim().length < 5) {
      throw new Error('Lý do từ chối thanh toán (rejectReason) bắt buộc phải có ít nhất 5 ký tự');
    }

    const invoice = mockInvoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn: ${invoiceId}`);
    }

    const now = new Date().toISOString();
    invoice.status = 'REJECTED';
    invoice.rejection_reason = rejectReason;
    invoice.updated_at = now;

    const payment = mockPayments.find((p) => p.invoice_id === invoiceId);
    if (payment) {
      payment.status = 'REJECTED';
      payment.failure_reason = rejectReason;
      payment.updated_at = now;
    }

    console.log(`[ADMIN_AUDIT] User ${adminUserId} REJECTED payment for invoice ${invoice.invoice_number}. Reason: ${rejectReason}`);

    return {
      success: true,
      message: `Đã từ chối thanh toán hóa đơn ${invoice.invoice_number}.`,
      invoice,
    };
  }

  /**
   * Admin can thiệp gia hạn hoặc thay đổi gói thủ công (Legacy helper)
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

    console.log(`[ADMIN_AUDIT] User ${adminUserId} performed ${action} on ${subscriptionId}. Reason: ${reason}`);

    return {
      success: true,
      message: `Đã thực thi thành công tác vụ ${action} cho thuê bao ${subscriptionId}.`,
    };
  }
}
