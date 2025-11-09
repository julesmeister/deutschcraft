/**
 * Custom hook for managing student assignment and removal
 * Encapsulates student management logic to reduce prop drilling
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
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

    console.log('[addStudentsToBatch] Selected student IDs:', selectedStudents);
    console.log('[addStudentsToBatch] Available students:', studentsWithoutTeacher);
    console.log('[addStudentsToBatch] Current teacher:', currentTeacherId);
    console.log('[addStudentsToBatch] Selected batch:', selectedBatchId);

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

      // Update each selected student's teacherId and batchId
      // NEW STRUCTURE: users/{email} - Direct update, no nested student_data
      for (const studentId of selectedStudents) {
        console.log('[addStudentsToBatch] Processing student ID:', studentId);

        // studentId is now userId (email), use it directly as document ID
        const student = studentsWithoutTeacher.find(s => s.userId === studentId);

        console.log('[addStudentsToBatch] Found student:', student);

        if (student) {
          // userId is email, document ID is email
          const userRef = doc(db, 'users', student.userId);
          console.log('[addStudentsToBatch] Updating document:', student.userId);

          await updateDoc(userRef, {
            teacherId: currentTeacherId,
            batchId: selectedBatchId,
            updatedAt: Date.now(),
          });

          console.log('[addStudentsToBatch] Successfully updated:', student.userId);
        } else {
          console.error('[addStudentsToBatch] Student not found for ID:', studentId);
        }
      }

      console.log('[addStudentsToBatch] All updates complete. Invalidating queries...');

      // Refetch the students list
      await queryClient.invalidateQueries({ queryKey: queryKeys.allStudents() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.studentsWithoutTeacher() });

      console.log('[addStudentsToBatch] Queries invalidated successfully');

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

      console.log('[removeStudent] Removing student ID:', studentId);
      console.log('[removeStudent] All students:', allStudents);

      // studentId is now userId (email)
      const student = allStudents.find(s => s.userId === studentId);
      console.log('[removeStudent] Found student:', student);

      if (!student) {
        throw new Error('Student not found');
      }

      // NEW STRUCTURE: Update user document directly (userId is email)
      const userRef = doc(db, 'users', student.userId);
      console.log('[removeStudent] Updating document:', student.userId);

      await updateDoc(userRef, {
        teacherId: null,
        batchId: null,
        updatedAt: Date.now(),
      });

      console.log('[removeStudent] Successfully removed student');

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
