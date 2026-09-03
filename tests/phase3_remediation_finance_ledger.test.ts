import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { FundService } from '../src/services/FundService';
import { FinancialReconciliationService } from '../src/services/FinancialReconciliationService';
import { mockFunds, mockTransactions } from '../src/services/mockData';
import { Fund, FinancialTransaction } from '../src/types/database';

describe('PHASE 3: FINANCE LEDGER & RECONCILIATION VERIFICATION SUITE', () => {
  const testFamilyId = 'fam-phase3-test-001';

  it('FIN-FIX-001: createContribution automatically updates fund balance and creates posted INCOME transaction', async () => {
    // 1. Setup a test fund
    const testFund: Fund = {
      id: `fund-ctb-test-${Date.now()}`,
      family_id: testFamilyId,
      name: 'Quỹ Công Đức Tu Tạo',
      opening_balance: 5000000,
      current_balance: 5000000,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFunds.push(testFund);

    const initialBalance = testFund.current_balance;
    const donationAmount = 3000000;

    // 2. Perform contribution
    const res = await FundService.createContribution({
      family_id: testFamilyId,
      donor_name: 'Bác Nguyễn Văn An',
      fund_id: testFund.id,
      amount: donationAmount,
      purpose: 'Công đức xây cổng tam quan',
      payment_method: 'BANK_TRANSFER',
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.contribution);
    assert.strictEqual(res.contribution?.amount, donationAmount);
    assert.ok(res.transactionId, 'Must return a transactionId for the generated ledger transaction');

    // 3. Verify fund balance increased
    assert.strictEqual(testFund.current_balance, initialBalance + donationAmount);

    // 4. Verify ledger transaction exists in mockTransactions
    const createdTx = mockTransactions.find((t) => t.id === res.transactionId);
    assert.ok(createdTx, 'Ledger transaction must exist');
    assert.strictEqual(createdTx?.transaction_type, 'INCOME');
    assert.strictEqual(createdTx?.amount, donationAmount);
    assert.strictEqual(createdTx?.status, 'POSTED');
    assert.ok(createdTx?.description?.includes('Bác Nguyễn Văn An'));
  });

  it('FIN-FIX-002: FinancialReconciliationService correctly eliminates double-deduction bug on reversed transactions', async () => {
    const reconFund: Fund = {
      id: `fund-recon-test-${Date.now()}`,
      family_id: testFamilyId,
      name: 'Quỹ Thử Nghiệm Đối Soát',
      opening_balance: 10000000,
      current_balance: 10000000,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFunds.push(reconFund);

    // Initial state: perfectly matched
    let report = FinancialReconciliationService.reconcileFund(reconFund, []);
    assert.strictEqual(report.status, 'MATCHED');
    assert.strictEqual(report.difference, 0);

    // Step 1: Add an income transaction of 2,000,000
    const txIncome: FinancialTransaction = {
      id: `tx-inc-${Date.now()}`,
      family_id: testFamilyId,
      fund_id: reconFund.id,
      transaction_code: 'THU-TEST-01',
      transaction_type: 'INCOME',
      amount: 2000000,
      payment_method: 'CASH',
      transaction_date: '2026-09-03',
      description: 'Thu đóng góp ban đầu',
      status: 'POSTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.push(txIncome);
    reconFund.current_balance += 2000000; // now 12,000,000

    report = FinancialReconciliationService.reconcileFund(reconFund, [txIncome]);
    assert.strictEqual(report.status, 'MATCHED');
    assert.strictEqual(report.difference, 0);
    assert.strictEqual(report.actualBalance, 12000000);
    assert.strictEqual(report.expectedBalance, 12000000);

    // Step 2: Reverse the income transaction (FundService.reverseTransaction simulates this)
    txIncome.status = 'REVERSED';
    reconFund.current_balance -= 2000000; // returns to 10,000,000

    const txReversal: FinancialTransaction = {
      id: `tx-rev-${Date.now()}`,
      family_id: testFamilyId,
      fund_id: reconFund.id,
      transaction_code: 'REV-THU-TEST-01',
      transaction_type: 'REVERSAL',
      reference_transaction_id: txIncome.id,
      amount: 2000000,
      payment_method: 'CASH',
      transaction_date: '2026-09-03',
      description: 'Đảo ngược giao dịch thu',
      status: 'POSTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.push(txReversal);

    // Reconcile with both transactions
    report = FinancialReconciliationService.reconcileFund(reconFund, [txIncome, txReversal]);
    
    // With our fix, txIncome is REVERSED (ignored in income), and txReversal checks refTx.status === 'REVERSED',
    // so it DOES NOT double-subtract!
    assert.strictEqual(report.status, 'MATCHED', 'Reconciliation must be MATCHED after reversal');
    assert.strictEqual(report.actualBalance, 10000000);
    assert.strictEqual(report.expectedBalance, 10000000);
    assert.strictEqual(report.difference, 0, 'Zero difference after reversal (NO DOUBLE DEDUCTION BUG)');
  });

  it('FIN-FIX-003: reconcileFamilyFunds correctly aggregates and reconciles all funds for a family', async () => {
    const multiFunds = await FinancialReconciliationService.reconcileFamilyFunds(testFamilyId);
    assert.ok(Array.isArray(multiFunds));
    const matchingTestFund = multiFunds.find((r) => r.fundName === 'Quỹ Thử Nghiệm Đối Soát');
    assert.ok(matchingTestFund);
    assert.strictEqual(matchingTestFund?.status, 'MATCHED');
  });

  it('FIN-FIX-004: Direct income recording without assessmentId succeeds gracefully', async () => {
    const directFund: Fund = {
      id: `fund-direct-${Date.now()}`,
      family_id: testFamilyId,
      name: 'Quỹ Thu Trực Tiếp',
      opening_balance: 1000000,
      current_balance: 1000000,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFunds.push(directFund);

    const res = await FundService.recordIncomePayment({
      familyId: testFamilyId,
      fundId: directFund.id,
      amount: 500000,
      paymentMethod: 'CASH',
      description: 'Thu tiền ủng hộ trực tiếp ngoài kế hoạch',
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.transactionId);
    assert.strictEqual(directFund.current_balance, 1500000);

    const tx = mockTransactions.find((t) => t.id === res.transactionId);
    assert.ok(tx);
    assert.strictEqual(tx?.assessment_id, undefined);
    assert.strictEqual(tx?.amount, 500000);
    assert.strictEqual(tx?.status, 'POSTED');
  });
});
