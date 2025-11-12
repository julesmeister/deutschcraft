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

import { createClient } from '@libsql/client';

// Validate environment variables
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is required');
}

if (!TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is required');
}

/**
 * Turso database client instance
 *
 * Features:
 * - Edge-compatible SQLite database
 * - Automatic replication and sync
 * - Low latency reads from edge locations
 * - Strong consistency for writes
 */
export const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
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
    await db.close();
  } catch (error) {
    console.error('[Turso] Error closing connection:', error);
  }
}

// Export the client as default for convenience
export default db;
