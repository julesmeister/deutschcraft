/**
 * Smart Mini Exercise Service
 * Intelligent sentence selection and tracking with spaced repetition
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { WritingSubmission, QuizBlank, GrammarError } from '@/lib/models/writing';
import { MiniExerciseSentence, MiniExerciseAttempt } from '@/lib/models/miniExercise';
import { generateQuizBlanks } from '@/lib/utils/quizGenerator';

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
}

/**
 * Apply grammar corrections to text
 */
function applyCorrectionsSentenceLevel(text: string, grammarErrors: GrammarError[]): string {
  let correctedText = text;
  const sortedErrors = [...grammarErrors].sort((a, b) => {
    if (a.position && b.position) {
      return b.position.start - a.position.start;
    }
    return 0;
  });

  for (const error of sortedErrors) {
    if (error.position) {
      const before = correctedText.substring(0, error.position.start);
      const after = correctedText.substring(error.position.end);
      correctedText = before + error.suggestedCorrection + after;
    } else {
      correctedText = correctedText.replace(error.originalText, error.suggestedCorrection);
    }
  }

  return correctedText;
}

/**
 * Generate unique sentence ID
 */
function generateSentenceId(submissionId: string, sentenceIndex: number): string {
  return `${submissionId}_s${sentenceIndex}`;
}

/**
 * Index all sentences from a submission
 * Called when a submission is reviewed/corrected
 */
export async function indexSubmissionSentences(
  submission: WritingSubmission
): Promise<void> {
  try {
    console.log('[smartMiniExercise] Indexing sentences for submission:', submission.submissionId);

    // Get corrected text
    let correctedText = '';
    let sourceType: 'ai' | 'teacher' | 'reference' = 'ai';

    if (submission.teacherCorrectedVersion) {
      correctedText = submission.teacherCorrectedVersion;
      sourceType = 'teacher';
    } else if (submission.aiCorrectedVersion) {
      correctedText = submission.aiCorrectedVersion;
      sourceType = 'ai';
    } else if (submission.aiFeedback && submission.aiFeedback.grammarErrors.length > 0) {
      correctedText = applyCorrectionsSentenceLevel(
        submission.content,
        submission.aiFeedback.grammarErrors
      );
      sourceType = 'ai';
    } else {
      console.log('[smartMiniExercise] No corrections available, skipping indexing');
      return;
    }

    // Split both original and corrected into sentences
    const originalSentences = splitIntoSentences(submission.content);
    const correctedSentences = splitIntoSentences(correctedText);

    const now = Date.now();
    const sentencesRef = collection(db, 'mini-exercise-sentences');

    // Index each sentence
    for (let i = 0; i < correctedSentences.length; i++) {
      const correctedSentence = correctedSentences[i];
      const originalSentence = originalSentences[i] || correctedSentence;

      // Generate blanks to check if this sentence has corrections
      const blanks = generateQuizBlanks(originalSentence, correctedSentence);

      // Only index sentences with corrections (blanks)
      if (blanks.length === 0) {
        continue;
      }

      const sentenceId = generateSentenceId(submission.submissionId, i);

      // Check if sentence already exists
      const sentenceDocRef = doc(db, 'mini-exercise-sentences', sentenceId);
      const existingDoc = await getDoc(sentenceDocRef);

      if (existingDoc.exists()) {
        console.log('[smartMiniExercise] Sentence already indexed:', sentenceId);
        continue;
      }

      // Create new sentence record
      const sentenceData: Omit<MiniExerciseSentence, 'sentenceId'> = {
        submissionId: submission.submissionId,
        userId: submission.userId,
        sentence: correctedSentence,
        originalSentence,
        sentenceIndex: i,
        exerciseId: submission.exerciseId,
        exerciseType: submission.exerciseType,
        sourceType,
        submittedAt: submission.submittedAt || submission.createdAt,
        timesShown: 0,
        timesCompleted: 0,
        totalCorrectAnswers: 0,
        totalBlanks: 0,
        totalPoints: 0,
        averageAccuracy: 0,
        consecutiveCorrect: 0,
        needsReview: true, // New sentences need review
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(sentenceDocRef, sentenceData);
      console.log('[smartMiniExercise] Indexed sentence:', sentenceId);
    }
  } catch (error) {
    console.error('[smartMiniExercise] Error indexing sentences:', error);
    throw error;
  }
}

/**
 * Calculate priority score for sentence selection
 * Higher score = higher priority to show
 */
function calculatePriority(sentence: MiniExerciseSentence): number {
  const now = Date.now();
  const daysSinceLastShown = sentence.lastShownAt
    ? (now - sentence.lastShownAt) / (1000 * 60 * 60 * 24)
    : 999; // Never shown = high priority

  let priority = 0;

  // 1. Needs review flag (highest priority)
  if (sentence.needsReview) {
    priority += 100;
  }

  // 2. Never practiced = very high priority
  if (sentence.timesShown === 0) {
    priority += 80;
  }

  // 3. Low accuracy = high priority
  if (sentence.averageAccuracy < 70) {
    priority += 60;
  } else if (sentence.averageAccuracy < 85) {
    priority += 30;
  }

  // 4. Time since last shown (spaced repetition)
  if (daysSinceLastShown > 7) {
    priority += 40;
  } else if (daysSinceLastShown > 3) {
    priority += 20;
  } else if (daysSinceLastShown > 1) {
    priority += 10;
  }

  // 5. Low consecutive correct streak
  if (sentence.consecutiveCorrect === 0) {
    priority += 20;
  }

  // 6. Recency bonus for newer submissions
  const daysSinceSubmission = (now - sentence.submittedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceSubmission < 7) {
    priority += 15;
  }

  return priority;
}

/**
 * Get smart sentence selection for practice
 * Uses spaced repetition and performance tracking
 */
export async function getSmartMiniExercise(userId: string): Promise<{
  sentence: string;
  originalSentence: string;
  blanks: QuizBlank[];
  sentenceId: string;
  submissionId: string;
  sourceType: 'ai' | 'teacher' | 'reference';
  exerciseType: string;
  submittedAt: number;
} | null> {
  try {
    console.log('[smartMiniExercise] Getting smart exercise for user:', userId);

    const sentencesRef = collection(db, 'mini-exercise-sentences');
    const q = query(
      sentencesRef,
      where('userId', '==', userId),
      limit(50) // Get a pool of candidates
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('[smartMiniExercise] No indexed sentences found');
      return null;
    }

    // Calculate priority for each sentence
    const sentencesWithPriority = snapshot.docs.map(doc => {
      const sentence = { sentenceId: doc.id, ...doc.data() } as MiniExerciseSentence;
      return {
        sentence,
        priority: calculatePriority(sentence),
      };
    });

    // Sort by priority (highest first)
    sentencesWithPriority.sort((a, b) => b.priority - a.priority);

    // Take top 10 and randomly select from them (to add variety)
    const topCandidates = sentencesWithPriority.slice(0, 10);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    const sentence = selected.sentence;

    // Generate blanks
    const blanks = generateQuizBlanks(sentence.originalSentence, sentence.sentence);

    // Update timesShown
    const sentenceDocRef = doc(db, 'mini-exercise-sentences', sentence.sentenceId);
    await updateDoc(sentenceDocRef, {
      timesShown: sentence.timesShown + 1,
      lastShownAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('[smartMiniExercise] Selected sentence:', {
      sentenceId: sentence.sentenceId,
      priority: selected.priority,
      timesShown: sentence.timesShown,
      accuracy: sentence.averageAccuracy,
    });

    return {
      sentence: sentence.sentence,
      originalSentence: sentence.originalSentence,
      blanks,
      sentenceId: sentence.sentenceId,
      submissionId: sentence.submissionId,
      sourceType: sentence.sourceType,
      exerciseType: sentence.exerciseType,
      submittedAt: sentence.submittedAt,
    };
  } catch (error) {
    console.error('[smartMiniExercise] Error getting smart exercise:', error);
    return null;
  }
}

/**
 * Record a practice attempt
 */
export async function recordMiniExerciseAttempt(
  sentenceId: string,
  userId: string,
  answers: Record<number, string>,
  correctAnswers: number,
  totalBlanks: number,
  points: number
): Promise<void> {
  try {
    const accuracy = Math.round((correctAnswers / totalBlanks) * 100);
    const now = Date.now();

    // 1. Create attempt record
    const attemptsRef = collection(db, 'mini-exercise-attempts');
    const attemptData: Omit<MiniExerciseAttempt, 'attemptId'> = {
      sentenceId,
      userId,
      answers,
      correctAnswers,
      totalBlanks,
      points,
      accuracy,
      completedAt: now,
      createdAt: now,
    };

    await addDoc(attemptsRef, attemptData);

    // 2. Update sentence statistics
    const sentenceDocRef = doc(db, 'mini-exercise-sentences', sentenceId);
    const sentenceDoc = await getDoc(sentenceDocRef);

    if (!sentenceDoc.exists()) {
      console.error('[smartMiniExercise] Sentence not found:', sentenceId);
      return;
    }

    const sentence = sentenceDoc.data() as MiniExerciseSentence;

    // Calculate new averages
    const newTimesCompleted = sentence.timesCompleted + 1;
    const newTotalCorrectAnswers = sentence.totalCorrectAnswers + correctAnswers;
    const newTotalBlanks = sentence.totalBlanks + totalBlanks;
    const newTotalPoints = sentence.totalPoints + points;
    const newAverageAccuracy = Math.round((newTotalCorrectAnswers / newTotalBlanks) * 100);

    // Update consecutive correct streak
    let newConsecutiveCorrect = sentence.consecutiveCorrect;
    if (accuracy === 100) {
      newConsecutiveCorrect += 1;
    } else {
      newConsecutiveCorrect = 0;
    }

    // Determine if needs review
    // Mastered = 3+ consecutive perfect attempts OR 90%+ accuracy after 5+ attempts
    const isMastered =
      newConsecutiveCorrect >= 3 ||
      (newTimesCompleted >= 5 && newAverageAccuracy >= 90);

    const needsReview = !isMastered;

    await updateDoc(sentenceDocRef, {
      timesCompleted: newTimesCompleted,
      totalCorrectAnswers: newTotalCorrectAnswers,
      totalBlanks: newTotalBlanks,
      totalPoints: newTotalPoints,
      averageAccuracy: newAverageAccuracy,
      consecutiveCorrect: newConsecutiveCorrect,
      needsReview,
      lastCompletedAt: now,
      updatedAt: now,
    });

    console.log('[smartMiniExercise] Recorded attempt:', {
      sentenceId,
      accuracy,
      consecutiveCorrect: newConsecutiveCorrect,
      isMastered,
    });
  } catch (error) {
    console.error('[smartMiniExercise] Error recording attempt:', error);
    throw error;
  }
}
