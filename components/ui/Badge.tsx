import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'cyan' | 'green' | 'yellow' | 'pink' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  rounded = 'full',
  className = '',
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-900 border border-gray-300',
    purple: 'bg-piku-purple-light text-piku-purple-dark',
    cyan: 'bg-piku-cyan/10 text-piku-cyan-accent',
    green: 'bg-piku-mint/20 text-piku-green',
    yellow: 'bg-piku-yellow-light/30 text-yellow-900',
    pink: 'bg-piku-pink/20 text-piku-magenta',
    outline: 'bg-transparent border-2 border-piku-purple-dark text-piku-purple-dark',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base',
  };

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const classes = [
    'inline-block font-bold uppercase tracking-wide',
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    className,
  ].join(' ');

  return <span className={classes}>{children}</span>;
}

// Specialized badge for hero section
interface HeroBadgeProps {
  children: ReactNode;
  className?: string;
}

export function HeroBadge({ children, className = '' }: HeroBadgeProps) {
  return (
    <div className={`inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white ${className}`}>
      {children}
    </div>
  );
}
