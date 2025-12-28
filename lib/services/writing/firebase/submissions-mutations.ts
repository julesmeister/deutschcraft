import { db } from "../../../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { WritingSubmission } from "../../../models/writing";

const SUBMISSIONS_COLLECTION = "writing_submissions";

export async function createWritingSubmission(
  submissionData: Omit<
    WritingSubmission,
    "submissionId" | "createdAt" | "updatedAt" | "version"
  >
): Promise<WritingSubmission> {
  try {
    const now = Date.now();
    const submissionId = `ws_${now}_${Math.random().toString(36).substr(2, 9)}`;
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

    const newSubmission: WritingSubmission = {
      submissionId,
      ...submissionData,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newSubmission);
    return newSubmission;
  } catch (error) {
    console.error("Error creating writing submission:", error);
    throw error;
  }
}

export async function updateWritingSubmission(
  submissionId: string,
  updates: Partial<WritingSubmission>
): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating writing submission:", error);
    throw error;
  }
}

export async function submitWriting(submissionId: string): Promise<void> {
  try {
    const now = Date.now();
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await updateDoc(docRef, {
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error submitting writing:", error);
    throw error;
  }
}

export async function deleteWritingSubmission(
  submissionId: string
): Promise<void> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting writing submission:", error);
    throw error;
  }
}
