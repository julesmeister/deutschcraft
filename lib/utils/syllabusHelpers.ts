import { TaskGroup } from '@/components/ui/TaskBoard';

interface WeekSchedule {
  weekNumber: number;
  title: string;
  duration: string;
  topics: string[];
}

interface SyllabusData {
  grammarTopics: string[];
  vocabularyThemes: string[];
  communicationSkills: string[];
}

const TASK_GROUP_COLORS = {
  grammar: '#EB8686', // Coral
  vocabulary: '#F8A5C2', // Blossom
  communication: '#64CDDB', // Aqua
  schedule: '#778BEB', // Ocean
};

/**
 * Create a task group from a list of items
 */
function createTaskGroup(
  id: string,
  title: string,
  color: string,
  items: string[]
): TaskGroup {
  return {
    id,
    title,
    color,
    tasks: items.map((item, index) => ({
      id: `${id}-${index}`,
      title: item,
      status: 'pending' as const,
      priority: 'medium' as const,
      dueDate: '',
      assignees: [],
    })),
  };
}

/**
 * Create a task group for weekly schedule
 */
function createScheduleTaskGroup(
  schedule: WeekSchedule[]
): TaskGroup {
  return {
    id: 'schedule',
    title: 'Weekly Study Schedule',
    color: TASK_GROUP_COLORS.schedule,
    tasks: schedule.map((week) => ({
      id: `week-${week.weekNumber}`,
      title: week.title,
      status: 'pending' as const,
      priority: 'medium' as const,
      dueDate: `Week ${week.weekNumber}`,
      assignees: [],
      description: `Duration: ${week.duration}\n\nTopics:\n${week.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
    })),
  };
}

/**
 * Convert syllabus data to TaskGroup format
 */
export function createSyllabusTaskGroups(
  syllabusData: SyllabusData,
  adjustedSchedule: WeekSchedule[]
): TaskGroup[] {
  return [
    createTaskGroup(
      'grammar',
      'Grammar Topics',
      TASK_GROUP_COLORS.grammar,
      syllabusData.grammarTopics
    ),
    createTaskGroup(
      'vocabulary',
      'Vocabulary Themes',
      TASK_GROUP_COLORS.vocabulary,
      syllabusData.vocabularyThemes
    ),
    createTaskGroup(
      'communication',
      'Communication Skills',
      TASK_GROUP_COLORS.communication,
      syllabusData.communicationSkills
    ),
    createScheduleTaskGroup(adjustedSchedule),
  ];
}

/**
 * Calculate adjusted weeks based on study intensity
 */
export function calculateAdjustedWeeks(
  baseWeeks: number,
  intensityMultiplier: number
): string {
  const adjustedWeeks = baseWeeks / intensityMultiplier;

  if (adjustedWeeks < 1) {
    const days = Math.ceil(adjustedWeeks * 7);
    return `${days} days`;
  }

  const weeks = Math.ceil(adjustedWeeks);
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
}

/**
 * Calculate intensity multiplier from hours per day
 * Base: 1 hour/day = 1x, 2 hours = ~1.5x (not linear due to retention)
 */
export function calculateIntensityMultiplier(hoursPerDay: number): number {
  return hoursPerDay <= 1 ? hoursPerDay : 1 + (hoursPerDay - 1) * 0.5;
}
