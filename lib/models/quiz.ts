/**
 * Playground Quiz Models
 * Types for the live quiz widget in the playground
 */

export interface PlaygroundQuiz {
  quizId: string;
  roomId: string;
  title: string;
  createdBy: string;
  level?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestion {
  questionId: string;
  quizId: string;
  questionOrder: number;
  questionText: string;
  questionType: 'text' | 'multiple_choice';
  choices?: string[];
  correctAnswer?: string;
  timeLimit: number;
}

export interface QuizAnswer {
  answerId: string;
  questionId: string;
  quizId: string;
  userId: string;
  userName: string;
  answerText: string;
  isCorrect?: boolean | null;
  scoredBy?: string;
  scoredAt?: number;
  createdAt: number;
}

/** Live session state synced via classroom-tools Firestore blob */
export interface QuizSessionState {
  quizId: string;
  status: 'waiting' | 'active' | 'reviewing' | 'finished';
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  showResults: boolean;
}
