/**
 * Mini Exercise Service - Turso Implementation
 * Fetches random sentences from user's corrected writing submissions
 */

import { db } from "@/turso/client";
import { QuizBlank, GrammarError } from "@/lib/models/writing";
import {
  generateQuizBlanks,
  generateRandomBlanks,
} from "@/lib/utils/quizGenerator";

export interface MiniExerciseData {
  sentence: string;
  blanks: QuizBlank[];
  submissionId: string;
  sourceType: "ai" | "teacher" | "reference";
  exerciseId?: string;
  exerciseTitle?: string;
  exerciseType?: string;
  submittedAt?: number;
  sentenceIndex?: number;
  allSentences?: string[];
}

/**
 * Apply grammar corrections to text
 */
function applyCorrectionsSentenceLevel(
  text: string,
  grammarErrors: GrammarError[]
): string {
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
      correctedText = correctedText.replace(
        error.originalText,
        error.suggestedCorrection
      );
    }
  }

  return correctedText;
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  const sentences = text
    .split(/[.!?]+\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  return sentences;
}

/**
 * Get a random corrected sentence from the user's writing submissions
 */
export async function getRandomMiniExercise(
  userId: string
): Promise<MiniExerciseData | null> {
  try {
    // Fetch user's recent submissions
    const result = await db.execute({
      sql: `SELECT submission_id, content, exercise_id, exercise_title, exercise_type, submitted_at,
                   ai_corrected_version, teacher_corrected_version, ai_feedback
            FROM writing_submissions
            WHERE user_id = ?
            ORDER BY submitted_at DESC
            LIMIT 20`,
      args: [userId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    // Collect submissions with corrections
    const submissionsWithCorrections: Array<{
      submissionId: string;
      content: string;
      correctedText: string;
      sourceType: "ai" | "teacher" | "reference";
      exerciseId?: string;
      exerciseTitle?: string;
      exerciseType?: string;
      submittedAt: number;
    }> = [];

    for (const row of result.rows) {
      const submissionId = row.submission_id as string;
      const content = row.content as string;
      const exerciseId = row.exercise_id as string | undefined;
      const exerciseTitle = row.exercise_title as string | undefined;
      const exerciseType = row.exercise_type as string | undefined;
      const submittedAt = row.submitted_at as number;

      if (row.teacher_corrected_version) {
        submissionsWithCorrections.push({
          submissionId,
          content,
          correctedText: row.teacher_corrected_version as string,
          sourceType: "teacher",
          exerciseId,
          exerciseTitle,
          exerciseType,
          submittedAt,
        });
      } else if (row.ai_corrected_version) {
        submissionsWithCorrections.push({
          submissionId,
          content,
          correctedText: row.ai_corrected_version as string,
          sourceType: "ai",
          exerciseId,
          exerciseTitle,
          exerciseType,
          submittedAt,
        });
      } else if (row.ai_feedback) {
        try {
          const aiFeedback =
            typeof row.ai_feedback === "string"
              ? JSON.parse(row.ai_feedback)
              : row.ai_feedback;
          if (aiFeedback.grammarErrors && aiFeedback.grammarErrors.length > 0) {
            const correctedText = applyCorrectionsSentenceLevel(
              content,
              aiFeedback.grammarErrors
            );
            submissionsWithCorrections.push({
              submissionId,
              content,
              correctedText,
              sourceType: "ai",
              exerciseId,
              exerciseTitle,
              exerciseType,
              submittedAt,
            });
          }
        } catch (e) {
          console.error("[miniExercise:turso] Error parsing AI feedback:", e);
        }
      }
    }

    if (submissionsWithCorrections.length === 0) {
      return null;
    }

    // Pick random submission
    const randomIndex = Math.floor(
      Math.random() * submissionsWithCorrections.length
    );
    const submission = submissionsWithCorrections[randomIndex];

    // Split into sentences
    const sentences = splitIntoSentences(submission.correctedText);

    if (sentences.length === 0) {
      return null;
    }

    // Try to find a sentence with corrections
    const sentenceIndices = sentences.map((_, idx) => idx);
    const shuffledIndices = sentenceIndices.sort(() => Math.random() - 0.5);

    for (const sentenceIdx of shuffledIndices) {
      const sentence = sentences[sentenceIdx];
      const originalSentences = splitIntoSentences(submission.content);

      // Try to match sentence
      let originalSentence = "";
      for (const origSent of originalSentences) {
        const correctedWords = sentence.toLowerCase().split(/\s+/).slice(0, 3);
        const origWords = origSent.toLowerCase().split(/\s+/).slice(0, 3);

        if (correctedWords.some((w) => origWords.includes(w))) {
          originalSentence = origSent;
          break;
        }
      }

      if (!originalSentence) {
        continue;
      }

      // Generate blanks
      const blanks = generateQuizBlanks(originalSentence, sentence);

      if (blanks.length > 0) {
        return {
          sentence,
          blanks,
          submissionId: submission.submissionId,
          sourceType: submission.sourceType,
          exerciseId: submission.exerciseId,
          exerciseTitle: submission.exerciseTitle,
          exerciseType: submission.exerciseType,
          submittedAt: submission.submittedAt,
          sentenceIndex: sentenceIdx,
          allSentences: sentences,
        };
      }
    }

    // Fallback: return first sentence anyway
    const firstSentence = sentences[0];
    const originalSentences = splitIntoSentences(submission.content);

    // First try generating blanks from differences
    let blanks = generateQuizBlanks(
      originalSentences[0] || firstSentence,
      firstSentence
    );

    // If no blanks found (perfect sentence), use random blanks
    if (blanks.length === 0) {
      blanks = generateRandomBlanks(firstSentence);
    }

    return {
      sentence: firstSentence,
      blanks,
      submissionId: submission.submissionId,
      sourceType: submission.sourceType,
      exerciseId: submission.exerciseId,
      exerciseTitle: submission.exerciseTitle,
      exerciseType: submission.exerciseType,
      submittedAt: submission.submittedAt,
      sentenceIndex: 0,
      allSentences: sentences,
    };
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error fetching random mini exercise:",
      error
    );
    return null;
  }
}
