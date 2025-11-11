import { CEFRLevel } from './cefr';

/**
 * Firestore data model for course pricing configuration
 * Collection: pricing
 * Document ID: course-pricing
 */
export interface CoursePricingConfig {
  levels: {
    [key in CEFRLevel]: {
      flashcardCount: number;
      syllabusWeeks: number;
      basePrice: number;
      description: string;
    };
  };
  currency: string; // e.g., 'PHP', 'EUR', 'USD'
  currencySymbol: string; // e.g., '₱', '€', '$'
  updatedAt: number; // Unix timestamp
  updatedBy: string; // User email/ID
}

/**
 * Firestore data model for teacher/school subscription pricing
 * Collection: pricing
 * Document ID: subscription-pricing
 */
export interface SubscriptionPricingConfig {
  teacher: {
    price: number;
    features: string[];
  };
  school: {
    price: number;
    features: string[];
  };
  currency: string;
  currencySymbol: string;
  updatedAt: number;
  updatedBy: string;
}
