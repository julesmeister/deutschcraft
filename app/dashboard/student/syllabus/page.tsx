'use client';

import { useState } from 'react';
import { TaskBoard, TaskGroup } from '@/components/ui/TaskBoard';
import { Select, SelectOption } from '@/components/ui/Select';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { getSyllabusForLevel } from '@/lib/data/syllabusData';

export default function SyllabusPage() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);

  // CEFR Level options
  const cefrOptions: SelectOption[] = Object.values(CEFRLevel).map((level) => ({
    value: level,
    label: CEFRLevelInfo[level].displayName,
  }));

  // Study intensity options
  const intensityOptions: SelectOption[] = [
    { value: '0.5', label: '30 mins/day (Casual)' },
    { value: '1', label: '1 hour/day (Regular)' },
    { value: '2', label: '2 hours/day (Intensive)' },
    { value: '3', label: '3 hours/day (Very Intensive)' },
    { value: '4', label: '4 hours/day (Full Immersion)' },
  ];

  // Get syllabus data for selected level
  const syllabusData = getSyllabusForLevel(selectedLevel);

  // Calculate adjusted timeline based on study intensity
  // Base calculation: 1 hour/day = 1x speed, 2 hours/day = ~1.5x speed (not linear due to retention)
  const intensityMultiplier = hoursPerDay <= 1 ? hoursPerDay : 1 + (hoursPerDay - 1) * 0.5;

  const calculateAdjustedWeeks = (baseWeeks: number): string => {
    const adjustedWeeks = baseWeeks / intensityMultiplier;

    if (adjustedWeeks < 1) {
      const days = Math.ceil(adjustedWeeks * 7);
      return `${days} days`;
    }

    const weeks = Math.ceil(adjustedWeeks);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  };

  // Calculate total weeks for the level
  const baseWeeks = syllabusData.weeklySchedule.length;
  const adjustedTotalWeeks = calculateAdjustedWeeks(baseWeeks);

  // Group weeks together based on study intensity
  const groupWeeks = () => {
    const schedule = syllabusData.weeklySchedule;
    const groupSize = Math.ceil(intensityMultiplier); // 1hr=1, 2hr=1.5, 3hr=2, 4hr=2.5

    if (groupSize <= 1) {
      // No grouping needed for casual/regular study
      return schedule;
    }

    const grouped = [];
    let newWeekNumber = 1;

    for (let i = 0; i < schedule.length; i += groupSize) {
      const weeksInGroup = schedule.slice(i, i + groupSize);
      const titles = weeksInGroup.map(w => w.title);
      const allTopics = weeksInGroup.flatMap(w => w.topics);

      grouped.push({
        weekNumber: newWeekNumber,
        title: titles.join(' + '),
        duration: calculateAdjustedWeeks(weeksInGroup.length),
        topics: allTopics,
      });

      newWeekNumber++;
    }
    return grouped;
  };

  const adjustedSchedule = groupWeeks();

  // Convert syllabus data to TaskGroup format
  const taskGroups: TaskGroup[] = [
    {
      id: 'grammar',
      title: 'Grammar Topics',
      color: '#EB8686', // Coral
      tasks: syllabusData.grammarTopics.map((topic, index) => ({
        id: `grammar-${index}`,
        title: topic,
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignees: [],
      })),
    },
    {
      id: 'vocabulary',
      title: 'Vocabulary Themes',
      color: '#F8A5C2', // Blossom
      tasks: syllabusData.vocabularyThemes.map((topic, index) => ({
        id: `vocabulary-${index}`,
        title: topic,
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignees: [],
      })),
    },
    {
      id: 'communication',
      title: 'Communication Skills',
      color: '#64CDDB', // Aqua
      tasks: syllabusData.communicationSkills.map((topic, index) => ({
        id: `communication-${index}`,
        title: topic,
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignees: [],
      })),
    },
    {
      id: 'schedule',
      title: 'Weekly Study Schedule',
      color: '#778BEB', // Ocean
      tasks: adjustedSchedule.map((week, index) => ({
        id: `week-${week.weekNumber}`,
        title: week.title,
        status: 'pending',
        priority: 'medium',
        dueDate: `Week ${week.weekNumber}`,
        assignees: [],
        // Store week details in a way that can be displayed
        description: `Duration: ${week.duration}\n\nTopics:\n${week.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
      })),
    },
  ];

  const handleToggleTask = (groupId: string, taskId: string) => {
    // TODO: Implement progress tracking in Firestore
    console.log('Toggle task:', groupId, taskId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="German Language Syllabus 📋"
        subtitle="Comprehensive curriculum from beginner to upper-intermediate levels"
        actions={
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Level Selector */}
            <div className="w-full sm:w-64">
              <label className="block text-xs font-semibold text-gray-700 mb-1">CEFR Level</label>
              <Select
                value={selectedLevel}
                onChange={(value) => setSelectedLevel(value as CEFRLevel)}
                options={cefrOptions}
                placeholder="Select CEFR Level"
              />
            </div>
            {/* Study Intensity Selector */}
            <div className="w-full sm:w-72">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Study Intensity</label>
              <Select
                value={String(hoursPerDay)}
                onChange={(value) => setHoursPerDay(Number(value))}
                options={intensityOptions}
                placeholder="Select study hours"
              />
            </div>
          </div>
        }
      />

      {/* Level Info */}
      <div className="container mx-auto px-6 py-6">

        {/* Level Info Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📚</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {CEFRLevelInfo[selectedLevel].displayName}
              </h2>
              <p className="text-gray-600 mb-4">
                {CEFRLevelInfo[selectedLevel].description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Base Duration:</span>
                  <span className="text-gray-600 ml-2">{syllabusData.weeklySchedule.length} weeks (1 hr/day)</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Your Timeline:</span>
                  <span className="text-blue-600 font-bold ml-2">{adjustedTotalWeeks} ({hoursPerDay} hr{hoursPerDay !== 1 ? 's' : ''}/day)</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Grammar Topics:</span>
                  <span className="text-gray-600 ml-2">{syllabusData.grammarTopics.length} topics</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Vocabulary Themes:</span>
                  <span className="text-gray-600 ml-2">{syllabusData.vocabularyThemes.length} themes</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Communication Skills:</span>
                  <span className="text-gray-600 ml-2">{syllabusData.communicationSkills.length} skills</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Total Study Time:</span>
                  <span className="text-gray-600 ml-2">~{Math.ceil(baseWeeks * 7 * hoursPerDay)} hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TaskBoard - Read-only (no ability to add tasks) */}
        <TaskBoard
          title={`${CEFRLevelInfo[selectedLevel].displayName} Curriculum`}
          groups={taskGroups}
          members={[]}
          onToggleTask={handleToggleTask}
          showMembers={false}
          showAddTask={false} // Disable adding new tasks
          showDelete={false} // Disable delete button
          showExpandArrow={false} // Disable expand arrow
          showStatus={false} // Hide status column
          showPriority={false} // Hide priority column
          maxVisibleMembers={0}
        />
      </div>
    </div>
  );
}
