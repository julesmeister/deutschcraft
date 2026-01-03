'use client';

import Link from 'next/link';
import { MenuItem } from '../VerticalMenu';
import { MenuItemContent } from './MenuItemContent';
import { getMenuItemClasses } from './menuClasses';

interface MenuItemRendererProps {
  item: MenuItem;
  isActive: boolean;
  isSubmenuItem?: boolean;
  isSubmenuOpen: boolean;
  onItemClick: (item: MenuItem) => void;
  children?: React.ReactNode;
}

export function MenuItemRenderer({
  item,
  isActive,
  isSubmenuItem = false,
  isSubmenuOpen,
  onItemClick,
  children,
}: MenuItemRendererProps) {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const baseClasses = getMenuItemClasses(isActive, isSubmenuItem);

  const content = (
    <MenuItemContent
      icon={item.icon}
      label={item.label}
      badge={item.badge}
      hasSubmenu={hasSubmenu}
      isSubmenuOpen={isSubmenuOpen}
    />
  );

  if (item.href && !hasSubmenu) {
    return (
      <Link
        key={item.value}
        href={item.href}
        className={baseClasses}
        onClick={() => onItemClick(item)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div key={item.value}>
      <button
        type="button"
        className={`${baseClasses} w-full text-left cursor-pointer`}
        onClick={() => onItemClick(item)}
      >
        {content}
      </button>
      {children}
    </div>
  );
}
