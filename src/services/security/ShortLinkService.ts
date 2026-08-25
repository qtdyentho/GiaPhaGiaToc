import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mockFamily } from '../mockData';

export interface ClanShortLink {
  id: string;
  family_id: string;
  pass_token: string;
  short_code: string;
  is_custom: boolean;
  clicks_count: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShortLinkResolution {
  success: boolean;
  short_code?: string;
  pass_token?: string;
  family_id?: string;
  family_name?: string;
  family_code?: string;
  pin_salt?: string;
  banner_url?: string;
  is_locked?: boolean;
  clicks_count?: number;
  error?: string;
}

// In-memory store for dev / mock mode
let mockShortLinks: ClanShortLink[] = [
  {
    id: 'csl-001',
    family_id: 'fam-0000-0001',
    pass_token: 'CP-FAM-NGUYEN-VAN-2026-X89',
    short_code: 'nv86',
    is_custom: true,
    clicks_count: 142,
    last_accessed_at: '2026-08-25T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'csl-002',
    family_id: 'fam-beta-0002',
    pass_token: 'CP-FAM-TRAN-VAN-2026-T99',
    short_code: 'tv26',
    is_custom: true,
    clicks_count: 38,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'billing',
  'c',
  'checkout',
  'clan-pass',
  'dashboard',
  'events',
  'expenses',
  'family',
  'funds',
  'help',
  'login',
  'members',
  'memorials',
  'notifications',
  'permissions',
  'pricing',
  'register',
  'root',
  'settings',
  'support',
  'tree',
  'usage',
]);

const BASE62_CHARS = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluded confusing chars like 0, O, 1, l, I

export class ShortLinkService {
  /**
   * Sinh mã ngẫu nhiên duy nhất Base62 (6 ký tự)
   */
  static generateRandomCode(length = 6): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * BASE62_CHARS.length);
      result += BASE62_CHARS[idx];
    }
    return result.toLowerCase();
  }

  /**
   * Kiểm tra định dạng Custom Slug hợp lệ
   */
  static validateCustomSlug(slug: string): { valid: boolean; error?: string } {
    const clean = slug.trim().toLowerCase();

    if (!clean) {
      return { valid: false, error: 'Mã rút gọn không được để trống.' };
    }

    if (clean.length < 3) {
      return { valid: false, error: 'Mã rút gọn phải có ít nhất 3 ký tự.' };
    }

    if (clean.length > 30) {
      return { valid: false, error: 'Mã rút gọn không được vượt quá 30 ký tự.' };
    }

    // Chỉ cho phép chữ thường, số, dấu gạch ngang và gạch dưới
    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(clean)) {
      return {
        valid: false,
        error: 'Mã rút gọn chỉ được chứa chữ cái (a-z), chữ số (0-9) và dấu gạch nối (-). Không dấu, không khoảng trắng.',
      };
    }

    if (RESERVED_SLUGS.has(clean)) {
      return {
        valid: false,
        error: `Mã "${clean}" là từ khóa hệ thống dành riêng. Vui lòng chọn tên khác.`,
      };
    }

    return { valid: true };
  }

  /**
   * Kiểm tra tính duy nhất toàn cục của mã (Chống trùng lặp tuyệt đối)
   */
  static async isCodeAvailable(code: string, currentFamilyId?: string): Promise<boolean> {
    const clean = code.trim().toLowerCase();

    if (RESERVED_SLUGS.has(clean)) {
      return false;
    }

    if (isSupabaseConfigured()) {
      try {
        const query = supabase
          .from('clan_short_links')
          .select('id, family_id, short_code');

        const { data, error } = await query;
        if (!error && data) {
          const match = data.find((l) => l.short_code.toLowerCase() === clean);
          if (match) {
            // If it belongs to current family, it is available (same owner)
            return Boolean(currentFamilyId && match.family_id === currentFamilyId);
          }
          return true;
        }
      } catch (err: any) {
        console.warn('isCodeAvailable error:', err.message);
      }
    }

    // Fallback in-memory
    const match = mockShortLinks.find((l) => l.short_code.toLowerCase() === clean);
    if (match) {
      return Boolean(currentFamilyId && match.family_id === currentFamilyId);
    }
    return true;
  }

  /**
   * Lấy thông tin link rút gọn của dòng họ
   */
  static async getShortLinkByFamily(familyId: string): Promise<ClanShortLink | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('clan_short_links')
          .select('*')
          .eq('family_id', familyId)
          .single();

        if (!error && data) {
          return data as ClanShortLink;
        }
      } catch (err: any) {
        console.warn('getShortLinkByFamily error:', err.message);
      }
    }

    return mockShortLinks.find((l) => l.family_id === familyId) || null;
  }

  /**
   * Tạo mới hoặc Cập nhật Link Rút Gọn cho Dòng Họ
   */
  static async createOrUpdateShortLink(
    familyId: string,
    passToken: string,
    customCode?: string
  ): Promise<{ success: boolean; shortLink?: ClanShortLink; error?: string }> {
    let finalCode = customCode ? customCode.trim().toLowerCase() : '';
    let isCustom = Boolean(customCode);

    if (isCustom) {
      const validation = this.validateCustomSlug(finalCode);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const available = await this.isCodeAvailable(finalCode, familyId);
      if (!available) {
        return {
          success: false,
          error: `Mã rút gọn "${finalCode}" đã được sử dụng bởi dòng họ khác. Vui lòng chọn mã khác.`,
        };
      }
    } else {
      // Auto-generate random unique code with collision retry
      let attempts = 0;
      let generated = this.generateRandomCode(6);
      while (attempts < 5 && !(await this.isCodeAvailable(generated))) {
        generated = this.generateRandomCode(6 + Math.floor(attempts / 2));
        attempts++;
      }
      finalCode = generated;
    }

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        // Upsert on family_id
        const existing = await this.getShortLinkByFamily(familyId);
        if (existing) {
          const { data, error } = await supabase
            .from('clan_short_links')
            .update({
              pass_token: passToken,
              short_code: finalCode,
              is_custom: isCustom,
              updated_at: now,
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (!error && data) {
            return { success: true, shortLink: data as ClanShortLink };
          }
        } else {
          const { data, error } = await supabase
            .from('clan_short_links')
            .insert({
              family_id: familyId,
              pass_token: passToken,
              short_code: finalCode,
              is_custom: isCustom,
              clicks_count: 0,
              created_at: now,
              updated_at: now,
            })
            .select()
            .single();

          if (!error && data) {
            return { success: true, shortLink: data as ClanShortLink };
          }
        }
      } catch (err: any) {
        console.warn('createOrUpdateShortLink Supabase error:', err.message);
      }
    }

    // Mock In-memory Upsert
    const existingIndex = mockShortLinks.findIndex((l) => l.family_id === familyId);
    if (existingIndex >= 0) {
      mockShortLinks[existingIndex] = {
        ...mockShortLinks[existingIndex],
        pass_token: passToken,
        short_code: finalCode,
        is_custom: isCustom,
        updated_at: now,
      };
      return { success: true, shortLink: mockShortLinks[existingIndex] };
    } else {
      const newLink: ClanShortLink = {
        id: `csl-${Date.now()}`,
        family_id: familyId,
        pass_token: passToken,
        short_code: finalCode,
        is_custom: isCustom,
        clicks_count: 0,
        created_at: now,
        updated_at: now,
      };
      mockShortLinks.push(newLink);
      return { success: true, shortLink: newLink };
    }
  }

  /**
   * Giải mã Short Code sang Pass Token & Thông tin dòng họ
   */
  static async resolveShortCode(code: string): Promise<ShortLinkResolution> {
    const clean = code.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('fn_resolve_short_link', {
          p_code: clean,
        });

        if (!error && data) {
          return data as ShortLinkResolution;
        }
      } catch (err: any) {
        console.warn('resolveShortCode RPC error:', err.message);
      }
    }

    // Local / In-memory Resolver
    const link = mockShortLinks.find((l) => l.short_code.toLowerCase() === clean);
    if (!link) {
      return {
        success: false,
        error: 'Liên kết rút gọn không tồn tại hoặc đã bị thu hồi.',
      };
    }

    link.clicks_count += 1;
    link.last_accessed_at = new Date().toISOString();

    return {
      success: true,
      short_code: link.short_code,
      pass_token: link.pass_token,
      family_id: link.family_id,
      family_name: mockFamily.name,
      family_code: mockFamily.code,
      pin_salt: 'mock_salt_nguyen_van_2026_clan_pass_key',
      banner_url: mockFamily.banner_url,
      is_locked: false,
      clicks_count: link.clicks_count,
    };
  }

  /**
   * Lấy URL đầy đủ của Link Rút Gọn
   */
  static buildShortUrl(shortCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn';
    return `${origin}/c/${shortCode}`;
  }
}
