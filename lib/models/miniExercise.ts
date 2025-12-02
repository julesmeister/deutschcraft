/**
 * Mini Exercise Models
 * Tracks individual sentence-level practice exercises
 */

export interface MiniExerciseSentence {
  sentenceId: string; // Unique ID for this specific sentence
  submissionId: string; // Parent submission
  userId: string; // Student's email

  // Sentence identification
  sentence: string; // The corrected sentence
  originalSentence: string; // Student's original sentence
  sentenceIndex: number; // Position in the original text (0-based)

  // Source information
  exerciseId: string;
  exerciseType: string; // 'translation', 'creative', etc.
  exerciseTitle?: string; // Optional: exercise title if available
  sourceType: 'ai' | 'teacher' | 'reference'; // Source of correction
  submittedAt: number; // When the parent submission was created

  // Practice statistics
  timesShown: number; // How many times this sentence has been shown
  timesCompleted: number; // How many times student completed it
  totalCorrectAnswers: number; // Sum of correct answers across all attempts
  totalBlanks: number; // Sum of total blanks across all attempts
  totalPoints: number; // Sum of points earned
  lastShownAt?: number; // Timestamp of last practice
  lastCompletedAt?: number; // Timestamp of last completion

  // Performance tracking
  averageAccuracy: number; // Average % correct (0-100)
  consecutiveCorrect: number; // Streak of perfect completions
  needsReview: boolean; // Flag for sentences that need more practice

  // Metadata
  createdAt: number;
  updatedAt: number;
}

/**
 * Mini Exercise Attempt
 * Records each practice attempt of a sentence
 */
export interface MiniExerciseAttempt {
  attemptId: string;
  sentenceId: string; // Links to MiniExerciseSentence
  userId: string;

  // Attempt details
  answers: Record<number, string>; // Student's answers by blank index
  correctAnswers: number;
  totalBlanks: number;
  points: number;
  accuracy: number; // Percentage correct (0-100)

  // Timing
  completedAt: number;

  createdAt: number;
}

/**
 * User's Mini Exercise Progress
 * Aggregate stats for a user
 */
export interface MiniExerciseProgress {
  userId: string;

  // Overall statistics
  totalSentencesPracticed: number; // Unique sentences practiced
  totalAttempts: number;
  totalPoints: number;
  averageAccuracy: number; // Overall accuracy %

  // Current session
  currentStreak: number; // Consecutive days of practice
  lastPracticeDate: number;
  practiceGoal: number; // Daily goal (sentences)
  todayProgress: number; // Sentences completed today

  // Smart review
  sentencesDueForReview: number; // Count of sentences that need practice
  sentencesMastered: number; // Sentences with 3+ perfect attempts

  createdAt: number;
  updatedAt: number;
}
