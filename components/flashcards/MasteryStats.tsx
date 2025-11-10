'use client';

import { TabBar, TabItem } from '@/components/ui/TabBar';
import {
  ForgottenIcon,
  HardIcon,
  GoodIcon,
  EasyIcon,
} from '@/components/ui/DifficultyIcons';

interface MasteryStatsProps {
  stats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export function MasteryStats({ stats }: MasteryStatsProps) {
  const tabs: TabItem[] = [
    {
      id: 'forgotten',
      label: 'Forgotten',
      icon: <ForgottenIcon className="text-red-600" />,
      value: stats.again,
    },
    {
      id: 'hard',
      label: 'Hard',
      icon: <HardIcon className="text-amber-600" />,
      value: stats.hard,
    },
    {
      id: 'good',
      label: 'Good',
      icon: <GoodIcon className="text-blue-600" />,
      value: stats.good,
    },
    {
      id: 'easy',
      label: 'Easy',
      icon: <EasyIcon className="text-emerald-600" />,
      value: stats.easy,
    },
  ];

  return (
    <TabBar
      tabs={tabs}
      variant="stats"
    />
  );
}
