/**
 * Gantt Task Service - CRUD operations for schedule/project tasks
 * Firestore collection: 'gantt_tasks'
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { GanttTask, GanttTaskCreateInput, GanttTaskUpdateInput } from '../models/gantt';

const GANTT_TASKS_COLLECTION = 'gantt_tasks';

/**
 * Create a new gantt task
 */
export async function createGanttTask(input: GanttTaskCreateInput): Promise<GanttTask> {
  const taskId = doc(collection(db, GANTT_TASKS_COLLECTION)).id;
  const now = Date.now();

  const task: GanttTask = {
    taskId,
    ...input,
    progress: input.progress ?? 0,
    status: input.status ?? 'not-started',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, GANTT_TASKS_COLLECTION, taskId), task);
  return task;
}

/**
 * Get a single gantt task by ID
 */
export async function getGanttTask(taskId: string): Promise<GanttTask | null> {
  const taskDoc = await getDoc(doc(db, GANTT_TASKS_COLLECTION, taskId));
  if (!taskDoc.exists()) return null;
  return taskDoc.data() as GanttTask;
}

/**
 * Get all gantt tasks (optionally filter by creator)
 */
export async function getAllGanttTasks(createdBy?: string): Promise<GanttTask[]> {
  try {
    let q;
    if (createdBy) {
      q = query(
        collection(db, GANTT_TASKS_COLLECTION),
        where('createdBy', '==', createdBy),
        orderBy('orderIndex', 'asc')
      );
    } else {
      q = query(
        collection(db, GANTT_TASKS_COLLECTION),
        orderBy('orderIndex', 'asc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as GanttTask);
  } catch (error) {
    console.error('[ganttService] Error fetching gantt tasks:', error);
    throw error;
  }
}

/**
 * Get child gantt tasks of a parent task
 */
export async function getChildGanttTasks(parentTaskId: string): Promise<GanttTask[]> {
  try {
    const q = query(
      collection(db, GANTT_TASKS_COLLECTION),
      where('parentTaskId', '==', parentTaskId),
      orderBy('orderIndex', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as GanttTask);
  } catch (error) {
    console.error('[ganttService] Error fetching child gantt tasks:', error);
    throw error;
  }
}

/**
 * Update a gantt task
 */
export async function updateGanttTask(taskId: string, updates: GanttTaskUpdateInput): Promise<void> {
  const taskRef = doc(db, GANTT_TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete a gantt task (and optionally its children)
 */
export async function deleteGanttTask(taskId: string, deleteChildren: boolean = false): Promise<void> {
  if (deleteChildren) {
    // Get and delete all children
    const children = await getChildGanttTasks(taskId);
    await Promise.all(children.map(child => deleteGanttTask(child.taskId, true)));
  }

  await deleteDoc(doc(db, GANTT_TASKS_COLLECTION, taskId));
}

/**
 * Update gantt task dates (for drag/resize in Gantt chart)
 */
export async function updateGanttTaskDates(
  taskId: string,
  startDate: number,
  endDate: number
): Promise<void> {
  await updateGanttTask(taskId, { startDate, endDate });
}

/**
 * Update gantt task progress
 */
export async function updateGanttTaskProgress(
  taskId: string,
  progress: number
): Promise<void> {
  await updateGanttTask(taskId, { progress });
}
