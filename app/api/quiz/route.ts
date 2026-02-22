/**
 * Quiz API Routes
 * GET: Fetch quizzes for room, quiz questions, answers, or user scores
 * POST: Action-based operations (createQuiz, deleteQuiz, addQuestion, updateQuestion,
 *        deleteQuestion, submitAnswer, gradeAnswer)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getQuizzesForRoom,
  getQuiz,
  createQuiz,
  deleteQuiz,
  getQuizQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submitAnswer,
  getAnswersForQuestion,
  getAnswersForQuiz,
  gradeAnswer,
  getQuizScoresForUser,
} from '@/lib/services/turso/quizService';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId');
  const quizId = req.nextUrl.searchParams.get('quizId');
  const answers = req.nextUrl.searchParams.get('answers');
  const questionId = req.nextUrl.searchParams.get('questionId');
  const userId = req.nextUrl.searchParams.get('userId');
  const scores = req.nextUrl.searchParams.get('scores');

  // User quiz score stats
  if (userId && scores === 'true') {
    const stats = await getQuizScoresForUser(userId);
    return NextResponse.json({ stats });
  }

  // Answers for a specific question
  if (questionId) {
    const questionAnswers = await getAnswersForQuestion(questionId);
    return NextResponse.json({ answers: questionAnswers });
  }

  // Quiz + questions (+ optional answers)
  if (quizId) {
    const [quiz, questions] = await Promise.all([
      getQuiz(quizId),
      getQuizQuestions(quizId),
    ]);
    if (answers === 'true') {
      const quizAnswers = await getAnswersForQuiz(quizId);
      return NextResponse.json({ quiz, questions, answers: quizAnswers });
    }
    return NextResponse.json({ quiz, questions });
  }

  // List quizzes for room
  if (roomId) {
    const quizzes = await getQuizzesForRoom(roomId);
    return NextResponse.json({ quizzes });
  }

  return NextResponse.json({ error: 'roomId, quizId, or userId required' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'createQuiz': {
        const { roomId, title, createdBy, level } = body;
        if (!roomId || !title || !createdBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const quiz = await createQuiz(roomId, title, createdBy, level);
        return NextResponse.json({ quiz });
      }

      case 'deleteQuiz': {
        const { quizId } = body;
        if (!quizId) return NextResponse.json({ error: 'quizId required' }, { status: 400 });
        await deleteQuiz(quizId);
        return NextResponse.json({ success: true });
      }

      case 'addQuestion': {
        const { quizId, questionText, questionType, choices, correctAnswer, timeLimit } = body;
        if (!quizId || !questionText) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const question = await addQuestion(quizId, questionText, questionType || 'text', choices, correctAnswer, timeLimit);
        return NextResponse.json({ question });
      }

      case 'updateQuestion': {
        const { questionId, ...fields } = body;
        if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });
        await updateQuestion(questionId, fields);
        return NextResponse.json({ success: true });
      }

      case 'deleteQuestion': {
        const { questionId } = body;
        if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });
        await deleteQuestion(questionId);
        return NextResponse.json({ success: true });
      }

      case 'submitAnswer': {
        const { questionId, quizId, userId, userName, answerText } = body;
        if (!questionId || !quizId || !userId || !userName || !answerText) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const answer = await submitAnswer(questionId, quizId, userId, userName, answerText);
        return NextResponse.json({ answer });
      }

      case 'gradeAnswer': {
        const { answerId, isCorrect, scoredBy } = body;
        if (!answerId || isCorrect === undefined || !scoredBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        await gradeAnswer(answerId, isCorrect, scoredBy);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[quiz API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
