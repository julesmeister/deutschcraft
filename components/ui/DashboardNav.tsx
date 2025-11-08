'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon?: string;
}

interface DashboardNavProps {
  items: NavItem[];
  /** Optional container max-width (default: 'xl') */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  /** Optional className for custom styling */
  className?: string;
}

export function DashboardNav({ items, maxWidth = 'xl', className = '' }: DashboardNavProps) {
  const pathname = usePathname();

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '4xl': 'max-w-[1400px]',
    '6xl': 'max-w-[1600px]',
    full: 'max-w-full',
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className={`container mx-auto px-6 ${maxWidthClasses[maxWidth]}`}>
        <nav className="flex gap-2 py-3">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all duration-300 ${
                  isActive
                    ? 'text-piku-purple-dark border-b-2 border-piku-purple-dark'
                    : 'text-gray-600 hover:text-piku-purple-dark'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
