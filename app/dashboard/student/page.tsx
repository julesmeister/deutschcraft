'use client';

import dynamic from 'next/dynamic';
import { useAnimatedCounter } from '@/lib/hooks/useAnimatedCounter';
import { SAMPLE_STUDENT, SAMPLE_USER, CEFRLevelInfo, getStudentSuccessRate } from '@/lib/models';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StudentDashboard() {
  const student = SAMPLE_STUDENT;
  const user = SAMPLE_USER;
  const successRate = getStudentSuccessRate(student);

  const stats = [
    { label: 'Words Learned', value: student.wordsLearned, icon: '📚', color: 'text-violet-600' },
    { label: 'Words Mastered', value: student.wordsMastered, icon: '✨', color: 'text-emerald-600' },
    { label: 'Current Streak', value: student.currentStreak, icon: '🔥', color: 'text-orange-600', suffix: ' days' },
    { label: 'Success Rate', value: Math.round(successRate), icon: '🎯', color: 'text-amber-600', suffix: '%' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-500">Continue your German learning journey</p>
      </div>

      {/* Stats Grid - Slim Style (NO rounded corners) */}
      <div className="bg-white overflow-hidden border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyChart />
          <QuickActions />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LevelCard currentLevel={student.currentLevel} />
          <DailyGoalCard current={20} target={student.dailyGoal} />
        </div>
      </div>
    </div>
  );
}

// Stats Card - Exactly like Slim
function StatCard({ label, value, icon, color, suffix = '' }: any) {
  const count = useAnimatedCounter({ target: value, interval: 10 });

  return (
    <div className="p-6 flex items-center gap-4">
      <div className={`text-5xl ${color}`}>{icon}</div>
      <div>
        <p className={`${color} text-sm font-bold uppercase tracking-wide`}>{label}</p>
        <p className="text-3xl font-bold text-gray-900">{count.toLocaleString()}{suffix}</p>
      </div>
    </div>
  );
}

// Weekly Progress - Bitcoin Earnings Style (ApexCharts area chart like Slim)
function WeeklyChart() {
  const totalWords = 131;

  // Exact Bitcoin Earnings config from Slim Dashboard 01
  const chartConfig = {
    options: {
      colors: ['#17A3F1', '#E219D7', '#1560BD'], // Slim cuaternary, tertiary, primary
      chart: {
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        parentHeightOffset: 0,
      },
      stroke: {
        width: 2,
      },
      markers: {
        size: 5,
      },
      grid: {
        show: false,
      },
      xaxis: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      yaxis: {
        show: false,
      },
    },
    series: [
      {
        name: 'series-1',
        data: [12, 18, 15, 22, 19, 25, 20],
      },
      {
        name: 'series-2',
        data: [6, 10, 8, 14, 11, 16, 13],
      },
    ],
  };

  return (
    <div className="bg-white border border-gray-200 relative overflow-hidden" style={{ minHeight: '280px' }}>
      {/* ApexCharts Area Background */}
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <Chart
          options={chartConfig.options}
          series={chartConfig.series}
          type="area"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '-10px',
            right: '-10px',
          }}
          width="100%"
          height="70%"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative p-6 w-full md:w-2/3">
        <p className="text-5xl font-bold text-gray-900 mb-1">
          {totalWords}{' '}
          <span className="text-base text-gray-600">WORDS</span>
        </p>
        <p className="text-sm font-bold uppercase text-gray-900 mb-2">WEEKLY PROGRESS</p>
        <p className="text-sm text-gray-500 mb-4">
          You've learned {totalWords} words this week. Keep up the excellent work!
        </p>
        <button className="border border-gray-900 px-4 py-2 text-sm font-bold uppercase hover:bg-gray-900 hover:text-white transition">
          View Details →
        </button>
      </div>
    </div>
  );
}

// Quick Actions - Simple bordered cards like Slim
function QuickActions() {
  const actions = [
    { icon: '📚', label: 'Practice', count: '15 cards ready' },
    { icon: '✍️', label: 'Write', count: 'AI-powered' },
    { icon: '🔄', label: 'Review', count: '8 words' },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {actions.map((action, i) => (
        <div key={i} className="bg-white border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">{action.icon}</div>
          <p className="text-sm font-bold uppercase text-gray-900 mb-1">{action.label}</p>
          <p className="text-xs text-gray-500 mb-4">{action.count}</p>
          <button className="w-full border border-gray-900 py-2 text-xs font-bold uppercase hover:bg-gray-900 hover:text-white transition">
            Start
          </button>
        </div>
      ))}
    </div>
  );
}

// Level Card - Sales Report Style
function LevelCard({ currentLevel }: { currentLevel: string }) {
  return (
    <div className="bg-white border border-gray-200 p-6">
      <p className="text-violet-600 text-lg font-bold uppercase mb-4">Your Level</p>

      {/* Stats with Dividers */}
      <div className="flex justify-between pb-4 mb-4 border-b border-gray-200">
        <div className="flex-1 border-r border-gray-200 pr-3">
          <p className="text-xs text-gray-500 mb-1">Current</p>
          <p className="text-xl font-bold">{currentLevel}</p>
        </div>
        <div className="flex-1 px-3 border-r border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Words</p>
          <p className="text-xl font-bold">342</p>
        </div>
        <div className="flex-1 pl-3">
          <p className="text-xs text-gray-500 mb-1">Next</p>
          <p className="text-xl font-bold">B2</p>
        </div>
      </div>

      {/* Progress Bar with Text Overlay */}
      <div className="relative mb-3">
        <div className="bg-gray-200 h-4">
          <div className="bg-violet-600 h-full" style={{ width: '65%' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">65%</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {CEFRLevelInfo[currentLevel as keyof typeof CEFRLevelInfo].description}
      </p>
    </div>
  );
}

// Daily Goal Card - Impressions Style
function DailyGoalCard({ current, target }: { current: number; target: number }) {
  const percentage = (current / target) * 100;

  return (
    <div className="bg-white border border-gray-200 p-6">
      <p className="text-violet-600 text-lg font-bold uppercase mb-2">Daily Goal</p>
      <p className="text-3xl font-bold text-gray-900 mb-3">{current} / {target}</p>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600 text-sm font-bold">↑</span>
        </div>
        <span className="text-emerald-600 font-bold text-sm">{percentage.toFixed(0)}%</span>
        <span className="text-gray-500 text-sm">of daily goal</span>
      </div>

      <div className="bg-gray-200 h-2 mb-3">
        <div
          className="bg-violet-600 h-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <p className="text-sm text-gray-500">
        {percentage >= 100 ? 'Excellent work! Goal completed.' : 'Keep going to reach your daily target.'}
      </p>
    </div>
  );
}
