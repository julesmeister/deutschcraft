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
    
    // Sign out first to clear the current session
    await signOut({ redirect: false });
    
    // Sign in with the selected account
    // We use the login_hint parameter to prompt Google to select the specific email
    await signIn('google', {
      callbackUrl: '/dashboard',
      login_hint: email,
      prompt: 'select_account',
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

  // If no other accounts, show the sign out button with dropdown capability for "Add account"
  // We want the dropdown to be available even if there are no other accounts, so users can "Add another account"
  // But currently the logic above (lines 81-91) returns early if no other accounts.
  // We should remove that early return if we want "Add another account" to be always available.
  
  // However, the user specifically asked about "no dropdown is showing". 
  // If there are NO other accounts, the component currently returns early (lines 81-91).
  // This means the hover logic (lines 94+) is never reached.
  // To fix this and allow adding accounts even when none are saved, we should remove the early return
  // and handle the empty state in the dropdown.

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
        variant={dark ? 'white' : 'purple'}
        icon={<ActionButtonIcons.Logout />}
      >
        <span className="flex items-center gap-1">
          Sign out
          {/* Always show indicator if we want dropdown to be accessible for adding accounts */}
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
        </span>
      </ActionButton>

      {/* Dropdown Menu */}
      {isOpen && (
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
          {otherAccounts.length > 0 && (
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
                  <div
                    role="button"
                    onClick={(e) => handleRemoveAccount(account.email, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-full cursor-pointer"
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
                  </div>
                </button>
              ))}
            </div>
          )}

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
