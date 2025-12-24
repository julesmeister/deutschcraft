'use client';

import { ReactNode, useState } from 'react';

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
  itemsPerPage?: number;
  showPagination?: boolean;
}

export function ActivityTimeline({
  items,
  showConnector = true,
  className = '',
  itemsPerPage = 10,
  showPagination = true,
}: ActivityTimelineProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = showPagination ? items.slice(startIndex, endIndex) : items;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {currentItems.map((item, index) => (
          <ActivityTimelineItem
            key={item.id}
            item={item}
            isLast={index === currentItems.length - 1}
            showConnector={showConnector}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}–{Math.min(endIndex, items.length)} of {items.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg border transition
                         border-gray-300 text-gray-700
                         hover:bg-gray-50 hover:border-gray-400
                         disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                  currentPage === page
                    ? 'bg-piku-purple text-white border border-piku-purple'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg border transition
                         border-gray-300 text-gray-700
                         hover:bg-gray-50 hover:border-gray-400
                         disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}
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
      <div className={`ml-4 w-full text-left ${isLast ? 'pt-0.5' : 'pt-0.5 pb-6'}`}>
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
