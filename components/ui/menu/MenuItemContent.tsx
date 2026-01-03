import { ReactNode } from 'react';

interface MenuItemContentProps {
  icon?: ReactNode;
  label: string;
  badge?: string | number;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
}

export function MenuItemContent({
  icon,
  label,
  badge,
  hasSubmenu,
  isSubmenuOpen,
}: MenuItemContentProps) {
  return (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="ml-2 text-xs text-gray-600">({badge})</span>
      )}
      {hasSubmenu && (
        <svg
          className={`w-3 h-3 ml-3 transition-transform duration-200 ${
            isSubmenuOpen ? 'rotate-90' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </>
  );
}
