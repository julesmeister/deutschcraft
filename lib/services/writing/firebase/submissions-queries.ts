import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  WritingSubmission,
  WritingExerciseType,
} from "../../../models/writing";

const SUBMISSIONS_COLLECTION = "writing_submissions";

export async function getStudentSubmissions(
  userId: string,
  exerciseType?: WritingExerciseType
): Promise<WritingSubmission[]> {
  try {
    const ref = collection(db, SUBMISSIONS_COLLECTION);
    let q = query(
      ref,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    if (exerciseType) {
      q = query(q, where("exerciseType", "==", exerciseType));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    throw error;
  }
}

export async function getWritingSubmission(
  submissionId: string
): Promise<WritingSubmission | null> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return {
      submissionId: docSnap.id,
      ...docSnap.data(),
    } as WritingSubmission;
  } catch (error) {
    console.error("Error fetching writing submission:", error);
    throw error;
  }
}

export async function getExerciseSubmissions(
  exerciseId: string
): Promise<WritingSubmission[]> {
  try {
    const ref = collection(db, SUBMISSIONS_COLLECTION);
    const q = query(
      ref,
      where("exerciseId", "==", exerciseId),
      orderBy("submittedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];
  } catch (error) {
    console.error("Error fetching exercise submissions:", error);
    throw error;
  }
}

export async function getAllWritingSubmissions(
  statusFilter?: "submitted" | "reviewed" | "all"
): Promise<WritingSubmission[]> {
  try {
    const ref = collection(db, SUBMISSIONS_COLLECTION);
    let q;

    if (statusFilter === "submitted") {
      q = query(
        ref,
        where("status", "==", "submitted"),
        orderBy("submittedAt", "desc")
      );
    } else if (statusFilter === "reviewed") {
      q = query(
        ref,
        where("status", "==", "reviewed"),
        orderBy("updatedAt", "desc")
      );
    } else {
      // Note: 'in' query supports up to 10 values
      q = query(
        ref,
        where("status", "in", ["submitted", "reviewed"]),
        orderBy("updatedAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];
  } catch (error) {
    console.error("Error fetching all writing submissions:", error);
    throw error;
  }
}

export async function getPendingWritingCount(): Promise<number> {
  try {
    const ref = collection(db, SUBMISSIONS_COLLECTION);
    const q = query(ref, where("status", "==", "submitted"));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching pending writing count:", error);
    throw error;
  }
}
