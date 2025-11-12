/**
 * Custom hook that orchestrates all teacher dashboard logic
 * Reduces complexity in the main dashboard component
 */

import { useState, useEffect } from 'react';
import { Batch } from '../models';
import { useAllStudentsNested, useStudentsWithoutTeacher } from './useUsers';
import { useActiveBatches, useCreateBatch } from './useBatches';
import { useStudentManagement } from './useStudentManagement';
import { useTableState } from './useTableState';

interface UseTeacherDashboardProps {
  currentTeacherId: string | undefined;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

export function useTeacherDashboard({
  currentTeacherId,
  onSuccess,
  onError,
  onInfo,
}: UseTeacherDashboardProps) {
  // Data fetching
  const { students: allStudents, isLoading: studentsLoading, isError: studentsError } = useAllStudentsNested();
  const { students: studentsWithoutTeacher } = useStudentsWithoutTeacher();
  const { batches } = useActiveBatches(currentTeacherId);
  const createBatchMutation = useCreateBatch();

  // Batch selection
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Auto-select first batch if none selected
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, selectedBatch]);

  // Student management
  const studentManagement = useStudentManagement({
    currentTeacherId,
    selectedBatchId: selectedBatch?.batchId,
    studentsWithoutTeacher,
    onSuccess,
    onError,
    onInfo,
  });

  // Table state
  const tableState = useTableState({ pageSize: 5 });

  // Dialog state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);

  // Filter students by selected batch
  const myStudents = selectedBatch && currentTeacherId
    ? allStudents.filter(student =>
        student.teacherId === currentTeacherId &&
        student.batchId === selectedBatch.batchId
      )
    : [];

  // Transform students for table display
  const studentsForTable = myStudents.map((student) => {
    // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
    const displayName = (student as any).name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email;

    return {
      id: student.userId, // Using email as ID now
      name: displayName,
      image: student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`,
      sold: student.wordsLearned || 0,
      gain: 0, // TODO: Calculate progress from last week
      level: student.cefrLevel || 'A1',
      status: (student.teacherId ? 'in-stock' : 'low-stock') as 'in-stock' | 'low-stock',
      statusText: student.teacherId ? 'Active learner' : 'No teacher assigned',
    };
  });

  // Paginated students
  const { data: paginatedStudents, totalPages, totalItems } = tableState.paginateData(studentsForTable);

  // Available members for selection
  const availableMembers = studentsWithoutTeacher.map(student => {
    // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
    const displayName = (student as any).name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email;

    return {
      id: student.userId, // Using email as ID now
      name: displayName,
      avatar: student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`,
      isSelected: studentManagement.selectedStudentIds.has(student.userId),
    };
  });

  /**
   * Handle adding students to batch
   */
  const handleAddStudents = async () => {
    const success = await studentManagement.addStudentsToBatch();
    if (success) {
      setIsAddStudentOpen(false);
    }
  };

  /**
   * Handle removing a student
   */
  const handleRemoveStudent = async (studentId: string) => {
    await studentManagement.removeStudent(studentId, allStudents);
    tableState.closeMenu();
  };

  /**
   * Handle creating a batch
   */
  const handleCreateBatch = async (data: {
    name: string;
    description?: string;
    currentLevel: any;
    startDate: number;
    endDate: number | null;
  }) => {
    if (!currentTeacherId) {
      onError?.('Unable to identify current teacher');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        teacherId: currentTeacherId,
        ...data,
      });

      onSuccess?.('Batch created successfully!');
      setIsCreateBatchOpen(false);
    } catch (error) {
      console.error('[Create Batch] Error creating batch:', error);
      onError?.('Failed to create batch. Please try again.');
    }
  };

  return {
    // Loading states
    isLoading: studentsLoading,
    isError: studentsError,

    // Data
    batches,
    selectedBatch,
    myStudents,
    studentsForTable,
    paginatedStudents,
    availableMembers,
    allStudents,

    // Batch actions
    setSelectedBatch,
    handleCreateBatch,
    isCreatingBatch: createBatchMutation.isPending,

    // Student management
    handleAddStudents,
    handleRemoveStudent,
    toggleStudentSelection: studentManagement.toggleStudentSelection,
    isAddingStudents: studentManagement.isAddingStudents,
    isRemovingStudent: studentManagement.isRemovingStudent,

    // Table state
    currentPage: tableState.currentPage,
    setCurrentPage: tableState.setCurrentPage,
    openMenuId: tableState.openMenuId,
    setOpenMenuId: tableState.setOpenMenuId,
    pageSize: tableState.pageSize,
    totalPages,
    totalItems,

    // Dialog state
    isAddStudentOpen,
    setIsAddStudentOpen,
    isCreateBatchOpen,
    setIsCreateBatchOpen,
  };
}
