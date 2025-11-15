/**
 * Activity Service
 * Handles tracking and retrieving student activities
 */

import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Activity, ActivityType } from '@/lib/models/activity';

const ACTIVITIES_COLLECTION = 'activities';

/**
 * Log a student activity
 */
export async function logActivity(activity: Omit<Activity, 'activityId' | 'timestamp'>): Promise<string> {
  try {
    const activityData = {
      ...activity,
      timestamp: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), activityData);
    return docRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
}

/**
 * Get recent activities for all students
 */
export async function getRecentActivities(limitCount: number = 20): Promise<Activity[]> {
  try {
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        activityId: doc.id,
        studentEmail: data.studentEmail,
        studentName: data.studentName,
        type: data.type as ActivityType,
        timestamp: data.timestamp?.toDate() || new Date(),
        metadata: data.metadata,
      };
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

/**
 * Get activities for a specific student
 */
export async function getStudentActivities(
  studentEmail: string,
  limitCount: number = 50
): Promise<Activity[]> {
  try {
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const q = query(
      activitiesRef,
      where('studentEmail', '==', studentEmail),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        activityId: doc.id,
        studentEmail: data.studentEmail,
        studentName: data.studentName,
        type: data.type as ActivityType,
        timestamp: data.timestamp?.toDate() || new Date(),
        metadata: data.metadata,
      };
    });
  } catch (error) {
    console.error('Error fetching student activities:', error);
    return [];
  }
}

/**
 * Get activity count by type
 */
export async function getActivityCountByType(
  studentEmail?: string
): Promise<Record<ActivityType, number>> {
  try {
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const q = studentEmail
      ? query(activitiesRef, where('studentEmail', '==', studentEmail))
      : query(activitiesRef);

    const snapshot = await getDocs(q);

    const counts: Record<ActivityType, number> = {
      [ActivityType.FLASHCARD_CREATED]: 0,
      [ActivityType.FLASHCARD_REVIEWED]: 0,
      [ActivityType.WRITING_SUBMITTED]: 0,
      [ActivityType.WRITING_REVIEWED]: 0,
      [ActivityType.LEVEL_CHANGED]: 0,
      [ActivityType.STREAK_MILESTONE]: 0,
      [ActivityType.LOGIN]: 0,
      [ActivityType.PRACTICE_SESSION]: 0,
    };

    snapshot.docs.forEach(doc => {
      const type = doc.data().type as ActivityType;
      if (type in counts) {
        counts[type]++;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error fetching activity counts:', error);
    return {
      [ActivityType.FLASHCARD_CREATED]: 0,
      [ActivityType.FLASHCARD_REVIEWED]: 0,
      [ActivityType.WRITING_SUBMITTED]: 0,
      [ActivityType.WRITING_REVIEWED]: 0,
      [ActivityType.LEVEL_CHANGED]: 0,
      [ActivityType.STREAK_MILESTONE]: 0,
      [ActivityType.LOGIN]: 0,
      [ActivityType.PRACTICE_SESSION]: 0,
    };
  }
}

/**
 * Helper functions to log specific activities
 */

export async function logFlashcardCreated(studentEmail: string, studentName: string, flashcardId: string, wordCount: number = 1) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.FLASHCARD_CREATED,
    metadata: {
      flashcardId,
      wordCount,
      description: `Created ${wordCount} flashcard${wordCount > 1 ? 's' : ''}`,
    },
  });
}

export async function logFlashcardReviewed(studentEmail: string, studentName: string, flashcardId: string) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.FLASHCARD_REVIEWED,
    metadata: {
      flashcardId,
      description: 'Reviewed flashcard',
    },
  });
}

export async function logWritingSubmitted(
  studentEmail: string,
  studentName: string,
  writingType: string,
  wordLength: number
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.WRITING_SUBMITTED,
    metadata: {
      writingType,
      wordLength,
      description: `Submitted ${writingType} (${wordLength} words)`,
    },
  });
}

export async function logLevelChange(
  studentEmail: string,
  studentName: string,
  oldLevel: string,
  newLevel: string
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.LEVEL_CHANGED,
    metadata: {
      oldLevel,
      newLevel,
      description: `Level changed from ${oldLevel} to ${newLevel}`,
    },
  });
}

export async function logStreakMilestone(
  studentEmail: string,
  studentName: string,
  streakDays: number
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.STREAK_MILESTONE,
    metadata: {
      streakDays,
      description: `Reached ${streakDays}-day streak! 🔥`,
    },
  });
}

export async function logLogin(studentEmail: string, studentName: string) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.LOGIN,
    metadata: {
      description: 'Logged in',
    },
  });
}

export async function logPracticeSession(
  studentEmail: string,
  studentName: string,
  durationMinutes: number
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.PRACTICE_SESSION,
    metadata: {
      description: `Completed ${durationMinutes}-minute practice session`,
    },
  });
}
