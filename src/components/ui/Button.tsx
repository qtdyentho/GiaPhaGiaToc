import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-component-sm py-1 text-xs gap-1.5',
    md: 'px-component-md py-2 text-sm gap-2',
    lg: 'px-component-lg py-3 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-heritage-green hover:bg-heritage-green-hover text-white shadow-xs focus:ring-heritage-green',
    secondary: 'bg-heritage-surface dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-heritage-border dark:border-slate-700 shadow-xs focus:ring-slate-300',
    gold: 'bg-heritage-gold hover:bg-heritage-gold-hover text-white shadow-xs focus:ring-heritage-gold',
    outline: 'bg-transparent border border-heritage-green dark:border-emerald-500 text-heritage-green dark:text-emerald-400 hover:bg-heritage-green/10 focus:ring-heritage-green',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300',
    danger: 'bg-heritage-danger hover:opacity-90 text-white shadow-xs focus:ring-heritage-danger',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
