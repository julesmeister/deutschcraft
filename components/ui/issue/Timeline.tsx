'use client';

import { ReactNode } from 'react';

export interface TimelineItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
    color?: string;
  };
  time: string;
  icon?: ReactNode;
  action: ReactNode;
  content?: ReactNode;
  isLast?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <ul className={`flex flex-col ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li
            key={item.id}
            className={`flex ${isLast ? 'min-h-max' : 'min-h-[70px]'}`}
          >
            <div className="flex flex-1">
              {/* Media Column */}
              <div className="flex flex-col items-center">
                <div className="my-1">
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-[35px] h-[35px] rounded-full object-cover"
                    />
                  ) : item.icon ? (
                    <div className="w-[35px] h-[35px] min-w-[35px] rounded-full bg-gray-100 text-gray-900 flex items-center justify-center">
                      <span className="text-[17.5px]">{item.icon}</span>
                    </div>
                  ) : (
                    <div
                      className={`w-[35px] h-[35px] min-w-[35px] rounded-full flex items-center justify-center ${
                        item.user.color || 'bg-blue-200'
                      }`}
                    >
                      <span className="text-gray-900 font-bold text-xs">
                        {item.user.initials}
                      </span>
                    </div>
                  )}
                </div>
                {!isLast && (
                  <div className="bg-gray-200 w-[2px] flex-grow h-full"></div>
                )}
              </div>

              {/* Content Column */}
              <div
                className={`ml-4 w-full pt-[2px] ${
                  isLast ? 'pb-0' : 'pb-6'
                }`}
              >
                <div className="mt-1">
                  <div className="flex flex-col gap-y-0.5">
                    <span className="font-bold text-gray-900">
                      {item.user.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {item.time}
                    </span>
                  </div>
                  <div className="mt-2">{item.action}</div>
                  {item.content && (
                    <div className="mt-4 bg-gray-100 border border-gray-200 rounded-lg p-5">
                      {item.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
