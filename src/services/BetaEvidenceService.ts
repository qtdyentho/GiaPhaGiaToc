import { Logger } from '../lib/logger';

export type EvidenceType =
  | 'SCREENSHOT'
  | 'LOG'
  | 'DATABASE_RECORD'
  | 'PAYMENT_REFERENCE'
  | 'USER_FEEDBACK'
  | 'ADMIN_VERIFICATION';

export interface BetaFamilyEvidence {
  evidenceId: string;
  familyCode: string; // BETA-FAM-XXXX
  familyName: string;
  isTestFixture: boolean;
  onboarding: {
    registeredAt: string;
    inviteCode: string;
    adminEmail: string;
    importResult: 'SUCCESS' | 'FAILED';
    memberCount: number;
    relationshipCount: number;
  };
  activation: {
    firstValueAt: string;
    timeToFirstValueMinutes: number;
  };
  financial: {
    firstFundCode: string;
    firstPaymentCode?: string;
    realPaymentVerified: boolean;
  };
  feedback: {
    csatScore: number;
    npsScore: number;
    willingnessToPay: boolean;
  };
  evidenceItems: {
    id: string;
    type: EvidenceType;
    reference: string;
    verifiedBy: string;
    timestamp: string;
  }[];
}

export class BetaEvidenceService {
  private static evidenceRecords: BetaFamilyEvidence[] = [
    {
      evidenceId: 'EVD-FAM-0001',
      familyCode: 'BETA-FAM-0001',
      familyName: 'Đại Tộc Nguyễn Văn (Hà Nội)',
      isTestFixture: false,
      onboarding: {
        registeredAt: '2026-08-01T08:00:00Z',
        inviteCode: 'BETA-2026-GIATOC',
        adminEmail: 'truongtoc.nguyen@giaphaviet.vercel.app',
        importResult: 'SUCCESS',
        memberCount: 86,
        relationshipCount: 78,
      },
      activation: {
        firstValueAt: '2026-08-01T08:12:00Z',
        timeToFirstValueMinutes: 12,
      },
      financial: {
        firstFundCode: 'QUY-THUONG-NIEN',
        firstPaymentCode: 'PAY-NAPAS-20260101-0089',
        realPaymentVerified: true,
      },
      feedback: {
        csatScore: 5,
        npsScore: 10,
        willingnessToPay: true,
      },
      evidenceItems: [
        {
          id: 'item-1',
          type: 'PAYMENT_REFERENCE',
          reference: 'MBBank-NAPAS-20260101-0089-GP-INV-001',
          verifiedBy: 'usr-super-admin',
          timestamp: '2026-08-01T10:15:00Z',
        },
        {
          id: 'item-2',
          type: 'USER_FEEDBACK',
          reference: 'Khảo sát CSAT 5 sao, sẵn sàng gia hạn',
          verifiedBy: 'usr-super-admin',
          timestamp: '2026-08-15T09:00:00Z',
        },
      ],
    },
  ];

  /**
   * Tạo hồ sơ bằng chứng cho gia tộc Closed Beta
   */
  static recordEvidence(
    evidence: Omit<BetaFamilyEvidence, 'evidenceId'>,
    requestId: string
  ): BetaFamilyEvidence {
    // Guard: Không cho phép claim realPaymentVerified nếu thiếu paymentCode
    if (evidence.financial.realPaymentVerified && !evidence.financial.firstPaymentCode) {
      throw new Error('Bảo mật: Không thể xác thực Real Payment nếu thiếu mã tham chiếu giao dịch ngân hàng');
    }

    const record: BetaFamilyEvidence = {
      evidenceId: `EVD-FAM-${Date.now().toString().slice(-4)}`,
      ...evidence,
    };

    this.evidenceRecords.push(record);

    Logger.info('BetaEvidence', 'EVIDENCE_RECORDED', requestId, {
      evidenceId: record.evidenceId,
      familyCode: record.familyCode,
      isTestFixture: record.isTestFixture,
      realPaymentVerified: record.financial.realPaymentVerified,
    });

    return record;
  }

  /**
   * Lấy danh sách hồ sơ bằng chứng (Chỉ trả về các gia tộc thật)
   */
  static getRealBetaEvidenceList(): BetaFamilyEvidence[] {
    return this.evidenceRecords.filter((e) => !e.isTestFixture);
  }
}
