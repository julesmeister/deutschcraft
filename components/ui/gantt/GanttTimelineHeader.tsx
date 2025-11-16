'use client';

import { formatDate, getMonthLabel } from './utils';

interface GanttTimelineHeaderProps {
  days: Date[];
  dayWidth: number;
  totalWidth: number;
}

export function GanttTimelineHeader({ days, dayWidth, totalWidth }: GanttTimelineHeaderProps) {
  return (
    <svg
      width={totalWidth}
      height={50}
      className="border-b border-gray-200"
    >
      <rect x="0" y="0" width={totalWidth} height="50" className="fill-slate-100" />
      {days.map((day, index) => {
        const x = index * dayWidth;
        const isFirstOfMonth = day.getDate() === 1;
        return (
          <g key={day.toISOString()}>
            {isFirstOfMonth && (
              <>
                <line x1={x} y1="0" x2={x} y2="25" className="stroke-gray-200" strokeWidth="1" />
                <text
                  y="22.5"
                  x={x + (dayWidth / 2)}
                  className="fill-gray-400 text-[10px] font-bold"
                  textAnchor="middle"
                >
                  {getMonthLabel(day)}
                </text>
              </>
            )}
            <text
              y="40"
              x={x + (dayWidth / 2)}
              className="fill-gray-500 text-sm font-semibold"
              textAnchor="middle"
            >
              {formatDate(day)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
