/**
 * User Service - Server-side (Firebase Admin SDK)
 * For use in API routes and NextAuth callbacks
 */

import { adminDb } from '../firebaseAdmin';
import { User } from '../models';
import fs from 'fs';
import path from 'path';

// In-memory cache for getUserAdmin to prevent quota exhaustion
interface CacheEntry {
  user: User | null;
  timestamp: number;
}

const userCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30000; // 30 seconds cache
const PERSISTENT_CACHE_FILE = path.join(process.cwd(), '.cache', 'users.json');

// Load persistent cache on startup
function loadPersistentCache(): void {
  try {
    if (fs.existsSync(PERSISTENT_CACHE_FILE)) {
      const data = fs.readFileSync(PERSISTENT_CACHE_FILE, 'utf-8');
      const cache = JSON.parse(data);
      Object.entries(cache).forEach(([email, entry]) => {
        userCache.set(email, entry as CacheEntry);
      });
      console.log('[getUserAdmin] Loaded persistent cache with', userCache.size, 'entries');
    }
  } catch (error) {
    console.warn('[getUserAdmin] Failed to load persistent cache:', error);
  }
}

// Save cache to disk
function savePersistentCache(): void {
  try {
    const cacheDir = path.dirname(PERSISTENT_CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const cache: Record<string, CacheEntry> = {};
    userCache.forEach((value, key) => {
      cache[key] = value;
    });
    fs.writeFileSync(PERSISTENT_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn('[getUserAdmin] Failed to save persistent cache:', error);
  }
}

// Initialize on module load
loadPersistentCache();

/**
 * Get a single user by email (server-side) with caching
 * @param email - User's email (document ID)
 * @param bypassCache - Force fresh fetch from database (default: false)
 * @returns User object or null if not found
 */
export async function getUserAdmin(email: string, bypassCache: boolean = false): Promise<User | null> {
  // Check cache first (unless bypass is requested)
  if (!bypassCache) {
    const cached = userCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[getUserAdmin] Returning cached data for:', email);
      return cached.user;
    }
  }

  try {
    console.log('[getUserAdmin] Fetching from Firestore for:', email);
    const userDoc = await adminDb.collection('users').doc(email).get();

    const user = userDoc.exists
      ? ({ userId: userDoc.id, ...userDoc.data() } as User)
      : null;

    // Update cache
    userCache.set(email, {
      user,
      timestamp: Date.now(),
    });

    // Save to persistent cache for resilience across restarts
    savePersistentCache();

    return user;
  } catch (error) {
    // If quota exhausted, try to return cached data even if stale
    if ((error as any)?.code === 8 || (error as any)?.message?.includes('Quota exceeded')) {
      console.warn('[getUserAdmin] Quota exhausted, checking for cached data for:', email);
      const cached = userCache.get(email);
      if (cached) {
        const age = Math.round((Date.now() - cached.timestamp) / 1000);
        console.warn(`[getUserAdmin] Using stale cache (${age}s old) for:`, email);
        return cached.user;
      } else {
        console.error('[getUserAdmin] No cached data available for:', email);
        // Return a default pending user to prevent total failure
        return {
          userId: email,
          email: email,
          name: email.split('@')[0],
          role: 'PENDING_APPROVAL',
          enrollmentStatus: 'not_submitted',
        } as User;
      }
    }
    throw error;
  }
}

/**
 * Invalidate cache for a specific user
 * Call this after updating user data to ensure fresh data is fetched
 * @param email - User's email to invalidate
 */
export function invalidateUserCache(email: string): void {
  userCache.delete(email);
  console.log('[getUserAdmin] Cache invalidated for:', email);
}

/**
 * Create or update a user (upsert) - server-side
 * @param user - User object with email required
 */
export async function upsertUserAdmin(user: Partial<User> & { email: string }): Promise<void> {
  try {
    await adminDb.collection('users').doc(user.email).set({
      userId: user.email,
      ...user,
      updatedAt: Date.now(),
    }, { merge: true });

    // Invalidate cache after update
    invalidateUserCache(user.email);
  } catch (error) {
    throw error;
  }
}

/**
 * Update user details (server-side)
 * @param email - User's email (document ID)
 * @param updates - Partial user object with fields to update
 */
export async function updateUserAdmin(email: string, updates: Partial<User>): Promise<void> {
  try {
    await adminDb.collection('users').doc(email).update({
      ...updates,
      updatedAt: Date.now(),
    });

    // Invalidate cache after update
    invalidateUserCache(email);
  } catch (error) {
    throw error;
  }
}
