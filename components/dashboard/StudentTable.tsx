import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { Menu, MenuItem } from '@/components/ui/dropdown';
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
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
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
  openMenuId,
  setOpenMenuId,
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
              <div className="relative">
                <button
                  className="cursor-pointer select-none align-middle appearance-none outline-0 inline-flex relative p-1.5 rounded-full border-0 text-black/54 hover:bg-black/5 transition-colors"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === row.id ? null : row.id);
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                  </svg>
                </button>
                {openMenuId === row.id && (
                  <div className="absolute right-0 bottom-full mb-1 bg-white shadow-lg z-50">
                    <Menu compact className="min-w-[160px]">
                      <MenuItem
                        compact
                        onClick={() => onRemoveStudent(row.id)}
                        disabled={isRemoving}
                        icon={
                          isRemoving ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )
                        }
                        className="text-red-600 hover:bg-red-50"
                      >
                        {isRemoving ? 'Removing...' : 'Remove Student'}
                      </MenuItem>
                    </Menu>
                  </div>
                )}
              </div>
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
