import { ReactNode } from 'react';
import { SlimTableColumn, SlimTableRow } from '../SlimTable';

interface MobileRowProps {
  row: SlimTableRow;
  columns: SlimTableColumn[];
  index: number;
  onRowClick?: (row: SlimTableRow) => void;
}

export function MobileRow({ row, columns, index, onRowClick }: MobileRowProps) {
  return (
    <div
      key={row.id}
      className={`border-b border-neutral-200 px-3 py-3 ${
        index === 0 ? 'border-t' : ''
      } ${
        onRowClick ? 'cursor-pointer active:bg-slate-50 transition-colors' : ''
      }`}
      onClick={() => onRowClick?.(row)}
    >
      <div className="space-y-2">
        {columns.map((column) => {
          if (!column.label || column.label.trim() === '') return null;

          return (
            <div key={column.key} className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs font-medium text-neutral-700 uppercase flex-shrink-0">
                {column.label}
              </span>
              <div className="flex-1 border-b border-dotted border-neutral-300 min-w-[20px]"></div>
              <div className="text-sm text-neutral-700 text-right flex-shrink-0">
                {column.render ? column.render(row[column.key], row) : row[column.key] || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
