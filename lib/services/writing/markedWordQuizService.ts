/**
 * Marked Word Quiz Service
 * Generates quizzes from student-marked words in answers
 */

import { QuizBlank } from '@/lib/models/writing';
import { MarkedWord, StudentAnswerSubmission } from '@/lib/models/studentAnswers';

export interface MarkedWordQuizItem {
  sentence: string;
  blank: QuizBlank;
  exerciseId: string;
  itemNumber: string;
  sentenceId: string;  // For tracking completion
}

/**
 * Generate quiz items from marked words
 */
export async function generateMarkedWordQuiz(
  studentId: string,
  exerciseIds: string[]
): Promise<MarkedWordQuizItem[]> {
  const quizItems: MarkedWordQuizItem[] = [];

  // Get answers with marked words
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === 'true';
  let answersWithMarks: StudentAnswerSubmission[];

  if (useTurso) {
    const { getMarkedWordsForLesson } = await import(
      '@/lib/services/turso/studentAnswerService'
    );
    answersWithMarks = await getMarkedWordsForLesson(studentId, exerciseIds);
  } else {
    // Firebase: fetch answers and filter for marked words
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const answersRef = collection(db, 'studentAnswers');

    // Firestore has a limit of 10 items for 'in' queries
    const chunks = [];
    for (let i = 0; i < exerciseIds.length; i += 10) {
      chunks.push(exerciseIds.slice(i, i + 10));
    }

    answersWithMarks = [];
    for (const chunk of chunks) {
      const q = query(
        answersRef,
        where('studentId', '==', studentId),
        where('exerciseId', 'in', chunk)
      );

      const snapshot = await getDocs(q);
      const answers = snapshot.docs
        .map(doc => doc.data() as StudentAnswerSubmission)
        .filter(a => a.markedWords && a.markedWords.length > 0);

      answersWithMarks.push(...answers);
    }
  }

  // Generate quiz items (each marked word = one quiz item)
  for (const answer of answersWithMarks) {
    if (!answer.markedWords || answer.markedWords.length === 0) continue;

    for (const markedWord of answer.markedWords) {
      // Strip punctuation for answer checking
      const cleanWord = markedWord.word.replace(/[^\w\säöüÄÖÜß]+$/g, '');

      const blank: QuizBlank = {
        index: quizItems.length,
        correctAnswer: cleanWord,
        position: markedWord.startIndex,
        hint: `${cleanWord.length} characters`,
      };

      const sentenceId = `${answer.exerciseId}_${answer.itemNumber}_${markedWord.startIndex}`;

      quizItems.push({
        sentence: answer.studentAnswer,
        blank,
        exerciseId: answer.exerciseId,
        itemNumber: answer.itemNumber,
        sentenceId,
      });
    }
  }

  // Shuffle for variety
  return shuffleArray(quizItems);
}

/**
 * Get count of marked words for a lesson
 */
export async function getMarkedWordCount(
  studentId: string,
  exerciseIds: string[]
): Promise<number> {
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

  if (useTurso) {
    const { getMarkedWordsForLesson } = await import(
      '@/lib/services/turso/studentAnswerService'
    );
    const answers = await getMarkedWordsForLesson(studentId, exerciseIds);
    return answers.reduce((sum, a) => sum + (a.markedWords?.length || 0), 0);
  } else {
    // Firebase: fetch and count
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const answersRef = collection(db, 'studentAnswers');

    // Process in chunks
    const chunks = [];
    for (let i = 0; i < exerciseIds.length; i += 10) {
      chunks.push(exerciseIds.slice(i, i + 10));
    }

    let totalCount = 0;
    for (const chunk of chunks) {
      const q = query(
        answersRef,
        where('studentId', '==', studentId),
        where('exerciseId', 'in', chunk)
      );

      const snapshot = await getDocs(q);
      const answers = snapshot.docs.map(doc => doc.data() as StudentAnswerSubmission);

      for (const answer of answers) {
        if (answer.markedWords) {
          totalCount += answer.markedWords.length;
        }
      }
    }

    return totalCount;
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
