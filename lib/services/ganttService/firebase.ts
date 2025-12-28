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
import { db } from '../../firebase';
import { GanttTask, GanttTaskCreateInput, GanttTaskUpdateInput } from '../../models/gantt';

const GANTT_TASKS_COLLECTION = 'gantt_tasks';

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

export async function getGanttTask(taskId: string): Promise<GanttTask | null> {
  const taskDoc = await getDoc(doc(db, GANTT_TASKS_COLLECTION, taskId));
  if (!taskDoc.exists()) return null;
  return taskDoc.data() as GanttTask;
}

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

export async function updateGanttTask(taskId: string, updates: GanttTaskUpdateInput): Promise<void> {
  const taskRef = doc(db, GANTT_TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteGanttTask(taskId: string, deleteChildren: boolean = false): Promise<void> {
  if (deleteChildren) {
    const children = await getChildGanttTasks(taskId);
    await Promise.all(children.map(child => deleteGanttTask(child.taskId, true)));
  }

  await deleteDoc(doc(db, GANTT_TASKS_COLLECTION, taskId));
}

export async function updateGanttTaskDates(
  taskId: string,
  startDate: number,
  endDate: number
): Promise<void> {
  await updateGanttTask(taskId, { startDate, endDate });
}

export async function updateGanttTaskProgress(
  taskId: string,
  progress: number
): Promise<void> {
  await updateGanttTask(taskId, { progress });
}

export async function hasGanttEditPermission(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    if (userData.role === 'TEACHER') return true;

    if (userData.ganttEditPermission === true) {
      const expiresAt = userData.ganttEditExpiresAt;
      if (!expiresAt || expiresAt > Date.now()) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[ganttService] Error checking edit permission:', error);
    return false;
  }
}

export async function grantGanttEditPermission(userId: string, expiresAt?: number): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ganttEditPermission: true,
      ganttEditExpiresAt: expiresAt || null,
    });
  } catch (error) {
    console.error('[ganttService] Error granting edit permission:', error);
    throw error;
  }
}

export async function revokeGanttEditPermission(userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ganttEditPermission: false,
      ganttEditExpiresAt: null,
    });
  } catch (error) {
    console.error('[ganttService] Error revoking edit permission:', error);
    throw error;
  }
}

export async function getUsersWithGanttPermission(): Promise<Array<{ userId: string; expiresAt: number }>> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('ganttEditPermission', '==', true));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(doc => ({
        userId: doc.id,
        expiresAt: doc.data().ganttEditExpiresAt || Infinity,
      }))
      .filter(p => p.expiresAt > Date.now());
  } catch (error) {
    console.error('[ganttService] Error fetching permissions:', error);
    throw error;
  }
}
