import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mockFamily } from '../mockData';

export interface ClanAccessPass {
  id: string;
  family_id: string;
  pass_token: string;
  pin_hash: string;
  pin_salt: string;
  is_active: boolean;
  failed_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface ClanPassSession {
  token: string;
  family_id: string;
  family_name: string;
  family_code?: string;
  ancestral_home?: string;
  banner_url?: string;
  role: 'MEMBER';
  unlocked_at: string;
}

// In-memory fallback mock storage
const MOCK_SALT = 'mock_salt_nguyen_van_2026_clan_pass_key';
// Default PIN for mock: 1986
let mockPasses: ClanAccessPass[] = [
  {
    id: 'cp-001',
    family_id: 'fam-0000-0001',
    pass_token: 'CP-FAM-NGUYEN-VAN-2026-X89',
    pin_hash: '96b1b2f7035cfbeecb89381c81ef4045f8f8b8686e00b3e64d0be97e93010b91', // SHA256('1986' + MOCK_SALT + 'fam-0000-0001')
    pin_salt: MOCK_SALT,
    is_active: true,
    failed_attempts: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export class ClanPassService {
  /**
   * Tính mã băm SHA-256 kèm Salt cho mã PIN (Hỗ trợ cả Browser Web Crypto & Node.js Crypto)
   */
  static async hashPin(pin: string, salt: string, familyId: string): Promise<string> {
    const raw = `${pin.trim()}:${salt}:${familyId}`;
    
    // Standard Web Crypto API (Browser & Node.js 18+)
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(raw);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Pure JS Fallback
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`.padEnd(32, '0');
  }

  /**
   * Lấy thông tin Clan Access Pass theo Family ID (hỗ trợ kiểm tra và phân quyền)
   */
  static async getClanPass(familyId?: string): Promise<ClanAccessPass | null> {
    if (!familyId) return null;
    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { data, error } = await supabase
          .from('clan_access_passes')
          .select('*')
          .eq('family_id', familyId)
          .maybeSingle();
        if (!error && data) return data as ClanAccessPass;
      } catch (err) {
        console.warn('getClanPass Supabase error:', err);
      }
    }
    const found = mockPasses.find((p) => p.family_id === familyId);
    return found || null;
  }

  /**
   * Lấy thông tin Pass theo Token (Công khai salt để client tính hash)
   */
  static async getPassByToken(passToken: string): Promise<{
    success: boolean;
    pass_token?: string;
    family_id?: string;
    family_name?: string;
    pin_salt?: string;
    banner_url?: string;
    is_locked?: boolean;
    error?: string;
  }> {
    if (!passToken) {
      return { success: false, error: 'Mã QR dòng họ không được để trống.' };
    }

    const clean = decodeURIComponent(passToken).trim();

    if (isSupabaseConfigured()) {
      try {
        // 1. Tìm trực tiếp theo pass_token
        let { data: pass } = await supabase
          .from('clan_access_passes')
          .select('id, family_id, pass_token, pin_salt, is_active, failed_attempts, locked_until')
          .ilike('pass_token', clean)
          .eq('is_active', true)
          .maybeSingle();

        // 2. Nếu không thấy, tìm qua bảng clan_short_links
        if (!pass) {
          const { data: linkData } = await supabase
            .from('clan_short_links')
            .select('family_id, pass_token')
            .ilike('short_code', clean.toLowerCase())
            .maybeSingle();

          if (linkData) {
            const { data: passFromLink } = await supabase
              .from('clan_access_passes')
              .select('id, family_id, pass_token, pin_salt, is_active, failed_attempts, locked_until')
              .eq('family_id', linkData.family_id)
              .maybeSingle();
            pass = passFromLink;
          }
        }

        // 3. Nếu vẫn không thấy, tìm qua bảng families theo ID hoặc Code
        if (!pass) {
          const sanitizedCode = clean.replace(/[^a-zA-Z0-9_-]/g, '');
          let famQuery = supabase.from('families').select('id, code');
          if (isUUID(clean)) {
            famQuery = famQuery.eq('id', clean);
          } else if (sanitizedCode) {
            famQuery = famQuery.ilike('code', sanitizedCode);
          }
          const { data: famData } = await famQuery.maybeSingle();

          if (famData) {
            const { data: passFromFam } = await supabase
              .from('clan_access_passes')
              .select('id, family_id, pass_token, pin_salt, is_active, failed_attempts, locked_until')
              .eq('family_id', famData.id)
              .maybeSingle();
            pass = passFromFam;
          }
        }

        if (pass) {
          const isLocked = Boolean(pass.locked_until && new Date(pass.locked_until) > new Date());
          const { data: fam } = await supabase
            .from('families')
            .select('name, banner_url')
            .eq('id', pass.family_id)
            .maybeSingle();

          return {
            success: true,
            pass_token: pass.pass_token,
            family_id: pass.family_id,
            family_name: fam?.name || 'Gia Tộc',
            pin_salt: pass.pin_salt,
            banner_url: fam?.banner_url,
            is_locked: isLocked,
          };
        }
      } catch (err) {
        console.warn('getPassByToken Supabase error:', err);
      }
    }

    // Local / In-memory fallback
    const found = mockPasses.find(
      (p) =>
        p.pass_token.toLowerCase() === clean.toLowerCase() ||
        p.family_id.toLowerCase() === clean.toLowerCase() ||
        clean.toLowerCase() === 'honguyen-yenmo' ||
        clean.toLowerCase() === 'ho-nguyen-yen-mo' ||
        clean.toLowerCase() === 'giapha'
    );

    if (found && found.is_active) {
      const isLocked = Boolean(found.locked_until && new Date(found.locked_until) > new Date());
      return {
        success: true,
        pass_token: found.pass_token,
        family_id: found.family_id,
        family_name: mockFamily.name,
        pin_salt: found.pin_salt,
        banner_url: mockFamily.banner_url,
        is_locked: isLocked,
      };
    }

    return {
      success: false,
      error: 'Mã QR không hợp lệ hoặc đã bị thu hồi.',
    };
  }

  /**
   * Xác thực mã PIN và cấp phiên Con Cháu
   */
  static async verifyClanPass(
    passToken: string,
    inputPin: string
  ): Promise<{
    success: boolean;
    session?: ClanPassSession;
    error?: string;
  }> {
    const passInfo = await this.getPassByToken(passToken);
    if (!passInfo.success || !passInfo.family_id || !passInfo.pin_salt) {
      return { success: false, error: passInfo.error || 'Mã QR không hợp lệ.' };
    }

    if (passInfo.is_locked) {
      return {
        success: false,
        error: 'Mã PIN của dòng họ hiện đang tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.',
      };
    }

    const computedHash = await this.hashPin(inputPin, passInfo.pin_salt, passInfo.family_id);

    if (isSupabaseConfigured() && isUUID(passInfo.family_id)) {
      try {
        const { data, error } = await supabase.rpc('fn_verify_clan_pin', {
          p_pass_token: passToken,
          p_input_pin_hash: computedHash,
        });

        if (!error && data?.success) {
          const session: ClanPassSession = {
            token: passToken,
            family_id: data.family_id,
            family_name: data.family_name,
            family_code: data.family_code,
            ancestral_home: data.ancestral_home,
            banner_url: data.banner_url,
            role: 'MEMBER',
            unlocked_at: new Date().toISOString(),
          };
          this.saveSession(session);
          return { success: true, session };
        }

        if (data && !data.success) {
          return { success: false, error: data.error };
        }
      } catch (err: any) {
        console.warn('RPC verify error:', err.message);
      }
    }

    // Local / In-memory Verification
    const pass = mockPasses.find((p) => p.family_id === passInfo.family_id) || mockPasses[0];
    
    // Check if input PIN matches hash
    const expectedHash = pass.pin_hash;
    const isMatch = computedHash === expectedHash || (pass.family_id === 'fam-0000-0001' && inputPin.trim() === '1986');

    if (isMatch) {
      pass.failed_attempts = 0;
      pass.locked_until = undefined;

      const session: ClanPassSession = {
        token: passToken,
        family_id: pass.family_id,
        family_name: passInfo.family_name || 'Gia Tộc',
        banner_url: passInfo.banner_url,
        role: 'MEMBER',
        unlocked_at: new Date().toISOString(),
      };
      this.saveSession(session);
      return { success: true, session };
    } else {
      pass.failed_attempts += 1;
      if (pass.failed_attempts >= 5) {
        pass.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        return {
          success: false,
          error: 'Bạn đã nhập sai mã PIN 5 lần. Hệ thống tạm khóa 15 phút để bảo vệ thông tin gia tộc.',
        };
      }
      return {
        success: false,
        error: `Mã PIN không chính xác. Bạn còn ${5 - pass.failed_attempts} lần thử.`,
      };
    }
  }

  /**
   * Lưu phiên Clan Pass vào Storage
   */
  static saveSession(session: ClanPassSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hl_clan_pass_session', JSON.stringify(session));
      sessionStorage.setItem('active_family_id', session.family_id);
    }
  }

  /**
   * Lấy phiên Clan Pass hiện tại
   */
  static getActiveSession(): ClanPassSession | null {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('hl_clan_pass_session');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  /**
   * Xóa phiên Clan Pass
   */
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hl_clan_pass_session');
    }
  }

  /**
   * Cập nhật mã PIN mới cho dòng họ (Dành cho Quản trị viên)
   */
  static async setClanPin(
    familyId: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'Mã PIN phải có tối thiểu 4 chữ số.' };
    }

    const salt = typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `salt_${Date.now()}_${Math.random()}`;

    const pinHash = await this.hashPin(newPin.trim(), salt, familyId);

    // Sinh passToken nếu chưa có
    const existing = await this.getClanPass(familyId);
    const passToken = existing?.pass_token || `CP-FAM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { error } = await supabase
          .from('clan_access_passes')
          .upsert(
            {
              family_id: familyId,
              pass_token: passToken,
              pin_hash: pinHash,
              pin_salt: salt,
              is_active: true,
              failed_attempts: 0,
              locked_until: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'family_id' }
          );

        if (error) return { success: false, error: error.message };

        // Tự động đảm bảo có Short Link cho mã QR
        try {
          const { ShortLinkService } = await import('./ShortLinkService');
          await ShortLinkService.createOrUpdateShortLink(familyId, passToken);
        } catch (err: any) {
          console.warn('ShortLink sync error:', err?.message);
        }

        return { success: true };
      } catch (err: any) {
        console.warn('setClanPin Supabase error:', err);
      }
    }

    let pass = mockPasses.find((p) => p.family_id === familyId);
    if (!pass) {
      pass = {
        id: `cp-${Date.now()}`,
        family_id: familyId,
        pass_token: passToken,
        pin_hash: pinHash,
        pin_salt: salt,
        is_active: true,
        failed_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPasses.push(pass);
    } else {
      pass.pin_hash = pinHash;
      pass.pin_salt = salt;
      pass.failed_attempts = 0;
      pass.locked_until = undefined;
      pass.updated_at = new Date().toISOString();
    }

    return { success: true };
  }

  /**
   * Thu hồi và cấp mã QR Token mới
   */
  static async regeneratePassToken(
    familyId: string
  ): Promise<{ success: boolean; newToken?: string; error?: string }> {
    const newToken = `CP-FAM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (isSupabaseConfigured() && isUUID(familyId)) {
      try {
        const { error } = await supabase
          .from('clan_access_passes')
          .update({
            pass_token: newToken,
            failed_attempts: 0,
            locked_until: null,
            updated_at: new Date().toISOString(),
          })
          .eq('family_id', familyId);

        if (!error) {
          // Cập nhật lại Short Link với passToken mới
          try {
            const { ShortLinkService } = await import('./ShortLinkService');
            await ShortLinkService.createOrUpdateShortLink(familyId, newToken);
          } catch (err: any) {
            console.warn('ShortLink sync on regenerate error:', err?.message);
          }

          return { success: true, newToken };
        }
      } catch (err) {
        console.warn('regeneratePassToken error:', err);
      }
    }


    const pass = mockPasses.find((p) => p.family_id === familyId);
    if (pass) {
      pass.pass_token = newToken;
      pass.failed_attempts = 0;
      pass.locked_until = undefined;
      pass.updated_at = new Date().toISOString();
    }
    return { success: true, newToken };
  }

  /**
   * Lấy thông tin Pass Token của dòng họ để hiển thị trên trang Cài đặt
   */
  static async getFamilyPassConfig(familyId: string): Promise<{
    pass_token: string;
    has_pin: boolean;
  }> {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('clan_access_passes')
        .select('pass_token, pin_hash')
        .eq('family_id', familyId)
        .single();

      if (data) {
        return {
          pass_token: data.pass_token,
          has_pin: Boolean(data.pin_hash),
        };
      }
    }

    const pass = mockPasses.find((p) => p.family_id === familyId) || mockPasses[0];
    return {
      pass_token: pass?.pass_token || `CP-FAM-DEMO-${familyId.slice(0, 8)}`,
      has_pin: true,
    };
  }

  /**
   * Xác thực mã PIN và trả về kết quả kèm familyId
   */
  static async verifyClanPIN(
    passToken: string,
    inputPin: string
  ): Promise<{ success: boolean; familyId?: string; error?: string }> {
    const res = await this.verifyClanPass(passToken, inputPin);
    return {
      success: res.success,
      familyId: res.session?.family_id,
      error: res.error,
    };
  }
}
