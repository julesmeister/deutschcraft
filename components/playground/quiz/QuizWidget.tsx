/**
 * QuizWidget — Main widget for live quizzes in the playground
 * M3 Expressive design with tonal surfaces and rich color
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
      <div className="bg-gradient-to-b from-violet-50 to-white rounded-3xl h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-violet-200 border-t-violet-500" />
          <p className="mt-3 text-sm font-medium text-violet-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // No active session
  if (!sessionState) {
    if (isTeacher) {
      return (
        <div className="bg-gradient-to-b from-violet-50/80 to-white rounded-3xl h-full overflow-y-auto">
          <QuizSetManager data={data} />
        </div>
      );
    }
    return (
      <div className="bg-gradient-to-b from-violet-50/80 to-white rounded-3xl h-full flex items-center justify-center">
        <div className="text-center px-8 max-w-xs">
          <div className="w-16 h-16 bg-violet-100 rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold text-lg mb-2">Live Quiz</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your teacher will start a quiz soon. Questions will appear here one at a time with a countdown timer.
          </p>
        </div>
      </div>
    );
  }

  // Active quiz session
  if (sessionState.status === "active") {
    return (
      <div className="bg-gradient-to-b from-violet-50/80 to-white rounded-3xl h-full overflow-y-auto">
        <QuizActiveView data={data} />
      </div>
    );
  }

  // Reviewing or finished
  if (sessionState.status === "reviewing" || sessionState.status === "finished") {
    return (
      <div className="bg-gradient-to-b from-violet-50/80 to-white rounded-3xl h-full overflow-y-auto">
        <QuizReviewView data={data} />
      </div>
    );
  }

  return null;
}
