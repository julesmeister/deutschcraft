'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogFooter, DialogButton } from '@/components/ui/Dialog';
import { useCreateTransaction, useUpdateTransaction } from '@/lib/hooks/useTransactions';
import { useAllNonTeachers } from '@/lib/hooks/useUsers';
import { useSession } from 'next-auth/react';
import { Select, SelectOption } from '@/components/ui/Select';
import { SettingsFormField } from '@/components/ui/settings/SettingsFormField';
import { getUserFullName } from '@/lib/models/user';
import { Transaction } from '@/lib/models/transaction';

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction; // If provided, dialog is in edit mode
}

export function AddTransactionDialog({ isOpen, onClose, transaction }: AddTransactionDialogProps) {
  const { data: session } = useSession();
  const isEditMode = !!transaction;

  const [studentEmail, setStudentEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank_transfer' | 'cash' | 'other'>('gcash');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { users: allNonTeachers = [] } = useAllNonTeachers();

  // Populate form when editing
  useEffect(() => {
    if (transaction && isOpen) {
      setStudentEmail(transaction.userEmail);
      setPaymentMethod(transaction.paymentMethod);
      setAmount(transaction.amount.toString());
      setReferenceNumber(transaction.referenceNumber || '');
      setNotes(transaction.notes || '');
    } else if (!isOpen) {
      // Reset form when dialog closes
      setStudentEmail('');
      setPaymentMethod('gcash');
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      setError('');
    }
  }, [transaction, isOpen]);

  // Convert users to select options (already sorted and limited by the query)
  const studentOptions: SelectOption[] = useMemo(() => {
    return allNonTeachers.map((user) => ({
      value: user.email,
      label: `${getUserFullName(user)} (${user.email})`,
    }));
  }, [allNonTeachers]);

  // Payment method options
  const paymentMethodOptions: SelectOption[] = [
    { value: 'gcash', label: 'GCash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = useCallback(async () => {
    setError('');

    // Validation
    if (!studentEmail.trim()) {
      setError('Please select a student');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    try {
      if (isEditMode && transaction) {
        // Update existing transaction
        await updateTransaction.mutateAsync({
          transactionId: transaction.transactionId,
          updates: {
            paymentMethod,
            amount: parsedAmount,
            referenceNumber: referenceNumber.trim() || undefined,
            notes: notes.trim() || undefined,
          },
        });
      } else {
        // Create new transaction
        await createTransaction.mutateAsync({
          userId: studentEmail,
          userEmail: studentEmail,
          paymentMethod,
          amount: parsedAmount,
          referenceNumber: referenceNumber.trim() || undefined,
          status: 'pending',
          notes: notes.trim() || undefined,
        });
      }

      onClose();
    } catch (err) {
      setError(isEditMode ? 'Failed to update transaction. Please try again.' : 'Failed to create transaction. Please try again.');
    }
  }, [studentEmail, amount, paymentMethod, referenceNumber, notes, isEditMode, transaction, createTransaction, updateTransaction, onClose]);

  const handleClose = useCallback(() => {
    setError('');
    onClose();
  }, [onClose]);

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Transaction' : 'Add Custom Transaction'}
      size="lg"
      footer={
        <DialogFooter>
          <DialogButton variant="secondary" onClick={handleClose} disabled={isPending}>
            Cancel
          </DialogButton>
          <DialogButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Transaction' : 'Create Transaction')}
          </DialogButton>
        </DialogFooter>
      }
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Student Selection - disabled in edit mode */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">
            Student <span className="text-red-500">*</span>
          </label>
          <Select
            value={studentEmail}
            onChange={(value) => setStudentEmail(value)}
            options={studentOptions}
            placeholder="Select a student"
            disabled={isEditMode}
          />
          <p className="mt-2 text-xs text-gray-500">
            {isEditMode ? 'Student cannot be changed when editing' : 'Select the student for this transaction'}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <Select
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value as any)}
            options={paymentMethodOptions}
            placeholder="Select payment method"
          />
        </div>

        {/* Amount */}
        <SettingsFormField
          label="Amount (₱)"
          type="number"
          value={amount}
          placeholder="0.00"
          onChange={(value) => setAmount(value)}
          required
        />

        {/* Reference Number */}
        <SettingsFormField
          label="Reference Number (Optional)"
          type="text"
          value={referenceNumber}
          placeholder="Enter reference number"
          onChange={(value) => setReferenceNumber(value)}
        />

        {/* Notes */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
            className="w-full px-3 py-3 bg-gray-100 border border-gray-100 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>
      </div>
    </Dialog>
  );
}
