'use client';

import { CEFRLevel } from '@/lib/models/cefr';

interface TopPerformer {
  name: string;
  email: string;
  progress: number;
  streak: number;
  level: CEFRLevel;
}

interface TopPerformersProps {
  performers: TopPerformer[];
}

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <div className="bg-white border border-neutral-200 p-6">
      <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <span>🏆</span>
        Top 5 Performers
      </h3>
      {performers.length > 0 ? (
        <div className="space-y-3">
          {performers.map((student, index) => (
            <div
              key={student.email}
              className="flex items-center gap-4 p-4 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold text-neutral-900">{student.name}</div>
                <div className="text-xs text-neutral-500">{student.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-neutral-900">
                  {student.progress} words
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-1 justify-end">
                  <span className="inline-block px-2 py-0.5 text-xs font-bold bg-blue-500 text-white">
                    {student.level}
                  </span>
                  🔥 {student.streak}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-400">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-sm">No student data available yet</div>
        </div>
      )}
    </div>
  );
}
