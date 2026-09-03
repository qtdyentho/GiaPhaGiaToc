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
  let rawBody: string;
  if (Buffer.isBuffer(req.body)) {
    rawBody = req.body.toString('utf8');
  } else if (typeof req.body === 'string') {
    rawBody = req.body;
  } else {
    rawBody = JSON.stringify(req.body);
  }

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

  let payload: any = {};
  try {
    payload = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString('utf8'))
      : typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;
  } catch (parseErr) {
    return res.status(400).json({ success: false, error: 'Malformed JSON payload in webhook body' });
  }

  const { transactionId, invoiceNumber, amount, paymentMethod } = payload || {};

  if (!transactionId || !invoiceNumber || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required webhook payload fields' });
  }

  try {
    // 2. Fetch invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('id, family_id, subscription_id, total, status')
      .eq('invoice_number', invoiceNumber)
      .single();

    if (invError || !invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // 3. Atomic Activation via PostgreSQL RPC (handles idempotency, row locking, and status updates)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('activate_subscription_via_webhook', {
      p_family_id: invoice.family_id,
      p_subscription_id: invoice.subscription_id,
      p_invoice_id: invoice.id,
      p_payment_code: transactionId,
      p_amount: Number(amount),
      p_payment_method: paymentMethod || 'VIETQR',
      p_provider: 'VIETQR',
    });

    if (rpcError) {
      console.error('RPC activate_subscription_via_webhook error:', rpcError);
      return res.status(500).json({ success: false, error: rpcError.message });
    }

    if (!rpcResult?.success) {
      return res.status(400).json({
        success: false,
        error: rpcResult?.error || rpcResult?.message || 'Payment activation failed',
        received: amount,
        expected: invoice.total,
      });
    }

    return res.status(200).json({
      success: true,
      message: rpcResult.message || 'Bank Webhook processed and Subscription Activated Successfully',
      data: {
        familyId: invoice.family_id,
        subscriptionId: invoice.subscription_id,
        invoiceId: invoice.id,
        status: rpcResult.status || 'ACTIVE',
      },
    });
  } catch (error: any) {
    console.error('Webhook execution error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
