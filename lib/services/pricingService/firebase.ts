/**
 * Pricing Service - Database abstraction layer for pricing operations
 */

import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CoursePricingConfig } from '../../models/pricing';
import { CEFR_LEVEL_DATA } from '../../utils/pricingCalculator';
import { CEFRLevel } from '../../models/cefr';

const PRICING_COLLECTION = 'pricing';
const COURSE_PRICING_DOC = 'course-pricing';

export async function getCoursePricing(): Promise<CoursePricingConfig> {
  try {
    const docRef = doc(db, PRICING_COLLECTION, COURSE_PRICING_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CoursePricingConfig;
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
