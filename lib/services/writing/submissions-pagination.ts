/**
 * Writing Submissions Service - Pagination Operations
 * Server-side pagination with Firestore cursor-based pagination
 */

import { db } from '../../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { WritingSubmission } from '../../models/writing';

/**
 * Get writing submissions with pagination and filters
 * Optimized with Firestore query and server-side pagination
 *
 * @param options - Pagination and filter options
 * @returns Object containing submissions array, last document, and hasMore flag
 */
export async function getWritingSubmissionsPaginated(options: {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
  statusFilter?: 'submitted' | 'reviewed' | 'all';
  batchId?: string | null;
  studentIds?: string[];
}): Promise<{
  submissions: WritingSubmission[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}> {
  try {
    const {
      pageSize = 10,
      lastDoc = null,
      statusFilter = 'all',
      batchId = null,
      studentIds = [],
    } = options;

    const submissionsRef = collection(db, 'writing-submissions');

    // Build query constraints
    const constraints: any[] = [];

    // Add status filter
    if (statusFilter === 'submitted') {
      constraints.push(where('status', '==', 'submitted'));
    } else if (statusFilter === 'reviewed') {
      constraints.push(where('status', '==', 'reviewed'));
    } else {
      constraints.push(where('status', 'in', ['submitted', 'reviewed']));
    }

    // Add batch filter (via studentIds)
    // OPTIMIZATION: Only filter by studentIds when a specific batch is selected
    if (batchId) {
      if (studentIds.length === 0) {
        // Batch selected but no students in it - return empty results early
        return {
          submissions: [],
          lastDoc: null,
          hasMore: false,
        };
      }
      // Firestore 'in' query limited to 10 items, so we chunk if needed
      const chunkedStudentIds = studentIds.slice(0, 10); // Limit to first 10 for this query
      constraints.push(where('userId', 'in', chunkedStudentIds));
    }
    // If batchId is null, don't add any userId filter (show all submissions from all students)

    // Add ordering
    constraints.push(
      statusFilter === 'submitted'
        ? orderBy('submittedAt', 'desc')
        : orderBy('updatedAt', 'desc')
    );

    // Add pagination cursor
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Add limit (fetch one extra to check if there are more pages)
    constraints.push(limit(pageSize + 1));

    const q = query(submissionsRef, ...constraints);
    const snapshot = await getDocs(q);

    // Check if there are more results
    const hasMore = snapshot.docs.length > pageSize;

    // Get only the requested page size
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

    const submissions: WritingSubmission[] = docs.map((doc) => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];

    // Get the last document for next page
    const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

    return {
      submissions,
      lastDoc: newLastDoc,
      hasMore,
    };
  } catch (error) {
    console.error('[getWritingSubmissionsPaginated] Error:', error);
    throw error;
  }
}

/**
 * Get total count of writing submissions (optionally filtered by status and batch)
 *
 * @param statusFilter - Optional status filter
 * @param studentIds - Optional array of student IDs (for batch filtering)
 * @returns Total count of submissions
 */
export async function getWritingSubmissionsCount(
  statusFilter: 'submitted' | 'reviewed' | 'all' = 'all',
  studentIds?: string[]
): Promise<number> {
  try {
    // OPTIMIZATION: Early return if filtering by batch with no students
    if (studentIds && studentIds.length === 0) {
      return 0;
    }

    const submissionsRef = collection(db, 'writing-submissions');
    const constraints: any[] = [];

    // Add status filter
    if (statusFilter === 'submitted') {
      constraints.push(where('status', '==', 'submitted'));
    } else if (statusFilter === 'reviewed') {
      constraints.push(where('status', '==', 'reviewed'));
    } else {
      constraints.push(where('status', 'in', ['submitted', 'reviewed']));
    }

    // Add batch filter (via studentIds)
    // OPTIMIZATION: Only add filter if studentIds provided and not empty
    if (studentIds && studentIds.length > 0) {
      const chunkedStudentIds = studentIds.slice(0, 10); // Limit to first 10
      constraints.push(where('userId', 'in', chunkedStudentIds));
    }
    // If studentIds is undefined/null, don't filter by userId (show all)

    const q = query(submissionsRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('[getWritingSubmissionsCount] Error:', error);
    throw error;
  }
}
