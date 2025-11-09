/**
 * Generic Database Types and Interfaces
 *
 * This file defines database-agnostic types and interfaces
 * that allow switching between different database providers
 * (Firestore, PostgreSQL, MongoDB, etc.)
 */

import {
  User,
  Student,
  Teacher,
  VocabularyWord,
  Flashcard,
  FlashcardProgress,
  StudyProgress,
  CEFRLevel,
} from '../models';

// ============================================================================
// Query Types (Database-Agnostic)
// ============================================================================

export type WhereOperator =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'in'
  | 'not-in'
  | 'array-contains'
  | 'array-contains-any';

export type OrderDirection = 'asc' | 'desc';

export interface WhereCondition {
  field: string;
  operator: WhereOperator;
  value: any;
}

export interface OrderByCondition {
  field: string;
  direction: OrderDirection;
}

export interface QueryOptions {
  where?: WhereCondition[];
  orderBy?: OrderByCondition[];
  limit?: number;
  offset?: number;
  startAfter?: any; // Cursor for pagination
}

export interface QueryResult<T> {
  data: T[];
  lastCursor?: any; // For pagination
  hasNextPage: boolean;
}

// ============================================================================
// Repository Interfaces (CRUD Operations)
// ============================================================================

/**
 * Base repository interface for all entities
 * Defines common CRUD operations
 */
export interface BaseRepository<T> {
  // Create
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  createBatch(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]>;

  // Read
  findById(id: string): Promise<T | null>;
  findOne(options: QueryOptions): Promise<T | null>;
  findMany(options: QueryOptions): Promise<QueryResult<T>>;
  findAll(): Promise<T[]>;

  // Update
  update(id: string, data: Partial<T>): Promise<T>;
  updateBatch(updates: { id: string; data: Partial<T> }[]): Promise<T[]>;

  // Delete
  delete(id: string): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;

  // Count
  count(options?: QueryOptions): Promise<number>;

  // Exists
  exists(id: string): Promise<boolean>;
}

// ============================================================================
// Entity-Specific Repository Interfaces
// ============================================================================

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: 'student' | 'teacher'): Promise<User[]>;
}

export interface StudentRepository extends BaseRepository<Student> {
  findByUserId(userId: string): Promise<Student | null>;
  findByTeacherId(teacherId: string, options?: QueryOptions): Promise<QueryResult<Student>>;
  findByLevel(level: CEFRLevel): Promise<Student[]>;
  findActiveStudents(teacherId?: string): Promise<Student[]>;
  updateStats(
    studentId: string,
    stats: Partial<Pick<Student, 'wordsLearned' | 'wordsMastered' | 'currentStreak' | 'totalPracticeTime'>>
  ): Promise<Student>;
}

export interface TeacherRepository extends BaseRepository<Teacher> {
  findByUserId(userId: string): Promise<Teacher | null>;
  findByDepartment(department: string): Promise<Teacher[]>;
  updateStudentCount(teacherId: string, increment: number): Promise<Teacher>;
}

export interface VocabularyWordRepository extends BaseRepository<VocabularyWord> {
  findByLevel(level: CEFRLevel, options?: QueryOptions): Promise<QueryResult<VocabularyWord>>;
  findByPartOfSpeech(partOfSpeech: string): Promise<VocabularyWord[]>;
  searchByGermanWord(searchTerm: string): Promise<VocabularyWord[]>;
  searchByEnglishTranslation(searchTerm: string): Promise<VocabularyWord[]>;
}

export interface FlashcardRepository extends BaseRepository<Flashcard> {
  findByWordId(wordId: string): Promise<Flashcard[]>;
  findByLevel(level: CEFRLevel): Promise<Flashcard[]>;
  findByType(type: Flashcard['type']): Promise<Flashcard[]>;
}

export interface FlashcardProgressRepository extends BaseRepository<FlashcardProgress> {
  findByUserId(userId: string, options?: QueryOptions): Promise<QueryResult<FlashcardProgress>>;
  findByWordId(userId: string, wordId: string): Promise<FlashcardProgress | null>;
  findDueForReview(userId: string, date?: number): Promise<FlashcardProgress[]>;
  updateAfterReview(
    progressId: string,
    correct: boolean,
    nextReviewDate: number
  ): Promise<FlashcardProgress>;
}

export interface StudyProgressRepository extends BaseRepository<StudyProgress> {
  findByUserId(userId: string, options?: QueryOptions): Promise<QueryResult<StudyProgress>>;
  findByDateRange(userId: string, startDate: number, endDate: number): Promise<StudyProgress[]>;
  getTodayProgress(userId: string): Promise<StudyProgress | null>;
  getWeeklyProgress(userId: string): Promise<StudyProgress[]>;
}

// ============================================================================
// Database Provider Interface
// ============================================================================

/**
 * Main database provider interface
 * Implementations provide access to all repositories
 */
export interface DatabaseProvider {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Transaction support
  transaction<T>(callback: (repositories: DatabaseRepositories) => Promise<T>): Promise<T>;

  // Repository access
  users: UserRepository;
  students: StudentRepository;
  teachers: TeacherRepository;
  vocabularyWords: VocabularyWordRepository;
  flashcards: FlashcardRepository;
  flashcardProgress: FlashcardProgressRepository;
  studyProgress: StudyProgressRepository;
}

/**
 * Collection of all repositories for transaction support
 */
export interface DatabaseRepositories {
  users: UserRepository;
  students: StudentRepository;
  teachers: TeacherRepository;
  vocabularyWords: VocabularyWordRepository;
  flashcards: FlashcardRepository;
  flashcardProgress: FlashcardProgressRepository;
  studyProgress: StudyProgressRepository;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface FirestoreConfig {
  type: 'firestore';
  projectId?: string;
  // Client-side config
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  // Server-side config
  clientEmail?: string;
  privateKey?: string;
}

export interface PostgresConfig {
  type: 'postgres';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface MongoDBConfig {
  type: 'mongodb';
  connectionString: string;
  database: string;
}

export type DatabaseConfig = FirestoreConfig | PostgresConfig | MongoDBConfig;
