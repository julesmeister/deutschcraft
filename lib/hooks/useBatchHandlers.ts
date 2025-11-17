import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { useCreateBatch, useUpdateBatch, useDeleteBatch } from '@/lib/hooks/useBatches';
import { Batch } from '@/lib/models';

export function useBatchHandlers(currentTeacherId: string | undefined) {
  const toast = useToast();
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);

  const createBatchMutation = useCreateBatch();
  const updateBatchMutation = useUpdateBatch();
  const deleteBatchMutation = useDeleteBatch();

  const handleCreateBatch = async (data: {
    name: string;
    description?: string;
    currentLevel: any;
    startDate: number;
    endDate: number | null;
  }) => {
    if (!currentTeacherId) {
      toast.error('Unable to identify current teacher');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        teacherId: currentTeacherId,
        ...data,
      });

      toast.success('Batch created successfully!');
      setIsCreateBatchOpen(false);
    } catch (error) {
      console.error('[Create Batch] Error creating batch:', error);
      toast.error('Failed to create batch. Please try again.');
    }
  };

  const handleUpdateBatch = async (data: {
    name: string;
    description?: string;
    currentLevel: any;
    startDate: number;
    endDate: number | null;
  }) => {
    if (!editingBatch) return;

    try {
      await updateBatchMutation.mutateAsync({
        batchId: editingBatch.batchId,
        updates: data,
      });

      toast.success('Batch updated successfully!');
      setIsEditBatchOpen(false);
      setEditingBatch(null);
    } catch (error) {
      console.error('[Update Batch] Error updating batch:', error);
      toast.error('Failed to update batch. Please try again.');
    }
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`Are you sure you want to delete "${batchName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteBatchMutation.mutateAsync(batchId);
      toast.success('Batch deleted successfully!');
    } catch (error) {
      console.error('[Delete Batch] Error deleting batch:', error);
      toast.error('Failed to delete batch. Please try again.');
    }
  };

  const openEditDialog = (batch: Batch) => {
    setEditingBatch(batch);
    setIsEditBatchOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditBatchOpen(false);
    setEditingBatch(null);
  };

  return {
    // State
    isCreateBatchOpen,
    setIsCreateBatchOpen,
    editingBatch,
    isEditBatchOpen,

    // Mutations
    createBatchMutation,
    updateBatchMutation,
    deleteBatchMutation,

    // Handlers
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    openEditDialog,
    closeEditDialog,
  };
}
