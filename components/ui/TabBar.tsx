/**
 * TabBar Component
 * Reusable horizontal tab navigation with icons and values
 */

import React, { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  value: string | number;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  variant?: 'tabs' | 'stats'; // 'tabs' for clickable tabs, 'stats' for display-only
  size?: 'default' | 'compact'; // 'compact' for smaller padding and text
}

export function TabBar({ tabs, activeTabId, onTabChange, className = '', variant = 'tabs', size = 'default' }: TabBarProps) {
  const isStatsMode = variant === 'stats';
  const isCompact = size === 'compact';

  return (
    <div className={`flex flex-1 flex-col rounded-lg border border-black/8 bg-white overflow-hidden ${className}`}>
      {/* Tab Navigation */}
      <div className="relative overflow-x-hidden overflow-y-hidden [container-type:inline-size] before:pointer-events-none before:absolute before:inset-0 before:shadow-sm before:content-['']">
        <div className="flex flex-1 overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId;
            const isFirst = index === 0;
            const isLast = index === tabs.length - 1;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                disabled={isStatsMode}
                className={`
                  flex ${isCompact ? 'flex-row justify-between items-center p-3 min-w-32' : 'flex-col justify-start items-stretch gap-1 p-5 min-w-40'}
                  flex-1
                  ${isFirst ? 'border-r' : isLast ? 'border-l' : 'border-x'}
                  border-b
                  ${isFirst ? 'rounded-tl-lg' : ''}
                  ${isLast ? 'rounded-tr-lg' : ''}
                  ${isStatsMode
                    ? 'border-gray-200 bg-white cursor-default'
                    : `cursor-pointer transition-colors ${isActive
                      ? 'border-b-neutral-900 border-x-gray-200 bg-white'
                      : 'border-gray-200 bg-neutral-50 hover:bg-gray-100'
                    }`
                  }
                `}
              >
                {isCompact ? (
                  /* Compact single-line layout */
                  <>
                    {/* Label only (no icon) */}
                    <p className={`font-medium whitespace-nowrap text-sm ${
                      isStatsMode ? 'text-neutral-900' : (isActive ? 'text-neutral-900' : 'text-zinc-500')
                    }`}>
                      {tab.label}
                    </p>
                    {/* Value on the right */}
                    <p className="text-neutral-900 font-semibold text-sm">
                      {tab.value}
                    </p>
                  </>
                ) : (
                  /* Default two-line layout with icon */
                  <>
                    {/* Label with Icon */}
                    <div className={`flex justify-start items-center gap-2 ${
                      isStatsMode ? 'text-neutral-900' : (isActive ? 'text-neutral-900' : 'text-zinc-500')
                    }`}>
                      {tab.icon && (
                        <div className="h-4 w-4 min-w-4">
                          {tab.icon}
                        </div>
                      )}
                      <p className="text-sm font-medium leading-5 whitespace-nowrap">
                        {tab.label}
                      </p>
                    </div>

                    {/* Value */}
                    <p className="text-neutral-900 tracking-[-0.8px] text-left text-2xl font-medium leading-8">
                      {tab.value}
                    </p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TabBar;
