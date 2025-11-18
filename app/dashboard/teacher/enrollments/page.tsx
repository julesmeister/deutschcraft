'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePendingEnrollmentsPaginated, useAllUsers } from '@/lib/hooks/useUsers';
import { useAllTransactions } from '@/lib/hooks/useTransactions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TabBar } from '@/components/ui/TabBar';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { EnrollmentTable } from '@/components/enrollments/EnrollmentTable';
import { TransactionsTable } from '@/components/enrollments/TransactionsTable';
import { useEnrollmentActions } from '@/lib/hooks/useEnrollmentActions';
import { useTransactionActions } from '@/lib/hooks/useTransactionActions';
import { Transaction } from '@/lib/models/transaction';

export default function EnrollmentApprovalsPage() {
  const { data: session } = useSession();
  const [showTransactions, setShowTransactions] = useState(false);
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  // Fetch data
  const { data: allTransactions = [], isLoading: transactionsLoading } = useAllTransactions();
  const { users: allUsers = [], isLoading: usersLoading } = useAllUsers();

  const {
    users: pendingEnrollments,
    isLoading: enrollmentsLoading,
    page: currentPage,
    totalPages,
    pageSize,
    totalCount,
    goToPage,
    refetch,
  } = usePendingEnrollmentsPaginated({
    pageSize: 10,
  });

  // Actions hooks
  const enrollmentActions = useEnrollmentActions(session?.user?.email);
  const transactionActions = useTransactionActions(session?.user?.email);

  // Calculate stats
  const submittedCount = pendingEnrollments.filter((e) => e.enrollmentStatus === 'pending').length;
  const newUsersCount = pendingEnrollments.filter((e) => !e.enrollmentStatus).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Enrollment Approvals 📋"
        subtitle="Review and approve student enrollment requests"
        backButton={{
          label: 'Back to Dashboard',
          href: '/dashboard/teacher'
        }}
        actions={
          <div className="w-48">
            <ActionButton
              variant={showTransactions ? 'purple' : 'gold'}
              icon={showTransactions ? <ActionButtonIcons.User /> : <ActionButtonIcons.Money />}
              onClick={() => setShowTransactions(!showTransactions)}
            >
              {showTransactions ? 'Show Enrollments' : `Transactions ${allTransactions.length > 0 ? `(${allTransactions.length})` : ''}`}
            </ActionButton>
          </div>
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <TabBar
            variant="stats"
            tabs={[
              {
                id: 'total',
                label: 'Total Pending',
                value: totalCount,
                icon: undefined,
              },
              {
                id: 'submitted',
                label: 'Form Submitted',
                value: submittedCount,
                icon: undefined,
              },
              {
                id: 'new',
                label: 'Just Signed Up',
                value: newUsersCount,
                icon: undefined,
              },
              {
                id: 'awaiting',
                label: 'Awaiting Review',
                value: totalCount,
                icon: undefined,
              },
            ]}
          />
        </div>

        {/* Enrollments Table */}
        {!showTransactions && (
          <EnrollmentTable
            enrollments={pendingEnrollments}
            isLoading={enrollmentsLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            processingId={enrollmentActions.processingId}
            onUpdateLevel={enrollmentActions.handleUpdateLevel}
            onApprove={enrollmentActions.handleApprove}
            onReject={enrollmentActions.handleReject}
            onRefetch={refetch}
            onPageChange={goToPage}
          />
        )}

        {/* Transactions Table */}
        {showTransactions && (
          <TransactionsTable
            transactions={allTransactions}
            allUsers={allUsers}
            isLoading={transactionsLoading}
            processingId={transactionActions.processingId}
            onStatusChange={transactionActions.handleStatusChange}
            onEdit={(transaction) => {
              setEditingTransaction(transaction);
              setShowAddTransactionDialog(true);
            }}
            onAddNew={() => {
              setEditingTransaction(undefined);
              setShowAddTransactionDialog(true);
            }}
          />
        )}
      </div>

      {/* Add/Edit Transaction Dialog */}
      <AddTransactionDialog
        isOpen={showAddTransactionDialog}
        onClose={() => {
          setShowAddTransactionDialog(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
      />
    </div>
  );
}
