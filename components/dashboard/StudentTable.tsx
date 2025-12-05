import { useState, useDeferredValue, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Filter students with deferred query to keep typing smooth
  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);
  const isStale = searchQuery !== deferredQuery;

  // Reset to page 1 when search filter changes or when data changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const handleRowClick = (row: { id: string }) => {
    router.push(`/dashboard/teacher/students/${row.id}`);
  };

  return (
    <div className="bg-white border border-gray-200">
      {/* Title, Search, and Add Student Button */}
      <div className="m-3 sm:m-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
            {selectedBatch ? `${selectedBatch.name} - Students` : 'Your Students'}
          </h5>
          {selectedBatch && (
            <button
              onClick={onAddStudent}
              className="group inline-flex items-center font-black text-[13px] sm:text-[14px] py-1.5 pl-4 sm:pl-5 pr-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
            >
              <span className="relative z-10 transition-colors duration-300">
                Add Student
              </span>
              <span className="relative z-10 ml-3 sm:ml-4 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-400 bg-white text-gray-900">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isStale && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
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
            label: 'Streak',
            render: (value) => (
              <p className="text-gray-500 text-xs flex items-center">
                🔥 {value} {value === 1 ? 'day' : 'days'}
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
        data={paginatedStudents}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredStudents.length,
          onPageChange: setCurrentPage,
        }}
        showViewAll={false}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
