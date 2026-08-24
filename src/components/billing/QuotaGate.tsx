import React from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuotaLevel } from '../../services/billing/UsageService';

interface QuotaGateProps {
  currentUsage: number;
  limitValue: number | null;
  unit?: string;
  level: QuotaLevel;
  featureName: string;
}

export const QuotaGate: React.FC<QuotaGateProps> = ({
  currentUsage,
  limitValue,
  unit = 'mục',
  level,
  featureName,
}) => {
  if (level === 'NORMAL' || limitValue === null) {
    return null;
  }

  const isBlocked = level === 'LIMIT_REACHED';

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isBlocked
          ? 'bg-rose-50 border-rose-300 text-rose-900'
          : level === 'NEAR_LIMIT'
          ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-yellow-50 border-yellow-200 text-yellow-900'
      }`}
    >
      <div className="flex items-center space-x-2.5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <div>
          <span className="font-bold">
            {isBlocked ? 'Đã đạt hạn mức tối đa' : 'Cảnh báo hạn mức'}:{' '}
          </span>
          <span>
            {featureName} đang dùng {currentUsage}/{limitValue} {unit} (
            {Math.round((currentUsage / limitValue) * 100)}%).
          </span>
        </div>
      </div>

      <Link
        to="/pricing"
        className="inline-flex items-center space-x-1 font-bold underline hover:opacity-80 shrink-0"
      >
        <span>Nâng cấp hạn mức</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
