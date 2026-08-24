import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'gold' | 'navy';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  const variantClasses = {
    success: 'bg-emerald-50 text-heritage-green border border-emerald-200/60',
    danger: 'bg-red-50 text-red-700 border border-red-200/60',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    gold: 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold',
    navy: 'bg-slate-800 text-white font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
