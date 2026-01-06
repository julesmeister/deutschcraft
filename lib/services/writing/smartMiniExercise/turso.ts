/**
 * Smart Mini Exercise Service - Turso Implementation
 * Intelligent sentence selection and tracking with spaced repetition
 */

import { QuizBlank } from "@/lib/models/writing";
import { generateQuizBlanks } from "@/lib/utils/quizGenerator";
import {
  createSentence,
  getUserSentences,
  updateSentenceStats,
  recordAttempt,
  getSentence,
  updateUserProgress,
} from "@/lib/services/turso/miniExerciseService";
import { getWritingSubmission } from "@/lib/services/turso/writing/submissions";
import {
  splitIntoSentences,
  applyCorrectionsSentenceLevel,
  generateSentenceId,
  calculatePriority,
} from "./utils";

export interface MiniExerciseResult {
  sentence: string;
  originalSentence: string;
  blanks: QuizBlank[];
  sentenceId: string;
  submissionId: string;
  sourceType: "ai" | "teacher" | "reference";
  exerciseId?: string;
  exerciseTitle?: string;
  exerciseType: string;
  submittedAt: number;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Get a smart mini exercise with spaced repetition
 * Returns sentences that need review based on performance
 */
export async function getSmartMiniExercise(
  userId: string
): Promise<MiniExerciseResult | null> {
  try {
    // 1. Get candidate sentences
    // Fetch sentences that explicitly need review
    const reviewCandidates = await getUserSentences(userId, {
      needsReview: true,
      limit: 20,
    });

    // Fetch stale sentences (standard rotation)
    const staleCandidates = await getUserSentences(userId, { limit: 50 });

    // Merge and deduplicate by sentenceId
    const candidateMap = new Map<string, any>();

    // Add review candidates first
    reviewCandidates.forEach((c) => candidateMap.set(c.sentenceId, c));

    // Add stale candidates if not already present
    staleCandidates.forEach((c) => {
      if (!candidateMap.has(c.sentenceId)) {
        candidateMap.set(c.sentenceId, c);
      }
    });

    const candidates = Array.from(candidateMap.values());

    if (candidates.length === 0) {
      return null;
    }

    // 2. Calculate priority for each sentence
    const sentencesWithPriority = candidates.map((sentence) => ({
      sentence,
      priority: calculatePriority(sentence),
    }));

    // 3. Sort by priority (highest first)
    sentencesWithPriority.sort((a, b) => b.priority - a.priority);

    // 4. Select candidate
    // To avoid repetition in small pools, we limit the random selection
    // to the top 20% or at least top 3 (unless fewer candidates exist).
    const poolSize = Math.min(
      candidates.length,
      Math.max(3, Math.ceil(candidates.length * 0.2))
    );

    const topCandidates = sentencesWithPriority.slice(0, poolSize);
    const selected =
      topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const sentence = selected.sentence;

    // 5. Generate blanks
    const blanks = generateQuizBlanks(
      sentence.originalSentence,
      sentence.sentence
    );

    // 6. Update timesShown (async, don't wait)
    updateSentenceStats(sentence.sentenceId, { wasShown: true }).catch((err) =>
      console.error("[smartMiniExercise:turso] Error updating view stats:", err)
    );

    return {
      sentence: sentence.sentence,
      originalSentence: sentence.originalSentence,
      blanks,
      sentenceId: sentence.sentenceId,
      submissionId: sentence.submissionId,
      sourceType: sentence.sourceType,
      exerciseId: sentence.exerciseId,
      exerciseTitle: sentence.exerciseTitle,
      exerciseType: sentence.exerciseType,
      submittedAt: sentence.submittedAt,
    };
  } catch (error) {
    console.error(
      "[smartMiniExercise:turso] Error getting smart exercise:",
      error
    );
    return null;
  }
}

/**
 * Record an attempt at a mini exercise sentence
 * Used for spaced repetition tracking
 */
export async function recordMiniExerciseAttempt(
  sentenceId: string,
  userId: string,
  userAnswers: Record<number, string>,
  correctAnswers: number,
  totalBlanks: number,
  points: number
): Promise<void> {
  try {
    const accuracy = Math.round((correctAnswers / totalBlanks) * 100);
    const isPerfect = accuracy === 100;
    const now = Date.now();

    // 1. Create attempt record
    const attemptId = `att_${now}_${Math.random().toString(36).substr(2, 9)}`;

    await recordAttempt({
      attemptId,
      sentenceId,
      userId,
      answers: userAnswers,
      correctAnswers,
      totalBlanks,
      points,
      accuracy,
      completedAt: now,
    });

    // 2. Update sentence statistics
    await updateSentenceStats(sentenceId, {
      correctAnswers,
      totalBlanks,
      points,
      wasPerfect: isPerfect,
    });

    // 3. Update user progress
    // Calculate review count change (simplified logic)
    // If mastered, reduce review count. If failed, might increase.
    // This is handled by updateSentenceStats internal logic mostly,
    // but here we track aggregate user stats.

    // Check mastery status to update progress counters
    const sentence = await getSentence(sentenceId);
    let masteredCountChange = 0;

    // Check if it just became mastered (needsReview went from true to false)
    // This is tricky without knowing previous state, but we can approximate
    // based on the stats we just updated.
    if (
      sentence &&
      !sentence.needsReview &&
      isPerfect &&
      sentence.consecutiveCorrect === 3
    ) {
      masteredCountChange = 1;
    }

    await updateUserProgress(userId, {
      sentenceCompleted: true,
      points,
      accuracy,
      masteredCountChange,
    });
  } catch (error) {
    console.error("[smartMiniExercise:turso] Error recording attempt:", error);
    throw error;
  }
}

/**
 * Index all sentences from a submission (called after correction)
 * Creates mini_exercise_sentences for spaced repetition
 */
export async function indexSubmissionSentences(
  submissionId: string,
  userId: string
): Promise<void> {
  try {
    // 1. Fetch full submission
    const submission = await getWritingSubmission(submissionId);
    if (!submission) {
      console.warn(
        "[smartMiniExercise:turso] Submission not found:",
        submissionId
      );
      return;
    }

    // 2. Get corrected text and source type
    let correctedText = "";
    let sourceType: "ai" | "teacher" | "reference" = "ai";

    if (submission.teacherCorrectedVersion) {
      correctedText = submission.teacherCorrectedVersion;
      sourceType = "teacher";
    } else if (submission.aiCorrectedVersion) {
      correctedText = submission.aiCorrectedVersion;
      sourceType = "ai";
    } else if (
      submission.aiFeedback &&
      submission.aiFeedback.grammarErrors &&
      submission.aiFeedback.grammarErrors.length > 0
    ) {
      correctedText = applyCorrectionsSentenceLevel(
        submission.content,
        submission.aiFeedback.grammarErrors
      );
      sourceType = "ai";
    } else {
      // No corrections available
      return;
    }

    // 3. Split both original and corrected into sentences
    const originalSentences = splitIntoSentences(submission.content);
    const correctedSentences = splitIntoSentences(correctedText);

    // 4. Index each sentence
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
      const existingSentence = await getSentence(sentenceId);
      if (existingSentence) {
        continue;
      }

      // Create new sentence record
      await createSentence({
        sentenceId,
        submissionId: submission.submissionId,
        userId: submission.userId,
        sentence: correctedSentence,
        originalSentence,
        sentenceIndex: i,
        exerciseId: submission.exerciseId,
        exerciseType: submission.exerciseType,
        exerciseTitle: submission.exerciseTitle,
        sourceType,
        submittedAt: submission.submittedAt || submission.createdAt,
      });
    }

    console.log(
      `[smartMiniExercise:turso] Indexed ${correctedSentences.length} sentences for submission ${submissionId}`
    );
  } catch (error) {
    console.error("[smartMiniExercise:turso] Error indexing sentences:", error);
    // Don't throw, just log error to prevent blocking the main flow
  }
}
