'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GanttChartTask } from '@/components/ui/GanttChart';
import { BatchSelector } from '@/components/ui/BatchSelector';
import { BatchForm } from '@/components/ui/BatchForm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useActiveBatches, useCreateBatch } from '@/lib/hooks/useBatches';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useToast } from '@/components/ui/toast';
import { Batch } from '@/lib/models';
import { CatLoader } from '@/components/ui/CatLoader';
import { getSyllabusForLevel } from '@/lib/data/syllabusData';
import { CEFRLevel } from '@/lib/models/cefr';
import { useGanttTasks, useCreateGanttTask, useUpdateGanttTask, useDeleteGanttTask, useGanttEditPermission, useGanttPermissions, useGrantGanttPermission, useRevokeGanttPermission } from '@/lib/hooks/useGanttTasks';
import { GanttPermissionDialog } from '@/components/ui/gantt/GanttPermissionDialog';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { ScheduleViewToggle, ScheduleViewType } from '@/components/schedule/ScheduleViewToggle';
import { GanttViewSection } from '@/components/schedule/GanttViewSection';
import { DayViewSection } from '@/components/schedule/DayViewSection';
import { buildHierarchyTasks, convertTasksToDayViewEvents } from '@/lib/utils/scheduleHelpers';

export default function SchedulePage() {
  // Auth and hooks
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const toast = useToast();
  const currentTeacherId = session?.user?.email;

  // Fetch batches
  const { batches, isLoading } = useActiveBatches(currentTeacherId);
  const createBatchMutation = useCreateBatch();

  // Fetch gantt tasks
  const { data: ganttTasks = [], isLoading: isLoadingTasks } = useGanttTasks(currentTeacherId);
  const createGanttTaskMutation = useCreateGanttTask();
  const updateGanttTaskMutation = useUpdateGanttTask();
  const deleteGanttTaskMutation = useDeleteGanttTask();

  // Check edit permission
  const { data: hasEditPermission = false, isLoading: isLoadingPermission } = useGanttEditPermission(currentTeacherId);

  // Check if current user is teacher
  const { student: currentUser } = useCurrentStudent(currentTeacherId || null);
  const isTeacher = currentUser?.role === 'TEACHER';

  // Permission management
  const { data: activePermissions = [] } = useGanttPermissions();
  const grantPermissionMutation = useGrantGanttPermission();
  const revokePermissionMutation = useRevokeGanttPermission();

  // Local state
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<GanttChartTask[]>([]);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ScheduleViewType>('gantt');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Auto-select first batch
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, selectedBatch]);

  // Generate curriculum suggestions from all CEFR levels (memoized)
  const curriculumSuggestions = useMemo(() => {
    return Object.values(CEFRLevel).flatMap((level) => {
      const syllabusData = getSyllabusForLevel(level);
      return [
        ...syllabusData.weeklySchedule.map(week => `${level} - Week ${week.weekNumber}: ${week.title}`),
        ...syllabusData.grammarTopics.map(topic => `${level} - Grammar: ${topic}`),
        ...syllabusData.vocabularyThemes.map(theme => `${level} - Vocabulary: ${theme}`),
        ...syllabusData.communicationSkills.map(skill => `${level} - Communication: ${skill}`),
      ];
    });
  }, []);

  // Convert batches and gantt tasks to hierarchical structure
  const hierarchyTasks = useMemo(() => {
    return buildHierarchyTasks(batches, ganttTasks);
  }, [batches.length, ganttTasks.length, JSON.stringify(batches.map(b => b.batchId)), JSON.stringify(ganttTasks.map(t => t.taskId))]);

  // Filter hierarchyTasks by selectedBatch
  const filteredTasks = useMemo(() => {
    if (selectedBatch) {
      return hierarchyTasks.filter(task => task.id === selectedBatch.batchId);
    }
    return hierarchyTasks;
  }, [hierarchyTasks, selectedBatch?.batchId]);

  // Sync filtered tasks to local state
  useEffect(() => {
    setTasks(filteredTasks);
  }, [filteredTasks]);

  // Convert gantt tasks to day view events
  const dayViewEvents = useMemo(() => {
    return convertTasksToDayViewEvents(tasks, selectedDate);
  }, [tasks, selectedDate]);

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

  // Add curriculum item to the selected batch
  const handleAddTask = () => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }
    if (!selectedBatch) {
      toast.info('Select a batch first to add curriculum items');
      return;
    }
    setExpandedBatches(prev => new Set([...prev, selectedBatch.batchId]));
    handleAddSubTask(selectedBatch.batchId);
  };

  // Add subtask (curriculum item) to a batch
  const handleAddSubTask = async (parentTaskId: string) => {
    if (!currentTeacherId) return;
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    try {
      const batch = batches.find(b => b.batchId === parentTaskId);
      const parentTask = tasks.find(t => t.id === parentTaskId);
      if (!batch || !parentTask) return;

      const defaultStartDate = new Date(parentTask.startDate);
      const defaultEndDate = new Date(defaultStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const siblings = ganttTasks.filter(t => t.parentTaskId === parentTaskId);
      const orderIndex = siblings.length;

      await createGanttTaskMutation.mutateAsync({
        name: 'New Curriculum Item',
        startDate: defaultStartDate.getTime(),
        endDate: defaultEndDate.getTime(),
        progress: 0,
        status: 'not-started',
        color: parentTask.color,
        parentTaskId,
        orderIndex,
        createdBy: currentTeacherId,
      });

      toast.success('Curriculum item added');
    } catch (error) {
      console.error('[Add Curriculum] Error:', error);
      toast.error('Failed to add curriculum item');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    const isParent = tasks.some(t => t.id === taskId);
    if (isParent) {
      toast.error('Cannot delete batches from here. Use the batch selector.');
      return;
    }

    try {
      await deleteGanttTaskMutation.mutateAsync({ taskId, deleteChildren: true });
      toast.success('Curriculum item deleted');
    } catch (error) {
      console.error('[Delete Task] Error:', error);
      toast.error('Failed to delete curriculum item');
    }
  };

  const handleRenameTask = async (taskId: string, newName: string) => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    const isParent = tasks.some(t => t.id === taskId);
    if (isParent) {
      toast.error('Cannot rename batches from here. Use the batch selector.');
      return;
    }

    try {
      await updateGanttTaskMutation.mutateAsync({
        taskId,
        updates: { name: newName },
      });
      toast.success('Curriculum item renamed');
    } catch (error) {
      console.error('[Rename Task] Error:', error);
      toast.error('Failed to rename curriculum item');
    }
  };

  // Function to get the CEFR level of a task's parent batch
  const getTaskLevel = (taskId: string): string | null => {
    for (const task of tasks) {
      if (task.children?.some(child => child.id === taskId)) {
        const parentBatch = batches.find(b => b.batchId === task.id);
        return parentBatch?.currentLevel || null;
      }
    }
    return null;
  };

  // Loading state
  if (isLoading || isLoadingTasks || isLoadingPermission || !session) {
    return <CatLoader message="Loading schedule..." size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Batch Selector and View Toggle */}
      <DashboardHeader
        title="Class Schedule 📅"
        subtitle="Manage curriculum timeline for each batch"
        actions={
          <div className="flex items-center gap-4">
            <ScheduleViewToggle
              currentView={currentView}
              onViewChange={setCurrentView}
            />
            <BatchSelector
              batches={batches}
              selectedBatch={selectedBatch}
              onSelectBatch={setSelectedBatch}
              onCreateBatch={() => setIsCreateBatchOpen(true)}
              onManageBatches={() => router.push('/dashboard/batches')}
            />
          </div>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Gantt View */}
        {currentView === 'gantt' && (
          <GanttViewSection
            tasks={tasks}
            curriculumSuggestions={curriculumSuggestions}
            hasEditPermission={hasEditPermission}
            isTeacher={isTeacher}
            expandedBatches={expandedBatches}
            onExpandedChange={setExpandedBatches}
            onAddTask={hasEditPermission ? handleAddTask : undefined}
            onAddSubTask={hasEditPermission ? handleAddSubTask : undefined}
            onDeleteTask={hasEditPermission ? handleDeleteTask : undefined}
            onRenameTask={hasEditPermission ? handleRenameTask : undefined}
            onOpenPermissions={isTeacher ? () => setIsPermissionDialogOpen(true) : undefined}
            getTaskLevel={getTaskLevel}
          />
        )}

        {/* Day View */}
        {currentView === 'day' && (
          <DayViewSection
            selectedDate={selectedDate}
            events={dayViewEvents}
            onDateChange={setSelectedDate}
            onEventClick={(event) => console.log('Event clicked:', event)}
          />
        )}

        {/* Week View - Placeholder */}
        {currentView === 'week' && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Week View Coming Soon
            </h3>
            <p className="text-gray-600">
              Week view is currently under development. Use Day or Gantt view for now.
            </p>
          </div>
        )}

        {/* Month View - Placeholder */}
        {currentView === 'month' && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Month View Coming Soon
            </h3>
            <p className="text-gray-600">
              Month view is currently under development. Use Day or Gantt view for now.
            </p>
          </div>
        )}
      </div>

      {/* Permission Management Dialog */}
      <GanttPermissionDialog
        isOpen={isPermissionDialogOpen}
        onClose={() => setIsPermissionDialogOpen(false)}
        onGrantPermission={async (userId, expiresAt) => {
          await grantPermissionMutation.mutateAsync({ userId, expiresAt });
          toast.success('Permission granted successfully');
        }}
        onRevokePermission={async (userId) => {
          await revokePermissionMutation.mutateAsync(userId);
          toast.success('Permission revoked successfully');
        }}
        currentPermissions={activePermissions}
      />

      {/* Create Batch Dialog */}
      <BatchForm
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        onSubmit={handleCreateBatch}
        isLoading={createBatchMutation.isPending}
      />
    </div>
  );
}
