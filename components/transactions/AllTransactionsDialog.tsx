'use client';

import { Transaction, getPaymentMethodDisplay, getTransactionStatusColor, getTransactionStatusText } from '@/lib/models/transaction';
import { usePendingTransactions, useVerifyTransaction, useRejectTransaction } from '@/lib/hooks/useTransactions';

interface AllTransactionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllTransactionsDialog({ isOpen, onClose }: AllTransactionsDialogProps) {
  const { data: transactions = [], isLoading } = usePendingTransactions();
  const verifyTransaction = useVerifyTransaction();
  const rejectTransaction = useRejectTransaction();

  if (!isOpen) return null;

  const handleVerify = async (transactionId: string) => {
    if (!confirm('Verify this transaction?')) return;

    try {
      await verifyTransaction.mutateAsync({
        transactionId,
        verifiedBy: 'current-teacher@example.com', // TODO: Get from session
      });
      alert('Transaction verified!');
    } catch (error) {
      alert('Failed to verify transaction');
    }
  };

  const handleReject = async (transactionId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await rejectTransaction.mutateAsync({
        transactionId,
        rejectedBy: 'current-teacher@example.com', // TODO: Get from session
        reason,
      });
      alert('Transaction rejected');
    } catch (error) {
      alert('Failed to reject transaction');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 p-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Pending Transactions</h2>
              <p className="text-sm text-gray-600 mt-1">{transactions.length} pending payment(s)</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <p className="text-center text-gray-500 py-8">Loading transactions...</p>
          )}

          {!isLoading && transactions.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending transactions to review</p>
            </div>
          )}

          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.transactionId}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Student Info */}
                    <div className="mb-3">
                      <p className="font-bold text-gray-900 text-lg">{transaction.userEmail}</p>
                      <p className="text-sm text-gray-500">Student</p>
                    </div>

                    {/* Payment Details */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <p className="font-bold text-xl text-gray-900">₱{transaction.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-900">{getPaymentMethodDisplay(transaction.paymentMethod)}</p>
                      </div>
                    </div>

                    {transaction.referenceNumber && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                        <p className="font-mono text-sm text-gray-700">{transaction.referenceNumber}</p>
                      </div>
                    )}

                    {transaction.notes && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{transaction.notes}</p>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-400">
                      Submitted {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleVerify(transaction.transactionId)}
                      disabled={verifyTransaction.isPending}
                      className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleReject(transaction.transactionId)}
                      disabled={rejectTransaction.isPending}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
