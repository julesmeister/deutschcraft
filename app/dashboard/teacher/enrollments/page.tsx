'use client';

import { useMemo, useDeferredValue, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, getUserFullName } from '@/lib/models/user';
import { CEFRLevel } from '@/lib/models/cefr';
import { updateUser } from '@/lib/services/userService';
import { usePendingEnrollmentsPaginated } from '@/lib/hooks/useUsers';
import { SlimTable } from '@/components/ui/SlimTable';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { getEnrollmentColumns } from './columns';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

export default function EnrollmentApprovalsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Use optimized pagination hook
  const {
    users: pendingEnrollments,
    isLoading,
    page: currentPage,
    totalPages,
    pageSize,
    totalCount,
    goToPage,
    refetch,
  } = usePendingEnrollmentsPaginated({
    pageSize: 10,
  });

  const handleApprove = async (user: User) => {
    if (!session?.user?.email || !user.desiredCefrLevel) {
      alert('Cannot approve: Missing CEFR level selection');
      return;
    }

    setProcessingId(user.userId);
    try {
      await updateUser(user.email, {
        role: 'STUDENT',
        enrollmentStatus: 'approved',
        cefrLevel: user.desiredCefrLevel,
        enrollmentReviewedAt: Date.now(),
        enrollmentReviewedBy: session.user.email,
        teacherId: session.user.email,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-count'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
    } catch (error) {
      alert('Failed to approve enrollment. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user: User) => {
    if (!session?.user?.email) return;

    const reason = prompt('Enter rejection reason (optional):');

    setProcessingId(user.userId);
    try {
      await updateUser(user.email, {
        enrollmentStatus: 'rejected',
        enrollmentReviewedAt: Date.now(),
        enrollmentReviewedBy: session.user.email,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-count'] });
    } catch (error) {
      alert('Failed to reject enrollment. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateLevel = async (user: User, level: CEFRLevel) => {
    try {
      await updateUser(user.email, {
        desiredCefrLevel: level,
        updatedAt: Date.now(),
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-paginated'] });
    } catch (error) {
      alert('Failed to update CEFR level. Please try again.');
    }
  };

  // Filter enrollments with deferred query
  const filteredEnrollments = useMemo(() => {
    if (!deferredQuery.trim()) {
      return pendingEnrollments;
    }

    const query = deferredQuery.toLowerCase();
    return pendingEnrollments.filter((enrollment) =>
      getUserFullName(enrollment).toLowerCase().includes(query) ||
      enrollment.email.toLowerCase().includes(query)
    );
  }, [pendingEnrollments, deferredQuery]);

  const isStale = searchQuery !== deferredQuery;

  // Convert enrollments to table format
  const tableData = filteredEnrollments.map((enrollment) => {
    const hasSubmitted = enrollment.enrollmentStatus === 'pending';
    const submittedDate = enrollment.enrollmentSubmittedAt
      ? new Date(enrollment.enrollmentSubmittedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Not submitted';

    // Extract signup date
    const signupDate = enrollment.createdAt
      ? new Date(enrollment.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown';

    // Extract image properly - debug logging
    const userName = getUserFullName(enrollment);
    console.log('[EnrollmentsPage] User:', enrollment.email, {
      photoURL: enrollment.photoURL,
      firstName: enrollment.firstName,
      lastName: enrollment.lastName,
      name: userName,
    });

    // Generate fallback avatar if no photoURL
    const userImage = enrollment.photoURL
      ? enrollment.photoURL
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

    return {
      id: enrollment.userId,
      image: userImage,
      name: userName,
      email: enrollment.email,
      level: enrollment.desiredCefrLevel || 'N/A',
      payment: enrollment.gcashAmount || 0,
      reference: enrollment.gcashReferenceNumber || 'N/A',
      submitted: submittedDate,
      signedUp: signupDate,
      status: hasSubmitted ? 'submitted' : 'new',
      statusText: hasSubmitted ? 'Form Submitted' : 'Just Signed Up',
      user: enrollment,
    };
  });

  // Calculate stats
  const submittedCount = pendingEnrollments.filter((e) => e.enrollmentStatus === 'pending').length;
  const newUsersCount = pendingEnrollments.filter((e) => !e.enrollmentStatus).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Enrollment Approvals 📋"
        subtitle="Review and approve student enrollment requests"
        actions={
          <Link
            href="/dashboard/teacher"
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-piku-purple hover:text-piku-purple transition-all duration-300"
          >
            ← Back to Dashboard
          </Link>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon="📋"
            iconBgColor="bg-piku-purple-light"
            label="Total Pending"
            value={totalCount}
          />
          <StatsCard
            icon="✅"
            iconBgColor="bg-piku-mint"
            label="Form Submitted"
            value={submittedCount}
          />
          <StatsCard
            icon="👋"
            iconBgColor="bg-piku-yellow-light"
            label="Just Signed Up"
            value={newUsersCount}
          />
          <StatsCard
            icon="⏱️"
            iconBgColor="bg-piku-cyan"
            label="Awaiting Review"
            value={totalCount}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-piku-purple/10 rounded-full mb-4">
              <svg className="animate-spin h-8 w-8 text-piku-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading enrollments...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalCount === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending enrollment requests at the moment.</p>
          </div>
        )}

        {/* Enrollments Table */}
        {!isLoading && totalCount > 0 && (
          <div className="bg-white border border-gray-200">
            {/* Title and Search */}
            <div className="m-3 sm:m-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
                  Pending Enrollments
                </h5>
                <button
                  onClick={() => refetch()}
                  className="group inline-flex items-center font-black text-[13px] sm:text-[14px] py-1.5 pl-4 sm:pl-5 pr-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                >
                  <span className="relative z-10 transition-colors duration-300">
                    Refresh
                  </span>
                  <span className="relative z-10 ml-3 sm:ml-4 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-400 bg-white text-gray-900">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isStale && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>

            <SlimTable
              title=""
              columns={getEnrollmentColumns({
                processingId,
                onUpdateLevel: handleUpdateLevel,
                onApprove: handleApprove,
                onReject: handleReject,
              })}
              data={tableData}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalItems: filteredEnrollments.length,
                onPageChange: goToPage,
              }}
              showViewAll={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
