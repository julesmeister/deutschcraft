import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { PeerReview, TeacherReview } from "../../../models/writing";

const PEER_REVIEWS_COLLECTION = "peer_reviews";
const TEACHER_REVIEWS_COLLECTION = "teacher_reviews";

// ============================================================================
// PEER REVIEWS
// ============================================================================

export async function getPeerReviews(
  submissionId: string
): Promise<PeerReview[]> {
  const ref = collection(db, PEER_REVIEWS_COLLECTION);
  const q = query(
    ref,
    where("submissionId", "==", submissionId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ reviewId: doc.id, ...doc.data() } as PeerReview)
  );
}

export async function getAssignedPeerReviews(
  userId: string
): Promise<PeerReview[]> {
  const ref = collection(db, PEER_REVIEWS_COLLECTION);
  const q = query(
    ref,
    where("reviewerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ reviewId: doc.id, ...doc.data() } as PeerReview)
  );
}

export async function createPeerReview(
  reviewData: Omit<PeerReview, "reviewId" | "createdAt" | "updatedAt">
): Promise<PeerReview> {
  const now = Date.now();
  const reviewId = `pr_${now}_${Math.random().toString(36).substr(2, 9)}`;
  const docRef = doc(db, PEER_REVIEWS_COLLECTION, reviewId);

  const newReview: PeerReview = {
    reviewId,
    ...reviewData,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, newReview);
  return newReview;
}

export async function updatePeerReview(
  reviewId: string,
  updates: Partial<PeerReview>
): Promise<void> {
  const docRef = doc(db, PEER_REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
}

// ============================================================================
// TEACHER REVIEWS
// ============================================================================

export async function getTeacherReview(
  submissionId: string
): Promise<TeacherReview | null> {
  const ref = collection(db, TEACHER_REVIEWS_COLLECTION);
  const q = query(ref, where("submissionId", "==", submissionId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return {
    reviewId: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
  } as TeacherReview;
}

export async function getTeacherReviews(
  teacherId: string
): Promise<TeacherReview[]> {
  const ref = collection(db, TEACHER_REVIEWS_COLLECTION);
  const q = query(
    ref,
    where("reviewerId", "==", teacherId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ reviewId: doc.id, ...doc.data() } as TeacherReview)
  );
}

export async function getTeacherReviewsBatch(
  batchId: string
): Promise<TeacherReview[]> {
  // Assuming we filter by submission's batchId, but TeacherReview might not store batchId.
  // This might require a join or storing batchId in TeacherReview.
  // For now, standard implementation.
  const ref = collection(db, TEACHER_REVIEWS_COLLECTION);
  // If no index exists for batchId, this might fail or require client-side filtering.
  // We'll assume batchId is stored.
  const q = query(
    ref,
    where("batchId", "==", batchId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ reviewId: doc.id, ...doc.data() } as TeacherReview)
  );
}

export async function createTeacherReview(
  reviewData: Omit<TeacherReview, "reviewId" | "createdAt" | "updatedAt">
): Promise<TeacherReview> {
  const now = Date.now();
  const reviewId = `tr_${now}_${Math.random().toString(36).substr(2, 9)}`;
  const docRef = doc(db, TEACHER_REVIEWS_COLLECTION, reviewId);

  const newReview: TeacherReview = {
    reviewId,
    ...reviewData,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, newReview);
  return newReview;
}

export async function updateTeacherReview(
  reviewId: string,
  updates: Partial<TeacherReview>
): Promise<void> {
  const docRef = doc(db, TEACHER_REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
}
