import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CoursePricingConfig } from '@/lib/models/pricing';
import { CEFR_LEVEL_DATA } from '@/lib/utils/pricingCalculator';
import { CEFRLevel } from '@/lib/models/cefr';

const PRICING_COLLECTION = 'pricing';
const COURSE_PRICING_DOC = 'course-pricing';

/**
 * Get course pricing configuration from Firestore
 * Falls back to default values if not found
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
    console.error('Error fetching course pricing:', error);
    return getDefaultCoursePricing();
  }
}

/**
 * Save course pricing configuration to Firestore
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
    console.error('Error saving course pricing:', error);
    throw error;
  }
}

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
