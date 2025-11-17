/**
 * User Service - Pagination Operations
 *
 * Server-side pagination functions for efficient data fetching
 */

import { db } from '../firebase';
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
import { User } from '../models';

/**
 * Get users with pagination and optional role filter
 * Optimized with Firestore query and server-side pagination
 *
 * @param options - Pagination options
 * @param options.pageSize - Number of users per page (default: 50)
 * @param options.lastDoc - Last document from previous page (for pagination)
 * @param options.roleFilter - Optional role filter ('STUDENT' | 'TEACHER' | 'all')
 * @param options.orderByField - Field to order by (default: 'userId')
 * @returns Object containing users array and last document for next page
 */
export async function getUsersPaginated(options: {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
  roleFilter?: 'STUDENT' | 'TEACHER' | 'all';
  orderByField?: string;
}): Promise<{
  users: User[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}> {
  try {
    const {
      pageSize = 50,
      lastDoc = null,
      roleFilter = 'all',
      orderByField = 'userId',
    } = options;

    const usersRef = collection(db, 'users');

    // Build query with filters
    let q = query(
      usersRef,
      orderBy(orderByField),
      limit(pageSize + 1) // Fetch one extra to check if there are more pages
    );

    // Add role filter if specified
    if (roleFilter !== 'all') {
      q = query(
        usersRef,
        where('role', '==', roleFilter),
        orderBy(orderByField),
        limit(pageSize + 1)
      );
    }

    // Add pagination cursor if provided
    if (lastDoc) {
      q = query(
        usersRef,
        ...(roleFilter !== 'all' ? [where('role', '==', roleFilter)] : []),
        orderBy(orderByField),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }

    const snapshot = await getDocs(q);

    // Check if there are more results
    const hasMore = snapshot.docs.length > pageSize;

    // Get only the requested page size
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

    const users: User[] = docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as User[];

    // Get the last document for next page
    const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

    return {
      users,
      lastDoc: newLastDoc,
      hasMore,
    };
  } catch (error) {
    console.error('[getUsersPaginated] Error:', error);
    throw error;
  }
}

/**
 * Get total count of users (optionally filtered by role)
 * Uses Firestore aggregation for efficiency
 *
 * @param roleFilter - Optional role filter ('STUDENT' | 'TEACHER' | 'all')
 * @returns Total count of users
 */
export async function getUserCount(roleFilter: 'STUDENT' | 'TEACHER' | 'all' = 'all'): Promise<number> {
  try {
    const usersRef = collection(db, 'users');

    let q = query(usersRef);

    // Add role filter if specified
    if (roleFilter !== 'all') {
      q = query(usersRef, where('role', '==', roleFilter));
    }

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('[getUserCount] Error:', error);
    throw error;
  }
}

/**
 * Get pending enrollment requests with pagination
 * Optimized for enrollment approvals page
 *
 * Note: We fetch all users and filter client-side because Firestore doesn't support
 * OR queries on different fields (role OR enrollmentStatus). This is acceptable
 * because pending enrollments are typically small in number.
 *
 * @param options - Pagination options
 * @returns Object containing pending users and pagination info
 */
export async function getPendingEnrollmentsPaginated(options: {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
}): Promise<{
  users: User[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}> {
  try {
    const { pageSize = 10, lastDoc = null } = options;

    const usersRef = collection(db, 'users');

    // Fetch all users (we need to check multiple conditions: role OR enrollmentStatus)
    // This is acceptable because pending enrollments are typically small in number
    // Note: Not using orderBy here because not all users have enrollmentSubmittedAt field
    const snapshot = await getDocs(usersRef);
    console.log('[getPendingEnrollmentsPaginated] Fetching all users...');

    // Filter for pending approval users
    // Include users where:
    // 1. role === 'PENDING_APPROVAL'
    // 2. enrollmentStatus === 'pending'
    // 3. No role field (legacy users)
    console.log('[getPendingEnrollmentsPaginated] Total users fetched:', snapshot.docs.length);
    const allPending = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const isPending = (
        data.role === 'PENDING_APPROVAL' ||
        data.enrollmentStatus === 'pending' ||
        !data.role
      );
      if (isPending) {
        console.log('[getPendingEnrollmentsPaginated] Found pending user:', doc.id, {
          role: data.role,
          enrollmentStatus: data.enrollmentStatus,
        });
      }
      return isPending;
    });
    console.log('[getPendingEnrollmentsPaginated] Total pending users:', allPending.length);

    // Sort by enrollmentSubmittedAt (most recent first)
    allPending.sort((a, b) => {
      const aTime = a.data().enrollmentSubmittedAt || 0;
      const bTime = b.data().enrollmentSubmittedAt || 0;
      return bTime - aTime; // Descending order
    });

    // Find start index based on lastDoc
    let startIndex = 0;
    if (lastDoc) {
      const lastDocIndex = allPending.findIndex((doc) => doc.id === lastDoc.id);
      startIndex = lastDocIndex !== -1 ? lastDocIndex + 1 : 0;
    }

    // Apply pagination
    const hasMore = startIndex + pageSize < allPending.length;
    const docs = allPending.slice(startIndex, startIndex + pageSize);

    const users: User[] = docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as User[];

    const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

    return { users, lastDoc: newLastDoc, hasMore };
  } catch (error) {
    console.error('[getPendingEnrollmentsPaginated] Error:', error);
    throw error;
  }
}

/**
 * Get total count of pending enrollments
 *
 * @returns Total count of pending enrollment requests
 */
export async function getPendingEnrollmentsCount(): Promise<number> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    // Filter for pending approval users
    // Include users where:
    // 1. role === 'PENDING_APPROVAL'
    // 2. enrollmentStatus === 'pending'
    // 3. No role field (legacy users)
    const pendingCount = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return (
        data.role === 'PENDING_APPROVAL' ||
        data.enrollmentStatus === 'pending' ||
        !data.role
      );
    }).length;

    return pendingCount;
  } catch (error) {
    console.error('[getPendingEnrollmentsCount] Error:', error);
    throw error;
  }
}
