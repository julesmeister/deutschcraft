import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { WritingSubmission } from "../../../models/writing";

const SUBMISSIONS_COLLECTION = "writing_submissions";

export async function getWritingSubmissionsPaginated(options: {
  pageSize: number;
  lastDoc: any | null;
  statusFilter?: "submitted" | "reviewed" | "all";
  batchId?: string | null;
  studentIds?: string[];
}): Promise<{
  submissions: WritingSubmission[];
  hasMore: boolean;
  lastDoc: any | null;
}> {
  const { pageSize, lastDoc, statusFilter = "all", studentIds = [] } = options;

  try {
    const ref = collection(db, SUBMISSIONS_COLLECTION);
    const constraints: any[] = [];

    // Add status filter
    if (statusFilter !== "all") {
      constraints.push(where("status", "==", statusFilter));
    }

    // Add student IDs filter
    // Firestore 'in' query supports up to 10 values
    if (studentIds.length > 0) {
      // Chunking not implemented here for brevity, assuming <= 10 or logic handled elsewhere
      // If > 10, this will fail in Firestore.
      // For now, we assume caller handles chunking or list is small.
      constraints.push(where("userId", "in", studentIds.slice(0, 10)));
    }

    // Order by updated date
    constraints.push(orderBy("updatedAt", "desc"));

    // Pagination
    constraints.push(limit(pageSize + 1));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);

    const hasMore = snapshot.docs.length > pageSize;
    const submissions = snapshot.docs.slice(0, pageSize).map(
      (doc) =>
        ({
          submissionId: doc.id,
          ...doc.data(),
        } as WritingSubmission)
    );

    const newLastDoc = hasMore
      ? snapshot.docs[pageSize - 1]
      : snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

    return { submissions, hasMore, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Error fetching paginated submissions:", error);
    throw error;
  }
}

export async function getWritingSubmissionsCount(
  statusFilter?: "submitted" | "reviewed" | "all",
  studentIds?: string[]
): Promise<number> {
  try {
    const ref = collection(db, SUBMISSIONS_COLLECTION);
    const constraints: any[] = [];

    if (statusFilter !== "all") {
      constraints.push(where("status", "==", statusFilter));
    }

    if (studentIds && studentIds.length > 0) {
      constraints.push(where("userId", "in", studentIds.slice(0, 10)));
    }

    const q = query(ref, ...constraints);
    const snapshot = await getCountFromServer(q);

    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting writing submissions:", error);
    throw error;
  }
}
