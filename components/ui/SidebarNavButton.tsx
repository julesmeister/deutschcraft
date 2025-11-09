import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

export interface SidebarNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  href?: string;
  className?: string;
}

export function SidebarNavButton({
  children,
  icon,
  active = false,
  href,
  className = '',
  ...props
}: SidebarNavButtonProps) {
  const baseClasses =
    'cursor-pointer flex w-full items-center gap-y-2 gap-x-2 rounded-full border-solid px-3.5 py-2.5 font-semibold text-neutral-900 transition-all duration-150 ease-in-out';

  const stateClasses = active
    ? 'border border-blue-500'
    : 'border border-transparent hover:bg-neutral-100';

  const classes = `${baseClasses} ${stateClasses} ${className}`;

  const content = (
    <>
      {icon && (
        <span className="text-xl leading-snug">
          {icon}
        </span>
      )}
      <span>{children}</span>
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

// Icon wrapper component for consistent sizing
export interface NavIconProps {
  children: ReactNode;
  className?: string;
}

export function NavIcon({ children, className = '' }: NavIconProps) {
  return (
    <span className={`h-5 fill-none stroke-current ${className}`}>
      {children}
    </span>
  );
}
