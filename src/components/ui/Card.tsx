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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white border border-slate-200/80 rounded-xl shadow-card',
    elevated: 'bg-white border border-slate-100 rounded-xl shadow-heritage',
    bordered: 'bg-white border-2 border-slate-200 rounded-xl',
    heritage: 'bg-white border border-heritage-gold/30 rounded-xl shadow-sm relative overflow-hidden',
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
