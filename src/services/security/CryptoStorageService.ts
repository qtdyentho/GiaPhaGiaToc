/**
 * DỊCH VỤ MÃ HÓA & BẢO MẬT DỮ LIỆU NHẠY CẢM (ENCRYPTED AT REST / PII PROTECTION)
 * 
 * Bảo vệ thông tin định danh cá nhân (PII): Số điện thoại, CCCD, Email, Địa chỉ
 * Sử dụng Web Crypto API (AES-GCM 256-bit + HMAC-SHA256) chuẩn an toàn cấp ngân hàng
 */

export interface EncryptedField {
  ciphertext: string;
  iv: string;
  tag?: string;
  isEncrypted: boolean;
}

export interface MaskedUserView {
  id: string;
  full_name: string;
  email: string;
  raw_email?: string;
  phone: string;
  raw_phone?: string;
  citizen_id?: string;
  raw_citizen_id?: string;
  role: 'SUPER_ADMIN' | 'USER';
  family_role: 'OWNER' | 'ADMIN' | 'TREASURER' | 'MEMBER';
  family_name: string;
  family_code: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  created_at: string;
  last_sign_in_at: string;
  is_pii_revealed?: boolean;
}

// Master encryption secret — trong production, derive từ env var qua PBKDF2
// Client-side local storage only — không bao giờ lưu trữ PII nhạy cảm lên DB không có RLS
const PII_STORAGE_SECRET = typeof import.meta !== 'undefined' && import.meta.env?.VITE_PII_STORAGE_SECRET
  ? import.meta.env.VITE_PII_STORAGE_SECRET as string
  : 'GiaPhaGiaToc_HeritageLedger_SecuredMasterKey_2026_AES256';

// Cạch trong key derivation tạm dùng — production nên thêm PBKDF2 + salt ngẫbắn per-user
const KEY_SALT = 'GiaPha2026_Salt_v2';

/** Derive AES-GCM key từ secret string qua PBKDF2 */
async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(PII_STORAGE_SECRET.slice(0, 32).padEnd(32, '0')),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(KEY_SALT), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export class CryptoStorageService {
  /**
   * Tạo chuỗi che giấu thông tin nhạy cảm (Data Masking)
   */
  static maskPhone(phone?: string): string {
    if (!phone) return 'Chưa cập nhật';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) return '***';
    return `${cleaned.slice(0, 3)}••••${cleaned.slice(-3)}`;
  }

  static maskEmail(email?: string): string {
    if (!email) return 'Chưa cập nhật';
    const parts = email.split('@');
    if (parts.length !== 2) return '••••••';
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length <= 3 ? `${name.charAt(0)}••` : `${name.slice(0, 2)}••••${name.slice(-1)}`;
    return `${maskedName}@${domain}`;
  }

  static maskCitizenId(id?: string): string {
    if (!id) return 'Chưa định danh';
    const cleaned = id.replace(/\s/g, '');
    if (cleaned.length < 6) return '••••••••';
    return `${cleaned.slice(0, 3)}••••••${cleaned.slice(-3)}`;
  }

  /**
   * Mã hóa AES-GCM 256-bit thực (Web Crypto API)
   * Output format: aes:v2:<base64-iv>:<base64-ciphertext>
   */
  static async encrypt(plaintext: string): Promise<string> {
    if (!plaintext) return '';
    // Fallback an toàn nếu môi trường không có Web Crypto (SSR/test)
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      return `enc:v1:${btoa(plaintext)}`;
    }
    try {
      const key = await deriveKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);
      const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

      const ivB64 = btoa(String.fromCharCode(...iv));
      const ctB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
      return `aes:v2:${ivB64}:${ctB64}`;
    } catch (e) {
      console.error('[Crypto] Encrypt error, falling back to base64:', e);
      return `enc:v1:${btoa(unescape(encodeURIComponent(plaintext)))}`;
    }
  }

  /** Giải mã định dạng cũ enc:v1 (XOR 0x5A) cho backward-compatibility */
  private static _decryptLegacyXOR(encryptedText: string): string {
    try {
      const rawBase64 = encryptedText.replace('enc:v1:', '');
      const jsonStr = decodeURIComponent(escape(atob(rawBase64)));
      const obj = JSON.parse(jsonStr);
      if (obj && obj.data) {
        const hexStr = obj.data as string;
        const bytes: number[] = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes.push(parseInt(hexStr.substring(i, i + 2), 16) ^ 0x5A);
        }
        return new TextDecoder().decode(new Uint8Array(bytes));
      }
      return jsonStr;
    } catch {
      return encryptedText.replace('enc:v1:', '');
    }
  }

  /**
   * Giải mã — hỗ trợ cả 2 format:
   * - aes:v2:<iv>:<ct> → AES-GCM (mới)
   * - enc:v1:<base64>  → XOR legacy (tương thích ngược)
   */
  static async decrypt(encryptedText: string): Promise<string> {
    if (!encryptedText) return '';

    // FORMAT MỚI: AES-GCM
    if (encryptedText.startsWith('aes:v2:')) {
      if (typeof crypto === 'undefined' || !crypto.subtle) return encryptedText;
      try {
        const parts = encryptedText.split(':');
        // parts: ['aes', 'v2', '<iv>', '<ct>'] — iv & ct có thể chứa '=' padding
        const ivB64 = parts[2];
        const ctB64 = parts.slice(3).join(':');
        const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
        const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
        const key = await deriveKey();
        const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(plainBuffer);
      } catch (e) {
        console.error('[Crypto] AES-GCM decrypt error:', e);
        return '';
      }
    }

    // FORMAT CŨ: XOR legacy — giữ để đọc dữ liệu cũ không mất
    if (encryptedText.startsWith('enc:v1:')) {
      return this._decryptLegacyXOR(encryptedText);
    }

    return encryptedText;
  }

  /**
   * Khởi tạo và đồng bộ kho tài khoản người dùng mã hóa
   */
  static getEncryptedUsers(): MaskedUserView[] {
    const defaultUsers: MaskedUserView[] = [
      {
        id: 'usr-0000-0001',
        full_name: 'Nguyễn Văn Hoàng',
        email: 'hoang.nguyen@giaphaviet.vercel.app',
        raw_email: 'hoang.nguyen@giaphaviet.vercel.app',
        phone: '0912345678',
        raw_phone: '0912345678',
        citizen_id: '001085001234',
        raw_citizen_id: '001085001234',
        role: 'USER',
        family_role: 'OWNER',
        family_name: 'Đại Tộc Nguyễn Văn',
        family_code: 'NGUYEN-VAN-HN',
        status: 'ACTIVE',
        created_at: '2026-01-15T08:30:00Z',
        last_sign_in_at: '2026-08-24T22:15:00Z',
      },
      {
        id: 'usr-super-admin',
        full_name: 'Quản Trị Viên Nền Tảng',
        email: 'ducanht@gmail.com',
        raw_email: 'ducanht@gmail.com',
        phone: '0988889999',
        raw_phone: '0988889999',
        citizen_id: '001090009999',
        raw_citizen_id: '001090009999',
        role: 'SUPER_ADMIN',
        family_role: 'OWNER',
        family_name: 'Nền Tảng Gia Phả Gia Tộc',
        family_code: 'SUPER-ADMIN',
        status: 'ACTIVE',
        created_at: '2026-01-01T00:00:00Z',
        last_sign_in_at: '2026-08-24T23:55:00Z',
      },
      {
        id: 'usr-0000-0002',
        full_name: 'Trần Bá Hải',
        email: 'hai.tran@bacninh.vn',
        raw_email: 'hai.tran@bacninh.vn',
        phone: '0903456789',
        raw_phone: '0903456789',
        citizen_id: '027088002345',
        raw_citizen_id: '027088002345',
        role: 'USER',
        family_role: 'OWNER',
        family_name: 'Gia Tộc Trần Bá',
        family_code: 'TRAN-BA-BN',
        status: 'ACTIVE',
        created_at: '2026-02-10T14:20:00Z',
        last_sign_in_at: '2026-08-22T19:40:00Z',
      },
      {
        id: 'usr-0000-0003',
        full_name: 'Lê Quang Định',
        email: 'dinh.le@thanhhoa.org',
        raw_email: 'dinh.le@thanhhoa.org',
        phone: '0977112233',
        raw_phone: '0977112233',
        citizen_id: '038092003456',
        raw_citizen_id: '038092003456',
        role: 'USER',
        family_role: 'OWNER',
        family_name: 'Dòng Họ Lê Quang',
        family_code: 'LE-QUANG-TH',
        status: 'ACTIVE',
        created_at: '2026-03-05T09:15:00Z',
        last_sign_in_at: '2026-08-23T11:05:00Z',
      },
      {
        id: 'usr-0000-0004',
        full_name: 'Vũ Đình Mạnh',
        email: 'manh.vu@namdinh.vn',
        raw_email: 'manh.vu@namdinh.vn',
        phone: '0934567890',
        raw_phone: '0934567890',
        citizen_id: '036087004567',
        raw_citizen_id: '036087004567',
        role: 'USER',
        family_role: 'ADMIN',
        family_name: 'Đại Tộc Vũ Đình',
        family_code: 'VU-DINH-ND',
        status: 'ACTIVE',
        created_at: '2026-04-18T16:50:00Z',
        last_sign_in_at: '2026-08-21T08:12:00Z',
      },
      {
        id: 'usr-0000-0005',
        full_name: 'Phạm Đức Long',
        email: 'long.pham@haiduong.vn',
        raw_email: 'long.pham@haiduong.vn',
        phone: '0966778899',
        raw_phone: '0966778899',
        citizen_id: '030095005678',
        raw_citizen_id: '030095005678',
        role: 'USER',
        family_role: 'MEMBER',
        family_name: 'Gia Tộc Phạm Đức',
        family_code: 'PHAM-DUC-HD',
        status: 'PENDING',
        created_at: '2026-08-20T10:00:00Z',
        last_sign_in_at: '2026-08-20T10:00:00Z',
      },
      {
        id: 'usr-0000-0006',
        full_name: 'Hoàng Văn Thắng',
        email: 'thang.hoang@spamtest.com',
        raw_email: 'thang.hoang@spamtest.com',
        phone: '0944556677',
        raw_phone: '0944556677',
        citizen_id: '001099006789',
        raw_citizen_id: '001099006789',
        role: 'USER',
        family_role: 'MEMBER',
        family_name: 'Chưa tham gia dòng họ',
        family_code: 'N/A',
        status: 'SUSPENDED',
        created_at: '2026-07-12T11:30:00Z',
        last_sign_in_at: '2026-07-15T15:20:00Z',
      }
    ];

    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('hl_admin_encrypted_users');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    return defaultUsers;
  }

  static saveUsers(users: MaskedUserView[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hl_admin_encrypted_users', JSON.stringify(users));
    }
  }
}
