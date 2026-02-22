/**
 * WidgetWrapper
 * Transparent sortable wrapper — no extra chrome.
 * Shows a discreet drag tab peeking above the component on hover.
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { WidgetId } from "./types";
import { WIDGET_CONFIGS } from "./types";

interface WidgetWrapperProps {
  widgetId: WidgetId;
  disabled?: boolean;
  hidden?: boolean;
  children: React.ReactNode;
}

export function WidgetWrapper({ widgetId, disabled, hidden, children }: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widgetId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const label = WIDGET_CONFIGS[widgetId]?.label ?? widgetId;

  // Inactive widgets: keep sortable node in DOM for dnd-kit, but hidden
  if (hidden) {
    return <div ref={setNodeRef} className="hidden" />;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/widget">
      {!disabled && (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="absolute left-1/2 -translate-x-1/2 top-2 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm opacity-0 group-hover/widget:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-white hover:shadow"
          title={`Drag: ${label}`}
        >
          <svg className="w-4 h-1.5 text-gray-400" viewBox="0 0 16 6" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="13" cy="3" r="1.5" />
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}
