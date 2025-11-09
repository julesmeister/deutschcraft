/**
 * PostgreSQL Student Repository (EXAMPLE)
 *
 * This shows how you would implement the StudentRepository for PostgreSQL
 */

import { PostgresBaseRepository } from '../base-repository';
import { StudentRepository, QueryOptions, QueryResult } from '../../types';
import { Student, CEFRLevel } from '../../../models';

export class PostgresStudentRepository extends PostgresBaseRepository<Student> implements StudentRepository {
  constructor() {
    super('students');
  }

  async findByUserId(userId: string): Promise<Student | null> {
    // SQL: SELECT * FROM students WHERE user_id = $1 LIMIT 1
    return this.findOne({
      where: [{ field: 'user_id', operator: '==', value: userId }],
      limit: 1,
    });
  }

  async findByTeacherId(teacherId: string, options?: QueryOptions): Promise<QueryResult<Student>> {
    // SQL: SELECT * FROM students
    //      WHERE teacher_id = $1
    //      ORDER BY last_active_date DESC
    //      LIMIT $2
    return this.findMany({
      where: [{ field: 'teacher_id', operator: '==', value: teacherId }],
      orderBy: [{ field: 'last_active_date', direction: 'desc' }],
      ...options,
    });
  }

  async findByLevel(level: CEFRLevel): Promise<Student[]> {
    // SQL: SELECT * FROM students WHERE current_level = $1
    const result = await this.findMany({
      where: [{ field: 'current_level', operator: '==', value: level }],
    });
    return result.data;
  }

  async findActiveStudents(teacherId?: string): Promise<Student[]> {
    // SQL: SELECT * FROM students
    //      WHERE last_active_date > $1
    //      AND (teacher_id = $2 OR $2 IS NULL)
    //      ORDER BY last_active_date DESC

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const whereConditions: Array<{ field: string; operator: '>' | '=='; value: number | string }> = [
      { field: 'last_active_date', operator: '>', value: oneDayAgo },
    ];

    if (teacherId) {
      whereConditions.push({ field: 'teacher_id', operator: '==', value: teacherId });
    }

    const result = await this.findMany({
      where: whereConditions,
      orderBy: [{ field: 'last_active_date', direction: 'desc' }],
    });

    return result.data;
  }

  async updateStats(
    studentId: string,
    stats: Partial<Pick<Student, 'wordsLearned' | 'wordsMastered' | 'currentStreak' | 'totalPracticeTime'>>
  ): Promise<Student> {
    // SQL: UPDATE students
    //      SET words_learned = $1, words_mastered = $2, current_streak = $3, total_practice_time = $4, updated_at = $5
    //      WHERE id = $6
    //      RETURNING *

    return this.update(studentId, stats);
  }
}
