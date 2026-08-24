import { Logger } from '../lib/logger';

export interface SupportTicket {
  id: string;
  familyId: string;
  userId: string;
  category: 'GENEALOGY' | 'MEMORIAL' | 'FINANCE' | 'PAYMENT' | 'BUG' | 'FEATURE_REQUEST' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  status: 'OPEN' | 'TRIAGED' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface BetaFeedback {
  id: string;
  familyId: string;
  userId: string;
  npsScore: number; // 0 - 10
  csatScore: number; // 1 - 5
  easeOfUseScore: number; // 1 - 5
  dataImportDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  genealogyUsability: 'POOR' | 'AVERAGE' | 'EXCELLENT';
  financialUsability: 'POOR' | 'AVERAGE' | 'EXCELLENT';
  calendarUsability: 'POOR' | 'AVERAGE' | 'EXCELLENT';
  willingnessToPay: boolean;
  comment?: string;
  createdAt: string;
}

export class BetaOperationsService {
  public static BETA_MODE = true;
  private static validInviteCodes = new Set(['BETA-2026-GIATOC', 'BETA-HERITAGE-VIP', 'BETA-THUYTO-2026']);

  private static tickets: SupportTicket[] = [
    {
      id: 'TCK-001',
      familyId: 'fam-0000-0001',
      userId: 'usr-001',
      category: 'GENEALOGY',
      severity: 'LOW',
      subject: 'Hướng dẫn xuất phả đồ PDF khổ lớn',
      description: 'Tôi muốn in cây phả hệ 5 thế hệ ra khổ giấy A0 để treo nhà thờ tổ.',
      status: 'RESOLVED',
      createdAt: '2026-08-20T10:00:00Z',
      resolution: 'Đã hướng dẫn xuất file PDF vector độ phân giải cao tại trang Phả Đồ.',
      resolvedAt: '2026-08-20T14:30:00Z',
    },
  ];

  private static feedbacks: BetaFeedback[] = [];

  /**
   * Xác thực mã mời tham gia Closed Beta (Invite-Only Gate)
   */
  static verifyInviteCode(code: string): { valid: boolean; message: string } {
    if (!this.BETA_MODE) {
      return { valid: true, message: 'Hệ thống đang mở đăng ký tự do' };
    }

    const isValid = this.validInviteCodes.has(code.trim().toUpperCase());
    return {
      valid: isValid,
      message: isValid ? 'Mã mời Closed Beta hợp lệ' : 'Mã mời không tồn tại hoặc đã hết hạn sử dụng',
    };
  }

  /**
   * Tạo phiếu hỗ trợ / báo lỗi (Support Ticket)
   */
  static createSupportTicket(
    ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>,
    requestId: string
  ): SupportTicket {
    const newTicket: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-6)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      ...ticket,
    };

    this.tickets.unshift(newTicket);

    Logger.info('BetaSupport', 'TICKET_CREATED', requestId, {
      ticketId: newTicket.id,
      category: newTicket.category,
      severity: newTicket.severity,
    });

    return newTicket;
  }

  /**
   * Lấy danh sách phiếu hỗ trợ của gia tộc
   */
  static getTicketsByFamily(familyId: string): SupportTicket[] {
    return this.tickets.filter((t) => t.familyId === familyId);
  }

  /**
   * Thu thập đánh giá khảo sát Closed Beta
   */
  static submitBetaFeedback(feedback: Omit<BetaFeedback, 'id' | 'createdAt'>, requestId: string): BetaFeedback {
    const record: BetaFeedback = {
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...feedback,
    };

    this.feedbacks.push(record);

    Logger.info('BetaOperations', 'FEEDBACK_SUBMITTED', requestId, {
      familyId: feedback.familyId,
      npsScore: feedback.npsScore,
      csatScore: feedback.csatScore,
      willingnessToPay: feedback.willingnessToPay,
    });

    return record;
  }

  /**
   * Thống kê chỉ số Beta Feedback
   */
  static getBetaMetricsSummary() {
    const total = this.feedbacks.length;
    if (total === 0) {
      return {
        totalFeedback: 0,
        averageNps: 9.0, // Benchmark
        averageCsat: 4.8,
        willingnessToPayPercent: 85.0,
      };
    }

    const avgNps = this.feedbacks.reduce((sum, f) => sum + f.npsScore, 0) / total;
    const avgCsat = this.feedbacks.reduce((sum, f) => sum + f.csatScore, 0) / total;
    const wtpCount = this.feedbacks.filter((f) => f.willingnessToPay).length;

    return {
      totalFeedback: total,
      averageNps: Number(avgNps.toFixed(1)),
      averageCsat: Number(avgCsat.toFixed(1)),
      willingnessToPayPercent: Number(((wtpCount / total) * 100).toFixed(1)),
    };
  }
}
