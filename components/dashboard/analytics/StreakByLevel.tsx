'use client';

import { TabBar } from '@/components/ui/TabBar';
import { CEFRLevel } from '@/lib/models/cefr';

interface StreakByLevelProps {
  averageStreakByLevel: Record<CEFRLevel, number>;
}

export function StreakByLevel({ averageStreakByLevel }: StreakByLevelProps) {
  return (
    <div className="bg-white border border-neutral-200 p-6">
      <h3 className="text-xl font-bold text-neutral-900 mb-4">
        Average Streak by Level (days)
      </h3>
      <TabBar
        tabs={Object.entries(averageStreakByLevel).map(([level, avgStreak]) => ({
          id: level,
          label: level,
          icon: <span>🔥</span>,
          value: avgStreak.toFixed(1),
        }))}
        variant="stats"
        size="compact"
      />
    </div>
  );
}
