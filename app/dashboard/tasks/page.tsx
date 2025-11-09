'use client';

import { useState, useEffect } from 'react';
import { TaskBoard, TaskGroup, TaskMember, Task } from '@/components/ui/TaskBoard';
import { BatchSelector } from '@/components/ui/BatchSelector';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useActiveBatches } from '@/lib/hooks/useBatches';
import { useAllStudentsNested } from '@/lib/hooks/useUsers';
import { useTeacherBatchTasks, useCreateWritingTask, useUpdateWritingTask, useDeleteWritingTask, useStudentTasks } from '@/lib/hooks/useWritingTasks';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { Batch } from '@/lib/models';
import { useToast } from '@/components/ui/toast';

export default function TasksPage() {
  const { session } = useFirebaseAuth();
  const toast = useToast();

  // Fetch current user from Firestore to get accurate role
  const { student: currentUser, isLoading: isLoadingUser, isError: isUserError } = useCurrentStudent(session?.user?.email || null);

  // Get role from Firestore user data (handles both 'STUDENT' and 'student')
  const userRole = currentUser?.role?.toUpperCase() as 'STUDENT' | 'TEACHER' | undefined;

  // NEW STRUCTURE: Email is the user ID
  const currentTeacherId = userRole === 'TEACHER' ? session?.user?.email : undefined;

  // Student-specific data
  const { tasks: studentTasks, isLoading: studentTasksLoading } = useStudentTasks(
    userRole === 'STUDENT' ? session?.user?.email || undefined : undefined
  );

  // Teacher-specific data
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const { batches } = useActiveBatches(currentTeacherId);

  // Auto-select first batch (teachers only)
  useEffect(() => {
    if (userRole === 'TEACHER' && batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0]);
    }
  }, [batches, selectedBatch, userRole]);

  // Fetch all students (teachers only)
  const { students: allStudents } = useAllStudentsNested();

  // Filter students by selected batch - these will be the task members
  const batchStudents = selectedBatch && currentTeacherId
    ? allStudents.filter(student =>
        student.teacherId === currentTeacherId &&
        student.batchId === selectedBatch.batchId
      )
    : [];

  // Convert students to TaskMember format
  const members: TaskMember[] = batchStudents.map(student => {
    // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
    const displayName = (student as any).name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email;

    return {
      id: student.userId, // Using email as ID now
      name: displayName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`,
    };
  });

  // Fetch writing tasks based on role
  const { tasks: teacherTasks, isLoading: teacherTasksLoading } = useTeacherBatchTasks(
    currentTeacherId,
    selectedBatch?.batchId
  );

  // Use appropriate tasks based on role
  const writingTasks = userRole === 'TEACHER' ? teacherTasks : studentTasks;
  const tasksLoading = userRole === 'TEACHER' ? teacherTasksLoading : studentTasksLoading;

  // Mutation hooks
  const createTaskMutation = useCreateWritingTask();
  const updateTaskMutation = useUpdateWritingTask();
  const deleteTaskMutation = useDeleteWritingTask();

  // Group tasks by category - ALWAYS show all groups, even if empty
  const taskGroups: TaskGroup[] = [
    {
      id: 'essay',
      title: 'Essays',
      tasks: writingTasks
        .filter(task => task.category === 'essay')
        .map(task => ({
          id: task.taskId,
          title: task.title,
          status: task.status === 'assigned' ? 'in-progress' : task.status === 'completed' ? 'completed' : 'pending',
          priority: task.priority,
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: task.status === 'completed',
          assignees: task.assignedStudents,
        })),
    },
    {
      id: 'letter',
      title: 'Letters & Emails',
      tasks: writingTasks
        .filter(task => task.category === 'letter' || task.category === 'email')
        .map(task => ({
          id: task.taskId,
          title: task.title,
          status: task.status === 'assigned' ? 'in-progress' : task.status === 'completed' ? 'completed' : 'pending',
          priority: task.priority,
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: task.status === 'completed',
          assignees: task.assignedStudents,
        })),
    },
    {
      id: 'story',
      title: 'Creative Writing',
      tasks: writingTasks
        .filter(task => task.category === 'story' || task.category === 'article')
        .map(task => ({
          id: task.taskId,
          title: task.title,
          status: task.status === 'assigned' ? 'in-progress' : task.status === 'completed' ? 'completed' : 'pending',
          priority: task.priority,
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: task.status === 'completed',
          assignees: task.assignedStudents,
        })),
    },
    {
      id: 'report',
      title: 'Reports & Reviews',
      tasks: writingTasks
        .filter(task => task.category === 'report' || task.category === 'review')
        .map(task => ({
          id: task.taskId,
          title: task.title,
          status: task.status === 'assigned' ? 'in-progress' : task.status === 'completed' ? 'completed' : 'pending',
          priority: task.priority,
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: task.status === 'completed',
          assignees: task.assignedStudents,
        })),
    },
    {
      id: 'other',
      title: 'Other Tasks',
      tasks: writingTasks
        .filter(task => !['essay', 'letter', 'email', 'story', 'article', 'report', 'review'].includes(task.category))
        .map(task => ({
          id: task.taskId,
          title: task.title,
          status: task.status === 'assigned' ? 'in-progress' : task.status === 'completed' ? 'completed' : 'pending',
          priority: task.priority,
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: task.status === 'completed',
          assignees: task.assignedStudents,
        })),
    },
  ];

  const handleToggleTask = (groupId: string, taskId: string) => {
    const task = writingTasks.find(t => t.taskId === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'assigned' : 'completed';

    updateTaskMutation.mutate({
      taskId,
      updates: { status: newStatus },
    }, {
      onSuccess: () => {
        toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
      },
      onError: () => {
        toast.error('Failed to update task');
      },
    });
  };

  const handleDeleteTask = (groupId: string, taskId: string) => {
    if (userRole !== 'TEACHER') return;

    deleteTaskMutation.mutate({
      taskId,
    }, {
      onSuccess: () => {
        toast.success('Task deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete task');
      },
    });
  };

  const handleUpdateTask = (groupId: string, taskId: string, updates: Partial<Task>) => {
    if (userRole !== 'TEACHER') return;

    updateTaskMutation.mutate({
      taskId,
      updates: {
        title: updates.title,
      },
    }, {
      onSuccess: () => {
        toast.success('Task updated successfully');
      },
      onError: () => {
        toast.error('Failed to update task');
      },
    });
  };

  const handleAddTask = (groupId: string, task: Omit<Task, 'id'>) => {
    if (!currentTeacherId || !selectedBatch) {
      return;
    }

    // Map group ID to category
    const categoryMap: Record<string, any> = {
      'essay': 'essay',
      'letter': 'letter',
      'story': 'story',
      'report': 'report',
      'other': 'other',
    };

    const taskData = {
      teacherId: currentTeacherId,
      batchId: selectedBatch.batchId,
      title: task.title,
      instructions: (task as any).instructions || task.title,
      category: categoryMap[groupId] || 'other',
      level: selectedBatch.currentLevel,
      priority: task.priority,
      dueDate: new Date(task.dueDate).getTime(),
      assignedStudents: task.assignees || [],
      // Optional criteria fields
      minWords: (task as any).minWords,
      maxWords: (task as any).maxWords,
      minParagraphs: (task as any).minParagraphs,
      maxParagraphs: (task as any).maxParagraphs,
      totalPoints: (task as any).totalPoints,
      tone: (task as any).tone,
      perspective: (task as any).perspective,
      requireIntroduction: (task as any).requireIntroduction,
      requireConclusion: (task as any).requireConclusion,
      requireExamples: (task as any).requireExamples,
    };

    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        toast.success('Task created successfully!');
      },
      onError: (error) => {
        toast.error('Failed to create task. Please try again.');
      },
    });
  };

  const handleAddMember = () => {
    // TODO: Open member selector to assign students to tasks
  };

  const handleCreateBatch = () => {
    // TODO: Open create batch dialog
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Writing Tasks 📝
              </h1>
              <p className="text-gray-600 mt-1">
                {userRole === 'TEACHER' ? (
                  selectedBatch
                    ? `Manage writing assignments for ${selectedBatch.name}`
                    : 'Manage and track all your writing tasks'
                ) : (
                  'View and complete your writing assignments'
                )}
              </p>
            </div>
            {/* BatchSelector only visible to teachers */}
            {userRole === 'TEACHER' && (
              <BatchSelector
                batches={batches}
                selectedBatch={selectedBatch}
                onSelectBatch={setSelectedBatch}
                onCreateBatch={handleCreateBatch}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {tasksLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-piku-purple-dark"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <>
            <TaskBoard
              title={
                userRole === 'TEACHER'
                  ? selectedBatch ? `${selectedBatch.name} - Writing Tasks` : 'Writing Tasks'
                  : 'My Writing Tasks'
              }
              groups={taskGroups}
              members={members}
              onAddTask={userRole === 'TEACHER' ? handleAddTask : undefined}
              onToggleTask={handleToggleTask}
              onDeleteTask={userRole === 'TEACHER' ? handleDeleteTask : undefined}
              onUpdateTask={userRole === 'TEACHER' ? handleUpdateTask : undefined}
              onAddMember={userRole === 'TEACHER' ? handleAddMember : undefined}
              showMembers={userRole === 'TEACHER'}
              showAddTask={userRole === 'TEACHER'}
              maxVisibleMembers={4}
            />
          </>
        )}
      </div>
    </div>
  );
}
