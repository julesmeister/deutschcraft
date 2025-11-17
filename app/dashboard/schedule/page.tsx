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

  // Local state
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [tasks, setTasks] = useState<GanttChartTask[]>([]);

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

  // Convert batches to GanttChart tasks only when batches actually change
  useEffect(() => {
    setTasks(prevTasks => {
      // Create a map of existing tasks to preserve their children
      const existingTasksMap = new Map(prevTasks.map(task => [task.id, task]));

      return batches.map((batch, index) => {
        const batchColor = BATCH_COLORS[index % BATCH_COLORS.length];

        // Preserve existing children if this batch already exists
        const existingTask = existingTasksMap.get(batch.batchId);
        const children = existingTask?.children || [];

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
    });
  }, [batches.length, JSON.stringify(batches.map(b => b.batchId))]); // Only update when batch IDs change

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

  // Not needed - batches are added via BatchForm
  const handleAddTask = () => {
    toast.info('Use the batch selector to create a new batch');
  };

  // Add subtask (curriculum item) to a batch
  const handleAddSubTask = (parentTaskId: string) => {
    const addSubTaskRecursive = (taskList: GanttChartTask[]): GanttChartTask[] => {
      return taskList.map(task => {
        if (task.id === parentTaskId) {
          // Find the batch to get its level
          const batch = batches.find(b => b.batchId === parentTaskId);
          const defaultStartDate = new Date(task.startDate);
          const defaultEndDate = new Date(defaultStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

          const newSubTask: GanttChartTask = {
            id: `curriculum-${Date.now()}`,
            name: 'New Curriculum Item', // User will rename this
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            progress: 0,
            color: task.color,
          };

          const updatedChildren = [...(task.children || []), newSubTask];
          const childrenDates = calculateParentDates(updatedChildren);

          return {
            ...task,
            children: updatedChildren,
            startDate: childrenDates?.startDate || task.startDate,
            endDate: childrenDates?.endDate || task.endDate,
          };
        }
        if (task.children) {
          return { ...task, children: addSubTaskRecursive(task.children) };
        }
        return task;
      });
    };
    setTasks(addSubTaskRecursive(tasks));
  };

  const handleDeleteTask = (taskId: string) => {
    const deleteTaskRecursive = (taskList: GanttChartTask[]): GanttChartTask[] => {
      return taskList
        .filter(task => task.id !== taskId)
        .map(task => {
          if (task.children) {
            const updatedChildren = deleteTaskRecursive(task.children);
            const childrenDates = calculateParentDates(updatedChildren);

            return {
              ...task,
              children: updatedChildren,
              startDate: childrenDates?.startDate || task.startDate,
              endDate: childrenDates?.endDate || task.endDate,
            };
          }
          return task;
        });
    };
    setTasks(deleteTaskRecursive(tasks));
  };

  const handleRenameTask = (taskId: string, newName: string) => {
    const renameTaskRecursive = (taskList: GanttChartTask[]): GanttChartTask[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, name: newName };
        }
        if (task.children) {
          return { ...task, children: renameTaskRecursive(task.children) };
        }
        return task;
      });
    };
    setTasks(renameTaskRecursive(tasks));
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
  if (isLoading || !session) {
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
          onAddTask={handleAddTask}
          onAddSubTask={handleAddSubTask}
          onDeleteTask={handleDeleteTask}
          onRenameTask={handleRenameTask}
          curriculumSuggestions={curriculumSuggestions}
          getTaskLevel={getTaskLevel}
        />
      </div>

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
