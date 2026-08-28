import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { MemorialService } from './MemorialService';
import { EventService } from './EventService';

export interface EventReminderConfig {
  id: string;
  family_id: string;
  days_before: number; // 30, 15, 7, 3, 1
  channel: 'IN_APP' | 'EMAIL' | 'PUSH' | 'ZALO';
  enabled: boolean;
}

export interface ClanNotification {
  id: string;
  family_id: string;
  title: string;
  content: string;
  type: 'MEMORIAL_REMINDER' | 'EVENT_REMINDER' | 'PAYMENT_DUE' | 'SYSTEM';
  reference_id?: string;
  reference_type?: 'MEMORIAL' | 'EVENT' | 'TRANSACTION';
  is_read: boolean;
  created_at: string;
}

// In-Memory Fallback Notification Store
export const mockNotifications: ClanNotification[] = [];

export const mockReminderConfigs: EventReminderConfig[] = [
  { id: 'rc-1', family_id: 'fam-0000-0001', days_before: 30, channel: 'IN_APP', enabled: true },
  { id: 'rc-2', family_id: 'fam-0000-0001', days_before: 15, channel: 'IN_APP', enabled: true },
  { id: 'rc-3', family_id: 'fam-0000-0001', days_before: 7, channel: 'IN_APP', enabled: true },
  { id: 'rc-4', family_id: 'fam-0000-0001', days_before: 3, channel: 'IN_APP', enabled: true },
  { id: 'rc-5', family_id: 'fam-0000-0001', days_before: 1, channel: 'IN_APP', enabled: true },
];

export class ReminderService {
  /**
   * Lấy cấu hình các mốc nhắc lịch của gia tộc
   */
  static async getReminderConfigs(familyId?: string): Promise<EventReminderConfig[]> {
    if (!familyId) return [];
    return mockReminderConfigs.filter((c) => c.family_id === familyId);
  }

  /**
   * Cập nhật bật/tắt một mốc nhắc lịch
   */
  static async toggleReminderConfig(id: string, enabled: boolean): Promise<boolean> {
    const config = mockReminderConfigs.find((c) => c.id === id);
    if (config) {
      config.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Lấy danh sách thông báo nhắc nhở của gia tộc
   */
  static async getNotifications(familyId?: string): Promise<ClanNotification[]> {
    if (!familyId) return [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('family_id', familyId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as ClanNotification[];
        return [];
      } catch (err) {
        return [];
      }
    }
    return mockNotifications.filter((n) => n.family_id === familyId);
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  static async markAsRead(notificationId: string, familyId?: string): Promise<boolean> {
    if (!familyId) return false;
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('family_id', familyId);
      } catch (err) {}
    }
    const notif = mockNotifications.find((n) => n.id === notificationId && n.family_id === familyId);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  }

  /**
   * Bộ máy quét và sinh thông báo nhắc nhở tự động theo chuẩn Idempotency (BR-REMINDER-001)
   */
  static async generateDailyReminders(familyId?: string): Promise<number> {
    if (!familyId) return 0;
    let createdCount = 0;
    const upcomingMemorials = await MemorialService.getUpcomingMemorials(familyId, 20);
    const activeConfigs = mockReminderConfigs.filter((c) => c.family_id === familyId && c.enabled);

    for (const mem of upcomingMemorials) {
      for (const cfg of activeConfigs) {
        if (mem.daysRemaining === cfg.days_before) {
          // Kiểm tra Idempotency key: đã gửi thông báo mốc này chưa?
          const notifTitle = `Nhắc Lễ: ${mem.title} (Còn ${cfg.days_before} ngày)`;
          const exists = mockNotifications.some(
            (n) => n.family_id === familyId && n.reference_id === mem.id && n.title === notifTitle
          );

          if (!exists) {
            const newNotif: ClanNotification = {
              id: `notif-${Date.now()}-${createdCount}`,
              family_id: familyId,
              title: notifTitle,
              content: `Ngày giỗ ${mem.title} (${mem.lunar_day}/${mem.lunar_month} Âm lịch) sẽ diễn ra vào ngày ${mem.solarDate} (còn ${cfg.days_before} ngày).`,
              type: 'MEMORIAL_REMINDER',
              reference_id: mem.id,
              reference_type: 'MEMORIAL',
              is_read: false,
              created_at: new Date().toISOString(),
            };
            mockNotifications.unshift(newNotif);
            createdCount++;
          }
        }
      }
    }

    return createdCount;
  }
}
