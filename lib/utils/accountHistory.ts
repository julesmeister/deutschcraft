/**
 * Account History Management
 *
 * Manages the list of previously logged-in accounts for quick account switching.
 * Similar to Google's account switcher functionality.
 */

import { getStorageKey } from '@/lib/brand-config';

export interface SavedAccount {
  email: string;
  name: string;
  image?: string;
  lastUsed: number; // timestamp
}

const STORAGE_KEY = getStorageKey('account_history');
const MAX_ACCOUNTS = 5; // Maximum number of accounts to remember

/**
 * Get all saved accounts, sorted by last used (most recent first)
 */
export function getSavedAccounts(): SavedAccount[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const accounts: SavedAccount[] = JSON.parse(stored);
    return accounts.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Error reading account history:', error);
    return [];
  }
}

/**
 * Save or update an account in history
 */
export function saveAccount(email: string, name: string, image?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const accounts = getSavedAccounts();

    // Remove existing account with same email
    const filtered = accounts.filter(acc => acc.email !== email);

    // Add new/updated account at the beginning
    const newAccount: SavedAccount = {
      email,
      name,
      image,
      lastUsed: Date.now(),
    };

    // Keep only the most recent MAX_ACCOUNTS
    const updated = [newAccount, ...filtered].slice(0, MAX_ACCOUNTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving account to history:', error);
  }
}

/**
 * Remove an account from history
 */
export function removeAccount(email: string): void {
  if (typeof window === 'undefined') return;

  try {
    const accounts = getSavedAccounts();
    const filtered = accounts.filter(acc => acc.email !== email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing account from history:', error);
  }
}

/**
 * Clear all saved accounts
 */
export function clearAccountHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing account history:', error);
  }
}

/**
 * Get accounts excluding the currently signed-in account
 */
export function getOtherAccounts(currentEmail: string | null | undefined): SavedAccount[] {
  if (!currentEmail) return getSavedAccounts();
  return getSavedAccounts().filter(acc => acc.email !== currentEmail);
}
