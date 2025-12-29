import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys following FIRESTORE_PROTOCOL.md cache strategy
export const queryKeys = {
  // Users
  user: (userId: string) => ['user', userId] as const,

  // Students
  student: (studentId: string) => ['student', studentId] as const,
  currentStudent: (userId: string) => ['student', 'current', userId] as const,
  allStudents: () => ['students', 'nested', 'all'] as const,
  studentsByTeacher: (teacherId: string) => ['students', 'nested', 'byTeacher', teacherId] as const,
  studentsWithoutTeacher: () => ['students', 'nested', 'withoutTeacher'] as const,

  // Teachers
  teacher: (teacherId: string) => ['teacher', teacherId] as const,
  teacherStudents: (teacherId: string, page: number = 0) =>
    ['teacher', teacherId, 'students', page] as const,

  // Batches
  batches: (teacherId: string) => ['batches', teacherId] as const,
  batch: (batchId: string) => ['batch', batchId] as const,

  // Writing Tasks
  writingTasks: (batchId: string) => ['writing-tasks', batchId] as const,
  writingTask: (taskId: string) => ['writing-task', taskId] as const,
  taskSubmissions: (taskId: string) => ['task-submissions', taskId] as const,
  studentSubmissions: (studentId: string) => ['student-submissions', studentId] as const,

  // Vocabulary
  vocabulary: (level: string) => ['vocabulary', level] as const,

  // Progress
  flashcardProgress: (userId: string) => ['flashcard-progress', userId] as const,
  studyProgress: (userId: string, days: number) => ['study-progress', userId, days] as const,
  weeklyProgress: (userId: string) => ['weekly-progress', userId] as const,
};

// Cache times per FIRESTORE_PROTOCOL.md
export const cacheTimes = {
  user: 5 * 60 * 1000,           // 5 minutes
  student: 5 * 60 * 1000,         // 5 minutes (alias for user)
  students: 2 * 60 * 1000,        // 2 minutes (for lists)
  studentProfile: 10 * 60 * 1000, // 10 minutes
  teacherProfile: 10 * 60 * 1000, // 10 minutes
  studentList: 2 * 60 * 1000,     // 2 minutes
  vocabulary: 24 * 60 * 60 * 1000, // 24 hours
  studyProgress: 30 * 1000,       // 30 seconds
  dashboardStats: 1 * 60 * 1000,  // 1 minute
  flashcardStats: 60 * 60 * 1000, // 1 hour (for flashcards page)
  batches: 5 * 60 * 1000,         // 5 minutes
  writingTasks: 2 * 60 * 1000,    // 2 minutes - moderate updates
  taskSubmissions: 1 * 60 * 1000, // 1 minute - more frequent updates
};
