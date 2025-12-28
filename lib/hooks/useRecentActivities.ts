/**
 * useRecentActivities Hook
 * TURSO MIGRATION: Now uses Turso database for all data sources
 * Aggregates recent activities from progress and writing submissions
 */

import { useQuery } from '@tanstack/react-query';
import { getUserFullName, User } from '../models/user';
import { getUser } from '../services/turso/userService';
import { getRecentStudyProgress } from '../services/turso/flashcards';
import { getAllWritingSubmissions } from '../services/turso/writing';

export interface AggregatedActivity {
  id: string;
  studentEmail: string;
  studentName: string;
  type: 'flashcard_session' | 'writing_submission';
  timestamp: Date;
  description: string;
  icon: string;
  color: string;
}

/**
 * Fetch recent activities from all students by aggregating from existing collections
 */
export function useRecentActivities(limitCount: number = 20, students: User[] = []) {
  return useQuery({
    queryKey: ['recent-activities', limitCount, students.length],
    queryFn: async () => {
      const activities: AggregatedActivity[] = [];
      console.log('🔍 [useRecentActivities] Starting to fetch activities...');
      console.log('📊 [Config] Limit:', limitCount);

      // Helper to resolve student name from provided list or fetch async
      const resolveStudentName = async (userId: string) => {
        // 1. Try to find in provided students list (synchronous)
        const foundStudent = students.find(s => s.userId === userId || s.email === userId);
        if (foundStudent) {
          return getUserFullName(foundStudent);
        }

        // 2. Fallback to async fetch
        try {
          const fetchedStudent = await getUser(userId);
          if (fetchedStudent) {
            return getUserFullName(fetchedStudent);
          }
        } catch (e) {
          console.warn(`Failed to fetch user ${userId}`, e);
        }

        return userId; // Fallback to email/ID
      };

      try {
        // Fetch recent flashcard sessions from Turso progress table
        console.log('📚 [Turso] Querying progress table...');
        const progressEntries = await getRecentStudyProgress(limitCount);
        console.log('📊 [Turso] Found progress entries:', progressEntries.length);

        for (const entry of progressEntries) {
          const studentEmail = entry.userId;
          const studentName = await resolveStudentName(studentEmail);

          activities.push({
            id: entry.progressId,
            studentEmail,
            studentName,
            type: 'flashcard_session',
            timestamp: new Date(entry.date),
            description: `Reviewed ${entry.cardsReviewed || 0} flashcards`,
            icon: '✅',
            color: 'bg-green-500',
          });
        }

        console.log('📝 [Activities] After progress:', activities.length, 'activities');

        // Fetch recent writing submissions from Turso database
        console.log('✍️ [Turso] Fetching writing submissions...');
        const submissions = await getAllWritingSubmissions('all');
        console.log('✍️ [Turso] Found submissions:', submissions.length);

        for (const submission of submissions.slice(0, limitCount)) {
          const studentName = await resolveStudentName(submission.userId);

          activities.push({
            id: submission.submissionId,
            studentEmail: submission.userId,
            studentName,
            type: 'writing_submission',
            timestamp: new Date(submission.submittedAt || submission.createdAt),
            description: `Submitted ${submission.exerciseType || 'writing exercise'}`,
            icon: '✍️',
            color: 'bg-blue-500',
          });
        }

        console.log('📝 [Activities] After submissions:', activities.length, 'total activities');

        // Sort all activities by timestamp (most recent first)
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        console.log('🔀 [Sort] Activities sorted by timestamp');

        // Return only the requested limit
        const finalActivities = activities.slice(0, limitCount);
        return finalActivities;
      } catch (error) {
        console.error('❌ [Error] Error fetching recent activities:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
