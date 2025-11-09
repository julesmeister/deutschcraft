/**
 * Firestore Student Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { StudentRepository, QueryOptions, QueryResult } from '../../types';
import { Student, CEFRLevel } from '../../../models';

export class FirestoreStudentRepository extends FirestoreBaseRepository<Student> implements StudentRepository {
  constructor(db: Firestore) {
    super(db, 'students');
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return this.findOne({
      where: [{ field: 'userId', operator: '==', value: userId }],
      limit: 1,
    });
  }

  async findByTeacherId(teacherId: string, options?: QueryOptions): Promise<QueryResult<Student>> {
    return this.findMany({
      where: [{ field: 'teacherId', operator: '==', value: teacherId }],
      orderBy: [{ field: 'lastActiveDate', direction: 'desc' }],
      ...options,
    });
  }

  async findByLevel(level: CEFRLevel): Promise<Student[]> {
    const result = await this.findMany({
      where: [{ field: 'currentLevel', operator: '==', value: level }],
    });
    return result.data;
  }

  async findActiveStudents(teacherId?: string): Promise<Student[]> {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const whereConditions: Array<{ field: string; operator: '>' | '=='; value: number | string }> = [
      { field: 'lastActiveDate', operator: '>', value: oneDayAgo },
    ];

    if (teacherId) {
      whereConditions.push({ field: 'teacherId', operator: '==', value: teacherId });
    }

    const result = await this.findMany({
      where: whereConditions,
      orderBy: [{ field: 'lastActiveDate', direction: 'desc' }],
    });

    return result.data;
  }

  async updateStats(
    studentId: string,
    stats: Partial<Pick<Student, 'wordsLearned' | 'wordsMastered' | 'currentStreak' | 'totalPracticeTime'>>
  ): Promise<Student> {
    return this.update(studentId, stats);
  }
}
