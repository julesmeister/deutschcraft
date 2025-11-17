'use client';

import { useState } from 'react';
import { User } from '@/lib/models/user';
import { Transaction, getPaymentMethodDisplay, getTransactionStatusColor, getTransactionStatusText } from '@/lib/models/transaction';
import { useUserTransactions, useCreateTransaction, useVerifyTransaction, useRejectTransaction } from '@/lib/hooks/useTransactions';

interface TransactionDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onTransactionVerified?: () => void;
}

export function TransactionDialog({ user, isOpen, onClose, onTransactionVerified }: TransactionDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank_transfer' | 'cash' | 'other'>('gcash');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const { data: transactions = [], isLoading } = useUserTransactions(user.userId);
  const createTransaction = useCreateTransaction();
  const verifyTransaction = useVerifyTransaction();
  const rejectTransaction = useRejectTransaction();

  if (!isOpen) return null;

  const handleCreateTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await createTransaction.mutateAsync({
        userId: user.userId,
        userEmail: user.email,
        paymentMethod,
        amount: parseFloat(amount),
        referenceNumber: referenceNumber || undefined,
        status: 'pending',
        notes: notes || undefined,
      });

      // Reset form
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      setIsCreating(false);
      alert('Transaction created successfully!');
    } catch (error) {
      alert('Failed to create transaction');
    }
  };

  const handleVerify = async (transactionId: string) => {
    if (!confirm('Verify this transaction?')) return;

    try {
      await verifyTransaction.mutateAsync({
        transactionId,
        verifiedBy: 'current-teacher@example.com', // TODO: Get from session
      });
      alert('Transaction verified!');
      onTransactionVerified?.();
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
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Transactions</h2>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
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
        <div className="p-6 space-y-6">
          {/* Create Transaction Button */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 bg-piku-purple text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors"
            >
              + Add New Transaction
            </button>
          )}

          {/* Create Transaction Form */}
          {isCreating && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-4">
              <h3 className="font-bold text-gray-900">New Transaction</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple"
                >
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (Optional)</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Reference number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateTransaction}
                  disabled={createTransaction.isPending}
                  className="flex-1 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {createTransaction.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Transaction History</h3>

            {isLoading && (
              <p className="text-center text-gray-500 py-4">Loading transactions...</p>
            )}

            {!isLoading && transactions.length === 0 && (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            )}

            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.transactionId}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          ₱{transaction.amount.toFixed(2)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                          {getTransactionStatusText(transaction.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getPaymentMethodDisplay(transaction.paymentMethod)}
                        {transaction.referenceNumber && ` • ${transaction.referenceNumber}`}
                      </p>
                    </div>

                    {transaction.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(transaction.transactionId)}
                          className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleReject(transaction.transactionId)}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {transaction.notes && (
                    <p className="text-xs text-gray-500 mt-2">{transaction.notes}</p>
                  )}

                  {transaction.rejectionReason && (
                    <p className="text-xs text-red-600 mt-2">
                      <strong>Rejected:</strong> {transaction.rejectionReason}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
