/**
 * Quiz Service (Turso)
 * CRUD operations for playground quizzes and questions
 * Answer operations are in quizAnswerService.ts
 */

import { db } from '@/turso/client';
import type { PlaygroundQuiz, QuizQuestion } from '@/lib/models/quiz';

// Re-export answer service for convenience
export { submitAnswer, getAnswersForQuestion, getAnswersForQuiz, gradeAnswer, getQuizScoresForUser } from './quizAnswerService';
export type { QuizScoreStats } from './quizAnswerService';

// ─── HELPER FUNCTIONS ───

function rowToQuiz(row: any): PlaygroundQuiz {
  return {
    quizId: row.quiz_id as string,
    roomId: row.room_id as string,
    title: row.title as string,
    createdBy: row.created_by as string,
    level: (row.level as string) || undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToQuestion(row: any): QuizQuestion {
  return {
    questionId: row.question_id as string,
    quizId: row.quiz_id as string,
    questionOrder: row.question_order as number,
    questionText: row.question_text as string,
    questionType: row.question_type as 'text' | 'multiple_choice',
    choices: row.choices ? JSON.parse(row.choices as string) : undefined,
    correctAnswer: (row.correct_answer as string) || undefined,
    timeLimit: row.time_limit as number,
  };
}

// ─── QUIZ OPERATIONS ───

export async function getQuizzesForRoom(roomId: string): Promise<PlaygroundQuiz[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM playground_quizzes WHERE room_id = ? ORDER BY created_at DESC',
      args: [roomId],
    });
    return result.rows.map(rowToQuiz);
  } catch (error) {
    console.error('[quizService] getQuizzesForRoom error:', error);
    return [];
  }
}

export async function getQuiz(quizId: string): Promise<PlaygroundQuiz | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM playground_quizzes WHERE quiz_id = ? LIMIT 1',
      args: [quizId],
    });
    if (result.rows.length === 0) return null;
    return rowToQuiz(result.rows[0]);
  } catch (error) {
    console.error('[quizService] getQuiz error:', error);
    return null;
  }
}

export async function createQuiz(
  roomId: string,
  title: string,
  createdBy: string,
  level?: string
): Promise<PlaygroundQuiz | null> {
  try {
    const quizId = crypto.randomUUID();
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO playground_quizzes (quiz_id, room_id, title, created_by, level, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [quizId, roomId, title, createdBy, level || null, now, now],
    });

    return { quizId, roomId, title, createdBy, level, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('[quizService] createQuiz error:', error);
    return null;
  }
}

export async function deleteQuiz(quizId: string): Promise<void> {
  try {
    await db.execute({ sql: 'DELETE FROM playground_quizzes WHERE quiz_id = ?', args: [quizId] });
  } catch (error) {
    console.error('[quizService] deleteQuiz error:', error);
  }
}

// ─── QUESTION OPERATIONS ───

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM playground_quiz_questions WHERE quiz_id = ? ORDER BY question_order ASC',
      args: [quizId],
    });
    return result.rows.map(rowToQuestion);
  } catch (error) {
    console.error('[quizService] getQuizQuestions error:', error);
    return [];
  }
}

export async function addQuestion(
  quizId: string,
  questionText: string,
  questionType: 'text' | 'multiple_choice',
  choices?: string[],
  correctAnswer?: string,
  timeLimit: number = 60
): Promise<QuizQuestion | null> {
  try {
    const questionId = crypto.randomUUID();
    const orderResult = await db.execute({
      sql: 'SELECT COALESCE(MAX(question_order), -1) + 1 AS next_order FROM playground_quiz_questions WHERE quiz_id = ?',
      args: [quizId],
    });
    const questionOrder = (orderResult.rows[0]?.next_order as number) ?? 0;

    await db.execute({
      sql: `INSERT INTO playground_quiz_questions (question_id, quiz_id, question_order, question_text, question_type, choices, correct_answer, time_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [questionId, quizId, questionOrder, questionText, questionType, choices ? JSON.stringify(choices) : null, correctAnswer || null, timeLimit],
    });

    return { questionId, quizId, questionOrder, questionText, questionType, choices, correctAnswer, timeLimit };
  } catch (error) {
    console.error('[quizService] addQuestion error:', error);
    return null;
  }
}

export async function updateQuestion(
  questionId: string,
  fields: Partial<Pick<QuizQuestion, 'questionText' | 'questionType' | 'choices' | 'correctAnswer' | 'timeLimit'>>
): Promise<void> {
  try {
    const updates: string[] = [];
    const args: any[] = [];

    if (fields.questionText !== undefined) { updates.push('question_text = ?'); args.push(fields.questionText); }
    if (fields.questionType !== undefined) { updates.push('question_type = ?'); args.push(fields.questionType); }
    if (fields.choices !== undefined) { updates.push('choices = ?'); args.push(JSON.stringify(fields.choices)); }
    if (fields.correctAnswer !== undefined) { updates.push('correct_answer = ?'); args.push(fields.correctAnswer); }
    if (fields.timeLimit !== undefined) { updates.push('time_limit = ?'); args.push(fields.timeLimit); }

    if (updates.length === 0) return;
    args.push(questionId);

    await db.execute({
      sql: `UPDATE playground_quiz_questions SET ${updates.join(', ')} WHERE question_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[quizService] updateQuestion error:', error);
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    await db.execute({ sql: 'DELETE FROM playground_quiz_questions WHERE question_id = ?', args: [questionId] });
  } catch (error) {
    console.error('[quizService] deleteQuestion error:', error);
  }
}
