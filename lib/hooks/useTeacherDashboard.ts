/**
 * Custom hook that orchestrates all teacher dashboard logic
 * Reduces complexity in the main dashboard component
 */

import { useState, useEffect } from 'react';
import { Batch, CEFRLevel } from '../models';
import { useAllStudentsNested, useStudentsWithoutTeacher } from './useUsers';
import { useActiveBatches, useCreateBatch } from './useBatches';
import { useStudentManagement } from './useStudentManagement';
import { useTableState } from './useTableState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStudyStats } from '../services/flashcardService';
import { updateStudentLevel } from '../services/studentService';

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
  const queryClient = useQueryClient();

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

  // Fetch study stats for all students
  const { data: studentsStats } = useQuery({
    queryKey: ['students-stats', myStudents.map(s => s.userId)],
    queryFn: async () => {
      const statsPromises = myStudents.map(async (student) => {
        try {
          const stats = await getStudyStats(student.userId);
          return { userId: student.userId, stats };
        } catch (error) {
          return { userId: student.userId, stats: { cardsLearned: 0, cardsMastered: 0, streak: 0, accuracy: 0, totalCards: 0 } };
        }
      });
      return await Promise.all(statsPromises);
    },
    enabled: myStudents.length > 0,
    staleTime: 60 * 1000, // 1 minute
  });

  // Create a map for quick lookup
  const statsMap = new Map(
    (studentsStats || []).map(item => [item.userId, item.stats])
  );

  // Transform students for table display
  const studentsForTable = myStudents.map((student) => {
    // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
    const displayName = (student as any).name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email;

    // Get stats for this student
    const stats = statsMap.get(student.userId) || { cardsLearned: 0, cardsMastered: 0, streak: 0, accuracy: 0, totalCards: 0 };

    return {
      id: student.userId, // Using email as ID now
      name: displayName,
      image: student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`,
      sold: stats.cardsLearned,
      gain: stats.streak, // Show streak as "progress"
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

  /**
   * Handle changing student's CEFR level
   */
  const handleChangeLevel = async (studentId: string, newLevel: CEFRLevel) => {
    try {
      onInfo?.(`Updating level to ${newLevel}...`);
      await updateStudentLevel(studentId, newLevel);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['students'] });

      onSuccess?.(`Student level updated to ${newLevel}!`);
    } catch (error) {
      console.error('[Change Level] Error updating student level:', error);
      onError?.('Failed to update student level. Please try again.');
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
    handleChangeLevel,
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
