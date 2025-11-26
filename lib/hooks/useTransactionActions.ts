import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVerifyTransaction, useRejectTransaction } from './useTransactions';
import { useToast } from '@/components/ui/toast';

export function useTransactionActions(userEmail: string | null | undefined) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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
        showToast({
          title: 'Transaction Verified',
          message: 'Transaction status has been updated to verified',
          variant: 'success',
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
        showToast({
          title: 'Transaction Rejected',
          message: 'Transaction has been rejected',
          variant: 'success',
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions', 'all'] });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update transaction status. Please try again.',
        variant: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    handleStatusChange,
  };
}
