import { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'purple' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | 'full';
  withIcon?: boolean;
  icon?: ReactNode;
  href?: string;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'xl',
  withIcon = false,
  icon,
  href,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-bold transition-all duration-300 inline-flex items-center justify-center hover:scale-105 active:scale-95';

  const variantClasses = {
    primary: 'bg-piku-purple-dark text-white hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-piku-purple-dark text-piku-purple-dark hover:bg-piku-purple-dark hover:text-white',
    ghost: 'text-gray-700 hover:bg-gray-100',
    gradient: 'bg-gradient-to-r from-piku-purple-dark to-piku-cyan text-white hover:shadow-xl',
    purple: 'bg-gradient-to-br from-piku-purple-light to-piku-purple-dark text-white hover:shadow-lg',
    cyan: 'bg-gradient-to-br from-piku-cyan to-piku-blue text-white hover:shadow-lg',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    className,
  ].join(' ');

  const content = (
    <>
      {children}
      {withIcon && icon && <span className="ml-2">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}

// Theme button with icon (like navbar "Start Learning" button)
interface ThemeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'dark' | 'light';
  href?: string;
  className?: string;
}

export function ThemeButton({
  children,
  variant = 'dark',
  href,
  className = '',
  ...props
}: ThemeButtonProps) {
  const bgColor = variant === 'dark' ? 'bg-piku-purple-dark' : 'bg-white';
  const textColor = variant === 'dark' ? 'text-white' : 'text-piku-purple-dark';
  const iconBgColor = variant === 'dark' ? 'bg-white' : 'bg-piku-purple-dark';
  const iconTextColor = variant === 'dark' ? 'text-piku-purple-dark' : 'text-white';

  const classes = `theme-btn group inline-flex items-center ${bgColor} ${textColor} font-black text-[14px] py-1.5 pl-5 pr-1.5 rounded-full ${className}`;

  const content = (
    <>
      <span className="btn-text relative z-10 transition-colors duration-300">{children}</span>
      <span className={`btn-icon relative z-10 ml-4 w-9 h-9 flex items-center justify-center ${iconBgColor} ${iconTextColor} rounded-full transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
