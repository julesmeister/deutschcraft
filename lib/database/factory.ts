/**
 * Database Provider Factory
 *
 * Creates the appropriate database provider based on configuration
 * This allows easy switching between different database systems
 */

import { DatabaseProvider, DatabaseConfig } from './types';
import { FirestoreDatabaseProvider } from './firestore/provider';
import { db } from '../firebase';

// Singleton instance
let databaseProvider: DatabaseProvider | null = null;

/**
 * Get or create the database provider instance
 * Uses environment configuration to determine which provider to use
 */
export function getDatabaseProvider(): DatabaseProvider {
  if (databaseProvider) {
    return databaseProvider;
  }

  // Read database type from environment variable
  // Defaults to 'firestore' if not specified
  const dbType = (process.env.NEXT_PUBLIC_DATABASE_TYPE || 'firestore') as DatabaseConfig['type'];

  switch (dbType) {
    case 'firestore':
      databaseProvider = new FirestoreDatabaseProvider(db);
      break;

    case 'postgres':
      // Future implementation
      throw new Error('PostgreSQL provider not implemented yet. See lib/database/postgres/provider.ts');

    case 'mongodb':
      // Future implementation
      throw new Error('MongoDB provider not implemented yet. See lib/database/mongodb/provider.ts');

    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }

  return databaseProvider;
}

/**
 * Reset the database provider (useful for testing)
 */
export function resetDatabaseProvider(): void {
  databaseProvider = null;
}

/**
 * Create a custom database provider
 * Useful for testing or when you need multiple providers
 */
export function createDatabaseProvider(config: DatabaseConfig): DatabaseProvider {
  switch (config.type) {
    case 'firestore':
      // For custom Firestore config, you'd initialize a new Firestore instance here
      return new FirestoreDatabaseProvider(db);

    case 'postgres':
      throw new Error('PostgreSQL provider not implemented yet');

    case 'mongodb':
      throw new Error('MongoDB provider not implemented yet');

    default: {
      const exhaustiveCheck: never = config;
      throw new Error(`Unsupported database type: ${(exhaustiveCheck as DatabaseConfig).type}`);
    }
  }
}
