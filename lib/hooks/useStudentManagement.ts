/**
 * Custom hook for managing student assignment and removal
 * Encapsulates student management logic to reduce prop drilling
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { assignStudentsToBatch, removeStudentFromTeacher } from '../services/studentService';
import { queryKeys } from '../queryClient';
import { User } from '../models';

interface UseStudentManagementProps {
  currentTeacherId: string | undefined;
  selectedBatchId: string | undefined;
  studentsWithoutTeacher: User[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

export function useStudentManagement({
  currentTeacherId,
  selectedBatchId,
  studentsWithoutTeacher,
  onSuccess,
  onError,
  onInfo,
}: UseStudentManagementProps) {
  const queryClient = useQueryClient();
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  /**
   * Toggle student selection for batch assignment
   */
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  /**
   * Clear all selected students
   */
  const clearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  /**
   * Add selected students to batch
   */
  const addStudentsToBatch = async () => {
    const selectedStudents = Array.from(selectedStudentIds);

    if (selectedStudents.length === 0) {
      onError?.('Please select at least one student');
      return false;
    }

    if (!currentTeacherId) {
      onError?.('Unable to identify current teacher');
      return false;
    }

    if (!selectedBatchId) {
      onError?.('Please select a batch first');
      return false;
    }

    try {
      setIsAddingStudents(true);
      onInfo?.(`Adding ${selectedStudents.length} student(s)...`);

      // Get student emails from selected IDs
      const studentEmails = selectedStudents
        .map(studentId => {
          const student = studentsWithoutTeacher.find(s => s.userId === studentId);
          if (!student) {
            console.error('[addStudentsToBatch] Student not found for ID:', studentId);
            return null;
          }
          return student.userId; // userId is email
        })
        .filter((email): email is string => email !== null);

      // Assign all students using service layer
      await assignStudentsToBatch(studentEmails, currentTeacherId, selectedBatchId);

      // Refetch the students list
      await queryClient.invalidateQueries({ queryKey: queryKeys.allStudents() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.studentsWithoutTeacher() });

      onSuccess?.(`Successfully added ${selectedStudents.length} student(s)!`);
      clearSelection();
      return true;
    } catch (error) {
      console.error('[addStudentsToBatch] Error adding students:', error);
      onError?.('Failed to add students. Please try again.');
      return false;
    } finally {
      setIsAddingStudents(false);
    }
  };

  /**
   * Remove student from teacher/batch
   */
  const removeStudent = async (studentId: string, allStudents: User[]) => {
    try {
      setIsRemovingStudent(true);
      onInfo?.('Removing student...');

      // studentId is now userId (email)
      const student = allStudents.find(s => s.userId === studentId);

      if (!student) {
        throw new Error('Student not found');
      }

      // Remove student using service layer
      await removeStudentFromTeacher(student.userId);

      // Refetch the students list to update the UI
      await queryClient.invalidateQueries({ queryKey: queryKeys.allStudents() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.studentsWithoutTeacher() });

      onSuccess?.('Student removed successfully!');
      return true;
    } catch (error) {
      console.error('[removeStudent] Error removing student:', error);
      onError?.('Failed to remove student. Please try again.');
      return false;
    } finally {
      setIsRemovingStudent(false);
    }
  };

  return {
    // State
    isAddingStudents,
    isRemovingStudent,
    selectedStudentIds,

    // Actions
    toggleStudentSelection,
    clearSelection,
    addStudentsToBatch,
    removeStudent,
  };
}
