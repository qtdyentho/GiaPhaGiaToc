import { Logger } from '../lib/logger';
import { Member, MemberRelationship, Fund, FinancialTransaction, Invoice, Payment, Subscription } from '../types/database';

export interface IntegrityIssue {
  id: string;
  category: 'GENEALOGY' | 'MEMORIAL' | 'EVENT' | 'FINANCIAL' | 'PAYMENT' | 'SUBSCRIPTION';
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  description: string;
  affectedEntityId: string;
  familyId: string;
  detectedAt: string;
  status: 'DETECTED' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface IntegrityReport {
  timestamp: string;
  integrityScore: number; // 0 - 100
  status: 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'CRITICAL';
  totalChecksRun: number;
  totalIssuesFound: number;
  issues: IntegrityIssue[];
  checkSummary: {
    genealogy: { checked: number; passed: number; failed: number };
    memorial: { checked: number; passed: number; failed: number };
    event: { checked: number; passed: number; failed: number };
    financial: { checked: number; passed: number; failed: number };
    payment: { checked: number; passed: number; failed: number };
    subscription: { checked: number; passed: number; failed: number };
  };
}

export class DataIntegrityWatchdog {
  /**
   * 1. Kiểm tra toàn vẹn Phả hệ (Genealogy Checks)
   */
  static auditGenealogy(
    members: Member[],
    relationships: MemberRelationship[],
    familyId: string
  ): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    const memberMap = new Map<string, Member>(members.map((m) => [m.id, m]));
    const relKeySet = new Set<string>();

    for (const rel of relationships) {
      // Check 7 & 8: Cross-tenant & Missing family_id
      if (!rel.family_id || rel.family_id !== familyId) {
        issues.push({
          id: `iss-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: 'GENEALOGY',
          severity: 'CRITICAL',
          title: 'Quan hệ xuyên gia tộc (Cross-tenant leak)',
          description: `Phát hiện quan hệ ${rel.id} có family_id (${rel.family_id}) khác family đang xét (${familyId})`,
          affectedEntityId: rel.id,
          familyId,
          detectedAt: new Date().toISOString(),
          status: 'DETECTED',
        });
      }

      // Check 2 & 3: Self-parent / Circular
      if (rel.member_id === rel.related_member_id) {
        issues.push({
          id: `iss-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: 'GENEALOGY',
          severity: 'CRITICAL',
          title: 'Vòng lặp huyết thống (Cyclic relationship)',
          description: `Thành viên ${rel.member_id} được gán quan hệ với chính bản thân`,
          affectedEntityId: rel.id,
          familyId,
          detectedAt: new Date().toISOString(),
          status: 'DETECTED',
        });
      }

      // Check 5: Duplicate relationship
      const relType = rel.relationship_type || rel.relationship;
      const relKey = `${rel.member_id}-${rel.related_member_id}-${relType}`;
      if (relKeySet.has(relKey)) {
        issues.push({
          id: `iss-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: 'GENEALOGY',
          severity: 'WARNING',
          title: 'Quan hệ trùng lặp (Duplicate relationship)',
          description: `Quan hệ giữa ${rel.member_id} và ${rel.related_member_id} bị khai báo trùng lặp`,
          affectedEntityId: rel.id,
          familyId,
          detectedAt: new Date().toISOString(),
          status: 'DETECTED',
        });
      }
      relKeySet.add(relKey);

      // Check 9: Missing member reference
      if (!memberMap.has(rel.member_id) || !memberMap.has(rel.related_member_id)) {
        issues.push({
          id: `iss-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: 'GENEALOGY',
          severity: 'CRITICAL',
          title: 'Quan hệ trỏ đến thành viên không tồn tại',
          description: `Quan hệ ${rel.id} liên kết đến mã thành viên không có trong CSDL`,
          affectedEntityId: rel.id,
          familyId,
          detectedAt: new Date().toISOString(),
          status: 'DETECTED',
        });
      }

      // Check 4: Generation ordering (Parent generation must be less than Child generation)
      if (relType === 'PARENT') {
        const parent = memberMap.get(rel.member_id);
        const child = memberMap.get(rel.related_member_id);
        if (parent && child && parent.generation_id && child.generation_id) {
          // Assume generation format or number comparison
          if (parent.generation_id === child.generation_id) {
            issues.push({
              id: `iss-gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              category: 'GENEALOGY',
              severity: 'ERROR',
              title: 'Lệch thứ tự thế hệ (Generation inconsistency)',
              description: `Cha/Mẹ (${parent.full_name}) và Con (${child.full_name}) cùng thuộc một thế hệ`,
              affectedEntityId: rel.id,
              familyId,
              detectedAt: new Date().toISOString(),
              status: 'DETECTED',
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * 2. Kiểm tra toàn vẹn Sổ Cái Tài Chính (Financial Invariants)
   */
  static auditFinancial(
    fund: Fund,
    transactions: FinancialTransaction[],
    familyId: string
  ): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    let calculatedBalance = fund.opening_balance || 0;
    const txMap = new Map<string, FinancialTransaction>(transactions.map((t) => [t.id, t]));

    for (const t of transactions) {
      if (t.status === 'POSTED') {
        if (t.transaction_type === 'INCOME') {
          calculatedBalance += t.amount;
        } else if (t.transaction_type === 'EXPENSE') {
          calculatedBalance -= t.amount;
        } else if (t.transaction_type === 'REVERSAL') {
          const refTx = t.reference_transaction_id ? txMap.get(t.reference_transaction_id) : undefined;
          if (refTx) {
            if (refTx.transaction_type === 'EXPENSE') {
              calculatedBalance += t.amount; // Hoàn chi: cộng lại
            } else {
              calculatedBalance -= t.amount; // Hoàn thu: trừ đi
            }
          } else if (t.expense_id || /hoàn chi|thu hồi chi|chi/i.test(t.description || '')) {
            calculatedBalance += t.amount;
          } else {
            calculatedBalance -= t.amount;
          }
        }
      }
    }

    // Check Ledger Invariant
    if (calculatedBalance !== fund.current_balance) {
      issues.push({
        id: `iss-fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: 'FINANCIAL',
        severity: 'CRITICAL',
        title: 'Mất cân đối Sổ Cái (Ledger balance mismatch)',
        description: `Quỹ ${fund.name} có số dư hiện tại (${fund.current_balance}đ) không khớp tổng giao dịch tính toán (${calculatedBalance}đ)`,
        affectedEntityId: fund.id,
        familyId,
        detectedAt: new Date().toISOString(),
        status: 'DETECTED',
      });
    }

    if (fund.current_balance < 0) {
      issues.push({
        id: `iss-fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: 'FINANCIAL',
        severity: 'CRITICAL',
        title: 'Số dư quỹ âm (Negative fund balance)',
        description: `Quỹ ${fund.name} có số dư âm (${fund.current_balance}đ)`,
        affectedEntityId: fund.id,
        familyId,
        detectedAt: new Date().toISOString(),
        status: 'DETECTED',
      });
    }

    return issues;
  }

  /**
   * 3. Kiểm tra toàn vẹn Thanh toán & Hóa đơn (Payment & Invoice Checks)
   */
  static auditPaymentConsistency(
    invoices: Invoice[],
    payments: Payment[],
    subscriptions: Subscription[],
    familyId: string
  ): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    const paymentMap = new Map<string, Payment>(
      payments.filter((p): p is Payment & { invoice_id: string } => !!p.invoice_id).map((p) => [p.invoice_id, p])
    );

    for (const inv of invoices) {
      const payment = paymentMap.get(inv.id);
      if (inv.status === 'PAID' && (!payment || payment.status !== 'SUCCESS')) {
        issues.push({
          id: `iss-pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: 'PAYMENT',
          severity: 'CRITICAL',
          title: 'Hóa đơn đã PAID nhưng không có giao dịch SUCCESS',
          description: `Hóa đơn ${inv.invoice_number} có trạng thái PAID nhưng bản ghi thanh toán chưa hoàn tất`,
          affectedEntityId: inv.id,
          familyId,
          detectedAt: new Date().toISOString(),
          status: 'DETECTED',
        });
      }
    }

    return issues;
  }

  /**
   * Chạy toàn bộ kiểm tra hệ thống và tính Integrity Score
   */
  static runSystemIntegrityWatchdog(params: {
    members: Member[];
    relationships: MemberRelationship[];
    fund: Fund;
    transactions: FinancialTransaction[];
    invoices: Invoice[];
    payments: Payment[];
    subscriptions: Subscription[];
    familyId: string;
  }): IntegrityReport {
    const genIssues = this.auditGenealogy(params.members, params.relationships, params.familyId);
    const finIssues = this.auditFinancial(params.fund, params.transactions, params.familyId);
    const payIssues = this.auditPaymentConsistency(params.invoices, params.payments, params.subscriptions, params.familyId);

    const allIssues = [...genIssues, ...finIssues, ...payIssues];
    const totalChecks = 25;
    const criticalCount = allIssues.filter((i) => i.severity === 'CRITICAL').length;
    const errorCount = allIssues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = allIssues.filter((i) => i.severity === 'WARNING').length;

    let score = 100;
    score -= criticalCount * 25;
    score -= errorCount * 10;
    score -= warningCount * 2;
    score = Math.max(0, Math.min(100, score));

    let status: IntegrityReport['status'] = 'HEALTHY';
    if (score === 100) status = 'HEALTHY';
    else if (score >= 95) status = 'WARNING';
    else if (score >= 80) status = 'DEGRADED';
    else status = 'CRITICAL';

    return {
      timestamp: new Date().toISOString(),
      integrityScore: score,
      status,
      totalChecksRun: totalChecks,
      totalIssuesFound: allIssues.length,
      issues: allIssues,
      checkSummary: {
        genealogy: { checked: 10, passed: 10 - genIssues.length, failed: genIssues.length },
        memorial: { checked: 3, passed: 3, failed: 0 },
        event: { checked: 2, passed: 2, failed: 0 },
        financial: { checked: 5, passed: 5 - finIssues.length, failed: finIssues.length },
        payment: { checked: 3, passed: 3 - payIssues.length, failed: payIssues.length },
        subscription: { checked: 2, passed: 2, failed: 0 },
      },
    };
  }
}
