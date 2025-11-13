/**
 * Submissions Table Component
 * Displays writing submissions in a table format with actions
 */

import { useRouter } from 'next/navigation';
import { SlimTable } from '@/components/ui/SlimTable';
import { CompactButtonDropdown, DropdownOption } from '@/components/ui/CompactButtonDropdown';
import { WritingExerciseType } from '@/lib/models/writing';

interface TableRow {
  id: string;
  exerciseType: WritingExerciseType;
  exerciseTitle: string;
  userId: string;
  studentName: string;
  wordCount: number;
  level: string;
  submittedAt: number;
  status: string;
  attemptNumber?: number;
  teacherScore?: string;
  teacherFeedback?: string;
}

interface SubmissionsTableProps {
  data: TableRow[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onStatusChange: (submissionId: string, newStatus: string) => void;
}

export function SubmissionsTable({
  data,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onStatusChange,
}: SubmissionsTableProps) {
  const router = useRouter();

  const getExerciseIcon = (exerciseType: WritingExerciseType) => {
    switch (exerciseType) {
      case 'creative':
        return '✨';
      case 'translation':
        return '🔄';
      case 'email':
        return '✉️';
      case 'formal-letter':
      case 'informal-letter':
        return '📨';
      default:
        return '📝';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeSince = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleRowClick = (row: TableRow) => {
    router.push(`/dashboard/teacher/writing/grade/${row.id}`);
  };

  return (
    <SlimTable
      title=""
      columns={[
        {
          key: 'exerciseType',
          label: ' ',
          width: '60px',
          render: (value) => (
            <span className="text-2xl">{getExerciseIcon(value as WritingExerciseType)}</span>
          ),
        },
        {
          key: 'exerciseTitle',
          label: 'Exercise',
          render: (value, row) => (
            <div>
              <div className="font-bold text-gray-900 truncate hover:text-blue-600 transition">
                {value}
              </div>
              <div className="text-sm text-gray-600">{row.studentName}</div>
            </div>
          ),
        },
        {
          key: 'wordCount',
          label: 'Words',
          align: 'center',
          render: (value) => <p className="text-gray-500 text-xs text-center">{value}</p>,
        },
        {
          key: 'level',
          label: 'Level',
          align: 'center',
          render: (value) => (
            <span className="uppercase text-xs font-bold text-gray-600">{value}</span>
          ),
        },
        {
          key: 'submittedAt',
          label: 'Submitted',
          render: (value) => (
            <div className="text-sm text-gray-600">
              <div>{value ? formatDate(value as number) : 'Draft'}</div>
              {value && (
                <div className="text-amber-600 font-medium text-xs">
                  {getTimeSince(value as number)}
                </div>
              )}
            </div>
          ),
        },
        {
          key: 'status',
          label: 'Status',
          align: 'center',
          width: '220px',
          render: (value, row) => {
            const statusOptions: DropdownOption[] = [
              {
                value: 'submitted',
                label: 'Pending Review',
                icon: <span className="text-sm">⏳</span>,
              },
              {
                value: 'reviewed',
                label: 'Graded',
                icon: <span className="text-sm">✓</span>,
              },
              {
                value: 'view',
                label: 'View Submission',
                icon: (
                  <svg
                    className="w-3.5 h-3.5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ),
              },
            ];

            return (
              <div
                className="flex items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Status Dropdown */}
                <CompactButtonDropdown
                  label={
                    value === 'reviewed'
                      ? `Graded${row.teacherScore ? ` ${row.teacherScore}` : ''}`
                      : 'Pending'
                  }
                  icon={<span className="text-sm">{value === 'reviewed' ? '✓' : '⏳'}</span>}
                  options={statusOptions}
                  value={value as string}
                  onChange={(selectedValue) => {
                    if (selectedValue === 'view') {
                      router.push(`/dashboard/teacher/writing/grade/${row.id}`);
                    } else {
                      onStatusChange(row.id, selectedValue as string);
                    }
                  }}
                  buttonClassName={`
                    !text-xs !py-1 !px-2.5
                    ${
                      value === 'reviewed'
                        ? '!bg-green-100 !text-green-700 hover:!bg-green-200'
                        : '!bg-yellow-100 !text-yellow-700 hover:!bg-yellow-200'
                    }
                  `}
                  usePortal={true}
                />

                {/* Attempt Badge */}
                {row.attemptNumber && row.attemptNumber > 1 && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded">
                    <span>🔄</span>
                    <span>#{row.attemptNumber}</span>
                  </div>
                )}
              </div>
            );
          },
        },
      ]}
      data={data}
      onRowClick={handleRowClick}
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        totalItems,
        onPageChange,
      }}
      showViewAll={false}
    />
  );
}
