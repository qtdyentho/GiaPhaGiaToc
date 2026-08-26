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
    family_id: '532e22f4-f452-457b-974e-992d9021fdff',
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
    family_id: 'c8177ed9-d4ba-4022-8d7b-1555e7349701',
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
        error: 'Mã liên kết chỉ gồm chữ cái (a-z), chữ số (0-9) và dấu gạch ngang (-).',
      };
    }

    if (RESERVED_SLUGS.has(clean)) {
      return {
        valid: false,
        error: `Mã "${clean}" là từ khóa hệ thống. Vui lòng chọn tên khác.`,
      };
    }

    return { valid: true };
  }

  /**
   * Kiểm tra tính khả dụng của mã
   */
  static async isCodeAvailable(code: string, currentFamilyId?: string): Promise<boolean> {
    const clean = code.trim().toLowerCase();

    if (RESERVED_SLUGS.has(clean)) {
      return false;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('clan_short_links')
          .select('id, family_id, short_code')
          .eq('short_code', clean);

        if (data && data.length > 0) {
          if (currentFamilyId && data[0].family_id === currentFamilyId) {
            return true;
          }
          return false;
        }
        return true;
      } catch (err) {
        console.warn('isCodeAvailable error:', err);
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
    if (isSupabaseConfigured() && familyId && familyId.includes('-')) {
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
   * Tạo hoặc cập nhật Short Link
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
          error: `Mã liên kết "${finalCode}" đã được dòng họ khác sử dụng. Vui lòng chọn mã khác.`,
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

    if (isSupabaseConfigured() && familyId && familyId.includes('-')) {
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

    // Local / In-memory fallback
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
   * Giải mã Short Code sang Pass Token & Thông tin dòng họ
   */
  static async resolveShortCode(code: string): Promise<ShortLinkResolution> {
    const clean = code.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('fn_resolve_short_link', {
          p_code: clean,
        });

        if (!error && data && data.success) {
          return data as ShortLinkResolution;
        }

        // Direct query fallback on clan_short_links table
        const { data: linkRecord } = await supabase
          .from('clan_short_links')
          .select('*, families(id, name, code, banner_url)')
          .eq('short_code', clean)
          .maybeSingle();

        if (linkRecord) {
          const fam = (linkRecord as any).families;
          return {
            success: true,
            short_code: linkRecord.short_code,
            pass_token: linkRecord.pass_token,
            family_id: linkRecord.family_id,
            family_name: fam?.name || 'Gia Tộc',
            family_code: fam?.code || 'CLAN',
            pin_salt: 'salt_auto',
            banner_url: fam?.banner_url,
            is_locked: false,
            clicks_count: (linkRecord.clicks_count || 0) + 1,
          };
        }

        // Check if code matches family code or slug directly
        const { data: directFam } = await supabase
          .from('families')
          .select('*')
          .or(`code.ilike.${clean},slug.ilike.${clean}`)
          .maybeSingle();

        if (directFam) {
          const token = `CP-FAM-${directFam.id.slice(0, 8).toUpperCase()}`;
          return {
            success: true,
            short_code: clean,
            pass_token: token,
            family_id: directFam.id,
            family_name: directFam.name,
            family_code: directFam.code,
            banner_url: directFam.banner_url,
            is_locked: false,
          };
        }
      } catch (err: any) {
        console.warn('resolveShortCode error:', err.message);
      }
    }

    // Local / In-memory Resolver
    const link = mockShortLinks.find((l) => l.short_code.toLowerCase() === clean);
    if (link) {
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

    // Fallback: Nếu không tìm thấy, cho phép mở khóa với mã pass_token tạm thời
    return {
      success: true,
      short_code: clean,
      pass_token: `CP-FAM-${clean.toUpperCase()}`,
      family_id: 'fam-0000-0001',
      family_name: 'Gia Tộc',
      is_locked: false,
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
