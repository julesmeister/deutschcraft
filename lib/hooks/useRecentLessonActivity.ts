/**
 * Hook for fetching recent answer activity from Answer Hub
 */

import { useQuery } from "@tanstack/react-query";

export interface RecentAnswerActivity {
  exerciseId: string;
  itemNumber: string;
  submittedAt: number;
  exerciseTitle?: string;
}

async function fetchRecentAnswerActivity(
  studentId: string
): Promise<RecentAnswerActivity[]> {
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === "true";

  if (useTurso) {
    const { getRecentAnswerActivity } = await import(
      "@/lib/services/turso/studentAnswerService"
    );
    return getRecentAnswerActivity(studentId, 5);
  }

  // Firebase fallback
  const { collection, query, where, getDocs, orderBy, limit } = await import(
    "firebase/firestore"
  );
  const { db } = await import("@/lib/firebase");

  const q = query(
    collection(db, "studentAnswers"),
    where("studentId", "==", studentId),
    orderBy("submittedAt", "desc"),
    limit(5)
  );

  const snapshot = await getDocs(q);

  // Reverse to get ascending order (oldest of recent first)
  return snapshot.docs.reverse().map((doc) => {
    const data = doc.data();
    return {
      exerciseId: data.exerciseId as string,
      itemNumber: data.itemNumber as string,
      submittedAt: data.submittedAt as number,
    };
  });
}

export function useRecentAnswerActivity(studentId: string | null | undefined) {
  return useQuery({
    queryKey: ["recent-answer-activity", studentId],
    queryFn: () => fetchRecentAnswerActivity(studentId!),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
