/**
 * Custom hook for lesson page handlers
 * Manages exercise override operations (create, edit, hide, reorder)
 */

import { useState } from "react";
import { CEFRLevel } from "../models/cefr";
import {
  ExerciseWithOverrideMetadata,
  CreateExerciseOverrideInput,
} from "../models/exerciseOverride";
import {
  useCreateOverride,
  useUpdateOverride,
  useReorderExercises,
} from "./useExerciseOverrides";
import { useToast } from "@/components/ui/toast";

export function useLessonHandlers(
  userEmail: string | null,
  level: CEFRLevel,
  lessonNumber: number,
  duplicateExerciseIds: Set<string>,
  exerciseIndexMap: Map<string, number>
) {
  // Toast notifications
  const toast = useToast();

  // Dialog state
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingExercise, setEditingExercise] =
    useState<ExerciseWithOverrideMetadata | null>(null);

  // Mutations
  const createOverride = useCreateOverride();
  const updateOverride = useUpdateOverride();
  const reorderExercises = useReorderExercises();

  // Handle creating new exercise
  const handleCreateExercise = () => {
    setDialogMode("create");
    setEditingExercise(null);
    setIsOverrideDialogOpen(true);
  };

  // Handle editing exercise
  const handleEditExercise = (exercise: ExerciseWithOverrideMetadata) => {
    setDialogMode("edit");
    setEditingExercise(exercise);
    setIsOverrideDialogOpen(true);
  };

  // Handle hiding/unhiding exercise (with duplicate support)
  const handleToggleHide = async (
    exerciseId: string,
    isHidden: boolean,
    exerciseIndex?: number
  ) => {
    if (!userEmail) {
      toast.error("You must be logged in to hide exercises");
      return;
    }

    // For duplicates, use original index to make unique override ID
    const isDuplicate = duplicateExerciseIds.has(exerciseId);
    let uniqueExerciseId = exerciseId;

    if (isDuplicate && exerciseIndex !== undefined) {
      // exerciseIndex is the global index which equals the original JSON index
      uniqueExerciseId = `${exerciseId}_at${exerciseIndex}`;
    }

    const overrideId = `${userEmail}_${uniqueExerciseId}`;

    try {
      // Try to update first
      await updateOverride.mutateAsync({
        overrideId,
        updates: {
          overrideType: "hide",
          isHidden,
          level,
          lessonNumber,
          exerciseId: uniqueExerciseId, // Store the unique ID
          teacherEmail: userEmail,
        },
      });

      // Show success toast
      toast.success(
        isHidden
          ? `Exercise ${exerciseId} hidden successfully`
          : `Exercise ${exerciseId} is now visible`,
        { duration: 3000 }
      );
    } catch (error: any) {
      // If document doesn't exist, create it
      if (error?.message?.includes("No document to update")) {
        try {
          await createOverride.mutateAsync({
            teacherEmail: userEmail,
            override: {
              exerciseId: uniqueExerciseId, // Use unique ID for duplicates
              overrideType: "hide",
              isHidden,
              level,
              lessonNumber,
            },
          });

          // Show success toast
          toast.success(
            isHidden
              ? `Exercise ${exerciseId} hidden successfully`
              : `Exercise ${exerciseId} is now visible`,
            { duration: 3000 }
          );
        } catch (createError) {
          console.error("Error creating hide override:", createError);
          toast.error("Failed to update exercise visibility");
        }
      } else {
        console.error("Error toggling hide:", error);
        toast.error("Failed to update exercise visibility");
      }
    }
  };

  // Handle reordering exercises
  const handleReorder = async (
    reorderedExercises: ExerciseWithOverrideMetadata[]
  ) => {
    if (!userEmail) return;

    const orderUpdates = reorderedExercises.map((ex, idx) => {
      const baseExerciseId = ex.exerciseId;
      const exWithMeta = ex as any;

      // Check if this is a duplicate
      const isDuplicate = duplicateExerciseIds.has(baseExerciseId);
      let uniqueExerciseId = baseExerciseId;

      if (isDuplicate && exWithMeta._originalIndex !== undefined) {
        // For duplicates, use original JSON index for stable identification
        uniqueExerciseId = `${baseExerciseId}_at${exWithMeta._originalIndex}`;
      }

      return {
        overrideId: `${userEmail}_${uniqueExerciseId}`,
        displayOrder: idx,
        exerciseId: uniqueExerciseId,
        teacherEmail: userEmail,
        level,
        lessonNumber,
      };
    });

    console.log("[Reorder] Saving display orders for", orderUpdates.length, "exercises");
    console.log("[Reorder] First 5:", orderUpdates.slice(0, 5).map(u => `${u.exerciseId}=${u.displayOrder}`));

    try {
      await reorderExercises.mutateAsync(orderUpdates);
      console.log("[Reorder] ✓ Saved successfully");
    } catch (error) {
      console.error("[Reorder] ✗ Error:", error);
    }
  };

  // Handle submitting override (create or edit)
  const handleSubmitOverride = async (
    override: CreateExerciseOverrideInput
  ) => {
    if (!userEmail) return;

    try {
      if (dialogMode === "create") {
        await createOverride.mutateAsync({
          teacherEmail: userEmail,
          override,
        });
      } else if (editingExercise) {
        const overrideId = `${userEmail}_${editingExercise.exerciseId}`;
        await updateOverride.mutateAsync({
          overrideId,
          updates: {
            ...override,
            teacherEmail: userEmail,
          },
        });
      }

      setIsOverrideDialogOpen(false);
      setEditingExercise(null);
    } catch (error) {
      console.error("Error submitting override:", error);
    }
  };

  return {
    isOverrideDialogOpen,
    setIsOverrideDialogOpen,
    dialogMode,
    editingExercise,
    setEditingExercise,
    handleCreateExercise,
    handleEditExercise,
    handleToggleHide,
    handleReorder,
    handleSubmitOverride,
  };
}
