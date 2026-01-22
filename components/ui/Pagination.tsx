'use client';

import React from 'react';
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

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  className = '',
  variant = 'rounded',
  showPrevNext = true,
}: PaginationProps) {
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

  const renderPageNumbers = () => {
    const pages: JSX.Element[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const isCurrent = i === currentPage;
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

      pages.push(
        isCurrent ? (
          <span
            key={i}
            aria-label={`Page ${i}`}
            aria-current="page"
            className={buttonClasses}
          >
            {i}
          </span>
        ) : (
          <Link
            key={i}
            href={getPageUrl(i)}
            aria-label={`Page ${i}`}
            onClick={handlePageClick(i)}
            className={buttonClasses}
          >
            {i}
          </Link>
        )
      );
    }

    return pages;
  };

  const renderPrevNext = () => {
    if (!showPrevNext || variant === 'pills') return null;

    return (
      <>
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
      </>
    );
  };

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
          {renderPrevNext()}
          {renderPageNumbers()}
        </div>
      )}
    </div>
  );
}
