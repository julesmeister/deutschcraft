'use client';

import { TabBar, TabItem } from '@/components/ui/TabBar';
import {
  ForgottenIcon,
  HardIcon,
  GoodIcon,
  EasyIcon,
  ExpertIcon,
} from '@/components/ui/DifficultyIcons';

interface MasteryStatsProps {
  stats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
    expert: number;
  };
}

export function MasteryStats({ stats }: MasteryStatsProps) {
  const statItems = [
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
    {
      id: 'expert',
      label: 'Expert',
      icon: <ExpertIcon className="text-purple-600" />,
      value: stats.expert,
    },
  ];

  return (
    <>
      {/* Mobile: 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {statItems.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col gap-1 p-3 rounded-lg border border-gray-200 bg-white"
          >
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 shrink-0">
                {stat.icon}
              </div>
              <p className="text-[10px] font-medium text-neutral-900 truncate">
                {stat.label}
              </p>
            </div>
            <p className="text-lg font-medium text-neutral-900 leading-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tablet/Desktop: Horizontal TabBar */}
      <div className="hidden sm:block">
        <TabBar
          tabs={statItems}
          variant="stats"
        />
      </div>
    </>
  );
}
