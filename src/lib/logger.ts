export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  service: string;
  event: string;
  requestId: string;
  userId?: string;
  familyId?: string;
  action?: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'PENDING';
  durationMs?: number;
  metadata?: Record<string, any>;
}

// Redact sensitive keys from metadata
function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'service_role', 'authorization', 'card'];
  const sanitized: Record<string, any> = Array.isArray(data) ? [] : {};

  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = redactSensitiveData(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export class Logger {
  /**
   * Sinh Correlation Request ID chuẩn hóa REQ-YYYYMMDD-XXXX
   */
  static generateRequestId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    return `REQ-${dateStr}-${rand}`;
  }

  /**
   * Ghi log cấu trúc chuẩn JSON
   */
  static log(entry: Omit<StructuredLog, 'timestamp'>): StructuredLog {
    const structured: StructuredLog = {
      timestamp: new Date().toISOString(),
      ...entry,
      metadata: redactSensitiveData(entry.metadata),
    };

    const formatted = JSON.stringify(structured);
    if (entry.level === 'ERROR' || entry.level === 'SECURITY') {
      console.error(formatted);
    } else if (entry.level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    return structured;
  }

  static info(service: string, event: string, requestId: string, metadata?: Record<string, any>) {
    return this.log({ level: 'INFO', service, event, requestId, result: 'SUCCESS', metadata });
  }

  static warn(service: string, event: string, requestId: string, metadata?: Record<string, any>) {
    return this.log({ level: 'WARN', service, event, requestId, result: 'PENDING', metadata });
  }

  static error(service: string, event: string, requestId: string, metadata?: Record<string, any>) {
    return this.log({ level: 'ERROR', service, event, requestId, result: 'FAILURE', metadata });
  }

  static security(service: string, event: string, requestId: string, result: 'SUCCESS' | 'BLOCKED' | 'FAILURE', metadata?: Record<string, any>) {
    return this.log({ level: 'SECURITY', service, event, requestId, result, metadata });
  }
}
