import { supabase, isSupabaseConfigured } from '../../lib/supabase';

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

const BASE62_CHARS = '23456789abcdefghjkmnpqrstuvwxyz';

export function slugifyVietnamese(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ShortLinkService {
  /**
   * Sinh mã ngẫu nhiên Base62 an toàn, tránh ký tự dễ nhầm lẫn
   */
  static generateRandomCode(length = 6): string {
    let result = '';
    const bytes = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
      for (let i = 0; i < length; i++) {
        result += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += BASE62_CHARS[Math.floor(Math.random() * BASE62_CHARS.length)];
      }
    }
    return result;
  }

  /**
   * Tạo URL rút gọn hoàn chỉnh
   */
  static buildShortUrl(shortCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://giaphaviet.vercel.app';
    return `${origin}/c/${shortCode}`;
  }

  /**
   * Tạo slug gợi ý từ tên dòng họ
   */
  static suggestSlugFromName(name: string): string {
    return slugifyVietnamese(name);
  }

  /**
   * Tạo gợi ý Custom Slug tiếng Việt không dấu chuẩn đẹp theo tên dòng họ
   */
  static generateSlugSuggestions(familyName: string, location?: string): string[] {
    const baseSlug = slugifyVietnamese(familyName);
    const suggestions: string[] = [];

    if (baseSlug) suggestions.push(baseSlug);

    if (location) {
      const locSlug = slugifyVietnamese(location);
      if (locSlug) {
        suggestions.push(`${baseSlug}-${locSlug}`);
      }
    }

    suggestions.push(`${baseSlug}-vietnam`);
    suggestions.push(`${baseSlug}-${new Date().getFullYear()}`);

    return Array.from(new Set(suggestions)).filter((s) => s.length >= 3 && s.length <= 48);
  }

  /**
   * Xác thực tính hợp lệ của Custom Slug
   */
  static validateCustomSlug(slug: string): { valid: boolean; error?: string } {
    if (!slug || slug.trim().length === 0) {
      return { valid: false, error: 'Mã định danh không được để trống.' };
    }

    const trimmed = slug.trim().toLowerCase();

    if (trimmed.length < 3) {
      return { valid: false, error: 'Mã định danh phải có ít nhất 3 ký tự.' };
    }

    if (trimmed.length > 48) {
      return { valid: false, error: 'Mã định danh không được vượt quá 48 ký tự.' };
    }

    if (RESERVED_SLUGS.has(trimmed)) {
      return {
        valid: false,
        error: `Mã "${trimmed}" là từ khóa hệ thống (bảo lưu). Vui lòng chọn tên khác.`,
      };
    }

    // Chỉ cho phép chữ thường, số và dấu gạch nối (không cho phép ký tự đặc biệt)
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!regex.test(trimmed)) {
      return {
        valid: false,
        error: 'Mã định danh chỉ gồm chữ cái không dấu, chữ số và dấu gạch nối giữa các từ.',
      };
    }

    return { valid: true };
  }

  /**
   * Kiểm tra mã short code có khả dụng hay không (Uniqueness check)
   */
  static async isCodeAvailable(code: string, currentFamilyId?: string): Promise<boolean> {
    const clean = code.trim().toLowerCase();
    if (!clean || RESERVED_SLUGS.has(clean)) return false;

    // Check in-memory store first
    const existingMock = mockShortLinks.find((l) => l.short_code.toLowerCase() === clean);
    if (existingMock && (!currentFamilyId || existingMock.family_id !== currentFamilyId)) {
      return false;
    }

    if (isSupabaseConfigured() && isUUID(currentFamilyId)) {
      try {
        let query = supabase
          .from('clan_short_links')
          .select('id, family_id')
          .ilike('short_code', clean);

        if (currentFamilyId) {
          query = query.neq('family_id', currentFamilyId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return false;
        }
      } catch (err) {
        console.warn('isCodeAvailable Supabase check error:', err);
      }
    }

    return true;
  }

  /**
   * Lấy Short Link theo Family ID và tự động khởi tạo theo tên dòng họ nếu chưa có
   */
  static async getShortLinkByFamily(familyId: string, familyName?: string): Promise<ClanShortLink | null> {
    if (!familyId) return null;

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

        // Tự động khởi tạo short link cho dòng họ nếu chưa có trong bảng
        if (familyName) {
          const autoSlug = slugifyVietnamese(familyName) || `clan-${familyId.slice(0, 6)}`;
          const { data: passData } = await supabase
            .from('clan_access_passes')
            .select('pass_token')
            .eq('family_id', familyId)
            .maybeSingle();
          const token = passData?.pass_token || `CP-${autoSlug.toUpperCase()}-${Date.now().toString(36)}`;
          const created = await this.createOrUpdateShortLink(familyId, token, autoSlug, familyName);
          if (created.success && created.shortLink) {
            return created.shortLink;
          }
        }
      } catch (err) {
        console.warn('getShortLinkByFamily error:', err);
      }
    }

    const found = mockShortLinks.find((l) => l.family_id === familyId);
    if (found) return found;

    // Tự động sinh link rút gọn theo tên dòng họ thực tế
    const targetName = familyName || 'Gia Tộc';
    const defaultSlug = slugifyVietnamese(targetName) || `clan-${Date.now().toString(36)}`;
    const autoLink: ClanShortLink = {
      id: `csl-${familyId}`,
      family_id: familyId,
      pass_token: `CP-${defaultSlug.toUpperCase()}-${Date.now().toString(36)}`,
      short_code: defaultSlug,
      is_custom: true,
      clicks_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockShortLinks.push(autoLink);
    return autoLink;
  }

  /**
   * Tạo hoặc cập nhật Short Link (Có kiểm tra trùng lặp)
   */
  static async createOrUpdateShortLink(
    familyId: string,
    passToken: string,
    requestedCode?: string,
    familyName?: string
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
          error: `Tên định danh "${finalCode}" đã được sử dụng bởi dòng họ khác. Vui lòng chọn tên định danh khác.`,
        };
      }
    } else {
      const existing = await this.getShortLinkByFamily(familyId, familyName);
      if (existing) {
        finalCode = existing.short_code;
      } else {
        const defaultSlug = slugifyVietnamese(familyName || 'gia-toc');
        if (defaultSlug && (await this.isCodeAvailable(defaultSlug, familyId))) {
          finalCode = defaultSlug;
        } else {
          finalCode = `${defaultSlug || 'clan'}-${this.generateRandomCode(4)}`.toLowerCase();
        }
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
        id: `csl-${familyId}`,
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
   * Phân giải Short Code sang Pass Token & Family Info với cơ chế Multi-tier Fallback Resilient
   * Luôn hỗ trợ tìm kiếm theo slugified tên dòng họ hoặc mã code
   */
  static async resolveShortCode(code: string): Promise<ShortLinkResolution> {
    if (!code) {
      return { success: false, error: 'Mã liên kết không được để trống.' };
    }

    const clean = decodeURIComponent(code).trim().toLowerCase().replace(/^\/+|\/+$/g, '');

    // ─── TIER 1: Truy vấn bảng clan_short_links theo short_code ───
    if (isSupabaseConfigured()) {
      try {
        const { data: linkData } = await supabase
          .from('clan_short_links')
          .select('id, family_id, pass_token, short_code, clicks_count')
          .ilike('short_code', clean)
          .maybeSingle();

        if (linkData) {
          // Tăng clicks_count trong background
          supabase
            .from('clan_short_links')
            .update({
              clicks_count: (linkData.clicks_count || 0) + 1,
              last_accessed_at: new Date().toISOString(),
            })
            .eq('id', linkData.id)
            .then();

          const { data: famData } = await supabase
            .from('families')
            .select('id, name, code, ancestral_hall_address, banner_url')
            .eq('id', linkData.family_id)
            .maybeSingle();

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
            banner_url: famData?.banner_url,
            pin_salt: passData?.pin_salt,
            is_locked: isLocked,
            clicks_count: (linkData.clicks_count || 0) + 1,
          };
        }

        // ─── TIER 2: Truy vấn theo pass_token trong clan_access_passes ───
        const { data: passDirect } = await supabase
          .from('clan_access_passes')
          .select('family_id, pass_token, pin_salt, locked_until, is_active')
          .ilike('pass_token', clean)
          .maybeSingle();

        if (passDirect) {
          const { data: famData } = await supabase
            .from('families')
            .select('id, name, code, banner_url')
            .eq('id', passDirect.family_id)
            .maybeSingle();

          return {
            success: true,
            short_code: clean,
            pass_token: passDirect.pass_token,
            family_id: passDirect.family_id,
            family_name: famData?.name || 'Gia Tộc',
            family_code: famData?.code,
            banner_url: famData?.banner_url,
            pin_salt: passDirect.pin_salt,
            is_locked: Boolean(passDirect.locked_until && new Date(passDirect.locked_until) > new Date()),
            clicks_count: 1,
          };
        }

        // ─── TIER 3: Truy vấn theo tên dòng họ (Slugified match) hoặc Code trong bảng families ───
        const { data: allFamilies } = await supabase
          .from('families')
          .select('id, name, code, banner_url');

        if (allFamilies && allFamilies.length > 0) {
          const matchedFam = allFamilies.find(
            (f) =>
              f.code?.toLowerCase() === clean ||
              slugifyVietnamese(f.name) === clean ||
              f.id.toLowerCase() === clean
          );

          if (matchedFam) {
            let { data: famPass } = await supabase
              .from('clan_access_passes')
              .select('pass_token, pin_salt, locked_until')
              .eq('family_id', matchedFam.id)
              .maybeSingle();

            if (!famPass) {
              const token = `CP-${slugifyVietnamese(matchedFam.name).toUpperCase()}-${Date.now().toString(36)}`;
              await supabase.from('clan_access_passes').insert({
                family_id: matchedFam.id,
                pass_token: token,
                pin_salt: `salt_${Date.now().toString(36)}`,
                is_active: true,
              });
              famPass = { pass_token: token, pin_salt: `salt_${Date.now().toString(36)}`, locked_until: undefined };
            }

            // Tự động lưu short link
            this.createOrUpdateShortLink(matchedFam.id, famPass.pass_token, clean, matchedFam.name);

            return {
              success: true,
              short_code: clean,
              pass_token: famPass.pass_token,
              family_id: matchedFam.id,
              family_name: matchedFam.name,
              family_code: matchedFam.code,
              banner_url: matchedFam.banner_url,
              pin_salt: famPass.pin_salt,
              clicks_count: 1,
            };
          }
        }
      } catch (err) {
        console.warn('resolveShortCode Supabase error:', err);
      }
    }

    // ─── TIER 4: Tìm kiếm trong Mock Short Links & Fallback Store ───
    const foundLink = mockShortLinks.find(
      (l) =>
        l.short_code.toLowerCase() === clean ||
        l.pass_token.toLowerCase() === clean ||
        l.family_id.toLowerCase() === clean
    );

    if (foundLink) {
      foundLink.clicks_count += 1;
      foundLink.last_accessed_at = new Date().toISOString();
      return {
        success: true,
        short_code: foundLink.short_code,
        pass_token: foundLink.pass_token,
        family_id: foundLink.family_id,
        family_name: 'Gia Tộc',
        clicks_count: foundLink.clicks_count,
      };
    }

    return {
      success: false,
      error: `Liên kết "/c/${clean}" không tồn tại hoặc đã hết hạn.`,
    };
  }

  /**
   * Tạo nội dung tin nhắn chia sẻ qua Zalo & Mạng xã hội
   */
  static generateShareMessage(familyName: string, shortUrl: string, clanPin?: string): string {
    const pinInfo = clanPin
      ? `\n🔐 Mã PIN xác thực con cháu: ${clanPin}`
      : '\n🔐 Hãy nhập Mã PIN Gia Tộc do Trưởng tộc cấp để mở khóa thông tin.';

    return `🏛️ THÔNG BÁO TỪ ĐƯỜNG — GIA TỘC: ${familyName.toUpperCase()}
Kính gửi toàn thể cô dì chú bác và con cháu nội ngoại dòng họ.
Trân trọng kính mời bà con truy cập Cổng Thông Tin Gia Phả & Lịch Giỗ Tổ Tiên tại:
🌐 ${shortUrl}
${pinInfo}
✨ Con cháu có thể tra cứu Cây Phả Hệ, Lịch Âm Ngày Giỗ, Sổ Quỹ & Gửi Lưu Ký Tri Ân Tiên Tổ.`;
  }
}
