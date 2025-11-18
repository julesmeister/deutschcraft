import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVerifyTransaction, useRejectTransaction } from './useTransactions';

export function useTransactionActions(userEmail: string | null | undefined) {
  const queryClient = useQueryClient();
  const verifyTransaction = useVerifyTransaction();
  const rejectTransaction = useRejectTransaction();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (
    transactionId: string,
    newStatus: 'pending' | 'verified' | 'rejected'
  ) => {
    if (!userEmail) return;

    setProcessingId(transactionId);
    try {
      if (newStatus === 'verified') {
        await verifyTransaction.mutateAsync({
          transactionId,
          verifiedBy: userEmail,
        });
      } else if (newStatus === 'rejected') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) {
          setProcessingId(null);
          return;
        }
        await rejectTransaction.mutateAsync({
          transactionId,
          rejectedBy: userEmail,
          reason,
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions', 'all'] });
    } catch (error) {
      alert('Failed to update transaction status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    handleStatusChange,
  };
}
