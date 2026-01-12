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
  handleReorder: (exercises: ExerciseWithOverrideMetadata[]) => void,
  onToggleHide?: (exerciseId: string, isHidden: boolean, exerciseIndex?: number) => void
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

    console.log("[Section Reorder] New order:", newSectionOrder);

    // Reorder exercises based on new section order
    const reorderedExercises: ExerciseWithOverrideMetadata[] = [];
    const sectionsSet = new Set(newSectionOrder);

    // For each section in the new order, add all its exercises
    newSectionOrder.forEach((sectionName) => {
      const sectionExercises = lesson.exercises.filter(
        (ex) => (ex.section || "Übungen") === sectionName
      );
      console.log(`[Section Reorder] Section "${sectionName}": ${sectionExercises.length} exercises`);
      reorderedExercises.push(...sectionExercises);
    });

    // Add any exercises from sections NOT in newSectionOrder at the end
    // This ensures filtered/hidden exercises maintain their relative order
    const remainingExercises = lesson.exercises.filter((ex) => {
      const sectionName = ex.section || "Übungen";
      return !sectionsSet.has(sectionName);
    });

    if (remainingExercises.length > 0) {
      console.log(`[Section Reorder] Remaining exercises (not in newSectionOrder): ${remainingExercises.length}`);
    }

    reorderedExercises.push(...remainingExercises);

    console.log(`[Section Reorder] Total exercises to reorder: ${reorderedExercises.length} (was ${lesson.exercises.length})`);
    console.log("[Section Reorder] First 5 exercise sections:", reorderedExercises.slice(0, 5).map(e => `${e.exerciseId}[${e.section || "Übungen"}]`));

    // Call existing handleReorder with the reordered exercises
    handleReorder(reorderedExercises);
  };

  // Handle adding exercise to a specific section
  const handleAddToSection = (sectionName: string) => {
    setEditingSectionName(sectionName);
  };

  // Handle hiding/showing an entire section
  const handleToggleHideSection = async (sectionName: string, isHidden: boolean) => {
    if (!onToggleHide || !lesson) return;

    try {
      // Find all exercises in the section
      const sectionExercises = lesson.exercises.filter(
        (ex) => (ex.section || "Übungen") === sectionName
      );

      if (sectionExercises.length === 0) {
        console.warn("No exercises found in section:", sectionName);
        return;
      }

      // Toggle hide for each exercise in the section
      // We don't need to pass exerciseIndex since we're hiding/showing all
      const togglePromises = sectionExercises.map((exercise) =>
        onToggleHide(exercise.exerciseId, isHidden)
      );

      // Wait for all toggles to complete
      await Promise.all(togglePromises);
    } catch (error) {
      console.error("Error toggling section visibility:", error);
      alert("Failed to toggle section visibility. Please try again.");
    }
  };

  // Handle renaming a section
  const handleRenameSection = async (oldName: string, newName: string) => {
    if (!userEmail || !lesson) return;

    try {
      // Find all exercises in the old section
      const exercisesToUpdate = lesson.exercises.filter(
        (ex) => (ex.section || "Übungen") === oldName
      );

      if (exercisesToUpdate.length === 0) {
        console.warn("No exercises found in section:", oldName);
        return;
      }

      // Update each exercise with the new section name
      const updatePromises = exercisesToUpdate.map(async (exercise) => {
        const overrideId = `${userEmail}_${exercise.exerciseId}`;

        // Preserve all existing data
        const exerciseData: any = {
          exerciseId: exercise.exerciseId,
          exerciseNumber: exercise.exerciseNumber,
          section: newName, // New section name
          answers: exercise.answers,
          difficulty: exercise.difficulty || "medium",
          level,
          lessonNumber,
          attachments: exercise.attachments,
        };

        // Include question if it exists
        if (exercise.question) {
          exerciseData.question = exercise.question;
        }

        // Check if this is a custom exercise or a modification
        const isCustomExercise = exercise._isCreated;

        if (isCustomExercise) {
          // Update custom exercise
          return updateOverrideMutation.mutateAsync({
            overrideId,
            updates: {
              overrideType: "create",
              exerciseData,
              teacherEmail: userEmail,
              exerciseId: exercise.exerciseId,
              level,
              lessonNumber,
            },
          });
        } else {
          // Update modified exercise or create modification
          return updateOverrideMutation.mutateAsync({
            overrideId,
            updates: {
              overrideType: "modify",
              modifications: exerciseData,
              teacherEmail: userEmail,
              exerciseId: exercise.exerciseId,
              level,
              lessonNumber,
            },
          });
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error renaming section:", error);
      alert("Failed to rename section. Please try again.");
    }
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

  // Handle updating a single answer for an exercise
  const handleUpdateAnswer = async (
    exerciseId: string,
    itemIndex: number,
    newAnswer: string
  ) => {
    if (!userEmail || !lesson) return;

    try {
      // Find the exercise
      const exercise = lesson.exercises.find((ex) => ex.exerciseId === exerciseId);
      if (!exercise) {
        throw new Error("Exercise not found");
      }

      // Clone the answers array and update the specific item
      const updatedAnswers = [...exercise.answers];
      if (itemIndex < 0 || itemIndex >= updatedAnswers.length) {
        throw new Error("Invalid answer index");
      }

      updatedAnswers[itemIndex] = {
        ...updatedAnswers[itemIndex],
        correctAnswer: newAnswer,
      };

      const overrideId = `${userEmail}_${exerciseId}`;

      // Build exercise data with updated answers
      const exerciseData: any = {
        exerciseId: exercise.exerciseId,
        exerciseNumber: exercise.exerciseNumber,
        section: exercise.section,
        answers: updatedAnswers,
        difficulty: exercise.difficulty || "medium",
        level,
        lessonNumber,
        attachments: exercise.attachments,
      };

      // Include question if it exists
      if (exercise.question) {
        exerciseData.question = exercise.question;
      }

      // Check if this is a custom exercise or a modification
      const isCustomExercise = exercise._isCreated;

      if (isCustomExercise) {
        // Update existing custom exercise
        await updateOverrideMutation.mutateAsync({
          overrideId,
          updates: {
            overrideType: "create",
            exerciseData,
            teacherEmail: userEmail,
            exerciseId,
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
            exerciseId,
            level,
            lessonNumber,
          },
        });
      }
    } catch (error) {
      console.error("Error updating answer:", error);
      throw error;
    }
  };

  return {
    // State
    editingSectionName,
    editingExerciseId,

    // Section handlers
    handleReorderSections,
    handleAddToSection,
    handleRenameSection,
    handleToggleHideSection,

    // Inline creation handlers
    handleSaveInlineExercise,
    handleCancelInlineExercise,

    // Inline edit handlers
    handleEditExercise,
    handleSaveInlineEdit,
    handleCancelInlineEdit,

    // Answer update handler
    handleUpdateAnswer,
  };
}
