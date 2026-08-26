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

function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// In-memory store for dev / mock mode
let mockShortLinks: ClanShortLink[] = [
  {
    id: 'csl-001',
    family_id: '532e22f4-f452-457b-974e-992d9021fdff',
    pass_token: 'CP-FAM-NGUYEN-VAN-2026-X89',
    short_code: 'honguyen-yenmo',
    is_custom: true,
    clicks_count: 142,
    last_accessed_at: '2026-08-25T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'csl-002',
    family_id: 'c8177ed9-d4ba-4022-8d7b-1555e7349701',
    pass_token: 'CP-FAM-TRAN-VAN-2026-T99',
    short_code: 'hotran-giavien',
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

const BASE62_CHARS = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

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
      return { valid: false, error: 'Mã định danh liên kết không được để trống.' };
    }

    if (clean.length < 3) {
      return { valid: false, error: 'Mã định danh liên kết phải có ít nhất 3 ký tự.' };
    }

    if (clean.length > 30) {
      return { valid: false, error: 'Mã định danh liên kết không được vượt quá 30 ký tự.' };
    }

    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(clean)) {
      return {
        valid: false,
        error: 'Mã liên kết chỉ gồm chữ thường (a-z), chữ số (0-9) và dấu gạch ngang (-).',
      };
    }

    if (RESERVED_SLUGS.has(clean)) {
      return {
        valid: false,
        error: `Tên định danh "${clean}" là từ khóa hệ thống. Vui lòng chọn tên khác.`,
      };
    }

    return { valid: true };
  }

  /**
   * Kiểm tra xem tên định danh có bị trùng với dòng họ khác không
   */
  static async isCodeAvailable(code: string, currentFamilyId?: string): Promise<boolean> {
    const clean = code.trim().toLowerCase();

    if (RESERVED_SLUGS.has(clean)) {
      return false;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('clan_short_links')
          .select('id, family_id, short_code')
          .eq('short_code', clean);

        if (!error && data && data.length > 0) {
          // Nếu trùng mã nhưng chính là của dòng họ hiện tại -> cho phép
          if (currentFamilyId && data[0].family_id === currentFamilyId) {
            return true;
          }
          return false; // Đã có dòng họ khác dùng
        }
        if (!error) return true;
      } catch (err) {
        console.warn('isCodeAvailable Supabase check error:', err);
      }
    }

    const existing = mockShortLinks.find((l) => l.short_code.toLowerCase() === clean);
    if (!existing) return true;
    if (currentFamilyId && existing.family_id === currentFamilyId) return true;
    return false;
  }

  /**
   * Lấy Short Link theo Family ID
   */
  static async getShortLinkByFamily(familyId: string): Promise<ClanShortLink | null> {
    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('clan_short_links')
          .select('*')
          .eq('family_id', familyId)
          .maybeSingle();

        if (!error && data) {
          return data as ClanShortLink;
        }
      } catch (err) {
        console.warn('getShortLinkByFamily error:', err);
      }
    }

    const found = mockShortLinks.find((l) => l.family_id === familyId);
    return found || null;
  }

  /**
   * Tạo hoặc cập nhật Short Link (Có kiểm tra trùng lặp)
   */
  static async createOrUpdateShortLink(
    familyId: string,
    passToken: string,
    requestedCode?: string
  ): Promise<{ success: boolean; shortLink?: ClanShortLink; error?: string }> {
    let finalCode = requestedCode ? requestedCode.trim().toLowerCase() : '';
    const isCustom = Boolean(requestedCode);

    if (finalCode) {
      const val = this.validateCustomSlug(finalCode);
      if (!val.valid) {
        return { success: false, error: val.error };
      }

      const available = await this.isCodeAvailable(finalCode, familyId);
      if (!available) {
        return {
          success: false,
          error: `Tên định danh "${finalCode}" đã được dòng họ khác sử dụng. Vui lòng chọn tên định danh khác.`,
        };
      }
    } else {
      const existing = await this.getShortLinkByFamily(familyId);
      if (existing) {
        finalCode = existing.short_code;
      } else {
        let code = this.generateRandomCode(5);
        let tries = 0;
        while (!(await this.isCodeAvailable(code)) && tries < 5) {
          code = this.generateRandomCode(6);
          tries++;
        }
        finalCode = code;
      }
    }

    const now = new Date().toISOString();

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        // Đảm bảo clan_access_passes tồn tại trước khi upsert short link
        const { data: passData } = await supabase
          .from('clan_access_passes')
          .select('id, pass_token')
          .eq('family_id', familyId)
          .maybeSingle();

        if (!passData) {
          await supabase.from('clan_access_passes').insert({
            family_id: familyId,
            pass_token: passToken,
            pin_salt: `salt_${Date.now().toString(36)}`,
            is_active: true,
            created_at: now,
            updated_at: now,
          });
        }

        const { data: existingLink } = await supabase
          .from('clan_short_links')
          .select('id')
          .eq('family_id', familyId)
          .maybeSingle();

        if (existingLink) {
          const { data, error } = await supabase
            .from('clan_short_links')
            .update({
              pass_token: passToken,
              short_code: finalCode,
              is_custom: isCustom,
              updated_at: now,
            })
            .eq('family_id', familyId)
            .select()
            .single();

          if (error) return { success: false, error: error.message };
          return { success: true, shortLink: data as ClanShortLink };
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

          if (error) return { success: false, error: error.message };
          return { success: true, shortLink: data as ClanShortLink };
        }
      } catch (err: any) {
        console.warn('createOrUpdateShortLink Supabase error:', err);
      }
    }

    // Local / In-memory fallback (Xử lý an toàn khi familyId không phải UUID hoặc môi trường dev)
    const idx = mockShortLinks.findIndex((l) => l.family_id === familyId);
    if (idx >= 0) {
      mockShortLinks[idx].pass_token = passToken;
      mockShortLinks[idx].short_code = finalCode;
      mockShortLinks[idx].is_custom = isCustom;
      mockShortLinks[idx].updated_at = now;
      return { success: true, shortLink: mockShortLinks[idx] };
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
   * Phân giải Short Code sang Pass Token & Family Info
   */
  static async resolveShortCode(code: string): Promise<ShortLinkResolution> {
    const clean = code.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data: linkData, error: linkErr } = await supabase
          .from('clan_short_links')
          .select('id, family_id, pass_token, short_code, clicks_count')
          .eq('short_code', clean)
          .maybeSingle();

        if (!linkErr && linkData) {
          // Tăng clicks_count
          supabase
            .from('clan_short_links')
            .update({
              clicks_count: (linkData.clicks_count || 0) + 1,
              last_accessed_at: new Date().toISOString(),
            })
            .eq('id', linkData.id)
            .then();

          // Lấy thông tin family
          const { data: famData } = await supabase
            .from('families')
            .select('id, name, code, ancestral_hall_address')
            .eq('id', linkData.family_id)
            .maybeSingle();

          // Lấy salt và lock status
          const { data: passData } = await supabase
            .from('clan_access_passes')
            .select('pin_salt, locked_until, is_active')
            .eq('family_id', linkData.family_id)
            .maybeSingle();

          const isLocked = Boolean(
            passData?.locked_until && new Date(passData.locked_until) > new Date()
          );

          return {
            success: true,
            short_code: linkData.short_code,
            pass_token: linkData.pass_token,
            family_id: linkData.family_id,
            family_name: famData?.name || 'Gia Tộc',
            family_code: famData?.code,
            pin_salt: passData?.pin_salt,
            is_locked: isLocked,
            clicks_count: (linkData.clicks_count || 0) + 1,
          };
        }
      } catch (err) {
        console.warn('resolveShortCode Supabase error:', err);
      }
    }

    // In-memory fallback
    const found = mockShortLinks.find((l) => l.short_code.toLowerCase() === clean);
    if (!found) {
      return { success: false, error: 'Mã liên kết không tồn tại hoặc đã hết hạn.' };
    }

    found.clicks_count += 1;
    found.last_accessed_at = new Date().toISOString();

    return {
      success: true,
      short_code: found.short_code,
      pass_token: found.pass_token,
      family_id: found.family_id,
      family_name: mockFamily.name,
      family_code: mockFamily.code,
      clicks_count: found.clicks_count,
    };
  }

  /**
   * Tạo URL ngắn hoàn chỉnh dạng https://domain/c/:shortCode
   */
  static buildShortUrl(shortCode: string, baseUrl?: string): string {
    const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://giaphagiatoc.vn');
    return `${origin}/c/${shortCode.trim().toLowerCase()}`;
  }

  /**
   * Lấy thống kê số lượt truy cập liên kết ngắn
   */
  static async getShortLinkStats(familyId: string): Promise<{ clicks_count: number; last_accessed_at?: string }> {
    const link = await this.getShortLinkByFamily(familyId);
    return {
      clicks_count: link?.clicks_count || 0,
      last_accessed_at: link?.last_accessed_at,
    };
  }
}

export default ShortLinkService;
