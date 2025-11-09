/**
 * Firestore Flashcard Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { FlashcardRepository } from '../../types';
import { Flashcard, CEFRLevel } from '../../../models';

export class FirestoreFlashcardRepository extends FirestoreBaseRepository<Flashcard> implements FlashcardRepository {
  constructor(db: Firestore) {
    super(db, 'flashcards');
  }

  async findByWordId(wordId: string): Promise<Flashcard[]> {
    const result = await this.findMany({
      where: [{ field: 'wordId', operator: '==', value: wordId }],
    });
    return result.data;
  }

  async findByLevel(level: CEFRLevel): Promise<Flashcard[]> {
    const result = await this.findMany({
      where: [{ field: 'level', operator: '==', value: level }],
    });
    return result.data;
  }

  async findByType(type: Flashcard['type']): Promise<Flashcard[]> {
    const result = await this.findMany({
      where: [{ field: 'type', operator: '==', value: type }],
    });
    return result.data;
  }
}
