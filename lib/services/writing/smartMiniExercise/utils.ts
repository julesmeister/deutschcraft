import { GrammarError } from '@/lib/models/writing';
import { MiniExerciseSentence } from '@/lib/models/miniExercise';

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
}

/**
 * Apply grammar corrections to text
 */
export function applyCorrectionsSentenceLevel(text: string, grammarErrors: GrammarError[]): string {
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
export function generateSentenceId(submissionId: string, sentenceIndex: number): string {
  return `${submissionId}_s${sentenceIndex}`;
}

/**
 * Calculate priority score for sentence selection
 * Higher score = higher priority to show
 */
export function calculatePriority(sentence: MiniExerciseSentence): number {
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
