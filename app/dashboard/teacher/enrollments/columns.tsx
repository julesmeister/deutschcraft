import { SlimTableColumn } from '@/components/ui/SlimTable';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import { User, getUserFullName } from '@/lib/models/user';
import { CEFRLevel } from '@/lib/models/cefr';
import { useState } from 'react';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';

interface EnrollmentRow {
  id: string;
  image: string;
  name: string;
  email: string;
  level: string;
  payment: number;
  reference: string;
  submitted: string;
  signedUp: string;
  status: string;
  statusText: string;
  user: User;
}

interface ColumnsConfig {
  processingId: string | null;
  onUpdateLevel: (user: User, level: CEFRLevel) => void;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
}

export function getEnrollmentColumns(config: ColumnsConfig): SlimTableColumn[] {
  const { processingId, onUpdateLevel, onApprove, onReject } = config;

  return [
    {
      key: 'image',
      label: ' ',
      width: '60px',
      render: (value: string, row: EnrollmentRow) => {
        console.log('[Avatar Render]', {
          value,
          name: row.name,
          email: row.email,
          userPhotoURL: row.user?.photoURL,
        });

        // Use the actual photoURL from the user object if available
        const imageUrl = row.user?.photoURL || value || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`;

        return (
          <img
            alt={row.name}
            src={imageUrl}
            className="inline h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              console.error('[Avatar Error] Failed to load:', imageUrl);
              const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`;
              console.log('[Avatar] Using fallback:', fallback);
              e.currentTarget.src = fallback;
            }}
            onLoad={() => {
              console.log('[Avatar] Successfully loaded:', imageUrl);
            }}
          />
        );
      },
    },
    {
      key: 'name',
      label: 'Student',
      render: (value: string, row: EnrollmentRow) => (
        <div>
          <p className="font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                row.status === 'submitted' ? 'bg-yellow-500' : 'bg-green-400'
              }`}
            />
            <p className="text-xs text-gray-600">{row.statusText}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Desired Level',
      align: 'center',
      width: '140px',
      render: (value: string, row: EnrollmentRow) => {
        const currentLevel = row.user.desiredCefrLevel;
        const hasLevel = currentLevel && currentLevel !== 'N/A';

        return (
          <div className="flex justify-center">
            <CompactButtonDropdown
              label={currentLevel || 'Select'}
              usePortal={true}
              options={[
                { value: 'A1', label: 'A1 - Beginner' },
                { value: 'A2', label: 'A2 - Elementary' },
                { value: 'B1', label: 'B1 - Intermediate' },
                { value: 'B2', label: 'B2 - Upper Intermediate' },
                { value: 'C1', label: 'C1 - Advanced' },
                { value: 'C2', label: 'C2 - Mastery' },
              ]}
              value={currentLevel}
              onChange={(level) => {
                onUpdateLevel(row.user, level as CEFRLevel);
              }}
              buttonClassName={`text-xs px-2 py-1 ${
                hasLevel
                  ? 'bg-piku-purple/10 text-piku-purple hover:bg-piku-purple/20'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            />
          </div>
        );
      },
    },
    {
      key: 'payment',
      label: 'Payment',
      align: 'center',
      render: (value: number, row: EnrollmentRow) => {
        const [showDialog, setShowDialog] = useState(false);

        return (
          <>
            <div className="text-center">
              <p className="font-bold text-gray-900">₱{value.toFixed(2)}</p>
              {row.reference && (
                <p className="text-xs text-gray-500 font-mono">{row.reference}</p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDialog(true);
                }}
                className="mt-1 text-xs text-piku-purple hover:underline font-medium"
              >
                View Transactions
              </button>
            </div>

            {showDialog && (
              <TransactionDialog
                user={row.user}
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
              />
            )}
          </>
        );
      },
    },
    {
      key: 'signedUp',
      label: 'Signed Up',
      align: 'center',
      render: (value: string) => <p className="text-xs text-gray-500">{value}</p>,
    },
    {
      key: 'submitted',
      label: 'Submitted',
      align: 'center',
      render: (value: string) => <p className="text-xs text-gray-500">{value}</p>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: '140px',
      render: (_: any, row: EnrollmentRow) => {
        const isProcessing = processingId === row.id;
        const canApprove = row.user.desiredCefrLevel;

        return (
          <div className="flex justify-center">
            <CompactButtonDropdown
              label={isProcessing ? 'Processing...' : 'Actions'}
              disabled={isProcessing}
              usePortal={true}
              options={[
                {
                  value: 'approve',
                  label: canApprove ? 'Approve' : 'Approve (No Level)',
                },
                {
                  value: 'reject',
                  label: 'Reject',
                },
              ]}
              onChange={(value) => {
                if (value === 'approve') {
                  onApprove(row.user);
                } else if (value === 'reject') {
                  onReject(row.user);
                }
              }}
              buttonClassName="text-xs px-2 py-1"
            />
          </div>
        );
      },
    },
  ];
}
