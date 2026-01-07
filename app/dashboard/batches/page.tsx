'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SlimTable } from '@/components/ui/SlimTable';
import { BatchForm } from '@/components/ui/BatchForm';
import { useActiveBatches } from '@/lib/hooks/useBatches';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useTeacherStudents } from '@/lib/hooks/useUsers';
import { CatLoader } from '@/components/ui/CatLoader';
import { CEFRLevel } from '@/lib/models';
import { BatchStats } from '@/components/batches/BatchStats';
import { BatchTableHeader } from '@/components/batches/BatchTableHeader';
import { EmptyBatchState } from '@/components/batches/EmptyBatchState';
import { getBatchTableColumns, levelColors } from '@/components/batches/BatchTableColumns';
import { useBatchHandlers } from '@/lib/hooks/useBatchHandlers';

export default function BatchManagementPage() {
  const { session } = useFirebaseAuth();
  const currentTeacherId = session?.user?.email;
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch batches and students
  const { batches, isLoading } = useActiveBatches(currentTeacherId || undefined);
  const { students: teacherStudents, isLoading: studentsLoading } = useTeacherStudents(currentTeacherId || undefined);

  // Batch handlers
  const {
    isCreateBatchOpen,
    setIsCreateBatchOpen,
    editingBatch,
    isEditBatchOpen,
    createBatchMutation,
    updateBatchMutation,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    openEditDialog,
    closeEditDialog,
  } = useBatchHandlers(currentTeacherId || undefined);

  // Calculate student count for each batch (from teacher's students only)
  const getStudentCount = (batchId: string) => {
    return teacherStudents.filter((student: any) => student.batchId === batchId).length;
  };

  // Loading state
  if (isLoading || studentsLoading || !session) {
    return <CatLoader message="Loading batches..." size="lg" fullScreen />;
  }

  // Filter batches by search query
  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const activeBatchesCount = batches.filter(b => !b.endDate || b.endDate > Date.now()).length;
  const totalStudentsCount = batches.reduce((acc, b) => acc + getStudentCount(b.batchId), 0);

  // Transform batches for table
  const tableData = filteredBatches.map(batch => {
    const isActive = !batch.endDate || batch.endDate > Date.now();
    const levelColor = levelColors[batch.currentLevel as CEFRLevel] || 'bg-gray-200';
    const studentCount = getStudentCount(batch.batchId);

    return {
      id: batch.batchId,
      name: batch.name,
      level: batch.currentLevel,
      levelColor,
      students: studentCount,
      status: isActive ? 'active' : 'ended',
      statusText: isActive ? 'Active' : 'Ended',
      statusColor: isActive ? 'bg-green-500' : 'bg-gray-400',
      startDate: new Date(batch.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      endDate: batch.endDate ? new Date(batch.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : null,
      description: batch.description || '',
      batchData: batch,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Batch Management 📚"
        subtitle="Create and manage your student batches"
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <BatchStats
          totalBatches={batches.length}
          activeBatches={activeBatchesCount}
          totalStudents={totalStudentsCount}
        />

        {/* Batch Table */}
        <div className="bg-white border border-gray-200">
          <BatchTableHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateClick={() => setIsCreateBatchOpen(true)}
          />

          {tableData.length === 0 ? (
            <EmptyBatchState
              hasSearchQuery={!!searchQuery}
              onCreateClick={() => setIsCreateBatchOpen(true)}
            />
          ) : (
            <SlimTable
              title=""
              columns={getBatchTableColumns({
                onEdit: openEditDialog,
                onDelete: handleDeleteBatch,
              })}
              data={tableData}
              onRowClick={() => {}}
            />
          )}
        </div>
      </div>

      {/* Create Batch Dialog */}
      <BatchForm
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        onSubmit={handleCreateBatch}
        isLoading={createBatchMutation.isPending}
      />

      {/* Edit Batch Dialog */}
      <BatchForm
        isOpen={isEditBatchOpen}
        onClose={closeEditDialog}
        onSubmit={handleUpdateBatch}
        isLoading={updateBatchMutation.isPending}
        initialData={editingBatch || undefined}
        mode="edit"
      />
    </div>
  );
}
