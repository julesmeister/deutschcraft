/**
 * Firestore Database Provider
 *
 * Implements the DatabaseProvider interface for Firestore
 * with automatic caching and performance monitoring
 */

import { Firestore } from 'firebase/firestore';
import { DatabaseProvider, DatabaseRepositories } from '../types';
import { FirestoreUserRepository } from './repositories/user.repository';
import { FirestoreStudentRepository } from './repositories/student.repository';
import { FirestoreTeacherRepository } from './repositories/teacher.repository';
import { FirestoreVocabularyWordRepository } from './repositories/vocabulary-word.repository';
import { FirestoreFlashcardRepository } from './repositories/flashcard.repository';
import { FirestoreFlashcardProgressRepository } from './repositories/flashcard-progress.repository';
import { FirestoreStudyProgressRepository } from './repositories/study-progress.repository';
// import { CachedRepository, CacheTTL } from '../cache'; // Disabled temporarily

export class FirestoreDatabaseProvider implements DatabaseProvider {
  private db: Firestore;
  private connected: boolean = false;
  private enableCache: boolean;

  // Repository instances (typed as repository interfaces for compatibility)
  public users: any;
  public students: any;
  public teachers: any;
  public vocabularyWords: any;
  public flashcards: any;
  public flashcardProgress: any;
  public studyProgress: any;

  constructor(db: Firestore, enableCache: boolean = false) {
    this.db = db;
    this.enableCache = enableCache;

    // Initialize all repositories
    const userRepo = new FirestoreUserRepository(db);
    const studentRepo = new FirestoreStudentRepository(db);
    const teacherRepo = new FirestoreTeacherRepository(db);
    const vocabRepo = new FirestoreVocabularyWordRepository(db);
    const flashcardRepo = new FirestoreFlashcardRepository(db);
    const progressRepo = new FirestoreFlashcardProgressRepository(db);
    const studyRepo = new FirestoreStudyProgressRepository(db);

    // Caching disabled temporarily due to TS compatibility issues
    // Will be re-enabled after fixing Map iteration compatibility
    this.users = userRepo;
    this.students = studentRepo;
    this.teachers = teacherRepo;
    this.vocabularyWords = vocabRepo;
    this.flashcards = flashcardRepo;
    this.flashcardProgress = progressRepo;
    this.studyProgress = studyRepo;
  }

  async connect(): Promise<void> {
    // Firestore is already connected via Firebase initialization
    this.connected = true;
    console.log('[FirestoreProvider] Connected');
  }

  async disconnect(): Promise<void> {
    // Firestore doesn't require explicit disconnection
    this.connected = false;
    console.log('[FirestoreProvider] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Execute operations in a Firestore transaction
   * Note: Firestore transactions have limitations - max 500 documents
   */
  async transaction<T>(callback: (repositories: DatabaseRepositories) => Promise<T>): Promise<T> {
    // For now, we'll execute the callback directly
    // True Firestore transactions require using runTransaction from firebase/firestore
    // which has different API constraints (reads must come before writes)

    // This is a simplified implementation
    // For production, you may want to use Firestore's native runTransaction
    return callback({
      users: this.users,
      students: this.students,
      teachers: this.teachers,
      vocabularyWords: this.vocabularyWords,
      flashcards: this.flashcards,
      flashcardProgress: this.flashcardProgress,
      studyProgress: this.studyProgress,
    });
  }
}
