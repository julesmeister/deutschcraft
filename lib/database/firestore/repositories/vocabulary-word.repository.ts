/**
 * Firestore Vocabulary Word Repository
 */

import { Firestore } from 'firebase/firestore';
import { FirestoreBaseRepository } from '../base-repository';
import { VocabularyWordRepository, QueryOptions, QueryResult } from '../../types';
import { VocabularyWord, CEFRLevel } from '../../../models';

export class FirestoreVocabularyWordRepository
  extends FirestoreBaseRepository<VocabularyWord>
  implements VocabularyWordRepository
{
  constructor(db: Firestore) {
    super(db, 'vocabularyWords');
  }

  async findByLevel(level: CEFRLevel, options?: QueryOptions): Promise<QueryResult<VocabularyWord>> {
    return this.findMany({
      where: [{ field: 'level', operator: '==', value: level }],
      ...options,
    });
  }

  async findByPartOfSpeech(partOfSpeech: string): Promise<VocabularyWord[]> {
    const result = await this.findMany({
      where: [{ field: 'partOfSpeech', operator: '==', value: partOfSpeech }],
    });
    return result.data;
  }

  async searchByGermanWord(searchTerm: string): Promise<VocabularyWord[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple prefix search. For production, use Algolia or similar
    const result = await this.findMany({
      where: [
        { field: 'germanWord', operator: '>=', value: searchTerm },
        { field: 'germanWord', operator: '<', value: searchTerm + '\uf8ff' },
      ],
      orderBy: [{ field: 'germanWord', direction: 'asc' }],
    });
    return result.data;
  }

  async searchByEnglishTranslation(searchTerm: string): Promise<VocabularyWord[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple prefix search. For production, use Algolia or similar
    const result = await this.findMany({
      where: [
        { field: 'englishTranslation', operator: '>=', value: searchTerm },
        { field: 'englishTranslation', operator: '<', value: searchTerm + '\uf8ff' },
      ],
      orderBy: [{ field: 'englishTranslation', direction: 'asc' }],
    });
    return result.data;
  }
}
