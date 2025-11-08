'use client';

import { ReactNode } from 'react';

export interface SettingsMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface SettingsSidebarProps {
  items: SettingsMenuItem[];
  className?: string;
}

export function SettingsSidebar({ items, className = '' }: SettingsSidebarProps) {
  return (
    <div className={`w-[200px] xl:w-[280px] hidden lg:block ${className}`}>
      <div className="flex flex-col justify-between h-full">
        <div className="h-full overflow-y-auto">
          <nav className="mx-2 mb-10">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={item.onClick}
                className={`flex items-center gap-2 mb-2 px-3 h-[48px] rounded-lg cursor-pointer font-semibold transition-colors duration-150 ${
                  item.active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
