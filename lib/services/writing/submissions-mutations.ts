/**
 * Writing Submissions Service - Write Operations
 * Create, update, and delete operations for writing submissions
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { WritingSubmission } from '../../models/writing';

/**
 * Create a new writing submission
 * @param submissionData - Submission data without submissionId
 * @returns Created submission with generated ID
 */
export async function createWritingSubmission(
  submissionData: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<WritingSubmission> {
  try {
    const submissionsRef = collection(db, 'writing-submissions');
    const now = Date.now();

    const submission = {
      ...submissionData,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(submissionsRef, submission);

    return {
      submissionId: docRef.id,
      ...submission,
    } as WritingSubmission;
  } catch (error) {
    console.error('[submissions] Error creating writing submission:', error);
    throw error;
  }
}

/**
 * Update a writing submission
 * @param submissionId - Submission ID
 * @param updates - Partial submission data to update
 */
export async function updateWritingSubmission(
  submissionId: string,
  updates: Partial<WritingSubmission>
): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    await updateDoc(submissionRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[submissions] Error updating writing submission:', error);
    throw error;
  }
}

/**
 * Submit a writing exercise (change status from draft to submitted)
 * @param submissionId - Submission ID
 */
export async function submitWriting(submissionId: string): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    const now = Date.now();

    await updateDoc(submissionRef, {
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[submissions] Error submitting writing:', error);
    throw error;
  }
}

/**
 * Save AI-corrected version to a submission
 * @param submissionId - Submission ID
 * @param aiCorrectedVersion - AI-corrected text
 */
export async function saveAICorrectedVersion(
  submissionId: string,
  aiCorrectedVersion: string
): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    const now = Date.now();

    await updateDoc(submissionRef, {
      aiCorrectedVersion,
      aiCorrectedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[submissions] Error saving AI corrected version:', error);
    throw error;
  }
}

/**
 * Delete a writing submission
 * @param submissionId - Submission ID
 */
export async function deleteWritingSubmission(submissionId: string): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    await deleteDoc(submissionRef);
  } catch (error) {
    console.error('[submissions] Error deleting writing submission:', error);
    throw error;
  }
}
