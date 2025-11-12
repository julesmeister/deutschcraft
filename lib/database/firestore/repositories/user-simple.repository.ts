/**
 * Firestore User Repository (Simple Structure)
 *
 * Works with your actual Firestore structure where users have a role field
 * instead of separate students/teachers collections
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { UserRepository } from '../../types';

// Simple User interface matching your Firestore structure
export interface SimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER';
  cefrLevel?: string;
  createdAt: number;
  updatedAt: number;
}

export class FirestoreSimpleUserRepository extends FirestoreBaseRepository<SimpleUser> {
  constructor(db: Firestore) {
    super(db, 'users');
  }

  async findByEmail(email: string): Promise<any> {
    return this.findOne({
      where: [{ field: 'email', operator: '==', value: email }],
      limit: 1,
    });
  }

  async findByRole(role: any): Promise<any[]> {
    const result = await this.findMany({
      where: [{ field: 'role', operator: '==', value: role }],
    });
    return result.data;
  }

  /**
   * Get all students (users with role STUDENT)
   */
  async getAllStudents(): Promise<SimpleUser[]> {
    return this.findByRole('STUDENT');
  }

  /**
   * Get all teachers (users with role TEACHER)
   */
  async getAllTeachers(): Promise<SimpleUser[]> {
    return this.findByRole('TEACHER');
  }

  /**
   * Get students by CEFR level
   */
  async getStudentsByLevel(level: string): Promise<SimpleUser[]> {
    const result = await this.findMany({
      where: [
        { field: 'role', operator: '==', value: 'STUDENT' },
        { field: 'cefrLevel', operator: '==', value: level },
      ],
    });
    return result.data;
  }
}
