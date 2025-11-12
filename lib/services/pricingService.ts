/**
 * Pricing Service - Database abstraction layer for pricing operations
 *
 * This service handles course pricing configuration operations.
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Components use these functions instead of Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CoursePricingConfig } from '@/lib/models/pricing';
import { CEFR_LEVEL_DATA } from '@/lib/utils/pricingCalculator';
import { CEFRLevel } from '@/lib/models/cefr';

const PRICING_COLLECTION = 'pricing';
const COURSE_PRICING_DOC = 'course-pricing';

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get course pricing configuration from Firestore
 * Falls back to default values if not found
 * @returns Course pricing configuration
 */
export async function getCoursePricing(): Promise<CoursePricingConfig> {
  try {
    const docRef = doc(db, PRICING_COLLECTION, COURSE_PRICING_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CoursePricingConfig;
    }

    // Return default configuration if not found
    return getDefaultCoursePricing();
  } catch (error) {
    console.error('[pricingService] Error fetching course pricing:', error);
    return getDefaultCoursePricing();
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Save course pricing configuration to Firestore
 * @param config - Course pricing configuration
 * @param userEmail - Email of user making the update
 */
export async function saveCoursePricing(
  config: CoursePricingConfig,
  userEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, PRICING_COLLECTION, COURSE_PRICING_DOC);
    const dataToSave = {
      ...config,
      updatedAt: Date.now(),
      updatedBy: userEmail,
    };
    await setDoc(docRef, dataToSave);
  } catch (error) {
    console.error('[pricingService] Error saving course pricing:', error);
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

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function getCoursePricing(): Promise<CoursePricingConfig> {
  try {
    const result = await sql`
      SELECT * FROM pricing
      WHERE id = 'course-pricing'
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      return result.rows[0] as CoursePricingConfig;
    }

    return getDefaultCoursePricing();
  } catch (error) {
    console.error('[pricingService] Error fetching course pricing:', error);
    return getDefaultCoursePricing();
  }
}

export async function saveCoursePricing(
  config: CoursePricingConfig,
  userEmail: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO pricing (id, levels, currency, currency_symbol, updated_at, updated_by)
      VALUES (
        'course-pricing',
        ${JSON.stringify(config.levels)},
        ${config.currency},
        ${config.currencySymbol},
        NOW(),
        ${userEmail}
      )
      ON CONFLICT (id) DO UPDATE SET
        levels = EXCLUDED.levels,
        currency = EXCLUDED.currency,
        currency_symbol = EXCLUDED.currency_symbol,
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by
    `;
  } catch (error) {
    console.error('[pricingService] Error saving course pricing:', error);
    throw error;
  }
}
*/
