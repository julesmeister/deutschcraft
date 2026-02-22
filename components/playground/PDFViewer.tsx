/**
 * PDF Viewer Component
 * Displays PDF materials in the playground room
 * Supports synced page navigation (teacher controls, students follow)
 */

"use client";

import { useCallback, useRef } from "react";
import { ActionButtonIcons } from "@/components/ui/ActionButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PDFViewerProps {
  materialTitle: string;
  materialUrl: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  pageStart?: number;  // Starting page (1-indexed)
  pageEnd?: number;    // Ending page (optional)
  currentPage?: number; // Synced page from Firestore
  onPageChange?: (page: number) => Promise<void>; // Teacher-only: update synced page
}

export function PDFViewer({
  materialTitle,
  materialUrl,
  onClose,
  showCloseButton = true,
  pageStart,
  pageEnd,
  currentPage,
  onPageChange,
}: PDFViewerProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine which page to show in the iframe
  const activePage = currentPage || pageStart || 1;
  const pdfUrl = `${materialUrl}#page=${activePage}`;

  // Format page range badge text (for exercise-linked page ranges)
  const getPageRangeBadge = () => {
    if (!pageStart) return null;
    if (pageEnd && pageEnd > pageStart) {
      return `Pages ${pageStart}-${pageEnd}`;
    }
    return `Page ${pageStart}`;
  };

  const pageRangeBadge = getPageRangeBadge();

  // Debounced page change to avoid Firestore spam
  const handlePageChange = useCallback((newPage: number) => {
    if (!onPageChange || newPage < 1) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onPageChange(newPage);
    }, 200);
  }, [onPageChange]);

  const handlePrev = useCallback(() => {
    if (activePage > 1) handlePageChange(activePage - 1);
  }, [activePage, handlePageChange]);

  const handleNext = useCallback(() => {
    handlePageChange(activePage + 1);
  }, [activePage, handlePageChange]);

  const isTeacher = !!onPageChange;

  return (
    <div className="bg-white rounded-3xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200/60 bg-white/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">📄</span>
          <h4 className="font-semibold text-sm text-neutral-900 truncate">
            {materialTitle}
          </h4>
          {pageRangeBadge && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded shrink-0">
              {pageRangeBadge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Page navigation controls — always visible */}
          <div className="flex items-center gap-1">
            {isTeacher ? (
              <>
                <button
                  onClick={handlePrev}
                  disabled={activePage <= 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs font-medium text-gray-700 tabular-nums min-w-[2.5rem] text-center">
                  p. {activePage}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </>
            ) : (
              <span className="text-xs font-medium text-gray-500 tabular-nums">
                p. {activePage}
              </span>
            )}
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Open in New Tab
          </a>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Close PDF"
            >
              <ActionButtonIcons.Close />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer - key forces reload on page change */}
      <div className="flex-1 bg-gray-100">
        <iframe
          key={activePage}
          src={pdfUrl}
          className="w-full h-full border-0"
          title={materialTitle}
        />
      </div>
    </div>
  );
}
