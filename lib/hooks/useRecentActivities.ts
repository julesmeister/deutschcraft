/**
 * useRecentActivities Hook
 * TURSO MIGRATION: Now uses Turso database for all data sources
 * Aggregates recent activities from progress and writing submissions
 */

import { useQuery } from '@tanstack/react-query';
import { getUserFullName } from '../models/user';
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
export function useRecentActivities(limitCount: number = 20) {
  return useQuery({
    queryKey: ['recent-activities', limitCount],
    queryFn: async () => {
      const activities: AggregatedActivity[] = [];
      console.log('🔍 [useRecentActivities] Starting to fetch activities...');
      console.log('📊 [Config] Limit:', limitCount);

      try {
        // Fetch recent flashcard sessions from Turso progress table
        console.log('📚 [Turso] Querying progress table...');
        const progressEntries = await getRecentStudyProgress(limitCount);
        console.log('📊 [Turso] Found progress entries:', progressEntries.length);

        for (const entry of progressEntries) {
          console.log('📄 [Progress] Entry:', {
            progressId: entry.progressId,
            userId: entry.userId,
            date: entry.date,
            cardsReviewed: entry.cardsReviewed,
            rawData: entry
          });

          const studentEmail = entry.userId;

          // Fetch student name
          const student = await getUser(studentEmail);
          console.log('👤 [User] Fetched student for', studentEmail, ':', student);
          const studentName = student ? getUserFullName(student) : studentEmail;
          console.log('✅ [Name] Resolved name:', studentName);

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
          console.log('📝 [Submission] Document:', {
            submissionId: submission.submissionId,
            userId: submission.userId,
            exerciseType: submission.exerciseType,
            submittedAt: submission.submittedAt,
            createdAt: submission.createdAt,
            rawData: submission
          });

          // Fetch student name
          const student = await getUser(submission.userId);
          console.log('👤 [User] Fetched student for', submission.userId, ':', student);
          const studentName = student ? getUserFullName(student) : submission.userId;
          console.log('✅ [Name] Resolved name:', studentName);

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
        console.log('✅ [Final] Returning', finalActivities.length, 'activities');
        console.log('📋 [Final] Activities:', finalActivities);
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
