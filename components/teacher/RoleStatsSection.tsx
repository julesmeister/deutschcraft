/**
 * RoleStatsSection Component
 * Displays user role statistics overview
 */

'use client';

import { TabBar } from '@/components/ui/TabBar';

interface RoleStatsSectionProps {
  totalUsers: number;
  students: number;
  teachers: number;
  pending: number;
}

export function RoleStatsSection({
  totalUsers,
  students,
  teachers,
  pending,
}: RoleStatsSectionProps) {
  return (
    <div className="mb-8">
      <TabBar
        variant="stats"
        tabs={[
          {
            id: 'total',
            label: 'Total Users',
            value: totalUsers,
            icon: undefined,
          },
          {
            id: 'students',
            label: 'Students',
            value: students,
            icon: undefined,
          },
          {
            id: 'teachers',
            label: 'Teachers',
            value: teachers,
            icon: undefined,
          },
          {
            id: 'pending',
            label: 'Pending Approval',
            value: pending,
            icon: undefined,
          },
        ]}
      />
    </div>
  );
}
