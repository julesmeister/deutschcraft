/**
 * AttemptStats Component
 * Shows statistics for multiple attempts on an exercise
 */

'use client';

interface AttemptStatsProps {
  totalAttempts: number;
  reviewedAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
}

export function AttemptStats({
  totalAttempts,
  reviewedAttempts,
  averageScore,
  bestScore,
  latestScore,
}: AttemptStatsProps) {
  if (totalAttempts === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-bold text-neutral-700 mb-3">Your Progress on This Exercise</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Attempts" value={totalAttempts.toString()} />
        <StatCard label="Reviewed" value={reviewedAttempts.toString()} />
        <StatCard
          label="Average Score"
          value={averageScore > 0 ? `${averageScore}%` : '—'}
          highlight={averageScore >= 70}
        />
        <StatCard
          label="Best Score"
          value={bestScore > 0 ? `${bestScore}%` : '—'}
          highlight={bestScore >= 80}
        />
        <StatCard
          label="Latest Score"
          value={latestScore > 0 ? `${latestScore}%` : '—'}
          highlight={latestScore >= 70}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className="text-center">
      <div
        className={`text-2xl font-bold ${
          highlight ? 'text-green-600' : 'text-neutral-900'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
