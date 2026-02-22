/**
 * ResizablePanelLayout
 * 3-column layout: DndContext + resizable panels + drag overlay
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Group, Panel } from "react-resizable-panels";
import { motion, AnimatePresence } from "framer-motion";
import { HorizontalVideoStrip } from "@/components/playground/HorizontalVideoStrip";
import { DroppablePanel } from "./DroppablePanel";
import { PanelResizeHandle } from "./PanelResizeHandle";
import { WIDGET_CONFIGS, type WidgetId, type PanelId, type LayoutState } from "./types";
import { useWidgetContext } from "./PlaygroundWidgetContext";

interface ResizablePanelLayoutProps {
  layout: LayoutState;
  onMoveWidget: (widgetId: WidgetId, from: PanelId, to: PanelId, toIndex: number) => void;
  onPanelResize: (leftSize: number, rightSize: number) => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  if (typeof window !== "undefined") {
    const match = window.matchMedia("(max-width: 1279px)").matches;
    if (match !== isMobile) setIsMobile(match);
  }
  return isMobile;
}

function findWidgetPanel(layout: LayoutState, widgetId: WidgetId): PanelId | null {
  if (layout.leftWidgets.includes(widgetId)) return "left";
  if (layout.centerWidgets.includes(widgetId)) return "center";
  if (layout.rightWidgets.includes(widgetId)) return "right";
  return null;
}

function getWidgetList(layout: LayoutState, panelId: PanelId): WidgetId[] {
  if (panelId === "left") return layout.leftWidgets;
  if (panelId === "center") return layout.centerWidgets;
  return layout.rightWidgets;
}

export function ResizablePanelLayout({
  layout,
  onMoveWidget,
  onPanelResize,
}: ResizablePanelLayoutProps) {
  const ctx = useWidgetContext();
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<WidgetId | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as WidgetId);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const widgetId = active.id as WidgetId;
      const fromPanel = findWidgetPanel(layout, widgetId);
      if (!fromPanel) return;

      let toPanel: PanelId;
      let toIndex: number;

      if (over.id === "left" || over.id === "center" || over.id === "right") {
        toPanel = over.id as PanelId;
        toIndex = getWidgetList(layout, toPanel).length;
      } else {
        const overWidgetId = over.id as WidgetId;
        const overPanel = findWidgetPanel(layout, overWidgetId);
        if (!overPanel) return;
        toPanel = overPanel;
        const targetList = getWidgetList(layout, toPanel);
        toIndex = targetList.indexOf(overWidgetId);
        if (toIndex === -1) toIndex = targetList.length;
      }

      onMoveWidget(widgetId, fromPanel, toPanel, toIndex);
    },
    [layout, onMoveWidget]
  );

  const showVideoStripLeft = ctx.isVoiceActive && ctx.videoLayout === "top-left";
  const showVideoStripRight = ctx.isVoiceActive && ctx.videoLayout === "top-right";

  const videoStrip = useMemo(
    () => (
      <HorizontalVideoStrip
        isVideoActive={ctx.isVideoActive}
        localStream={ctx.localStream}
        participants={ctx.mediaParticipants}
        videoStreams={ctx.videoStreams}
        currentUserId={ctx.userId}
        currentUserName={ctx.userName}
        isMuted={ctx.isMuted}
      />
    ),
    [ctx.isVideoActive, ctx.localStream, ctx.mediaParticipants, ctx.videoStreams, ctx.userId, ctx.userName, ctx.isMuted]
  );

  // Mobile: single column, no DnD, no resize
  if (isMobile) {
    return (
      <div className="space-y-6">
        {(showVideoStripLeft || showVideoStripRight) && <div className="mb-4">{videoStrip}</div>}
        <DroppablePanel
          panelId="center"
          widgets={[...layout.leftWidgets, ...layout.centerWidgets, ...layout.rightWidgets]}
          disableDnD
        />
      </div>
    );
  }

  const activeLabel = activeId ? WIDGET_CONFIGS[activeId]?.label : null;
  const is3Col = layout.columnCount === 3;

  // Build default sizes for Group
  let defaultLayout: Record<string, number>;
  if (is3Col) {
    const centerSize = 100 - layout.leftPanelSize - layout.rightPanelSize;
    defaultLayout = layout.isLeftPanelVisible
      ? { "panel-left": layout.leftPanelSize, "panel-center": centerSize, "panel-right": layout.rightPanelSize }
      : { "panel-center": 100 - layout.rightPanelSize, "panel-right": layout.rightPanelSize };
  } else {
    // 2-column: left + right (right has center+right widgets merged in state)
    const rightSize = 100 - layout.leftPanelSize;
    defaultLayout = layout.isLeftPanelVisible
      ? { "panel-left": layout.leftPanelSize, "panel-right": rightSize }
      : { "panel-right": 100 };
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Group
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={(sizes) => {
          const left = sizes["panel-left"] ?? 0;
          const right = sizes["panel-right"] ?? 0;
          if (layout.isLeftPanelVisible) {
            onPanelResize(left, right);
          } else {
            onPanelResize(layout.leftPanelSize, right);
          }
        }}
      >
        {layout.isLeftPanelVisible && (
          <>
            <Panel
              defaultSize={`${layout.leftPanelSize}%`}
              minSize="14%"
              maxSize={is3Col ? "35%" : "50%"}
              id="panel-left"
            >
              <div className="pr-1 h-full overflow-y-auto">
                {showVideoStripLeft && <div className="mb-4">{videoStrip}</div>}
                <DroppablePanel panelId="left" widgets={layout.leftWidgets} />
              </div>
            </Panel>
            <PanelResizeHandle />
          </>
        )}
        {is3Col && (
          <>
            <Panel id="panel-center" minSize="20%">
              <div className="px-1 h-full overflow-y-auto">
                {showVideoStripRight && <div className="mb-4">{videoStrip}</div>}
                <DroppablePanel panelId="center" widgets={layout.centerWidgets} />
              </div>
            </Panel>
            <PanelResizeHandle />
          </>
        )}
        <Panel
          defaultSize={is3Col ? `${layout.rightPanelSize}%` : undefined}
          minSize={is3Col ? "15%" : "30%"}
          maxSize={is3Col ? "50%" : undefined}
          id="panel-right"
        >
          <div className={`${is3Col ? "pl-1" : "px-1"} h-full overflow-y-auto`}>
            {!is3Col && showVideoStripRight && <div className="mb-4">{videoStrip}</div>}
            <DroppablePanel panelId="right" widgets={layout.rightWidgets} />
          </div>
        </Panel>
      </Group>

      <DragOverlay>
        <AnimatePresence>
          {activeId && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 0.85 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/90 border-2 border-brand-purple/30 rounded-lg shadow-xl p-4 backdrop-blur-sm"
            >
              <div className="text-sm font-medium text-brand-purple">
                {activeLabel}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DragOverlay>
    </DndContext>
  );
}
