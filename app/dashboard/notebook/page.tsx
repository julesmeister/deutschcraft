/**
 * Standalone Notebook Page
 * Accessible from /dashboard/notebook — view and use the notebook outside a playground room.
 */

"use client";

import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUserQueries";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotebookWidget } from "@/components/playground/notebook/NotebookWidget";
import { CatLoader } from "@/components/ui/CatLoader";

export default function NotebookPage() {
  const { session, isFirebaseReady } = useFirebaseAuth();
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null,
    isFirebaseReady
  );
  const { userId, userName, userRole } = getUserInfo(currentUser, session);

  const [selectedLevel, setSelectedLevel] = usePersistedLevel(
    "notebook-last-level",
    currentUser?.currentLevel
  );

  if (!session || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CatLoader message="Loading notebook..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader
        title="Notebook"
        subtitle="Collaborative notebook pages organized by CEFR level"
        actions={
          <CEFRLevelSelector
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
          />
        }
      />

      <div className="container mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
          <NotebookWidget
            userId={userId}
            userName={userName}
            userRole={userRole}
            level={selectedLevel}
          />
        </div>
      </div>
    </div>
  );
}
