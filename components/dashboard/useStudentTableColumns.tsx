import { SlimTableRenderers } from '@/components/ui/SlimTable';
import { StudentActionsDropdown } from '@/components/ui/StudentActionsDropdown';
import { LevelSelector } from './LevelSelector';
import { CEFRLevel } from '@/lib/models';

interface UseStudentTableColumnsProps {
  onRemoveStudent: (studentId: string) => void;
  onChangeLevel?: (studentId: string, newLevel: CEFRLevel) => void;
  isRemoving: boolean;
}

export function useStudentTableColumns({
  onRemoveStudent,
  onChangeLevel,
  isRemoving,
}: UseStudentTableColumnsProps) {
  return [
    {
      key: 'image',
      label: ' ',
      width: '60px',
      render: (value: string, row: any) => SlimTableRenderers.Avatar(value, row.name),
    },
    {
      key: 'name',
      label: 'Student',
      render: (value: string, row: any) => (
        <div>
          {SlimTableRenderers.Link(value)}
          {SlimTableRenderers.Status(
            row.status === 'in-stock' ? 'bg-green-500' : row.status === 'low-stock' ? 'bg-red-600' : 'bg-neutral-300',
            row.statusText
          )}
        </div>
      ),
    },
    {
      key: 'sold',
      label: 'Words Learned',
      align: 'center' as const,
      render: (value: number) => <p className="text-gray-500 text-xs text-center">{value.toLocaleString()}</p>,
    },
    {
      key: 'gain',
      label: 'Streak',
      render: (value: number) => (
        <p className="text-gray-500 text-xs flex items-center">
          🔥 {value} {value === 1 ? 'day' : 'days'}
        </p>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      align: 'center' as const,
      width: '100px',
      render: (value: string, row: any) => (
        <LevelSelector
          currentLevel={value}
          studentId={row.id}
          onChangeLevel={onChangeLevel}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      width: '120px',
      render: (_: any, row: any) => (
        <StudentActionsDropdown
          studentId={row.id}
          onRemoveStudent={onRemoveStudent}
          isRemoving={isRemoving}
        />
      ),
    },
  ];
}
