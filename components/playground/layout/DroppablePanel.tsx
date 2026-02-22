/**
 * DroppablePanel
 * Droppable container for widgets with sortable context.
 * Inactive widgets (returning null) are hidden but kept in the sortable list.
 */

"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { WidgetWrapper } from "./WidgetWrapper";
import { WidgetRenderer, useIsWidgetActive } from "./WidgetRenderer";
import type { WidgetId, PanelId } from "./types";

interface DroppablePanelProps {
  panelId: PanelId;
  widgets: WidgetId[];
  disableDnD?: boolean;
}

function SortableWidget({ widgetId, disableDnD }: { widgetId: WidgetId; disableDnD?: boolean }) {
  const isActive = useIsWidgetActive(widgetId);

  return (
    <WidgetWrapper widgetId={widgetId} disabled={disableDnD} hidden={!isActive}>
      <WidgetRenderer widgetId={widgetId} />
    </WidgetWrapper>
  );
}

export function DroppablePanel({ panelId, widgets, disableDnD }: DroppablePanelProps) {
  const { setNodeRef, isOver } = useDroppable({ id: panelId });

  return (
    <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-6 transition-colors rounded-lg ${
          isOver ? "bg-brand-purple/5 ring-2 ring-brand-purple/20 rounded-3xl min-h-[80px]" : ""
        }`}
      >
        {widgets.map((widgetId) => (
          <SortableWidget key={widgetId} widgetId={widgetId} disableDnD={disableDnD} />
        ))}
      </div>
    </SortableContext>
  );
}
