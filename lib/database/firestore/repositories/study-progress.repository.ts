/**
 * Firestore Study Progress Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { StudyProgressRepository, QueryOptions, QueryResult } from '../../types';
import { StudyProgress } from '../../../models';

export class FirestoreStudyProgressRepository
  extends FirestoreBaseRepository<StudyProgress>
  implements StudyProgressRepository
{
  constructor(db: Firestore) {
    super(db, 'studyProgress');
  }

  async findByUserId(userId: string, options?: QueryOptions): Promise<QueryResult<StudyProgress>> {
    return this.findMany({
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'date', direction: 'desc' }],
      ...options,
    });
  }

  async findByDateRange(userId: string, startDate: number, endDate: number): Promise<StudyProgress[]> {
    const result = await this.findMany({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
      ],
      orderBy: [{ field: 'date', direction: 'asc' }],
    });

    return result.data;
  }

  async getTodayProgress(userId: string): Promise<StudyProgress | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfDay = tomorrow.getTime();

    return this.findOne({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'date', operator: '>=', value: startOfDay },
        { field: 'date', operator: '<', value: endOfDay },
      ],
      limit: 1,
    });
  }

  async getWeeklyProgress(userId: string): Promise<StudyProgress[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.findByDateRange(userId, sevenDaysAgo.getTime(), today.getTime());
  }
}
