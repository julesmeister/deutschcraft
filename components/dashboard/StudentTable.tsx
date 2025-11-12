import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { StudentActionsDropdown } from '@/components/ui/StudentActionsDropdown';
import { useRouter } from 'next/navigation';

interface StudentTableProps {
  students: Array<{
    id: string;
    name: string;
    image: string;
    sold: number;
    gain: number;
    level: string;
    status: 'in-stock' | 'low-stock';
    statusText: string;
  }>;
  allStudents: Array<{
    id: string;
    name: string;
    image: string;
    sold: number;
    gain: number;
    level: string;
    status: 'in-stock' | 'low-stock';
    statusText: string;
  }>;
  selectedBatch: { name: string } | null;
  onAddStudent: () => void;
  onRemoveStudent: (studentId: string) => void;
  isRemoving: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
}

export function StudentTable({
  students,
  allStudents,
  selectedBatch,
  onAddStudent,
  onRemoveStudent,
  isRemoving,
  currentPage,
  setCurrentPage,
  pageSize,
}: StudentTableProps) {
  const router = useRouter();
  const totalPages = Math.ceil(allStudents.length / pageSize);

  const handleRowClick = (row: { id: string }) => {
    router.push(`/dashboard/teacher/students/${row.id}`);
  };

  return (
    <div className="bg-white border border-gray-200">
      {/* Title and Add Student Button */}
      <div className="flex items-center justify-between m-4">
        <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
          {selectedBatch ? `${selectedBatch.name} - Students` : 'Your Students'}
        </h5>
        {selectedBatch && (
          <button
            onClick={onAddStudent}
            className="group inline-flex items-center font-black text-[14px] py-1.5 pl-5 pr-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <span className="relative z-10 transition-colors duration-300">
              Add Student
            </span>
            <span className="relative z-10 ml-4 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-400 bg-white text-gray-900">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <SlimTable
        title=""
        columns={[
          {
            key: 'image',
            label: ' ',
            width: '60px',
            render: (value, row) => SlimTableRenderers.Avatar(value, row.name),
          },
          {
            key: 'name',
            label: 'Student',
            render: (value, row) => (
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
            align: 'center',
            render: (value) => <p className="text-gray-500 text-xs text-center">{value.toLocaleString()}</p>,
          },
          {
            key: 'gain',
            label: 'Progress',
            render: (value) => (
              <p className="text-gray-500 text-xs flex items-center">
                {SlimTableRenderers.Percentage(value)} from last week
              </p>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            width: '120px',
            render: (_, row) => (
              <StudentActionsDropdown
                studentId={row.id}
                onRemoveStudent={onRemoveStudent}
                isRemoving={isRemoving}
              />
            ),
          },
        ]}
        data={students}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: allStudents.length,
          onPageChange: setCurrentPage,
        }}
        showViewAll={false}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
