/**
 * PlaygroundQuizStatsSection — Quiz stats for student profile page
 * Shows total quizzes taken, average score, and recent quiz results
 */

"use client";

import { useEffect, useState } from "react";
import type { QuizScoreStats } from "@/lib/services/turso/quizService";

interface PlaygroundQuizStatsSectionProps {
  studentEmail: string | null | undefined;
}

export function PlaygroundQuizStatsSection({ studentEmail }: PlaygroundQuizStatsSectionProps) {
  const [stats, setStats] = useState<QuizScoreStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentEmail) { setIsLoading(false); return; }
    async function load() {
      try {
        const res = await fetch(`/api/quiz?userId=${encodeURIComponent(studentEmail!)}&scores=true`);
        const data = await res.json();
        setStats(data.stats || null);
      } catch (error) {
        console.error("[PlaygroundQuizStatsSection] fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [studentEmail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-piku-purple" />
      </div>
    );
  }

  if (!stats || stats.totalQuizzes === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm">No playground quiz results yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{stats.totalQuizzes}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Quizzes Taken</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-piku-purple">{stats.averageScore}%</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Average Score</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-600">
            {stats.totalCorrect}/{stats.totalQuestions}
          </p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total Correct</p>
        </div>
      </div>

      {/* Recent results */}
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Recent Results</h4>
      <div className="space-y-2">
        {stats.recentResults.slice(0, 10).map((result) => (
          <div
            key={result.quizId}
            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">{result.quizTitle}</p>
              <p className="text-xs text-gray-400">{new Date(result.completedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${result.score >= 70 ? "text-green-600" : result.score >= 40 ? "text-amber-600" : "text-red-600"}`}>
                {result.score}%
              </p>
              <p className="text-xs text-gray-400">{result.correctAnswers}/{result.totalQuestions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
