/**
 * Custom hook for lesson detail page handlers
 * Consolidates all inline editing, section management, and exercise operations
 */

import { useState } from "react";
import { CEFRLevel } from "../models/cefr";
import {
  ExerciseWithOverrideMetadata,
  CreateExerciseOverrideInput,
} from "../models/exerciseOverride";
import { useCreateOverride, useUpdateOverride } from "./useExerciseOverrides";

export function useLessonPageHandlers(
  userEmail: string | null,
  level: CEFRLevel,
  lessonNumber: number,
  lesson: { exercises: ExerciseWithOverrideMetadata[] } | null,
  handleReorder: (exercises: ExerciseWithOverrideMetadata[]) => void
) {
  // Inline exercise creation state
  const [editingSectionName, setEditingSectionName] = useState<string | null>(
    null
  );

  // Inline exercise editing state
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );

  // Direct access to create/update override mutations
  const createOverrideMutation = useCreateOverride();
  const updateOverrideMutation = useUpdateOverride();

  // Handle section reordering
  const handleReorderSections = (newSectionOrder: string[]) => {
    if (!lesson) return;

    // Reorder exercises based on new section order
    const reorderedExercises: ExerciseWithOverrideMetadata[] = [];

    // For each section in the new order, add all its exercises
    newSectionOrder.forEach((sectionName) => {
      const sectionExercises = lesson.exercises.filter(
        (ex) => (ex.section || "Übungen") === sectionName
      );
      reorderedExercises.push(...sectionExercises);
    });

    // Call existing handleReorder with the reordered exercises
    handleReorder(reorderedExercises);
  };

  // Handle adding exercise to a specific section
  const handleAddToSection = (sectionName: string) => {
    setEditingSectionName(sectionName);
  };

  // Handle saving inline exercise
  const handleSaveInlineExercise = async (
    data: CreateExerciseOverrideInput
  ) => {
    if (!userEmail) return;

    try {
      // Build exercise data without undefined fields
      const exerciseData: any = {
        exerciseId: data.exerciseId,
        exerciseNumber: data.exerciseNumber,
        section: data.section,
        answers: data.answers,
        difficulty: data.difficulty || "medium",
        level,
        lessonNumber,
        attachments: (data as any).attachments,
      };

      // Only include question if it has a value
      if (data.question) {
        exerciseData.question = data.question;
      }

      // For 'create' type overrides, exercise data must be in exerciseData field
      const override: CreateExerciseOverrideInput = {
        exerciseId: data.exerciseId,
        overrideType: "create",
        level,
        lessonNumber,
        exerciseData,
      };

      await createOverrideMutation.mutateAsync({
        teacherEmail: userEmail,
        override,
      });

      setEditingSectionName(null);
    } catch (error) {
      console.error("Error creating inline exercise:", error);
      alert("Failed to create exercise. Please try again.");
    }
  };

  // Handle canceling inline exercise
  const handleCancelInlineExercise = () => {
    setEditingSectionName(null);
  };

  // Handle editing exercise inline
  const handleEditExercise = (
    exercise: ExerciseWithOverrideMetadata,
    globalIndex?: number
  ) => {
    // For duplicates, use unique key with globalIndex
    // Use a unique separator that won't conflict with exercise ID hyphens
    const uniqueKey =
      globalIndex !== undefined
        ? `${exercise.exerciseId}_idx_${globalIndex}`
        : exercise.exerciseId;
    setEditingExerciseId(uniqueKey);
  };

  // Handle saving inline edit
  const handleSaveInlineEdit = async (data: CreateExerciseOverrideInput) => {
    if (!userEmail || !editingExerciseId) return;

    try {
      // Extract base exerciseId (remove globalIndex suffix if present)
      const baseExerciseId = editingExerciseId.includes("_idx_")
        ? editingExerciseId.split("_idx_")[0]
        : editingExerciseId;

      const overrideId = `${userEmail}_${baseExerciseId}`;

      // Build exercise data without undefined fields
      const exerciseData: any = {
        exerciseId: data.exerciseId,
        exerciseNumber: data.exerciseNumber,
        section: data.section,
        answers: data.answers,
        difficulty: data.difficulty || "medium",
        level,
        lessonNumber,
        attachments: (data as any).attachments,
      };

      // Only include question if it has a value
      if (data.question) {
        exerciseData.question = data.question;
      }

      // Check if this is a custom exercise or a modification
      const existingExercise = lesson?.exercises.find(
        (ex) => ex.exerciseId === baseExerciseId
      );
      const isCustomExercise = existingExercise?._isCreated;

      if (isCustomExercise) {
        // Update existing custom exercise
        await updateOverrideMutation.mutateAsync({
          overrideId,
          updates: {
            overrideType: "create",
            exerciseData,
            teacherEmail: userEmail,
            exerciseId: baseExerciseId,
            level,
            lessonNumber,
          },
        });
      } else {
        // Create/update modification override
        await updateOverrideMutation.mutateAsync({
          overrideId,
          updates: {
            overrideType: "modify",
            modifications: exerciseData,
            teacherEmail: userEmail,
            exerciseId: baseExerciseId,
            level,
            lessonNumber,
          },
        });
      }

      setEditingExerciseId(null);
    } catch (error) {
      console.error("Error saving inline edit:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  // Handle canceling inline edit
  const handleCancelInlineEdit = () => {
    setEditingExerciseId(null);
  };

  return {
    // State
    editingSectionName,
    editingExerciseId,

    // Section handlers
    handleReorderSections,
    handleAddToSection,

    // Inline creation handlers
    handleSaveInlineExercise,
    handleCancelInlineExercise,

    // Inline edit handlers
    handleEditExercise,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
  };
}
