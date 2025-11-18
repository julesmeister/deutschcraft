'use client';

import { User, getUserFullName } from '@/lib/models/user';
import { Transaction } from '@/lib/models/transaction';
import { SlimTable } from '@/components/ui/SlimTable';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { getTransactionColumns } from '@/app/dashboard/teacher/enrollments/transactionColumns';

interface TransactionsTableProps {
  transactions: Transaction[];
  allUsers: User[];
  isLoading: boolean;
  processingId: string | null;
  onStatusChange: (transactionId: string, status: 'pending' | 'verified' | 'rejected') => Promise<void>;
  onEdit: (transaction: Transaction) => void;
  onAddNew: () => void;
}

export function TransactionsTable({
  transactions,
  allUsers,
  isLoading,
  processingId,
  onStatusChange,
  onEdit,
  onAddNew,
}: TransactionsTableProps) {
  // Transform transactions for table
  const transactionsTableData = transactions.map((transaction) => {
    // Find the user for this transaction from ALL users
    const user = allUsers.find(u => u.email === transaction.userEmail);

    const userName = user ? getUserFullName(user) : transaction.userEmail;
    const userImage = user?.photoURL
      ? user.photoURL
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

    return {
      id: transaction.transactionId,
      userEmail: transaction.userEmail,
      userName: userName,
      userImage: userImage,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      reference: transaction.referenceNumber || '',
      notes: transaction.notes || '',
      date: new Date(transaction.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: transaction.status,
      user: user,
      transaction: transaction,
    };
  });

  return (
    <div className="bg-white border border-gray-200">
      {/* Title and Add Button */}
      <div className="m-3 sm:m-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h5 className="text-neutral-700 uppercase text-xs sm:text-sm font-medium leading-snug">
            All Transactions History
          </h5>
          <div className="w-full sm:w-56">
            <ActionButton
              variant="purple"
              icon={<ActionButtonIcons.Plus />}
              onClick={onAddNew}
            >
              Add Transaction
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-piku-purple/10 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-piku-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">Transaction history will appear here once students submit payments.</p>
        </div>
      )}

      {/* Transactions Table */}
      {!isLoading && transactions.length > 0 && (
        <SlimTable
          title=""
          columns={getTransactionColumns({
            onStatusChange,
            onEdit,
            processingId,
          })}
          data={transactionsTableData}
          showViewAll={false}
        />
      )}
    </div>
  );
}
