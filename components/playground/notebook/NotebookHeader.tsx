/**
 * NotebookHeader — navigation bar for notebook widget
 * Page navigation, directory toggle, export, create, and delete actions.
 */

"use client";

interface NotebookHeaderProps {
  level: string;
  currentPageIndex: number;
  pageCount: number;
  hasCurrentPage: boolean;
  isTeacher: boolean;
  showPageDirectory: boolean;
  onNavigate: (direction: "prev" | "next") => void;
  onToggleDirectory: () => void;
  onExport: () => void;
  onCreatePage: () => void;
  onDeletePage: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function NotebookHeader({
  level, currentPageIndex, pageCount, hasCurrentPage, isTeacher,
  showPageDirectory, onNavigate, onToggleDirectory, onExport,
  onCreatePage, onDeletePage, onRefresh, isRefreshing,
}: NotebookHeaderProps) {
  return (
    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pastel-ocean/15 text-pastel-ocean shrink-0">
          {level}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onNavigate("prev")}
            disabled={currentPageIndex <= 0}
            className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 transition-opacity"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[10px] text-gray-400 tabular-nums">
            {pageCount > 0 ? `${currentPageIndex + 1}/${pageCount}` : "0"}
          </span>
          <button
            onClick={() => onNavigate("next")}
            disabled={currentPageIndex >= pageCount - 1}
            className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 transition-opacity"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {pageCount > 0 && (
          <button
            onClick={onToggleDirectory}
            className={`p-1 rounded-md transition-colors ${
              showPageDirectory
                ? "bg-pastel-ocean/15 text-pastel-ocean"
                : "hover:bg-gray-100 text-gray-400 hover:text-pastel-ocean"
            }`}
            title={showPageDirectory ? "Back to editor" : "All pages"}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPageDirectory ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-pastel-ocean transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        {pageCount > 0 && (
          <button
            onClick={onExport}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-pastel-ocean transition-colors"
            title="Export PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}
        {isTeacher && (
          <>
            <button
              onClick={onCreatePage}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-pastel-ocean transition-colors"
              title="New page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {hasCurrentPage && (
              <button
                onClick={onDeletePage}
                className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
