/**
 * Writing Stats Calculator (Admin) - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from './firebase/statsCalculatorAdmin';
import * as tursoImpl from '../turso/writing/statsCalculatorAdmin';

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  recalculateWritingStatsAdmin,
} = implementation;
