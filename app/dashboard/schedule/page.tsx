'use client';

import { useState } from 'react';
import { GanttChart, GanttChartTask } from '@/components/ui/GanttChart';

export default function SchedulePage() {
  // Sample data matching the original component
  const [tasks, setTasks] = useState<GanttChartTask[]>([
    {
      id: 'design',
      name: 'Design',
      startDate: new Date(2024, 9, 31), // Oct 31
      endDate: new Date(2024, 10, 21), // Nov 21
      progress: 40,
      color: 'rgb(251, 191, 36)', // yellow
      children: [
        {
          id: 'user-research',
          name: 'User research',
          startDate: new Date(2024, 9, 31),
          endDate: new Date(2024, 10, 6),
          progress: 85,
          color: 'rgb(253, 186, 116)',
        },
        {
          id: 'design-system',
          name: 'Design system',
          startDate: new Date(2024, 10, 3),
          endDate: new Date(2024, 10, 10),
          progress: 35,
          color: 'rgb(253, 186, 116)',
        },
        {
          id: 'prototype',
          name: 'Prototype',
          startDate: new Date(2024, 10, 10),
          endDate: new Date(2024, 10, 21),
          progress: 60,
          color: 'rgb(253, 186, 116)',
        },
      ],
    },
    {
      id: 'development',
      name: 'Development',
      startDate: new Date(2024, 10, 15),
      endDate: new Date(2024, 11, 28),
      progress: 40,
      color: 'rgb(110, 231, 183)', // mint
      children: [
        {
          id: 'infra',
          name: 'Infra architecture',
          startDate: new Date(2024, 10, 15),
          endDate: new Date(2024, 10, 22),
          progress: 20,
          color: 'rgb(125, 211, 252)',
        },
        {
          id: 'core-modules',
          name: 'Develop core modules',
          startDate: new Date(2024, 10, 22),
          endDate: new Date(2024, 11, 19),
          progress: 10,
          color: 'rgb(125, 211, 252)',
        },
        {
          id: 'integrate',
          name: 'Integrate modules',
          startDate: new Date(2024, 11, 6),
          endDate: new Date(2024, 11, 28),
          progress: 15,
          color: 'rgb(125, 211, 252)',
        },
      ],
    },
  ]);

  const handleAddTask = () => {
    const newTask: GanttChartTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      progress: 0,
      color: 'rgb(167, 139, 250)', // purple
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-black text-gray-900">Project Schedule 📅</h1>
          <p className="text-gray-600 mt-1">Track project timeline and progress</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <GanttChart
          title="Schedule"
          tasks={tasks}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onAddTask={handleAddTask}
        />
      </div>
    </div>
  );
}
