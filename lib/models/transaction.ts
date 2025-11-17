/**
 * Transaction Model
 * Path: transactions/{transactionId}
 *
 * Tracks payment transactions for student enrollments
 */

export interface Transaction {
  // Primary Key
  transactionId: string;

  // User Reference
  userId: string; // Student email
  userEmail: string; // Student email (duplicate for easier queries)

  // Payment Details
  paymentMethod: 'gcash' | 'bank_transfer' | 'cash' | 'other';
  amount: number;
  referenceNumber?: string;

  // Status
  status: 'pending' | 'verified' | 'rejected';

  // Verification
  verifiedBy?: string; // Teacher email
  verifiedAt?: number;
  rejectionReason?: string;

  // Metadata
  notes?: string;
  screenshotUrl?: string; // URL to payment screenshot

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

export type TransactionStatus = Transaction['status'];
export type PaymentMethod = Transaction['paymentMethod'];

/**
 * Get display name for payment method
 */
export function getPaymentMethodDisplay(method: PaymentMethod): string {
  const displays: Record<PaymentMethod, string> = {
    gcash: 'GCash',
    bank_transfer: 'Bank Transfer',
    cash: 'Cash',
    other: 'Other',
  };
  return displays[method];
}

/**
 * Get status badge color
 */
export function getTransactionStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

/**
 * Get status display text
 */
export function getTransactionStatusText(status: TransactionStatus): string {
  const texts: Record<TransactionStatus, string> = {
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected',
  };
  return texts[status];
}
