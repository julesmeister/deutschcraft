'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TabBar } from '@/components/ui/TabBar';
import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { BatchForm } from '@/components/ui/BatchForm';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import { useActiveBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from '@/lib/hooks/useBatches';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useToast } from '@/components/ui/toast';
import { CatLoader } from '@/components/ui/CatLoader';
import { Batch, CEFRLevel } from '@/lib/models';

export default function BatchManagementPage() {
  const { session } = useFirebaseAuth();
  const toast = useToast();
  const currentTeacherId = session?.user?.email;

  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch batches
  const { batches, isLoading } = useActiveBatches(currentTeacherId);
  const createBatchMutation = useCreateBatch();
  const updateBatchMutation = useUpdateBatch();
  const deleteBatchMutation = useDeleteBatch();

  // Handle creating a new batch
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

  // Handle updating a batch
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

  // Handle deleting a batch
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

  // Loading state
  if (isLoading || !session) {
    return <CatLoader message="Loading batches..." size="lg" fullScreen />;
  }

  // Level colors
  const levelColors: Record<CEFRLevel, string> = {
    [CEFRLevel.A1]: 'bg-piku-yellow-light',
    [CEFRLevel.A2]: 'bg-piku-mint',
    [CEFRLevel.B1]: 'bg-piku-cyan',
    [CEFRLevel.B2]: 'bg-piku-purple-light',
    [CEFRLevel.C1]: 'bg-piku-orange',
    [CEFRLevel.C2]: 'bg-piku-gold',
  };

  // Filter batches by search query
  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform batches for table
  const tableData = filteredBatches.map(batch => {
    const isActive = !batch.endDate || batch.endDate > Date.now();
    const levelColor = levelColors[batch.currentLevel as CEFRLevel] || 'bg-gray-200';

    return {
      id: batch.batchId,
      name: batch.name,
      level: batch.currentLevel,
      levelColor,
      students: batch.studentCount || 0,
      status: isActive ? 'active' : 'ended',
      statusText: isActive ? 'Active' : 'Ended',
      statusColor: isActive ? 'bg-green-500' : 'bg-gray-400',
      startDate: new Date(batch.startDate).toLocaleDateString(),
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
        <div className="mb-8">
          <TabBar
            variant="stats"
            tabs={[
              {
                id: 'total',
                label: 'Total Batches',
                value: batches.length,
                icon: undefined,
              },
              {
                id: 'active',
                label: 'Active Batches',
                value: batches.filter(b => !b.endDate || b.endDate > Date.now()).length,
                icon: undefined,
              },
              {
                id: 'students',
                label: 'Total Students',
                value: batches.reduce((acc, b) => acc + (b.studentCount || 0), 0),
                icon: undefined,
              },
            ]}
          />
        </div>

        {/* Batch Table */}
        <div className="bg-white border border-gray-200">
          {/* Title, Search, and Add Button */}
          <div className="m-3 sm:m-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
                All Batches
              </h5>
              <button
                onClick={() => setIsCreateBatchOpen(true)}
                className="group inline-flex items-center font-black text-[13px] sm:text-[14px] py-1.5 pl-4 sm:pl-5 pr-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
              >
                <span className="relative z-10 transition-colors duration-300">
                  Create Batch
                </span>
                <span className="relative z-10 ml-3 sm:ml-4 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-400 bg-white text-gray-900">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search batches..."
                className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {tableData.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No batches found' : 'No batches yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your first batch to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateBatchOpen(true)}
                  className="inline-flex items-center font-black text-[14px] py-2 pl-5 pr-2 rounded-full bg-piku-purple text-white hover:bg-opacity-90 transition-colors"
                >
                  <span>Create First Batch</span>
                  <span className="ml-4 w-9 h-9 flex items-center justify-center rounded-full bg-white text-piku-purple">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          ) : (
            <SlimTable
              title=""
              columns={[
                {
                  key: 'name',
                  label: 'Batch Name',
                  render: (value, row) => (
                    <div>
                      {SlimTableRenderers.Link(value)}
                      {SlimTableRenderers.Status(row.statusColor, row.statusText)}
                    </div>
                  ),
                },
                {
                  key: 'level',
                  label: 'Level',
                  align: 'center',
                  render: (value, row) => (
                    <span className={`${row.levelColor} px-3 py-1 rounded text-xs font-bold text-gray-900 inline-block`}>
                      {value}
                    </span>
                  ),
                },
                {
                  key: 'students',
                  label: 'Students',
                  align: 'center',
                  render: (value) => <p className="text-gray-500 text-xs text-center">{value}</p>,
                },
                {
                  key: 'startDate',
                  label: 'Start Date',
                  align: 'center',
                  render: (value) => <p className="text-gray-500 text-xs text-center">{value}</p>,
                },
                {
                  key: 'description',
                  label: 'Description',
                  render: (value) => (
                    <p className="text-gray-500 text-xs truncate max-w-[200px]">
                      {value || <span className="text-gray-400 italic">No description</span>}
                    </p>
                  ),
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  align: 'center',
                  render: (_, row) => (
                    <CompactButtonDropdown
                      label="Modify"
                      options={[
                        { value: 'edit', label: 'Edit Batch' },
                        { value: 'delete', label: 'Delete Batch' },
                      ]}
                      onChange={(action) => {
                        if (action === 'edit') {
                          setEditingBatch(row.batchData);
                          setIsEditBatchOpen(true);
                        } else if (action === 'delete') {
                          handleDeleteBatch(row.id, row.name);
                        }
                      }}
                      buttonClassName="!text-xs"
                    />
                  ),
                },
              ]}
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
        onClose={() => {
          setIsEditBatchOpen(false);
          setEditingBatch(null);
        }}
        onSubmit={handleUpdateBatch}
        isLoading={updateBatchMutation.isPending}
        initialData={editingBatch || undefined}
        mode="edit"
      />
    </div>
  );
}
