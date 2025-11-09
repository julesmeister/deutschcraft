/**
 * Firestore Flashcard Progress Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { FlashcardProgressRepository, QueryOptions, QueryResult } from '../../types';
import { FlashcardProgress } from '../../../models';

export class FirestoreFlashcardProgressRepository
  extends FirestoreBaseRepository<FlashcardProgress>
  implements FlashcardProgressRepository
{
  constructor(db: Firestore) {
    super(db, 'flashcardProgress');
  }

  async findByUserId(userId: string, options?: QueryOptions): Promise<QueryResult<FlashcardProgress>> {
    return this.findMany({
      where: [{ field: 'userId', operator: '==', value: userId }],
      ...options,
    });
  }

  async findByWordId(userId: string, wordId: string): Promise<FlashcardProgress | null> {
    return this.findOne({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'wordId', operator: '==', value: wordId },
      ],
      limit: 1,
    });
  }

  async findDueForReview(userId: string, date?: number): Promise<FlashcardProgress[]> {
    const reviewDate = date || Date.now();

    const result = await this.findMany({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'nextReviewDate', operator: '<=', value: reviewDate },
      ],
      orderBy: [{ field: 'nextReviewDate', direction: 'asc' }],
    });

    return result.data;
  }

  async updateAfterReview(
    progressId: string,
    correct: boolean,
    nextReviewDate: number
  ): Promise<FlashcardProgress> {
    const progress = await this.findById(progressId);
    if (!progress) {
      throw new Error(`FlashcardProgress ${progressId} not found`);
    }

    // Update stats based on whether answer was correct
    const updates: Partial<FlashcardProgress> = {
      lastReviewDate: Date.now(),
      nextReviewDate,
      repetitions: progress.repetitions + 1,
    };

    if (correct) {
      updates.correctCount = progress.correctCount + 1;
      // Simple mastery calculation: correctCount / totalReviews * 100
      updates.masteryLevel = Math.min(
        100,
        ((progress.correctCount + 1) / (progress.correctCount + progress.incorrectCount + 1)) * 100
      );
    } else {
      updates.incorrectCount = progress.incorrectCount + 1;
      updates.masteryLevel = Math.max(
        0,
        (progress.correctCount / (progress.correctCount + progress.incorrectCount + 1)) * 100
      );
    }

    return this.update(progressId, updates);
  }
}
