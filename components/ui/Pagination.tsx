'use client';

import React from 'react';
import Link from 'next/link';

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
        : `block px-4 transition-all duration-400 ease-in-out text-sm font-medium tracking-wide leading-[45px]
           ${isCurrent
             ? 'bg-brand-purple text-white rounded-lg'
             : 'text-gray-600 hover:bg-brand-purple hover:text-white hover:rounded-lg'
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
    if (!showPrevNext) return null;

    if (variant === 'pills') {
      return currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          onClick={handlePageClick(currentPage + 1)}
          className="flex items-center justify-center w-[50px] h-[50px] text-[25px] font-normal
                     text-[#11316e] bg-transparent border border-[#4e5e7c26] rounded-full
                     transition-all duration-500 hover:bg-[#559adc] hover:text-white"
          aria-label="Next page"
        >
          <span className="relative top-[0.5px]">→</span>
        </Link>
      ) : null;
    }

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
          className="block px-4 transition-all duration-400 ease-in-out text-gray-600 text-sm font-medium
                     tracking-wide leading-[45px] hover:bg-transparent hover:text-brand-purple
                     disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="block px-4 transition-all duration-400 ease-in-out text-gray-600 text-sm font-medium
                     tracking-wide leading-[45px] hover:bg-transparent hover:text-brand-purple
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          next
        </button>
      </>
    );
  };

  const containerClasses = variant === 'pills'
    ? `flex items-center justify-center gap-[10px] text-center ${className}`
    : `text-center mt-6 mb-0 ${className}`;

  const innerClasses = variant === 'pills'
    ? ''
    : 'inline-flex h-[45px] px-4 rounded-[22px] bg-gray-100';

  return (
    <div className={containerClasses}>
      {variant === 'pills' ? (
        <>
          {renderPageNumbers()}
          {renderPrevNext()}
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
