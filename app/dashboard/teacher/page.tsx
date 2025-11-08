'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { SAMPLE_TEACHER, CEFRLevel, CEFRLevelInfo } from '@/lib/models';

export default function TeacherDashboard() {
  const teacher = SAMPLE_TEACHER;

  // Mock student data - expanded list for pagination
  const allStudents = [
    {
      id: '1',
      name: 'Max Mustermann',
      image: 'https://ui-avatars.com/api/?name=Max+Mustermann&background=667eea&color=fff',
      sold: 342,
      gain: 33.34,
      status: 'low-stock' as const,
      statusText: '20 words remaining',
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      image: 'https://ui-avatars.com/api/?name=Anna+Schmidt&background=06b6d4&color=fff',
      sold: 156,
      gain: -21.2,
      status: 'in-stock' as const,
      statusText: 'Active learner',
    },
    {
      id: '3',
      name: 'Thomas Weber',
      image: 'https://ui-avatars.com/api/?name=Thomas+Weber&background=10b981&color=fff',
      sold: 487,
      gain: 23.34,
      status: 'in-stock' as const,
      statusText: 'On track',
    },
    {
      id: '4',
      name: 'Sarah Fischer',
      image: 'https://ui-avatars.com/api/?name=Sarah+Fischer&background=f59e0b&color=fff',
      sold: 89,
      gain: 28.78,
      status: 'paused' as const,
      statusText: 'Paused',
    },
    {
      id: '5',
      name: 'Michael Becker',
      image: 'https://ui-avatars.com/api/?name=Michael+Becker&background=8b5cf6&color=fff',
      sold: 234,
      gain: 15.67,
      status: 'in-stock' as const,
      statusText: 'Active learner',
    },
    {
      id: '6',
      name: 'Laura Hoffmann',
      image: 'https://ui-avatars.com/api/?name=Laura+Hoffmann&background=ec4899&color=fff',
      sold: 412,
      gain: 42.12,
      status: 'in-stock' as const,
      statusText: 'Excellent progress',
    },
    {
      id: '7',
      name: 'Felix Schneider',
      image: 'https://ui-avatars.com/api/?name=Felix+Schneider&background=14b8a6&color=fff',
      sold: 98,
      gain: -5.34,
      status: 'low-stock' as const,
      statusText: '15 words remaining',
    },
    {
      id: '8',
      name: 'Julia Meyer',
      image: 'https://ui-avatars.com/api/?name=Julia+Meyer&background=f97316&color=fff',
      sold: 567,
      gain: 38.90,
      status: 'in-stock' as const,
      statusText: 'Top performer',
    },
    {
      id: '9',
      name: 'David Klein',
      image: 'https://ui-avatars.com/api/?name=David+Klein&background=3b82f6&color=fff',
      sold: 289,
      gain: 12.45,
      status: 'in-stock' as const,
      statusText: 'Steady progress',
    },
    {
      id: '10',
      name: 'Sophie Wagner',
      image: 'https://ui-avatars.com/api/?name=Sophie+Wagner&background=a855f7&color=fff',
      sold: 178,
      gain: 25.78,
      status: 'in-stock' as const,
      statusText: 'Active learner',
    },
    {
      id: '11',
      name: 'Lukas Zimmermann',
      image: 'https://ui-avatars.com/api/?name=Lukas+Zimmermann&background=06b6d4&color=fff',
      sold: 445,
      gain: 18.23,
      status: 'in-stock' as const,
      statusText: 'On track',
    },
    {
      id: '12',
      name: 'Emma Braun',
      image: 'https://ui-avatars.com/api/?name=Emma+Braun&background=10b981&color=fff',
      sold: 356,
      gain: 31.56,
      status: 'in-stock' as const,
      statusText: 'Great progress',
    },
    {
      id: '13',
      name: 'Noah Hartmann',
      image: 'https://ui-avatars.com/api/?name=Noah+Hartmann&background=f59e0b&color=fff',
      sold: 123,
      gain: -8.90,
      status: 'low-stock' as const,
      statusText: '25 words remaining',
    },
    {
      id: '14',
      name: 'Mia Koch',
      image: 'https://ui-avatars.com/api/?name=Mia+Koch&background=ef4444&color=fff',
      sold: 498,
      gain: 44.67,
      status: 'in-stock' as const,
      statusText: 'Exceptional',
    },
    {
      id: '15',
      name: 'Leon Schulz',
      image: 'https://ui-avatars.com/api/?name=Leon+Schulz&background=667eea&color=fff',
      sold: 267,
      gain: 9.12,
      status: 'in-stock' as const,
      statusText: 'Active learner',
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(allStudents.length / pageSize);

  // Get current page data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const students = allStudents.slice(startIndex, endIndex);

  const levelColors: Record<CEFRLevel, string> = {
    [CEFRLevel.A1]: 'bg-piku-yellow-light',
    [CEFRLevel.A2]: 'bg-piku-mint',
    [CEFRLevel.B1]: 'bg-piku-cyan',
    [CEFRLevel.B2]: 'bg-piku-purple-light',
    [CEFRLevel.C1]: 'bg-piku-orange',
    [CEFRLevel.C2]: 'bg-piku-gold',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Teacher Dashboard 👨‍🏫</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your students' progress</p>
            </div>
            <Badge variant="purple" size="lg">
              {teacher.specialization}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white border border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-piku-purple-light flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900">{teacher.totalStudents}</h3>
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-white border border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-piku-mint flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Today</p>
                <h3 className="text-3xl font-bold text-gray-900">{teacher.activeStudents}</h3>
              </div>
            </div>
          </div>

          {/* Average Progress */}
          <div className="bg-white border border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-piku-cyan flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Progress</p>
                <h3 className="text-3xl font-bold text-gray-900">68%</h3>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white border border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-piku-yellow-light flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                <h3 className="text-3xl font-bold text-gray-900">85%</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Section - Student List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200">
              <SlimTable
                title="Your Students"
                columns={[
                  {
                    key: 'image',
                    label: ' ',
                    width: '60px',
                    render: (value, row) => SlimTableRenderers.Avatar(value, row.name),
                  },
                  {
                    key: 'name',
                    label: 'Student',
                    render: (value, row) => (
                      <div>
                        {SlimTableRenderers.Link(value)}
                        {SlimTableRenderers.Status(
                          row.status === 'in-stock' ? 'bg-green-500' : row.status === 'low-stock' ? 'bg-red-600' : 'bg-neutral-300',
                          row.statusText
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'sold',
                    label: 'Words Learned',
                    align: 'right',
                    render: (value) => <p className="text-gray-500 text-xs">{value.toLocaleString()}</p>,
                  },
                  {
                    key: 'gain',
                    label: 'Progress',
                    render: (value) => (
                      <p className="text-gray-500 text-xs">
                        {SlimTableRenderers.Percentage(value)} from last week
                      </p>
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    align: 'center',
                    width: '80px',
                    render: () => SlimTableRenderers.MenuButton(),
                  },
                ]}
                data={students}
                pagination={{
                  currentPage,
                  totalPages,
                  pageSize,
                  totalItems: allStudents.length,
                  onPageChange: setCurrentPage,
                }}
                showViewAll={true}
                viewAllText="View All Students"
              />
            </div>
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="space-y-6">
            {/* Level Distribution */}
            <div className="bg-white border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Level Distribution</h5>
              </div>
              <div className="p-4 space-y-3">
                {Object.values(CEFRLevel).map((level) => {
                  const count = allStudents.filter(s => s.level === level).length;
                  const percentage = (count / allStudents.length) * 100;

                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">{level}</span>
                        <span className="text-sm text-gray-600">{count} students</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${levelColors[level]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Top Performers 🌟</h5>
              </div>
              <div className="p-4 space-y-3">
                {allStudents
                  .sort((a, b) => b.sold - a.sold)
                  .slice(0, 3)
                  .map((student, index) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                        index === 0 ? 'bg-piku-gold' : index === 1 ? 'bg-gray-300' : 'bg-piku-orange'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-600">{student.sold} words learned</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wide">Quick Actions</h5>
              </div>
              <div className="p-4 space-y-3">
                <ActionButton
                  variant="purple"
                  icon={<ActionButtonIcons.Analytics />}
                  onClick={() => console.log('View Analytics clicked')}
                >
                  View Analytics
                </ActionButton>

                <ActionButton
                  variant="cyan"
                  icon={<ActionButtonIcons.Message />}
                  onClick={() => console.log('Message Students clicked')}
                >
                  Message Students
                </ActionButton>

                <ActionButton
                  variant="mint"
                  icon={<ActionButtonIcons.Document />}
                  onClick={() => console.log('Create Assignment clicked')}
                >
                  Create Assignment
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
