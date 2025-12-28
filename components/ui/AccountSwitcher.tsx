'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { SavedAccount, getOtherAccounts, removeAccount } from '@/lib/utils/accountHistory';
import { ActionButton, ActionButtonIcons } from './ActionButton';

interface AccountSwitcherProps {
  currentUserEmail: string | null | undefined;
  currentUserName?: string | null;
  currentUserImage?: string | null;
  dark?: boolean;
}

export function AccountSwitcher({
  currentUserEmail,
  currentUserName,
  currentUserImage,
  dark = false,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [otherAccounts, setOtherAccounts] = useState<SavedAccount[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load other accounts
    const accounts = getOtherAccounts(currentUserEmail);
    setOtherAccounts(accounts);
  }, [currentUserEmail]);

  // Handle mouse enter with slight delay
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(true);
    setIsOpen(true);
  };

  // Handle mouse leave with delay to allow moving to dropdown
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsOpen(false);
    }, 200);
  };

  // Cancel leave timeout when entering dropdown
  const handleDropdownEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(true);
  };

  const handleSwitchAccount = async (email: string) => {
    console.info('🔄 Switching to account:', email);
    setIsOpen(false);
    // Sign in with the selected account
    await signIn('google', {
      callbackUrl: '/dashboard',
      // Pre-fill email hint for Google
      email,
    });
  };

  const handleRemoveAccount = (email: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering switch account
    removeAccount(email);
    setOtherAccounts(getOtherAccounts(currentUserEmail));
  };

  const handleSignOut = async () => {
    console.info('👋 Signing out');
    await signOut({ callbackUrl: '/' });
  };

  // If no other accounts, just show the sign out button
  if (otherAccounts.length === 0) {
    return (
      <ActionButton
        onClick={handleSignOut}
        variant={dark ? 'gray' : 'purple'}
        icon={<ActionButtonIcons.Logout />}
      >
        Sign out
      </ActionButton>
    );
  }

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sign Out Button with Dropdown Indicator */}
      <ActionButton
        onClick={handleSignOut}
        variant={dark ? 'gray' : 'purple'}
        icon={<ActionButtonIcons.Logout />}
      >
        <span className="flex items-center gap-1">
          Sign out
          {otherAccounts.length > 0 && (
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </span>
      </ActionButton>

      {/* Dropdown Menu */}
      {isOpen && otherAccounts.length > 0 && (
        <div
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in-up"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Current Account Section */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {currentUserImage ? (
                <img
                  src={currentUserImage}
                  alt={currentUserName || ''}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-piku-purple-dark flex items-center justify-center text-white font-bold">
                  {(currentUserName || currentUserEmail || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUserName || 'Current User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUserEmail}
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Active
              </div>
            </div>
          </div>

          {/* Other Accounts Section */}
          <div className="py-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Switch Account
            </p>
            {otherAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => handleSwitchAccount(account.email)}
                className="w-full px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
              >
                {account.image ? (
                  <img
                    src={account.image}
                    alt={account.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-piku-purple to-pastel-ocean flex items-center justify-center text-white font-bold text-sm">
                    {account.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-piku-purple-dark transition-colors">
                    {account.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {account.email}
                  </p>
                </div>
                <button
                  onClick={(e) => handleRemoveAccount(account.email, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-full"
                  title="Remove account"
                >
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </button>
            ))}
          </div>

          {/* Add Account Option */}
          <div className="border-t border-gray-200">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full px-3 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Add another account
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
