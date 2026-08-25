import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'heritage';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-component-sm',
    md: 'p-component-md',
    lg: 'p-component-lg',
  };

  const variantClasses = {
    default: 'bg-heritage-surface dark:bg-slate-900 border border-heritage-border dark:border-slate-800 rounded-2xl shadow-card transition-colors duration-200',
    elevated: 'bg-heritage-surface dark:bg-slate-900 border border-heritage-border/60 dark:border-slate-800 rounded-2xl shadow-heritage transition-colors duration-200',
    bordered: 'bg-heritage-surface dark:bg-slate-900 border-2 border-heritage-border dark:border-slate-700 rounded-2xl transition-colors duration-200',
    heritage: 'bg-heritage-surface dark:bg-slate-900 border border-heritage-gold/30 dark:border-amber-500/30 rounded-2xl shadow-xs relative overflow-hidden transition-colors duration-200',
  };

  return (
    <div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {variant === 'heritage' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-heritage-green via-heritage-gold to-heritage-navy" />
      )}
      {children}
    </div>
  );
};
