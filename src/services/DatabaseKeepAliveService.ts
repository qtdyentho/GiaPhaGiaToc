import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface KeepAliveStatus {
  isOnline: boolean;
  statusText: string;
  latencyMs: number;
  lastPingAt: string;
  databaseProvider: string;
  autoWakeupChannels: string[];
}

export class DatabaseKeepAliveService {
  private static lastKnownStatus: KeepAliveStatus | null = null;
  private static heartbeatTimer: any = null;

  /**
   * Đánh thức CSDL và đo đạc độ trễ phản hồi (ms)
   */
  public static async pingDatabase(): Promise<KeepAliveStatus> {
    const startTime = performance.now();
    let isOnline = false;
    let statusText = 'Đang kiểm tra kết nối...';
    let provider = 'Supabase PostgreSQL (Cloud)';

    try {
      // 1. Thử gọi Vercel Serverless Keepalive endpoint trước nếu có mạng
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        try {
          const res = await fetch('/api/keepalive', { method: 'GET', cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const latencyMs = Math.round(performance.now() - startTime);
            const status: KeepAliveStatus = {
              isOnline: true,
              statusText: `Hoạt động tốt (${data.database || 'ONLINE'})`,
              latencyMs: data.total_response_ms || latencyMs,
              lastPingAt: new Date().toISOString(),
              databaseProvider: provider,
              autoWakeupChannels: [
                'Vercel Cron Job (02:00 UTC hàng ngày)',
                'GitHub Actions Workflow (Mỗi 6 tiếng 00/06/12/18 UTC)',
                'Client App Heartbeat (Mỗi phiên mở web)'
              ]
            };
            this.lastKnownStatus = status;
            return status;
          }
        } catch {
          // Fallback sang direct Supabase client
        }
      }

      // 2. Direct Supabase Client Query
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('plans')
          .select('id')
          .limit(1);

        const latencyMs = Math.round(performance.now() - startTime);

        if (!error && data) {
          isOnline = true;
          statusText = 'CSDL Đang Hoạt Động (Online)';
        } else {
          // Thử query bảng families
          const { error: famErr } = await supabase.from('families').select('id').limit(1);
          if (!famErr) {
            isOnline = true;
            statusText = 'CSDL Đang Hoạt Động (Online)';
          } else {
            isOnline = false;
            statusText = `Suy giảm hiệu năng: ${error?.message || famErr?.message}`;
          }
        }

        const status: KeepAliveStatus = {
          isOnline,
          statusText,
          latencyMs,
          lastPingAt: new Date().toISOString(),
          databaseProvider: provider,
          autoWakeupChannels: [
            'Vercel Cron Job (02:00 UTC hàng ngày)',
            'GitHub Actions Workflow (Mỗi 6 tiếng 00/06/12/18 UTC)',
            'Client App Heartbeat (Mỗi phiên mở web)'
          ]
        };
        this.lastKnownStatus = status;
        return status;
      } else {
        // Mock Store Fallback
        const latencyMs = Math.round(performance.now() - startTime);
        const status: KeepAliveStatus = {
          isOnline: true,
          statusText: 'In-Memory Mock Store (Local Dev)',
          latencyMs: Math.max(latencyMs, 1),
          lastPingAt: new Date().toISOString(),
          databaseProvider: 'Local In-Memory Cache',
          autoWakeupChannels: ['Local Store Active']
        };
        this.lastKnownStatus = status;
        return status;
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const status: KeepAliveStatus = {
        isOnline: false,
        statusText: `Lỗi kết nối CSDL: ${err?.message || String(err)}`,
        latencyMs,
        lastPingAt: new Date().toISOString(),
        databaseProvider: provider,
        autoWakeupChannels: [
          'Vercel Cron Job (02:00 UTC hàng ngày)',
          'GitHub Actions Workflow (Mỗi 6 tiếng 00/06/12/18 UTC)'
        ]
      };
      this.lastKnownStatus = status;
      return status;
    }
  }

  /**
   * Bắt đầu gửi Heartbeat ngầm mỗi khi ứng dụng chạy (khoảng 30 phút một lần)
   */
  public static startClientHeartbeat(): void {
    if (this.heartbeatTimer) return;
    
    // Gửi ping đầu tiên ngay khi mở web
    this.pingDatabase().catch(() => {});

    // Định kỳ ping ngầm mỗi 30 phút khi tab web đang mở
    this.heartbeatTimer = setInterval(() => {
      this.pingDatabase().catch(() => {});
    }, 30 * 60 * 1000);

    if (this.heartbeatTimer && typeof (this.heartbeatTimer as any).unref === 'function') {
      (this.heartbeatTimer as any).unref();
    }
  }

  /**
   * Lấy thông tin trạng thái gần nhất
   */
  public static getLastStatus(): KeepAliveStatus | null {
    return this.lastKnownStatus;
  }
}
