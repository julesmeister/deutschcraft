/**
 * Firestore User Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { UserRepository } from '../../types';
import { User } from '../../../models';

export class FirestoreUserRepository extends FirestoreBaseRepository<User> implements UserRepository {
  constructor(db: Firestore) {
    super(db, 'users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: [{ field: 'email', operator: '==', value: email }],
      limit: 1,
    });
  }

  async findByRole(role: 'student' | 'teacher'): Promise<User[]> {
    const result = await this.findMany({
      where: [{ field: 'role', operator: '==', value: role }],
    });
    return result.data;
  }
}
