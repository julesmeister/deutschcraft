'use client';

import { MemberSelector } from '@/components/ui/MemberSelector';
import { useToast } from '@/components/ui/toast';
import { BatchSelector } from '@/components/ui/BatchSelector';
import { BatchForm } from '@/components/ui/BatchForm';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LevelDistribution } from '@/components/dashboard/LevelDistribution';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StudentTable } from '@/components/dashboard/StudentTable';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevel } from '@/lib/models';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useTeacherDashboard } from '@/lib/hooks/useTeacherDashboard';

export default function TeacherDashboard() {
  // Sync NextAuth session with Firebase Auth
  const { session } = useFirebaseAuth();

  // Toast notifications
  const toast = useToast();

  // Get current teacher's email (userId) from session
  // NEW STRUCTURE: Email is the user ID
  const currentTeacherId = session?.user?.email;

  // Use the custom hook to manage all dashboard logic
  const dashboard = useTeacherDashboard({
    currentTeacherId,
    onSuccess: (msg) => toast.success(msg),
    onError: (msg) => toast.error(msg),
    onInfo: (msg) => toast.info(msg, { duration: 1000 }),
  });

  console.log('[TeacherDashboard] Dashboard data:', {
    currentTeacherId,
    isLoading: dashboard.isLoading,
    isError: dashboard.isError,
    availableMembersCount: dashboard.availableMembers.length,
    availableMembers: dashboard.availableMembers,
    isAddStudentOpen: dashboard.isAddStudentOpen,
  });

  // Loading state
  if (dashboard.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-piku-purple"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboard.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-red-200 rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Could not load students</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-piku-purple text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Level colors for distribution chart
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
      <DashboardHeader
        title="Teacher Dashboard 👨‍🏫"
        subtitle="Monitor and manage your students' progress"
        actions={
          <BatchSelector
            batches={dashboard.batches}
            selectedBatch={dashboard.selectedBatch}
            onSelectBatch={dashboard.setSelectedBatch}
            onCreateBatch={() => dashboard.setIsCreateBatchOpen(true)}
          />
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon="👥"
            iconBgColor="bg-piku-purple-light"
            label="Total Students"
            value={dashboard.myStudents.length}
          />
          <StatsCard
            icon="✅"
            iconBgColor="bg-piku-mint"
            label="Active Today"
            value={dashboard.myStudents.length}
          />
          <StatsCard
            icon="📈"
            iconBgColor="bg-piku-cyan"
            label="Avg. Progress"
            value="0%"
          />
          <StatsCard
            icon="🎯"
            iconBgColor="bg-piku-yellow-light"
            label="Completion Rate"
            value="0%"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Section - Student List */}
          <div className="lg:col-span-2">
            <StudentTable
              students={dashboard.paginatedStudents}
              allStudents={dashboard.studentsForTable}
              selectedBatch={dashboard.selectedBatch}
              onAddStudent={() => dashboard.setIsAddStudentOpen(true)}
              onRemoveStudent={dashboard.handleRemoveStudent}
              isRemoving={dashboard.isRemovingStudent}
              openMenuId={dashboard.openMenuId}
              setOpenMenuId={dashboard.setOpenMenuId}
              currentPage={dashboard.currentPage}
              setCurrentPage={dashboard.setCurrentPage}
              pageSize={dashboard.pageSize}
            />
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="space-y-6">
            <LevelDistribution students={dashboard.studentsForTable} levelColors={levelColors} />
            <TopPerformers students={dashboard.studentsForTable} />
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Add Student Dialog */}
      <MemberSelector
        isOpen={dashboard.isAddStudentOpen}
        onClose={() => dashboard.setIsAddStudentOpen(false)}
        members={dashboard.availableMembers}
        onToggleMember={dashboard.toggleStudentSelection}
        title={`Add Students to ${dashboard.selectedBatch?.name || 'Batch'}`}
        subtitle={`Adding students to ${dashboard.selectedBatch?.name} (${dashboard.selectedBatch?.currentLevel})`}
        searchPlaceholder="Search students..."
        onDone={dashboard.handleAddStudents}
      />

      {/* Create Batch Dialog */}
      <BatchForm
        isOpen={dashboard.isCreateBatchOpen}
        onClose={() => dashboard.setIsCreateBatchOpen(false)}
        onSubmit={dashboard.handleCreateBatch}
        isLoading={dashboard.isCreatingBatch}
      />
    </div>
  );
}
