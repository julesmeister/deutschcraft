'use client';

import { useEffect, useState, useDeferredValue } from 'react';
import { useSession } from 'next-auth/react';
import { User, getUserFullName } from '@/lib/models/user';
import { getUsers, updateUser } from '@/lib/services/userService';
import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import Link from 'next/link';

export default function EnrollmentApprovalsPage() {
  const { data: session } = useSession();
  const [pendingEnrollments, setPendingEnrollments] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadPendingEnrollments();
  }, []);

  const loadPendingEnrollments = async () => {
    setIsLoading(true);
    try {
      const allUsers = await getUsers();
      // Get users who are pending approval OR who don't have a role yet (new users)
      const pending = allUsers.filter(
        (user) => user.role === 'PENDING_APPROVAL' || !user.role
      );
      setPendingEnrollments(pending);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

      // Remove from list
      setPendingEnrollments((prev) => prev.filter((u) => u.userId !== user.userId));
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

      // Remove from list
      setPendingEnrollments((prev) => prev.filter((u) => u.userId !== user.userId));
    } catch (error) {
      alert('Failed to reject enrollment. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter enrollments with deferred query
  const filteredEnrollments = pendingEnrollments.filter((enrollment) =>
    getUserFullName(enrollment).toLowerCase().includes(deferredQuery.toLowerCase()) ||
    enrollment.email.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEnrollments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, startIndex + pageSize);
  const isStale = searchQuery !== deferredQuery;

  // Convert enrollments to table format
  const tableData = paginatedEnrollments.map((enrollment) => {
    const hasSubmitted = enrollment.enrollmentStatus === 'pending';
    const submittedDate = enrollment.enrollmentSubmittedAt
      ? new Date(enrollment.enrollmentSubmittedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Not submitted';

    return {
      id: enrollment.userId,
      image: enrollment.photoURL || '',
      name: getUserFullName(enrollment),
      email: enrollment.email,
      level: enrollment.desiredCefrLevel || 'N/A',
      payment: enrollment.gcashAmount || 0,
      reference: enrollment.gcashReferenceNumber || 'N/A',
      submitted: submittedDate,
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
            value={pendingEnrollments.length}
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
            value={pendingEnrollments.length}
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
        {!isLoading && pendingEnrollments.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending enrollment requests at the moment.</p>
          </div>
        )}

        {/* Enrollments Table */}
        {!isLoading && pendingEnrollments.length > 0 && (
          <div className="bg-white border border-gray-200">
            {/* Title and Search */}
            <div className="m-3 sm:m-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
                  Pending Enrollments
                </h5>
                <button
                  onClick={loadPendingEnrollments}
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
                      <p className="font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                      {SlimTableRenderers.Status(
                        row.status === 'submitted' ? 'bg-yellow-500' : 'bg-blue-500',
                        row.statusText
                      )}
                    </div>
                  ),
                },
                {
                  key: 'level',
                  label: 'Desired Level',
                  align: 'center',
                  render: (value) => (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-piku-purple/10 text-piku-purple">
                      {value}
                    </span>
                  ),
                },
                {
                  key: 'payment',
                  label: 'Payment',
                  align: 'center',
                  render: (value, row) => (
                    <div className="text-center">
                      <p className="font-bold text-gray-900">₱{value.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 font-mono">{row.reference}</p>
                    </div>
                  ),
                },
                {
                  key: 'submitted',
                  label: 'Submitted',
                  align: 'center',
                  render: (value) => <p className="text-xs text-gray-500">{value}</p>,
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  align: 'center',
                  width: '180px',
                  render: (_, row) => (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(row.user);
                        }}
                        disabled={processingId === row.id || !row.user.desiredCefrLevel}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!row.user.desiredCefrLevel ? 'User must select CEFR level first' : 'Approve enrollment'}
                      >
                        {processingId === row.id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(row.user);
                        }}
                        disabled={processingId === row.id}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === row.id ? '...' : '✕ Reject'}
                      </button>
                    </div>
                  ),
                },
              ]}
              data={tableData}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalItems: filteredEnrollments.length,
                onPageChange: setCurrentPage,
              }}
              showViewAll={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
