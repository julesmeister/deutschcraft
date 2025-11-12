/**
 * Pricing Service - Turso Implementation
 * Database abstraction layer for pricing operations using Turso DB
 *
 * Note: This is a simple service that could also use a single config file instead of DB
 */

import { db } from '@/turso/client';
import { CoursePricingConfig } from '@/lib/models/pricing';
import { CEFR_LEVEL_DATA } from '@/lib/utils/pricingCalculator';
import { CEFRLevel } from '@/lib/models/cefr';

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get course pricing configuration from database
 * Falls back to default values if not found
 * @returns Course pricing configuration
 */
export async function getCoursePricing(): Promise<CoursePricingConfig> {
  try {
    // Note: Pricing might be stored in a simple key-value table
    // CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);
    const result = await db.execute({
      sql: 'SELECT value FROM config WHERE key = ? LIMIT 1',
      args: ['course-pricing'],
    });

    if (result.rows.length > 0 && result.rows[0].value) {
      return JSON.parse(result.rows[0].value as string) as CoursePricingConfig;
    }

    // Return default configuration if not found
    return getDefaultCoursePricing();
  } catch (error) {
    console.error('[pricingService:turso] Error fetching course pricing:', error);
    return getDefaultCoursePricing();
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Save course pricing configuration to database
 * @param config - Course pricing configuration
 * @param userEmail - Email of user making the update
 */
export async function saveCoursePricing(
  config: CoursePricingConfig,
  userEmail: string
): Promise<void> {
  try {
    const dataToSave = {
      ...config,
      updatedAt: Date.now(),
      updatedBy: userEmail,
    };

    await db.execute({
      sql: `INSERT INTO config (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: ['course-pricing', JSON.stringify(dataToSave)],
    });
  } catch (error) {
    console.error('[pricingService:turso] Error saving course pricing:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default course pricing configuration
 * This matches the hardcoded values in pricingCalculator.ts
 */
function getDefaultCoursePricing(): CoursePricingConfig {
  return {
    levels: {
      [CEFRLevel.A1]: { ...CEFR_LEVEL_DATA[CEFRLevel.A1] },
      [CEFRLevel.A2]: { ...CEFR_LEVEL_DATA[CEFRLevel.A2] },
      [CEFRLevel.B1]: { ...CEFR_LEVEL_DATA[CEFRLevel.B1] },
      [CEFRLevel.B2]: { ...CEFR_LEVEL_DATA[CEFRLevel.B2] },
      [CEFRLevel.C1]: { ...CEFR_LEVEL_DATA[CEFRLevel.C1] },
      [CEFRLevel.C2]: { ...CEFR_LEVEL_DATA[CEFRLevel.C2] },
    },
    currency: 'PHP',
    currencySymbol: '₱',
    updatedAt: Date.now(),
    updatedBy: 'system',
  };
}
