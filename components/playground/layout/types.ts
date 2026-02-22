/**
 * Playground Layout Types
 * Type definitions for the flexible 3-column panel layout system
 */

export type WidgetId =
  | "video-panel"
  | "participants"
  | "classroom-tools"
  | "writing-board"
  | "exercise-viewer"
  | "material-viewer"
  | "notebook"
  | "quiz";

export type PanelId = "left" | "center" | "right";

export type ColumnCount = 2 | 3;

export interface LayoutState {
  leftWidgets: WidgetId[];
  centerWidgets: WidgetId[];
  rightWidgets: WidgetId[];
  hiddenWidgets: WidgetId[];
  leftPanelSize: number;
  rightPanelSize: number;
  isLeftPanelVisible: boolean;
  columnCount: ColumnCount;
}

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  defaultPanel: PanelId;
  defaultOrder: number;
}

export const WIDGET_CONFIGS: Record<WidgetId, WidgetConfig> = {
  "video-panel": {
    id: "video-panel",
    label: "Video & Voice",
    defaultPanel: "left",
    defaultOrder: 0,
  },
  participants: {
    id: "participants",
    label: "Participants",
    defaultPanel: "left",
    defaultOrder: 1,
  },
  "classroom-tools": {
    id: "classroom-tools",
    label: "Classroom Tools",
    defaultPanel: "left",
    defaultOrder: 2,
  },
  "material-viewer": {
    id: "material-viewer",
    label: "Material Viewer",
    defaultPanel: "center",
    defaultOrder: 0,
  },
  "exercise-viewer": {
    id: "exercise-viewer",
    label: "Exercise",
    defaultPanel: "center",
    defaultOrder: 1,
  },
  "writing-board": {
    id: "writing-board",
    label: "Writing Board",
    defaultPanel: "right",
    defaultOrder: 0,
  },
  notebook: {
    id: "notebook",
    label: "Notebook",
    defaultPanel: "right",
    defaultOrder: 1,
  },
  quiz: {
    id: "quiz",
    label: "Quiz",
    defaultPanel: "center",
    defaultOrder: 2,
  },
};

export const ALL_WIDGET_IDS: WidgetId[] = Object.keys(WIDGET_CONFIGS) as WidgetId[];

export const DEFAULT_LAYOUT: LayoutState = {
  leftWidgets: ["video-panel", "participants", "classroom-tools"],
  centerWidgets: ["material-viewer", "exercise-viewer", "quiz"],
  rightWidgets: ["writing-board", "notebook"],
  hiddenWidgets: [],
  leftPanelSize: 22,
  rightPanelSize: 30,
  isLeftPanelVisible: true,
  columnCount: 3,
};

export const STORAGE_KEY = "playground-layout-v3";
