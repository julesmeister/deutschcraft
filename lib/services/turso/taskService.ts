/**
 * Task Service - Turso Implementation
 * Database abstraction layer for writing task operations using Turso DB
 */

import { db } from '@/turso/client';
import { WritingTask } from '@/lib/models';

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
    const result = await db.execute({
      sql: 'SELECT * FROM tasks WHERE batch_id = ? ORDER BY due_date DESC',
      args: [batchId],
    });

    return result.rows.map(rowToTask);
  } catch (error) {
    console.error('[taskService:turso] Error fetching tasks by batch:', error);
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
    const result = await db.execute({
      sql: `SELECT * FROM tasks
            WHERE teacher_id = ? AND batch_id = ?
            ORDER BY due_date DESC`,
      args: [teacherEmail, batchId],
    });

    return result.rows.map(rowToTask);
  } catch (error) {
    console.error('[taskService:turso] Error fetching tasks by teacher and batch:', error);
    throw error;
  }
}

/**
 * Get all tasks assigned to a student
 * SQLite doesn't have array-contains, so we use JSON search
 * @param studentEmail - Student's email
 * @returns Array of writing tasks, sorted by due date
 */
export async function getTasksByStudent(studentEmail: string): Promise<WritingTask[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM tasks
            WHERE assigned_students LIKE ?
            ORDER BY due_date DESC`,
      args: [`%"${studentEmail}"%`],
    });

    // Filter to ensure exact match (LIKE can have false positives)
    const tasks = result.rows
      .map(rowToTask)
      .filter(task => task.assignedStudents.includes(studentEmail));

    return tasks;
  } catch (error) {
    console.error('[taskService:turso] Error fetching tasks by student:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM tasks WHERE task_id = ? LIMIT 1',
      args: [taskId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToTask(result.rows[0]);
  } catch (error) {
    console.error('[taskService:turso] Error fetching task:', error);
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
    const now = Date.now();

    const task: WritingTask = {
      taskId,
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };

    await db.execute({
      sql: `INSERT INTO tasks (
              task_id, batch_id, teacher_id, title, description, instructions,
              category, level, status, priority, assigned_date, due_date,
              estimated_duration, assigned_students, completed_students,
              min_words, max_words, min_paragraphs, max_paragraphs,
              required_vocabulary, total_points, tone, perspective,
              require_introduction, require_conclusion, require_examples,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        taskId,
        taskData.batchId,
        taskData.teacherId,
        taskData.title,
        taskData.description || '',
        taskData.instructions,
        taskData.category,
        taskData.level,
        taskData.status,
        taskData.priority,
        taskData.assignedDate,
        taskData.dueDate,
        taskData.estimatedDuration || null,
        JSON.stringify(taskData.assignedStudents),
        JSON.stringify(taskData.completedStudents),
        taskData.minWords || null,
        taskData.maxWords || null,
        taskData.minParagraphs || null,
        taskData.maxParagraphs || null,
        taskData.requiredVocabulary ? JSON.stringify(taskData.requiredVocabulary) : null,
        taskData.totalPoints || null,
        taskData.tone || null,
        taskData.perspective || null,
        taskData.requireIntroduction || false,
        taskData.requireConclusion || false,
        taskData.requireExamples || false,
        now,
        now,
      ],
    });

    return task;
  } catch (error) {
    console.error('[taskService:turso] Error creating task:', error);
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
    const setClauses: string[] = [];
    const values: any[] = [];

    // Build dynamic SET clause
    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    if (updates.instructions !== undefined) {
      setClauses.push('instructions = ?');
      values.push(updates.instructions);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      setClauses.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.dueDate !== undefined) {
      setClauses.push('due_date = ?');
      values.push(updates.dueDate);
    }
    if (updates.assignedStudents !== undefined) {
      setClauses.push('assigned_students = ?');
      values.push(JSON.stringify(updates.assignedStudents));
    }
    if (updates.completedStudents !== undefined) {
      setClauses.push('completed_students = ?');
      values.push(JSON.stringify(updates.completedStudents));
    }
    if (updates.minWords !== undefined) {
      setClauses.push('min_words = ?');
      values.push(updates.minWords);
    }
    if (updates.maxWords !== undefined) {
      setClauses.push('max_words = ?');
      values.push(updates.maxWords);
    }
    if (updates.totalPoints !== undefined) {
      setClauses.push('total_points = ?');
      values.push(updates.totalPoints);
    }

    if (setClauses.length === 0) {
      return; // Nothing to update
    }

    // Always update updated_at
    setClauses.push('updated_at = ?');
    values.push(Date.now());

    // Add WHERE clause taskId
    values.push(taskId);

    const sql = `UPDATE tasks SET ${setClauses.join(', ')} WHERE task_id = ?`;

    await db.execute({ sql, args: values });
  } catch (error) {
    console.error('[taskService:turso] Error updating task:', error);
    throw error;
  }
}

/**
 * Assign a task to students (change status to 'assigned')
 * @param taskId - Task ID
 */
export async function assignTask(taskId: string): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE tasks
            SET status = ?, assigned_date = ?, updated_at = ?
            WHERE task_id = ?`,
      args: ['assigned', Date.now(), Date.now(), taskId],
    });
  } catch (error) {
    console.error('[taskService:turso] Error assigning task:', error);
    throw error;
  }
}

/**
 * Delete a writing task
 * @param taskId - Task ID
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM tasks WHERE task_id = ?',
      args: [taskId],
    });
  } catch (error) {
    console.error('[taskService:turso] Error deleting task:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToTask(row: any): WritingTask {
  return {
    taskId: row.task_id as string,
    batchId: row.batch_id as string,
    teacherId: row.teacher_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    instructions: row.instructions as string,
    category: row.category as WritingTask['category'],
    level: row.level as any,
    status: row.status as WritingTask['status'],
    priority: row.priority as WritingTask['priority'],
    assignedDate: row.assigned_date as number | null,
    dueDate: row.due_date as number,
    estimatedDuration: row.estimated_duration as number | undefined,
    assignedStudents: row.assigned_students ? JSON.parse(row.assigned_students as string) : [],
    completedStudents: row.completed_students ? JSON.parse(row.completed_students as string) : [],
    minWords: row.min_words as number | undefined,
    maxWords: row.max_words as number | undefined,
    minParagraphs: row.min_paragraphs as number | undefined,
    maxParagraphs: row.max_paragraphs as number | undefined,
    requiredVocabulary: row.required_vocabulary ? JSON.parse(row.required_vocabulary as string) : undefined,
    totalPoints: row.total_points as number | undefined,
    requireIntroduction: Boolean(row.require_introduction),
    requireConclusion: Boolean(row.require_conclusion),
    requireExamples: Boolean(row.require_examples),
    tone: row.tone as WritingTask['tone'] | undefined,
    perspective: row.perspective as WritingTask['perspective'] | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}
