/**
 * Custom hook for managing table pagination and menu state
 * Reduces prop drilling for table-related state
 */

import { useState, useEffect } from 'react';

interface UseTableStateProps {
  pageSize?: number;
  initialPage?: number;
}

export function useTableState({
  pageSize = 5,
  initialPage = 1
}: UseTableStateProps = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  /**
   * Toggle menu for a specific row
   */
  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  /**
   * Close all menus
   */
  const closeMenu = () => {
    setOpenMenuId(null);
  };

  /**
   * Reset to first page
   */
  const resetPage = () => {
    setCurrentPage(1);
  };

  /**
   * Paginate data
   */
  const paginateData = <T,>(data: T[]) => {
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalPages,
      totalItems: data.length,
      startIndex,
      endIndex,
    };
  };

  return {
    // State
    currentPage,
    openMenuId,
    pageSize,

    // Setters
    setCurrentPage,
    setOpenMenuId,

    // Actions
    toggleMenu,
    closeMenu,
    resetPage,
    paginateData,
  };
}
