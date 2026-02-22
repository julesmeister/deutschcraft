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
        <div className="text-center px-8 max-w-xs">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-bold text-base mb-1">Live Quiz</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your teacher will start a quiz soon. Questions will appear here one at a time with a countdown timer.
          </p>
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
