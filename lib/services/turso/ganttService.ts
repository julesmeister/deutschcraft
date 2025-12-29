/**
 * Gantt Task Service - Turso/LibSQL Implementation
 * SQLite table: gantt_tasks
 */

import { db } from '@/turso/client';
import { GanttTask, GanttTaskCreateInput, GanttTaskUpdateInput } from '@/lib/models/gantt';

/**
 * Convert database row to GanttTask object
 */
function rowToGanttTask(row: any): GanttTask {
  return {
    taskId: row.task_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    startDate: row.start_date as number,
    endDate: row.end_date as number,
    progress: row.progress as number,
    status: row.status as GanttTask['status'],
    color: row.color as string | undefined,
    parentTaskId: row.parent_task_id as string | null | undefined,
    orderIndex: row.order_index as number,
    assignedTo: row.assigned_to ? JSON.parse(row.assigned_to as string) : undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    dependencies: row.dependencies ? JSON.parse(row.dependencies as string) : undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : undefined,
    priority: row.priority as GanttTask['priority'] | undefined,
  };
}

/**
 * Create a new gantt task
 */
export async function createGanttTask(input: GanttTaskCreateInput): Promise<GanttTask> {
  const taskId = `gantt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = Date.now();

  const task: GanttTask = {
    taskId,
    ...input,
    progress: input.progress ?? 0,
    status: input.status ?? 'not-started',
    createdAt: now,
    updatedAt: now,
  };

  await db.execute({
    sql: `INSERT INTO gantt_tasks (
      task_id, name, description, start_date, end_date, progress, status,
      color, parent_task_id, order_index, assigned_to, created_by,
      created_at, updated_at, dependencies, tags, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      task.taskId,
      task.name,
      task.description ?? null,
      task.startDate,
      task.endDate,
      task.progress,
      task.status,
      task.color ?? null,
      task.parentTaskId ?? null,
      task.orderIndex,
      task.assignedTo ? JSON.stringify(task.assignedTo) : null,
      task.createdBy,
      task.createdAt,
      task.updatedAt,
      task.dependencies ? JSON.stringify(task.dependencies) : null,
      task.tags ? JSON.stringify(task.tags) : null,
      task.priority ?? null,
    ],
  });

  return task;
}

/**
 * Get a single gantt task by ID
 */
export async function getGanttTask(taskId: string): Promise<GanttTask | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM gantt_tasks WHERE task_id = ?',
      args: [taskId],
    });

    if (result.rows.length === 0) return null;
    return rowToGanttTask(result.rows[0]);
  } catch (error) {
    console.error('[ganttService:turso] Error fetching gantt task:', error);
    throw error;
  }
}

/**
 * Get all gantt tasks (optionally filter by creator)
 */
export async function getAllGanttTasks(createdBy?: string): Promise<GanttTask[]> {
  try {
    let result;
    if (createdBy) {
      result = await db.execute({
        sql: 'SELECT * FROM gantt_tasks WHERE created_by = ? ORDER BY order_index ASC',
        args: [createdBy],
      });
    } else {
      result = await db.execute({
        sql: 'SELECT * FROM gantt_tasks ORDER BY order_index ASC',
        args: [],
      });
    }

    return result.rows.map(rowToGanttTask);
  } catch (error) {
    console.error('[ganttService:turso] Error fetching gantt tasks:', error);
    throw error;
  }
}

/**
 * Get child gantt tasks of a parent task
 */
export async function getChildGanttTasks(parentTaskId: string): Promise<GanttTask[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM gantt_tasks WHERE parent_task_id = ? ORDER BY order_index ASC',
      args: [parentTaskId],
    });

    return result.rows.map(rowToGanttTask);
  } catch (error) {
    console.error('[ganttService:turso] Error fetching child gantt tasks:', error);
    throw error;
  }
}

/**
 * Update a gantt task
 */
export async function updateGanttTask(taskId: string, updates: GanttTaskUpdateInput): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    // Build dynamic UPDATE query
    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      args.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      args.push(updates.description);
    }
    if (updates.startDate !== undefined) {
      setClauses.push('start_date = ?');
      args.push(updates.startDate);
    }
    if (updates.endDate !== undefined) {
      setClauses.push('end_date = ?');
      args.push(updates.endDate);
    }
    if (updates.progress !== undefined) {
      setClauses.push('progress = ?');
      args.push(updates.progress);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      args.push(updates.status);
    }
    if (updates.color !== undefined) {
      setClauses.push('color = ?');
      args.push(updates.color);
    }
    if (updates.parentTaskId !== undefined) {
      setClauses.push('parent_task_id = ?');
      args.push(updates.parentTaskId);
    }
    if (updates.orderIndex !== undefined) {
      setClauses.push('order_index = ?');
      args.push(updates.orderIndex);
    }
    if (updates.assignedTo !== undefined) {
      setClauses.push('assigned_to = ?');
      args.push(JSON.stringify(updates.assignedTo));
    }
    if (updates.dependencies !== undefined) {
      setClauses.push('dependencies = ?');
      args.push(JSON.stringify(updates.dependencies));
    }
    if (updates.tags !== undefined) {
      setClauses.push('tags = ?');
      args.push(JSON.stringify(updates.tags));
    }
    if (updates.priority !== undefined) {
      setClauses.push('priority = ?');
      args.push(updates.priority);
    }

    // Always update updatedAt
    setClauses.push('updated_at = ?');
    args.push(Date.now());

    // Add taskId to args
    args.push(taskId);

    await db.execute({
      sql: `UPDATE gantt_tasks SET ${setClauses.join(', ')} WHERE task_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[ganttService:turso] Error updating gantt task:', error);
    throw error;
  }
}

/**
 * Delete a gantt task (and optionally its children)
 */
export async function deleteGanttTask(taskId: string, deleteChildren: boolean = false): Promise<void> {
  try {
    if (deleteChildren) {
      // Get and delete all children recursively
      const children = await getChildGanttTasks(taskId);
      await Promise.all(children.map(child => deleteGanttTask(child.taskId, true)));
    }

    await db.execute({
      sql: 'DELETE FROM gantt_tasks WHERE task_id = ?',
      args: [taskId],
    });
  } catch (error) {
    console.error('[ganttService:turso] Error deleting gantt task:', error);
    throw error;
  }
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

/**
 * Check if user has edit permission for gantt tasks
 */
export async function hasGanttEditPermission(userId: string): Promise<boolean> {
  try {
    // Check if user is a teacher
    const result = await db.execute({
      sql: 'SELECT role, gantt_edit_permission, gantt_edit_expires_at FROM users WHERE email = ?',
      args: [userId],
    });

    if (result.rows.length === 0) return false;

    const row = result.rows[0];
    // Teacher always has permission
    if (row.role === 'TEACHER') return true;

    // Check explicit permission
    if (row.gantt_edit_permission === 1) {
      // Check expiration if set
      if (row.gantt_edit_expires_at) {
        return (row.gantt_edit_expires_at as number) > Date.now();
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('[ganttService:turso] Error checking edit permission:', error);
    return false;
  }
}

/**
 * Grant gantt edit permission to a user (teacher only)
 */
export async function grantGanttEditPermission(userId: string, expiresAt?: number): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET gantt_edit_permission = 1, gantt_edit_expires_at = ? WHERE email = ?',
      args: [expiresAt || null, userId],
    });
  } catch (error) {
    console.error('[ganttService:turso] Error granting edit permission:', error);
    throw error;
  }
}

/**
 * Revoke gantt edit permission from a user
 */
export async function revokeGanttEditPermission(userId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET gantt_edit_permission = 0, gantt_edit_expires_at = NULL WHERE email = ?',
      args: [userId],
    });
  } catch (error) {
    console.error('[ganttService:turso] Error revoking edit permission:', error);
    throw error;
  }
}

/**
 * Get all users with active permissions
 */
export async function getUsersWithGanttPermission(): Promise<Array<{ userId: string; expiresAt: number }>> {
  try {
    const now = Date.now();
    const result = await db.execute({
      sql: 'SELECT email, gantt_edit_expires_at FROM users WHERE gantt_edit_permission = 1',
      args: [],
    });

    return result.rows
      .map((row) => ({
        userId: row.email as string,
        expiresAt: (row.gantt_edit_expires_at as number) || Infinity,
      }))
      .filter((u) => u.expiresAt > now);
  } catch (error) {
    console.error('[ganttService:turso] Error fetching permissions:', error);
    throw error;
  }
}
