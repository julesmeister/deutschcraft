/**
 * React Query hooks for Writing Reviews
 * Handles peer reviews and teacher reviews
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// PEER REVIEW HOOKS
// ============================================================================

/**
 * Get peer reviews for a submission
 */
export function usePeerReviews(submissionId?: string) {
  return useQuery({
    queryKey: ['peer-reviews', submissionId],
    queryFn: async () => {
      if (!submissionId) return [];

      const reviewsRef = collection(db, 'peer-reviews');
      const q = query(
        reviewsRef,
        where('submissionId', '==', submissionId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        reviewId: doc.id,
      })) as any[]; // Type cast to avoid inference issues
    },
    enabled: !!submissionId,
  });
}

/**
 * Get reviews assigned to a student (to do)
 */
export function useAssignedPeerReviews(reviewerId?: string) {
  return useQuery({
    queryKey: ['assigned-peer-reviews', reviewerId],
    queryFn: async () => {
      if (!reviewerId) return [];

      const reviewsRef = collection(db, 'peer-reviews');
      const q = query(
        reviewsRef,
        where('reviewerId', '==', reviewerId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        reviewId: doc.id,
      }));
    },
    enabled: !!reviewerId,
  });
}

/**
 * Create a peer review
 */
export function useCreatePeerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const reviewsRef = collection(db, 'peer-reviews');
      const now = Date.now();

      const reviewData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(reviewsRef, reviewData);
      return { reviewId: docRef.id, ...reviewData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['assigned-peer-reviews', data.reviewerId] });
    },
  });
}

/**
 * Update a peer review
 */
export function useUpdatePeerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: any }) => {
      const reviewRef = doc(db, 'peer-reviews', reviewId);

      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Date.now(),
      });

      return { reviewId, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-peer-reviews'] });
    },
  });
}

// ============================================================================
// TEACHER REVIEW HOOKS
// ============================================================================

/**
 * Get teacher review for a submission
 */
export function useTeacherReview(submissionId?: string) {
  return useQuery({
    queryKey: ['teacher-review', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;

      const reviewsRef = collection(db, 'teacher-reviews');
      const q = query(
        reviewsRef,
        where('submissionId', '==', submissionId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return {
        ...snapshot.docs[0].data(),
        reviewId: snapshot.docs[0].id,
      } as any; // Type cast to avoid inference issues
    },
    enabled: !!submissionId,
  });
}

/**
 * Get all reviews by a teacher
 */
export function useTeacherReviews(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-reviews-by-teacher', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const reviewsRef = collection(db, 'teacher-reviews');
      const q = query(
        reviewsRef,
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        reviewId: doc.id,
      }));
    },
    enabled: !!teacherId,
  });
}

/**
 * Create a teacher review
 */
export function useCreateTeacherReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const reviewsRef = collection(db, 'teacher-reviews');
      const now = Date.now();

      const reviewData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(reviewsRef, reviewData);

      // Update submission status to 'reviewed' and add teacher feedback fields
      const submissionRef = doc(db, 'writing-submissions', data.submissionId);
      await updateDoc(submissionRef, {
        status: 'reviewed',
        teacherFeedback: {
          grammarScore: data.grammarScore,
          vocabularyScore: data.vocabularyScore,
          coherenceScore: data.coherenceScore,
          overallScore: data.overallScore,
        },
        teacherScore: data.overallScore,
        updatedAt: now,
      });

      return { reviewId: docRef.id, ...reviewData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-review', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-reviews-by-teacher', data.teacherId] });
      queryClient.invalidateQueries({ queryKey: ['writing-submission', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['all-writing-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-writing-count'] });
      queryClient.invalidateQueries({ queryKey: ['writing-stats', data.studentId] });
    },
  });
}

/**
 * Update a teacher review
 */
export function useUpdateTeacherReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: any }) => {
      const reviewRef = doc(db, 'teacher-reviews', reviewId);

      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Date.now(),
      });

      return { reviewId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-review'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-reviews-by-teacher'] });
    },
  });
}
