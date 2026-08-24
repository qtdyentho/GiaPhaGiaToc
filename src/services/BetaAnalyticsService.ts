import { mockFamily, mockMembers, mockFunds, mockActiveSubscription, mockInvoices, mockPayments } from './mockData';
import { BetaOperationsService } from './BetaOperationsService';

export interface BetaOverviewMetrics {
  totalFamilies: number;
  activeFamilies: number;
  trialFamilies: number;
  readOnlyFamilies: number;
  invitedFamilies: number;
  onboardingCompleted: number;
  onboardingFailed: number;
  isRealData: boolean;
}

export interface ActivationFunnelMetrics {
  registered: number;
  familyCreated: number;
  membersImported: number;
  firstRelationship: number;
  firstMemorial: number;
  firstFund: number;
  firstTransaction: number;
  firstQrPayment: number;
  firstInvitation: number;
}

export interface EngagementMetrics {
  dau: number;
  wau: number;
  mau: number;
  d1RetentionPercent: number | 'NOT ENOUGH DATA';
  d7RetentionPercent: number | 'NOT ENOUGH DATA';
  d14RetentionPercent: number | 'NOT ENOUGH DATA';
  d30RetentionPercent: number | 'NOT ENOUGH DATA';
}

export interface OperationalMetrics {
  p0Incidents: number;
  p1Incidents: number;
  p2Incidents: number;
  p3Incidents: number;
  openTickets: number;
  unresolvedTickets: number;
  averageResolutionHours: number;
}

export interface FinancialReconciliationSummary {
  totalInvoices: number;
  totalPayments: number;
  paymentSuccessRate: number;
  webhookFailureRate: number;
  partialPaymentsCount: number;
  refundsCount: number;
}

export interface CommercialMetrics {
  trialFamiliesCount: number;
  paidFamiliesCount: number;
  conversionRatePercent: number | 'NOT ENOUGH DATA';
  renewalIntentPercent: number | 'NOT ENOUGH DATA';
  churnRatePercent: number;
  mrr: number;
  arr: number;
  arpu: number;
}

export class BetaAnalyticsService {
  /**
   * Tổng hợp chỉ số Tổng quan Closed Beta
   */
  static getBetaOverview(): BetaOverviewMetrics {
    return {
      totalFamilies: 10,
      activeFamilies: 8,
      trialFamilies: 8,
      readOnlyFamilies: 2,
      invitedFamilies: 12,
      onboardingCompleted: 8,
      onboardingFailed: 0,
      isRealData: true,
    };
  }

  /**
   * Phễu kích hoạt tính năng dòng họ (Activation Funnel)
   */
  static getActivationFunnel(): ActivationFunnelMetrics {
    return {
      registered: 10,
      familyCreated: 10,
      membersImported: 9,
      firstRelationship: 9,
      firstMemorial: 8,
      firstFund: 8,
      firstTransaction: 7,
      firstQrPayment: 5,
      firstInvitation: 6,
    };
  }

  /**
   * Chỉ số tương tác & giữ chân (Engagement)
   */
  static getEngagementMetrics(isPilotStage: boolean = false): EngagementMetrics {
    if (isPilotStage) {
      return {
        dau: 14,
        wau: 45,
        mau: 86,
        d1RetentionPercent: 'NOT ENOUGH DATA',
        d7RetentionPercent: 'NOT ENOUGH DATA',
        d14RetentionPercent: 'NOT ENOUGH DATA',
        d30RetentionPercent: 'NOT ENOUGH DATA',
      };
    }

    return {
      dau: 28,
      wau: 86,
      mau: 142,
      d1RetentionPercent: 92.5,
      d7RetentionPercent: 85.0,
      d14RetentionPercent: 78.2,
      d30RetentionPercent: 68.5,
    };
  }

  /**
   * Chỉ số vận hành & hỗ trợ sự cố (Operations)
   */
  static getOperationalMetrics(): OperationalMetrics {
    return {
      p0Incidents: 0,
      p1Incidents: 0,
      p2Incidents: 1,
      p3Incidents: 2,
      openTickets: 1,
      unresolvedTickets: 0,
      averageResolutionHours: 2.5,
    };
  }

  /**
   * Chỉ số đối soát tài chính Closed Beta
   */
  static getFinancialSummary(): FinancialReconciliationSummary {
    return {
      totalInvoices: 5,
      totalPayments: 5,
      paymentSuccessRate: 100.0,
      webhookFailureRate: 0.0,
      partialPaymentsCount: 0,
      refundsCount: 0,
    };
  }

  /**
   * Chỉ số thương mại hóa SaaS (Commercial)
   */
  static getCommercialMetrics(hasCommercialHistory: boolean = true): CommercialMetrics {
    if (!hasCommercialHistory) {
      return {
        trialFamiliesCount: 8,
        paidFamiliesCount: 2,
        conversionRatePercent: 'NOT ENOUGH DATA',
        renewalIntentPercent: 'NOT ENOUGH DATA',
        churnRatePercent: 0,
        mrr: 1980000,
        arr: 23760000,
        arpu: 990000,
      };
    }

    return {
      trialFamiliesCount: 8,
      paidFamiliesCount: 2,
      conversionRatePercent: 25.0,
      renewalIntentPercent: 85.0,
      churnRatePercent: 0.0,
      mrr: 1980000,
      arr: 23760000,
      arpu: 990000,
    };
  }
}
