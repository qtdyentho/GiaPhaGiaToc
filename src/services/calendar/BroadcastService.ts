import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface BroadcastNotification {
  id: string;
  family_id: string;
  title: string;
  message: string;
  event_id?: string;
  event_title?: string;
  event_date: string; // ISO string e.g. "2026-09-02T08:00:00.000Z"
  location?: string;
  author_name: string;
  author_role: string;
  created_at: string;
  is_active: boolean;
  link_url?: string;
}

const STORAGE_KEY = 'hl_clan_broadcasts';

// Generate default upcoming event: 5 days, 8 hours, 30 minutes from now
const defaultEventDate = new Date(Date.now() + 5 * 24 * 3600 * 1000 + 8 * 3600 * 1000 + 30 * 60 * 1000).toISOString();

export const INITIAL_BROADCASTS: BroadcastNotification[] = [
  {
    id: 'bc-001',
    family_id: 'fam-0000-0001',
    title: 'Đại Lễ Tế Tổ & Khánh Thành Tu Bổ Từ Đường',
    message:
      'Kính mời toàn thể con cháu nội ngoại tề tựu đông đủ về Nhà thờ tổ dòng họ để dâng hương kính cáo tiên tổ và tham dự đại lễ khánh thành nhà thờ họ.',
    event_title: 'Đại Lễ Tế Tổ Thu Tế 2026',
    event_date: defaultEventDate,
    location: 'Nhà Thờ Tổ Đại Tộc Nguyễn Văn (Số 18 Ngõ 42, Định Công, Hoàng Mai, Hà Nội)',
    author_name: 'Nguyễn Văn Hoàng',
    author_role: 'Trưởng Tộc',
    created_at: new Date().toISOString(),
    is_active: true,
    link_url: '/app/events',
  },
];

type BroadcastListener = (broadcast: BroadcastNotification | null) => void;

class BroadcastServiceClass {
  private listeners: BroadcastListener[] = [];

  getBroadcasts(familyId: string = 'fam-0000-0001'): BroadcastNotification[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const list: BroadcastNotification[] = JSON.parse(saved);
        return list.filter((b) => b.family_id === familyId);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_BROADCASTS.filter((b) => b.family_id === familyId);
  }

  getActiveBroadcast(familyId: string = 'fam-0000-0001'): BroadcastNotification | null {
    const list = this.getBroadcasts(familyId);
    const active = list.find((b) => b.is_active);
    return active || null;
  }

  createBroadcast(
    data: Omit<BroadcastNotification, 'id' | 'created_at' | 'is_active'>
  ): BroadcastNotification {
    const newBroadcast: BroadcastNotification = {
      ...data,
      id: `bc-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    let all: BroadcastNotification[] = saved ? JSON.parse(saved) : INITIAL_BROADCASTS;

    // Deactivate previous broadcasts for this family
    all = all.map((b) => (b.family_id === data.family_id ? { ...b, is_active: false } : b));
    all.unshift(newBroadcast);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    this.notify(newBroadcast);

    if (isSupabaseConfigured()) {
      supabase
        .from('notifications')
        .insert([{
          family_id: data.family_id,
          type: 'EVENT_REMINDER',
          title: data.title,
          message: data.message,
          reference_type: 'broadcast',
          is_read: false,
        }])
        .then(() => {});
    }

    return newBroadcast;
  }

  dismissActiveBroadcast(familyId: string = 'fam-0000-0001') {
    // Dismiss toast for current session (can still be viewed in notifications page)
    this.notify(null);
  }

  subscribe(listener: BroadcastListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(broadcast: BroadcastNotification | null) {
    this.listeners.forEach((l) => l(broadcast));
  }
}

export const BroadcastService = new BroadcastServiceClass();
