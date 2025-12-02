/**
 * Quiz Generator Utility
 * Generates fill-in-the-blank quizzes from text differences
 */

import { getDiff, DiffPart } from './textDiff';
import { QuizBlank } from '../models/writing';

/**
 * Helper function to strip trailing punctuation from a word
 * Example: "denke," -> "denke"
 */
function stripPunctuation(word: string): string {
  return word.replace(/[^\w\s]+$/g, '');
}

/**
 * Generate quiz blanks from differences between original and corrected text
 * Uses word-level comparison to find complete word replacements only
 * CRITICAL: Never creates consecutive blanks - ensures at least one word of context between them
 */
export function generateQuizBlanks(originalText: string, correctedText: string): QuizBlank[] {
  // Split both texts into words (keeping punctuation attached)
  const originalWords = originalText.split(/\s+/).filter(w => w.length > 0);
  const correctedWords = correctedText.split(/\s+/).filter(w => w.length > 0);

  // Step 1: Identify ALL word differences (comparing words without trailing punctuation)
  const potentialBlanks: Array<{ answer: string; wordIndex: number }> = [];

  // Simple word-by-word comparison
  const maxLength = Math.max(originalWords.length, correctedWords.length);

  for (let i = 0; i < maxLength; i++) {
    const origWord = originalWords[i] || '';
    const corrWord = correctedWords[i] || '';

    // Compare words without trailing punctuation
    const origWordClean = stripPunctuation(origWord);
    const corrWordClean = stripPunctuation(corrWord);

    // If words are different (ignoring punctuation) and the corrected word exists
    if (origWordClean !== corrWordClean && corrWordClean.length > 0) {
      // Only include complete words (at least 3 chars) to avoid articles and particles
      if (corrWordClean.length >= 3) {
        potentialBlanks.push({
          answer: corrWordClean, // Store word WITHOUT punctuation
          wordIndex: i,
        });
      }
    }
  }

  // Step 2: Filter to prevent consecutive blanks
  // CRITICAL: Ensure at least 1 word of unchanged text between any two blanks
  const filteredBlanks: Array<{ answer: string; wordIndex: number }> = [];
  let lastIncludedWordIndex = -1;

  for (const blank of potentialBlanks) {
    const wordIndex = blank.wordIndex;

    // Skip blanks at the very end (need at least 2 words after)
    const wordsAfter = correctedWords.length - wordIndex - 1;
    if (wordsAfter < 2) {
      continue;
    }

    // First blank: always include it
    if (lastIncludedWordIndex === -1) {
      filteredBlanks.push(blank);
      lastIncludedWordIndex = wordIndex;
      continue;
    }

    // Check if there's at least 1 word between this blank and the last
    const wordGap = wordIndex - lastIncludedWordIndex;

    // wordGap = 1 means consecutive words (no gap)
    // wordGap = 2 means one word between them (acceptable)
    // CRITICAL FIX: Require wordGap >= 2 to ensure NO consecutive blanks
    if (wordGap >= 2) {
      filteredBlanks.push(blank);
      lastIncludedWordIndex = wordIndex;
    }
  }

  // Step 3: Calculate actual character positions in the corrected text
  const blanks: QuizBlank[] = [];
  let charPosition = 0;
  let blankIndex = 0;

  for (let i = 0; i < correctedWords.length; i++) {
    const word = correctedWords[i];
    const wordClean = stripPunctuation(word);
    const isBlank = filteredBlanks.some(b => b.wordIndex === i);

    if (isBlank) {
      blanks.push({
        index: blankIndex++,
        correctAnswer: wordClean, // Use word WITHOUT punctuation as the answer
        position: charPosition,
        hint: `${wordClean.length} ${wordClean.length === 1 ? 'character' : 'characters'}`,
      });
    }

    charPosition += word.length + 1; // +1 for space
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
