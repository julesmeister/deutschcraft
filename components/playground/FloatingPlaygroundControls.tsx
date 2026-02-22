/**
 * FloatingPlaygroundControls
 * Fixed bottom-right floating toolbar. Opens inline as a horizontal row
 * of action pills next to a close button. Scrollable with arrow buttons.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ColumnCount } from "./layout/types";

interface FloatingPlaygroundControlsProps {
  userRole: "teacher" | "student";
  isHost: boolean;
  isLeftPanelVisible: boolean;
  columnCount: ColumnCount;
  onToggleLeftPanel: () => void;
  onSetColumnCount: (count: ColumnCount) => void;
  onResetLayout: () => void;
  onOpenExerciseSelector?: () => void;
  onOpenMaterialSelector?: () => void;
  onReconnectAudio?: () => void;
  onMinimize?: () => void;
  onEndRoom: () => Promise<void>;
}

interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  className: string;
  onClick: () => void;
}

export function FloatingPlaygroundControls({
  userRole,
  isHost,
  isLeftPanelVisible,
  columnCount,
  onToggleLeftPanel,
  onSetColumnCount,
  onResetLayout,
  onOpenExerciseSelector,
  onOpenMaterialSelector,
  onReconnectAudio,
  onMinimize,
  onEndRoom,
}: FloatingPlaygroundControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // Check after render
    const t = setTimeout(checkScroll, 50);
    return () => clearTimeout(t);
  }, [isOpen, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
    setTimeout(checkScroll, 200);
  };

  const actions: ActionItem[] = [];

  actions.push({
    key: "panel",
    label: isLeftPanelVisible ? "Hide Panel" : "Show Panel",
    onClick: onToggleLeftPanel,
    className: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    icon: isLeftPanelVisible ? (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  });

  actions.push({
    key: "columns",
    label: columnCount === 3 ? "2 Col" : "3 Col",
    onClick: () => onSetColumnCount(columnCount === 3 ? 2 : 3),
    className: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    icon: columnCount === 3 ? (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6M9 20h6M4 9v6m16-6v6M9 4v16M4 9h16M4 15h16" />
      </svg>
    ) : (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M9 4v16M9 4h6m0 0h4a1 1 0 011 1v14a1 1 0 01-1 1h-4m0-16v16m0 0H9" />
      </svg>
    ),
  });

  actions.push({
    key: "reset",
    label: "Reset",
    onClick: onResetLayout,
    className: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  });

  if (onReconnectAudio) {
    actions.push({
      key: "reconnect",
      label: "Reconnect",
      onClick: onReconnectAudio,
      className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    });
  }

  if (userRole === "teacher" && onOpenExerciseSelector) {
    actions.push({
      key: "exercise",
      label: "Exercise",
      onClick: onOpenExerciseSelector,
      className: "bg-purple-50 text-purple-700 hover:bg-purple-100",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    });
  }

  if (userRole === "teacher" && onOpenMaterialSelector) {
    actions.push({
      key: "materials",
      label: "Materials",
      onClick: onOpenMaterialSelector,
      className: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    });
  }

  if (onMinimize) {
    actions.push({
      key: "minimize",
      label: "Minimize",
      onClick: () => { onMinimize(); setIsOpen(false); },
      className: "bg-gray-50 text-gray-600 hover:bg-gray-100",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      ),
    });
  }

  if (isHost) {
    actions.push({
      key: "end",
      label: "End Room",
      onClick: () => { onEndRoom(); setIsOpen(false); },
      className: "bg-red-50 text-red-600 hover:bg-red-100",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    });
  }

  // Closed state: just the Controls pill
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-48 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-piku-purple-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Controls</span>
      </button>
    );
  }

  // Open state: horizontal bar with close (X) button + scrollable action pills
  return (
    <div className="fixed bottom-6 right-48 z-40 flex items-center gap-1.5 bg-white rounded-full shadow-2xl border border-gray-200 p-1.5 max-w-[calc(100vw-12rem)]">
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-piku-purple-dark text-white hover:bg-piku-purple-dark/90 transition-colors"
        title="Close controls"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Scrollable action pills */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            title={action.label}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${action.className}`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
