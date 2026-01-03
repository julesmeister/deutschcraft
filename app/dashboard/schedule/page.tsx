'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BatchSelector } from '@/components/ui/BatchSelector';
import { BatchForm } from '@/components/ui/BatchForm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useActiveBatches } from '@/lib/hooks/useBatches';
import { useBatchSelection } from '@/lib/hooks/useBatchSelection';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CatLoader } from '@/components/ui/CatLoader';
import { getSyllabusForLevel } from '@/lib/data/syllabusData';
import { CEFRLevel } from '@/lib/models/cefr';
import {
  useGanttTasks,
  useGanttEditPermission,
  useGanttPermissions,
  useGrantGanttPermission,
  useRevokeGanttPermission
} from '@/lib/hooks/useGanttTasks';
import { GanttPermissionDialog } from '@/components/ui/gantt/GanttPermissionDialog';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { ScheduleViewToggle, ScheduleViewType } from '@/components/schedule/ScheduleViewToggle';
import { GanttViewSection } from '@/components/schedule/GanttViewSection';
import { DayViewSection } from '@/components/schedule/DayViewSection';
import { buildHierarchyTasks, convertTasksToDayViewEvents } from '@/lib/utils/scheduleHelpers';
import { useToast } from '@/components/ui/toast';
import { PlaceholderView } from './PlaceholderView';
import { useScheduleHandlers } from './useScheduleHandlers';
import { getTaskLevel } from './scheduleHandlers';
import { GanttChartTask } from '@/components/ui/GanttChart';

export default function SchedulePage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const toast = useToast();
  const currentUserId = session?.user?.email;

  const { student: currentUser } = useCurrentStudent(currentUserId || null);
  const isTeacher = currentUser?.role === 'TEACHER';

  const currentTeacherId = isTeacher ? currentUserId : currentUser?.teacherId;
  const { batches: allBatches, isLoading } = useActiveBatches(currentTeacherId);

  const batches = isTeacher
    ? allBatches
    : allBatches.filter(b => b.batchId === currentUser?.batchId);

  const { data: ganttTasks = [], isLoading: isLoadingTasks } = useGanttTasks(currentTeacherId);

  const { data: hasStudentEditPermission = false, isLoading: isLoadingPermission } = useGanttEditPermission(currentUserId);
  const hasEditPermission = isTeacher || hasStudentEditPermission;

  const { data: activePermissions = [] } = useGanttPermissions();
  const grantPermissionMutation = useGrantGanttPermission();
  const revokePermissionMutation = useRevokeGanttPermission();

  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<GanttChartTask[]>([]);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ScheduleViewType>('gantt');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { selectedBatch, setSelectedBatch, sortedBatches } = useBatchSelection({
    batches,
    user: currentUser,
  });

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

  const hierarchyTasks = useMemo(() => {
    return buildHierarchyTasks(batches, ganttTasks);
  }, [batches.length, ganttTasks.length, JSON.stringify(batches.map(b => b.batchId)), JSON.stringify(ganttTasks.map(t => t.taskId))]);

  const filteredTasks = useMemo(() => {
    if (selectedBatch) {
      return hierarchyTasks.filter(task => task.id === selectedBatch.batchId);
    }
    return hierarchyTasks;
  }, [hierarchyTasks, selectedBatch?.batchId]);

  useEffect(() => {
    setTasks(filteredTasks);
  }, [filteredTasks]);

  const dayViewEvents = useMemo(() => {
    return convertTasksToDayViewEvents(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const {
    handleCreateBatch,
    handleAddTask,
    handleAddSubTask,
    handleDeleteTask,
    handleRenameTask,
    handleEventTimeUpdate,
    createBatchMutation,
  } = useScheduleHandlers({
    isTeacher,
    currentUserId,
    hasEditPermission,
    selectedBatch,
    batches,
    tasks,
    ganttTasks,
    setExpandedBatches,
  });

  const onCreateBatch = async (data: any) => {
    const success = await handleCreateBatch(data);
    if (success) {
      setIsCreateBatchOpen(false);
    }
  };

  if (isLoading || isLoadingTasks || isLoadingPermission || !session) {
    return <CatLoader message="Loading schedule..." size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              batches={sortedBatches}
              selectedBatch={selectedBatch}
              onSelectBatch={setSelectedBatch}
              onCreateBatch={() => setIsCreateBatchOpen(true)}
              onManageBatches={() => router.push('/dashboard/batches')}
            />
          </div>
        }
      />

      <div className="container mx-auto px-6 py-8">
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
            getTaskLevel={(taskId) => getTaskLevel(taskId, tasks, batches)}
          />
        )}

        {currentView === 'day' && (
          <DayViewSection
            selectedDate={selectedDate}
            events={dayViewEvents}
            onDateChange={setSelectedDate}
            onEventClick={(event) => console.log('Event clicked:', event)}
            onEventUpdate={hasEditPermission ? handleEventTimeUpdate : undefined}
          />
        )}

        {currentView === 'week' && (
          <PlaceholderView
            icon="📅"
            title="Week View Coming Soon"
            description="Week view is currently under development. Use Day or Gantt view for now."
          />
        )}

        {currentView === 'month' && (
          <PlaceholderView
            icon="📆"
            title="Month View Coming Soon"
            description="Month view is currently under development. Use Day or Gantt view for now."
          />
        )}
      </div>

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

      <BatchForm
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        onSubmit={onCreateBatch}
        isLoading={createBatchMutation.isPending}
      />
    </div>
  );
}
