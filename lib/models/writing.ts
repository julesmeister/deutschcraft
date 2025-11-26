/**
 * Writing Exercise Models
 * FLAT STRUCTURE - Top-level collections only
 *
 * Collections:
 * - writing-exercises/{exerciseId}
 * - writing-submissions/{submissionId}
 * - writing-prompts/{promptId}
 */

import { CEFRLevel } from './cefr';

/**
 * Writing Exercise Types
 */
export type WritingExerciseType =
  | 'creative' // Free writing, story, personal narrative
  | 'translation' // Translate from English to German
  | 'guided' // Structured with prompts
  | 'descriptive' // Describe a scene, person, place
  | 'dialogue' // Conversation writing
  | 'formal-letter' // Formal correspondence
  | 'informal-letter' // Casual correspondence
  | 'email' // Email writing
  | 'essay'; // Structured essay

/**
 * Translation Exercise Model
 * Path: writing-exercises/{exerciseId}
 * Exercises focused on translating English to German
 */
export interface TranslationExercise {
  exerciseId: string;
  type: 'translation';
  level: CEFRLevel;

  // Exercise content
  title: string;
  englishText: string; // Text to translate
  correctGermanText: string; // Reference translation

  // Metadata
  category: string; // e.g., 'daily-life', 'business', 'travel'
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes

  // Learning focus
  targetGrammar?: string[]; // Grammar points being practiced
  targetVocabulary?: string[]; // Key words to use
  hints?: string[]; // Optional hints

  // Stats
  completionCount: number;
  averageScore: number;

  createdAt: number;
  updatedAt: number;
}

/**
 * Creative Writing Exercise Model
 * Path: writing-exercises/{exerciseId}
 * Free-form or guided creative writing
 */
export interface CreativeWritingExercise {
  exerciseId: string;
  type: 'creative' | 'guided' | 'descriptive' | 'dialogue' | 'essay';
  level: CEFRLevel;

  // Exercise content
  title: string;
  prompt: string; // Writing prompt
  imageUrl?: string; // Optional image for inspiration

  // Requirements
  minWords: number;
  maxWords?: number;
  suggestedStructure?: string[]; // e.g., ['Introduction', 'Main Part', 'Conclusion']

  // Guidance
  category: string;
  tone?: 'formal' | 'informal' | 'neutral';
  targetGrammar?: string[]; // Grammar to practice
  suggestedVocabulary?: string[]; // Vocabulary suggestions
  exampleResponse?: string; // Optional example

  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes

  // Stats
  completionCount: number;
  averageWordCount: number;

  createdAt: number;
  updatedAt: number;
}

/**
 * Writing Prompt Model
 * Path: writing-prompts/{promptId}
 * Daily/weekly writing prompts
 */
export interface WritingPrompt {
  promptId: string;
  level: CEFRLevel;
  type: WritingExerciseType;

  // Prompt content
  title: string;
  prompt: string;
  imageUrl?: string;

  // Settings
  isDaily: boolean; // Daily challenge
  isWeekly: boolean; // Weekly challenge
  activeDate?: string; // YYYY-MM-DD when this is active

  createdAt: number;
}

/**
 * Writing Submission Model
 * Path: writing-submissions/{submissionId}
 * Student's writing submission
 *
 * IMPORTANT: Students can submit multiple attempts for the same exercise
 * Each attempt is a separate document with attemptNumber tracking
 */
export interface WritingSubmission {
  submissionId: string;
  exerciseId: string;
  userId: string; // Student's email
  exerciseType: WritingExerciseType;
  level: CEFRLevel;

  // Multiple attempts support
  attemptNumber: number; // 1, 2, 3, etc. (each exercise can have multiple attempts)

  // Submission content
  content: string; // Student's writing
  wordCount: number;
  characterCount: number;

  // For translation exercises
  originalText?: string; // English text (for translations)

  // Status
  status: 'draft' | 'submitted' | 'reviewed';

  // Timestamps
  startedAt: number;
  submittedAt?: number;
  lastSavedAt: number;

  // AI Feedback (optional)
  aiFeedback?: WritingFeedback;

  // Manual feedback (teacher)
  teacherFeedback?: string;
  teacherScore?: number; // 0-100
  reviewedBy?: string; // Teacher's email
  reviewedAt?: number;

  // Version history
  version: number;
  previousVersions?: WritingVersion[];

  createdAt: number;
  updatedAt: number;
}

/**
 * Writing Feedback Model
 * AI-generated feedback for submissions
 */
export interface WritingFeedback {
  // Overall assessment
  overallScore: number; // 0-100
  overallComment: string;

  // Detailed scores
  grammarScore: number; // 0-100
  vocabularyScore: number; // 0-100
  coherenceScore: number; // 0-100
  creativityScore?: number; // 0-100 (for creative writing)
  accuracyScore?: number; // 0-100 (for translations)

  // Specific feedback
  grammarErrors: GrammarError[];
  vocabularySuggestions: VocabularySuggestion[];
  styleComments: string[];

  // Positive highlights
  strengths: string[];

  // For translations
  translationAccuracy?: number; // 0-100
  missedPhrases?: string[]; // Important phrases missed

  generatedAt: number;
}

/**
 * Grammar Error Model
 */
export interface GrammarError {
  errorType: string; // e.g., 'verb-conjugation', 'gender-agreement', 'word-order'
  originalText: string;
  suggestedCorrection: string;
  explanation: string;
  position?: { start: number; end: number }; // Character positions
}

/**
 * Vocabulary Suggestion Model
 */
export interface VocabularySuggestion {
  originalWord: string;
  suggestedWord: string;
  reason: string; // Why this is better
  context?: string; // Example usage
}

/**
 * Writing Version Model
 * For tracking revision history
 */
export interface WritingVersion {
  version: number;
  content: string;
  wordCount: number;
  savedAt: number;
  editedBy?: string; // User email who made the edit
  changes?: string; // Description of what changed
  textChanges?: TextChange[]; // Detailed character-level changes
}

/**
 * Text Change Model
 * Track specific text edits (word/phrase changes)
 */
export interface TextChange {
  type: 'insert' | 'delete' | 'replace';
  position: number; // Character position in text
  oldText?: string; // For delete/replace
  newText?: string; // For insert/replace
  editedBy: string; // User email
  timestamp: number;
  comment?: string; // Optional comment about the change
}

/**
 * Peer Review Model
 * Student reviews another student's work
 */
export interface PeerReview {
  reviewId: string;
  submissionId: string; // Submission being reviewed
  reviewerId: string; // Student doing the review (email)
  revieweeId: string; // Student being reviewed (email)

  // Review content
  overallComment: string;
  strengths: string[];
  improvements: string[];
  suggestedEdits: TextChange[];

  // Ratings (optional)
  grammarRating?: number; // 1-5 stars
  vocabularyRating?: number; // 1-5 stars
  creativityRating?: number; // 1-5 stars

  status: 'in-progress' | 'submitted' | 'acknowledged';

  createdAt: number;
  submittedAt?: number;
  acknowledgedAt?: number; // When reviewee reads it
}

/**
 * Teacher Review Model
 * Teacher feedback on student submission
 */
export interface TeacherReview {
  reviewId: string;
  submissionId: string;
  teacherId: string; // Teacher's email
  studentId: string; // Student's email

  // Review content
  overallComment: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestedEdits: TextChange[];
  correctedVersion?: string; // Teacher's grammar-corrected version of student's text

  // Grading
  grammarScore: number; // 0-100
  vocabularyScore: number; // 0-100
  coherenceScore: number; // 0-100
  overallScore: number; // 0-100

  // Additional feedback
  meetsCriteria: boolean;
  requiresRevision: boolean;
  revisionInstructions?: string;

  createdAt: number;
  updatedAt: number;
}

/**
 * Writing Progress Model
 * Path: writing-progress/{progressId}
 * Format: WPROG_{YYYYMMDD}_{email}
 * Track student's writing practice progress
 */
export interface WritingProgress {
  progressId: string;
  userId: string; // Student's email
  date: string; // YYYY-MM-DD

  // Daily stats
  exercisesCompleted: number;
  translationsCompleted: number;
  creativeWritingsCompleted: number;
  totalWordsWritten: number;
  timeSpent: number; // minutes

  // Performance
  averageGrammarScore: number;
  averageVocabularyScore: number;
  averageOverallScore: number;

  // Streak
  currentStreak: number;
  longestStreak: number;

  createdAt: number;
  updatedAt: number;
}

/**
 * Writing Statistics Model
 * Aggregate stats for student's writing
 */
export interface WritingStats {
  userId: string; // Student's email

  // Totals
  totalExercisesCompleted: number;
  totalTranslations: number;
  totalCreativeWritings: number;
  totalWordsWritten: number;
  totalTimeSpent: number; // minutes

  // Averages
  averageGrammarScore: number;
  averageVocabularyScore: number;
  averageCoherenceScore: number;
  averageOverallScore: number;

  // By level
  exercisesByLevel: Record<CEFRLevel, number>;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string; // YYYY-MM-DD

  // Recent performance
  recentScores: number[]; // Last 10 overall scores

  updatedAt: number;
}
