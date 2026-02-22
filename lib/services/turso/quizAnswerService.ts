/**
 * Quiz Answer Service (Turso)
 * Answer submission, grading, and score aggregation for playground quizzes
 */

import { db } from '@/turso/client';
import type { QuizAnswer } from '@/lib/models/quiz';

// ─── HELPER ───

function rowToAnswer(row: any): QuizAnswer {
  return {
    answerId: row.answer_id as string,
    questionId: row.question_id as string,
    quizId: row.quiz_id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    answerText: row.answer_text as string,
    isCorrect: row.is_correct != null ? Boolean(row.is_correct) : null,
    scoredBy: (row.scored_by as string) || undefined,
    scoredAt: row.scored_at != null ? (row.scored_at as number) : undefined,
    createdAt: row.created_at as number,
  };
}

// ─── ANSWER OPERATIONS ───

export async function submitAnswer(
  questionId: string,
  quizId: string,
  userId: string,
  userName: string,
  answerText: string
): Promise<QuizAnswer | null> {
  try {
    // Auto-grade if multiple choice
    const qResult = await db.execute({
      sql: 'SELECT question_type, correct_answer FROM playground_quiz_questions WHERE question_id = ? LIMIT 1',
      args: [questionId],
    });
    const question = qResult.rows[0];
    let isCorrect: number | null = null;
    if (question && question.question_type === 'multiple_choice' && question.correct_answer) {
      isCorrect = answerText.trim().toLowerCase() === (question.correct_answer as string).trim().toLowerCase() ? 1 : 0;
    }

    const answerId = crypto.randomUUID();
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO playground_quiz_answers (answer_id, question_id, quiz_id, user_id, user_name, answer_text, is_correct, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [answerId, questionId, quizId, userId, userName, answerText, isCorrect, now],
    });

    return {
      answerId, questionId, quizId, userId, userName, answerText,
      isCorrect: isCorrect != null ? Boolean(isCorrect) : null,
      createdAt: now,
    };
  } catch (error) {
    console.error('[quizAnswerService] submitAnswer error:', error);
    return null;
  }
}

export async function getAnswersForQuestion(questionId: string): Promise<QuizAnswer[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM playground_quiz_answers WHERE question_id = ? ORDER BY created_at ASC',
      args: [questionId],
    });
    return result.rows.map(rowToAnswer);
  } catch (error) {
    console.error('[quizAnswerService] getAnswersForQuestion error:', error);
    return [];
  }
}

export async function getAnswersForQuiz(quizId: string): Promise<QuizAnswer[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM playground_quiz_answers WHERE quiz_id = ? ORDER BY created_at ASC',
      args: [quizId],
    });
    return result.rows.map(rowToAnswer);
  } catch (error) {
    console.error('[quizAnswerService] getAnswersForQuiz error:', error);
    return [];
  }
}

export async function gradeAnswer(answerId: string, isCorrect: boolean, scoredBy: string): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE playground_quiz_answers SET is_correct = ?, scored_by = ?, scored_at = ? WHERE answer_id = ?',
      args: [isCorrect ? 1 : 0, scoredBy, Date.now(), answerId],
    });
  } catch (error) {
    console.error('[quizAnswerService] gradeAnswer error:', error);
  }
}

// ─── SCORE AGGREGATION ───

export interface QuizScoreStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  averageScore: number;
  recentResults: Array<{
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    completedAt: number;
  }>;
}

export async function getQuizScoresForUser(userId: string): Promise<QuizScoreStats> {
  try {
    const result = await db.execute({
      sql: `SELECT a.quiz_id, q.title, COUNT(*) as total, SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct, MAX(a.created_at) as last_answer
            FROM playground_quiz_answers a
            JOIN playground_quizzes q ON a.quiz_id = q.quiz_id
            WHERE a.user_id = ? AND a.is_correct IS NOT NULL
            GROUP BY a.quiz_id, q.title
            ORDER BY last_answer DESC`,
      args: [userId],
    });

    const recentResults = result.rows.map((row) => ({
      quizId: row.quiz_id as string,
      quizTitle: row.title as string,
      totalQuestions: Number(row.total),
      correctAnswers: Number(row.correct),
      score: Number(row.total) > 0 ? Math.round((Number(row.correct) / Number(row.total)) * 100) : 0,
      completedAt: row.last_answer as number,
    }));

    const totalQuestions = recentResults.reduce((s, r) => s + r.totalQuestions, 0);
    const totalCorrect = recentResults.reduce((s, r) => s + r.correctAnswers, 0);

    return {
      totalQuizzes: recentResults.length,
      totalQuestions,
      totalCorrect,
      averageScore: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      recentResults,
    };
  } catch (error) {
    console.error('[quizAnswerService] getQuizScoresForUser error:', error);
    return { totalQuizzes: 0, totalQuestions: 0, totalCorrect: 0, averageScore: 0, recentResults: [] };
  }
}
