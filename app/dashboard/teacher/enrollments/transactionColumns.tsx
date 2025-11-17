import { SlimTableColumn } from '@/components/ui/SlimTable';
import { Transaction, getPaymentMethodDisplay } from '@/lib/models/transaction';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';

interface TransactionRow {
  id: string;
  userEmail: string;
  userName: string;
  userImage: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes: string;
  date: string;
  status: string;
  user: any; // Full user object for accessing photoURL
  transaction: Transaction;
}

interface ColumnsConfig {
  onStatusChange: (transactionId: string, newStatus: 'pending' | 'verified' | 'rejected') => void;
  onEdit: (transaction: Transaction) => void;
  processingId: string | null;
}

export function getTransactionColumns(config: ColumnsConfig): SlimTableColumn[] {
  const { onStatusChange, onEdit, processingId } = config;
  return [
    {
      key: 'userImage',
      label: ' ',
      width: '60px',
      render: (value: string, row: TransactionRow) => {
        console.log('[Transaction Avatar Render]', {
          value,
          userName: row.userName,
          userEmail: row.userEmail,
          userPhotoURL: row.user?.photoURL,
          user: row.user,
        });

        // Use the actual photoURL from the user object if available
        const imageUrl = row.user?.photoURL || value || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.userName)}&background=random`;

        return (
          <img
            alt={row.userName}
            src={imageUrl}
            className="inline h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              console.error('[Transaction Avatar Error] Failed to load:', imageUrl);
              const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.userName)}&background=random`;
              console.log('[Transaction Avatar] Using fallback:', fallback);
              e.currentTarget.src = fallback;
            }}
            onLoad={() => {
              console.log('[Transaction Avatar] Successfully loaded:', imageUrl);
            }}
          />
        );
      },
    },
    {
      key: 'userName',
      label: 'Student',
      render: (value: string, row: TransactionRow) => (
        <div>
          <p className="font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.userEmail}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'center',
      render: (value: number) => (
        <p className="text-gray-900">₱{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      align: 'center',
      render: (value: string) => (
        <p className="font-medium text-gray-900">{getPaymentMethodDisplay(value as any)}</p>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      align: 'center',
      render: (value: string) => (
        value ? (
          <p className="font-mono text-sm text-gray-700">{value}</p>
        ) : (
          <p className="text-xs text-gray-400">—</p>
        )
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: string) => (
        value ? (
          <p className="text-sm text-gray-700 max-w-xs truncate">{value}</p>
        ) : (
          <p className="text-xs text-gray-400">—</p>
        )
      ),
    },
    {
      key: 'date',
      label: 'Date',
      align: 'center',
      render: (value: string) => {
        // Split date/time - format is "Nov 17, 2025, 10:00 PM"
        const lastCommaIndex = value.lastIndexOf(', ');
        if (lastCommaIndex !== -1) {
          const date = value.substring(0, lastCommaIndex); // "Nov 17, 2025"
          const time = value.substring(lastCommaIndex + 2); // "10:00 PM"
          return (
            <div className="text-xs text-gray-500">
              <p className="font-medium">{date}</p>
              <p className="text-gray-400">{time}</p>
            </div>
          );
        }
        return <p className="text-xs text-gray-500">{value}</p>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      width: '140px',
      render: (value: string, row: TransactionRow) => {
        const isProcessing = processingId === row.id;

        // Status color mapping
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'verified':
              return 'bg-green-500/10 text-green-700 hover:bg-green-500/20';
            case 'rejected':
              return 'bg-red-500/10 text-red-700 hover:bg-red-500/20';
            default:
              return 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20';
          }
        };

        return (
          <div className="flex justify-center">
            <CompactButtonDropdown
              label={isProcessing ? 'Processing...' : value.toUpperCase()}
              disabled={isProcessing}
              usePortal={true}
              options={[
                {
                  value: 'edit',
                  label: '✏️ Edit',
                },
                {
                  value: 'pending',
                  label: '⏳ Pending',
                },
                {
                  value: 'verified',
                  label: '✓ Verified',
                },
                {
                  value: 'rejected',
                  label: '✕ Rejected',
                },
              ]}
              onChange={(newValue) => {
                if (newValue === 'edit') {
                  onEdit(row.transaction);
                } else {
                  onStatusChange(row.transaction.transactionId, newValue as any);
                }
              }}
              buttonClassName={`text-xs px-2 py-1 ${getStatusColor(value)}`}
            />
          </div>
        );
      },
    },
  ];
}
