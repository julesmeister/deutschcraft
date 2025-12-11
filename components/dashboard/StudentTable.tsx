import { useState, useDeferredValue, useEffect } from 'react';
import { SlimTable } from '@/components/ui/SlimTable';
import { StudentTableHeader } from './StudentTableHeader';
import { useStudentTableColumns } from './useStudentTableColumns';
import { useRouter } from 'next/navigation';
import { CEFRLevel } from '@/lib/models';

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
  onChangeLevel?: (studentId: string, newLevel: CEFRLevel) => void;
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
  onChangeLevel,
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

  const columns = useStudentTableColumns({
    onRemoveStudent,
    onChangeLevel,
    isRemoving,
  });

  return (
    <div className="bg-white border border-gray-200">
      <StudentTableHeader
        selectedBatch={selectedBatch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddStudent={onAddStudent}
        isStale={isStale}
      />

      <SlimTable
        title=""
        columns={columns}
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
