/**
 * Student Service - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from './firebase';
import * as tursoImpl from '../turso/studentService';

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  initializeStudent,
  assignStudentsToBatch,
  removeStudentFromTeacher,
  updateStudentLevel,
} = implementation;
