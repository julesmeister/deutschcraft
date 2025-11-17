/**
 * Transaction Service
 * Handles all payment transaction operations
 */

import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Transaction } from '../models/transaction';

const TRANSACTIONS_COLLECTION = 'transactions';

/**
 * Create a new transaction
 * Note: Removes undefined fields to avoid Firestore errors
 */
export async function createTransaction(transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const transactionId = `TXN_${Date.now()}`;
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

    const newTransaction: Transaction = {
      ...transaction,
      transactionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Remove undefined fields (Firestore doesn't accept undefined values)
    const cleanTransaction = Object.fromEntries(
      Object.entries(newTransaction).filter(([_, value]) => value !== undefined)
    ) as Transaction;

    await setDoc(transactionRef, cleanTransaction);
    return transactionId;
  } catch (error) {
    console.error('[createTransaction] Error:', error);
    throw error;
  }
}

/**
 * Get transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  try {
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      return null;
    }

    return transactionDoc.data() as Transaction;
  } catch (error) {
    console.error('[getTransaction] Error:', error);
    throw error;
  }
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Transaction);
  } catch (error) {
    console.error('[getUserTransactions] Error:', error);
    throw error;
  }
}

/**
 * Get all pending transactions
 */
export async function getPendingTransactions(): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
    const q = query(
      transactionsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Transaction);
  } catch (error) {
    console.error('[getPendingTransactions] Error:', error);
    throw error;
  }
}

/**
 * Verify a transaction
 */
export async function verifyTransaction(
  transactionId: string,
  verifiedBy: string,
  notes?: string
): Promise<void> {
  try {
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(transactionRef, {
      status: 'verified',
      verifiedBy,
      verifiedAt: Date.now(),
      notes: notes || '',
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[verifyTransaction] Error:', error);
    throw error;
  }
}

/**
 * Reject a transaction
 */
export async function rejectTransaction(
  transactionId: string,
  rejectedBy: string,
  reason: string
): Promise<void> {
  try {
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(transactionRef, {
      status: 'rejected',
      verifiedBy: rejectedBy,
      verifiedAt: Date.now(),
      rejectionReason: reason,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[rejectTransaction] Error:', error);
    throw error;
  }
}

/**
 * Update transaction details
 */
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'transactionId' | 'createdAt'>>
): Promise<void> {
  try {
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[updateTransaction] Error:', error);
    throw error;
  }
}

/**
 * Get transactions with pagination
 * Optimized for large datasets
 */
export async function getTransactionsPaginated(options: {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot | null;
  statusFilter?: 'pending' | 'verified' | 'rejected' | 'all';
  userIdFilter?: string;
}): Promise<{
  transactions: Transaction[];
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot | null;
}> {
  const { pageSize = 20, lastDoc = null, statusFilter = 'all', userIdFilter } = options;

  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);

    // Build query constraints
    const constraints = [];

    // Add status filter if not 'all'
    if (statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }

    // Add user filter if provided
    if (userIdFilter) {
      constraints.push(where('userId', '==', userIdFilter));
    }

    // Always order by createdAt descending (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Add pagination
    constraints.push(limit(pageSize + 1)); // Fetch one extra to check if there's more

    // Add cursor if provided
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(transactionsRef, ...constraints);
    const snapshot = await getDocs(q);

    const hasMore = snapshot.docs.length > pageSize;
    const transactions = snapshot.docs
      .slice(0, pageSize)
      .map(doc => doc.data() as Transaction);

    const newLastDoc = hasMore ? snapshot.docs[pageSize - 1] : null;

    return {
      transactions,
      hasMore,
      lastDoc: newLastDoc,
    };
  } catch (error) {
    console.error('[getTransactionsPaginated] Error:', error);
    throw error;
  }
}

/**
 * Get total count of transactions
 * Optimized count query that doesn't fetch documents
 */
export async function getTransactionsCount(options: {
  statusFilter?: 'pending' | 'verified' | 'rejected' | 'all';
  userIdFilter?: string;
}): Promise<number> {
  const { statusFilter = 'all', userIdFilter } = options;

  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);

    // Build query constraints
    const constraints = [];

    if (statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }

    if (userIdFilter) {
      constraints.push(where('userId', '==', userIdFilter));
    }

    const q = query(transactionsRef, ...constraints);
    const snapshot = await getCountFromServer(q);

    return snapshot.data().count;
  } catch (error) {
    console.error('[getTransactionsCount] Error:', error);
    throw error;
  }
}

/**
 * Get all transactions (for backwards compatibility)
 * NOTE: Use getTransactionsPaginated for better performance
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
    const q = query(
      transactionsRef,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Transaction);
  } catch (error) {
    console.error('[getAllTransactions] Error:', error);
    throw error;
  }
}
