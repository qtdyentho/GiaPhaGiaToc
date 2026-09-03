import { Fund, FinancialTransaction, Invoice, Payment } from '../types/database';
import { Logger } from '../lib/logger';

export type ReconciliationStatus = 'MATCHED' | 'WARNING' | 'MISMATCH' | 'CRITICAL';

export interface DailyFundReconciliationReport {
  date: string;
  fundId: string;
  fundName: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalReversal: number;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  status: ReconciliationStatus;
  incidentId?: string;
}

export interface PaymentReconciliationItem {
  invoiceNumber: string;
  bankAmount: number;
  paymentAmount: number;
  invoiceAmount: number;
  isMatched: boolean;
  status: 'SUCCESS' | 'MISMATCH' | 'PARTIAL';
}

export class FinancialReconciliationService {
  /**
   * Đối soát số dư Sổ Cái Quỹ Hàng Ngày (Daily Fund Balance Reconciliation)
   */
  static reconcileFund(
    fund: Fund,
    transactions: FinancialTransaction[],
    date: string = new Date().toISOString().slice(0, 10)
  ): DailyFundReconciliationReport {
    const opening = fund.opening_balance || 0;
    let income = 0;
    let expense = 0;
    let reversal = 0;

    const txMap = new Map<string, FinancialTransaction>(transactions.map((t) => [t.id, t]));

    for (const tx of transactions) {
      if (tx.status === 'POSTED') {
        if (tx.transaction_type === 'INCOME') {
          income += tx.amount;
        } else if (tx.transaction_type === 'EXPENSE') {
          expense += tx.amount;
        } else if (tx.transaction_type === 'REVERSAL') {
          const refTx = tx.reference_transaction_id ? txMap.get(tx.reference_transaction_id) : undefined;
          if (refTx) {
            if (refTx.transaction_type === 'EXPENSE') {
              reversal += tx.amount; // Hoàn chi: cộng lại vào quỹ
            } else {
              reversal -= tx.amount; // Hoàn thu: trừ khỏi quỹ
            }
          } else if (tx.expense_id || /hoàn chi|thu hồi chi|chi/i.test(tx.description || '')) {
            reversal += tx.amount;
          } else {
            reversal -= tx.amount;
          }
        }
      }
    }

    const expected = opening + income - expense + reversal;
    const actual = fund.current_balance;
    const difference = actual - expected;

    let status: ReconciliationStatus = 'MATCHED';
    let incidentId: string | undefined = undefined;

    if (difference !== 0) {
      status = Math.abs(difference) > 1000000 ? 'CRITICAL' : 'MISMATCH';
      incidentId = `INC-RECON-${Date.now()}`;
      console.warn(`[RECONCILIATION_INCIDENT] Sai lệch số dư Quỹ ${fund.name}: Lệch ${difference}đ. Mã sự cố: ${incidentId}`);
    }

    return {
      date,
      fundId: fund.id,
      fundName: fund.name,
      openingBalance: opening,
      totalIncome: income,
      totalExpense: expense,
      totalReversal: reversal,
      expectedBalance: expected,
      actualBalance: actual,
      difference,
      status,
      incidentId,
    };
  }

  /**
   * Đối soát thanh toán 3 bên: Ngân hàng - Giao dịch - Hóa đơn
   */
  static reconcilePayment(
    invoice: Invoice,
    payment: Payment,
    bankReceivedAmount: number
  ): PaymentReconciliationItem {
    const isMatched =
      bankReceivedAmount === payment.amount &&
      payment.amount === invoice.total &&
      payment.status === 'SUCCESS' &&
      invoice.status === 'PAID';

    return {
      invoiceNumber: invoice.invoice_number,
      bankAmount: bankReceivedAmount,
      paymentAmount: payment.amount,
      invoiceAmount: invoice.total,
      isMatched,
      status: isMatched ? 'SUCCESS' : bankReceivedAmount < invoice.total ? 'PARTIAL' : 'MISMATCH',
    };
  }
}
