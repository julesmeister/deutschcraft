/**
 * QuizWidget — Main widget for live quizzes in the playground
 * Routes to: QuizSetManager (no session), QuizActiveView (active), QuizReviewView (reviewing/finished)
 */

"use client";

import { useQuizData } from "./useQuizData";
import { QuizSetManager } from "./QuizSetManager";
import { QuizActiveView } from "./QuizActiveView";
import { QuizReviewView } from "./QuizReviewView";

export function QuizWidget() {
  const data = useQuizData();
  const { sessionState, isTeacher, isLoading } = data;

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-piku-purple" />
          <p className="mt-2 text-sm text-gray-500">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // No active session → show quiz set manager (teacher) or waiting state (student)
  if (!sessionState) {
    if (isTeacher) {
      return (
        <div className="bg-white rounded-3xl h-full overflow-y-auto">
          <QuizSetManager data={data} />
        </div>
      );
    }
    return (
      <div className="bg-white rounded-3xl h-full flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600 font-semibold">Waiting for teacher to start a quiz...</p>
          <p className="text-sm text-gray-400 mt-1">The quiz will appear here when ready</p>
        </div>
      </div>
    );
  }

  // Active quiz session
  if (sessionState.status === "active") {
    return (
      <div className="bg-white rounded-3xl h-full overflow-y-auto">
        <QuizActiveView data={data} />
      </div>
    );
  }

  // Reviewing or finished
  if (sessionState.status === "reviewing" || sessionState.status === "finished") {
    return (
      <div className="bg-white rounded-3xl h-full overflow-y-auto">
        <QuizReviewView data={data} />
      </div>
    );
  }

  return null;
}
