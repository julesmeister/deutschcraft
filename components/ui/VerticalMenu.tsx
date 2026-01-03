'use client';

import { useState, ReactNode } from 'react';
import { MenuItemRenderer } from './menu/MenuItemRenderer';
import { VerticalMenuItem } from './menu/VerticalMenuItem';

export interface MenuItem {
  label: string;
  value: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  submenu?: MenuItem[];
  onClick?: () => void;
}

interface VerticalMenuProps {
  /** Menu items */
  items: MenuItem[];
  /** Currently active/selected item */
  activeValue?: string;
  /** Callback when item is clicked */
  onItemClick?: (value: string) => void;
  /** Custom width */
  width?: string;
  /** Custom className */
  className?: string;
}

export function VerticalMenu({
  items,
  activeValue,
  onItemClick,
  width = 'w-52',
  className = '',
}: VerticalMenuProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (value: string) => {
    const newSet = new Set(openSubmenus);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setOpenSubmenus(newSet);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.submenu) {
      toggleSubmenu(item.value);
    } else {
      onItemClick?.(item.value);
      item.onClick?.();
    }
  };

  const renderItem = (item: MenuItem, isSubmenuItem = false) => {
    const isActive = activeValue === item.value;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = openSubmenus.has(item.value);

    return (
      <MenuItemRenderer
        item={item}
        isActive={isActive}
        isSubmenuItem={isSubmenuItem}
        isSubmenuOpen={isSubmenuOpen}
        onItemClick={handleItemClick}
      >
        {hasSubmenu && isSubmenuOpen && (
          <div className="relative">
            <div className="absolute left-full top-3.5 w-2 h-2 bg-white border-t border-l border-gray-200 transform -translate-x-1 rotate-45 z-10" />
            <div className="ml-0 border-l border-gray-200">
              {item.submenu!.map((subitem) => renderItem(subitem, true))}
            </div>
          </div>
        )}
      </MenuItemRenderer>
    );
  };

  return (
    <div
      className={`
        ${width} bg-white rounded border border-gray-200
        shadow-sm overflow-hidden flex flex-col
        ${className}
      `}
    >
      {items.map((item) => renderItem(item))}
    </div>
  );
}

/**
 * Compact variant - for dropdowns/popovers
 */
export function VerticalMenuCompact({
  items,
  activeValue,
  onItemClick,
  className = '',
}: Omit<VerticalMenuProps, 'width'>) {
  return (
    <VerticalMenu
      items={items}
      activeValue={activeValue}
      onItemClick={onItemClick}
      width="min-w-[12rem]"
      className={className}
    />
  );
}

/**
 * Divider component for menu sections
 */
export function MenuDivider() {
  return <div className="border-t border-gray-200 my-2" />;
}

/**
 * Menu with dividers between groups
 */
interface MenuGroup {
  items: MenuItem[];
}

interface VerticalMenuWithGroupsProps extends Omit<VerticalMenuProps, 'items'> {
  groups: MenuGroup[];
}

export function VerticalMenuWithGroups({
  groups,
  activeValue,
  onItemClick,
  width = 'w-52',
  className = '',
}: VerticalMenuWithGroupsProps) {
  const allItems: (MenuItem | 'divider')[] = [];

  groups.forEach((group, idx) => {
    if (idx > 0) {
      allItems.push('divider');
    }
    allItems.push(...group.items);
  });

  return (
    <div
      className={`
        ${width} bg-white rounded border border-gray-200
        shadow-sm overflow-hidden flex flex-col
        ${className}
      `}
    >
      {allItems.map((item, idx) => {
        if (item === 'divider') {
          return <MenuDivider key={`divider-${idx}`} />;
        }
        return (
          <VerticalMenuItem
            key={item.value}
            item={item}
            isActive={activeValue === item.value}
            onItemClick={onItemClick}
          />
        );
      })}
    </div>
  );
}

