/**
 * React Query hooks for Exercise Override management
 * Collection: exercise-overrides/{teacherEmail}_{exerciseId}
 *
 * Provides both query hooks (fetching) and mutation hooks (create/update/delete)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import {
  getTeacherOverrides,
  getExerciseOverride,
  createExerciseOverride,
  updateExerciseOverride,
  deleteExerciseOverride,
  bulkUpdateDisplayOrder,
} from '../services/exerciseOverride';
import {
  ExerciseOverride,
  CreateExerciseOverrideInput,
  UpdateExerciseOverrideInput,
} from '../models/exerciseOverride';
import { CEFRLevel } from '../models/cefr';

// ============================================================================
// QUERY HOOKS (Read Operations)
// ============================================================================

/**
 * Fetch all overrides for a teacher
 * Optionally filter by level and lesson number
 */
export function useTeacherOverrides(
  teacherEmail: string | undefined,
  level?: CEFRLevel,
  lessonNumber?: number
) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exercise-overrides', teacherEmail, level, lessonNumber],
    queryFn: async () => {
      if (!teacherEmail) return [];
      return await getTeacherOverrides(teacherEmail, level, lessonNumber);
    },
    enabled: !!teacherEmail,
    staleTime: cacheTimes.dynamic, // 5 minutes
    gcTime: cacheTimes.dynamic * 2.5, // 12.5 minutes
    structuralSharing: false, // Force new array references to trigger useMemo
  });

  return {
    overrides: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch a single exercise override by ID
 */
export function useExerciseOverride(overrideId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exercise-override', overrideId],
    queryFn: async () => {
      if (!overrideId) return null;
      return await getExerciseOverride(overrideId);
    },
    enabled: !!overrideId,
    staleTime: cacheTimes.dynamic,
    gcTime: cacheTimes.dynamic * 2.5,
  });

  return {
    override: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// ============================================================================
// MUTATION HOOKS (Write Operations)
// ============================================================================

/**
 * Create a new exercise override
 * Invalidates: All exercise-overrides queries for this teacher
 */
export function useCreateOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherEmail,
      override,
    }: {
      teacherEmail: string;
      override: CreateExerciseOverrideInput;
    }) => {
      return await createExerciseOverride(teacherEmail, override);
    },
    onSuccess: (_, variables) => {
      // Invalidate ALL override queries for this teacher (including level/lesson filters)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'exercise-overrides' &&
            query.queryKey[1] === variables.teacherEmail
          );
        },
      });
    },
    onError: (error) => {
      console.error('[useCreateOverride] Error:', error);
    },
  });
}

/**
 * Update an existing exercise override
 * Invalidates: Specific override + all override queries for the teacher
 */
export function useUpdateOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      overrideId,
      updates,
    }: {
      overrideId: string;
      updates: UpdateExerciseOverrideInput;
    }) => {
      return await updateExerciseOverride(overrideId, updates);
    },
    onSuccess: (data, variables) => {
      // Invalidate specific override
      queryClient.invalidateQueries({
        queryKey: ['exercise-override', variables.overrideId],
      });

      // Invalidate ALL override queries for this teacher (including level/lesson filters)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'exercise-overrides' &&
            query.queryKey[1] === data.teacherEmail
          );
        },
      });
    },
    onError: (error) => {
      console.error('[useUpdateOverride] Error:', error);
    },
  });
}

/**
 * Delete an exercise override
 * Invalidates: All override queries
 */
export function useDeleteOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (overrideId: string) => {
      await deleteExerciseOverride(overrideId);
    },
    onSuccess: () => {
      // Invalidate all override queries (we don't know the teacherEmail here)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'exercise-overrides'
          );
        },
      });
    },
    onError: (error) => {
      console.error('[useDeleteOverride] Error:', error);
    },
  });
}

/**
 * Bulk update display order for multiple exercises
 * Used when teacher reorders exercises via drag-and-drop
 * Invalidates: All override queries
 */
export function useReorderExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      orderUpdates: Array<{
        overrideId: string;
        displayOrder: number;
        exerciseId: string;
        teacherEmail: string;
        level: CEFRLevel;
        lessonNumber: number;
      }>
    ) => {
      // Pass the full orderUpdates object to bulkUpdateDisplayOrder
      // This ensures that new overrides can be created if they don't exist
      await bulkUpdateDisplayOrder(orderUpdates);
    },
    onMutate: async (orderUpdates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'exercise-overrides',
      });

      // Snapshot previous values
      const previousData = new Map();
      queryClient
        .getQueryCache()
        .findAll({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'exercise-overrides',
        })
        .forEach((query) => {
          previousData.set(query.queryKey, query.state.data);
        });

      // Optimistically update cache
      if (orderUpdates.length > 0) {
        const { teacherEmail, level, lessonNumber } = orderUpdates[0];
        const queryKey = ['exercise-overrides', teacherEmail, level, lessonNumber];

        queryClient.setQueryData(queryKey, (old: ExerciseOverride[] | undefined) => {
          if (!old) return old;

          const now = Date.now();

          // Create a map: exerciseId -> new displayOrder
          const orderMap = new Map(
            orderUpdates.map((u) => [u.exerciseId, u.displayOrder])
          );

          // Update existing overrides that match
          const updated = old.map((override) => {
            const newOrder = orderMap.get(override.exerciseId);
            if (newOrder !== undefined) {
              return { ...override, displayOrder: newOrder, updatedAt: now };
            }
            return override;
          });

          // Add NEW overrides that don't exist yet
          orderUpdates.forEach((update) => {
            const exists = updated.some(o => o.exerciseId === update.exerciseId);
            if (!exists) {
              // Create a new override entry
              updated.push({
                overrideId: update.overrideId,
                exerciseId: update.exerciseId,
                teacherEmail: update.teacherEmail,
                level: update.level,
                lessonNumber: update.lessonNumber,
                overrideType: 'modify',
                displayOrder: update.displayOrder,
                createdAt: now,
                updatedAt: now,
              });
            }
          });

          return updated;
        });
      }

      return { previousData };
    },
    onError: (error, _, context) => {
      console.error('[useReorderExercises] Error:', error);

      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Refetch to ensure sync with server (only after success)
      setTimeout(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            return (
              Array.isArray(query.queryKey) &&
              query.queryKey[0] === 'exercise-overrides'
            );
          },
        });
      }, 100); // Small delay to ensure database write completes
    },
  });
}

/**
 * Toggle hide status for an exercise
 * Convenience wrapper around useUpdateOverride
 */
export function useToggleHideExercise() {
  const updateOverride = useUpdateOverride();

  return useMutation({
    mutationFn: async ({
      overrideId,
      isHidden,
    }: {
      overrideId: string;
      isHidden: boolean;
    }) => {
      return updateOverride.mutateAsync({
        overrideId,
        updates: { isHidden, overrideType: 'hide' },
      });
    },
  });
}
