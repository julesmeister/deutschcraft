'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';

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

    const baseClasses = `
      relative flex items-center px-4 py-3.5 text-sm
      text-gray-900 transition-colors duration-100
      border-t border-gray-200 first:border-t-0
      hover:bg-gray-50 hover:text-gray-950
      active:bg-gray-50 active:text-gray-950
      ${isActive ? 'bg-gray-100 font-medium' : ''}
      ${isSubmenuItem ? 'text-base px-5 py-3' : ''}
    `;

    const content = (
      <>
        {item.icon && <span className="mr-2">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="ml-2 text-xs text-gray-600">({item.badge})</span>
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

    if (item.href && !hasSubmenu) {
      return (
        <Link
          key={item.value}
          href={item.href}
          className={baseClasses}
          onClick={() => handleItemClick(item)}
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
          onClick={() => handleItemClick(item)}
        >
          {content}
        </button>

        {/* Submenu */}
        {hasSubmenu && isSubmenuOpen && (
          <div className="relative">
            {/* Arrow indicator */}
            <div className="absolute left-full top-3.5 w-2 h-2 bg-white border-t border-l border-gray-200 transform -translate-x-1 rotate-45 z-10" />

            {/* Submenu container */}
            <div className="ml-0 border-l border-gray-200">
              {item.submenu!.map((subitem) => renderItem(subitem, true))}
            </div>
          </div>
        )}
      </div>
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

// Helper component for rendering individual items
function VerticalMenuItem({
  item,
  isActive,
  onItemClick,
}: {
  item: MenuItem;
  isActive: boolean;
  onItemClick?: (value: string) => void;
}) {
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

  const baseClasses = `
    relative flex items-center px-4 py-3.5 text-sm
    text-gray-900 transition-colors duration-100
    border-t border-gray-200 first:border-t-0
    hover:bg-gray-50 hover:text-gray-950
    active:bg-gray-50 active:text-gray-950
    ${isActive ? 'bg-gray-100 font-medium' : ''}
  `;

  const content = (
    <>
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="ml-2 text-xs text-gray-600">({item.badge})</span>
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
              className={`
                w-full text-left flex items-center px-5 py-3 text-base
                text-gray-900 transition-colors duration-100
                border-t border-gray-200 first:border-t-0
                hover:bg-gray-100 hover:text-gray-950
              `}
              onClick={() => {
                onItemClick?.(subitem.value);
                subitem.onClick?.();
              }}
            >
              {subitem.icon && <span className="mr-2">{subitem.icon}</span>}
              <span className="flex-1">{subitem.label}</span>
              {subitem.badge && (
                <span className="ml-2 text-xs text-gray-600">
                  ({subitem.badge})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
