/**
 * Mini Exercise Service
 * Provides random sentences from corrected writing exercises for quick practice
 */

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { WritingSubmission, QuizBlank, GrammarError } from '@/lib/models/writing';
import { generateQuizBlanks } from '@/lib/utils/quizGenerator';

export interface MiniExerciseData {
  sentence: string;
  blanks: QuizBlank[];
  submissionId: string;
  sourceType: 'ai' | 'teacher' | 'reference';
  exerciseTitle?: string;
  exerciseType?: string;
  submittedAt?: number;
  sentenceIndex?: number; // Index of this sentence in the original submission
  allSentences?: string[]; // All sentences from the corrected text for context
}

/**
 * Apply grammar corrections to text
 * Replaces originalText with suggestedCorrection for each grammar error
 */
function applyCorrectionsSentenceLevel(text: string, grammarErrors: GrammarError[]): string {
  let correctedText = text;

  // Sort errors by position (if available) to apply from end to start
  const sortedErrors = [...grammarErrors].sort((a, b) => {
    if (a.position && b.position) {
      return b.position.start - a.position.start; // Descending order
    }
    return 0;
  });

  // Apply corrections
  for (const error of sortedErrors) {
    if (error.position) {
      // Use position-based replacement if available
      const before = correctedText.substring(0, error.position.start);
      const after = correctedText.substring(error.position.end);
      correctedText = before + error.suggestedCorrection + after;
    } else {
      // Fallback: simple string replacement
      correctedText = correctedText.replace(error.originalText, error.suggestedCorrection);
    }
  }

  return correctedText;
}

/**
 * Split text into sentences (basic split on . ! ?)
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end of string
  const sentences = text
    .split(/[.!?]+\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20); // Only sentences with at least 20 chars

  return sentences;
}

/**
 * Get a random corrected sentence from the user's writing submissions
 * Returns a sentence with blanks for fill-in practice
 */
export async function getRandomMiniExercise(userId: string): Promise<MiniExerciseData | null> {
  try {
    // Fetch user's submissions (both submitted and reviewed)
    const submissionsRef = collection(db, 'writing-submissions');
    const q = query(
      submissionsRef,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(20) // Get recent 20 submissions
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Collect all submissions with corrections
    const submissionsWithCorrections: Array<{
      submission: WritingSubmission;
      correctedText: string;
      sourceType: 'ai' | 'teacher' | 'reference';
    }> = [];

    for (const doc of snapshot.docs) {
      const submission = { submissionId: doc.id, ...doc.data() } as WritingSubmission;

      // Prioritize: teacher correction > AI corrected version > AI feedback with corrections
      if (submission.teacherCorrectedVersion) {
        submissionsWithCorrections.push({
          submission,
          correctedText: submission.teacherCorrectedVersion,
          sourceType: 'teacher',
        });
      } else if (submission.aiCorrectedVersion) {
        submissionsWithCorrections.push({
          submission,
          correctedText: submission.aiCorrectedVersion,
          sourceType: 'ai',
        });
      } else if (submission.aiFeedback && submission.aiFeedback.grammarErrors.length > 0) {
        // Build corrected version from grammar errors
        const correctedText = applyCorrectionsSentenceLevel(
          submission.content,
          submission.aiFeedback.grammarErrors
        );
        submissionsWithCorrections.push({
          submission,
          correctedText,
          sourceType: 'ai',
        });
      }
    }

    if (submissionsWithCorrections.length === 0) {
      return null;
    }

    // Pick a random submission
    const randomIndex = Math.floor(Math.random() * submissionsWithCorrections.length);
    const { submission, correctedText, sourceType } = submissionsWithCorrections[randomIndex];

    // Split corrected text into sentences
    const sentences = splitIntoSentences(correctedText);

    if (sentences.length === 0) {
      return null;
    }

    // Try to find a sentence with corrections (has blanks)
    // Create array of sentence indices for randomization
    const sentenceIndices = sentences.map((_, idx) => idx);
    const shuffledIndices = sentenceIndices.sort(() => Math.random() - 0.5);

    for (const sentenceIdx of shuffledIndices) {
      const sentence = sentences[sentenceIdx];

      // Find corresponding sentence in original text
      const originalSentences = splitIntoSentences(submission.content);

      // Try to match sentence by finding similar content
      let originalSentence = '';
      for (const origSent of originalSentences) {
        // Simple matching: if sentences share some words, they might be the same
        const correctedWords = sentence.toLowerCase().split(/\s+/).slice(0, 3);
        const origWords = origSent.toLowerCase().split(/\s+/).slice(0, 3);

        if (correctedWords.some(w => origWords.includes(w))) {
          originalSentence = origSent;
          break;
        }
      }

      if (!originalSentence) {
        // If no match found, skip this sentence
        continue;
      }

      // Generate blanks for this sentence
      const blanks = generateQuizBlanks(originalSentence, sentence);

      // If this sentence has blanks (corrections), use it
      if (blanks.length > 0) {
        return {
          sentence,
          blanks,
          submissionId: submission.submissionId,
          sourceType,
          exerciseTitle: submission.exerciseTitle,
          exerciseType: submission.exerciseType,
          submittedAt: submission.submittedAt,
          sentenceIndex: sentenceIdx,
          allSentences: sentences,
        };
      }
    }

    // If no sentence with corrections found, return the first sentence anyway
    // (user will see "no corrections" message)
    const firstSentence = sentences[0];
    const originalSentences = splitIntoSentences(submission.content);
    const blanks = generateQuizBlanks(
      originalSentences[0] || firstSentence,
      firstSentence
    );

    return {
      sentence: firstSentence,
      blanks,
      submissionId: submission.submissionId,
      sourceType,
      exerciseTitle: submission.exerciseTitle,
      exerciseType: submission.exerciseType,
      submittedAt: submission.submittedAt,
      sentenceIndex: 0,
      allSentences: sentences,
    };
  } catch (error) {
    console.error('Error fetching random mini exercise:', error);
    return null;
  }
}
