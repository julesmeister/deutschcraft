/**
 * Writing Submissions - Turso Implementation
 * Database operations for writing submissions (CRUD)
 */

import { db } from '@/turso/client';
import { WritingSubmission, WritingExerciseType } from '@/lib/models/writing';
import { rowToSubmission } from './helpers';

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get student's submissions
 * @param userId - Student's user ID
 * @param exerciseType - Optional exercise type filter
 * @returns Array of submissions sorted by date
 */
export async function getStudentSubmissions(
  userId: string,
  exerciseType?: WritingExerciseType
): Promise<WritingSubmission[]> {
  try {
    let sql = 'SELECT * FROM writing_submissions WHERE user_id = ?';
    const args: any[] = [userId];

    if (exerciseType) {
      sql += ' AND exercise_type = ?';
      args.push(exerciseType);
    }

    sql += ' ORDER BY updated_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingService:turso] Error fetching student submissions:', error);
    throw error;
  }
}

/**
 * Get single submission by ID
 * @param submissionId - Submission ID
 * @returns Submission object or null
 */
export async function getWritingSubmission(
  submissionId: string
): Promise<WritingSubmission | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_submissions WHERE submission_id = ? LIMIT 1',
      args: [submissionId],
    });

    if (result.rows.length === 0) return null;
    return rowToSubmission(result.rows[0]);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing submission:', error);
    throw error;
  }
}

/**
 * Get all student submissions for a specific exercise
 * @param exerciseId - Exercise ID
 * @returns Array of submissions sorted by submission date
 */
export async function getExerciseSubmissions(
  exerciseId: string
): Promise<WritingSubmission[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_submissions WHERE exercise_id = ? ORDER BY submitted_at DESC',
      args: [exerciseId],
    });

    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingService:turso] Error fetching exercise submissions:', error);
    throw error;
  }
}

/**
 * Get all writing submissions (for teacher review)
 * @param statusFilter - Optional status filter ('submitted', 'reviewed', or 'all')
 * @returns Array of submissions
 */
export async function getAllWritingSubmissions(
  statusFilter?: 'submitted' | 'reviewed' | 'all'
): Promise<WritingSubmission[]> {
  try {
    let sql: string;
    const args: any[] = [];

    if (statusFilter === 'submitted') {
      sql = "SELECT * FROM writing_submissions WHERE status = 'submitted' ORDER BY submitted_at DESC";
    } else if (statusFilter === 'reviewed') {
      sql = "SELECT * FROM writing_submissions WHERE status = 'reviewed' ORDER BY updated_at DESC";
    } else {
      sql = "SELECT * FROM writing_submissions WHERE status IN ('submitted', 'reviewed') ORDER BY updated_at DESC";
    }

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingService:turso] Error fetching all writing submissions:', error);
    throw error;
  }
}

/**
 * Get count of pending writing submissions
 * @returns Number of submissions awaiting review
 */
export async function getPendingWritingCount(): Promise<number> {
  try {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM writing_submissions WHERE status = 'submitted'",
      args: [],
    });

    return Number(result.rows[0].count) || 0;
  } catch (error) {
    console.error('[writingService:turso] Error fetching pending writing count:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new writing submission
 * @param submissionData - Submission data without submissionId
 * @returns Created submission with generated ID
 */
export async function createWritingSubmission(
  submissionData: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<WritingSubmission> {
  try {
    const now = Date.now();
    const submissionId = `ws_${now}_${Math.random().toString(36).substr(2, 9)}`;

    await db.execute({
      sql: `INSERT INTO writing_submissions (
        submission_id, user_id, exercise_id, exercise_type, level, attempt_number,
        content, word_count, character_count, original_text, status,
        started_at, submitted_at, last_saved_at, ai_feedback, teacher_feedback,
        teacher_score, reviewed_by, reviewed_at, version, previous_versions,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        submissionId,
        submissionData.userId,
        submissionData.exerciseId,
        submissionData.exerciseType,
        submissionData.level,
        submissionData.attemptNumber,
        submissionData.content,
        submissionData.wordCount,
        submissionData.characterCount,
        submissionData.originalText || null,
        submissionData.status,
        submissionData.startedAt,
        submissionData.submittedAt || null,
        submissionData.lastSavedAt,
        submissionData.aiFeedback ? JSON.stringify(submissionData.aiFeedback) : null,
        submissionData.teacherFeedback || null,
        submissionData.teacherScore || null,
        submissionData.reviewedBy || null,
        submissionData.reviewedAt || null,
        1,
        submissionData.previousVersions ? JSON.stringify(submissionData.previousVersions) : null,
        now,
        now,
      ],
    });

    return {
      submissionId,
      ...submissionData,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('[writingService:turso] Error creating writing submission:', error);
    throw error;
  }
}

/**
 * Update a writing submission
 * @param submissionId - Submission ID
 * @param updates - Partial submission data to update
 */
export async function updateWritingSubmission(
  submissionId: string,
  updates: Partial<WritingSubmission>
): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.content !== undefined) {
      setClauses.push('content = ?');
      args.push(updates.content);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      args.push(updates.status);
    }
    if (updates.submittedAt !== undefined) {
      setClauses.push('submitted_at = ?');
      args.push(updates.submittedAt);
    }
    if (updates.teacherScore !== undefined) {
      setClauses.push('teacher_score = ?');
      args.push(updates.teacherScore);
    }
    if (updates.teacherFeedback !== undefined) {
      setClauses.push('teacher_feedback = ?');
      args.push(updates.teacherFeedback);
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());

    args.push(submissionId);

    await db.execute({
      sql: `UPDATE writing_submissions SET ${setClauses.join(', ')} WHERE submission_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[writingService:turso] Error updating writing submission:', error);
    throw error;
  }
}

/**
 * Save AI corrected version for a submission
 * @param submissionId - Submission ID
 * @param aiCorrectedVersion - The corrected text
 */
export async function saveAICorrectedVersion(
  submissionId: string,
  aiCorrectedVersion: string
): Promise<void> {
  try {
    const now = Date.now();
    await db.execute({
      sql: 'UPDATE writing_submissions SET ai_corrected_version = ?, ai_corrected_at = ?, updated_at = ? WHERE submission_id = ?',
      args: [aiCorrectedVersion, now, now, submissionId],
    });
  } catch (error) {
    console.error('[writingService:turso] Error saving AI corrected version:', error);
    throw error;
  }
}

/**
 * Submit a writing exercise (change status from draft to submitted)
 * @param submissionId - Submission ID
 */
export async function submitWriting(submissionId: string): Promise<void> {
  try {
    const now = Date.now();
    await db.execute({
      sql: "UPDATE writing_submissions SET status = 'submitted', submitted_at = ?, updated_at = ? WHERE submission_id = ?",
      args: [now, now, submissionId],
    });
  } catch (error) {
    console.error('[writingService:turso] Error submitting writing:', error);
    throw error;
  }
}

/**
 * Delete a writing submission
 * @param submissionId - Submission ID
 */
export async function deleteWritingSubmission(submissionId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM writing_submissions WHERE submission_id = ?',
      args: [submissionId],
    });
  } catch (error) {
    console.error('[writingService:turso] Error deleting writing submission:', error);
    throw error;
  }
}

// ============================================================================
// PAGINATION OPERATIONS
// ============================================================================

/**
 * Get writing submissions with server-side pagination
 * @param options - Pagination and filter options
 * @returns Paginated submissions with hasMore flag
 */
export async function getWritingSubmissionsPaginated(options: {
  pageSize: number;
  lastDoc: any | null;
  statusFilter?: 'submitted' | 'reviewed' | 'all';
  batchId?: string | null;
  studentIds?: string[];
}): Promise<{ submissions: WritingSubmission[]; hasMore: boolean; lastDoc: any | null }> {
  const { pageSize, statusFilter = 'all', batchId = null, studentIds = [] } = options;

  try {
    let sql = 'SELECT * FROM writing_submissions WHERE 1=1';
    const args: any[] = [];

    // Add status filter
    if (statusFilter === 'submitted') {
      sql += " AND status = 'submitted'";
    } else if (statusFilter === 'reviewed') {
      sql += " AND status = 'reviewed'";
    }

    // Add batch filter (via studentIds)
    if (batchId && studentIds.length > 0) {
      const placeholders = studentIds.map(() => '?').join(',');
      sql += ` AND user_id IN (${placeholders})`;
      args.push(...studentIds);
    }

    // Add ordering and limit
    sql += ' ORDER BY updated_at DESC LIMIT ?';
    args.push(pageSize + 1); // Fetch one extra to check if there's more

    const result = await db.execute({ sql, args });

    const hasMore = result.rows.length > pageSize;
    const submissions = result.rows.slice(0, pageSize).map(rowToSubmission);
    const lastDoc = hasMore ? submissions[submissions.length - 1] : null;

    return { submissions, hasMore, lastDoc };
  } catch (error) {
    console.error('[writingService:turso] Error fetching paginated submissions:', error);
    throw error;
  }
}

/**
 * Get total count of writing submissions
 * @param statusFilter - Optional status filter
 * @param studentIds - Optional student IDs filter
 * @returns Total count
 */
export async function getWritingSubmissionsCount(
  statusFilter?: 'submitted' | 'reviewed' | 'all',
  studentIds?: string[]
): Promise<number> {
  try {
    let sql = 'SELECT COUNT(*) as count FROM writing_submissions WHERE 1=1';
    const args: any[] = [];

    // Add status filter
    if (statusFilter === 'submitted') {
      sql += " AND status = 'submitted'";
    } else if (statusFilter === 'reviewed') {
      sql += " AND status = 'reviewed'";
    }

    // Add student IDs filter
    if (studentIds && studentIds.length > 0) {
      const placeholders = studentIds.map(() => '?').join(',');
      sql += ` AND user_id IN (${placeholders})`;
      args.push(...studentIds);
    }

    const result = await db.execute({ sql, args });
    return (result.rows[0]?.count as number) || 0;
  } catch (error) {
    console.error('[writingService:turso] Error counting writing submissions:', error);
    throw error;
  }
}
