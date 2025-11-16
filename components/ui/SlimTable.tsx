'use client';

import { ReactNode } from 'react';

export interface SlimTableColumn {
  key: string;
  label?: string;
  align?: 'left' | 'right' | 'center';
  render?: (value: any, row: any) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  width?: string;
}

export interface SlimTableRow {
  id: string;
  [key: string]: any;
}

interface SlimTableProps {
  title?: string;
  columns: SlimTableColumn[];
  data: SlimTableRow[];
  onRowClick?: (row: SlimTableRow) => void;
  showViewAll?: boolean;
  viewAllText?: string;
  onViewAll?: () => void;
  emptyMessage?: string;
  showHeader?: boolean;
  hoverEffect?: boolean;
  rowClassName?: string;
  tableClassName?: string;
  ariaLabel?: string;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export function SlimTable({
  title,
  columns,
  data,
  onRowClick,
  showViewAll = false,
  viewAllText = 'View All',
  onViewAll,
  emptyMessage = 'No data available',
  showHeader = true,
  hoverEffect = true,
  rowClassName,
  tableClassName,
  ariaLabel,
  pagination,
}: SlimTableProps) {
  return (
    <div className="flex flex-col items-start">
      {title && (
        <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug m-3 sm:m-4">
          {title}
        </h5>
      )}

      {/* Mobile List View - Border-only design */}
      <div className="w-full md:hidden">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm border-b border-neutral-200">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, index) => (
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
                  // Skip empty columns on mobile (no label or just whitespace)
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
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className={`w-full border-spacing-0 ${tableClassName || ''}`} aria-label={ariaLabel}>
          {showHeader && (
            <thead className="bg-slate-100">
              <tr className="align-middle outline-0">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={
                      column.headerClassName ||
                      `tracking-[0] text-neutral-700 text-${column.align || 'left'} text-xs font-medium leading-5 px-3 py-2 uppercase border-y border-y-zinc-200`
                    }
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.label || ''}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={
                    rowClassName ||
                    `align-middle outline-0 ${hoverEffect ? 'hover:bg-slate-100/40 transition-colors' : ''} ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`
                  }
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={
                        column.cellClassName ||
                        `tracking-[0] text-neutral-700 text-${column.align || 'left'} text-sm leading-5 px-3 py-3 border-b border-b-neutral-200`
                      }
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-200">
          {/* Desktop: Show results count */}
          <div className="hidden sm:flex items-center gap-2">
            <p className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </p>
          </div>

          {/* Mobile: Show page info */}
          <div className="sm:hidden flex items-center gap-2">
            <p className="text-xs text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="cursor-pointer select-none align-middle appearance-none outline-0 inline-flex items-center justify-center w-8 h-8 border-0 text-black/54 hover:bg-black/5 active:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              type="button"
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
              </svg>
            </button>

            {/* Desktop: Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.currentPage) <= 1;

                // Show ellipsis
                const showEllipsisBefore =
                  page === pagination.currentPage - 2 && pagination.currentPage > 3;
                const showEllipsisAfter =
                  page === pagination.currentPage + 2 &&
                  pagination.currentPage < pagination.totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span
                      key={`ellipsis-${page}`}
                      className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-600"
                    >
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`cursor-pointer select-none align-middle appearance-none outline-0 inline-flex items-center justify-center w-8 h-8 border-0 text-sm font-medium transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-700 hover:bg-black/5 active:bg-black/10'
                    }`}
                    type="button"
                    aria-label={`Page ${page}`}
                    aria-current={page === pagination.currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="cursor-pointer select-none align-middle appearance-none outline-0 inline-flex items-center justify-center w-8 h-8 border-0 text-black/54 hover:bg-black/5 active:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              type="button"
              aria-label="Next page"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {showViewAll && data.length > 0 && (
        <button
          onClick={onViewAll}
          className="cursor-pointer select-none align-middle appearance-none text-blue-700 outline-0 inline-flex relative m-2 px-1.5 py-1 border-0 text-sm font-medium leading-relaxed transition-all hover:bg-blue-700/10 rounded-sm"
          type="button"
        >
          <span className="mr-2 -ml-0.5">
            <svg className="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
            </svg>
          </span>
          {viewAllText}
        </button>
      )}
    </div>
  );
}

// Helper components for common cell renderers
export const SlimTableRenderers = {
  Avatar: (src: string, alt: string) => (
    <img alt={alt} src={src} className="inline h-10 rounded-full" />
  ),

  Link: (text: string, href: string = '#!') => (
    <a
      href={href}
      className="text-neutral-700 text-sm font-medium leading-normal no-underline inline-flex items-center hover:text-blue-700 hover:underline transition-colors"
    >
      {text}
    </a>
  ),

  Status: (statusColor: string, text: string) => (
    <div className="items-center md:flex">
      <span className={`${statusColor} w-2 h-2 rounded-full hidden md:inline-block`}></span>
      <span className="text-gray-500 text-xs leading-relaxed md:ml-2">{text}</span>
    </div>
  ),

  Percentage: (value: number, showArrow: boolean = true) => {
    const isPositive = value > 0;
    return (
      <span className={`md:inline-flex md:items-center ${isPositive ? 'text-green-700' : 'text-red-600'}`}>
        {showArrow && (
          <>
            {isPositive ? (
              <svg className="w-4 h-4 hidden md:inline-block" fill="currentColor" viewBox="0 0 24 24">
                <path d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 hidden md:inline-block" fill="currentColor" viewBox="0 0 24 24">
                <path d="m20 12-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path>
              </svg>
            )}
          </>
        )}
        <span className="md:hidden">{Math.abs(value)}%</span>
        <span className="hidden md:inline">&nbsp;{Math.abs(value)}%&nbsp;</span>
      </span>
    );
  },

  MenuButton: () => (
    <button
      className="cursor-pointer select-none align-middle appearance-none outline-0 inline-flex relative p-1.5 rounded-full border-0 text-black/54 hover:bg-black/5 transition-colors"
      type="button"
      onClick={(e) => e.stopPropagation()}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
      </svg>
    </button>
  ),
};
