/**
 * Firestore Teacher Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { TeacherRepository } from '../../types';
import { Teacher } from '../../../models';

export class FirestoreTeacherRepository extends FirestoreBaseRepository<Teacher> implements TeacherRepository {
  constructor(db: Firestore) {
    super(db, 'teachers');
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    return this.findOne({
      where: [{ field: 'userId', operator: '==', value: userId }],
      limit: 1,
    });
  }

  async findByDepartment(department: string): Promise<Teacher[]> {
    const result = await this.findMany({
      where: [{ field: 'department', operator: '==', value: department }],
    });
    return result.data;
  }

  async updateStudentCount(teacherId: string, increment: number): Promise<Teacher> {
    const teacher = await this.findById(teacherId);
    if (!teacher) {
      throw new Error(`Teacher ${teacherId} not found`);
    }

    return this.update(teacherId, {
      totalStudents: (teacher.totalStudents || 0) + increment,
    });
  }
}
