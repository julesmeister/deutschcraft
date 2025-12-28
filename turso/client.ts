/**
 * Turso DB Client Configuration
 *
 * This module sets up the Turso database client using LibSQL.
 * Turso is a SQLite-compatible database optimized for edge deployment.
 *
 * Usage:
 * import { db } from '@/turso/client';
 * const result = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
 *
 * Environment Variables Required:
 * - TURSO_DATABASE_URL: Your Turso database URL (e.g., libsql://your-db.turso.io)
 * - TURSO_AUTH_TOKEN: Your Turso authentication token
 */

import { createClient, Client } from '@libsql/client';

let _db: Client | null = null;

/**
 * Get the Turso database client instance (lazy initialization)
 *
 * Features:
 * - Edge-compatible SQLite database
 * - Automatic replication and sync
 * - Low latency reads from edge locations
 * - Strong consistency for writes
 * - Works in both server and client (browser) environments
 */
function getDb(): Client {
  if (_db) return _db;

  // Check for client-side env vars first (NEXT_PUBLIC_), then server-side
  // This allows Turso to work in both browser and server contexts
  const TURSO_DATABASE_URL =
    process.env.NEXT_PUBLIC_TURSO_DATABASE_URL ||
    process.env.TURSO_DATABASE_URL;

  const TURSO_AUTH_TOKEN =
    process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN ||
    process.env.TURSO_AUTH_TOKEN;

  if (!TURSO_DATABASE_URL) {
    throw new Error(
      'TURSO_DATABASE_URL or NEXT_PUBLIC_TURSO_DATABASE_URL environment variable is required'
    );
  }

  if (!TURSO_AUTH_TOKEN) {
    throw new Error(
      'TURSO_AUTH_TOKEN or NEXT_PUBLIC_TURSO_AUTH_TOKEN environment variable is required'
    );
  }

  _db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  return _db;
}

/**
 * Turso database client instance
 * Lazily initialized on first access to avoid build-time errors
 */
export const db = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getDb();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/**
 * Helper function to execute a query with parameters
 * @param sql - SQL query string
 * @param params - Array of parameters for the query
 * @returns Query result
 */
export async function execute(sql: string, params: any[] = []) {
  try {
    return await db.execute({ sql, args: params });
  } catch (error) {
    console.error('[Turso] Query execution error:', error);
    throw error;
  }
}

/**
 * Helper function to execute multiple queries in a transaction
 * @param queries - Array of {sql, params} objects
 * @returns Array of query results
 */
export async function transaction(queries: { sql: string; params?: any[] }[]) {
  try {
    const statements = queries.map(q => ({
      sql: q.sql,
      args: q.params || [],
    }));
    return await db.batch(statements);
  } catch (error) {
    console.error('[Turso] Transaction error:', error);
    throw error;
  }
}

/**
 * Close the database connection
 * Call this when shutting down the application
 */
export async function closeConnection() {
  try {
    if (_db) {
      await _db.close();
      _db = null;
    }
  } catch (error) {
    console.error('[Turso] Error closing connection:', error);
  }
}

// Export the client as default for convenience
export default db;
