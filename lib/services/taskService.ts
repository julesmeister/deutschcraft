/**
 * Task Service - Database abstraction layer for writing task operations
 *
 * This service handles all writing task (homework/assignment) operations.
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { db } from '../firebase';
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
} from 'firebase/firestore';
import { WritingTask } from '../models';

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all tasks for a specific batch
 * @param batchId - Batch ID
 * @returns Array of writing tasks
 */
export async function getTasksByBatch(batchId: string): Promise<WritingTask[]> {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('batchId', '==', batchId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      taskId: doc.id,
      ...doc.data(),
    })) as WritingTask[];
  } catch (error) {
    console.error('[taskService] Error fetching tasks by batch:', error);
    throw error;
  }
}

/**
 * Get all tasks for a teacher in a specific batch
 * @param teacherEmail - Teacher's email
 * @param batchId - Batch ID
 * @returns Array of writing tasks
 */
export async function getTasksByTeacherAndBatch(
  teacherEmail: string,
  batchId: string
): Promise<WritingTask[]> {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('teacherId', '==', teacherEmail),
      where('batchId', '==', batchId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      taskId: doc.id,
      ...doc.data(),
    })) as WritingTask[];
  } catch (error) {
    console.error('[taskService] Error fetching tasks by teacher and batch:', error);
    throw error;
  }
}

/**
 * Get all tasks assigned to a student
 * @param studentEmail - Student's email
 * @returns Array of writing tasks, sorted by due date
 */
export async function getTasksByStudent(studentEmail: string): Promise<WritingTask[]> {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('assignedStudents', 'array-contains', studentEmail));
    const snapshot = await getDocs(q);

    const tasks = snapshot.docs.map(doc => ({
      taskId: doc.id,
      ...doc.data(),
    })) as WritingTask[];

    // Sort by due date (most recent first)
    return tasks.sort((a, b) => b.dueDate - a.dueDate);
  } catch (error) {
    console.error('[taskService] Error fetching tasks by student:', error);
    throw error;
  }
}

/**
 * Get a single task by ID
 * @param taskId - Task ID
 * @returns Writing task or null
 */
export async function getTask(taskId: string): Promise<WritingTask | null> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return null;
    }

    return {
      taskId: taskDoc.id,
      ...taskDoc.data(),
    } as WritingTask;
  } catch (error) {
    console.error('[taskService] Error fetching task:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new writing task
 * @param taskData - Task data (without taskId)
 * @returns Created task with generated taskId
 */
export async function createTask(taskData: Omit<WritingTask, 'taskId'>): Promise<WritingTask> {
  try {
    const taskId = `TASK_${Date.now()}`;
    const taskRef = doc(db, 'tasks', taskId);

    const task: WritingTask = {
      taskId,
      ...taskData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(taskRef, task);
    return task;
  } catch (error) {
    console.error('[taskService] Error creating task:', error);
    throw error;
  }
}

/**
 * Update a writing task
 * @param taskId - Task ID
 * @param updates - Partial task data to update
 */
export async function updateTask(taskId: string, updates: Partial<WritingTask>): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[taskService] Error updating task:', error);
    throw error;
  }
}

/**
 * Assign a task to students (change status to 'assigned')
 * @param taskId - Task ID
 */
export async function assignTask(taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: 'assigned',
      assignedDate: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[taskService] Error assigning task:', error);
    throw error;
  }
}

/**
 * Delete a writing task
 * @param taskId - Task ID
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('[taskService] Error deleting task:', error);
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function getTasksByBatch(batchId: string): Promise<WritingTask[]> {
  const result = await sql`
    SELECT * FROM tasks
    WHERE batch_id = ${batchId}
    ORDER BY due_date DESC
  `;

  return result.rows as WritingTask[];
}

export async function getTasksByStudent(studentEmail: string): Promise<WritingTask[]> {
  const result = await sql`
    SELECT * FROM tasks
    WHERE ${studentEmail} = ANY(assigned_students)
    ORDER BY due_date DESC
  `;

  return result.rows as WritingTask[];
}

export async function createTask(taskData: Omit<WritingTask, 'taskId'>): Promise<WritingTask> {
  const taskId = `TASK_${Date.now()}`;

  const result = await sql`
    INSERT INTO tasks (
      task_id, batch_id, teacher_id, title, description, instructions,
      category, level, status, priority, assigned_date, due_date,
      estimated_duration, assigned_students, completed_students,
      min_words, max_words, min_paragraphs, max_paragraphs,
      required_vocabulary, total_points, tone, perspective,
      require_introduction, require_conclusion, require_examples,
      created_at, updated_at
    )
    VALUES (
      ${taskId}, ${taskData.batchId}, ${taskData.teacherId}, ${taskData.title},
      ${taskData.description}, ${taskData.instructions}, ${taskData.category},
      ${taskData.level}, ${taskData.status}, ${taskData.priority},
      ${taskData.assignedDate}, ${taskData.dueDate}, ${taskData.estimatedDuration},
      ${taskData.assignedStudents}, ${taskData.completedStudents},
      ${taskData.minWords}, ${taskData.maxWords}, ${taskData.minParagraphs},
      ${taskData.maxParagraphs}, ${taskData.requiredVocabulary}, ${taskData.totalPoints},
      ${taskData.tone}, ${taskData.perspective}, ${taskData.requireIntroduction},
      ${taskData.requireConclusion}, ${taskData.requireExamples},
      NOW(), NOW()
    )
    RETURNING *
  `;

  return result.rows[0] as WritingTask;
}

export async function updateTask(taskId: string, updates: Partial<WritingTask>): Promise<void> {
  const fields = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  const values = [taskId, ...Object.values(updates)];

  await sql.query(
    `UPDATE tasks SET ${fields}, updated_at = NOW() WHERE task_id = $1`,
    values
  );
}

export async function deleteTask(taskId: string): Promise<void> {
  await sql`
    DELETE FROM tasks WHERE task_id = ${taskId}
  `;
}
*/
