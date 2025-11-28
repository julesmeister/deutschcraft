/**
 * Quiz Generator Utility
 * Generates fill-in-the-blank quizzes from text differences
 */

import { getDiff, DiffPart } from './textDiff';
import { QuizBlank } from '../models/writing';

/**
 * Generate quiz blanks from differences between original and corrected text
 * Uses word-level comparison to find complete word replacements only
 * Skips consecutive blanks to ensure there's context between them
 */
export function generateQuizBlanks(originalText: string, correctedText: string): QuizBlank[] {
  // Split both texts into words (keeping punctuation attached to words)
  const originalWords = originalText.split(/\s+/).filter(w => w.length > 0);
  const correctedWords = correctedText.split(/\s+/).filter(w => w.length > 0);

  const potentialBlanks: Array<{ position: number; answer: string; wordIndex: number }> = [];

  // Simple word-by-word comparison
  // When words don't match, mark the corrected word as a blank
  const maxLength = Math.max(originalWords.length, correctedWords.length);

  for (let i = 0; i < maxLength; i++) {
    const origWord = originalWords[i] || '';
    const corrWord = correctedWords[i] || '';

    // If words are different and the corrected word exists, it's a correction
    if (origWord !== corrWord && corrWord.length > 0) {
      // Only include complete words (at least 3 chars) to avoid articles and particles
      if (corrWord.length >= 3) {
        potentialBlanks.push({
          position: 0, // We'll calculate actual position later
          answer: corrWord,
          wordIndex: i,
        });
      }
    }
  }

  // Calculate actual character positions in the corrected text
  const blanksWithPositions: Array<{ position: number; answer: string }> = [];
  let charPosition = 0;

  for (let i = 0; i < correctedWords.length; i++) {
    const word = correctedWords[i];
    const isBlank = potentialBlanks.some(b => b.wordIndex === i);

    if (isBlank) {
      blanksWithPositions.push({
        position: charPosition,
        answer: word,
      });
    }

    charPosition += word.length + 1; // +1 for space
  }

  // Second pass: filter out consecutive blanks that are too close together
  // Also skip blanks at the very end with no context after them
  const blanks: QuizBlank[] = [];
  let blankIndex = 0;
  const MIN_WORD_GAP = 3; // minimum words between blanks
  let lastIncludedWordIndex = -1;

  for (let i = 0; i < potentialBlanks.length; i++) {
    const current = potentialBlanks[i];
    const wordIndex = current.wordIndex;

    // Check if there are at least 2 words after this blank
    const wordsAfter = correctedWords.length - wordIndex - 1;
    if (wordsAfter < 2) {
      continue; // Skip blanks at the very end
    }

    // If this is the first blank, include it
    if (lastIncludedWordIndex === -1) {
      const matchingBlank = blanksWithPositions.find(b => b.answer === current.answer);
      if (matchingBlank) {
        blanks.push({
          index: blankIndex++,
          correctAnswer: matchingBlank.answer,
          position: matchingBlank.position,
          hint: `${matchingBlank.answer.length} ${matchingBlank.answer.length === 1 ? 'character' : 'characters'}`,
        });
        lastIncludedWordIndex = wordIndex;
      }
    } else {
      // Check word distance from last included blank
      const wordGap = wordIndex - lastIncludedWordIndex;

      // Include if there's enough word gap from the last included blank
      if (wordGap >= MIN_WORD_GAP) {
        const matchingBlank = blanksWithPositions.find(b => b.answer === current.answer);
        if (matchingBlank) {
          blanks.push({
            index: blankIndex++,
            correctAnswer: matchingBlank.answer,
            position: matchingBlank.position,
            hint: `${matchingBlank.answer.length} ${matchingBlank.answer.length === 1 ? 'character' : 'characters'}`,
          });
          lastIncludedWordIndex = wordIndex;
        }
      }
    }
  }

  return blanks;
}

/**
 * Generate quiz text with blanks replaced by input placeholders
 * Returns the text with blanks marked
 */
export function generateQuizText(correctedText: string, blanks: QuizBlank[]): DiffPart[] {
  const diffParts: DiffPart[] = [];
  let lastPosition = 0;

  // Sort blanks by position
  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

  for (const blank of sortedBlanks) {
    // Add text before the blank
    if (blank.position > lastPosition) {
      diffParts.push({
        type: 'unchanged',
        value: correctedText.substring(lastPosition, blank.position),
      });
    }

    // Add the blank
    diffParts.push({
      type: 'added', // Use 'added' type to mark it as a blank
      value: blank.correctAnswer,
    });

    lastPosition = blank.position + blank.correctAnswer.length;
  }

  // Add remaining text
  if (lastPosition < correctedText.length) {
    diffParts.push({
      type: 'unchanged',
      value: correctedText.substring(lastPosition),
    });
  }

  return diffParts;
}

/**
 * Check if an answer is correct (fuzzy matching)
 * Allows for minor differences like capitalization and whitespace
 */
export function checkAnswer(studentAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, ' ');

  return normalize(studentAnswer) === normalize(correctAnswer);
}

/**
 * Calculate quiz score
 */
export function calculateQuizScore(
  answers: Record<number, string>,
  blanks: QuizBlank[]
): { score: number; correctAnswers: number; totalBlanks: number } {
  const totalBlanks = blanks.length;
  let correctAnswers = 0;

  for (const blank of blanks) {
    const studentAnswer = answers[blank.index] || '';
    if (checkAnswer(studentAnswer, blank.correctAnswer)) {
      correctAnswers++;
    }
  }

  const score = totalBlanks > 0 ? Math.round((correctAnswers / totalBlanks) * 100) : 0;

  return { score, correctAnswers, totalBlanks };
}
