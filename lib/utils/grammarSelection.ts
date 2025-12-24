/**
 * Grammar Sentence Selection Utility
 * Handles SRS-based sentence filtering and selection with strict interval enforcement
 * Mirrors the flashcardSelection.ts logic for consistency
 */

import { GrammarReview } from '@/lib/models/progress';

export interface GrammarSelectionResult {
  sentences: any[];
  nextDueInfo?: {
    count: number;
    nextDueDate: number;
  };
  upcomingSentences: any[];
}

export interface GrammarSettings {
  randomizeOrder: boolean;
  sentencesPerSession: number;
}

/**
 * Apply grammar settings to sentence array with STRICT SRS enforcement
 * Only shows sentences that are due NOW or are brand new (never seen)
 */
export function applyGrammarSettings(
  sentences: any[],
  grammarReviews: GrammarReview[],
  settings: GrammarSettings
): GrammarSelectionResult {
  const now = Date.now();

  // 1. STRICTLY FILTER TO ONLY DUE SENTENCES
  // Only include: new sentences (never seen) OR sentences with nextReviewDate <= now
  const dueSentences = sentences.filter(sentence => {
    const progress = grammarReviews.find(r => r.sentenceId === sentence.sentenceId);

    // New sentences (never seen) are always included
    if (!progress) {
      console.log('[GrammarSelection] ✅ Including NEW sentence:', {
        id: sentence.sentenceId,
        english: sentence.english,
        reason: 'Never seen before',
      });
      return true;
    }

    // Only include sentences that are actually due for review RIGHT NOW
    const isDue = (progress.nextReviewDate || 0) <= now;

    if (isDue) {
      console.log('[GrammarSelection] ✅ Including DUE sentence:', {
        id: sentence.sentenceId,
        english: sentence.english,
        nextReviewDate: new Date(progress.nextReviewDate || 0).toISOString(),
        wasOverdueBy: (now - (progress.nextReviewDate || 0)) / (1000 * 60 * 60) + ' hours',
      });
    } else {
      console.log('[GrammarSelection] ❌ Skipping sentence NOT due yet:', {
        id: sentence.sentenceId,
        english: sentence.english,
        nextReviewDate: new Date(progress.nextReviewDate || 0).toISOString(),
        hoursUntilDue: ((progress.nextReviewDate || 0) - now) / (1000 * 60 * 60),
      });
    }

    return isDue;
  });

  // Calculate next due info for sentences not yet due
  const notDueSentences = sentences.filter(sentence => {
    const progress = grammarReviews.find(r => r.sentenceId === sentence.sentenceId);
    return progress && (progress.nextReviewDate || 0) > now;
  }).sort((a, b) => {
    const progressA = grammarReviews.find(r => r.sentenceId === a.sentenceId);
    const progressB = grammarReviews.find(r => r.sentenceId === b.sentenceId);
    return (progressA?.nextReviewDate || 0) - (progressB?.nextReviewDate || 0);
  }).map(sentence => {
    // Add the nextReviewDate to each sentence for display
    const progress = grammarReviews.find(r => r.sentenceId === sentence.sentenceId);
    return {
      ...sentence,
      nextReviewDate: progress?.nextReviewDate || Date.now(),
    };
  });

  const nextDueInfo = notDueSentences.length > 0
    ? {
        count: notDueSentences.length,
        nextDueDate: grammarReviews.find(r => r.sentenceId === notDueSentences[0].sentenceId)?.nextReviewDate || Date.now(),
      }
    : undefined;

  // 2. PRIORITY SORTING within due sentences
  let processedSentences = dueSentences.sort((a, b) => {
    const progressA = grammarReviews.find(r => r.sentenceId === a.sentenceId);
    const progressB = grammarReviews.find(r => r.sentenceId === b.sentenceId);

    // New sentences first
    if (!progressA && progressB) return -1;
    if (progressA && !progressB) return 1;
    if (!progressA && !progressB) return 0;

    // Among due sentences, prioritize by next review date (earlier = higher priority)
    return (progressA.nextReviewDate || 0) - (progressB.nextReviewDate || 0);
  });

  // 3. APPLY RANDOMIZATION (only among due sentences)
  if (settings.randomizeOrder) {
    // Separate new sentences from due review sentences
    const newSentences = processedSentences.filter(sentence => {
      const progress = grammarReviews.find(r => r.sentenceId === sentence.sentenceId);
      return !progress;
    });
    const dueReviewSentences = processedSentences.filter(sentence => {
      const progress = grammarReviews.find(r => r.sentenceId === sentence.sentenceId);
      return progress;
    });

    // Randomize each group separately
    processedSentences = [
      ...newSentences.sort(() => Math.random() - 0.5),
      ...dueReviewSentences.sort(() => Math.random() - 0.5),
    ];
  }

  // 4. APPLY SESSION LIMIT
  const sentencesPerSession = settings.sentencesPerSession !== -1 && settings.sentencesPerSession > 0
    ? settings.sentencesPerSession
    : 10; // Default to 10 if unlimited

  const finalSentences = processedSentences.slice(0, sentencesPerSession);

  console.log('[GrammarSelection] STRICT SRS Selection:', {
    totalAvailable: sentences.length,
    dueForReview: dueSentences.length,
    newSentences: dueSentences.filter(s => !grammarReviews.find(r => r.sentenceId === s.sentenceId)).length,
    reviewSentences: dueSentences.filter(s => grammarReviews.find(r => r.sentenceId === s.sentenceId)).length,
    selectedForSession: finalSentences.length,
    notDueSentences: sentences.length - dueSentences.length,
    nextDueInfo,
  });

  // If no due sentences, show detailed breakdown
  if (finalSentences.length === 0 && sentences.length > 0) {
    console.log('[GrammarSelection] ✅ No sentences due for review! Breakdown:', {
      totalSentences: sentences.length,
      sentencesWithProgress: sentences.filter(s => grammarReviews.find(r => r.sentenceId === s.sentenceId)).length,
      newSentences: sentences.filter(s => !grammarReviews.find(r => r.sentenceId === s.sentenceId)).length,
      futureReviews: notDueSentences.length,
      sampleFutureSentence: notDueSentences[0] ? {
        english: notDueSentences[0].english,
        nextReview: new Date(grammarReviews.find(r => r.sentenceId === notDueSentences[0].sentenceId)?.nextReviewDate || 0).toISOString(),
      } : null,
    });
  }

  return {
    sentences: finalSentences,
    nextDueInfo,
    upcomingSentences: notDueSentences.slice(0, 15), // Return up to 15 upcoming sentences for display
  };
}
