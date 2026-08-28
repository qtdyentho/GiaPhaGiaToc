import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// SECURITY: Không bao giờ có fallback hardcode cho webhook secret.
// Nếu thiếu env var → fail fast, trả 503 rõ ràng.
const webhookSecret = process.env.BANK_WEBHOOK_SECRET;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // SECURITY: Fail fast nếu thiếu secret — không dùng fallback yếu
  if (!webhookSecret) {
    console.error('[FATAL] BANK_WEBHOOK_SECRET env var is not configured.');
    return res.status(503).json({ success: false, error: 'Webhook service not configured. Contact administrator.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const signature = req.headers['x-bank-signature'] as string;
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // 1. Mandatory HMAC Signature Verification
  if (!signature) {
    return res.status(401).json({ success: false, error: 'Missing required x-bank-signature header' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return res.status(401).json({ success: false, error: 'Invalid HMAC Signature' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { transactionId, invoiceNumber, amount, paymentMethod } = payload || {};

  if (!transactionId || !invoiceNumber || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required webhook payload fields' });
  }

  try {
    // 2. Idempotency Check: Đã xử lý giao dịch này chưa?
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('payment_code', transactionId)
      .maybeSingle();

    if (existingPayment && existingPayment.status === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        message: 'Idempotent replay: Transaction already processed',
        transactionId,
      });
    }

    // 3. Verify Invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('id, family_id, subscription_id, total, status')
      .eq('invoice_number', invoiceNumber)
      .single();

    if (invError || !invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // 4. Verify Amount
    if (Number(amount) < Number(invoice.total)) {
      // Ghi nhận partial payment
      await supabase.from('payments').insert({
        family_id: invoice.family_id,
        subscription_id: invoice.subscription_id,
        invoice_id: invoice.id,
        payment_code: transactionId,
        amount: Number(amount),
        currency: 'VND',
        payment_method: paymentMethod || 'VIETQR',
        provider: 'VIETQR',
        status: 'PARTIAL',
      });

      return res.status(400).json({
        success: false,
        error: 'Underpayment: Payment amount less than invoice total',
        received: amount,
        expected: invoice.total,
      });
    }

    // 5. Atomic Activation: Cập nhật Payment, Invoice, và Subscription
    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Insert / Upsert Payment
    await supabase.from('payments').upsert({
      family_id: invoice.family_id,
      subscription_id: invoice.subscription_id,
      invoice_id: invoice.id,
      payment_code: transactionId,
      amount: Number(amount),
      currency: 'VND',
      payment_method: paymentMethod || 'VIETQR',
      provider: 'VIETQR',
      status: 'SUCCESS',
      paid_at: now,
    });

    // Update Invoice -> PAID
    await supabase.from('invoices').update({ status: 'PAID', paid_at: now }).eq('id', invoice.id);

    // Update Subscription -> ACTIVE
    await supabase
      .from('subscriptions')
      .update({
        status: 'ACTIVE',
        current_period_start: now,
        current_period_end: periodEnd,
      })
      .eq('id', invoice.subscription_id);

    return res.status(200).json({
      success: true,
      message: 'Bank Webhook processed and Subscription Activated Successfully',
      data: {
        familyId: invoice.family_id,
        subscriptionId: invoice.subscription_id,
        invoiceId: invoice.id,
        status: 'ACTIVE',
      },
    });
  } catch (error: any) {
    console.error('Webhook execution error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
