/**
 * User Service - Database abstraction layer for user operations
 *
 * This service consolidates all user-related database operations.
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { db } from "../firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  collection,
} from "firebase/firestore";
import { User } from "../models";

// Re-export pagination operations
export {
  getUsersPaginated,
  getUserCount,
  getPendingEnrollmentsPaginated,
  getPendingEnrollmentsCount,
} from "./userPagination";

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get a single user by email
 * @param email - User's email (document ID)
 * @returns User object or null if not found
 */
export async function getUser(email: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      userId: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all students for a specific teacher
 * @param teacherEmail - Teacher's email
 * @returns Array of student User objects
 */
export async function getTeacherStudents(
  teacherEmail: string
): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const students: User[] = snapshot.docs
      .map(
        (doc) =>
          ({
            userId: doc.id,
            ...doc.data(),
          } as User)
      )
      .filter((user) => {
        const role = (user.role || "").toUpperCase();
        return role === "STUDENT" && user.teacherId === teacherEmail;
      });

    return students;
  } catch (error) {
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
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const students: User[] = snapshot.docs
      .map(
        (doc) =>
          ({
            userId: doc.id,
            ...doc.data(),
          } as User)
      )
      .filter((user) => {
        const role = (user.role || "").toUpperCase();
        return role === "STUDENT" && user.batchId === batchId;
      });

    return students;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all students (admin view)
 * @returns Array of all student User objects
 */
export async function getAllStudents(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const students: User[] = snapshot.docs
      .map(
        (doc) =>
          ({
            userId: doc.id,
            ...doc.data(),
          } as User)
      )
      .filter((user) => {
        const role = (user.role || "").toUpperCase();
        return role === "STUDENT";
      });

    return students;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all non-teacher users (students and pending users)
 * Optimized: Uses Firestore 'in' query to fetch only non-teachers
 * @returns Array of all non-teacher User objects (limited to first 10 for performance)
 */
export async function getAllNonTeachers(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");

    // Firestore query: role IN ['STUDENT', 'PENDING_APPROVAL']
    // This is more efficient than fetching all users and filtering client-side
    const q = query(
      usersRef,
      where("role", "in", ["STUDENT", "PENDING_APPROVAL"]),
      orderBy("firstName", "asc"),
      limit(10) // Limit to 10 users for performance
    );

    const snapshot = await getDocs(q);

    const users: User[] = snapshot.docs.map(
      (doc) =>
        ({
          userId: doc.id,
          ...doc.data(),
        } as User)
    );

    return users;
  } catch (error) {
    console.error("[userService] Error fetching non-teachers:", error);
    throw error;
  }
}

/**
 * Get all teachers
 * @returns Array of all teacher User objects
 */
export async function getAllTeachers(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const teachers: User[] = snapshot.docs
      .map(
        (doc) =>
          ({
            userId: doc.id,
            ...doc.data(),
          } as User)
      )
      .filter((user) => {
        const role = (user.role || "").toUpperCase();
        return role === "TEACHER";
      });

    return teachers;
  } catch (error) {
    throw error;
  }
}

/**
 * Get students without a teacher (unassigned)
 * @returns Array of unassigned student User objects
 */
export async function getStudentsWithoutTeacher(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const students: User[] = snapshot.docs
      .map(
        (doc) =>
          ({
            userId: doc.id,
            ...doc.data(),
          } as User)
      )
      .filter((user) => {
        const role = (user.role || "").toUpperCase();
        const hasNoTeacher =
          user.teacherId === null || user.teacherId === undefined;
        return role === "STUDENT" && hasNoTeacher;
      });

    return students;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all users (students, teachers, and pending)
 * @returns Array of all users
 */
export async function getUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
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
export async function upsertUser(
  user: Partial<User> & { email: string }
): Promise<void> {
  try {
    const userRef = doc(db, "users", user.email);
    await setDoc(
      userRef,
      {
        userId: user.email,
        ...user,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Update user details
 * @param email - User's email (document ID)
 * @param updates - Partial user object with fields to update
 */
export async function updateUser(
  email: string,
  updates: Partial<User>
): Promise<void> {
  try {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user's photo URL
 * Used by auth layer during sign-in
 * @param email - User's email (document ID)
 * @param photoURL - New photo URL
 */
export async function updateUserPhoto(
  email: string,
  photoURL: string | null
): Promise<void> {
  try {
    const userRef = doc(db, "users", email);

    // Check if user exists first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return;
    }

    const userData = userDoc.data();

    // Only update if photoURL is different (avoid unnecessary writes)
    if (userData.photoURL !== photoURL) {
      await setDoc(
        userRef,
        {
          photoURL,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    // Silent fail - photo update is not critical
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
    const userRef = doc(db, "users", studentEmail);
    const updates: any = {
      batchId,
      updatedAt: Date.now(),
    };

    if (teacherId) {
      updates.teacherId = teacherId;
    }

    await updateDoc(userRef, updates);
  } catch (error) {
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
    throw error;
  }
}

/**
 * Update user's flashcard settings
 * @param email - User's email
 * @param settings - Flashcard settings to update
 */
export async function updateFlashcardSettings(
  email: string,
  settings: any
): Promise<void> {
  try {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, {
      flashcardSettings: settings,
      updatedAt: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user's dashboard settings
 * @param email - User's email
 * @param settings - Dashboard settings to update
 */
export async function updateDashboardSettings(
  email: string,
  settings: any
): Promise<void> {
  try {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, {
      dashboardSettings: settings,
      updatedAt: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a user account (only for unapproved users)
 * @param email - User's email (document ID)
 */
export async function deleteUser(email: string): Promise<void> {
  try {
    const userRef = doc(db, "users", email);
    await deleteDoc(userRef);
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function getUser(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;

  return result.rows.length > 0 ? result.rows[0] as User : null;
}

export async function getTeacherStudents(teacherEmail: string): Promise<User[]> {
  const result = await sql`
    SELECT * FROM users
    WHERE role = 'STUDENT' AND teacher_id = ${teacherEmail}
    ORDER BY first_name ASC
  `;

  return result.rows as User[];
}

export async function updateUser(email: string, updates: Partial<User>): Promise<void> {
  const fields = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  const values = [email, ...Object.values(updates)];

  await sql.query(
    `UPDATE users SET ${fields}, updated_at = NOW() WHERE email = $1`,
    values
  );
}

// ... other functions follow the same pattern
*/
