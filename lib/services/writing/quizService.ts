/**
 * Quiz Service
 * Fetches multiple sentences for comprehensive review quizzes
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { QuizBlank } from '@/lib/models/writing';
import { MiniExerciseSentence } from '@/lib/models/miniExercise';
import { generateQuizBlanks } from '@/lib/utils/quizGenerator';
import { getRandomMiniExercise } from '@/lib/services/writing/miniExerciseService';

export interface QuizSentence {
  sentence: string;
  originalSentence: string;
  blanks: QuizBlank[];
  sentenceId: string;
  submissionId: string;
  sourceType: 'ai' | 'teacher' | 'reference';
  exerciseType: string;
  submittedAt: number;
  contextBefore?: string; // Previous sentence for context
  contextAfter?: string;  // Next sentence for context
}

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
 * Get context sentences (before and after) for a given sentence
 * Looks up neighboring sentences from the indexed collection
 */
async function getContextSentences(
  submissionId: string,
  sentenceIndex: number
): Promise<{ before?: string; after?: string }> {
  try {
    const sentencesRef = collection(db, 'mini-exercise-sentences');

    // Query for previous sentence (sentenceIndex - 1)
    let beforeSentence: string | undefined;
    if (sentenceIndex > 0) {
      const beforeQuery = query(
        sentencesRef,
        where('submissionId', '==', submissionId),
        where('sentenceIndex', '==', sentenceIndex - 1)
      );
      const beforeSnapshot = await getDocs(beforeQuery);
      if (!beforeSnapshot.empty) {
        beforeSentence = beforeSnapshot.docs[0].data().sentence;
      }
    }

    // Query for next sentence (sentenceIndex + 1)
    const afterQuery = query(
      sentencesRef,
      where('submissionId', '==', submissionId),
      where('sentenceIndex', '==', sentenceIndex + 1)
    );
    const afterSnapshot = await getDocs(afterQuery);
    const afterSentence = afterSnapshot.empty ? undefined : afterSnapshot.docs[0].data().sentence;

    return {
      before: beforeSentence,
      after: afterSentence,
    };
  } catch (error) {
    console.error('[getContextSentences] Error getting context sentences:', error);
    return {};
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
    : 999;

  let priority = 0;

  if (sentence.needsReview) priority += 100;
  if (sentence.timesShown === 0) priority += 80;
  if (sentence.averageAccuracy < 70) priority += 60;
  else if (sentence.averageAccuracy < 85) priority += 30;

  if (daysSinceLastShown > 7) priority += 40;
  else if (daysSinceLastShown > 3) priority += 20;
  else if (daysSinceLastShown > 1) priority += 10;

  if (sentence.consecutiveCorrect === 0) priority += 20;

  const daysSinceSubmission = (now - sentence.submittedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceSubmission < 7) priority += 15;

  return priority;
}

/**
 * Get multiple sentences for review quiz
 * Uses smart selection with spaced repetition
 */
export async function getQuizSentences(
  userId: string,
  count: number = 10
): Promise<QuizSentence[]> {
  try {
    const sentencesRef = collection(db, 'mini-exercise-sentences');
    const q = query(
      sentencesRef,
      where('userId', '==', userId),
      firestoreLimit(100) // Get a large pool of candidates
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

      // Fall back to random sentences
      const randomSentences: QuizSentence[] = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        const randomResult = await getRandomMiniExercise(userId);
        if (randomResult && randomResult.blanks.length > 0) {
          // Get context from allSentences if available
          const sentenceIdx = randomResult.sentenceIndex ?? 0;
          const allSentences = randomResult.allSentences || [];

          // Only use first blank for consistency
          const blanks = [randomResult.blanks[0]];

          randomSentences.push({
            sentence: randomResult.sentence,
            originalSentence: randomResult.sentence,
            blanks,
            sentenceId: `random_${i}`,
            submissionId: randomResult.submissionId,
            sourceType: randomResult.sourceType,
            exerciseType: randomResult.exerciseType || 'translation',
            submittedAt: randomResult.submittedAt || Date.now(),
            contextBefore: sentenceIdx > 0 ? allSentences[sentenceIdx - 1] : undefined,
            contextAfter: sentenceIdx < allSentences.length - 1 ? allSentences[sentenceIdx + 1] : undefined,
          });
        }
      }
      return randomSentences;
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

    // Take top sentences
    const selectedCount = Math.min(count, sentencesWithPriority.length);
    const selectedSentences = sentencesWithPriority.slice(0, selectedCount);

    const now = Date.now();
    const quizSentences: QuizSentence[] = [];

    // Process each selected sentence
    for (const { sentence } of selectedSentences) {
      // Generate blanks
      const allBlanks = generateQuizBlanks(sentence.originalSentence, sentence.sentence);

      // Only include sentences with blanks
      if (allBlanks.length === 0) {
        continue;
      }

      // Use only the first blank
      const blanks = [allBlanks[0]];

      // Get context sentences
      const context = await getContextSentences(sentence.submissionId, sentence.sentenceIndex);

      quizSentences.push({
        sentence: sentence.sentence,
        originalSentence: sentence.originalSentence,
        blanks,
        sentenceId: sentence.sentenceId,
        submissionId: sentence.submissionId,
        sourceType: sentence.sourceType,
        exerciseType: sentence.exerciseType,
        submittedAt: sentence.submittedAt,
        contextBefore: context.before,
        contextAfter: context.after,
      });

      // Update timesShown
      const sentenceDocRef = doc(db, 'mini-exercise-sentences', sentence.sentenceId);
      await updateDoc(sentenceDocRef, {
        timesShown: sentence.timesShown + 1,
        lastShownAt: now,
        updatedAt: now,
      });
    }

    return quizSentences;
  } catch (error) {
    console.error('[quizService] Error getting quiz sentences:', error);
    return [];
  }
}
