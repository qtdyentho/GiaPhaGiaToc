export interface VietQRConfig {
  bankId: string; // e.g. 'MB', 'ICB', 'VCB', 'TCB'
  bankName: string;
  accountNo: string;
  accountName: string;
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export interface VietQRPayload {
  amount: number;
  memo: string;
  config?: Partial<VietQRConfig>;
}

export const DEFAULT_VIETQR_CONFIG: VietQRConfig = {
  bankId: 'MB',
  bankName: 'MBBank (Ngân Hàng Quân Đội)',
  accountNo: '888899992026',
  accountName: 'HO DONG NGUYEN VAN',
  template: 'compact2',
};

export class VietQRService {
  /**
   * Tạo URL hình ảnh mã QR VietQR chuẩn NAPAS 247
   */
  static generateQRUrl(payload: VietQRPayload): string {
    const config = { ...DEFAULT_VIETQR_CONFIG, ...(payload.config || {}) };
    const cleanMemo = encodeURIComponent(payload.memo.replace(/[^a-zA-Z0-9\s-]/g, '').trim());
    const cleanAccountName = encodeURIComponent(config.accountName.toUpperCase());

    return `https://img.vietqr.io/image/${config.bankId}-${config.accountNo}-${config.template || 'compact2'}.png?amount=${payload.amount}&addInfo=${cleanMemo}&accountName=${cleanAccountName}`;
  }

  /**
   * Sinh mã nội dung chuyển khoản chuẩn cho từng loại nghiệp vụ
   */
  static generateMemo(type: 'ASSESSMENT' | 'INVOICE' | 'CONTRIBUTION', code: string, memberName?: string): string {
    const prefix = type === 'ASSESSMENT' ? 'THU' : type === 'INVOICE' ? 'INV' : 'CTB';
    const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '');
    const cleanName = memberName ? memberName.split(' ').pop()?.toUpperCase() || '' : '';
    return `${prefix} ${cleanCode} ${cleanName}`.trim();
  }
}
