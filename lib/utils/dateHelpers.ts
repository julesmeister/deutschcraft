/**
 * Date Helper Utilities
 * Centralized date formatting and manipulation functions
 */

/**
 * Format date as YYYY-MM-DD string
 */
export function formatDateISO(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/**
 * Get date N days ago as YYYY-MM-DD
 */
export function getDaysAgoISO(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateISO(date);
}

/**
 * Get array of dates for the last N days (including today)
 * Returns array with oldest date first, today last
 */
export function getLastNDays(n: number): Date[] {
  const dates: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}

/**
 * Get array of date strings (YYYY-MM-DD) for the last N days
 */
export function getLastNDaysISO(n: number): string[] {
  return getLastNDays(n).map(formatDateISO);
}

/**
 * Get short day name from date (Mon, Tue, etc.)
 */
export function getShortDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get day labels for the last N days
 */
export function getLastNDayLabels(n: number): string[] {
  return getLastNDays(n).map(getShortDayName);
}

/**
 * Format progress document ID (PROG_YYYYMMDD_email)
 */
export function formatProgressDocId(date: Date | string, userId: string): string {
  const dateStr = typeof date === 'string'
    ? date.replace(/-/g, '')
    : formatDateISO(date).replace(/-/g, '');
  return `PROG_${dateStr}_${userId}`;
}

/**
 * Parse progress document ID to get date
 * PROG_20240115_user@email.com -> 2024-01-15
 */
export function parseProgressDocId(docId: string): string | null {
  const match = docId.match(/PROG_(\d{8})/);
  if (!match) return null;

  const dateStr = match[1]; // YYYYMMDD
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * Get timestamp for N days ago
 */
export function getDaysAgoTimestamp(daysAgo: number): number {
  return Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? date1 : formatDateISO(date1);
  const d2 = typeof date2 === 'string' ? date2 : formatDateISO(date2);
  return d1 === d2;
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Format timestamp as relative time (e.g., "Just now", "5hrs ago", "2 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}hr${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
