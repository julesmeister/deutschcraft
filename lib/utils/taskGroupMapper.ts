import { TaskGroup } from '@/components/ui/TaskBoard';

interface WritingTask {
  taskId: string;
  title: string;
  status: string;
  priority: string;
  dueDate: number;
  category: string;
  assignedStudents: string[];
  // Optional writing criteria
  instructions?: string;
  minWords?: number;
  maxWords?: number;
  minParagraphs?: number;
  maxParagraphs?: number;
  totalPoints?: number;
  tone?: 'formell' | 'informell' | 'sachlich' | 'persönlich' | 'offiziell';
  perspective?: 'first-person' | 'second-person' | 'third-person';
  requireIntroduction?: boolean;
  requireConclusion?: boolean;
  requireExamples?: boolean;
}

/**
 * Maps writing tasks to TaskBoard groups
 * Groups tasks by category into predefined groups
 */
export function mapTasksToGroups(writingTasks: WritingTask[]): TaskGroup[] {
  const mapTaskStatus = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'in-progress';
      case 'completed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  const formatDueDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const mapTask = (task: WritingTask) => ({
    id: task.taskId,
    title: task.title,
    status: mapTaskStatus(task.status) as 'pending' | 'in-progress' | 'completed',
    priority: task.priority as 'low' | 'medium' | 'high',
    dueDate: formatDueDate(task.dueDate),
    completed: task.status === 'completed',
    assignees: task.assignedStudents,
    // Pass through optional writing criteria
    instructions: task.instructions,
    minWords: task.minWords,
    maxWords: task.maxWords,
    minParagraphs: task.minParagraphs,
    maxParagraphs: task.maxParagraphs,
    totalPoints: task.totalPoints,
    tone: task.tone,
    perspective: task.perspective,
    requireIntroduction: task.requireIntroduction,
    requireConclusion: task.requireConclusion,
    requireExamples: task.requireExamples,
  });

  return [
    {
      id: 'essay',
      title: 'Essays',
      tasks: writingTasks
        .filter(task => task.category === 'essay')
        .map(mapTask),
    },
    {
      id: 'letter',
      title: 'Letters & Emails',
      tasks: writingTasks
        .filter(task => task.category === 'letter' || task.category === 'email')
        .map(mapTask),
    },
    {
      id: 'story',
      title: 'Creative Writing',
      tasks: writingTasks
        .filter(task => task.category === 'story' || task.category === 'article')
        .map(mapTask),
    },
    {
      id: 'report',
      title: 'Reports & Reviews',
      tasks: writingTasks
        .filter(task => task.category === 'report' || task.category === 'review')
        .map(mapTask),
    },
    {
      id: 'other',
      title: 'Other Tasks',
      tasks: writingTasks
        .filter(task => !['essay', 'letter', 'email', 'story', 'article', 'report', 'review'].includes(task.category))
        .map(mapTask),
    },
  ];
}

/**
 * Maps group ID to task category
 */
export function mapGroupIdToCategory(groupId: string): string {
  const categoryMap: Record<string, string> = {
    'essay': 'essay',
    'letter': 'letter',
    'story': 'story',
    'report': 'report',
    'other': 'other',
  };
  return categoryMap[groupId] || 'other';
}
