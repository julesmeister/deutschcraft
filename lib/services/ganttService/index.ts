/**
 * Gantt Service - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from "./firebase";
import * as tursoImpl from "../turso/ganttService";

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === "true";

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  createGanttTask,
  getGanttTask,
  getAllGanttTasks,
  getChildGanttTasks,
  updateGanttTask,
  deleteGanttTask,
  updateGanttTaskDates,
  updateGanttTaskProgress,
  hasGanttEditPermission,
  grantGanttEditPermission,
  revokeGanttEditPermission,
  getUsersWithGanttPermission,
} = implementation;
