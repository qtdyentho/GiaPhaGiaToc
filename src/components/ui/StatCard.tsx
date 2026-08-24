import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'heritage' | 'green' | 'gold';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className = '',
}) => {
  const iconBgClasses = {
    default: 'bg-slate-100 text-slate-700',
    heritage: 'bg-emerald-50 text-heritage-green',
    green: 'bg-emerald-50 text-heritage-green',
    gold: 'bg-amber-50 text-heritage-gold',
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className={trend.isPositive ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-400">so với kỳ trước</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${iconBgClasses[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
