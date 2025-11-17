import { TabBar } from '@/components/ui/TabBar';

interface BatchStatsProps {
  totalBatches: number;
  activeBatches: number;
  totalStudents: number;
}

export function BatchStats({ totalBatches, activeBatches, totalStudents }: BatchStatsProps) {
  return (
    <div className="mb-8">
      <TabBar
        variant="stats"
        tabs={[
          {
            id: 'total',
            label: 'Total Batches',
            value: totalBatches,
            icon: undefined,
          },
          {
            id: 'active',
            label: 'Active Batches',
            value: activeBatches,
            icon: undefined,
          },
          {
            id: 'students',
            label: 'Total Students',
            value: totalStudents,
            icon: undefined,
          },
        ]}
      />
    </div>
  );
}
