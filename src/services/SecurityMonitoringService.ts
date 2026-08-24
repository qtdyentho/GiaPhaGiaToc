import { Logger } from '../lib/logger';

export interface SecurityEvent {
  id: string;
  eventType:
    | 'AUTH_LOGIN_SUCCESS'
    | 'AUTH_LOGIN_FAILED'
    | 'RLS_DENIED'
    | 'QUOTA_DENIED'
    | 'PAYMENT_WEBHOOK_REJECTED'
    | 'ADMIN_ACTION'
    | 'ADMIN_BILLING_OVERRIDE'
    | 'DATA_IMPORT_ROLLEDBACK'
    | 'LEDGER_REVERSED';
  userId?: string;
  familyId?: string;
  requestId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export class SecurityMonitoringService {
  private static events: SecurityEvent[] = [];

  /**
   * Ghi nhận sự kiện bảo mật & kiểm toán hệ thống
   */
  static recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'createdAt'>): SecurityEvent {
    const record: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      ...event,
    };

    this.events.push(record);

    // Ghi structured log
    Logger.security(
      'SecurityMonitor',
      event.eventType,
      event.requestId,
      event.severity === 'CRITICAL' ? 'BLOCKED' : 'SUCCESS',
      {
        userId: event.userId,
        familyId: event.familyId,
        description: event.description,
        ...event.metadata,
      }
    );

    return record;
  }

  /**
   * Lấy danh sách sự kiện bảo mật gần nhất
   */
  static getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
    return [...this.events].reverse().slice(0, limit);
  }

  /**
   * Đánh giá tỷ lệ lỗi Webhook ngân hàng (Alerting Rule)
   */
  static evaluateWebhookHealth(
    totalRequests: number,
    failedRequests: number
  ): { isHealthy: boolean; failureRatePercent: number; alertTriggered: boolean; message: string } {
    if (totalRequests === 0) {
      return { isHealthy: true, failureRatePercent: 0, alertTriggered: false, message: 'Chưa có giao dịch webhook' };
    }

    const failureRatePercent = Number(((failedRequests / totalRequests) * 100).toFixed(2));
    const alertTriggered = failureRatePercent > 5.0;

    return {
      isHealthy: !alertTriggered,
      failureRatePercent,
      alertTriggered,
      message: alertTriggered
        ? `⚠️ CẢNH BÁO P1: Tỷ lệ lỗi Webhook (${failureRatePercent}%) vượt ngưỡng an toàn 5.0%`
        : `✅ Tỷ lệ lỗi Webhook (${failureRatePercent}%) nằm trong ngưỡng an toàn`,
    };
  }
}
