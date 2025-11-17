'use client';

import { useState, useEffect, useMemo } from 'react';
import { GanttChart, GanttChartTask } from '@/components/ui/GanttChart';
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
import { GanttTask } from '@/lib/models/gantt';
import { GanttPermissionDialog } from '@/components/ui/gantt/GanttPermissionDialog';
import { useCurrentStudent } from '@/lib/hooks/useUsers';

// Define color palette for batches
const BATCH_COLORS = [
  'rgb(251, 191, 36)', // yellow
  'rgb(110, 231, 183)', // mint
  'rgb(167, 139, 250)', // purple
  'rgb(251, 113, 133)', // pink
  'rgb(125, 211, 252)', // cyan
  'rgb(253, 186, 116)', // orange
];

export default function SchedulePage() {
  // Auth and hooks
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
  }, []); // Empty deps - this data is static

  // Helper function to calculate parent dates based on children
  const calculateParentDates = (children: GanttChartTask[]) => {
    if (!children || children.length === 0) {
      return null;
    }

    let earliestStart = children[0].startDate;
    let latestEnd = children[0].endDate;

    children.forEach(child => {
      if (child.startDate < earliestStart) {
        earliestStart = child.startDate;
      }
      if (child.endDate > latestEnd) {
        latestEnd = child.endDate;
      }
    });

    return { startDate: earliestStart, endDate: latestEnd };
  };

  // Recalculate parent dates based on children
  const recalculateParentDates = (taskList: GanttChartTask[]): GanttChartTask[] => {
    return taskList.map(task => {
      if (task.children && task.children.length > 0) {
        const childrenDates = calculateParentDates(task.children);
        return {
          ...task,
          startDate: childrenDates?.startDate || task.startDate,
          endDate: childrenDates?.endDate || task.endDate,
          children: recalculateParentDates(task.children), // Recursively update nested children
        };
      }
      return task;
    });
  };

  // Convert batches and gantt tasks to hierarchical structure
  const hierarchyTasks = useMemo(() => {
    // Build hierarchical structure from flat gantt tasks
    // Separate parent and child tasks
    const parentTasks = ganttTasks.filter(t => !t.parentTaskId);
    const childTasks = ganttTasks.filter(t => t.parentTaskId);

    // Create a map of children by parentId
    const childrenMap = new Map<string, GanttTask[]>();
    childTasks.forEach(child => {
      if (!child.parentTaskId) return;
      if (!childrenMap.has(child.parentTaskId)) {
        childrenMap.set(child.parentTaskId, []);
      }
      childrenMap.get(child.parentTaskId)!.push(child);
    });

    return batches.map((batch, index) => {
      const batchColor = BATCH_COLORS[index % BATCH_COLORS.length];

      // Get children for this batch from ganttTasks
      const batchChildren = childrenMap.get(batch.batchId) || [];
      const children: GanttChartTask[] = batchChildren.map(child => ({
        id: child.taskId,
        name: child.name,
        startDate: new Date(child.startDate),
        endDate: new Date(child.endDate),
        progress: child.progress,
        color: batchColor,
      }));

      // Calculate parent dates based on children, or use batch dates as fallback
      const childrenDates = calculateParentDates(children);
      const startDate = childrenDates?.startDate || new Date(batch.startDate);
      const endDate = childrenDates?.endDate || (batch.endDate ? new Date(batch.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000));

      return {
        id: batch.batchId,
        name: batch.name,
        startDate,
        endDate,
        progress: 0,
        color: batchColor,
        children,
      };
    });
  }, [batches.length, ganttTasks.length, JSON.stringify(batches.map(b => b.batchId)), JSON.stringify(ganttTasks.map(t => t.taskId))]); // Only update when IDs change

  // Sync hierarchyTasks to local state
  useEffect(() => {
    setTasks(hierarchyTasks);
  }, [hierarchyTasks]);

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
    // Expand the parent batch before adding
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
      const defaultEndDate = new Date(defaultStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Calculate order index (last + 1)
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

    // Don't allow deleting batches (parent tasks)
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

    // Don't allow renaming batches
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
    // Find the parent task (batch)
    for (const task of tasks) {
      if (task.children?.some(child => child.id === taskId)) {
        // This is a child task, find the parent batch
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
      {/* Header with Batch Selector */}
      <DashboardHeader
        title="Class Schedule 📅"
        subtitle="Manage curriculum timeline for each batch"
        actions={
          <BatchSelector
            batches={batches}
            selectedBatch={selectedBatch}
            onSelectBatch={setSelectedBatch}
            onCreateBatch={() => setIsCreateBatchOpen(true)}
          />
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <GanttChart
          title="Schedule"
          tasks={tasks}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onAddTask={hasEditPermission ? handleAddTask : undefined}
          onAddSubTask={hasEditPermission ? handleAddSubTask : undefined}
          onDeleteTask={hasEditPermission ? handleDeleteTask : undefined}
          onRenameTask={hasEditPermission ? handleRenameTask : undefined}
          curriculumSuggestions={curriculumSuggestions}
          getTaskLevel={getTaskLevel}
          expandedTasks={expandedBatches}
          onExpandedChange={setExpandedBatches}
          onOpenPermissions={isTeacher ? () => setIsPermissionDialogOpen(true) : undefined}
          showPermissions={isTeacher}
        />
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
