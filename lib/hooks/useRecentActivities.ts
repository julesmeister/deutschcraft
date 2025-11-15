/**
 * useRecentActivities Hook
 * Aggregates recent activities from existing collections (progress from Firestore, submissions from Turso)
 * This replaces the custom activities collection approach
 */

import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserFullName } from '../models/user';
import { getUser } from '../services/userService';
import { getAllWritingSubmissions } from '../services/writingService';

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
        // Fetch recent flashcard sessions from Firestore 'progress' collection
        console.log('📚 [Firestore] Querying progress collection...');
        const progressRef = collection(db, 'progress');
        const progressQuery = query(progressRef, orderBy('date', 'desc'), limit(limitCount));
        const progressSnapshot = await getDocs(progressQuery);
        console.log('📊 [Firestore] Found progress documents:', progressSnapshot.docs.length);

        for (const doc of progressSnapshot.docs) {
          const data = doc.data();
          console.log('📄 [Progress] Document:', {
            id: doc.id,
            userId: data.userId,
            date: data.date,
            cardsReviewed: data.cardsReviewed,
            rawData: data
          });

          const studentEmail = data.userId;

          // Fetch student name
          const student = await getUser(studentEmail);
          console.log('👤 [User] Fetched student for', studentEmail, ':', student);
          const studentName = student ? getUserFullName(student) : studentEmail;
          console.log('✅ [Name] Resolved name:', studentName);

          activities.push({
            id: doc.id,
            studentEmail,
            studentName,
            type: 'flashcard_session',
            timestamp: new Date(data.date || Date.now()),
            description: `Reviewed ${data.cardsReviewed || 0} flashcards`,
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
