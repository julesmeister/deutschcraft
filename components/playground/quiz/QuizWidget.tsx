/**
 * QuizWidget — Main widget for live quizzes in the playground
 * M3 Expressive: squircle containers, tonal elevation, dynamic color
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
      <div className="bg-white rounded-[28px] h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#E8DEF8]" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#6750A4] animate-spin" />
          </div>
          <p className="text-sm font-medium text-[#49454F] tracking-wide">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // No active session
  if (!sessionState) {
    if (isTeacher) {
      return (
        <div className="bg-white rounded-[28px] h-full overflow-y-auto">
          <QuizSetManager data={data} />
        </div>
      );
    }
    return (
      <div className="bg-white rounded-[28px] h-full flex items-center justify-center">
        <div className="text-center px-8 max-w-xs">
          {/* M3 icon container — squircle with tonal fill */}
          <div className="w-[72px] h-[72px] bg-[#EADDFF] rounded-[22px] flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-[#6750A4]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#1D1B20] font-semibold text-[22px] leading-7 mb-2">Live Quiz</p>
          <p className="text-sm text-[#49454F] leading-relaxed">
            Your teacher will start a quiz soon. Questions appear here with a countdown timer.
          </p>
        </div>
      </div>
    );
  }

  // Active quiz session
  if (sessionState.status === "active") {
    return (
      <div className="bg-white rounded-[28px] h-full overflow-y-auto">
        <QuizActiveView data={data} />
      </div>
    );
  }

  // Reviewing or finished
  if (sessionState.status === "reviewing" || sessionState.status === "finished") {
    return (
      <div className="bg-white rounded-[28px] h-full overflow-y-auto">
        <QuizReviewView data={data} />
      </div>
    );
  }

  return null;
}
