/**
 * Session Service
 * Abstracts database operations for session data
 * Easy to swap out database implementation (Firestore -> PostgreSQL, etc.)
 */

import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface RecentSession {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timeSpent: number;
}

export interface PaginationResult {
  sessions: RecentSession[];
  hasMore: boolean;
  cursor: any; // Database-specific cursor
}

/**
 * Fetch paginated sessions
 * @param userId - User email/ID
 * @param pageSize - Number of items per page
 * @param cursor - Optional cursor for pagination (from previous page)
 */
export async function fetchSessions(
  userId: string,
  pageSize: number = 8,
  cursor?: any
): Promise<PaginationResult> {
  // FIRESTORE IMPLEMENTATION
  // To switch to another DB, just replace this implementation

  const progressRef = collection(db, 'progress');
  let progressQuery;

  if (cursor) {
    // Paginated query
    progressQuery = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      startAfter(cursor),
      limit(pageSize)
    );
  } else {
    // First page
    progressQuery = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(pageSize)
    );
  }

  const progressSnapshot = await getDocs(progressQuery);

  const sessions: RecentSession[] = progressSnapshot.docs.map(doc => {
    const data = doc.data();
    const total = (data.wordsCorrect || 0) + (data.wordsIncorrect || 0);
    const accuracy = total > 0 ? Math.round((data.wordsCorrect / total) * 100) : 0;

    return {
      date: data.date || doc.id.replace('PROG_', '').slice(0, 8),
      cardsReviewed: data.cardsReviewed || 0,
      accuracy,
      timeSpent: data.timeSpent || 0,
    };
  });

  const hasMore = progressSnapshot.docs.length === pageSize;
  const newCursor = progressSnapshot.docs.length > 0
    ? progressSnapshot.docs[progressSnapshot.docs.length - 1]
    : null;

  return {
    sessions,
    hasMore,
    cursor: newCursor,
  };
}

/*
  EXAMPLE: PostgreSQL Implementation (commented out)

  export async function fetchSessions(
    userId: string,
    pageSize: number = 8,
    cursor?: any
  ): Promise<PaginationResult> {
    const offset = cursor || 0;

    const result = await sql`
      SELECT date, cards_reviewed, accuracy, time_spent
      FROM progress
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    return {
      sessions: result.rows,
      hasMore: result.rows.length === pageSize,
      cursor: offset + pageSize,
    };
  }
*/
