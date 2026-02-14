'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export type PaginationVariant = 'rounded' | 'pills';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
  className?: string;
  variant?: PaginationVariant;
  showPrevNext?: boolean;
}

function useMaxVisiblePages(): number {
  const [maxPages, setMaxPages] = useState(5);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setMaxPages(11);
      else if (w >= 768) setMaxPages(9);
      else if (w >= 640) setMaxPages(7);
      else setMaxPages(5);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return maxPages;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  className = '',
  variant = 'rounded',
  showPrevNext = true,
}: PaginationProps) {
  const maxVisible = useMaxVisiblePages();

  const getPageUrl = (page: number): string => {
    if (!baseUrl) return '#';
    if (page === 1) return baseUrl;
    return `${baseUrl}/page/${page}`;
  };

  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  const getVisiblePages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Slots available for middle numbers (excluding first, last, and up to 2 ellipsis)
    const sideSlots = 2; // first + last always shown
    const middleSlots = maxVisible - sideSlots;

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];

    // Calculate window around current page
    const halfWindow = Math.floor((middleSlots - 1) / 2);
    let start = Math.max(2, currentPage - halfWindow);
    let end = Math.min(totalPages - 1, currentPage + halfWindow);

    // Adjust if near the edges
    if (start <= 2) {
      end = Math.min(totalPages - 1, middleSlots + 1);
      start = 2;
    } else if (end >= totalPages - 1) {
      start = Math.max(2, totalPages - middleSlots);
      end = totalPages - 1;
    }

    // Ensure we use the right number of middle slots
    const currentMiddle = end - start + 1;
    const needEllipsisStart = start > 2;
    const needEllipsisEnd = end < totalPages - 1;
    const ellipsisCount = (needEllipsisStart ? 1 : 0) + (needEllipsisEnd ? 1 : 0);

    // If adding ellipsis takes a slot, we may need to shrink the window
    if (currentMiddle + ellipsisCount > middleSlots) {
      if (needEllipsisStart && needEllipsisEnd) {
        // Both sides need ellipsis, shrink equally
        const available = middleSlots - 2; // 2 ellipsis slots
        const half = Math.floor(available / 2);
        start = Math.max(2, currentPage - half);
        end = Math.min(totalPages - 1, start + available - 1);
        if (end >= totalPages - 1) {
          end = totalPages - 2;
          start = Math.max(2, end - available + 1);
        }
      }
    }

    if (start > 2) {
      pages.push('ellipsis-start');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    pages.push(totalPages);
    return pages;
  };

  const renderPageButton = (page: number) => {
    const isCurrent = page === currentPage;
    const buttonClasses = variant === 'pills'
      ? `flex items-center justify-center w-[50px] h-[50px] text-lg font-semibold
         border border-[#4e5e7c26] rounded-full transition-all duration-500
         ${isCurrent
           ? 'text-white bg-[#559adc]'
           : 'text-[#11316e] bg-transparent hover:bg-[#559adc] hover:text-white'
         }`
      : `flex items-center justify-center w-9 h-9 transition-all duration-300 ease-in-out text-sm font-bold rounded-full
         ${isCurrent
           ? 'bg-gray-800 text-white shadow-sm'
           : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
         }`;

    return isCurrent ? (
      <span
        key={page}
        aria-label={`Page ${page}`}
        aria-current="page"
        className={buttonClasses}
      >
        {page}
      </span>
    ) : (
      <Link
        key={page}
        href={getPageUrl(page)}
        aria-label={`Page ${page}`}
        onClick={handlePageClick(page)}
        className={buttonClasses}
      >
        {page}
      </Link>
    );
  };

  const renderPageNumbers = () => {
    const visible = getVisiblePages();

    return visible.map((item) => {
      if (item === 'ellipsis-start' || item === 'ellipsis-end') {
        return (
          <span
            key={item}
            className="flex items-center justify-center w-9 h-9 text-sm text-gray-400 select-none"
          >
            ...
          </span>
        );
      }

      return renderPageButton(item);
    });
  };

  const prevButton = (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (currentPage > 1 && onPageChange) {
          onPageChange(currentPage - 1);
        }
      }}
      disabled={currentPage === 1}
      className="px-2 text-xs font-semibold text-gray-500 hover:text-gray-800
                 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      prev
    </button>
  );

  const nextButton = (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (currentPage < totalPages && onPageChange) {
          onPageChange(currentPage + 1);
        }
      }}
      disabled={currentPage === totalPages}
      className="px-2 text-xs font-semibold text-gray-500 hover:text-gray-800
                 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      next
    </button>
  );

  const renderPillsPrev = () => {
    if (!showPrevNext || variant !== 'pills' || currentPage <= 1) return null;

    return (
      <Link
        href={getPageUrl(currentPage - 1)}
        onClick={handlePageClick(currentPage - 1)}
        className="flex items-center justify-center w-[50px] h-[50px]
                   text-[#11316e] bg-transparent border border-[#4e5e7c26] rounded-full
                   transition-all duration-500 hover:bg-[#559adc] hover:text-white"
        aria-label="Previous page"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>
    );
  };

  const renderPillsNext = () => {
    if (!showPrevNext || variant !== 'pills' || currentPage >= totalPages) return null;

    return (
      <Link
        href={getPageUrl(currentPage + 1)}
        onClick={handlePageClick(currentPage + 1)}
        className="flex items-center justify-center w-[50px] h-[50px]
                   text-[#11316e] bg-transparent border border-[#4e5e7c26] rounded-full
                   transition-all duration-500 hover:bg-[#559adc] hover:text-white"
        aria-label="Next page"
      >
        <ArrowRight className="w-6 h-6" />
      </Link>
    );
  };

  const containerClasses = variant === 'pills'
    ? `flex items-center justify-center gap-[10px] text-center ${className}`
    : `text-center mt-6 mb-0 ${className}`;

  const innerClasses = variant === 'pills'
    ? ''
    : 'inline-flex items-center gap-1 h-[45px] px-3 rounded-full bg-gray-100';

  return (
    <div className={containerClasses}>
      {variant === 'pills' ? (
        <>
          {renderPillsPrev()}
          {renderPageNumbers()}
          {renderPillsNext()}
        </>
      ) : (
        <div className={innerClasses}>
          {showPrevNext && prevButton}
          {renderPageNumbers()}
          {showPrevNext && nextButton}
        </div>
      )}
    </div>
  );
}
