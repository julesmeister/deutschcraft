'use client';

import { ReactNode } from 'react';

export interface ActivityItem {
  id: string;
  icon?: ReactNode;
  iconColor?: string;
  title: string;
  description?: string;
  timestamp?: string;
  tags?: {
    label: string;
    color?: string;
    icon?: ReactNode;
  }[];
  metadata?: ReactNode;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  showConnector?: boolean;
  className?: string;
}

export function ActivityTimeline({
  items,
  showConnector = true,
  className = '',
}: ActivityTimelineProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {items.map((item, index) => (
        <ActivityTimelineItem
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          showConnector={showConnector}
        />
      ))}
    </div>
  );
}

interface ActivityTimelineItemProps {
  item: ActivityItem;
  isLast: boolean;
  showConnector: boolean;
}

function ActivityTimelineItem({
  item,
  isLast,
  showConnector,
}: ActivityTimelineItemProps) {
  return (
    <div className={`flex ${isLast ? 'min-h-max' : 'min-h-[70px]'}`}>
      {/* Icon/Media column */}
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div className="my-1">
          {item.icon ? (
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${item.iconColor || 'bg-neutral-400'}`}>
              {item.icon}
            </div>
          ) : (
            <div className={`h-3 w-3 rounded-full ${item.iconColor || 'bg-neutral-400'}`} />
          )}
        </div>

        {/* Connector line */}
        {showConnector && !isLast && (
          <div className="flex-grow w-0.5 bg-neutral-200 h-full" />
        )}
      </div>

      {/* Content column */}
      <div className={`ml-4 w-full ${isLast ? 'pt-0.5' : 'pt-0.5 pb-6'}`}>
        {/* Title */}
        <h5 className="text-neutral-900 font-bold text-sm mb-1">
          {item.title}
        </h5>

        {/* Description */}
        {item.description && (
          <p className="text-neutral-500 text-sm mt-1">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.tags.map((tag, idx) => (
              <ActivityTag key={idx} {...tag} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        {item.timestamp && (
          <p className="text-neutral-400 text-xs mt-2">
            {item.timestamp}
          </p>
        )}

        {/* Custom metadata */}
        {item.metadata && (
          <div className="mt-2">
            {item.metadata}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityTagProps {
  label: string;
  color?: string;
  icon?: ReactNode;
}

function ActivityTag({ label, color, icon }: ActivityTagProps) {
  const colorClasses = {
    blue: 'bg-blue-200 text-blue-900 border-blue-200',
    green: 'bg-emerald-200 text-emerald-900 border-emerald-200',
    amber: 'bg-amber-200 text-amber-900 border-amber-200',
    red: 'bg-red-200 text-red-900 border-red-200',
    pink: 'bg-pink-200 text-pink-900 border-pink-200',
    purple: 'bg-purple-200 text-purple-900 border-purple-200',
    gray: 'bg-neutral-100 text-neutral-900 border-neutral-200',
  };

  const selectedColor = color && color in colorClasses
    ? colorClasses[color as keyof typeof colorClasses]
    : colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-lg whitespace-nowrap ${selectedColor}`}
    >
      {icon && (
        <span className="h-2 w-2 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}

// Export Tag component separately for use outside timeline
export { ActivityTag };
