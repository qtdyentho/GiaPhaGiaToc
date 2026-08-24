import {
  Fund,
  FinancialTransaction,
  IncomeAssessment,
  ExpenseRecord,
  IncomeCategory,
  ExpenseCategory,
  Contribution,
  Sponsorship,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  ExpenseStatus,
  AssessmentStatus,
  SponsorType,
} from '../types/database';
import {
  mockFunds,
  mockTransactions,
  mockAssessments,
  mockExpenses,
  mockMembers,
} from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface BulkAssessmentParams {
  familyId: string;
  fundId: string;
  categoryId?: string;
  title: string;
  amountDue: number;
  dueDate: string;
  targetScope: 'ALL' | 'BRANCH' | 'GENERATION' | 'CUSTOM';
  branchId?: string;
  generationId?: string;
  memberIds?: string[];
  customAmounts?: Record<string, number>; // MemberId -> Amount override
  notes?: string;
}

export interface RecordIncomeParams {
  familyId: string;
  fundId: string;
  assessmentId?: string;
  memberId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionDate?: string;
  description: string;
  receiptUrl?: string;
  userId?: string;
}

export interface CreateExpenseParams {
  familyId: string;
  fundId: string;
  categoryId?: string;
  title: string;
  amount: number;
  recipientName: string;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptUrl?: string;
  userId?: string;
}

export interface HonorRollItem {
  id: string;
  donorName: string;
  memberId?: string;
  totalAmount: number;
  tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';
  tierName: string;
  purposes: string[];
  latestYear: number;
  isAnonymous: boolean;
  donorType: SponsorType;
  contributionsCount?: number;
}

// In-memory mock stores for non-configured environment
export const mockIncomeCategories: IncomeCategory[] = [
  { id: 'inc-cat-1', family_id: 'fam-0000-0001', name: 'Đóng góp thường niên', code: 'THUONG_NIEN', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'inc-cat-2', family_id: 'fam-0000-0001', name: 'Quỹ khuyến học', code: 'KHUYEN_HOC', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'inc-cat-3', family_id: 'fam-0000-0001', name: 'Tài trợ xây dựng từ đường', code: 'TU_BO_TU_DUONG', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'inc-cat-4', family_id: 'fam-0000-0001', name: 'Công đức lễ giỗ tổ', code: 'GIO_TO', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

export const mockExpenseCategories: ExpenseCategory[] = [
  { id: 'exp-cat-1', family_id: 'fam-0000-0001', name: 'Lễ nghi & Giỗ tổ', code: 'LE_NGHI_GIO_TO', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'exp-cat-2', family_id: 'fam-0000-0001', name: 'Tu bổ & Xây dựng', code: 'TU_BO_XAY_DUNG', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'exp-cat-3', family_id: 'fam-0000-0001', name: 'Khen thưởng khuyến học', code: 'KHUYEN_HOC', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'exp-cat-4', family_id: 'fam-0000-0001', name: 'Hiếu hỷ & Thăm hỏi', code: 'HIEU_HY', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'exp-cat-5', family_id: 'fam-0000-0001', name: 'Chi phí vận hành & Khác', code: 'VAN_HANH', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

export const mockContributions: Contribution[] = [
  {
    id: 'ctb-001',
    family_id: 'fam-0000-0001',
    member_id: 'mb-003',
    donor_name: 'Nguyễn Văn Hoàng (Trưởng Họ)',
    fund_id: 'fund-1',
    amount: 10000000,
    purpose: 'Đóng góp tu bổ cổng tam quan từ đường',
    payment_method: 'BANK_TRANSFER',
    created_at: '2026-06-15T00:00:00Z',
  },
  {
    id: 'ctb-002',
    family_id: 'fam-0000-0001',
    donor_name: 'Doanh nghiệp Xây dựng Thành Đạt (Con cháu chi 2)',
    fund_id: 'fund-3',
    amount: 50000000,
    purpose: 'Tài trợ toàn bộ ngói âm dương lợp mái thượng điện',
    payment_method: 'BANK_TRANSFER',
    created_at: '2026-07-20T00:00:00Z',
  },
  {
    id: 'ctb-003',
    family_id: 'fam-0000-0001',
    member_id: 'mb-004',
    donor_name: 'Nguyễn Văn Tuấn',
    fund_id: 'fund-2',
    amount: 5000000,
    purpose: 'Tài trợ quỹ khuyến học khen thưởng học sinh giỏi',
    payment_method: 'VIETQR',
    created_at: '2026-08-10T00:00:00Z',
  },
];

export const mockSponsorships: Sponsorship[] = [
  {
    id: 'sps-001',
    family_id: 'fam-0000-0001',
    sponsor_name: 'Doanh nghiệp Xây dựng Thành Đạt',
    amount: 50000000,
    purpose: 'Tài trợ xây dựng nhà thờ tổ',
    fund_id: 'fund-3',
    sponsor_type: 'BUSINESS',
    created_at: '2026-07-20T00:00:00Z',
  },
  {
    id: 'sps-002',
    family_id: 'fam-0000-0001',
    member_id: 'mb-003',
    sponsor_name: 'Nguyễn Văn Hoàng',
    amount: 10000000,
    purpose: 'Công đức tu bổ từ đường',
    fund_id: 'fund-1',
    sponsor_type: 'MEMBER',
    created_at: '2026-06-15T00:00:00Z',
  },
];

export class FundService {
  // ==========================================
  // 1. QUẢN LÝ QUỸ (FUNDS)
  // ==========================================
  static async getFunds(familyId?: string): Promise<Fund[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('funds').select('*').order('created_at', { ascending: true });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Fund[];
    }
    if (familyId) {
      return mockFunds.filter((f) => f.family_id === familyId);
    }
    return mockFunds;
  }

  static async createFund(fund: Partial<Fund>): Promise<{ success: boolean; fund?: Fund; error?: string }> {
    const payload = {
      family_id: fund.family_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: fund.name || 'Quỹ Mới',
      description: fund.description,
      opening_balance: Number(fund.opening_balance || 0),
      current_balance: Number(fund.opening_balance || 0),
      status: fund.status || 'ACTIVE',
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('funds').insert([payload]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, fund: data as Fund };
    }

    const newFund: Fund = {
      id: `fund-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFunds.push(newFund);
    return { success: true, fund: newFund };
  }

  // ==========================================
  // 2. DANH MỤC THU & CHI (CATEGORIES)
  // ==========================================
  static async getIncomeCategories(familyId?: string): Promise<IncomeCategory[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('income_categories').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as IncomeCategory[];
    }
    return mockIncomeCategories;
  }

  static async getExpenseCategories(familyId?: string): Promise<ExpenseCategory[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('expense_categories').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as ExpenseCategory[];
    }
    return mockExpenseCategories;
  }

  // ==========================================
  // 3. ĐỊNH MỨC NGHĨA VỤ THU (ASSESSMENTS)
  // ==========================================
  static async getAssessments(familyId?: string): Promise<IncomeAssessment[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('income_assessments').select('*').order('created_at', { ascending: false });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as IncomeAssessment[];
    }
    if (familyId) {
      return mockAssessments.filter((a) => a.family_id === familyId);
    }
    return mockAssessments;
  }

  static async createBulkAssessment(params: BulkAssessmentParams): Promise<{
    success: boolean;
    count: number;
    assessments?: IncomeAssessment[];
    error?: string;
  }> {
    // 1. Identify target members
    let targetMembers = [...mockMembers];
    if (params.targetScope === 'BRANCH' && params.branchId) {
      targetMembers = targetMembers.filter((m) => m.branch_id === params.branchId);
    } else if (params.targetScope === 'GENERATION' && params.generationId) {
      targetMembers = targetMembers.filter((m) => m.generation_id === params.generationId);
    } else if (params.targetScope === 'CUSTOM' && params.memberIds) {
      targetMembers = targetMembers.filter((m) => params.memberIds!.includes(m.id));
    }
    // Only assess living members by default
    targetMembers = targetMembers.filter((m) => m.life_status === 'ALIVE');

    if (targetMembers.length === 0) {
      return { success: false, count: 0, error: 'Không tìm thấy thành viên phù hợp với tiêu chí lọc.' };
    }

    const assessmentsToInsert = targetMembers.map((m) => {
      const amount = params.customAmounts && params.customAmounts[m.id] !== undefined
        ? params.customAmounts[m.id]
        : params.amountDue;

      return {
        family_id: params.familyId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        fund_id: params.fundId,
        category_id: params.categoryId,
        member_id: m.id,
        title: params.title,
        amount_due: amount,
        amount_paid: 0,
        due_date: params.dueDate,
        status: 'PENDING' as AssessmentStatus,
        notes: params.notes,
      };
    });

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('income_assessments').insert(assessmentsToInsert).select();
      if (error) return { success: false, count: 0, error: error.message };
      return { success: true, count: data.length, assessments: data as IncomeAssessment[] };
    }

    // Fallback Mock
    const created: IncomeAssessment[] = assessmentsToInsert.map((item, idx) => ({
      id: `asm-${Date.now()}-${idx}`,
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    mockAssessments.push(...created);
    return { success: true, count: created.length, assessments: created };
  }

  // ==========================================
  // 4. THỰC THU & ATOMIC PAYMENT RPC
  // ==========================================
  static async recordIncomePayment(params: RecordIncomeParams): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    if (params.amount <= 0) {
      return { success: false, error: 'Số tiền thanh toán phải lớn hơn 0.' };
    }

    // Try Supabase RPC first
    if (isSupabaseConfigured() && params.assessmentId) {
      try {
        const { data, error } = await supabase.rpc('record_income_payment', {
          p_family_id: params.familyId,
          p_fund_id: params.fundId,
          p_assessment_id: params.assessmentId,
          p_amount: params.amount,
          p_payment_method: params.paymentMethod,
          p_transaction_date: params.transactionDate || new Date().toISOString().slice(0, 10),
          p_description: params.description,
          p_receipt_url: params.receiptUrl || null,
          p_user_id: params.userId || null,
        });

        if (!error && data) {
          return { success: true, transactionId: data };
        }
      } catch (rpcErr) {
        console.warn('RPC record_income_payment unavailable, using atomic client fallback:', rpcErr);
      }
    }

    // Atomic In-Memory / Client-side Transaction Fallback
    const txCode = `THU-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `tx-${Date.now()}`;

    // 1. Update Assessment
    if (params.assessmentId) {
      const assessment = mockAssessments.find((a) => a.id === params.assessmentId);
      if (assessment) {
        assessment.amount_paid += params.amount;
        assessment.status = assessment.amount_paid >= assessment.amount_due ? 'PAID' : 'PARTIAL';
        assessment.updated_at = new Date().toISOString();
      }
    }

    // 2. Update Fund Balance
    const fund = mockFunds.find((f) => f.id === params.fundId);
    if (fund) {
      fund.current_balance += params.amount;
      fund.updated_at = new Date().toISOString();
    }

    // 3. Insert Posted Financial Transaction
    const newTx: FinancialTransaction = {
      id: txId,
      family_id: params.familyId,
      fund_id: params.fundId,
      transaction_code: txCode,
      transaction_type: 'INCOME',
      assessment_id: params.assessmentId,
      member_id: params.memberId,
      amount: params.amount,
      payment_method: params.paymentMethod,
      transaction_date: params.transactionDate || new Date().toISOString().slice(0, 10),
      description: params.description,
      receipt_url: params.receiptUrl,
      status: 'POSTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.unshift(newTx);

    return { success: true, transactionId: txId };
  }

  // ==========================================
  // 5. CHI PHÍ & QUY TRÌNH DUYỆT CHI (EXPENSES)
  // ==========================================
  static async getExpenses(familyId?: string): Promise<ExpenseRecord[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('expense_records').select('*').order('created_at', { ascending: false });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as ExpenseRecord[];
    }
    if (familyId) {
      return mockExpenses.filter((e) => e.family_id === familyId);
    }
    return mockExpenses;
  }

  static async createExpense(params: CreateExpenseParams): Promise<{
    success: boolean;
    expense?: ExpenseRecord;
    error?: string;
  }> {
    // Check fund balance
    const fund = mockFunds.find((f) => f.id === params.fundId);
    if (fund && fund.current_balance < params.amount) {
      return {
        success: false,
        error: `Số dư quỹ không đủ (Số dư hiện tại: ${fund.current_balance.toLocaleString()} ₫, Số tiền chi: ${params.amount.toLocaleString()} ₫)`,
      };
    }

    const payload = {
      family_id: params.familyId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      fund_id: params.fundId,
      category_id: params.categoryId,
      title: params.title,
      amount: params.amount,
      recipient_name: params.recipientName,
      expense_date: params.expenseDate,
      payment_method: params.paymentMethod,
      description: params.description,
      receipt_url: params.receiptUrl,
      status: 'PENDING_APPROVAL' as ExpenseStatus,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('expense_records').insert([payload]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, expense: data as ExpenseRecord };
    }

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockExpenses.unshift(newExp);
    return { success: true, expense: newExp };
  }

  static async approveExpense(expenseId: string, familyId: string, approverId: string): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('approve_expense_record', {
          p_family_id: familyId,
          p_expense_id: expenseId,
          p_approver_id: approverId,
        });
        if (!error && data) return { success: true, transactionId: data };
      } catch (rpcErr) {
        console.warn('RPC approve_expense_record fallback:', rpcErr);
      }
    }

    // Fallback Mock Execution
    const expense = mockExpenses.find((e) => e.id === expenseId);
    if (!expense) return { success: false, error: 'Không tìm thấy phiếu chi' };

    const fund = mockFunds.find((f) => f.id === expense.fund_id);
    if (fund && fund.current_balance < expense.amount) {
      return { success: false, error: 'Số dư quỹ không đủ để giải ngân' };
    }

    // Deduct Fund
    if (fund) {
      fund.current_balance -= expense.amount;
      fund.updated_at = new Date().toISOString();
    }

    expense.status = 'APPROVED';
    expense.approved_by = approverId;
    expense.approved_at = new Date().toISOString();
    expense.updated_at = new Date().toISOString();

    const txId = `tx-${Date.now()}`;
    const newTx: FinancialTransaction = {
      id: txId,
      family_id: familyId,
      fund_id: expense.fund_id,
      transaction_code: `TX-EXP-${Date.now().toString().slice(-6)}`,
      transaction_type: 'EXPENSE',
      expense_id: expense.id,
      amount: expense.amount,
      payment_method: expense.payment_method,
      transaction_date: expense.expense_date,
      description: `Chi: ${expense.title} (${expense.recipient_name})`,
      receipt_url: expense.receipt_url,
      status: 'POSTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.unshift(newTx);

    return { success: true, transactionId: txId };
  }

  // ==========================================
  // 6. IMMUTABLE LEDGER & REVERSALS (BR-REV-001)
  // ==========================================
  static async getLedger(familyId?: string, filters?: { fundId?: string; type?: TransactionType }): Promise<FinancialTransaction[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('financial_transactions').select('*').order('created_at', { ascending: false });
      if (familyId) query = query.eq('family_id', familyId);
      if (filters?.fundId) query = query.eq('fund_id', filters.fundId);
      if (filters?.type) query = query.eq('transaction_type', filters.type);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as FinancialTransaction[];
    }

    let result = [...mockTransactions];
    if (familyId) result = result.filter((t) => t.family_id === familyId);
    if (filters?.fundId) result = result.filter((t) => t.fund_id === filters.fundId);
    if (filters?.type) result = result.filter((t) => t.transaction_type === filters.type);
    return result;
  }

  static async reverseTransaction(
    transactionId: string,
    familyId: string,
    reason: string,
    userId?: string
  ): Promise<{ success: boolean; reversalTransactionId?: string; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('reverse_financial_transaction', {
          p_family_id: familyId,
          p_transaction_id: transactionId,
          p_reason: reason,
          p_user_id: userId || null,
        });
        if (!error && data) return { success: true, reversalTransactionId: data };
      } catch (rpcErr) {
        console.warn('RPC reverse_financial_transaction fallback:', rpcErr);
      }
    }

    // Symmetrical Fallback Reversal Logic
    const originalTx = mockTransactions.find((t) => t.id === transactionId);
    if (!originalTx) return { success: false, error: 'Giao dịch không tồn tại' };
    if (originalTx.status !== 'POSTED') return { success: false, error: 'Chỉ có thể đảo ngược giao dịch đã POSTED' };

    // 1. Mark original as REVERSED
    originalTx.status = 'REVERSED';
    originalTx.updated_at = new Date().toISOString();

    // 2. Adjust Fund Balance
    const fund = mockFunds.find((f) => f.id === originalTx.fund_id);
    if (fund) {
      if (originalTx.transaction_type === 'INCOME') {
        fund.current_balance -= originalTx.amount;
      } else if (originalTx.transaction_type === 'EXPENSE') {
        fund.current_balance += originalTx.amount;
      }
      fund.updated_at = new Date().toISOString();
    }

    // 3. If Assessment linked, restore remaining obligation
    if (originalTx.assessment_id) {
      const assessment = mockAssessments.find((a) => a.id === originalTx.assessment_id);
      if (assessment) {
        assessment.amount_paid = Math.max(0, assessment.amount_paid - originalTx.amount);
        assessment.status = assessment.amount_paid <= 0 ? 'PENDING' : 'PARTIAL';
        assessment.updated_at = new Date().toISOString();
      }
    }

    // 4. Create Reversal Transaction
    const revId = `tx-rev-${Date.now()}`;
    const revTx: FinancialTransaction = {
      id: revId,
      family_id: familyId,
      fund_id: originalTx.fund_id,
      transaction_code: `REV-${originalTx.transaction_code}`,
      transaction_type: 'REVERSAL',
      amount: originalTx.amount,
      payment_method: originalTx.payment_method,
      transaction_date: new Date().toISOString().slice(0, 10),
      description: `Đảo ngược giao dịch ${originalTx.transaction_code}: ${reason}`,
      status: 'POSTED',
      reference_transaction_id: originalTx.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.unshift(revTx);

    return { success: true, reversalTransactionId: revId };
  }

  // ==========================================
  // 7. ĐÓNG GÓP & TÀI TRỢ (CONTRIBUTIONS & SPONSORSHIPS)
  // ==========================================
  static async getContributions(familyId?: string): Promise<Contribution[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('contributions').select('*').order('created_at', { ascending: false });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Contribution[];
    }
    if (familyId) {
      return mockContributions.filter((c) => c.family_id === familyId);
    }
    return mockContributions;
  }

  static async createContribution(contribution: Partial<Contribution>): Promise<{
    success: boolean;
    contribution?: Contribution;
    error?: string;
  }> {
    const payload = {
      family_id: contribution.family_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      member_id: contribution.member_id,
      donor_name: contribution.donor_name || 'Nhà hảo tâm',
      fund_id: contribution.fund_id || mockFunds[0].id,
      amount: Number(contribution.amount || 0),
      purpose: contribution.purpose || 'Đóng góp công đức dòng họ',
      payment_method: contribution.payment_method || 'BANK_TRANSFER',
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('contributions').insert([payload]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, contribution: data as Contribution };
    }

    const newCtb: Contribution = {
      id: `ctb-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    mockContributions.unshift(newCtb);
    return { success: true, contribution: newCtb };
  }

  // ==========================================
  // 8. BẢNG VÀNG CÔNG ĐỨC (HONOR ROLL)
  // ==========================================
  static async getHonorRoll(familyId?: string): Promise<HonorRollItem[]> {
    const contributions = await this.getContributions(familyId);

    // Group by donor
    const donorMap = new Map<string, { total: number; purposes: Set<string>; memberId?: string; isAnonymous: boolean }>();

    contributions.forEach((c) => {
      const key = c.donor_name || 'Nhà hảo tâm ẩn danh';
      const existing = donorMap.get(key) || {
        total: 0,
        purposes: new Set<string>(),
        memberId: c.member_id,
        isAnonymous: key.includes('ẩn danh'),
      };
      existing.total += Number(c.amount || 0);
      if (c.purpose) existing.purposes.add(c.purpose);
      donorMap.set(key, existing);
    });

    const honorRollList: HonorRollItem[] = Array.from(donorMap.entries()).map(([name, data], idx) => {
      let tier: 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE' = 'BRONZE';
      let tierName = 'Đồng';

      if (data.total >= 50000000) {
        tier = 'DIAMOND';
        tierName = 'Kim Cương 💎';
      } else if (data.total >= 20000000) {
        tier = 'GOLD';
        tierName = 'Vàng 🥇';
      } else if (data.total >= 5000000) {
        tier = 'SILVER';
        tierName = 'Bạc 🥈';
      } else {
        tier = 'BRONZE';
        tierName = 'Đồng 🥉';
      }

      return {
        id: `hnr-${idx + 1}`,
        donorName: name,
        memberId: data.memberId,
        totalAmount: data.total,
        tier,
        tierName,
        purposes: Array.from(data.purposes),
        latestYear: 2026,
        isAnonymous: data.isAnonymous,
        donorType: data.memberId ? 'MEMBER' : 'OTHER',
      };
    });

    // Sort descending by total amount
    return honorRollList.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // ==========================================
  // 9. BÁO CÁO TỔNG QUAN (SUMMARY)
  // ==========================================
  static async getSummary(familyId?: string) {
    const funds = await this.getFunds(familyId);
    const transactions = await this.getLedger(familyId);
    const assessments = await this.getAssessments(familyId);
    const expenses = await this.getExpenses(familyId);

    const totalBalance = funds.reduce((acc, f) => acc + (Number(f.current_balance) || 0), 0);
    const totalIncome = transactions
      .filter((t) => t.transaction_type === 'INCOME' && t.status === 'POSTED')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.transaction_type === 'EXPENSE' && t.status === 'POSTED')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalReceivable = assessments
      .filter((a) => a.status === 'PENDING' || a.status === 'PARTIAL')
      .reduce((acc, a) => acc + (Number(a.amount_due) - Number(a.amount_paid)), 0);

    const pendingExpensesCount = expenses.filter((e) => e.status === 'PENDING_APPROVAL').length;

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      totalReceivable,
      pendingExpensesCount,
      funds,
      recentTransactions: transactions.slice(0, 10),
    };
  }
}
