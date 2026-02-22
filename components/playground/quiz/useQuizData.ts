/**
 * useQuizData — state management hook for QuizWidget
 * Handles quizzes, questions, answers, live session state, and all CRUD handlers.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useOptionalWidgetContext } from "../layout/PlaygroundWidgetContext";
import { useClassroomToolState } from "../tools/useClassroomToolState";
import type { PlaygroundQuiz, QuizQuestion, QuizAnswer, QuizSessionState } from "@/lib/models/quiz";

export function useQuizData() {
  const ctx = useOptionalWidgetContext();
  const userId = ctx?.userId ?? "";
  const userName = ctx?.userName ?? "";
  const userRole = ctx?.userRole ?? "student";
  const isTeacher = userRole === "teacher";
  const roomId = ctx?.currentRoom?.roomId ?? "";
  const level = ctx?.currentRoom?.level;

  // Classroom tool state for real-time session sync
  const toolState = useClassroomToolState({
    roomId,
    userRole: userRole as "teacher" | "student",
    currentUserId: userId,
  });
  const [sessionState, setSessionState] = toolState.useToolValue<QuizSessionState | null>("quiz-session", null);

  // Local state
  const [quizzes, setQuizzes] = useState<PlaygroundQuiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<PlaygroundQuiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch ───

  const fetchQuizzes = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/quiz?roomId=${roomId}`);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("[useQuizData] fetch quizzes error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  const fetchQuizDetail = useCallback(async (quizId: string, includeAnswers = false) => {
    try {
      const url = `/api/quiz?quizId=${quizId}${includeAnswers ? "&answers=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.quiz) setCurrentQuiz(data.quiz);
      setQuestions(data.questions || []);
      if (data.answers) setAnswers(data.answers);
    } catch (error) {
      console.error("[useQuizData] fetch quiz detail error:", error);
    }
  }, []);

  const fetchAnswers = useCallback(async (quizId: string) => {
    try {
      const res = await fetch(`/api/quiz?quizId=${quizId}&answers=true`);
      const data = await res.json();
      if (data.answers) setAnswers(data.answers);
    } catch (error) {
      console.error("[useQuizData] fetch answers error:", error);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  // When session state changes, load the quiz detail
  useEffect(() => {
    if (sessionState?.quizId) {
      const includeAnswers = sessionState.status === "reviewing" || sessionState.status === "finished";
      fetchQuizDetail(sessionState.quizId, includeAnswers);
    }
  }, [sessionState?.quizId, sessionState?.status, fetchQuizDetail]);

  // Poll answers during active session (for teacher to see submission count)
  useEffect(() => {
    if (!sessionState?.quizId || sessionState.status !== "active") {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    if (isTeacher) {
      pollRef.current = setInterval(() => fetchAnswers(sessionState.quizId), 3000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, [sessionState?.quizId, sessionState?.status, isTeacher, fetchAnswers]);

  // ─── Quiz CRUD ───

  const handleCreateQuiz = useCallback(async (title: string) => {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createQuiz", roomId, title, createdBy: userId, level }),
    });
    const data = await res.json();
    if (data.quiz) {
      setQuizzes((prev) => [data.quiz, ...prev]);
      setCurrentQuiz(data.quiz);
      setQuestions([]);
    }
    return data.quiz;
  }, [roomId, userId, level]);

  const handleDeleteQuiz = useCallback(async (quizId: string) => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteQuiz", quizId }),
    });
    setQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
    if (currentQuiz?.quizId === quizId) { setCurrentQuiz(null); setQuestions([]); }
  }, [currentQuiz]);

  // ─── Question CRUD ───

  const handleAddQuestion = useCallback(async (
    questionText: string,
    questionType: "text" | "multiple_choice",
    choices?: string[],
    correctAnswer?: string,
    timeLimit?: number
  ) => {
    if (!currentQuiz) return;
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addQuestion", quizId: currentQuiz.quizId, questionText, questionType, choices, correctAnswer, timeLimit }),
    });
    const data = await res.json();
    if (data.question) setQuestions((prev) => [...prev, data.question]);
  }, [currentQuiz]);

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteQuestion", questionId }),
    });
    setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
  }, []);

  // ─── Session Control (Teacher) ───

  const handleStartQuiz = useCallback((quizId: string) => {
    setSubmittedQuestionIds(new Set());
    setAnswers([]);
    setSessionState({
      quizId,
      status: "active",
      currentQuestionIndex: 0,
      questionStartedAt: Date.now(),
      showResults: false,
    });
  }, [setSessionState]);

  const handleNextQuestion = useCallback(() => {
    if (!sessionState) return;
    const nextIndex = sessionState.currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      // All questions done → reviewing
      setSessionState({ ...sessionState, status: "reviewing", questionStartedAt: null, showResults: false });
    } else {
      setSessionState({ ...sessionState, currentQuestionIndex: nextIndex, questionStartedAt: Date.now() });
    }
  }, [sessionState, questions.length, setSessionState]);

  const handleEndQuiz = useCallback(() => {
    if (!sessionState) return;
    setSessionState({ ...sessionState, status: "finished", showResults: true });
  }, [sessionState, setSessionState]);

  const handleClearSession = useCallback(() => {
    setSessionState(null);
    setAnswers([]);
    setSubmittedQuestionIds(new Set());
  }, [setSessionState]);

  // ─── Answer Submission (Student) ───

  const handleSubmitAnswer = useCallback(async (questionId: string, answerText: string) => {
    if (!sessionState) return;
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitAnswer", questionId, quizId: sessionState.quizId, userId, userName, answerText }),
    });
    const data = await res.json();
    if (data.answer) {
      setAnswers((prev) => [...prev, data.answer]);
      setSubmittedQuestionIds((prev) => new Set(prev).add(questionId));
    }
  }, [sessionState, userId, userName]);

  // ─── Grading (Teacher) ───

  const handleGradeAnswer = useCallback(async (answerId: string, isCorrect: boolean) => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "gradeAnswer", answerId, isCorrect, scoredBy: userId }),
    });
    setAnswers((prev) => prev.map((a) =>
      a.answerId === answerId ? { ...a, isCorrect, scoredBy: userId, scoredAt: Date.now() } : a
    ));
  }, [userId]);

  // Current question helper
  const currentQuestion = sessionState?.status === "active" ? questions[sessionState.currentQuestionIndex] ?? null : null;

  return {
    userId, userName, isTeacher, roomId, level,
    quizzes, currentQuiz, questions, answers, sessionState,
    isLoading, currentQuestion, submittedQuestionIds,
    setCurrentQuiz,
    fetchQuizDetail, fetchAnswers, fetchQuizzes,
    handleCreateQuiz, handleDeleteQuiz,
    handleAddQuestion, handleDeleteQuestion,
    handleStartQuiz, handleNextQuestion, handleEndQuiz, handleClearSession,
    handleSubmitAnswer, handleGradeAnswer,
  };
}
