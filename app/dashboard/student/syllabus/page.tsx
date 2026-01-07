'use client';

import { useState } from 'react';
import { TaskBoard } from '@/components/ui/TaskBoard';
import { Select, SelectOption } from '@/components/ui/Select';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LevelInfoCard } from '@/components/syllabus/LevelInfoCard';
import { SyllabusScroller } from '@/components/syllabus/SyllabusScroller';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { getSyllabusForLevel } from '@/lib/data/syllabusData';
import {
  createSyllabusTaskGroups,
  calculateAdjustedWeeks,
  calculateIntensityMultiplier,
} from '@/lib/utils/syllabusHelpers';

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
  const intensityMultiplier = calculateIntensityMultiplier(hoursPerDay);
  const baseWeeks = syllabusData.weeklySchedule.length;
  const adjustedTotalWeeks = calculateAdjustedWeeks(baseWeeks, intensityMultiplier);

  // Group weeks together based on study intensity
  const groupWeeks = () => {
    const schedule = syllabusData.weeklySchedule;
    const groupSize = Math.ceil(intensityMultiplier);

    if (groupSize <= 1) {
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
        duration: calculateAdjustedWeeks(weeksInGroup.length, intensityMultiplier),
        topics: allTopics,
      });

      newWeekNumber++;
    }
    return grouped;
  };

  const adjustedSchedule = groupWeeks();
  const taskGroups = createSyllabusTaskGroups(syllabusData, adjustedSchedule);

  const handleToggleTask = (groupId: string, taskId: string) => {
    // TODO: Implement progress tracking in Firestore
    console.log('Toggle task:', groupId, taskId);
  };

  const scrollSections = [
    { id: 'grammar', label: 'Grammar', icon: '✍️' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'schedule', label: 'Weekly Schedule', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SyllabusScroller sections={scrollSections} />
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
        <LevelInfoCard
          level={CEFRLevelInfo[selectedLevel].displayName}
          description={CEFRLevelInfo[selectedLevel].description}
          baseWeeks={baseWeeks}
          adjustedTotalWeeks={adjustedTotalWeeks}
          hoursPerDay={hoursPerDay}
          grammarCount={syllabusData.grammarTopics.length}
          vocabularyCount={syllabusData.vocabularyThemes.length}
          communicationCount={syllabusData.communicationSkills.length}
        />

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
