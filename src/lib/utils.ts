import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng tiền tệ chuẩn VNĐ (VD: 500.000 ₫)
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0 ₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num).replace('VND', '₫').trim();
}

/**
 * Định dạng ngày Dương lịch (DD/MM/YYYY)
 */
export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '--/--/----';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày Âm lịch (VD: 15/07 Âm lịch)
 */
export function formatLunarDate(day?: number, month?: number, year?: number, isLeap?: boolean): string {
  if (!day || !month) return 'Chưa rõ';
  const leapText = isLeap ? ' (Nhuận)' : '';
  const yearText = year ? ` năm ${year}` : '';
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}${leapText} Âm lịch${yearText}`;
}

/**
 * Tạo mã giao dịch / mã hóa đơn ngẫu nhiên
 */
export function generateCode(prefix: string): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${datePart}-${randomPart}`;
}
