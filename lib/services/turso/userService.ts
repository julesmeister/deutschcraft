/**
 * User Service - Turso Implementation
 * Database abstraction layer for user operations using Turso DB
 *
 * This is the Turso-compatible version of userService.
 * All user-related database operations use LibSQL/SQLite syntax.
 */

import { db } from '@/turso/client';
import { User } from '@/lib/models';

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get a single user by email
 * @param email - User's email (primary key)
 * @returns User object or null if not found
 */
export async function getUser(email: string): Promise<User | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE user_id = ? LIMIT 1',
      args: [email],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return rowToUser(row);
  } catch (error) {
    console.error('[userService:turso] Error fetching user:', error);
    throw error;
  }
}

/**
 * Get all students for a specific teacher
 * @param teacherEmail - Teacher's email
 * @returns Array of student User objects
 */
export async function getTeacherStudents(teacherEmail: string): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users
            WHERE role = 'STUDENT' AND teacher_id = ?
            ORDER BY first_name ASC`,
      args: [teacherEmail],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching teacher students:', error);
    throw error;
  }
}

/**
 * Get all students in a specific batch
 * @param batchId - Batch ID
 * @returns Array of student User objects
 */
export async function getBatchStudents(batchId: string): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users
            WHERE role = 'STUDENT' AND batch_id = ?
            ORDER BY first_name ASC`,
      args: [batchId],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching batch students:', error);
    throw error;
  }
}

/**
 * Get all students (admin view)
 * @returns Array of all student User objects
 */
export async function getAllStudents(): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users
            WHERE role = 'STUDENT'
            ORDER BY first_name ASC`,
      args: [],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching all students:', error);
    throw error;
  }
}

/**
 * Get all teachers
 * @returns Array of all teacher User objects
 */
export async function getAllTeachers(): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users
            WHERE role = 'TEACHER'
            ORDER BY first_name ASC`,
      args: [],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching all teachers:', error);
    throw error;
  }
}

/**
 * Get students without a teacher (unassigned)
 * @returns Array of unassigned student User objects
 */
export async function getStudentsWithoutTeacher(): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users
            WHERE role = 'STUDENT' AND (teacher_id IS NULL OR teacher_id = '')
            ORDER BY first_name ASC`,
      args: [],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching students without teacher:', error);
    throw error;
  }
}

/**
 * Get all non-teacher users (students and pending)
 * Useful for transaction management
 * @returns Array of all non-teacher User objects
 */
export async function getAllNonTeachers(): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users
            WHERE role != 'TEACHER'
            ORDER BY first_name ASC`,
      args: [],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching all non-teachers:', error);
    throw error;
  }
}

/**
 * Get all users (students, teachers, and pending)
 * @returns Array of all User objects
 */
export async function getUsers(): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users ORDER BY first_name ASC`,
      args: [],
    });

    return result.rows.map(rowToUser);
  } catch (error) {
    console.error('[userService:turso] Error fetching all users:', error);
    throw error;
  }
}

/**
 * Get users with server-side pagination
 * @param options - Pagination options
 * @returns Paginated users with hasMore flag
 */
export async function getUsersPaginated(options: {
  pageSize: number;
  lastDoc: any | null;
  roleFilter?: 'STUDENT' | 'TEACHER' | 'all';
  orderByField?: string;
}): Promise<{ users: User[]; hasMore: boolean; lastDoc: any | null }> {
  const { pageSize, roleFilter = 'all', orderByField = 'user_id' } = options;

  try {
    let sql = 'SELECT * FROM users';
    const args: any[] = [];

    // Add role filter
    if (roleFilter !== 'all') {
      sql += ' WHERE role = ?';
      args.push(roleFilter);
    }

    // Add ordering and limit
    sql += ` ORDER BY ${orderByField} ASC LIMIT ?`;
    args.push(pageSize + 1); // Fetch one extra to check if there's more

    const result = await db.execute({ sql, args });

    const hasMore = result.rows.length > pageSize;
    const users = result.rows.slice(0, pageSize).map(rowToUser);
    const lastDoc = hasMore ? users[users.length - 1] : null;

    return { users, hasMore, lastDoc };
  } catch (error) {
    console.error('[userService:turso] Error fetching paginated users:', error);
    throw error;
  }
}

/**
 * Get total count of users by role
 * @param roleFilter - Optional role filter
 * @returns Total count
 */
export async function getUserCount(roleFilter: 'STUDENT' | 'TEACHER' | 'all' = 'all'): Promise<number> {
  try {
    let sql = 'SELECT COUNT(*) as count FROM users';
    const args: any[] = [];

    if (roleFilter !== 'all') {
      sql += ' WHERE role = ?';
      args.push(roleFilter);
    }

    const result = await db.execute({ sql, args });
    return (result.rows[0]?.count as number) || 0;
  } catch (error) {
    console.error('[userService:turso] Error counting users:', error);
    throw error;
  }
}

/**
 * Get pending enrollment requests with pagination
 * Pending users have no teacher or batch assigned
 * @param options - Pagination options
 * @returns Paginated pending enrollments
 */
export async function getPendingEnrollmentsPaginated(options: {
  pageSize: number;
  lastDoc: any | null;
}): Promise<{ users: User[]; hasMore: boolean; lastDoc: any | null }> {
  const { pageSize } = options;

  try {
    const sql = `SELECT * FROM users
                 WHERE role = 'STUDENT'
                   AND (teacher_id IS NULL OR teacher_id = '')
                   AND (batch_id IS NULL OR batch_id = '')
                 ORDER BY created_at DESC
                 LIMIT ?`;

    const result = await db.execute({
      sql,
      args: [pageSize + 1],
    });

    const hasMore = result.rows.length > pageSize;
    const users = result.rows.slice(0, pageSize).map(rowToUser);
    const lastDoc = hasMore ? users[users.length - 1] : null;

    return { users, hasMore, lastDoc };
  } catch (error) {
    console.error('[userService:turso] Error fetching pending enrollments:', error);
    throw error;
  }
}

/**
 * Get count of pending enrollment requests
 * @returns Total count of pending enrollments
 */
export async function getPendingEnrollmentsCount(): Promise<number> {
  try {
    const result = await db.execute({
      sql: `SELECT COUNT(*) as count FROM users
            WHERE role = 'STUDENT'
              AND (teacher_id IS NULL OR teacher_id = '')
              AND (batch_id IS NULL OR batch_id = '')`,
      args: [],
    });

    return (result.rows[0]?.count as number) || 0;
  } catch (error) {
    console.error('[userService:turso] Error counting pending enrollments:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create or update a user (upsert)
 * @param user - User object with email required
 */
export async function upsertUser(user: Partial<User> & { email: string }): Promise<void> {
  try {
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO users (
              user_id, email, first_name, last_name, role, photo_url,
              cefr_level, teacher_id, batch_id,
              words_learned, words_mastered, sentences_created, sentences_perfect,
              current_streak, longest_streak, total_practice_time, daily_goal, last_active_date,
              notifications_enabled, sound_enabled, flashcard_settings,
              total_students, active_batches,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              email = excluded.email,
              first_name = excluded.first_name,
              last_name = excluded.last_name,
              role = excluded.role,
              photo_url = excluded.photo_url,
              cefr_level = excluded.cefr_level,
              teacher_id = excluded.teacher_id,
              batch_id = excluded.batch_id,
              updated_at = excluded.updated_at`,
      args: [
        user.email,
        user.email,
        user.firstName || '',
        user.lastName || '',
        user.role || 'STUDENT',
        user.photoURL || null,
        user.cefrLevel || null,
        user.teacherId || null,
        user.batchId || null,
        user.wordsLearned || 0,
        user.wordsMastered || 0,
        user.sentencesCreated || 0,
        user.sentencesPerfect || 0,
        user.currentStreak || 0,
        user.longestStreak || 0,
        user.totalPracticeTime || 0,
        user.dailyGoal || 20,
        user.lastActiveDate || null,
        user.notificationsEnabled !== false,
        user.soundEnabled !== false,
        user.flashcardSettings ? JSON.stringify(user.flashcardSettings) : null,
        user.totalStudents || 0,
        user.activeBatches || 0,
        user.createdAt || now,
        now,
      ],
    });
  } catch (error) {
    console.error('[userService:turso] Error upserting user:', error);
    throw error;
  }
}

/**
 * Update user details
 * @param email - User's email (primary key)
 * @param updates - Partial user object with fields to update
 */
export async function updateUser(email: string, updates: Partial<User>): Promise<void> {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];

    // Build dynamic SET clause
    if (updates.firstName !== undefined) {
      setClauses.push('first_name = ?');
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      setClauses.push('last_name = ?');
      values.push(updates.lastName);
    }
    if (updates.photoURL !== undefined) {
      setClauses.push('photo_url = ?');
      values.push(updates.photoURL);
    }
    if (updates.cefrLevel !== undefined) {
      setClauses.push('cefr_level = ?');
      values.push(updates.cefrLevel);
    }
    if (updates.teacherId !== undefined) {
      setClauses.push('teacher_id = ?');
      values.push(updates.teacherId);
    }
    if (updates.batchId !== undefined) {
      setClauses.push('batch_id = ?');
      values.push(updates.batchId);
    }
    if (updates.wordsLearned !== undefined) {
      setClauses.push('words_learned = ?');
      values.push(updates.wordsLearned);
    }
    if (updates.wordsMastered !== undefined) {
      setClauses.push('words_mastered = ?');
      values.push(updates.wordsMastered);
    }
    if (updates.currentStreak !== undefined) {
      setClauses.push('current_streak = ?');
      values.push(updates.currentStreak);
    }
    if (updates.longestStreak !== undefined) {
      setClauses.push('longest_streak = ?');
      values.push(updates.longestStreak);
    }
    if (updates.flashcardSettings !== undefined) {
      setClauses.push('flashcard_settings = ?');
      values.push(JSON.stringify(updates.flashcardSettings));
    }

    if (setClauses.length === 0) {
      return; // Nothing to update
    }

    // Always update updated_at
    setClauses.push('updated_at = ?');
    values.push(Date.now());

    // Add WHERE clause email
    values.push(email);

    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;

    await db.execute({ sql, args: values });
  } catch (error) {
    console.error('[userService:turso] Error updating user:', error);
    throw error;
  }
}

/**
 * Update user's photo URL
 * @param email - User's email
 * @param photoURL - New photo URL
 */
export async function updateUserPhoto(email: string, photoURL: string | null): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET photo_url = ?, updated_at = ? WHERE user_id = ?',
      args: [photoURL, Date.now(), email],
    });
  } catch (error) {
    console.error('[userService:turso] Error updating user photo:', error);
    throw error;
  }
}

/**
 * Assign student to a batch
 * @param studentEmail - Student's email
 * @param batchId - Batch ID to assign to
 * @param teacherId - Teacher ID (optional)
 */
export async function assignStudentToBatch(
  studentEmail: string,
  batchId: string,
  teacherId?: string
): Promise<void> {
  try {
    if (teacherId) {
      await db.execute({
        sql: 'UPDATE users SET batch_id = ?, teacher_id = ?, updated_at = ? WHERE user_id = ?',
        args: [batchId, teacherId, Date.now(), studentEmail],
      });
    } else {
      await db.execute({
        sql: 'UPDATE users SET batch_id = ?, updated_at = ? WHERE user_id = ?',
        args: [batchId, Date.now(), studentEmail],
      });
    }
  } catch (error) {
    console.error('[userService:turso] Error assigning student to batch:', error);
    throw error;
  }
}

/**
 * Get user's flashcard settings
 * @param email - User's email
 * @returns Flashcard settings object or null
 */
export async function getFlashcardSettings(email: string): Promise<any | null> {
  try {
    const user = await getUser(email);
    return user?.flashcardSettings || null;
  } catch (error) {
    console.error('[userService:turso] Error getting flashcard settings:', error);
    throw error;
  }
}

/**
 * Update user's flashcard settings
 * @param email - User's email
 * @param settings - Flashcard settings to update
 */
export async function updateFlashcardSettings(email: string, settings: any): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET flashcard_settings = ?, updated_at = ? WHERE user_id = ?',
      args: [JSON.stringify(settings), Date.now(), email],
    });
  } catch (error) {
    console.error('[userService:turso] Error updating flashcard settings:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to User object
 */
function rowToUser(row: any): User {
  return {
    userId: row.user_id as string,
    email: row.email as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    role: row.role as 'STUDENT' | 'TEACHER',
    photoURL: row.photo_url as string | undefined,
    cefrLevel: row.cefr_level as any,
    teacherId: row.teacher_id as string | null | undefined,
    batchId: row.batch_id as string | null | undefined,
    wordsLearned: row.words_learned as number | undefined,
    wordsMastered: row.words_mastered as number | undefined,
    sentencesCreated: row.sentences_created as number | undefined,
    sentencesPerfect: row.sentences_perfect as number | undefined,
    currentStreak: row.current_streak as number | undefined,
    longestStreak: row.longest_streak as number | undefined,
    totalPracticeTime: row.total_practice_time as number | undefined,
    dailyGoal: row.daily_goal as number | undefined,
    lastActiveDate: row.last_active_date as number | null | undefined,
    notificationsEnabled: Boolean(row.notifications_enabled),
    soundEnabled: Boolean(row.sound_enabled),
    flashcardSettings: row.flashcard_settings
      ? JSON.parse(row.flashcard_settings as string)
      : undefined,
    totalStudents: row.total_students as number | undefined,
    activeBatches: row.active_batches as number | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}
