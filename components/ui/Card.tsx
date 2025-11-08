import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backdrop?: boolean;
  gradient?: string;
}

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  rounded = '2xl',
  shadow = 'none',
  backdrop = false,
  gradient,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const baseClasses = [
    paddingClasses[padding],
    roundedClasses[rounded],
    shadowClasses[shadow],
    backdrop ? 'bg-white/95 backdrop-blur-sm' : 'bg-white',
    hover ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]' : '',
    gradient || '',
    className,
  ].filter(Boolean).join(' ');

  return <div className={baseClasses}>{children}</div>;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CardTitle({ children, className = '', size = 'lg' }: CardTitleProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <h3 className={`font-black text-gray-900 ${sizeClasses[size]} ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
}
