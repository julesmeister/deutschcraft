/**
 * ScheduleViewToggle Component
 * Toggle between different schedule view types (Gantt, Day, Week, Month)
 */

'use client';

import { Calendar, CalendarDays, CalendarRange, GanttChart as GanttIcon } from 'lucide-react';

export type ScheduleViewType = 'gantt' | 'day' | 'week' | 'month';

interface ScheduleViewToggleProps {
  currentView: ScheduleViewType;
  onViewChange: (view: ScheduleViewType) => void;
  className?: string;
}

const viewOptions: Array<{
  value: ScheduleViewType;
  label: string;
  icon: typeof GanttIcon;
}> = [
  { value: 'gantt', label: 'Gantt', icon: GanttIcon },
  { value: 'day', label: 'Day', icon: Calendar },
  { value: 'week', label: 'Week', icon: CalendarDays },
  { value: 'month', label: 'Month', icon: CalendarRange },
];

export function ScheduleViewToggle({
  currentView,
  onViewChange,
  className = '',
}: ScheduleViewToggleProps) {
  return (
    <div className={`inline-flex items-center bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      {viewOptions.map((option, index) => {
        const Icon = option.icon;
        const isActive = currentView === option.value;
        const isFirst = index === 0;
        const isLast = index === viewOptions.length - 1;

        return (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors
              ${isActive ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
              ${isFirst ? 'rounded-l-lg' : ''}
              ${isLast ? 'rounded-r-lg' : ''}
              ${!isFirst ? 'border-l border-gray-300' : ''}
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
