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
                  flex ${isCompact ? 'flex-row justify-between items-center p-2 sm:p-3 min-w-24 sm:min-w-32' : 'flex-col justify-start items-stretch gap-0.5 sm:gap-1 p-3 sm:p-4 md:p-5 min-w-20 sm:min-w-32 md:min-w-40'}
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
                    <p className={`font-medium text-xs sm:text-sm truncate ${
                      isStatsMode ? 'text-neutral-900' : (isActive ? 'text-neutral-900' : 'text-zinc-500')
                    }`}>
                      {tab.label}
                    </p>
                    {/* Value on the right */}
                    <p className="text-neutral-900 font-semibold text-xs sm:text-sm shrink-0">
                      {tab.value}
                    </p>
                  </>
                ) : (
                  /* Default two-line layout with icon */
                  <>
                    {/* Label with Icon */}
                    <div className={`flex justify-start items-center gap-1 sm:gap-2 ${
                      isStatsMode ? 'text-neutral-900' : (isActive ? 'text-neutral-900' : 'text-zinc-500')
                    }`}>
                      {tab.icon && (
                        <div className="h-3 w-3 sm:h-4 sm:w-4 min-w-3 sm:min-w-4 shrink-0">
                          {tab.icon}
                        </div>
                      )}
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium leading-tight truncate">
                        {tab.label}
                      </p>
                    </div>

                    {/* Value */}
                    <p className="text-neutral-900 tracking-[-0.4px] sm:tracking-[-0.6px] md:tracking-[-0.8px] text-left text-base sm:text-xl md:text-2xl font-medium leading-tight sm:leading-7 md:leading-8">
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
