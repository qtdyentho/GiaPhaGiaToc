import { Fund, FinancialTransaction, IncomeAssessment, ExpenseRecord } from '../types/database';
import { mockFunds, mockTransactions, mockAssessments, mockExpenses } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class FundService {
  static async getFunds(familyId?: string): Promise<Fund[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('funds').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Fund[];
    }
    return mockFunds;
  }

  static async getLedger(familyId?: string): Promise<FinancialTransaction[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('financial_transactions').select('*').order('created_at', { ascending: false });
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as FinancialTransaction[];
    }
    return mockTransactions;
  }

  static async getAssessments(familyId?: string): Promise<IncomeAssessment[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('income_assessments').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as IncomeAssessment[];
    }
    return mockAssessments;
  }

  static async getExpenses(familyId?: string): Promise<ExpenseRecord[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('expense_records').select('*');
      if (familyId) query = query.eq('family_id', familyId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as ExpenseRecord[];
    }
    return mockExpenses;
  }

  static async getSummary(familyId?: string) {
    const funds = await this.getFunds(familyId);
    const transactions = await this.getLedger(familyId);

    const totalBalance = funds.reduce((acc, f) => acc + (f.current_balance || 0), 0);
    const totalIncome = transactions
      .filter((t) => t.transaction_type === 'INCOME' && t.status === 'POSTED')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.transaction_type === 'EXPENSE' && t.status === 'POSTED')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      funds,
    };
  }
}
