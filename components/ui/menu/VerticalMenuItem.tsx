'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MenuItem } from '../VerticalMenu';
import { MenuItemContent } from './MenuItemContent';
import { getMenuItemClasses, getSubmenuItemClasses } from './menuClasses';

interface VerticalMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onItemClick?: (value: string) => void;
}

export function VerticalMenuItem({
  item,
  isActive,
  onItemClick,
}: VerticalMenuItemProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const handleClick = () => {
    if (hasSubmenu) {
      setIsSubmenuOpen(!isSubmenuOpen);
    } else {
      onItemClick?.(item.value);
      item.onClick?.();
    }
  };

  const baseClasses = getMenuItemClasses(isActive, false);

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
      <Link href={item.href} className={baseClasses} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${baseClasses} w-full text-left cursor-pointer`}
        onClick={handleClick}
      >
        {content}
      </button>

      {hasSubmenu && isSubmenuOpen && (
        <div className="bg-gray-50 border-t border-gray-200">
          {item.submenu!.map((subitem) => (
            <button
              key={subitem.value}
              type="button"
              className={getSubmenuItemClasses()}
              onClick={() => {
                onItemClick?.(subitem.value);
                subitem.onClick?.();
              }}
            >
              <MenuItemContent
                icon={subitem.icon}
                label={subitem.label}
                badge={subitem.badge}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
