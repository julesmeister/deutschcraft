/**
 * usePlaygroundLayout Hook
 * Manages 3-column layout state with localStorage persistence
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  type LayoutState,
  type WidgetId,
  type PanelId,
  type ColumnCount,
  ALL_WIDGET_IDS,
  WIDGET_CONFIGS,
  DEFAULT_LAYOUT,
  STORAGE_KEY,
} from "./types";

const PANEL_KEYS: Record<PanelId, keyof Pick<LayoutState, "leftWidgets" | "centerWidgets" | "rightWidgets">> = {
  left: "leftWidgets",
  center: "centerWidgets",
  right: "rightWidgets",
};

function validateLayout(stored: LayoutState): LayoutState {
  // Ensure centerWidgets exists (migration from v1)
  if (!stored.centerWidgets) {
    return DEFAULT_LAYOUT;
  }
  // Ensure columnCount exists (migration)
  if (!stored.columnCount) {
    stored = { ...stored, columnCount: 3 };
  }
  // Ensure hiddenWidgets exists (migration)
  if (!stored.hiddenWidgets) {
    stored = { ...stored, hiddenWidgets: [] };
  }

  const allInLayout = [...stored.leftWidgets, ...stored.centerWidgets, ...stored.rightWidgets];
  const hidden = stored.hiddenWidgets.filter((id) => ALL_WIDGET_IDS.includes(id));
  const missing = ALL_WIDGET_IDS.filter((id) => !allInLayout.includes(id) && !hidden.includes(id));
  const invalid = allInLayout.filter((id) => !ALL_WIDGET_IDS.includes(id as WidgetId));

  if (missing.length > 0 || invalid.length > 0) {
    const left = stored.leftWidgets.filter((id) => ALL_WIDGET_IDS.includes(id));
    const center = stored.centerWidgets.filter((id) => ALL_WIDGET_IDS.includes(id));
    const right = stored.rightWidgets.filter((id) => ALL_WIDGET_IDS.includes(id));
    for (const id of missing) {
      const def = DEFAULT_LAYOUT;
      if (def.leftWidgets.includes(id)) left.push(id);
      else if (def.centerWidgets.includes(id)) center.push(id);
      else right.push(id);
    }
    return { ...stored, leftWidgets: left, centerWidgets: center, rightWidgets: right, hiddenWidgets: hidden };
  }
  return stored;
}

function loadLayout(): LayoutState {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as LayoutState;
    return validateLayout(parsed);
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function usePlaygroundLayout() {
  const [layout, setLayout] = useState<LayoutState>(DEFAULT_LAYOUT);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    setLayout(loadLayout());
    setHydrated(true);
  }, []);

  // Only persist after initial load to avoid overwriting saved data
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout, hydrated]);

  const moveWidget = useCallback(
    (widgetId: WidgetId, from: PanelId, to: PanelId, toIndex: number) => {
      setLayout((prev) => {
        const fromKey = PANEL_KEYS[from];
        const toKey = PANEL_KEYS[to];

        if (from === to) {
          const list = [...prev[fromKey]];
          const oldIndex = list.indexOf(widgetId);
          if (oldIndex === -1) return prev;
          list.splice(oldIndex, 1);
          list.splice(toIndex, 0, widgetId);
          return { ...prev, [fromKey]: list };
        }

        const fromList = prev[fromKey].filter((id) => id !== widgetId);
        const toList = [...prev[toKey]];
        toList.splice(toIndex, 0, widgetId);
        return { ...prev, [fromKey]: fromList, [toKey]: toList };
      });
    },
    []
  );

  const toggleLeftPanel = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      isLeftPanelVisible: !prev.isLeftPanelVisible,
    }));
  }, []);

  const setPanelSizes = useCallback((leftSize: number, rightSize: number) => {
    setLayout((prev) => ({ ...prev, leftPanelSize: leftSize, rightPanelSize: rightSize }));
  }, []);

  const setColumnCount = useCallback((count: ColumnCount) => {
    setLayout((prev) => {
      if (prev.columnCount === count) return prev;

      if (count === 2) {
        // Merge center widgets into right (prepend so they appear above writing board)
        return {
          ...prev,
          columnCount: 2,
          rightWidgets: [...prev.centerWidgets, ...prev.rightWidgets],
          centerWidgets: [],
          rightPanelSize: prev.rightPanelSize + (100 - prev.leftPanelSize - prev.rightPanelSize),
        };
      }

      // Going from 2 → 3: split right widgets back into center + right
      // Move widgets whose default panel is "center" back there
      const centerDefaults = DEFAULT_LAYOUT.centerWidgets;
      const toCenter = prev.rightWidgets.filter((id) => centerDefaults.includes(id));
      const toRight = prev.rightWidgets.filter((id) => !centerDefaults.includes(id));
      return {
        ...prev,
        columnCount: 3,
        centerWidgets: toCenter,
        rightWidgets: toRight.length > 0 ? toRight : DEFAULT_LAYOUT.rightWidgets,
        rightPanelSize: DEFAULT_LAYOUT.rightPanelSize,
      };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
  }, []);

  /** Add or remove a widget from its default panel */
  const toggleWidget = useCallback((widgetId: WidgetId) => {
    setLayout((prev) => {
      const allInLayout = [...prev.leftWidgets, ...prev.centerWidgets, ...prev.rightWidgets];
      const isVisible = allInLayout.includes(widgetId);

      if (isVisible) {
        // Remove from whichever panel it's in and mark as hidden
        return {
          ...prev,
          leftWidgets: prev.leftWidgets.filter((id) => id !== widgetId),
          centerWidgets: prev.centerWidgets.filter((id) => id !== widgetId),
          rightWidgets: prev.rightWidgets.filter((id) => id !== widgetId),
          hiddenWidgets: [...prev.hiddenWidgets.filter((id) => id !== widgetId), widgetId],
        };
      }

      // Add back to its default panel and remove from hidden
      const config = WIDGET_CONFIGS[widgetId];
      const panelKey = PANEL_KEYS[config.defaultPanel];
      return {
        ...prev,
        [panelKey]: [...prev[panelKey], widgetId],
        hiddenWidgets: prev.hiddenWidgets.filter((id) => id !== widgetId),
      };
    });
  }, []);

  /** Check if a widget is currently in the layout */
  const isWidgetInLayout = useCallback((widgetId: WidgetId): boolean => {
    const all = [...layout.leftWidgets, ...layout.centerWidgets, ...layout.rightWidgets];
    return all.includes(widgetId);
  }, [layout]);

  return {
    layout,
    moveWidget,
    toggleLeftPanel,
    setPanelSizes,
    setColumnCount,
    resetLayout,
    toggleWidget,
    isWidgetInLayout,
  };
}
