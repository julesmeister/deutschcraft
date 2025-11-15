'use client';

import { TabBar, TabItem } from '@/components/ui/TabBar';
import { CEFRLevel } from '@/lib/models/cefr';

interface LevelDistributionProps {
  levelDistribution: Record<CEFRLevel, number>;
}

export function LevelDistribution({ levelDistribution }: LevelDistributionProps) {
  const levelTabs: TabItem[] = Object.entries(levelDistribution).map(([level, count]) => ({
    id: level,
    label: level,
    icon: <span>📚</span>,
    value: count,
  }));

  return (
    <div className="bg-white border border-neutral-200 p-6">
      <h3 className="text-xl font-bold text-neutral-900 mb-4">
        Student Distribution by Level
      </h3>
      <TabBar
        tabs={levelTabs}
        variant="stats"
        size="compact"
      />
    </div>
  );
}
