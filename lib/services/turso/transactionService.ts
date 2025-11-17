/**
 * Transaction Service - Turso Implementation
 * Handles all payment transaction operations using Turso DB
 *
 * This is the Turso-compatible version of transactionService.
 * All transaction-related database operations use LibSQL/SQLite syntax.
 */

import { db } from '@/turso/client';
import { Transaction } from '@/lib/models/transaction';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to Transaction object
 * Handles snake_case to camelCase conversion
 */
function rowToTransaction(row: any): Transaction {
  return {
    transactionId: row.transaction_id as string,
    userId: row.user_id as string,
    userEmail: row.user_email as string,
    paymentMethod: row.payment_method as 'gcash' | 'bank_transfer' | 'cash' | 'other',
    amount: row.amount as number,
    referenceNumber: row.reference_number as string | undefined,
    status: row.status as 'pending' | 'verified' | 'rejected',
    notes: row.notes as string | undefined,
    verifiedBy: row.verified_by as string | undefined,
    verifiedAt: row.verified_at as number | undefined,
    rejectionReason: row.rejection_reason as string | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new transaction
 */
export async function createTransaction(
  transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const transactionId = `TXN_${Date.now()}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO transactions (
        transaction_id, user_id, user_email, payment_method, amount,
        reference_number, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        transactionId,
        transaction.userId,
        transaction.userEmail,
        transaction.paymentMethod,
        transaction.amount,
        transaction.referenceNumber || null,
        transaction.status,
        transaction.notes || null,
        now,
        now,
      ],
    });

    return transactionId;
  } catch (error) {
    console.error('[transactionService:turso] Error creating transaction:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1',
      args: [transactionId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToTransaction(result.rows[0]);
  } catch (error) {
    console.error('[transactionService:turso] Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM transactions
            WHERE user_id = ?
            ORDER BY created_at DESC`,
      args: [userId],
    });

    return result.rows.map(rowToTransaction);
  } catch (error) {
    console.error('[transactionService:turso] Error fetching user transactions:', error);
    throw error;
  }
}

/**
 * Get all pending transactions
 */
export async function getPendingTransactions(): Promise<Transaction[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM transactions
            WHERE status = 'pending'
            ORDER BY created_at DESC`,
    });

    return result.rows.map(rowToTransaction);
  } catch (error) {
    console.error('[transactionService:turso] Error fetching pending transactions:', error);
    throw error;
  }
}

/**
 * Get all transactions (for backwards compatibility)
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM transactions ORDER BY created_at DESC',
    });

    return result.rows.map(rowToTransaction);
  } catch (error) {
    console.error('[transactionService:turso] Error fetching all transactions:', error);
    throw error;
  }
}

/**
 * Get transactions with pagination
 * Optimized for large datasets
 */
export async function getTransactionsPaginated(options: {
  pageSize?: number;
  offset?: number;
  statusFilter?: 'pending' | 'verified' | 'rejected' | 'all';
  userIdFilter?: string;
}): Promise<{
  transactions: Transaction[];
  hasMore: boolean;
  total: number;
}> {
  const { pageSize = 20, offset = 0, statusFilter = 'all', userIdFilter } = options;

  try {
    // Build WHERE clause
    const whereConditions: string[] = [];
    const args: any[] = [];

    if (statusFilter !== 'all') {
      whereConditions.push('status = ?');
      args.push(statusFilter);
    }

    if (userIdFilter) {
      whereConditions.push('user_id = ?');
      args.push(userIdFilter);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM transactions ${whereClause}`,
      args,
    });
    const total = Number(countResult.rows[0].count);

    // Get paginated results
    const result = await db.execute({
      sql: `SELECT * FROM transactions
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
      args: [...args, pageSize + 1, offset], // Fetch one extra to check if there's more
    });

    const hasMore = result.rows.length > pageSize;
    const transactions = result.rows
      .slice(0, pageSize)
      .map(rowToTransaction);

    return {
      transactions,
      hasMore,
      total,
    };
  } catch (error) {
    console.error('[transactionService:turso] Error fetching paginated transactions:', error);
    throw error;
  }
}

/**
 * Get total count of transactions
 */
export async function getTransactionsCount(options: {
  statusFilter?: 'pending' | 'verified' | 'rejected' | 'all';
  userIdFilter?: string;
}): Promise<number> {
  const { statusFilter = 'all', userIdFilter } = options;

  try {
    const whereConditions: string[] = [];
    const args: any[] = [];

    if (statusFilter !== 'all') {
      whereConditions.push('status = ?');
      args.push(statusFilter);
    }

    if (userIdFilter) {
      whereConditions.push('user_id = ?');
      args.push(userIdFilter);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const result = await db.execute({
      sql: `SELECT COUNT(*) as count FROM transactions ${whereClause}`,
      args,
    });

    return Number(result.rows[0].count);
  } catch (error) {
    console.error('[transactionService:turso] Error counting transactions:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update transaction details
 */
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'transactionId' | 'createdAt'>>
): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    // Build SET clause dynamically
    if (updates.paymentMethod !== undefined) {
      setClauses.push('payment_method = ?');
      args.push(updates.paymentMethod);
    }
    if (updates.amount !== undefined) {
      setClauses.push('amount = ?');
      args.push(updates.amount);
    }
    if (updates.referenceNumber !== undefined) {
      setClauses.push('reference_number = ?');
      args.push(updates.referenceNumber);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      args.push(updates.status);
    }
    if (updates.notes !== undefined) {
      setClauses.push('notes = ?');
      args.push(updates.notes);
    }
    if (updates.verifiedBy !== undefined) {
      setClauses.push('verified_by = ?');
      args.push(updates.verifiedBy);
    }
    if (updates.verifiedAt !== undefined) {
      setClauses.push('verified_at = ?');
      args.push(updates.verifiedAt);
    }
    if (updates.rejectionReason !== undefined) {
      setClauses.push('rejection_reason = ?');
      args.push(updates.rejectionReason);
    }

    // Always update updated_at
    setClauses.push('updated_at = ?');
    args.push(Date.now());

    // Add transaction ID as last argument
    args.push(transactionId);

    await db.execute({
      sql: `UPDATE transactions SET ${setClauses.join(', ')} WHERE transaction_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[transactionService:turso] Error updating transaction:', error);
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
    await db.execute({
      sql: `UPDATE transactions
            SET status = 'verified',
                verified_by = ?,
                verified_at = ?,
                notes = ?,
                updated_at = ?
            WHERE transaction_id = ?`,
      args: [verifiedBy, Date.now(), notes || null, Date.now(), transactionId],
    });
  } catch (error) {
    console.error('[transactionService:turso] Error verifying transaction:', error);
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
    await db.execute({
      sql: `UPDATE transactions
            SET status = 'rejected',
                verified_by = ?,
                verified_at = ?,
                rejection_reason = ?,
                updated_at = ?
            WHERE transaction_id = ?`,
      args: [rejectedBy, Date.now(), reason, Date.now(), transactionId],
    });
  } catch (error) {
    console.error('[transactionService:turso] Error rejecting transaction:', error);
    throw error;
  }
}
