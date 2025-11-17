/**
 * React Query hooks for Transaction management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import {
  getUserTransactions,
  getPendingTransactions,
  createTransaction,
  verifyTransaction,
  rejectTransaction,
  updateTransaction,
  getTransactionsPaginated,
  getTransactionsCount,
  getAllTransactions,
} from '../services/transactionService';
import { Transaction } from '../models/transaction';

/**
 * Get transactions for a specific user
 */
export function useUserTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ['transactions', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getUserTransactions(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });
}

/**
 * Get all pending transactions
 */
export function usePendingTransactions() {
  return useQuery({
    queryKey: ['transactions', 'pending'],
    queryFn: getPendingTransactions,
    staleTime: 10000, // 10 seconds
    gcTime: 30000, // 30 seconds
  });
}

/**
 * Create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'updatedAt'>) => {
      return await createTransaction(transaction);
    },
    onSuccess: (_, variables) => {
      // Invalidate user transactions
      queryClient.invalidateQueries({ queryKey: ['transactions', 'user', variables.userId] });
      // Invalidate pending transactions
      queryClient.invalidateQueries({ queryKey: ['transactions', 'pending'] });
    },
  });
}

/**
 * Verify a transaction
 */
export function useVerifyTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      verifiedBy,
      notes
    }: {
      transactionId: string;
      verifiedBy: string;
      notes?: string;
    }) => {
      await verifyTransaction(transactionId, verifiedBy, notes);
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Reject a transaction
 */
export function useRejectTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      rejectedBy,
      reason
    }: {
      transactionId: string;
      rejectedBy: string;
      reason: string;
    }) => {
      await rejectTransaction(transactionId, rejectedBy, reason);
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Update transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      updates
    }: {
      transactionId: string;
      updates: Partial<Omit<Transaction, 'transactionId' | 'createdAt'>>;
    }) => {
      await updateTransaction(transactionId, updates);
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Get all transactions (non-paginated)
 * Use for viewing complete transaction history
 */
export function useAllTransactions() {
  return useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: getAllTransactions,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });
}

/**
 * Get transactions with server-side pagination
 * Optimized for large transaction datasets
 *
 * @param options - Pagination and filter options
 * @returns Hook with transactions, pagination state, and navigation functions
 */
export function useTransactionsPaginated(options: {
  pageSize?: number;
  statusFilter?: 'pending' | 'verified' | 'rejected' | 'all';
  userIdFilter?: string;
} = {}) {
  const { pageSize = 20, statusFilter = 'all', userIdFilter } = options;
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState<(QueryDocumentSnapshot | null)[]>([null]);

  // Fetch current page
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', 'paginated', page, statusFilter, userIdFilter, pageSize],
    queryFn: async () => {
      const lastDoc = lastDocs[page - 1] || null;
      return await getTransactionsPaginated({
        pageSize,
        lastDoc,
        statusFilter,
        userIdFilter,
      });
    },
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });

  // Fetch total count (cached separately)
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['transactions', 'count', statusFilter, userIdFilter],
    queryFn: async () => {
      return await getTransactionsCount({
        statusFilter,
        userIdFilter,
      });
    },
    staleTime: 60000, // 1 minute
    gcTime: 120000, // 2 minutes
  });

  const transactions = data?.transactions || [];
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToNextPage = () => {
    if (hasMore && data?.lastDoc) {
      setPage((prev) => prev + 1);
      setLastDocs((prev) => [...prev, data.lastDoc]);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Reset pagination if going to page 1
      if (newPage === 1) {
        setLastDocs([null]);
      }
      setPage(newPage);
    }
  };

  return {
    transactions,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    // Pagination
    page,
    pageSize,
    totalPages,
    totalCount,
    hasMore,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
}
